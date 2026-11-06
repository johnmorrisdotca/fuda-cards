// The Card Studio, the Builder and the embed pages in a real browser, at a phone's width and a desk's: `pnpm test:demo` builds the site and runs them. The site is served to
// the page without a port, from site/.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const origin = "http://fuda-cards.test";
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

/** Serve site/ to the page, and collect what the page reports as an error. */
async function open(page, path) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: `pnpm test:demo` builds it");
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await page.route(`${origin}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, decodeURIComponent(pathname.endsWith("/") ? `${pathname}index.html` : pathname));
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? "application/octet-stream" });
  });
  await page.goto(`${origin}${path}`);
  return errors;
}

const drawn = (page) =>
  page.waitForFunction(() => {
    const card = document.querySelector("fuda-card");
    return (
      customElements.get("fuda-card") &&
      card?.shadowRoot?.querySelector(".art.ready") &&
      document.getElementById("view")?.state
    );
  });

const fits = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("the Card Studio", () => {
  test("opens on a card that fits its stage, in the page's width, with no error", async ({ page }) => {
    const errors = await open(page, "/");
    await drawn(page);
    expect(await fits(page), "the page does not scroll sideways").toBe(true);
    const box = await page.evaluate(() => {
      const r = (el) => el.getBoundingClientRect();
      const stage = r(document.getElementById("stage"));
      const card = r(document.getElementById("card"));
      return {
        inside:
          card.left >= stage.left - 1 &&
          card.right <= stage.right + 1 &&
          card.top >= stage.top - 1 &&
          card.bottom <= stage.bottom + 1,
      };
    });
    expect(box.inside, "the whole card is on the stage at Fit").toBe(true);
    expect(errors).toEqual([]);
  });

  test("a setting is a click in its tab: the card changes, the address keeps it, and a link opens the same card", async ({
    page,
  }) => {
    await open(page, "/");
    await drawn(page);
    await page.locator("#opt-tab-look").click();
    await page.locator('[data-option="variant"] button[data-value="cosmic"]').click();
    await expect(page.locator("#card")).toHaveAttribute("variant", "cosmic");
    await page.locator("#opt-tab-stack").click();
    await page.locator("#opt-stack").fill("12");
    await expect(page.locator("#card")).toHaveAttribute("stack", "12");
    await expect(page.locator("#note")).toContainText("12 cards");
    await page.waitForFunction(() => /variant=cosmic/.test(location.search) && /stack=12/.test(location.search));
    const link = page.url();
    const second = await page.context().newPage();
    await open(second, new URL(link).pathname + new URL(link).search);
    await drawn(second);
    await expect(second.locator("#card")).toHaveAttribute("variant", "cosmic");
    await expect(second.locator("#card")).toHaveAttribute("stack", "12");
  });

  test("every group of settings is one tab, and all of them are reached from the first screen's tab row", async ({
    page,
  }) => {
    await open(page, "/");
    await drawn(page);
    const tabs = await page
      .locator('[role="tablist"] [role="tab"]')
      .evaluateAll((nodes) => nodes.map((node) => node.dataset.group));
    expect(tabs).toEqual(["look", "text", "material", "stack", "wear", "motion", "pile"]);
    expect(
      await page.locator("#controls details, #controls summary, #controls [aria-expanded]").count(),
      "nothing folds open",
    ).toBe(0);
    const rows = await page.locator("[data-option]").count();
    expect(rows).toBeGreaterThan(30);
  });

  test("the language switches to Japanese and back without moving the card", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desk",
      "checked at a desk's width; the picker's place at a phone's width is not yet checked (a ticket)",
    );
    await open(page, "/");
    await drawn(page);
    const before = await page.locator("#card").boundingBox();
    await page
      .locator('kazoku-language-picker button[data-lang="ja"], kazoku-language-picker [lang="ja"]')
      .first()
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
    await expect(page.locator("#opt-tab-look")).toHaveText("見た目");
    const after = await page.locator("#card").boundingBox();
    expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeLessThan(4);
  });

  test("drag the card far off and press Centre: it is back in the middle of the stage, at Fit", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desk",
      "checked at a desk's width; in the compact layout Centre is behind More (a ticket)",
    );
    await open(page, "/?stack=1");
    await drawn(page);
    const centred = () =>
      page.evaluate(() => {
        const stage = document.getElementById("stage").getBoundingClientRect();
        const card = document.getElementById("card").getBoundingClientRect();
        return {
          x: card.x + card.width / 2 - (stage.x + stage.width / 2),
          y: card.y + card.height / 2 - (stage.y + stage.height / 2),
        };
      });
    const start = await centred();
    expect(Math.abs(start.x) + Math.abs(start.y)).toBeLessThan(3);
    await page.evaluate(() => document.getElementById("view").set({ zoom: 2, panX: 900, panY: -700 }));
    const away = await centred();
    expect(Math.abs(away.x) + Math.abs(away.y), "the card is away from the middle").toBeGreaterThan(50);
    const inView = await page.evaluate(() => {
      const stage = document.getElementById("stage").getBoundingClientRect();
      const card = document.getElementById("card").getBoundingClientRect();
      const w = Math.min(card.right, stage.right) - Math.max(card.left, stage.left);
      const h = Math.min(card.bottom, stage.bottom) - Math.max(card.top, stage.top);
      return w > 0 && h > 0 && (w * h) / (card.width * card.height) >= 0.2;
    });
    expect(inView, "however far it is dragged, a quarter of the card stays in view").toBe(true);
    const centre = page.locator("#view").getByRole("button", { name: /Centre|中央/ });
    await expect(centre.first()).toBeVisible();
    await centre.first().click();
    await page.waitForFunction(() => {
      const state = document.getElementById("view").state;
      return state.zoom === 1 && state.panX === 0 && state.panY === 0;
    });
    await page.waitForTimeout(400);
    const back = await centred();
    expect(Math.abs(back.x) + Math.abs(back.y), "the card is in the middle again").toBeLessThan(3);
  });

  test("the surface under the pointer follows the pointer: drag right and the front moves right, drag up and it moves up, the arrow keys agree, Auto-turn goes the same way", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desk", "a drag by a mouse, once, at a desk's width");
    // A card is flat, so its front face is on the axis and does not move as it turns. A very thick one (60 mm: its front is a hand's width in front of the axis) shows which way the
    // front surface goes: the family's shared check (kazoku-ui's e2e-ground) slides the middle of a picture over another and is made for a globe.
    await open(page, "/?thickness=60&card-spin=&wear=");
    await drawn(page);
    const front = () =>
      page.evaluate(() => {
        const box = document.getElementById("card").shadowRoot.querySelector(".card > .front").getBoundingClientRect();
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      });
    const stage = await page.locator("#stage").boundingBox();
    const middle = { x: stage.x + stage.width / 2, y: stage.y + stage.height / 2 };
    const drag = async (dx, dy) => {
      await page.mouse.move(middle.x, middle.y);
      await page.mouse.down();
      for (let step = 1; step <= 10; step += 1)
        await page.mouse.move(middle.x + (dx * step) / 10, middle.y + (dy * step) / 10);
      await page.mouse.up();
    };
    const rest = await front();
    await drag(60, 0);
    const right = await front();
    expect(right.x - rest.x, "a drag right moves the front surface right").toBeGreaterThan(4);
    expect(Math.abs(right.y - rest.y), "and not up or down").toBeLessThan(4);
    await page.locator("#view").evaluate((view) => view.set({ yaw: 0, tilt: 0 }));
    await drag(0, -150);
    const up = await front();
    expect(up.y - rest.y, "a drag up moves the front surface up").toBeLessThan(-3);
    expect(Math.abs(up.x - rest.x), "and not sideways").toBeLessThan(4);
    await page.locator("#view").evaluate((view) => view.set({ yaw: 0, tilt: 0 }));
    await page.locator("#stage").focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect((await front()).x - rest.x, "the right arrow moves it right").toBeGreaterThan(2);
    await page.locator("#view").evaluate((view) => view.set({ yaw: 0, tilt: 0 }));
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    expect((await front()).y - rest.y, "the up arrow moves it up").toBeLessThan(-0.5);
    await page.locator("#view").evaluate((view) => view.set({ yaw: 0, tilt: 0 }));
    await page
      .locator("#view")
      .getByRole("button", { name: /Auto-turn|自動回転/ })
      .first()
      .click();
    // 12 degrees a second only moves the front a couple of pixels in the first second when frames are scarce, so wait until it has clearly gone, and not past six seconds.
    await page.waitForFunction(
      (startX) => {
        const box = document.getElementById("card").shadowRoot.querySelector(".card > .front").getBoundingClientRect();
        const yaw = document.getElementById("view").state.yaw;
        return yaw > 0 && box.x + box.width / 2 - startX > 10;
      },
      rest.x,
      { timeout: 6000 },
    );
    const yaw = await page.locator("#view").evaluate((view) => view.state.yaw);
    expect(yaw, "Auto-turn raises the angle, the same way a drag right does").toBeGreaterThan(0);
    expect((await front()).x - rest.x, "and the front has moved right").toBeGreaterThan(10);
  });
});

test.describe("the Builder", () => {
  test("every setting is reached by a tab, the code follows the choices and the setup is in the address", async ({
    page,
  }) => {
    const errors = await open(page, "/builder.html");
    await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
    expect(await fits(page)).toBe(true);
    await expect(page.locator("#bld-code")).toContainText("<fuda-card");
    await page.locator("#opt-tab-look").click();
    await page.locator('[data-option="variant"] button[data-value="sport"]').click();
    await expect(page.locator("#bld-code")).toContainText('variant="sport"');
    await page.waitForFunction(() => /variant=sport/.test(location.hash));
    for (const format of ["iframe", "react", "vue", "svelte", "angular", "module", "url"]) {
      await page.locator(`#bld-tab-${format}`).click();
      await expect(page.locator("#bld-code")).not.toHaveText("");
    }
    await page.locator("#bld-tab-iframe").click();
    await expect(page.locator("#bld-code")).toContainText("demo/embed.html?");
    await page.locator('#bld-makers button[data-maker="collection"]').click();
    await expect(page.locator("#bld-stage fuda-collection")).toBeVisible();
    await page.locator("#bld-tab-element").click();
    await expect(page.locator("#bld-code")).toContainText("<fuda-collection");
    expect(await page.locator("details, summary").count(), "nothing folds open").toBe(0);
    expect(errors).toEqual([]);
  });
});

test.describe("the embed pages", () => {
  test("a card from its address: the settings and the picture are the address's, and nothing else is on the page", async ({
    page,
  }) => {
    const errors = await open(
      page,
      "/demo/embed.html?title=Explorer+One&variant=sport&finish=matte&stack=10&wear=mint",
    );
    await page.waitForFunction(() => document.querySelector("fuda-card")?.shadowRoot?.querySelector(".front"));
    await expect(page.locator("fuda-card")).toHaveAttribute("variant", "sport");
    await expect(page.locator("fuda-card")).toHaveAttribute("stack", "10");
    expect(await page.locator("body > *:not(script)").count()).toBe(1);
    expect(await fits(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("a collection from its address", async ({ page }) => {
    const errors = await open(page, "/demo/embed-collection.html?view=binder&cover=navy");
    await page.waitForFunction(() => document.querySelector("fuda-collection")?.shadowRoot?.querySelector(".book"));
    await expect(page.locator("fuda-collection")).toHaveAttribute("cover", "navy");
    expect(await fits(page)).toBe(true);
    expect(errors).toEqual([]);
  });
});
