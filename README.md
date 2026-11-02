# Fuda Cards

Reusable collectible card frames for caller-provided images and interactive 3D viewers. The core is a standards-based web component, suitable for plain HTML, Angular, React, Vue, Svelte, and other frameworks that support custom elements. No framework or 3D engine is required by the component. `<fuda-card>` imports only its own small modules (the materials and the stack layout); `<fuda-collection>` uses [`@johnmorrisdotca/kazoku-ui`](https://github.com/johnmorrisdotca/kazoku-ui) for its zoom controls (see Collection viewer).

This is an early prototype: classic, sport and cosmic are exploratory CSS designs, not yet historically researched recreations or photorealistic materials. The demo uses a still from Uchusen Rockets; see [assets/README.md](assets/README.md) for its model credit.

## Demos

[Open the Fuda Cards demos](https://johnmorrisdotca.github.io/fuda-cards/). The Card Studio and the collection and Pokémon binder demos are built together for GitHub Pages. From the studio, follow the collection links to explore them. Run `pnpm site` to build the static site in `site/`; serve that directory to review it. The Pages workflow runs the checks and deploys the site on pushes to `main`.

## Development

Requires Node 22+ and pnpm. Run `pnpm install`, `pnpm check`, then `pnpm dev` and open http://localhost:8100. `pnpm build` emits JavaScript and TypeScript declarations to `dist/`.

## Embed

```html
<!-- in the head, first: the one line from "No flash before the card is ready" below -->
<script type="module" src="/path/to/fuda-cards/dist/element.js"></script>
<fuda-card title="Explorer One" category="ROCKET" variant="cosmic" finish="foil" description="A new explorer.">
  <img src="rocket.jpg" alt="Explorer One rocket">
</fuda-card>
```

In a bundler, import `@johnmorrisdotca/fuda-cards/element` once before rendering `<fuda-card>`. Frameworks may require custom-element configuration (for example, Angular's `CUSTOM_ELEMENTS_SCHEMA`). Framework-specific wrappers have not yet been implemented; see [framework integration examples](docs/framework-integration.md). For published releases, install with `npm install @johnmorrisdotca/fuda-cards`.

The default slot accepts HTML, including an existing interactive 3D viewer; its owner handles rotation, zoom and model loading. The card has no drag-to-flip handler, leaving pointer interaction to that viewer. Control the card's reverse independently by adding or removing the `flipped` attribute. The demo provides a flip button. Attributes: `title`, `category`, `subtitle`, `description`, `number`, `rarity`, `variant` (`classic`, `sport`, `cosmic`), `finish` (`foil`, `matte`), `thickness` (millimetres, default `0.3`), `material`, `stack`, `wear` and `flipped` (boolean). Set the element width to scale it. The main package entry exports the TypeScript options and available variants and finishes without registering the custom element.

3D integrations, framework-specific examples, polished front and back designs, accessibility validation, and photorealistic finishes remain future work.

Collection presentation prototypes are available as a reusable `<fuda-collection>` component. See the [collection demo](demo/collections-component.html) and [collection display notes](docs/collection-displays.md).

### No flash before the card is ready

A card never shows the art it is about to frame. Until the script has defined `<fuda-card>`, a browser draws your `<img>` at its natural size, so the whole picture flashes before it moves into the frame. Put this one line in the `<head>`, before the script and your own styles, and the card stays invisible while its box is already reserved at the card's size (nothing moves when it appears):

```html
<style>fuda-card:where(:not(:defined)){display:inline-block;width:300px;aspect-ratio:2.5/3.5;overflow:hidden;visibility:hidden}fuda-collection:where(:not(:defined)){display:block;min-height:calc(var(--fuda-stage-height,clamp(300px,calc(100svh - 440px),620px)) + 380px)}</style>
```

It keeps `<fuda-card>` (300 px wide, 2.5:3.5, or whatever width your own rule gives it) and `<fuda-collection>` (the height of its view, `--fuda-stage-height`) in place. Once defined, the card also keeps the art invisible until the card has a size on screen and every slotted image has loaded, then fades it in (no fade with `prefers-reduced-motion`). Without the line the card still reveals the art only inside its frame after it is defined, but the browser may show the raw picture until your script runs. If scripts never run, the card stays blank; add `<noscript><style>fuda-card:not(:defined){visibility:visible}</style></noscript>` if you want the plain picture then.

### Back face and thickness

A card turned past 90° shows its back (the navy FUDA face), never the mirrored front, and the front's Animate button cannot be seen or clicked from behind. The back is the card's own face and is shown for `flipped` too.

The card has thickness, drawn to scale at the 63 mm wide card size: set `thickness` in millimetres (default `0.3`, about 12 pt stock; `0` for a flat card; or pick a `material`, below). The edge is drawn from thin planes between the two faces, so it shows edge-on and at any angle, and it scales with the element's width (a 300px card is about 1.4px thick at the default). It is gold foil for the classic gold frame and card-stock cream for the sport and cosmic variants; override it with the `--fuda-edge` CSS custom property (any CSS background). The drop shadow is on the element itself, so a `filter` must not be added to anything between the card and its faces.

```html
<fuda-card title="Relic" thickness="1.5"></fuda-card>
```

### Materials and stacks

`material="<id>"` gives a card the thickness and edge colour of a material, each thickness read from a maker or a standard and cited: card stock at 11, 13 and 16 pt, a plastic bank-size card (0.76 mm), thick trading cards from 35 to 180 pt, a 175 pt booklet card, anodised aluminium (0.8 mm) and stainless steel (0.5 mm). `thickness` still overrides it. [docs/materials.md](docs/materials.md) lists every material, its thickness, its source and what the source says, and what was left out because it could not be sourced (a patch or relic card, for one).

`stack="52"` draws that many cards as a stack whose height is the count times a card's thickness (52 cards of the black-core playing-card stock are 16.9 mm; 60 thick 130 pt cards are 198 mm). The count is free, 1 to 1000; the Card Studio has presets with a source (52 playing cards, 52 and two jokers, a 60-card Pokémon deck, a booster pack of 10). Turn the card to see the stack's edge, with a line for each card in the material's colour.

```html
<fuda-card title="Deck" material="paper-310-black-core" stack="52" stack-messiness="0.3" stack-seed="7"></fuda-card>
```

The top card is the live card. The block under it is one piece, and with `stack-messiness` above 0 (0 neat to 1 very messy, default 0.3) the `stack-depth` cards under the top one (default 10, at most 52) are drawn as flat stills, nudged and turned from `stack-seed`: the same seed gives the same stack, and a card put on top moves none of those under it. A stack is one 3D scene whatever its count, and it draws nothing while it is at rest: a test checks that a 52-card stack requests no frames at rest. The idea of a pile from neat to messy and its parameters come from [toranpu](https://github.com/johnmorrisdotca/toranpu)'s `<toranpu-pile>`. In script, `card.stackCount` and `card.stackHeight` (mm) are read-only, and the package exports `cardMaterials`, `stackPresets`, `stackHeightMm` and `stackLayout`.

### Binder Pages

`view="binder"` is a binder open on two facing sheets, as one is kept: each sheet is a page of clear plastic pockets (nine, three by three) with a slight sheen, one card sitting inside each pocket, on a clear or a black sheet, with a strip of punched holes down the edge that lies against the rings. Next and Previous turn the page: a leaf swings about the spine, bends as it goes and shows the pockets on its back, forwards and backwards (`animate="off"` changes the page at once, ending in exactly the same place; reduced motion likewise). Options, each a row of buttons under the view and in the address: `binder="ring|zip"` (a ring binder, or a zip binder with its zipper and pull), `cover="green|black|teal|navy|red"` (a plain cover), `sheet="clear|black"` and `pockets="4|9|12"` (two by two, three by three, four across by three down). The older `page-size` and `columns` still work and set the pockets of a sheet. Clicking a card opens it as before.

### Fan a stack, take a card off it

A stack of more than one card is a pile like the collection's deck, with the same fan and the same landing. `fan="open"` spreads up to ten cards in an arc (every card drawn with its face and the picture) and closes back exactly where they began. `taken-off="3"` puts the top three cards on a pile at the stack's side, as thick as the cards in it: `card.takeOff()` flies the top card across and `card.putBack()` brings it back, and `deck-land="face-up"` (the default) or `"face-down"` (turned over sideways, showing the back) says how it lands. `pile-controls` draws three buttons (Fan, Take a card off, Put it back; each at least 48 px) under the card; leave about 70 px of room below it. `animate="off"` and `speed="slow|quick"` are the same as in the collection. The card turns with the pile (the angle, tilt and Auto-turn work as before) and an open fan or a pile at the side is part of what turns: `card.pileBounds` says how far they reach beyond the card, in card widths, and `fuda-pile` is sent when it changes, so a page can fit its view.

```html
<fuda-card title="Deck" stack="52" pile-controls></fuda-card>
```

The pile code is a separate module (`dist/pile-card.js`) that `<fuda-card>` loads only when a stack asks for `fan`, `taken-off` or `pile-controls`; a card without them is drawn exactly as before and never requests it.

### Wear: cards that are not perfect

`wear="lightly-played"` draws the card after use: corners that are soft, rounded, chipped or folded (a dog-ear), whitening on the edges, creases, scratches, specks, staining, yellowing and a print that sits off centre. The presets are the plain grading terms: `mint`, `near-mint`, `lightly-played`, `moderately-played`, `heavily-played` and `damaged`; `perfect`, no attribute at all, or an unknown name draws nothing. `wear-seed` fixes where the marks lie, so a card looks the same every time it is drawn. `wear-corners`, `wear-edges`, `wear-surface` and `wear-creases` (0 to 1) change one kind on its own, and `wear="0.5"` sets them all at once.

```html
<fuda-card title="Rookie" wear="moderately-played" wear-seed="7"></fuda-card>
```

A perfect card is byte for byte what it was: the wear code is a separate module that `<fuda-card>` loads only when a card asks for wear. [docs/wear.md](docs/wear.md) has the sources for the grading words, the presets with their levels, how each mark is drawn and what is not drawn. The package exports `wearPresets`, `wearLayout`, `wearLevels`, `wearOutline` and `wearOverlaySvg` as plain data.

### Whole-card rotation

Set `card-spin="center"` for a slow 3D turn around the card’s vertical center, or `card-spin="corner"` for a 3D spin like an ice skater: the card keeps its full size and turns a full 360° around the vertical axis through its bottom-left corner, which stays still at the middle of the element, and shows its back half way round. The card sweeps out to both sides of that point, so give it room (a stage about three times its width and twice its height). Both rotate the entire card, including either face and its content. The default is one turn every 180 seconds; set `--fuda-card-spin-duration` to a positive CSS duration such as `30s`. Set `card-spin-direction="reverse"` to reverse the rotation. Add `card-spin-paused` to pause at the current angle, and remove it to resume. Remove `card-spin` to stop and reset the rotation. These attributes are independent of the artwork `motion` and `playing` attributes and the card’s `flipped` state. Reduced-motion preferences disable the rotation and the flip transition.

To drive the turn from your own controls instead of the built-in animation, add the boolean `card-view` attribute and set the CSS custom properties `--fuda-yaw` and `--fuda-tilt` (angles, for example `40deg`); the pivot is the one chosen by `card-spin`. The Card Studio does this with [`@johnmorrisdotca/kazoku-ui`](https://www.npmjs.com/package/@johnmorrisdotca/kazoku-ui) view controls (angle, tilt, Auto-turn, Front, zoom out, 2x, zoom in, Fit, pan, drag and pinch, kept in the address), which also zoom and move the whole stage so the full sweep can always be seen. That package is used by the demo only (a dev dependency); `<fuda-card>` itself has no dependencies. `--fuda-perspective` (default `1000px`) sets the card’s perspective.

```html
<fuda-card title="Explorer" card-spin="center" style="--fuda-card-spin-duration: 30s">
  <img src="rocket.jpg" alt="Explorer rocket">
</fuda-card>
```

To review, run `pnpm install` and `pnpm dev`, then open the Card Studio. Under **Card rotation**, choose **Rotate around center** or **Spin around bottom corner**. The view controls under the card turn and tip it (Angle, Tilt), start **Auto-turn**, and zoom with **−**, **2×**, **+** and **Fit** (Ctrl or Command with the wheel, or a pinch, also zoom; zoomed in, a drag or the arrows move the view). The Card Studio opens at full card size; **Fit** is one press away and shows the whole sweep, and the corner stays at the middle of the stage at every zoom. Choose **Fast** to see a full turn in eight seconds, and try the direction control and **Flip card**. Auto-turn does not start by itself when your operating system or browser asks for reduced motion. The spin is decorative; use the separate flip control to choose the face.

### Moving artwork

Set `motion="pan"` on a card containing a slotted `<img>` to enable the Animate button on a tall image. The button is a small play or pause mark in the corner of the art, drawn at half strength until you point at it or focus it; its hit target is 48 px square, its accessible name is "Animate the picture" and `aria-pressed` says whether the art is moving. By default the card starts on a still, cropped view; add the boolean `playing` attribute to start with motion. Tapping the button starts the pan, and tapping it again returns to the still. A host can add or remove `playing` to control the state. While the art moves the card also carries a `moving` attribute for styling (read-only: set `playing` or `autoplay` instead). Set `--fuda-focus-x` and `--fuda-focus-y` (for example `50%` and `20%`) to choose the focal point. Cards without the pan option show a still, fully visible image. `pan-direction="up"` starts at the bottom; the default is down. The image travels back and forth by default; set `pan-loop="restart"` to repeat in one direction. Set the CSS custom property `--fuda-pan-duration` (for example, `16s`) to control the duration of each pass. If the image is not taller than the window after filling its width, there may be no vertical distance to pan. Reduced-motion preferences disable the animation and preserve the focused still. This option applies to images; moving a 3D camera is a separate future integration owned by the viewer.

```html
<fuda-card title="Starship" motion="pan" pan-direction="down" style="--fuda-pan-duration: 16s">
  <img src="starship.jpg" alt="Starship">
</fuda-card>
```

**Autoplay when the card is in focus.** Add `autoplay="focus"` and the card moves its art by itself while it is the card in focus, with no tap on the button. One card is in focus at a time: the card under the mouse, the card that holds keyboard focus (Tab to its button), or, on a touch screen, the card you last tapped. When focus moves to another card, or the pointer leaves, or you tap or click somewhere else, the first card returns to its still, so in a row or a grid only one card ever moves. The button stays: press it to pause the focused card (it starts again the next time the card takes focus), and on a touch screen the first tap on it starts the card. `autoplay="focus"` never starts with `prefers-reduced-motion: reduce`. It does not set `playing`, so a host that sets `playing` still decides for itself. The Card Studio has an **Autoplay** choice.

```html
<fuda-card title="Starship" motion="pan" autoplay="focus">
  <img src="starship.jpg" alt="Starship">
</fuda-card>
```

Planned JSON, API, scanned-card and interactive-content inputs are outlined in [docs/collection-input.md](docs/collection-input.md).

## Pokémon binder demo

Open `demo/tcgdex.html` through the local server to browse the Pokémon Base Set as full-card images supplied by [TCGdex](https://tcgdex.dev/). Search by name or number, change pages and select a card to enlarge it. The view controls under the binder page zoom in and out (−, 2×, +), **Fit** shows the whole page, and zoomed in you drag, use the arrows or the wheel to move. This standalone demo fetches public set data and remote images in the browser; it requires an internet connection. No API key, personal collection storage, or image hosting by Fuda is involved. A missing image or failed request is reported in the UI. Card images and metadata are provided by TCGdex; consult provider terms before deploying a public demo.

## Collection viewer

Run `pnpm dev` and open `/demo/collections-component.html`. Import `@johnmorrisdotca/fuda-cards/collection-element` to register the element, then set its `cards` property to an array of `{ id, name, image, backImage?, kind? }` (`kind` is `"card"`, the default, or `"object"`: a picture of a thing that is not a card, such as a games console, which has no back and no thickness and so never turns over; see `docs/collection-input.md`). Image URLs are loaded by the viewer's browser. `id` is optional on input (the position is used if omitted); IDs must be unique. Set `view` to `deck`, `rolodex`, `binder`, `case`, `random`, `story`, `wall`, `spotlight`, `atlas` or `fan` (`jukebox` and `tower`, dropped in 0.8.0, still open the deck). Set `page-size` for the binder and case (1–100 cards) and `columns` (1–10) for their grid; small screens use at most two columns. In random view, filter card names to limit the draw; the draw button is disabled when no cards match.

**Choosing a display.** The ten displays are a row of buttons across the top, each with a small picture of its layout and its name, at least 48 px high, one chosen, wrapping on a phone (4 to a row, 6 on a desk). It is a radio group: one tab stop, the arrow keys move the choice. There is no drop-down. The colours follow the reader's light or dark setting; set `theme="light"` or `theme="dark"` to choose for them.

**The deck, and the other piles.** Two displays draw a pile of cards, and each does everything a pile does: it turns in 3D, it fans open and closed, and a card comes off it onto a pile at its side. They are the Overlapping Deck (`view="deck"`) and Random Draw; the Fan of Cards is the same pile with only its fan. (Jukebox Carousel and Flip Tower drew the same pile of three cards, had no real counterpart for cards, and were dropped in 0.8.0.) Rolodex and Spotlight Carousel spread their cards out instead of piling them, so they are carousels and stay as they were. `view="deck"` draws a deck of up to ten cards (with a seeded, slightly messy lie: `deck-messiness` 0 to 1, default 0.3, and `deck-seed`) and, beside it, a pile. **Next** flips the top card off the deck: it lifts, flies across and lands on the pile at the deck's other side; **Previous** brings it back. Where it lands is a choice: `deck-land="face-up"` (still facing up, the default) or `face-down` ("Turned over": it turns over sideways about its vertical axis, like turning a page, so the pile shows the card's `backImage`, or the package's own navy back when it has none). A card never lands with its picture on its head. The 0.6.0 value `upside-down` is still accepted and means `face-down`. The same card element flies, so a card is never drawn twice; with reduced motion it moves without flying. **Rotate a pile**: a pile's view controls have the angle, tilt and Auto-turn (the other displays are flat), and the whole table, both piles, turns in 3D: seen from behind you see the backs of the deck and the faces of a face-down pile.

**The fan.** Every pile fans open and closes with the **Fan** buttons right under the view (or `fan="open"`): up to ten cards spread in an arc like a hand of playing cards so that most of each card shows, and closing puts each card back exactly where it started. The pile beside the deck moves out of the way and the view fits the open fan (a phone included). A card can still be taken off an open fan, and off a pile that was fanned and closed. `view="fan"` is the same pile with only its fan: `fan-size` (2 to 10) cards from the current one, Next moves the window on. The fan is in the address (`?fan=open`).

**Animate.** Opening and closing the fan, taking a card off, moving to the next card (Rolodex, Spotlight, the fan), changing a binder page and switching display all move; the wall, story and atlas pan to the card you move to. `animate="off"` turns all of it off (every move then ends at once, in exactly the same place), and `speed="slow"` or `"quick"` makes every move longer or shorter. `animate` is **on** when the attribute is missing, as the flight of a card taken off already was in 0.6.0; set `animate="off"` for the jump you had before. The reader's reduced-motion setting always wins. Moves are CSS transforms and one-shot animations that end by themselves: nothing runs while the view is idle. The Animate and Speed buttons are under the view and in the address (`?animate=off&speed=quick`).

**Zoom, Fit and move in every view.** Under each view sit the `@johnmorrisdotca/kazoku-ui` view controls: **−**, the zoom as a number (the one number on the bar, always the true one; a press goes back to Fit), **+** and **Fit**; **More** adds four arrows to move the view. Ctrl or Command with the wheel (or a trackpad pinch) and a two-finger pinch zoom about the pointer; zoomed in, a drag or the wheel moves the view, even when the drag starts on a card; the keys `+`, `−` and `0` work with the view focused. **Fit** shows every card the view draws (the whole binder or case page, every card of the wall, the story and the atlas). The wall, story and atlas open at half size or larger so a card can be read, and the others open at Fit. A tap or click on a card still opens it, and zooming, moving or paging never resets the other: turning to the next card or page keeps your zoom, and zooming keeps the card or page you are on. The piles (see above) also turn in 3D; the other displays use zoom and move only. Zoom itself is not animated. Add the boolean `address` attribute to keep the zoom, the display, the fan, the landing, Animate and Speed in the page address (`?view=fan&fan=open&land=face-down&zoom=2`); a link to it opens the same view. Set `--fuda-stage-height` on the element to change the height of the view (default: the window height less 440 px, between 300 and 620 px) so the controls stay on screen.

`@johnmorrisdotca/kazoku-ui` is a runtime dependency of the package (it was a development dependency until 0.2.0). Choice buttons, the light and dark colours and the address are written in the package, because kazoku-ui has no shared part for them yet. A bundler resolves it. On a plain HTML page without a bundler, add an import map next to the module script, with the package served from `node_modules` or a copy of its `dist`:

```html
<script type="importmap">{"imports":{"@johnmorrisdotca/kazoku-ui/view-controls/define":"/node_modules/@johnmorrisdotca/kazoku-ui/dist/view-controls/define.js"}}</script>
```

```html
<fuda-collection view="deck"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [
    { id: 'one', name: 'My card', image: '/cards/front.jpg', backImage: '/cards/back.jpg' }
  ];
</script>
```

These are early display prototypes: the case and rotating displays use CSS perspective rather than fully modeled 3D devices; the atlas is a zoomable, movable plane rather than an unbounded or virtualized canvas. The demo can save and load named collections in the current browser using localStorage; this is not account-based sync or a backup. Configurable case geometry, integrated 3D content, and full browser and accessibility testing remain to be completed. Zoom, Fit, move and pinch are tested in headless Chromium at a desk and a phone size (pinch with synthetic pointer events); a real phone, Safari and Firefox are not tested.

Saved demo collections are scoped to the selected profile. Use “Import older saved collections” to copy pre-profile saves without overwriting same-named collections; the originals remain intact. The demo supports JSON export and deletion, and storage stays local to this browser.

`demo/vintage.html` shows real 1909 to 1911 hockey and baseball cards whose pictures are in the public domain (Wikimedia Commons and The Met's Open Access, each card's rights checked one by one), loaded from their sources and never shipped; [docs/card-images.md](docs/card-images.md) says what card-picture sources exist, their terms and what was not used (no free hockey or baseball card API with pictures was found).

The collection component demo includes three fictional demo users—Alex, Sam, and Riley—with different example collections: Alex has 25 Base Set cards (a 5 by 5 page), Sam a pack of 10 and Riley 5 consoles. Select a user to switch the displayed cards. These are local demo profiles, not accounts; the existing named-collection save/load remains local to the browser and separate from the demo profiles.

Development priorities and handoff notes: [feature roadmap](docs/feature-roadmap.md) · [work log](docs/work-log.md).
