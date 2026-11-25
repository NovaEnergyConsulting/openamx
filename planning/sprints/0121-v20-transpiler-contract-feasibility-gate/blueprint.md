# Sprint 121 Blueprint: V0.20 Transpiler Contract and Feasibility Gate

## Approach

1. Reconcile Sprint 120's separate accepted/closed-with-residuals disposition
   and preserve its raw VS Code and native/platform statuses. Reconcile the
   stale planning lifecycle ledgers before any S121 execution; do not rewrite
   historical S120 evidence.
2. Record the exact baseline and approved read-only/isolated-probe plan. Keep
   planning edits in this sprint folder unless a separately approved scope
   amendment names another path.
3. Inventory the current AST unions and the parser/checker/runtime behavior
   that determines AMX semantics. Record source facts separately from
   proposed generated-code rules.
4. Complete `ast-typescript-mapping.md` for every document, statement,
   expression, type, and view-related AST member. Each row identifies direct
   TypeScript lowering, required helper semantics, or a blocking question.
5. Complete `generated-runtime-contract.md` for comments, generated type
   forms, caller-supplied inputs, `run(inputs)`, exports, structured views,
   helper ownership, package subpath, synchronous behavior, and compiler
   compatibility.
6. Complete `module-graph-and-diagnostics.md` for path mirroring, import
   rewriting, containment/cycles, deterministic graph output, diagnostics,
   collision preflight, overwrite confirmation, cancellation, and no-partial
   output.
7. Prepare `golden-fixtures.md` and `parity-matrix.md`. Cover all AST families
  and define the four helper-boundary cases.
8. The public helper subpath is a separately gated S122 deliverable. After it
  exists, obtain exact probe approval, run the four cases against that actual
  package, then return to S121 final feasibility closeout. Do not substitute
  private imports or copied helpers.
9. Reconcile every S121 master-plan requirement to a contract section, fixture,
   decision, and downstream owner. Record any unsupported construct or
   semantic mismatch as a blocking scope decision.
10. Complete `builder-evidence.md` with exact baseline, commands, outputs,
    raw statuses, residuals, and a Builder recommendation. Submit the package
    for separate product-owner disposition.

## Decision Register

The product owner accepted D121-01 through D121-12 and D121-14 as the S121
contract baseline on 2026-11-25. D121-13 and D121-15 through D121-18 are
dispositioned as recorded below. This is not the separate final S121
closeout disposition; raw evidence remains unrun.

| ID | Topic | Accepted contract decision / required verification | Owner |
| --- | --- | --- | --- |
| D121-01 | Emission input | Lower only parser- and checker-accepted ASTs; preserve source order; reject parse/type errors before any output. | S121 contract gate |
| D121-02 | Narrative encoding | Emit one TypeScript `//` line for each source narrative line, including blank lines and all fence/interpolation text; normalize ECMAScript line terminators to LF and do not evaluate interpolation. | S121 contract gate |
| D121-03 | AMX value mapping | Use native TS for equivalent scalar/control behavior; use the public helper for 1-based lists, mutation, measurements, AMX builtins, and input validation. | S121/S122 |
| D121-04 | Generated API | Generate collision-resistant typed `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`, and synchronous `run(inputs)`; return only explicit entry values and ordered structured `show` data. | S121 contract gate |
| D121-05 | Runtime helper path | Accepted public subpath is `openamx/transpiler-runtime`; generated files import no private `src/` or renderer paths. S122 must verify export-map impact before implementation acceptance. | S121/S122 |
| D121-06 | Compiler baseline | Accepted baseline is package ESM, ES2022 target, ESNext modules, bundler resolution, and TypeScript 5.9.3 from the root lockfile. Verify the executable version and `.ts` import path under the separately approved fixture. | S121 contract gate |
| D121-07 | Module output | Mirror each canonical source path relative to the selected AMX import root; replace `.amx` with `.ts`; retain relative graph edges and source order. | S121 contract gate |
| D121-08 | Destination policy | Require explicit output destination; preflight the complete graph; fail without writes on collisions by default; permit replacement only through explicit confirmation/flag and honor cancellation. | S121/S124/S125 |
| D121-09 | View DTO | Publish a renderer-independent discriminated union for shown tables, charts, and diagrams. Preserve selected data and order; never emit HTML/PDF/DOCX. | S121/S122 |
| D121-10 | Runtime input validation | Revalidate caller values at runtime against declared AMX types and unit dimensions; errors identify input path and expected type. Decide unknown-key and enum/record edge behavior from current validation semantics. | S121/S122 |
| D121-11 | Numeric parity | Preserve JavaScript Number evaluation order; compare floating results with explicit tolerances only where exact equality is not a language guarantee. | S121 contract gate |
| D121-12 | Diagnostic identity | Preserve existing parser/checker diagnostics; allocate any new transpile/output code through the project owner. Do not invent stable codes in the package. | Lead Developer allocator |
| D121-13 | Frontmatter fidelity | ACCEPTED 2026-11-25: carry original source text alongside each parsed module and emit every raw frontmatter line as inert comments under the normalized line encoding before body nodes. Parsed metadata is not a substitute. | Product owner |
| D121-14 | Generated-name isolation | Mangle all AMX declarations to deterministic collision-checked internal TypeScript names; reserve stable top-level `run` and `AMXRun*` API names. Preserve original names as object keys and module-visible AMX exports. | S121 contract gate |
| D121-15 | Diagram result semantics | ACCEPTED 2026-11-25: `result.views` contains shown table/chart snapshots and declaration-time diagram DTOs under distinct discriminants, ordered by module and source/evaluation order. Do not add `show` support for diagrams. The V0.20 master plan is amended accordingly. | Product owner |
| D121-16 | Enum input validation and type resolution | AMENDED 2026-11-25: accept enum declarations as named types in `TypeReferenceNode` contexts; validate exact resolved string/number members recursively in JSON and CSV record inputs, including nullable/default behavior. Checker/runtime implementation is present in the current worktree and focused suites pass; public-helper parity is recorded separately. | Product owner / runtime owner |
| D121-17 | Helper-boundary probe prerequisite | ACCEPTED 2026-11-25: use the real public `openamx/transpiler-runtime` subpath. S122 may be separately authorized after a dispositioned S121 helper/API contract checkpoint; then run the separately approved S121 probe and return to final S121 closeout. This disposition does not authorize S122. | Product owner |
| D121-18 | Multi-file publication failure | ACCEPTED 2026-11-25: stage the graph, attempt rollback on publish failure, report per-path staged/published/restored/unrecovered state, and record that crash-atomic multi-file replacement is not guaranteed. | Product owner |

