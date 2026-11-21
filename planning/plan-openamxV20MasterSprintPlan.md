# OpenAMX V0.20 Master Sprint Plan

## Problem and Proposed Approach

OpenAMX documents combine Markdown narrative, executable AMX fences, imported modules, typed inputs, and report declarations. V0.20 will add one feature: a core-engine transpiler that emits valid TypeScript from `.amx` documents and is made available through the CLI and desktop app.

The transpiler will use the existing parser and checker to validate a document and its module graph, lower checked AMX syntax into TypeScript, preserve non-AMX Markdown as comments, and emit corresponding TypeScript modules for imported AMX modules. Generated code will preserve AMX calculation semantics with support from a versioned OpenAMX runtime helper package where direct TypeScript would differ. The generated entry module will expose `run(inputs)`, returning explicit exports and structured data for shown views. This is calculation and data parity, not a second HTML, PDF, or DOCX renderer.

Implementation follows the V0.19 Sprint 120 closeout disposition and begins with the V0.20 contract gate in Sprint 121. This plan authorizes no release, publication, package-version change, deployment, or platform certification.

## Confirmed Product Decisions

- **Version scope:** V0.20 adds one capability: AMX-to-TypeScript transpilation in the core engine, available through the CLI and desktop app.
- **Generated code:** Emit native TypeScript constructs that preserve AMX calculation behavior when compiled and run. Generated modules may import a versioned OpenAMX runtime helper package.
- **Language coverage:** Cover all AMX features supported by the implementation baseline, including the V0.19 language additions.
- **Validation:** Parse and type-check before emission. Invalid documents fail with source-oriented diagnostics; do not emit partial best-effort output.
- **Narrative:** Preserve all non-AMX Markdown source as TypeScript line comments, including Markdown syntax, non-AMX fences, blank lines, and literal `{{ expression }}` interpolation text. Do not evaluate narrative interpolation.
- **Modules:** Transpile imported `.amx` modules to corresponding `.ts` modules and rewrite relative imports.
- **Generated API:** Generate an entry-module `run(inputs)` function. The caller supplies input values; generated code does not prompt interactively. `run` returns `{ exports, views }`, containing explicitly exported values and structured data for report/diagram views selected by `show`.
- **Behavior boundary:** Preserve calculation and structured report/view data semantics, but do not render HTML, PDF, or DOCX from generated TypeScript.
- **Surfaces:** Provide CLI file output and a desktop TypeScript export action. Defer source maps.
- **Release authority:** This plan does not authorize release, publication, package-version changes, deployment, or platform certification.

## Recommended Approach

- Reuse document parsing, type checking, module resolution, and the typed AST. Add a dedicated AST-to-TypeScript backend rather than executing AMX and serializing runtime values.
- Keep emission deterministic and source ordered. Emit TypeScript types for records, enums, inputs, exports, and view data. Route AMX-specific semantics, including 1-based indexing, units, standard-library behavior, and input validation, through a small documented runtime surface.
- Expose generated-code helpers through a stable package subpath. Settle the precise export path and TypeScript/module compatibility baseline in Sprint 121. Use the supported TypeScript toolchain to compile generated fixtures; do not add a compiler dependency to runtime execution unless the contract gate establishes a need.
- Mirror each source module's relative path under an output root and rewrite imports to `.ts`. Recommended CLI shape: `openamx transpile <entry.amx> --out-dir <directory>`. Use explicit destination selection and confirmation for graph output; do not silently overwrite files.
- Use golden output fixtures and compile-and-execute comparisons against AMX runtime results. Compare explicit exports and structured shown-view data, not rendered report bytes.

## Confirmed Scope

### Core Transpiler

- Add a typed core transpile API that accepts an entry document and produces the TypeScript module graph or source-oriented diagnostics.
- Emit valid TypeScript for prose and all executable AMX fences, in document order.
- Lower all language constructs supported by the V0.20 baseline, including declarations, expressions, functions, types, enums, units/measurements, inputs, exports, tables, charts, diagrams, and `show` behavior.
- Generate typed caller-supplied input parameters and a `run(inputs)` result containing explicit exports and shown view data.
- Preserve source paths and ranges in diagnostics. Make generated output deterministic.

### Module Graph and CLI

