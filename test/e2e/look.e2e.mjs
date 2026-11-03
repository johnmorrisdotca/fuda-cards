// Browser test: run with `pnpm test:e2e`. How the card looks: every card of a stack is the top card's design, the foil moves with the light,
// a card of any width is the same drawing, and nothing draws a hairline across a pile of cards (MODULES-62, MODULES-142).

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { chromium, launch, portShift, serve } from "./support.mjs";

const PORT = 8115 + portShift;
const origin = `http://127.0.0.1:${PORT}`;
const PICTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";

/** A page with one card, written as the attributes say; the text is blank so that only the card's own drawing is on it. */
const cardPage = (attributes, style = "") =>
  `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#cdbf9f;padding:60px 40px;width:700px;height:520px}fuda-card{--fuda-perspective:2400px;width:300px;display:block;${style}}</style>
<fuda-card id="c" title=" " category=" " subtitle=" " description=" " number=" " rarity=" " ${attributes}><img alt="" src="${PICTURE}"></fuda-card>
<script type="module">import '/dist/element.js';</script>`;

async function open(browser, attributes, { style, scale = 1, size = { width: 700, height: 520 } } = {}) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: scale });
  const page = await context.newPage();
  await page.route(`${origin}/__look.html`, (route) =>
    route.fulfill({ body: cardPage(attributes, style), contentType: "text/html" }),
  );
  await page.goto(`${origin}/__look.html`);
  await page.waitForFunction(
    () => customElements.get("fuda-card") && document.getElementById("c").shadowRoot.querySelector(".art.ready"),
  );
  return { context, page };
}

const MATERIALS = { "aluminium-0.8": "rgb(201, 206, 212)", "steel-0.5": "rgb(170, 176, 182)" };

test("every card of a stack has the top card's design: its variant, its frame, its panel, and an edge in the material's colour", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const variant of ["classic", "sport", "cosmic"]) {
      for (const finish of ["foil", "matte"]) {
        const { context, page } = await open(
          browser,
          `variant="${variant}" finish="${finish}" material="steel-0.5" stack="12" stack-messiness="0.8" stack-depth="6"`,
        );
        const seen = await page.evaluate(() => {
          const root = document.getElementById("c").shadowRoot;
          const read = (el) => {
            const style = getComputedStyle(el);
            return {
              frame: style.backgroundImage,
              line: style.borderTopColor,
              radius: style.borderTopLeftRadius,
              padding: style.paddingTop,
            };
          };
          const panel = (el) => getComputedStyle(el.querySelector(".inner")).backgroundImage;
          const front = root.querySelector(".card > .front");
          const stills = [...root.querySelectorAll(".still")];
          const edge = root.querySelector(".edge.side");
          return {
            top: { ...read(front), panel: panel(front) },
            stills: stills.map((s) => ({ ...read(s), panel: panel(s), shine: Boolean(s.querySelector(".shine")) })),
            edge: getComputedStyle(edge).backgroundImage,
          };
        });
        assert.equal(seen.stills.length, 6, `${variant} ${finish}: the six cards under the top one are drawn`);
        for (const [at, still] of seen.stills.entries()) {
          for (const key of ["frame", "line", "radius", "padding", "panel"]) {
            assert.equal(
              still[key],
              seen.top[key],
              `${variant} ${finish}: card ${at} under the top one has the top card's ${key}`,
            );
          }
          assert.equal(still.shine, true, `${variant} ${finish}: and its light`);
        }
        assert.ok(
          seen.edge.includes(MATERIALS["steel-0.5"]),
          `${variant} ${finish}: the edge is the steel's colour: ${seen.edge}`,
        );
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
});

/** How many pixels of a picture (RGBA) are gold: red well over green, green well over blue. */
const goldPixels = (page, png) =>
  page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const rgba = ctx.getImageData(0, 0, img.width, img.height).data;
    let gold = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const [r, g, b] = [rgba[i], rgba[i + 1], rgba[i + 2]];
      if (r - b > 70 && r > g + 15 && g > b + 25 && r > 150) gold += 1;
    }
    return gold;
  }, png.toString("base64"));

test("a silver or violet stack shows no gold: not on the top card, not on the cards under it, not on the edge", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const count = async (attributes) => {
      const { context, page } = await open(
        browser,
        `${attributes} finish="matte" stack="12" stack-messiness="1" material="steel-0.5"`,
      );
      const gold = await goldPixels(page, await page.screenshot());
      await context.close();
      return gold;
    };
    assert.ok((await count('variant="classic"')) > 20000, "a gold card is gold");
    assert.equal(await count('variant="sport"'), 0, "a silver stack has no gold in it");
    assert.equal(await count('variant="cosmic"'), 0, "and a violet one has none");
  } finally {
    await browser.close();
    server.close();
  }
});

