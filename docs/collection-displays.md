# Collection displays

Fuda supplies reusable frames for a caller's cards and reusable ways to display collections on websites. The hosting site supplies the card data and artwork or interactive content. Initial versions of twelve layouts now exist in `<fuda-collection>`. They are prototypes; the detailed capabilities below remain design goals unless described as implemented in the README.

## Choosing a display, piles, the fan and animation (0.6.0, 0.7.0)

- **Display buttons.** All twelve displays are buttons on screen at once, in a row that spans the width, each with a small picture of its layout. No drop-down. At least 48 px high; 4 to a row on a phone, 6 on a desk; arrow keys move the choice; light and dark follow the reader.
- **Piles (0.7.0).** The Overlapping Deck, Random Draw, the Jukebox Carousel and the Flip Tower (the last three drew a pile of three cards) are the same pile with their own look. Every pile turns in 3D (angle, tilt, Auto-turn), fans open and closed, and has a card taken off it. `<fuda-card stack>` is a pile too. Rolodex and Spotlight spread their cards and are carousels, not piles.
- **Deck.** A deck and a pile. Next flips the top card off to the pile on the deck's other side, Previous brings it back. The landing is a choice: still facing up, or turned over (a sideways turn about the card's vertical axis, like turning a page, showing the back image or the package's own back). A card never lands with its picture on its head; the 0.6.0 value `upside-down` still works and means turned over. One element flies, so a card is never drawn twice.
- **Fan.** Every pile fans open and closed with a control right under the view: up to ten cards in an arc, most of each card showing, closing back exactly. `view="fan"` is the same pile with only the fan. In the address (`?fan=open`).
- **Animate (0.7.0).** `animate="off"` and `speed` for every move: the fan, a card taken off, Next in the carousels, a binder page turn, a switch of display, a pan to the card in the wall, story and atlas. On when the attribute is missing; reduced motion always wins. One shared timing, CSS transforms and one-shot animations, nothing running when idle. Moves with it on and off end in exactly the same place.
- Not done: dealing more than one card at a time, a pile that fills up with the whole discard history (the pile shows the last ten), wear on the cards of a fan.

## Items that are not cards (0.9.0)

An item says what it is with `kind` (`"card"`, the default, or `"object"`; see `docs/collection-input.md`). A card is flat and thin with a back, so everything that turns it, shows its back or lands it turned over applies to it, exactly as before. An object (a picture of a games console, say) has no back and no thickness, so none of that applies:

- a collection with no card in it offers no Angle, Tilt, Auto-turn or Front, ignores `yaw` and `tilt` in the address and in the controls, and does not offer the "turned over" landing;
- in a mixed collection the controls are there for the cards; each object stays square to the reader (it turns the other way by as much as the view turns) and lands facing up whatever `deck-land` says;
- a flight never turns an object over, and no card back is drawn for it;
- fanning open and taking one off a pile are kept for objects: a fan is a flat layout (each item leans in the plane of the page, nothing turns over) and taking one off only moves it across, so both stay true to a console on a table.

## Zoom, Fit and move (every view)

Every view has the shared view controls (`@johnmorrisdotca/kazoku-ui`) on the view: zoom out, 2×, zoom in, **Fit**, and, zoomed in, an arrow pad. Ctrl or Command with the wheel, a trackpad pinch and a two-finger pinch zoom about the pointer; zoomed in, a drag or the wheel moves the view. The views are flat, so none turns in 3D and the angle, tilt and auto-turn controls are hidden.

- The controls take every press on the view, including one that starts on a card, so a drag or a pinch works over the cards. A tap that did not move is passed to the card as a click, and the keyboard still opens a focused card with Enter.
- **Fit** shows every card the view draws, at most at natural size. The wall, story and atlas open at half size or larger and start at their first card; the other views open at Fit. Zoom out goes to 0.4 of Fit.
- Changing the card, the page or the view type is separate from zoom: paging keeps the zoom and the position, zooming keeps the page, and choosing another view type starts that view at its opening size.
- The controls sit under the view. Keep what is above the viewer short so they are on the first screen; `--fuda-stage-height` sets the view's height.

