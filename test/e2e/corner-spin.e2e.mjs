// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).

import { strict as assert } from "node:assert";
import { resolve } from "node:path";
import { test } from "node:test";
import { choose, chromium, launch, portShift, pressFit, serve } from "./support.mjs";

const PORT = 8111 + portShift;
const _root = resolve(import.meta.dirname, "../..");

const sizes = [
  ["desktop", { width: 1280, height: 800 }],
  ["mobile", { width: 390, height: 844 }],
];

test("corner spin keeps the corner at the stage centre, full size, with zoom", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const p = await browser.newPage({ viewport: size });
      await p.goto(`http://127.0.0.1:${PORT}/`);
      await p.waitForFunction(
        () =>
          customElements.get("fuda-card") &&
          customElements.get("kazoku-view-controls") &&
          document.querySelector("#view").state,
      );
      await choose(p, "card-spin", "corner");
      const bar = await p.evaluate(() => document.querySelector("#view").getBoundingClientRect().bottom);
      assert.ok(bar <= size.height, `${name}: the view controls are below the first screen (${bar}px)`);

      const sweep = () =>
        p.evaluate(() => {
          const stage = document.querySelector("#stage");
          const view = document.querySelector("#view");
          const host = document.querySelector("#card");
          const card = host.shadowRoot.querySelector(".card");
          const probe = document.createElement("div");
          probe.style.cssText = "position:absolute;left:0;bottom:0;width:0;height:0";
          card.append(probe);
          const box = stage.getBoundingClientRect();
          const cx = box.left + box.width / 2;
          const cy = box.top + box.height / 2;
          const off = [];
          const overflow = [];
          const faces = new Set();
          for (let i = 0; i < 72; i++) {
            view.set({ yaw: -180 + (360 * i) / 72 });
            const pt = probe.getBoundingClientRect();
            const r = card.getBoundingClientRect();
            off.push(Math.hypot(pt.left - cx, pt.top - cy));
            overflow.push(Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom));
            faces.add(
              new DOMMatrix(getComputedStyle(host.shadowRoot.querySelector(".rotation")).transform).m33 >= 0
                ? "front"
                : "back",
            );
          }
          probe.remove();
          view.set({ yaw: 0 });
          return { off, overflow, faces: [...faces], width: host.offsetWidth, height: host.offsetHeight };
        });
      const opening = await p.evaluate(() => ({
        zoom: document.querySelector("#view").state.zoom,
        width: document.querySelector("#card").getBoundingClientRect().width,
      }));
      assert.ok(opening.zoom > 1, `${name}: the studio must not open at Fit (zoom ${opening.zoom})`);
      assert.ok(
        Math.abs(opening.width - 300) <= 1,
        `${name}: the card must open at full size, not ${opening.width}px wide`,
      );
      await pressFit(p);
      const fit = await sweep();
      assert.ok(Math.max(...fit.off) <= 1, `${name}: the corner is ${Math.max(...fit.off)}px from the stage centre`);
      assert.equal(fit.width, 300, `${name}: the card must stay full size`);
      assert.ok(
        Math.max(...fit.overflow) <= 1,
        `${name}: the card leaves the stage by ${Math.max(...fit.overflow)}px at Fit`,
      );
      assert.deepEqual(fit.faces.sort(), ["back", "front"], `${name}: both faces must turn toward the viewer`);

      const zoom = () => p.evaluate(() => document.querySelector("#view").state.zoom);
      await p.getByRole("button", { name: "Zoom in" }).click();
      const zin = await zoom();
      assert.ok(zin > 1, `${name}: Zoom in did nothing`);
      assert.ok(Math.max(...(await sweep()).off) <= 1, `${name}: the corner moved when zoomed in`);
      await p.getByRole("button", { name: "Zoom out" }).click();
      await p.getByRole("button", { name: "Zoom out" }).click();
      assert.ok((await zoom()) < 1, `${name}: Zoom out must go below Fit`);
      // 0.10 of the view controls has no 2x button: a double press on the view goes to 2 times, and the one number on the bar says so.
      await p.locator("#stage").dblclick({ position: { x: 8, y: 8 } });
      assert.equal(await zoom(), 2, `${name}: a double press goes to 2 times`);
      assert.equal(
        await p.locator("#view").locator('[data-b="level"]').textContent(),
        "2×",
        `${name}: the readout says 2×`,
      );
      await pressFit(p);
      assert.equal(await zoom(), 1, `${name}: Fit must return to 1`);
      const box = await p.locator("#stage").boundingBox();
      await p.keyboard.down("Control");
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await p.mouse.wheel(0, -300);
      await p.keyboard.up("Control");
      assert.ok((await zoom()) > 1, `${name}: Ctrl+wheel must zoom`);
      await pressFit(p);

      await p.getByRole("button", { name: /Animate/ }).click();
      assert.equal(
        await p.evaluate(() => document.querySelector("#card").hasAttribute("playing")),
        true,
        `${name}: the card's Animate button must still work on the stage`,
      );

      await p.getByRole("button", { name: "Auto-turn" }).click();
      const turned = await p
        .waitForFunction(() => Math.abs(document.querySelector("#view").state.yaw) > 0.5, null, { timeout: 5000 })
        .then(() => true);
      assert.ok(turned, `${name}: Auto-turn did not turn`);
      await p.getByRole("button", { name: "Zoom in" }).click();
      assert.equal(
        await p.evaluate(() => document.querySelector("#view").state.turning),
        true,
        `${name}: a control stopped the turn`,
      );
      await p.close();

      const a = await browser.newPage({ viewport: size });
      await a.goto(`http://127.0.0.1:${PORT}/?zoom=2`);
      await a.waitForFunction(() => document.querySelector("#view").state);
      await choose(a, "card-spin", "corner");
      assert.equal(
        await a.evaluate(() => document.querySelector("#view").state.zoom),
        2,
        `${name}: an address zoom must win over the default`,
      );
      await a.close();

      const q = await browser.newPage({ viewport: size, reducedMotion: "reduce" });
      await q.goto(`http://127.0.0.1:${PORT}/`);
      await q.waitForFunction(() => document.querySelector("#view").state);
      await choose(q, "card-spin", "corner");
      const still = await q.evaluate(() => ({
        turning: document.querySelector("#view").state.turning,
        animations: document.querySelector("#card").shadowRoot.querySelector(".rotation").getAnimations().length,
      }));
      assert.deepEqual(still, { turning: false, animations: 0 }, `${name}: reduced motion must leave the card still`);
      await q.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

