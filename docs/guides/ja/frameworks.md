---
title: フレームワーク
section: how-to
order: 11
description: React、Vue、Svelte、Angularでカードを使う方法です。要素のインポートはブラウザー側だけで行います。ふつうのHTML、バンドラー、iframeは別のガイドにあります。
---

どちらの要素も標準のカスタム要素なので、カスタムタグを描画できるフレームワークなら表示できます。どこでも守る規則は2つです。**登録用のモジュールを、ブラウザー側で1回だけインポートする**こと（要素は`HTMLElement`を継承しますが、サーバーにはありません）、そして**コレクションの`cards`は属性ではなくプロパティに設定する**ことです。カードの設定は属性で、`cardAttributes(options)`がオブジェクトから属性を作るので、同じ設定がどのフレームワークでも使えます。下の例はどれも`examples/`のファイルで、`pnpm test:usage`が、npmが作るとおりのパッケージを使ってビルドし、開いて確かめています。

## React

コンポーネントは効果（effect）の中で要素をインポートするので、サーバーでの描画はそこに届きません。設定の属性は展開して渡します。TypeScriptでは、タグを1度だけ宣言します。

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

タグがカスタム要素であることをコンパイラーに伝え（Viteでは、Vueプラグインの`template.compilerOptions`の`isCustomElement`）、コンポーネントがページに載ってから要素をインポートします。

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

`onMount`はサーバーでは実行されないので、インポートはそこに置きます。

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

コンポーネントのschemasに`CUSTOM_ELEMENTS_SCHEMA`を加え、要素はブラウザー側のコードで読み込みます。`[attr.name]`のプロパティバインディングで属性を書き込みます。

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

## フレームワークの中のコレクション

コレクションは配列を受け取るので、DOMのプロパティとして設定します。Reactではrefと効果（`ref.current.cards = cards`）、Vueでは`:cards.prop="cards"`、Svelteでは`bind:this`と、配列が変わるたびに実行される文、Angularではプロパティバインディング`[cards]="cards"`を使います。項目に入れられる内容は[コレクション](collections.md)にあります。

## 次に読むもの

ページそのものは、CDNから読むふつうのHTML（[HTMLとCDN](html-and-cdn.md)）、バンドラー（[バンドラー](bundlers.md)）、埋め込みページのiframe（[iframeに埋め込む](embed-in-an-iframe.md)）のどれでも作れます。TypeScriptの型とサーバー側は[TypeScriptとNode](typescript-and-node.md)にあります。
