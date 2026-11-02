// Browser test: run with `pnpm test:e2e`. Every pile of cards (the collection's Overlapping Deck, Random Draw, Jukebox and Flip Tower, the Fan of Cards,
// and `<fuda-card stack>`) turns, fans open and closes back exactly, and has a card taken off it; and everything that moves ends in the same place
// with Animate on or off.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { chromium, serve, sizes, offline } from './support.mjs';

const PORT = 8114, origin = `http://127.0.0.1:${PORT}`;
const launch = () => chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
const ready = (p) => p.waitForFunction(() => { const r = document.querySelector('fuda-collection')?.shadowRoot; return customElements.get('kazoku-view-controls') && r?.querySelector('kazoku-view-controls')?.state && r.querySelector('.card img'); });
const shadow = (p, code, arg) => p.evaluate(({ code, arg }) => new Function('root', 'arg', code)(document.querySelector('fuda-collection').shadowRoot, arg), { code, arg });
const open = async (browser, size, query = '', extra = {}) => {
  const context = await browser.newContext({ viewport: size, ...extra }), p = await context.newPage(), problems = [];
  p.on('pageerror', (e) => problems.push(e.message));
  await offline(p);
  await p.goto(`${origin}/demo/collections-component.html${query}`);
  await ready(p);
  await p.waitForTimeout(400);
  return { context, p, problems };
};
const choice = (p, value) => p.locator('fuda-collection').locator(`.opts [data-value="${value}"]`).click();
// Where every card of the deck pile is: its own transform and origin (exact) and its box on screen.
const deckCards = (p) => shadow(p, `const o = root.querySelector('.stage').getBoundingClientRect(); return [...root.querySelectorAll('.deck-pile .card')].map((c) => { const r = c.getBoundingClientRect(), s = getComputedStyle(c); return { i: c.dataset.i, t: s.transform, o: s.transformOrigin, x: r.x - o.x, y: r.y - o.y, w: r.width, h: r.height }; })`);
const stageBox = (p) => shadow(p, `const r = root.querySelector('.stage').getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }`);
const settle = (p, ms = 1700) => p.waitForTimeout(ms);
const same = (a, b, message) => { assert.equal(a.length, b.length, message); a.forEach((c, k) => { assert.deepEqual([c.i, c.t, c.o], [b[k].i, b[k].t, b[k].o], `${message}: card ${k}`); for (const key of ['x', 'y', 'w', 'h']) assert.ok(Math.abs(c[key] - b[k][key]) < 0.6, `${message}: card ${k} ${key} ${c[key]} vs ${b[k][key]}`); }); };
const PILES = ['deck', 'random'];

