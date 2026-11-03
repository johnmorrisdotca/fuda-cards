---
title: The card element
section: how-to
order: 2
description: Every attribute, property and CSS variable of the fuda-card element, with the default of each and how to size and style a card.
---

`<fuda-card>` is a frame for a picture, or for anything else you slot into it. It registers itself when you import `@johnmorrisdotca/fuda-cards/element`, and that import is the only thing it needs. The main entry (`@johnmorrisdotca/fuda-cards`) exports the same options as TypeScript types and tables without touching the DOM, so it is safe to import on a server.

## The frame

| Attribute | Values | What it does |
|---|---|---|
| `title` | text | The card's name at the top. |
| `category` | text | A word in the corner, such as `ROCKET`. |
| `subtitle` | text | A line under the picture. |
| `description` | text | The text block under the subtitle. |
| `number` | text | The card number at the foot. |
| `rarity` | text | The rarity mark at the foot. |
| `variant` | `classic`, `sport`, `cosmic` | The frame's look: gold, silver or violet. |
| `finish` | `foil`, `matte` | Whether the frame shines. |
| `flipped` | boolean | Shows the back, the navy Fuda face. |

The default slot holds the art: an `<img>`, or any HTML, including an existing interactive viewer. The card has no drag handler, so that viewer owns its own pointer.

```ts
import { cardFinishes, cardVariants, type CardOptions } from '@johnmorrisdotca/fuda-cards';

const options: CardOptions = { title: 'Explorer One', variant: cardVariants[2], finish: cardFinishes[0], thickness: 0.3 };
console.log(options.variant, options.finish);
// cosmic foil
```

## Size

The element is 300 px wide by default, `aspect-ratio: 2.5 / 3.5`, and every measurement inside it is in container units, so one CSS rule sizes the whole card:

```html
<script type="module">import '@johnmorrisdotca/fuda-cards/element';</script>
<style>fuda-card.small { width: 180px; }</style>
<fuda-card class="small" title="Small"></fuda-card>
```

The perspective for 3D turns is `--fuda-perspective` (default `1000px`). The edge colour is `--fuda-edge`, any CSS background; the default is gold for the classic frame and card-stock cream for the others. The drop shadow is on the element itself, so do not put a `filter` on anything between the card and its faces.

## Properties and methods

| Member | What it gives |
|---|---|
| `card.wear` | The wear preset, as the attribute. Setting an empty string removes it. |
| `card.cardThicknessMm` | The thickness in use: `thickness`, else the material's, else 0.3. |
| `card.stackCount` | How many cards the stack holds, 1 to 1000. |
| `card.stackHeight` | The stack's height in millimetres. |
| `card.heldCount` | How many cards are still in the stack, after any taken off. |
| `card.fanOpen` | True while the stack is fanned open. |
| `card.isMoving` | True while the art pans. |
| `card.takeOff(count?)`, `card.putBack(count?)` | Move cards to the pile at the side and back. |
| `card.pileBounds` | How far an open fan or a side pile reaches beyond the card, in card widths. |
| `card.setFocused(on)` | Put this card in or out of focus for `autoplay="focus"`. |

The `fuda-pile` event is sent when `pileBounds` changes. The pile, wear and motion code are separate modules; see [Architecture](architecture.md).

## Related guides

Thickness and stacks: [Materials and stacks](materials-and-stacks.md). Used cards: [Wear](wear.md). Turning and panning: [Motion and rotation](motion-and-spin.md). Fanning and taking off: [Binders and piles](binder-and-piles.md).
