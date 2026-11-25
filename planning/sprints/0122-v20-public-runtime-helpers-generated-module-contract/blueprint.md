# Sprint 122 Blueprint: Public Runtime Helpers and Generated-Module Contract

## Approach

1. Reconcile the accepted S121 disposition from `state.md`, `decisions.md`,
   `STATUS.json`, and the top-level S121 Builder evidence. Correct only the
   stale S121 pending-status statements as an explicitly approved entry
   reconciliation; retain all raw probe/test outcomes and residuals.
2. Record the approved S122 baseline and preserve the existing `dist` tree and
   prior S121 artifacts. List exact source/test paths and isolated fixture
   roots before implementation begins.
3. Inventory the actual `openamx/transpiler-runtime` exports and package export
   map. Treat the S121 helper slice as a baseline, not evidence that the full
   semantic API is complete.
4. Finalize `runtime-api-contract.md` against the evaluator and standard
   library. Define numeric/measurement operators, aggregates, list/range
   operations, builtins, value formatting, runtime errors, and source context.
5. Finalize `input-validation-contract.md` for recursive descriptors, direct
   caller values, enums, DateTime, measurements, defaults, nullable/optional
   fields, and error paths. Reconcile direct `run(inputs)` checks with the
   separate file-backed JSON/CSV validator.
6. Finalize `view-dto-contract.md` for shared values, table rows, chart data,
   measurement descriptors, diagrams, immutability, snapshots, and generic
   `AMXRunResult<TExports>` ownership.
7. Complete `fixture-matrix.md` with stable IDs for every public helper and
   negative path. Include exact AMX reference outputs and enum inputs, which
   were not independently proved by S121's public-helper probe.
8. Under separate authorization, implement only the approved helper API and
   tests. Reuse/factor existing runtime semantics where practical; do not
   expose internal evaluators to generated consumers.
9. Compile and execute the separately authored strict fixture against the
   built package. Verify the package subpath, declarations, ESM import, `.ts`
   fixture imports, result types, runtime behavior, errors, and repeatability.
10. Complete `verification-plan.md` and `builder-evidence.md` with exact
    commands, CWDs, tool versions, artifact roots/hashes, first failures,
    retries, raw statuses, limitations, and a Builder recommendation.
11. Submit the helper/API contract for a separate product-owner disposition.
    S123 implementation waits for S122 acceptance and final S121 feasibility
    closeout.

## Decision Register

The decisions below were approved by the product owner on 2026-11-25 for the
S122 execution scope. D121-01 through D121-18 remain authoritative.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D122-01 | Public package boundary | Keep only `openamx/transpiler-runtime`; preserve current `./transpiler-runtime` target and wildcard fallback. Test built-package resolution; do not expose internal engine modules. | S122 contract gate |
| D122-01 | Public package boundary | ACCEPTED: keep only `openamx/transpiler-runtime`; preserve current `./transpiler-runtime` target and wildcard fallback; do not expose internal engine modules. | Product owner, 2026-11-25 |
| D122-02 | Shared runtime errors | ACCEPTED: export stable AMX runtime diagnostic/error types with code, message, source context, and input path; preserve `AMXInputError` compatibility and delegated AMX identities. | Product owner, 2026-11-25 |
| D122-03 | AMX value and measurement types | ACCEPTED: publish recursive `AMXValue`, branded `AMXMeasurement<DimensionId>`, unit/input descriptors, and source-context types. | Product owner, 2026-11-25 |
| D122-04 | Operator API | ACCEPTED: expose closed `amxBinary` and `amxUnary` dispatchers for AMX operator semantics; no JavaScript `^`/index leakage. | Product owner, 2026-11-25 |
| D122-05 | Lists and ranges | ACCEPTED: expose `amxGet1Based`, `amxAdd1Based`, `amxRemove1Based`, `amxRange`, `amxIterate`, and `amxCopyListArgument` with evaluator behavior. | Product owner, 2026-11-25 |
| D122-06 | Builtin ownership | ACCEPTED: expose the closed current builtin set through `amxBuiltin`; reuse runtime behavior without public evaluator exports. | Product owner, 2026-11-25 |
| D122-07 | Recursive input schema | ACCEPTED: expose `AMXInputDescriptor<T>` and `validateAMXValue<T>` for typed recursive validation, including generated default factories. | Product owner, 2026-11-25 |
| D122-08 | Enum parity | ACCEPTED: verify string/numeric enum values recursively for direct generated inputs and file-backed JSON/CSV. | Product owner, 2026-11-25 |
| D122-09 | View DTO schema | ACCEPTED: retain separate table/chart/diagram kinds; preserve the S121 `AMXDiagramView` type/constructor input, tag constructed legacy values `legacy-v1`, and expose closed structured `structured-v2` diagrams as `AMXStructuredDiagramView`; keep DTOs renderer-independent. | Product owner, 2026-11-25 |
| D122-10 | Result type ownership | ACCEPTED: generated entry owns `AMXRunInputs`/`AMXRunExports`; helper owns generic `AMXRunResult<TExports>` and shared value/view types. | Product owner, 2026-11-25 |
| D122-11 | Immutability/copying | ACCEPTED: DTO constructors detach nested values and freeze snapshots without freezing caller values. | Product owner, 2026-11-25 |
| D122-12 | Public helper compatibility | ACCEPTED: external fixture imports only the built package subpath and compiles under the approved TS/Bun baseline. | Product owner, 2026-11-25 |
| D122-13 | Diagnostic code allocation | ACCEPTED: do not introduce new AMX codes/messages or change AMX semantics without separate allocation/disposition. | Product owner, 2026-11-25 |
| D122-14 | Interpolation formatting | ACCEPTED: expose `amxFormatValue` for String/Number/Boolean/Measurement/null formatting and preserve AMX3007 for unsupported values. | Product owner, 2026-11-25 |

