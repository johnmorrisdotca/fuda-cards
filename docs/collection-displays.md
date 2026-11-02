# Collection displays

Fuda supplies reusable frames for a caller's cards and reusable ways to display collections on websites. The hosting site supplies the card data and artwork or interactive content. Initial versions of eleven layouts now exist in `<fuda-collection>`. They are prototypes; the detailed capabilities below remain design goals unless described as implemented in the README.

## Zoom, Fit and move (every view)

Every view has the shared view controls (`@johnmorrisdotca/kazoku-ui`) on the view: zoom out, 2×, zoom in, **Fit**, and, zoomed in, an arrow pad. Ctrl or Command with the wheel, a trackpad pinch and a two-finger pinch zoom about the pointer; zoomed in, a drag or the wheel moves the view. The views are flat, so none turns in 3D and the angle, tilt and auto-turn controls are hidden.

- The controls take every press on the view, including one that starts on a card, so a drag or a pinch works over the cards. A tap that did not move is passed to the card as a click, and the keyboard still opens a focused card with Enter.
- **Fit** shows every card the view draws, at most at natural size. The wall, story and atlas open at half size or larger and start at their first card; the other views open at Fit. Zoom out goes to 0.4 of Fit.
- Changing the card, the page or the view type is separate from zoom: paging keeps the zoom and the position, zooming keeps the page, and choosing another view type starts that view at its opening size.
- The controls sit under the view. Keep what is above the viewer short so they are on the first screen; `--fuda-stage-height` sets the view's height.

## Binder and booklet

- Configurable page grids, such as 3 columns by 4 rows or 4 by 4, and responsive alternatives for small screens.
- An optional binder or booklet presentation with covers, pages, sleeves, and opening and page-turning animations; a simple grid remains available.
- Multiple named collections or binders, with their own cards, ordering, and optional titles and covers.
- Page controls that work with keyboard and touch, with a reduced-motion alternative.
- Present each card's front and back, and preserve interaction with any 3D viewer in the card window. Page turning, card flipping, and rotating an object must be distinct actions.

## Rotating card index

- A rotating, circular index of cards inspired by a desktop card file, with next/previous controls and a clearly visible selected card.
- Touch, pointer, and keyboard access, with reduced-motion support.
- Adapt the number of visible cards and layout to the available space.

## Convention display case

- A three-dimensional tabletop showcase with cards on angled, stepped risers, inspired by convention and card-shop cases. Configurable rows and columns (including 10 × 10), tilt, spacing, row height and overlap; avoid assuming one fixed industry layout.
- Configurable case materials and appearance: glass or clear acrylic lid, frame, lighting and optional graded holders. Keep reflections from hiding card content.
- Browse the case using touch or pointer, with keyboard-accessible card selection and a reduced-motion option. Select any card to open a large, full-screen-style detail view, then return to the same position. Preserve card flip controls and interaction with a 3D model inside the selected card.
- Support a responsive alternative for small displays and large collections; avoid rendering a separate active 3D viewer per card at once. The host controls the collection and card content.
- Research: [angled modular display risers](https://boxboy.co/products/modular-display-risers), [staggered rear rows](https://dhoptcg.com/?product=glass-display-shelves), and [a 13-column, 7-row cabinet](https://www.jz-shop.com.tw/en/graded-card-display-case-slim). These examples show different capacities, so dimensions and overlap should remain adjustable.

## Jukebox-style display

- Present the collection inside a jukebox-like device. Browse cards in the device, then select a card to bring it into a focused view.
- Provide a clear way back to browsing and preserve the selected card and collection position.
- Keep card flip and interactive content controls separate from the device navigation; make browse and selection usable by keyboard, touch, and pointer.
- Allow the host to configure device styling and the cards supplied. Support a reduced-motion alternative to mechanical animations.

## Feeling lucky

- Pick a random card from a caller-provided collection, optionally limited to a current filter or binder.
- Show the selected card and provide a way to choose another. Empty and single-card collections must be handled gracefully.
- Random selection is for discovery; it is not a claim of cryptographic randomness or a rarity-based draw unless a host explicitly supplies that behavior.

## Integration direction

Keep presentation separate from card data and artwork. Accept caller-supplied cards and interactive content; do not bundle rockets, devices, or a particular 3D engine into the core. Support plain HTML and common frameworks through standard custom elements, with optional adapters where helpful. Define how a host supplies card content and identity before implementing collection persistence or navigation. The project's card styles and realistic materials remain work in progress.
