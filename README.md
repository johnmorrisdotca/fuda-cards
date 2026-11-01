# Fuda Cards

Reusable collectible card frames for caller-provided images and interactive 3D viewers. The core is a standards-based web component, suitable for plain HTML, Angular, React, Vue, Svelte, and other frameworks that support custom elements. No framework or 3D engine is required by the component.

This is an early prototype: classic, sport and cosmic are exploratory CSS designs, not yet historically researched recreations or photorealistic materials. The demo uses a still from Uchusen Rockets; see [assets/README.md](assets/README.md) for its model credit.

## Development

Requires Node 22+ and pnpm. Run `pnpm install`, `pnpm check`, then `pnpm dev` and open http://localhost:8000. `pnpm build` emits JavaScript and TypeScript declarations to `dist/`.

## Embed

```html
<script type="module" src="/path/to/fuda-cards/dist/element.js"></script>
<fuda-card title="Explorer One" category="ROCKET" variant="cosmic" finish="foil" description="A new explorer.">
  <img src="rocket.jpg" alt="Explorer One rocket">
</fuda-card>
```

In a bundler, import `@johnmorrisdotca/fuda-cards/element` once before rendering `<fuda-card>`. Frameworks may require custom-element configuration (for example, Angular's `CUSTOM_ELEMENTS_SCHEMA`). Framework-specific wrappers have not yet been implemented. Package publication is planned; it is not published yet.

The default slot accepts HTML, including an existing interactive 3D viewer; its owner handles rotation, zoom and model loading. The card has no drag-to-flip handler, leaving pointer interaction to that viewer. Control the card's reverse independently by adding or removing the `flipped` attribute. The demo provides a flip button. Attributes: `title`, `category`, `subtitle`, `description`, `number`, `rarity`, `variant` (`classic`, `sport`, `cosmic`), `finish` (`foil`, `matte`) and `flipped` (boolean). Set the element width to scale it. The main package entry exports the TypeScript options and available variants and finishes without registering the custom element.

3D integrations, framework-specific examples, polished front and back designs, accessibility validation, and photorealistic finishes remain future work.

Collection presentation prototypes are available as a reusable `<fuda-collection>` component. See the [collection demo](demo/collections-component.html) and [collection display notes](docs/collection-displays.md).

### Moving artwork

Set `motion="pan"` on a card containing a slotted `<img>` to enable an Animate button on a tall image. By default the card starts on a still, cropped view; add the boolean `playing` attribute to start with motion. Tapping Animate starts the pan, and tapping Stop returns to the still. A host can add or remove `playing` to control the state. Set `--fuda-focus-x` and `--fuda-focus-y` (for example `50%` and `20%`) to choose the focal point. Cards without the pan option show a still, fully visible image. `pan-direction="up"` starts at the bottom; the default is down. The image travels back and forth by default; set `pan-loop="restart"` to repeat in one direction. Set the CSS custom property `--fuda-pan-duration` (for example, `16s`) to control the duration of each pass. If the image is not taller than the window after filling its width, there may be no vertical distance to pan. Reduced-motion preferences disable the animation and preserve the focused still. This option applies to images; moving a 3D camera is a separate future integration owned by the viewer.

```html
<fuda-card title="Starship" motion="pan" pan-direction="down" style="--fuda-pan-duration: 16s">
  <img src="starship.jpg" alt="Starship">
</fuda-card>
```

Planned JSON, API, scanned-card and interactive-content inputs are outlined in [docs/collection-input.md](docs/collection-input.md).

## Pokémon binder demo

Open `demo/tcgdex.html` through the local server to browse the Pokémon Base Set as full-card images supplied by [TCGdex](https://tcgdex.dev/). Search by name or number, change pages and select a card to enlarge it. This standalone demo fetches public set data and remote images in the browser; it requires an internet connection. No API key, personal collection storage, or image hosting by Fuda is involved. A missing image or failed request is reported in the UI. Card images and metadata are provided by TCGdex; consult provider terms before deploying a public demo.

## Collection viewer

Run `pnpm dev` and open `/demo/collections-component.html`. Import `@johnmorrisdotca/fuda-cards/collection-element` to register the element, then set its `cards` property to an array of `{ id, name, image, backImage? }`. Image URLs are loaded by the viewer's browser. `id` is optional on input (the position is used if omitted); IDs must be unique. Set `view` to `deck`, `rolodex`, `binder`, `case`, `jukebox`, `random`, `story`, `wall`, `tower`, `spotlight`, or `atlas`. Set `page-size` for the binder and case (1–100 cards) and `columns` (1–10) for their grid; small screens use at most two columns. In random view, filter card names to limit the draw; the draw button is disabled when no cards match.

```html
<fuda-collection view="deck"></fuda-collection>
<script type="module">
  import '@johnmorrisdotca/fuda-cards/collection-element';
  document.querySelector('fuda-collection').cards = [
    { id: 'one', name: 'My card', image: '/cards/front.jpg', backImage: '/cards/back.jpg' }
  ];
</script>
```

These are early display prototypes: the case and rotating displays use CSS perspective rather than fully modeled 3D devices; the atlas is a draggable, zoomable plane rather than an unbounded or virtualized canvas. The demo can save and load named collections in the current browser using localStorage; this is not account-based sync or a backup. Configurable case geometry, integrated 3D content, and full browser and accessibility testing remain to be completed. Atlas supports drag, a zoom slider, and a basic two-finger pinch; touch behaviour still needs browser testing.

The collection component demo includes three fictional demo users—Alex, Sam, and Riley—with different example collections. Select a user to switch the displayed cards. These are local demo profiles, not accounts; the existing named-collection save/load remains local to the browser and separate from the demo profiles.

Development priorities and handoff notes: [feature roadmap](docs/feature-roadmap.md) · [work log](docs/work-log.md).
