---
title: HTMLとCDN
section: how-to
order: 9
description: ビルドなしでカードをページに置く方法です。jsDelivrまたはunpkgから読み込みます。コレクションとライブ3Dにはインポートマップを使います。
---

カードに必要なのはscriptタグ1つだけです。`<fuda-card>`は自分の小さなモジュールしかインポートしないので、インポートマップはいりません。どちらのCDNもこのパッケージを配信します。`pnpm test:usage`は、下のページをそれぞれ開き、CDNの返事をnpmが作るとおりのパッケージで置き換えて確かめています。

## jsDelivrから

アドレスの終わりに`/+esm`を付けると、jsDelivrはパッケージのサブパスを、依存するものと一緒にまとめて返します。

```html no-check
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/fuda-cards/element/+esm"></script>
  </head>
  <body>
    <fuda-card title="Explorer One" category="ROCKET" variant="cosmic" finish="foil" stack="10" wear="near-mint">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E" alt="Explorer One" />
    </fuda-card>
  </body>
</html>
```

## unpkgから

unpkgはパッケージのファイルをそのまま配信します。`?module`を付けると、ブラウザーがたどれるようにインポートを書き換えて返します。

```html no-check
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/fuda-cards/dist/element.js?module"></script>
  </head>
  <body>
    <fuda-card title="Explorer One" category="ROCKET" variant="sport" finish="matte" material="steel-0.5">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Crect width='10' height='10' fill='%23335'/%3E%3C/svg%3E" alt="Explorer One" />
    </fuda-card>
  </body>
</html>
```

## CDNから使うコレクションとライブ3D

`<fuda-collection>`はズームバーの描画にkazoku-uiを使い、ライブ3Dは`three`を読み込みます。バンドラーなしでは、インポートマップでそれぞれの場所を指定します。

```html
<script type="importmap">
{ "imports": {
  "@johnmorrisdotca/fuda-cards/collection-element": "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/fuda-cards/collection-element/+esm"
} }
</script>
<fuda-collection view="binder"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ id: 'one', name: 'Example', image: 'one.jpg' }];
</script>
```

1枚のカードには、このどれも必要ありません。同じモジュールをサーバーやバンドラーで読み込む方法は、[バンドラー](bundlers.md)と[フレームワーク](frameworks.md)を見てください。
