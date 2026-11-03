import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { renderPage } from "../scripts/pages.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const line = (await read("README.md")).match(/<style>fuda-card:where[^\n]*?<\/style>/)?.[0];

test("the README documents the one CSS line that keeps an unready card hidden", () => {
  assert.ok(line, "README has no no-flash line");
  assert.match(line, /fuda-card:where\(:not\(:defined\)\)\{[^}]*visibility:hidden/);
  assert.match(line, /aspect-ratio:2\.5\/3\.5/);
});

test("every demo page that uses a fuda element carries the line in its head before any script", async () => {
  const pages = [
    "demo/collections.html",
    "demo/collections-component.html",
    "demo/live-3d.html",
    "demo/embed.html",
    "demo/embed-collection.html",
  ];
  const made = { "the Card Studio": renderPage("index"), "the Builder": renderPage("builder") };
  for (const page of [...pages, ...Object.keys(made)]) {
    const html = made[page] ?? (await read(page));
    const head = html.slice(0, html.indexOf("</head>"));
    assert.ok(head.includes(line), `${page} lacks the no-flash line in its head`);
    assert.ok(
      !html.slice(0, html.indexOf(line)).includes("<script"),
      `${page}: the line must come before every script`,
    );
  }
});

test("the element keeps the art invisible until the card is laid out and its images have loaded", async () => {
  const { CARD_CSS } = await import("../dist/card-styles.js");
  const css = CARD_CSS.replace(/\s+/g, " ");
  assert.match(css, /\.art ::slotted\(\*\) \{[^}]*opacity: 0/);
  assert.match(css, /\.art\.ready ::slotted\(\*\) \{ opacity: 1; \}/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{[^@]*\.art ::slotted\(\*\) \{ transition: none; \}/);
});