test("a foil card's light moves with --fuda-sheen-x and --fuda-sheen-y, and a matte card has none", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const light = (page) =>
      page.evaluate(() => {
        const front = document.getElementById("c").shadowRoot.querySelector(".card > .front");
        const shine = document.getElementById("c").shadowRoot.querySelector(".card > .front > .shine");
        return {
          foil: getComputedStyle(front).backgroundImage.includes("linear-gradient(115deg"),
          frame: getComputedStyle(front).backgroundPositionX,
          band: getComputedStyle(shine).backgroundPositionX,
          shineShown: getComputedStyle(shine).display !== "none",
        };
      });
    const foil = await open(browser, 'finish="foil"');
    const resting = await light(foil.page);
    assert.equal(resting.foil, true, "a foil card has a rainbow in its frame");
    assert.equal(resting.shineShown, true);
    await foil.page.evaluate(() => document.getElementById("c").style.setProperty("--fuda-sheen-x", "80"));
    const moved = await light(foil.page);
    assert.notEqual(moved.frame, resting.frame, "the rainbow moves when the light does");
    assert.notEqual(moved.band, resting.band, "and so does the bright band");
    await foil.page.mouse.move(40 + 150, 60 + 210);
    await foil.page.waitForFunction(() => document.getElementById("c").style.getPropertyValue("--fuda-sheen-x") !== "");
    assert.equal(
      await foil.page.evaluate(() => document.getElementById("c").style.getPropertyValue("--fuda-sheen-x")),
      "50",
      "the light follows the pointer over the card",
    );
    await foil.page.mouse.move(690, 500);
    await foil.page.waitForFunction(() => document.getElementById("c").style.getPropertyValue("--fuda-sheen-x") === "");
    await foil.context.close();
    const matte = await open(browser, 'finish="matte"');
    const flat = await light(matte.page);
    assert.equal(flat.foil, false, "a matte card has no rainbow");
    assert.equal(flat.shineShown, false, "and no bright band");
    await matte.context.close();
  } finally {
    await browser.close();
    server.close();
  }
});

test("a card of any width is the same drawing: its texts, rules and frame scale with it, and its thickness is 0.325 mm at 63 mm", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    const measure = async (width) => {
      const { context, page } = await open(browser, "", { style: `width:${width}px` });
      const result = await page.evaluate(() => {
        const root = document.getElementById("c").shadowRoot;
        const size = (selector, property) =>
          Number.parseFloat(getComputedStyle(root.querySelector(selector))[property]);
        return {
          title: size(".heading", "fontSize"),
          radius: size(".front", "borderTopLeftRadius"),
          frame: size(".front", "paddingTop"),
          depth: size(".edge.side", "width"),
          width: document.getElementById("c").offsetWidth,
        };
      });
      await context.close();
      return result;
    };
    const full = await measure(300);
    const half = await measure(150);
    assert.equal(full.title, 20);
    assert.equal(full.radius, 15);
    assert.equal(full.frame, 13);
    assert.ok(Math.abs(full.depth - (0.325 * 300) / 63) < 0.02, `a card is 0.325 mm thick by default: ${full.depth}px`);
    for (const key of ["title", "radius", "frame", "depth"]) {
      assert.ok(
        Math.abs(half[key] * 2 - full[key]) < 0.05,
        `at half the width the ${key} is half: ${half[key]} against ${full[key]}`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
});

/**
 * How many pixels of a region differ between two pictures of the same page by more than a few grey levels. The edge of a card is made of planes that stand across its faces:
 * where the browser splits a face along one of them it leaves a seam, a thin line across the face that is not in the page when the edge is not there. So a face drawn with the
 * edge must be the face drawn without it, pixel for pixel, wherever the edge is not in front of it.
 */
const changedPixels = (page, before, after, box, scale) =>
  page.evaluate(
    async ({ before, after, box, scale }) => {
      const load = async (data) => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(
          Math.round(box.x * scale),
          Math.round(box.y * scale),
          Math.round(box.width * scale),
          Math.round(box.height * scale),
        ).data;
      };
      const [one, two] = [await load(before), await load(after)];
      let changed = 0;
      for (let i = 0; i < one.length; i += 4) {
        if (Math.abs(one[i] - two[i]) + Math.abs(one[i + 1] - two[i + 1]) + Math.abs(one[i + 2] - two[i + 2]) > 24)
          changed += 1;
      }
      return changed;
    },
    { before: before.toString("base64"), after: after.toString("base64"), box, scale },
  );

test("no hairline crosses a stack or the pile of cards taken off it, at any angle", {
  skip: !chromium && "Playwright not installed",
}, async () => {
  const browser = await launch();
  const server = serve(PORT);
  try {
    for (const [yaw, tilt] of [
      [0, 0],
      [25, 15],
      [-25, 10],
      [38, -12],
    ]) {
      const { context, page } = await open(
        browser,
        `stack="10" taken-off="2" deck-land="face-up" animate="off" finish="matte" card-view`,
        { style: `--fuda-yaw:${yaw}deg;--fuda-tilt:${tilt}deg;`, scale: 2 },
      );
      await page.waitForTimeout(400);
      const boxes = await page.evaluate(() => {
        const root = document.getElementById("c").shadowRoot;
        const middle = (el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x + r.width * 0.3, y: r.y + r.height * 0.3, width: r.width * 0.4, height: r.height * 0.4 };
        };
        return {
          stack: middle(root.querySelector(".card > .front > .inner")),
          pile: middle(root.querySelector(".discard .card > .front > .inner")),
        };
      });
      const withEdge = await page.screenshot();
      await page.evaluate(() => {
        const style = document.createElement("style");
        style.textContent = ".edge { display: none !important; }";
        document.getElementById("c").shadowRoot.append(style);
      });
      await page.waitForTimeout(300);
      const without = await page.screenshot();
      for (const [name, box] of Object.entries(boxes)) {
        const changed = await changedPixels(page, withEdge, without, box, 2);
        assert.ok(
          changed < 12,
          `${name} at yaw ${yaw} and tilt ${tilt}: ${changed} pixels of its face change when the edge is taken away`,
        );
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
});
