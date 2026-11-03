// Takes the pictures the README and the guides show: `pnpm screenshots:readme` (builds the demo site first, then runs this).
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp. Nothing is fetched from the network: the card pictures the demos ask
// other sites for are answered with local stand-ins, and the page is served from site/ on this checkout's own port (8102 of the
// repo's block). The browser is the tests' own `launch()`: headless and drawing in software, never on the machine's GPU.
// A shot waits on what the page draws (a selector or a function), never on a clock, and motion is reduced so each picture is the same every run.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import { launch, serve, offline, quiet, root } from '../test/e2e/support.mjs';

const PORT = Number(process.env.FUDA_PICTURE_PORT) || 8102;
const out = join(root, 'docs', 'images');
const VIEWS = {
  desk: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, hasTouch: false, isMobile: false },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
};
const BUDGET = { desk: 220 * 1024, phone: 160 * 1024 };

const collectionReady = (page) => page.waitForFunction(() => {
  const c = document.querySelector('fuda-collection');
  return c?.shadowRoot?.querySelector('kazoku-view-controls')?.state && [...c.shadowRoot.querySelectorAll('img')].length > 0 && [...c.shadowRoot.querySelectorAll('img')].every((i) => i.complete);
});
const studioReady = (page) => page.waitForFunction(() => document.querySelector('#view')?.state && document.querySelector('fuda-card')?.shadowRoot && [...document.querySelectorAll('fuda-card img')].every((i) => i.complete));
const setCard = (attributes) => (page) => page.evaluate((attrs) => { const card = document.querySelector('#card'); for (const [k, v] of Object.entries(attrs)) v === null ? card.removeAttribute(k) : card.setAttribute(k, v); }, attributes);
// Stop the card turning by itself and set a fixed angle, so a picture is the same each time.
const still = (yaw = '-24deg', tilt = '8deg') => async (page) => {
  await page.evaluate(([y, t]) => { const card = document.querySelector('#card'); card.removeAttribute('card-spin'); card.removeAttribute('motion'); card.style.setProperty('--fuda-yaw', y); card.style.setProperty('--fuda-tilt', t); }, [yaw, tilt]);
};
const studio = (query = '') => `/index.html?${query}`;
const collection = (query) => `/demo/collections-component.html?${query}`;

const SHOTS = [
  { subject: 'studio', views: ['desk', 'phone'], url: studio(), ready: studioReady, prepare: still(), target: null },
  { subject: 'wear', views: ['desk'], url: studio('wear=heavily-played&wear-seed=7'), ready: studioReady, prepare: still('-12deg', '4deg'), target: '#stage' },
  { subject: 'stack', views: ['desk'], url: studio('material=paper-310-black-core&stack=52&stack-messiness=0.6&stack-seed=7'), ready: studioReady, prepare: still('-35deg', '28deg'), target: '#stage' },
  { subject: 'fan', views: ['desk'], url: studio('stack=52&fan=open'), ready: studioReady, prepare: still('0deg', '0deg'), target: '#stage' },
  { subject: 'thick', views: ['phone'], url: studio('material=card-180pt&stack=10&stack-seed=3'), ready: studioReady, prepare: still('-50deg', '12deg'), target: '#stage' },
  { subject: 'binder', views: ['desk', 'phone'], url: collection('view=binder&binder=ring&cover=green'), ready: collectionReady, target: 'fuda-collection' },
  { subject: 'deck', views: ['desk'], url: collection('view=deck&deck-land=face-down'), ready: collectionReady, target: 'fuda-collection' },
  { subject: 'wall', views: ['desk'], url: collection('view=wall'), ready: collectionReady, target: 'fuda-collection' },
  { subject: 'rolodex', views: ['phone'], url: collection('view=rolodex'), ready: collectionReady, target: 'fuda-collection' },
  { subject: 'vintage', views: ['desk'], url: '/demo/vintage.html?view=case', ready: collectionReady, target: 'fuda-collection' },
];

mkdirSync(out, { recursive: true });
if (!existsSync(join(root, 'site', 'index.html'))) throw new Error('site/ is not built: run `pnpm screenshots:readme`');
const only = process.env.ONLY?.split(',');
const server = serve(PORT, join(root, 'site'));
const browser = await launch();
const written = [], failures = [];

/** Lossy WebP from the browser's own encoder, so nothing beyond Playwright is needed. */
async function toWebp(page, png) {
  const base64 = await page.evaluate(async ({ base64, quality }) => {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/webp', quality });
    const reader = new FileReader();
    const done = new Promise((resolve) => { reader.onloadend = () => resolve(String(reader.result).split(',')[1]); });
    reader.readAsDataURL(blob);
    return done;
  }, { base64: png.toString('base64'), quality: 0.82 });
  return Buffer.from(base64, 'base64');
}

try {
  for (const shot of SHOTS) {
    if (only && !only.includes(shot.subject)) continue;
    for (const view of shot.views) for (const scheme of ['light', 'dark']) {
      const context = await browser.newContext({ ...VIEWS[view], colorScheme: scheme, reducedMotion: 'reduce', locale: 'en-US', timezoneId: 'UTC' });
      const page = await context.newPage();
      try {
        await offline(page);
        const url = `http://127.0.0.1:${PORT}${shot.url}${shot.url.includes('?') ? '&' : '?'}theme=${scheme}`;
        await page.goto(url);
        await shot.ready(page);
        if (shot.prepare) await shot.prepare(page);
        await quiet(page, 400);
        await page.mouse.move(0, 0);
        const png = shot.target ? await page.locator(shot.target).first().screenshot({ animations: 'disabled' }) : await page.screenshot({ animations: 'disabled' });
        const webp = await toWebp(page, png);
        const file = `${shot.subject}-${view}-${scheme}.webp`;
        if (webp.length > BUDGET[view]) failures.push(`${file} is ${Math.round(webp.length / 1024)} KB; the budget is ${BUDGET[view] / 1024} KB`);
        writeFileSync(join(out, file), webp);
        written.push(file);
        console.log(`${file.padEnd(34)} ${String(Math.round(webp.length / 1024)).padStart(4)} KB`);
      } catch (error) {
        failures.push(`${shot.subject} ${view} ${scheme}: ${error.message.split('\n')[0]}`);
      } finally { await context.close(); }
    }
  }
} finally { await browser.close(); server.close(); }
if (!only) for (const file of readdirSync(out)) if (!written.includes(file) && /\.(webp|png)$/.test(file)) { rmSync(join(out, file)); console.log(`removed ${file}: no shot makes it`); }
console.log(`${written.length} pictures in docs/images`);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
