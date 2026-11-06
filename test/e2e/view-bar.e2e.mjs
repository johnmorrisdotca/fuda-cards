// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
// The shared view controls of kazoku-ui 0.10: one true zoom number on the bar, always in sight, and no animation frame asked for while nothing can see the view.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COUNT_SCRIPT, readCounts } from "@johnmorrisdotca/kazoku-ui/testing";
import { chromium, launch, offline, portShift, pressFit, serve, sizes } from "./support.mjs";

const PORT = 8116 + portShift;
const origin = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.FUDA_SHOTS;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Finds the bar and the stage, in the collection's shadow root when the page has one.
const barScope = `const root = document.querySelector('fuda-collection')?.shadowRoot ?? document; const bar = root.querySelector('kazoku-view-controls');`;
const inPage = (p, body, arg) =>
  p.evaluate(({ scope, body, arg }) => new Function("arg", `${scope} ${body}`)(arg), { scope: barScope, body, arg });

const readout = (p) =>
  inPage(
    p,
    `
  const el = bar.shadowRoot.querySelector('[data-b="level"]'), r = el.getBoundingClientRect();
  let at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  while (at?.shadowRoot) { const inner = at.shadowRoot.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!inner || inner === at) break; at = inner; }
  return { text: el.textContent.trim(), zoom: bar.state.zoom, width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right,
    two: bar.shadowRoot.querySelectorAll('[data-b="two"]').length, hit: el === at || el.contains(at), viewW: innerWidth, viewH: innerHeight };`,
  );
const shown = (zoom) => `${Number(zoom < 1 ? zoom.toPrecision(2) : zoom.toFixed(1))}×`;

const pages = [
  [
    "studio",
    "/index.html",
    () => document.querySelector("#view")?.state && document.querySelector("fuda-card")?.shadowRoot,
  ],
  [
    "collection",
    "/demo/collections-component.html",
    () =>
      document.querySelector("fuda-collection")?.shadowRoot?.querySelector("kazoku-view-controls")?.state &&
      document.querySelector("fuda-collection").shadowRoot.querySelector(".card img"),
  ],
  [
    "vintage",
    "/demo/vintage.html",
    () =>
      document.querySelector("fuda-collection")?.shadowRoot?.querySelector("kazoku-view-controls")?.state &&
      document.querySelector("fuda-collection").shadowRoot.querySelector(".card img"),
  ],
];

test("the bar has one zoom number, in sight on a desk and a phone, and it is the true one", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, path, ready] of pages)
      for (const [device, size] of sizes) {
        const p = await browser.newPage({ viewport: size });
        await offline(p);
        await p.goto(origin + path);
        await p.waitForFunction(ready);
        const where = `${device} ${name}`;
        const bar = (label) => p.locator("kazoku-view-controls").getByRole("button", { name: label, exact: true });
        const check = async (step) => {
          const r = await readout(p);
          assert.equal(r.two, 0, `${where}: the 2× preset is gone`);
          assert.equal(r.text, shown(r.zoom), `${where}, ${step}: the bar says ${r.text} and the view is at ${r.zoom}`);
          assert.ok(
            r.width >= 24 && r.height >= 24,
            `${where}, ${step}: the number is too small to read (${r.width} x ${r.height})`,
          );
          assert.ok(
            r.top >= 0 && r.bottom <= r.viewH && r.left >= 0 && r.right <= r.viewW,
            `${where}, ${step}: the number is off the first screen (${r.top} to ${r.bottom} of ${r.viewH})`,
          );
          assert.ok(r.hit, `${where}, ${step}: something covers the number`);
          return r;
        };
        await check("at opening");
        if (SHOTS) await p.screenshot({ path: `${SHOTS}/zoom-readout-${name}-${device}-opening.png` });
        await pressFit(p.locator("kazoku-view-controls"));
        const fit = await check("Fit");
        assert.equal(fit.text, "1×", `${where}: Fit reads 1×`);
        await bar("Zoom in").click();
        const inned = await check("Zoom in");
        assert.ok(inned.zoom > 1, `${where}: Zoom in did nothing`);
        await bar("Zoom out").click();
        await bar("Zoom out").click();
        const outed = await check("Zoom out");
        assert.ok(outed.zoom < 1, `${where}: Zoom out goes below Fit`);
        assert.notEqual(outed.text, "0×", `${where}: a small zoom never reads 0×`);
        await inPage(p, "bar.set({ zoom: 2.4 });");
        assert.equal((await check("a zoom set by the page")).text, "2.4×");
        if (SHOTS) await p.screenshot({ path: `${SHOTS}/zoom-readout-${name}-${device}-2.4x.png` });
        await p.close();
      }
  } finally {
    await browser.close();
    server.close();
  }
});

