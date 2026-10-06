# Sprint 056 Requirements: Measurement Expressions, Arithmetic, and Conversion

## Goal

Implement measurements as first-class AMX values using the dimension/unit declarations and metadata registry delivered by Sprint 055. Support unit attachment, typing/inference, arithmetic and comparisons, powers/roots, dimension cancellation, explicit conversion, approved math functions, and preservation of measurement metadata through functions, records, lists, nullable values, and assignments. Complete measurement scalar text display and verify that Sprint 053 string interpolation displays measurements correctly.

Sprint 056 owns measurement values and language operations. JSON/CSV measurement data, tables/charts, reports, and desktop data-editor integration remain Sprint 057.

## Dependencies and Entry Gate

- Sprint 056 depends on Sprint 055, which is **COMPLETE / APPROVED** by Lead Developer disposition dated 2026-10-06.
- Sprint 055 delivered module-level declarations, canonical base identities, normalized dimension vectors, explicit imports/exports/re-exports, the approved SI library, and a metadata-only registry. Read its Builder evidence and use `LoadedEntryModule.registry`/the delivered public metadata as the implementation input; do not duplicate or recalculate declaration identity in a conflicting path.
- Sprints 053 and 054 are accepted/approved but are not direct Sprint 056 dependencies. Sprint 053 measurement-to-text verification was explicitly deferred here. Their Windows host/RPC results remain unpassed residuals; do not describe those runs as passing.
- `docs/language-spec-v0.9.md`, the approved Sprint 051 contract appendix, and the master sprint plan are authoritative for syntax, precedence, operations, diagnostics, and edge behavior. Do not silently change them.
- Preserve the worktree and unrelated changes. Any actual conflict in the approved measurement contract must be recorded in `planning/questions.md` and referred to the Lead Developer before behavior is changed.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 056 scope and dependency sequence
- `docs/language-spec-v0.9.md`, especially unit attachment, conversion, arithmetic, functions, typing, and formatting semantics
- Approved Sprint 051 blueprint contract:
  - exact precedence/grouping and malformed examples
  - dimension/unit identity, vector and canonicalization rules
  - aggregate/math-function rules and static/runtime boundary
  - approved diagnostic codes and locations
- Sprint 055 requirements, blueprint, acceptance, Builder evidence, SI library, and Lead Developer disposition
- Sprint 053 requirements/evidence and its deferred measurement interpolation obligation
- `src/ast/types.ts`, parser, checker, `src/typechecker/dimensionTypes.ts`, module registry, runtime values/evaluators/environment, standard library, formatter, diagnostics, shared editor analysis, VS Code, and desktop worker/RPC
- Existing numeric operator/function tests and Sprint 052-055 regression suites

## In Scope

- Attach a declared visible unit to a numeric literal, numeric identifier, or parenthesized numeric expression using approved syntax, e.g. `10 meter`, `value meter`, `(a + b) meter`. Do not treat arbitrary juxtaposition or compound suffix text as multiplication.
- Parse `measurement in unitName` as explicit conversion to a visible declared unit. It returns a measurement, never a bare Number. The physical value and dimension remain unchanged. Preserve Sprint 051 precedence and loop-header `in` distinction.
- Type measurements using Sprint 055 dimension vectors and unit identities/scales. Support explicit annotations and inference, assignment compatibility, function parameters/results, records/default fields, lists, nullable values, and chained expression typing without dropping unit metadata.
- Implement approved operations:
  - addition/subtraction require compatible dimension vectors and retain the left operand's display unit
  - comparisons/equality require compatible measurements and compare normalized physical values
  - multiplication/division compose dimension vectors and scales; Number multiplication/division is permitted
  - dimension cancellation returns an ordinary Number with scale conversion applied correctly
  - unary minus preserves dimension/display unit
  - measurement powers require approved signed integer-literal exponents, including positive, zero, and negative
  - `sqrt` accepts only cases where resulting dimension exponents remain integers and numeric domain is valid
  - reject unsupported measurement operations and Number/measurement addition, subtraction, or comparison rather than erasing units
