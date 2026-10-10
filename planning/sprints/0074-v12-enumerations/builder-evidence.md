# Sprint 074 Builder Evidence: V0.12 Enumerations

## Authorization and Diagnostic Allocation

The Lead Developer explicitly authorized Sprint 074 and approved the file-by-file implementation plan before code or test edits. The Lead Developer approved diagnostic identities and exact messages for EN-I01-EN-I06; the allocation is recorded in `planning/decisions.md`.

| Fixture | Diagnostic | Approved message |
|---|---|---|
| EN-I01 | AMX3015 | `Enums need at least one value` |
| EN-I02 | AMX3016 | `Enum members names have to be unique` |
| EN-I03 | AMX3017 | `All enum members must have unique values` |
| EN-I04 | AMX3018 | `Enum members should all have the same value types, all Number or String` |
| EN-I05 | AMX3019 | `All members should have explicitly assigned values` |
| EN-I06 | AMX3020 | `Only constant values can be assigned to enum members` |

AMX3017 is also tested for a duplicate String value. Existing identities are retained for EN-I07 (AMX3006), EN-I08 (AMX3001), and EN-I09 (AMX5002).

## Files Changed

- `src/ast/types.ts` — enum declaration/member AST nodes and resolved primitive values.
- `src/parser/parseStatements.ts` — enum declaration/member parsing, export syntax, and token locations.
- `src/diagnostics/errors.ts` — type-safe support for approved AMX3015-AMX3020 identities.
- `src/typechecker/checkDocument.ts` — source-order enum registration, approved validation diagnostics, primitive member typing, and exported enum metadata.
- `src/runtime/environment.ts` — runtime enum declaration/value registries.
- `src/runtime/evaluateExpression.ts` — enum declaration materialization and primitive member evaluation.
- `src/runtime/moduleLoader.ts` — exported/imported enum declaration and runtime value flow.
- `tests/parser.test.ts` — enum AST/location and malformed syntax assertions.
- `tests/evaluator.test.ts` — implicit and explicit values, primitive compatibility, EN-I01-EN-I08, and duplicate String values.
- `tests/modules.test.ts` — EN-V04 imported/exported enum access and EN-I09 private enum rejection.
- `planning/decisions.md` and `planning/state.md` — approved allocation and execution evidence.

No editor clients, formatter, language specification, examples/help, dependency manifests, or release surfaces were changed. Sprint 073 record inheritance code was not altered.

## Verification

| Command | Result |
|---|---|
| `bun test tests\parser.test.ts tests\evaluator.test.ts tests\modules.test.ts` | PASS — 170 passed, 0 failed, 627 expectations across 3 files. |
| `bun run build` | PASS — `tsc` completed successfully. |
| `bun test` (first run) | 446 passed, 3 failed, 2,436 expectations across 449 tests / 35 files. The two known Sprint 073 failures recurred. An additional desktop DOCX export test intermittently observed `committing` instead of `succeeded`. |
| `bun test desktop-app\src\bun\desktopDocxExport.test.ts` | PASS — 2 passed, 0 failed, 18 expectations. |
| `bun test` (retry) | 447 passed, 2 failed, 2,441 expectations across 449 tests / 35 files. Both failures match the Sprint 073 baseline. |

Sprint 073 recorded 439 passed, 2 failed, 2,415 expectations across 441 tests / 35 files. Its two failures remain unchanged: the imported dimension/unit declaration identity assertion at `tests/editor.test.ts:73` and the README/specification/help assertion at `tests/examples.test.ts:43`. The retry adds eight tests and 26 expectations with no new persistent full-suite failure.

## Acceptance and Residuals

- EN-V01 through EN-V03 verify implicit numbering from 1, explicit homogeneous Number/String values, primitive-typed bindings, and runtime primitive values.
- EN-V04 verifies exported/imported enum member access.
- EN-I01 through EN-I06 use the approved diagnostics at the fixture locations; EN-I07 remains AMX3006.
- EN-I08 verifies forward-reference rejection at the enum name; EN-I09 verifies private enum import rejection at the importing module's location.
- Number and String duplicate values are both rejected.
- Enum names follow source-order and existing module visibility rules. No nominal enum type or enum coercion was added.
- The focused suites and build pass. The full root suite retains the two inherited Sprint 073 failures; therefore, no broader root-suite-clean claim is made.
- Editor/formatter integration, language specification publication, examples/help, and release work remain deferred to their planned sprints.
