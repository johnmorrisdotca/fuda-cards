// Browser test: run with `pnpm test:e2e`. The Binder Pages display: a ring or zip binder open on two facing sheets of clear plastic pockets
// (three by three) with a strip of punched holes by the spine, one card in each pocket; and a page turn that swings a leaf about the spine,
// bends it, and shows the pockets on its back.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, serve, sizes, offline } from './support.mjs';

const PORT = 8110, origin = `http://127.0.0.1:${PORT}`;
const launch = () => chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM });
const shadow = (p, code, arg) => p.evaluate(({ code, arg }) => new Function('root', 'arg', code)(document.querySelector('fuda-collection').shadowRoot, arg), { code, arg });
const open = async (browser, size, query = '', extra = {}) => {
  const context = await browser.newContext({ viewport: size, ...extra }), p = await context.newPage(), problems = [];
  p.on('pageerror', (e) => problems.push(e.message));
  await offline(p);
  await p.goto(`${origin}/demo/collections-component.html?view=binder${query}`);
  await p.waitForFunction(() => document.querySelector('fuda-collection')?.shadowRoot?.querySelector('.book .card img'));
  await p.waitForTimeout(300);
  return { context, p, problems };
};
const choice = (p, value) => p.locator('fuda-collection').locator(`.opts .choice:not([hidden]) [data-value="${value}"]`).click();
const pick = (p, label, value) => p.locator('fuda-collection').locator(`.choice:has(.choice-label:text-is("${label}")) [data-value="${value}"]`).click();
const next = (p) => p.getByRole('button', { name: 'Next →' }).click();
const prev = (p) => p.getByRole('button', { name: '← Previous' }).click();
const sides = (p) => shadow(p, `return [...root.querySelectorAll('.half')].map((h) => { const s = h.querySelector('.side'); return s ? { side: s.dataset.side, where: s.className, pockets: s.querySelectorAll('.pocket').length, cards: [...s.querySelectorAll('.pocket .card')].map((c) => c.dataset.i), pics: s.querySelectorAll('.pocket .card img').length } : null; })`);
const SPINE = `const sp = root.querySelector('.spine').getBoundingClientRect(); `;

