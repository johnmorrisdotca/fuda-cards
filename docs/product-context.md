# Product context and decisions

This file is the shared project memory for Fuda Cards. It captures the decisions made so far and their current status; consult the roadmap, task board and work log before implementation. When decisions change, update this document and log the change. Personas are fictional design examples, not accounts or facts about real people.

## Purpose

Fuda is a reusable, framework-independent library for creating and displaying collectible cards and for presenting collections on websites. It serves two complementary uses:

1. A customizable card frame whose caller supplies a subject: images, animated content, or an interactive 3D object from another project.
2. A collection viewer that displays complete existing-card images, including API-provided images or a collector's own photos, without wrapping those images in an extra Fuda frame.

A host may supply a collection through JSON, a JavaScript object/array, or data fetched from an API. JSON cannot itself represent a live interactive viewer. Fuda should integrate with ordinary websites and React, Angular, Vue, Svelte and other frameworks, using TypeScript, pnpm and web standards consistent with the owner's other libraries.

## Existing related projects

- `@johnmorrisdotca/hako-devices`: device drawings and 3D viewers. Riley's demo interest is retro gaming hardware. The live viewer integration is not yet implemented.
- `@johnmorrisdotca/uchusen-rockets`: rocket drawings and 3D viewers. The local demo uses a still of Starship Block 3; the model credit is in `assets/README.md`. A still is not an interactive viewer.
- Uniforms and other collections can provide subjects later. Avoid embedding a particular external library or 3D engine as a core requirement.

The user expects reusable library packages and demos suitable for embedding on websites; public GitHub Pages or package release is not yet established.

## Card presentation and motion

- A card has configurable front, back, title and other details, frame and finish. A physical, photorealistic appearance is a goal, including cardstock, printing, foil, holographic effects, reflections and ageing.
- Research both broad design families and specific recognizable cards across roughly a century: classic Pokémon/Charizard, O-Pee-Chee Gretzky-era hockey, 1952 Topps, 1989 Upper Deck, modern chrome/Prizm, Magic and Yu-Gi-Oh among potential references. A frame design is separate from the subject provided by the host. The existing CSS variants are exploratory and are not finished period designs.
- A host can choose a focused still, automatic motion, or tap-to-animate and select focal area, direction, timing and looping. Tall items such as rockets can fill the artwork window while the view pans from the nose downward; static views can focus on the most interesting area.
- Interactive 3D objects should rotate by dragging inside the artwork window. Object manipulation, card flipping, collection browsing and page turning must have separate controls/gestures. Provide touch, keyboard and reduced-motion access. Panning a 2D image does not implement a 3D camera pan.
- API images may represent an entire printed card. Use them as full-card images; separate frames are not assumed to exist. Respect the source's access and image policies. The user prefers linking to provider-hosted images rather than hosting copies where the provider supports it.

## Collection presentation

All are planned product capabilities. Some have basic, unverified prototypes; see the roadmap for current status.

- **Overlapping Deck:** user's preferred initial view: one large centered card, other cards overlapping behind, swipe left/right or use arrows, tap to inspect.
- **Binder Pages:** opening book/binder, sleeves and configurable layouts such as 3 × 4 or 4 × 4, with page navigation.
- **Rolodex:** a distinct rotating index/card file; retain this as a separate option from the overlapping deck.
- **Convention Display Case:** dimensional glass/acrylic-style case, angled tiered and optionally overlapping rows, configurable grid including 10 × 10; tap to inspect and return to the same place.
- **Jukebox Carousel:** cards within a jukebox-like device, browse and select a card to bring into focus, then return.
- **Random Draw:** choose a surprise card, optionally within the active collection/filter; handle zero and one card.
- **Vertical Story Scroll:** vertically browse cards with room for moving or tall artwork.
- **Sliding Gallery Wall:** pan across cards displayed in a row.
- **Flip Tower:** standing stack/flipbook, moving through cards one at a time.
- **Spotlight Carousel:** circular stage arrangement, selected card prominent.
- **Infinite Card Atlas:** a flat, pannable and zoomable plane displaying an entire collection; tap to inspect, with practical large-collection virtualization. Current prototype is not a truly infinite canvas.

The user asked for many cool modes, but a label or shared placeholder renderer alone is not a finished implementation. Preserve position when closing inspection; support responsive layouts and reduced motion.

## Data, integrations and demo users

- Three fictional demo users and their current card IDs, stories and use cases are in `docs/demo-personas.md`; the actual demo entries are in `demo/users.js`.
- Support collector information such as set, year, number, edition, condition, grade, quantity and notes; allow additional fields in a future extensible model. Distinguish a catalogue image from a collector's own photograph of an individual card.
- TCGdex is a candidate Pokémon data and full-card image source. Its availability, missing images and usage requirements must be handled. Hockey and other sports need source/coverage research; do not assume a universal comprehensive API.
- A collector can import or supply a collection; lookup databases do not automatically know what a person owns. Demo persistence is browser-local only; accounts, server storage and cross-device collection sync are not implemented.
- The original wish was three different users: two Pokémon examples and Riley, an old console and gaming enthusiast consuming Hako content.

## Delivery, Git and cooperation

- Public repository: `johnmorrisdotca/fuda-cards`. Mac and cloud are separate working trees. Synchronize changes through GitHub; chat synchronization does not sync files.
- Work in incremental, reviewable units. Before taking a task, follow `AGENTS.md` and claim it in `docs/task-board.md`; after each increment, update the roadmap and append changes, tests, limitations and handoff to `docs/work-log.md`, then commit/push. The Git-backed board is cooperative, not an atomic lock. Do not take another agent's claim or overwrite a concurrent update.
- Verify actual remote history and reconcile without force-pushing. Earlier cloud root commit `fd1a6b3` and remote initial project commit `eab1a23` had identical trees but unrelated commit histories.
- Report precisely what was tested. Current automated tests do not prove UI, mobile gestures, third-party images or 3D integration work in a browser. The user wants agents to continue work autonomously and not stop after documenting plans.

## Current state

Read the live task board and latest log for current state; this context file is not a substitute for inspecting the repository. Initially there were eleven basic collection views, a card component, three demo profiles, a TCGdex example, JSON import and browser-local saving. Many features above remain partial or unbuilt.
