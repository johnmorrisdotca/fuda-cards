import {test} from 'node:test';
import {strict as assert} from 'node:assert';

test('view attribute can be set by frameworks on collection elements', async () => {
 const previous={HTMLElement:globalThis.HTMLElement,customElements:globalThis.customElements};
 try {
  globalThis.HTMLElement=class {attachShadow(){return {}}};
  globalThis.customElements={get(){return undefined},define(){}};
  const {FudaCollection}=await import('../dist/collection-element.js');
  const element=new FudaCollection();
  assert.equal('view' in element, false, 'frameworks must treat view as an attribute');
 } finally {globalThis.HTMLElement=previous.HTMLElement;globalThis.customElements=previous.customElements;}
});
