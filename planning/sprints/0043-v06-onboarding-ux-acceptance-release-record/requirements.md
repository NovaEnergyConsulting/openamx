# Sprint 043 Requirements: Onboarding, Help, UX Acceptance, and Release Record

## Goal

Complete V0.6 onboarding/help and integrated UX acceptance, then produce an evidence-based feature disposition and truthful release-residual record. Verify the full desktop workflow across the accepted 035-042 foundations without implying native release, broad Office, Marketplace, or formal accessibility certification.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 043
- `planning/openamxV06ProductUXContract.md`
- Sprint 035-042 final requirements, acceptance, Builder evidence, decisions, questions, and current state
- Sprint 041 selected data-editor packages, integrated behavior, 100k measurements, and performance residual
- Sprint 042 live preview/export evidence and native-host limitations
- V0.2-V0.5 language, data, report, CLI, desktop, and VS Code contracts
- Current root/desktop/extension README, help, package metadata, migration/session behavior, examples, test commands, and visual-evidence tooling

## In Scope

- Complete guided first-project flow, starter examples, searchable bundled language/workflow help, contextual links/tooltips, keyboard-shortcut reference, preferences UI, release notes, and bounded diagnostic-log export.
- Add explicit migration for V0.5 recent/session state containing designated-entry state. Preserve safe active tabs/layout where possible, discard obsolete entry state, never auto-run, and document migration and recovery behavior.
- Remove prototype/spike product naming and stale entry/manual-path instructions from desktop metadata and documentation. Align V0.6 version metadata only after integrated behavior has been verified.
- Build an integrated acceptance fixture covering project creation, multiple unsaved AMX imports, logical inputs, project/external data editing, settings precedence, editor intelligence/refactoring, live preview, cancellation, all export formats, conflicts, trash, and crash recovery.
- Run approved performance fixtures for 100 relevant files and supported 100,000-row CSV/JSON data. Record hardware/OS/runtime, fixture sizes, timings, memory methodology, long tasks, commands, artifacts, and any decisions.
- For the 100,000-row grid/table load and edit experience, treat timings as descriptive evidence rather than a fixed pass/fail ceiling. Evaluate practical usability against the current accepted experience: data remains intact, the virtualized view reaches the full dataset, core editing/history and cancellation work, no silent truncation occurs, and the Lead Developer accepts the measured interaction. The prior 3-second first-viewport and 100-ms grid-task thresholds are not hard acceptance requirements for this data-editor workflow.
- Retain and verify the other approved performance budgets, including project listing, default preview debounce, supported cancellation acknowledgement, and background analysis/validation/export responsiveness. Do not extend the 100k table exception to unrelated workflows.
- Run component/browser and available-host manual visual review at 1024x720 and a larger viewport in system/light/dark themes. Cover keyboard/focus, contrast, drawers, dialogs, dense/error states, no dead controls, and the contract state inventory.
- Update root/desktop/extension documentation and planning/evidence records only for behavior proven by the integrated fixture, test evidence, screenshots, and Lead Developer review.
- Record V0.6 feature acceptance separately from native macOS/Windows/native Ubuntu, Hutch packaging/launch, report-mobile overflow, VS Code apply-time action, broad Office, project license/Marketplace, and formal-accessibility residuals.

## Out of Scope

- New AMX syntax, type/runtime semantics, CLI behavior, report identity policy, data wire behavior, or export-format semantics.
- Silently fixing or waiving prior sprint residuals without focused implementation evidence and explicit disposition.
- Native packaging/release certification, signing/notarization, Hutch reliability, broad Office certification, project license selection, Marketplace publication, or formal WCAG certification.
- Claiming cross-platform native behavior from browser, mock, service, WSL2, source-inspection, or user-reported evidence without identifying its source and limits.
- Reintroducing a rigid 3-second or 100-ms data-grid gate after the explicit 2026-10-03 performance-policy adjustment.

## Constraints

- The authoritative product contract and V0.2-V0.5 compatibility rules remain in force except for the explicit 100k data-editor timing disposition recorded in the V0.6 contract and planning decisions.
- Preserve active-document identity, bounded worker/RPC authority, path/content privacy, atomic writes, conflict checks, cancellation semantics, strict JSON/RFC 4180 CSV behavior, and report/export no-write guarantees.
- Keep all 100k timing, memory, and long-task measurements reproducible and report raw results; do not hide slow samples or transform the policy adjustment into a claim that a threshold passed.
- Data-editor acceptance requires usable, complete, lossless interaction at the supported scale and actionable bounded fallback above supported limits. Performance is judged against actual interaction and explicit Lead Developer approval, not an invented number.
- Migration must never auto-run AMX or overwrite project source; recovery remains inspect/restore/discard and machine-local.
- User-visible docs and version metadata must match verified behavior. Local VSIX/builds are not Marketplace publication; available-host checks are not native target certification.
- Every residual has an owner, status, evidence needed, and next review point. No release-ready/published claim is permitted while separate release gates remain open.
