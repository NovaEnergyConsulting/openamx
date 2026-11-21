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
  spelling or YAML comments. D121-13 must define an original-source input or
  explicitly disposition frontmatter; do not serialize parsed metadata and
  call it original-source preservation.
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
- Generated API names use an `AMX`-prefixed reserved namespace (candidate
  `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`) and are checked against AMX
  declarations so user names are neither shadowed nor silently renamed.
- Exported functions/types/enums may be TypeScript module exports when required
  by an AMX import, but are not serialized into the entry `exports` object.

## Generated Type and Data Shapes

- `Number`, `String`, and `Boolean` map to `number`, `string`, and `boolean`.
  `DateTime` uses one accepted public alias and preserves the current runtime
  representation. Lists map to AMX-compatible typed lists; nullable types map
  to `T | null`.
- Records map to named interfaces with inheritance, optional fields, and
  nullability kept distinct. Enums map to a readonly value object and a
  corresponding value-union type, preserving checked resolved values.
- Dimension-typed values use a branded/generic `AMXMeasurement<DimensionId>`
  rather than plain `number`. Unit descriptors carry dimension identity,
  scale, offset, and display-unit name through the helper contract.
- Generated values avoid `any`. `unknown` is permitted only at runtime input
  validation boundaries, before conversion to a checked generated type.
- View DTOs are public, renderer-independent, readonly data. The S121 contract
  must settle exact fields for each discriminant. Candidate minimum:
  `table` includes ordered columns and rows; `chart` includes chart kind,
  selected data/series, measurement descriptors, and resolved `showTable`
  (with table data only when visible); `diagram` includes title/description,
  canvas, timeline, and ordered structured scene/frame data.
- View DTOs must not expose `ChartViewModel`, ECharts options, renderer
  accessibility internals, live `Environment` objects, Maps/Sets, or private
  diagram serialization envelopes. Measurements remain typed helper values;
  external `{ value, unit }` encoding is not silently imposed on runtime API
  results.

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
  lists/records, optional/null fields, enum values, and measurement dimension
  compatibility.
- Structured table/chart/diagram snapshot constructors, with no HTML/PDF/DOCX
  renderer or filesystem access.
- A narrow diagnostic/error type carrying source module and input path context.

The public entry must not re-export parser, checker, evaluator, filesystem
module loader, CLI, renderer, or unrelated engine internals. Generated imports
must be stable across patch releases within the helper API's declared
compatibility policy.

## Compiler and Module Compatibility Candidate

- Match the repository's present baseline: ESM, ES2022 output target, ESNext
  modules, and TypeScript bundler resolution. Reverify the installed/compiler
  version at S121 execution; TypeScript 5.9.x is the current candidate baseline.
- Keep generated relative imports as `.ts` as specified by the V0.20 plan.
  Typecheck with the accepted `allowImportingTsExtensions`/no-emit or
  equivalent supported configuration; execute the fixture with the approved
  TypeScript-capable runtime (candidate: Bun). Do not imply that raw `.ts`
  specifiers execute under arbitrary Node/module configurations.
- S121 must prove the full path: generated module imports the public helper
  subpath, the fixture typechecks under the accepted configuration, and the
  fixture executes to parity. A source-text compile or hand-copied helper is
  not sufficient.
- The package's existing lack of an `exports` map is a compatibility risk.
  Before S122 changes it, enumerate currently supported root/CLI/package
  entry points and preserve them intentionally.

## Runtime Input Validation

`run(inputs)` performs runtime validation even when the caller uses TypeScript
types. Candidate rules, to be reconciled with `src/runtime/inputData.ts` and
accepted during S121:

- The top-level value must be an object containing every declared input.
- Each value must satisfy the AMX type recursively. Validate finite numeric
  values where the existing AMX input contract requires finiteness; preserve
  nullable and optional record-field distinctions.
- Enum values must be members of the declared enum. Record keys/unknown-key
  policy must match existing AMX validation or be raised as a blocking
  compatibility question; do not silently discard a key during conversion.
- A measurement must carry a compatible dimension and a valid display unit;
  the runtime helper retains scale/offset metadata and the caller's display
  intent. Never accept a raw number where a measurement is required.
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
is implemented.