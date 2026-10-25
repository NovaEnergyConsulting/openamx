# Sprint 104 Acceptance Criteria

Sprint 104 is complete when all eligible active-AMX entry paths consistently
initialize analysis/highlighting and initial preview once, preserve the
accepted pause/non-AMX/identity rules, and have focused regression evidence.

## Activation Behavior

- Project open with an active AMX document, recent-project restore, recovery
  restore, and ordinary file/tab activation use one shared initialization
  boundary or a demonstrably equivalent shared step.
- Every active identity gets one initial static analysis/highlighting request
  and, when preview is not paused, one initial preview attempt. Repeated
  listing/workbench synchronization does not duplicate initialization.
- Recovery uses the recovered in-memory AMX text and does not write it to
  project files.
- Pause suppresses preview but not static analysis. Resuming schedules one
  current preview without duplicating work.
- Non-AMX documents never receive AMX analysis or preview. Existing mapped
  data validation and context behavior remain intact.
- Initialization never invokes runtime `Run Active Document` implicitly.
- Active document identity, project generation, revision, settings revision,
  cancellation, supersession, stale-result rejection, last-good preview, and
  error behavior remain correct.
- Existing flows that make a new AMX document active (create/duplicate/move)
  are covered if they bypass the common initializer; their operation
  semantics are otherwise unchanged.

## Verification

- `activation-test-matrix.md` cases `S104-ACT-01` through `S104-ACT-11` are
  covered by focused UI/RPC-harness tests or have an exact documented reason
  for not being applicable to the existing workflow.
- Tests assert RPC request counts and identity, not only eventual visual
  preview success. Delayed/cancelled responses cannot replace current results.
- The preview-freshness regression passes. Desktop typecheck passes, or any
  wrapper/fallback distinction is recorded accurately. Relevant failures are
  preserved with exact commands and output; unrelated accepted S103 residuals
  are not silently fixed.
- Playwright outputs are isolated in Sprint 104-specific directories.
  `git diff --check` and exact path inventory pass.
- Any RPC/service contract change receives separate approval and focused RPC
  verification; no new public RPC is expected.

## Boundaries and Disposition

- No project explorer, command-palette, resizer, or runtime docking features
  are implemented in Sprint 104.
- No AMX language behavior, CLI/VS Code behavior, dependency/package version,
  release artifact, or platform certification is changed.
- `builder-evidence.md` records exact execution evidence and recommendation.
  A separate product-owner disposition is required to close Sprint 104; no
  Sprint 105-108 or release authority is inferred.