---
title: Embed in an iframe
section: how-to
order: 12
description: Show a card on a page you do not build, with an iframe of the embed page and the settings in its address.
---

`demo/embed.html` is a page made for an `<iframe>`: a card and nothing else, drawn from what its address says. It tracks nothing, keeps nothing on the visitor's device and loads nothing but the picture it was told to.

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

## The address

Every setting of `<fuda-card>` is a parameter, by its attribute name: `title`, `variant`, `finish`, `stack`, `wear`, `material`, `card-spin` and the rest of [the card element](card-element.md). A switch is `1`. `image` is the address of the picture (the Starship picture otherwise). The [Builder](https://johnmorrisdotca.github.io/fuda-cards/builder.html) writes the iframe for you, with its width and height, from the settings you choose.

A collection has its own page, `demo/embed-collection.html`, with the collection's attributes (`view`, `cover`, `pockets`) as parameters and eighteen sample cards, or the JSON file that `cards` names.

## Sizing

The page fits the iframe: the card is as wide as the iframe allows, up to 300 pixels, and keeps its proportions. Give the iframe a width and a height of 1.4 times the width plus a little room for the shadow, as the example does.
