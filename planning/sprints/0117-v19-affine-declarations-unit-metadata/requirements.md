# Sprint 117 Requirements: V0.19 Affine Declarations and Unit Metadata

## Document Status and Entry Gate

Architect-prepared Sprint 117 planning package. Sprint 116 is separately
ACCEPTED/CLOSED by the product owner on 2026-11-21 with 208 focused tests,
no-emit typecheck, and patch-integrity passing and no recorded residual. This
closes only the chart AST/parser/checker/evaluation/model stream.

Sprint 115 remains the accepted language authority for V0.19 affine behavior.
D115-04, D115-05, D115-07, D115-08, and D115-09 are accepted for the Sprint
117 declaration scope; D115-06/D115-08 runtime and external-data behavior remains
owned by Sprint 118. This package authorizes planning only. Obtain separate
Sprint 117 execution authorization and exact baseline/file/command/evidence
approval before production or test edits.

Sprint 117 implementation may begin only when:

- the accepted Sprint 115 affine declaration grammar, composition rules,
  constants, diagnostics, and 51 affine qualification cases are treated as
  authoritative;
- the execution plan distinguishes scalar declaration arithmetic from affine
  unit transforms instead of applying positive unit-scale validation to every
  intermediate scalar;
- the file plan includes `UnitMetadata` and declaration resolution, with any
  compiler-driven compatibility updates explicitly approved;
- runtime conversion/arithmetic and the SI library remain untouched;
- no new stable diagnostic code is guessed or allocated by this package.

## Goal

Represent each declared unit with finite positive scale and finite offset,
resolve accepted affine unit expressions at static declaration time, preserve
complete affine metadata through aliases and imports/re-exports, and reject
unsupported or non-finite declaration forms without changing runtime
measurement behavior.

Sprint 117 establishes registry declaration semantics. It does not make Celsius
or Fahrenheit values execute, add SI exports, or broaden measurement
conversion/arithmetic. Those behaviors belong to Sprint 118.

## Accepted Sprint 115 Decisions Applied Here

- **D115-04:** declaration `+`/`-` requires one affine unit term and one
  dimensionless scalar term. `unit + scalar` and `scalar + unit` add the scalar
  offset; `unit - scalar` subtracts it; scalar-left subtraction and two-unit
  addition/subtraction are invalid.
- **D115-05:** finite positive scalar multiplication/division may transform an
  affine unit's scale and offset. Unit-to-unit `*`/`/` and powers retain existing
  behavior only for offset-zero units, except exponent 1, which is the affine
  identity.
- **D115-07:** only built-in `PI` and `E` resolve as dimensionless numeric
  constants in declaration expressions. User/imported values, forward names,
  calls, record access, and arbitrary evaluation remain excluded.
- **D115-09:** static declaration diagnostics reuse `AMX3008`; semantically exact
  existing finite/scale wording is preserved and no new code is allocated.
  Existing module-cycle and import/export diagnostics remain owned by their
  current paths.

## In Scope

- Add a required finite `offset: number` field to `UnitMetadata`; canonical base
  units and every existing linear declaration receive offset 0.
- Extend declaration-resolution state to distinguish a dimensionless scalar
  from an affine unit result while preserving vector, positive scale, offset,
  unit presence, and exact expression source.
- Evaluate permitted dimensionless scalar expressions using numeric literals,
  `PI`, `E`, parentheses, unary numeric minus, `+`, `-`, `*`, `/`, and signed
  integer powers. Intermediate scalars may be negative or zero; final or used
  scale factors must satisfy their affine use and finite rules.
- Extend affine `+`/`-`, scalar multiplication/division, unit composition, and
  exponent handling exactly as the accepted operation model specifies.
- Resolve visible unit identifiers to their full `(vector, scale, offset)`
  metadata. Aliases copy all transformation metadata and retain existing module
  identity/name behavior.
- Preserve affine metadata through exports, explicit imports, re-exports,
  editor module analysis, and registry construction. No serialization format is
  introduced.
