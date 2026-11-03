---
title: iframeに埋め込む
section: how-to
order: 12
description: 自分で作らないページにカードを載せる方法です。埋め込みページのiframeを使い、設定はそのアドレスに入れます。
---

`demo/embed.html`は、`<iframe>`に入れるために作ったページで、カード以外は何もなく、アドレスに書かれた内容を描きます。何も追跡せず、訪れた人の端末に何も残さず、指定された絵以外は何も読み込みません。

```html no-check
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>A Fuda card in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/fuda-cards/demo/embed.html?title=Explorer+One&variant=sport&finish=foil&stack=10&card-spin=center"
      title="Explorer One, a silver card on a stack of ten"
      width="340"
      height="480"
      loading="lazy"
      style="border: 0"
    ></iframe>
  </body>
</html>
```

## アドレス

`<fuda-card>`の設定はどれも、属性名のままパラメーターにできます。`title`、`variant`、`finish`、`stack`、`wear`、`material`、`card-spin`などで、残りは[カード要素](card-element.md)にあります。スイッチは`1`にします。`image`は絵のアドレスで、指定しなければスターシップの絵になります。[ビルダー](https://johnmorrisdotca.github.io/fuda-cards/builder.html)は、選んだ設定から、幅と高さを含めたiframeを書き出します。

コレクションには専用のページ`demo/embed-collection.html`があり、コレクションの属性（`view`、`cover`、`pockets`）をパラメーターにでき、見本のカード18枚か、`cards`で指定したJSONファイルを表示します。

## 大きさ

ページはiframeに合わせます。カードはiframeが許す幅まで、最大300ピクセルの幅になり、縦横の比は保ちます。例のように、iframeの高さは幅の1.4倍に、影の分の余裕を少し足してください。
