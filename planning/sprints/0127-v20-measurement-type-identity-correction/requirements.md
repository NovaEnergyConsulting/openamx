# Sprint 127 Requirements: V0.20 Measurement Type Identity Correction

## Document Status

Architect-prepared corrective sprint package. The Product Owner approved this
planning scope on 2026-11-27. Preparation authorizes no implementation edits,
verification commands, release, package/version change, or publication. Exact
execution authorization is required before the first source edit or test.

Sprint 127 follows the S126 `BLOCKED/OPEN` recommendation. It addresses the
reproduced generated Measurement type-identity failure only. It does not
rewrite S125/S126 raw results or close the remaining V0.20 matrix.

## Goal

Make generated TypeScript Measurement brands consistent across modules for
AMX types that the checker considers compatible. Specifically, an expression
using an imported unit must typecheck when passed to an imported function
whose parameter uses the corresponding declared dimension. Generated runtime
values, AMX checking, units, and public helper behavior remain unchanged.

The acceptance target is the retained `averageSpeed` probe: strict generated
TypeScript compilation succeeds, and generated `run(inputs)` output matches
the AMX runtime for the Measurement value and display unit.

## Inputs and Authority

- V0.20 scope and behavior decisions:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S126 stop result and Builder recommendation:
  [`S126 builder evidence`](../0126-v20-integrated-acceptance-closeout/builder-evidence.md).
- Original S125 Measurement raw failure and source fixture:
  `../0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/`.
  Preserve the S125 `TS2339`/`TS2322` result unchanged.
- S126 reproduced failure: generated `AMXMeasurement<"vector:[...Length]^1">`
  is not assignable to `AMXMeasurement<"Length">` (`TS2345`). Preserve the
  S126 raw failure in its original artifact root.
- Type/runtime surfaces: `src/transpiler/emit.ts`,
  `src/transpiler/index.ts`, `src/transpiler/graph.ts`,
  `src/typechecker/checkDocument.ts`, `src/typechecker/dimensionTypes.ts`,
  and `src/transpilerRuntime.ts`.
- Existing generated parity tests: `tests/transpiler.test.ts`; focused suites
  also include `tests/transpilerGolden.test.ts`, `tests/modules.test.ts`,
  `tests/measurements.test.ts`, and `tests/measurementData.test.ts`.

## Accepted Decisions

- **S127-D01, canonical identity:** Generated Measurement type identity is
  canonical per vector-equivalence class, matching the current checker’s
  `sameVector` rule. Distinct declarations with equal vectors therefore share
  a generated TypeScript brand identity; S127 does not make the checker more
  nominal than it is today.
- **S127-D02, bounded source scope:** The implementation is limited to the
  core emitter and its focused tests. `src/transpiler/index.ts` may be changed
  only for internal graph-wide identity-map wiring. No public API change is
  authorized.
- **S127-D03, parity scope:** Cover the retained reproducer and adjacent
  imported/derived dimension and unit-alias cases. Do not claim the entire
  G123 Measurement family is complete unless its full matrix is separately
  executed and dispositioned.
- **S127-D04, closeout gate:** The generated Measurement graph must strictly
  compile and match AMX before V0.20 can be accepted as complete. The raw
  S125/S126 failures remain historical evidence even after a fix passes.

## In Scope

- Build one deterministic graph-wide mapping from Measurement vector classes
  to canonical AMX dimension identities using the fully prepared module graph.
- Use that mapping consistently in generated declarations, function
  signatures, imported bindings, Measurement expressions, and casts.
- Keep identities independent of absolute checkout roots. Use stable
  output-relative module identity and declaration metadata when selecting a
  canonical representative; use a deterministic vector fallback only when no
  declared dimension exists in the graph.
- Add a regression for the S125/S126 imported `averageSpeed` case and adjacent
  imported/derived dimension or alias cases.
- Strictly compile and execute a separately authored generated-code oracle
  against the AMX runtime for identical sources and inputs.

## Out of Scope

- Changes to `src/transpilerRuntime.ts`, public helper signatures, AMX
  typechecker compatibility rules, runtime Measurement arithmetic, parser,
  AST, diagnostics, package exports/version, CLI behavior, desktop behavior,
  README, language specifications, or examples.
- Full completion of all G123 Measurement, helper, AST, input, view, or
  diagnostics residuals.
- Desktop RPC/UI, native WebView, cross-platform, release, publication,
  deployment, installer, distribution, Marketplace/registry, or certification
  work.
- Any S125/S126 historical evidence or artifact edits.

## Constraints

- Preserve AMX’s vector-based Measurement compatibility semantics. Equal
  vectors must resolve to one canonical generated identity across modules.
- Do not use absolute paths, locale, filesystem enumeration order, or current
  working directory in generated identity strings.
- Keep the S122 `openamx/transpiler-runtime` API unchanged. If the emitter
  cannot satisfy the contract without a helper/typechecker/API change, stop and
  request a separately approved scope amendment.
- No S127 execution begins from this planning package alone.
- Preserve S121-S126 raw statuses, including D121-18, D122-15, all incomplete
  G123 rows, G124 cancellation/crash `NOT RUN`, S125 desktop aggregate
  `FAIL`, and the S125/S126 Measurement compile `FAIL`s.