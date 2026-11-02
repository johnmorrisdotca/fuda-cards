# Work log and handoff

## 2026-10-31 — Baseline and continuation

- Repository: `johnmorrisdotca/fuda-cards`, public. GitHub `main` was created as commit `eab1a23`; its tree matched local commit `fd1a6b3`, but the two commits have different ancestry. Do not force-push; fetch and reconcile before pushing further work.
- Working environment at handoff: cloud workspace. A separate Mac checkout may exist and is not visible from this session. Confirm the target working tree and preserve changes before editing or syncing.
- `pnpm test` builds TypeScript and previously passed seven tests. Browser/phone testing and live remote image verification remain outstanding.
- Initial component `src/collection-element.ts` contains eleven prototype layouts; several share a stack renderer and are placeholders rather than fully realized experiences. The case is CSS perspective, not a 3D model; atlas is bounded by practical viewport and data, not truly infinite.
- The demo users and TCGdex adapter are in `demo/`. Riley's Hako remote artwork URLs have not been checked live. The Hako images are currently full-image records, not live Hako elements inside Fuda frames.
- This continuation corrected binder/case page wrap and attempted to suppress click after swipes. Those interactions have not been verified in a browser. Do not assume swipe suppression is reliable until tested; rendering replaces the old stage during touch end.
- Feature checklist and status are in `docs/feature-roadmap.md`. Update this log with date, changes, tests, limitations, and current Git state at each handoff.

## 2026-10-31 — Agent workflow

- Added `AGENTS.md` to direct future agents to the roadmap and handoff log, require appropriate verification, and commit and push each meaningful increment safely.
- Documentation-only change; no application behavior changed. The prior increment's build and seven tests passed; browser verification remains outstanding.

## 2026-10-31 — Shared task board

- Added `docs/task-board.md` with stable task IDs, ownership and status columns. Added claim, check-in, conflict and stale-claim guidance to `AGENTS.md`.
- Documentation-only change; no application behavior changed. The board coordinates through Git and is not an atomic lock.

## 2026-10-31 — Overlapping deck increment (F01)

- Claimed F01, corrected touch-end swipe cancellation and added arrow-key navigation with focus restoration to the deck and other stack views.
- `pnpm test`: TypeScript build and seven tests passed. The tests do not exercise browser touch or keyboard events. Browser and phone verification remain outstanding; task released for further work.

## 2026-10-31 — Random draw filtering (F06)

- Added case-insensitive name filtering in random view, with disabled draw for no matches and repeat avoidance when alternatives exist. A single match remains drawable.
- `pnpm check` passed (typecheck, build, and all four test files), including deterministic empty, single-match, filter, and selection cases. Browser and mobile interaction checks were not performed; verify them before marking the task Done.

## 2026-10-31 — Binder grid increment (F02)

- Added configurable grid columns for binder and case, page-number announcements, and focus restoration for previous/next controls; empty navigation is disabled. Page size is normalized to a whole number.
- `pnpm check` passed, including pagination tests for empty, partial, single and wrapping pages. Browser, keyboard, mobile and visual behavior were not verified. Covers, sleeves and page-turn animations remain; F02 is released for continuation.

## 2026-10-31 — Demo personas (F14)

- Documented the three fictional demo users, their motivations, exact implemented collections, and current integration limitations in `docs/demo-personas.md`. These narratives are design assumptions, not real user data.
- Documentation-only increment; compared card lists with `demo/users.js`. F14 remains open for asset verification, collection management and persistence work.

## 2026-10-31 — Shared product context and concurrent handoff

- Added `docs/product-context.md` capturing product goals, integrations, display modes, motion, demo users, Git practices and known limitations; `AGENTS.md` now requires reading it and the personas before work.
- F12 collection metadata increment passed eight tests and was pushed to branch `codex/f12-collection-metadata` (commit `3f7b199`), not merged into main. Main advanced concurrently for an F02 claim, so do not overwrite it; review/rebase or merge the F12 changes and preserve current claims. Branch includes changes in `src/collection-element.ts`, which may overlap F02. Its task status is Review.
- The product-context and persona work is documentation; no browser verification was performed. F14 remains Available for implementation and verification.

## 2026-10-31 — Merge collection metadata (F12)

- Reconciled metadata support with concurrent binder paging and random-draw work; preserved other task claims and the product context.
- In an isolated merged copy, `pnpm test` passed the TypeScript build and nine tests. Browser, touch, live API and 3D verification remain outstanding. F12 remains in Review.

## 2026-10-31 — Concurrent-agent coordination

- Added `docs/coordination.md` and made it required reading in `AGENTS.md`: isolated branches, pushed claims, incremental updates, shared-file conflict handling, latest-head checks, safe integration, verification, and durable handoffs.
- Documentation-only update. Prior metadata merge commit `84f954f` preserved concurrent F02/F06 work and passed nine tests in an isolated verification copy; browser verification remains outstanding.

## 2026-10-31 — Rolodex layout (F03)

- Claimed F03 and pushed a distinct rotating-file layout to `codex/f03-rolodex`, commit `9dd63ff`. Previous/next and keyboard arrows select a card; the centered card opens inspection. Side cards are decorative.
- `pnpm test` passed: TypeScript build and nine existing tests. These tests do not exercise this UI. Browser, touch and accessibility verification remain outstanding; the new Rolodex does not yet implement swipe or animated rotation between renders. Branch is not merged into main. Next: browser-test, refine interactions and integrate against latest main.

## 2026-10-31 — F03 browser verification attempt

- Reclaimed F03 and started the local demo. The available cloud browser could not reach the workspace demo: its localhost response reported `Missing or invalid bearer token`. No UI, keyboard, touch, or visual verification was completed. No application changes made in this attempt.
- Rolodex remains on `codex/f03-rolodex` at `9dd63ff`, not merged. Next agent should run the branch in a browser-accessible environment, test navigation, inspection, mobile and keyboard behavior, then reconcile with current main and integrate. Released F03 for continuation.

## 2026-10-31 — Whole-card rotation request (F18)

- Added available task F18 for slow, smooth whole-card rotation inspired by the Hako Devices and Uchusen projects and a separate corner-pivot, diamond-like spin. The user intends another agent to pick it up. Keep the card rotation distinct from rotating a 3D object inside the card and from collection navigation; coordinate with F09–F11.
- Requirements recorded only; no rotation implementation or browser verification performed in this increment.

## 2026-10-31 — Demo persistence and framework examples (F14/F15)

