// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript' };
let chromium;
try {
  const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
  ({ chromium } = require('playwright'));
} catch {}

const page = '<!doctype html><meta name="viewport" content="width=device-width"><body style="margin:0;padding:40px"><fuda-card id="c" card-spin="corner" title="T"></fuda-card><script type="module" src="/dist/element.js"></script>';

test('corner spin keeps the bottom-left corner still and the card in its box', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = createServer(async (req, res) => {
    if (req.url === '/') return res.writeHead(200, { 'Content-Type': 'text/html' }).end(page);
    try { res.writeHead(200, { 'Content-Type': types[extname(req.url)] ?? 'text/plain' }).end(await readFile(resolve(root, '.' + req.url))); }
    catch { res.writeHead(404).end(); }
  }).listen(8071, '127.0.0.1');
  try {
    for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]]) {
      const p = await browser.newPage({ viewport: size });
      await p.goto('http://127.0.0.1:8071/');
      await p.waitForFunction(() => customElements.get('fuda-card') && document.querySelector('#c').shadowRoot.querySelector('.rotation').getAnimations().length === 1);
      const result = await p.evaluate(() => {
        const host = document.querySelector('#c'), rot = host.shadowRoot.querySelector('.rotation'), card = host.shadowRoot.querySelector('.card');
        const probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;left:0;bottom:0;width:0;height:0';
        card.append(probe);
        const anim = rot.getAnimations()[0];
        anim.pause();
        const duration = anim.effect.getTiming().duration;
        const box = host.getBoundingClientRect(), corners = [], overflow = [], faces = new Set();
        for (let i = 0; i < 72; i++) {
          anim.currentTime = duration * i / 72;
          const pt = probe.getBoundingClientRect();
          corners.push([pt.left, pt.top]);
          const r = card.getBoundingClientRect();
          overflow.push(Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom));
          const m = new DOMMatrix(getComputedStyle(rot).transform);
          faces.add(m.m33 >= 0 ? 'front' : 'back');
        }
        return { corners, overflow, faces: [...faces], box: { w: box.width, h: box.height } };
      });
      const [x0, y0] = result.corners[0];
      for (const [x, y] of result.corners) { assert.ok(Math.abs(x - x0) < 1 && Math.abs(y - y0) < 1, `${name}: corner moved to ${x},${y} from ${x0},${y0}`); }
      assert.ok(Math.max(...result.overflow) <= 4, `${name}: card leaves its box by ${Math.max(...result.overflow)}px`);
      assert.deepEqual(result.faces.sort(), ['back', 'front'], `${name}: both faces must turn toward the viewer`);
      await p.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await p.evaluate(() => document.querySelector('#c').shadowRoot.querySelector('.rotation').getAnimations().length), 0, `${name}: reduced motion must stop the spin`);
      await p.close();
    }
  } finally { await browser.close(); server.close(); }
});
