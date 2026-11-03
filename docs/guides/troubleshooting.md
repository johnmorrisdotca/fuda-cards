---
title: Troubleshooting and FAQ
section: troubleshooting
order: 12
description: Fixes for a blank card, a picture that flashes, a collection that shows nothing, a missing zoom bar, a card that does not turn and the other things that go wrong.
---

## The picture flashes before the card appears

Until the script has defined `<fuda-card>`, a browser draws your `<img>` at its natural size, so the whole picture shows before it moves into the frame. Put this one line in the `<head>`, before the script and your own styles. The card then stays invisible while its box is already reserved at the card's size, so nothing moves when it appears:

```html no-check
<style>fuda-card:where(:not(:defined)){display:inline-block;width:300px;aspect-ratio:2.5/3.5;overflow:hidden;visibility:hidden}fuda-collection:where(:not(:defined)){display:block;min-height:calc(var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px)) + 380px)}</style>
```

Once the card is defined it also keeps the art invisible until it has a size on screen and every slotted image has loaded, then fades it in (no fade with reduced motion). If scripts never run, the card stays blank; add `<noscript><style>fuda-card:not(:defined){visibility:visible}</style></noscript>` if you want the plain picture then.

## The card stays blank

The element is not registered. Check that `@johnmorrisdotca/fuda-cards/element` is imported once in code that runs in the browser, that the path or import map resolves (the network panel shows a 404), and that the picture inside has loaded: the art is hidden until every slotted image has loaded. A failed picture leaves the frame empty.

## "HTMLElement is not defined"

You imported `element` or `collection-element` on a server. They extend `HTMLElement` when evaluated. Import them only in the browser (see [Frameworks and bundlers](frameworks.md#server-rendering)). The main entry and `@johnmorrisdotca/fuda-cards/collection` are safe on a server.

## The collection shows nothing

`cards` is a property. Writing `cards='[...]'` in HTML does nothing. Check the array in script, and run `parseCollection` on it: it throws an `Error` that names the first bad item (a missing `name` or `image`, a duplicate `id`, a `kind` other than `card` or `object`, an invalid `metadata`).

## The zoom bar is missing, or the console says it cannot resolve `@johnmorrisdotca/kazoku-ui/view-controls/define`

On a page without a bundler the collection needs an import map for that name (see [Frameworks and bundlers](frameworks.md#plain-html-with-an-import-map)). The single `<fuda-card>` does not.

## Angle, Tilt and Auto-turn are not there

A collection with no card in it (every item `kind: 'object'`) has nothing that turns, so it offers none of them, and an angle in the address is dropped. The flat displays (everything but the piles) do not turn either.

## Nothing moves

Check `animate="off"` on the element, and the system's reduced-motion setting: with it on, the card's rotation, the pan, autoplay and a live 3D card are off by design. `autoplay="focus"` needs `motion="pan"`. A pan has no distance to travel if the image is not taller than the window after it fills the card's width.

## A card taken off a pile has no room

`pile-controls` draws three buttons under the card: leave about 70 px below it. An open fan or a side pile reaches beyond the card: read `card.pileBounds`, or listen for `fuda-pile`, and fit your layout to it.

## `wear` shows nothing

`perfect`, an empty value, an unknown name or all-zero levels draw nothing, deliberately. Check the spelling against `wearPresets`. Wear is not drawn on the images of a `<fuda-collection>` or on the cards under the top of a stack.

## The edge looks wrong, or the shadow flattens the 3D

The drop shadow is a filter on the element itself. A `filter` on anything between the card and its faces flattens the 3D, so a back appears mirrored. Remove it, or set `--fuda-edge` to change the edge colour.

## Live 3D never starts

The card stays its picture with reduced motion, with no WebGL, after a lost context, and while another card holds focus. `live.focus(card)` resolves to `false` in each case. Check `load` returns the `three` module and that your `item.build` returns a scene, a camera and an `object`.

## Questions

**Does it need a framework?** No. **Does it fetch anything?** Only the image addresses you give it, in the reader's browser. **Does it store anything?** No; the demo saves named collections in the browser's local storage, and the package does not. **Is it accessible?** See [Accessibility and theming](accessibility-and-theming.md) for what is built in and what is tested.
