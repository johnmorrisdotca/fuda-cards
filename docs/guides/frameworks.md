---
title: Frameworks
section: how-to
order: 11
description: Use the card in React, Vue, Svelte and Angular, with the element imported only in the browser, and the whole page in plain HTML, a bundler or an iframe elsewhere.
---

Both elements are standard custom elements, so any framework that can render a custom tag can show them. Two rules hold everywhere: **import the registration module once, in the browser only** (the elements extend `HTMLElement`, which a server does not have), and **set a collection's `cards` as a property, not an attribute**. A card's settings are attributes, and `cardAttributes(options)` writes them from an object, so the same options work in every framework. Each example below is a file in `examples/` that `pnpm test:usage` builds and opens against the package as npm packs it.

## React

The component imports the element in an effect, so a server render never reaches it, and spreads the attributes of the options. Declare the tag for TypeScript once.

```tsx
import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";
import { useEffect } from "react";

export function FudaCard({ picture, ...options }: CardOptions & { picture: string }) {
  useEffect(() => {
    // The element needs a browser, so it is imported here, never at the top of the file: a server render never reaches an effect.
    void import("@johnmorrisdotca/fuda-cards/element");
  }, []);
  return (
    <fuda-card {...cardAttributes(options)}>
      <img src={picture} alt={options.title ?? ""} />
    </fuda-card>
  );
}
```

```ts
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "fuda-card": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, string | undefined>;
    }
  }
}
```

## Vue 3

Tell the compiler that the tag is a custom element (`isCustomElement`, in the Vue plugin's `template.compilerOptions` for Vite), and import the element once the component is on the page.

```vue
<script setup lang="ts">
import { onMounted } from "vue";

defineProps<{ title: string; picture: string; stack?: number; wear?: string }>();

// The element needs a browser: import it once the component is on the page, never while a server renders it.
onMounted(() => {
  void import("@johnmorrisdotca/fuda-cards/element");
});
</script>

<template>
  <fuda-card :title="title" :stack="stack" :wear="wear"><img :src="picture" :alt="title" /></fuda-card>
</template>
```

```ts no-check
import { createApp, h } from "vue";
import FudaCard from "./FudaCard.vue";

const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";
const app = createApp({ render: () => h(FudaCard, { title: "Explorer One", picture, stack: 10, wear: "near-mint" }) });
app.config.compilerOptions.isCustomElement = (tag) => tag === "fuda-card";
app.mount("#app");
```

## Svelte

`onMount` never runs on the server, so the import goes there.

```svelte
<script lang="ts">
import { onMount } from "svelte";

let {
  title,
  picture,
  stack = 1,
  wear = "",
}: { title: string; picture: string; stack?: number; wear?: string } = $props();

// The element needs a browser: onMount never runs on the server.
onMount(() => {
  void import("@johnmorrisdotca/fuda-cards/element");
});
</script>

<fuda-card {title} {stack} {wear}><img src={picture} alt={title} /></fuda-card>
```

## Angular

Add `CUSTOM_ELEMENTS_SCHEMA` to the component's schemas and load the element in browser code. A property binding on `[attr.name]` writes the attribute.

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, type OnInit } from "@angular/core";

@Component({
  selector: "app-fuda-card",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fuda-card [attr.title]="title" [attr.stack]="stack" [attr.wear]="wear"><img [src]="picture" [alt]="title" /></fuda-card>`,
})
export class FudaCardComponent implements OnInit {
  @Input() title = "Explorer One";
  @Input() picture =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E";
  @Input() stack = 10;
  @Input() wear = "near-mint";

  ngOnInit(): void {
    // The element needs a browser: ngOnInit also runs when a server renders, so the import waits for one.
    if (typeof window !== "undefined") void import("@johnmorrisdotca/fuda-cards/element");
  }
}
```

## A collection in a framework

The collection takes an array, so set it as a DOM property: in React with a ref and an effect (`ref.current.cards = cards`), in Vue with `:cards.prop="cards"`, in Svelte with `bind:this` and a statement that runs when the array changes, and in Angular with the property binding `[cards]="cards"`. [Collections](collections.md) lists what an item holds.

## Where to go next

The page itself can be plain HTML from a CDN ([HTML and CDN](html-and-cdn.md)), a bundler's ([Bundlers](bundlers.md)) or an iframe of the embed page ([Embed in an iframe](embed-in-an-iframe.md)). TypeScript's types and the server side are in [TypeScript and Node](typescript-and-node.md).
