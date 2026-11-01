// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg' };
let chromium;
try {
  const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
  ({ chromium } = require('playwright'));
} catch {}

const sizes = [['desktop', { width: 1280, height: 800 }], ['mobile', { width: 390, height: 844 }]];

test('corner spin keeps the corner at the stage centre, full size, with zoom', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = createServer(async (req, res) => {
    const url = req.url.split('?')[0], path = url === '/' ? '/index.html' : url;
    try { res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'text/plain' }).end(await readFile(resolve(root, '.' + path))); }
    catch { res.writeHead(404).end(); }
  }).listen(8071, '127.0.0.1');
  try {
    for (const [name, size] of sizes) {
      const p = await browser.newPage({ viewport: size });
      await p.goto('http://127.0.0.1:8071/');
      await p.waitForFunction(() => customElements.get('fuda-card') && customElements.get('kazoku-view-controls') && document.querySelector('#view').state);
      await p.selectOption('#card-spin', 'corner');
      const bar = await p.evaluate(() => document.querySelector('#view').getBoundingClientRect().bottom);
      assert.ok(bar <= size.height, `${name}: the view controls are below the first screen (${bar}px)`);

      const sweep = () => p.evaluate(() => {
        const stage = document.querySelector('#stage'), view = document.querySelector('#view'), host = document.querySelector('#card');
        const card = host.shadowRoot.querySelector('.card'), probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;left:0;bottom:0;width:0;height:0';
        card.append(probe);
        const box = stage.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
        const off = [], overflow = [], faces = new Set();
        for (let i = 0; i < 72; i++) {
          view.set({ yaw: -180 + (360 * i) / 72 });
          const pt = probe.getBoundingClientRect(), r = card.getBoundingClientRect();
          off.push(Math.hypot(pt.left - cx, pt.top - cy));
          overflow.push(Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom));
          faces.add(new DOMMatrix(getComputedStyle(host.shadowRoot.querySelector('.rotation')).transform).m33 >= 0 ? 'front' : 'back');
        }
        probe.remove();
        view.set({ yaw: 0 });
        return { off, overflow, faces: [...faces], width: host.offsetWidth, height: host.offsetHeight };
      });
      const opening = await p.evaluate(() => ({ zoom: document.querySelector('#view').state.zoom, width: document.querySelector('#card').getBoundingClientRect().width }));
      assert.ok(opening.zoom > 1, `${name}: the studio must not open at Fit (zoom ${opening.zoom})`);
      assert.ok(Math.abs(opening.width - 300) <= 1, `${name}: the card must open at full size, not ${opening.width}px wide`);
      await p.getByRole('button', { name: 'Fit' }).click();
      const fit = await sweep();
      assert.ok(Math.max(...fit.off) <= 1, `${name}: the corner is ${Math.max(...fit.off)}px from the stage centre`);
      assert.equal(fit.width, 300, `${name}: the card must stay full size`);
      assert.ok(Math.max(...fit.overflow) <= 1, `${name}: the card leaves the stage by ${Math.max(...fit.overflow)}px at Fit`);
      assert.deepEqual(fit.faces.sort(), ['back', 'front'], `${name}: both faces must turn toward the viewer`);

      const zoom = () => p.evaluate(() => document.querySelector('#view').state.zoom);
      await p.getByRole('button', { name: 'Zoom in' }).click();
      const zin = await zoom();
      assert.ok(zin > 1, `${name}: Zoom in did nothing`);
      assert.ok(Math.max(...(await sweep()).off) <= 1, `${name}: the corner moved when zoomed in`);
      await p.getByRole('button', { name: 'Zoom out' }).click();
      await p.getByRole('button', { name: 'Zoom out' }).click();
      assert.ok(await zoom() < 1, `${name}: Zoom out must go below Fit`);
      await p.getByRole('button', { name: 'Zoom to 2 times' }).click();
      assert.equal(await zoom(), 2, `${name}: 2x`);
      await p.getByRole('button', { name: 'Fit' }).click();
      assert.equal(await zoom(), 1, `${name}: Fit must return to 1`);
      const box = await p.locator('#stage').boundingBox();
      await p.keyboard.down('Control');
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await p.mouse.wheel(0, -300);
      await p.keyboard.up('Control');
      assert.ok(await zoom() > 1, `${name}: Ctrl+wheel must zoom`);
      await p.getByRole('button', { name: 'Fit' }).click();

      await p.getByRole('button', { name: /Animate/ }).click();
      assert.equal(await p.evaluate(() => document.querySelector('#card').hasAttribute('playing')), true, `${name}: the card's Animate button must still work on the stage`);

      await p.getByRole('button', { name: 'Auto-turn' }).click();
      const turned = await p.waitForFunction(() => Math.abs(document.querySelector('#view').state.yaw) > 0.5, null, { timeout: 5000 }).then(() => true);
      assert.ok(turned, `${name}: Auto-turn did not turn`);
      await p.getByRole('button', { name: 'Zoom in' }).click();
      assert.equal(await p.evaluate(() => document.querySelector('#view').state.turning), true, `${name}: a control stopped the turn`);
      await p.close();

      const a = await browser.newPage({ viewport: size });
      await a.goto('http://127.0.0.1:8071/?zoom=2');
      await a.waitForFunction(() => document.querySelector('#view').state);
      await a.selectOption('#card-spin', 'corner');
      assert.equal(await a.evaluate(() => document.querySelector('#view').state.zoom), 2, `${name}: an address zoom must win over the default`);
      await a.close();

      const q = await browser.newPage({ viewport: size, reducedMotion: 'reduce' });
      await q.goto('http://127.0.0.1:8071/');
      await q.waitForFunction(() => document.querySelector('#view').state);
      await q.selectOption('#card-spin', 'corner');
      const still = await q.evaluate(() => ({ turning: document.querySelector('#view').state.turning, animations: document.querySelector('#card').shadowRoot.querySelector('.rotation').getAnimations().length }));
      assert.deepEqual(still, { turning: false, animations: 0 }, `${name}: reduced motion must leave the card still`);
      await q.close();
    }
  } finally { await browser.close(); server.close(); }
});
