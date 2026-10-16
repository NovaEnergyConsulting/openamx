# Sprint 085 Requirements: V0.14 Runtime `is` Type Checking

## Status and Authority

Sprint 085 implements the accepted runtime `is` contract from Sprint 084.
Sprint 084's contract disposition is ACCEPTED, but this preparation does not
authorize Sprint 085 execution. Obtain separate execution authorization and
approval of the concrete file-by-file implementation/evidence plan before
changing production code, tests, or other files.

The behavior authority is the V0.14 master plan and the accepted Sprint 084
contract artifacts:

- [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md)
- Sprint 084
  [`grammar-examples.md`](../0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md)
- Sprint 084
  [`diagnostic-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/diagnostic-matrix.md)
- Sprint 084
  [`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
- Sprint 084
  [`builder-evidence.md`](../0084-v14-language-contract-and-acceptance-fixtures/builder-evidence.md)

The Sprint 084 contract is accepted; its V0.14 runtime and parser behavior
were NOT RUN. Current implementation behavior is not a substitute for the
approved fixtures.

## Goal

Implement `value is TargetType` as an AMX Boolean expression. Parse and
resolve the approved type-reference target, statically validate the target
reference without narrowing the tested value, and evaluate the predicate
against runtime values for primitive, structural record, enum, list,
optional/null, and dimension/Measurement targets. Deliver fixture-driven
diagnostics, focused tests, and regression evidence.

## In Scope

- Extend the AST and expression parser with the approved `is` operator and a
  type-reference target, preserving source locations and the type-reference
  distinction from an ordinary runtime expression.
- Use the existing target syntax: one visible simple type name followed by
  the existing `[]` and `?` suffixes in their declared order. Do not add
  qualified type names or new type notation.
- Implement the approved precedence and associativity:
  - `is` shares the existing comparison precedence tier.
  - It binds below arithmetic and Measurement conversion `in`, and above
    logical `and`/`or` and conditional expressions.
  - Same-tier comparisons and `is` chains parse left-associatively and use
    ordinary type checking; do not add a special chain syntax or diagnostic.
- Resolve target type references using existing source-order, declaration,
  and import visibility rules. Invalid/unresolved targets produce the
  approved diagnostic, not a runtime `false`.
- Type every valid `is` expression as Boolean while retaining the tested
  operand's ordinary static type. A valid target/value mismatch is a runtime
  `false`, not a static incompatibility error.
- Implement runtime checks for:
  - Existing primitive AMX values.
  - Structural records: all required target fields are present and
    recursively conform; additional value fields are allowed; optional
    target fields may be absent; a present field must conform to its
    declared type.
  - Enums represented by their underlying primitive values: membership in
    the target enum's declared values, including matching values shared by
    distinct enums; no nominal enum identity.
  - Lists and nested lists by recursively checking every element; an empty
    list matches any target element type.
  - Optional/null targets: `null` matches an optional target and not its
    non-optional underlying type. Preserve the difference between optional
    field presence (`field?: T`) and nullable field type (`T?`).
  - Dimension/Measurement types by physical dimension vectors, independent
    of unit scale or unit name. A Number remains distinct from a Measurement
    with an empty dimension vector.
- Emit approved diagnostic identities/messages and source locations for
  malformed targets, unknown or invisible target types, invalid suffixes,
  and any ordinary type-checking failure in a same-precedence chain.
- Add focused parser, type-checker, evaluator, and compatibility tests using
  the complete Sprint 084 fixtures and all approved expected bindings.
- Record exact commands, aggregate test results, source ranges, failures,
  residuals, and any required follow-up in `builder-evidence.md`.

## Out of Scope

- Mathematical functions/constants, Measurement-aware standard-library
  extensions, text functions, numeric `format`, or their diagnostics; these
  are owned by Sprint 086 and Sprint 087.
- Flow-sensitive type narrowing or any change to the tested value's static
  type in either branch of a conditional.
- Nominal enum tagging, generated/runtime type identities that alter current
  enum representation, coercion, or changed enum semantics.
- New type syntax, qualified type references, implicit conversions, or
  changes to declaration/import visibility rules.
- VS Code or desktop editor feature integration, user-facing specification
  publication, examples, or release work; editor/docs/examples integration
  belongs to Sprint 088.
- Unrelated parser/type-checker/runtime refactors or cleanup.
- Dependency/package/version changes, release, publication, or platform
  certification.

## Constraints and Gates

- Preserve all accepted Sprint 084 semantics exactly. Any required departure
  must stop affected implementation and request a product decision; do not
  silently reduce or alter the contract.
- A known target with a runtime mismatch must return `false`. Unknown,
  invisible, malformed, or invalid target types must be diagnosed.
- A value that does not statically conform to the target is not grounds to
  reject a valid `is` expression; the operation is a runtime predicate.
- Do not infer a narrowing guarantee from a true predicate. The nullable
  `IS-NARROW-01` case must continue to fail ordinary use requiring a
  non-nullable type inside the true branch.
- Reuse existing code structure and diagnostic categories only as approved
  by Sprint 084. In particular, preserve exact syntax/unknown-type/type
  diagnostic messages and the new operator's locations.
- Locations refer to the complete original document: 1-based line/column,
  UTF-16 code-unit columns, exclusive ends, and LF/CRLF-correct editor
  mapping.
- Start only after separate Sprint 085 execution authorization and
  file-by-file plan approval. Keep changes within that approved plan.
