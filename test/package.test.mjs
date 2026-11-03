import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("package exposes separate browser element and data entry points", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url)));
  assert.equal(pkg.exports["."].import, "./dist/index.js");
  assert.equal(pkg.exports["./element"].import, "./dist/element.js");
});
