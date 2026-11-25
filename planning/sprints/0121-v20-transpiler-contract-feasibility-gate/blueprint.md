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
   and explicitly exercise one imported module, one measurement, one input,
   and one shown view through the proposed helper boundary.
8. If separately authorized, run only the isolated feasibility probe described
   in the package. Do not add a production emitter or tracked product helper.
9. Reconcile every S121 master-plan requirement to a contract section, fixture,
   decision, and downstream owner. Record any unsupported construct or
   semantic mismatch as a blocking scope decision.
10. Complete `builder-evidence.md` with exact baseline, commands, outputs,
    raw statuses, residuals, and a Builder recommendation. Submit the package
    for separate product-owner disposition.

## Decision Register

Proposals are candidates for the S121 gate, not accepted behavior until
separately dispositioned. Confirmed V0.20 requirements remain fixed.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D121-01 | Emission input | Lower only parser- and checker-accepted ASTs; preserve source order; reject parse/type errors before any output. | S121 contract gate |
| D121-02 | Narrative encoding | Emit one TypeScript `//` line for each source narrative line, including blank lines and all fence/interpolation text; normalize ECMAScript line terminators to LF and do not evaluate interpolation. | S121 contract gate |
| D121-03 | AMX value mapping | Use native TS for equivalent scalar/control behavior; use the public helper for 1-based lists, mutation, measurements, AMX builtins, and input validation. | S121/S122 |
| D121-04 | Generated API | Generate collision-resistant typed `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`, and synchronous `run(inputs)`; return only explicit entry values and ordered structured `show` data. | S121 contract gate |
| D121-05 | Runtime helper path | Candidate public subpath is `openamx/transpiler-runtime`; generated files import no private `src/` or renderer paths. Verify export-map impact before acceptance. | S121/S122 |
| D121-06 | Compiler baseline | Candidate target is ESM/ES2022, consistent with root package and tsconfig; verify exact TypeScript version/resolution and `.ts` import execution through a separately compiled and run fixture. | S121 contract gate |
| D121-07 | Module output | Mirror each canonical source path relative to the selected AMX import root; replace `.amx` with `.ts`; retain relative graph edges and source order. | S121 contract gate |
| D121-08 | Destination policy | Require explicit output destination; preflight the complete graph; fail without writes on collisions by default; permit replacement only through explicit confirmation/flag and honor cancellation. | S121/S124/S125 |
| D121-09 | View DTO | Publish a renderer-independent discriminated union for shown tables, charts, and diagrams. Preserve selected data and order; never emit HTML/PDF/DOCX. | S121/S122 |
| D121-10 | Runtime input validation | Revalidate caller values at runtime against declared AMX types and unit dimensions; errors identify input path and expected type. Decide unknown-key and enum/record edge behavior from current validation semantics. | S121/S122 |
| D121-11 | Numeric parity | Preserve JavaScript Number evaluation order; compare floating results with explicit tolerances only where exact equality is not a language guarantee. | S121 contract gate |
| D121-12 | Diagnostic identity | Preserve existing parser/checker diagnostics; allocate any new transpile/output code through the project owner. Do not invent stable codes in the package. | Lead Developer allocator |
| D121-13 | Frontmatter fidelity | Candidate: carry the original source text alongside each parsed module and emit the raw frontmatter prefix as inert comments before body nodes. Do not serialize parsed metadata as a substitute or narrow preservation. | S121 contract gate |
| D121-14 | Generated-name isolation | Mangle all AMX declarations to deterministic collision-checked internal TypeScript names; reserve stable top-level `run` and `AMXRun*` API names. Preserve original names as object keys and module-visible AMX exports. | S121 contract gate |
| D121-15 | Diagram result semantics | The checker permits `show` only for table/chart declarations; runtime diagrams are emitted when declared into a separate `diagramEmissions` collection. This conflicts with a `{ exports, views }` result described as shown report/diagram data. Do not infer whether diagrams belong in `views`, a separate result field, or a show operation. | Product owner |
| D121-16 | Enum input validation | The checker resolves enum annotations, but the existing input loader passes record declarations only and the JSON converter treats an enum name as an unknown record type. Decide whether enum inputs are a blocking unsupported case or require a separately scoped runtime-semantic change. | Product owner |
| D121-17 | Helper-boundary probe prerequisite | `openamx/transpiler-runtime` does not exist, the root package has no export map, and `src/index.ts` is a placeholder. A probe cannot exercise the proposed public helper boundary without a separately approved isolated helper prototype or an implementation-sequence decision; private engine imports and hand-copied helper behavior are not acceptable substitutes. | Product owner |
| D121-18 | Multi-file publication failure | Existing CLI/desktop writers atomically replace one file, not a module graph. Candidate staging and rollback are described in `module-graph-and-diagnostics.md`; decide whether best-effort rollback with explicit per-path failure reporting is acceptable or stronger graph-level atomicity is required. | Product owner |

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
  parsed metadata; the raw frontmatter spelling/comments are not represented
  in `OpenAmxDocument.nodes`. This is a concrete source-fidelity gap for the
  comment contract and requires a decision before S123.
- `src/runtime/measurement.ts` centralizes affine conversion and measurement
  value semantics. Generated code must call accepted public helpers rather
  than reproducing those rules independently.
- `DateTime` values are represented as strings; `src/runtime/inputData.ts`
  validates the RFC 3339 form and the typed-record example documents that the
  supplied text is retained. The candidate `AMXDateTime` object mapping is not
  source-grounded.
- `checkDocument.ts` stores showable declarations in a
  `Map<string, TableDeclarationNode | ChartDeclarationNode>` and validates
  `show` against that map. `evaluateExpression.ts` appends those snapshots to
  `viewEmissions`; diagram declarations instead create `DiagramSceneModel`
  values in `diagramEmissions`. D121-15 is blocking.
- `checkDocument.ts` resolves enum names as named types, while
  `moduleLoader.ts` passes only record declarations into `loadInputValues`;
  `inputData.ts` has no enum conversion path. D121-16 is blocking.
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
- S122 implements the public helper surface; S123 implements the core emitter.
  Neither begins until its stated dependencies and separate authorization are
  satisfied.