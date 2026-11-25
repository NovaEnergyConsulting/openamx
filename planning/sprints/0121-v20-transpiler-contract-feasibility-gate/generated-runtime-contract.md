# Sprint 121 Generated Module and Runtime Contract

## Status

The product owner accepted D121-01 through D121-18 on 2026-11-25. The
authorized helper-boundary slice and enum checker/input prerequisite are
implemented and focused-tested. Run-01 passed against the public helper
subpath; final Sprint 121 disposition remains separately recorded in
`builder-evidence.md`.

## Narrative and Source Fidelity

- Walk `OpenAmxDocument.nodes` in source order. Every non-AMX Markdown line,
  non-AMX fenced block, blank line, and literal `{{ expression }}` sequence
  becomes an inert TypeScript line comment. Never parse or evaluate prose
  interpolation.
- YAML frontmatter is currently removed from source text and retained only as
  parsed `metadata`, so `OpenAmxDocument` alone cannot preserve its original
  spelling or YAML comments. Accepted D121-13 requires each module source
  envelope to carry both the parsed document and original source text; emit
  every raw frontmatter line as an inert comment under the normalized line
  encoding before body nodes. Do not serialize parsed metadata and call it
  original-source preservation.
- Accepted D121-02 encoding: split on ECMAScript line terminators (CRLF, CR, LF,
  U+2028, and U+2029), normalize separators to LF, then prefix each line with
  `// `; encode an empty source line as `//`. Do not use block comments, so
  embedded `*/` cannot terminate a comment. A final source newline is
  represented deterministically. Keep source content after the prefix
  unchanged; this is content preservation, not byte-for-byte output.
- Emit executable AMX blocks at their original positions among narrative
  comments. Do not copy raw AMX fence delimiters as executable TypeScript.
- Golden tests compare comment bodies, line order, blank lines, Unicode,
  embedded comment terminators, non-AMX fences, and literal interpolation.

## Public Generated API

Accepted generated entry shape:

```ts
export interface AMXRunInputs {
  readonly requestedLoad: number;
}

export interface AMXRunExports {
  readonly selectedAsset: Asset;
}

export interface AMXRunResult {
  readonly exports: Readonly<AMXRunExports>;
  readonly views: readonly AMXShownView[];
}

export function run(inputs: AMXRunInputs): AMXRunResult;
```

- `AMXRunInputs` includes every entry-module `input` as a required typed
  property. With no inputs it is an empty object type; generated `run` still
  takes an explicit object. Inputs in imported modules remain invalid under
  existing module rules.
- `run` creates a fresh evaluation state on each call, validates its argument,
  executes synchronously, and returns a new result. It does not prompt, read
  files, inspect process environment, or retain mutable state across calls.
- `AMXRunExports` and `result.exports` contain explicitly exported entry-module
  values only. Unexported locals and imported module values are not copied
  into the result. Generated module exports still follow AMX visibility for
  inter-module imports.
- `result.views` contains table/chart snapshots for each executed `show` and
  declaration-time diagram emissions as distinct discriminants. Preserve
  module traversal and source/evaluation order; repeated shows remain separate
  entries. Do not add AMX `show` support for diagrams. It is data, never
  rendered HTML/PDF/DOCX.
- Generated API names use an `AMX`-prefixed reserved namespace (accepted
  `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`). D121-14 lowers every AMX
  declaration to a deterministic, collision-checked internal TypeScript
  identifier; original AMX names remain keys in exports and import bindings.
- Exported functions/types/enums may be TypeScript module exports when required
  by an AMX import, but are not serialized into the entry `exports` object.

## Generated Type and Data Shapes

- `Number`, `String`, `Boolean`, and `DateTime` map to `number`, `string`,
  `boolean`, and `string`. DateTime values retain the current RFC 3339 string
  representation and are runtime-validated at input boundaries. Lists map to
  AMX-compatible typed lists; nullable types map to `T | null`.
- Records map to named interfaces with inheritance, optional fields, and
  nullability kept distinct. Enums map to a readonly value object and a
  corresponding value-union type, preserving checked resolved values.
- Dimension-typed runtime values use a branded/generic
  `AMXMeasurement<DimensionId>` rather than plain `number`. In generated
  `AMXRunInputs`, the external measurement shape is
  `AMXMeasurementInput<DimensionId> = { value: number; unit: string }`; the
  helper validates it and constructs the internal measurement. Unit
  descriptors carry dimension identity, scale, offset, and display-unit name.
- Generated values avoid `any`. `unknown` is permitted only at runtime input
  validation boundaries, before conversion to a checked generated type.
- View DTOs are public, renderer-independent, readonly data. Table snapshots
  preserve ordered columns and rows; measurement values use the current
  snapshot display text and nested arrays/records are copied as data. Chart
  snapshots preserve chart kind, normalized numeric data, labels/headings,
  measurement descriptors, and resolved `showTable`; they do not contain
  renderer models, accessibility markup, or a rendered table payload.