test('every pile display fans open and closes back exactly, shows up to ten cards, fits a phone and keeps the choice in the address', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      for (const view of PILES) {
        const { context, p, problems } = await open(browser, size, `?view=${view}&animate=off`);
        const label = `${name} ${view}`;
        const closed = await deckCards(p);
        assert.equal(closed.length, 10, `${label}: a pile shows up to ten cards (of 25)`);
        assert.equal(await shadow(p, `return root.querySelector('.opts [data-value=open]').closest('.choice').hidden`), false, `${label}: the fan control is right there`);
        const box = await shadow(p, `const b = root.querySelector('.opts [data-value=open]').getBoundingClientRect(); return { h: b.height, w: b.width }`);
        assert.ok(box.h >= 44 && box.w >= 44, `${label}: the control is at least 44 px (${box.w} x ${box.h})`);
        await choice(p, 'open');
        await settle(p, 300);
        const opened = await deckCards(p);
        assert.match(new URL(p.url()).search, /fan=open/, `${label}: an open fan is in the address`);
        const stage = await stageBox(p);
        for (const [k, c] of opened.entries()) assert.ok(c.x >= -3 && c.x + c.w <= stage.right - stage.x + 3 && c.y >= -3 && c.y + c.h <= stage.bottom - stage.y + 3, `${label}: card ${k} of the open fan is inside the view (${Math.round(c.x)}..${Math.round(c.x + c.w)} of 0..${Math.round(stage.right - stage.x)})`);
        const centres = opened.map((c) => c.x + c.w / 2).sort((a, b) => a - b), steps = centres.slice(1).map((x, k) => x - centres[k]), cardWidth = Math.min(...opened.map((c) => c.w));
        assert.ok(Math.min(...steps) >= cardWidth * 0.45, `${label}: most of each card shows (neighbours ${Math.round(Math.min(...steps))}px apart, a card ${Math.round(cardWidth)}px wide)`);
        assert.ok(Math.max(...centres) - Math.min(...centres) > cardWidth * 2.5, `${label}: the cards spread`);
        // A turn, then the fan, then back: the cards return exactly and the turn is still there.
        await shadow(p, `root.querySelector('kazoku-view-controls').set({ yaw: 35, tilt: 20 })`);
        await settle(p, 200);
        await choice(p, 'closed');
        await settle(p, 300);
        assert.match(await shadow(p, `return root.querySelector('.v').style.transform`), /rotateX\(20deg\) rotateY\(35deg\)/, `${label}: the pile is still turned after the fan closed`);
        await shadow(p, `root.querySelector('kazoku-view-controls').set({ yaw: 0, tilt: 0 })`);
        await settle(p, 200);
        same(await deckCards(p), closed, `${label}: closed again, every card is exactly where it started`);
        assert.doesNotMatch(new URL(p.url()).search, /fan=/, `${label}: a closed fan leaves the address`);
        // Flip-off still works from a pile that was fanned and closed, and from an open fan.
        await p.getByRole('button', { name: 'Next →' }).click();
        await settle(p, 200);
        let s = await shadow(p, `return [root.querySelector('.deck-pile .card.top').dataset.i, root.querySelector('.discard-pile .card.top')?.dataset.i, root.querySelector('.count').textContent]`);
        assert.deepEqual(s, ['1', '0', '2 / 25'], `${label}: Next takes the top card off a pile that was fanned and closed`);
        await choice(p, 'open');
        await p.getByRole('button', { name: 'Next →' }).click();
        await settle(p, 300);
        s = await shadow(p, `return [root.querySelector('.deck-pile .card.top').dataset.i, root.querySelector('.discard-pile .card.top')?.dataset.i, root.querySelector('.v').classList.contains('fan-open')]`);
        assert.deepEqual(s, ['2', '1', true], `${label}: and off an open fan`);
        await p.getByRole('button', { name: '← Previous' }).click();
        await settle(p, 300);
        assert.equal(await shadow(p, `return root.querySelector('.deck-pile .card.top').dataset.i`), '1', `${label}: Previous puts it back`);
        assert.deepEqual(problems, [], `${label}: no page errors`);
        await context.close();
      }
    }
  } finally { await browser.close(); server.close(); }
});

test('the Fan of Cards is the same pile: the same cards, the same open and close, a window that moves on', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1], '?view=fan&animate=off');
    const closed = await deckCards(p);
    await choice(p, 'open'); await settle(p, 300);
    assert.equal(await shadow(p, `return root.querySelectorAll('.discard-pile, .slot').length`), 0, 'the fan has no pile beside it');
    await choice(p, 'closed'); await settle(p, 300);
    same(await deckCards(p), closed, 'the fan of cards closes back exactly');
    await p.getByRole('button', { name: 'Next →' }).click(); await settle(p, 200);
    assert.equal(await shadow(p, `return root.querySelector('.deck-pile .card.top').dataset.i`), '1', 'Next moves the window one card on');
    await context.close();
  } finally { await browser.close(); server.close(); }
});

test('Animate on and off end in exactly the same place, nothing is left running, and a quick double press lands right', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const end = async (query, act) => {
      const { context, p } = await open(browser, sizes[0][1], query);
      await act(p);
      await settle(p, 1900);
      const state = await shadow(p, `const v = root.querySelector('.v'), o = root.querySelector('.stage').getBoundingClientRect(); return { cards: [...v.querySelectorAll('.card')].map((c) => { const r = c.getBoundingClientRect(); return [c.dataset.i, Math.round(r.x - o.x), Math.round(r.y - o.y), Math.round(r.width)]; }), view: v.style.transform, count: root.querySelector('.count').textContent, running: v.getAnimations({ subtree: true }).length };`);
      await context.close();
      return state;
    };
    const press = (label, times = 1) => async (p) => { for (let k = 0; k < times; k++) await p.getByRole('button', { name: label }).click({ delay: 0 }); };
    for (const [what, view, act] of [['the fan opening', 'deck', (p) => choice(p, 'open')], ['one Next', 'deck', press('Next →')], ['a quick double Next', 'deck', press('Next →', 2)], ['Next in the rolodex', 'rolodex', press('Next →')], ['a quick double Next in the spotlight', 'spotlight', press('Next →', 2)], ['Next in the open fan of cards', 'fan', async (p) => { await choice(p, 'open'); await p.getByRole('button', { name: 'Next →' }).click(); }]]) {
      const on = await end(`?view=${view}&animate=on`, act), off = await end(`?view=${view}&animate=off`, act);
      assert.deepEqual(on.cards, off.cards, `${what}: the cards end in the same places with Animate on and off`);
      assert.equal(on.count, off.count, `${what}: the same card is on top`);
      assert.equal(on.view, off.view, `${what}: the view is fitted the same`);
      assert.equal(on.running, 0, `${what}: nothing is still animating afterwards`);
      assert.equal(off.running, 0);
    }
    assert.equal((await end('?view=deck&animate=on', press('Next →', 2))).count, '3 / 25', 'a quick double press moved two cards');
    assert.equal((await end('?view=rolodex&animate=on', press('Next →', 3))).count, '4 / 25');
  } finally { await browser.close(); server.close(); }
});

