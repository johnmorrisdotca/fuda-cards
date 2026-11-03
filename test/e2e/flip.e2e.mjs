// Browser test: run with `pnpm test:e2e`. MODULES-145: no part of a card shows what is behind it at any moment of a flip.
// Every place a card moves is frozen at a dozen moments through its flight (the Web Animations API, paused and set to each time), and each
// moment is checked by pixels (test/e2e/seethrough.mjs): the card in motion, drawn alone, must be exactly what the scene shows inside its
// outline, and must not let the flat magenta backdrop through. Cards taken off a pile and put back (both landings, off an open fan, after a
// turn), `<fuda-card stack>`, the single card's own flip and the binder's turning leaf are all covered.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { faults, freeze, pictures, seek } from "./seethrough.mjs";
import { chromium, launch, offline, portShift, serve } from "./support.mjs";

const PORT = 8112 + portShift;
const origin = `http://127.0.0.1:${PORT}`;
const STEPS = 12;
// Drawn in software, never on the graphics card, one browser at a time.
// A fault is a pixel of the card's outline that shows something else. A few edge pixels are anti-aliasing; a card cut by the cards it passes
// loses tens of thousands of them, so this is 0.7 percent of the outline.
const LIMIT = 0.007;

const collection = {
  scope: "fuda-collection",
  mover: ".card",
  hide: ".v",
  faces: ".face",
  backdrop: ".stage",
  clipSel: ".stage",
  only: ".fly,.turn",
};
const stack = {
  scope: "#c",
  mover: ".flyer",
  hide: ".rotation",
  faces: ".face,.edge",
  backdrop: "body",
  backdropDoc: true,
  only: ".fly,.turn",
  clipRect: true,
};
const demo = (query) => `/demo/collections-component.html?${query}`;
const pile = "/test/e2e/fixtures/piles.html";

/** Each scene: where to go, what to do to start the move, and what to measure. `moves` is how many Next presses come before it. */
const scenes = [
  ["the deck: a card taken off lands turned over", { url: demo("land=face-down"), start: "next", ...collection }],
  ["the deck: a card taken off lands still facing up", { url: demo("land=face-up"), start: "next", ...collection }],
  [
    "the deck: a card taken off an open fan, turned over",
    { url: demo("land=face-down&fan=open"), start: "next", ...collection },
  ],
  [
    "the deck: a card taken off after the view was turned",
    { url: demo("land=face-down&yaw=40&tilt=-10"), start: "next", ...collection },
  ],
  ["the deck: a card put back from a turned-over pile", { url: demo("land=face-down"), start: "back", ...collection }],
  [
    "the deck: the last card put back from the pile (the pile is an empty slot afterwards)",
    { url: demo("land=face-down"), start: "backlast", ...collection },
  ],
  ["a stack: a card taken off, turned over", { url: pile, start: "stack:deck-land=face-down", ...stack }],
  ["a stack: a card taken off, still facing up", { url: pile, start: "stack:deck-land=face-up", ...stack }],
  ["a stack: a card taken off an open fan", { url: pile, start: "stack:deck-land=face-down,fan=open", ...stack }],
  [
    "a stack: a card taken off after the card was turned",
    { url: pile, start: "stack:deck-land=face-down,card-view=,style=--fuda-yaw:35deg;--fuda-tilt:-15deg", ...stack },
  ],
  ["a stack: a card put back", { url: pile, start: "stackback:deck-land=face-down", ...stack }],
  [
    "a single card turns over",
    {
      url: "/test/e2e/fixtures/stack.html",
      start: "single",
      scope: "#n",
      mover: ".card",
      hide: ".rotation",
      faces: ".face,.edge",
      backdrop: "body",
      backdropDoc: true,
      only: ".card",
      clipRect: true,
    },
  ],
  [
    "the binder: the leaf turns over",
    {
      url: demo("view=binder&sheet=black"),
      start: "next",
      scope: "fuda-collection",
      mover: ".leaf",
      hide: ".v",
      extra: ".spine{display:none !important}",
      faces: ".slice>.f,.slice>.b",
      backdrop: ".stage",
      clipSel: ".stage",
      only: ".leaf",
    },
  ],
];

