---
title: カード内のライブ3D
section: how-to
order: 8
description: 1つのWebGLコンテキストで、同時に1枚のカードだけを本物の3Dで回し、ほかは画像にします。live-3dモジュールと自分のthree.jsを使います。
---

50枚のカードが、それぞれWebGLコンテキストを持つことはできません。全カードをライブにしたときは41個のコンテキストが測定され（ブラウザーの上限は約16個）、24枚が代替表示に落ち、40枚で3秒間に108,654回の描画が行われました。`@johnmorrisdotca/fuda-cards/live-3d`は、それを避けるためのフォーカスの方針です。**ライブになるカードは常に1枚だけで、ページ全体で1つのコンテキストを使い、ほかのカードは画像です。画像だけのページは、3Dのコードをまったく読み込みません。**

## 使い方

`three`は利用側で用意します。省略可能なピア依存（`>=0.160.0`）で、最初にフォーカスされたとき、`load`に渡した関数が読み込みます。

```ts no-check
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';

const live = createLiveCards({ load: () => import('three') });   // loads nothing yet

const rocket = {
  key: 'rocket:starship',                                         // cards with the same key share their pictures
  async build({ three, assets, width, height }: any) {
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(30, width / height, 0.01, 1000);
    const object = new three.Mesh(new three.BoxGeometry(1, 2, 1), new three.MeshNormalMaterial());
    scene.add(object);
    camera.position.z = 5;
    return { scene, camera, object, resize: (w: number, h: number) => { camera.aspect = w / h; camera.updateProjectionMatrix(); } };
  },
};

const card = document.querySelector('fuda-card') as HTMLElement;
const off = live.add(card, rocket, { still: card.querySelector('img') as HTMLImageElement });
// later: off() takes the card out; live.dispose() lets go of the renderer
```

`item.build`は、シーン、カメラ、そして`object`（縦軸のまわりで回るもの）を返します。複数のカードで共有するジオメトリ、マテリアル、テクスチャ、モデルは、すべて`assets.acquire`を通して取得してください。実体が1つだけ保たれます（[共有レンダラーのガイド](https://github.com/johnmorrisdotca/kazoku-ui/blob/main/docs/renderer.md)を参照）。

## `createLiveCards`が返すもの

| メンバー | 働き |
|---|---|
| `add(card, item, { still })` | フォーカスされたときにカードをライブにし、そのカードを外す関数を返す。`still`はカードがすでに持っている画像で、あればカードはフォーカスされるまで3Dのコードを必要としない。 |
| `focus(card)` | このカードにフォーカスを当てる。ライブにならなかった場合は偽で、理由はほかのカードがライブになっている、動きの軽減、WebGLがない、のいずれか。 |
| `blur()` | どのカードもフォーカスしない。ライブだったカードは画像に固定され、何も描かれない。 |
| `focused` | フォーカスされているカード（あれば）。 |
| `stats` | レンダラー自身の数値。必要になるまでundefined。 |
| `renderer` | 共有レンダラー。必要になるまでundefined。 |
| `dispose()` | すべてのカードを外し、レンダラーを手放す。 |

オプションは、`turnSeconds`（1周の秒数、12。0なら回さない）、`dwellMs`（ポインターがカードの上で止まる時間、150 ms）、`lookAheadPx`（自前の画像を持たないカードの静止画を作る、表示範囲の外側の距離、300 px）、そしてレンダラー自身のオプション（`maxPixels`、`maxSide`、`stillSize`、`stillBytes`、`lingerMs`、`releaseMs`、`onContext`）です。

## コレクションの中で

```ts no-check
import '@johnmorrisdotca/fuda-cards/collection-element';
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';

const live = createLiveCards({ load: () => import('three') });
const collection = document.querySelector('fuda-collection') as HTMLElement & { live: unknown };
collection.live = { cards: live, item: (card: { id: string }) => ({ key: card.id, build: async () => { throw new Error('make your scene here'); } }) };
```

どの表示でも、フォーカスされたカードがライブになります。

## ルール

- **ライブは同時に1枚だけ。** `dwellMs`のあいだ止まったポインターの下のカード、キーボードのフォーカスを持つカード、最後に押したカード。カードの上を通り過ぎるだけでは何も始まりません。カードから離れる、または別の場所を押すと終わります。
- **古いカードは最後の角度で止まります。** その静止画は同じコンテキストからその角度（5度ごとに共有）で作られるので、再びフォーカスされたとき、そこから続きます。
- **動きの軽減：ライブなし。** カードは画像のままで、3Dのコードは読み込まれません。
- **静止中は何も動かない。** フォーカスされたカードがないとき、画面の外にあるとき、非表示のタブでは、フレームを要求せず、何も描きません。
- **WebGLがない、またはコンテキストが失われた場合：** カードは画像のままで、コンテキストが戻れば再び描かれます。

## テストで守る予算

`pnpm test:freeze`（`test/e2e/live-3d.e2e.mjs`）が次の項目を守ります。フォーカスを30回変えてもWebGLコンテキストは1つで、キャンバスも1つまで。静止中の2秒間は、描画0回、フレーム要求0回、フレームコールバック0回で、画面外や非表示のタブでも同様。最初の1巡のあとでGPUオブジェクトが増えない。ピクセル比2の5120×2880の画面で、キャンバスが600万ピクセル以内、1辺4096以内。最初のフォーカスの前に、`three`、レンダラー、モデルを取得しない。`dist/live-3d.js`は7.5 KB、gzipで2.3 KBです。テストはソフトウェア描画で行うので、数の確認はできても、実際のGPUについては何も証明しません。フレーム時間、ドライバーの挙動、GPUメモリは測っていません。[ライブ3Dのデモ](https://johnmorrisdotca.github.io/fuda-cards/demo/live-3d.html)で試せます。
