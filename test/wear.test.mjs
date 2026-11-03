import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { wearLayout, wearLevels, wearOutline, wearOverlaySvg, wearPreset, wearPresets } from "../dist/index.js";

const docs = await readFile(new URL("../docs/wear.md", import.meta.url), "utf8");

test("the presets run from perfect to damaged, each level never lower than the one before, and the docs name every one", () => {
  assert.deepEqual(
    wearPresets.map((p) => p.id),
    ["perfect", "mint", "near-mint", "lightly-played", "moderately-played", "heavily-played", "damaged"],
  );
  for (const key of ["corners", "edges", "surface", "creases", "toning", "centering"]) {
    for (let i = 1; i < wearPresets.length; i++)
      assert.ok(wearPresets[i].levels[key] >= wearPresets[i - 1].levels[key], `${key} at ${wearPresets[i].id}`);
  }
  for (const p of wearPresets) {
    assert.ok(p.says.length > 10, p.id);
    assert.ok(docs.includes(`\`${p.id}\``), `docs/wear.md lacks ${p.id}`);
  }
  assert.equal(wearPreset("near-mint").name, "Near mint");
});

test("a perfect card, an unknown name and no wear all draw nothing", () => {
  assert.equal(wearLevels({}), null);
  assert.equal(wearLevels({ wear: "perfect" }), null);
  assert.equal(wearLevels({ wear: "" }), null);
  assert.equal(wearLevels({ wear: "ruined" }), null);
  assert.equal(wearLevels({ wear: 0 }), null);
  assert.ok(wearLevels({ wear: "damaged" }));
  assert.equal(wearLevels({ wear: "0.5" }).corners, 0.5);
  assert.equal(wearLevels({ wear: "near-mint", corners: 1 }).corners, 1);
  assert.equal(wearLevels({ wear: "near-mint", corners: 9 }).corners, 1);
  assert.equal(wearLevels({ corners: 0.4 }).corners, 0.4);
});

test("the same seed lays the same marks, another seed lays others, and the layout is plain data", () => {
  const levels = wearPreset("moderately-played").levels;
  const a = JSON.stringify(wearLayout(levels, 5));
  const b = JSON.stringify(wearLayout(levels, 5));
  const c = JSON.stringify(wearLayout(levels, 6));
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(wearOverlaySvg(wearLayout(levels, 5), "front"), wearOverlaySvg(wearLayout(levels, 5), "front"));
  assert.notEqual(wearOverlaySvg(wearLayout(levels, 5), "front"), wearOverlaySvg(wearLayout(levels, 5), "back"));
});

test("more wear means more marks, and a card has at most one folded and two chipped corners", () => {
  const count = (id) => {
    const f = wearLayout(wearPreset(id).levels, 2);
    return f.front.edge.length + f.front.scratches.length + f.front.specks.length;
  };
  assert.ok(count("lightly-played") < count("heavily-played"));
  assert.ok(count("mint") < count("lightly-played"));
  for (let seed = 0; seed < 60; seed++) {
    const kinds = wearLayout(wearPreset("damaged").levels, seed).corners.map((c) => c.kind);
    assert.ok(kinds.filter((k) => k === "dog-eared").length <= 1, `seed ${seed}`);
    assert.ok(kinds.filter((k) => k === "chipped").length <= 2, `seed ${seed}`);
  }
  assert.equal(wearLayout(wearPreset("mint").levels, 1).front.creases.length, 0);
  assert.ok(wearLayout(wearPreset("damaged").levels, 1).front.creases.some((c) => c.heavy));
});

test("the outline stays inside the card and the back is the front seen from behind", () => {
  for (const id of ["mint", "lightly-played", "damaged"]) {
    const f = wearLayout(wearPreset(id).levels, 9);
    for (const face of ["front", "back"]) {
      const path = wearOutline(f, face);
      assert.match(path, /^M[-\d. L]+Z$/, id);
      for (const [x, y] of path
        .slice(1, -1)
        .split("L")
        .map((p) => p.split(" ").map(Number)))
        assert.ok(x >= 0 && x <= 250 && y >= 0 && y <= 350, `${id} ${face}: ${x},${y}`);
    }
  }
  const f = wearLayout(wearPreset("damaged").levels, 3);
  const flipped = { ...f, corners: [f.corners[1], f.corners[0], f.corners[3], f.corners[2]] };
  assert.equal(wearOutline(f, "back"), wearOutline(flipped, "front"));
});

test("the overlay is markup only: no script, no link, no picture", () => {
  const svg = wearOverlaySvg(wearLayout(wearPreset("damaged").levels, 4), "front");
  assert.match(svg, /^<svg /);
  assert.doesNotMatch(svg, /<script|href=|<image|<foreignObject|onload|javascript:/i);
});
