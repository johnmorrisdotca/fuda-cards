// Shared by the browser tests: a static server for the repository and offline stand-ins for the card images and the TCGdex service.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

export const root = resolve(import.meta.dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
export let chromium, webkit;
try {
  const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
  ({ chromium, webkit } = require('playwright'));
} catch {}

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

/** Answer every outside request from the page with local stand-ins, so the tests need no network. */
export async function offline(page) {
  await page.route(/^https:\/\/(assets\.tcgdex\.net|cdn\.jsdelivr\.net)\//, (route) => {
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
