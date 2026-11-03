import assert from "node:assert/strict";
import test from "node:test";
import {
  CARD_RATIO,
  deckLandings,
  fanBounds,
  fanLayout,
  fanRelative,
  fanShift,
  normalizeLanding,
  SPEEDS,
} from "../dist/pile.js";
import { stackLayout, stillsHtml } from "../dist/stack.js";

test("a card lands face up unless it is turned over; the old names for turned over still mean it", () => {
  assert.deepEqual(
    deckLandings.map((l) => l.id),
    ["face-up", "face-down"],
  );
  for (const value of ["face-down", "upside-down", "turned-over"]) assert.equal(normalizeLanding(value), "face-down");
  for (const value of ["face-up", "", null, undefined, "sideways", "FACE-DOWN"])
    assert.equal(normalizeLanding(value), "face-up");
});

test("a fan of n cards spreads over at most 110 degrees, evenly, and is centred", () => {
  assert.deepEqual(fanLayout(0), []);
  assert.equal(fanLayout(1)[0].angle, 0);
  for (const n of [2, 5, 10]) {
    const places = fanLayout(n);
    assert.equal(places.length, n);
    const angles = places.map((p) => p.angle);
    assert.ok(Math.abs(angles[0] + angles[n - 1]) < 0.02, `${n}: centred`);
    assert.ok(angles[n - 1] - angles[0] <= 110.01, `${n}: no wider than 110 degrees`);
    const steps = new Set(angles.slice(1).map((a, i) => Math.round((a - angles[i]) * 10)));
    assert.equal(steps.size, 1, `${n}: evenly spread`);
  }
  assert.equal(fanLayout(10)[9].angle, 49.5, "each card opens eleven degrees more: ten are 99 across");
  assert.equal(fanLayout(30)[29].angle, 55, "and 110 degrees across is the widest a fan ever is");
});

test("a fan lies the same way for the same seed and closes to a nudged deck", () => {
  assert.deepEqual(fanLayout(6, 4), fanLayout(6, 4));
  assert.notDeepEqual(fanLayout(6, 4), fanLayout(6, 5));
  const closed = fanLayout(6, 1);
  assert.deepEqual(
    [closed[0].closedAngle, closed[0].closedX, closed[0].closedY],
    [0, 0, 0],
    "the first card is the square one",
  );
  assert.ok(closed.slice(1).some((p) => p.closedX !== 0 || p.closedAngle !== 0));
});

test("the reach of a fan is never negative, grows with the cards and is symmetrical for a centred fan", () => {
  const closed = fanBounds([]);
  assert.deepEqual(closed, { left: 0, right: 0, top: 0, bottom: 0 });
  const few = fanBounds(fanLayout(3));
  const many = fanBounds(fanLayout(10));
  for (const side of ["left", "right", "top", "bottom"]) {
    assert.ok(few[side] >= 0 && many[side] >= 0, `${side} is never negative`);
  }
  assert.ok(many.left > few.left && many.right > few.right, "a wider fan reaches further to each side");
  assert.ok(Math.abs(many.left - many.right) < 0.02, "a centred fan reaches as far left as right");
});

test("relative to its first card a fan's first card is where it is, and the others keep their turn", () => {
  const places = fanLayout(5);
  const relative = fanRelative(places);
  assert.deepEqual(relative[0], { angle: 0, x: 0, y: 0 });
  assert.equal(relative[4].angle, places[4].angle - places[0].angle);
  assert.deepEqual(fanRelative([]), []);
  const shift = fanShift(places[0]);
  assert.ok(Number.isFinite(shift.x) && Number.isFinite(shift.y));
});

test("the card is 2.5 by 3.5 and the three speeds are slower, normal and quicker", () => {
  assert.equal(CARD_RATIO, 1.4);
  assert.ok(SPEEDS.slow > SPEEDS.normal && SPEEDS.normal > SPEEDS.quick);
  assert.equal(SPEEDS.normal, 1);
});

test("the cards under the top one are written as frames with nothing on them, each a card lower than the next", () => {
  const places = stackLayout(5, { depth: 3 });
  const html = stillsHtml(places, 5);
  assert.equal((html.match(/class="still"/g) ?? []).length, 3);
  assert.deepEqual(
    [...html.matchAll(/--k:(\d+)/g)].map((m) => Number(m[1])),
    [2, 3, 4],
    "bottom first, each one as many cards above the bottom of the stack as its place from it",
  );
  assert.equal((html.match(/class="inner"/g) ?? []).length, 3, "each one has the panel of the top card");
  assert.ok(!/title|description|<img|<slot/.test(html), "and no text or picture");
  assert.equal(stillsHtml([], 1), "");
});
