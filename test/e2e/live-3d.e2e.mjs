// The freeze test (`pnpm test:freeze`): live 3D inside cards holds its budgets, in headless Chromium drawing in software. Measured before this design, every card live
// was 41 WebGL contexts and 108,654 draws in 3 s. Each budget is a function that throws, and the second half of the file shows each one failing when the code is broken on
// purpose (the page's own modules are served with one line changed), so a green budget means something.

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import {
  COUNT_SCRIPT,
  canvasSize,
  gpuObjects,
  readCounts,
  withinPixelBudget,
} from "@johnmorrisdotca/kazoku-ui/testing";
import { chromium, launch, portShift, root, serve } from "./support.mjs";

const PORT = 8111 + portShift;
const origin = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.FUDA_SHOTS;
const SWITCHES = Number(process.env.FUDA_LIVE_SWITCHES) || 30;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const KAZOKU = "/node_modules/@johnmorrisdotca/kazoku-ui/dist/renderer/";
const skip = { skip: !chromium && "Playwright not installed" };

async function open(
  browser,
  { viewport = { width: 1280, height: 900 }, scale = 1, breaks = [], reduced = false } = {},
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    ...(reduced ? { reducedMotion: "reduce" } : {}),
  });
  const page = await context.newPage();
  const requests = [];
  const problems = [];
  page.on("request", (r) => requests.push(new URL(r.url()).pathname));
  page.on("pageerror", (e) => problems.push(e.message));
  // A broken build: one module served with one line changed. The change has to apply, or the test proves nothing.
  for (const { file, from, to } of breaks) {
    await page.route(`**${file}`, async (route) => {
      const body = await readFile(resolve(root, `.${file}`), "utf8");
      assert.ok(typeof from === "string" ? body.includes(from) : true, `the broken line is not in ${file}: ${from}`);
      route.fulfill({ contentType: "text/javascript", body: from === "" ? to + body : body.replace(from, to) });
    });
  }
  await page.addInitScript(COUNT_SCRIPT);
  await page.goto(`${origin}/demo/live-3d.html`);
  await page.waitForFunction(
    () => window.fudaLive && document.querySelector("#binder").shadowRoot.querySelectorAll(".card[data-i]").length >= 9,
  );
  return { context, page, requests, problems };
}

// Page code: the cards, framed and in the binder, in a fixed order.
const CARDS = `const cards = [...document.querySelectorAll('#framed fuda-card'), ...document.querySelector('#binder').shadowRoot.querySelectorAll('.card[data-i]')];`;
const inPage = (page, body, arg) =>
  page.evaluate(
    ({ CARDS, body, arg }) => new (Object.getPrototypeOf(async () => {}).constructor)("arg", `${CARDS} ${body}`)(arg),
    { CARDS, body, arg },
  );
const focusCard = (page, i) =>
  inPage(
    page,
    `const ok = await fudaLive.focus(cards[arg % cards.length]); const d = fudaLive.stats?.draws ?? 0, end = performance.now() + 15000; while (ok && (fudaLive.stats?.draws ?? 0) === d && performance.now() < end) await new Promise((r) => setTimeout(r, 20)); return ok;`,
    i,
  );
const blur = (page) => page.evaluate(() => fudaLive.blur());
const scrollFramedAway = (page) =>
  page.evaluate(() => {
    document.body.style.minHeight = "20000px";
    scrollTo(0, 15000);
  });

/** Over a run of focus changes there is one context at every moment, and one canvas. */
async function budgetContexts(page, switches = SWITCHES) {
  const run = await inPage(
    page,
    `let contexts = 0, canvases = 0, live = 0, lastDraws = 0;
    for (let i = 0; i < arg; i++) {
      const ok = await fudaLive.focus(cards[i % cards.length]);
      if (ok) live += 1;
      const d = fudaLive.stats.draws, end = performance.now() + 15000;
      while (ok && fudaLive.stats.draws === d && performance.now() < end) await new Promise((r) => setTimeout(r, 20));
      contexts = Math.max(contexts, window.__kazokuCount.contexts);
      canvases = Math.max(canvases, cards.reduce((n, c) => n + c.querySelectorAll('canvas').length, 0));
    }
    fudaLive.blur();
    return { contexts, canvases, live };`,
    switches,
  );
  console.log(
    `BUDGET contexts: ${switches} switches, ${run.live} went live, at most ${run.contexts} context(s), at most ${run.canvases} canvas(es)`,
  );
  if (run.contexts !== 1)
    throw new Error(`BUDGET contexts: ${run.contexts} WebGL contexts over ${switches} focus changes, the budget is 1`);
  if (run.canvases > 1) throw new Error(`BUDGET contexts: ${run.canvases} canvases at one moment, the budget is 1`);
  if (run.live !== switches)
    throw new Error(`BUDGET contexts: only ${run.live} of ${switches} focus changes went live`);
  return run;
}

