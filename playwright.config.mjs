// The demo's own tests: a real browser, real taps, at a phone's width and a desk's. `pnpm test:demo` builds the site and the docs and runs them. Chromium draws in software
// (the family's rule: never on the machine's graphics card); WebKit has no such switch, so it runs on CI only.
import process from "node:process";

import { defineConfig, devices } from "@playwright/test";

const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const SOFTWARE_GL_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const software = { launchOptions: { args: SOFTWARE_GL_ARGS } };

export default defineConfig({
  testDir: "e2e",
  testMatch: ["*.demo.mjs"],
  fullyParallel: true,
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : 1,
  timeout: Number(process.env.FUDA_E2E_TIMEOUT_MS) || 60_000,
  reporter: "list",
  use: { reducedMotion: "no-preference", locale: "en-US" },
  projects: [
    { name: "chromium-phone", use: { ...devices["Desktop Chrome"], ...phone, ...software } },
    { name: "chromium-desk", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, ...software } },
    // WebKit on a desktop viewport with touch: `isMobile` is Chromium's to honour. It has no software switch, so it runs on CI only, never on a Mac's graphics card.
    ...(process.env.CI ? [{ name: "webkit-phone", use: { ...devices["Desktop Safari"], viewport: phone.viewport, hasTouch: true } }] : []),
  ],
});
