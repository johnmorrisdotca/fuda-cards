---
title: TypeScriptとNode
section: how-to
order: 13
description: すべての設定の型と、DOMのないサーバーでも動く表、計算、配置を説明します。
---

パッケージは自分の型を同梱しています。`CardOptions`はカードのすべての設定の型で、`cardAttributes(options)`がそれを属性にし、素材、山の枚数、傷みの段階の表はただのデータです。名前や値の間違いはビルド時のエラーになります。下の例の最後の行は、わざとそのエラーにしてあります。

```ts
import {
  type CardMaterial,
  type CardOptions,
  cardAttributes,
  cardMaterial,
  stackHeightMm,
  wearPresets,
} from "@johnmorrisdotca/fuda-cards";

const options: CardOptions = { title: "Explorer One", material: "paper-310-black-core", stack: 52, wear: "near-mint" };
const stock: CardMaterial | undefined = cardMaterial(options.material);
console.log(stock?.name, stackHeightMm(options.stack ?? 1, stock?.thicknessMm ?? 0.325));
console.log(Object.keys(cardAttributes(options)).join(" "), wearPresets.length);

// @ts-expect-error "neon" is not a look
cardAttributes({ variant: "neon" });
```

## サーバーで

メインのエントリー`@johnmorrisdotca/fuda-cards`、コレクションの補助関数（`/collection`）、配置の関数は、ブラウザーなしで動きます。要素は`HTMLElement`を継承するので、クライアント側だけでインポートしてください（[フレームワーク](frameworks.md)を見てください）。

```js
import { cardMaterials, stackHeightMm, stackLayout, wearLayout, wearPreset } from "@johnmorrisdotca/fuda-cards";

// The tables and the maths run on a server too: nothing here touches a browser.
const black = cardMaterials.find((material) => material.id === "paper-310-black-core");
console.log(stackHeightMm(52, black.thicknessMm));
console.log(stackLayout(52, { seed: 7 }).length);
console.log(wearLayout(wearPreset("damaged").levels, 3).front.creases.length > 0);
```

## 副作用のない部分

山の配置と傷みの配置は、数字とシードだけで決まる純粋な関数です。同じシードなら、Nodeでもブラウザーでもいつでも同じ山と同じ傷になるので、カードの見た目は、設定とシードとして書き残せます。
