// Browser test: run with `pnpm test:e2e`. MODULES-146: an item that is not a card (`kind: 'object'`, such as a games console) has no back and no
// thickness, so it never turns over, is never seen edge-on or from behind, and always lands facing up. Riley's retro gaming consoles must not be
// turnable by the controls or by the address (`?yaw=-81`); a card is exactly as before; in a mixed collection each item acts as what it is.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, launch, portShift, serve, offline, choose } from './support.mjs';

const PORT = 8113 + portShift, origin = `http://127.0.0.1:${PORT}`;
const ready = (p) => p.waitForFunction(() => { const r = document.querySelector('fuda-collection')?.shadowRoot; return customElements.get('kazoku-view-controls') && r?.querySelector('kazoku-view-controls')?.state && r.querySelector('.card img'); });
const shadow = (p, code, arg) => p.evaluate(({ code, arg }) => new Function('root', 'arg', code)(document.querySelector('fuda-collection').shadowRoot, arg), { code, arg });
async function open(browser, query, user) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 1 }), page = await context.newPage(), problems = [];
  page.on('pageerror', (e) => problems.push(e.message));
  await offline(page);
  await page.goto(`${origin}/demo/collections-component.html?${query}`);
  await ready(page);
  if (user) { await choose(page, 'demo-user', user); await page.waitForTimeout(400); }
  await page.waitForTimeout(500);
  return { context, page, problems };
}
/** Whether the view `.v` is turned in 3D: a matrix with any turn in it, not just a scale and a move. */
const turned = (p) => shadow(p, `const t = getComputedStyle(root.querySelector('.v')).transform; if (t === 'none' || !t.startsWith('matrix3d')) return false; const m = t.slice(9, -1).split(',').map(Number); return [2, 6, 8, 9, 3, 7].some((i) => Math.abs(m[i]) > 1e-6) || Math.abs(m[10] - 1) > 1e-6;`);
const visible = (p, text) => p.locator('fuda-collection').getByText(text, { exact: true }).evaluateAll((els) => els.filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').length);
const mixed = (kinds) => kinds.map((kind, i) => ({ id: `m${i}`, name: `${kind} ${i}`, kind, image: `https://assets.tcgdex.net/en/base/base1/${i + 1}` }));

test('Riley\'s consoles cannot be turned: not by the address, not by the controls, no back, always landing facing up', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    // John's address: the fan, open, turned to -81 degrees.
    const { context, page: p, problems } = await open(browser, 'land=face-down&view=fan&fan=open&yaw=-81&tilt=-2&animate=off', 'riley');
    assert.equal(await turned(p), false, 'the view is not turned by ?yaw=-81');
    assert.equal(await shadow(p, `return root.querySelector('kazoku-view-controls').hasAttribute('flat')`), true, 'the turn controls are off');
    for (const word of ['Angle', 'Tilt', 'Auto-turn']) assert.equal(await visible(p, word), 0, `no ${word} control is offered`);
    assert.deepEqual(await shadow(p, `const s = root.querySelector('kazoku-view-controls').state; return [s.yaw || 0, s.tilt || 0]`), [0, 0], 'the angle and tilt are zero');
    // Asking the controls for the same angle changes nothing on screen.
    await shadow(p, `root.querySelector('kazoku-view-controls').set({yaw: -81, tilt: -2}); return 0`); await p.waitForTimeout(300);
    assert.equal(await turned(p), false, 'the controls cannot turn the consoles to -81 degrees');
    await p.waitForTimeout(500);
    assert.doesNotMatch(await p.evaluate(() => location.search), /yaw=-81/, 'the address does not keep an angle the consoles cannot have');
    assert.equal(await shadow(p, `return root.querySelector('.opts [data-value=face-down]').closest('.choice').hidden`), true, 'the "turned over" landing is not offered');
    assert.ok(await shadow(p, `return root.querySelectorAll('.deck-pile .card.flat').length`) > 1, 'the consoles are flat items');
    assert.equal(await shadow(p, `return root.querySelectorAll('.face.back, .generic-back').length`), 0, 'no card back is drawn');
    // Dragging the view to turn it does nothing either.
    const box = await shadow(p, `const r = root.querySelector('.stage').getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}`);
    await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.mouse.move(box.x + 160, box.y + 20, { steps: 8 }); await p.mouse.up();
    assert.equal(await turned(p), false, 'dragging does not turn the consoles');
    // The deck with the landing asked for in the address: a console taken off lands facing up, with nothing turning on the way.
    await p.evaluate(() => { const c = document.querySelector('fuda-collection'); c.setAttribute('view', 'deck'); c.removeAttribute('fan'); c.removeAttribute('animate'); c.setAttribute('deck-land', 'face-down'); });
    await p.waitForTimeout(400);
    await p.getByRole('button', { name: 'Next →' }).click();
    const flying = await shadow(p, `return root.querySelector('.discard-pile .card.top').getAnimations({ subtree: true }).map((a) => a.effect.target.className)`);
    assert.ok(flying.length > 0 && !flying.includes('turn'), `it flies without turning over (${flying})`);
    await p.waitForTimeout(1200);
    assert.equal(await shadow(p, `const t = getComputedStyle(root.querySelector('.discard-pile .card.top .turn')).transform; if (t === 'none') return true; const m = t.replace(/matrix(3d)?\\(|\\)/g, '').split(',').map(Number); return m[0] > 0.99`), true, 'the console on the pile is facing up');
    assert.equal(await shadow(p, `return root.querySelectorAll('.discard-pile .face.back').length`), 0, 'the pile shows no back');
    assert.equal(await turned(p), false, 'still not turned');
    assert.deepEqual(problems, [], 'the page raised no errors');
    await context.close();
  } finally { await browser.close(); server.close(); }
});

