# Sprint 074 Requirements: V0.12 Enumerations

## Goal

Implement the V0.12 enumeration contract in the Sprint 072 fixtures: declarations, member access, implicit numeric values, explicit literal validation, uniqueness checks, primitive runtime values, and source-order/module behavior.

## Dependencies and Entry Gates

- Sprint 072 Builder execution is recorded complete. Its enum grammar examples, diagnostic matrix, and requirement-to-test matrix are the acceptance contract.
- Sprint 073 Builder execution is recorded complete. Preserve its record-inheritance behavior and the current full-root-suite residuals when comparing validation results.
- Before implementing enum-specific diagnostics or exact-code assertions for EN-I01–EN-I06, obtain Lead Developer approval of their diagnostic identities/messages. These remain unallocated in Sprint 072. Do not guess a code/message or broaden an existing category. Other implementation work may proceed, but the affected diagnostics and sprint acceptance remain blocked until approved.
- Obtain explicit Sprint 074 execution authorization and approval of the concrete file-by-file plan before code or test edits.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 072 `requirements.md`, `acceptance.md`, `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`
- Sprint 073 implementation and `builder-evidence.md`, for regression context only
- Existing AST/parser, expression/type-checker, runtime, module, and diagnostic conventions
- Existing parser, evaluator, module, and related focused test suites

## In Scope

- Parse enum declarations and member definitions using the canonical `enum Name = { ... }` grammar.
- Assign implicit numeric values beginning at 1, in declaration order, only when no member has an explicit value.
- When any member has an explicit value, require every member to have a literal value and require all values in that enum to be homogeneous: all `Number` literals or all `String` literals. Reject constant expressions.
- Reject empty enums, duplicate member names, and duplicate values as specified by the approved Sprint 072 clarification and fixture contract.
- Resolve `EnumName.Member` access to the corresponding underlying primitive `Number` or `String`; do not introduce a distinct nominal enum type.
- Preserve source-order visibility and existing import/export semantics for enum declarations and member references.
- Add fixture-derived executable tests for EN-V01–EN-V04 and EN-I01–EN-I09. Add a focused string-valued duplicate-value case alongside numeric EN-I03 so uniqueness is verified for both supported primitive types.

## Out of Scope

- Record inheritance and braced `if` expressions/statements (Sprints 073 and 075).
- Enum aliases, flags, mixed primitive values, partially implicit values, expression-valued members, implicit numeric values in an explicitly valued enum, or a nominal enum type.
- Editor-specific grammar/highlighting/completion/navigation work, V0.12 language specification, examples, and editor help (Sprint 076).
- Formatter redesign or unrelated formatting behavior; formatter/editor integration remains Sprint 076 scope.
- New test infrastructure, unrelated runtime or module changes, release engineering, release, or publication.

## Constraints

- The V0.12 master plan and Sprint 072 fixtures are the semantic authority. The rejection of an empty enum is the approved Sprint 072 Lead Developer clarification recorded in `planning/decisions.md`.
- Preserve source-order visibility, import/export boundaries, and existing diagnostic source-coordinate conventions.
- New enum diagnostic identities/messages for EN-I01–EN-I06 require explicit approval before implementation. Keep AMX3006 for malformed syntax (EN-I07), AMX3001 for the established unknown-identifier category (EN-I08), and AMX5002 for the established missing-export category (EN-I09).
- Enum access returns the declared/implicit primitive value and participates in existing `String`/`Number` type checking exactly as a primitive value. Do not add a nominal enum type or implicit coercions.
- Keep changes surgical and confined to enum declaration/member semantics and directly coupled runtime/module/test surfaces.
