# Changelog

## 0.2.2 - 2026-11-02

- Fix: in WebKit (Safari, every iPhone browser) the Card Studio drew the card's mirrored back instead of the front. WebKit's drawing of the card's 3D faces ignores `backface-visibility` and, in Playwright's screenshots, paints `preserve-3d` flat, so the back (turned half a turn inside the card) was painted over the front. The card now also hides the face that points away from the viewer itself: three tiny corner markers show where the card lands on screen, and the front or the back is hidden by which way it faces, checked every frame while the card is on screen. Nothing changes where `backface-visibility` already worked (Chromium); the edge, the thickness and the art reveal are untouched.
- Tests: the card back test now runs in Chromium and WebKit with the same checks (front at 0, 35, 80, 280 and 350 degrees with nothing of the back drawn; back at 100 to 260). The pixel checks of the edge at 90 degrees run only in an engine whose screenshots paint depth (WebKit's do not; its edge is checked by layout).

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
