# Task board

Open tasks now live on the shared Sumilabu board `modules` (project key), titled `fuda-cards: F<n> ...`. Run `cd ~/Projects/spx-stats/web && pnpm task status` for the summary, and see spx-stats docs/package-work.md "Boards, filing and reporting" for the commands. This file keeps the Done rows as history; do not add new rows here.

Claim a task before beginning substantive work. A claim coordinates work through Git; it is not a lock enforced by GitHub. See `AGENTS.md` for the claim and release procedure. Record the agent or person, an identifier for the session or branch when available, and the date. An agent should not take an active claim unless its owner releases it or the user explicitly reassigns it.

Status values: **Available** (unclaimed), **In progress** (claimed), **Blocked** (claimed with a reason and next step), **Review** (implementation ready for review), **Done** (completed and verified). Record details, evidence and handoff notes in `docs/work-log.md`. If a claim may be stale, contact its owner or ask the user before reassigning; do not assume elapsed time ends a claim.

| ID | Task | Status | Owner / session | Notes |
| --- | --- | --- | --- | --- |
|  F01 | Overlapping deck: navigation, swipe and inspection | Moved | — | Moved to the Sumilabu board `modules` as MODULES-25 on 2026-11-02. |
|  F02 | Binder pages and configurable grids | Moved | — | Moved to the Sumilabu board `modules` as MODULES-26 on 2026-11-02. |
|  F03 | Rolodex display | Moved | — | Moved to the Sumilabu board `modules` as MODULES-27 on 2026-11-02. |
|  F04 | Convention display case | Moved | — | Moved to the Sumilabu board `modules` as MODULES-28 on 2026-11-02. |
|  F05 | Jukebox carousel | Moved | — | Moved to the Sumilabu board `modules` as MODULES-29 on 2026-11-02. |
|  F06 | Random card draw | Moved | — | Moved to the Sumilabu board `modules` as MODULES-30 on 2026-11-02. |
|  F07 | Story scroll, gallery wall, flip tower, spotlight carousel | Moved | — | Moved to the Sumilabu board `modules` as MODULES-31 on 2026-11-02. |
|  F08 | Infinite card atlas | Moved | — | Moved to the Sumilabu board `modules` as MODULES-32 on 2026-11-02. |
|  F09 | Card frames, fronts/backs and realistic materials | Moved | — | Moved to the Sumilabu board `modules` as MODULES-33 on 2026-11-02. |
|  F10 | Image focus, pan and motion controls | Moved | — | Moved to the Sumilabu board `modules` as MODULES-34 on 2026-11-02. |
|  F11 | Hako and Uchusen interactive 3D in cards | Moved | — | Moved to the Sumilabu board `modules` as MODULES-35 on 2026-11-02. |
|  F12 | Collection input, metadata and validation | Moved | — | Moved to the Sumilabu board `modules` as MODULES-36 on 2026-11-02. |
|  F13 | Pokémon and sports API integrations | Moved | — | Moved to the Sumilabu board `modules` as MODULES-37 on 2026-11-02. |
| F14 | Demo users, collections and persistence | Done | Codex / f14-f15 / 2026-10-31 | Profile saves and management verified in Chromium; five published Hako SVG URLs verified. |
| F15 | Framework integration and documentation | Done | Codex / f14-f15 / 2026-10-31 | HTML, React 19, Angular 19, Vue 3 and Svelte 4 integrations verified in Chromium. |
|  F16 | Browser, mobile, keyboard and accessibility verification | Moved | — | Moved to the Sumilabu board `modules` as MODULES-38 on 2026-11-02. |
|  F17 | Local/cloud Git workflow and runnable demos | Moved | — | Moved to the Sumilabu board `modules` as MODULES-39 on 2026-11-02. |
| F18 | Whole-card rotation and corner spin | Done | Codex / codex/f18-card-rotation / 2026-10-31 | Center and corner spin, independent flip, pause, speed, direction and reduced motion verified in Chromium and mobile emulation. |
| F19 | Public demo site and GitHub Pages | Done | Codex / codex/f19-pages-demo / 2026-10-31 | Pages workflow succeeded; built site tested in Chromium. Public URL blocked by cloud network policy. |
| F20 | Publish npm package | Done | Codex / codex/f20-npm-release / 2026-10-31 | Version 0.1.0 manually published, installed and verified. Trusted publishing remains to configure for future releases. |
|  F21 | Bug: bottom-corner 360° card spin | Moved | — | Moved to the Sumilabu board `modules` as MODULES-40 on 2026-11-02. |
|  F22 | Zoom in/out and Fit in every display view | Moved | — | Moved to the Sumilabu board `modules` as MODULES-41 on 2026-11-02. |
| F23 | Bug: turned card shows the front mirrored | Done | MacBook (machine2) / work/back-thickness / 2026-11-01 | Cause: the drop-shadow `filter` on `.card` flattened the 3D faces. Moved to the host; the card's own back now shows past 90°. e2e `pnpm test:e2e`. Headless Chromium only. See work log. Published in 0.1.1 (npm) on 2026-11-02. |
| F24 | Card thickness: true-to-scale edge | Done | MacBook (machine2) / work/back-thickness / 2026-11-01 | `thickness` attribute in mm, default 0.3 (63 mm wide card). Thin planes between the faces; gold foil or card stock edge. Published in 0.1.1 (npm) on 2026-11-02. Headless Chromium only. |

Add or split tasks as work becomes concrete. Keep IDs stable and preserve the work log when reorganizing.
