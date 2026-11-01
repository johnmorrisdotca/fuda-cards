# Agent workflow

Read `docs/feature-roadmap.md` and `docs/work-log.md` before beginning work. Check Git status and the current GitHub branch before editing; preserve other people's changes and do not force-push.

For each meaningful increment:

1. Implement a cohesive, reviewable change and run the checks appropriate to it. The baseline project check is `pnpm test`; verify interaction changes in a browser when available.
2. Update `docs/feature-roadmap.md` to reflect actual status. Distinguish partial implementations from completed, verified features.
3. Append to `docs/work-log.md` what changed, checks and results, unresolved limitations, and anything the next agent needs to continue. Do not claim browser, device, API, or image verification that was not performed.
4. Commit and push the increment to the shared GitHub repository as the user requested. Check the remote head and reconcile safely if it has advanced; never overwrite others' work. If pushing or verification is unavailable, clearly report the blocker and leave the work recoverable.

This project contains reusable cards and collection displays; maintain support for consumer-provided content and multiple frameworks. Keep the separate Mac checkout and cloud environment in mind: a synced conversation does not imply a shared working tree.