- Added browser-local profile-scoped named saves, delete, JSON export, explicit non-overwriting import of legacy shared saves, overwrite confirmation and visible storage errors. Existing legacy data is retained. Added storage unit tests for isolation, deletion, migration, malformed data and quota failures.
- Added plain HTML, React, Angular, Vue and Svelte integration examples, including property assignment and client-only registration guidance. The examples have not been built in framework projects.
- `pnpm check` passed (typecheck, build and five test files). A local Chromium attempt timed out; browser, device and framework runtime verification remain outstanding. GitHub Pages Hako image requests were denied by the environment network policy; the Hako source repository was reachable, but live image URLs were not verified.
- F14 is in Review for browser and asset checks; F15 is released for real framework builds and validation. Work branch: `codex/f14-f15`.

## 2026-10-31 — Complete F14/F15 verification

- Replaced the unverified GitHub Pages artwork references with the versioned Hako Devices 0.5.0 package SVGs via jsDelivr; all five returned HTTP 200 with SVG content type. This verifies file availability, not a live 3D viewer.
- Fixed a collection `view` getter collision that caused React 19 to fail when assigning the `view` attribute. Added a regression test.
- Built and ran equivalent plain HTML, React 19.3, Angular 19.2, Vue 3.5 and Svelte 4.2 integrations in headless Chromium 138, checking assigned card data and rendered card elements. Server-side rendering and other framework versions were not tested.
- Exercised the demo in Chromium: profile switching, saved collection isolation, save/load/delete, JSON import, exported file contents and legacy import. Verified all six test files pass with `pnpm test`; typecheck and build passed with `pnpm check`. No phone or touch testing was performed.
- F14 and F15 completed for their stated scopes. Cross-device sync and live 3D viewer integration are separate unimplemented capabilities.

## 2026-10-31 — Whole-card rotation (F18)

- Added separate card-level center (3D vertical-axis) and upper-left corner (2D) continuous spins, configurable duration and direction, pause/resume without resetting, and reduced-motion behavior. Rotation wraps the existing independent flip and artwork rather than consuming their input. Card Studio exposes accessible controls; README includes embedding and review steps.
- Researched Hako Devices and Uchusen viewers: each uses a configurable slow 180-second default turn. `pnpm check` passed. Chromium desktop and mobile emulation exercised center and corner motion, pause/resume, keyboard activation, reverse, flip, touch activation, independent interactive artwork, and reduced-motion suppression. Actual physical devices and screen readers were not tested.

## 2026-10-31 — Public demo site (F19)

- Added a repeatable static site build and GitHub Pages workflow, using the deployment pattern from Uchusen and Hako. Card Studio now links to the collection viewer and Pokémon binder; the collection viewer links back. The site builder protects a pre-existing unmarked site directory.
- `pnpm check` passed, and `pnpm site` succeeded twice. Chromium checked the generated site under a subdirectory: card controls, collection navigation and binder fallback rendered. External TCGdex/Hako responses were not checked in that browser run.
- GitHub Pages deployment, repository settings and public access still require verification. The environment denied the GitHub API request; no Pages configuration or deployment result was confirmed.

## 2026-10-31 — Pages deployment result

- GitHub Actions Pages run 41278795754 for commit `365b0a5` completed successfully and reports `https://johnmorrisdotca.github.io/fuda-cards/` as the deployment URL. The cloud network policy denied requests to that hostname, so public HTTP accessibility was not independently verified.

## 2026-10-31 — npm release preparation (F20)

- Added repository metadata and a GitHub Actions release workflow using npm trusted publishing and provenance, matching the related projects. The workflow runs the full checks and publishes on a matching version tag or manual dispatch.
- `pnpm check` passed; an npm tarball was installed in a temporary project and its main entry point imported successfully. The registry returned 404 for version lookup and `npm whoami` reported no local npm login. Publication and npm trusted-publisher authorization still require verification.

## 2026-10-31 — npm publication blocked (F20)

- Pushed `v0.1.0` at commit `711c518`, triggering release run 41279090144. Its publish step failed; the public job page reports exit code 1 but the detailed step log was unavailable without authentication. Registry lookup still returned 404 for `@johnmorrisdotca/fuda-cards@0.1.0`. No local npm publisher login is configured.
- Next: the npm scope owner should review the failed publish-step log and authorize the `johnmorrisdotca/fuda-cards` repository, workflow `.github/workflows/release.yml` (workflow filename `release.yml`) as a trusted publisher for `@johnmorrisdotca/fuda-cards`, including pending publisher setup for a new package if needed. Then rerun the failed GitHub Actions job and verify `npm view` and an installation. Do not place tokens in the repository or chat.

## 2026-10-31 — npm package published (F20)

- The owner published `@johnmorrisdotca/fuda-cards@0.1.0` from tag `v0.1.0`. After npm processing completed, a clean npm registry install succeeded and the main and collection entry points imported successfully.
- The initial automated publish failed. npm trusted-publisher authorization for `release.yml` has not been verified; configure and test it separately before relying on automated future releases.

## 2026-10-31 — Bottom-corner spin bug (F21)

- User reports that the published “Spin around corner” motion is wrong: the card should spin a full 360° in a circle on a bottom corner, like an ice skater. The screenshot shows the current card turned sideways and drifting outside the preview area. The existing implementation rotates in the plane of the screen around its upper-left corner; it does not match the requested motion.
- Follow-up: implement and visually verify the intended bottom-corner spin, keeping the pivot stable and the card visible; verify the rotation in three dimensions and show both faces as appropriate. Preserve independent flip and artwork interactions, speed, direction, pause/resume, and reduced-motion behavior. Check desktop and mobile layouts with a real visual review. No implementation change or new verification was performed in this ticket-creation update.

## 2026-11-01 — Bottom-corner spin fixed (F21)

- Cause: the corner spin was a 2D `rotate(360deg)` around the top-left, so the card swung flat in the screen plane and left its box. Fix: `card-spin="corner"` is now `rotateY` through the bottom-left corner (`transform-origin: 0 100%`), like an ice skater; the corner stays still and the back shows half way round. To keep the whole sweep inside the element, the card is drawn at half size with its corner at the bottom center of the element (`translate(50%,-25%) rotateY(..) scale(.5)`). Speed, direction, pause/resume and the independent flip and artwork are unchanged; reduced motion still removes the animation.
- Test: new `test/e2e/corner-spin.e2e.mjs` (`pnpm test:e2e`, Playwright, skipped when it is not installed, not part of `pnpm check` or CI). It steps the animation through 72 angles at a desktop (1280x800) and a mobile (390x844) viewport and checks the corner probe moves under 1px, the card stays within 4px of the element box, both faces turn toward the viewer, and reduced motion removes the animation. It fails on the old code (corner moved) and passes on the new. README and demo label updated. Version left at 0.1.0: no repo doc asks for a release per fix.
- Limits: headless Chromium only; the mobile run is viewport emulation, not a real phone or touch. The spin is smaller than before (half size). No Safari or Firefox check. F21 is in Review until a person looks at it on a real phone.

