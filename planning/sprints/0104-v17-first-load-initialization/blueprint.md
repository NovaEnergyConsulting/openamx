# Sprint 104 Blueprint: V0.17 First-Load Initialization

## Approach

1. Obtain separate Sprint 104 implementation authorization and approval of
   the exact source, test, output, and evidence plan. Preserve the current
   worktree and generated outputs. Sprint 102 and 103 dispositions and the
   V0.16 closeout are recorded as complete; do not infer Sprint 105-107
   authorization from this.
2. Trace every assignment/transition of the active `document` in the current
   `App.vue`. Classify it as project open, recent restore, recovery restore,
   user selection/tab switch, reload, or an operation that activates a newly
   created/moved document. Record which paths already call `activate()` and
   which bypass it.
3. Define one shared initialization boundary around the selected
   `OpenDocument` and synchronized `WorkbenchState`. Avoid initializing
   before the corresponding current request identity is available. Make the
   boundary idempotent for duplicate notifications of the same activation;
   do not invoke it again merely because project listing or state sync
   completes.
4. Keep `App.vue` responsible for orchestration. For an active AMX document,
   run one static analysis/highlighting request and schedule one initial
   preview attempt using the existing pause/debounce/cancellation/freshness
   mechanisms. Maintain any valid cached preview and its stale/error state
   according to the current contract.
5. For a non-AMX document, skip AMX analysis and preview. Preserve existing
   CSV/JSON data validation and data-context setup. Do not turn initialization
   into an implicit runtime `Run Active Document` operation.
6. Extend the existing browser RPC harness with controlled project-restore
   and recovery scenarios and request logs for static analysis, preview
   starts/completions, runtime runs, document identity, and saved/recovered
   buffer contents. Keep all test controls in the harness.
7. Add focused Playwright cases in `initial-active-document.pw.ts` using the
   existing workflow harness. Assert counts and identities, not only visible
   completion. Include deterministic delayed/cancelled results to verify that
   old work cannot replace the current document's results.
8. Run the focused UI tests, the preview-freshness regression, and desktop
   typecheck. Run the RPC-contract test only if the implementation changes a
   shared RPC/service contract; such a change is not expected. Record the
   S103 typecheck wrapper and unrelated diagram test residuals accurately if
   they recur; do not expand scope to repair them.
9. Record exact commands, counts, outcomes, artifacts, failures, and residuals
   in `builder-evidence.md`; request a separate product-owner disposition.

## Candidate File Plan

Expected implementation paths, subject to separate authorization:

- `desktop-app/src/mainview/App.vue` — shared activation/initialization
  workflow and routing of existing active-document paths.
- `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` — test-only
  scenario setup, identity-aware analysis/preview/run counters, and controlled
  asynchronous results.
- `desktop-app/tests/ui/initial-active-document.pw.ts` — focused UI/RPC-harness
  acceptance cases.
- `desktop-app/tests/ui/preview-freshness.pw.ts` — update only if a focused
  shared activation/freshness regression belongs here rather than in the new
  test file.
- `planning/sprints/0104-v17-first-load-initialization/builder-evidence.md` —
  execution evidence.

No change to the shared RPC schema or trusted desktop service is expected.
If the implementation requires additional production/test paths, obtain
separate approval before editing them.

## Proposed Verification

From `desktop-app/`, subject to approved output isolation:

- `bun run typecheck` (if the Hutch wrapper does not complete, record that
  result and use the separately approved direct `bunx vue-tsc --noEmit`
  fallback without conflating the outcomes).
- `bun run test:ui -- tests/ui/initial-active-document.pw.ts --output=test-results/sprint104-first-load`.
- `bun run test:ui -- tests/ui/preview-freshness.pw.ts --output=test-results/sprint104-preview-freshness`.
- Relevant existing preview identity/navigation UI tests if the shared
  activation path touches their callback order.
- `bun run test` only if the shared RPC/service boundary changes; it is not
  otherwise a substitute for the scoped UI/RPC-harness cases.
- `git diff --check` and exact path inventory.

Keep Playwright output in new Sprint 104-specific directories. Do not clean or
reuse existing `desktop-app/test-results/` output.

## Notes

Sprint 104 does not resolve the separate Sprint 102 resizer technical gate,
folder operation disposition, or any later-sprint feature. No release,
publication, version change, or platform certification is authorized.