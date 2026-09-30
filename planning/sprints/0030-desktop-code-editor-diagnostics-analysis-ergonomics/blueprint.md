# Sprint 030 Blueprint: Desktop Code Editor, Diagnostics, and Analysis Ergonomics

## Approach

1. Check the entry gate: `planning/state.md` currently marks Sprint 029 OPEN. Confirm an explicit Lead Developer Sprint 029 acceptance or dependency disposition before implementation. Record any remaining picker/native-close blocker as a Sprint 029 residual, not a Sprint 030 accomplishment. Review the current typed tab/revision and stale-request RPC contracts, existing textarea lifecycle, shared parser/checker/formatter and current test harness.
2. Run a bounded compatibility proof for a maintained Vue-compatible editor candidate. Use the actual desktop bundle/host path where available to exercise fenced AMX highlighting, keyboard shortcuts, IME, undo/selection, screen reader focus/label, 200% zoom, large file, resize, reduced motion, license and bundle size. Document versions/measurements; if proof fails, seek Lead Developer selection rather than shipping an unverified custom editor. Install/pin only the selected library after the proof.
3. Replace only the editor surface in the existing Vue shell. Bind editor text to the active tab's typed `updateBuffer` flow, keep per-tab selection/scroll state local and bounded, guard async edits by path/sequence/revision, and ensure switching/navigation cannot overwrite a dirty tab. Preserve focused layout and commands, and give the editor precedence for ordinary editing shortcuts.
4. Reuse the canonical formatter and pure parse/check/link services through bounded main-process analysis RPC. Map original-document UTF-16 positions (including multiline fences, CRLF and surrogate pairs) to editor ranges. Format only executable fences, retain undo and selection or nearest mapped boundary; do not create a parallel AMX grammar/parser or run loader/evaluator/input reads for completion/diagnostics.
5. Show source-located static parser/checker/local-module diagnostics with severity/state and correct file navigation; differentiate later run/data diagnostics. Invalidate results on tab revisions and input/config changes. Apply request IDs bound to project generation, entry URI, buffer and input revisions for run/preview/export; on failure or late replies, clear or explicitly label stale preview/results without claiming that main-process work was cancelled.
6. Add focused direct RPC and UI tests in the existing desktop suite (new focused test files only if existing harness is unsuitable). Cover multi-tab unsaved edits/formatting, selection/scroll/undo, source navigation/imports, static versus runtime diagnostics, request ordering, invalid inputs, results redaction and destination preservation. Exercise keyboard/zoom/IME/screen-reader behaviors with actual supported host evidence where possible; retain explicit unsupported-host notes.
7. Run the root build/tests, desktop direct RPC tests, direct Vue typecheck/Vite build and available native/package checks, plus `git diff --check`. Record exact artifacts, counts, dependency license, bundle metrics and residuals in planning records. Do not claim Sprint 029's native save dialog or quit gate closed by these editor checks.

## Files to Update

- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css` and suitable local editor/component files if justified by the proven integration
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, and existing pure editor-analysis helpers only as needed for bounded source-aware behavior
- `desktop-app/tests/rpc-contract-check.ts` and focused desktop UI/editor tests; `desktop-app/package.json` and lockfile only for a verified component dependency
- `desktop-app/README.md` for verified editor/shortcut features; `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for proof, gate and residual outcomes

## Notes

- The approved `docs/language-spec-v0.5.md` section 5 governs ownership, source locations, accessibility, editor minimums and request staleness. Sprint 030 does not relax Sprint 029's open acceptance criteria.
- Sprint 031 report identity/HTML and Sprint 033 VS Code providers have independent Sprint 028 entry; avoid refactoring them into the desktop editor. Sprint 034 owns final Lead Developer visual review of actual desktop/report fixtures.
