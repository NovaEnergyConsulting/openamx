# 018 Requirements: V0.3 VS Code Authoring Support

## Goal

Extend the existing direct-provider VS Code extension to author V0.3 records, typed values, pure functions, modules, and logical inputs. Provide executable-fence formatting, scoped completion, and source-located static diagnostics while preserving the V0.2 provider behavior and Node-host compatibility.

## Inputs

- `planning/plan-openamxV03MasterSprintPlan.md`, Sprint 018
- `docs/language-spec-v0.3.md` and the completed Sprint 014-017 acceptance records
- `vscode-extension/src/providers/`, `vscode-extension/src/test/`, and existing extension scripts
- Pure core parser, formatter, checker, and local module resolution interfaces

## In Scope

- Format V0.3 executable-block source (types/fields, annotated declarations, functions, imports/exports, inputs, constructors, and composed expressions) using the core formatter; keep edits inside exact `amx` fence bodies and make repeated formatting idempotent.
- Complete V0.3 keywords, types, standard-library and visible user functions, record fields where the receiver is known, input/local binding names, and explicit imported symbols where the local module graph can be resolved. Respect declaration order, scope, and active loop/function context.
- Publish parser and activated static-checker diagnostics for the current editor buffer with original-document 1-based UTF-16 coordinates mapped to VS Code ranges and stable AMX codes. Include import/link errors when the local graph is resolvable and source-located; clear stale diagnostics on edits/close.
- Use current unsaved buffer content for the entry document. Resolve imported `.amx` files through a read-only Node-compatible editor path using the existing module contract and pure checker; never execute modules or read CLI data inputs to provide editor features.
- Add Extension Development Host tests for V0.2 regression and V0.3 formatting, completions, type errors, imported-symbol visibility, and diagnostic clearing. Build, package, locally install, and verify a VSIX.
- Update planning state, decisions, and questions with actual verification and any limitations.

## Out of Scope

- A new LSP, runtime execution in the extension, file-data validation, CSV/JSON loading, CLI option processing, output serialization, or filesystem writes for editor analysis.
- Hover, navigation, refactoring, semantic tokens, remote packages, general Markdown formatting, and Marketplace publication.
- Release-wide README/spec/version updates and end-to-end domain examples; Sprint 019 owns release documentation and final acceptance.

## Constraints

- Retain the direct VS Code API providers and Node-compatible bundle; extension-host runtime must not call Bun APIs or use the CLI's evaluating loader for diagnostics/completion.
- Preserve exact executable-fence detection and V0.2 parser-only behavior on V0.2-only documents. Front matter, ordinary fences, and bare V0.1 declarations do not generate AMX code diagnostics or completions.
- A missing, unsaved, or invalid import dependency must produce an honest localized diagnostic or unavailable completion, not fabricated symbols or an evaluation side effect. Record any unresolved editor-only graph limitation.
- Keep source locations accurate for CRLF and original-document columns; edit only the active executable body when formatting.
- No project license decision or Marketplace upload is authorized. A missing license can prompt during local packaging; record that outcome.
