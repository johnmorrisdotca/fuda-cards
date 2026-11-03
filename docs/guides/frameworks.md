---
title: Frameworks and bundlers
section: how-to
order: 9
description: Use Fuda in plain HTML with an import map, in a bundler, and in React, Vue, Svelte and Angular, including server rendering and the cards property.
---

Both elements are standard custom elements, so any framework that can render a custom tag can show them. The two rules that matter are the same everywhere: **import the registration module once, in the browser**, and **set `cards` as a property**, never as an attribute.

## Plain HTML with an import map

Without a bundler the browser has to find three things by name: the package, kazoku-ui's zoom bar (the collection needs it) and, for live 3D, `three`. An import map says where each lives. Serve `dist` and `node_modules/@johnmorrisdotca/kazoku-ui/dist` (or copies of them):

```html
<script type="importmap">
{ "imports": {
  "@johnmorrisdotca/fuda-cards/collection-element": "/node_modules/@johnmorrisdotca/fuda-cards/dist/collection-element.js",
  "@johnmorrisdotca/kazoku-ui/view-controls/define": "/node_modules/@johnmorrisdotca/kazoku-ui/dist/view-controls/define.js"
} }
</script>
<fuda-collection view="binder"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ id: 'one', name: 'Example', image: '/cards/one.jpg' }];
</script>
```

The single card, `@johnmorrisdotca/fuda-cards/element`, imports only its own small modules and needs no import map for kazoku-ui.

## A bundler

A bundler resolves everything from `node_modules`. Import `@johnmorrisdotca/fuda-cards/element` or `/collection-element` once, anywhere that runs in the browser. The package marks these two files in `sideEffects`, so a bundler keeps the import even though nothing is used from it.

## React

Set the property with a ref. In TypeScript, declare the tags in JSX's intrinsic elements for your React version, or create the element with DOM calls in a wrapper.

```jsx
import { useEffect, useRef } from 'react';
import '@johnmorrisdotca/fuda-cards/collection-element';

export function Cards({ cards }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.cards = cards; }, [cards]);
  return <fuda-collection ref={ref} view="binder" />;
}
```

## Vue 3

Tell the compiler the tag is a custom element (`isCustomElement`, in the Vue plugin's `template.compilerOptions` for Vite) and bind the array as a DOM property with `.prop`:

```vue
<script setup>
import '@johnmorrisdotca/fuda-cards/collection-element';
defineProps({ cards: { type: Array, required: true } });
</script>
<template><fuda-collection view="binder" :cards.prop="cards" /></template>
```

## Svelte

```svelte
<script>
  import { onMount } from 'svelte';
  import '@johnmorrisdotca/fuda-cards/collection-element';
  export let cards = [];
  let viewer;
  onMount(() => { viewer.cards = cards; });
  $: if (viewer) viewer.cards = cards;
</script>
<fuda-collection bind:this={viewer} view="binder"></fuda-collection>
```

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the component's schemas and load the registration module in browser code. Property binding sets the array property.

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@johnmorrisdotca/fuda-cards/collection-element';

@Component({
  selector: 'app-cards',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: '<fuda-collection view="binder" [cards]="cards"></fuda-collection>',
})
export class CardsComponent {
  cards = [{ id: 'one', name: 'Example', image: '/cards/one.jpg' }];
}
```

## Server rendering

The elements extend `HTMLElement` when their module is evaluated, so importing one on a server fails with "HTMLElement is not defined". Import the registration module only on the client, after the DOM exists (in React, inside `useEffect` or a dynamic import with server rendering off), and render a placeholder on the server. The main entry, `@johnmorrisdotca/fuda-cards`, is safe on a server: it holds only the tables and the wear and stack maths.

```ts
import { cardMaterials, stackHeightMm } from '@johnmorrisdotca/fuda-cards';

console.log(typeof document, cardMaterials.length, stackHeightMm(10, 0.3));
// undefined 13 3
```

The integrations were bundled and exercised in Chromium with React 19, Angular 19, Vue 3 and Svelte 4; check your own framework version. There are no framework wrappers yet.
