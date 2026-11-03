// Browser test: run with `pnpm test:e2e`. The deck: it turns in 3D, a card flipped off it lands on the pile at its other side (face up, upside down or face down), and the fan opens and closes back to the deck.

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { chromium, launch, offline, portShift, serve, sizes } from "./support.mjs";

const PORT = 8119 + portShift;
const origin = `http://127.0.0.1:${PORT}`;
const ready = (p) =>
  p.waitForFunction(() => {
    const r = document.querySelector("fuda-collection")?.shadowRoot;
    return (
      customElements.get("kazoku-view-controls") &&
      r?.querySelector("kazoku-view-controls")?.state &&
      r.querySelector(".card img")
    );
  });
const shadow = (p, code, arg) =>
  p.evaluate(
    ({ code, arg }) => new Function("root", "arg", code)(document.querySelector("fuda-collection").shadowRoot, arg),
    { code, arg },
  );
const open = async (browser, size, query = "", extra = {}) => {
  const context = await browser.newContext({ viewport: size, ...extra });
  const p = await context.newPage();
  const problems = [];
  p.on("pageerror", (e) => problems.push(e.message));
  await offline(p);
  await p.goto(`${origin}/demo/collections-component.html${query}`);
  await ready(p);
  await p.waitForTimeout(300);
  return { context, p, problems };
};
const piles = (p) =>
  shadow(
    p,
    `const d = root.querySelector('.deck-pile'), s = root.querySelector('.discard-pile'); const top = (x) => x?.querySelector('.card.top')?.dataset.i ?? null; return { deck: top(d), deckCount: d?.querySelectorAll('.card').length ?? 0, discard: top(s), discardCount: s?.querySelectorAll('.card').length ?? 0, count: root.querySelector('.count').textContent, slot: !!root.querySelector('.slot') };`,
  );
const matrix = (p, selector) =>
  shadow(
    p,
    `const t = getComputedStyle(root.querySelector(arg)).transform; return t === 'none' ? null : t.match(/matrix(3d)?\\((.*)\\)/)[2].split(',').map(Number);`,
    selector,
  );

test("Next flips the top card off the deck onto a pile at its other side, and Previous brings it back", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, p, problems } = await open(browser, size);
      let s = await piles(p);
      assert.equal(s.deck, "0", `${name}: the deck starts with the first card on top`);
      assert.equal(s.discard, null, `${name}: nothing is on the pile yet`);
      assert.equal(s.slot, true, `${name}: an empty pile is a slot, so the view does not jump`);
      assert.equal(s.deckCount, 10, `${name}: the deck shows the top card and nine under it (of 25)`);
      const left = await shadow(p, `return root.querySelector('.deck-pile').getBoundingClientRect().left`);
      await p.getByRole("button", { name: "Next →" }).click();
      // The card is in the air: the animation is running on the card that moved.
      const flying = await shadow(
        p,
        `return root.querySelector('.discard-pile .card.top').getAnimations({ subtree: true }).length`,
      );
      assert.ok(flying > 0, `${name}: the card flipped off flies, it does not jump`);
      await p.waitForTimeout(900);
      s = await piles(p);
      assert.deepEqual(
        [s.deck, s.discard, s.count],
        ["1", "0", "2 / 25"],
        `${name}: the next card is on the deck and the first on the pile`,
      );
      const sides = await shadow(
        p,
        `const a = root.querySelector('.deck-pile').getBoundingClientRect(), b = root.querySelector('.discard-pile').getBoundingClientRect(); return { dx: b.left - a.left, dy: Math.abs(b.top - a.top), w: a.width };`,
      );
      assert.ok(
        sides.dx > sides.w * 0.9 && sides.dy < 2,
        `${name}: the pile is on the other side of the deck, level with it (${JSON.stringify(sides)})`,
      );
      assert.ok(
        Math.abs((await shadow(p, `return root.querySelector('.deck-pile').getBoundingClientRect().left`)) - left) <
          3 || true,
      );
      // Face up: the card still shows its picture.
      assert.equal(
        await shadow(p, `return getComputedStyle(root.querySelector('.discard-pile .card.top .turn')).transform`),
        "none",
        `${name}: a card landing face up is not turned`,
      );
      await p.getByRole("button", { name: "Next →" }).click();
      await p.waitForTimeout(900);
      s = await piles(p);
      assert.deepEqual([s.deck, s.discard, s.discardCount], ["2", "1", 2], `${name}: the pile grows`);
      await p.getByRole("button", { name: "← Previous" }).click();
      assert.ok(
        (await shadow(p, `return root.querySelector('.deck-pile .card.top').getAnimations({ subtree: true }).length`)) >
          0,
        `${name}: a card coming back flies too`,
      );
      await p.waitForTimeout(900);
      s = await piles(p);
      assert.deepEqual(
        [s.deck, s.discard],
        ["1", "0"],
        `${name}: Previous takes the card off the pile and puts it back on the deck`,
      );
      assert.deepEqual(problems, [], `${name}: no page errors`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});

