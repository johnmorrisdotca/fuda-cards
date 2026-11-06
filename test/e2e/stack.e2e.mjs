// Browser test: run with `pnpm test:e2e`. Materials and stacks: true height, cheap stills, and no frames at idle.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { choose, chromium, launch, portShift, serve, sizes } from "./support.mjs";

const PORT = 8117 + portShift;
const WIDTH = 300;
const url = `http://127.0.0.1:${PORT}/test/e2e/fixtures/stack.html`;
const open = async (browser, size, init) => {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  if (init) await page.addInitScript(init);
  await page.goto(url);
  await page.waitForFunction(
    () =>
      customElements.get("fuda-card") &&
      [...document.querySelectorAll("fuda-card")].every((c) => c.shadowRoot.querySelector(".art.ready")),
  );
  return { context, page };
};
const measure = (page, id) =>
  page.evaluate((id) => {
    const c = document.getElementById(id);
    const root = c.shadowRoot;
    const edge = root.querySelector(".edge");
    const side = root.querySelector(".edge.side");
    return {
      depth: Number.parseFloat(getComputedStyle(edge).height),
      stills: root.querySelectorAll(".still").length,
      heightMm: c.stackHeight,
      count: c.stackCount,
      width: c.offsetWidth,
      sideWidth: side.getBoundingClientRect().width,
      stacked: root.querySelector(".card").classList.contains("stacked"),
    };
  }, id);