/** With no card in focus, no draw and no frame is asked for. */
async function budgetIdle(page, ms = 2000) {
  await focusCard(page, 0);
  await blur(page);
  await sleep(1500);
  const before = await readCounts(page);
  await sleep(ms);
  const after = await readCounts(page);
  const draws = after.draws - before.draws;
  const frames = after.rafRequests - before.rafRequests;
  const callbacks = after.rafCallbacks - before.rafCallbacks;
  console.log(`BUDGET idle: over ${ms} ms, ${draws} draws, ${frames} frame requests, ${callbacks} frame callbacks`);
  if (draws !== 0 || frames !== 0 || callbacks !== 0)
    throw new Error(`BUDGET idle: ${draws} draws and ${frames} frame requests at rest, the budget is 0`);
}

/** Out of sight or in a hidden tab, the card in focus draws nothing; while seen it asks for one frame at a time. */
async function budgetOffScreen(page, ms = 1200) {
  await focusCard(page, 0);
  await sleep(200);
  const a = await readCounts(page);
  await sleep(ms);
  const b = await readCounts(page);
  const seen = {
    draws: b.draws - a.draws,
    frames: b.rafRequests - a.rafRequests,
    callbacks: b.rafCallbacks - a.rafCallbacks,
  };
  if (seen.draws < 1)
    throw new Error("BUDGET off screen: the card in focus does not draw while seen, so this proves nothing");
  if (Math.abs(seen.frames - seen.callbacks) > 1)
    throw new Error(
      `BUDGET off screen: ${seen.frames} frames asked for and ${seen.callbacks} ran: more than one at a time`,
    );
  await scrollFramedAway(page);
  await sleep(400);
  const c = await readCounts(page);
  await sleep(ms);
  const d = await readCounts(page);
  const away = { draws: d.draws - c.draws, frames: d.rafRequests - c.rafRequests };
  await page.evaluate(() => {
    scrollTo(0, 0);
  });
  await sleep(400);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await sleep(400);
  const e = await readCounts(page);
  await sleep(ms);
  const f = await readCounts(page);
  const hidden = { draws: f.draws - e.draws, frames: f.rafRequests - e.rafRequests };
  await page.evaluate(() => {
    delete document.visibilityState;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  console.log(
    `BUDGET off screen: seen ${JSON.stringify(seen)}, scrolled away ${JSON.stringify(away)}, hidden tab ${JSON.stringify(hidden)} over ${ms} ms`,
  );
  if (away.draws || away.frames)
    throw new Error(
      `BUDGET off screen: ${away.draws} draws and ${away.frames} frame requests while out of sight, the budget is 0`,
    );
  if (hidden.draws || hidden.frames)
    throw new Error(
      `BUDGET off screen: ${hidden.draws} draws and ${hidden.frames} frame requests in a hidden tab, the budget is 0`,
    );
}

/** After the first round the GPU objects stay flat, however many times the focus moves. */
async function budgetGpuFlat(page, rounds = 2) {
  const round = async () => {
    for (let i = 0; i < 12; i++) await focusCard(page, i);
    await blur(page);
    await sleep(2000);
    return gpuObjects(await readCounts(page));
  };
  const first = await round();
  const readings = [];
  const cdp = await page.context().newCDPSession(page);
  const heap = async () => {
    await cdp.send("HeapProfiler.collectGarbage");
    return (await cdp.send("Runtime.getHeapUsage")).usedSize;
  };
  const heapStart = await heap();
  for (let i = 0; i < rounds; i++) readings.push(await round());
  const heapEnd = await heap();
  console.log(
    `BUDGET GPU objects: after round 1 ${first}, then ${readings.join(", ")}; JS heap ${(heapStart / 1048576).toFixed(1)} to ${(heapEnd / 1048576).toFixed(1)} MB`,
  );
  const grown = Math.max(...readings) - first;
  if (grown > 0)
    throw new Error(
      `BUDGET GPU objects: ${first} after the first round and ${readings.join(", ")} after: grew by ${grown}, the budget is 0`,
    );
  if (heapEnd - heapStart > 3 * 1048576)
    throw new Error(
      `BUDGET GPU objects: the JS heap grew ${((heapEnd - heapStart) / 1048576).toFixed(1)} MB over the rounds, the budget is 3 MB`,
    );
  return { first, readings };
}

/** On a 5120x2880 screen at ratio 2 with a card that fills it, the canvas stays within 6 MP and 4096 a side. */
async function budgetCanvas(page, cardWidth = 3400) {
  await page.evaluate((w) => {
    const card = document.querySelector("#framed fuda-card");
    card.style.cssText = `width:${w}px;flex:none`;
  }, cardWidth);
  await sleep(100);
  await focusCard(page, 0);
  await sleep(100);
  const size = await canvasSize(page);
  const host = await page.evaluate(() => {
    const r = document.querySelector("#framed fuda-card .fuda-live").getBoundingClientRect();
    return `${Math.round(r.width)} x ${Math.round(r.height)}`;
  });
  await blur(page);
  console.log(
    `BUDGET canvas: ${(size.pixels / 1e6).toFixed(2)} MP, ${size.side} a side, ${size.count} canvas, for a view of ${host} CSS pixels at ratio 2`,
  );
  if (size.pixels < 2_000_000)
    throw new Error(`BUDGET canvas: the canvas is only ${size.pixels} pixels, so this proves nothing`);
  if (!withinPixelBudget(size))
    throw new Error(`BUDGET canvas: ${size.pixels} pixels, ${size.side} a side, the budget is 6 million and 4096`);
  return size;
}

/** A page of pictures loads no 3D code, and the module that decides is small. */
async function budgetBundle(requests) {
  await sleep(1500);
  const threeD = requests.filter((u) => /\/three\b|three\.|\/renderer\/|\.glb$/.test(u));
  let scriptBytes = 0;
  for (const u of new Set(requests.filter((r) => r.endsWith(".js"))))
    scriptBytes += (await readFile(resolve(root, `.${u}`)).catch(() => "")).length;
  console.log(
    `BUDGET bundle: ${requests.length} requests at rest, ${scriptBytes} bytes of script, of them 3D: ${threeD.length}`,
  );
  if (threeD.length) throw new Error(`BUDGET bundle: a page of pictures fetched 3D code: ${threeD.join(", ")}`);
}

test("contexts stay at one over a run of focus changes (reads SwiftShader, see launch)", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page, problems } = await open(browser);
    const run = await budgetContexts(page);
    assert.equal(run.contexts, 1);
    assert.deepEqual(problems, []);
  } finally {
    await browser.close();
    server.close();
  }
});

