import assert from "node:assert/strict";
import test from "node:test";
import {
  binderCovers,
  binderLayout,
  binderPockets,
  sideCards,
  sideCount,
  spreadCount,
  spreadOf,
  spreadSides,
} from "../dist/binder.js";

test("the sheets are 4, 9 and 12 pockets and every cover has a colour", () => {
  assert.deepEqual(
    binderPockets.map((p) => [p.count, p.cols * p.rows]),
    [
      [4, 4],
      [9, 9],
      [12, 12],
    ],
  );
  for (const cover of binderCovers) assert.match(cover.color, /^#[0-9a-f]{6}$/, cover.id);
  assert.equal(binderCovers[0].id, "green", "green is the plain default");
});

test("pockets name a sheet; the older columns and page-size still work; nothing at all is nine in three columns", () => {
  assert.deepEqual(binderLayout("12", null, null), { cols: 4, rows: 3, per: 12 });
  assert.deepEqual(binderLayout("4", "5", "30"), { cols: 2, rows: 2, per: 4 }, "pockets beat the older attributes");
  assert.deepEqual(binderLayout(null, "4", "8"), { cols: 4, rows: 2, per: 8 });
  assert.deepEqual(binderLayout(null, null, null), { cols: 3, rows: 3, per: 9 });
  assert.deepEqual(binderLayout("7", null, null), { cols: 3, rows: 3, per: 9 }, "an unknown count is ignored");
  assert.equal(binderLayout(null, "50", "6").cols, 6, "no more columns than pockets");
  assert.equal(binderLayout(null, null, "500").per, 100, "a sheet holds at most a hundred");
});

test("a collection fills whole sides, and the openings pair them off with the first side alone on the right", () => {
  assert.equal(sideCount(0, 9), 1);
  assert.equal(sideCount(9, 9), 1);
  assert.equal(sideCount(10, 9), 2);
  assert.equal(sideCount(27, 9), 3);
  assert.deepEqual([1, 2, 3, 4].map(spreadCount), [1, 2, 2, 3]);
  assert.deepEqual(spreadSides(0, 3), [-1, 0]);
  assert.deepEqual(spreadSides(1, 3), [1, 2]);
  assert.deepEqual(spreadSides(1, 2), [1, -1]);
  assert.deepEqual(spreadSides(5, 3), [-1, -1]);
});

test("a card is on the opening of its side", () => {
  assert.equal(spreadOf(0, 9), 0);
  assert.equal(spreadOf(8, 9), 0);
  assert.equal(spreadOf(9, 9), 1);
  assert.equal(spreadOf(18, 9), 1);
  assert.equal(spreadOf(19, 9), 1, "the third side is the right-hand page of the second opening");
  assert.equal(spreadOf(27, 9), 2);
});

test("a side lists its own cards and the last side only what is left", () => {
  const layout = binderLayout("9", null, null);
  assert.deepEqual(sideCards(0, layout, 12), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(sideCards(1, layout, 12), [9, 10, 11, -1, -1, -1, -1, -1, -1], "an empty pocket is -1");
  assert.deepEqual(sideCards(2, layout, 12), Array(9).fill(-1));
});