// The nearest thing to a phone here: Chromium's mobile mode with real touch events, at a phone's pixel ratio. Not a real phone.
test("corner spin by touch, in mobile mode: a drag turns the card about the corner, the page stays, a pinch zooms", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const p = await context.newPage();
    await p.goto(`http://127.0.0.1:${PORT}/`);
    await p.waitForFunction(
      () =>
        customElements.get("fuda-card") &&
        customElements.get("kazoku-view-controls") &&
        document.querySelector("#view").state,
    );
    await choose(p, "card-spin", "corner");
    await pressFit(p.locator("#view"));
    const corner = () =>
      p.evaluate(() => {
        const stage = document.querySelector("#stage");
        const host = document.querySelector("#card");
        const card = host.shadowRoot.querySelector(".card");
        const probe = document.createElement("div");
        probe.style.cssText = "position:absolute;left:0;bottom:0;width:0;height:0";
        card.append(probe);
        const box = stage.getBoundingClientRect();
        const pt = probe.getBoundingClientRect();
        probe.remove();
        return {
          off: Math.hypot(pt.left - box.left - box.width / 2, pt.top - box.top - box.height / 2),
          yaw: document.querySelector("#view").state.yaw,
          zoom: document.querySelector("#view").state.zoom,
          scroll: scrollY,
        };
      });
    const box = await p.locator("#stage").boundingBox();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const cdp = await context.newCDPSession(p);
    const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    const shots = process.env.FUDA_SHOTS;
    const before = await corner();
    await touch("touchStart", [{ x: cx - 80, y: cy }]);
    for (let x = -60; x <= 80; x += 20) {
      await touch("touchMove", [{ x: cx + x, y: cy }]);
      await p.waitForTimeout(20);
    }
    await touch("touchEnd", []);
    await p.waitForTimeout(200);
    const dragged = await corner();
    assert.ok(Math.abs(dragged.yaw - before.yaw) > 10, `a drag should turn the card (${before.yaw} to ${dragged.yaw})`);
    assert.ok(dragged.off <= 1, `the corner stays at the stage centre, ${dragged.off} px off`);
    assert.equal(dragged.scroll, before.scroll, "a sideways drag on the card does not scroll the page");
    if (shots) await p.screenshot({ path: `${shots}/corner-spin-touch-turned.png` });
    await touch("touchStart", [
      { x: cx - 40, y: cy, id: 0 },
      { x: cx + 40, y: cy, id: 1 },
    ]);
    for (let d = 50; d <= 110; d += 15) {
      await touch("touchMove", [
        { x: cx - d, y: cy, id: 0 },
        { x: cx + d, y: cy, id: 1 },
      ]);
      await p.waitForTimeout(20);
    }
    await touch("touchEnd", []);
    await p.waitForTimeout(200);
    const pinched = await corner();
    assert.ok(pinched.zoom > before.zoom * 1.3, `a pinch should zoom (${before.zoom} to ${pinched.zoom})`);
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});