test("the number is what is drawn: the card is that many times its size at Fit", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [device, size] of sizes) {
      const p = await browser.newPage({ viewport: size });
      await p.goto(`${origin}/index.html`);
      await p.waitForFunction(pages[0][2]);
      const width = () => p.evaluate(() => document.querySelector("#card").getBoundingClientRect().width);
      await pressFit(p.locator("#view"));
      const atFit = await width();
      for (const zoom of [0.5, 1.5, 2, 3.2]) {
        await p.evaluate((z) => document.querySelector("#view").set({ zoom: z }), zoom);
        const drawn = await width();
        const said = await readout(p);
        assert.equal(said.text, shown(zoom), `${device}: the number at ${zoom}`);
        assert.ok(
          Math.abs(drawn / atFit - zoom) < 0.01,
          `${device}: the card is ${(drawn / atFit).toFixed(3)} times its Fit size and the bar says ${said.text}`,
        );
      }
      await p.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

// Page code that keeps the stage out of sight by scrolling far past it.
const outOfSight = (p) =>
  p.evaluate(() => {
    document.body.style.minHeight = "10000px";
    scrollTo(0, 9000);
  });
const backInSight = (p) => p.evaluate(() => scrollTo(0, 0));
const hideTab = (p, hidden) =>
  p.evaluate((h) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => (h ? "hidden" : "visible") });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);

const framesOver = async (p, ms) => {
  const before = await readCounts(p);
  const yaw0 = await inPage(p, "return bar.state.yaw;");
  await sleep(ms);
  const after = await readCounts(p);
  const yaw1 = await inPage(p, "return bar.state.yaw;");
  return {
    requests: after.rafRequests - before.rafRequests,
    callbacks: after.rafCallbacks - before.rafCallbacks,
    moved: Math.abs(yaw1 - yaw0) > 0.01,
  };
};

for (const [name, path, ready] of pages.slice(0, 2)) {
  test(`${name}: an automatic turn asks for no frame out of sight or in a hidden tab, and goes on when seen`, {
    skip: !chromium && "Playwright not installed",
  }, async () => {
    const browser = await launch();
    const server = serve(PORT);
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const p = await context.newPage();
      await offline(p);
      await p.addInitScript(COUNT_SCRIPT);
      await p.goto(origin + path + (name === "collection" ? "?view=deck" : ""));
      await p.waitForFunction(ready);
      await p.locator("kazoku-view-controls").getByRole("button", { name: "Auto-turn", exact: true }).click();
      await sleep(400);
      const seen = await framesOver(p, 1000);
      assert.ok(seen.requests > 3 && seen.moved, `${name}: the turn should run while seen (${JSON.stringify(seen)})`);
      assert.ok(
        seen.requests <= seen.callbacks + 1,
        `${name}: one frame asked for at a time (${JSON.stringify(seen)})`,
      );
      await outOfSight(p);
      await sleep(400);
      const scrolled = await framesOver(p, 1000);
      assert.deepEqual(
        scrolled,
        { requests: 0, callbacks: 0, moved: false },
        `${name}: out of sight it must ask for nothing`,
      );
      await backInSight(p);
      await sleep(300);
      assert.ok((await framesOver(p, 800)).requests > 2, `${name}: the turn goes on when seen again`);
      await hideTab(p, true);
      await sleep(300);
      assert.deepEqual(
        await framesOver(p, 800),
        { requests: 0, callbacks: 0, moved: false },
        `${name}: a hidden tab must ask for nothing`,
      );
      await hideTab(p, false);
      await sleep(300);
      assert.ok((await framesOver(p, 800)).requests > 2, `${name}: the turn goes on when the tab comes back`);
      await context.close();
    } finally {
      await browser.close();
      server.close();
    }
  });
}

test("the speed is in sight while the view turns and the basic bar stays small", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [device, size] of sizes) {
      const p = await browser.newPage({ viewport: size });
      await p.goto(`${origin}/index.html`);
      await p.waitForFunction(pages[0][2]);
      const pace = p.locator('#view [data-b="pace-now"]');
      assert.equal(await pace.isVisible(), false, `${device}: no speed while the card stands still`);
      assert.equal(await p.locator('#view [data-b="front"]').isVisible(), false, `${device}: Front is behind More`);
      await p.locator("#view").getByRole("button", { name: "Auto-turn", exact: true }).click();
      await p.waitForFunction(() => document.querySelector("#view").state.turning);
      assert.equal(await pace.isVisible(), true, `${device}: the speed shows while it turns`);
      if (SHOTS) await p.screenshot({ path: `${SHOTS}/bar-turning-${device}.png` });
      assert.match(await pace.textContent(), /Medium/);
      await pace.click();
      assert.match(await pace.textContent(), /Fast/, `${device}: a press steps to the next speed`);
      await p.locator("#view").getByRole("button", { name: "Auto-turn", exact: true }).click();
      await p.locator("#view").getByRole("button", { name: "More", exact: true }).click();
      assert.equal(
        await p.locator('#view [data-b="front"]').isVisible(),
        true,
        `${device}: More shows the advanced controls`,
      );
      if (SHOTS) await p.screenshot({ path: `${SHOTS}/bar-advanced-${device}.png` });
      await p.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
