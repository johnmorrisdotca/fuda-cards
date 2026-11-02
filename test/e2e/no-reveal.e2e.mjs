// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
// While a page loads, slowly, the art inside a card must never be seen outside the card's frame, nor before the card is ready,
// and no page may shift (CLS). The art is a solid magenta picture the size of the real one, so any unframed pixel is found in a screenshot.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, launch, portShift, webkit, launchWebKit, serve, sizes, offline } from './support.mjs';

const port = 8115 + portShift, origin = `http://127.0.0.1:${port}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const art = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465 1165" width="465" height="1165"><rect width="465" height="1165" fill="#ff00ff"/></svg>';
// [script delay, art delay] in ms: a slow script with a fast picture, and a fast script with a slow picture.
const timings = [['slow script', 700, 50], ['slow picture', 50, 900]];

async function load(browser, size, [scriptDelay, artDelay], throttle) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, serviceWorkers: 'block' }), page = await context.newPage();
  await offline(page);
  await page.route(/\/assets\/starship-v3-preview\.jpg$/, async (route) => { await sleep(artDelay); route.fulfill({ contentType: 'image/svg+xml', body: art }); });
  await page.route(/\.js$/, async (route) => { await sleep(scriptDelay); route.continue(); });
  if (throttle) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  const problems = []; page.on('pageerror', (e) => problems.push(e.message));
  return { context, page, problems };
}

// Counts magenta pixels inside and outside a box in a PNG, on a second page of the same browser.
const magenta = (scanner, png, box) => scanner.evaluate(async ({ b64, box }) => {
  const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
  const { data, width } = ctx.getImageData(0, 0, img.width, img.height); let inside = 0, outside = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 180 || data[i + 2] < 180 || data[i + 1] > 90) continue;
    const x = (i / 4) % width, y = Math.floor(i / 4 / width);
    if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) inside++; else outside++;
  }
  return { inside, outside };
}, { b64: png.toString('base64'), box });

const state = (page) => page.evaluate(() => ({ defined: !!customElements.get('fuda-card'), ready: !!document.querySelector('fuda-card')?.shadowRoot?.querySelector('.art.ready') }));

async function film(browser, name, size, [, ...timing], throttle) {
  const { context, page, problems } = await load(browser, size, timing, throttle), scanner = await context.newPage();
  const frames = [], start = Date.now(); let readyFor = 0;
  page.goto(`${origin}/index.html`, { waitUntil: 'commit' }).catch(() => {});
  while (Date.now() - start < 9000 && readyFor < 3) {
    let png, after;
    try { png = await page.screenshot(); after = await state(page); } catch { await sleep(20); continue; }
    frames.push({ t: Date.now() - start, png, ...after }); readyFor = after.ready ? readyFor + 1 : 0;
    await sleep(40);
  }
  await page.waitForLoadState('load'); await sleep(700);
  const box = await page.evaluate(() => { const r = document.querySelector('fuda-card').getBoundingClientRect(); return { left: r.left - 3, top: r.top - 3, right: r.right + 3, bottom: r.bottom + 3 }; });
  const last = await page.screenshot(), settled = await magenta(scanner, last, box), cls = await page.evaluate(() => window.__cls);
  const seen = [];
  for (const f of frames) seen.push({ ...f, ...(await magenta(scanner, f.png, box)) });
  await context.close();
  return { name, seen, settled, cls, problems, last: await state(page).catch(() => null) };
}

for (const [label, available, launcher, why] of [['Chromium', chromium, launch, 'Playwright not installed'], ['WebKit', webkit, launchWebKit, 'WebKit runs only on CI: it has no software drawing']]) {
  test(`${label}: the art is never seen outside the card or before the card is ready`, { skip: !available && why }, async (t) => {
    let browser;
    try { browser = await launcher(); } catch (error) { t.skip(`${label} did not start: ${error.message}`); return; }
    const server = serve(port);
    try {
      for (const [device, size] of sizes) for (const timing of timings) {
        const result = await film(browser, `${label} ${device} ${timing[0]}`, size, timing, label === 'Chromium');
        const where = `${result.name} (${result.seen.length} frames)`; if (process.env.FUDA_DEBUG) console.log(where, result.seen.map((f) => `${f.t}:${f.defined ? (f.ready ? 'R' : 'D') : 'u'}${f.outside + f.inside}`).join(' '));
        assert.ok(result.seen.length >= 3, `${where}: too few frames captured`);
        for (const f of result.seen) {
          assert.equal(f.outside, 0, `${where}: ${f.outside} art pixels outside the card's frame at ${f.t} ms`);
          if (!f.ready) assert.equal(f.inside, 0, `${where}: art shown before the card was ready (defined: ${f.defined}) at ${f.t} ms`);
        }
        if (label === 'Chromium') assert.ok(result.settled.inside > 1000, `${where}: the art never appears inside the card`);
        assert.equal(result.settled.outside, 0, `${where}: art outside the frame once loaded`);
        assert.ok(result.cls < 0.03, `${where}: layout shifted (CLS ${result.cls.toFixed(3)})`);
        assert.deepEqual(result.problems, [], `${where}: the page raised errors`);
      }
    } finally { await browser.close(); server.close(); }
  });
}

test('no demo page shifts while it loads, on a desk and a phone, with a slow script', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(port);
  try {
    for (const path of ['/index.html', '/demo/collections-component.html', '/demo/collections.html', '/demo/tcgdex.html', '/demo/rolodex.html']) for (const [device, size] of sizes) {
      const { context, page, problems } = await load(browser, size, [600, 50], true);
      await page.goto(`${origin}${path}`); await sleep(1500);
      const cls = await page.evaluate(() => window.__cls);
      assert.ok(cls < 0.03, `${device} ${path}: layout shifted (CLS ${cls.toFixed(3)})`);
      assert.deepEqual(problems, [], `${device} ${path}: the page raised errors`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});
