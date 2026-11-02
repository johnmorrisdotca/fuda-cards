# Agents: start here

<!--
Template: kazoku-ui templates/AGENTS.md. Copy it to AGENTS.md at the repo root and fill in the Facts table below the marker.
Everything above the marker is the same in every package repo: change it here, then copy it over, never by hand in one repo.
Everything below the marker belongs to the repo. Public repo: no private hosts, addresses, home paths, logins or keys.
-->

This repo is one of the family of John Morris's npm packages. The rules every package repo shares are below; what differs is in the **Facts** table under the marker.

## Read first

1. spx-stats `docs/package-work.md` (https://github.com/spxis/spx-stats/blob/main/docs/package-work.md), and the section "Who may change what" in spx-stats `AGENTS.md`. They hold the boards, filing, checks, release, hand-off and reporting rules. If your session has an spx-stats checkout, `git pull` it first.
2. This repo's `CONTRIBUTING.md` and README, for the rules and commands of the code itself.
3. The Facts table below: your board, ports, checks, release path and hand-off project.

## Work

- **Board.** Every ticket for this repo is on the board named in Facts, titled `<title prefix>: ...` with `--area <title prefix>`. From the spx-stats checkout's `web/` directory: `pnpm task --board <board> list`, then `claim <id> "<who>"` with the whole id before you start. Read the ticket's full detail first. Anything you find outside your ticket becomes a new ticket; say so in your report. Never run `done`: the coordinating session closes tickets.
- **A gap in a shared part** (the view controls, theme switch, language picker, address state, save-as-image) is a `kazoku-ui:` ticket on the `kazoku-ui` board, not a copy or a workaround here.
- **One agent per repo**, in a new git worktree from `origin/main`. Never work in the main checkout or in another agent's worktree.
- **Ports.** Only the block in Facts. Check `lsof -iTCP:<port> -sTCP:LISTEN` first, stop only your own process by its PID, never `pkill`.
- **Commits.** As John Morris <john@johnmorris.ca>, Conventional Commits, subject 50 characters or less, no AI attribution, files added by name (never `git add -A`). Push fast-forward to `main` after `git fetch` and a rebase.
- **Never.** GitHub issues, pull requests, discussions or comments; a token, key or private address in any file, commit or ticket; John's SPX, SPXN or SPXIS marks in an MIT package; anything that bills; a new package name, first publish, major version, deprecation or licence change without John's yes.
- **Japanese.** Whatever you write for John, give the English beside it. A docs page is in one language.

## Checks, release, hand-off

- **Before every push** run the checks in Facts. Green locally, then green in CI after the push (`gh run watch`).
- **Release.** Make a release commit (bump `package.json`, move the CHANGELOG's Unreleased block under the version), push it, wait for CI. **Do not tag and do not publish.** John runs the Release workflow (Actions → Release → Run workflow, from `main`). It checks the tag against `package.json`, runs the repo's check script, skips a version already on npm, tags `v<version>`, and publishes by trusted publishing. The repo's `release.yml` should call kazoku-ui's `reusable-release.yml` (kazoku-ui `docs/release-workflow.md`); the trusted-publisher entry on npmjs.com names `release.yml`.
- **Hand-off** for every finished ticket: write `<ticket-id>.json` and run `SPX_HANDOFF_PROJECT=<hand-off project> python3 -I scripts/handoff/handoff.py check|write <file>` from the spx-stats checkout (the variable on the same command line; the id is the ticket's whole id). Read the replies at the start and before you finish. Then release your hold: `pnpm task --board <board> release <id> --by "<who>"`.
- **Report** in under 12 lines, first line `<your name>, ticket <id> (<title>)` (`subagent of <name>` for a subagent): what changed, shas, CI, anything John must decide, new tickets, and last `HAND-OFF WRITTEN: <path>`. If you stop for any reason, say so at once.

<!-- repo-specific: everything below this line belongs to this repo. A template update never touches it. -->

## Facts

| | |
|---|---|
| Package | `@johnmorrisdotca/fuda-cards` |
| Repo | `johnmorrisdotca/fuda-cards` |
| Board | `modules` (tickets are `fuda-cards: F<n> ...`; `docs/task-board.md` keeps only the Done rows) |
| Title prefix and `--area` | `fuda-cards` |
| Ports | 8000 `pnpm dev`; the browser tests use 8073 and 8075 (no block of its own in John's port table; a scratch server takes 7720-7729) |
| Checks before a push | `pnpm check` (typecheck, build, tests), `pnpm test:e2e` (Playwright; set `PLAYWRIGHT_FROM` to a package.json that can resolve `playwright`) |
| Release | `release.yml` calls kazoku-ui `reusable-release.yml`; trusted publisher entry: `release.yml` |
| Hand-off project | `fuda-cards` |

## This repo

Reusable cards and collection displays for caller-provided content and several frameworks. Keep the separate Mac checkout and cloud environment in mind: a synced conversation does not imply a shared working tree.

Read `docs/coordination.md`, `docs/product-context.md`, `docs/demo-personas.md`, `docs/feature-roadmap.md`, `docs/task-board.md`, and `docs/work-log.md` before beginning work. Check Git status and the current GitHub branch before editing; preserve other people's changes and do not force-push.

For each meaningful increment:

1. Implement a cohesive, reviewable change and run the checks appropriate to it. The baseline project check is `pnpm test`; verify interaction changes in a browser when available.
2. Update `docs/feature-roadmap.md` to reflect actual status. Distinguish partial implementations from completed, verified features.
3. Append to `docs/work-log.md` what changed, checks and results, unresolved limitations, and anything the next agent needs to continue. Do not claim browser, device, API, or image verification that was not performed.
4. Commit and push the increment to the shared GitHub repository as the user requested. Check the remote head and reconcile safely if it has advanced; never overwrite others' work. If pushing or verification is unavailable, clearly report the blocker and leave the work recoverable.

### Work log and task check-out

Tasks are on the shared Sumilabu board `modules`, titled `fuda-cards: F<n> ...` (see spx-stats docs/package-work.md, "Boards, filing and reporting"). `docs/task-board.md` keeps only the Done rows as history. Before starting substantive work, fetch and inspect the latest Git status, claim the ticket on the board (`pnpm task claim <id> "<who>"` in spx-stats/web, board `modules`), and record evidence in `docs/work-log.md`. Do not add rows to the file.

When pausing or handing off, append your progress, tests, limitations, and next step to `docs/work-log.md`. Update the task's status and owner: use Available and clear the owner if releasing unfinished work, Blocked with a reason if retaining it, Review when ready for review, or Done only when the relevant work has been verified. Commit and push the check-in. Never silently take an In progress or Blocked task; ask its owner or the user to reassign an abandoned claim. If you cannot push the claim, report the blocker and avoid starting work that could overlap with another agent.