- Diagrams remain declaration-time emissions, not `show` snapshots. Accepted
  D121-15 places each in `result.views` as a distinct `diagram` DTO, ordered
  alongside show snapshots by module and source/evaluation order. This does not
  change AMX `show` semantics.
- View DTOs must not expose `ChartViewModel`, ECharts options, renderer
  accessibility internals, live `Environment` objects, Maps/Sets, or private
  diagram serialization envelopes.

## Runtime Helper Boundary

Accepted package subpath: `openamx/transpiler-runtime`. The package export map
targets `dist/transpilerRuntime.js` and `dist/transpilerRuntime.d.ts`; a `./*`
fallback preserves prior deep-subpath resolution, and the existing CLI `bin`
is unchanged. Generated code must not import private implementation paths.

The approved, implemented probe-boundary slice exports:

- `AMXInputError` with `AMX4003`, input path, expected type, and actual type.
- `requireAMXNumber`, `requireAMXString`, `requireAMXBoolean`,
  `requireAMXEnum`, `requireAMXList`, `requireAMXRecord`, and
  `requireAMXMeasurement`.
- `AMXUnitDescriptor`, `AMXMeasurement`, `amxAttach`, `amxConvert`,
  `amxPhysicalValue`, and `amxEqual`.
- Readonly `AMXTableView`, `AMXChartView`, `AMXDiagramView`, and
  `AMXShownView`, plus `amxTableView`, `amxChartView`, and `amxDiagramView`.

The public entry must not re-export parser, checker, evaluator, filesystem
module loader, CLI, renderer, or unrelated engine internals. This is the tested
boundary slice, not full S122 completion. List mutation/range semantics,
remaining standard-library/domain operations, additional view data, and full
generated-type integration remain S122/S123 work.

## Compiler and Module Compatibility

- Baseline: package ESM, ES2022 target, ESNext modules, strict checking, and
  bundler resolution. The approved run recorded Bun 1.4.5 and TypeScript 5.9.3.
- Keep generated relative imports as `.ts`. The strict fixture typecheck uses
  `allowImportingTsExtensions` with `noEmit`; the root tsconfig does not
  currently set that option. Do not imply that raw `.ts` specifiers execute
  under arbitrary Node/module configurations.
- Run-01 typechecked a separately authored fixture importing the public helper
  subpath and relative `.ts` module, then executed it with Bun. This does not
  prove arbitrary module-runner compatibility.
- The root package baseline had no `exports` map. The added subpath plus
  wildcard fallback preserves previous direct subpath access; no root API or
  CLI `bin` change is part of this helper slice.

## Runtime Input Validation

`run(inputs)` performs runtime validation even when the caller uses TypeScript
types. D121-10 rules are grounded in `src/runtime/inputData.ts`; D121-16
checker/runtime enum support is implemented and focused-tested.

- The top-level value must be a non-null, non-array object containing every
  declared entry input and no unknown input keys. Imported modules cannot
  declare inputs. Missing or extra keys reject before any AMX statement runs.
- Each value is recursively validated against its AMX type. `Number` must be
  finite; `String` and `Boolean` must have exact primitive types; `DateTime`
  must be valid RFC 3339 text and remains a string. Nullable values accept
  `null` only where the declared type is nullable.
- A measurement input uses the exact external shape `{ value, unit }`, a finite
  numeric value, and a unit string. Resolve the unit against the module graph,
  require matching dimension identity and finite physical value, then
  construct the helper's internal measurement. A raw number is not accepted.
- Record inputs reject unknown fields. Missing fields with defaults evaluate
  those defaults in declaration order; otherwise missing optional fields
  materialize as `null`, and missing required fields fail. Explicit `null`
  remains distinct from an absent field. Lists preserve order and recurse.
- Enum annotations use resolved string/number members. Reject nonmembers
  before AMX statements execute. Focused JSON/CSV tests pass. Run-01's public
  helper parity case uses Number input; enum-specific helper/oracle parity is
  not separately claimed.
- Invalid input returns no result object. `run` does not prompt, read files,
  inspect environment, or use implicit inputs.

## S121 Feasibility Proof

Run-01 passed the approved four-case boundary plus the D121-15 diagram case:

1. Imported `twice` helper and relative `.ts` import: `doubled === 12`.
2. `1 kilometer` converts to `1000 meter`; equality against `1000 meter` is
   `true`. Unit text and normalized `Length` identity match exactly.
3. Caller amount `6` returns `12`; generated string, missing, and positive-
   infinity values reject at `amount`; AMX rejects the invalid JSON input with
   `AMX4003` before evaluation.
4. Chart `show` yields `[2, 4]` with `showTable: true`; the empty diagram
   declaration yields a distinct ordered diagram DTO without `show` syntax.
   Generated and reference exports/views match structurally.

The reference-only oracle imports `loadEntryModule` to observe AMX exports and
view emissions. The generated fixture imports only `openamx/transpiler-runtime`;
no renderer internals or emitter implementation are used. See
`builder-evidence.md` and `artifacts/probe-01/` for exact sources, commands,
raw outputs, failures, hashes, and limitations. This is not full emitter,
CLI/desktop, rendered report, native/platform, or release acceptance.