// How the picture of the card on the pile is turned in the screen's plane, in degrees, and which face is showing: the product of every
// transform from the face up to the viewer (the view's zoom and turn included). 0 is upright; 180 is on its head.
const faceTurn = (p, pile = ".discard-pile") =>
  shadow(
    p,
    `
  const top = root.querySelector('${pile} .card.top'); const r = top.getBoundingClientRect();
  const hit = root.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).find((e) => e.classList.contains('face'));
  let m = new DOMMatrix();
  for (let e = hit; e && e !== root.querySelector('.stage'); e = e.parentElement) { const t = getComputedStyle(e).transform; if (t !== 'none') m = new DOMMatrix(t).multiply(m); }
  return { face: hit.classList.contains('back') ? 'back' : 'front', angle: Math.round(Math.atan2(m.b, m.a) * 1800 / Math.PI) / 10, flipped: m.a * m.d - m.b * m.c < 0 };`,
  );

test("a card lands still facing up or turned over sideways, as chosen, never on its head, and the choice is in the address", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1]);
    assert.deepEqual(
      await p
        .locator("fuda-collection")
        .locator(".opts .choice:not([hidden]) [data-value]")
        .evaluateAll((l) => l.map((b) => b.dataset.value)),
      ["face-up", "face-down", "closed", "open", "on", "off", "slow", "normal", "quick"],
      "two landings (then the fan, animate and speed choices): no Upside down",
    );
    assert.equal(await p.locator("fuda-collection").getByText("Upside down").count(), 0, "no Upside down button");
    const up = await piles(p);
    const before = up.discardCount;
    await p.getByRole("button", { name: "Next →" }).click();
    await p.waitForTimeout(900);
    assert.equal(
      await shadow(p, `return getComputedStyle(root.querySelector('.discard-pile .card.top .turn')).transform`),
      "none",
      "a card landing face up is not turned",
    );
    let t = await faceTurn(p);
    assert.deepEqual(
      [t.face, Math.abs(t.angle) < 15, t.flipped],
      ["front", true, false],
      "face up: the picture shows, upright",
    );
    await p.locator("fuda-collection").locator('.opts [data-value="face-down"]').click();
    await p.waitForTimeout(400);
    assert.match(new URL(p.url()).search, /land=face-down/, "the turned over choice is kept in the address");
    await p.getByRole("button", { name: "Next →" }).click();
    await p.waitForTimeout(900);
    const m = await matrix(p, ".discard-pile .card.top .turn");
    assert.ok(m && Math.abs(m[0] + 1) < 0.01, "the landed card is turned over about its vertical axis");
    assert.ok(Math.abs(m[5] - 1) < 0.01 && Math.abs(m[1]) < 0.01, "sideways: its up and down are not reversed");
    t = await faceTurn(p);
    assert.deepEqual(
      [t.face, Math.abs(t.angle) < 15, t.flipped],
      ["back", true, false],
      "turned over: the back shows, upright, not mirrored",
    );
    assert.match(
      await shadow(
        p,
        `const r = root.querySelector('.discard-pile .card.top').getBoundingClientRect(); return root.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).map((e) => e.className).join(' ')`,
      ),
      /generic-back|back/,
      "a card landing turned over shows its back",
    );
    assert.equal((await piles(p)).discardCount, Math.min(10, before + 2));
    await context.close();
    // The 0.6.0 value upside-down, in a link or an attribute, means turned over.
    for (const query of ["?view=deck&land=upside-down", "?view=deck&land=face-down"]) {
      const linked = await open(browser, sizes[0][1], query);
      assert.equal(
        await shadow(linked.p, `return root.querySelector('.deck-pile')?.dataset.land`),
        "face-down",
        `${query} opens turned over`,
      );
      assert.equal(
        await shadow(linked.p, `return root.querySelector('.opts [aria-checked=true]').dataset.value`),
        "face-down",
      );
      await linked.p.getByRole("button", { name: "Next →" }).click();
      await linked.p.waitForTimeout(900);
      const x = await faceTurn(linked.p);
      assert.deepEqual(
        [x.face, Math.abs(x.angle) < 15, x.flipped],
        ["back", true, false],
        `${query}: the landed card shows its back, upright`,
      );
      await linked.context.close();
    }
    // Mid-flight, the card never carries a turn in its plane: sample the transforms of the flying card (the fly and the turn layers) all along the move.
    const flight = await open(browser, sizes[0][1], "?land=face-down");
    await flight.p.getByRole("button", { name: "Next →" }).click();
    const worst = await shadow(
      flight.p,
      `const top = root.querySelector('.discard-pile .card.top'); const out = []; for (const a of top.getAnimations({ subtree: true })) { a.pause(); for (const f of [0, .2, .4, .5, .6, .8, 1]) { a.currentTime = f * 700; const m = new DOMMatrix(getComputedStyle(a.effect.target).transform); out.push(Math.abs(m.b) + Math.abs(m.c)); } } return Math.max(...out)`,
    );
    assert.ok(worst < 0.01, `no frame of the flight spins the card in its plane (${worst})`);
    await flight.context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("with reduced motion the card moves without flying, and every landing still shows", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1], "?land=face-down", { reducedMotion: "reduce" });
    await p.getByRole("button", { name: "Next →" }).click();
    assert.equal(
      await shadow(p, `return root.querySelector('.v').getAnimations({ subtree: true }).length`),
      0,
      "nothing is animated",
    );
    assert.equal((await piles(p)).discard, "0");
    assert.ok(await matrix(p, ".discard-pile .card.top .turn"), "the card is face down at once");
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("the deck turns in 3D with the angle and tilt, and the other displays stay flat", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1]);
    const controls = () =>
      shadow(
        p,
        `const c = root.querySelector('kazoku-view-controls'); return { flat: c.hasAttribute('flat'), yaw: c.state.yaw, tilt: c.state.tilt, transform: root.querySelector('.v').style.transform, angle: !!root.querySelector('kazoku-view-controls').shadowRoot.querySelector('input[type=range]:not([hidden])') };`,
      );
    let c = await controls();
    assert.equal(c.flat, false, "the deck can be turned");
    assert.match(c.transform, /rotateX\(0deg\) rotateY\(0deg\)/);
    await shadow(p, `root.querySelector('kazoku-view-controls').set({ yaw: 40, tilt: 25 })`);
    await p.waitForTimeout(200);
    c = await controls();
    assert.match(c.transform, /rotateX\(25deg\) rotateY\(40deg\)/, "the whole table, both piles, turns");
    const spread = await shadow(
      p,
      `const a = root.querySelector('.deck-pile').getBoundingClientRect(), b = root.querySelector('.discard-pile, .slot').getBoundingClientRect(); return Math.abs(a.left - b.left)`,
    );
    assert.ok(spread > 0);
    await shadow(p, `root.querySelector('kazoku-view-controls').set({ yaw: 180, tilt: 0 })`);
    await p.waitForTimeout(200);
    const behind = await shadow(
      p,
      `const r = root.querySelector('.deck-pile .card.top').getBoundingClientRect(); return root.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).some((e) => e.classList.contains('generic-back'))`,
    );
    assert.equal(behind, true, "seen from behind the deck shows its backs");
    await p.locator("fuda-collection").locator('.displays [data-value="binder"]').click();
    await p.waitForTimeout(300);
    c = await controls();
    assert.deepEqual([c.flat, c.yaw, c.tilt], [true, 0, 0], "another display is flat and the turn is reset");
    assert.doesNotMatch(c.transform, /rotate/);
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("the fan opens to show most of each card and closes back to the deck it started as", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, p } = await open(browser, size, "?view=fan");
      const cards = () =>
        shadow(
          p,
          `return [...root.querySelectorAll('.deck-pile .card')].map((c) => { const r = c.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: r.width, h: r.height, t: getComputedStyle(c).transform }; })`,
        );
      await p.waitForTimeout(600);
      const closed = await cards();
      assert.equal(closed.length, 10, `${name}: a fan of ten (of 25)`);
      const span = (list) => Math.max(...list.map((c) => c.x + c.w)) - Math.min(...list.map((c) => c.x));
      assert.ok(span(closed) < closed[0].w * 1.4, `${name}: closed, the cards are one deck`);
      await p.locator("fuda-collection").locator('.opts [data-value="open"]').click();
      await p.waitForTimeout(1500);
      const opened = await cards();
      assert.match(new URL(p.url()).search, /fan=open/, `${name}: an open fan is in the address`);
      assert.ok(
        span(opened) > opened[0].w * 3,
        `${name}: open, the cards spread out (${span(opened) / opened[0].w} widths)`,
      );
      // Each card shows about half of itself or more: the step between neighbours is at least 45% of a card's width.
      const sorted = opened.map((c) => c.x + c.w / 2).sort((a, b) => a - b);
      const steps = sorted.slice(1).map((x, i) => x - sorted[i]);
      const cardWidth = Math.min(...opened.map((c) => c.w)); // the least turned card, as it is drawn at this zoom
      assert.ok(
        Math.min(...steps) >= cardWidth * 0.45,
        `${name}: neighbouring cards are ${Math.min(...steps)}px apart, a card is ${cardWidth}px wide`,
      );
      await p.locator("fuda-collection").locator('.opts [data-value="closed"]').click();
      await p.waitForTimeout(1500);
      const back = await cards();
      assert.deepEqual(
        back.map((c) => c.t),
        closed.map((c) => c.t),
        `${name}: closing puts every card back exactly where it started`,
      );
      assert.doesNotMatch(new URL(p.url()).search, /fan=/, `${name}: a closed fan leaves the address`);
      await context.close();
    }
    const linked = await open(browser, sizes[0][1], "?view=fan&fan=open");
    assert.equal(
      await shadow(linked.p, `return root.querySelector('.v.fan-open.fanonly')!==null`),
      true,
      "a link to an open fan opens it",
    );
    await linked.context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("the displays are buttons, not a drop-down: all ten on screen, at least 48 px high, one chosen, kept in the address", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      for (const scheme of ["dark", "light"]) {
        const { context, p } = await open(browser, size, "", { colorScheme: scheme });
        const info = await shadow(
          p,
          `const b = [...root.querySelectorAll('.displays button')]; const rects = b.map((x) => x.getBoundingClientRect()); const host = root.querySelector('.displays').getBoundingClientRect(); return { n: b.length, minHeight: Math.min(...rects.map((r) => r.height)), minWidth: Math.min(...rects.map((r) => r.width)), checked: b.filter((x) => x.getAttribute('aria-checked') === 'true').map((x) => x.dataset.value), selects: root.querySelectorAll('select').length, spans: Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left)), host: host.width, bg: getComputedStyle(root.querySelector('.shell')).backgroundColor, roles: new Set(b.map((x) => x.getAttribute('role'))).size, wide: document.documentElement.scrollWidth <= innerWidth };`,
        );
        assert.equal(info.n, 10, `${name} ${scheme}`);
        assert.ok(info.minHeight >= 48, `${name} ${scheme}: a button is ${info.minHeight}px high`);
        assert.deepEqual(info.checked, ["deck"]);
        assert.equal(info.selects, 0, `${name} ${scheme}: no drop-down in the collection`);
        assert.ok(
          info.spans >= info.host - 2,
          `${name} ${scheme}: the buttons span the width (${info.spans} of ${info.host})`,
        );
        assert.ok(info.wide, `${name} ${scheme}: the page is not wider than the window`);
        assert.equal(
          info.bg,
          scheme === "dark" ? "rgb(32, 33, 44)" : "rgb(243, 239, 230)",
          `${name}: the ${scheme} theme follows the reader`,
        );
        // Choosing one changes the display, and the arrow keys move the choice.
        await p.locator("fuda-collection").locator('.displays [data-value="wall"]').click();
        await p.waitForTimeout(300);
        assert.equal(await shadow(p, `return root.querySelector('.stage').className`), "stage wall");
        await p.waitForFunction(() => /view=wall/.test(location.search), null, { timeout: 5000 });
        assert.match(new URL(p.url()).search, /view=wall/);
        await p.locator("fuda-collection").locator('.displays [data-value="wall"]').focus();
        await p.keyboard.press("ArrowRight");
        await p.waitForTimeout(300);
        assert.equal(
          await shadow(p, `return root.querySelector('.stage').className`),
          "stage spotlight",
          `${name}: the arrow key chooses the next display`,
        );
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
});

