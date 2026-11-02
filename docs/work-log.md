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

## 2026-11-02 - Card shows its mirrored back in WebKit (MODULES-49), MacBook (machine2) subagent / fix/webkit-back

- Problem: in headless WebKit (Playwright 1.64.1, WebKit 2370) the Card Studio shows the mirrored back at 0 and 35 degrees, the correct back at 180 and nothing at 90 (also 0.2.0).
- Cause found: Playwright's WebKit screenshots do not draw 3D. A bare test page (a `translateZ(150px)` child of a `preserve-3d` parent turned 60 degrees) puts the child at x=332 by `getBoundingClientRect` (layout and hit-testing are right) but paints it at x=190, as if flat; and the plain flip card pattern (two faces, `backface-visibility:hidden`, back `rotateY(180deg)`) shows the back at 0 degrees. Flat painting plus no backface culling paints the last face (the back, already turned half a turn inside the card) over the front. Not caused by the host filter, `container-type`, the art opacity, `overflow`, `border-radius`, `mix-blend-mode`, the edges, `will-change` or `-webkit-backface-visibility` (each removed on its own: no change). I could not look at real Safari or an iPhone (no display for screen capture here): whether real WebKit also fails stays unproven.
- Fix in the element: three 2 px `.probe` markers at the card's top left, top right and bottom left; each frame while the card is on screen (IntersectionObserver) their screen rectangles give the sign of the face's area, and `.card.turned` hides the front (turned) or the back (not turned) with `visibility:hidden`. `backface-visibility` stays. The 3D order of faces, edges, thickness and the MODULES-42 fade are unchanged.
- Tests: `test/e2e/card-back.e2e.mjs` now runs in Chromium and WebKit; new checks at 0, 35, 80, 280, 350: front visible, back hidden, front hit, no pixel changes when the back is removed. It fails on 0.2.1 (both engines). The pixel checks of the edge at 90 degrees run only where a screenshot paints depth (Chromium); in WebKit the edge is checked by layout (width above 0).
- Limits: WebKit's edge at 90 degrees cannot be seen in a Playwright screenshot (flat painting); real Safari, an iPhone and Firefox were not run. Picture: before and after, Chromium and WebKit, desk and phone, at 0, 35, 90, 180 degrees.