test("nothing draws at rest and no frame is asked for", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page } = await open(browser);
    await budgetIdle(page);
  } finally {
    await browser.close();
    server.close();
  }
});

test("nothing draws out of sight or in a hidden tab; one frame at a time while seen", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page } = await open(browser);
    await budgetOffScreen(page);
  } finally {
    await browser.close();
    server.close();
  }
});

test("GPU objects stay flat over many focus changes, and the heap with them", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page } = await open(browser);
    const { first, readings } = await budgetGpuFlat(page);
    assert.ok(first > 0, "the run made GPU objects at all");
    assert.ok(readings.every((n) => n <= first));
  } finally {
    await browser.close();
    server.close();
  }
});

test("the canvas stays within 6 MP and 4096 a side on a 5K screen at ratio 2", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page } = await open(browser, { viewport: { width: 5120, height: 2880 }, scale: 2 });
    await budgetCanvas(page);
  } finally {
    await browser.close();
    server.close();
  }
});

test("a page of pictures ships no 3D: three.js and the renderer come in at the first focus", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page, requests } = await open(browser);
    assert.equal((await readCounts(page)).contexts, 0, "no WebGL context before a card is in focus");
    assert.equal(await page.evaluate(() => fudaLive.stats), undefined, "no renderer before a card is in focus");
    await budgetBundle(requests);
    await focusCard(page, 0);
    assert.ok(
      requests.some((u) => u.includes("three.module")),
      "three.js loads at the first focus",
    );
    assert.ok(
      requests.some((u) => u.includes("/renderer/")),
      "the renderer loads at the first focus",
    );
    const code = await readFile(resolve(root, "dist/live-3d.js"));
    const gz = gzipSync(code, { level: 9 }).length;
    console.log(`BUDGET bundle: dist/live-3d.js ${code.length} bytes, ${gz} gzipped`);
    assert.ok(gz < 3072, `dist/live-3d.js is ${gz} bytes gzipped, the budget is 3 KB`);
    assert.doesNotMatch(
      await readFile(resolve(root, "dist/element.js"), "utf8"),
      /live-3d|renderer/,
      "a plain card does not reach for 3D",
    );
    const collection = await readFile(resolve(root, "dist/collection-element.js"), "utf8");
    assert.doesNotMatch(collection, /from ['"][^'"]*(live-3d|renderer)/, "a plain collection does not reach for 3D");
  } finally {
    await browser.close();
    server.close();
  }
});