## Real-life audit (0.8.0)

Every display and option against how real cards are kept and handled: **real**, **fine as a demo idea** (no real counterpart, but it helps a reader see or reach cards on a screen) or **wrong** (fixed or removed).

Displays
- Overlapping Deck: real (a deck on a table; a card comes off it). Kept; Random Draw: real (draw a card from a shuffled deck). Kept. Fan of Cards: real (a hand). Kept.
- Binder Pages: real (nine-pocket sheets in a ring or zip binder), the old drawing was **wrong** (a flat tilted grid with no pockets, holes or binder). Rebuilt in 0.8.0.
- Convention Display Case: real (cards on risers behind glass), the old drawing was weak (tilted pictures on a gradient). Kept, with a wooden frame, a glass lid and a ledge under each card; still a demo, not a full riser model.
- Rolodex: a real rotary card file, but ours is three cards leaning like a hand, not a wheel. Fine as a demo idea; kept.
- Sliding Gallery Wall: real (cards hung in a row on a wall). Spotlight Carousel: a lit stand with neighbours, fine as a demo idea. Vertical Story Scroll: no physical counterpart (a phone feed of cards), fine as a demo idea and useful on a phone.
- Infinite Card Atlas: "infinite" was **wrong** (the collection is finite); the real thing is all the cards laid out on a table. Kept and renamed **Card Table** (`view="atlas"` unchanged).
- Jukebox Carousel and Flip Tower: **wrong**. A jukebox plays records, not cards; nothing real is a "flip tower"; both drew exactly the deck's pile of three cards. Removed from the demo and the buttons; `view="jukebox"` and `view="tower"` still open the deck (`collectionViewAliases`).

Options
- Fan open and closed, a card taken off still facing up or turned over (sideways), deck messiness and seed, binder ring or zip, plain covers, clear or black sheets, 4, 9 or 12 pockets, material, thickness, stack counts, wear, foil or matt finish: **real**.
- "Upside down" landing: **wrong** (nobody turns a card half way round in its plane); removed in 0.6.1, the value `upside-down` still means turned over.
- Animate, Speed, zoom, Fit, move, the address, Image motion (a slow pan over a tall picture) and Autoplay: no real counterpart, **fine as demo ideas**.
- Card rotation (a turntable) and its speed and direction: real for a display stand; spin around the bottom corner: no real counterpart, kept because John asked for it, **fine as a demo idea**.
- Card style (classic, silver sport, cosmic violet): fine as frames, not a real product.

## Binder and booklet

- Done in 0.8.0: `view="binder"` is a ring or zip binder open on two facing sheets of 4, 9 (the default, three by three) or 12 clear plastic pockets, on a clear or black sheet with a punched-hole strip against the rings, a plain cover colour, and a sideways page turn about the spine that bends the leaf and shows its back pockets. The older `page-size` and `columns` still set the grid.
- Not done: booklet and album (side-loading) pages, a binder with more than one section.
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

## Jukebox-style display (dropped in 0.8.0)

A jukebox plays records, not cards, and the display drew the deck's pile of three cards, so it was removed (see the real-life audit above). `view="jukebox"` still opens the deck.

## Feeling lucky

- Pick a random card from a caller-provided collection, optionally limited to a current filter or binder.
- Show the selected card and provide a way to choose another. Empty and single-card collections must be handled gracefully.
- Random selection is for discovery; it is not a claim of cryptographic randomness or a rarity-based draw unless a host explicitly supplies that behavior.

## Integration direction

Keep presentation separate from card data and artwork. Accept caller-supplied cards and interactive content; do not bundle rockets, devices, or a particular 3D engine into the core. Support plain HTML and common frameworks through standard custom elements, with optional adapters where helpful. Define how a host supplies card content and identity before implementing collection persistence or navigation. The project's card styles and realistic materials remain work in progress.
