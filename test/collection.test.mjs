import assert from "node:assert/strict";
import test from "node:test";
import { collectionViewAliases, collectionViews, movePage, parseCollection } from "../dist/collection.js";

test("each display has a distinct stable id, and the two dropped names still open a display", () => {
  assert.equal(collectionViews.length, 10);
  assert.equal(new Set(collectionViews.map((v) => v.id)).size, 10);
  assert.deepEqual(collectionViewAliases, { jukebox: "deck", tower: "deck" });
  assert.ok(Object.values(collectionViewAliases).every((id) => collectionViews.some((v) => v.id === id)));
});
test("normalizes card input and retains optional back", () => {
  assert.deepEqual(parseCollection([{ name: "Card", image: "front.jpg", backImage: "back.jpg" }]), [
    { id: "0", name: "Card", image: "front.jpg", backImage: "back.jpg" },
  ]);
});
test("rejects malformed cards and duplicate ids", () => {
  assert.throws(() => parseCollection({}), /array/);
  assert.throws(() => parseCollection([{ name: "Card" }]), /image/);
  assert.throws(
    () =>
      parseCollection([
        { id: "x", name: "A", image: "a" },
        { id: "x", name: "B", image: "b" },
      ]),
    /Duplicate/,
  );
});
test("imports collection objects and preserves collector metadata", () => {
  const [card] = parseCollection({
    name: "My cards",
    cards: [
      {
        id: "x",
        name: "A",
        image: "a",
        metadata: { set: "Base", year: 1999, number: "4", condition: "Good", quantity: 2 },
      },
    ],
  });
  assert.deepEqual(card.metadata, { set: "Base", number: "4", condition: "Good", year: 1999, quantity: 2 });
  assert.throws(() => parseCollection([{ name: "A", image: "a", metadata: { quantity: 0 } }]), /quantity/);
  assert.throws(() => parseCollection([{ name: "A", image: "a", metadata: "invalid" }]), /metadata/);
});

test("page navigation wraps and handles partial and empty pages", () => {
  assert.equal(movePage(0, 0, 3, 1), 0);
  assert.equal(movePage(0, 7, 3, -1), 6);
  assert.equal(movePage(6, 7, 3, 1), 0);
  assert.equal(movePage(3, 7, 3, 1), 6);
  assert.equal(movePage(0, 2, 3, 1), 0);
});

import { deckLandings, fanLayout, normalizeLanding } from "../dist/collection.js";

test("the fan is one of the displays, two landings and a layout that closes to a deck and opens to a hand", () => {
  assert.ok(collectionViews.some((v) => v.id === "fan"));
  assert.deepEqual(
    deckLandings.map((l) => l.id),
    ["face-up", "face-down"],
    "two landings: still facing up, turned over",
  );
  assert.deepEqual(
    ["face-up", "face-down", "upside-down", "turned-over", "x", null].map(normalizeLanding),
    ["face-up", "face-down", "face-down", "face-down", "face-up", "face-up"],
    "the 0.6.0 value upside-down means turned over",
  );
  const open = fanLayout(10, 1);
  assert.equal(open.length, 10);
  assert.deepEqual(fanLayout(10, 1), open, "the same seed lays the same fan");
  assert.notDeepEqual(fanLayout(10, 2), open);
  assert.ok(
    open[0].angle < 0 && open[9].angle > 0 && Math.abs(open[0].angle + open[9].angle) < 0.01,
    "the hand is centred",
  );
  assert.ok(
    open.every((p, i) => i === 0 || (p.angle > open[i - 1].angle && p.x > open[i - 1].x)),
    "first card on the left, the rest in order",
  );
  assert.ok(Math.abs(open[9].angle - open[0].angle) <= 110, "a hand, not a circle");
  assert.equal(open[0].closedX, 0, "the top card of the closed deck lies square");
  assert.ok(
    open.every((p) => Math.abs(p.closedAngle) < 5 && Math.abs(p.closedX) < 0.1),
    "closed, the cards are nearly one deck",
  );
  assert.deepEqual(fanLayout(0), []);
  assert.equal(fanLayout(1)[0].angle, 0);
});

import { collectionKinds, isCard } from "../dist/collection.js";

test("an item says what it is: a card (the default) or an object, and an old collection that does not say stays cards", () => {
  assert.deepEqual(collectionKinds, ["card", "object"]);
  const [none, card, thing] = parseCollection([
    { name: "A", image: "a" },
    { name: "B", image: "b", kind: "card" },
    { name: "C", image: "c", kind: "object" },
  ]);
  assert.equal(none.kind, undefined, "data that does not say keeps no kind");
  assert.deepEqual([isCard(none), isCard(card), isCard(thing)], [true, true, false]);
  assert.equal(thing.kind, "object");
  assert.throws(() => parseCollection([{ name: "A", image: "a", kind: "console" }]), /kind/);
});
