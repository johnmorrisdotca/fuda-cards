# Concurrent agent coordination

This is a cooperative Git-based workflow for agents and people working on Fuda across cloud and Mac checkouts. It does not provide atomic locking: use GitHub's branch protections, pull requests and compare-and-swap updates where available, and explicitly reconcile concurrent changes.

## Start and claim

1. Read AGENTS.md, the product context, personas, roadmap, task board, and recent work log. Check the remote default-branch head and your local status. Preserve uncommitted work.
2. Pick an Available task; split broad tasks where useful. Note related tasks and overlapping files, especially shared files such as src/collection-element.ts, src/collection.ts, tests and the shared documentation.
3. Record owner, unique session or branch, date, intended scope and relevant shared files in the task board. Commit/push the claim and re-read it on the remote. If a competing claim appears, coordinate before editing. Never assume a claim is free because it appears old.
4. Use a separate task branch or worktree where possible, based on current main. Preserve your changes independently and push the task branch regularly so others can recover and inspect it. Never store secrets in the repo.

## During work

- Work only within the claimed task and record cross-task dependencies. Do not edit or mark complete someone else's active task.
- Push each meaningful, tested increment. Before each integration, fetch the latest main and inspect changes since your base, including board/log changes and shared files. Communicate progress, blockers, tests and branch/commit by updating the work log and board in the same increment when feasible. Direct agent-to-agent communication is useful when available, but never replace the durable repo record with a private message.
- If a shared board/log update conflicts, re-read the current remote and apply only your own entry or task row; preserve every other claim and entry. If two agents touch code in the same file, coordinate and perform a real three-way merge or rebase. Review the combined result; do not blindly choose one side or overwrite a newer full file.
- If the remote moves during integration, stop, fetch, re-evaluate conflicts and rerun appropriate checks. Use fast-forward or an expected-head lease for updates and do not force-push. A claim board entry is not a lock; conflicting claims must be resolved explicitly.

## Verify, integrate and check in

1. Run tests for the combined state, including pnpm test as baseline, plus relevant browser, mobile, accessibility and integration checks when available. Record what was and was not verified.
2. Integrate through a pull request or a safe merge commit where practical. Preserve both histories; resolve conflicts intentionally. If unresolved, push a recoverable branch and document the exact blocker instead of claiming the task is merged.
3. Update the roadmap only to reflect verified behavior. Append your changes, verification evidence, limitations, branch/commit/PR and next action to the work log. Update only your task row: Review for ready work awaiting validation, Available when releasing incomplete work, Blocked when retaining a blocked claim, Done only after the relevant verification. Push and verify the remote head.
4. Notify the user of the status and any blockers. If another agent is actively working on an overlapping task, use available agent messaging if authorized and update the shared board/log; do not assume they received a message solely because this file was updated.

## Current cautions

- A previous local root commit and the initial remote project commit share a tree but not ancestry. Do not force one history over the other.
- A preview, screenshot, or successful unit test does not prove live third-party images, touch interaction, full 3D or phone behavior.
- This workflow establishes instructions future agents should follow; it cannot guarantee that disconnected or already-running agents have read them.