- Recursively transpile imported AMX modules, preserving explicit exports and rewriting relative module paths.
- Mirror the source graph under the selected output root. Apply existing project/module containment and cycle rules.
- Add an `openamx transpile` CLI command that writes the complete module graph to a destination directory and reports parse, type, and output errors clearly.
- Detect destination collisions and avoid silent overwrite. Final destination defaults and overwrite interaction are contract-gate items.

### Desktop and Documentation

- Add a desktop export action for the active `.amx` entry document. Use the established job, destination, cancellation, and overwrite-confirmation patterns, extended safely for multi-file graph output.
- Add `docs/language-spec-v0.20.md` as an additive contract and link it from README navigation. Do not revise historical specifications.
- Add a focused example demonstrating prose comments, executable fences, module imports, inputs, exports, and shown structured views.

### Tests and Acceptance

- Add focused emitter golden tests and generated-source TypeScript compilation tests for every supported AST family.
- Compare generated `run(inputs)` exports and shown views with AMX runtime results for representative calculations, modules, inputs, measurements, lists, and report/diagram data.
- Add CLI and desktop coverage for successful graph output, invalid documents, destination collisions, cancellation, overwrite, and stale document identity.

## Explicit Exclusions

- HTML, PDF, or DOCX rendering from generated TypeScript; report declarations are emitted as structured data only.
- Evaluation of `{{ expression }}` narrative interpolation; it remains literal comment text.
- Source maps, editor integration, new AMX syntax, changes to AMX runtime behavior, and unrelated CLI or desktop work.
- Silent best-effort output or partial emission for parse/type errors.
- Release publication, deployment, package/version changes, and platform certification.

## Sprint Sequence

Continue after V0.19 Sprint 120. Planning may begin earlier, but implementation beyond the contract gate depends on the V0.19 closeout disposition being recorded and Sprint 121 acceptance.

### Sprint 121: Transpiler Contract and Feasibility Gate

Architect-prepared Sprint 121 documentation package.

- Define a complete AST-to-TypeScript mapping for every supported AMX node, including statements, type forms, measurements, inputs, imports, diagrams, tables/charts, and `show` behavior.
- Specify comment encoding, `run(inputs)` input/result types, input validation, runtime-helper ownership, package subpath, TypeScript/module baseline, module graph paths, collision/overwrite behavior, and diagnostics.
- Build golden fixtures and a parity matrix that compare compiled TypeScript behavior with AMX runtime results.
- Prove the helper-package boundary with one imported module, one measurement case, one input case, and one shown view before the full emitter proceeds.
- Record any construct that cannot meet the confirmed contract as a blocking scope decision rather than silently omitting or approximating it.

### Sprint 122: Public Runtime Helpers and Generated-Module Contract (depends on Sprint 121)

Architect-prepared Sprint 122 documentation package.

- Add a stable public package entry point for generated TypeScript helpers without exposing unrelated engine internals.
- Provide only helpers needed to preserve AMX calculation semantics and typed caller-supplied input validation; reuse existing runtime behavior where practical.
- Define generated types and `run(inputs)` result contracts for exports and structured shown views.
- Compile and run a separately authored TypeScript fixture that imports the public helper entry point; verify module compatibility and runtime behavior.

### Sprint 123: Core Document and AST Emitter (depends on Sprints 121-122)

Architect-prepared Sprint 123 documentation package.

- Add the core transpiler module and public API through `src/index.ts`.
- Convert each non-AMX Markdown line into a safe TypeScript line comment while preserving source content; emit every AMX fence as formatted TypeScript in source order.
- Lower the complete checked AST, using runtime helpers only where direct TypeScript would change AMX semantics.
- Generate typed input parameters, explicit exports, and structured view results; return shown views with exports from `run(inputs)`.
- Add focused golden-output tests, parse/type-check rejection tests, and generated-source compilation tests.

### Sprint 124: Module Graph and CLI (depends on Sprint 123)

Architect-prepared Sprint 124 documentation package.

- Transpile imported AMX modules recursively, preserve visibility and explicit exports, rewrite relative imports, and mirror source paths under the output root.
- Enforce existing module-root containment and cycle rules; detect output collisions and apply the approved no-silent-overwrite policy.
- Add the `transpile` CLI command and output-directory behavior, source diagnostics, and clear failure status. Do not execute generated code as part of transpilation.
- Add CLI tests for nested imports, malformed and type-invalid documents, destination collisions, deterministic output, and successful TypeScript compilation.