test('with Animate off, or with reduced motion, nothing animates at all; with it on, the moves are CSS transforms that end by themselves', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [what, query, extra, expectMotion] of [['Animate off', '?animate=off', {}, false], ['reduced motion', '?animate=on', { reducedMotion: 'reduce' }, false], ['Animate on', '?animate=on', {}, true]]) {
      const { context, p } = await open(browser, sizes[0][1], query, extra);
      await choice(p, 'open');
      await p.waitForTimeout(100);
      const during = await shadow(p, `const c = root.querySelector('.deck-pile .card'); return { animations: root.querySelector('.v').getAnimations({ subtree: true }).length, duration: getComputedStyle(c).transitionDuration, t: getComputedStyle(root.querySelector('.shell')).getPropertyValue('--t') };`);
      assert.equal(during.animations > 0, expectMotion, `${what}: ${during.animations} animations running during the fan opening`);
      if (!expectMotion) assert.match(during.duration, /^0s/, `${what}: the cards' transition is 0 s`);
      await p.getByRole('button', { name: 'Next →' }).click();
      await p.waitForTimeout(60);
      assert.equal((await shadow(p, `return root.querySelector('.v').getAnimations({ subtree: true }).length`)) > 0, expectMotion, `${what}: a card taken off flies only when animating`);
      await settle(p, 1800);
      assert.equal(await shadow(p, `return root.querySelector('.v').getAnimations({ subtree: true }).length`), 0, `${what}: idle again, nothing running`);
      await context.close();
    }
    // The speed option scales the length of a move.
    const slow = await open(browser, sizes[0][1], '?speed=slow'), quick = await open(browser, sizes[0][1], '?speed=quick');
    const t = async (x) => shadow(x.p, `return getComputedStyle(root.querySelector('.shell')).getPropertyValue('--t').trim()`);
    assert.deepEqual([await t(slow), await t(quick)], ['960ms', '360ms'], 'Slow and Quick change the length of every move');
    await slow.context.close(); await quick.context.close();
  } finally { await browser.close(); server.close(); }
});

test('the Animate and Speed choices are buttons, kept in the address, and the address opens the same', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1]);
    assert.equal(await shadow(p, `return root.querySelector('.opts [aria-checked=true][data-value=on]') !== null`), true, 'Animate is on by default');
    await choice(p, 'off'); await choice(p, 'slow'); await choice(p, 'open'); await choice(p, 'face-down');
    await p.waitForTimeout(400);
    const query = new URL(p.url()).searchParams;
    assert.deepEqual([query.get('animate'), query.get('speed'), query.get('fan'), query.get('land')], ['off', 'slow', 'open', 'face-down']);
    await choice(p, 'on'); await choice(p, 'normal'); await p.waitForTimeout(400);
    assert.deepEqual([new URL(p.url()).searchParams.get('animate'), new URL(p.url()).searchParams.get('speed')], [null, null], 'the defaults leave the address');
    await context.close();
    const linked = await open(browser, sizes[0][1], '?view=jukebox&fan=open&animate=off&speed=quick&land=upside-down'); // jukebox, dropped in 0.8.0, still opens the deck
    assert.deepEqual(await shadow(linked.p, `return [...root.querySelectorAll('.opts .choice:not([hidden]) [aria-checked=true]')].map((b) => b.dataset.value)`), ['face-down', 'open', 'off', 'quick'], 'a link opens the same choices (and 0.6.0 upside-down means turned over)');
    assert.equal(await shadow(linked.p, `return root.querySelector('.v').classList.contains('fan-open')`), true);
    await linked.context.close();
  } finally { await browser.close(); server.close(); }
});

// ---- <fuda-card stack>

