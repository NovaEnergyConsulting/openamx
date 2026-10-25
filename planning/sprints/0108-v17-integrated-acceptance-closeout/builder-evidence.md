# Sprint 108 Builder Evidence: V0.17 Integrated Acceptance and Closeout

## Status

Architect-prepared evidence template. Sprint 108 execution has not started
under this preparation.

**Builder recommendation:** PENDING authorized execution.
**Separate V0.17 product-owner disposition:** PENDING.

## Preconditions and Baseline

- Sprint 102 UX contract is ACCEPTED/CLOSED. Sprint 107 closed its resizer
  implementation gap with a technical GO for installed Reka UI 2.10.5 and
  local wrappers; the historical S102 technical-gate document remains
  unchanged.
- Sprint 103 is ACCEPTED/CLOSED with recorded verification residuals: Hutch
  desktop typecheck did not complete; direct `vue-tsc` passed; the combined
  test command had two diagram time-text assertion failures and one native
  WebView skip.
- Sprint 104 is ACCEPTED/CLOSED with recorded wrapper/harness/reload residuals.
- Sprint 105 is ACCEPTED/CLOSED only against the amended file-only V0.17
  scope. Folder duplicate/move/tree drag/trash/restore are deferred from
  V0.17; no future target version is committed.
- Sprint 106 implementation/focused verification completed, but its current
  builder evidence records separate product-owner acceptance as PENDING.
  S106-TRASH-04 and macOS Cmd+Shift+P were not exercised.
- Sprint 107 is ACCEPTED/CLOSED. Installed Reka API, real service A/B
  persistence, bounds, keyboard/focus, responsive workbench, and bottom-only
  runtime checks passed. No standalone production build or native Electrobun
  host test was run.
- No release, publication, package/version change, certification, or Sprint
  108 execution authorization has yet been recorded in this template.

## Approved Execution Plan

Pending separate authorization. Before tests/builds, record the exact source
snapshot, validation worktree, OS/tool versions, approved commands, test
files, build outputs, Playwright output roots, generated-source preservation
hashes, and evidence paths.

## Verification Log

| Check | Result |
| --- | --- |
| Starting worktree/path inventory and output hashes | NOT RUN. |
| Sprint 102-107 acceptance/disposition reconciliation | NOT RUN. |
| Focused activation/explorer/command/resizer/runtime UI suite | NOT RUN. |
| Desktop package/RPC tests | NOT RUN. |
| Desktop direct typecheck | NOT RUN. |
| Isolated desktop web build | NOT RUN. |
| Full applicable desktop UI/repository gate | NOT RUN. |
| Native Electrobun/package/other-OS route | NOT RUN. |
| Final `git diff --check` and preservation/path inventory | NOT RUN. |

## Residual Register

Use `integrated-evidence-matrix.md` as the authoritative row-level register.
Carry forward all S103-S107 residuals and record raw result, owner, and
separate disposition for each. Do not infer that an accepted earlier sprint
means every host or platform route passed.

## Scope and Disposition

- Sprint 108 is integrated verification/closeout only. Any source or test
  defect requires separate corrective authorization and an exact path plan.
- The S105 folder-operation deferral remains explicit and is not implemented
  or marked PASS by S108.
- S106's pending product-owner disposition must be resolved before claiming
  integrated V0.17 acceptance.
- No release, publication, package/version change, installer distribution,
  platform certification, or V0.18 execution is authorized.