// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, webkit, serve, sizes } from './support.mjs';

/** True when a screenshot shows a translateZ child where the layout puts it (depth is painted), false when the engine paints it flat. */
async function engineDrawsDepth(p) {
  const at = await p.evaluate(async () => {
    const probe = document.createElement('div');
    probe.id = 'depth-probe';
    probe.style.cssText = 'position:fixed;left:0;top:0;width:100px;height:100px;perspective:600px;z-index:9;background:#fff';
    probe.innerHTML = '<div style="position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(60deg)"><i style="position:absolute;left:40px;top:40px;width:20px;height:20px;background:#f00;transform:translateZ(150px)"></i></div>';
    document.body.append(probe);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const r = probe.querySelector('i').getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  const png = await p.screenshot({ clip: { x: 0, y: 0, width: Math.max(120, Math.ceil(at.x) + 40), height: 120 }, animations: 'disabled' });
  const red = await p.evaluate(async ({ b64, at }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const [r, gr, b] = g.getImageData(Math.round(at.x), Math.round(at.y), 1, 1).data;
    return r > 200 && gr < 80 && b < 80;
  }, { b64: png.toString('base64'), at });
  await p.evaluate(() => document.querySelector('#depth-probe').remove());
  return red;
}

// WebKit's screenshots (Playwright's, at least) draw preserve-3d flat and ignore backface-visibility, so the pixel checks of the edge only run where the engine paints depth; every other check runs in both engines.
for (const [engine, type] of [['chromium', chromium], ['webkit', webkit]]) test(`${engine}: a turned card shows its front or its back, never the mirrored one, and has a true-scale edge`, { skip: !type && 'Playwright not installed' }, async () => {
  const browser = await type.launch({ executablePath: engine === 'chromium' ? process.env.PLAYWRIGHT_CHROMIUM : undefined });
  const server = serve(8072);
  try {
    for (const [sizeName, size] of sizes) {
      const name = `${engine} ${sizeName}`;
      const p = await browser.newPage({ viewport: size, deviceScaleFactor: 2 });
      await p.goto('http://127.0.0.1:8072/');
      await p.waitForFunction(() => customElements.get('fuda-card') && customElements.get('kazoku-view-controls') && document.querySelector('#view').state);
      const turn = (yaw) => p.evaluate(async (y) => { document.querySelector('#view').set({ yaw: y, tilt: 0 }); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); }, yaw);
      const box = async () => {
        const r = await p.evaluate(() => { const r = document.querySelector('#card').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
        return { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: Math.min(size.width, r.width + 40), height: Math.min(size.height, r.height + 40) };
      };
      const shot = async (hide) => {
        await p.evaluate((css) => { document.querySelector('#card').shadowRoot.querySelector('#test-hide')?.remove(); if (css) { const s = document.createElement('style'); s.id = 'test-hide'; s.textContent = css; document.querySelector('#card').shadowRoot.append(s); } }, hide);
        return p.screenshot({ clip: await box(), animations: 'disabled' });
      };
      await p.evaluate(() => document.querySelector('#card').setAttribute('card-spin', 'center'));

      const paints3d = await engineDrawsDepth(p);
      const facing = (yaw) => p.evaluate(() => { const c = document.querySelector('#card'), r = c.getBoundingClientRect(); return c.shadowRoot.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).map((e) => e.className); });
      const visible = (sel) => p.evaluate((sel) => getComputedStyle(document.querySelector('#card').shadowRoot.querySelector(sel)).visibility !== 'hidden', sel);

      // The front is shown from -80 to 80 degrees: nothing of the back is drawn, so hiding it changes no pixel, and the front is not hidden.
      for (const yaw of [0, 35, 80, 280, 350]) {
        await turn(yaw);
        assert.equal(await visible('.front'), true, `${name} ${yaw}: the front is hidden`);
        assert.equal(await visible('.back'), false, `${name} ${yaw}: the back is shown over the front`);
        const hit = await facing(yaw);
        assert.ok(hit.includes('face front'), `${name} ${yaw}: the front is not hit (${hit})`);
        const withBack = await shot(''), noBack = await shot('.back{display:none}');
        assert.ok(withBack.equals(noBack), `${name} ${yaw}: the back is drawn over the front`);
      }
      await p.evaluate(() => document.querySelector('#card').shadowRoot.querySelector('#test-hide')?.remove());

      // The back is shown from 100 to 260 degrees: nothing of the front is drawn, so hiding it changes no pixel.
      for (const yaw of [100, 140, 180, 220, 260]) {
        await turn(yaw);
        const hit = await p.evaluate(() => { const c = document.querySelector('#card'), r = c.getBoundingClientRect(); return c.shadowRoot.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2).map((e) => e.className); });
        assert.ok(!hit.some((c) => /front|inner|motion-button/.test(c)), `${name} ${yaw}: the front takes hits (${hit})`);
        if (yaw >= 140 && yaw <= 220) assert.ok(hit.includes('face back'), `${name} ${yaw}: the back is not shown (${hit})`);
        const withFront = await shot(''), noFront = await shot('.front{display:none}');
        assert.ok(withFront.equals(noFront), `${name} ${yaw}: front glyphs are drawn behind the back`);
      }

      await p.evaluate(() => document.querySelector('#card').shadowRoot.querySelector('#test-hide')?.remove());

      // Animate cannot be reached from behind, and still works from the front.
      await p.evaluate(() => document.querySelector('#card').removeAttribute('playing'));
      await turn(180);
      const button = () => p.evaluate(() => { const r = document.querySelector('#card').shadowRoot.querySelector('.motion-button').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      let pt = await button();
      assert.ok(await p.evaluate(({ x, y }) => !document.querySelector('#card').shadowRoot.elementsFromPoint(x, y).some((e) => e.classList.contains('motion-button')), pt), `${name}: Animate is hit from behind`);
      await p.mouse.click(pt.x, pt.y);
      assert.equal(await p.evaluate(() => document.querySelector('#card').hasAttribute('playing')), false, `${name}: Animate took a click from behind`);
      await turn(0);
      pt = await button();
      await p.mouse.click(pt.x, pt.y);
      assert.equal(await p.evaluate(() => document.querySelector('#card').hasAttribute('playing')), true, `${name}: Animate does not work from the front`);
      await p.evaluate(() => document.querySelector('#card').removeAttribute('playing'));

      // Thickness: 0.3 mm at the 63 mm wide card size by default, in mm through the thickness attribute.
      const edge = (t) => p.evaluate((t) => {
        const c = document.querySelector('#card');
        if (t === null) c.removeAttribute('thickness'); else c.setAttribute('thickness', t);
        const side = [...c.shadowRoot.querySelectorAll('.edge')].find((e) => e.style.left === '100%' && e.style.top === '50%');
        return { thick: parseFloat(getComputedStyle(side).width), card: c.offsetWidth };
      }, t);
      const dflt = await edge(null);
      assert.ok(Math.abs(dflt.thick - (0.3 * dflt.card) / 63) < 0.02, `${name}: default edge is ${dflt.thick}px at ${dflt.card}px`);
      assert.ok(Math.abs((await edge('1.5')).thick - (1.5 * dflt.card) / 63) < 0.02, `${name}: thickness 1.5 mm`);
      assert.equal((await edge('0')).thick, 0, `${name}: thickness 0 is flat`);
      await edge(null);

      // Edge-on at 90 degrees: the edge has width and is drawn without a gap from corner to corner.
      await turn(90);
      const on = await p.evaluate(() => {
        const side = [...document.querySelector('#card').shadowRoot.querySelectorAll('.edge')].map((e) => e.getBoundingClientRect()).sort((a, b) => b.height - a.height)[0];
        return { width: side.width, height: side.height, x: side.x, y: side.y };
      });
      assert.ok(on.width > 0, `${name}: the edge has no width at 90 degrees`);
      if (!paints3d) { await p.close(); continue; }
      const withEdge = await shot(''), without = await shot('.edge{display:none}');
      assert.ok(!withEdge.equals(without), `${name}: the edge draws nothing at 90 degrees`);
      const covered = await p.evaluate(async ({ b64, y, height, clip }) => {
        const stage = document.querySelector('#stage').getBoundingClientRect();
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const data = g.getImageData(0, 0, c.width, c.height).data, bg = [data[0], data[1], data[2]];
        let best = 0;
        for (let col = 0; col < c.width; col++) { let n = 0; for (let row = 0; row < c.height; row++) { const i = (row * c.width + col) * 4; if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 30) n++; } best = Math.max(best, n); }
        const rows = Math.min(y + height, stage.bottom, clip.y + clip.height) - Math.max(y, stage.top, clip.y);
        return best / (rows * 2);
      }, { b64: withEdge.toString('base64'), ...on, clip: await box() });
      assert.ok(covered >= 0.97, `${name}: the edge has a gap (${Math.round(covered * 100)}% drawn)`);
      await p.close();
    }
  } finally { await browser.close(); server.close(); }
});
