# Sprint 121 Requirements: V0.20 Transpiler Contract and Feasibility Gate

## Document Status

Architect-prepared Sprint 121 package. This package translates the confirmed
V0.20 scope into implementation contracts. The product owner accepted
D121-01 through D121-18 on 2026-11-25; the final S121 sprint
disposition remains separate and pending.
Preparing these documents does not authorize implementation, release,
publication, package/version changes, deployment, or platform certification.

## Goal

Specify a complete, testable AMX-to-TypeScript contract before building the
full emitter. Inventory every currently supported AST family; define generated
types and semantics, comment encoding, typed inputs, `run(inputs)`, runtime
helper ownership, module graph output, diagnostics, and destination safety;
then qualify the contract with golden cases and AMX-runtime parity criteria.

Sprint 121 changes no product behavior. Its accepted artifacts become the
implementation authority for Sprints 122-126, subject to the entry and
acceptance gates below.

## Authority and Inputs

- Confirmed scope and product decisions:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- Predecessor closeout: Sprint 120 Builder evidence records the separate
  product-owner disposition `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` on
  2026-11-21. The full VS Code aggregate remains raw FAIL at 21 pass/8 fail;
  V0.19-specific rows pass; native/platform evidence remains
  `BLOCKED/UNAVAILABLE`. Preserve those statuses.
- Lifecycle ledgers were reconciled on 2026-11-25 under product-owner approval
  to identify S121 as current and record the verified S120 closeout. Historical
  S120 raw results and residuals remain unchanged.
- AST inventory: `src/ast/types.ts`; parser: `src/parser/parseDocument.ts`,
  `src/parser/parseStatements.ts`, and `src/parser/parseExpression.ts`;
  checker: `src/typechecker/checkDocument.ts`.
- Source-fidelity constraint: `parseDocumentText` extracts YAML frontmatter
  into `OpenAmxDocument.metadata`; the raw text is not retained in the
  document or narrative nodes. Accepted D121-13 carries original source per
  module and emits raw frontmatter lines as inert comments; parsed metadata
  alone is not a source-fidelity representation.
