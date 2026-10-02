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

- At this dependency-update checkpoint, the Lead Developer reported all Sprint 038 acceptance tests completed successfully and directed Sprint 038 to be marked complete. This cleared the final-Sprint-038-acceptance dependency.
- Sprint 039 implementation had not yet been performed at that checkpoint. The following Final Builder Outcome supersedes that historical statement; the Sprint 039 acceptance criteria remain in force.

## Final Builder Outcome (2026-10-02)

### Disposition and Scope

**IMPLEMENTATION COMPLETE WITH RECORDED EXCEPTIONS; Lead Developer acceptance pending.** The final Sprint 038 dependency is satisfied by the explicit Lead Developer direction recorded in `planning/state.md` and `planning/decisions.md`. The final Sprint 038 manual matrix and exact observations were not supplied; this Builder does not independently claim that native/UI matrix.

Delivered the contextual active-document Inputs panel and scoped Report Settings modal. The panel shows declared name/type, session/local/project/missing source, unvalidated/valid/missing/invalid state, source declaration navigation, per-input data diagnostic links, Browse/Clear/Open, aggregate/fail-fast mode, and explicit promotion. Report Settings exposes project defaults and current-document overrides for all nine V0.5 fields, effective/inherited values, logo selection, validation errors, source visibility, and accent fallback.

Trusted Bun RPC now owns local picker persistence, project promotion, config merge/conflict/no-write, report identity validation, sanitized project-contained logo selection, and current-buffer frontmatter edits. Config writes use revision hashes, strict candidate validation, same-directory temporary files, flush/close and atomic rename. YAML edits preserve content outside frontmatter and unrelated YAML keys/comments/line endings. Settings changes increment `inputSettingsRevision` and invalidate active jobs. No precedence, V0.5 identity, CLI, AMX, or VS Code semantics changed.

### Privacy and Boundaries

- `getInputConfiguration`, picker/mapping responses, diagnostics, and report settings snapshots expose no local absolute input path or input bytes. Focused tests assert private path/content redaction for picker persistence, and the direct desktop suite retains Sprint 036 worker/path-redaction checks.
- The webview submits logical input names, scopes, revisions, report values, and native picker intents only. It gains no filesystem, loader, evaluator, arbitrary path, or write authority.
- Explicit Open works for a mapped contained project data file through the existing document-open boundary. Opening mapped private external data is not implemented: Bun returns a bounded path-free unavailable error until Sprint 041 supplies the structured data-editor route.
- Native picker and logo-selection behavior was tested with injected service picker results only. No direct OS dialog interaction, native UI screenshot, or populated workbench visual acceptance was performed. The picker/UI acceptance item remains unverified, not passed.

### Verification

Host: Omarchy Linux x86_64; Bun 1.4.2; Node v24.14.1; Vue 3.5.41; Vite 6.4.3.

- `cd /home/cgamez/Programming/openamx && bun test desktop-app/src/bun/configuration.test.ts desktop-app/src/bun/desktopSettings.test.ts tests/inputData.test.ts tests/reportPreparation.test.ts tests/reportIdentityCli.test.ts`: **27 passed, 0 failed, 146 expectations across 5 files**.
- `cd /home/cgamez/Programming/openamx && bun run build && bun test && git diff --check`: passed; root build passed and **220 tests, 0 failures, 953 expectations across 21 files**.
- `cd /home/cgamez/Programming/openamx/desktop-app && bun run test`: direct RPC/authority/workflow suite passed, including Sprint 036/038 identity, cancellation, conflict, privacy, no-write and no-active-resource groups; ended `Final active resources: []`.
- `cd /home/cgamez/Programming/openamx/desktop-app && bunx vue-tsc --noEmit`: passed.
- `cd /home/cgamez/Programming/openamx/desktop-app && bunx vite build`: passed; Vite 6.4.3, 1,916 modules, JS 736.95 kB / 253.62 kB gzip, CSS 43.82 kB / 8.98 kB gzip. Existing >500 kB chunk warning remains.
- `cd /home/cgamez/Programming/openamx/vscode-extension && bun run compile && bun run test`: passed **18 Extension Development Host tests** on VS Code 1.85.0. Existing Fontconfig and unrelated `ms-python` API proposal warnings were emitted; no extension source/API changed.
- Native picker/window/platform, browser-backed production component interaction, and screenshot checks were not run. A stable Electrobun build may exist from the available generated host, but it is not native-dialog interaction or release certification.

### Downstream Conditions

- Sprint 041 owns opening/editing explicitly mapped private external data without returning private paths or input values in general RPC/log/evidence payloads; do not broaden filesystem browsing.
- Lead Developer/native acceptance owns direct native input/logo picker and populated UI checks. Sprint 043 owns bridge-backed viewport/theme/focus acceptance. No native release, Hutch launch, Office, license/Marketplace, or formal accessibility claim is made.
