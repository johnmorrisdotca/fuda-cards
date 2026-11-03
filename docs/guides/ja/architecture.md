---
title: アーキテクチャ
section: explanation
order: 11
description: パッケージが小さなモジュールにどう分かれているか、ふつうのカードがほとんど何も読み込まない理由、srcの各ファイルの役割を説明します。
---

Fudaは、フレームワークも3Dエンジンも使わず、ESモジュールにコンパイルされるふつうのTypeScriptです。設計の原則は、**ページは使うものの分だけ負担する**ことです。摩耗のないカードは摩耗のコードを読み込まず、山のないカードは山のコードを読み込まず、画像だけのページはthree.jsを読み込みません。

## エントリーポイント

| エントリー | ファイル | 内容 | サイズ（圧縮前、gzip -9） |
|---|---|---|---|
| `@johnmorrisdotca/fuda-cards` | `dist/index.js` | 型と表：バリアント、仕上げ、素材、山のプリセット、山と摩耗の計算。DOMなし。 | 0.4 KB（ほかに依存モジュール） |
| `.../element` | `dist/element.js` | `<fuda-card>`を登録する。 | 21.4 KB、6.5 KB |
| `.../collection` | `dist/collection.js` | コレクションのデータの規則：`parseCollection`、表示、種類、扇の配置。DOMなし。 | 4.7 KB、1.6 KB |
| `.../collection-element` | `dist/collection-element.js` | `<fuda-collection>`を登録する。 | 45.1 KB、13.4 KB |
| `.../live-3d` | `dist/live-3d.js` | ライブ3Dのカードのフォーカスの方針。 | 7.5 KB、2.3 KB |

## 各エントリーを支えるモジュール

- **`element.ts`**はカードを描きます。2つの面、薄い面を重ねた縁、画像のスロット、Animateボタンとパン、回転です。`materials.ts`と`stack.ts`をインポートし、残りは必要なときに読み込みます。登録するクラス`FudaCard`もエクスポートされるので、サブクラスや型に使えます。
- **`wear.ts`**（17 KB）は独立したモジュールで、カードに`wear`属性があるときだけ`import()`で読み込まれます。摩耗のないカードは、以前とまったく同じに描かれます。
- **`pile-card.ts`**（13.7 KB）は、`<fuda-card stack>`の扇、取り出し、脇の山を受け持ち、カードが`fan`、`taken-off`、`pile-controls`を求めたときだけ読み込まれます。
- **`pile.ts`**は、すべての山が共有するものです。着地、扇の配置、時間の扱い（`animate`、`speed`、動きの軽減）です。カードとコレクションの両方が使うので、山はどこでも同じように動きます。
- **`stack.ts`**は、一番上の下にあるカードを、シードから毎回同じように並べます（シード付きの小さな乱数生成器mulberry32）。
- **`materials.ts`**は、出典のある厚みの表と、山のプリセットです。
- **`binder.ts`**は、シート、ポケット、めくれるページを作ります。
- **`zoom.ts`**と**`choice.ts`**は、コレクションをkazoku-uiの表示操作につなぎ、選択ボタンの列を描きます。
- **`collection-element.ts`**は、クラス`FudaCollection`で10種類の表示を描きます。
- **`live-3d.ts`**は、どのカードをライブにするかを決めます。コンテキスト、共有アセット、静止画、ピクセルの予算は、kazoku-uiの共有レンダラーのものです。

```ts
import { cardMaterials, stackLayout, wearLayout, wearLevels } from '@johnmorrisdotca/fuda-cards';

const levels = wearLevels({ wear: 'damaged' });
console.log(cardMaterials.length, stackLayout(11).length, Boolean(levels && wearLayout(levels, 1)));
// 13 10 true
```

## 描画

カードはWebGLではなく、CSSの3D平面の重なりです。厚みは`calc(var(--mm) * 100cqw / 63)`なので要素の幅に従い、縁は面の間に置いた薄い平面の集まりです。山は、枚数が何枚でも1つの3Dシーンで、静止中は何も描きません。動きはCSSの変形と、自分で終わる1回きりのアニメーションで、タイマーで動くものはありません。WebGLを使うのはライブ3Dだけで、そこでもコンテキストは常に1つしかありません。

画像は、カードが画面上の大きさを持ち、スロットのすべての画像が読み込まれるまで隠されるので、元の画像が枠の外に出ることはありません（[困ったとき・よくある質問](troubleshooting.md#カードが現れる前に画像がちらつく)を参照）。

## 依存

`@johnmorrisdotca/kazoku-ui`は実行時の依存です（ズームバー、共有レンダラー）。`three`は省略可能なピア依存で、利用側で用意します。`<fuda-card>`1枚だけなら、どちらも読み込みません。

## テスト

`pnpm test`は、表と規則の単体テストを実行します。`pnpm test:e2e`は、ソフトウェア描画のヘッドレスChromiumを、デスクトップとスマートフォンの大きさで、1ファイルずつ動かします。どちらも`pnpm check`とリリースに含まれます。[開発](../../../README.md#development)を参照してください。