test("a stack is count times the material thickness high, drawn as one block plus a few stills", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, page } = await open(browser, size);
      const one = await measure(page, "n");
      const stack = await measure(page, "s");
      const px = (mm) => (mm * WIDTH) / 63;
      assert.equal(stack.width, WIDTH);
      assert.equal(one.count, 1);
      assert.ok(Math.abs(one.depth - px(0.325)) < 0.1, `${name}: one card is ${one.depth}px deep`);
      assert.equal(one.stills, 0, `${name}: a single card draws no stills`);
      assert.equal(one.stacked, false);
      assert.equal(stack.count, 52);
      assert.equal(stack.heightMm, 16.9);
      assert.ok(Math.abs(stack.depth - px(16.9)) < 0.2, `${name}: the stack is ${stack.depth}px deep, not ${px(16.9)}`);
      assert.equal(stack.stills, 10, `${name}: the ten cards under the top one are laid out`);
      assert.equal(stack.stacked, true);

      const set = (attrs) =>
        page.evaluate((attrs) => {
          const c = document.getElementById("s");
          for (const [k, v] of Object.entries(attrs)) v === null ? c.removeAttribute(k) : c.setAttribute(k, v);
        }, attrs);
      await set({ "stack-messiness": "0" });
      assert.equal((await measure(page, "s")).stills, 0, `${name}: a neat stack is one block`);
      await set({ "stack-messiness": "0.5", "stack-depth": "3" });
      assert.equal((await measure(page, "s")).stills, 3);
      await set({ "stack-depth": "99" });
      assert.equal(
        (await measure(page, "s")).stills,
        51,
        `${name}: depth is capped at 52 and by the cards under the top one`,
      );
      await set({ "stack-depth": null, thickness: "1" });
      const over = await measure(page, "s");
      assert.ok(Math.abs(over.depth - px(52)) < 0.3, `${name}: thickness overrides the material (${over.depth}px)`);
      assert.equal(over.heightMm, 52);
      await set({ thickness: null, material: "aluminium-0.8" });
      assert.equal((await measure(page, "s")).heightMm, 41.6);
      await set({ material: "no-such-material" });
      assert.equal((await measure(page, "s")).heightMm, 16.9, `${name}: an unknown material falls back to 0.325 mm`);
      await set({ material: "paper-310-black-core", stack: "1" });
      const back = await measure(page, "s");
      assert.deepEqual([back.stills, back.stacked], [0, false], `${name}: stack=1 is a single card`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test("turned side-on, a stack shows its true depth and a card shows almost none", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { context, page } = await open(browser, sizes[0][1]);
    await page.evaluate(() => {
      for (const c of document.querySelectorAll("fuda-card")) c.style.setProperty("--fuda-yaw", "90deg");
    });
    await page.waitForTimeout(100);
    const s = await measure(page, "s");
    const n = await measure(page, "n");
    assert.ok(s.sideWidth > 70, `side-on the stack is ${s.sideWidth}px wide`);
    assert.ok(n.sideWidth < 3, `side-on one card is ${n.sideWidth}px wide`);
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("a 52-card stack at rest requests no frames", { skip: !chromium && "Playwright not installed" }, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, page } = await open(browser, size, () => {
        window.__raf = 0;
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (cb) => {
          window.__raf++;
          return raf(cb);
        };
      });
      const cdp = await context.newCDPSession(page);
      let frames = 0;
      cdp.on("Page.screencastFrame", (frame) => {
        frames++;
        cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
      });
      await cdp.send("Page.startScreencast", { format: "jpeg", quality: 30, everyNthFrame: 1 });
      // On a busy machine the first paints come late: rest means a whole second with no new frame.
      for (let seen = -1, end = Date.now() + 8000; seen !== frames && Date.now() < end; ) {
        seen = frames;
        await page.waitForTimeout(1000);
      }
      const settled = frames;
      const raf0 = await page.evaluate(() => window.__raf);
      // A stray frame from a busy machine is not drawing: rest is proved by a whole window of two seconds with no frame, and three chances to see one.
      let settled2 = settled;
      for (let i = 0; i < 3; i++) {
        settled2 = frames;
        await page.waitForTimeout(2000);
        if (frames === settled2) break;
      }
      const idle = await page.evaluate(() => ({
        raf: window.__raf,
        animations: document.getAnimations().length,
        cards: [...document.querySelectorAll("fuda-card")].map((c) => c.shadowRoot.getAnimations?.().length ?? 0),
      }));
      assert.equal(frames - settled2, 0, `${name}: ${frames - settled2} frames were drawn at rest`);
      assert.equal(idle.raf - raf0, 0, `${name}: ${idle.raf - raf0} animation frames were requested at rest`);
      assert.equal(idle.animations, 0, `${name}: ${idle.animations} animations are running at rest`);
      assert.ok(
        (await page.evaluate(() => document.getElementById("s").shadowRoot.querySelectorAll(".still").length)) > 0,
      );
      // The instrument works: a change on screen does draw frames.
      const before = frames;
      await page.evaluate(() => document.getElementById("s").style.setProperty("--fuda-yaw", "70deg"));
      await page.waitForTimeout(500);
      assert.ok(frames > before, `${name}: the frame counter saw no frame after a change, so it proves nothing`);
      await cdp.send("Page.stopScreencast");
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test("the Studio offers every material and preset, sets the stack and tells its height", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const context = await browser.newContext({ viewport: size });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${PORT}/`);
      await page.waitForFunction(
        () =>
          customElements.get("fuda-card") &&
          document.querySelector("#view").state &&
          document.querySelector("#opt-material"),
      );
      const ids = await page.evaluate(async () => {
        const { cardMaterials, stackPresets } = await import("/dist/index.js");
        return { materials: cardMaterials.map((m) => m.id), counts: stackPresets.map((p) => p.count) };
      });
      const offered = await page.evaluate(() => ({
        materials: [...document.querySelectorAll("#opt-material option")].map((o) => o.value).filter(Boolean),
        counts: [...document.querySelectorAll('[data-option="stack"] .fam-seg button')].map((b) =>
          Number(b.dataset.value),
        ),
      }));
      assert.deepEqual(offered.materials, ids.materials, `${name}: the Studio must list every material`);
      for (const c of ids.counts) assert.ok(offered.counts.includes(c), `${name}: preset ${c} is missing`);
      await choose(page, "material", "paper-310-black-core");
      await choose(page, "stack", "52");
      assert.equal(await page.evaluate(() => document.querySelector("#card").getAttribute("stack")), "52");
      assert.equal(await page.inputValue("#opt-stack"), "52");
      assert.match(await page.textContent("#note"), /52 cards × 0\.325 mm = 16\.9 mm high/);
      await page.fill("#opt-stack", "7");
      assert.equal(await page.evaluate(() => document.querySelector("#card").getAttribute("stack")), "7");
      assert.equal(
        await page.evaluate(
          () => [...document.querySelectorAll('[data-option="stack"] .fam-seg button[aria-pressed="true"]')].length,
        ),
        0,
        `${name}: a count that is no preset presses none`,
      );
      await page.locator("#opt-tab-material").click();
      await page.fill("#opt-thickness", "0");
      assert.match(await page.textContent("#note"), /7 cards × 0 mm = 0 mm high/);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${name}: the page must not scroll sideways`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
