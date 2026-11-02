# Changelog

## 0.8.0 - 2026-11-02

- Changed (MODULES-107): **Binder Pages are real sheets in a real binder.** The display is a ring or zip binder open on two facing sheets, each a page of nine clear plastic pockets (three by three) with a slight sheen, one card sitting inside each pocket, on a clear or black sheet, with a strip of nine punched holes by the rings and a plain cover colour. New options, each a row of buttons under the view and in the address: `binder="ring|zip"`, `cover="green|black|teal|navy|red"`, `sheet="clear|black"`, `pockets="4|9|12"`. The older `page-size` and `columns` still work (they set the pockets of a sheet). It replaces the flat tilted grid.
- New (MODULES-106): **the page turns.** Next and Previous swing a leaf about the spine, forwards and backwards; it bends as it goes (a chain of four hinged slices) and shows the pockets on its back. In the same `animate` control as every other move: `animate="off"` or reduced motion changes the page at once and ends in exactly the same place (tested).
- Changed (MODULES-108): **audit of every display and option against real cards** (the list is in `docs/collection-displays.md`). **Removed from the demo and the buttons: Jukebox Carousel and Flip Tower** (no real counterpart for cards; both drew the deck's pile). `view="jukebox"` and `view="tower"` still work and open the deck, and `collectionViewAliases` says so; `collectionViews` now lists the ten displays. **Renamed: Infinite Card Atlas is now Card Table** (the collection is finite; `view="atlas"` is unchanged). The Convention Display Case gets a wooden frame, a glass lid and a ledge under each card. The remaining displays and options were each judged real or fine as a demo idea.
- Bytes (raw, gzip -9; 0.7.0 then 0.8.0): `collection-element.js` 35,579 / 10,675 then 42,924 / 12,690; new `binder.js` 8,659 / 3,078 (the sheets, the leaf and their CSS); `collection.js` 3,873 then 4,223. `<fuda-card>` and everything else is unchanged.

## 0.7.0 - 2026-11-02

- New (MODULES-100): **every pile of cards turns, fans and has a card taken off it.** The piles are the collection's Overlapping Deck, Random Draw, Jukebox Carousel and Flip Tower (the last three drew a pile of three cards; they are now the same pile as the deck, with their own look), the Fan of Cards (the same pile with only its fan) and `<fuda-card stack>`. Rolodex and Spotlight Carousel spread their cards out; they are carousels, not piles, and are unchanged. Each pile turns in 3D as before (angle, tilt, Auto-turn, backs seen from behind), fans open and closed with the **Fan** buttons right under the view (up to ten cards, most of each card showing, closing back exactly where it began; the pile beside the deck moves aside and the view fits the open fan, a phone included), and a card can be taken off it, also after a turn and after a fan closes, and also off an open fan.
- New: `<fuda-card stack>` fans and takes cards off. `fan="open"`, `taken-off="N"`, `deck-land`, `pile-controls` (three buttons, at least 48 px), `card.takeOff()`, `card.putBack()`, `card.pileBounds` and the event `fuda-pile`. Every card of an open fan is drawn with its face and picture; the pile at the stack's side is as thick as the cards in it. The code is a separate module, `dist/pile-card.js`, loaded only when a stack asks for it: a plain `<fuda-card>` draws the same markup as 0.6.0 and never requests it (a test checks both). The Card Studio has Take a card off, Put it back, Fan, Landing, Animate and Speed under the view, kept in the address.
- New (MODULES-104): **Animate.** `animate="off"` and `speed="slow|quick"` on `<fuda-collection>` and `<fuda-card>`: the fan opening and closing, a card taken off, moving to the next card in the Rolodex, Spotlight and the fan (the cards that stay glide, the one that leaves goes, the one that comes grows in), changing a binder page, switching display, and the wall, story and atlas now pan to the card you move to. One shared timing (`--t`), CSS transforms and one-shot animations that end by themselves, nothing running when idle; reduced motion always wins. With Animate on and off every move ends in exactly the same place (tested). **Default: on** when the attribute is missing (the flight of a card taken off was already on in 0.6.0); set `animate="off"` for the jumps of 0.6.0. The Animate and Speed buttons are under the view and in the address.
- Changed: the fan was never animated in 0.6.0 (the view was drawn again when it opened); it now moves in place. `fan-size` is 2 to 10 (was 2 to 20). `view="fan"` is the deck's fan: the same code, the same closing.
- Changed: the Fan, Landing, Animate and Speed buttons sit under Previous and Next, so the controls stay on the first screen.
- Bytes (raw, gzip -9; 0.6.0 then 0.7.0): `element.js` 19,027 / 5,826 then 21,410 / 6,466 (the hooks and the card's methods; everything heavy is in the new module); new `pile-card.js` 13,720 / 4,572 (only when a stack asks); `collection-element.js` 26,555 / 8,037 then 35,579 / 10,675; new `pile.js` 5,788 / 2,410 (shared); `zoom.js` 5,509 / 2,051 then 6,969 / 2,469; `collection.js` 4,725 then 3,873.

## 0.6.1 - 2026-11-02

- Fixed (MODULES-105): a card taken off the deck no longer ends with its picture on its head. The "Upside down" landing spun the card half way round in its plane; nobody takes a card off and rotates it that way. A card now comes off and turns over **sideways**, about its vertical axis, like turning a page. There are two landings: **Still facing up** (no turn) and **Turned over** (a sideways turn to the back: the card's `backImage` or the package's own back). Previous reverses the same turn.
- `deck-land="upside-down"` from 0.6.0 is still accepted so nothing breaks, and now means `face-down` (turned over). The address `?land=upside-down` opens the same. The Upside down button is gone from the demo and from the component. The type `DeckLanding` keeps `'upside-down'` as a deprecated alias; `deckLandings` lists the two real landings; new export `normalizeLanding`.
- The deck's code moved into a small module `pile.js` (`fanLayout`, the landings and the flight), which `<fuda-collection>` imports. `<fuda-card>` is unchanged.

## 0.6.0 - 2026-11-02

- New: the collection's **Display** is a row of buttons, not a drop-down. All twelve displays are on screen at once, spanning the width, each with a small picture of its layout; at least 48 px high, one chosen, wrapping on a phone (4 a row; 6 on a desk), arrow keys move the choice. The viewer follows the reader's light or dark setting (`theme="light|dark"` to choose). With `address` the display, the fan and the landing are kept in the page address (`?view=fan&fan=open&land=face-down`).
- New: **flip a card off the deck.** The deck view is now a deck beside a pile. Next lifts the top card, flies it across and lands it on the pile at the deck's other side; Previous brings it back. `deck-land` chooses how it lands: `face-up` (still facing up, the default), `upside-down` or `face-down` (the pile shows the card's `backImage` or the package's own back). `deck-messiness` and `deck-seed` set the lie of the cards. Reduced motion: no flight.
- New: **rotate the deck.** The deck is the one display that turns in 3D: the angle, tilt and Auto-turn controls turn the whole table. The others stay flat.
- New: **fan the deck.** `view="fan"` (a twelfth display): `fan="open"` spreads up to `fan-size` (10) cards like a hand of playing cards, about half of each card showing; without it they are squared up into the deck, and closing puts every card back where it started.
- New: the demo pages use the same buttons for their short choices, follow the reader's light or dark setting and keep their choices in the address (`?wear=damaged&stack=52`); every button, field and select is at least 48 px high; `?theme=light|dark` chooses a theme. Demo collectors have more cards: Alex 25 (a 5 by 5 binder page) and Sam 10 (a pack).
- Changed: `<fuda-collection>` is bigger: `collection-element.js` 26.6 KB (8.0 KB gzipped, was 10.7 KB and 3.8 KB), plus `choice.js` 4.6 KB (1.8 KB), `collection.js` 4.7 KB (1.6 KB, was 3.8 KB and 1.3 KB) and `zoom.js` 5.5 KB (2.1 KB, was 5.1 KB and 1.9 KB); it also imports `stack.js` (1.7 KB). `<fuda-card>` is unchanged.
- New demo: `demo/vintage.html`, real hockey (1910 to 1911, 36 cards) and baseball (T206, 24 cards) cards whose pictures are public domain, read item by item from Wikimedia Commons and The Met's Open Access, loaded from their sources and not shipped. `docs/card-images.md` records what card-picture sources exist, their terms and what was left out.
- Changed: the one CSS line for the page head reserves more room for an undefined `<fuda-collection>` (its view plus 380 px, was 200 px), because the Display buttons and options make the component taller; update the line in your page (README, "No flash before the card is ready"). The demos link `demo/ui.css` from the head for the same reason.
- Not changed: `<fuda-card>`, `element.js` and its stack do not fan or flip cards off.


## 0.5.0 - 2026-11-02

- New: `wear`, cards that are not perfect. Presets `mint`, `near-mint`, `lightly-played`, `moderately-played`, `heavily-played` and `damaged` (plain grading terms, sourced in `docs/wear.md`) draw soft, rounded, chipped and folded corners, edge whitening, creases, scratches, specks, staining, yellowing and an off-centre print. `wear-seed` fixes where the marks lie, so a card is the same every time; `wear-corners`, `wear-edges`, `wear-surface` and `wear-creases` (0 to 1) change one kind; `wear="0.5"` sets all. `perfect`, no attribute or an unknown name draws nothing.
- A perfect card is unchanged: the same markup and the same pixels as 0.4.0, and the wear code (`dist/wear.js`, 16.9 KB, 5.4 KB gzipped) is a separate module that `<fuda-card>` loads only when a card asks for wear. `element.js` grew by 1.8 KB (0.5 KB gzipped).
- New exports: `wearPresets`, `wearPreset`, `wearLevels`, `wearLayout`, `wearOutline`, `wearOverlaySvg` and the `wear*` options. The Card Studio has Wear and Wear seed choices.
- Changed: the repo's dev and test servers moved to ports 8100 to 8199 (tests only).


## 0.4.0 - 2026-11-02

- New: `material` attribute (and `material` in `CardOptions`): 13 materials with a thickness and edge colour, each thickness from a maker or a standard and cited in `docs/materials.md`: card stock (250, 310 black core, 350 gsm), a plastic bank-size card, thick trading cards (35, 55, 75, 100, 130, 180 pt), a 175 pt booklet card, anodised aluminium and stainless steel. The edge takes the material's colour. `thickness` overrides it. Left out for want of a source: a patch or relic card, a graded slab, a plastic playing card, other metals.
- New: `stack` attribute: N cards (1 to 1000) as a stack N times a card's thickness high, to scale, with a line for each card on its edge. `stack-messiness`, `stack-seed` and `stack-depth` (the idea and parameters of toranpu's pile): the cards under the top one are drawn as flat stills, nudged and turned from the seed. The top card stays the live card; one 3D scene however many cards; nothing animates at rest (e2e checks that a 52-card stack requests no frames at rest).
- New: exports `cardMaterials`, `cardMaterial`, `stackPresets` (52 playing cards, 54 with two jokers, a 60-card Pokémon deck, a booster pack of 10, each sourced), `stackHeightMm`, `stackLayout`; `card.stackCount` and `card.stackHeight`.
- Changed: the Card Studio's Thickness choice no longer offers unsourced "metal card 0.8 mm" and "patch or relic 1.5 mm" presets; it has a Material choice and the Thickness choice is an override. New Stack choices (preset, count, messiness, seed) and a height readout. `<fuda-card>` now imports its own two small modules.

## 0.3.0 - 2026-11-02

- Changed: the Animate button over the art is icon-only and quieter. A small play or pause mark (26 px) in the corner of the art at half strength, full strength on hover, focus or while it is on; the hit target stays 48 px square, the accessible name is "Animate the picture" with `aria-pressed`. The "Animate" and "Stop" text is gone.
- New: `autoplay="focus"` (and `autoplay?: 'focus'` in `CardOptions`). The card in focus (under the mouse, holding keyboard focus, or last tapped) animates its art; only one card is in focus at a time, so the others stay still. The button pauses it. Never starts with reduced motion. The Card Studio has an Autoplay choice.
- New: a card that is moving carries a read-only `moving` attribute.

## 0.2.1 - 2026-11-02

- Fix: a reloaded page no longer shows the whole picture (for the Card Studio, the full rocket) before it moves into the card. Until the script defined `<fuda-card>`, the browser drew the slotted `<img>` at its natural size. Now a card keeps its art invisible until it has a size on screen and every slotted image has loaded, then fades it in (no fade with `prefers-reduced-motion`).
- New: one CSS line for the page's `<head>`, before the script, hides an undefined `<fuda-card>` and its picture while reserving the card's box (`fuda-card:where(:not(:defined))`), and reserves the height of an undefined `<fuda-collection>`. The demo pages carry it; the README ("No flash before the card is ready") has the line. The Card Studio also reserves the view controls' space, and the Pokémon binder demo its status line, so the Studio's layout shift on a phone with a slow script went from 0.25 to 0.01 and the collection demo from 0.15 to 0.00.
- Changed: the release workflow now calls the shared one in `@johnmorrisdotca/kazoku-ui` (v0.7.3); `AGENTS.md` follows the family template.

## 0.2.0 - 2026-11-01

- New: zoom, Fit and move in every display view. `<fuda-collection>` (all eleven views), the standalone rolodex demo and the Pokémon binder demo now have the `@johnmorrisdotca/kazoku-ui` view controls (−, 2×, +, Fit and, zoomed in, an arrow pad) on the view, with Ctrl or Command and the wheel, a pinch, a drag (also from a card) and the `+`, `-` and `0` keys. Fit shows every card the view draws. A tap on a card still opens it, and zooming never resets the card or page you are on (nor paging the zoom). The views are flat: none turns in 3D.
- New: `address` attribute on `<fuda-collection>` keeps the zoom in the page address; `--fuda-stage-height` sets the height of the view.
- Changed: `@johnmorrisdotca/kazoku-ui` (`^0.2.1`) is now a runtime dependency. A page without a bundler needs an import map for `@johnmorrisdotca/kazoku-ui/view-controls/define` (see the README).
- Changed: the atlas zoom slider is gone (the controls replace it); the stage no longer scrolls, so the wall, story and binder pages are moved with the controls. `demo/collections.html` now shows the same component as `demo/collections-component.html` instead of a separate copy of the views.

## 0.1.1 - 2026-11-01

- Fix: a card turned past 90 degrees showed its front mirrored. It now shows its back, and the front's Animate button cannot be seen or clicked from behind. (The drop shadow filter flattened the 3D faces; it now sits on the element itself.)
- New: card thickness, drawn to scale. The `thickness` attribute (millimetres, default 0.3) and the `thickness` option in `CardOptions`; 0 is flat. The edge is gold foil for the classic frame and card stock for the sport and cosmic variants; `--fuda-edge` overrides it.

## 0.1.0 - 2026-10-31

- First release: `<fuda-card>` and `<fuda-collection>`.
