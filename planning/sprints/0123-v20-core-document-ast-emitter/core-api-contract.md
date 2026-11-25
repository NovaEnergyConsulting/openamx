# Sprint 123 Core Transpiler API Contract

## Status and Entry

Architect-prepared contract proposal. Implementation is blocked until S121
final feasibility closeout and separate S123 authorization. The emitted code
must consume the accepted S122 helper API and preserve the S121 per-module
source envelope.

## API Layers

Keep three boundaries separate:

1. **Core facade:** exported from `src/index.ts`; accepts an entry and complete
  pre-resolved in-memory source graph, parses/checks every module, and returns
  the complete TypeScript module graph or source-oriented diagnostics. No
  filesystem access or generated-code execution.
2. **Module emitter:** internal pure backend; consumes one parsed
  `OpenAmxDocument`, original source text, checked semantic context, module
  identity, and already-validated output-relative paths. Emits one module
  string into the graph result.
3. **S124 filesystem orchestrator:** discovers/loads `.amx` imports, enforces
  canonical path/root/cycle rules, constructs the in-memory graph input,
  invokes the core API, and publishes output files. It owns output collisions,
  overwrite/cancel and D121-18 best-effort rollback.

The core emitter must not import or call the filesystem `moduleLoader` to
discover dependencies. It validates the supplied graph in memory but never
publishes files or claims graph-publication atomicity.

## Candidate Public Signature

Candidate facade, subject to D123-01 and D123-03 disposition:

```ts
export interface TranspileSourceModule {
  readonly moduleId: string;
  readonly sourcePath: string;
  readonly outputPath: string;
  readonly sourceText: string;
  readonly resolvedImports: readonly Readonly<{
    importPath: string;
    moduleId: string;
  }>[];
}

export interface TranspileGraphInput {
  readonly entryModuleId: string;
  readonly modules: readonly TranspileSourceModule[];
}

export interface TranspiledModule {
  readonly moduleId: string;
  readonly sourcePath: string;
  readonly outputPath: string;
  readonly code: string;
}

export interface TranspileDiagnostic {
  readonly code: string;
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
}

export type TranspileResult =
  | Readonly<{ ok: true; entryModuleId: string; modules: readonly TranspiledModule[] }>
  | Readonly<{ ok: false; diagnostics: readonly TranspileDiagnostic[] }>;

export function transpileDocument(input: TranspileGraphInput): TranspileResult;
```

- `modules` is the complete source graph supplied by the caller, including
  original source for every node and one entry node. Each import mapping points
  from the exact AMX import spelling to a `moduleId`; the emitter computes the
  relative `.ts` specifier from the supplied output-relative paths.
- The facade parses each `sourceText`, validates unique module IDs, entry
  presence, import targets, reachability and acyclicity, and typechecks modules
  dependency-first. It derives imported checker symbols through an internal
  adapter; public types do not expose `ModuleCheckContext`,
  `ModuleCheckResult`, AST internals, environments, or loader records.
- S123 performs in-memory graph checks only. It does not canonicalize source
  paths, check filesystem root containment, resolve symlinks, discover missing
  source files, or write destinations; S124 owns those tasks.
- The facade emits no module strings until every module passes parse/check.
  Successful output contains one deterministic `TranspiledModule` per input
  node in dependency-first order. Any failure returns diagnostics and no
  `modules` property.
- Diagnostics preserve existing AMX code/message/file/line/column where
  available. Parser failures that are not already structured are adapted to
  the existing source diagnostic conventions; new stable code allocation is
  not inferred.
- The result type does not promise public npm package-root import. `src/index`
  exports the core entry as required by the master plan; adding an explicit
  `package.json` `.` export requires D123-03 disposition and is outside current
  S123 plan until approved.

## Parsing and Typechecking Order

- Parse every module's original source envelope. Preserve raw frontmatter
  separately from parsed metadata and original module identity.
- Validate graph identity/import structure and typecheck all modules in
  dependency-first order using `checkDocument` and a narrow checker adapter.
  Do not treat raw AST presence as checked semantics.
- If parsing or typechecking fails anywhere, return source-oriented diagnostics
  and no module graph. If code generation finds an unmapped node or unavailable
  checked fact, fail closed with source location; do not emit `any`, omit the
  node, or produce a partial graph.
- Runtime behavior errors occur only when generated `run(inputs)` executes;
  they use the S122 `AMXRuntimeError`/`AMXInputError` contract and source
  context. The transpiler itself never evaluates AMX expressions.

## Generated Entry Wrapper

- Generated entry declares collision-checked `AMXRunInputs` and
  `AMXRunExports`, uses `AMXRunResult<AMXRunExports>`, and exports synchronous
  `run(inputs)`.
- Every run validates the exact top-level input shape using S122
  `validateAMXValue` and generated `AMXInputDescriptor` metadata before
  evaluating statements. Each call initializes fresh mutable state.
- `exports` is constructed after statements and contains only explicitly
  exported entry-module values keyed by original AMX name. Unexported locals,
  types, functions, and imported values are not copied into it.
- `views` is built in module/source/evaluation order. Table/chart DTOs append
  at each executed `show`; structured-v2 diagram DTOs append at declaration
  time. Repeated shows produce repeated snapshots.
- Generated code does not prompt, read files, inspect environment, execute
  itself during transpilation, or render HTML/PDF/DOCX.

## Per-Run Module Initialization

- Every generated module exports a typed initializer accepting a shared
  per-run runtime context, imported dependency values, and the shared mutable
  view collector. Its mutable AMX bindings are local to that invocation.
- The entry `run(inputs)` validates entry inputs first, initializes each
  dependency once in dependency-first order, then initializes/evaluates the
  entry module. Imported modules cannot declare entry inputs under current AMX
  rules.
- Each initializer returns the module's explicit imported value/function
  surface. Importers bind those values using original AMX names mapped to
  deterministic internal names.
- Diagram DTOs append during module initialization; table/chart snapshots
  append only during a `show` reached in that module. All append to the one
  per-run view collector, preserving dependency/module/source order.
- Calling `run(inputs)` again reinitializes all module state and views; no
  mutable AMX module binding is stored at JavaScript ESM top level.

## Import and Name Policy

- AMX import declarations emit ESM named imports using the exact resolved
  `.ts` specifier derived from `resolvedImports` and output-relative paths.
  Explicit imported names and visibility are retained. The API validates
  in-memory graph targets but leaves filesystem validation to S124.
- Stable internal names are derived deterministically from source/module
  identity and declaration identity. Check collisions with JS reserved words,
  all user declarations, imported locals, helper aliases, wrapper names, and
  generated type names.
- Original AMX names remain keys in `exports`, enum value keys, record field
  names, and accessible import bindings. Mangling is internal only; source
  diagnostics refer to the original identifier.
- No absolute checkout path, temporary root, random value, timestamp, or
  filesystem enumeration order appears in emitted code.

## Package and Build Boundary

- Generated source imports only `openamx/transpiler-runtime` for runtime
  semantics. Type-only imports from that public subpath are permitted.
- S123 may compile the source module in the repository and may export it from
  `src/index.ts`; it does not change `package.json` version, package exports,
  or add an external compiler/runtime dependency without separate approval.
- TypeScript source fixtures use the S121/S122 baseline: TypeScript 5.9.3,
  ES2022 target, ESNext modules, strict checking, bundler resolution, and
  explicitly approved `.ts` import handling. Execute generated fixtures with
  Bun 1.4.5 or the separately recorded supported runner.