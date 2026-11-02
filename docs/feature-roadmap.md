# Fuda feature roadmap

Status key: [x] implemented at prototype level; [~] partial, requires further work or verification; [ ] not implemented. Do not interpret a checked item as production-ready without browser verification. See `docs/work-log.md` for changes and handoff.

## Core cards and embedding
- [~] Framework-independent TypeScript web components and package exports; examples documented and equivalent integrations tested in Chromium with plain HTML, React 19, Angular 19, Vue 3 and Svelte 4.
- [~] Custom frame with title, category, description, number, rarity and artwork slot; responsive sizing and accessibility.
- [~] Card front/back and dedicated flip control; separate configurable whole-card center rotation and corner spin, pause, direction and reduced motion. The corner spin is a full-size 3D turn on a fixed bottom-left corner at the middle of the stage, with zoom, Fit and pan from `@johnmorrisdotca/kazoku-ui` in the Card Studio (F21 rework, headless Chromium only; not yet checked on a real phone). Zoom in every other display view is F22. Broader card keyboard and focus behavior remains to be validated.
- [~] Materials and stacks (0.4.0): 13 sourced materials (`docs/materials.md`) and `stack="N"`, N times the thickness high, the top card live and the cards under it flat stills from a seed; no frames at rest. Headless Chromium only; no real phone, Safari or Firefox. The edge colours are a look, not measured; a live 3D item as the top card waits for the shared renderer (MODULES-55, KAZOKU-UI-9).
- [~] Wear (0.5.0): `wear` presets from mint to damaged and a seed draw soft, rounded, chipped and folded corners, edge whitening, creases, scratches, specks, staining, toning and off-centre print on a card; a perfect card is unchanged and loads no wear code. Headless Chromium only; the grading words come from secondary sources (docs/wear.md). Not on `<fuda-collection>` images or on the cards under a stack's top card.
- [~] Card back and thickness: a turned card shows its back (not the mirrored front), with a true-scale `thickness` edge (default 0.3 mm, in mm) in gold foil or card stock (F23, F24; headless Chromium only, no real phone, Safari or Firefox). The collection views draw images and do not turn cards past 90°.
- [~] No flash before the card is ready: an undefined `<fuda-card>` and its picture stay hidden with the card's box reserved (one CSS line in the head, README); once defined, the art fades in only after the card is laid out and its images have loaded (0.2.1; headless Chromium desk and phone, e2e `no-reveal`; WebKit cannot draw the front yet).
- [~] Full-card images supplied by collection owner or provider, plus optional reverse.
- [~] Focused image preview, configurable pan direction, duration, looping, auto-start, tap-to-animate and `autoplay="focus"` (the card in focus only; icon-only 48 px button; 0.3.0), reduced motion. Verify browser behavior and handle non-image content.
- [~] Live 3D in cards, one card at a time on one context (MODULES-55): `live-3d` module, budgets enforced, `demo/live-3d.html` (headless Chromium in software only; no real GPU, phone or Safari yet).
- [ ] Integrate Hako Devices and Uchusen Rockets live 3D viewers inside custom card artwork; drag rotation, zoom and independent flip/motion controls; fallbacks and credits.
- [ ] Research recognizable trading card families and individual examples over the past century; build distinct card front/back designs, metadata layouts and physical finishes (paper, foil, holographic and ageing).
- [ ] Configurable visual presentation, card dimensions, colour and finishes; keyboard, touch and reduced-motion support.

## Collection display modes
Each needs genuine distinct presentation, responsive layout, selection and keyboard/touch support, empty and large-collection behavior, and browser tests.
- [~] Overlapping deck (0.6.0): a deck of up to ten cards beside a pile; Next flips the top card off onto the pile at the other side, still facing up or turned over (`deck-land`; `upside-down` is an alias of `face-down`), Previous brings it back; the whole deck turns in 3D with the angle, tilt and Auto-turn controls. Headless Chromium only.
- [~] Piles (0.7.0): the Overlapping Deck, Random Draw, Jukebox and Flip Tower, and `<fuda-card stack>`, all turn in 3D, fan open and closed (up to ten cards, most of each card showing, closing back exactly, in the address) and have a card taken off them onto a pile at their side. `view="fan"` is the same pile with only the fan. Headless Chromium only.
- [~] Animate (0.7.0): `animate="off"` and `speed` for the fan, a card taken off, Next in carousels, a switch of display, a pan to the card; on by default; reduced motion wins. Headless Chromium only.
- [~] Display buttons (0.6.0): the twelve displays are a row of buttons with small pictures, 48 px high, arrow keys, light and dark, in the address; no drop-down.
- [~] Binder: configurable page size and grid columns, with wrapped page controls; sleeves, covers, page turns and browser verification remain.
- [~] Rolodex: rotating file of index cards.
- [~] Convention case: angled tiered rows, configurable spacing and overlap, 3D case and full-screen inspection.
- [~] Jukebox: browse inside a device, bring a selection forward, return to location.
- [~] Random draw: filter by name and sample matching cards; empty and single-match logic tested. Browser interaction verification remains.
- [~] Vertical story scroll.
- [~] Sliding gallery wall.
- [x] Flip tower: dropped in 0.8.0 (no real counterpart; `view="tower"` opens the deck).
- [~] Spotlight carousel.
- [~] Card atlas: infinite-feeling plane, pan, pinch/scroll zoom and selection; virtualize large collections.
- [~] Zoom, Fit and move in every display view (F22): the eleven `<fuda-collection>` views, the standalone rolodex and the Pokémon binder demo use `@johnmorrisdotca/kazoku-ui` view controls; Fit shows every card; Ctrl or Command with the wheel, pinch, drag and arrows work; flat views only (none turns in 3D). Tested in headless Chromium at desk and phone size; no real phone, Safari or Firefox.
- [ ] Preserve position and independent controls across selection, flipping, and 3D interaction.

## Collection data and users
- [~] JSON imports and host-supplied card records, front/back images, validation, useful errors.
- [~] Three fictional demo users: two Pokémon collectors and a retro gaming Hako collector; five published Hako SVG URLs returned successful image responses.
- [~] Named collections saved per demo profile locally, with delete, JSON import/export, legacy import, and storage errors reported; core flows exercised in Chromium. Cross-device sync requires a chosen backend and is not implemented.
- [~] Pokémon TCGdex set example using API-provided full-card images; verify live API behavior, missing images, source usage rules and back images.
- [~] Hockey and baseball card pictures (0.6.0): researched (docs/card-images.md): no free card API with showable pictures; public-domain 1909 to 1911 cards from Wikimedia Commons and The Met are in `demo/vintage.html`. Provider adapters for other APIs are not built.
- [ ] Search, filters, sorting, collection editing, quantity/condition/grade and optional metadata.
- [ ] Model custom-framed items and complete scanned cards in a common typed collection model without requiring a specific 3D engine.

## Delivery and quality
- [~] pnpm/TypeScript build and unit tests; add interaction tests and verify desktop/mobile browsers, keyboard and accessibility.
- [~] Static demo site built and GitHub Pages workflow deployed successfully; public URL accessibility remains unverified from this cloud environment.
- [ ] Large-collection performance, lazy loading, network errors, security, image and model attribution.
- [ ] Reconcile local/cloud Git history and push work to the shared GitHub repository without overwriting changes. Log each substantial change and verification in `docs/work-log.md`.
