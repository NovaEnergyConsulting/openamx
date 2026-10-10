# Sprint 073 Requirements: V0.12 Record Inheritance

## Goal

Implement record inheritance from the approved Sprint 072 fixtures: resolve one or more visible record parents, compose effective fields deterministically, enforce strict `override` rules, and make child construction and existing record validation use the child's complete effective field contract.

## Dependencies and Entry Gates

- Sprint 072 Builder execution is recorded complete. Use its grammar examples, diagnostic matrix, and requirement-to-test matrix as the acceptance contract.
- Before implementing the new inheritance diagnostics or exact-code assertions for RI-I01, RI-I02, RI-I03, and RI-I07, obtain Lead Developer approval of their diagnostic identities/messages. These remain unallocated in Sprint 072. Do not guess a code/message or broaden an existing diagnostic category. Other work may proceed, but the affected diagnostics and the sprint acceptance gate remain blocked until approved.
- Obtain explicit Sprint 073 execution authorization and approval of the concrete file-by-file plan before code or test edits.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 072 `requirements.md`, `acceptance.md`, `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`
- Existing AST/parser/type-checker/runtime/module/data validation and formatter conventions
- Existing parser, evaluator, module, input-data, output-data, and dimension tests

## In Scope

- Parse and represent record parent lists and field-level `override` markers while preserving source locations and existing record syntax.
- Resolve parent names against declarations visible at that point in the source or through valid imports/exports. Accept only record parents; reject unknown, forward, non-record, and cyclic parent references.
- Compose inherited fields transitively and from multiple parents. Require an explicit child `override` for every inherited-name collision, including same-type collisions; require it for every child redeclaration of an inherited field; reject an `override` with no inherited target.
- Treat an override as the child's complete field contract: its annotation, optionality, and default behavior replace the inherited field definition.
- Use this deterministic effective-field order: visit parents in declared order and each parent's effective fields in their established order; the first occurrence of a field name fixes its position; a valid child override replaces the field at that position; append child-only fields in child declaration order.
- Preserve record non-subtyping: an instance of a child type is not assignable to a parent type.
- Use the effective fields consistently for constructor checking/evaluation, runtime record validation, and existing record-based input/output/schema paths where they consume declaration fields.
- Preserve declaration-origin context needed for inherited annotations/default expressions, including imported declarations and their existing dimension/unit registry behavior.
- Add fixture-derived executable tests in the existing test suites for all RI-V and RI-I cases, plus tightly coupled regressions for effective-field ordering and existing record consumers.

## Out of Scope

- Enums and braced `if` expressions/statements (Sprints 074 and 075).
- Record subtyping, parent-typed assignment, methods/traits, general scope redesign, or changes to unrelated type assignability.
- Editor-specific grammar/highlighting/completion/navigation work, V0.12 language specification, examples, and editor help (Sprint 076).
- Formatter redesign or unrelated formatting behavior; preserve current formatting contracts and defer new editor/formatter integration to Sprint 076.
- New test infrastructure, unrelated runtime or data-format changes, release engineering, release, or publication.

## Constraints

- The V0.12 master plan, Sprint 072 fixtures, and approved decisions are the contract. Do not infer subtyping or silently change visibility/source-order rules.
- Multiple parents must be deterministic and follow the approved effective-field ordering above; a child override replaces metadata without moving the inherited field's slot.
- Preserve existing required/optional/default validation behavior, field declaration provenance, module boundaries, and diagnostic source coordinates.
- New inheritance diagnostic identities/messages for RI-I01/I02/I03/I07 require explicit approval before implementation. If unavailable, record the exact blocked cases and do not claim the sprint complete.
- Keep changes surgical and confined to the feature, directly coupled record consumers, and focused tests.
