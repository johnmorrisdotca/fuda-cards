# Framework integration

Build with `pnpm build`, then install or link the package in the host application. The package is not published yet. Import each element's registration entry once in browser code. `cards` is a JavaScript **property**, not an HTML attribute: assign an array of `{ id, name, image, backImage? }` objects. Image URLs are supplied by the host. Equivalent integrations were bundled and exercised in Chromium using React 19, Angular 19, Vue 3 and Svelte 4; check your framework version and server-rendering setup.

## Plain HTML

```html
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [
    {id: 'one', name: 'Example', image: '/cards/one.jpg'}
  ];
</script>
<fuda-collection view="binder"></fuda-collection>
```

For an unbundled page, replace the bare import with the URL of `dist/collection-element.js` and serve the complete `dist` directory.

## React

Use a ref to set the array property. In TypeScript projects, declare the custom element in JSX's intrinsic element types for your React version, or create it with DOM APIs in a wrapper.

```jsx
import {useEffect, useRef} from 'react';
import '@johnmorrisdotca/fuda-cards/collection-element';
function Cards({cards}) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.cards = cards; }, [cards]);
  return <fuda-collection ref={ref} view="binder" />;
}
```

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the standalone component's schemas (or to its NgModule), and load the registration entry in browser code. Angular property binding sets the array property.

```ts
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import '@johnmorrisdotca/fuda-cards/collection-element';
@Component({selector: 'app-cards', standalone: true, schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<fuda-collection view="binder" [cards]="cards"></fuda-collection>'})
export class CardsComponent {
  cards = [{id: 'one', name: 'Example', image: '/cards/one.jpg'}];
}
```

## Vue 3

Configure the Vue compiler's `isCustomElement` option for `fuda-collection` (for Vite, in the Vue plugin's `template.compilerOptions`). Use a DOM property binding for the array.

```vue
<script setup>
import '@johnmorrisdotca/fuda-cards/collection-element';
defineProps({ cards: {type: Array, required: true} });
</script>
<template><fuda-collection view="binder" :cards.prop="cards" /></template>
```

## Svelte

Assign the property to a bound element; changes to `cards` update it after mounting.

```svelte
<script>
  import {onMount} from 'svelte';
  import '@johnmorrisdotca/fuda-cards/collection-element';
  export let cards = [];
  let viewer;
  onMount(() => { viewer.cards = cards; });
  $: if (viewer) viewer.cards = cards;
</script>
<fuda-collection bind:this={viewer} view="binder"></fuda-collection>
```

These elements extend `HTMLElement` at module evaluation time. For server-side rendering, import their registration modules only on the client after the DOM exists; render a placeholder on the server. Do not import a browser registration entry in server-only code.
