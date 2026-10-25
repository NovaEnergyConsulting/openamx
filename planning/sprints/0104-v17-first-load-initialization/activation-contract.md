# Sprint 104 Active-Document Initialization Contract

## Status and Authority

This contract operationalizes the accepted Sprint 102 cases
`S102-ACT-01` through `S102-ACT-08` for implementation and tests. It does not
expand the approved V0.17 scope or authorize implementation by itself.

## Definition

For an activation identity, initialization is:

1. One static AMX buffer-analysis request for diagnostics and highlighting.
2. One initial preview operation, scheduled according to the existing live
   preview debounce/pause behavior.

Initialization is not the runtime `Run Active Document` operation. Count
requests by canonical active URI, project generation, document revision, and
input/settings revision. A preview job also carries its job identity.

## Activation Matrix

| Case ID | Trigger | Required behavior |
| --- | --- | --- |
| --- | --- | --- |
| `S104-ACT-01` | Open a project that has an active AMX document | Once the selected document and matching workbench identity are available, initialize that identity once. |
| `S104-ACT-02` | Project open/restore yields no active document | Do not fabricate an active document and do not issue analysis, preview, or runtime Run. |
| `S104-ACT-03` | Restore/reopen a recent project with an active AMX document | Initialize the restored active identity once after tab/document state and the restored project generation are synchronized. |
| `S104-ACT-04` | Restore recovery | Initialize the recovered active AMX buffer, including unsaved text, once. Do not write recovered source to disk as part of initialization. |
| `S104-ACT-05` | Select/open an AMX file or tab | Use the same initialization boundary as project-open activation. Switching to a different identity initializes the new identity; late results for the old identity are ignored. |
| `S104-ACT-06` | Preview is paused at activation | Perform static analysis but enqueue no preview. On explicit resume, schedule one current preview. |
| `S104-ACT-07` | Active document is CSV, JSON, CSS, settings, or output | Do not request AMX static analysis or preview. Preserve the existing applicable data-validation/context behavior. |
| `S104-ACT-08` | Switch documents while analysis/preview results are pending | Cancel, supersede, or ignore work for the old identity; it cannot update the current document's visible results. |
| `S104-ACT-09` | Initial preview fails or is cancelled | Preserve current error/cancel/stale and last-good behavior; do not automatically retry in a loop. |
| `S104-ACT-10` | An existing create/duplicate/move/reload flow makes an AMX document active | Apply the shared initialization boundary to the resulting active AMX identity without changing the operation's semantics. For a starter project, initialize after its final starter source is applied; do not initialize a transient placeholder and then duplicate work for the same opening workflow. |
| `S104-ACT-11` | Initial activation versus explicit runtime Run | Startup may start one `preview` operation, but never a `run` operation. `Run Active Document` runs only after an explicit user action. |

Re-entering the same project/listing/state synchronization without changing
the active identity must not initialize it a second time. An explicit user
refresh, edit, input/settings change, reload, or later activation is a new
cause and may legitimately request additional work under its existing
behavior.

## Pause and Scheduling

- If preview is not paused, enqueue exactly one initial preview attempt after
  activation. Keep the existing debounce rather than adding a parallel timer.
- If preview is paused, perform static analysis but enqueue no preview. Do
  not temporarily clear the pause flag. On explicit resume, schedule one
  current preview; cancel/ignore any superseded scheduled work.
- If a preview was already in flight when pause or a new activation occurs,
  use the existing cancellation/supersession path. Its completion must not
  publish a result for the newly active identity.
- A failed initial preview retains the existing last-good/stale/error
  semantics. Initialization does not spin/retry automatically.

## Identity and Freshness

Before starting or applying work, use the current document and workbench
identity:

- canonical active URI;
- project generation;
- document revision;
- input/settings revision;
- preview job ID for asynchronous job results.

Only results matching the current active identity may update static analysis,
preview HTML/token, preview diagnostics/state, or status attributable to that
request. A cancelled, superseded, stale, or late response cannot overwrite
current results. Preserve current request counters, job cancellation,
last-good preview cache, and error presentation unless a narrowly scoped fix
is required to meet this contract.

## Test Observability

The existing browser harness may add test-only counters/logs for:

- `analyzeBuffer` calls, including path/revision and whether a cursor offset
  was supplied (initial static analysis is identified by no cursor offset);
- `startJob` operation and full request identity, distinguishing `preview`
  from `run`;
- preview completion/cancellation and which identity was current at commit;
- recovery/restored active document and whether recovered text was written;
- current project/document identity and saved text for assertions.

No test instrumentation is added to production RPC payloads, persisted state,
or user-facing controls. Counts must exclude explicit refreshes, edits, and
completion requests unless a case is specifically testing them.