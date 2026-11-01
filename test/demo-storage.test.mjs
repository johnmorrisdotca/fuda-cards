import test from 'node:test';
import assert from 'node:assert/strict';
import {listCollections,saveCollection,deleteCollection,importLegacy,legacyKey} from '../demo/storage.js';
const storage = () => {const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const cards=[{id:'1',name:'Card',image:'card.png'}];
test('saved collections are isolated by profile and can be deleted',()=>{
 const store=storage(); saveCollection(store,'alex','My cards',cards); saveCollection(store,'sam','My cards',[]);
 assert.equal(listCollections(store,'alex')['My cards'].length,1); assert.equal(listCollections(store,'sam')['My cards'].length,0);
 deleteCollection(store,'alex','My cards'); assert.deepEqual(listCollections(store,'alex'),{}); assert.equal(listCollections(store,'sam')['My cards'].length,0);
});
test('legacy import preserves the original and never overwrites existing names',()=>{
 const store=storage(); store.setItem(legacyKey,JSON.stringify({Shared:cards,Existing:cards})); saveCollection(store,'alex','Existing',[]);
 assert.equal(importLegacy(store,'alex'),1); assert.equal(listCollections(store,'alex').Existing.length,0); assert.equal(listCollections(store,'alex').Shared.length,1); assert.ok(store.getItem(legacyKey));
});
test('invalid data and storage failures do not silently replace saved data',()=>{
 const store=storage();store.setItem(legacyKey,'not json');assert.throws(()=>importLegacy(store,'alex'));assert.equal(store.getItem(legacyKey),'not json');
 assert.throws(()=>saveCollection({getItem:()=>null,setItem:()=>{throw Error('quota')}},'alex','Cards',cards),/quota/);
 assert.throws(()=>saveCollection(store,'alex','',cards),/name/);
});
