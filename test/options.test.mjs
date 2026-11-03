import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cardAttributes, cardFinishes, cardVariants, VERSION } from "../dist/index.js";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("the options of a card become its attributes: kebab-case names, text values, a true boolean present and a false one absent", () => {
  assert.deepEqual(
    cardAttributes({
      title: "Explorer One",
      stack: 52,
      stackMessiness: 0.5,
      stackSeed: 7,
      wear: "near-mint",
      cardSpin: "corner",
      cardSpinPaused: true,
      flipped: false,
      pileControls: true,
      deckLand: "face-down",
      takenOff: 2,
    }),
    {
      title: "Explorer One",
      stack: "52",
      "stack-messiness": "0.5",
      "stack-seed": "7",
      wear: "near-mint",
      "card-spin": "corner",
      "card-spin-paused": "",
      "pile-controls": "",
      "deck-land": "face-down",
      "taken-off": "2",
    },
  );
});

test("a setting left undefined is left out, a zero is kept, and nothing is shared with the options passed in", () => {
  const options = { thickness: 0, wear: 0, title: undefined };
  assert.deepEqual(cardAttributes(options), { thickness: "0", wear: "0" });
  assert.deepEqual(options, { thickness: 0, wear: 0, title: undefined });
  assert.deepEqual(cardAttributes({}), {});
});

test("every attribute the element watches can be written from an option", () => {
  const written = Object.keys(
    cardAttributes({
      title: "a",
      category: "a",
      subtitle: "a",
      description: "a",
      number: "a",
      rarity: "a",
      motion: "pan",
      playing: true,
      thickness: 1,
      autoplay: "focus",
      material: "paper-250",
      stack: 2,
      stackMessiness: 0,
      stackSeed: 1,
      stackDepth: 1,
      wear: "mint",
      wearSeed: 1,
      wearCorners: 0,
      wearEdges: 0,
      wearSurface: 0,
      wearCreases: 0,
      fan: "open",
      takenOff: 1,
      deckLand: "face-up",
      animate: "on",
      speed: "slow",
      pileControls: true,
    }),
  );
  assert.equal(written.length, 27);
});

test("the looks and finishes are the ones the studio offers", () => {
  assert.deepEqual([...cardVariants], ["classic", "sport", "cosmic"]);
  assert.deepEqual([...cardFinishes], ["foil", "matte"]);
});

test("the version in the code is the version of the package", () => {
  assert.equal(VERSION, pkg.version);
});

test("both elements are registered by one import, listed as having side effects, and the old entries stay", () => {
  assert.equal(pkg.exports["./element/define"].import, "./dist/element-define.js");
  assert.ok(pkg.sideEffects.includes("./dist/element-define.js"));
  for (const entry of ["./element", "./collection-element", "./live-3d", "./collection", "."])
    assert.ok(pkg.exports[entry], entry);
});