- Implement unit-aware `sum`, `mean`, `min`, `max`, `abs`, `round`, `sqrt`, and `pow` exactly as specified:
  - `sum`/`mean` use the first element's unit
  - `min`/`max` return the selected element with its unit
  - `abs` preserves unit
  - `round` rounds the current displayed value and preserves unit
  - a statically typed empty measurement list sums to zero in that dimension's canonical base-unit expression
  - existing empty `min`/`max`/`mean` errors remain
- Reject divide-by-zero and non-finite measurement arithmetic results explicitly using approved `AMX1009`; use approved `AMX3007` for incompatible/unsupported static dimensional operations, and `AMX3010` for statically provable numeric/unit-domain faults where appropriate.
- Preserve deterministic locale-independent scalar display. Complete measurement text as displayed numeric value followed by the chosen unit expression/name. Update the Sprint 053 interpolation conversion to accept measurement runtime/type values and add the deferred regression, without changing already-approved String/Number/Boolean/null behavior or narrative interpolation.
- Expose correct measurement type/hover/diagnostic facts to existing shared analysis where required by current feature integration. Broad navigation/completion/rename/outline parity remains Sprint 058.
- Preserve the approved canonicalization/display rules for compound units: declared spelling for direct attachment/conversion; stable factor ordering/cancellation for composed values; canonical base-unit form when no lossless declared-factor spelling exists.
- Add focused positive/negative tests for parser precedence, type rules, runtime arithmetic, functions, display units, metadata preservation, error domains, and Sprint 053 interpolation. Preserve existing non-measurement numeric behavior.
- Record exact implementation, changed files, verification commands/results, residuals, and Sprint 055/053 integration evidence in Sprint 056 Builder evidence and planning records.

## Out of Scope

- Dimension/unit declaration grammar, identity rules, explicit exports/imports, SI library, or registry construction (Sprint 055 is complete; consume its implementation).
- External measurement JSON/CSV parsing/serialization, external unit-expression validation, schema inspection changes beyond consuming existing metadata, input/output editor behavior, tables/charts, HTML/PDF/DOCX measurement display, and data diagnostics; Sprint 057 owns these.
- Broad editor parity, full navigation/rename/reference/outline/completion, migration guide, bundled help, examples overhaul, and integrated acceptance; Sprint 058 owns these.
- Offset/affine units, Celsius/Fahrenheit, decimal/exact arithmetic, imperial units, implicit units, implicit conversion, arbitrary juxtaposition, or new package resolution.
- General collection stringification or serialization; Lists and records remain invalid implicit interpolation values.
- Changing list semantics, pure-function restrictions, module identity/import containment, narrative interpolation, show-time snapshots, report ordering, or export atomicity.
- Unrelated operator precedence changes, global numeric behavior changes, or broad refactors.

## Constraints

- Reuse Sprint 055's identity/vector/unit registry. Base dimensions with different canonical module identities are incompatible even if named alike; structurally equal vectors over the same identities are compatible.
- Apply the exact Sprint 051 precedence table: attachment binds to its permitted preceding numeric atom, prefix and power behavior preserve existing levels/associativity, arithmetic precedes conversion, and `in` in loop headers remains loop syntax.
- A direct attachment/conversion retains the selected declared unit display identity. Addition/subtraction retain the left display unit; aggregates and math functions follow their specific approved selection rules.
- Physical value is displayed value times unit scale. Conversion divides by target scale. Composed multiplication/division must preserve scale factors; cancellation cannot return an incorrectly scaled Number.
- Number/measurement addition, subtraction, and comparison are errors. Multiplication/division by Number is allowed. Never drop dimensional metadata silently.
- Static checking may use only approved syntax-directed, side-effect-free facts. Do not constant-fold identifiers, execute functions/modules, or predict arbitrary runtime values. Dynamic domain/bounds errors remain explicit runtime checks.
- Use approved diagnostic codes and original source locations. Do not change the meanings of existing codes or return success-shaped fallback values.
- Sprint 057 owns external data/report behavior; keep the measurement value representation sufficient for that handoff without prematurely claiming round-trip/report support.
