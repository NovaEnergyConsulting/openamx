# Sprint 024 Blueprint: Desktop Application Foundation

## Approach

- Start by confirming the isolated desktop package and the typed `ping` RPC still build/test at the level verified in Sprint 020/023. Define the production RPC schema before expanding UI behavior, and keep request handlers in the Bun main process.
- Establish a small project/session model: canonical project root, current entry URI, open documents with original disk revision/hash, current buffer text, dirty flag, and explicit conflict state. Keep path normalization and containment in one main-process helper; never trust webview paths or client-provided project listings.
- Implement typed operations such as `openProject`, `openDocument`, `listProjectFiles`, `saveDocument`, `formatBuffer`, `analyzeBuffer`, and `previewBuffer`. Return discriminated success/error/status payloads with bounded `AmxDiagnostic` data. Keep `runBuffer`, input mappings, and `exportPdf` reserved for Sprint 025 unless a no-op type placeholder is necessary for schema compatibility.
- Route `formatBuffer`, `analyzeBuffer`, and `previewBuffer` through the current text and module-analysis/core APIs. Preview must use the supplied unsaved entry text and the same file-backed URI; it must not call an alternate saved-file path or evaluate in the webview. Preserve source locations and return static diagnostics before preview HTML on failure.
- Build the Vue workbench around a file/project sidebar, tab or current-file header with dirty indicator, AMX editor surface, formatting/save controls, diagnostics panel, and HTML preview pane. Use shadcn-vue source-owned components and the established local font/assets; keep layout usable at the prototype window size.
- Provide AMX syntax highlighting and editing affordances through the lightest isolated approach consistent with the current package. Reuse formatter/completion/diagnostics logic rather than copying language rules. Clearly separate editor diagnostics from runtime/input validation, which remains Sprint 025.
- Add tests at three boundaries: pure main-process path/session/RPC contract tests; Vue/UI state tests for dirty/save/preview/error transitions; and an available native/host smoke path proving a real typed request and current-buffer response. Test path traversal, symlink/outside-root rejection, stale buffer preview, conflict-safe save, and no webview filesystem/evaluator capability.
- Keep the package's known Hutch command behavior explicit. Run direct checks where Hutch remains blocked, record exact outcomes, and do not convert the existing direct native bundle proof into full platform acceptance. Hand Sprint 025 a stable session/RPC surface for inputs, run/result states, HTML/PDF actions, and project defaults.

## Files to Update

- `desktop-app/src/shared/rpc.ts`
- `desktop-app/src/bun/` main-process RPC, file/session/path services, and core adapters
- `desktop-app/src/mainview/` Vue workbench, editor/preview/state components, styles, and source-owned UI helpers
- `desktop-app/tests/` or the package's established focused test locations
- `desktop-app/README.md`, package scripts/configuration, and lockfile only as required
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Root/core files only when a narrowly demonstrated reusable API gap blocks the desktop boundary; do not duplicate core behavior in desktop code

## Notes

The Sprint 023 PDF adapter is available for later desktop integration but PDF export is not a Sprint 024 workflow. The current prototype's direct native RPC proof and source-owned shadcn aliases are the starting point. Hutch package prepare/build/dev and persistent WSL window behavior remain residuals from Sprint 020; report them accurately and use the available direct checks without claiming unsupported platform results.
