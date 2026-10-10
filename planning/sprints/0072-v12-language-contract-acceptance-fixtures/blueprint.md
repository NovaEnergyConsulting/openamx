# Sprint 072 Blueprint: V0.12 Language Contract and Acceptance Fixtures

## Approach

1. Read the V0.12 master plan and current planning ledgers first. Inspect only the existing parser, diagnostics, formatter, module, and test patterns needed to express fixtures accurately. Preserve the distinction between confirmed product behavior and implementation detail.
2. Create three durable contract artifacts in this sprint folder:
   - `grammar-examples.md`: canonical valid and invalid source examples for each V0.12 feature, with expected parse/semantic outcome and any required formatted form.
   - `diagnostic-matrix.md`: stable case IDs for rejected forms, expected diagnostic category/code, exact primary source range, any relevant secondary range, and applicable module/context.
   - `requirement-test-matrix.md`: trace each master-plan requirement to the example/case IDs, expected result, and existing or intended test suite for its implementation sprint.
3. Make fixtures source-complete and independently understandable. Use executable `amx` fences where the language requires them; include the enclosing source needed to establish line/column positions and module visibility. Mark each example as expected-valid or expected-invalid.
4. Cover record inheritance, including multiple/transitive parents, inherited-property collisions, valid and invalid `override`, type/optionality/default replacement, complete child construction, unknown/forward/non-record/cyclic parents, module visibility, and rejection of child-to-parent assignment.
5. Cover enums, including implicit numeric values from 1, explicit all-number and all-string members, member/value uniqueness, empty or duplicate names, duplicate values, mixed types, partial explicit assignment, expression-valued members, primitive access results, source order, and module visibility.
6. Cover braced `if` expressions/statements, including expression `else` requirements, all-path explicit value returns, missing-return paths, return locality, optional statement `else`, branch-local declarations, persistent writes to outer bindings, nesting, Boolean conditions, branch type compatibility, selected-branch evaluation, and unchanged legacy conditional expressions.
7. Pin formatter behavior for each new form without proposing a formatter redesign. Require stable parse-format-parse behavior and idempotence where applicable; retain examples showing legacy formatting remains unchanged.
8. Map cases to the current test organization rather than creating a parallel test framework. Identify the owning implementation sprint (073, 074, or 075) and later integration/editor coverage (076-077) where relevant. The matrix is a contract and test plan; do not add expected-red feature tests to the normal suite in this sprint.
9. Review the artifacts against every relevant master-plan clause. Resolve editorial omissions directly; route any genuine semantic ambiguity or desired behavior change through `planning/questions.md` for a Lead Developer decision before downstream implementation relies on it.

## Files to Update

- `planning/sprints/0072-v12-language-contract-acceptance-fixtures/grammar-examples.md` (create)
- `planning/sprints/0072-v12-language-contract-acceptance-fixtures/diagnostic-matrix.md` (create)
- `planning/sprints/0072-v12-language-contract-acceptance-fixtures/requirement-test-matrix.md` (create)
- `planning/questions.md` only if a genuine unresolved product decision is discovered
- `planning/state.md` and `planning/decisions.md` with the completion status and any approved contract clarifications

## Risks and Stop Conditions

- If producing an exact grammar or expected outcome would contradict or extend the master plan, do not choose an interpretation silently. Record the alternatives and block the affected contract row pending decision.
- Do not assign speculative diagnostic codes/messages or source spans that are inconsistent with the established original-document UTF-16 location convention.
- Do not mark unimplemented runtime/editor behavior as verified. This sprint records expectations and fixture ownership only.
- Any unresolved question that affects Sprints 073-075 must be visible in the handoff and remains a dependency; downstream builders must not infer an answer.

## Notes

Sprint 072 establishes an implementation-ready acceptance contract. It does not implement V0.12 features, publish the language specification, authorize Sprints 073-077, or authorize release.
