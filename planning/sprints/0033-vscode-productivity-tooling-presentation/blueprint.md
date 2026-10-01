# Sprint 033 Blueprint: VS Code Productivity Tooling and Presentation

## Approach

1. Baseline the direct registration in `extension.ts`, current completion/diagnostic/formatting host tests and `moduleAnalysis.ts` graph/containment logic. Map available AST/checker original-document source spans and identify declaration tokens vs whole-statement ranges. Only independently proven facts may survive a parse/link failure; do not duplicate the AMX parser or evaluator.
2. Extend pure read-only editor analysis with a bounded symbol identity/source-order index for the entry and reachable explicitly exported local modules. Resolve open unsaved VS Code dependency buffers when available, otherwise canonically contained disk `.amx`; invalidate on document change/close. Track local shadowing, namespaced exports, cycles, unresolved imports and unknown types; return no target instead of guessing. Keep the analysis usable from the Node extension host without an LSP.
3. Implement one exact original-source range conversion helper from one-based UTF-16 core positions to zero-based VS Code `Position`/`Range`. Check token bounds and document version against the actual buffer, including CRLF, multiline fences and non-BMP characters. Do not use formatted or synthesized text as a location source.
4. Register hover, definition and document symbols first with focused Extension Development Host cases. Hover shows escaped static facts, definition targets a proven token and outline follows source order with nested located fields only. Validate inert Markdown/non-`amx` fences, untitled local-only cases, imports and ambiguous/unavailable targets.
5. Add identity-based references across only reachable contained modules and safe contextual code actions. References exclude shadowed names and unrelated files; include-declaration follows VS Code API. Code actions use localized parser/static diagnostics and a uniquely determined fix with version/range validation, previewable `WorkspaceEdit` and no auto-save/auto-apply. If no deterministic action exists, return none without weakening diagnostics.
6. Run focused host regressions for existing formatting/completion/diagnostic refresh, then extension compile/host tests, root build/tests as needed for shared checker changes and local VSIX package/install/installed-host check where available. Capture exact command outputs and limitations; update extension README/package description to verified capability only. Record planning outcomes and residuals, not Marketplace publication.

## Files to Update

- `vscode-extension/src/providers/moduleAnalysis.ts`, existing completion/diagnostic providers only where shared pure facts or invalidation require change, and focused new direct providers under `vscode-extension/src/providers/`
- `vscode-extension/src/extension.ts`, `vscode-extension/src/test/providers.host.ts` and suitable nearby host test helpers
- `vscode-extension/package.json` and `vscode-extension/README.md` only for verified presentation/packaging changes; `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for results

## Notes

- Preserve Node-host compatibility and the explicit local read boundary. A symbol-resolution helper is justified only if it shares facts across several providers; avoid parallel parsers or guessed text searches.
- Sprint 029 native workflow and Sprint 030 desktop analysis exceptions remain distinct and OPEN; Sprint 033 may reuse core facts but cannot certify a desktop UX. Sprint 034 retains final integrated acceptance and Lead Developer visual review.
