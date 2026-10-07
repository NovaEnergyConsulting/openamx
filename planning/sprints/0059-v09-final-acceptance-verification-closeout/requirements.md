# Sprint 059 Requirements: V0.9 Final Acceptance and Verification Closeout

## Goal

Complete the V0.9 acceptance evidence after Sprint 058 by resolving or explicitly dispositioning its remaining verification gaps, running the integrated acceptance set on available hosts, and submitting a final V0.9 evidence package for Lead Developer disposition. This is a verification/closeout sprint only; it adds no language or product features.

## Dependencies and Entry Gate

- Sprint 058 is **COMPLETE / APPROVED** by Lead Developer disposition dated 2026-10-07. Sprint 058's Builder evidence is the starting point; do not reopen its completed scope.
- Sprints 052-057 retain their separately recorded dispositions. The approved V0.9 language contract, Sprint 051 technical appendix, and V0.9 master sprint plan remain authoritative.
- Sprint 058 recorded two unpassed verification residuals: (1) no actual TextMate tokenization run was available; (2) `hutch electrobun prepare` stalled before wrapped desktop typecheck/build, although direct equivalent Vue typecheck, Vite build, worker build, and resource-copy steps passed.
- Historical Sprint 053, 054, and 057 Windows host/RPC failures remain in their original evidence and are not Sprint 059 implementation targets. Sprint 058's Linux-host results do not rerun or upgrade those Windows outcomes.
- Inspect the worktree and preserve user changes. No source behavior changes are authorized merely to make a verification command pass.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Phase 5 closeout gate
- `docs/language-spec-v0.9.md` and the approved Sprint 051 design appendix
- Sprint 052-058 Builder evidence, acceptance records, and Lead Developer dispositions
- Sprint 058 `builder-evidence.md`, especially its capability matrix, grammar-test boundary, Hutch-wrapper stall, and exact successful direct checks
- Existing VS Code grammar, provider host tests, desktop RPC/typecheck/build/UI checks, root tests, and representative V0.9 example

## In Scope

- Exercise `vscode-extension/amx.tmGrammar.json` with an actual TextMate tokenizer against valid, malformed/incomplete, escaped/interpolated, feature-rich, and executable/inert-fence examples. Assert relevant token scopes and ensure narrative/inert content is not classified as executable AMX.
- Prefer an already available compatible tokenizer. If a test-only tokenizer dependency is required, use the smallest established VS Code TextMate tooling, keep it out of production/runtime dependencies, and record lockfile/package changes and rationale.
- Reassess the desktop Hutch wrapper stall with a bounded, reproducible attempt. Verify whether `hutch electrobun prepare` now completes; do not leave an idle process running indefinitely.
- Run the wrapped desktop typecheck and `build:web` if preparation completes. If it does not, retain the wrapper result as unpassed and rerun the precise direct equivalents already validated in Sprint 058, recording why those checks do not make the wrapper itself a pass.
- Run final integrated available-host verification: root build and complete tests; VS Code compile/test/host suite; desktop RPC, typecheck/build or direct equivalents, focused Help UI; and representative V0.9 example execution/render/output checks.
- Reconcile all evidence against Sprint 058's acceptance matrix and approved V0.9 contract. Record any new behavior defect as a minimal reproduction; scope any implementation correction only with explicit Lead Developer direction.
- Update Builder evidence and planning status/questions, then request a separate Lead Developer final V0.9 acceptance disposition.

## Out of Scope

- New AMX syntax, runtime behavior, diagnostics, library units, data formats, renderer features, editor features, docs/help/example expansion, or unrelated cleanup.
- Rewriting approved V0.9 behavior or changing accepted Sprint 052-058 decisions.
- Repairing historical Windows RPC/Extension Development Host failures without explicit direction and a demonstrated product defect.
- Native Electrobun interaction, Windows/macOS certification, installer/release work, Marketplace/publication, or claiming platform coverage not actually run.
- Treating a passing direct command as proof that a failed wrapper command passed; treating an accepted residual as a pass; or treating Builder completion as final V0.9 acceptance.

## Constraints

- Keep every check outcome explicit: passed, failed, blocked/stalled, skipped/unavailable, or not run. Give exact command, host/environment, duration when material, and observed result.
- A tokenizer-backed grammar test must execute the actual grammar with TextMate-compatible tokenization; structural JSON inspection alone does not satisfy that criterion.
- Bound retries for the Hutch wrapper. Record timeout/stall evidence and stop the process cleanly if it again becomes idle; do not use unbounded waits.
- Direct Vue/Vite/worker/resource checks verify those steps only; they do not upgrade Hutch wrapper status.
- Preserve historical Windows results as separate residuals. A Linux rerun cannot recast Windows failures as passes.
- Only the Lead Developer may grant final V0.9 acceptance. Sprint 059's evidence submission and sprint closeout are not themselves that disposition.