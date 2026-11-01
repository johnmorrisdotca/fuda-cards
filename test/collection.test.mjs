import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionViews,parseCollection,randomDrawIndex,movePage} from '../dist/collection.js';
test('each promised view has a distinct stable id',()=>{assert.equal(collectionViews.length,11);assert.equal(new Set(collectionViews.map(v=>v.id)).size,11)});
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