async function begin(page, s) {
  if (s.scope === "fuda-collection")
    await page.waitForFunction(
      () => document.querySelector("fuda-collection")?.shadowRoot?.querySelector(".card img, .pocket img")?.complete,
    );
  else await page.waitForTimeout(400);
  await page.waitForTimeout(500);
  const press = (name) => page.getByRole("button", { name }).click();
  const attr = (k, v) =>
    page.evaluate(
      ([k, v]) => {
        const c = document.querySelector("#c");
        if (k === "style") c.setAttribute("style", `${c.getAttribute("style") ?? ""};${v}`);
        else c.setAttribute(k, v);
      },
      [k, v],
    );
  if (s.start === "next") await press("Next →");
  else if (s.start === "back") {
    // Two cards on the pile, so putting one back leaves a pile to fly from (the last card off a pile has no pile to leave).
    await page.evaluate(() => document.querySelector("fuda-collection").setAttribute("animate", "off"));
    await press("Next →");
    await press("Next →");
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector("fuda-collection").removeAttribute("animate"));
    await page.waitForTimeout(200);
    await press("← Previous");
  } else if (s.start === "backlast") {
    // One card on the pile: putting it back leaves the pile empty, drawn as a dashed slot, and the card must still fly from where the pile was (MODULES-176).
    await page.evaluate(() => document.querySelector("fuda-collection").setAttribute("animate", "off"));
    await press("Next →");
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector("fuda-collection").removeAttribute("animate"));
    await page.waitForTimeout(200);
    await press("← Previous");
  } else if (s.start === "single") await page.evaluate(() => document.querySelector("#n").setAttribute("flipped", ""));
  else {
    const [kind, spec] = s.start.split(":");
    await page.evaluate(() => {
      const c = document.querySelector("#c");
      document.querySelector("#plain")?.remove();
      c.style.width = "200px";
      c.removeAttribute("pile-controls");
    });
    for (const kv of spec.split(",")) {
      const [k, ...v] = kv.split("=");
      await attr(k, v.join("="));
    }
    await page.evaluate(() => document.querySelector("#c").setAttribute("animate", "off"));
    await page.waitForTimeout(400);
    if (kind === "stackback") {
      await page.evaluate(() => document.querySelector("#c").takeOff());
      await page.waitForTimeout(300);
    }
    await page.evaluate(() => document.querySelector("#c").setAttribute("animate", "on"));
    await page.waitForTimeout(200);
    await page.evaluate((kind) => {
      const c = document.querySelector("#c");
      if (kind === "stackback") c.putBack();
      else c.takeOff();
    }, kind);
  }
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
}

for (const [name, s] of scenes) {
  test(`${name}: no part of the card shows what is behind it`, {
    skip: !chromium && "Playwright not installed",
  }, async () => {
    const browser = await launch();
    const server = serve(PORT);
    try {
      const context = await browser.newContext({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const scanner = await context.newPage();
      const problems = [];
      page.on("pageerror", (e) => problems.push(e.message));
      await offline(page);
      await page.goto(origin + s.url);
      await begin(page, s);
      const info = await freeze(page, s);
      assert.ok(info.moving >= 1 && info.ms > 300, `${name}: a card is in the air (${JSON.stringify(info)})`);
      let clip;
      if (s.clipRect)
        clip = await page.evaluate((sc) => {
          const b = document.querySelector(sc).getBoundingClientRect();
          return {
            x: Math.max(0, b.x - 60),
            y: Math.max(0, b.y - 100),
            width: b.width * 2.6 + 120,
            height: b.height + 280,
          };
        }, s.scope);
      else clip = page.locator(s.scope).locator(s.clipSel);
      const rows = [];
      let sawCard = false;
      for (let i = 0; i <= STEPS; i++) {
        await seek(page, i / STEPS);
        await page.waitForTimeout(60);
        const f = await faults(scanner, await pictures(page, { ...s, clip }));
        rows.push(`${i}/${STEPS}: ${f.behind} of ${f.area} px behind, ${f.clear} clear`);
        if (f.area > 8000) sawCard = true;
        assert.ok(
          f.behind <= Math.max(30, f.area * LIMIT),
          `${name}: at ${i}/${STEPS} of the move ${f.behind} of ${f.area} pixels of the card show something else (${rows.join("; ")})`,
        );
        assert.ok(
          f.clear <= Math.max(30, f.area * LIMIT),
          `${name}: at ${i}/${STEPS} of the move ${f.clear} of ${f.area} pixels of the card let the backdrop through`,
        );
      }
      assert.ok(sawCard, `${name}: the card was found in the pictures`);
      assert.deepEqual(problems, [], `${name}: the page raised errors`);
      await context.close();
    } finally {
      await browser.close();
      server.close();
    }
  });
}
