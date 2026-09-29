# 011 Blueprint: VS Code Extension

## Approach

Implement this as a focused `vscode-extension/` package with a Node-host entry point, direct VS Code providers, and a bundled copy of the pure OpenAMX modules required at runtime. Keep the root TypeScript/Bun package intact. Use Bun to install/run the extension package's scripts where practical; use VS Code's supported Node-based Extension Development Host to validate behavior. A small esbuild bundle is a suitable boundary for TypeScript core imports and the external `vscode` API; retain a package script surface that can be repeated locally.

Before implementing providers, expose a pure `parseDocumentText(content)` (or equivalently named) core API that delegates to the existing text/front-matter/fence parser. Refactor `parseDocument(path)` to read with Bun and pass text into that function, preserving its current on-disk contract. The extension must never call the Bun-based file reader and must not reimplement the `amx` fence rules.

Register providers for `.amx` documents:

- **Formatting**: use the shared text parser to find executable code-block ranges, then apply the existing canonical formatter to each block content. Return minimal `TextEdit.replace` ranges limited to the content between fences. Do not reconstruct or rewrite fence markers, front matter, ordinary fenced code, or narrative.
- **Completion**: operate only when the cursor is inside an executable `amx` fence. Offer language keywords and standard-library functions plus source-order-visible variables parsed from earlier executable blocks/prior statements. Add the active loop iterator while the cursor is inside that loop body. Do not show declarations that appear only later or inside unrelated narrative.
- **Diagnostics**: parse the current buffer and publish parser/fence diagnostics to a `DiagnosticCollection`. Convert parser positions to VS Code's zero-based `Position` without off-by-one errors. Clear diagnostics for closed documents and after a subsequent successful parse. Do not evaluate code or generate runtime diagnostics.

Use `@vscode/test-electron` (or an equivalent Extension Development Host harness) to test providers through the registered VS Code APIs rather than only calling helper functions. Cover formatting that preserves surrounding document content, completion in/out of code fences and source-order scope, malformed syntax/fence diagnostics and location mapping. Add launch configuration/instructions for manual development-host use.

Configure the VSIX manifest with `publisher: EngineersTools`, the correct `.amx` language contribution, Node activation entry, extension engine compatibility, scripts, and relevant metadata. Bundle runtime dependencies, ignore tests/development files, run the packager, and install the resulting VSIX locally with the VS Code CLI. Marketplace publication remains explicitly deferred.

## Files to Create or Update

- `vscode-extension/package.json` — extension manifest, scripts, focused dependencies, publisher and engine metadata.
- `vscode-extension/src/extension.ts` — activation/deactivation and provider registration.
- `vscode-extension/src/providers/formatting.ts` — range-limited executable-block formatting.
- `vscode-extension/src/providers/completion.ts` — keyword/function/source-order variable completion.
- `vscode-extension/src/providers/diagnostics.ts` — parser diagnostics and lifecycle.
- `vscode-extension/esbuild.mjs` (or equivalent) — Node-target bundle with `vscode` external.
- `vscode-extension/.vscodeignore`, extension tests, test runner config, and launch/debug config as required for a complete local package.
- `src/parser/parseDocument.ts` (plus a narrowly scoped parser export file if needed) — pure text parsing entry point shared with path-based parser.
- `tests/parser.test.ts` — prove pure text API equals path API behavior for relevant fences/front matter/locations.
- `docs/language-spec-v0.2.md` — add an editor-support section describing available providers, scope, and setup.
- `README.md` — minimal extension installation/development guidance if needed; full user-facing V0.2 documentation remains Sprint 012.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` — record scope, final decisions, verification, status, and deviations.

## Notes

- Avoid creating a source-copy fork of the core. Bundle imports from `../src` into the Node-compatible extension entry. The extension should use the existing formatter, pure parser, and AST rather than a second grammar implementation.
- The root `tsconfig.json` intentionally builds only `src/**`; extension compilation/bundling and tests must have package-local configuration so the root build remains unchanged.
- The extension engine compatibility floor should match the VS Code APIs actually used and be validated by the test host; do not claim compatibility with APIs newer than the selected minimum.
- Completion should be intentionally basic. This is not a request for semantic analysis, execution-based values, or LSP completeness.
- The VSIX must be buildable and installable locally, but do not sign in, publish, or upload.
