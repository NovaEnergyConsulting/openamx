# Sprint 122 Requirements: V0.20 Public Runtime Helpers and Generated-Module Contract

## Document Status

Architect-prepared Sprint 122 package. This package defines the completion
target for the public helper surface and its independently authored TypeScript
consumer fixture. Candidate API refinements require separate disposition.
Preparing this package does not authorize implementation, tests, package
manifest changes, release, publication, deployment, or platform certification.

## Goal

Complete the narrow, stable `openamx/transpiler-runtime` surface required by
generated TypeScript to preserve accepted AMX value, measurement, list,
builtin, input-validation, diagnostic, and structured-view semantics. Define
the helper-facing value and `run(inputs)` result types, then prove a separately
authored strict TypeScript fixture can import the built public subpath, compile,
execute, reject invalid inputs, and match the AMX runtime for agreed cases.

Sprint 122 adds no AMX syntax, transpiler, CLI, or desktop feature. Its accepted
API becomes the helper contract for S123-S126.

## Authority and Inputs

- Confirmed feature scope and Sprint 122 sequence:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S121 contract/checkpoint: D121-01 through D121-18 are recorded as accepted
  in the S121 blueprint and `planning/decisions.md`. The product owner
  ACCEPTED/CLOSED S121 WITH RECORDED RESIDUALS on 2026-11-25 in `state.md`,
  `decisions.md`, `STATUS.json`, and the Builder evidence status.
- S121 recorded residuals: public-helper enum parity was not independently
  established by the Number-input probe; full helper behavior remains S122;
  multi-file rollback is best-effort and not crash-atomic. Preserve these
  distinctions.
- S121 documentation inconsistency: its `acceptance.md` and the final section
  of `builder-evidence.md` still contain stale “final disposition pending”
  text, despite the accepted disposition recorded above and in the evidence
  heading. Reconcile those exact statements against the canonical disposition
  before S122 implementation; do not rewrite S121 raw results.
- Current helper source: `src/transpilerRuntime.ts`. Its implemented slice
  includes scalar/enum/list/record/measurement guards, measurement attach,
  convert and equality, and table/chart/diagram DTO constructors.
- Existing runtime semantics to reuse and compare:
  `src/runtime/measurement.ts`, `src/runtime/evaluateExpression.ts`,
  `src/runtime/standardLibrary.ts`, `src/runtime/inputData.ts`,
  `src/runtime/environment.ts`, `src/runtime/diagramModel.ts`, and
  `src/diagnostics/errors.ts`.
- Current public packaging: `package.json` maps
  `openamx/transpiler-runtime` to `dist/transpilerRuntime.js` and its
  declaration file, with a wildcard fallback preserving prior deep subpaths.
  S122 must verify this package boundary without changing package versions.
- Accepted execution baseline from S121: ESM, ES2022, ESNext modules, strict
  TypeScript 5.9.3, bundler module resolution, and Bun 1.4.5. Re-record actual
  versions and the isolated baseline for S122.

## Entry Conditions

- Verify the S121 product-owner disposition from the canonical planning
  ledgers and S121 evidence. Reconcile the stale S121 pending clauses before
  implementation authorization.
- Confirm S121's helper/API contract checkpoint and D121-15 view semantics,
  D121-16 enum behavior, and D121-18 rollback residual. This sprint does not
  re-open those product decisions.
- Record the exact S122 baseline, worktree, approved files, generated `dist`
  preservation, tests, fixture paths, tool versions, artifacts, and retries
  before execution. A planning package is not execution authorization.
- Keep product-owner-confirmed V0.20 behavior fixed. Any semantic discrepancy
  exposed by helper parity is a blocking decision, not an implementation guess.

## In Scope

- Verify and complete the public helper entry point without exposing parser,
  checker, evaluator, module-loader, renderer, CLI, or filesystem internals.
- Define and implement the typed runtime value, measurement/unit, diagnostic,
  recursive input descriptor, view DTO, and generic run-result contracts
  required by generated modules.
- Complete semantics-preserving helpers for binary/unary operations,
  measurement arithmetic/comparison/aggregates, 1-based list access and
  mutation, ranges/iteration, AMX builtins, and AMX string/value formatting.
- Complete direct caller-input validation for primitive, DateTime, enum,
  nullable, list, record/default, and measurement values. Validate exact enum
  members recursively and reconcile with the separately implemented JSON/CSV
  enum prerequisite from S121.
- Complete immutable/copy-safe constructors for table, chart, and declaration-
  time diagram DTOs. Preserve D121-15's distinction and ordering contract.
- Add semantic, type, error/context, immutability, and module compatibility
  tests. Compile and run a separately authored strict TypeScript fixture that
  imports only `openamx/transpiler-runtime` for helper APIs.
- Compare representative helper outputs and failures against the AMX runtime
  using identical values and inputs; include the previously unproven enum
  helper/oracle parity case.

## Out of Scope

- AST emitter, transpile core API, generated source implementation, source
  maps, CLI `transpile` command, desktop export action, published language
  specification, README, example, or rendered HTML/PDF/DOCX output.
- New AMX syntax or changes to accepted AMX semantics. Any refactor of shared
  runtime behavior must preserve existing evaluator behavior and be limited to
  helpers genuinely needed by generated code.
- Recursive AMX module output publication, filesystem rollback implementation,
  or changes to the accepted best-effort/non-crash-atomic residual.
- Package version changes, release/publication, deployment, distribution,
  installer work, or platform certification.
- Reclassifying Sprint 120 or S121 failures, limitations, or residuals.

## Contract Rules

- Preserve the exact public package subpath `openamx/transpiler-runtime` and
  the S121 package-export compatibility decision unless a blocker requires a
  separately dispositioned amendment.
- Export only immutable helper types/functions and stable AMX-facing errors.
  Internal engine imports may be used inside the implementation but are not
  re-exported or part of declaration-file signatures.
- Helper calls preserve AMX evaluation order, value coercion, error codes and
  messages where contractual, measurement display-unit behavior, 1-based
  indexing, list argument-copy semantics, and standard-library behavior.
- Generated code performs compile-time parsing/typechecking elsewhere. Runtime
  helpers validate caller data and execute already-lowered operations; they do
  not parse AMX or resolve module paths.
- Direct `run(inputs)` validation and file-backed JSON/CSV validation are
  related but distinct entry paths. Tests prove each path explicitly; a pass in
  one does not imply parity in the other.
- Shown table/chart DTOs and declaration-time diagram DTOs use distinct
  discriminants. Diagrams remain declaration-time events and are not made
  showable. DTOs are data, not renderer models.
- Generated module types include entry-specific `AMXRunInputs` and
  `AMXRunExports`; helper package types define a generic result and shared
  view/value contracts. Exact ownership and names are finalized by D122.
- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  Builder recommendation and product-owner disposition remain separate.

## Completion Outputs

- Accepted public helper API/type contract, including explicit helper ownership
  and no private-engine exports.
- Complete operation, input-validation, diagnostic, and view DTO matrices with
  stable test IDs and downstream ownership.
- Passing focused root tests, root no-emit typecheck/build as approved, and an
  independently authored public-subpath TypeScript fixture that compiles and
  executes against the built package.
- AMX-runtime parity evidence for numeric/list/builtin/measurement behavior,
  input cases including enums, and table/chart/diagram DTOs.
- `builder-evidence.md` with exact baseline, commands, raw results, artifacts,
  retries, limitations, residuals, and recommendation; separate owner
  disposition.
- S123 remains blocked until S122 and S121 final feasibility closeout are
  separately accepted. No later implementation or release authority follows.