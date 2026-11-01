# Agent workflow

Read `docs/coordination.md`, `docs/product-context.md`, `docs/demo-personas.md`, `docs/feature-roadmap.md`, `docs/task-board.md`, and `docs/work-log.md` before beginning work. Check Git status and the current GitHub branch before editing; preserve other people's changes and do not force-push.

For each meaningful increment:

1. Implement a cohesive, reviewable change and run the checks appropriate to it. The baseline project check is `pnpm test`; verify interaction changes in a browser when available.
2. Update `docs/feature-roadmap.md` to reflect actual status. Distinguish partial implementations from completed, verified features.
3. Append to `docs/work-log.md` what changed, checks and results, unresolved limitations, and anything the next agent needs to continue. Do not claim browser, device, API, or image verification that was not performed.
4. Commit and push the increment to the shared GitHub repository as the user requested. Check the remote head and reconcile safely if it has advanced; never overwrite others' work. If pushing or verification is unavailable, clearly report the blocker and leave the work recoverable.

This project contains reusable cards and collection displays; maintain support for consumer-provided content and multiple frameworks. Keep the separate Mac checkout and cloud environment in mind: a synced conversation does not imply a shared working tree.

## Task check-out and check-in

Use `docs/task-board.md` as the shared task board. Before starting substantive work, fetch and inspect the latest board and Git status. Choose an Available task or add a suitably scoped one, mark it In progress with your agent/person name, session or branch identifier if available, and date, then commit and push that claim. Verify the claim on the remote before starting implementation. If the remote changes or claims conflict, reconcile without overwriting and choose an unclaimed task. The board is cooperative rather than an atomic lock; coordinate concurrent claims explicitly.

When pausing or handing off, append your progress, tests, limitations, and next step to `docs/work-log.md`. Update the task's status and owner: use Available and clear the owner if releasing unfinished work, Blocked with a reason if retaining it, Review when ready for review, or Done only when the relevant work has been verified. Commit and push the check-in. Never silently take an In progress or Blocked task; ask its owner or the user to reassign an abandoned claim. If you cannot push the claim, report the blocker and avoid starting work that could overlap with another agent.
