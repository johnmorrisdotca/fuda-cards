---
title: カード要素
section: how-to
order: 2
description: fuda-card要素のすべての属性、プロパティ、CSS変数と、それぞれの初期値、大きさと見た目の整え方を説明します。
---

`<fuda-card>`は、画像、またはスロットに入れたほかのHTMLを囲む枠です。`@johnmorrisdotca/fuda-cards/element`をインポートすると自分で登録され、必要なのはそのインポートだけです。メインのエントリー（`@johnmorrisdotca/fuda-cards`）は、同じオプションをTypeScriptの型と表として公開し、DOMには触れないので、サーバーでも安全にインポートできます。

## 枠

| 属性 | 値 | 働き |
|---|---|---|
| `title` | テキスト | 上部のカード名。 |
| `category` | テキスト | 角に出す言葉。例：`ROCKET`。 |
| `subtitle` | テキスト | 画像の下の1行。 |
| `description` | テキスト | サブタイトルの下の文章。 |
| `number` | テキスト | 下部のカード番号。 |
| `rarity` | テキスト | 下部のレアリティの印。 |
| `variant` | `classic`、`sport`、`cosmic` | 枠の見た目。金、銀、紫。 |
| `finish` | `foil`、`matte` | 枠が光るかどうか。 |
| `flipped` | 真偽値 | 裏面（紺色のFudaの面）を見せる。 |

既定のスロットには画像を入れます。`<img>`でも、既存のインタラクティブなビューアーを含む任意のHTMLでも構いません。カードにはドラッグの処理がないので、そのビューアーが自分でポインターを扱います。

```ts
import { cardFinishes, cardVariants, type CardOptions } from '@johnmorrisdotca/fuda-cards';

const options: CardOptions = { title: 'Explorer One', variant: cardVariants[2], finish: cardFinishes[0], thickness: 0.3 };
console.log(options.variant, options.finish);
// cosmic foil
```

## 大きさ

要素は初期値で幅300 px、`aspect-ratio: 2.5 / 3.5`で、内側の寸法はすべてコンテナー単位なので、CSSを1行書くだけでカード全体の大きさが変わります。

```html
<script type="module">import '@johnmorrisdotca/fuda-cards/element';</script>
<style>fuda-card.small { width: 180px; }</style>
<fuda-card class="small" title="Small"></fuda-card>
```

3Dで回すときの遠近は`--fuda-perspective`（初期値`1000px`）です。縁の色は`--fuda-edge`で、任意のCSS背景を指定できます。初期値は、classicの枠が金、ほかの枠がカード用紙のクリーム色です。ドロップシャドウは要素そのものに付いているので、カードとその面の間にある要素に`filter`を付けないでください。

## プロパティとメソッド

| メンバー | 内容 |
|---|---|
| `card.wear` | 属性と同じ、摩耗のプリセット。空文字列を代入すると取り除かれる。 |
| `card.cardThicknessMm` | 実際に使われる厚み。`thickness`、なければ素材の厚み、なければ0.3。 |
| `card.stackCount` | 山の枚数。1から1000。 |
| `card.stackHeight` | 山の高さ（ミリメートル）。 |
| `card.heldCount` | 取り出した分を除いて、山に残っている枚数。 |
| `card.fanOpen` | 山が扇状に開いているときに真。 |
| `card.isMoving` | 画像がパンしているときに真。 |
| `card.takeOff(count?)`、`card.putBack(count?)` | カードを脇の山へ移す、戻す。 |
| `card.pileBounds` | 開いた扇や脇の山がカードの外へ広がる距離。カードの幅を単位とする。 |
| `card.setFocused(on)` | `autoplay="focus"`のために、このカードをフォーカス状態にする、または外す。 |

`pileBounds`が変わると、`fuda-pile`イベントが送られます。山、摩耗、動きのコードは別のモジュールです。[アーキテクチャ](architecture.md)を参照してください。

## 関連するガイド

厚みと山：[素材と山](materials-and-stacks.md)。使い込んだカード：[摩耗](wear.md)。回転とパン：[動きと回転](motion-and-spin.md)。扇と取り出し：[バインダーと山](binder-and-piles.md)。
