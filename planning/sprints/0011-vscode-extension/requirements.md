# 011 Requirements: VS Code Extension

## Goal

Deliver a locally testable, Marketplace-ready VS Code extension for OpenAMX authoring. Provide direct VS Code providers for formatting within executable `amx` fences, basic language/function/in-scope variable completion, and parser diagnostics with source locations. Bundle the TypeScript core for VS Code's Node-based extension host and produce a locally installable VSIX under the publisher `EngineersTools`.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md`, Sprint 011.
- V0.2 language contract: `docs/language-spec-v0.2.md`.
- Completed core formatter/render behavior: `src/formatter/formatAmx.ts`, parser, AST, and diagnostics APIs.
- Sprint 010 completion status and decisions in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- Root Bun/TypeScript project configuration and current tests.

## In Scope

- Add a focused `vscode-extension/` package; do not migrate the root project into a broad monorepo/workspace structure.
- Create an extension manifest with a stable extension name/display name, description, `publisher: EngineersTools`, `.amx` language/document association, supported VS Code engine range, activation configuration, scripts, and repository/package metadata. Marketplace publication is not part of this sprint.
- Use direct VS Code API providers. Do not create an LSP server or add language-server infrastructure.
- Build a Node-compatible extension entry point and bundle/reuse the core parser/formatter so the extension host has no runtime dependency on Bun. The V0.1/V0.2 core remains TypeScript/Bun.
- Add a pure text-buffer parsing API in the core, reusing the existing fence/front-matter/parser implementation, so providers can analyze unsaved editor content without writing temp files, reading via `Bun.file`, or duplicating fence-recognition rules. Keep the existing `parseDocument(filePath)` API behavior compatible by delegating to this shared text parser.
- Register a document formatting provider for `.amx` documents. Format only the content of recognized executable `amx` fences with the Sprint 010 canonical formatter; return edits limited to block content. Preserve fence delimiters, all narrative/ordinary Markdown fences, and text outside executable block bodies exactly.
- Register completion inside executable `amx` fences for V0.2 keywords, standard-library functions (`sum`, `min`, `max`, `mean`, `round`, `abs`, `sqrt`, `pow`), and variables in scope. Include document variables introduced in preceding executable blocks and before the cursor in the current block; include the active loop iterator within its loop body. Do not suggest bindings declared only later in source order or names that are narrative-only.
- Register parser diagnostics for malformed executable `amx` content, with VS Code ranges mapped from the parser’s original-document 1-based UTF-16 line/column positions. Keep ordinary Markdown fences, narrative, front matter, and bare V0.1 declarations out of executable diagnostics.
- Provide local extension development support (Extension Development Host launch instructions/configuration), automated Extension Development Host tests for formatting, completion, and diagnostics, and a local VSIX installation smoke check.
- Define and document extension-local commands/scripts for install, compile/bundle, test, package, and local VSIX installation. Use Bun for package scripts/dependency management where practicable; the VS Code extension host itself must run on Node.
- Package a Marketplace-ready `.vsix` with `EngineersTools` publisher metadata and no publication/upload. Add packaging exclusions so source maps/tests/node_modules are not accidentally shipped unless needed.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with sprint status, dependencies/tooling decisions, verification, and any actual deviations.

## Out of Scope

- Publishing to the VS Code Marketplace, publisher verification, release automation, telemetry, or external service integration.
- A separate Language Server Protocol server, remote language service, or cross-editor support.
- Semantic runtime diagnostics requiring executing a document; this sprint provides parser/syntax diagnostics only.
- Hover, go-to-definition, rename, semantic tokens, refactors, snippets, preview webview, or commands beyond what is necessary for formatting/testing.
- Changes to language syntax, runtime behavior, renderer/CLI, examples, Asset Management domain logic, or V0.3 candidates.

## Constraints

- Follow the approved direct-provider architecture; no LSP and no unrelated monorepo conversion.
- Extension code must execute in the supported Node-based VS Code extension host; do not use `Bun.*` APIs in extension runtime code.
- Reuse the core parser and formatter rather than creating independent fence or formatting implementations. The pure buffer API must preserve original-document locations and current on-disk parsing behavior.
- All provider behavior is limited to exact, case-sensitive executable `amx` fences as specified in `docs/language-spec-v0.2.md`.
- Formatting must never alter surrounding Markdown or ordinary code fences. Completion/diagnostics must not treat bare V0.1 declarations as executable.
- Keep the extension package focused and dependencies minimal. Any provider/testing/packaging dependency must have a direct purpose (VS Code API typing, Extension Development Host testing, bundling, or VSIX packaging).
- The publisher identifier is exactly `EngineersTools`. Produce and locally install a VSIX; do not publish it.
- Keep root checks green with `bun run build && bun test`; also run the extension's compile/build, Extension Development Host tests, package, and local installation checks.
