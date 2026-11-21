# Sprint 115 Blueprint: V0.19 Language Contract and Affine Model Qualification

## Approach

1. Obtain separate Sprint 115 execution authorization and an exact file,
   command, probe, and evidence plan. Keep new and changed planning artifacts
   within this sprint folder unless a scope amendment names another path.
2. Recheck the accepted Sprint 114 closeout and the V0.19 master plan. Preserve
   the V0.18 residual statuses; do not use Sprint 115 to rewrite or satisfy
   them.
3. Audit the smallest relevant chart, unit-registry, measurement, chart-model,
   renderer, external-data, standard-library, and test surfaces. Label each
   observation as source fact rather than new product authority.
4. Finalize `language-and-rendering-contract.md` for `showTable`. Lock syntax,
   Boolean typing, duplicate behavior, environment/evaluation timing, shared
   emission/model propagation, and output omission across all renderers.
5. Finalize `affine-model-and-operations.md` for the canonical physical-value
   model. Resolve declaration grammar, affine composition, aliases/imports,
   constants, operation eligibility, aggregate behavior, display-unit rules,
   chart normalization, and external-data compatibility.
6. Complete `qualification-cases.md` and `diagnostic-matrix.md` with stable IDs,
   complete accepted-source sketches, expected values/diagnostics, phase,
   source anchor, and downstream owner.
7. Use read-only calculations or approved, isolated contract probes to verify
   the derived temperature declarations, inverse conversion, affine
   composition, round trips, and golden aggregate results. These probes are
   evidence only and are not product implementation.
8. Reconcile all master-plan requirements in
   `requirement-test-matrix.md`. Report missing/duplicate IDs, candidate code
   allocations, and unresolved blocking decisions without converting any
   unexecuted check to PASS.
9. Complete `builder-evidence.md` with baseline, exact commands, raw outcomes,
   limitations, residual owners, and a Builder recommendation. Submit the
   contract for a separate product-owner disposition.

## Decision Register

All entries below are proposed for Sprint 115 review. The first sentence in
`Confirmed input` is fixed by the V0.19 master plan; the final technical shape
becomes binding only after the Sprint 115 disposition.

| ID | Topic | Proposed technical disposition | Blocking owner |
| --- | --- | --- | --- |
| D115-01 | `showTable` syntax | `showTable` begins an option line and consumes the remainder of that line as one normal AMX expression. There is no colon. Parentheses and all Boolean-expression operators are legal; malformed/trailing text is a parse error. | S115 contract gate |
| D115-02 | Chart evaluation timing | Resolve and typecheck the expression in the chart declaration's normal environment; evaluate it exactly once for each emitted chart at the existing `show` snapshot point. | S115/S116 |
| D115-03 | Omitted/false rendering | Shared emission and model carry the resolved Boolean. False means no table element/content in HTML/preview/PDF/DOCX and no hidden or alternate table markup; accessibility output must not reference a nonexistent table. | S115/S119 |
| D115-04 | Affine declaration `+`/`-` | `unit + scalar` and `unit - scalar` add/subtract a statically evaluable scalar value from the offset. A dimensioned term on both sides is unsupported as declaration `+`/`-`; affine unit composition remains through one affine term plus an offset scalar. | S115 product review |
| D115-05 | Affine transform composition | Multiplication/division by a finite positive dimensionless scalar applies to scale and offset. Unit-to-unit product/division/power retains existing behavior only when the other affine transforms have offset zero, except identity exponent 1. | S115 product review |
| D115-06 | Runtime affine eligibility | Conversion, comparison, subtraction, `sum`/`mean`, `min`/`max`, `abs`, `round`, chart normalization, scalar display, and external attachment follow the locked operation matrix. Direct affine addition and affine `*`, `/`, `^`, `pow`, and `sqrt` are rejected. | S115 product review |
| D115-07 | Declaration constants | `PI` and `E` resolve only inside derived-unit declaration expressions to the same runtime IEEE-754 values. They cannot enable arbitrary identifiers, imports, calls, forward lookup, or function evaluation. | S115 contract gate |
| D115-08 | External compatibility | Keep `{ value, unit }` unchanged. Affine atomic or alias unit names are accepted by the existing external-unit parser when dimension-compatible; an affine factor in a compound external unit expression is rejected. | S115 compatibility audit |
| D115-09 | Diagnostics | Reuse semantically exact `AMX3003`, `AMX3005`, `AMX3007`, `AMX3008`, and `AMX3010` conditions. Any new affine-composition diagnostic requires allocation; no stable identity is claimed by this package. | Lead Developer allocator |

## Source-Observed Baseline To Verify

- Chart AST options currently contain title, description, field, and series
  options; `showTable` is absent. Chart options are parsed line by line and
  duplicate title/description/field options are checked through existing
  `AMX3005` behavior.
- Chart evaluation stores declarations and snapshots a chart when `show` is
  evaluated. The emission currently has no resolved visibility field, and
  `ChartViewModel` always contains a table model.
- Unit declarations already parse an ordinary expression and reject unsupported
  operators during checking. Unit metadata currently stores dimension vector
  and positive scale, with no offset field.
- `MeasurementValue` retains display `value` and `MeasurementUnit`; the public
  external data contract is the exact two-field shape `{ value, unit }`.
- Linear conversion, equality/order, direct arithmetic, aggregate functions,
  scalar display, and chart normalization currently multiply by `scale` only.
  Each corresponding physical-value site must move to one shared affine
  formula in later sprints.
- `PI` and `E` already resolve as ordinary runtime Number identifiers; unit
  declaration resolution does not currently allow them.
- The SI library declares base Kelvin and scale-only derived/alias units.
  Temperature offset units are absent.

These facts are compatibility observations, not permission to preserve a
linear-only result where V0.19 explicitly changes behavior.

## Required Sprint Artifacts

- `language-and-rendering-contract.md`: chart syntax, typing, evaluation,
  shared model, output omission, diagnostics, and migration contract.
- `affine-model-and-operations.md`: canonical formula, declaration grammar,
  affine composition, constants, operation matrix, SI derivation, display and
  external-data compatibility.
- `qualification-cases.md`: stable valid, invalid, boundary, and integration
  fixtures with expected outcomes.
- `diagnostic-matrix.md`: phase, anchor, code policy, exact candidate messages,
  and downstream owner.
- `requirement-test-matrix.md`: master-plan to decision/case/diagnostic trace.
- `builder-evidence.md`: source review, probe commands, raw outcomes,
  limitations, reconciliation, recommendation, and separate disposition.
- `acceptance.md` and `handoff-prompt.md`: completion gate and Builder
  authority boundaries.

## Boundaries

- This sprint is a documentation and qualification gate, not a feature sprint.
- Do not edit historical language specifications or V0.19 production surfaces.
- A successful arithmetic calculation proves the locked fixture, not the
  current runtime or renderer.
- One host's source audit or probe does not establish release or platform
  qualification.
- No S116 implementation begins until the chart contract and all blocking
  `showTable` decisions are accepted. No S117 implementation begins until the
  affine declaration, composition, diagnostics, and compatibility decisions
  are accepted.
