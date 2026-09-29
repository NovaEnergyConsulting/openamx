# Sprint 014 Blueprint: Structure AST, Runtime Values, and Static Type Checker

## Approach

- Extend the AST before parser/runtime changes: represent V0.3 type references and declarations independently of TypeScript runtime types, retain node locations, and preserve V0.2 unions as compatible subtypes.
- Extend statement parsing for multiline record declarations and annotated `let`; extend Pratt parsing for `null`, record construction, and member access without changing V0.2 precedence.
- Add a focused type-checker module with its own type environment and a public document-check entry point. Traverse executable blocks in established source order before evaluation.
- Model primitive, nominal record, list, nullable, and null types explicitly. Enforce the contract's only widening rule: non-null `T` to `T?`, recursively for list elements.
- Materialize record values through declared fields rather than exposing constructor-object order. Copy defaults for each construction and reject unknown, duplicate, missing, or null-incompatible fields.
- Place the checker at the existing document-evaluation boundary so both `run` and rendering reject activated V0.3 documents before any block is evaluated. Keep the V0.2-only path unchanged.
- Test static and runtime record behavior separately, then test activated-V0.3 and untouched-V0.2 documents through existing public APIs.

## Files to Update

- `docs/language-spec-v0.3.md` only for factual correction/approved clarification
- `src/ast/types.ts`
- `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`, and narrowly needed parser helpers
- `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and narrowly needed runtime value support
- `src/typechecker/` or an equivalently focused new checker module
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, and focused checker tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

## Notes

- Sprint 014 parses only record/type forms. Do not parse deferred function/module/input/export syntax merely for future convenience.
- DateTime is type-checked contextually from its RFC 3339 string form; no date arithmetic, ordering, input files, or serialization is included.
- In activated documents, V0.2 logical truthiness is intentionally rejected by the checker; in V0.2-only documents it remains unchanged for compatibility.
- Unknown functions remain static errors in an activated document except the existing typed standard library. User functions are Sprint 015.
