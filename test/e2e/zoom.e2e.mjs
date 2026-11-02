// Browser test: run with `pnpm test:e2e` (needs Playwright; skipped when missing).
// Every display view gets Zoom in and out, Fit, Ctrl+wheel, pinch and a drag to move, on a desk and on a phone.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, serve, sizes, offline, choose } from './support.mjs';

const origin = 'http://127.0.0.1:8113';
const views = (process.env.FUDA_VIEWS ?? 'deck,rolodex,binder,case,random,story,wall,spotlight,atlas,fan').split(',');

// Page code that finds the stage and the controls, inside the collection's shadow root when there is one.
const find = `const root = document.querySelector('fuda-collection')?.shadowRoot ?? document; const q = (s) => root.querySelector(s); const all = (s) => [...root.querySelectorAll(s)];`;

const geometry = (p, stage) => p.evaluate(({ stage, find }) => {
  const read = new Function('stage', `${find} const st = q(stage), bar = q('kazoku-view-controls'), box = st.getBoundingClientRect();
    const inner = { left: box.left + st.clientLeft, top: box.top + st.clientTop }; inner.right = inner.left + st.clientWidth; inner.bottom = inner.top + st.clientHeight;
    const cards = all('.card').map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0);
    const outside = Math.max(0, ...cards.map((r) => Math.max(inner.left - r.left, r.right - inner.right, inner.top - r.top, r.bottom - inner.bottom)));
    return { zoom: bar.state.zoom, panX: bar.state.panX, panY: bar.state.panY, outside, cards: cards.length, width: cards[0]?.width ?? 0, barTop: bar.getBoundingClientRect().top, barBottom: bar.getBoundingClientRect().bottom, scrollWidth: document.documentElement.scrollWidth, innerWidth, innerHeight };`);
  return read(stage);
}, { stage, find });

// The middle of the card that shows most inside the stage, as page coordinates.
const aim = (p, stage, cards = '.card') => p.evaluate(({ stage, cards, find }) => new Function('stage', 'cards', `${find} const st = q(stage), b = st.getBoundingClientRect(); let best = null, area = 0;
  for (const c of all(cards)) { const r = c.getBoundingClientRect(), w = Math.min(r.right, b.right) - Math.max(r.left, b.left), h = Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top); if (w > 0 && h > 0 && w * h > area) { area = w * h; best = { x: Math.max(r.left, b.left) + w / 2, y: Math.max(r.top, b.top) + h / 2 }; } }
  return best ?? { x: b.left + b.width / 2, y: b.top + b.height / 2 };`)(stage, cards), { stage, cards, find });

const pinch = (p, stage) => p.evaluate(({ stage, find }) => new Function('stage', `${find} const st = q(stage), target = q('.card') ?? st, r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const fire = (type, id, x) => target.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: cy, bubbles: true, composed: true, cancelable: true }));
  fire('pointerdown', 1, cx - 30); fire('pointerdown', 2, cx + 30); fire('pointermove', 1, cx - 70); fire('pointermove', 2, cx + 70); fire('pointerup', 2, cx + 70); fire('pointerup', 1, cx - 70);`)(stage), { stage, find });

