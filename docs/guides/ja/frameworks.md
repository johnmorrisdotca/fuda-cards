---
title: フレームワークとバンドラー
section: how-to
order: 9
description: ふつうのHTMLのインポートマップ、バンドラー、React、Vue、Svelte、Angular、サーバーサイドレンダリングでのFudaの使い方を説明します。
---

どちらの要素も標準のカスタム要素なので、カスタムタグを描画できるフレームワークなら表示できます。どこでも守る規則は2つです。**登録用のモジュールを、ブラウザー側で1回だけインポートする**こと、そして**`cards`は属性ではなくプロパティとして設定する**ことです。

## インポートマップを使うふつうのHTML

バンドラーを使わないと、ブラウザーは3つのものを名前から探さなければなりません。パッケージ、kazoku-uiのズームバー（コレクションに必要）、そしてライブ3D用の`three`です。インポートマップで、それぞれの場所を指定します。`dist`と`node_modules/@johnmorrisdotca/kazoku-ui/dist`（またはそのコピー）を配信してください。

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

カード1枚用の`@johnmorrisdotca/fuda-cards/element`は、自前の小さなモジュールしか読み込まないので、kazoku-uiのインポートマップは要りません。

## バンドラー

バンドラーは、すべてを`node_modules`から解決します。ブラウザーで動く場所のどこかで、`@johnmorrisdotca/fuda-cards/element`か`/collection-element`を1回インポートします。この2つのファイルは`sideEffects`に指定されているので、何も使わなくてもバンドラーはこのインポートを残します。

## React

refでプロパティを設定します。TypeScriptでは、お使いのReactのバージョンに合わせて、JSXの`IntrinsicElements`にタグを宣言するか、ラッパーの中でDOMのAPIを呼んで要素を作ります。

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

コンパイラーに、このタグがカスタム要素であることを伝え（`isCustomElement`。Viteでは、Vueプラグインの`template.compilerOptions`）、配列は`.prop`でDOMプロパティとしてバインドします。

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

コンポーネントの`schemas`に`CUSTOM_ELEMENTS_SCHEMA`を加え、登録用のモジュールをブラウザー側のコードで読み込みます。プロパティバインディングで、配列のプロパティが設定されます。

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

## サーバーサイドレンダリング

要素は、モジュールが評価されるときに`HTMLElement`を継承するので、サーバーでインポートすると「HTMLElement is not defined」で失敗します。登録用のモジュールは、DOMができたあとのクライアント側だけでインポートし（Reactでは`useEffect`の中か、サーバーサイドレンダリングを無効にした動的インポート）、サーバーではプレースホルダーを描いてください。メインのエントリー`@johnmorrisdotca/fuda-cards`は、サーバーでも安全です。表と、摩耗や山の計算しか入っていません。

```ts
import { cardMaterials, stackHeightMm } from '@johnmorrisdotca/fuda-cards';

console.log(typeof document, cardMaterials.length, stackHeightMm(10, 0.3));
// undefined 13 3
```

連携は、React 19、Angular 19、Vue 3、Svelte 4でバンドルし、Chromiumで動作を確認しました。お使いのフレームワークのバージョンでも確認してください。フレームワーク用のラッパーはまだありません。
