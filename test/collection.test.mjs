import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionViews,parseCollection,randomDrawIndex,movePage} from '../dist/collection.js';
test('each promised view has a distinct stable id',()=>{assert.equal(collectionViews.length,12);assert.equal(new Set(collectionViews.map(v=>v.id)).size,12)});
test('normalizes card input and retains optional back',()=>{assert.deepEqual(parseCollection([{name:'Card',image:'front.jpg',backImage:'back.jpg'}]),[{id:'0',name:'Card',image:'front.jpg',backImage:'back.jpg'}])});
test('rejects malformed cards and duplicate ids',()=>{assert.throws(()=>parseCollection({}),/array/);assert.throws(()=>parseCollection([{name:'Card'}]),/image/);assert.throws(()=>parseCollection([{id:'x',name:'A',image:'a'},{id:'x',name:'B',image:'b'}]),/Duplicate/)});
test('imports collection objects and preserves collector metadata',()=>{
 const [card]=parseCollection({name:'My cards',cards:[{id:'x',name:'A',image:'a',metadata:{set:'Base',year:1999,number:'4',condition:'Good',quantity:2}}]});
 assert.deepEqual(card.metadata,{set:'Base',number:'4',condition:'Good',year:1999,quantity:2});
 assert.throws(()=>parseCollection([{name:'A',image:'a',metadata:{quantity:0}}]),/quantity/);
 assert.throws(()=>parseCollection([{name:'A',image:'a',metadata:'invalid'}]),/metadata/);
});

test('page navigation wraps and handles partial and empty pages',()=>{
  assert.equal(movePage(0,0,3,1),0);
  assert.equal(movePage(0,7,3,-1),6);
  assert.equal(movePage(6,7,3,1),0);
  assert.equal(movePage(3,7,3,1),6);
  assert.equal(movePage(0,2,3,1),0);
});


import { fanLayout, deckLandings, normalizeLanding } from '../dist/collection.js';
test('the fan has twelve displays in all, two landings and a layout that closes to a deck and opens to a hand', () => {
  assert.ok(collectionViews.some((v) => v.id === 'fan'));
  assert.deepEqual(deckLandings.map((l) => l.id), ['face-up', 'face-down'], 'two landings: still facing up, turned over');
  assert.deepEqual(['face-up', 'face-down', 'upside-down', 'turned-over', 'x', null].map(normalizeLanding), ['face-up', 'face-down', 'face-down', 'face-down', 'face-up', 'face-up'], 'the 0.6.0 value upside-down means turned over');
  const open = fanLayout(10, 1);
  assert.equal(open.length, 10);
  assert.deepEqual(fanLayout(10, 1), open, 'the same seed lays the same fan');
  assert.notDeepEqual(fanLayout(10, 2), open);
  assert.ok(open[0].angle < 0 && open[9].angle > 0 && Math.abs(open[0].angle + open[9].angle) < 0.01, 'the hand is centred');
  assert.ok(open.every((p, i) => i === 0 || p.angle > open[i - 1].angle && p.x > open[i - 1].x), 'first card on the left, the rest in order');
  assert.ok(Math.abs(open[9].angle - open[0].angle) <= 110, 'a hand, not a circle');
  assert.equal(open[0].closedX, 0, 'the top card of the closed deck lies square');
  assert.ok(open.every((p) => Math.abs(p.closedAngle) < 5 && Math.abs(p.closedX) < 0.1), 'closed, the cards are nearly one deck');
  assert.deepEqual(fanLayout(0), []);
  assert.equal(fanLayout(1)[0].angle, 0);
});