async function exercise(p, name, spec) {
  const here = (msg) => `${name}: ${msg}`;
  const stage = spec.stage, idle = await spec.clicked(p), size = p.viewportSize();
  const bar = (label) => p.getByRole('button', { name: label, exact: true });
  const geo = () => geometry(p, stage);
  const settle = () => p.waitForTimeout(450);
  await settle();

  const opening = await geo();
  assert.ok(opening.cards > 0, here('no cards are drawn'));
  assert.ok(opening.barTop >= 0 && opening.barBottom <= size.height, here(`the view controls are not in the first screen (${opening.barTop}..${opening.barBottom})`));
  assert.ok(opening.scrollWidth <= opening.innerWidth, here(`the page is ${opening.scrollWidth}px wide in a ${opening.innerWidth}px window`));

  await bar('Fit').click();
  const fit = await geo();
  assert.equal(fit.zoom, 1, here('Fit must return to zoom 1'));
  assert.ok(fit.outside <= 2, here(`at Fit a card is ${fit.outside}px outside the view`));

  await bar('Zoom in').click();
  const zin = await geo();
  assert.ok(zin.zoom > 1, here('Zoom in did nothing'));
  assert.ok(Math.abs(zin.width / fit.width - zin.zoom) < 0.05, here(`cards grew ${zin.width / fit.width} times, not ${zin.zoom}`));
  assert.ok(zin.barBottom <= size.height, here(`the controls leave the first screen when zoomed (${zin.barBottom})`));
  assert.ok(zin.scrollWidth <= zin.innerWidth, here('the page grew wider when zoomed'));
  await bar('Zoom in').click();
  await bar('Move left').click();
  assert.ok((await geo()).panX < 0, here('the arrow pad did not move the view'));

  const grab = await aim(p, stage, spec.cards), before = await geo();
  await p.mouse.move(grab.x, grab.y);
  await p.mouse.down();
  await p.mouse.move(grab.x + 40, grab.y + 30, { steps: 4 });
  await p.mouse.up();
  const moved = await geo();
  assert.ok(Math.hypot(moved.panX - before.panX, moved.panY - before.panY) > 20, here('a drag over a card did not move the view'));
  assert.equal(await spec.clicked(p), idle, here('a drag over a card must not click it'));

  await bar('Fit').click();
  const back = await geo();
  assert.equal(back.zoom, 1, here('Fit after + must return to zoom 1'));
  assert.equal(Math.round(back.width), Math.round(fit.width), here('Fit after + must show the cards as before'));
  assert.ok(back.outside <= 2, here(`after + and Fit a card is ${back.outside}px outside the view`));

  await p.keyboard.down('Control');
  await p.mouse.move(grab.x, grab.y);
  await p.mouse.wheel(0, -300);
  await p.keyboard.up('Control');
  assert.ok((await geo()).zoom > 1, here('Ctrl+wheel must zoom'));
  await bar('Fit').click();
  await pinch(p, stage);
  assert.ok((await geo()).zoom > 1, here('a pinch over a card must zoom'));
  await bar('Fit').click();
  await p.locator(stage).focus();
  await p.keyboard.press('+');
  assert.ok((await geo()).zoom > 1, here('the + key must zoom'));
  await p.keyboard.press('0');
  assert.equal((await geo()).zoom, 1, here('the 0 key must return to Fit'));

  const own = await aim(p, stage, spec.cards);
  await p.mouse.click(own.x, own.y);
  assert.notEqual(await spec.clicked(p), idle, here('a click on a card must still reach the card'));
  await spec.dismiss?.(p);

  await bar('Zoom in').click();
  const zoomed = (await geo()).zoom;
  await p.waitForTimeout(400);
  const now = await spec.clicked(p), reach = await aim(p, stage, spec.cards);
  await p.mouse.click(reach.x, reach.y);
  assert.notEqual(await spec.clicked(p), now, here('a click on a zoomed card must still reach the card'));
  await spec.dismiss?.(p);

  if (spec.advance) {
    const first = await spec.read(p);
    await spec.advance(p);
    const second = await spec.read(p);
    assert.notEqual(second, first, here('the view did not move on'));
    assert.equal((await geo()).zoom, zoomed, here('moving on must not reset the zoom'));
    await bar('Zoom in').click();
    assert.equal(await spec.read(p), second, here('zooming must not reset where the view is'));
    await spec.advance(p);
    assert.ok((await geo()).zoom > zoomed, here('moving on must keep the zoom'));
  }
  await bar('Fit').click();
  const end = await geo();
  assert.ok(end.outside <= 2 && end.zoom === 1, here('the last Fit does not show everything'));
  assert.ok(end.scrollWidth <= end.innerWidth, here('the page is wider than the window'));
}

const component = {
  stage: '.stage',
  clicked: (p) => p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('dialog').open),
  dismiss: async (p) => { const open = await p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('dialog').open); if (open) await p.getByRole('button', { name: 'Close', exact: true }).click(); },
  read: (p) => p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('.count').textContent),
  advance: (p) => p.getByRole('button', { name: 'Next →' }).click()
};

async function open(browser, size, path, extra = {}) {
  const p = await browser.newPage({ viewport: size, ...extra });
  const problems = [];
  p.on('pageerror', (e) => problems.push(e.message));
  await offline(p);
  await p.goto(origin + path);
  await p.waitForFunction(() => {
    const root = document.querySelector('fuda-collection')?.shadowRoot ?? document;
    return customElements.get('kazoku-view-controls') && root.querySelector('kazoku-view-controls')?.state && root.querySelector('.card img');
  });
  return { p, problems };
}

