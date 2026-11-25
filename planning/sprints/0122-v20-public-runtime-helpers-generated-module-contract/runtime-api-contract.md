# Sprint 122 Public Runtime API Contract

## Status

Architect-prepared contract proposal for the existing
`openamx/transpiler-runtime` subpath. S121's tested exports remain the
compatibility baseline; additions below are required candidates for S122.
Exact public names/signatures are finalized before implementation and then
covered by declaration-file tests.

## Public Boundary

- Import path is exactly `openamx/transpiler-runtime`. The package subpath is
  already present in `package.json`; S122 verifies its built JavaScript and
  declaration targets, fallback behavior, and unchanged CLI bin.
- Public declarations may reference only public types from the same helper
  entry. They must not leak `Environment`, AST nodes, `CheckedType`, internal
  `MeasurementValue`, parser/checker/evaluator functions, renderer models, or
  file-system/module-loader APIs.
- Internal code may reuse `runtime/measurement.ts`,
  `runtime/standardLibrary.ts`, evaluator behavior, and diagnostic constructors
  where this does not create a public dependency or semantic fork.
- Additions are additive within the V0.20 helper surface. Do not change package
  version or imply independent stable semver guarantees beyond the accepted
  generated-module contract.

## Public Types

Candidate public types:

| Type | Contract |
| --- | --- |
| `AMXSourceContext` | Optional AMX source file, 1-based line/column, and runtime input path. It contains no AST object. |
| `AMXRuntimeDiagnostic` | Readonly AMX code/message plus available source/input context. |
| `AMXRuntimeError` | Public catchable runtime error carrying `AMXRuntimeDiagnostic`; original error cause may be retained privately. |
| `AMXInputError` | Preserve current `TypeError` compatibility, `AMX4003`, `inputPath`, `expected`, and `actual`; add source context only additively. |
| `AMXValue` | Recursive AMX runtime data union: primitive/null, typed measurement, readonly/mutable list value, and readonly record data. Avoid `any`; include only values emitted by checked AMX. |
| `AMXMeasurement<DimensionId>` | Opaque/branded runtime measurement preserving displayed value and unit identity. It is not interchangeable with a plain number. |
| `AMXMeasurementInput<DimensionId>` | Exact external shape `{ value: number; unit: string }`; no serialized offset/scale/physical-value fields. |
| `AMXUnitDescriptor<DimensionId>` | Validated identity/name, positive finite scale, finite offset, dimension vector, and optional factor metadata. |
| `AMXRunResult<TExports>` | Readonly `{ exports: Readonly<TExports>; views: readonly AMXShownView[] }`. Entry-specific `AMXRunInputs`/`AMXRunExports` remain generated types. |
| `AMXShownView` | Discriminated union of `AMXTableView`, `AMXChartView`, and `AMXDiagramView`, as specified in `view-dto-contract.md`. |

An opaque measurement brand must not alter the external `{ value, unit }`
contract or require users to forge an internal measurement object. Helpers
construct the branded runtime value after validation.

## Operation Helpers

Generated code uses native TypeScript only where semantics are identical. The
candidate public operation surface is either typed operator-specific functions
or a single `amxBinary`/`amxUnary` dispatcher with overloads that preserve
strict caller typing. The S122 disposition must choose and document one shape;
do not expose both redundant forms without a demonstrated need.

