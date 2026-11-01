import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoUsers } from '../demo/users.js';
import { parseCollection } from '../dist/collection.js';
test('demo profiles have three distinct, valid collections', () => {
 assert.equal(demoUsers.length,3);
 assert.equal(new Set(demoUsers.map(user=>user.id)).size,3);
 const sets=demoUsers.map(user=>parseCollection(user.cards).map(card=>card.id).sort().join(','));
 assert.equal(new Set(sets).size,3);
});
