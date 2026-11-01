# Fuda feature roadmap

Status key: [x] implemented at prototype level; [~] partial, requires further work or verification; [ ] not implemented. Do not interpret a checked item as production-ready without browser verification. See `docs/work-log.md` for changes and handoff.

## Core cards and embedding
- [~] Framework-independent TypeScript web components and package exports; examples documented and equivalent integrations tested in Chromium with plain HTML, React 19, Angular 19, Vue 3 and Svelte 4.
- [~] Custom frame with title, category, description, number, rarity and artwork slot; responsive sizing and accessibility.
- [~] Card front/back and dedicated flip control; separate configurable whole-card center rotation and corner spin, pause, direction and reduced motion. The corner spin is a 3D turn on a fixed bottom-left corner (F21, headless Chromium only; not yet checked on a real phone). Broader card keyboard and focus behavior remains to be validated.
- [~] Full-card images supplied by collection owner or provider, plus optional reverse.
- [~] Focused image preview, configurable pan direction, duration, looping, auto-start or tap-to-animate, reduced motion. Verify browser behavior and handle non-image content.
- [ ] Integrate Hako Devices and Uchusen Rockets live 3D viewers inside custom card artwork; drag rotation, zoom and independent flip/motion controls; fallbacks and credits.
- [ ] Research recognizable trading card families and individual examples over the past century; build distinct card front/back designs, metadata layouts and physical finishes (paper, foil, holographic and ageing).
- [ ] Configurable visual presentation, card dimensions, colour and finishes; keyboard, touch and reduced-motion support.

## Collection display modes
Each needs genuine distinct presentation, responsive layout, selection and keyboard/touch support, empty and large-collection behavior, and browser tests.
- [~] Overlapping deck: large centered card, layered cards behind, swipe/arrows and inspect.
- [~] Binder: configurable page size and grid columns, with wrapped page controls; sleeves, covers, page turns and browser verification remain.
- [~] Rolodex: rotating file of index cards.
- [~] Convention case: angled tiered rows, configurable spacing and overlap, 3D case and full-screen inspection.
- [~] Jukebox: browse inside a device, bring a selection forward, return to location.
- [~] Random draw: filter by name and sample matching cards; empty and single-match logic tested. Browser interaction verification remains.
- [~] Vertical story scroll.
- [~] Sliding gallery wall.
- [~] Flip tower.
- [~] Spotlight carousel.
- [~] Card atlas: infinite-feeling plane, pan, pinch/scroll zoom and selection; virtualize large collections.
- [ ] Preserve position and independent controls across selection, flipping, and 3D interaction.

## Collection data and users
- [~] JSON imports and host-supplied card records, front/back images, validation, useful errors.
- [~] Three fictional demo users: two Pokémon collectors and a retro gaming Hako collector; five published Hako SVG URLs returned successful image responses.
- [~] Named collections saved per demo profile locally, with delete, JSON import/export, legacy import, and storage errors reported; core flows exercised in Chromium. Cross-device sync requires a chosen backend and is not implemented.
- [~] Pokémon TCGdex set example using API-provided full-card images; verify live API behavior, missing images, source usage rules and back images.
- [ ] Define provider adapters and source attribution for additional TCG and sports-card APIs; research actual hockey coverage and image availability.
- [ ] Search, filters, sorting, collection editing, quantity/condition/grade and optional metadata.
- [ ] Model custom-framed items and complete scanned cards in a common typed collection model without requiring a specific 3D engine.

## Delivery and quality
- [~] pnpm/TypeScript build and unit tests; add interaction tests and verify desktop/mobile browsers, keyboard and accessibility.
- [~] Static demo site built and GitHub Pages workflow deployed successfully; public URL accessibility remains unverified from this cloud environment.
- [ ] Large-collection performance, lazy loading, network errors, security, image and model attribution.
- [ ] Reconcile local/cloud Git history and push work to the shared GitHub repository without overwriting changes. Log each substantial change and verification in `docs/work-log.md`.