## Source-Grounded Constraints

- `DocumentNode` is `NarrativeNode | VariableDeclarationNode |
  ExecutableCodeBlockNode`; executable blocks contain `StatementNode`.
- Current statement and expression variants are enumerated in
  `src/ast/types.ts`. Unknown future discriminants must fail closed until
  mapping and fixtures are added.
- `src/typechecker/checkDocument.ts` exposes checked binding types and module
  exports; emitter inputs must retain enough checked metadata for type-directed
  lowering and input/view DTO generation.
- `parseDocumentText` strips YAML frontmatter from the body and stores only
  parsed metadata; the raw text is not represented in `OpenAmxDocument.nodes`.
  D121-13 requires a per-module source envelope at the emitter boundary.
- `src/runtime/measurement.ts` centralizes affine conversion and measurement
  value semantics. Generated code must call accepted public helpers rather
  than reproducing those rules independently.
- `DateTime` values are represented as strings; `src/runtime/inputData.ts`
  validates the RFC 3339 form and the typed-record example documents that the
  supplied text is retained.
- `checkDocument.ts` stores showable declarations in a
  `Map<string, TableDeclarationNode | ChartDeclarationNode>` and validates
  `show` against that map. `evaluateExpression.ts` appends those snapshots to
  `viewEmissions`; diagram declarations instead create `DiagramSceneModel`
  values in `diagramEmissions`. D121-15 resolves the generated `views` DTO
  contract without adding AMX `show` behavior.
- At baseline, `checkDocument.resolve` rejected enum names as ordinary type
  references (while `resolveIsTarget` handled enums only for type tests), and
  `moduleLoader.ts` passed only record declarations into `loadInputValues`.
  D121-16 now authorizes checker type resolution plus enum-aware JSON/CSV input
  validation. Both are implemented in the current worktree and pass the
  focused input/module/measurement suites; helper oracle parity is in the S121
  probe record.
- `src/runtime/moduleLoader.ts` canonicalizes imports, enforces import-root
  containment, detects cycles, and evaluates dependencies before importers.
  Transpilation must preserve those rules without executing generated output.
- The root package has no export map today. Adding a helper subpath must not
  accidentally hide existing supported entry points or CLI behavior. The
  proposed helper package path is not available at this baseline; see D121-17.

## Required Sprint Artifacts

- `requirements.md` and `acceptance.md`: scope, entry gate, completion criteria,
  and authority boundary.
- `ast-typescript-mapping.md`: complete node/type lowering map.
- `generated-runtime-contract.md`: comment, API, input, output, helper, and
  compiler contracts.
- `module-graph-and-diagnostics.md`: path/output and diagnostic behavior.
- `golden-fixtures.md` and `parity-matrix.md`: stable acceptance cases and
  expected parity evidence.
- `builder-evidence.md` and `handoff-prompt.md`: evidence template and bounded
  Builder instructions.

## Boundaries

- Sprint 121 is a contract and feasibility gate, not the full emitter sprint.
- No production source, tests, package manifests, generated output, CLI,
  desktop UI, published specification, examples, or release files are changed
  by documentation preparation.
- A temporary probe is evidence only. It must use separately approved paths,
  be isolated from tracked product output, and be recorded with exact inputs,
  commands, tool versions, and limitations.
- S122 implements the public helper surface only after the accepted S121
  helper/API checkpoint and separate authorization. S121 final closeout resumes
  after S122 exposes the real public subpath. S123 remains blocked until S121
  final acceptance and S122 helper acceptance; no implementation is authorized
  by this blueprint.