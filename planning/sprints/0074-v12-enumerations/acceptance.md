# Sprint 074 Acceptance Criteria

Sprint 074 is complete only when all enum fixtures and the approved V0.12 primitive/module semantics pass in the existing core test suites. Any unapproved or untested enum diagnostic category remains a blocker.

## Declarations and Values

- EN-V01 parses and evaluates an unvalued enum with numeric values starting at 1 in declaration order.
- EN-V02 and EN-V03 parse explicit all-Number and all-String literal enums; member access evaluates to the exact literal value.
- EN-V04 verifies an exported enum can be imported and referenced through an enum member in the consuming module.
- An enum with no members is rejected, per the Sprint 072 Lead Developer clarification.
- If any explicit member value appears, every member must have a literal value. Mixed Number/String values and expression-valued members are rejected.
- Member names are unique. Explicit member values are unique for both Number and String enums; EN-I03 covers a numeric duplicate and a supplemental focused case covers a string duplicate.
- An enum access is type-compatible with its underlying `Number` or `String` type and evaluates to that primitive. No distinct nominal enum type, enum coercion, or enum aliases are introduced.

## Visibility and Diagnostics

- EN-I08 rejects a forward enum reference using the established AMX3001 unknown-identifier category at the Sprint 072 source location.
- EN-I09 rejects access to a non-exported enum using the established AMX5002 missing-export category at the importing module's source location.
- EN-I07 remains malformed syntax with the established AMX3006 syntax-error category.
- Before implementing enum-specific diagnostics or exact-code assertions for EN-I01–EN-I06, the Lead Developer has approved their identities/messages and the allocation is recorded in `planning/decisions.md`.
- Invalid fixture diagnostics use the source coordinates and intended ranges in the Sprint 072 diagnostic matrix. If any allocation remains pending, the affected cases are marked BLOCKED and Sprint 074 is not reported complete.
- Enum declarations/references preserve existing source-order, import, and export rules; no private declarations become visible and no forward visibility is added.

## Tests and Scope

- Fixture-derived tests cover EN-V01–EN-V04 and EN-I01–EN-I09, plus duplicate String value rejection.
- Focused parser/evaluator/module suites pass; the root build passes; the full root suite is run and exact results are recorded against the Sprint 073 baseline.
- Changes are limited to enum declarations/member access and directly coupled type-checking, runtime, module, and test surfaces. Record inheritance remains intact.
- No editor-specific integration, formatter redesign, language specification, examples/help, release, or publication work is included.
- `builder-evidence.md` records changed files, approved diagnostic allocation, exact verification commands/results, full-suite residuals, and any blocked acceptance item.