## Source-Grounded Baseline

- `src/transpilerRuntime.ts` exports input guards, `AMXInputError`, a small
  measurement surface (`amxAttach`, `amxConvert`, physical value, equality),
  and basic table/chart/diagram DTO constructors.
- `src/runtime/evaluateExpression.ts` owns AMX binary/unary semantics,
  measurement-aware aggregates, range/list/loop behavior, and custom runtime
  source diagnostics. `src/runtime/standardLibrary.ts` owns sum/min/max/mean,
  round/abs/sqrt/pow, text functions, formatting, and math functions.
- `src/runtime/inputData.ts` owns file-backed typed JSON/CSV validation and
  enum support added under D121-16. Direct generated inputs go through helper
  functions and need their own public-fixture parity.
- `src/runtime/environment.ts` carries table/chart view emissions separately
  from diagram emissions. D121-15 requires ordered, distinct result DTOs.
- `package.json` already maps the public helper subpath to `dist` declarations
  and JavaScript. No package-version change or root `src/index.ts` export is
  authorized by S122.

## Boundaries

- S122 implements the helper package and its contract only. It does not
  implement the transpiler emitter, CLI, desktop export, docs/spec/example, or
  module graph file publication.
- The helper is an execution dependency for generated TypeScript, not an AMX
  parser/evaluator API. Generated code must not import `src/runtime/*`.
- Reuse existing behavior; if extracting shared semantics risks changing the
  interpreter, stop and request a narrow amendment rather than broadening the
  sprint.
- S121's multi-file publication residual is recorded but not implemented or
  resolved here. S120's VS Code and native/platform outcomes remain untouched.
- No release, publication, package/version, deployment, installer,
  distribution, or platform certification command is in scope.

## Expected File Scope

- Primary implementation: `src/transpilerRuntime.ts`.
- Existing runtime sources are read/reused. A shared semantic refactor may
  touch `src/runtime/measurement.ts`, `src/runtime/evaluateExpression.ts`,
  `src/runtime/standardLibrary.ts`, or `src/runtime/inputData.ts` only when
  required to avoid duplicated behavior and only inside the separately
  approved S122 file plan.
- Existing package export mapping in `package.json` is verified. It is not
  changed unless the approved package-resolution test proves a defect and the
  exact amendment is separately dispositioned; package version is unchanged.
- Focused test candidates: `tests/modules.test.ts`,
  `tests/evaluator.test.ts`, `tests/measurements.test.ts`,
  `tests/inputData.test.ts`, and `tests/measurementData.test.ts`.
- The independent consumer fixture and generated evidence belong under the
  approved S122 fixture/artifact roots. No root `dist` or shared output path is
  overwritten without the approved preservation procedure.