test("focus by pointer, keyboard and tap: one card live, the old one a picture at its last angle", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page, context } = await open(browser);
    const card = (i) => page.locator("#framed fuda-card").nth(i);
    const liveIs = (i) =>
      inPage(page, "return cards.indexOf(fudaLive.focused);").then((at) =>
        assert.equal(at, i, `card ${i} should be in focus, not ${at}`),
      );
    // A quick pass over a card starts nothing.
    await card(0).hover();
    await page.mouse.move(2, 2);
    await sleep(400);
    assert.equal(
      await inPage(page, "return fudaLive.focused === undefined && fudaLive.stats === undefined;"),
      true,
      "a pointer passing over a card starts no 3D",
    );
    // Pointer: resting on a card takes the focus, leaving ends it.
    await card(0).hover();
    await page.waitForFunction(() => fudaLive.focused && fudaLive.stats?.draws > 0, null, { timeout: 20000 });
    await liveIs(0);
    assert.equal(
      await page.locator("#framed fuda-card").nth(0).locator("canvas").count(),
      1,
      "the canvas is in the card",
    );
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/live-3d-card-in-focus.png` });
    await page.waitForFunction(
      (d) => fudaLive.stats.draws >= d,
      (await page.evaluate(() => fudaLive.stats.draws)) + 10,
      { timeout: 20000 },
    ); // long enough to have turned
    await card(1).hover();
    await page.waitForFunction(() => document.querySelectorAll("#framed fuda-card")[1].querySelector("canvas"), null, {
      timeout: 20000,
    });
    await liveIs(1);
    assert.equal(await card(0).locator("canvas").count(), 0, "the old card has no canvas");
    await page.waitForFunction(() => document.querySelector("#framed fuda-card img").src.startsWith("blob:"), null, {
      timeout: 20000,
    });
    assert.ok(
      await page.evaluate(() =>
        fudaLive.renderer.stills.keys().some((k) => /^rocket:falcon-9-block-5@(?!0$)\d+$/.test(k)),
      ),
      "the picture is at the angle the card stopped at, not its first one",
    );
    await page.mouse.move(2, 2);
    await page.waitForFunction(() => !fudaLive.focused);
    assert.equal(await page.locator("canvas").count(), 0, "no card is live once the pointer has left");
    // Keyboard.
    await card(2).focus();
    await page.waitForFunction(() => document.querySelectorAll("#framed fuda-card")[2].querySelector("canvas"), null, {
      timeout: 20000,
    });
    await liveIs(2);
    await page.evaluate(() => document.activeElement.blur());
    await page.waitForFunction(() => !fudaLive.focused);
    // A press, and a press elsewhere. Then the binder, in the same context.
    const box = await card(1).boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(() => document.querySelectorAll("#framed fuda-card")[1].querySelector("canvas"), null, {
      timeout: 20000,
    });
    await page.mouse.click(2, 2);
    await page.waitForFunction(() => !fudaLive.focused);
    await page.locator("#binder").scrollIntoViewIfNeeded();
    const pocket = page.locator("#binder .card[data-i]").nth(4);
    await pocket.hover();
    await page.waitForFunction(() => document.querySelector("#binder").shadowRoot.querySelector(".card canvas"), null, {
      timeout: 20000,
    });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/live-3d-binder-in-focus.png` });
    await page.getByRole("button", { name: "Next →" }).click();
    await page.waitForFunction(
      () => document.querySelector("#binder").shadowRoot.querySelector('.card[data-i="18"]'),
      null,
      { timeout: 20000 },
    );
    assert.equal((await readCounts(page)).contexts, 1, "a page turn of the binder keeps the one context");
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("reduced motion: a card in focus stays its picture, and no 3D is loaded", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page, requests } = await open(browser, { reduced: true });
    assert.equal(await inPage(page, "return fudaLive.focus(cards[0]);"), false);
    await page.locator("#framed fuda-card").first().hover();
    await sleep(500);
    assert.equal((await readCounts(page)).contexts, 0);
    assert.equal(
      requests.some((u) => u.includes("three.module")),
      false,
    );
  } finally {
    await browser.close();
    server.close();
  }
});

