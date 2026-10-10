# Sprint 073 Blueprint: V0.12 Record Inheritance

## Approach

1. Confirm the Sprint 072 contract and current worktree. Read the existing record AST, statement parser, declaration/type-checking flow, runtime record construction/validation, module loader, input/output schema paths, and focused tests before editing.
2. Obtain the required diagnostic-catalog decision for RI-I01, RI-I02, RI-I03, and RI-I07 before implementing those diagnostics or exact-code assertions. Keep approved existing identities unchanged for RI-I04–RI-I06 and RI-I08–RI-I10.
3. Extend the existing record AST and parser for `type Child extends ParentA, ParentB { ... }` and field `override`. Retain source locations for parent references, override markers, and field declarations. Preserve all current record declarations and field syntax.
4. Resolve each parent from the type environment available at the declaration point. Respect source-order visibility and imported/exported declarations. Validate that each parent is a record and detect cycles without allowing forward references as a fallback.
5. Build the child's effective fields in the approved order: parents in declared order, each parent's effective fields in order, first field occurrence fixes the position, an override replaces that field in place, and child-only fields append in declaration order. Compose transitively and avoid duplicate effective slots.
6. Enforce override rules before consumers rely on the effective declaration:
   - A collision among inherited names requires an explicit child override, even when types are identical.
   - A child redeclaration of an inherited name requires `override`.
   - `override` with no inherited field is invalid.
   - A valid override replaces annotation, optionality, and default as one complete field contract.
7. Keep child and parent types distinct. Check constructors and assignments using the child's effective fields; reject child-to-parent assignment. Ensure runtime construction, missing/unknown-field validation, and record input/output/schema paths consume the same effective set and order.
8. Preserve declaring-module metadata for inherited fields and default expressions. In particular, ensure imported field annotations/defaults continue to resolve through the declaration's existing dimension/unit registry rather than the child's registry.
9. Add fixture-derived tests in existing suites:
   - `tests/parser.test.ts` for grammar, source locations, and parse rejection.
   - `tests/evaluator.test.ts` for effective typing, construction, defaults/optionality, and non-subtyping.
   - `tests/modules.test.ts` for imported/exported parents, private parents, source order, and transitive module behavior.
   - `tests/inputData.test.ts`, `tests/outputData.test.ts`, and `tests/dimensions.test.ts` only for directly affected effective-field/schema/registry behavior.
10. Run the focused suites and root build first, then the root test suite. Record exact commands/results and distinguish inherited failures from regressions. Do not start editor or documentation integration work.

## Files to Update

- AST and parser: `src/ast/types.ts`, `src/parser/parseStatements.ts`
- Type checking and field provenance: `src/typechecker/checkDocument.ts`, and `src/typechecker/declarationRegistry.ts` only if required
- Runtime and modules: `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts`
- Existing record consumers only as needed: `src/runtime/inputData.ts`, `src/runtime/outputData.ts`
- Focused tests in the existing parser, evaluator, module, input-data, output-data, and dimensions suites
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` only for accurate execution status, approved diagnostic allocation, or a newly discovered decision
- A Sprint 073 `builder-evidence.md` with exact changes, tests, results, and residuals

Do not edit VS Code/desktop editor behavior, language specifications, examples, dependency manifests, or unrelated runtime surfaces.

## Risks and Stop Conditions

- If the implementation needs semantics beyond the approved inheritance fixtures, stop and request a Lead Developer decision; do not add behavior based on convenience.
- If diagnostic approval is unavailable, do not invent/reuse codes for the four unallocated categories. Mark those cases and dependent acceptance as blocked.
- If composing declarations loses the original field's module/measurement context, stop and preserve that provenance before proceeding to acceptance.
- If constructor/type-checking and runtime/input/output validation compute different effective fields or order, the feature is not complete.
- Any proposal to make child records assignable to parents, weaken collision/override rules, or ignore forward/cyclic references is out of scope and requires a product decision.
- Do not claim editor, formatter integration, language-specification, or release readiness from this sprint.

## Verification

1. `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\modules.test.ts tests\\inputData.test.ts tests\\outputData.test.ts tests\\dimensions.test.ts`
2. `bun run build`
3. `bun test`

Record each command's exact outcome. Full-suite failures are not relabeled as passes based on focused runs.
