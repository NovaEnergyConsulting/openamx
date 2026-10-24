# Sprint 099 Formatter and Editor Test Matrix

## Status and Authority

This matrix maps the accepted Sprint 095 function contract and the V0.16
master-plan authoring requirements to Sprint 099 tests. Sprint 096, 097, and
098 are accepted. Sprint 099 implementation still requires separate
execution authorization and an approved file plan.

## Formatter Cases

| Case ID | Source/fixture | Expected outcome | Test surface |
| --- | --- | --- | --- |
| `FMT099-FN-01` | `V16-FN-EXPR-01` | Expression body retains existing output and expression spelling. | `tests/formatter.test.ts` |
| `FMT099-FN-02` | `V16-FN-FLOW-01` | Function, if/else, return indentation canonical; second pass identical. | `tests/formatter.test.ts` |
| `FMT099-FN-03` | `V16-FN-FLOW-04/06` | Nested statement-if and loop indentation canonical. | `tests/formatter.test.ts` |
| `FMT099-FN-04` | Strings with `{`, `}`, interpolation, and escaped quotes inside function body | String contents unchanged; braces do not shift later indentation. | `tests/formatter.test.ts` |
| `FMT099-FN-05` | Full Markdown document with multiple `amx` blocks and an inert fence | Only executable AMX content changes; line endings/fences/narrative preserved. | `tests/formatter.test.ts`; VS Code host |
| `FMT099-FN-06` | Accepted valid runtime fixture before/after formatting | Parse/check/evaluation result is unchanged. | `tests/formatter.test.ts` |

## Shared Highlighting and Completion

| Case ID | Source shape | Expected facts | Test surface |
| --- | --- | --- | --- |
| `ED099-HL-01` | Braced function with typed parameters and return type | `fn` keyword, function name, parameter declaration, parameter type, result type receive correct fact kinds/ranges. | `tests/editor.test.ts` |
| `ED099-HL-04` | Function with multiple parameters/types, CRLF, and a non-BMP prefix | Each parameter and annotation fact covers only its exact token at the original document offset. | `tests/parser.test.ts`, `tests/editor.test.ts` |
| `ED099-HL-02` | Nested local, assignment, `+=`, if/for, return, add/remove | Keywords/declarations/references and expression tokens are parser-derived. | `tests/editor.test.ts` |
| `ED099-HL-03` | Narrative and inert fence containing same keywords | No function-body facts leak outside executable blocks. | `tests/editor.test.ts` |
| `ED099-COMP-01` | Cursor in function header/body | Parameters visible throughout body; locals visible after declaration only. | `tests/editor.test.ts` |
| `ED099-COMP-02` | Cursor in nested branch and after branch | Shadowed local visible inside its block; outer binding restored after; branch-only name absent outside. | `tests/editor.test.ts` |
| `ED099-COMP-03` | Cursor inside statement loop | Iterator visible only in loop; loop-only local absent after loop. | `tests/editor.test.ts` |
| `ED099-COMP-04` | Cursor in function body with same-spelled document binding | Caller/document binding is not captured; function parameter/local scope is authoritative. | `tests/editor.test.ts` |
| `ED099-COMP-05` | Cursor before a later local declaration | Later local is not offered. | `tests/editor.test.ts` |

## Shared Navigation and Diagnostics

| Case ID | Source shape | Expected outcome | Test surface |
| --- | --- | --- | --- |
| `ED099-SYM-01` | Parameter declaration and use | Definition target resolves to the parameter; references share one identity. | `tests/editor.test.ts` |
| `ED099-SYM-02` | Outer parameter and nested same-name local | Inner use resolves to local; post-block use resolves to parameter; rename sets stay separate. | `tests/editor.test.ts` |
| `ED099-SYM-03` | Same-scope repeated `let` and assignments | Follow accepted update identity; assignments/reference facts resolve to current binding. | `tests/editor.test.ts` |
| `ED099-SYM-04` | Loop iterator shadow/restoration | Loop-body references bind to iterator; after-loop references bind to prior name. | `tests/editor.test.ts` |
| `ED099-DIAG-01` | `V16-FN-FLOW-02` missing return | `AMXF4001` at closing brace, with document/fence and LF/CRLF mapping intact. | `tests/editor.test.ts` |
| `ED099-DIAG-02` | `V16-FN-FLOW-08` incompatible return | `AMX3002` at the return expression. | `tests/editor.test.ts` |
| `ED099-DIAG-03` | `V16-FN-PARSE-03` prohibited statement | Accepted `AMX3006` is preserved at the prohibited keyword. | `tests/editor.test.ts` |

## VS Code Host Cases

| Case ID | Host assertion | Expected outcome | Existing host file |
| --- | --- | --- | --- |
| `VS099-GRAMMAR-01` | Tokenize braced function, parameters/types, nested return/if/for, and quoted brace strings with actual TextMate grammar. | Expected scopes on source tokens; no scope leak into narrative/inert fences. | `vscode-extension/src/test/providers.host.ts` |
| `VS099-COMP-01` | Request completion inside a valid function body. | Parameters, preceding locals, active iterator visible; out-of-scope names absent. | `providers.host.ts` |
| `VS099-NAV-01` | Definition/hover/references/rename on parameter and shadowed local. | Correct nearest lexical identity and source ranges. | `providers.host.ts` |
| `VS099-FMT-01` | Format a document containing both function forms. | Canonical output; second format returns no edits; surrounding content unchanged. | `providers.host.ts` |
| `VS099-DIAG-01` | Open missing-return and incompatible-return documents. | Exact diagnostic codes and original document positions. | `providers.host.ts` |

## Desktop UI Cases

| Case ID | User-facing check | Expected outcome | Proposed test |
| --- | --- | --- | --- |
| `DA099-HL-01` | Open a valid document with expression and statement functions. | Parameter/local/return tokens show shared classes; no diagnostics on valid source. | `desktop-app/tests/ui/v16-language-editor.pw.ts` |
| `DA099-COMP-01` | Trigger completion at a parameter/local cursor. | Scoped names shown in CodeMirror autocomplete; out-of-scope branch local absent. | Same |
| `DA099-FMT-01` | Invoke existing Format command twice. | First pass canonicalizes nested body; second pass leaves text unchanged. | Same |
| `DA099-NAV-01` | Use existing definition/reference/rename affordances on a local parameter/shadow. | Navigation and reference set target the correct lexical symbol. | Same or a focused existing editor UI test |
| `DA099-DIAG-01` | Load a missing-return function. | `AMXF4001` appears at closing brace; underlining matches current diagnostic point model. | Same |

## Compatibility and Execution Notes

- Keep existing V0.2-V0.14 shared editor, grammar, formatter, provider, and
  desktop editor tests in the focused regression gate.
- Prefer direct assertions over screenshots for scopes/ranges/results;
  capture screenshots only when needed to diagnose visible integration.
- VS Code host validation uses `bun run test` in `vscode-extension/` and the
  actual TextMate tokenizer test. Desktop validation uses the focused
  Playwright file under `desktop-app/`.
- Record unavailable or failing host checks as residuals; do not change
  unrelated security/RPC assertions to force green results.