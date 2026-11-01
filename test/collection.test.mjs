import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionViews,parseCollection} from '../dist/collection.js';
test('each promised view has a distinct stable id',()=>{assert.equal(collectionViews.length,11);assert.equal(new Set(collectionViews.map(v=>v.id)).size,11)});
test('normalizes card input and retains optional back',()=>{assert.deepEqual(parseCollection([{name:'Card',image:'front.jpg',backImage:'back.jpg'}]),[{id:'0',name:'Card',image:'front.jpg',backImage:'back.jpg'}])});
test('rejects malformed cards and duplicate ids',()=>{assert.throws(()=>parseCollection({}),/array/);assert.throws(()=>parseCollection([{name:'Card'}]),/image/);assert.throws(()=>parseCollection([{id:'x',name:'A',image:'a'},{id:'x',name:'B',image:'b'}]),/Duplicate/)});