test('a card is as before: the same address turns it, and the controls are there', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, page: p } = await open(browser, 'land=face-down&view=fan&fan=open&animate=off');
    assert.equal(await turned(p), false, 'the fan starts square');
    await shadow(p, `root.querySelector('kazoku-view-controls').set({yaw: -81, tilt: -2}); return 0`); await p.waitForTimeout(300);
    assert.equal(await turned(p), true, 'a collection of cards turns to -81 degrees');
    await shadow(p, `root.querySelector('kazoku-view-controls').setAttribute('controls', 'advanced'); return 0`); // Tilt is under More since kazoku-ui 0.8
    for (const word of ['Angle', 'Tilt', 'Auto-turn']) assert.ok(await visible(p, word) > 0, `${word} is offered`);
    assert.equal(await shadow(p, `return root.querySelectorAll('.card.flat').length`), 0, 'no card is flat');
    assert.ok(await shadow(p, `return root.querySelectorAll('.face.back').length`) > 1, 'cards have backs');
    await context.close();
  } finally { await browser.close(); server.close(); }
});

test('a mixed collection: the cards turn, the objects stay square to the reader and land facing up', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, page: p } = await open(browser, 'view=deck&animate=off&land=face-down');
    await p.evaluate((cards) => { document.querySelector('fuda-collection').cards = cards; }, mixed(['object', 'card', 'card']));
    await p.waitForTimeout(500);
    await shadow(p, `root.querySelector('kazoku-view-controls').set({yaw: 60}); return 0`); await p.waitForTimeout(300);
    assert.equal(await turned(p), true, 'the view turns: there are cards in it');
    await shadow(p, `root.querySelector('kazoku-view-controls').setAttribute('controls', 'advanced'); return 0`); // Tilt is under More since kazoku-ui 0.8
    for (const word of ['Angle', 'Tilt', 'Auto-turn']) assert.ok(await visible(p, word) > 0, `${word} is offered`);
    const width = (p2) => shadow(p2, `return root.querySelector('.deck-pile .card.top .face.front').getBoundingClientRect().width`);
    const setYaw = (yaw) => shadow(p, `root.querySelector('kazoku-view-controls').set({yaw: arg}); return 0`, yaw).then(() => p.waitForTimeout(200));
    await setYaw(0); const objectFlat = await width(p); await setYaw(60); const objectTurned = await width(p);
    assert.ok(objectTurned > objectFlat * 0.9, `the object on top is not foreshortened by the turn (${objectFlat.toFixed(0)} px then ${objectTurned.toFixed(0)} px)`);
    await p.getByRole('button', { name: 'Next →' }).click(); await p.waitForTimeout(400);
    await setYaw(0); const cardFlat = await width(p); await setYaw(60); const cardTurned = await width(p);
    assert.ok(cardTurned < cardFlat * 0.8, `the card on top is turned (${cardFlat.toFixed(0)} px then ${cardTurned.toFixed(0)} px)`);
    assert.equal(await shadow(p, `return root.querySelectorAll('.deck-pile .card.flat .face.back, .discard-pile .card.flat .face.back').length`), 0, 'the object has no back');
    assert.equal(await shadow(p, `return root.querySelectorAll('.discard-pile .card.flat').length`), 1, 'the object is on the pile, facing up');
    assert.equal(await shadow(p, `return root.querySelector('.opts [data-value=face-down]').closest('.choice').hidden`), false, 'the landing is still offered for the cards');
    await context.close();
  } finally { await browser.close(); server.close(); }
});