- Validate finite offset, finite positive effective scale, division-by-zero/
  non-finite intermediate scalar values, incompatible dimensions, unsupported
  affine compound/power behavior, scalar-only derived declarations, and source
  order/visibility.
- Add focused parser-adjacent, checker/registry, alias, import/export/editor
  analysis, and exact diagnostic/source-range tests mapped to S115 AFF cases.
- Preserve all current linear scale, vector, identity, declaration-order,
  alias, import/re-export, base-unit uniqueness, and SI inventory behavior with
  offset 0.

## Out of Scope

- Runtime `MeasurementUnit` offset storage, physical conversion, `in`, equality/
  ordering, arithmetic, aggregate behavior, chart normalization, scalar/table
  display, and external unit parser changes. They belong to Sprint 118.
- Adding Celsius/Fahrenheit/aliases or any declarations to `libraries/si.amx`.
  Sprint 118 owns SI library exports after runtime behavior exists.
- Chart `showTable`, renderer/editor UI updates, published V0.19 specification,
  README, examples, migration documentation, package/version changes, release,
  publication, deployment, distribution, installer, or certification.
- A general compile-time expression evaluator, arbitrary constant folding,
  imported/user constant resolution, functions/calls in unit declarations,
  decimal/exact arithmetic, or changes to dimension identity.
- Unit-expression grammar changes beyond the accepted operators. This sprint
  does not add Boolean/string/list behavior to declaration expressions.

## Candidate Source and Test Surfaces

The exact execution plan should prefer these existing paths:

- `src/typechecker/dimensionTypes.ts`: required affine offset metadata.
- `src/typechecker/checkDocument.ts`: `UnitExpressionValue`, scalar/affine
  composition, PI/E, validation, base/derived metadata construction.
- `tests/dimensions.test.ts`: core registry/diagnostic/linear/affine cases and
  module/import metadata assertions.
- `tests/parser.test.ts`: parser-adjacent evidence only if the accepted scalar
  expression syntax is not already covered or source mapping needs proof.
- `tests/editor.test.ts` or existing editor module-analysis tests inside
  `dimensions.test.ts`: imported affine metadata preservation.
- `tests/modules.test.ts`: only if a distinct module-loader regression is needed;
  do not duplicate `dimensions.test.ts` without a separate integration reason.

The following paths are read/review only unless the separately approved plan
proves a concrete compiler/test need: `src/runtime/moduleLoader.ts`,
`src/editor/moduleAnalysis.ts`, `src/runtime/measurement.ts`,
`src/runtime/externalUnits.ts`, and `src/parser/parseStatements.ts`. A production
change to any of them requires an exact execution-plan amendment before edit.

## Required Staging Assertions

- Existing scale-only units are represented with offset 0 and unchanged scale,
  vector, identity, source, exports, aliases, and runtime-free registry content.
- Celsius-shaped declarations can resolve to `(scale 1, offset 273.15)` and
  Fahrenheit-shaped declarations to `(5/9, 273.15 - 160/9)` in the registry;
  no SI-library declaration is added.
- The same affine metadata survives aliasing, export, import, re-export, and
  editor module analysis without recomputation or loss of offset.
- PI/E are accepted only as declaration-time scalar identifiers; ordinary
  runtime PI/E behavior is not changed.
- Nonzero-offset units reject disallowed compound multiplication/division/power
  during declaration checking, while linear compound declarations continue to
  work.
- S117 does not add offset to runtime `MeasurementUnit`, conversion, chart
  normalization, or external unit text; any use of runtime-affine behavior
  remains NOT RUN/out of scope.

## Completion Outputs

- An authorized S117 production/test implementation limited to declaration
  metadata and registry semantics.
- Focused parser/checker/registry/import/export/editor diagnostics and source
  evidence mapped to the accepted AFF cases.
- Completed `builder-evidence.md` with exact baseline, files, commands, raw
  outcomes, limitations, residuals, and recommendation.
- No SI, runtime measurement, chart, external data, renderer, editor UI,
  specification/example, package, or release work.
- Separate product-owner disposition. Sprint 118 remains gated on accepted S117
  metadata/diagnostic behavior; S117 recommendation alone does not authorize it.
