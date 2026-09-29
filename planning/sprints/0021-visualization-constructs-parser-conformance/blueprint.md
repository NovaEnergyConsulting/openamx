# Sprint 021 Blueprint: Visualization Constructs and Parser Conformance

## Approach

- Verify the Sprint 020 entry gate first. Start with one small parser and checker fixture for a typed `RecordType[]` table and one `show`; make the first substantive edit in the owning AST/parser slice and run a focused failing/behavior test immediately.
- Add located table/chart option nodes, view declarations, and `show` to the existing statement unions. Parse braced option lines within exact `amx` fences; retain precise original-document coordinates and existing statement/source ordering. Do not extend V0.3 expression grammar more broadly than the contracted visualization forms.
- Extend the existing checker activation and module-graph entry path. Track view names beside other declarations without leaking them as exported values; check source binding visibility, option cardinality, supported declared list types and direct field roles, and entry-module/top-level restrictions. Ensure failures occur before input reads and evaluation.
- Represent checked view definitions separately from ordinary AMX bindings where practical. At `show`, read the current typed list and capture an immutable ordered data snapshot associated with that executable fence and show position. Keep `evaluateDocument`'s plain-object result stable; provide an internal analysis/emission result usable by Sprint 022's renderer. Validate dynamic label/value lengths before preparing any output.
- Correct the match-arm brace scanner in `src/parser/parseExpression.ts` so a direct record constructor is parsed as the arm expression rather than prematurely ending `match`. Add a positive parser and activated-checker case and assert the existing first-match/lazy branch rules still hold.
- Grow table/chart tests in the same ownership boundaries: all four kinds, valid scalar/record lists, multiple series/grouping, empty and nullable numeric data, first-seen/input order, duplicate/missing/unknown names and fields, unsupported data, line/scatter axis rules, source coordinates, multiple shows and later mutation, imported type/value visibility, and invalid-input no-write behavior. Compare V0.2/V0.3 paths with existing tests.
- Update planning records with evidence and any contract clarification. Hand off to Sprint 022 only an ordered, checked set of view emissions; no production visualization markup or editor provider changes in this sprint.

## Files to Update

- `src/ast/types.ts`
- `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`, and only necessary parser helpers
- `src/typechecker/checkDocument.ts`
- `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts`, and narrowly necessary runtime support for checked emissions
- `src/diagnostics/errors.ts` only if existing AMX300x helpers need extension
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/modules.test.ts`, and focused checker/loader tests as needed
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `docs/language-spec-v0.4.md` only for approved clarifications, not a redesign

## Notes

The existing renderer already performs its own execution pass; preserve its behavior for V0.3 documents while exposing an ordered emission result for Sprint 022 to consume. Do not emit placeholder HTML or silently drop `show` statements. Static type checking cannot know the length of input-mapped lists; the equal-length labels rule needs a runtime barrier. Keep the visual representation independent of chart library selection.
