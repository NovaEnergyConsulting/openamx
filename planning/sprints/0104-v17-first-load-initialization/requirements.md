# Sprint 104 Requirements: V0.17 First-Load Initialization

## Document Status

Architect-prepared Sprint 104 planning package. It defines the implementation
and verification scope; it does not authorize edits. Obtain separate Sprint
104 execution authorization and an exact file/output plan before changing
source or tests.

Sprint 102 is recorded ACCEPTED/CLOSED, Sprint 103 is recorded
ACCEPTED/CLOSED with verification residuals, and V0.16 Sprints 100-101 are
recorded closed in Sprint 103's evidence. Sprint 102's Resizable technical
gate remains OPEN but does not block Sprint 104.

## Goal

Use one consistent active-document initialization workflow so an eligible
active AMX document receives static analysis/highlighting and an initial live
preview after project open, recent-project reopen/restore, recovery restore,
and user-driven document activation. Initialize once per active document
identity, respect preview pause, skip AMX preview for non-AMX documents, and
preserve current cancellation, identity, stale-result, and preview freshness
protections.

Sprint 104 is a focused desktop behavior change. It adds no AMX language
semantics and no new desktop RPC/service capability is expected.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md).
- Accepted active-document contract:
  [`desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md),
  especially `S102-ACT-01` through `S102-ACT-08`.
- Sprint 102 disposition and remaining resizer status:
  [`builder-evidence.md`](../0102-v17-desktop-ux-contract-technical-gate/builder-evidence.md).
- Sprint 103 accepted component boundary and residuals:
  [`builder-evidence.md`](../0103-v17-workbench-shell-component-refactor/builder-evidence.md).
- Current active-document workflow: `desktop-app/src/mainview/App.vue`.
- Existing preview-freshness precedent:
  `desktop-app/tests/ui/preview-freshness.pw.ts`.
- Existing browser RPC harness:
  `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` and
  `desktop-app/spikes/sprint042-workflow-harness/src/main.ts`.
- Sprint 104 artifacts: `blueprint.md`, `activation-contract.md`,
  `activation-test-matrix.md`, `acceptance.md`, `builder-evidence.md`, and
  `handoff-prompt.md`.

## In Scope

- Route active-document transitions through a shared initialization step,
  reusing the existing `activate()` behavior where practical.
- Cover project open with a saved active document; recent-project restore;
  recovery restore with the recovered active buffer; normal file/tab
  selection; reload; and other existing operations that make an AMX document
  active (such as create, duplicate, or move) where those flows currently
  bypass shared initialization.
- Issue one static analysis request for highlighting/diagnostics and one
  initial preview attempt for each eligible active AMX identity. Avoid
  duplicate work from nested project load/sync/restore calls.
- Respect the current preview-paused state: continue static analysis while
  paused; enqueue no initial preview until resumed; schedule one current
  preview on resume.
- Never request AMX static analysis or preview for a non-AMX active document.
  Preserve existing CSV/JSON mapped-data validation and context behavior.
- Preserve active-document identity, project generation, document revision,
  input/settings revision, job identity, cancellation, supersession, stale
  result rejection, last-good preview, and existing error presentation.
- Add focused UI/RPC-harness regression cases that count and identify
  analysis/preview requests and exercise open, restore, recovery, switching,
  pause, non-AMX, and stale/cancelled paths.

## Out of Scope

- Project explorer operations, menu/context-menu/drag/drop behavior, and
  project counts (Sprint 105).
- Command-palette keyboard selection/execution (Sprint 106).
- Replacing resize dividers or choosing/implementing the Resizable component;
  Sprint 102's technical gate remains open for Sprint 107.
- Removing runtime docking or changing runtime content (Sprint 107).
- Broad App.vue refactoring, new preview features, new runtime `Run` behavior,
  AMX language/CLI/VS Code changes, or unrelated UI/RPC/service changes.
- New public RPC methods or service behavior unless implementation proves
  existing RPC results cannot support the approved behavior; any such
  contract expansion requires a separate scope amendment.
- Release, publication, version/package changes, platform certification, or
  updates to planning status/decision ledgers.

## Constraints and Gates

- `App.vue` remains the shell and owner of project/RPC orchestration after
  Sprint 103. The extracted `RuntimePanel.vue` is not an activation owner.
- Use the active document's canonical identity and current workbench state;
  never publish a result for a superseded project/document/revision/settings
  identity.
- Initialization means static analysis/highlighting plus a preview operation.
  It does not mean the explicit runtime `Run Active Document` action or a
  `run` job.
- Exactly once is measured per active AMX identity and activation transition.
  Explicit user refreshes, edits, settings changes, or later reactivations
  may legitimately request additional work and must be tested separately.
- Do not clear or override the user's current pause state as a shortcut to
  make the initial preview run. No preview is issued while pause is active.
- Preserve existing preview freshness behavior and S103-accepted UI
  boundaries. Do not fix unrelated diagram formatting or test residuals.
- Test-only harness scenario controls/counters must not leak into product
  code, public RPC types, persisted project/session data, or user-facing UI.