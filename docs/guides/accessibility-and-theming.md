---
title: Accessibility and theming
section: explanation
order: 10
description: What a Fuda card and collection do for keyboards, touch, screen readers and reduced motion, what they leave to you, and every colour and size you can set.
---

## What is built in

- **Keyboard.** The display buttons of a collection are a radio group: one tab stop, the arrow keys move the choice. A card in a display is a button with the accessible name "Inspect" and its name, and Enter or Space opens it. The view takes `+`, `-` and `0` for zoom and Fit while it is focused. The Animate button of a card is a real button with `aria-pressed`.
- **Touch.** Every control is at least 48 px square. A drag or a pinch on the view works even when it starts on a card; a tap that did not move is passed on to the card as a click.
- **Reduced motion.** With `prefers-reduced-motion: reduce`: the card's rotation, its flip transition, the art's pan, autoplay and a live 3D card are all off; flights and fans move without animating; every move still ends in the same place as with motion. This is not something you opt into.
- **No hidden surprises.** A card never autoplays by itself, and Auto-turn does not start when the reader asks for reduced motion.
- **A picture's description is yours.** The art in a card is whatever you slot into it. Give each `<img>` an `alt`; for items in a collection, `name` is what a screen reader hears.

## What is left to you

Contrast of the art you supply, descriptions for your images, and the page around the element. Browser, assistive technology and device coverage is limited (see the [limits](../../README.md#limits)): everything here has been tested in headless Chromium at a desk and a phone size, and not on a real phone, in Safari or in Firefox.

## Light and dark

A collection follows the reader's light or dark setting by default. `theme="light"` or `theme="dark"` on the element chooses for them. The Card Studio and the demos read `?theme=` from the address for the same reason.

```html
<fuda-collection view="deck" theme="dark"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ name: 'Alpha', image: '/a.jpg' }];
</script>
```

## Size and spacing

| Setting | What it changes |
|---|---|
| `width` of `fuda-card` | The card's size; everything inside scales (container units). Default 300 px. |
| `--fuda-stage-height` on `fuda-collection` | The height of the view. Default: the window less 440 px, between 300 and 620 px. |
| `--fuda-perspective` on `fuda-card` | The depth of 3D turns. Default `1000px`. |
| `--fuda-edge` on `fuda-card` | The colour of the edge, any CSS background. |
| `--fuda-pan-duration` | Seconds for one pass of the art's pan. |
| `--fuda-card-spin-duration` | Seconds for one turn of `card-spin`. Default `180s`. |
| `--fuda-yaw`, `--fuda-tilt` | The angles with `card-view`. |
| `--fuda-focus-x`, `--fuda-focus-y` | The focal point of the art. |

The shadow root is closed to your stylesheet, so these custom properties are the interface. The frame's colours come from `variant` and `finish`.

## Keep the stage on screen

The zoom bar sits under the view. Keep what is above the viewer short so the controls are on the first screen; shrink `--fuda-stage-height` on a short window.

```html
<style>fuda-collection { --fuda-stage-height: clamp(260px, calc(100svh - 620px), 620px); }</style>
<fuda-collection view="case"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [{ name: 'Alpha', image: '/a.jpg' }];
</script>
```

## Related

[Troubleshooting](troubleshooting.md) for a card that is blank or flashes, and [Motion and rotation](motion-and-spin.md) for everything that moves.
