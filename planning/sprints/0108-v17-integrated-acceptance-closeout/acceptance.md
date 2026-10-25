# Sprint 108 Acceptance Criteria

Sprint 108 is complete only when all in-scope V0.17 desktop requirements
have current traceable evidence, the S105 file-only amendment and folder
deferral are represented accurately, all residuals have owners/dispositions,
and a separate product-owner closeout decision is recorded. Sprint 108 adds
no product feature scope.

## Entry and Scope

- Sprints 104-107 have separate acceptance dispositions recorded. Resolve the
  pending S106 owner disposition before claiming integrated acceptance; if it
  remains pending, the S108 result remains open or explicitly blocked.
- S105 is evaluated only against its accepted amended file-only V0.17 scope.
  Folder duplicate/move/tree drag/trash/restore are recorded as deferred,
  not PASS, with target version uncommitted. The broader original explorer
  scope is not claimed as delivered.
- S107 Resizable technical gate is GO based on installed API, actual service
  A/B persistence, and actual App.vue integration; its separate Sprint 107
  acceptance is closed.

## Integrated Feature Evidence

- `integrated-evidence-matrix.md` has a raw status for every requirement and
  gate group: accepted component ownership, first-load active-AMX behavior,
  file-scoped explorer actions/counts/safeguards, palette keyboard/mouse
  behavior, resizer bounds/persistence/responsive layout, and bottom-only
  runtime behavior.
- Analysis/preview exactly-once assertions use request counts and identity,
  not only eventual HTML visibility. Pause/non-AMX/no-implicit-Run and stale/
  cancelled results are verified.
- Explorer count/search/menu and file operations are verified against the
  accepted amended scope, including actual service/RPC safeguards and native
  open/reveal revalidation. Deferred folder operations are not exercised as
  implemented behavior.
- Command palette selection, ends, disabled/no-result states, dynamic
  availability, Enter/Return/click parity, global shortcut collision,
  shortcut opening, and focus restoration are verified. Trash restore error
  keeps the retained item list visible alongside the alert.
- Resize tests verify actual service A/B persistence, all bounds, keyboard,
  focus modes, responsive stack, and no overflow. Runtime remains bottom-only
  and preserves all listed actions/content.

## Repository/Host Verification and Evidence

- Approved direct desktop typecheck, desktop package/RPC tests, isolated
  `build:web`, focused V0.17 Playwright tests, and the approved full desktop
  UI/repository gate have exact commands, environments, counts, and artifacts.
- Any command not run, unavailable host, wrapper stall, first failure/retry,
  and platform gap remains recorded accurately. Desktop Vite harness evidence
  is not native Electrobun evidence.
- All generated outputs and test artifacts stay within approved isolated
  paths; historical S102-S107 evidence/artifacts and shared `test-results`
  remain unchanged. `git diff --check` and final path inventory pass.
- Residuals include S103 diagram assertions/native skip, S104 Windows
  harness/reload path, S105 folder deferral, S106 pending disposition and
  untested Trash/macOS cases, S107 native/build gap, and any new S108 results.
- Raw statuses are separate from owner dispositions. Accepted residuals do
  not rewrite failed/unavailable raw evidence to PASS.

## Closeout and Boundaries

- Builder recommendation states whether V0.17 is ready for closeout within
  the approved amended scope and names all residual owners.
- A separate product-owner disposition records `ACCEPTED/CLOSED WITH
  RECORDED RESIDUALS` or `BLOCKED/OPEN`. If folder deferral or S106 status is
  not accepted in the closeout decision, do not claim full V0.17 closure.
- Sprint 108 authorizes no release, publication, package/version changes,
  installer distribution, platform certification, or V0.18 work.