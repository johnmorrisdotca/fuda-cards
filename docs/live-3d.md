# Live 3D in a card

`@johnmorrisdotca/fuda-cards/live-3d`. Many cards on screen, one of them turning in 3D: the one in focus. This module is the focus policy. Everything underneath it (the one WebGL context, the shared assets, the stills, the frames, the pixel budget, context loss) is kazoku-ui's shared renderer (`@johnmorrisdotca/kazoku-ui/renderer`, its `docs/renderer.md`).

Why it exists: every card live was measured at 41 WebGL contexts (16 alive, the browser's limit), 24 cards dropped to a fallback and 108,654 draws in 3 s for 40 cards.

## Use

```js
import { createLiveCards } from '@johnmorrisdotca/fuda-cards/live-3d';

const live = createLiveCards({ load: () => import('three') }); // loads nothing yet

const rocket = {
  key: 'rocket:starship',                          // cards with the same key share their pictures
  async build({ three, assets, width, height }) {
    const gltf = await assets.acquire('glb:starship', () => new GLTFLoader().loadAsync(url), (loading) => loading.then((g) => disposeDeep(g.scene)));
    const object = gltf.scene.clone(true);         // shares the geometry and the materials
    const scene = new three.Scene(); scene.add(object /* and lights */);
    const camera = new three.PerspectiveCamera(30, width / height, 0.01, 1000);
    return { scene, camera, object, resize: (w, h) => { camera.aspect = w / h; camera.updateProjectionMatrix(); } };
  },
};

const off = live.add(card, rocket, { still: card.querySelector('img') });
```

- `add(card, item, { still })` works on a `<fuda-card>` or any element with a size, and gives back the function that takes it off. `still` is a picture the card already has: with one, the card costs no 3D code until it is in focus. Without one, the renderer makes its picture when the card comes within `lookAheadPx` of the view, one at a time.
- `item.build` is a kazoku-ui item plus `object`, what turns about its upright axis. Take every geometry, material, texture and model through `assets.acquire`.
- `focus(card)`, `blur()`, `focused`, `stats` (the renderer's), `renderer`, `dispose()`.
- `<fuda-collection>`: `collection.live = { cards: live, item: (card) => itemFor(card) }`; every display then goes live on the card in focus.
- Options: `turnSeconds` (12), `dwellMs` (150), `lookAheadPx` (300), and the renderer's own (`maxPixels`, `maxSide`, `stillSize`, `stillBytes`, `lingerMs`, `releaseMs`, `onContext`, ...).

Dependencies: `@johnmorrisdotca/kazoku-ui` is already a dependency; `three` is an optional peer, yours, loaded by your `load`. A bundler makes a chunk of the renderer; an unbundled page lists `@johnmorrisdotca/kazoku-ui/renderer` and `three` in its import map (see `demo/live-3d.html`).

## The rules

- **One card live at a time.** The card under the pointer after a rest of `dwellMs`, the one holding keyboard focus, the one last pressed. A pointer passing over a page of cards starts nothing. Leaving the card, or pressing elsewhere, ends it.
- **The old card freezes at its last angle.** Its still is made from the same context at that angle (shared per 5 degrees) and it goes on from there when it is focused again. Until that still is ready, for a moment, the card shows its previous picture.
- **Reduced motion: no live card.** The card stays its picture, no 3D code loads.
- **Nothing runs at rest.** No frame is asked for and nothing is drawn with no card in focus, out of sight or in a hidden tab.
- **No WebGL, or a lost context:** the card stays its picture; on a restored context it draws again.

## The budgets (`pnpm test:freeze`, `test/e2e/live-3d.e2e.mjs`)

| Budget | Held to |
|---|---|
| WebGL contexts over 30 focus changes | 1, at every moment, with at most one canvas |
| At rest, over 2 s | 0 draws, 0 frame requests, 0 frame callbacks |
| Out of sight and in a hidden tab, over 1.2 s | 0 draws, 0 frame requests; while seen, one frame at a time |
| GPU objects (made minus deleted) after the first round of focus changes | no growth over further rounds |
| Canvas on a 5120x2880 screen at ratio 2, with a card that fills it | within 6 MP and 4096 a side |
| A page of pictures | no `three`, no renderer, no model fetched before the first focus; `dist/live-3d.js` under 3 KB gzipped; `dist/element.js` and `dist/collection-element.js` do not reach for it |

Each budget also runs against a build broken on purpose (a module served with one line changed) and must fail, so a green budget means something. The release runs this test too (`freeze-command` in `.github/workflows/release.yml`).

## What a test here cannot prove

The tests draw in software (ANGLE on SwiftShader), because a test run on a Mac's own GPU panicked its driver. So nothing here measures a real GPU: frame times, driver behaviour, GPU memory and how a Metal driver takes the context moving between cards are not checked. The counts (contexts, draws, frames, GPU objects, canvas size) do not depend on the GPU. WebKit has no software switch, so Safari is not run off CI.
