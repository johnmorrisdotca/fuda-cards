import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cardMaterial, cardMaterials, mmPerPoint, stackHeightMm, stackLayout, stackPresets } from "../dist/index.js";

const docs = await readFile(new URL("../docs/materials.md", import.meta.url), "utf8");

test("every material has a unique id, a thickness and a source, and the docs list it with its number and link", () => {
  assert.equal(new Set(cardMaterials.map((m) => m.id)).size, cardMaterials.length);
  for (const m of cardMaterials) {
    assert.ok(m.thicknessMm > 0 && m.thicknessMm < 10, m.id);
    assert.match(m.source.url, /^https:\/\//, m.id);
    assert.ok(m.source.says.length > 10, m.id);
    assert.match(m.edge, /^#[0-9a-f]{6}$/, m.id);
    assert.ok(
      docs.includes(`\`${m.id}\``) && docs.includes(m.source.url) && docs.includes(`| ${m.thicknessMm} |`),
      `docs/materials.md lacks ${m.id}`,
    );
  }
});

test("a material named in points is that many thousandths of an inch", () => {
  for (const m of cardMaterials.filter((m) => /pt$/.test(m.id))) {
    const points = Number(m.id.match(/(\d+)pt$/)[1]);
    assert.ok(Math.abs(m.thicknessMm - points * mmPerPoint) < 0.0006, m.id);
  }
  assert.equal(cardMaterial("card-130pt").thicknessMm, 3.302);
  assert.equal(cardMaterial("nothing"), undefined);
});

test("the presets are sourced and listed in the docs", () => {
  assert.deepEqual(
    stackPresets.map((p) => p.count),
    [52, 54, 60, 10],
  );
  for (const p of stackPresets) assert.ok(docs.includes(`\`${p.id}\``) && docs.includes(p.source.url), p.id);
});

test("a stack is count times a card high", () => {
  assert.equal(stackHeightMm(52, 0.325), 16.9);
  assert.equal(stackHeightMm(60, 3.302), 198.12);
  assert.equal(stackHeightMm(0, 0.3), 0.3);
});

test("a stack lays out the same every time for a seed, and another for another", () => {
  const a = stackLayout(52, { seed: 7, messiness: 0.6 });
  assert.deepEqual(a, stackLayout(52, { seed: 7, messiness: 0.6 }));
  assert.notDeepEqual(a, stackLayout(52, { seed: 8, messiness: 0.6 }));
});

test("a neat stack has nothing nudged, and a messy one never turns a card more than fourteen degrees", () => {
  for (const place of stackLayout(20, { messiness: 0 })) assert.deepEqual(place, { x: 0, y: 0, rotate: 0 });
  const spread = (mess) =>
    Math.max(...stackLayout(60, { messiness: mess, seed: 3, depth: 52 }).map((p) => Math.abs(p.rotate)));
  assert.ok(spread(0.2) < spread(0.6) && spread(0.6) < spread(1));
  assert.ok(spread(1) <= 14);
});

test("only the cards under the top one are laid out, at most depth of them, and a card keeps its place when another lands on it", () => {
  assert.equal(stackLayout(52).length, 10);
  assert.equal(stackLayout(52, { depth: 3 }).length, 3);
  assert.equal(stackLayout(4).length, 3);
  assert.deepEqual(stackLayout(1), []);
  assert.deepEqual(stackLayout(0), []);
  const before = stackLayout(5, { seed: 9, messiness: 0.7 });
  const after = stackLayout(6, { seed: 9, messiness: 0.7 });
  assert.deepEqual(after.slice(0, before.length), before);
  const deep = stackLayout(40, { seed: 9, messiness: 0.7, depth: 10 });
  const deeper = stackLayout(41, { seed: 9, messiness: 0.7, depth: 10 });
  assert.deepEqual(deeper.slice(0, 9), deep.slice(1));
});
