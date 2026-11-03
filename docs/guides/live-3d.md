---
title: Live 3D in a card
section: how-to
order: 8
description: Let one card at a time turn in real 3D on a single WebGL context, with every other card a picture, using the live-3d module and your own three.js.
---

A shelf of fifty cards cannot each hold a WebGL context: every card live was measured at 41 contexts (the browser's limit is about 16), 24 cards dropped to a fallback and 40 cards made 108,654 draws in three seconds. `@johnmorrisdotca/fuda-cards/live-3d` is the focus policy that avoids it: **only one card is ever live, on one context for the whole page; every other card is a picture, and a page of pictures loads no 3D code at all.**

## Use it

`three` is yours: an optional peer dependency (`>=0.160.0`), loaded by the function you give as `load` at the first focus.

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

`item.build` returns a scene, a camera and `object`, the thing that turns about its upright axis. Take every geometry, material, texture and model through `assets.acquire` when several cards share them, so one copy is kept ([the shared renderer's guide](https://github.com/johnmorrisdotca/kazoku-ui/blob/main/docs/renderer.md) explains it).

## What `createLiveCards` gives back

| Member | What it does |
|---|---|
| `add(card, item, { still })` | Makes a card live on focus; gives back the function that takes it off. `still` is a picture the card already has: with one, the card costs no 3D code until it is in focus. |
| `focus(card)` | Puts this card in focus. False if it did not go live: another took it, reduced motion, or no WebGL. |
| `blur()` | No card in focus: the live one freezes to a picture and nothing draws. |
| `focused` | The card in focus, if any. |
| `stats` | The renderer's own figures; undefined until it has been needed. |
| `renderer` | The shared renderer; undefined until it has been needed. |
| `dispose()` | Takes every card off and lets go of the renderer. |

Options: `turnSeconds` (12 seconds for a turn; 0 does not turn it), `dwellMs` (150 ms the pointer must rest on a card), `lookAheadPx` (300 px outside the view where a card with no picture of its own gets its still made), and the renderer's own (`maxPixels`, `maxSide`, `stillSize`, `stillBytes`, `lingerMs`, `releaseMs`, `onContext`).

## In a collection

```ts no-check
import '@johnmorrisdotca/fuda-cards/collection-element';
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';

const live = createLiveCards({ load: () => import('three') });
const collection = document.querySelector('fuda-collection') as HTMLElement & { live: unknown };
collection.live = { cards: live, item: (card: { id: string }) => ({ key: card.id, build: async () => { throw new Error('make your scene here'); } }) };
```

Every display then goes live on the card in focus.

## The rules

- **One card live at a time.** The card under the pointer after a rest of `dwellMs`, the one holding keyboard focus, the one last pressed. A pointer passing over a page of cards starts nothing. Leaving the card, or pressing elsewhere, ends it.
- **The old card freezes at its last angle,** and its still is made from the same context at that angle (shared per 5 degrees), so it goes on from there when focused again.
- **Reduced motion: no live card.** The card stays its picture and no 3D code loads.
- **Nothing runs at rest.** No frame is asked for, and nothing is drawn, with no card in focus, out of sight or in a hidden tab.
- **No WebGL, or a lost context:** the card stays its picture, and draws again on a restored context.

## Budgets, held by a test

`pnpm test:freeze` (`test/e2e/live-3d.e2e.mjs`) holds these: 1 WebGL context over 30 focus changes, never more than one canvas; 0 draws, 0 frame requests and 0 frame callbacks over 2 seconds at rest; none while out of sight or in a hidden tab; GPU objects that do not grow after the first round; a canvas within 6 megapixels and 4096 a side on a 5120 by 2880 screen at ratio 2; and no `three`, renderer or model fetched before the first focus. `dist/live-3d.js` is 7.5 KB, 2.3 KB gzipped. The tests draw in software, so they prove the counts and nothing about a real GPU: frame times, driver behaviour and GPU memory are not measured. Try it in the [live 3D demo](https://johnmorrisdotca.github.io/fuda-cards/demo/live-3d.html).