test('the binder is real sheets: nine clear pockets three by three, a hole strip against the spine, one card in each pocket, two facing pages in a ring binder', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, p, problems } = await open(browser, size, '&animate=off');
      let s = await sides(p);
      assert.equal(s[0], null, `${name}: the first opening has the inside of the cover on the left`);
      assert.deepEqual([s[1].side, s[1].pockets, s[1].pics, s[1].cards.join()], ['0', 9, 9, '0,1,2,3,4,5,6,7,8'], `${name}: the first sheet has nine pockets, each holding one card`);
      const grid = await shadow(p, `const g = getComputedStyle(root.querySelector('.side')); return [g.gridTemplateColumns.split(' ').length, g.gridTemplateRows.split(' ').length]`);
      assert.deepEqual(grid, [3, 3], `${name}: three by three`);
      const look = await shadow(p, `const side = root.querySelector('.side'), pocket = side.querySelector('.pocket'), book = root.querySelector('.book'); const card = pocket.querySelector('.card').getBoundingClientRect(), pr = pocket.getBoundingClientRect(); const holes = [...side.querySelectorAll('.holes i')].map((i) => i.getBoundingClientRect()); const first = side.querySelector('.pocket').getBoundingClientRect(); return { sheen: getComputedStyle(pocket, '::after').backgroundImage.includes('gradient'), inside: card.left >= pr.left && card.right <= pr.right && card.top >= pr.top && card.bottom <= pr.bottom, holes: holes.length, holesLeftOfCards: holes.every((h) => h.right <= first.left), holesDown: holes.every((h, k) => k === 0 || h.top > holes[k - 1].top), sheet: side.className, cover: getComputedStyle(book).backgroundColor, rings: root.querySelectorAll('.spine .ring').length, zip: book.classList.contains('b-zip') };`);
      assert.deepEqual([look.sheen, look.inside, look.holes, look.holesLeftOfCards, look.holesDown], [true, true, 9, true, true], `${name}: plastic sheen, the card sits inside its pocket, nine punched holes down the edge by the spine: ${JSON.stringify(look)}`);
      assert.match(look.sheet, /clear/); assert.equal(look.cover, 'rgb(31, 122, 74)', `${name}: a plain green cover`); assert.equal(look.rings, 3); assert.equal(look.zip, false);
      assert.equal(await shadow(p, `return root.querySelector('.count').textContent`), 'Page 1 / 3');
      await next(p); await p.waitForTimeout(200);
      s = await sides(p);
      assert.deepEqual([s[0].side, s[1].side, s[0].cards[0], s[1].cards[0]], ['1', '2', '9', '18'], `${name}: two facing pages`);
      const holes = await shadow(p, SPINE + `const l = root.querySelector('.side.l .holes i').getBoundingClientRect(), r = root.querySelector('.side.r .holes i').getBoundingClientRect(); return [sp.left - l.right, r.left - sp.left]`);
      assert.ok(holes.every((d) => d >= 0 && d < 60 * (size.width < 500 ? 1 : 2)), `${name}: each page's holes lie against the rings (${holes})`);
      assert.equal(await shadow(p, `return root.querySelector('.count').textContent`), 'Pages 2–3 / 3');
      // The last sheet is part full: the pockets without a card are empty plastic.
      assert.equal(await shadow(p, `return root.querySelectorAll('.side.r .pocket.empty').length`), 2, `${name}: the part-full sheet (7 of 9 cards) has two empty pockets`);
      assert.deepEqual(problems, [], `${name}: no page errors`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('binder options: ring or zip, cover colour, clear or black sheets, 4, 9 or 12 pockets, in the address; the older columns and page-size still work', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, p } = await open(browser, sizes[0][1], '&animate=off');
    const box = await shadow(p, `const b = [...root.querySelectorAll('.opts .choice:not([hidden]) button')].map((x) => x.getBoundingClientRect()); return Math.min(...b.map((r) => Math.min(r.width, r.height)))`);
    assert.ok(box >= 44, `the binder choices are at least 44 px (${box})`);
    await choice(p, 'zip'); await choice(p, 'red'); await pick(p, 'Sheet', 'black'); await choice(p, '12');
    await p.waitForTimeout(400);
    const info = await shadow(p, `const book = root.querySelector('.book'), s = root.querySelector('.side'); return { zip: book.classList.contains('b-zip'), cover: getComputedStyle(book).backgroundColor, sheet: s.className, pockets: s.querySelectorAll('.pocket').length, cols: getComputedStyle(s).gridTemplateColumns.split(' ').length, tab: getComputedStyle(root.querySelector('.tab')).display, zipEdge: getComputedStyle(book, '::after').borderTopStyle }`);
    assert.deepEqual([info.zip, info.cover, info.pockets, info.cols, info.tab, info.zipEdge], [true, 'rgb(176, 38, 45)', 12, 4, 'block', 'dotted'], `zip, red, 12 pockets in four columns: ${JSON.stringify(info)}`);
    assert.match(info.sheet, /black/);
    const q = new URL(p.url()).searchParams;
    assert.deepEqual([q.get('binder'), q.get('cover'), q.get('sheet'), q.get('pockets')], ['zip', 'red', 'black', '12'], 'the choices are in the address');
    await choice(p, 'ring'); await choice(p, 'green'); await choice(p, 'clear'); await choice(p, '9'); await p.waitForTimeout(400);
    assert.equal(new URL(p.url()).searchParams.get('binder') ?? new URL(p.url()).searchParams.get('cover') ?? new URL(p.url()).searchParams.get('sheet') ?? new URL(p.url()).searchParams.get('pockets'), null, 'the defaults leave the address');
    // The older attributes still work: six cards a page in two columns.
    await p.evaluate(() => { const c = document.querySelector('fuda-collection'); c.removeAttribute('pockets'); c.setAttribute('page-size', '6'); c.setAttribute('columns', '2'); });
    await p.waitForTimeout(300);
    const old = await shadow(p, `const s = root.querySelector('.side'); return [s.querySelectorAll('.pocket').length, getComputedStyle(s).gridTemplateColumns.split(' ').length, getComputedStyle(s).gridTemplateRows.split(' ').length]`);
    assert.deepEqual(old, [6, 2, 3], 'page-size 6 and columns 2 give a six-pocket sheet, two across');
    await context.close();
    const linked = await open(browser, sizes[0][1], '&binder=zip&cover=teal&sheet=black&pockets=4');
    assert.deepEqual(await shadow(linked.p, `return [...root.querySelectorAll('.opts .choice:not([hidden]) [aria-checked=true]')].map((b) => b.dataset.value)`), ['face-up', 'closed', 'zip', 'teal', 'black', '4', 'on', 'normal'].filter((v) => !['face-up', 'closed'].includes(v)), 'a link opens the same binder');
    assert.equal(await shadow(linked.p, `return root.querySelectorAll('.side .pocket').length`), 4);
    await linked.context.close();
  } finally { await browser.close(); server.close(); }
});

