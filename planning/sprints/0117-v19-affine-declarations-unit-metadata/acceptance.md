# Sprint 117 Acceptance Criteria

Sprint 117 is complete only when affine declaration metadata and resolution are
implemented, all approved focused fixtures execute, existing linear/import
behavior is preserved, and a separate product-owner disposition is recorded.
Sprint 117 does not implement runtime affine behavior.

## Entry and Authority

- Sprint 115 accepted affine decisions D115-04, D115-05, D115-07, D115-08, and
  D115-09 are verified authoritative. Sprint 116 is ACCEPTED/CLOSED on
  2026-11-21 with no residual affecting S117.
- Separate Sprint 117 execution authorization records the exact baseline,
  worktree preservation, approved production/test paths, commands, and evidence
  roots.
- No production/test file outside the approved plan changes without a specific
  scope amendment.

## Metadata and Registry

- `UnitMetadata.offset` is required and every checked base/derived/local/exported/
  imported/re-exported unit exposes a finite numeric value.
- Base units have scale 1 and offset 0; every existing scale-only declaration
  has offset 0 without changing scale, vector, name, identity, module identity,
  source, or base uniqueness.
- A Celsius-shaped declaration stores scale 1, offset 273.15; canonical
  Fahrenheit stores scale $5/9$ and offset $273.15-160/9$.
- Aliases copy full transform metadata. Imports, explicit exports, re-exports,
  runtime loader, and editor analysis retain identical values and identities.
- No registry uses optional/undefined offset as a compatibility fallback after
  S117 checked-unit construction.

## Scalar and Affine Resolution

- Scalar literals, PI/E, parentheses, unary minus, `+`, `-`, `*`, `/`, and
  signed integer powers resolve with finite IEEE-754 results. Negative/zero
  scalar intermediates remain available to offset arithmetic.
- Unit/scalar `+`, scalar/unit `+`, and unit/scalar `-` compose offsets exactly.
  Scalar/unit `-` and unit/unit `+/-` reject under AMX3008 at the operator.
- Positive scalar multiplication/division transforms both scale and offset.
- Linear/offset-zero unit multiplication, division, and powers preserve existing
  dimension/scale behavior.
- Nonzero-offset unit `*`, `/`, and non-identity power reject; exponent 1
  preserves complete affine metadata.
- A final scalar-only declaration rejects. Unknown/forward/user/imported names,
  calls, and unsupported AST forms preserve AMX3008/ordinary source policy.

## PI/E and Finite Rules

- PI/E match `Math.PI`/`Math.E` declaration values and are accepted only as
  dimensionless scalars in derived-unit expressions.
- No user/imported ordinary value, function, forward declaration, object field,
  or arbitrary AST is constant-folded.
- Division by zero, overflow, NaN/Infinity, zero/negative unit scale, non-finite
  offset, dimension exponent overflow, and unsupported composition fail without
  producing success-shaped metadata.
- Exact diagnostics, operator/operand source ranges, and any secondary
  declaration source are recorded for every negative case in the matrix.

## Regressions and Integration

- Existing linear dimensions, unit aliases, SI library inventory, base-unit
  uniqueness, explicit import visibility, module cycles, and re-export behavior
  pass focused regressions.
- Editor module analysis and runtime module loading carry the same imported
  affine metadata, or every necessary discrepancy is recorded as a blocking
  residual rather than hidden.
- Focused dimensions/parser/editor/modules selection, no-emit TypeScript check,
  and patch/scope audit pass under the approved plan.
- LF/CRLF and UTF-16 source ranges required by negative fixtures are explicitly
  recorded where the approved test scope covers them.

## Boundaries and Closeout

- No offset field/consumer is added to runtime `MeasurementUnit`,
  `unitFromMetadata`, conversion, arithmetic, aggregates, chart normalization,
  external unit parsing, scalar display, or external data.
- `libraries/si.amx` is unchanged; no Celsius/Fahrenheit/temperature aliases
  are published in S117.
- No chart, renderer, editor UI, specification, example, migration, package,
  release, publication, deployment, installer, or certification work occurs.
- Every accepted S115 AFF declaration case maps to executed S117 evidence;
  runtime S118 AFF cases remain NOT RUN/out of scope.
- `builder-evidence.md` records exact baseline, commands, raw outcomes, retries,
  limitations, changed paths, case/diagnostic reconciliation, and recommendation.
- Separate product-owner disposition accepts/closes or blocks/opens Sprint 117.
  Only that disposition closes the registry gate for S118; it does not authorize
  Sprint 118 implementation by itself.
