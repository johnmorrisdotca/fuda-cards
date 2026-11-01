import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionViews,parseCollection,randomDrawIndex} from '../dist/collection.js';
test('each promised view has a distinct stable id',()=>{assert.equal(collectionViews.length,11);assert.equal(new Set(collectionViews.map(v=>v.id)).size,11)});
test('normalizes card input and retains optional back',()=>{assert.deepEqual(parseCollection([{name:'Card',image:'front.jpg',backImage:'back.jpg'}]),[{id:'0',name:'Card',image:'front.jpg',backImage:'back.jpg'}])});
test('rejects malformed cards and duplicate ids',()=>{assert.throws(()=>parseCollection({}),/array/);assert.throws(()=>parseCollection([{name:'Card'}]),/image/);assert.throws(()=>parseCollection([{id:'x',name:'A',image:'a'},{id:'x',name:'B',image:'b'}]),/Duplicate/)});

test('random draw handles filters and empty or single matches',()=>{
  const cards=parseCollection([{name:'Alpha',image:'a'},{name:'Beta',image:'b'},{name:'Alpine',image:'c'}]);
  assert.equal(randomDrawIndex([],0,''),null);
  assert.equal(randomDrawIndex(cards,0,'missing'),null);
  assert.equal(randomDrawIndex(cards,0,' BETA '),1);
  assert.equal(randomDrawIndex(cards,1,'beta'),1);
  assert.equal(randomDrawIndex(cards,0,'al',()=>0),2);
  assert.equal(randomDrawIndex(cards,1,'al',()=>0),0);
  assert.equal(randomDrawIndex(cards,1,'al',()=>0.99),2);
});
