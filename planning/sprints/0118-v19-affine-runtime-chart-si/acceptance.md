# Sprint 118 Acceptance Criteria

Sprint 118 is complete only when affine measurement runtime behavior, physical
chart normalization, external data, and SI exports execute consistently through
one conversion model, all 29 remaining S115 AFF cases have evidence, and a
separate product-owner disposition is recorded. No S119 renderer/editor/spec or
release work follows from this sprint.

## Entry and Authority

- Sprint 117 is verified ACCEPTED/CLOSED on 2026-11-21 with no residual; finite
  required `UnitMetadata.offset` and declaration/import/editor parity are the
  implementation entry contract.
- Sprint 115 D115-06, D115-08, and D115-09 remain authoritative and are not
  reopened as part of S118 implementation.
- Separate S118 execution authorization records the exact baseline, worktree
  preservation, approved files, SI change, generated-output plan, commands,
  and evidence roots.

## Runtime Representation and Conversion

- Runtime `MeasurementUnit.offset` is required, finite, immutable, copied from
  checked metadata, and 0 for unitless/canonical/offset-zero composed units.
- One shared pair of physical/inverse helpers computes $p=v\times scale+offset$
  and $(p-offset)/scale$; attachment, conversion, validation, operations,
  aggregates, and chart normalization do not maintain divergent formulas.
- Static literal physical finite validation uses offset; dynamic attachment,
  conversion, arithmetic, aggregate, and chart finite checks reject
  NaN/Infinity through the accepted phase-specific diagnostic.
- External serialization does not expose offset, scale, factors, or physical
  canonical values.

## Operations

- Equality/order compares canonical physical values; $0 C=32 F=273.15 K$ and
  reverse conversion/round-trip cases pass.
- Compatible subtraction computes physical difference and divides by the left
  scale, returning the left display unit. Same and mixed C/F/K cases pass.
- Direct affine addition and affine measurement multiplication/division reject
  with AMX3007; no offset is discarded and no unit composition occurs.
- Affine binary powers, `pow`, and `sqrt` reject under accepted AMX3007/dimensional
  policy. Existing linear behavior and dimension-cancellation results remain.
- `sum` and `mean` use physical aggregation and inverse conversion to the first
  display unit. `sum([10 C,20 C])` is 303.15 C.
- `min`/`max` compare physically and return selected original display units;
  `abs`, `round`, and unary minus operate on display values and preserve units.
- Empty sum/mean/min/max behavior and incompatibility diagnostics remain stable.

## Charts and Display

- Selected mixed-unit chart columns normalize all non-null measurements
  physically to the first non-null display unit.
- Headings, descriptor text/scale/vector/factors, source order, null placement,
  no-data behavior, plot data, table-model data, axes, and tooltip labels remain
  coherent and immutable.
- A non-finite normalization fails AMX3007 with chart/field/declaration context
  and no partial success-shaped output.
- Scalar, table, narrative, and output display retain the selected display value
  and unit text. No canonical physical value leaks into presentation.
- S116 `showTable` resolved field remains unchanged; S118 does not omit chart
  tables or alter renderer/accessibility output.

## External Data and SI

- JSON/CSV exact measurement shape remains `{ value, unit }`; added offset/scale
  fields reject AMX4005.
- Atomic visible affine and alias units are accepted; runtime measurements carry
  internal offset while display values/unit text are unchanged.
- Affine unit atoms participating in external `*`, `/`, or `^` reject AMX4004.
  Existing linear compound expressions remain valid.
- `libraries/si.amx` adds exactly `celsius`, `fahrenheit`, `degC`, `degF` using
  accepted declarations. Inventory is 16 dimensions and 50 units.
- SI explicit-import conversion/equality/subtraction cases pass. Historical
  declaration rows/scales/vectors/aliases remain unchanged with offset 0.

## Testing and Scope

- All 29 post-S117 S115 AFF cases map to executed evidence, and S118-internal
  helper/generated/SI/output cases reconcile with no missing or duplicate IDs.
- Focused measurement/data/chart/evaluator/dimensions selection, no-emit
  typecheck, patch integrity, and any approved build-generated runtime checks
  pass as recorded.
- Linear Number/measurement regressions pass. No raw retry, skip, unavailable
  check, or unapproved scope change is converted to PASS.
- Any tracked generated browser runtime is changed only through the existing
  generator/build and reviewed against source; no hand edit is accepted.
- No S119 renderer/table-omission/accessibility, editor/spec/example/migration,
  README, package/version, release, publication, deployment, or certification
  work occurs.
- `builder-evidence.md` records exact baseline, commands, raw outcomes,
  diagnostics/source paths, SI inventory, generated output, limitations,
  residuals, changed-path audit, and recommendation.
- Separate product-owner disposition accepts/closes or blocks/opens S118. That
  disposition alone does not authorize S119 or release work.
