# Changelog

## Unreleased


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