test("a lost context: the card shows its picture and draws again when it comes back", skip, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { page } = await open(browser);
    await focusCard(page, 0);
    await page.evaluate(() => {
      const c = document.querySelector("#framed fuda-card canvas");
      const gl = c.getContext("webgl2");
      window.__lose = gl.getExtension("WEBGL_lose_context");
      window.__lose.loseContext();
    });
    await page.waitForFunction(() => fudaLive.stats.lost, null, { timeout: 5000 });
    assert.equal(
      await page.evaluate(() => document.querySelector("#framed fuda-card img").style.visibility),
      "",
      "the picture shows",
    );
    const a = (await readCounts(page)).draws;
    await sleep(500);
    assert.equal((await readCounts(page)).draws, a, "nothing draws on a lost context");
    await page.evaluate(() => window.__lose.restoreContext());
    await page.waitForFunction(() => !fudaLive.stats.lost, null, { timeout: 5000 });
    await page.waitForFunction((n) => window.__kazokuCount.draws > n, a, { timeout: 15000 });
    assert.equal((await readCounts(page)).contexts, 1);
  } finally {
    await browser.close();
    server.close();
  }
});

test(
  "every display of the collection goes live on the card in focus, on the one context, and every move keeps it at one",
  skip,
  async () => {
    const browser = await launch();
    const server = serve(PORT);
    try {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      const problems = [];
      page.on("pageerror", (e) => problems.push(e.message));
      await page.addInitScript(COUNT_SCRIPT);
      await page.goto(`${origin}/demo/live-3d.html`);
      await page.waitForFunction(() => window.fudaLive);
      for (const view of [
        "binder",
        "deck",
        "rolodex",
        "case",
        "random",
        "story",
        "wall",
        "spotlight",
        "atlas",
        "fan",
      ]) {
        const result = await page.evaluate(async (view) => {
          const binder = document.querySelector("#binder");
          const root = binder.shadowRoot;
          binder.setAttribute("view", view);
          const visible = () =>
            [...root.querySelectorAll(".card[data-i]")].filter(
              (c) =>
                !c.classList.contains("ghost") && c.getBoundingClientRect().width > 0 && c.querySelector(".fuda-live"),
            );
          const end = performance.now() + 3000;
          while (!visible().length && performance.now() < end) await new Promise((r) => setTimeout(r, 30));
          const cards = visible();
          const card = cards[cards.length - 1];
          if (!card) return { view, cards: 0 };
          const ok = await fudaLive.focus(card);
          const canvases = root.querySelectorAll(".card canvas").length;
          const size = card.querySelector("canvas")?.getBoundingClientRect();
          fudaLive.blur();
          return {
            view,
            cards: cards.length,
            ok,
            canvases,
            width: size?.width ?? 0,
            contexts: window.__kazokuCount.contexts,
          };
        }, view);
        console.log(`LIVE ${JSON.stringify(result)}`);
        assert.ok(result.cards > 0, `${view}: no card took a live view`);
        assert.equal(result.ok, true, `${view}: the card did not go live`);
        assert.equal(result.canvases, 1, `${view}: one canvas in the card in focus`);
        assert.ok(result.width > 10, `${view}: the canvas has a size`);
        assert.equal(result.contexts, 1, `${view}: one context`);
      }
      assert.deepEqual(problems, []);
      await context.close();
    } finally {
      await browser.close();
      server.close();
    }
  },
);

