# Sprint 055 Blueprint: Dimension/Unit Declarations and Module Identity

## Approach

1. Confirm Sprint 052's dependency disposition and review its implementation/evidence. Sprint 053 is accepted and Sprint 054 is complete/approved, but neither is a dependency. Preserve their unpassed Windows residuals accurately: Sprint 053 VS Code host 13 pass/6 fail (five `EBUSY` cleanup failures and one drive-letter case assertion); Sprint 054 desktop RPC path-separator assertion failed and VS Code host 15 pass/5 fail (four `EBUSY` cleanup failures and one drive-letter case assertion).
2. Read the approved Sprint 051 dimension/unit identity, scale, SI inventory, diagnostic, and registry contracts. Inventory module graph construction, real-path canonicalization, AST and parser unions, export/import checking, evaluation order, schema-inspection call sites, editor symbol analysis, and relevant tests before designing changes.
3. Establish data/AST types for dimension and unit declarations and immutable metadata. Keep public identity explicit: base dimension key is canonical resolved module identity plus declaration name; derived dimensions normalize sparse integer vectors by that key; unit metadata includes declaration identity, vector, positive finite scale, and display name. Avoid coupling these declaration objects to measurement values from Sprint 056.
4. Extend parsing for module-level `dimension`/`unit` and `export dimension`/`export unit` forms exactly as approved. Reuse existing import/export patterns. Do not invent declarations in local scopes or alter ordinary expression parsing for unit attachment.
5. Implement ordered declaration resolution and static validation:
   - A declaration sees only prior declarations and explicitly imported metadata.
   - Base dimensions create distinct stable identities.
   - Derived dimensions reduce to normalized vectors; same-vector declarations over the same base identities compare equal.
   - One independent base unit per base identity is allowed; all alternatives require explicit valid scale relationships.
   - Reject unknown/forward names, name collisions, local declarations, duplicate independent bases, invalid operators/exponents, and scales not finite and greater than zero.
   - Report `AMX3006` for declaration syntax and `AMX3008` for semantic declaration/name/scale failures, preserving source and related declaration positions.
6. Integrate explicit import/export/re-export metadata with the existing module graph. Use `export { Name }` to re-export explicitly imported dimensions/units. Confirm real-path module canonicalization is consistent when a file is reached through relative paths/re-exports, original identity is retained, containment restrictions remain enforced, and matching display names from different modules do not unify.
7. Add a metadata-only registry construction phase usable before external input/output schema inspection. Reuse parsed/checker/module metadata and existing caching rather than evaluating executable statements or loading data. Prove each module is evaluated at most once in execution flows and registry construction itself does not execute AMX bodies.
8. Add the exact project-local `libraries/si.amx` module using the approved inventory in Sprint 051 `blueprint.md`. Verify every approved name, case, alias, definition, scale, export, and omission. Test explicit relative imports, no implicit imports, and re-export identity. Do not introduce new global names or package resolution.
9. Expose enough declaration metadata to static checking and existing shared editor analysis to resolve visible names and source locations. Limit client implementation to current feature needs; final references/rename/outline/completion parity remains Sprint 058.
10. Add focused tests for parser grammar and invalid scopes, ordered dependency resolution, imports/exports/re-exports, equivalent and incompatible vectors, duplicate base units/collisions, invalid scales, SI inventory exactness, canonical identity under path aliases, and registry construction/no duplicate evaluation/no statement execution.
11. Preserve and test Sprints 052-054 behavior while extending shared AST/module types. Run focused tests, root build/tests, and relevant desktop/extension checks. Record any Windows host test failures (including already accepted path/cleanup failures) as unpassed; run `git diff --check`.
12. Update Sprint 055 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with changed files, inventory results, identity/registry design, tests/results, and residuals. Request a separate Lead Developer disposition; do not self-accept.

## Files to Update

- AST/parser, module/type-check metadata, declarations/export-import resolution, static checker, and registry construction as directly required
- Approved project-local SI module at `libraries/si.amx`
- Focused tests and declaration/import examples
- `planning/sprints/0055-v09-dimension-unit-declarations-module-identity/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not implement measurement expressions or external-data/reporting features assigned to Sprints 056-057.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| Base declaration | Creates a stable identity keyed by canonical module identity and declaration name. |
| Structural derived dimension | Equivalent normalized vectors over the same base identities compare equal, regardless of derived names. |
| Independent same-name dimension | Different module declarations remain incompatible. |
| Explicit import/re-export | Consumers resolve only imported/exported declarations; re-exports preserve original identity. |
| Source order | Earlier/local or explicitly imported declarations resolve; forward/unknown names fail. |
| Scope and collision | Local/function/loop declarations and collisions are rejected with source locations. |
| Base unit uniqueness | Exactly one independent unit per base identity; additional units require an explicit relationship. |
| Scale validation | Zero, negative, NaN, infinity, overflow/non-finite derived scales reject; valid positive finite scales resolve. |
| SI library | Exact approved exported inventory, definitions, aliases and omissions are verified; use remains explicit/relative. |
| Registry lifecycle | Schemas can access declaration metadata before input inspection, with no module-body execution, data loading, or duplicate module execution. |

## Verification

- Focused parser/typechecker/module/registry/editor tests for declarations, identity, imports, diagnostics, and static constraints.
- Exact inventory test verifies all required SI entries and rejects implicit names.
- Counter/fixture-backed tests prove registry generation does not execute statement bodies and execution does not evaluate modules twice.
- Root `bun run build` and relevant root test suites; affected desktop/extension compile/typecheck/tests as available.
- Preserve explicit status for Windows Extension Development Host/RPC runs; record all failures rather than calling them passed.
- `git diff --check`.

## Notes

- The full approved SI name/definition/exclusion table is in the Sprint 051 blueprint, section “Finite Optional SI Inventory Proposal” (approved by Lead Developer). Treat it as the exact inventory contract; duplicate it nowhere as a separately mutable source of truth.
- Approved identity, vector, scale, canonical unit, and explicit visibility rules are also in Sprint 051 blueprint section “Dimension and Unit Identity / Canonicalization Proposal.”
- Sprint 056 depends on Sprint 055 and consumes its declaration/type metadata. Sprint 055 has no dependency on Sprints 053/054.
