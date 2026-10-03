# Sprint 043 Blueprint: Onboarding, UX Acceptance, and Release Record

## Approach

1. Establish the acceptance ledger. Read the V0.6 contract, all Sprint 035-042 outcomes/evidence, V0.5 residuals, and current package/docs. Map each contract and sprint criterion to direct evidence, exception, blocked/unavailable status, owner, and next action. Distinguish user-reported acceptance from reproducible automated/native observations.
2. Apply the performance decision precisely. The user has accepted the current 100k data-editor experience and approved relaxing its numeric timing objectives. Update the authoritative V0.6 contract and planning decision so the 3-second viewport and 100-ms grid-task values are not pass/fail gates for 100k data-editor load/edit. Keep actual measurements, memory, longest tasks, full-range scrolling/edit/history, data preservation, cancellation, and Lead Developer qualitative usability disposition in evidence. Preserve unrelated budgets.
3. Complete onboarding and help. Implement the guided first-project path using the accepted project lifecycle, starter examples, bundled searchable help, contextual links/tooltips, shortcut reference, preferences, release notes, and bounded diagnostic export. Keep logs free of private paths, input contents, source/recovery text, and credentials.
4. Implement and test V0.5 session migration. Detect designated-entry state, preserve valid safe active tabs/layout, discard obsolete entry selection, avoid implicit execution, and test corrupted/old/new session shapes and recovery interaction.
5. Run integrated acceptance. Use a clean isolated project fixture that covers create, contained and external data, unsaved import graph, settings precedence, editor assistance/refactoring, structured editing, live preview/cancellation, all five export formats, conflicts, trash, and recovery. Exercise success, stale, invalid, cancellation, and no-write paths across current document changes.
6. Run product-quality review. Capture deterministic component/browser screenshots at 1024x720 and a larger viewport in system/light/dark. Complete available-host manual visual review for focus/keyboard, contrast, drawers/dialogs, density, error states, dead controls, onboarding and help. Name browser/host/OS/version and do not promote browser evidence to native proof.
7. Update product documentation conservatively. Remove prototype/spike language and stale workflow instructions only after integrated evidence supports replacement text. Align V0.6 metadata only after behavior verification; preserve historical V0.2-V0.5 specifications. Document remaining limitations plainly.
8. Run the required verification matrix. Focused tests first; root build/full suite; desktop RPC, unit/component/browser, typecheck/Vite; extension compile/host regressions when shared editor behavior is in the fixture; performance fixtures; `git diff --check`. Capture exact commands, versions, counts, warnings, artifacts, hashes, screenshots, and unavailable checks.
9. Obtain Lead Developer dispositions. Record feature status independently from native platform/Hutch, Office, license/Marketplace, report-mobile, VS Code apply-time, and formal accessibility tracks. Every exception must state owner, evidence/next step, and review point. The relaxed 100k timing objective is a product decision, not an acceptance exception; still record the measured experience and explicit usability acceptance.

## Files to Update

- `planning/openamxV06ProductUXContract.md` for the approved 100k data-editor performance criterion adjustment
- `planning/plan-openamxV06MasterSprintPlan.md` for Sprint 043 acceptance/performance language
- Root, desktop, and extension documentation; onboarding/help/release-note/shortcut content; package metadata only when verified
- Session migration/recovery implementation and focused desktop tests
- Integrated acceptance fixtures, component/browser screenshots, performance/evidence records
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 043 Builder evidence/disposition

## Notes

This is the integrated feature-acceptance and release-record sprint, not permission to declare every inherited residual closed. The 100k grid timing objective is intentionally relaxed, but the experience must remain complete, lossless, bounded, measured, and explicitly accepted. Do not confuse “not a hard timing gate” with “no evidence needed.”
