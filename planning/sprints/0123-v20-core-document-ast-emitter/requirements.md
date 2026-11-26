# Sprint 123 Requirements: V0.20 Core Document and AST Emitter

## Document Status

Architect-prepared Sprint 123 package. It defines candidate emitter contracts
under the accepted V0.20 decisions and the completed S122 helper API. Sprint
123 execution remains blocked until the exact execution authorization and
applicable D123 dispositions are recorded. Preparing this package
does not authorize implementation, release, publication, package/version
changes, deployment, or platform certification.

## Goal

Implement the core, deterministic AMX-to-TypeScript source emitter for the
complete checked AST baseline. Preserve source narrative as safe inert line
comments, lower executable AMX with the S122 public helper surface wherever
native TypeScript differs, and generate typed `run(inputs)` exports and
structured view results. Prove emitted modules compile and execute against AMX
runtime fixtures without adding graph publication, CLI, desktop, or rendering
work to this sprint.

## Authority and Entry Gates

- Confirmed V0.20 scope and S123 sequence:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S122 product-owner disposition: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-25 for the approved helper scope. Preserve D122-15's no-parity
  residual for enum-valued record defaults that current AMX cannot express,
  and the accepted retry/stop-protocol process residual. Do not change AMX
  checker/runtime semantics or claim enum-default AMX parity.
- S121 product-owner disposition: ACCEPTED/CLOSED WITH RECORDED RESIDUALS for
  the final feasibility closeout on 2026-11-25. The recorded S121 probe and
  D121-18 residual remain unchanged. S123 execution still requires a separate
  exact execution authorization and applicable D123 dispositions.
- D121-18 residual: multi-file publication rollback is best-effort and not
  crash-atomic; it belongs to S124/S125. S123 performs no graph publication.
- S122 helper source/API: `src/transpilerRuntime.ts` and
  `planning/sprints/0122-v20-public-runtime-helpers-generated-module-contract/runtime-api-contract.md`.
  Use the actual built-public contract: `amxBinary`, `amxUnary`,
  `amxBuiltin`, `amxFormatValue`, list/range helpers, `validateAMXValue`,
  measurement helpers, and table/chart/legacy-v1/structured-v2 diagram DTOs.
- Core source surfaces: `src/ast/types.ts`, `src/parser/parseDocument.ts`,
  `src/parser/parseStatements.ts`, `src/parser/parseExpression.ts`,
  `src/typechecker/checkDocument.ts`, `src/runtime/measurement.ts`,
  `src/runtime/evaluateExpression.ts`, `src/runtime/diagramModel.ts`, and
  `src/runtime/environment.ts`.
- Source comment contract: pass each module's original source text beside its
  parsed document. Preserve raw frontmatter lines as inert comments and
  non-AMX Markdown in normalized safe line comments; never evaluate narrative
  interpolation.
- Current root package is ESM and compiles `src/index.ts` to `dist/index.js`;
  the package export map has a helper subpath and wildcard fallback but no
  explicit `.` entry. The meaning of “public API through `src/index.ts`” versus
  public package-root import must be resolved without silently changing
  package exports or version in this sprint.

## In Scope

- Add the core AST-to-TypeScript backend under `src/transpiler/` and export the
  approved core API through `src/index.ts`. It accepts an entry plus a complete
  pre-resolved in-memory source graph and returns the generated module graph or
  diagnostics.
- Lower every supported document, statement, expression, type, visualization,
  recursive diagram, module declaration, and `show` node from the S121
  baseline. Fail closed on unknown node kinds.
- Emit original Markdown and frontmatter as inert comments, preserving line
  order, blank lines, Unicode and literal interpolation under the accepted
  line-comment encoding. Emit each executable AMX fence as formatted
  TypeScript at its source position.
- Generate typed input descriptors, `AMXRunInputs`, `AMXRunExports`,
  `AMXRunResult<TExports>`, and the `run(inputs)` wrapper with fresh state,
  runtime validation before evaluation, explicit exports, and ordered views.
- Use only the S122 `openamx/transpiler-runtime` helper API in generated
  executable code. Preserve source context and accepted AMX diagnostics.
- Emit table/chart snapshots only for `show`; emit declaration-time diagrams
  as `structured-v2` DTOs in `result.views`, preserving legacy-v1 helper
  compatibility without generating the legacy shape.
- Add focused golden-output, rejection, generated-source typecheck, execution,
  and AMX runtime parity tests for every supported AST family.

## Out of Scope

- Recursive filesystem module discovery, filesystem containment checks,
  graph-wide output preflight/publication, output-directory writing, collision
  or overwrite handling, and multi-file rollback. S124 owns filesystem graph
  resolution and CLI; S123 accepts the resolved source graph in memory.
- CLI `openamx transpile`, desktop export action, job/RPC/UI integration,
  published language spec, README, example, or rendered HTML/PDF/DOCX output.
- Source maps, new AMX syntax, changes to AMX runtime semantics, package
  version changes, or package-root export-map changes unless separately
  dispositioned.
- Calling or executing generated TypeScript during transpilation.
- Release, publication, deployment, installer/distribution, registry, or
  platform certification work.

## Contract Rules

- Parse and type-check every module in the accepted pre-resolved in-memory
  graph using the S121 contract before emission. Any parse/type/lowering error
  returns diagnostics and no generated module graph. S123 does not discover
  source files from disk.
- Source order is authoritative. Both logical operands are emitted once and
  in AMX order; short-circuiting is not introduced where current AMX evaluates
  both operands.
- Use native TypeScript only where semantics are identical. Route AMX
  operations through S122 `amxBinary`, `amxUnary`, `amxBuiltin`, list/range,
  input, format, measurement and DTO APIs as applicable.
- Preserve helper API names and signatures; no imports from private
  `src/runtime/*`, checker, parser, loader, or renderer paths in generated
  code.
- Generated identifier mangling is deterministic and collision-checked.
  Original AMX names remain public export keys/import bindings. Reserve
  `run`, `AMXRunInputs`, `AMXRunExports`, and generated helper locals.
- `result.exports` contains explicitly exported entry-module values only.
  `result.views` contains shown table/chart events and declaration-time
  diagrams as distinct DTO discriminants in module/source/evaluation order.
- Enum defaults use generated factories when supported by the checked AMX
  type/context. Preserve D122-15: do not claim AMX parity for enum-valued
  record defaults that current source syntax cannot express.
- S123 emits each checked module's import declarations to relative `.ts`
  specifiers using explicit graph mappings. It does not discover files or
  publish the graph; S124 owns that filesystem orchestration.
- A new public package-root import contract or package manifest change is not
  inferred from exporting through `src/index.ts`; resolve D123-03 explicitly.

## Completion Outputs

- Accepted single-module emitter API/input boundary and complete AST lowering
  contract with no unmapped baseline node.
- Deterministic generated-source goldens covering narrative/frontmatter,
  types, functions, operators, lists, units, inputs, modules, views and errors.
- Strict TypeScript compilation and execution of generated fixtures using
  S122 helpers, compared with AMX runtime for exports and structured views.
- `builder-evidence.md` records exact commands, outputs, artifacts/hashes,
  failures/retries, limitations, residuals, changed paths and separate owner
  disposition.
- S124 graph/CLI and S125 desktop/docs remain separate. No release or package
  distribution authority follows S123.