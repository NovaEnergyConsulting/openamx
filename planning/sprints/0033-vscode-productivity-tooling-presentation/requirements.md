# Sprint 033 Requirements: VS Code Productivity Tooling and Presentation

## Goal

Extend the Node-hosted, direct OpenAMX VS Code extension with trustworthy hover, go-to-definition, document symbols/outline, references and safe contextual code actions. Preserve existing formatting, completion, diagnostics, original source locations and V0.2-V0.4 language semantics without an LSP, evaluation or input-data loading.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 033; approved `docs/language-spec-v0.5.md`, section 6
- `vscode-extension/src/extension.ts`, `vscode-extension/src/providers/`, `vscode-extension/src/test/providers.host.ts`, `vscode-extension/package.json` and existing extension README
- `src/parser/parseDocument.ts`, AST source locations, checker/link facts, existing direct provider/module analysis and extension-host test results
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for Sprint 028 contract acceptance, Sprint 032 report outcome and independent open release/desktop residuals

## In Scope

- Register direct hover, definition, document-symbol, reference and code-action providers for `.amx` documents using pure parser/checker/read-only contained local-module facts. Honor the current unsaved entry text and any open unsaved dependency document ahead of saved contained `.amx` content; invalidate analysis on edits/close/dependency changes. No arbitrary workspace scanning or cross-root navigation.
- Resolve only proven symbols from exact executable `amx` fences, respecting source order, local scopes/shadowing, entry/import graph, explicit exports and checked types. Give hover declaration kind/static type/signature and explicit import origin as escaped plain text, never computed runtime values. Definition points to the declared token for preceding in-scope bindings/types/functions/views or contained explicitly exported imported declarations; return no target for unknown/ambiguous/cyclic/outside imports, standard-library names without source or inert prose/fences.
- Supply source-ordered outline symbols for top-level types/functions/inputs/bindings/views (and located record fields as children when supported) with meaningful original declaration and selection ranges. References match resolved symbol identity across the reachable contained graph, excluding same-name shadowed/unrelated files; support the provider's explicit include-declaration convention. Unsupported/unproven interpolation or dynamic text yields no speculative references.
- Add only deterministic, range-checked contextual fixes grounded in parser/static diagnostics and a unique visible candidate; preview/return a VS Code `WorkspaceEdit` with document-version/revision safety. No speculative rename, data-dependent fix, auto-apply on save, execution, arbitrary writes or silent edits to dependencies. Withhold actions when the target/source range cannot be proven.
- Convert original one-based UTF-16 parser/checker coordinates into exact zero-based VS Code ranges, including CRLF, multiline fences and surrogate pairs. Untitled documents retain local facts but imports report unavailable; parse/link failures preserve independently proven facts and existing localized diagnostics rather than fabricating symbols. Keep formatting executable fences only and source-order completion/static diagnostics functioning.
- Refine extension descriptions/onboarding only to match tested behavior. Add Extension Development Host coverage for all five new provider paths, unsaved entry/dependency edits, imports/exports, cycles/containment, duplicate/shadowed names, diagnostic refresh/clear, regression formatting/completion, code-action revision guards and Node-host compatibility. Compile, host-test, package/install a local VSIX where supported; record license/publication warnings without publishing.

## Out of Scope

- An LSP server/process, runtime evaluator, input CSV/JSON reads, CLI invocation, remote modules, global workspace symbols/indexing, speculative refactors or language/visualization semantics changes.
- Desktop Sprint 029 native project/save/quit remediation and Sprint 030 CodeMirror/editor-analysis exceptions. Shared pure checker/link facts may be reused but the desktop UI/RPC remediation retains its separately approved owner; do not mark its acceptance items passed via VS Code provider tests.
- Sprint 034 full CLI/docs/examples acceptance, Marketplace publication or license selection, native platform/Hutch and broad Office certification.

## Constraints

- Sprint 033 depends on accepted Sprint 028 only. Sprint 032's automated export completion is useful context but is not an extension entry gate or evidence of native/Office acceptance. Preserve source-location fidelity and Node extension-host bundling; no new LSP or webview privilege.
- Canonical containment and explicit export rules guard read-only module analysis. Never fabricate a definition/reference/hover/action when parse/check/link identity is uncertain; retain useful independently proven local facts and diagnostics where possible.
- Record exact host/tool versions, focused test counts, VSIX artifact and unavailable checks. Distinguish local VSIX packaging/installation from Marketplace publication and V0.5 final visual/release sign-off.
