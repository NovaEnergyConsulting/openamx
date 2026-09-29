# 011 Handoff Prompt

You are the Builder for `openamx` Sprint 011.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `planning/sprints/0010-canonical-formatter-renderer-integration/acceptance.md`
- `planning/sprints/0011-vscode-extension/requirements.md`
- `planning/sprints/0011-vscode-extension/blueprint.md`
- `planning/sprints/0011-vscode-extension/acceptance.md`

Execute only Sprint 011 scope. Do not silently redefine the language contract or broaden the extension into an LSP/editor-platform project. Record any genuinely blocking ambiguity in `planning/questions.md` before implementation.

Sprint 010 is complete. The core formatter and renderer are available, and document evaluation executes code blocks in one shared environment before final-context interpolation. The extension should reuse the pure core parser/formatter from a Node-based VS Code host. Preserve the current root TypeScript/Bun structure and add only the focused `vscode-extension/` package.

## Task Contract

**objective**: Deliver a local-development-ready, Marketplace-ready (but unpublished) OpenAMX VS Code extension published as `EngineersTools`, with direct providers for formatting `amx` fence contents, basic keywords/functions/in-scope variable completion, and source-located parser diagnostics; build and install a local VSIX.

**owns**:
- `vscode-extension/**` (manifest, Node-host extension code, providers, bundle/build/test/package configuration, VSIX exclusions, Extension Development Host tests, launch/debug configuration)
- `src/parser/parseDocument.ts` and a narrowly scoped parser export, if required, to expose pure parsing of editor buffer text while preserving `parseDocument(path)` behavior
- `tests/parser.test.ts` (pure text parsing API coverage)
- `docs/language-spec-v0.2.md`
- `README.md` (minimal editor setup/extension development/install guidance only; full V0.2 documentation remains Sprint 012)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- Sprint 011 artifacts only to correct factual errors or record an approved clarification

**must_not**:
- Create a separate LSP server, introduce language-server infrastructure, or migrate the whole root project/monorepo.
- Call `Bun.*` from extension-host runtime code. Use Node APIs and a bundled core-compatible entry point.
- Duplicate the core `amx` fence parser or canonical formatter in the extension. Reuse core APIs; expose a pure text parser if the current path API is insufficient for unsaved documents.
- Format or modify text outside executable `amx` block contents, or treat ordinary Markdown fences/bare V0.1 declarations as executable.
- Add runtime execution diagnostics, hover/navigation/refactoring/semantic-token features, extension settings/customization, or unrelated commands.
- Publish/upload the VSIX, authenticate to Marketplace, change the publisher identifier, or add Asset Management core logic/V0.3 features.
- Weaken root tests or change unrelated runtime/render/CLI behavior.

**acceptance**:
- Meet every criterion in `planning/sprints/0011-vscode-extension/acceptance.md`.
- `vscode-extension/package.json` uses publisher `EngineersTools` and contributes `.amx` support with a compatible engine range.
- Formatting edits only executable block bodies and uses the existing canonical formatter.
- Completions cover keywords, standard-library functions, and source-order-visible variables (including a loop iterator in its active body); no completion feature is advertised outside the defined scope.
- Diagnostics are parser-only, use VS Code ranges corresponding to original document locations, and update/clear on document changes.
- Run tests through an Extension Development Host, build and package the extension, produce a VSIX, and verify local installation without publishing.

**verification**:

1. Add/run core pure-text parser tests for front matter, executable fences, and original-document locations.
2. Run root `bun run build` and `bun test`.
3. From `vscode-extension/`, run the documented dependency install, build/bundle, and Extension Development Host test commands.
4. Package the VSIX and install it locally using the VS Code CLI; verify activation/providers against a sample `.amx` document.
5. Record exact commands/results, compatibility floor, any unavailable host/tool prerequisite, and deviations. Do not mark Sprint 011 complete if Extension Development Host behavior or local VSIX installation remains unverified.