### Sprint 125: Desktop Export and Documentation (depends on Sprint 123; desktop integration may proceed in parallel with Sprint 124 once the core API is stable)

Architect-prepared Sprint 125 documentation package.

- Add a desktop job operation using the shared core API and existing job/destination patterns in `desktopService`, `jobProtocol`, and `jobWorker`.
- Add an active-document TypeScript export action in the workbench. Select a destination for the module graph and honor overwrite confirmation and cancellation.
- Extend RPC contract and UI tests for success, cancellation, stale document identity, failures, and multi-file output.
- Add `docs/language-spec-v0.20.md`, README navigation, and the focused runnable example. Document runtime package requirements and the calculation/data parity boundary.

### Sprint 126: Integrated Acceptance and V0.20 Closeout (depends on Sprints 121-125)

Architect-prepared Sprint 126 documentation package.

- Run example and fixture documents through transpilation, compile generated TypeScript, execute fixtures, and compare exports and shown-view structures with AMX runtime results.
- Verify comment fidelity, every current AST construct, imported-module paths, input validation, measurement/list/builtin semantics, and source-local diagnostics.
- Verify CLI and desktop output graph equivalence, safe destination handling, overwrite/cancel behavior, and reproducible output.
- Run focused root and CLI tests, `bun run build`, desktop typecheck/test/UI gates as applicable.
- Record exact commands, results, unavailable checks, residuals, and closeout status. Do not report unexecuted or unavailable checks as passing.

## Relevant Files and Surfaces

- `planning/plan-openamxV19MasterSprintPlan.md` — predecessor plan and Sprint 120 closeout dependency.
- `src/index.ts` and new `src/transpiler/` — public API and emitter.
- `src/ast/types.ts`, `src/parser/parseDocument.ts`, `src/parser/parseStatements.ts`, and `src/parser/parseExpression.ts` — document/fence parsing and AST forms to lower.
- `src/typechecker/checkDocument.ts` — validation, types, module symbols, and units.
- `src/runtime/moduleLoader.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, `src/runtime/measurement.ts`, `src/runtime/standardLibrary.ts`, and `src/runtime/diagramModel.ts` — module, semantic, and data-model references for parity.
- `src/cli.ts` and root `package.json` — CLI command and public runtime package subpath.
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/bun/desktopService.ts`, and `desktop-app/src/mainview/App.vue` — desktop job, destination, and export action surfaces.
- Existing focused suites include `tests/parser.test.ts`, `tests/evaluator.test.ts`, and `tests/outputData.test.ts`; add focused transpiler/CLI tests and extend `desktop-app/tests/rpc-contract-check.ts` and relevant UI tests.
- `docs/language-spec-v0.20.md`, `README.md`, and a focused `examples/` document — additive contract and demonstration.

## Verification

1. Golden tests assert comment preservation and deterministic TypeScript for every supported AST node family. Verify prose and non-AMX fences are comments, not executable output.
2. Compile generated fixtures with the supported TypeScript toolchain and runtime package; verify output modules and imports resolve under the target module setting.
3. Execute generated fixtures and compare `run(inputs).exports` and `run(inputs).views` against AMX runtime results, including 1-based lists, units/measurements, standard-library operations, inputs, modules, and report/diagram data.
4. Verify parse/type errors block emission and retain source path/range diagnostics; verify import cycles/containment, collisions, and overwrite/cancel behavior.
5. Verify the CLI and desktop produce equivalent complete module graphs; run root `bun test` and `bun run build`, plus desktop `bun run typecheck`, `bun run test`, and applicable `bun run test:ui` checks.
6. Record exact commands and outcomes. Do not mark unavailable or unexecuted checks as passing.

## Decisions and Assumptions

- The feature contract above is confirmed. The exact runtime package subpath, destination default, overwrite policy, and generated `run` type details are implementation-level items for Sprint 121. Recommended defaults are a public runtime subpath, explicit output directory, no silent overwrite, and exported TypeScript interfaces.
- `run(inputs)` is synchronous unless the Sprint 121 feasibility gate finds an existing AMX behavior that requires asynchronous execution. Any such finding must return as a contract decision before implementation scope broadens.