test(
  "a card with no picture of its own gets one only when it comes near the view, one at a time from the one context",
  skip,
  async () => {
    const browser = await launch();
    const server = serve(PORT);
    try {
      const { page } = await open(browser);
      const count = 40;
      await page.evaluate((n) => {
        const list = document.createElement("div");
        list.id = "column";
        document.querySelector("main").append(list);
        for (let i = 0; i < n; i++) {
          const el = document.createElement("div");
          el.style.cssText = "width:200px;height:280px;margin:2000px 0 0;background:#223";
          list.append(el);
          const item = fudaRocket("dragon-dragon-1-capsule");
          fudaLive.add(el, { key: `no-picture-${i}`, build: item.build });
        }
      }, count);
      await sleep(1500);
      assert.equal(
        (await readCounts(page)).contexts,
        0,
        "every card without a picture is far off screen, so nothing 3D has started",
      );
      await page.evaluate(() => document.querySelector("#column").children[3].scrollIntoView());
      await page.waitForFunction(() => fudaLive.stats?.snapshots >= 1, null, { timeout: 20000 });
      await sleep(1500);
      const stats = await page.evaluate(() => fudaLive.stats);
      console.log(
        `BUDGET stills: ${count} cards with no picture, ${stats.snapshots} still(s) made for the one in view, ${stats.contexts} context, ${(stats.stills.bytes / 1048576).toFixed(2)} MB`,
      );
      assert.ok(
        stats.snapshots >= 1 && stats.snapshots <= 3,
        `only the cards near the view get a still, not ${stats.snapshots}`,
      );
      assert.equal(stats.contexts, 1);
      assert.match(
        await page.evaluate(() => document.querySelector("#column").children[3].querySelector("img")?.src ?? ""),
        /^blob:/,
        "the card shows its still",
      );
    } finally {
      await browser.close();
      server.close();
    }
  },
);

test("the built demo site carries what the page needs", skip, async () => {
  const browser = await launch();
  const server = serve(PORT, resolve(root, "site"));
  try {
    const page = await browser.newPage();
    const missing = [];
    page.on("response", (r) => {
      if (r.status() >= 400) missing.push(r.url());
    });
    await page.goto(`${origin}/demo/live-3d.html`);
    await page.waitForFunction(() => window.fudaLive);
    const went = await page.evaluate(() => fudaLive.focus(document.querySelector("#framed fuda-card")));
    assert.deepEqual(missing, [], "nothing the page asks for is missing");
    assert.equal(went, true, "a card goes live from the site");
  } finally {
    await browser.close();
    server.close();
  }
});

// Each budget again, on a build broken on purpose: it has to fail, and name itself.
const broken = [
  [
    "contexts",
    "a new renderer for every focus",
    [
      {
        file: `${KAZOKU}renderer.js`,
        from: "if (gl !== undefined && !lost)\n            return Promise.resolve(gl);",
        to: "",
      },
    ],
    {},
    ({ page }) => budgetContexts(page, 6),
    /BUDGET contexts/,
  ],
  [
    "idle",
    "a card that keeps turning after it lost the focus",
    [{ file: "/dist/live-3d.js", from: "entry?.view?.blur();", to: "" }],
    {},
    ({ page }) => budgetIdle(page),
    /BUDGET idle/,
  ],
  [
    "off screen",
    "a renderer that does not look at what is seen",
    [
      {
        file: `${KAZOKU}renderer.js`,
        from: 'const idle = !onScreen || doc().visibilityState === "hidden";',
        to: "const idle = false;",
      },
    ],
    {},
    ({ page }) => budgetOffScreen(page),
    /BUDGET off screen/,
  ],
  [
    "GPU objects",
    "assets dropped without being freed",
    [{ file: `${KAZOKU}cache.js`, from: "entry.dispose?.(entry.value);", to: "" }],
    {},
    ({ page }) => budgetGpuFlat(page, 1),
    /BUDGET GPU objects/,
  ],
  [
    "canvas",
    "no pixel budget",
    [
      {
        file: `${KAZOKU}pixels.js`,
        from: "ratio = Math.min(ratio, maxSide / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));",
        to: "return ratio;",
      },
    ],
    { viewport: { width: 1600, height: 1200 }, scale: 2 },
    ({ page }) => budgetCanvas(page, 1600),
    /BUDGET canvas/,
  ],
  [
    "bundle",
    "three.js imported up front",
    [{ file: "/dist/live-3d.js", from: "", to: "import 'three';\n" }],
    {},
    ({ requests }) => budgetBundle(requests),
    /BUDGET bundle/,
  ],
];
for (const [name, how, breaks, options, check, expected] of broken) {
  test(`the ${name} budget fails when it is broken on purpose: ${how}`, skip, async () => {
    const browser = await launch();
    const server = serve(PORT);
    try {
      const opened = await open(browser, { ...options, breaks });
      await assert.rejects(
        () => check(opened),
        (error) => {
          console.log(`BROKEN ON PURPOSE ${name}: ${error.message}`);
          return expected.test(error.message);
        },
      );
    } finally {
      await browser.close();
      server.close();
    }
  });
}
