# Sprint 121 Generated Module and Runtime Contract

## Status

Architect-prepared proposal based on the V0.20 master plan and current root
package/tsconfig. Public shape, TypeScript baseline, and helper subpath are
contract-gate decisions; the candidate choices below do not change product
behavior until disposition.

## Narrative and Source Fidelity

- Walk `OpenAmxDocument.nodes` in source order. Every non-AMX Markdown line,
  non-AMX fenced block, blank line, and literal `{{ expression }}` sequence
  becomes an inert TypeScript line comment. Never parse or evaluate prose
  interpolation.
- YAML frontmatter is currently removed from source text and retained only as
  parsed `metadata`, so `OpenAmxDocument` alone cannot preserve its original
  spelling or YAML comments. Candidate D121-13 contract: every module source
  envelope carries both the parsed document and original source text; emit
  every raw frontmatter line as an inert comment under the normalized line
  encoding before body nodes. Do not serialize parsed metadata and call it
  original-source preservation. This proposal still requires owner disposition.
- Candidate encoding: split on ECMAScript line terminators (CRLF, CR, LF,
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

Candidate generated entry shape:

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
- `result.views` contains one structured snapshot per executed `show`, in
  source/evaluation order. Repeated shows remain separate entries. Non-shown
  declarations are not included. It is data, never rendered HTML/PDF/DOCX.
- Generated API names use an `AMX`-prefixed reserved namespace (candidate
  `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`). D121-14 proposes lowering
  every AMX declaration to a deterministic, collision-checked internal
  TypeScript identifier so source names cannot shadow the public wrapper/types;
  original AMX names remain keys in exports and import bindings.
- Source-facing AMX names are preserved only as explicit result keys and
  module bindings; generated implementation identifiers are deterministically
  mangled. This is the D121-14 candidate rule, not a promise to retain AMX names
  as local TypeScript identifiers.
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
  `AMXRunInputs`, the candidate external measurement shape is
  `AMXMeasurementInput<DimensionId> = { value: number; unit: string }`; the
  helper validates it and constructs the internal measurement. Unit
  descriptors carry dimension identity, scale, offset, and display-unit name.
- Generated values avoid `any`. `unknown` is permitted only at runtime input
  validation boundaries, before conversion to a checked generated type.
- View DTOs are public, renderer-independent, readonly data. Candidate table
  snapshots preserve the runtime's ordered data; measurement values use the
  current snapshot display text and nested arrays/records are copied as data.
  Candidate chart snapshots preserve chart kind, normalized numeric data,
  labels/headings, measurement descriptors, and resolved `showTable`; they do
  not contain renderer models, accessibility markup, or an extra rendered
  table payload. Exact fields remain a contract decision.
- Current diagrams are not `show` snapshots: the checker allows `show` only
  for tables/charts, while diagram declarations produce a separate
  declaration-time runtime emission. Whether diagram data is represented in
  `result.views` or otherwise returned is blocked by D121-15. Do not claim
  parity or finalize the result union until the product owner decides.
- View DTOs must not expose `ChartViewModel`, ECharts options, renderer
  accessibility internals, live `Environment` objects, Maps/Sets, or private
  diagram serialization envelopes. Table snapshots and chart normalization
  must still match the current AMX runtime view-data contract.

## Runtime Helper Boundary

Candidate package subpath: `openamx/transpiler-runtime`. The name is proposed
because the current package has no export map and generated code must not
import private implementation paths. S122 owns the public implementation.

The accepted public subpath should expose only the following categories:

- Stable public types for AMX values, measurements, units, inputs, and shown
  view DTOs.
- Numeric/list semantics: 1-based indexing, bounds errors, range iteration,
  append/insert/remove behavior, and AMX value formatting.
- Measurement semantics: attach/convert, arithmetic/comparison, standard
  library operations, unit identity, and finite/domain diagnostics.
- Input validation from `unknown` to generated typed inputs, including nested
  lists/records, optional/null fields, and measurement dimension
  compatibility. Enum input validation remains excluded until D121-16 is
  dispositioned.
- Structured table/chart/diagram snapshot constructors, with no HTML/PDF/DOCX
  renderer or filesystem access.
- A narrow diagnostic/error type carrying source module and input path context.

The public entry must not re-export parser, checker, evaluator, filesystem
module loader, CLI, renderer, or unrelated engine internals. Generated imports
must be stable across patch releases within the helper API's declared
compatibility policy.

## Compiler and Module Compatibility Candidate

- Match the repository's present baseline: package ESM, ES2022 target, ESNext
  modules, strict checking, and bundler resolution. The root lockfile resolves
  TypeScript 5.9.3; this is the candidate compiler version, not proof of the
  installed executable version at S121 execution.
- Keep generated relative imports as `.ts` as specified by the V0.20 plan.
  Use a strict fixture typecheck with `allowImportingTsExtensions` and
  `noEmit`, matching ES2022/ESNext/bundler settings; execute with the approved
  TypeScript-capable runtime (candidate: Bun, exact version to be recorded).
  Do not imply that raw `.ts` specifiers execute under arbitrary Node/module
  configurations. The root tsconfig does not currently set
  `allowImportingTsExtensions`.
- S121 must prove the full path: generated module imports the public helper
  subpath, the fixture typechecks under the accepted configuration, and the
  fixture executes to parity. A source-text compile or hand-copied helper is
  not sufficient.
- The package's existing lack of an `exports` map is a compatibility risk.
  Before S122 changes it, enumerate currently supported root/CLI/package
  entry points and preserve them intentionally.

## Runtime Input Validation

`run(inputs)` performs runtime validation even when the caller uses TypeScript
types. Candidate rules, grounded in `src/runtime/inputData.ts` and subject to
S121 disposition:

- The top-level value must be a non-null, non-array object containing every
  declared entry input and no unknown input keys. Imported modules cannot
  declare inputs. Missing or extra keys reject before any AMX statement runs.
- Each value is recursively validated against its AMX type. `Number` must be
  finite; `String` and `Boolean` must have their exact primitive types;
  `DateTime` must be valid RFC 3339 text and remains a string. Nullable values
  accept `null` only where the declared type is nullable.
- A measurement input uses the existing external shape `{ value, unit }` with
  exactly those two keys, a finite numeric value, and a unit string. Resolve
  the unit against the module graph, require matching dimension identity and a
  finite physical value, then construct the helper's internal measurement.
  A raw number is not accepted for a measurement.
- Record inputs reject unknown fields. Missing fields with defaults evaluate
  those defaults in declaration order; otherwise missing optional fields
  materialize as `null`, and missing required fields fail. Explicit `null`
  remains distinct from an absent field. Lists preserve element order and
  recursively apply these rules.
- Enum annotations are checker-accepted but are not handled by the existing
  runtime input converter. D121-16 blocks enum-input support/parity until the
  product owner decides how this baseline mismatch is handled; do not claim
  enum validation from a proposed helper alone.
- An invalid input fails before any AMX statements execute and identifies the
  input/property path plus expected type. It does not return partial exports
  or views.
- No prompt, file mapping, implicit JSON load, or CLI-only input behavior is
  part of generated `run`.

## S121 Feasibility Proof

The isolated boundary fixture must demonstrate, at minimum:

1. An entry module importing an explicitly exported function/value from a
   sibling generated module, with relative `.ts` import resolution.
2. One measurement attach/conversion or operation that compares by value and
   unit with AMX runtime output.
3. One declared input supplied by the caller, plus a rejected invalid value.
4. One `show` result represented by a public structured-view DTO and matched
   against AMX runtime view data.

Record exact sources, tool versions, compile/run commands, raw output, parity
assertions, package subpath used, and limitations in `builder-evidence.md`.
This proof is a boundary feasibility result, not evidence that the full emitter
is implemented. At the current baseline the proposed public subpath is absent;
the probe is blocked until D121-17 decides how it can exercise that boundary
without private engine imports or hand-copied helper behavior. No probe has
been run or authorized.