# 011 Acceptance Criteria

011 is complete when:

- A focused `vscode-extension/` package exists without a broad root monorepo migration. Its manifest identifies the publisher as exactly `EngineersTools`, contributes the `.amx` language/document association, declares a compatible VS Code engine range, and activates the Node-host extension entry point.
- The extension uses direct VS Code API providers; no LSP server/process or language-server dependency is introduced.
- A pure core buffer-parsing API accepts unsaved text and returns the same parsed metadata/nodes/locations as the path API for equivalent content. Existing `parseDocument(path)` behavior is preserved by delegating to the shared parser.
- Extension runtime code is Node-compatible and contains no Bun runtime calls. The bundle resolves the needed core/parser/formatter dependencies and leaves the VS Code API external.
- Formatting is registered for `.amx` documents and changes only the contents of exact executable `amx` fences. Fence delimiters, front matter, narrative, ordinary code fences, and bare declarations remain byte-for-byte unchanged. Resulting code follows the canonical formatter and a second format produces no further edits.
- Completion is offered inside executable `amx` fences for V0.2 keywords, all eight standard-library functions, preceding/in-scope document variables, and an active loop iterator. It is not offered as OpenAMX completion outside executable blocks, and later-only/narrative-only variables are excluded.
- Syntax/fence parser diagnostics are published in the Problems view with ranges correctly mapped to source positions. Corrected documents clear prior diagnostics. Narrative, front matter, and ordinary Markdown fences do not create OpenAMX parser diagnostics. No code is executed to produce diagnostics.
- Extension Development Host tests exercise formatting, completion, and diagnostics through VS Code providers; focused tests include preserving surrounding content, completion context/scope, error range mapping, ordinary fences, and diagnostic clearing.
- The extension provides a repeatable local development workflow (launch Extension Development Host), and documented commands for install, build/bundle, test, package, and local install.
- Root and extension verification succeeds: `bun run build`, `bun test`, extension package install, extension compile/bundle, Extension Development Host tests, VSIX packaging, and local VSIX installation. The installed extension can activate against a sample `.amx` document and its providers operate.
- A Marketplace-ready VSIX is produced with `EngineersTools` metadata and appropriate package exclusions. It is not published or uploaded.
- V0.2 language/editor documentation and planning state/decisions/questions reflect the actual implementation and verification; Sprint 011 is marked complete only after acceptance, with Sprint 012 next.
- No runtime language features, renderer/CLI changes, Asset Management core concepts, or V0.3 roadmap features are added.
