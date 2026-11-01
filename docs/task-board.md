# Task board

Claim a task before beginning substantive work. A claim coordinates work through Git; it is not a lock enforced by GitHub. See `AGENTS.md` for the claim and release procedure. Record the agent or person, an identifier for the session or branch when available, and the date. An agent should not take an active claim unless its owner releases it or the user explicitly reassigns it.

Status values: **Available** (unclaimed), **In progress** (claimed), **Blocked** (claimed with a reason and next step), **Review** (implementation ready for review), **Done** (completed and verified). Record details, evidence and handoff notes in `docs/work-log.md`. If a claim may be stale, contact its owner or ask the user before reassigning; do not assume elapsed time ends a claim.

| ID | Task | Status | Owner / session | Notes |
| --- | --- | --- | --- | --- |
| F01 | Overlapping deck: navigation, swipe and inspection | Available | — | Swipe and keyboard improvements made; browser and phone verification needed. |
| F02 | Binder pages and configurable grids | Available | — | Grid columns and page controls improved; covers, page turns and browser verification remain. |
| F03 | Rolodex display | Available | — | Initial stack view needs a distinct rotating file. |
| F04 | Convention display case | Available | — | Initial CSS view; actual 3D model and options remain. |
| F05 | Jukebox carousel | Available | — | Needs distinct browse and focus behavior. |
| F06 | Random card draw | Review | Codex / work / 2026-10-31 | Name filtering and draw edge cases implemented; browser verification outstanding. |
| F07 | Story scroll, gallery wall, flip tower, spotlight carousel | Available | — | Make each a distinct polished view. |
| F08 | Infinite card atlas | Available | — | Pan/zoom prototype; browser testing and large-collection support. |
| F09 | Card frames, fronts/backs and realistic materials | Available | — | Research reference families and develop distinctive designs. |
| F10 | Image focus, pan and motion controls | Available | — | Prototype needs interaction and reduced-motion verification. |
| F11 | Hako and Uchusen interactive 3D in cards | Available | — | Integrate existing viewers; independently handle card controls. |
| F12 | Collection input, metadata and validation | In progress | Codex cloud session, 2026-10-31 | JSON support is partial; support complete cards and custom items. |
| F13 | Pokémon and sports API integrations | Available | — | Verify TCGdex live; research hockey coverage and image access. |
| F14 | Demo users, collections and persistence | In progress | Codex cloud session, 2026-10-31 | Three users exist; verify Hako assets and add collection management. |
| F15 | Framework integration and documentation | Available | — | Validate plain HTML, React, Angular, Vue and Svelte. |
| F16 | Browser, mobile, keyboard and accessibility verification | Available | — | Establish repeatable testing for core flows. |
| F17 | Local/cloud Git workflow and runnable demos | Available | — | Preserve branch history; verify remote changes and both environments. |

Add or split tasks as work becomes concrete. Keep IDs stable and preserve the work log when reorganizing.
