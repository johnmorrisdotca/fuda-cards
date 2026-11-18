// The family's gesture check (kazoku-ui's checkGestures) on the Card Studio's card: the bar under the stage owns the hands. Every gesture is done with a real mouse, key
// or two fingers and must change the view as the family's rule says. `pnpm test:demo` builds the site and runs it.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { checkGestures } from "@johnmorrisdotca/kazoku-ui/testing";
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

test.beforeEach(({ viewport }) => {
  test.skip(
    (viewport?.width ?? 1280) <= 640,
    "the gestures are the mouse's and the keyboard's; the phone is checked by the zoom and pinch tests",
  );
});

test("the Card Studio's card answers every gesture", async ({ page }) => {
  // Thirteen gestures, each move photographed in software GL at about a second a picture: 78 s measured on a Mac, so the default 60 s is not a budget for this one.
  test.setTimeout(240_000);
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: `pnpm test:demo` builds it");
  await page.route(`${origin}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, decodeURIComponent(pathname.endsWith("/") ? `${pathname}index.html` : pathname));
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[extname(file)] ?? "application/octet-stream" });
  });
  await page.goto(`${origin}/`);
  await page.waitForFunction(() => {
    const card = document.querySelector("fuda-card");
    return (
      customElements.get("fuda-card") &&
      card?.shadowRoot?.querySelector(".art.ready") &&
      document.getElementById("view")?.state
    );
  });
  const report = await checkGestures(page, "#stage", { window: [0.3, 0.7, 0.55, 0.95] });
  expect(report.filter((r) => r.result === "lacks")).toEqual([]);
});
