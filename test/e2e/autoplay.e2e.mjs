// Browser test: run with `pnpm test:e2e`. The quiet Animate button and autoplay="focus", at a desk and a phone size.
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { chromium, launch, portShift, serve, sizes } from './support.mjs';

const PORT = 8116 + portShift;
// A running pan is the card's art with the pan animation on it. The animation comes from the card's shadow styles (::slotted), and Chromium 147 hands it back as a plain Animation with no `animationName`, so the name is read from the computed style.
const moving = (page) => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('fuda-card')].map((c) => { const img = c.querySelector('img'); return [c.id, getComputedStyle(img).animationName.split(', ').includes('fuda-pan') ? img.getAnimations().filter((a) => a.playState === 'running').length : 0]; })));
const open = async (browser, size, extra = {}) => {
  const context = await browser.newContext({ viewport: size, ...extra }), page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/test/e2e/fixtures/autoplay.html`);
  await page.waitForFunction(() => customElements.get('fuda-card') && [...document.querySelectorAll('fuda-card')].every((c) => c.shadowRoot.querySelector('.art.ready')));
  return { context, page };
};
const centre = (page, id) => page.locator(`#${id}`).boundingBox().then((b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 3 }));

test('the Animate button is an icon with a name, 48 px square, and quiet until used', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, page } = await open(browser, size);
      const info = await page.evaluate(() => { const b = document.querySelector('#c').shadowRoot.querySelector('.motion-button'), r = b.getBoundingClientRect(), g = b.querySelector('.glyph').getBoundingClientRect(); return { w: r.width, h: r.height, glyph: g.width, label: b.getAttribute('aria-label'), text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), opacity: getComputedStyle(b).opacity, svgHidden: b.querySelector('svg').getAttribute('aria-hidden') }; });
      assert.ok(info.w >= 48 && info.h >= 48, `${name}: the hit target is ${info.w}x${info.h}`);
      assert.ok(info.glyph <= 28, `${name}: the visible mark is ${info.glyph}px, not quiet`);
      assert.equal(info.text, '', `${name}: the button must not carry text`);
      assert.match(info.label, /Animate/, `${name}: the button needs an aria-label`);
      assert.equal(info.svgHidden, 'true');
      assert.ok(Number(info.opacity) < 0.7, `${name}: resting opacity ${info.opacity}`);
      assert.equal(info.pressed, 'false');
      await page.locator('#c').getByRole('button', { name: /Animate/ }).click();
      assert.equal((await moving(page)).c, 1, `${name}: clicking Animate must start a card without autoplay`);
      assert.equal(await page.evaluate(() => document.querySelector('#c').shadowRoot.querySelector('.motion-button').getAttribute('aria-pressed')), 'true');
      await page.locator('#c').getByRole('button', { name: /Animate/ }).click();
      assert.equal((await moving(page)).c, 0, `${name}: clicking again must stop it`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('autoplay="focus": only the card in focus animates (pointer, keyboard, tap)', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, page } = await open(browser, size);
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: every card starts still`);
      const a = await centre(page, 'a'), b = await centre(page, 'b');
      await page.mouse.move(a.x, a.y);
      assert.deepEqual(await moving(page), { a: 1, b: 0, c: 0 }, `${name}: hovering A`);
      await page.mouse.move(b.x, b.y);
      assert.deepEqual(await moving(page), { a: 0, b: 1, c: 0 }, `${name}: hovering B must stop A`);
      await page.mouse.move(2, 2);
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: leaving stops the card`);
      await page.getByRole('button', { name: /Animate/ }).first().focus();
      assert.deepEqual(await moving(page), { a: 1, b: 0, c: 0 }, `${name}: keyboard focus on A's button`);
      await page.keyboard.press('Tab');
      assert.deepEqual(await moving(page), { a: 0, b: 1, c: 0 }, `${name}: Tab moves the motion to B`);
      await page.keyboard.press('Enter');
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: Enter on the button pauses the focused card`);
      await page.keyboard.press('Enter');
      assert.deepEqual(await moving(page), { a: 0, b: 1, c: 0 }, `${name}: Enter again resumes it`);
      await page.keyboard.press('Tab');
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: Tab to a card without autoplay leaves nothing moving`);
      assert.equal(await page.evaluate(() => document.querySelector('#a').hasAttribute('playing')), false, `${name}: autoplay never sets the playing attribute`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('autoplay="focus" on a touch screen: a tap focuses one card, a tap outside stops it', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    for (const [name, size] of sizes) {
      const { context, page } = await open(browser, size, { hasTouch: true });
      const a = await centre(page, 'a'), b = await centre(page, 'b');
      await page.touchscreen.tap(a.x, a.y);
      assert.deepEqual(await moving(page), { a: 1, b: 0, c: 0 }, `${name}: a tap on A`);
      await page.touchscreen.tap(b.x, b.y);
      assert.deepEqual(await moving(page), { a: 0, b: 1, c: 0 }, `${name}: a tap on B moves the focus`);
      const out = await page.locator('#outside').boundingBox();
      await page.touchscreen.tap(out.x + 5, out.y + 5);
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: a tap outside stops it`);
      const button = await page.locator('#a').evaluate((c) => { const r = c.shadowRoot.querySelector('.motion-button').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await page.touchscreen.tap(button.x, button.y);
      assert.deepEqual(await moving(page), { a: 1, b: 0, c: 0 }, `${name}: the first tap on the button of a still card starts it`);
      await page.touchscreen.tap(button.x, button.y);
      assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 }, `${name}: the next tap pauses it`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
});

test('autoplay="focus" never starts with reduced motion', { skip: !chromium && 'Playwright not installed' }, async () => {
  const browser = await launch(), server = serve(PORT);
  try {
    const { context, page } = await open(browser, sizes[0][1], { reducedMotion: 'reduce' });
    const a = await centre(page, 'a');
    await page.mouse.move(a.x, a.y);
    assert.deepEqual(await moving(page), { a: 0, b: 0, c: 0 });
    assert.equal(await page.evaluate(() => document.querySelector('#a').isMoving), false);
    await context.close();
  } finally { await browser.close(); server.close(); }
});
