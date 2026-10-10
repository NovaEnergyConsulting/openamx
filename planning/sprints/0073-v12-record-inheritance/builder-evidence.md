# Sprint 073 Builder Evidence

## Authorization and Scope

The Lead Developer explicitly authorized Sprint 073 and approved the concrete file-by-file plan. The Lead Developer allocated RI-I01/AMX3011, RI-I02/AMX3012, RI-I03/AMX3013, and RI-I07/AMX3014 with exact messages and confirmed dynamic parent/property-name substitution. The allocation is recorded in `planning/decisions.md`. Existing AMX5001–AMX5003 module meanings were preserved.

The implementation is limited to record inheritance and directly affected consumers. No changes were made to module visibility, type assignability, formatter/editor integration, examples, or release workflows.

## Files Changed

### Implementation

- `src/ast/types.ts` — parent references, field `override` marker/location, and preservation of declared fields.
- `src/parser/parseStatements.ts` — `extends` parent-list and `override` field parsing with source locations.
- `src/diagnostics/errors.ts` — approved AMX3011–AMX3014 static diagnostic identities.
- `src/typechecker/checkDocument.ts` — cycle detection, visible-parent lookup, effective-field composition, strict collision/override validation, constructor/access typing, and required inherited-field checks.
- `src/typechecker/declarationRegistry.ts` — registry provenance for individual record fields.
- `src/runtime/evaluateExpression.ts` — effective-field construction/validation and declaring-registry context for inherited defaults.
- `src/runtime/inputData.ts` — field-scoped registries for input schema, JSON/CSV validation, and defaults.
- `src/runtime/outputData.ts` — effective-field JSON/CSV schema and serialization with field-scoped registries.

`src/runtime/moduleLoader.ts` was not changed: its existing imported/exported type wiring supports the new parent lookup, and module behavior is covered by tests.

### Tests

- `tests/parser.test.ts` — parent/override syntax and token locations.
- `tests/evaluator.test.ts` — RI-V01–RI-V03, effective-field ordering, valid contract replacement, and RI-I01–RI-I09 with exact approved diagnostics/locations.
- `tests/modules.test.ts` — RI-V04 imported/exported parent and RI-I10 private parent.
- `tests/inputData.test.ts` and `tests/outputData.test.ts` — effective-field input/output consumer regressions.
- `tests/dimensions.test.ts` — imported parent field annotation/default retains its declaring dimension and unit context.

## Verification

| Command | Result |
|---|---|
| `bun test tests\parser.test.ts tests\evaluator.test.ts tests\modules.test.ts tests\inputData.test.ts tests\outputData.test.ts tests\dimensions.test.ts` | PASS (exit 0) — 190 passed, 0 failed, 849 expectations across 6 files. |
| `bun run build` | PASS (exit 0) — `tsc` completed successfully. |
| `bun test` | FAIL (exit 1) — 439 passed, 2 failed, 2,415 expectations; 441 tests across 35 files. |

The two full-suite failures match the inherited failures recorded in project state:

- `tests/editor.test.ts:73` — `shared editor symbols preserve imported dimension and unit declaration identity`.
- `tests/examples.test.ts:43` — `V0.9 user documentation > links the README and specification and keeps migration/help contracts searchable`.

Neither failure is in a changed file or is attributed to Sprint 073.

## Diagnostic Allocation and Acceptance

| Fixture | Status | Evidence / reason |
|---|---|---|
| RI-I01 | PASS | AMX3011; verifies exact message and primary/secondary fixture locations. |
| RI-I02 | PASS | AMX3012; verifies exact message and primary/secondary fixture locations. |
| RI-I03 | PASS | AMX3013; verifies exact message and primary fixture location. |
| RI-I07 | PASS | AMX3014; verifies exact message and primary/secondary fixture locations while preserving forward-reference behavior. |

The approved effective-field order implemented and tested is: parents in declaration order, each parent's effective order, first occurrence fixes the slot, valid child overrides replace in place, and child-only fields append in child declaration order.

All Sprint 073 inheritance categories have fixture-derived assertions. The required full root test command retains two unrelated failures already recorded in project state; their status is reported without masking or relabeling them.
