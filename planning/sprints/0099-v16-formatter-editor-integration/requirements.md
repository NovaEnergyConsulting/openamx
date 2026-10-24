# Sprint 099 Requirements: V0.16 Formatter and Editor Integration

## Document Status and Entry Gate

Architect-prepared Sprint 099 documentation. Sprint 096 and Sprint 098 are
`ACCEPTED/CLOSED`; Sprint 097 is also accepted with its recorded residuals.
Their AST/parser, runtime, and type-checking behavior are the baseline for
this sprint. Sprint 099 depends on Sprints 096 and 098 under the V0.16 master
plan; both are accepted.

This package authorizes planning only. Obtain separate explicit Sprint 099
execution authorization and approval of the concrete file-by-file
implementation/evidence plan before editing source, tests, or host surfaces.

## Goal

Carry the accepted braced-function syntax into authoring tools: format
statement-bodied functions idempotently while preserving expression spelling
and existing expression-body formatting; extend shared parser-derived facts
for highlighting, completion, navigation, and diagnostics; and validate the
VS Code TextMate/provider and desktop CodeMirror experiences with focused
host/UI tests.

Sprint 099 is formatter/editor integration work. It does not add language
semantics, redesign either editor, or publish the V0.16 specification/examples.

## Authority and Inputs

- Scope and dependency:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 099.
- Behavior authority:
  [accepted Sprint 095 function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [Sprint 096 parser evidence](../0096-v16-function-ast-parser/builder-evidence.md),
  [Sprint 097 runtime evidence](../0097-v16-function-runtime-list-value-semantics/builder-evidence.md),
  and [Sprint 098 checker evidence](../0098-v16-return-path-type-checking/builder-evidence.md).
- Current shared surfaces: `src/formatter/formatAmx.ts`,
  `src/editor/highlighting.ts`, `src/editor/completion.ts`,
  `src/editor/symbols.ts`, `src/editor/sourceRanges.ts`,
  `tests/formatter.test.ts`, and `tests/editor.test.ts`.
- Current hosts: `vscode-extension/amx.tmGrammar.json`, VS Code providers
  and `vscode-extension/src/test/providers.host.ts`; desktop
  `desktop-app/src/mainview/CodeEditor.vue`, shared analysis RPC in
  `desktop-app/src/bun/desktopService.ts`, and UI tests under
  `desktop-app/tests/ui/`.

## In Scope

- Format the accepted function-body AST consistently with existing
  two-space indentation for nested braced blocks. Preserve strings,
  expression spelling, statement order, source text outside executable AMX
  blocks, line-ending behavior, and the established expression-body format.
- Verify formatter idempotence for direct/nested function blocks, nested
  statement if/else and statement for bodies, return statements, strings
  containing braces, CRLF, and whole documents with surrounding Markdown.
- Extend shared AST-derived highlighting facts through statement function
  bodies: function parameters/types, local declarations/types, assignments,
  if/for/return/list-operation keywords and expressions. Do not highlight
  narrative or inert fences.
- Provide accurate parameter-name and annotation source ranges. Current
  `FunctionParameterNode.source` and parameter annotation locations from
  Sprint 096 point to the function declaration start rather than each token.
  Prefer correcting those existing source anchors with focused parser tests;
  include the parser/test paths in the approved Sprint 099 file plan before
  editing them. An alternative header-range derivation must be demonstrably
  unambiguous and preserve UTF-16/CRLF behavior.
- Extend shared completion to expose only names visible at the cursor inside
  a function: parameters, source-order locals, active loop iterator, and
  approved visible functions/types/constants. Respect nested branch/loop
  scope and shadowing; exclude locals outside their lexical blocks and names
  declared later in the body.
- Extend shared symbol/navigation facts for function parameters and locals so
  definition/reference/rename behavior follows accepted lexical identity:
  nested shadow bindings are distinct, same-scope repeated `let` updates the
  same binding, and references resolve only to the visible declaration.
- Surface existing static parser/type diagnostics for function bodies through
  the current shared analysis path with original source positions. Preserve
  `AMX3006`, `AMX3001`, `AMX3002`, `AMXF4001`, `AMXF4002`, and expression
  diagnostic identities without reclassification.
- Update VS Code TextMate scopes for function declarations/parameters and
  statement-body syntax, while keeping Markdown/fence and string boundaries
  correct. Reuse shared facts/providers for completion, navigation,
  formatting, and diagnostics rather than duplicating language semantics.
- Update desktop CodeMirror integration only where needed to consume shared
  facts; add focused desktop UI coverage for highlighting, completion,
  formatting, navigation/outline, and a source-accurate function diagnostic.
- Add focused shared-service tests, VS Code Extension Development Host tests,
  and desktop Playwright tests for the accepted feature surface.

## Out of Scope

- Parser/AST/runtime/type-checker semantics or diagnostic allocation; these
  are accepted by Sprints 096-098.
- New AMX syntax, editor capabilities beyond formatter/highlighting/
  completion/navigation/diagnostics, new shortcuts, broad UX redesign, or
  unrelated preview/render/export changes.
- V0.16 language-spec publication, runnable example authoring, README/help
  discoverability, release/version changes, publication, or platform
  certification; Sprint 100/101 own those tasks.
- Changes to accepted Sprint 095-098 evidence or unrelated source/tests.

## Constraints and Gates

- Shared AST-derived services are the semantic source of truth. Do not
  separately parse function scope in VS Code and desktop.
- Preserve original-document positions, including executable-fence offsets,
  LF/CRLF, and UTF-16 columns. Do not fabricate diagnostic token widths when
  the diagnostic model provides only a point location.
- Do not use `FunctionParameterNode.source` as a parameter token location
  until the existing declaration-start anchoring is corrected or a verified
  exact header-range derivation is approved and tested.
- Completion must respect function-local visibility and lexical scope; do
  not offer caller/document bindings inside functions.
- Navigation must not merge shadowed locals or same-spelled parameters into
  one identity. Suppress ambiguous targets rather than fabricating
  definitions.
- Formatting must not change expression tokens or evaluation results; format
  executable AMX content only.
- TextMate grammar changes must be tested with the actual grammar tokenizer
  and must not leak AMX scopes into Markdown or inert fences.
- Desktop analysis is delivered through existing RPC/shared services. Avoid
  broad `CodeEditor.vue` changes if shared facts already supply the needed
  behavior.
- Run host/UI tests only after inspecting their build/output paths and
  preserving existing generated artifacts and test results.