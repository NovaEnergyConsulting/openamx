# Sprint 073 Acceptance Criteria

Sprint 073 is complete only when the approved inheritance contract is implemented and all required fixture-derived behavior is verified across parsing, type checking, construction, module resolution, and affected record consumers. An unapproved or untested diagnostic category remains a blocker.

## Parsing and Parent Resolution

- Existing record declarations parse and behave as before.
- Declarations accept one or more record parents and field declarations accept the planned `override` marker.
- RI-V01 through RI-V04 pass, including transitive fields, multiple parents, same-type inherited collision resolved by an explicit override, complete child construction, and an imported/exported parent.
- RI-I04 through RI-I07 reject unknown, forward, non-record, and cyclic parent references at the Sprint 072 source locations.
- RI-I10 rejects importing a non-exported parent in the importing module at the specified location.
- Parent resolution preserves current source-order and module visibility rules; no forward visibility or implicit export is introduced.

## Effective Fields and Overrides

- RI-I01 rejects an unresolved inherited-field collision, including same-type collisions from separate parents.
- RI-I02 rejects a child redeclaration of an inherited field without `override`.
- RI-I03 rejects `override` when no parent supplies the field.
- A valid override replaces the inherited annotation, optionality, and default behavior as a complete contract.
- Effective fields follow the approved ordering decision: parents in declared order; recursively use each parent's effective-field order; the first occurrence fixes a field's position; an override replaces in place; child-only fields follow in child declaration order.
- Composition is transitive, yields no duplicate effective field slots, and is consistent in type checking, construction, runtime validation, and existing record-based schema/input/output paths that consume declaration fields.
- Parent-provided annotations/defaults retain their declaring-module context, including dimension/unit resolution for imported declarations.
- Child constructors accept the complete effective field set and preserve existing required/optional/default behavior; RI-I09 rejects omission of an inherited required field.
- RI-I08 rejects child-to-parent assignment. No parent/child subtype relation is introduced.

## Diagnostics and Source Locations

- Existing diagnostic identities and messages match Sprint 072 for RI-I04–RI-I06 and RI-I08–RI-I10.
- Before implementation and exact-code tests for RI-I01, RI-I02, RI-I03, and RI-I07, the Lead Developer has approved the diagnostic identities/messages and the approved allocation is recorded in `planning/decisions.md`.
- All invalid fixtures report the expected diagnostic at the Sprint 072 original-document source location; imported-module errors use the coordinates of the responsible module.
- If any new diagnostic allocation is still pending, the affected cases are explicitly BLOCKED and Sprint 073 is not reported complete.

## Tests and Scope

- Fixture-derived tests cover all RI-V01–RI-V04 and RI-I01–RI-I10 cases in the existing test suites, plus focused regressions for effective-field ordering and any directly affected input/output/dimension consumers.
- Focused parser, evaluator, module, input-data, output-data, and dimensions suites pass; the root build passes; the full root suite is run and its exact status recorded.
- Changes are limited to record inheritance and directly coupled record consumers/tests. No editor-specific integration, language specification, examples/help, or unrelated language behavior is added.
- Builder evidence records exact files, test commands/results, approved diagnostic allocation, any residuals, and the effective-field ordering decision.
- No release, publication, broad compatibility, or V0.12 closeout claim is inferred.
