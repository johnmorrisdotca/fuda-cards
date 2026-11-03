// Browser test: run with `pnpm test:e2e`. Wear: a perfect card is unchanged and loads no wear code; a worn card is drawn from its seed and the same every time.

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { chromium, launch, portShift, serve, sizes } from "./support.mjs";

const PORT = 8118 + portShift;
const base = `http://127.0.0.1:${PORT}/test/e2e/fixtures`;
const shadow = (page, id) => page.evaluate((id) => document.getElementById(id).shadowRoot.innerHTML, id);
const ready = (page) =>
  page.waitForFunction(
    () =>
      customElements.get("fuda-card") &&
      [...document.querySelectorAll("fuda-card")].every((c) => c.shadowRoot.querySelector(".art.ready")),
  );
const worn = (page, id) =>
  page.waitForFunction((id) => document.getElementById(id).shadowRoot.querySelector(".wear"), id);

test("a perfect card is drawn exactly as 0.4.0 drew it and never loads the wear code", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const before = await readFile(new URL("./fixtures/perfect-card-0.4.0.html", import.meta.url), "utf8");
    for (const [name, size] of sizes) {
      const context = await browser.newContext({ viewport: size });
      const page = await context.newPage();
      const requests = [];
      page.on("request", (r) => requests.push(r.url()));
      await page.goto(`${base}/perfect.html`);
      await ready(page);
      assert.equal(await shadow(page, "p"), before, `${name}: the perfect card's markup is unchanged`);
      for (const value of ["perfect", "", "0"]) {
        await page.evaluate((v) => document.getElementById("p").setAttribute("wear", v), value);
        await page.waitForTimeout(150);
        assert.equal(await shadow(page, "p"), before, `${name}: wear="${value}" draws nothing`);
      }
      assert.ok(
        !requests.some((u) => u.includes("/dist/wear.js")),
        `${name}: wear.js was not requested for a perfect card`,
      );
      await page.evaluate(() => document.getElementById("p").setAttribute("wear", "no-such-wear"));
      await page.waitForTimeout(250);
      assert.equal(await shadow(page, "p"), before, `${name}: an unknown name draws nothing`);
      await context.close();
    }
  } finally {
    browser.close();
    server.close();
  }
});

test("a worn card is drawn from its seed: the same every time, another seed another card, and taking wear away restores the card", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const before = await readFile(new URL("./fixtures/perfect-card-0.4.0.html", import.meta.url), "utf8");
    for (const [name, size] of sizes) {
      const draw = async (attrs, wait = true) => {
        const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
        const page = await context.newPage();
        const requests = [];
        page.on("request", (r) => requests.push(r.url()));
        await page.goto(`${base}/perfect.html`);
        await ready(page);
        await page.evaluate((attrs) => {
          const c = document.getElementById("p");
          for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, v);
        }, attrs);
        if (wait) await worn(page, "p");
        await page.waitForTimeout(700);
        const html = await shadow(page, "p");
        const shot = await page.locator("#p").screenshot();
        return { context, page, html, shot, requests };
      };
      const a = await draw({ wear: "heavily-played", "wear-seed": "4" });
      const b = await draw({ wear: "heavily-played", "wear-seed": "4" });
      const c = await draw({ wear: "heavily-played", "wear-seed": "5" });
      assert.ok(
        a.requests.some((u) => u.includes("/dist/wear.js")),
        `${name}: the wear code is loaded when asked for`,
      );
      assert.equal(a.html, b.html, `${name}: same seed, same marks`);
      assert.ok(a.shot.equals(b.shot), `${name}: same seed, same pixels`);
      assert.notEqual(a.html, c.html, `${name}: another seed lays other marks`);
      const counts = await a.page.evaluate(() => {
        const r = document.getElementById("p").shadowRoot;
        return {
          overlays: r.querySelectorAll(".wear svg").length,
          masks: [...r.querySelectorAll(".face")].filter((f) => f.style.maskImage || f.style.webkitMaskImage).length,
        };
      });
      assert.deepEqual(counts, { overlays: 2, masks: 2 }, `${name}: one overlay and one outline on each face`);
      // The corners really are cut: the heavy preset leaves transparent pixels where a perfect card has paint.
      await a.page.evaluate(() => document.getElementById("p").removeAttribute("wear-seed"));
      await a.page.waitForTimeout(150);
      const perfect = await draw({ wear: "perfect" }, false);
      assert.ok(!a.shot.equals(perfect.shot), `${name}: a worn card looks different from a perfect one`);
      // Taking wear away restores the original markup.
      await a.page.evaluate(() => document.getElementById("p").removeAttribute("wear"));
      await a.page.waitForTimeout(150);
      assert.equal(await shadow(a.page, "p"), before, `${name}: removing wear restores the perfect card`);
      for (const x of [a, b, c, perfect]) await x.context.close();
    }
  } finally {
    browser.close();
    server.close();
  }
});

test("wear shows on the back of a turned card too, and an override beats the preset", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const context = await browser.newContext({ viewport: sizes[0][1] });
    const page = await context.newPage();
    await page.goto(`${base}/perfect.html`);
    await ready(page);
    await page.evaluate(() => {
      const c = document.getElementById("p");
      c.setAttribute("wear", "near-mint");
      c.setAttribute("wear-creases", "1");
      c.setAttribute("flipped", "");
    });
    await worn(page, "p");
    const info = await page.evaluate(() => {
      const r = document.getElementById("p").shadowRoot;
      return {
        back: !!r.querySelector(".face.back .wear svg"),
        creases: r.querySelectorAll(".face.front .wear path[stroke-dasharray]").length,
      };
    });
    assert.equal(info.back, true);
    assert.ok(info.creases >= 1, "the creases override puts a heavy crease on a near mint card");
    await context.close();
  } finally {
    browser.close();
    server.close();
  }
});
