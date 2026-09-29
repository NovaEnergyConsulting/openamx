# 018 Blueprint: V0.3 VS Code Authoring Support

## Approach

- Adapt the three existing providers rather than adding an LSP. Continue parsing the active `TextDocument` via `parseDocumentText` for unsaved-buffer fidelity and use AST locations to constrain edits/completions/diagnostics to executable fences.
- Build a narrow read-only local-import resolver for editor analysis if the core module loader cannot be reused without evaluation. Reuse the contract's path, export, collision, and cycle rules and pass resolved exported symbols to `checkDocument`; do not call `loadEntryModule` for editor work.
- Feed V0.3-capable checker errors into the diagnostic collection with AMX code, file, and original coordinates. Preserve parser errors and clear/refresh on document change and close. Check activated programs without CLI input mappings, data-file reads, or runtime validation.
- Extend completion with AST-scoped type, value, callable, input, and field candidates. Only offer explicitly imported names resolved for the current module; avoid completing names declared later or outside the current scope. Use a limited syntax-tolerant cursor path when the document is incomplete, without claiming symbols whose scope cannot be established.
- Keep formatting delegated to the canonical core formatter. Extend that formatter only as needed for V0.3 braced type layout; verify parsing and idempotence and preserve non-executable bytes, strings, and Markdown.
- Expand the existing host suite with real `.amx` documents for local imports, CRLF formatting, V0.2 regression, type diagnostics, and updates after edits. Verify the packaged, installed artifact in a host when supported.

## Files to Update

- `vscode-extension/src/providers/formatting.ts`, `completion.ts`, and `diagnostics.ts`
- `vscode-extension/src/extension.ts` only for provider lifecycle or change events
- `vscode-extension/src/test/` and focused editor fixtures
- `src/formatter/formatAmx.ts` and narrowly related core tests only if V0.3 layout requires it
- Pure parser/checker exports or a focused read-only module resolver only where needed for unsaved-buffer module analysis
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 018 artifacts only for verified factual clarifications

## Notes

- The current completion provider only collects V0.2 variables/iterators; the current diagnostics provider parses but does not type-check. The current formatter already edits executable bodies only. Extend these ownership points instead of duplicating grammar or type rules.
- The evaluating module loader reads input files and executes modules; editor analysis must stop after parse, local linking, and type checking.
- Do not silently treat a current editor buffer as identical to its saved disk copy when imports refer to it.
- Sprint 019 owns version metadata, broad extension documentation, and final end-to-end acceptance. Sprint 018 still must package/install and verify a local VSIX.
