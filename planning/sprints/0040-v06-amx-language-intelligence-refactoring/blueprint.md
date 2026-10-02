# Sprint 040 Blueprint: AMX Language Intelligence and Refactoring

## Approach

1. Establish the shared-facts boundary. Read Sprint 035 proof limitations, Sprint 036 overlay/identity contracts, current parser/checker/source spans, and VS Code provider tests. Define pure input/output types for module graph, symbols, occurrences, ranges, completion, diagnostics, navigation, rename and actions without importing VS Code or desktop UI types.
2. Extract conservatively. Move reusable provider facts from existing VS Code adapters into the shared boundary while retaining host-specific document lookup, cancellation, lifecycle, and range conversion in adapters. Add parity tests before expanding behavior.
3. Implement contained static analysis. Traverse only the active document's reachable contained graph, using open unsaved buffers through the accepted overlay and canonical disk fallback. Preserve import/export/cycle/symlink/containment rules and never evaluate AMX or load mapped values.
4. Add exact CodeMirror highlighting. Use parser/checker-derived ranges to decorate executable `amx` fence contents, leave narrative and ordinary fences inert, and define incomplete/error-source fallback. Test CRLF, non-BMP text, repeated fences, selection/scroll, and editor update behavior.
5. Add completion and diagnostics. Produce source-order/import-aware candidates and inline parser/checker/link diagnostics with original coordinates, bounded messages, revision/job identity and no guessed facts. Test active/unsaved dependency edits and close/reopen invalidation.
6. Add navigation and safe actions. Implement hover, definition, references, document symbols, diagnostic-grounded actions, and rename only where symbol identity and ranges are proven. Preflight all revisions/containment/conflicts and apply multi-file edits atomically or refuse.
7. Preserve formatting ergonomics. Route canonical fence-only formatting through the existing formatter, retain undo and nearest safe mapping, and test selections, scroll, tab state, CRLF and non-BMP locations after edits.
8. Prove both adapters. Run focused shared/editor/CodeMirror/component tests and VS Code Extension Development Host regressions. Add desktop tests for unsaved overlays, inline diagnostics/navigation, focus/selection, action withholding, and stale revisions. Measure analysis latency, memory/bundle impact, and bounded payloads.
9. Verify and hand off. Run root build/tests, desktop direct/typecheck/Vite checks, extension compile/host tests, and `git diff --check`. Record unsupported parser spans, VS Code apply-time limits, native/browser limitations, and Sprint 041/042 entry conditions.

## Files to Update

- Proposed `src/editor/` shared pure editor-analysis modules or the nearest established shared boundary
- `vscode-extension/src/providers/` adapters and focused Extension Development Host tests
- `desktop-app/src/mainview/CodeEditor.vue`, editor components/composables, typed RPC/service adapters, and focused desktop tests
- Existing parser/checker/formatter only for narrow backward-compatible source-fact APIs
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 040 builder-evidence record

## Notes

The central design rule is shared semantic facts, not shared UI or host plumbing. The safest provider is the one that withholds an answer when location or identity is unproven. VS Code 1.85's apply-time `WorkspaceEdit` limitation remains a known residual unless a separate guarded command/preview design is explicitly authorized.
