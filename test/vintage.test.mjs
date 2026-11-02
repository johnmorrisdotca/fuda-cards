import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hockeyCards, hockeySource } from '../demo/vintage-hockey.js';
import { baseballCards, baseballSource } from '../demo/vintage-baseball.js';
import { parseCollection } from '../dist/collection.js';

test('the vintage demo cards are valid collections with a public source and a credit on every card', () => {
  for (const [cards, source, host] of [[hockeyCards, hockeySource, 'commons.wikimedia.org'], [baseballCards, baseballSource, 'images.metmuseum.org']]) {
    assert.ok(cards.length >= 20, 'enough cards to fill a page');
    assert.equal(parseCollection(cards).length, cards.length);
    assert.match(source.url, /^https:\/\//);
    assert.match(source.licence, /[Pp]ublic domain/);
    assert.match(source.checked, /^2026-11-02$/);
    for (const card of cards) {
      assert.equal(new URL(card.image).hostname, host, card.id);
      assert.match(card.metadata.notes, /^Public domain\b.*https:\/\//, `${card.id} names its licence and its page`);
      assert.ok(!/\b(NHL|NFL|MLB|NBA|Topps|Upper Deck|Panini|Fleer)\b/.test(card.name + JSON.stringify(card.metadata)), `${card.id}: no league or maker mark in the data`);
    }
  }
  assert.ok(hockeyCards.some((c) => c.backImage), 'one hockey card has its back');
});

test('no picture, league or maker mark is shipped in the package', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.ok(!pkg.files.some((f) => f.startsWith('demo') || f.startsWith('assets/') && /jpg|png|webp/.test(f)), 'the demo and its pictures are not in the package files');
});
