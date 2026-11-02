# Changelog

## Unreleased

- New: zoom, Fit and move in every display view. `<fuda-collection>` (all eleven views), the standalone rolodex demo and the Pokémon binder demo now have the `@johnmorrisdotca/kazoku-ui` view controls (−, 2×, +, Fit and, zoomed in, an arrow pad) on the view, with Ctrl or Command and the wheel, a pinch, a drag (also from a card) and the `+`, `-` and `0` keys. Fit shows every card the view draws. A tap on a card still opens it, and zooming never resets the card or page you are on (nor paging the zoom). The views are flat: none turns in 3D.
- New: `address` attribute on `<fuda-collection>` keeps the zoom in the page address; `--fuda-stage-height` sets the height of the view.
- Changed: `@johnmorrisdotca/kazoku-ui` (`^0.2.1`) is now a runtime dependency. A page without a bundler needs an import map for `@johnmorrisdotca/kazoku-ui/view-controls/define` (see the README).
- Changed: the atlas zoom slider is gone (the controls replace it); the stage no longer scrolls, so the wall, story and binder pages are moved with the controls. `demo/collections.html` now shows the same component as `demo/collections-component.html` instead of a separate copy of the views.

## 0.1.1 - 2026-11-01

- Fix: a card turned past 90 degrees showed its front mirrored. It now shows its back, and the front's Animate button cannot be seen or clicked from behind. (The drop shadow filter flattened the 3D faces; it now sits on the element itself.)
- New: card thickness, drawn to scale. The `thickness` attribute (millimetres, default 0.3) and the `thickness` option in `CardOptions`; 0 is flat. The edge is gold foil for the classic frame and card stock for the sport and cosmic variants; `--fuda-edge` overrides it.

## 0.1.0 - 2026-10-31

- First release: `<fuda-card>` and `<fuda-collection>`.