## 2026-11-01 — Corner spin rework: full size, pivot at the stage centre, kazoku view controls (F21)

- John's rework brief after 8aa1798: undo the half-size drawing; the card keeps its full size and turns about its bottom-left corner, which sits at the middle of the stage; zoom in and out, Fit and pan must always let the reader see the whole card. `card-spin="corner"` is now `translate(50%,-50%) rotateY(..)` with origin at the bottom-left corner (no scale). New `card-view` attribute: no built-in animation, the angle comes from `--fuda-yaw` and `--fuda-tilt`; `--fuda-perspective` sets the perspective (default 1000px).
- Card Studio: the stage holds the card in a zoomer and the shared `@johnmorrisdotca/kazoku-ui@0.1.0` `<kazoku-view-controls for="stage" address zoom-min="0.5">` sits right under it (Angle, Tilt, Auto-turn, Front, -, 2x, +, Fit, pan pad, Move/Turn, address). Its `kazoku-viewchange` events set yaw and tilt on the card and zoom and pan on the zoomer. The card is scaled by a computed fit factor so zoom 1 (Fit) shows the whole sweep for the chosen pivot; zoom out goes to 0.5. The old Off option and Pause button are gone (Auto-turn replaces them); speed and direction selects set the controls' speed. Added to the stage a capture-phase guard so the card's Animate button still receives clicks (the controls capture the pointer).
- Dependency: added as a devDependency (the demo only; `<fuda-card>` imports nothing). README has no "no dependencies" claim, so no wording changed; it now says the element itself has no dependencies. `scripts/site.mjs` copies the package's dist into `site/node_modules/...` and `index.html` has an import map for it.
- Test `test/e2e/corner-spin.e2e.mjs` (`pnpm test:e2e`, Playwright, not part of `pnpm check`): at 1280x800 and 390x844 it sets 72 angles and checks the corner is within 1px of the stage centre, the card is 300px wide and stays inside the stage at Fit, both faces show, Zoom in/out (below Fit)/2x/Fit and Ctrl+wheel work and keep the corner still, the controls are in the first screen, Animate still works, Auto-turn turns and a control does not stop it, and with reduced motion nothing turns by itself. `pnpm check` (13 tests) and the e2e pass. Picture: before and after in scratchpad `fuda-f21/rework.png`.
- Limits: headless Chromium only; phone is viewport emulation, not a real device or touch. Pinch and one-finger turn/pan come from kazoku-ui and were not exercised here. At Fit the corner sweep shows the card small on a short stage (about 0.4 to 0.5 of full size, because the pivot is at the middle and the card sweeps upward); the default centre pivot shows it near full size. Max tilt can pass the Fit frame; zoom out shows it. No Safari or Firefox. Worth telling kazoku-ui: an option to ignore buttons inside the view so pointer capture does not swallow their clicks. Zoom in every other display view is the new task F22.

## 2026-11-01 — Corner spin opens at full size (F21 follow-up to 6c1a547)

