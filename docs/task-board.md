# Task board

Claim a task before beginning substantive work. A claim coordinates work through Git; it is not a lock enforced by GitHub. See `AGENTS.md` for the claim and release procedure. Record the agent or person, an identifier for the session or branch when available, and the date. An agent should not take an active claim unless its owner releases it or the user explicitly reassigns it.

Status values: **Available** (unclaimed), **In progress** (claimed), **Blocked** (claimed with a reason and next step), **Review** (implementation ready for review), **Done** (completed and verified). Record details, evidence and handoff notes in `docs/work-log.md`. If a claim may be stale, contact its owner or ask the user before reassigning; do not assume elapsed time ends a claim.

| ID | Task | Status | Owner / session | Notes |
| --- | --- | --- | --- | --- |
| F01 | Overlapping deck: navigation, swipe and inspection | Available | — | Swipe and keyboard improvements made; browser and phone verification needed. |
| F02 | Binder pages and configurable grids | Available | — | Grid columns and page controls improved; covers, page turns and browser verification remain. |
| F03 | Rolodex display | Available | — | Branch codex/f03-rolodex (9dd63ff) needs browser and touch checks and integration; local cloud browser could not reach demo. See work log. |
| F04 | Convention display case | Available | — | Initial CSS view; actual 3D model and options remain. |
| F05 | Jukebox carousel | Available | — | Needs distinct browse and focus behavior. |
| F06 | Random card draw | Review | Codex / work / 2026-10-31 | Name filtering and draw edge cases implemented; browser verification outstanding. |
| F07 | Story scroll, gallery wall, flip tower, spotlight carousel | Available | — | Make each a distinct polished view. |
| F08 | Infinite card atlas | Available | — | Pan/zoom prototype; browser testing and large-collection support. |
| F09 | Card frames, fronts/backs and realistic materials | Available | — | Research reference families and develop distinctive designs. |
| F10 | Image focus, pan and motion controls | Available | — | Prototype needs interaction and reduced-motion verification. |
| F11 | Hako and Uchusen interactive 3D in cards | Available | — | Integrate existing viewers; independently handle card controls. |
| F12 | Collection input, metadata and validation | Review | Codex cloud session, 2026-10-31 | Metadata merged; custom items, partial validation and browser verification remain. |
| F13 | Pokémon and sports API integrations | Available | — | Verify TCGdex live; research hockey coverage and image access. |
| F14 | Demo users, collections and persistence | Done | Codex / f14-f15 / 2026-10-31 | Profile saves and management verified in Chromium; five published Hako SVG URLs verified. |
| F15 | Framework integration and documentation | Done | Codex / f14-f15 / 2026-10-31 | HTML, React 19, Angular 19, Vue 3 and Svelte 4 integrations verified in Chromium. |
| F16 | Browser, mobile, keyboard and accessibility verification | Available | — | Establish repeatable testing for core flows. |
| F17 | Local/cloud Git workflow and runnable demos | Available | — | Preserve branch history; verify remote changes and both environments. |
| F18 | Whole-card rotation and corner spin | Done | Codex / codex/f18-card-rotation / 2026-10-31 | Center and corner spin, independent flip, pause, speed, direction and reduced motion verified in Chromium and mobile emulation. |
| F19 | Public demo site and GitHub Pages | Done | Codex / codex/f19-pages-demo / 2026-10-31 | Pages workflow succeeded; built site tested in Chromium. Public URL blocked by cloud network policy. |
| F20 | Publish npm package | Done | Codex / codex/f20-npm-release / 2026-10-31 | Version 0.1.0 manually published, installed and verified. Trusted publishing remains to configure for future releases. |
| F21 | Bug: bottom-corner 360° card spin | Review | MacBook (machine2) / fix/f21-rework / 2026-11-01 | Reworked: full-size card turning about the stage centre with kazoku-ui zoom, Fit, pan; the studio opens at full size (Fit one press away); e2e `pnpm test:e2e`. Headless Chromium only; needs a real phone check. See work log. |
| F22 | Zoom in/out and Fit in every display view | Review | MacBook (machine2) / feat/f22-zoom / 2026-11-01 | All eleven `<fuda-collection>` views, the standalone rolodex and the Pokémon binder demo have kazoku-ui zoom, Fit, Ctrl/Cmd+wheel, pinch and move (flat, no 3D turn). Released as 0.2.0 (not tagged or published). e2e `pnpm test:e2e`. Headless Chromium only; needs a real phone check. See work log. |
| F23 | Bug: turned card shows the front mirrored | Review | MacBook (machine2) / work/back-thickness / 2026-11-01 | Cause: the drop-shadow `filter` on `.card` flattened the 3D faces. Moved to the host; the card's own back now shows past 90°. e2e `pnpm test:e2e`. Headless Chromium only. See work log. |
| F24 | Card thickness: true-to-scale edge | Review | MacBook (machine2) / work/back-thickness / 2026-11-01 | `thickness` attribute in mm, default 0.3 (63 mm wide card). Thin planes between the faces; gold foil or card stock edge. Released as 0.1.1 (not tagged or published). Headless Chromium only. |

Add or split tasks as work becomes concrete. Keep IDs stable and preserve the work log when reorganizing.
