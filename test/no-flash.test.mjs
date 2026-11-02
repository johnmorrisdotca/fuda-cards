import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const line = (await read('README.md')).match(/<style>fuda-card:where[^\n]*?<\/style>/)?.[0];

test('the README documents the one CSS line that keeps an unready card hidden', () => {
  assert.ok(line, 'README has no no-flash line');
  assert.match(line, /fuda-card:where\(:not\(:defined\)\)\{[^}]*visibility:hidden/);
  assert.match(line, /aspect-ratio:2\.5\/3\.5/);
});

test('every demo page that uses a fuda element carries the line in its head before any script', async () => {
  for (const page of ['index.html', 'demo/collections.html', 'demo/collections-component.html']) {
    const html = await read(page), head = html.slice(0, html.indexOf('</head>'));
    assert.ok(head.includes(line), `${page} lacks the no-flash line in its head`);
    assert.ok(!html.slice(0, html.indexOf(line)).includes('<script'), `${page}: the line must come before every script`);
  }
});

test('the element keeps the art invisible until the card is laid out and its images have loaded', async () => {
  const source = await read('src/element.ts');
  assert.match(source, /\.art ::slotted\(\*\)\{[^}]*opacity:0/);
  assert.match(source, /\.art\.ready ::slotted\(\*\)\{opacity:1\}/);
  assert.match(source, /prefers-reduced-motion:reduce\)\{[^@]*\.art ::slotted\(\*\)\{transition:none\}/);
});
