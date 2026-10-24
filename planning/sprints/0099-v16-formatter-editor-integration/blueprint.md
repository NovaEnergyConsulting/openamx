# Sprint 099 Blueprint: V0.16 Formatter and Editor Integration

## Approach

1. Obtain separate Sprint 099 execution authorization and approval of the
   exact source/test/host/evidence path plan. Record branch/worktree state and
   preserve all accepted sprint evidence, generated output, and unrelated
   changes.
2. Read the accepted Sprint 095-098 records. Treat the statement-body AST,
   return/scope semantics, and diagnostic identities as fixed. No product
   behavior choices are reopened in this sprint.
3. Start with formatter tests. `formatAmx` already uses parser output and
   indentation from braces; verify its behavior on accepted function bodies
   before changing it. Add only the parser-aware handling needed for stable
   function indentation, strings, and body boundaries. Preserve the current
   token/text spelling strategy.
4. Extend `editorHighlightFacts` to visit the statement-body variant and walk
   parameter/type references plus nested statements in source order. Reuse
   existing expression/statement visitors. Add token facts only when backed
   by parser source locations.
  Sprint 096 currently assigns the function declaration's start to each
  `FunctionParameterNode.source` and annotation source. Before emitting
  parameter/type facts, correct the existing fields to exact token starts
  with focused parser tests (include parser files in the separately approved
  path plan), or obtain approval for a tested exact header-range derivation.
5. Extend `editorCompletionFacts`/`visibleSymbols` with a function-body
   lexical scope at the cursor:
   - parameters are visible throughout the body;
   - declarations become visible in source order;
   - nested branches/loops contribute only while the cursor is inside that
     block;
   - loop iterators are visible only within their loop;
   - nested shadows override the outer name only inside that scope;
   - a same-scope repeated `let` updates the current binding and does not
     create a second identity;
   - caller/document bindings are not captured into a function.
   Do not offer a declaration occurring after the cursor or outside the active
   lexical block.
6. Extend `editorSymbolFacts` to create stable declarations and resolved
   references for function parameters/locals and traverse all statement-body
   expressions. Track scope stacks or cloned visible maps so shadowed names
   are distinct and assignments/uses bind to the nearest visible identity.
   Ensure declaration ranges use exact AST source data rather than line-text
   guesses when available.
7. Update VS Code TextMate grammar narrowly for function parameter names,
   type annotations, and brace-delimited function body tokenization. Keep
   existing global AMX keyword and string rules; test actual token scopes and
   Markdown boundary behavior in `providers.host.ts`.
8. Reuse shared services in VS Code/desktop. Add host tests for provider
   formatting, completion in function scope, navigation/rename of parameter
   and local symbols, and an `AMXF4001` diagnostic. Add a desktop UI test
   similar to the V0.14 language-editor acceptance for highlighting,
   completion, format idempotence, outline/navigation, and diagnostic
   underlining.
9. Add one focused shared test slice in `tests/editor.test.ts` and extend
   `tests/formatter.test.ts`. Prefer reusing current test files; add a file
   only if the approved host-test organization requires it.
10. Run focused root tests, VS Code Extension Development Host tests, and
    desktop UI tests. Record exact commands and raw outcomes in
    `builder-evidence.md`; note unavailable host/platform checks rather than
    inferring success.

## Shared Symbol Model

The intended editor behavior follows the accepted language scope:

- A parameter declaration has a definition target within the function
  declaration. Uses resolve to that target until a nested binding shadows it.
- A local declaration has a definition target at its name token. Its
  references inside the visible lexical region resolve to that target.
- A nested `let` with the same spelling creates a distinct identity; after
  the block closes, the prior identity becomes visible again.
- Repeated `let` in the same scope updates the existing binding identity
  according to the accepted contract; do not make rename edit it as a second
  independent declaration.
- Assignment targets, compound assignments, and add/remove list targets are
  references to the current visible binding.
- Function body symbols are local to the body and do not appear as module
  declarations or leak into completions outside the function.

If the existing symbol-fact API cannot represent a lexical parent/scope
without breaking host assumptions, keep the existing identity contract and
extend it minimally; do not redesign all symbols in this sprint.

## Diagnostic/Source Mapping

- Shared analysis should surface checker/parser diagnostics already emitted
  by the accepted parser/checker.
- `AMXF4001` points at the closing function brace; `AMX3002` points at the
  incompatible return expression; parser errors use their accepted token or
  opening-brace anchors.
- Shared services retain original document offsets through fences and CRLF.
- VS Code diagnostics use the actual source point. Desktop diagnostic
  decoration retains its current point/one-character presentation; do not
  claim full token-range mapping when the RPC diagnostic has only line/column.

## Expected Files and Surfaces

- Shared: `src/formatter/formatAmx.ts`, `src/editor/highlighting.ts`,
  `src/editor/completion.ts`, `src/editor/symbols.ts`, and source range
  helpers only if required. If exact parameter anchors are corrected, include
  `src/parser/parseStatements.ts` in the approved plan.
- Shared tests: `tests/formatter.test.ts`, `tests/editor.test.ts`; if parser
  parameter anchors are corrected, also include `tests/parser.test.ts`.
- VS Code: `vscode-extension/amx.tmGrammar.json`, relevant providers only if
  an integration defect is shown, and `vscode-extension/src/test/providers.host.ts`.
- Desktop: `desktop-app/src/mainview/CodeEditor.vue` and/or
  `desktop-app/src/bun/desktopService.ts` only if shared-fact wiring requires
  a change; focused new `desktop-app/tests/ui/v16-language-editor.pw.ts` or
  existing equivalent.
- Do not edit unrelated runtime, parser, type-checker, README, docs, examples,
  release, or package metadata.

## Verification

- Root: `bun test tests/formatter.test.ts tests/editor.test.ts`.
- VS Code: from `vscode-extension/`, `bun run test` (compile, compile tests,
  then Extension Development Host suite; inspect its artifact/download
  behavior before execution).
- Desktop: from `desktop-app/`, run the focused Playwright spec, e.g.
  `bun run test:ui -- tests/ui/v16-language-editor.pw.ts`; run `bun run
  typecheck` if approved and preserve all build outputs. Record existing
  blockers exactly rather than changing unrelated test contracts.
- Final: `bunx tsc --noEmit` at root, scoped whitespace checks, and final
  changed-path review.

## Notes

Sprint 099 depends on Sprints 096 and 098, both accepted. Sprint 100 owns
author-facing specification/examples and Sprint 101 owns integrated closeout.