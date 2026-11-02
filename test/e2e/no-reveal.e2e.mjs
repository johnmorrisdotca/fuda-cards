// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
// While a page loads, slowly, the art inside a card must never be seen outside the card's frame, nor before the card is ready,
// and no page may shift (CLS). The art is a solid magenta picture the size of the real one, so any unframed pixel is found in a screenshot.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { writeFile } from 'node:fs/promises';
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

// Every other page and display, on a slow network with the cache off: every picture is the same tall magenta art, and a magenta pixel may only be inside a card, a pocket's card or a frame on the page at that moment.
const MAGENTA_SVG = `data:image/svg+xml,${encodeURIComponent(art)}`;
const frameRects = (page) => page.evaluate(() => {
  const roots = [document]; for (const root of roots) for (const el of root.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
  const rects = [];
  for (const root of roots) for (const el of root.querySelectorAll('.card, .art, .plate, dialog[open]')) { const r = el.getBoundingClientRect(); if (r.width && r.height) rects.push({ left: r.left - 3, top: r.top - 3, right: r.right + 3, bottom: r.bottom + 3 }); }
  return { rects, stage: (() => { for (const root of roots) { const st = root.querySelector('.stage'); if (st) { const r = st.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; } } return null; })() };
});
// Magenta pixels outside every box of a list.
const magentaOutside = (scanner, png, boxes) => scanner.evaluate(async ({ b64, boxes }) => {
  const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
  const { data, width } = ctx.getImageData(0, 0, img.width, img.height); let inside = 0, outside = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 180 || data[i + 2] < 180 || data[i + 1] > 90) continue;
    const x = (i / 4) % width, y = Math.floor(i / 4 / width);
    if (boxes.some((b) => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)) inside++; else outside++;
  }
  return { inside, outside };
}, { b64: png.toString('base64'), boxes });

async function filmPage(browser, path, size) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, serviceWorkers: 'block' }), page = await context.newPage(), scanner = await context.newPage();
  await page.bringToFront();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 400 * 1024 / 8 * 10, uploadThroughput: 100 * 1024 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.route(/./, async (route) => {
    const request = route.request();
    if (request.resourceType() === 'image') { await sleep(300); return route.fulfill({ contentType: 'image/svg+xml', body: art }); }
    if (request.resourceType() === 'document') { const response = await route.fetch(); const html = await response.text(); return route.fulfill({ response, body: html.replace(/src="data:image\/[^"]*"/g, `src="${MAGENTA_SVG}"`) }); }
    if (request.url().startsWith('https://api.tcgdex.net')) return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ cards: Array.from({ length: 12 }, (_, i) => ({ id: `base1-${i + 1}`, localId: String(i + 1), name: `Card ${i + 1}`, image: `https://assets.tcgdex.net/en/base/base1/${i + 1}` })) }) });
    return route.continue();
  });
  const frames = [], start = Date.now();
  const going = page.goto(origin + path, { waitUntil: 'commit' }).catch(() => {});
  let done = false; going.then(() => page.waitForLoadState('load')).then(() => sleep(1200)).then(() => { done = true; }).catch(() => { done = true; });
  while (Date.now() - start < 12000 && !done) {
    let png, boxes;
    // Read before and after the picture, because a script may place a card in between: either place is a card's.
    try { const before = await frameRects(page); png = await page.screenshot(); boxes = await frameRects(page); boxes.rects.push(...before.rects); } catch { await sleep(30); continue; }
    frames.push({ t: Date.now() - start, png, boxes });
    await sleep(30);
  }
  await going;
  // The last frame, once the page has had time to show its pictures: the art must be seen at some point, or the film proved nothing.
  await sleep(2000);
  frames.push({ t: Date.now() - start, png: await page.screenshot(), boxes: await frameRects(page) });
  const result = { frames: frames.length, worst: 0, at: 0, shown: 0 };
  for (const f of frames) {
    const m = await magentaOutside(scanner, f.png, f.boxes.rects);
    if (m.outside > result.worst) { result.worst = m.outside; result.at = f.t; result.png = f.png; }
    result.shown = Math.max(result.shown, m.inside);
  }
  await context.close();
  return result;
}

const everyView = ['deck', 'rolodex', 'binder', 'case', 'random', 'story', 'wall', 'spotlight', 'atlas', 'fan'].map((v) => `/demo/collections-component.html?view=${v}`);
test('on a slow network with the cache off, no page and no display shows a picture outside a card, on a desk or a phone', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(port);
  try {
    for (const path of ['/demo/collections.html', '/demo/rolodex.html', '/demo/tcgdex.html', '/demo/live-3d.html', ...everyView]) for (const [device, size] of sizes) {
      const r = await filmPage(browser, path, size), where = `${device} ${path}`;
      console.log(`NO-REVEAL ${where}: ${r.frames} frames, most outside ${r.worst}, most inside ${r.shown}`);
      if (r.worst > 0 && process.env.FUDA_SHOTS) await writeFile(`${process.env.FUDA_SHOTS}/reveal-${device}-${path.replace(/\W+/g, '-')}.png`, r.png);
      assert.ok(r.frames >= 3, `${where}: too few frames captured`);
      assert.equal(r.worst, 0, `${where}: ${r.worst} art pixels outside every card at ${r.at} ms`);
      assert.ok(r.shown > 0, `${where}: the art never showed, so this proves nothing`);
    }
  } finally { await browser.close(); server.close(); }
});