const fixture = `${origin}/test/e2e/fixtures/piles.html`;
const openCard = async (browser, size, query = '', extra = {}) => {
  const context = await browser.newContext({ viewport: size, ...extra }), p = await context.newPage(), problems = [], requests = [];
  p.on('pageerror', (e) => problems.push(e.message)); p.on('request', (r) => requests.push(r.url()));
  await p.goto(fixture + query);
  await p.waitForFunction(() => customElements.get('fuda-card') && [...document.querySelectorAll('fuda-card')].every((c) => c.shadowRoot.querySelector('.art.ready')));
  return { context, p, problems, requests };
};
const cardState = (p, id = 'c') => p.evaluate((id) => { const c = document.getElementById(id), r = c.shadowRoot; const t = (e) => { const s = getComputedStyle(e); return [s.transform, s.transformOrigin]; }; return { card: t(r.querySelector('.card')), stills: [...r.querySelectorAll('.card > .stills > .still')].map(t), bounds: JSON.stringify(c.pileBounds) }; }, id);

test('<fuda-card stack> fans open and closes back exactly, turns, and its fan is drawn with the card faces', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, p, problems, requests } = await openCard(browser, size, '', { colorScheme: 'dark' });
      assert.equal(requests.some((u) => /pile-card/.test(u)), true, `${name}: a stack with pile controls loads the pile code`);
      const closed = await cardState(p);
      assert.equal(closed.stills.length, 9, `${name}: nine cards under the top one (of ten)`);
      const set = (attrs) => p.evaluate((attrs) => { const c = document.getElementById('c'); for (const [k, v] of Object.entries(attrs)) v === null ? c.removeAttribute(k) : c.setAttribute(k, v); }, attrs);
      await set({ animate: 'off', fan: 'open' });
      await p.waitForTimeout(200);
      const opened = await cardState(p);
      assert.notDeepEqual(opened.stills, closed.stills, `${name}: the cards moved`);
      const faced = await p.evaluate(() => [...document.getElementById('c').shadowRoot.querySelectorAll('.rotation > .card > .stills > .still.faced')].filter((s) => s.querySelector('.front .art img.copy')).length);
      assert.equal(faced, 9, `${name}: every card of the fan shows its front with the picture`);
      const rects = await p.evaluate(() => [...document.getElementById('c').shadowRoot.querySelectorAll('.card, .card > .stills > .still')].map((e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.width]; }));
      const centres = rects.map((r) => r[0]).sort((a, b) => a - b), steps = centres.slice(1).map((x, k) => x - centres[k]);
      assert.ok(Math.min(...steps) >= 120 * 0.4, `${name}: most of each card shows (${Math.round(Math.min(...steps))}px apart on a 120px card)`);
      assert.notEqual(opened.bounds, closed.bounds, `${name}: the fan reaches beyond the card's box (${opened.bounds})`);
      // Turn the card, fan, close: exactly back.
      await p.evaluate(() => { const c = document.getElementById('c'); c.setAttribute('card-view', ''); c.style.setProperty('--fuda-yaw', '40deg'); c.style.setProperty('--fuda-tilt', '20deg'); });
      await set({ fan: null });
      await p.waitForTimeout(200);
      assert.deepEqual(await cardState(p), closed, `${name}: closed again, the card and every card under it are exactly where they started`);
      assert.equal(await p.evaluate(() => document.querySelectorAll('fuda-card')[0].shadowRoot.querySelectorAll('.still.faced').length), 0, `${name}: the copies of the faces are gone once closed`);
      assert.deepEqual(problems, [], `${name}: no page errors`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('<fuda-card stack>: the top card comes off onto a pile at its side, still facing up or turned over, and goes back; also after a turn and a fan', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, p } = await openCard(browser, sizes[0][1]);
    const info = () => p.evaluate(() => { const c = document.getElementById('c'), r = c.shadowRoot; const d = r.querySelector('.discard'); return { held: c.heldCount, taken: c.getAttribute('taken-off'), discard: d ? d.querySelector('.card').style.getPropertyValue('--mm') : null, land: d?.dataset.land ?? null, flyer: !!r.querySelector('.flyer'), animations: r.querySelector('.rotation').getAnimations({ subtree: true }).length, bar: [...r.querySelectorAll('.bar button')].map((b) => [b.textContent, Math.round(b.getBoundingClientRect().height), b.disabled]) }; });
    const click = (role) => p.evaluate((role) => document.getElementById('c').shadowRoot.querySelector(`.bar [data-role=${role}]`).click(), role);
    const closedState = await cardState(p);
    let s = await info();
    assert.deepEqual([s.held, s.discard], [10, null], 'ten cards on the stack, no pile yet');
    assert.ok(s.bar.every(([, h]) => h >= 44), 'the buttons are at least 44 px');
    assert.deepEqual(s.bar.map((b) => b[2]), [false, false, true], 'Put it back waits for a card to be taken off');
    await click('off');
    await p.waitForTimeout(80);
    s = await info();
    assert.equal(s.flyer && s.animations > 0, true, 'the card flies, it does not jump');
    await p.waitForTimeout(1000);
    s = await info();
    assert.deepEqual([s.held, s.taken, s.flyer, s.land], [9, '1', false, 'face-up'], 'it lands on the pile still facing up');
    await p.evaluate(() => document.getElementById('c').setAttribute('deck-land', 'face-down'));
    await click('off'); await p.waitForTimeout(1000);
    s = await info();
    assert.deepEqual([s.held, s.land], [8, 'face-down'], 'the next lands turned over');
    const m = await p.evaluate(() => new DOMMatrix(getComputedStyle(document.getElementById('c').shadowRoot.querySelector('.discard .card')).transform));
    assert.ok(Math.abs(m.a + 1) < 0.01 && Math.abs(m.b) < 0.01 && Math.abs(m.d - 1) < 0.01, 'turned over sideways about its vertical axis, never upside down');
    // Quick double press, a turn and a fan in the middle of it all.
    await click('off'); await click('off');
    await p.waitForTimeout(1300);
    assert.equal((await info()).held, 6, 'two quick presses took two cards');
    await p.evaluate(() => { const c = document.getElementById('c'); c.setAttribute('fan', 'open'); c.setAttribute('card-view', ''); c.style.setProperty('--fuda-yaw', '30deg'); });
    await p.waitForTimeout(900);
    assert.equal(await p.evaluate(() => document.getElementById('c').shadowRoot.querySelectorAll('.rotation > .card > .stills > .still:not(.far)').length), 5, 'the fan holds the six cards that are left');
    await click('off'); await p.waitForTimeout(1000);
    assert.equal((await info()).held, 5, 'a card comes off an open fan');
    await p.evaluate(() => document.getElementById('c').removeAttribute('fan'));
    await p.waitForTimeout(900);
    for (let k = 0; k < 6; k++) { await click('back'); await p.waitForTimeout(150); }
    await p.waitForTimeout(1100);
    s = await info();
    assert.deepEqual([s.held, s.taken, s.discard], [10, null, null], 'Previous brings every card back');
    await p.evaluate(() => { const c = document.getElementById('c'); c.style.removeProperty('--fuda-yaw'); c.removeAttribute('card-view'); c.setAttribute('deck-land', 'face-up'); });
    await p.waitForTimeout(300);
    assert.deepEqual(await cardState(p), closedState, 'and the stack is exactly as it began');
    // Animate off: no flyer at all, same end place.
    await p.evaluate(() => { const c = document.getElementById('c'); c.setAttribute('animate', 'off'); c.takeOff(); });
    await p.waitForTimeout(80);
    s = await info();
    assert.deepEqual([s.held, s.flyer, s.animations], [9, false, 0], 'with Animate off the card is on the pile at once');
    await context.close();
  } finally { await browser.close(); server.close(); }
});

test('a plain <fuda-card> is exactly what 0.6.0 drew and never loads the pile code; a stack with no pile option does not either', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const before = await readFile(new URL('./fixtures/perfect-card-0.4.0.html', import.meta.url), 'utf8');
    const context = await browser.newContext({ viewport: sizes[0][1] }), p = await context.newPage(), requests = [];
    p.on('request', (r) => requests.push(r.url()));
    await p.goto(`${origin}/test/e2e/fixtures/perfect.html`);
    await p.waitForFunction(() => customElements.get('fuda-card') && document.querySelector('fuda-card').shadowRoot.querySelector('.art.ready'));
    assert.equal(await p.evaluate(() => document.getElementById('p').shadowRoot.innerHTML), before, 'the plain card draws the same markup');
    await p.goto(`${origin}/test/e2e/fixtures/stack.html`);
    await p.waitForFunction(() => customElements.get('fuda-card'));
    await p.waitForTimeout(400);
    assert.equal(requests.some((u) => /pile-card/.test(u)), false, 'no pile code was requested');
    await context.close();
  } finally { await browser.close(); server.close(); }
});
