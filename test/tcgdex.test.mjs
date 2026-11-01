import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSet, fetchSet} from '../demo/tcgdex-data.js';
test('maps card records, preserving missing images and rejecting non-TCGdex image URLs',()=>{
 const cards=normalizeSet({cards:[{id:'base1-4',name:'Charizard',localId:'4',image:'https://assets.tcgdex.net/en/base/base1/4'},{id:'x',name:'Unknown'},{id:'y',name:'Bad',image:'https://example.com/x'}]});
 assert.equal(cards[0].largeImage,'https://assets.tcgdex.net/en/base/base1/4/high.webp');assert.equal(cards[1].image,null);assert.equal(cards[2].image,null);
});
test('reports service errors and malformed payloads',async()=>{
 await assert.rejects(fetchSet(async()=>({ok:false,status:503})),/503/);
 assert.throws(()=>normalizeSet({}),/unexpected/);
});