| Behavior | Required semantics |
| --- | --- |
| Number/string/Boolean coercion | Match `toNumber` and `toBoolean` behavior for accepted AMX expressions; do not rely on JavaScript truthiness/coercion defaults where they differ. |
| `+`, `-` | Match numeric/string/typechecker-approved behavior and measurement rules. Compatible measurement subtraction retains left display unit; direct affine addition rejects with accepted diagnostic. |
| `*`, `/`, `%`, `^` | Match Number semantics and dimensional measurement composition; reject affine composition, zero division/domain failures, non-integral dimensional exponents, and non-finite results as AMX does. `^` is exponentiation, never JS XOR. |
| `==`, `!=`, ordering | Measurements compare canonical physical values and compatible dimensions. Other values preserve current strict equality/order rules. |
| `and`, `or`, `not` | Preserve current AMX Boolean conversion. Binary logical operands both evaluate exactly once, left-to-right, before applying `and`/`or`; `not` evaluates its argument once. |
| Runtime type test | Match AMX records, enums, nullable/list types, and dimension-vector measurement checks without exposing checker internals. |
| List access | 1-based `amxGet1Based`; bounds and index diagnostics preserve current code, message, source location, and evaluation order. |
| Range | Inclusive ascending or descending finite integer range, with accepted invalid-bounds and overflow behavior (`AMX1005`). |
| List add/remove | 1-based insertion/removal, optional append and pop, positive count/index validation, immutable imported-list rejection, and current `AMX1008` behavior. |
| List copy | Recursive array copy for function list parameters; preserve values and isolate caller-owned nested arrays exactly as current function calls do. |
| Iteration | Stable source order, one iterator value per loop, scoped binding behavior, and iterable validation (`AMX1006`). |
| String interpolation | Format only the AMX-approved String/Number/Boolean/Measurement/null types; reject unsupported values at their source location. |

If the S122 API uses a dispatcher, its public operator union is closed to the
current AST operators. It returns a type usable by strict generated code with
no public `any`; generated expressions may use checker-derived assertions only
where the operation's checked result type is not expressible as a public
conditional type.

## Measurement and Builtin Helpers

- Retain `amxAttach`, `amxConvert`, `amxPhysicalValue`, and `amxEqual`, with
  existing input validation and display-unit behavior preserved.
- Add measurement-aware add/subtract/multiply/divide/power/comparison support
  required by `evaluateExpression.ts`, including dimensions, scale/offset,
  compatible vectors, first/left display-unit selection, finite checks, and
  affine rejections.
- Add the currently supported builtin set through a narrow typed entry
  (candidate `amxBuiltin(name, args, context)`): `sum`, `min`, `max`, `mean`,
  `round`, `abs`, `sqrt`, `pow`, `len`, `trim`, `left`, `right`, `format`,
  `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`,
  `asinh`, `acosh`, `atanh`, `ln`, `log`, and `exp`.
- Measurement-specific builtin behavior must match the evaluator: affine
  `sum`/`mean` aggregate physical values and return the first display unit;
  `min`/`max` select the original measurement; `abs`/`round` preserve display
  unit; mathematical functions require dimensionless values; affine `sqrt` and
  `pow` reject.
- Reuse `evaluateStandardLibraryCall` or factor shared implementation only if
  diagnostic context and behavior remain consistent. Do not export it directly.

## Error and Source Context

- Add optional `AMXSourceContext` to helpers that can fail during generated
  execution. Preserve file path, 1-based line/column, and nested input path.
- Keep existing AMX codes/messages for semantically equivalent runtime
  failures: measurement (`AMX1009`, `AMX3007` where applicable), range
  (`AMX1005`), list (`AMX1008`), and standard-library families
  (`AMX2000`-`AMX2005`, `AMXSL001`-`AMXSL006`). Use exact existing identities;
  any new code or changed message needs allocator approval.
- `AMXInputError` continues to expose `AMX4003` and its current properties.
  Generated source may catch the public error type and inspect its stable
  fields; it must not parse `Error.message` to recover data.
- Do not leak absolute build/source paths into a diagnostic if the caller
  provides a normalized module path. Runtime context is passed explicitly,
  never read from process state.

## Compatibility and Determinism

- Existing S121 public functions remain callable with their prior signatures;
  optional context parameters are additive or new overloads preserve existing
  consumers.
- Public objects and descriptor arrays have deterministic property/order
  behavior where it is observable. No locale/timezone/environment dependency
  is introduced except the explicit existing `format` locale argument.
- S122 has no multi-file output writer, package-version update, or release
  work. The accepted rollback residual remains documented for S124/S125.