- John chose option A: the Card Studio used to open at Fit, which showed the corner-spin card at about 0.4 to 0.5 of full size. It now opens with the card at full size (300px wide on a desk), even if part of the sweep passes the stage edge while it turns. Fit still returns to the whole-sweep view; Zoom out still goes to 0.5.
- How: kazoku-ui reads its `zoom` attribute only as a fixed number, and the full-size zoom depends on the stage size and the pivot, so `index.html` calls `view.set({zoom: 1/fit})` (capped at the controls' maximum) once when the controls are ready and again when Card rotation changes. A `zoom` in the page address wins over this default. No new package code.
- Test: `test/e2e/corner-spin.e2e.mjs` now checks the opening zoom is above 1 and the card is 300px wide, then presses Fit before the existing in-stage sweep check, and checks that `?zoom=2` wins. `pnpm check` (13 tests) and `pnpm test:e2e` pass in headless Chromium at 1280x800 and 390x844. Same limits as before: no real phone, Safari or Firefox.

## 2026-11-01 — Card Studio on kazoku-ui 0.2.0 (F21 follow-up)

- `@johnmorrisdotca/kazoku-ui` is now `^0.2.0` (devDependency). The controls have `zoom="1"` (natural size) and the page calls `view.setFitScale(fit)` each time it measures the stage, so the hand-written `view.set({zoom: 1/fit})`, the `opened` flag and the address-zoom check are gone. The studio opens with the card at full size, Fit still shows the whole sweep, and an address `?zoom=2` still wins.
- The pointer guard for the Animate button stays: 0.2.0's default `ignore` is matched against the event target, which is the `<fuda-card>` host because the button is inside its shadow root, so the click is still lost without the guard (tested: removing it fails the Animate check). Worth telling kazoku-ui to match `e.composedPath()` as well.
- Checks: `pnpm check` (13 tests) and `pnpm test:e2e` pass in headless Chromium at 1280x800 and 390x844. Same limits: no real phone, Safari or Firefox. F21 stays in Review.

## 2026-11-01 — Card Studio on kazoku-ui 0.2.1, Animate guard removed (F21 follow-up)

- `@johnmorrisdotca/kazoku-ui` is now `^0.2.1` (devDependency). Its `ignore` check now looks through open shadow roots with `event.composedPath()`, so the Animate button inside `<fuda-card>` no longer starts a drag. The `pointerdown` guard on the stage in `index.html` is removed.
- Checks: `pnpm check` (13 tests) and `pnpm test:e2e` pass in headless Chromium at 1280x800 and 390x844 (Animate still clicks while a drag still turns; opens at full size; Fit; `?zoom=2`). Same limits: no real phone, Safari or Firefox. F21 stays in Review.

## 2026-11-01 — Turned card shows its back; card thickness (F23, F24)

- F23 cause: the drop shadow was `filter: drop-shadow(...)` on `.card`. A `filter` forces `transform-style: flat`, so the front and back were flattened into one plane and past 90° the whole front showed mirrored (title, art, text, Animate). The package already had a back face (the navy FUDA face), so that is the one used; no new back was designed. Fix: the filter moved to `:host`, outside the 3D chain, so `backface-visibility: hidden` works again. Past 90° the back shows; the front draws nothing and takes no hits, so Animate cannot be seen or clicked from behind.
- F24: new `thickness` attribute in millimetres (default 0.3; 0 is flat), `thickness?: number` in `CardOptions`. The host is a size container, so the thickness scales with the element's width (63 mm = card width): 0.3 mm is about 1.4px at 300px. The front and back sit at plus and minus half the thickness; the edge is 4 straight strips plus 2 chords on each rounded corner (12 thin planes), standing between the faces, so it shows edge-on and has no coplanar overlap with the faces (no z-fighting). Gold foil edge for the classic frame, card-stock cream for sport and cosmic; `--fuda-edge` overrides. The Card Studio has a Thickness select (0.3, 0.8 metal, 1.5 relic, flat). Version 0.1.1.
- Collection views draw images and tilt them under 90°; they do not turn cards past 90° and have no back face to show, so nothing changed there.
- Test `test/e2e/card-back.e2e.mjs` (`pnpm test:e2e`, Playwright, not part of `pnpm check`), desktop 1280x800 and phone 390x844 viewport: at 100, 140, 180, 220 and 260 degrees the pixels equal those with the front hidden (no front glyphs), the back is hit at the centre, Animate is not hit or clicked from behind and still works from the front; the edge is 0.3 mm wide at the default, 1.5 mm with `thickness="1.5"` and 0 flat; at 90 degrees the edge has width and is drawn along 97% or more of its height with no gap. It fails on the old code.
- Limits: headless Chromium only; the phone is viewport emulation. No Safari or Firefox (container query units and 3D planes should work in current ones, not checked). Corner chords approximate the arc to about 1px. F23 and F24 are in Review.

## 2026-11-01 — Zoom, Fit and move in every display view (F22)

- John (2026-11-01): always support zoom in and out so a card can be seen fully, with the same controls everywhere. Every display view now has the `@johnmorrisdotca/kazoku-ui` `<kazoku-view-controls flat>` on the view, kept at the installed `^0.2.1`.
- Views covered: the eleven `<fuda-collection>` views (deck, rolodex, binder, case, jukebox, random, story, wall, tower, spotlight, atlas), `demo/rolodex.html` and the Pokémon binder demo (`demo/tcgdex.html`); the Card Studio already had it (F21). All are zoom and move only (`flat`): none turns in 3D, so the angle, tilt and auto-turn controls are hidden. `demo/collections.html` was an unlinked older copy of the views with its own atlas slider; it now shows the same component as `collections-component.html`.
- How: new `src/zoom.ts` (`zoomView(stage, view)`, shipped as `dist/zoom.js`, not a package export; the demos import it by path). The stage clips; one inner element holds the cards and gets `translate` and `scale`. Fit is measured from the cards' own rectangles (never larger than natural size, 12 px margin), so Fit shows every card the view draws. `<fuda-collection>` now builds its shell once and only replaces the cards on each render, so the controls (and the zoom) survive paging, drawing and typing in the filter; changing the view type starts the new view at its opening size. The wall, story and atlas open at half size or larger and start at the first card; every other view opens at Fit. The old atlas pan, pinch and zoom slider code is gone.
- `ignore`: the cards are buttons that fill the view, so kazoku's default `ignore` would stop a drag or a pinch that starts on a card (a pinch on a dense page would never start). The controls get `ignore=""` and `zoom.ts` passes a tap that did not move on as a click to the button under it, and drops the browser's own click for a pointer press so a card is not opened twice. A keyboard Enter still clicks natively. Tested: with the default `ignore` the new e2e fails at the drag over a card. The image's own drag-and-drop is cancelled (it was ending the drag), text selection is off on the stage.
- Reduced motion: nothing animates the zoom (no transition on the view) and the card transitions are off, as before.
- Controls on the first screen: the stage height is `--fuda-stage-height`, default `clamp(300px, 100svh - 440px, 620px)`; `demo/collections-component.html` now puts the viewer under a one-line heading and the profile and save tools below it; the Pokémon demo's heading is smaller and its intro hides on a phone. The e2e checks the bar is in the first screen zoomed in and out.
- Dependency: `@johnmorrisdotca/kazoku-ui` moved from devDependencies to dependencies (`<fuda-collection>` imports its `define` entry). A plain HTML page needs an import map (README, `docs/framework-integration.md`). Not needed by `<fuda-card>`.
- Tests: new `test/e2e/zoom.e2e.mjs` (`pnpm test:e2e`, Playwright, not part of `pnpm check`), desk 1280x800 and phone 390x844, offline (images and the TCGdex service are answered by the test). On every view: the controls are in the first screen and the page is not wider than the window; Fit shows every card (within 2 px); + grows the cards by the zoom and Fit returns; the arrow pad and a drag that starts on a card move the view and do not click it; Ctrl+wheel, a two-pointer pinch over a card and the `+` and `0` keys zoom; a click on a card (at Fit and zoomed) still reaches it; moving to the next card or page keeps the zoom and zooming keeps the card or page; no page errors. Also: reduced motion, the zoom in the address (`?zoom=2` wins over the opening view), Enter opens a card, and the full demo's first screen. `pnpm check` and `pnpm test:e2e` pass.
- Limits: headless Chromium only; the phone is viewport emulation, the pinch is synthetic pointer events (no real two-finger touch), and the tap path was not run on a real touch screen. No Safari or Firefox. At Fit the story shows a thin strip of tiny cards (the whole collection of 12 is 12 screens tall), the wall on a phone is small; zoom in to read. Two quick taps on the same empty spot are kazoku's double-tap zoom; a tap on a card opens the card first. The inspect dialog's enlarged picture has no zoom controls (not a display view). F22 is in Review.

## 2026-11-02 - Art revealed before the card was ready (MODULES-42), MacBook (machine2) subagent / work/no-reveal

- Problem (John): on reload of the demo the full rocket showed before it went into the card. Cause: the Studio page defines `<fuda-card>` in a module script at the end of the body, after the import map and the kazoku-ui import. Until then the browser draws the unknown element's `<img>` at its natural size (465x1165) and lays the page out around it; defining the element then shrinks it into the frame (CLS 0.06 on a desk, 0.25 on a phone). Reproduced in headless Chromium with the cache off, a 350 ms script delay, 4x CPU, a screenshot every 50 ms: the rocket is on screen from about 100 ms to 1 s.
- Fix in the element: `.art ::slotted(*)` starts at `opacity:0`; `.art.ready` (set when the host has a size and every slotted `img` is `complete`, re-checked on slotchange, load, error and resize) fades it in over .35 s, none under reduced motion. Fix for pages: one CSS line in the head (README) that hides an undefined card and reserves its 300 px x 2.5:3.5 box, with `:where()` so a page's own width rule still wins and nothing moves; `<fuda-collection>` reserves the height of its view. Demos carry it. Studio reserves `kazoku-view-controls`' space; the binder demo reserves its status line.
- Tests: `test/no-flash.test.mjs` (in `pnpm check`: README line equals the demo pages' line, placed before any script) and `test/e2e/no-reveal.e2e.mjs` (`pnpm test:e2e`): the art is a solid magenta picture of the real size; a screenshot every 40 ms while the Studio loads (slow script, and slow picture), desk and phone: no magenta pixel outside the card's final frame (plus 3 px), none before the card reports ready, and the art does appear inside once loaded; CLS under 0.03 on all five pages. It fails on the 0.2.0 code (88,194 art pixels outside the frame at 142 ms) and passes now. `pnpm check` and `pnpm test:e2e` pass.
- Limits: the headless WebKit run only films the page after load (its screenshots wait), and WebKit draws the card's back mirrored instead of the front (also in 0.2.0), so WebKit proves little; filed as its own ticket. No real phone. A page without the CSS line can still show the raw picture until its script runs (documented). If the script never runs, the card stays blank.
- Also: `release.yml` calls kazoku-ui `reusable-release.yml@v0.7.3`; `AGENTS.md` from the kazoku-ui template.


## 2026-11-02 - Quiet Animate button and autoplay on focus (MODULES-53), MacBook (machine2) subagent / feat/quiet-animate

- John: the Animate button over the art was ugly. Now an icon-only play or pause mark (26 px, half strength until hovered or focused) inside a 48 px square hit target, `aria-label="Animate the picture"` with `aria-pressed`; no text.
- New `autoplay="focus"`: the card in focus (pointer over it, keyboard focus inside it, or last tapped) animates its art. One module-level `focusedCard`, so only one card is in focus; a pointerdown anywhere else, or focus moving to another card, stops it. The button pauses the focused card (kept until focus leaves); on touch the first tap on a still card's button starts it (the pointerdown records whether the card was focused, because focus lands on the button before the click). Never autoplays with `prefers-reduced-motion: reduce`. It does not set `playing`.
- Cause found on the way: toggling a class on `.art` did not always restyle the slotted `<img>` in Chromium (a card kept its animation after it lost focus), so the element reflects the state as a read-only `moving` attribute on the host and the CSS uses `:host([motion="pan"][moving])`.
- Tests: `test/e2e/autoplay.e2e.mjs` (+ `fixtures/autoplay.html`, three cards) at 1280x800 and 390x844: button size, name, no text, quiet; hover, keyboard and touch focus move the motion between cards; pause by button; reduced motion starts nothing. `pnpm check` 16 pass, `pnpm test:e2e` 13 pass (WebKit not installed here).
- Limits: headless Chromium only; the phone is viewport emulation with synthetic touch; no Safari or Firefox. `<fuda-collection>` draws images, not `<fuda-card>`, so autoplay does not apply there.

## 2026-11-02 - Materials with sourced thickness, and a stack mode (MODULES-52), MacBook (machine2) subagent / feat/materials-stack

- John: each material has its own thickness, and a stack of 52 paper cards is not a stack of 52 aluminium ones; count free, with sourced presets; do what toranpu does for piles.
- Materials (`src/materials.ts`, `docs/materials.md`): 13, each thickness quoted from a maker or a standard (Qin Printing's published calipers for card stock; ISO/IEC 7810 for the ID-1 plastic card; Ultra PRO's holder sizes for 35 to 180 pt trading cards and a 175 pt booklet; a seller's 0.8 mm anodised aluminium listing; a metal-card maker's 0.5 mm stainless). Left out as unsourced: patch or relic, graded slab, plastic playing card, other metals. Reviewers' and blogs' numbers were not used. The doc says what each source says and its limits.
- Presets: 52 and 54 (Wikipedia, Playing card), 60-card deck and 10-card booster (Wikipedia, Pokémon Trading Card Game).
- Stack: `stack="N"` makes the card's depth N times the thickness (one block, the existing edge planes with a line for each card on them), the top card live; with messiness above 0 the 10 cards under it are flat stills (`.still`, one `translate3d` each, same preserve-3d scene, no art or text) nudged and turned from a seed. The idea and parameters (messiness, seed, depth) are toranpu's `pileLayout`; the code is written again (`src/stack.ts`) because a true thickness needs no fake y offset. I read toranpu on machine1 over ssh, read-only. The maths could be shared: filed as a kazoku-ui ticket.
- Freeze safety: nothing is scheduled; the e2e (`stack.e2e.mjs`) counts rAF calls, running animations and compositor frames (CDP screencast) over 2 s at rest with a 52-card stack and 10 stills: 0, 0, 0. It also proves the counter works (a change draws frames).
- Studio: Material (grouped), Thickness (now an override; the old unsourced "metal 0.8" and "patch or relic 1.5" presets are gone), Stack of cards (presets), Cards in the stack, Messiness, Shuffle seed, and a height line. Fixed the right column growing wider than the page with a long material name.
- Tests: `test/materials.test.mjs` (in `pnpm check`: ids, sources, points = 0.0254 mm, docs list every material and preset, layout is seeded, neat at 0, at most 14 degrees, a card keeps its place); `test/e2e/stack.e2e.mjs`: depth in px for one card and 52, stills 10, 0, 3, 51, thickness override, side-on width, idle frames, Studio pickers; desk and phone.
- Limits: headless Chromium only; the edge colours are a look; stills show the front frame only, not the card's back or face; a stack with a live 3D top item waits for the shared renderer (MODULES-55, KAZOKU-UI-9). A stack of hundreds of cards is a deep box: at 1000 cards it is about 4.8 card widths deep.

## 2026-11-02 - Cards that are not perfect (MODULES-72), machine1 subagent / work/features

- John: "should show cards that aren't perfect in shape. the corners slightly damaged etc. research what non-perfect cards look like." Research: Wikipedia (Trading card, Value, Condition), a Pokémon condition guide that states its own conventions (Rare Candy) and a third-party summary of the PSA scale (cardgrading.app). PSA's, Beckett's, SGC's and TCGplayer's own pages returned HTTP 403 to the tools used, so they were not read; docs/wear.md says so.
- New `src/wear.ts` (loaded by a dynamic import only when a card asks for wear), `wear`, `wear-seed`, `wear-corners|edges|surface|creases` attributes, presets perfect to damaged, exports `wearPresets`, `wearLayout`, `wearLevels`, `wearOutline`, `wearOverlaySvg`. Each face's outline is a mask (so the shadow follows it) and one SVG lies over it. The marks are a pure function of the levels and the seed.
- A perfect card is unchanged: the shadow markup equals the 0.4.0 markup saved in `test/e2e/fixtures/perfect-card-0.4.0.html`, and a screenshot of it has the same SHA-256 as 0.4.0's (checked by hand, not in CI: pixels differ between machines). `wear.js` is not requested for a perfect card.
- Tests: `test/wear.test.mjs` (in `pnpm check`) and `test/e2e/wear.e2e.mjs` (`pnpm test:e2e`): same seed same markup and same pixels, other seed other marks, back face worn, removing wear restores the markup, override beats preset.
- Ports: the repo now uses 8100 to 8199 (dev 8100, e2e 8111 to 8119).
- Limits: headless Chromium only; the 3D edge planes keep the perfect outline; no wear on collection images or on the cards under a stack's top card.

## 2026-11-02 - Deck: rotate, flip off, fan, and display buttons (MODULES-73, 74, 77, 78), machine1 subagent / work/demo

- John: "be able to rotate a deck"; "when flipping a card off a deck, we need to see it on the other side (either upside down or still facing up): options"; "like playing cards, fan the deck: open and close back to start position. open reveals most cards"; "the 'Display' dropdown is boring. show buttons or small boxes ... span the width of the demo page".
- Reading of "deck": the collection viewer's Overlapping Deck (flat, three offset images, Next re-rendered with no motion), where a card flipped off simply vanished. It is now a deck and a pile: Next flies the top card (the same element, WAAPI keyframes on a `.fly` and a `.turn` layer, so a card is never drawn twice) to the pile at the other side; `deck-land` is face-up, upside-down (spun in its plane) or face-down (turned about Y, showing `backImage` or a generic back). The `<fuda-card stack>` (all cards carry the same picture) does not fan or flip cards off; if John meant that, it is a follow-up (filed).
- Rotate: `zoom.ts` gained `setTurnable`; for the deck the view controls lose `flat`, and `draw` appends `rotateX(tilt) rotateY(yaw)`; the stage has perspective and the table `preserve-3d`, each card sits `0.9px` above the one under it. Leaving the deck resets yaw and tilt before the controls go flat (the controller ignores `set` once flat).
- Fan: `fanLayout` (pure, tested) gives each card an open angle and offset and a closed nudge from the stack layout's seed; CSS transitions on `transform` with a stagger, pivot below the card; none under reduced motion.
- Display buttons: `src/choice.ts` (radio group, tiles with SVG icons, `CHOICE_VARS` light and dark, `CHOICE_CSS`); `demo/ui.js` turns the demos' short `<select>`s into the same buttons and keeps choices in the address. kazoku-ui has no shared part for this yet (its README lists "picture-tile pickers" as later), and its address-state exists only in 0.9.0, whose view controls changed their button names and broke the zoom e2e, so the package keeps `^0.2.1` and writes its own small address code; filed as a kazoku-ui ticket.
- Tests: `test/e2e/deck.e2e.mjs` (7: flip off and back with animation present, three landings and the address, reduced motion, 3D turn and reset, fan open and close back exactly, 12 buttons at least 48 px high spanning the width in both themes with arrow keys, and no control left in the browser style on the Studio and collection demo), `test/collection.test.mjs` (fan layout). Existing e2e adapted (the Display and the demo collector are buttons).
- Pre-existing, not mine: on this Mac `autoplay.e2e.mjs` (3 tests) and the `story` view in `zoom.e2e.mjs` fail on 0.4.0 too (same assertions, checked on a clean checkout of origin/main); filed.
- Limits: headless Chromium only; the phone is viewport emulation; no Safari or Firefox (the deck relies on `preserve-3d` with `backface-visibility`).

## 2026-11-02 - Card pictures beyond Pokémon, and bigger demo collections (MODULES-76, 75), machine1 subagent / work/demo

- Research for MODULES-76 is in docs/card-images.md: sources, their terms as read, and what was not used. Short answer: no free hockey or baseball card API with showable pictures; the licence-clean route is public-domain vintage cards, checked per item. Built `demo/vintage.html` with 36 hockey cards (Commons, "Public domain" on every file) and 24 baseball cards (the Met, `isPublicDomain` true on every object). Several tools got HTTP 403 (PSA, TCGplayer, TCDB, LoC, Smithsonian pages): those terms were not read and the doc says so.
- MODULES-75: Alex has 25 Base Set cards (5 by 5), Sam a pack of 10; the card names were checked against the TCGdex set listing (40 of 40). Vintage collections have 36 and 24.
- Tests: `test/vintage.test.mjs` (public domain notes, hosts, no league or maker names, demo not in the package files), `test/demo-users.test.mjs` (25 and 10).

## 2026-11-02 - Releases 0.5.0 and 0.6.0 (MODULES-72 to 78), machine1 subagent

- 0.5.0 (wear): tag v0.5.0 on 397df1c, Release run green, `+ @johnmorrisdotca/fuda-cards@0.5.0` in its log, on npm. 0.6.0 (deck, fan, display buttons, vintage demo): tag v0.6.0 on 88d6a70, Release run 41468137220 green, `+ @johnmorrisdotca/fuda-cards@0.6.0` in its log.
- Checks before each tag: `pnpm check` green (Pages runs it too), Pages green on the release commit, no Release run in progress, version not on npm, `coord.py since 2h` read. `pnpm test:e2e`: 28 tests, 24 pass; the 4 that fail (autoplay x3, zoom story view) fail identically on a clean 0.4.0 checkout (MODULES-98).
- The push guard of this clone allows john@johnmorris.ca (`git config pushguard.authors`), as for the other public repos.
- Ports: the repo now owns 8100 to 8199 (row added to John's port table).
- Bytes (raw, gzip -9): 0.4.0 element.js 17258/5318, collection-element.js 10702/3806, collection.js 3764/1281, zoom.js 5062/1913. 0.5.0 element.js 19027/5826, new wear.js 16901/5434 (loaded only on demand). 0.6.0 collection-element.js 26553/8038, new choice.js 4623/1811, collection.js 4725/1634, zoom.js 5509/2051.

## 2026-11-02 - Piles turn, fan and have a card taken off; Animate (MODULES-100, MODULES-104), machine1 subagent / work/piles

- John: "any decks that look like a pile of cards should rotate"; "any deck that is a pile of cards should fan open or closed"; "taking a card off, or flipping it off must be done"; "open fan and close aren't animated. they should probably be animated, with options for not. same with all things like carousel, spotlight."
- Which displays are piles (my call, from looking at all twelve): `<fuda-card stack>` and the Overlapping Deck, yes. Random Draw, Jukebox Carousel and Flip Tower drew the same three cards nudged 14 px on top of each other with the top one chosen, so they read as a pile and are now the deck's pile with their own look (Random keeps Draw and its filter, Jukebox its frame). Rolodex (42 px and 12 degrees apart) and Spotlight (70 px) spread their cards: carousels, left alone. Binder, case, wall, story and atlas are grids and strips, not piles. The Fan of Cards is the same pile with only its fan.
- One code path: `src/pile.ts` (fan layout, bounds, landing, flight, timing) is used by `<fuda-collection>` and by `src/pile-card.ts` (the stack's fan, pile and bar, loaded by dynamic import only when a stack asks, like wear). The fan is a CSS transition in place (class `fan-open` and `--fl/--fr/--ft/--fb` on the view, no redraw), the view's Fit comes from one hidden `.extent` box so Fit does not wait for the transition, and the view glides to the new fit (`zoom.animated`). A card in a stack's fan is the live top card carrying the others as children with relative transforms (`fanRelative`), so one 3D scene whatever the count.
- Animate: `animate` (default on) and `speed` on both elements; `--t` is the one length; moves are CSS transitions, FLIP-style `translate`/`scale` one-shot animations and WAAPI; nothing runs when idle (tests count animations). A measure ends a running glide first (a bug the on-vs-off test found: Fit was measured on a view in mid-glide).
- Tests: `piles.e2e.mjs` (8): every pile (deck, random, jukebox, tower) on desk and phone: up to ten cards, open fan inside the view, neighbours at least 45 percent of a card apart, turn then fan then close exactly back (transform, origin and box of every card), flip-off from a fanned-and-closed pile and from an open fan; the Fan of Cards; Animate on and off end in the same places (fan, Next, double Next, Rolodex, Spotlight, open fan of cards) and nothing is running afterwards; off and reduced motion run no animation; Speed; the address round trip including `upside-down`; `<fuda-card stack>`: fan opens and closes exactly with faces drawn, take off / put back / double press / turn and fan in the middle, Animate off; a plain card equals the 0.4.0 fixture and requests no pile code. `pnpm check` 33 pass; `pnpm test:e2e` 36 tests, 32 pass; the 4 that fail are MODULES-98 (autoplay x3, zoom story Fit), identical before.
- Studio: `.piles` block under the view (Take a card off, Put it back, Fan, Landing, Animate, Speed), hidden until the buttons exist so the page does not shift (no-reveal e2e). The Studio's Fit now counts the open fan and the pile at the side.
- Limits: headless Chromium only; the phone is viewport emulation; no Safari or Firefox; wear is not drawn on the stills of a fan (they copy the face with its wear overlay but are not tested); the stack's pile shows up to ten stills under its top card; the discard of a stack uses its own seed.

## 2026-11-02 - Real binder sheets, the page turn, and the audit (MODULES-107, 106, 108), machine1 subagent / work/piles

- John: "binders should also get the page flipping animation options. and why didn't you use regular binder sheets. the ones you did were weird. some of the options that were made are wrong or not what is real life." References looked at (Dropbox /Projects/Resources/fuda-cards/2026-11-02-binders/, five pictures, nothing copied): a nine-pocket clear sheet with holes down its left edge, black sheets, a green and a teal zip binder open on two facing pages, a red binder.
- Binder (`src/binder.ts`): a ring or zip binder open on two facing sheets of 4, 9 or 12 clear pockets with a sheen, one card in each pocket, clear or black sheet, nine punched holes by the rings, plain cover colours. A leaf has two sides: opening j shows side 2j-1 on the left (the inside of the cover at the start) and side 2j on the right. `page-size` and `columns` keep working (they set the pockets).
- Page turn: one leaf, a chain of four slices (the hole strip and one per column of pockets), each hinged on the previous, so each can lean a little more and the sheet bends; every slice has the front side's pocket column on its front and the matching column of the back side on its back. The leaf swings with WAAPI `rotateY` (0 to -180, or back), bends with eight degrees per slice at mid turn and straightens, then goes; while it swings the half it has not reached shows the page it is leaving. `animate="off"`, reduced motion, a wrap past the last opening and a jump of more than one opening change the page at once (a short fade in).
- Audit: see `docs/collection-displays.md` ("Real-life audit") and the CHANGELOG. Removed: Jukebox Carousel and Flip Tower (alias to the deck, `collectionViewAliases`); renamed Infinite Card Atlas to Card Table; the case got a frame, a glass lid and ledges.
- Tests: `binder.e2e.mjs` (3): nine pockets three by three, one card in each, sheen, holes by the spine, rings, green cover, two facing pages with holes against the rings, a part-full sheet; options in the address and a link, 44 px buttons, `page-size`/`columns`; the turn (a leaf with four slices swings 0 to -180 forwards and -180 to 0 backwards, bends at mid turn, carries 9 pockets on each side), nothing running afterwards, Animate on and off end in the same place for one Next, a quick double Next and Next then Previous, no leaf with reduced motion. `collection.test.mjs` (10 displays and the aliases). `pnpm check` 33 pass.
- Limits: headless Chromium only; the leaf's shading is only the pockets' sheen (no shadow cast on the page under it); a 12-pocket sheet on a phone has small cards (zoom in); the case is still a tilted grid with a frame and glass, not a model of risers.

## 2026-11-02 - A card is never see-through while it flips; things that are not cards do not turn (MODULES-145, MODULES-146), machine1 subagent / work/flip

- John (MODULES-145, HIGH): "When flipping the card over, parts of it are clear or see through, revealing cards or background behind." Measured first, with a pixel test (`test/e2e/seethrough.mjs`): the animations of a scene are paused at a dozen moments, and four pictures are taken of each, with a flat magenta backdrop: the scene (A), only the moving card drawn (B), the moving card with its faces painted opaque grey so its outline is known (M) and the empty backdrop (C). Inside M's outline (shrunk three pixels) a fault is A differing from B (something else shows through or sits in front) or B equal to C (the card lets the backdrop through).
- Found: on 0.8.0 a card taken off the deck started level with the pile it left (the flight kept the card's own place in depth, 0.9 px per card in the pile), so at the first moment 99.6 percent of it was hidden by the new top card and, as it turned and rose, it passed through the cards of both piles: 3D scenes are drawn by depth, so the flying card was cut in two by the cards it crossed, showing them through itself. The stack's flight had the same fault. Nothing was see-through in the card's own paint: the single card's flip has no fault at all (checked, 0 pixels).
- Fixed in `flight()` (src/pile.ts), shared by the deck and `<fuda-card stack>`: the card starts above the pile it leaves, stays above both until half way, is lifted while it turns by half its width times the sine of the turn (exactly what keeps its lowest corner above the cards it crosses) and ends level on the pile. The binder leaf's slices left a hairline seam (a page showing between two slices); they now overlap by 1.5 px, apart from the outer edges.
- Tests: `test/e2e/flip.e2e.mjs` (12 moves: deck off turned over, off facing up, off an open fan, off after a turn, put back; stack off turned over, facing up, off an open fan, after a turn, put back; the single card; the binder leaf). On 0.8.0, 10 of 12 fail (the face-up stack and the single card pass); on this work all 12 pass. Residual edge pixels (at most 0.35 percent of an outline) are anti-aliasing; the limit is 0.7 percent.
- Not changed: MODULES-142 (a thin diagonal line on the pile taken off a stack) could not be tied to this cause; the pile at rest was looked at and shows only the card's own sheen. The last card put back from the deck's pile does not fly (there is no pile left to fly from): that is how 0.8.0 behaved and is filed as MODULES-176.
- John (MODULES-146): Riley's consoles show the back of cards when flipped and are paper thin; "we might be best to not allow rotation and turning when it's not cards". Decision: an item that is not a card and not a real 3D object does not rotate or turn over. New data field `kind` (`card`, the default, or `object`) on a collection item; see docs/collection-input.md. The view's turn is offered only when the collection has a card; objects stay square to the reader in a mixed collection (they turn the other way by the view's turn); no back is drawn; they land facing up. Fan and take-off are kept for objects (a flat layout; a move). Test: `test/e2e/objects.e2e.mjs`, `test/collection.test.mjs`.
- Checks: `pnpm check` (34 tests) green; `node --test --test-concurrency=1 test/e2e/*.e2e.mjs`: 54 tests, 50 pass, 4 fail (the known MODULES-98 four: autoplay x3 and the story view's Fit). Headless Chromium in software only; no Safari or Firefox for the new tests; the card's own drop-shadow is not part of the check.

## 2026-11-02 - e2e fixes (MODULES-98), machine1 subagent / e2e-fix-2026-11-02

- Found on 0.8.0 with `pnpm test:e2e` (Playwright 1.59.1, Chromium 147): autoplay (3 tests) and the story view's Fit failed.
- Autoplay: the tests counted `getAnimations()` entries named `fuda-pan`; the pan is a CSS animation from the card's shadow styles (`::slotted(img)`) and Chromium 147 returns it with no `animationName`. The test now reads the name from the computed style and counts running animations. No product change.
- Story Fit: `.story .card` is `flex:0 0 90%` with `min-height:auto`, so before its picture loaded a card was 324 px tall and after it 413 px; Fit was measured before and nothing measured it again. `min-height:0` keeps the 90 percent. The zoom test also measured the last Fit while the glide back was still running; it now waits for the view's animations to end.
- Result: 39 of 39 browser tests pass, `pnpm check` passes. One run hit EADDRINUSE on 8112, a port another session was using (card-back test); it passes alone.
- Tried and dropped: refreshing Fit on every picture load (it moved the rolodex's cards in the piles Animate test) and a second Fit pass for perspective (the deck stopped closing back to the same place). Neither was needed once the story's height was stable.
- Limits: headless Chromium only; the machine was at load 60 to 70 during the runs.

## 2026-11-02 - kazoku-ui 0.10 (MODULES-170), Mac Studio / night

- Raised `@johnmorrisdotca/kazoku-ui` to ^0.10.0. Read its changelog from 0.3 to 0.10. What reached this repo: the `2×` button is gone (`data-b="two"`, corner-spin test now uses a double press and reads the readout), Tilt, Front and the arrow pad are under More (objects and zoom tests), the readout's name also holds the word Fit (corner-spin uses `exact`). `zoom.ts` needed no change; `controller.startZoom` is still there.
- New `test/e2e/view-bar.e2e.mjs`: the number is on the first screen and uncovered, equals the state through the buttons, a set and Fit, in the Studio, the collections and vintage, desk and phone; the card really is that many times its Fit width; out of sight and in a hidden tab an automatic turn makes 0 frame requests and 0 callbacks, on the Studio and on a collection (a hidden tab is simulated by overriding `visibilityState`).
- Test fixes that were not about kazoku-ui: `moving()` in the autoplay tests asks the shadow root too and leaves transitions out; piles and stack wait for rest instead of a fixed time; Playwright pinned at 1.64.0 because the 1.59.1 copy (Chromium 147) failed binder and wear.
- Decision: the Studio stays on the basic bar (the family's default); `controls="advanced"` was not set anywhere.
- Limits: headless Chromium in software; no real phone, Safari or Firefox.

## 2026-11-02 - Live 3D in cards (MODULES-55), Mac Studio / night

- New `src/live-3d.ts`, the focus policy over kazoku-ui 0.10's shared renderer (`/renderer`, `/testing`), `docs/live-3d.md`, `demo/live-3d.html`, `collection.live`. Nothing of the renderer was copied. The renderer's module is imported dynamically, so a page of pictures has none of it.
- A frozen card shows its last angle by giving the renderer an item whose `key` carries the angle (per 5 degrees): the renderer's own still is then made at that angle. It costs a render and, for a moment, the card shows its previous picture. Filed for kazoku-ui: a still taken from the live frame at `blur()`.
- `test/e2e/live-3d.e2e.mjs`: see the CHANGELOG for the numbers. A broken build is a module served with one line changed. The test that builds the site found `SkeletonUtils.js` missing from it. The canvas budget first proved nothing: a flex row kept the card at 1200 px and the broken build read the same 3.85 MP as the good one; the card is now `flex:none` and the broken build reads 33 MP.
- The runner's memory stop fired once, at 3.18 GB (sum of RSS of the process tree), when a server error left browsers open in a failing run. It stopped the file by process id as designed. The cause in `serve()` (a 200 written before the read) is fixed. Peak since: 1.75 GB.
- Limits: software GL only, so no real GPU frame time, memory or driver behaviour is measured. A hidden tab is simulated by overriding `visibilityState`. No real phone or Safari. MODULES-35 (controls on the live card, real integration of the packages' viewers) is not started.

## 2026-11-02 - No reveal on every page (MODULES-42), Mac Studio / night

- The element's fix and the Studio's landed earlier (see the entry of work/no-reveal); that test filmed the Studio only. Filmed everything else: `demo/collections.html`, `rolodex.html`, `tcgdex.html`, `live-3d.html`, the ten displays of `collections-component.html`, desk and phone, cache off, slow network, 4x CPU, every picture magenta and tall. One fault: the rolodex demo (49,623 magenta pixels outside the cards at 1,624 ms on a desk) drew its cards unplaced until its script ran. Placed by CSS now; nothing else needed a change.
- A frame's card boxes are read before and after its screenshot, so a card a script moves in between is not counted as a fault.
- Limits: headless Chromium in software; a throttled network through CDP, not a real one; WebKit does not run off CI. No real phone.

