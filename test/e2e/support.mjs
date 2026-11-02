// Shared by the browser tests: a static server for the repository and offline stand-ins for the card images and the TCGdex service.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

export const root = resolve(import.meta.dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary' };
export let chromium, webkit;
try {
  const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
  ({ chromium, webkit } = require('playwright'));
} catch {}

// A test run on a Mac's own GPU once panicked its graphics driver (2026-11-02). Every browser of these tests is headless and draws in software, and a test
// starts one only through launch() below. test/e2e-safety.test.mjs fails when a file does otherwise. WebKit has no software switch, so it runs only on CI.
export const SOFTWARE_GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
/** No browser outlives this; a test that needs longer is too long. */
export const BROWSER_LIFE_MS = Number(process.env.FUDA_BROWSER_LIFE_MS) || 5 * 60_000;
if (!process.env.CI) webkit = undefined;
delete process.env.PWDEBUG; // It would open a window.

const hardStop = (browser, label) => {
  const stop = setTimeout(() => { console.error(`${label}: stopped after ${BROWSER_LIFE_MS} ms`); browser.close().catch(() => {}); }, BROWSER_LIFE_MS);
  stop.unref();
  browser.on('disconnected', () => clearTimeout(stop));
};

/** What WebGL draws on in this browser, as the browser says it. */
export async function glRenderer(browser) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl');
      if (!gl) return 'no WebGL';
      const info = gl.getExtension('WEBGL_debug_renderer_info'), name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return String(name);
    });
  } finally { await page.close(); }
}

/** The one way these tests start Chromium: headless, drawing in software, checked to be so before anything is driven, with a hard limit on its life. */
export async function launch() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM, args: SOFTWARE_GL_ARGS });
  hardStop(browser, 'Chromium');
  const renderer = await glRenderer(browser);
  if (!/swiftshader/i.test(renderer)) { await browser.close(); throw new Error(`Refusing to drive a browser that does not draw in software: ${renderer}`); }
  return browser;
}

/** WebKit, on CI only: on a Mac it draws on the machine's GPU and has no switch to stop it. */
export async function launchWebKit() {
  if (!process.env.CI || !webkit) throw new Error('WebKit runs only on CI');
  const browser = await webkit.launch({ headless: true });
  hardStop(browser, 'WebKit');
  return browser;
}

// The tests' ports are 8110-8119 of the repo's block; a second session running them moves its own set with this (20 gives 8130-8139).
export const portShift = Number(process.env.FUDA_E2E_PORT_SHIFT) || 0;

export const sizes = [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]];

export function serve(port) {
  return createServer(async (req, res) => {
    const url = req.url.split('?')[0], path = url === '/' ? '/index.html' : url;
    try { res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'text/plain' }).end(await readFile(resolve(root, '.' + path))); }
    catch { res.writeHead(404).end(); }
  }).listen(port, '127.0.0.1');
}

const hues = [0, 35, 60, 120, 170, 200, 240, 280, 320, 15, 90, 260];
export const cardSvg = (label) => {
  const n = Number(String(label).replace(/\D/g, '')) || 0, hue = hues[n % hues.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 337" width="245" height="337"><rect width="245" height="337" rx="12" fill="hsl(${hue} 60% 30%)"/><rect x="12" y="12" width="221" height="313" rx="8" fill="none" stroke="hsl(${hue} 80% 75%)" stroke-width="4"/><circle cx="122" cy="140" r="60" fill="hsl(${hue} 70% 60%)"/><text x="122" y="285" font-size="34" text-anchor="middle" fill="#fff" font-family="sans-serif">${label}</text></svg>`;
};

/** Wait at least `ms`, then until nothing animates in the page or its shadow roots (at most 15 s more, then go on: the test's own check says what is still running). On a busy machine a fixed wait ends in the middle of a move. */
export async function quiet(page, ms = 0) {
  if (ms) await page.waitForTimeout(ms);
  await page.waitForFunction(() => {
    const roots = [document], running = (root) => root.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity);
    for (const root of roots) for (const el of root.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
    return !roots.some(running);
  }, null, { timeout: 15000 }).catch(() => {});
}

/** Answer every outside request from the page with local stand-ins, so the tests need no network. */
export async function offline(page) {
  await page.route(/^https:\/\/(assets\.tcgdex\.net|cdn\.jsdelivr\.net|commons\.wikimedia\.org|images\.metmuseum\.org)\//, (route) => {
    const id = route.request().url().match(/base1\/(\d+)/)?.[1] ?? route.request().url().length;
    route.fulfill({ contentType: 'image/svg+xml', body: cardSvg(`No. ${id}`) });
  });
  await page.route('https://api.tcgdex.net/**', (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ cards: Array.from({ length: 12 }, (_, i) => ({ id: `base1-${i + 1}`, localId: String(i + 1), name: `Card ${i + 1}`, image: `https://assets.tcgdex.net/en/base/base1/${i + 1}` })) })
  }));
}

/** Choose a value of a control the demos draw as a row of buttons (the select stays in the page, hidden), or of a plain select. */
export async function choose(page, id, value) {
  const button = page.locator(`#${id}`).locator('xpath=..').locator(`button[data-value="${value}"]`);
  if (await button.count()) await button.click(); else await page.selectOption(`#${id}`, value);
}
