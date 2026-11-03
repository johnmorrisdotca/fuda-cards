---
title: バンドラー
section: how-to
order: 10
description: Viteまたはwebpackでカードを使う方法です。要素は、ブラウザーで動くコードの中で1回インポートするだけで、ほかに設定はいりません。
---

バンドラーはすべてを`node_modules`から解決します。`@johnmorrisdotca/fuda-cards/element`（コレクションなら`/collection-element`も）を、ブラウザーで動く場所のどこかで1回インポートしてください。パッケージは要素のファイルを副作用ありと印してあるので、インポートしたものを何も使わなくても、バンドラーはそのインポートを残します。どちらの例も、`pnpm test:usage`がnpmの作るとおりのパッケージからビルドし、できたページを開いて確かめています。

## Vite

```ts no-run
import "@johnmorrisdotca/fuda-cards/element";
import { type CardOptions, cardAttributes } from "@johnmorrisdotca/fuda-cards";

const options: CardOptions = { title: "Explorer One", category: "ROCKET", stack: 10, wear: "near-mint" };
const card = document.createElement("fuda-card");
for (const [name, value] of Object.entries(cardAttributes(options))) card.setAttribute(name, value);
document.getElementById("app")?.append(card);
```

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Fuda Cards with Vite</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

## webpack

```js no-run
import "@johnmorrisdotca/fuda-cards/element";

const card = document.createElement("fuda-card");
card.setAttribute("title", "Explorer One");
card.setAttribute("variant", "cosmic");
document.body.append(card);
```

```js
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

## 得られるもの

山、傷み、カードの山のためのモジュールは、カードがそれを必要としたときだけ読み込まれるので、ふつうのカードは軽く済みます。各エントリーポイントの大きさは[アーキテクチャ](architecture.md)にあります。
