---
title: アップグレード
section: upgrading
order: 13
description: 0.1から0.10まで、各バージョンで対応が必要な変更と、以前のバージョンから今も使えるものをまとめます。
---

このパッケージは初期開発中（0.x）で、マイナーリリースごとにインターフェースが増えることがあります。このページには、対応が必要なものだけを書きます。日付つきの完全な記録は[変更履歴](../../../CHANGELOG.md)にあります。

## 0.10へ

- `@johnmorrisdotca/kazoku-ui`は`^0.10.0`です。ズームバーは、本当のズーム値を1つの数字（`1.3×`）で示すようになりました。以前の`2×`は数字のように見えるプリセットでした。数字を押すとFitに戻ります。バーの基本は、角度、自動回転、ズーム、Fitで、**More**で傾き、正面、矢印パッドが加わります。
- ライブ3Dが新しくなりました。`@johnmorrisdotca/fuda-cards/live-3d`と`collection.live`です。`three`は省略可能なピア依存です。[カード内のライブ3D](live-3d.md)を参照してください。
- テスト：`playwright` 1.64.0が開発依存になり、ブラウザーのテストはソフトウェア描画のヘッドレスだけで動きます。

## 0.9へ

- 項目に`kind`が加わりました。`"card"`（初期値）か`"object"`です。この項目ができる前に書いたコレクションは、すべてカードのままです。オブジェクトは裏返りません。ゲーム機やトロフィーには`kind: 'object'`を付けてください。新しいエクスポート：`collectionKinds`、`isCard`、`CollectionKind`。
- 裏返す途中でカードが透けることはなくなりました。対応は要りません。

## 0.8へ

- **ジュークボックス・カルーセルとフリップタワーは表示から削除されました。** `view="jukebox"`と`view="tower"`は今もデッキを開きます（`collectionViewAliases`）。`collectionViews`は10種類の表示を挙げます。無限カードアトラスはカードテーブルになりました。`view="atlas"`は変わりません。
- バインダーは、リングかジップの本物のシートになりました。新しい設定：`binder`、`cover`、`sheet`、`pockets`。以前からの`page-size`と`columns`も使えます。

## 0.7へ

- すべての山が扇状に開き、回り、カードを取り出せます。`<fuda-card>`に加わったもの：`fan`、`taken-off`、`deck-land`、`pile-controls`、`takeOff()`、`putBack()`、`pileBounds`、イベント`fuda-pile`。
- **`animate`は、属性がないときはオンです。** 0.6.0のようにぱっと切り替えたい場合は`animate="off"`にします。
- `fan-size`は2から10になりました（以前は2から20）。

## 0.6へ

- `deck-land="upside-down"`は追加されましたが、0.6.1で誤りと分かりました（カードは同じ面の中で半回転するわけではないため）。今も使え、`face-down`の意味です。`normalizeLanding`で値を変換できます。
- **ページの`<head>`にある1行のCSSを更新してください。** 未定義の`<fuda-collection>`は、表示に加えて380 pxの場所を確保します（以前は200 px）。表示ボタンでコンポーネントが高くなったためです。その1行は[困ったとき・よくある質問](troubleshooting.md#カードが現れる前に画像がちらつく)にあります。
- 表示の選択は、ドロップダウンではなくボタンの列になり、`theme="light|dark"`で配色を選べます。

## 0.5と0.4へ

- `wear`（0.5）と、`material`、`stack`（0.4）が新しく加わりました。これらのないカードは変わらず、そのコードも読み込みません。

## 0.2へ

- **`@johnmorrisdotca/kazoku-ui`は実行時の依存になりました。** バンドラーのないページでは、`@johnmorrisdotca/kazoku-ui/view-controls/define`のインポートマップが要ります。[HTMLとCDN](html-and-cdn.md)と[バンドラー](bundlers.md)を参照してください。
- `<fuda-collection>`の`address`属性が、表示の状態をページのURLに保ちます。

## アップグレードの確認

```ts
import { collectionViewAliases, collectionViews, normalizeLanding } from '@johnmorrisdotca/fuda-cards/collection';

console.log(collectionViews.map((view) => view.id).join(' '));
console.log(collectionViewAliases.jukebox, normalizeLanding('upside-down'));
// deck rolodex binder case random story wall spotlight atlas fan
// deck face-down
```