- Runtime references: `src/runtime/measurement.ts`,
  `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`,
  `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and
  `src/runtime/diagramModel.ts`.
- View references: `src/renderer/chartModel.ts` and the shared view emissions
  in `src/runtime/environment.ts`. Generated TypeScript must not depend on
  renderer-private models.
- Source audit has identified three implementation dependencies: diagram
  declarations produce separate declaration-time emissions while `show`
  accepts only tables/charts (resolved by D121-15); checker-accepted enum
  inputs have no current input-conversion path (D121-16 runtime prerequisite);
  and the proposed public helper subpath does not exist yet (D121-17 S122-first
  sequence).
- `DateTime` is represented as RFC 3339 text and remains a string in the
  current runtime. Do not model it as an unverified `AMXDateTime` object.
- Current toolchain facts to reverify at execution: root package is ESM;
  `tsconfig.json` targets ES2022 with ESNext modules and bundler resolution;
  the root lockfile resolves TypeScript 5.9.3; `package.json` has no `exports`
  map; `src/index.ts` is currently a placeholder. Installed TypeScript and
  Bun versions remain unverified until separately authorized execution.

## Entry Conditions

- Verify the separate Sprint 120 closeout and its residuals directly from
  `planning/sprints/0120-v19-integrated-acceptance-closeout/builder-evidence.md`.
- Reconcile lifecycle ledger entries and record the exact S121 baseline,
  worktree, approved files, commands, probe roots, and artifact roots before
  execution. A planning package alone is not execution authorization.
- Keep confirmed V0.20 product decisions authoritative. A technical proposal
  that would change caller-visible semantics is not binding until disposition.
- Audit AST, checker, runtime, module-loader, package, and compiler behavior
  at the recorded baseline. Source observations are not new product authority.

## In Scope

- Define lowering for every current `DocumentNode`, `StatementNode`,
  `V02ExpressionNode`, and `TypeReferenceNode` variant, including types,
  enums, functions, modules, dimensions/units, inputs, measurements, mutable
  collections, tables, charts, diagrams, and `show`.
- Define safe line-comment encoding for every non-AMX Markdown line, including
  blank lines, non-AMX fences, and literal `{{ expression }}` text.
- Resolve frontmatter/source retention: generated output must not silently
  drop source content that the confirmed comment-preservation rule covers.
- Define the generated TypeScript API: declarations, input/result interfaces,
  runtime validation, explicit entry exports, ordered structured shown views,
  synchronous execution, and failure behavior.
- Settle the minimal public runtime-helper surface and package subpath without
  exposing unrelated engine internals; verify its compatibility with the
  supported TypeScript/module toolchain.
- Define source-module-to-output path mapping, `.amx` import rewriting,
  containment/cycles, deterministic graph output, collision detection,
  and explicit overwrite/cancellation behavior.
- Define source-oriented parse/type/emit/output diagnostics and the no-partial-
  output rule. Do not invent stable diagnostic codes without allocation.
- Prepare golden source fixtures and an AMX-runtime parity matrix covering all
  AST families and the mandatory imported-module, measurement, input, and
  shown-view boundary cases.
- Specify a narrowly isolated helper-boundary feasibility probe. Any probe
  execution and artifact location require separate approval; it must not
  alter tracked product source.
- Preserve the accepted D121-15 through D121-18 decisions: distinct
  declaration-time diagram DTOs, an external enum-validation prerequisite,
  helper-first sequencing, and best-effort rollback with a no-crash-atomicity
  residual. Do not treat these as permission to change product source or run
  the probe.

## Out of Scope

- Production emitter, helper implementation, CLI command, desktop export,
  published specification, README, example, package manifest, or generated
  output changes.
- New AMX syntax, runtime semantic changes other than the separately
  authorized enum-input validation prerequisite, arbitrary source-map generation,
  rendered HTML/PDF/DOCX output, narrative interpolation evaluation, or
  execution of generated code during transpilation.
- Silent best-effort or partial output for invalid documents; implicit
  overwrite; unrelated CLI, desktop, editor, or release work.
- Rewriting Sprint 120 evidence or the accepted VS Code/native residuals.
- Release, publication, package/version changes, deployment, distribution,
  installer work, or platform certification.

## Contract Rules

- The V0.20 master plan, including the 2026-11-25 product-owner amendments, is
  the product-behavior authority. Source observations do not authorize any
  additional semantic changes.
- Parse and type-check the complete entry module graph before emission. Any
  parse/type error rejects the operation; no generated file is reported as a
  successful partial result.
- Use explicit generated helper calls wherever JavaScript/TypeScript behavior
  differs from AMX, including 1-based list access, AMX mutation semantics,
  measurement operations, standard-library behavior, and runtime input checks.
- Generated `run(inputs)` is synchronous unless the S121 feasibility gate
  proves an existing required AMX behavior cannot be synchronous. Any
  asynchronous change is a blocking contract decision, not an emitter detail.
- Only explicitly exported entry-module values appear in `result.exports`.
  Imported module exports remain governed by AMX visibility and explicit
  imports. `result.views` combines shown table/chart snapshots with
  declaration-time diagram DTOs as distinct kinds in module/source order; it
  is not a renderer output and does not add AMX `show` behavior for diagrams.
- Comment preservation means source text remains inert and recognizable in
  generated comments. It never means evaluating Markdown interpolation.
- D121-13 accepts raw source text per module and inert frontmatter comments.
  Enum-input parity requires the separately authorized AMX runtime
  prerequisite. The helper-boundary proof waits for the real S122 public
  package and separate exact probe approval. D121-18 accepts best-effort
  rollback; graph-wide crash atomicity is not guaranteed.
- Runtime helper APIs are intentionally narrow and versioned. Generated
  modules may rely only on the accepted public subpath, never private engine
  paths or renderer implementation details.
- `result.views` contains shown table/chart snapshots and declaration-time
  diagram DTOs under distinct discriminants; diagrams are not made showable.
  Enum-input parity requires the separately authorized AMX runtime prerequisite
  before S122/S121 proof. S122 may begin only after a dispositioned S121
  helper/API checkpoint and separate authorization; S121 final closeout resumes
  after the actual public helper is available.
- Best-effort multi-file rollback with exact per-path reporting is accepted;
  graph-wide crash atomicity is not guaranteed.
- Raw evidence statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and
  `NOT RUN`. A probe, proposal, or source audit is not an implementation pass.

## Completion Outputs

- Complete AST-to-TypeScript mapping with explicit handling for every current
  union member and fail-closed handling for future/unknown node kinds.
- Accepted generated-module, helper, type, input, export, view, compiler, and
  module-graph contracts, with prerequisites and residuals explicitly named.
- Golden fixtures and parity matrix with stable IDs, expected values, exact
  versus tolerance-based comparisons, and downstream owners.
- Diagnostic and destination-safety contracts with no unallocated stable IDs
  or silent overwrite behavior.
- Builder evidence recording baseline, source audit, exact authorized probes,
  raw outcomes, limitations, residuals, and recommendation; separate
  product-owner disposition.
- S122 remains the helper implementation gate; S123 remains blocked until
  S121 and S122 are accepted. No later sprint, release, or package action is
  authorized by this package.