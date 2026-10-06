# Sprint 054 Builder Evidence

## Status

**Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The user verified the implemented functionality and approved Sprint 054 closeout. The recorded Windows desktop RPC and VS Code host failures remain unpassed platform residuals; approval does not convert them into passing results.

## Implemented

- Added postfix 1-based list access with statically inferred element types, safe constant-only bounds checks (`AMX3009`), and explicit dynamic operation diagnostics (`AMX1008`).
- Added statement-form named-list `add` and `remove`, including 1-based insertion, `length + 1` append, interval removal, and the specified no-`at` behavior (validate a positive integer count, then remove exactly one final item).
- Prevalidate mutation arguments and bounds before writes; preserve local list identity and imported/nested alias immutability.
- Snapshot statement-form loop inputs and retain emitted view snapshots when the source list is later mutated.
- Integrated list syntax with shared editor analysis, completion/highlighting, VS Code grammar, formatter parsing, and language documentation.
- Added focused semantic and VS Code host regressions.

## Verification

| Check | Result |
|---|---|
| `bun run build` | Passed (`tsc`). |
| `bun test tests\listSemantics.test.ts` | Passed: 12 tests, 91 assertions. Covers reads, static/dynamic bounds, mutation positions and interval edges, no-`at` count behavior, failure atomicity, aliases/imports, pure-function restrictions, loop/view snapshots, source locations, formatter, and editor facts. |
| `bun test` | Passed: 345 tests across 28 files, 0 failures. |
| `git diff --check` | Passed. |
| `bun run --cwd desktop-app typecheck` | Passed. |
| `bun run --cwd desktop-app build:web` | Passed; Vite emitted a large-chunk warning. |
| `bun run --cwd desktop-app test` | Failed on Windows path separators in `desktop-app/tests/rpc-contract-check.ts:432`: actual `nested\\module.amx`, expected `nested/module.amx`. Other assertions preceding this check passed. |
| `bun run --cwd vscode-extension test` | Compile and test compilation passed; host suite: 15 passed, 5 failed. The new Sprint 054 list-diagnostics/formatting host test passed. Four existing host cases failed while cleaning temporary directories (`EBUSY`); one existing navigation case compared a lowercased drive letter with the original-case path. |

## Residuals and Disposition

- The Windows desktop RPC and VS Code host failures are recorded as unpassed residuals, not passes; they are path-case and host cleanup failures, not list-semantics failures. No unrelated platform assertions were changed.
- Sprint 052 remains ACCEPTED WITH RECORDED RESIDUALS; its Windows VS Code Development Host suite remains unpassed (14 pass, 5 fail). Sprint 053 remains ACCEPTED for closure with its Windows host rerun unpassed (13 pass, 6 fail). Neither result is reclassified by Sprint 054 verification.
- Implementation exposed no ambiguity in the approved Sprint 051 list contract; no semantic question remains open for this scope.
- This disposition closes Sprint 054 only; it does not imply completion of unrelated V0.9 work.