test('every collection view zooms, fits, moves and keeps its clicks', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = serve(8113);
  try {
    for (const [device, size] of sizes) {
      const { p, problems } = await open(browser, size, '/demo/collections.html');
      for (const view of views) {
        await p.locator('fuda-collection').locator(`.displays [data-value="${view}"]`).click();
        await exercise(p, `${device} ${view}`, component);
      }
      assert.deepEqual(problems, [], `${device}: the page raised errors`);
      await p.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('the standalone rolodex and the Pokémon binder demo zoom and fit too', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = serve(8113);
  try {
    for (const [device, size] of sizes) {
      const rolodex = await open(browser, size, '/demo/rolodex.html');
      await exercise(rolodex.p, `${device} rolodex demo`, {
        stage: '#stage',
        cards: '.card[aria-label$="select card"]',
        clicked: (p) => p.evaluate(() => document.querySelector('#name').textContent),
        read: (p) => p.evaluate(() => document.querySelector('#name').textContent),
        advance: (p) => p.getByRole('button', { name: 'Next card' }).click()
      });
      assert.deepEqual(rolodex.problems, [], `${device}: the rolodex raised errors`);
      await rolodex.p.close();

      const binder = await open(browser, size, '/demo/tcgdex.html');
      await exercise(binder.p, `${device} Pokémon binder demo`, {
        stage: '#stage',
        clicked: (p) => p.evaluate(() => document.querySelector('dialog').open),
        dismiss: async (p) => { if (await p.evaluate(() => document.querySelector('dialog').open)) await p.getByRole('button', { name: 'Close', exact: true }).click(); },
        read: (p) => p.evaluate(() => document.querySelector('#page').textContent),
        advance: async (p) => { const next = p.getByRole('button', { name: 'Next', exact: true }); await (await next.isEnabled() ? next : p.getByRole('button', { name: 'Previous', exact: true })).click(); }
      });
      assert.deepEqual(binder.problems, [], `${device}: the binder demo raised errors`);
      await binder.p.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('with reduced motion the views do not animate their zoom', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = serve(8113);
  try {
    const { p } = await open(browser, sizes[0][1], '/demo/collections.html', { reducedMotion: 'reduce' });
    const motion = await p.evaluate(() => { const r = document.querySelector('fuda-collection').shadowRoot; return { card: getComputedStyle(r.querySelector('.card')).transitionDuration, view: getComputedStyle(r.querySelector('.v')).transitionDuration, running: r.querySelector('.v').getAnimations({ subtree: true }).length }; });
    assert.deepEqual(motion, { card: '0s', view: '0s', running: 0 });
    await p.getByRole('button', { name: 'Zoom in', exact: true }).click();
    assert.ok(await p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('kazoku-view-controls').state.zoom > 1));
    await p.close();
  } finally { await browser.close(); server.close(); }
});

test('the zoom is kept in the address, and a card opens from the keyboard', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = serve(8113);
  try {
    const { p } = await open(browser, sizes[0][1], '/demo/collections.html?zoom=2');
    const state = () => p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('kazoku-view-controls').state.zoom);
    assert.equal(await state(), 2, 'a zoom in the address must win over the opening view');
    await p.getByRole('button', { name: 'Fit', exact: true }).click();
    await p.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await p.waitForTimeout(500);
    assert.match(new URL(p.url()).search, /zoom=1\.4/);
    await p.locator('fuda-collection button.card, fuda-collection .card[role=button]').first().focus();
    await p.keyboard.press('Enter');
    assert.equal(await p.evaluate(() => document.querySelector('fuda-collection').shadowRoot.querySelector('dialog').open), true, 'Enter on a card must open it');
    await p.close();
  } finally { await browser.close(); server.close(); }
});

test('the full collection demo keeps the view and its controls in the first screen', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
  const server = serve(8113);
  try {
    for (const [device, size] of sizes) {
      const { p, problems } = await open(browser, size, '/demo/collections-component.html');
      for (const view of ['deck', 'binder', 'atlas']) {
        await p.locator('fuda-collection').locator(`.displays [data-value="${view}"]`).click();
        await p.waitForTimeout(300);
        const place = await p.evaluate(() => { const r = document.querySelector('fuda-collection').shadowRoot.querySelector('kazoku-view-controls').getBoundingClientRect(); return { bottom: r.bottom, scrollWidth: document.documentElement.scrollWidth, innerWidth, innerHeight }; });
        assert.ok(place.bottom <= place.innerHeight, `${device} ${view}: the view controls are below the first screen (${place.bottom})`);
        assert.ok(place.scrollWidth <= place.innerWidth, `${device} ${view}: the page is wider than the window`);
      }
      await choose(p, 'demo-user', 'sam');
      assert.match(await p.locator('#demo-collection').textContent(), /Sam/);
      assert.deepEqual(problems, [], `${device}: the page raised errors`);
      await p.close();
    }
  } finally { await browser.close(); server.close(); }
});
