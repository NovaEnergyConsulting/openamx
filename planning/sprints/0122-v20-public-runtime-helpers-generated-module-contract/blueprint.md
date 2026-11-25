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

The decisions below are S122 proposals until separately reviewed and
dispositioned. D121-01 through D121-18 remain authoritative.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D122-01 | Public package boundary | Keep only `openamx/transpiler-runtime`; preserve current `./transpiler-runtime` target and wildcard fallback. Test built-package resolution; do not expose internal engine modules. | S122 contract gate |
| D122-02 | Shared runtime errors | Export a stable AMX runtime diagnostic/error contract with code, message, source file/line/column, and input path. Preserve `AMXInputError` compatibility and existing AMX codes/messages where behavior is delegated. | S122 contract gate |
| D122-03 | AMX value and measurement types | Publish recursive `AMXValue`, generic/branded `AMXMeasurement<DimensionId>`, `AMXUnitDescriptor<DimensionId>`, exact external `AMXMeasurementInput`, and source-context types. | S122 contract gate |
| D122-04 | Operator API | Provide typed public helpers or one typed dispatcher for arithmetic, equality/order, logical, unary, and type-test semantics. No JavaScript `^`/list-index leakage; preserve current AMX evaluation order and affine rules. | S122/S123 |
| D122-05 | Lists and ranges | Provide 1-based get/insert/remove, range construction, iteration, and list-argument copying with current bounds, mutation, and copy semantics. | S122/S123 |
| D122-06 | Builtin ownership | Expose the checked builtin set through a narrow typed entry (candidate `amxBuiltin`) backed by existing standard-library behavior; include measurement-specific aggregate/unary semantics without exporting evaluator internals. | S122 contract gate |
| D122-07 | Recursive input schema | Use a public descriptor/validator contract for primitive, DateTime, enum, nullable, list, record/default, and measurement values. Generated code may supply default factories; no unknown-key discard. | S122 contract gate |
| D122-08 | Enum parity | Verify string and numeric enum members recursively for direct generated inputs and file-backed JSON/CSV; defaults, nullable values, and invalid members have exact cases. | S121/S122 |
| D122-09 | View DTO schema | Keep table/chart/diagram discriminants; add sufficient chart labels/headings/series/measurement descriptors and complete declaration-time diagram data; no renderer types. | S122 contract gate |
| D122-10 | Result type ownership | Generated entry defines `AMXRunInputs` and `AMXRunExports`; helper package owns generic `AMXRunResult<TExports>` and `AMXShownView`. | S122/S123 |
| D122-11 | Immutability/copying | DTO constructors detach nested arrays/records from caller values and freeze the resulting tree; AMX value/list mutation semantics remain separate from view snapshot behavior. | S122 contract gate |
| D122-12 | Public helper compatibility | The separately authored fixture imports only the package subpath and compiles under TS 5.9.3/ES2022/ESNext/bundler with Bun 1.4.5 execution. | S122 contract gate |
| D122-13 | Diagnostic code allocation | Reuse existing AMX error identities for equivalent runtime conditions. Any new code/message or behavior change requires project-owner allocation and separate disposition. | Lead Developer allocator |

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