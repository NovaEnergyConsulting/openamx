# Sprint 042 Blueprint: Live Preview, Runtime Drawer, and Export Parity

## Approach

1. Establish the entry gate. Read Sprint 036 job/overlay evidence, Sprint 038 project/output boundaries, Sprint 039 settings snapshots, Sprint 040 editor facts, and Sprint 041 data-editor evidence. Confirm the final Sprint 041 disposition and preserve its 100k responsiveness exception for Sprint 043.
2. Define operation-state transitions. Model preview/run/export as active-document jobs keyed by canonical URI, project generation, document revision, input/settings revision, and job ID. Specify current, running, paused, stale-last-good, invalid, cancelled, failed, and superseded states before wiring controls.
3. Implement live analysis/preview. Debounce within the approved budget, use the current unsaved module overlay and mapped data/settings revisions, preserve last-good output with unambiguous stale/error labeling, add pause/resume/manual refresh, and keep explicit Run as a power command. Ensure all switching/editing/settings/data/project changes invalidate prior jobs.
4. Complete the runtime drawer. Present concise current state and progress, then expandable parser/static/input/runtime/export details. Keep parser/checker/link diagnostics inline and link drawer diagnostics back to exact source/data locations. Verify bottom/right docking, focus, keyboard, and compact states from the Sprint 037 shell.
5. Implement unified export discovery/workflow. Derive active-document identity and explicitly exported binding/format eligibility from trusted current analysis/schema facts. Offer HTML/PDF/DOCX and eligible JSON/CSV with one selection/confirmation path, safe suggested names, overwrite confirmation, and no stale designated-entry assumptions.
6. Harden destination and write flow. Obtain native save selection through trusted Bun APIs; allow validated local destinations inside or outside the project only after explicit consent. Preflight current job/revisions, path shape, symlinks, existing destination hash/overwrite, and serialization. Prepare full bytes before main-process atomic replacement. Preserve the prior file on every failure/cancel path.
7. Add success actions and explorer refresh. Provide Open/Reveal without automatic launch, and refresh contained generated outputs with Open/Reveal/Delete actions. Keep private external destinations out of shared recents/state.
8. Prove real cancellation and authority. Exercise cancellation/supersession during analysis, input validation, report preparation, serialization, save selection, overwrite confirmation, and pre-commit. Verify active resource cleanup and no late UI/write. Explicitly distinguish the non-interruptible atomic commit phase.
9. Measure responsiveness. Record debounce-to-preview, cancellation acknowledgement and cleanup, worker memory/resource behavior, report/JSON/CSV serialization, and webview long tasks. Do not roll Sprint 041's 100k grid/edit exception into a hidden pass; assign any scope-external remediation to Sprint 043.
10. Verify and hand off. Run focused preview/export/RPC tests, all format and no-write suites, root regressions, desktop direct/typecheck/Vite/component checks, native-host observations where available, and `git diff --check`. Record exact artifacts, hashes, viewers/hosts, bundle/timing data, residuals, and Sprint 043 entry criteria.

## Files to Update

- `desktop-app/src/mainview/` active-document preview, runtime drawer, unified Export workflow, progress/stale/cancel/error states, and explorer output actions
- Trusted Bun workflow/job/destination/save-dialog/output services and `desktop-app/src/shared/rpc.ts`
- Existing report preparation and HTML/PDF/DOCX/JSON/CSV serializers only for narrow compatibility-preserving integration
- Focused desktop job/RPC/component/browser tests and root report/input/output/export regression tests
- `desktop-app/README.md` only for verified workflow behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 042 builder-evidence record

## Notes

The highest-risk defect is presenting stale output as current or replacing a valid destination before all work succeeds. Treat identity checks and write ordering as the core design, not UI polish. Save-dialog service coverage does not prove a native dialog; integrated browser preview does not prove a native window; every evidence claim must name its actual host.
