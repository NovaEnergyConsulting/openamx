# Sprint 039 Builder Evidence

## Disposition

**HISTORICAL DISPOSITION: BLOCKED BEFORE IMPLEMENTATION (2026-10-02); dependency cleared by the final acceptance addendum below.** At this checkpoint the Sprint 038 evidence was interim and no final acceptance had been recorded. This was a dependency record, not Sprint 039 feature completion or acceptance.

The Gate Evidence, Baseline Verification, and Required Unblock sections below preserve the state of the earlier blocked checkpoint; the final dependency status is recorded in the addendum at the end.

Per the Sprint 039 blueprint's entry step, implementation and acceptance were blocked at that checkpoint. No product code, RPC contracts, UI, tests, or dependencies were changed for Sprint 039. This preserves the rule against silently changing precedence, privacy, config/frontmatter preservation, logo security, or authority.

## Gate Evidence

- Sprint 038 acceptance remains open across enumeration/external-input handling, lifecycle operations, transactional rename/move, trash/recovery, external autosave/conflict UI, guarded transitions, and authority/native evidence.
- Sprint 038 builder evidence states: "Sprint 039 must not rely on the current autosave configuration as persisted preferences or assume recovery/external lifecycle support. Input/report settings work remains blocked on the remaining structured config conflict/recovery behavior required by Sprint 038."
- Sprint 039 requirements place conflict-safe local/project config writes, settings scopes, preservation, logo validation, and revision invalidation in the required scope; they are not an independently accepted slice.
- Current trusted code resolves mappings by reading `.openamx/project.json` and `.openamx/local.json`. The existing `setInputSettings` RPC updates only in-memory run settings. The RPC contract has no config-write or report-settings mutation operation. Existing tests therefore cannot establish conflict-safe config merge, promotion, frontmatter preservation, or logo-selection acceptance.
- The user subsequently exercised the generated desktop app and recorded observations in Sprint 038 `Testing Results`. Create/Open Project, New AMX, and explicit Save worked, but empty folders were not displayed, Run failed with `AMX3001: Unknown type 'Text'` and a worker module-not-found error, imports could not be tested, preview did not follow the selected file, autosave was not observed, and rename/move controls were absent. Project settings were not reachable, so Sprint 039 UI behavior was not exercised. These observations reinforce the Sprint 038 gate; they do not constitute Sprint 038 acceptance or native-platform certification.
- Source cross-checks identify concrete follow-up candidates: the generated report uses `Text` although the checker primitive set contains `String`; `listProjectFiles` returns files but not empty directories; and the packaged resources contain `jobWorker.js` while worker selection may choose `jobWorker.ts` based on `import.meta.url`. The worker mismatch is a likely explanation for the reported resolver error and still needs a focused packaged-app verification. Direct RPC autosave tests pass, so the manual autosave observation remains an unresolved UI/runtime discrepancy, not a confirmed root cause.

## Baseline Verification

Host/runtime versions are not newly certified by this blocked check; the repository's recorded host is Omarchy Linux x86_64 with Bun 1.4.2.

- Focused root input/report tests: `tests/inputData.test.ts`, `tests/reportPreparation.test.ts`, and `tests/reportIdentityCli.test.ts` passed, **16 passed / 0 failed** (VS Code test runner).
- `cd desktop-app && bun run tests/rpc-contract-check.ts`: passed the existing typed RPC/webview boundary and desktop contract groups, including Sprint 036/038 baseline behavior, precedence/validation/current-buffer/HTML-PDF safety, privacy/conflict/transition checks; ended with `Final active resources: []`. The script reports grouped assertions rather than one aggregate test count.
- The direct RPC run does not test the required Sprint 039 config mutation, UI workflows, config-conflict/recovery semantics, current-buffer report-settings edits, or native picker interactions.

## Required Unblock and Resume Checks

- Owner: Sprint 038 Builder to complete the remaining acceptance evidence; Lead Developer to record final acceptance or an explicit dependency disposition. Until then, Sprint 039 remains blocked.
- Confirm the accepted trusted config boundary supports revision/hash checks, atomic writes, complete validation, recovery interaction, and no-partial-write behavior for both private local and portable project settings.
- Before UI wiring, add/run focused tests for precedence, local persistence and explicit project promotion, containment/POSIX/network/symlink rejection, config merge/conflict/cancel/no-write, logo validation, frontmatter preservation, and input/config revision invalidation.
- Then implement and validate contextual Inputs and scoped Report Settings against Sprint 039 acceptance. Record real active-document switching, cancellation/supersession, stale disks, invalid/missing mappings/assets, current-buffer frontmatter, and RPC/log/evidence privacy results.
- Native picker/menu/window behavior remains unavailable unless directly observed on an SDK-enabled host. Browser, mock, service, or source-inspection results cannot satisfy native acceptance.

No Sprint 039 feature acceptance is claimed. Sprint 040/041/042 entry conditions are unchanged and must be revisited after Sprint 039 is unblocked and accepted.

## Sprint 038 Dependency Update (2026-10-02)

- The Lead Developer reports all Sprint 038 acceptance tests completed successfully and directs Sprint 038 to be marked complete. The final-Sprint-038-acceptance dependency recorded above is cleared by that disposition.
- Sprint 039 implementation has not been performed by this update. Its precedence, privacy, trusted config-write/conflict, frontmatter-preservation, logo-security, revision-invalidation, and native-evidence criteria remain in force; no Sprint 039 completion is claimed.
