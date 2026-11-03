---
title: Upgrading
section: upgrading
order: 13
description: What changed in each version that you must act on, from 0.1 to 0.10, and what still works from earlier versions.
---

The package is in early development (0.x), and each minor release can add to the interface. This page lists only what asks something of you. The complete record, dated, is in the [changelog](../../CHANGELOG.md).

## To 0.10

- `@johnmorrisdotca/kazoku-ui` is `^0.10.0`. The zoom bar now shows one number, the true zoom (`1.3×`), where the old `2×` preset read like a number; a press on it goes back to Fit. The bar's basic level is angle, Auto-turn, zoom and Fit, and **More** adds tilt, Front and the arrow pad.
- Live 3D is new: `@johnmorrisdotca/fuda-cards/live-3d` and `collection.live`. `three` is an optional peer dependency. See [Live 3D in a card](live-3d.md).
- Tests: `playwright` 1.64.0 is a development dependency, and the browser tests run headless in software only.

## To 0.9

- `kind` is new on an item: `"card"` (the default) or `"object"`. Every collection written before it is still cards. An object never turns over; mark a console or a trophy `kind: 'object'`. New exports: `collectionKinds`, `isCard`, `CollectionKind`.
- A card is never see-through while it flips: no change needed.

## To 0.8

- **Jukebox Carousel and Flip Tower are gone** as displays. `view="jukebox"` and `view="tower"` still open the deck (`collectionViewAliases` says so) and `collectionViews` lists the ten displays. Infinite Card Atlas is now Card Table; `view="atlas"` is unchanged.
- The binder is now real sheets in a ring or zip binder. New options: `binder`, `cover`, `sheet`, `pockets`. The older `page-size` and `columns` still work.

## To 0.7

- Every pile fans, turns and has a card taken off. New on `<fuda-card>`: `fan`, `taken-off`, `deck-land`, `pile-controls`, `takeOff()`, `putBack()`, `pileBounds` and the event `fuda-pile`.
- **`animate` is on when the attribute is missing.** Set `animate="off"` to keep the jumps of 0.6.0.
- `fan-size` is 2 to 10 (it was 2 to 20).

## To 0.6

- `deck-land="upside-down"` was added, and in 0.6.1 it was found wrong (a card is not turned half way round in its plane). It still works and means `face-down`. `normalizeLanding` converts a value.
- **Update the one CSS line in your page's head**: an undefined `<fuda-collection>` now reserves its view plus 380 px (it was 200 px), because the display buttons make the component taller. The line is in [Troubleshooting](troubleshooting.md#the-picture-flashes-before-the-card-appears).
- The display is a row of buttons, not a drop-down; `theme="light|dark"` chooses the colours.

## To 0.5 and 0.4

- `wear` (0.5) and `material` and `stack` (0.4) are new; a card without them is unchanged, and loads none of their code.

## To 0.2

- **`@johnmorrisdotca/kazoku-ui` is a runtime dependency.** A page without a bundler needs an import map for `@johnmorrisdotca/kazoku-ui/view-controls/define`. See [HTML and CDN](html-and-cdn.md) and [Bundlers](bundlers.md).
- The `address` attribute on `<fuda-collection>` keeps the view's state in the page address.

## Checking an upgrade

```ts
import { collectionViewAliases, collectionViews, normalizeLanding } from '@johnmorrisdotca/fuda-cards/collection';

console.log(collectionViews.map((view) => view.id).join(' '));
console.log(collectionViewAliases.jukebox, normalizeLanding('upside-down'));
// deck rolodex binder case random story wall spotlight atlas fan
// deck face-down
```
