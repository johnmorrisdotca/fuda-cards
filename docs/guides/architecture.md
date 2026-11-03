---
title: Architecture
section: explanation
order: 11
description: How the package is split into small modules, why a plain card loads almost nothing, and what each file in src does.
---

Fuda is plain TypeScript compiled to ES modules, with no framework and no 3D engine. Its design rule is that **a page pays only for what it uses**: a card with no wear never loads the wear code, a card with no stack never loads the pile code, and a page of pictures never loads three.js.

## The entry points

| Entry | File | What it is | Size (raw, gzip -9) |
|---|---|---|---|
| `@johnmorrisdotca/fuda-cards` | `dist/index.js` | Types and tables: variants, finishes, materials, stack presets, the stack and wear maths. No DOM. | 0.4 KB, plus its modules |
| `.../element` | `dist/element.js` | Registers `<fuda-card>`. | 21.4 KB, 6.5 KB |
| `.../collection` | `dist/collection.js` | The collection's data rules: `parseCollection`, views, kinds, the fan's layout. No DOM. | 4.7 KB, 1.6 KB |
| `.../collection-element` | `dist/collection-element.js` | Registers `<fuda-collection>`. | 45.1 KB, 13.4 KB |
| `.../live-3d` | `dist/live-3d.js` | The focus policy for live 3D cards. | 7.5 KB, 2.3 KB |

## The modules behind them

- **`element.ts`** draws the card: two faces, an edge made of thin planes, the art slot, the Animate button and the pan, the spin. It imports `materials.ts` and `stack.ts`, and loads the rest on demand. The class it registers, `FudaCard`, is exported too, for a subclass or a type.
- **`wear.ts`** (17 KB) is a module of its own, loaded with `import()` only when a card has a `wear` attribute. A perfect card is drawn exactly as before.
- **`pile-card.ts`** (13.7 KB) holds the fan, the take-off and the side pile for `<fuda-card stack>`, loaded only when a card asks for `fan`, `taken-off` or `pile-controls`.
- **`pile.ts`** is what every pile shares: the landing, the fan layout and the timing (`animate`, `speed`, reduced motion). Both the card and the collection use it, so a pile behaves the same everywhere.
- **`stack.ts`** lays the cards under the top one from a seed (a small seeded generator, mulberry32), the same way each time.
- **`materials.ts`** is the table of sourced thicknesses and the stack presets.
- **`binder.ts`** builds the sheets, the pockets and the turning leaf.
- **`zoom.ts`** and **`choice.ts`** wire the collection to the view controls of kazoku-ui and draw its rows of choice buttons.
- **`collection-element.ts`** draws the ten displays, in the class `FudaCollection`.
- **`live-3d.ts`** decides which card is live; the context itself, the shared assets, the stills and the pixel budget belong to kazoku-ui's shared renderer.

```ts
import { cardMaterials, stackLayout, wearLayout, wearLevels } from '@johnmorrisdotca/fuda-cards';

const levels = wearLevels({ wear: 'damaged' });
console.log(cardMaterials.length, stackLayout(11).length, Boolean(levels && wearLayout(levels, 1)));
// 13 10 true
```

## Drawing

A card is a stack of CSS 3D planes, not WebGL. Thickness is `calc(var(--mm) * 100cqw / 63)`, so it follows the element's width, and the edge is a set of thin planes between the faces. A stack is one 3D scene whatever its count and draws nothing while at rest. Moves are CSS transforms and one-shot animations that end by themselves; nothing runs on a timer. The one place that uses WebGL is live 3D, and there only one context ever exists.

The art is kept hidden until the card has a size on screen and every slotted image has loaded, so the raw picture never shows outside the frame (see [Troubleshooting](troubleshooting.md#the-picture-flashes-before-the-card-appears)).

## Dependencies

`@johnmorrisdotca/kazoku-ui` is a runtime dependency (zoom bar, shared renderer). `three` is an optional peer, yours. A single `<fuda-card>` imports neither.

## Tests

`pnpm test` runs unit tests on the tables and the rules. `pnpm test:e2e` drives headless Chromium, in software, at a desk and a phone size, one file at a time. Both are part of `pnpm check` and the release. See [Development](../../README.md#development).
