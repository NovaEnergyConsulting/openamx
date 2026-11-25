# Sprint 121 Requirements: V0.20 Transpiler Contract and Feasibility Gate

## Document Status

Architect-prepared Sprint 121 package. This package translates the confirmed
V0.20 scope into proposed implementation contracts. Candidate technical
choices remain subject to review and separate product-owner disposition.
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
- Lifecycle ledgers currently still identify Sprint 114 as current. Reconcile
  `planning/state.md`, `planning/decisions.md`, `planning/STATUS.json`, and
  `planning/ARCHITECT_BRIEFING.md` against Sprint 120 evidence before Sprint
  121 execution or V0.20 implementation. This preparation package does not
  rewrite those ledgers.
- AST inventory: `src/ast/types.ts`; parser: `src/parser/parseDocument.ts`,
  `src/parser/parseStatements.ts`, and `src/parser/parseExpression.ts`;
  checker: `src/typechecker/checkDocument.ts`.
- Source-fidelity blocker: `parseDocumentText` extracts YAML frontmatter into
  `OpenAmxDocument.metadata`; the raw frontmatter text is not retained in the
  document or narrative nodes. S121 must settle how the transpiler receives
  original source for comment preservation. Candidate D121-13 carries raw
  source text per module and emits the frontmatter prefix as inert comments;
  parsed metadata alone is not a source-fidelity representation. Owner
  disposition is still required.
- Runtime references: `src/runtime/measurement.ts`,
  `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`,
  `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and
  `src/runtime/diagramModel.ts`.
- View references: `src/renderer/chartModel.ts` and the shared view emissions
  in `src/runtime/environment.ts`. Generated TypeScript must not depend on
  renderer-private models.
- Source audit has identified three contract blockers to disposition rather
  than infer around: diagram declarations produce separate declaration-time
  emissions while `show` accepts only tables/charts (D121-15); checker-accepted
  enum inputs have no matching current input-conversion path (D121-16); and
  the proposed public helper subpath does not exist for the required probe
  (D121-17).
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
- Reconcile D121-15, D121-16, and D121-17 with the product owner. These are
  blocking semantic/sequence decisions, not implementation details that the
  Builder may resolve.
- Reconcile D121-18's multi-file publication-failure/rollback contract with
  the product owner; do not claim graph-wide crash atomicity from single-file
  atomic writers.

## Out of Scope

- Production emitter, helper implementation, CLI command, desktop export,
  published specification, README, example, package manifest, or generated
  output changes.
- New AMX syntax, runtime semantic changes, arbitrary source-map generation,
  rendered HTML/PDF/DOCX output, narrative interpolation evaluation, or
  execution of generated code during transpilation.
- Silent best-effort or partial output for invalid documents; implicit
  overwrite; unrelated CLI, desktop, editor, or release work.
- Rewriting Sprint 120 evidence or the accepted VS Code/native residuals.
- Release, publication, package/version changes, deployment, distribution,
  installer work, or platform certification.

## Contract Rules

- The V0.20 master plan is the product-behavior authority. This package labels
  technical refinements as confirmed, source-observed, proposed, or unresolved.
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
  imports. `result.views` contains structured data for `show` statements in
  source/evaluation order; it is not a renderer output.
- Comment preservation means source text remains inert and recognizable in
  generated comments. It never means evaluating Markdown interpolation.
- Frontmatter is a known source-retention gap and remains blocking until an
  explicit S121 decision defines its inclusion and source-text handoff.
- Diagram result inclusion and enum input behavior remain blocking under
  D121-15 and D121-16. The proposed helper probe is not executable against a
  public helper package until D121-17 is dispositioned and the exact isolated
  plan is separately approved. D121-18 also blocks any unsupported guarantee
  about multi-file publication failure or crash atomicity.
- Runtime helper APIs are intentionally narrow and versioned. Generated
  modules may rely only on the accepted public subpath, never private engine
  paths or renderer implementation details.
- Raw evidence statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and
  `NOT RUN`. A probe, proposal, or source audit is not an implementation pass.

## Completion Outputs

- Complete AST-to-TypeScript mapping with explicit handling for every current
  union member and fail-closed handling for future/unknown node kinds.
- Accepted generated-module, helper, type, input, export, view, compiler, and
  module-graph contracts, with unresolved choices named as blockers.
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