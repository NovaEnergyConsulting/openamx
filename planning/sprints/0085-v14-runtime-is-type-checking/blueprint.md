# Sprint 085 Blueprint: V0.14 Runtime `is` Type Checking

## Approach

1. Obtain separate explicit Sprint 085 execution authorization and approval
   of the concrete source/test/evidence file plan. Record branch/worktree
   state and preserve all existing changes. Do not infer execution authority
   from Sprint 084's contract acceptance.
2. Read the V0.14 master plan, accepted Sprint 084 contract artifacts,
   Sprint 084 evidence/disposition, and relevant AST, parser, type-checker,
   declaration-registry, evaluator, enum, record, optional, Measurement, and
   source-range implementations. Use the existing architecture and helpers;
   do not create a parallel type system.
3. Trace how declarations are represented and resolved:
   - Identify type syntax and metadata already available for primitive,
     record, enum, list, optional, and dimension types.
   - Identify how imports and source ordering filter visible type references.
   - Identify runtime values for records, enums, nullable values, lists, and
     Measurements, including dimension vectors.
   - Record the approved files and seams in `builder-evidence.md` before
     implementation.
4. Implement the expression representation/parser:
   - Represent the RHS as the approved type reference, not an expression to
     evaluate at runtime.
   - Add `is` at the existing comparison precedence and preserve
     left-associative behavior with all same-tier operators.
   - Preserve target/operator source positions for parser, checker, and
     runtime errors.
   - Keep ordinary syntax and parse behavior unchanged when `is` is absent.
5. Implement type resolution/checking:
   - Resolve the simple target type and ordered `[]`/`?` suffixes through
     existing declaration and visibility rules.
   - Diagnose malformed syntax with `AMX3006` and the approved message;
     unknown, invisible, non-type, or forward targets use the approved
     `AMX3001` category/message.
   - Give valid `is` expressions Boolean type. Do not statically reject a
     well-formed expression merely because the left operand's known static
     type differs from the target; the result is a runtime predicate.
   - Do not narrow the operand in either branch. Verify `IS-NARROW-01`
     retains its approved `AMX3002` diagnostic.
6. Implement runtime predicate evaluation using resolved type metadata:
   - Primitive checks must distinguish Numbers from Measurement values,
     including zero-vector Measurements.
   - Records use recursive structural conformance with required/optional
     field rules and permit extra value fields.
   - Enums check the underlying primitive value against the resolved enum's
     declared members, including cross-enum shared-value matches.
   - Lists recursively check all values; empty lists succeed for any
     well-formed list element target.
   - Null matches optional targets only. Nested optional/list/record types
     follow their existing type suffix semantics.
   - Measurements compare dimension vectors only, not unit identity or
     scale.
   - Return Boolean false for every valid runtime non-match. Do not convert
     expected non-matches into exceptions or diagnostics.
7. Add fixture-driven tests. Cover parser shape/precedence, target resolution,
   static result typing/no narrowing, each runtime type family and edge case,
   and source positions. Assert the complete `IS-VALID-01` bindings and
   execute each negative fixture for the exact approved diagnostic.
8. Run focused tests first, then the core build. Run existing parser,
   evaluator, modules, editor/source-range, dimension, and Measurement
   regressions relevant to changed surfaces. Record exact commands and full
   outcomes; do not infer runtime correctness from TypeScript compilation.
9. Review for unauthorized scope, update Sprint 085 evidence and planning
   questions for any blocker, residual, or product decision, and submit the
   Builder recommendation. Sprint 086 remains a separate sprint and
   authorization gate.

## Files to Update

The exact files must be listed and approved before execution. Expected
implementation areas, subject to repository findings:

- `src/ast/types.ts`
- `src/parser/parseExpression.ts` and any minimal parser helper required for
  target-type syntax/source locations
- `src/typechecker/checkDocument.ts` and existing declaration/type metadata
  helpers only where necessary
- `src/runtime/evaluateExpression.ts` and existing runtime type/Measurement
  helpers only where necessary
- Focused existing/new tests under `tests/` for parser, checker, evaluator,
  imports, and Measurement/runtime source locations
- Sprint 085 `builder-evidence.md`
- `planning/decisions.md` and `planning/questions.md` for Sprint 085
  authorization, approved plan, evidence, and any separate disposition

No editor, language-specification, user example, standard-library math/text,
formatter, package, release, or unrelated production files are in the
default scope. If source inspection demonstrates another necessary file,
stop and obtain a narrow plan amendment before editing it.

## Verification

From the repository root, after implementation:

1. Run focused cases for the changed parser, evaluator, and relevant
   type-checker/module/Measurement behavior. The focused selection is expected
   to include existing suites such as `tests\parser.test.ts`,
   `tests\evaluator.test.ts`, `tests\modules.test.ts`,
   `tests\dimensions.test.ts`, `tests\measurements.test.ts`, and
   `tests\editor.test.ts`, plus any approved Sprint 085 test file.
2. Run `bun run build`.
3. Run additional core regressions if focused evidence reveals a changed
   shared surface; record the reason and exact selection. The complete root,
   extension, and desktop acceptance workflows remain Sprint 089 work unless
   an approved plan amendment requires them.
4. Use the exact source fixtures from
   `planning/sprints/0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md`.
   Verify approved values, exact diagnostic identity/message, original
   source coordinates, and LF/CRLF/non-BMP offset behavior.

Record initial failures and retries separately. Do not weaken assertions or
reinterpret a valid mismatch as a pass for an exceptional path.

## Notes

Sprint 085 implements only the runtime `is` feature. It does not implement
the functions or editor support in Sprints 086-088 and does not accept/close
V0.14.