test('a page turn swings a leaf about the spine, bends it, shows its back pockets, forwards and backwards; Animate off ends in the same place; a quick double press lands right', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, p } = await open(browser, size);
      await next(p);
      await p.waitForTimeout(60);
      const mid = await shadow(p, `const leaf = root.querySelector('.leaf'); if (!leaf) return null; const anims = root.querySelector('.v').getAnimations({ subtree: true }); const swing = anims.find((a) => a.effect.target === leaf); const total = swing.effect.getComputedTiming().duration; const angles = []; for (const f of [0, 0.3, 0.5, 0.7, 1]) { for (const a of anims) { a.pause(); a.currentTime = f * total; } const m = new DOMMatrix(getComputedStyle(leaf).transform); angles.push(Math.round(Math.atan2(m.m13 * -1, m.m11) * 180 / Math.PI)); } for (const a of anims) { a.currentTime = total * 0.45; } const bends = [...leaf.querySelectorAll('.slice')].map((s) => { const m = new DOMMatrix(getComputedStyle(s).transform); return Math.round(Math.atan2(-m.m13, m.m11) * 180 / Math.PI); }); const back = [...leaf.querySelectorAll('.slice > .b .pocket img')].length, front = [...leaf.querySelectorAll('.slice > .f .pocket img')].length; return { angles, bends, back, front, slices: leaf.querySelectorAll('.slice').length, total }`);
      assert.ok(mid, `${name}: a leaf is on screen while the page turns`);
      assert.equal(mid.slices, 4, `${name}: hole strip and three columns, hinged one on the next`);
      assert.ok(mid.angles[0] === 0 && Math.abs(mid.angles[4]) === 180 && mid.angles[2] < -30 && mid.angles[2] > -150, `${name}: it swings from the right page to the left about the spine (${mid.angles})`);
      assert.ok(mid.bends.slice(1).some((b) => Math.abs(b) >= 2), `${name}: the leaf bends mid-turn (${mid.bends})`);
      assert.ok(mid.back >= 9 && mid.front >= 9, `${name}: it carries pockets on both sides (${mid.front} front, ${mid.back} back)`);
      await shadow(p, `for (const a of root.querySelector('.v').getAnimations({ subtree: true })) a.play()`);
      await p.waitForTimeout(1800);
      assert.equal(await shadow(p, `return [root.querySelector('.leaf') === null, root.querySelector('.v').getAnimations({ subtree: true }).length]`).then((x) => x.join()), 'true,0', `${name}: the leaf is gone and nothing runs when the turn ends`);
      assert.deepEqual((await sides(p)).map((s) => s.side), ['1', '2']);
      // Backwards: the left leaf swings back to the right.
      await prev(p);
      await p.waitForTimeout(60);
      const back = await shadow(p, `const leaf = root.querySelector('.leaf'); const anims = root.querySelector('.v').getAnimations({ subtree: true }), swing = anims.find((a) => a.effect.target === leaf); const total = swing.effect.getComputedTiming().duration; const out = []; for (const f of [0, 1]) { for (const a of anims) { a.pause(); a.currentTime = f * total; } const m = new DOMMatrix(getComputedStyle(leaf).transform); out.push(Math.abs(Math.round(Math.atan2(m.m13 * -1, m.m11) * 180 / Math.PI))); } return out`);
      assert.deepEqual(back, [180, 0], `${name}: backwards it swings from the left page to the right`);
      await context.close();
    }
    const end = async (query, act) => {
      const { context, p } = await open(browser, sizes[0][1], query);
      await act(p); await p.waitForTimeout(2000);
      const state = await shadow(p, `const o = root.querySelector('.stage').getBoundingClientRect(); return { cards: [...root.querySelectorAll('.card')].map((c) => { const r = c.getBoundingClientRect(); return [c.dataset.i, Math.round(r.x - o.x), Math.round(r.y - o.y), Math.round(r.width)]; }), count: root.querySelector('.count').textContent, view: root.querySelector('.v').style.transform, leaf: root.querySelector('.leaf') !== null, running: root.querySelector('.v').getAnimations({ subtree: true }).length }`);
      await context.close(); return state;
    };
    for (const [what, act, count] of [['one Next', next, 'Pages 2–3 / 7'], ['a quick double Next', async (p) => { await next(p); await next(p); }, 'Pages 4–5 / 7'], ['Next then Previous', async (p) => { await next(p); await prev(p); }, 'Page 1 / 7']]) {
      const on = await end('&pockets=4&animate=on', act), off = await end('&pockets=4&animate=off', act);
      assert.deepEqual(on.cards, off.cards, `${what}: the cards end in the same places with Animate on and off`);
      assert.deepEqual([on.count, off.count, on.view === off.view, on.leaf, on.running], [count, count, true, false, 0], `${what}: ${count}, fitted the same, nothing left running`);
    }
    // No leaf with reduced motion.
    const reduced = await open(browser, sizes[0][1], '&animate=on', { reducedMotion: 'reduce' });
    await next(reduced.p);
    assert.equal(await shadow(reduced.p, `return root.querySelector('.leaf')`), null, 'reduced motion: the page changes at once');
    await reduced.context.close();
  } finally { await browser.close(); server.close(); }
});