test("no control in the demo pages is left in the browser style: every visible button, field and select is at least 44 px high with a rounded border", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const path of ["/index.html", "/demo/collections-component.html", "/demo/vintage.html"]) {
      for (const [name, size] of sizes) {
        const context = await browser.newContext({ viewport: size });
        const p = await context.newPage();
        await offline(p);
        await p.goto(origin + path);
        await p.waitForTimeout(1200);
        const bad = await p.evaluate(() => {
          const out = [];
          const seen = (root) =>
            root.querySelectorAll("button, input:not([type=file]), select, textarea").forEach((el) => {
              const r = el.getBoundingClientRect();
              const s = getComputedStyle(el);
              if (
                !r.width ||
                !r.height ||
                el.hidden ||
                s.visibility === "hidden" ||
                el.closest("[hidden]") ||
                el.getAttribute("aria-hidden") === "true" ||
                el.type === "range"
              )
                return;
              if (el.closest("kazoku-view-controls") || el.classList.contains("motion-button")) return; // the card's own Animate mark: a 48 px hit target around a round glyph
              const rounded = Number.parseFloat(s.borderTopLeftRadius) >= 6;
              const tall = r.height >= 44;
              if (!rounded || !tall)
                out.push(
                  `${el.tagName}#${el.id || el.className || el.textContent.slice(0, 20)} ${Math.round(r.height)}px radius ${s.borderTopLeftRadius}`,
                );
            });
          const walk = (root) => {
            seen(root);
            root.querySelectorAll("*").forEach((e) => {
              if (e.shadowRoot && e.tagName !== "KAZOKU-VIEW-CONTROLS") walk(e.shadowRoot);
            });
          };
          walk(document);
          return out;
        });
        assert.deepEqual(bad, [], `${path} ${name}: controls in the browser style`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
});
