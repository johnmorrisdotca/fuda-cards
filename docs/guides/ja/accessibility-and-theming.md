---
title: アクセシビリティとテーマ
section: explanation
order: 10
description: Fudaのカードとコレクションが、キーボード、タッチ、スクリーンリーダー、動きの軽減のために行うこと、任せていること、設定できるすべての色と大きさです。
---

## 組み込まれているもの

- **キーボード。** コレクションの表示ボタンはラジオグループで、タブ停止は1つ、矢印キーで選択が動きます。表示の中のカードは、アクセシブルな名前が「Inspect」とカード名のボタンで、EnterかSpaceで開きます。表示にフォーカスがあるとき、`+`、`-`、`0`でズームとFitができます。カードのAnimateボタンは`aria-pressed`を持つ本物のボタンです。
- **タッチ。** すべての操作は48 px四方以上です。カードの上から始めたドラッグやピンチも使え、動かなかったタップは、クリックとしてカードに渡されます。
- **動きの軽減。** `prefers-reduced-motion: reduce`のときは、カードの回転、裏返しの遷移、画像のパン、自動再生、ライブ3Dのカードがすべて止まります。飛ぶ動きと扇は、アニメーションなしで移り、どの動きも、動きありの場合と同じ位置で終わります。有効にするための設定は要りません。
- **予期しない動きはない。** カードが勝手に自動再生することはなく、閲覧者が動きの軽減を求めている場合は、自動回転も始まりません。
- **画像の説明は利用側の役目。** カードの絵は、スロットに入れたものそのものです。各`<img>`に`alt`を付けてください。コレクションの項目では、スクリーンリーダーが読み上げるのは`name`です。

## 利用側に任されていること

渡す画像のコントラスト、画像の説明、要素のまわりのページです。ブラウザー、支援技術、端末の確認範囲は限られています（[制限](../../../README.md#limits)を参照）。ここにあるものは、デスクトップとスマートフォンの大きさのヘッドレスChromiumで確かめたもので、実機のスマートフォン、Safari、Firefoxでは確かめていません。

## ライトとダーク

コレクションは、初期値では閲覧者のライト／ダークの設定に従います。要素に`theme="light"`か`theme="dark"`を付けると、ページ側で決められます。カードスタジオとデモも、同じ理由でURLの`?theme=`を読みます。

```html
<fuda-collection view="deck" theme="dark"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ name: 'Alpha', image: '/a.jpg' }];
</script>
```

## 大きさと余白

| 設定 | 変わるもの |
|---|---|
| `fuda-card`の`width` | カードの大きさ。内側はすべてコンテナー単位で比例して変わる。初期値300 px。 |
| `fuda-collection`の`--fuda-stage-height` | 表示の高さ。初期値はウィンドウの高さから440 pxを引いた値で、300から620 pxの間。 |
| `fuda-card`の`--fuda-perspective` | 3Dで回したときの奥行き。初期値`1000px`。 |
| `fuda-card`の`--fuda-edge` | 縁の色。任意のCSS背景。 |
| `--fuda-pan-duration` | 画像のパン1回の時間。 |
| `--fuda-card-spin-duration` | `card-spin`の1周の時間。初期値`180s`。 |
| `--fuda-yaw`、`--fuda-tilt` | `card-view`のときの角度。 |
| `--fuda-focus-x`、`--fuda-focus-y` | 画像で中心にする位置。 |

シャドウルートは外部のスタイルシートからは閉じているので、これらのカスタムプロパティが外へ開かれたインターフェースです。枠の色は`variant`と`finish`で決まります。

## ステージを画面に収める

ズームバーは表示の下にあります。ビューアーの上に置くものを短くして、操作が最初の画面に収まるようにしてください。低いウィンドウでは、`--fuda-stage-height`を小さくします。

```html
<style>fuda-collection { --fuda-stage-height: clamp(260px, calc(100svh - 620px), 620px); }</style>
<fuda-collection view="case"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ name: 'Alpha', image: '/a.jpg' }];
</script>
```

## 関連

カードが空白、またはちらつく場合は[困ったとき・よくある質問](troubleshooting.md)、動くものすべては[動きと回転](motion-and-spin.md)を参照してください。
