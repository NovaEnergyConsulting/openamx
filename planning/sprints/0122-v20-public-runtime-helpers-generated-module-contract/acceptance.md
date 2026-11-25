# Sprint 122 Acceptance Criteria

Sprint 122 is complete only when the public helper API is sufficient for the
accepted generated-module contract, preserves AMX semantics, is covered by
focused parity cases, and is independently imported, strictly compiled, and
executed by an authored TypeScript fixture. S122 does not implement the
transpiler, CLI, desktop export, or release workflow.

## Entry and Authority

- S121 is verified ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25 from
  canonical state/decision records and Builder evidence. The stale pending
  clauses in S121 acceptance/evidence were reconciled before S122 execution;
  raw outcomes remain unchanged.
- D121-13 through D121-18 remain fixed: source envelopes, distinct ordered
  diagram DTOs, enum support prerequisite, public-helper-first sequence, and
  best-effort/non-crash-atomic rollback.
- The exact S122 baseline, `dist` preservation, approved files, fixture roots,
  commands, tool versions, and artifacts are separately authorized.
- No S121 raw result, S120 residual, or unavailable check is rewritten.

## Public Package Contract

- `openamx/transpiler-runtime` resolves from the built package to both its
  JavaScript implementation and declarations. The existing CLI `bin` and
  wildcard fallback behavior remain intact; no version changes occur.
- The public entry exports only documented AMX-facing types, errors, and
  helpers. It does not export parser, checker, evaluator, module-loader,
  renderer, CLI, or filesystem internals.
- Every public function has a declaration-file signature usable by a strict
  external consumer. No public `any` escape hatch is introduced.
- `AMXRunInputs` and `AMXRunExports` are generated-entry-specific. The helper
  package exports the generic result/view/value contracts consumed by them.
- The old S121 `amxDiagramView` signature remains callable and produces an
  explicit `schema: 'legacy-v1'` DTO. Structured generated-module diagrams
  use `schema: 'structured-v2'` with the closed primitive element union;
  consumers narrow by `schema` without widening the structured DTO. The
  exported `AMXDiagramView` type name remains assignable from an S121-shaped
  object without a `schema` field; structured callers use
  `AMXStructuredDiagramView`.

## Semantics Coverage

- Numeric, Boolean, String, null, and type-test helpers preserve AMX coercion,
  comparison, equality, and error behavior. For current `and`/`or` evaluation,
  both operands execute once, left-to-right, before the Boolean operation.
- Measurement attach/conversion, `+`, `-`, `*`, `/`, `%`, `^`, comparisons,
  affine rejection, aggregates, unary behavior, and standard-library
  measurement functions preserve values, dimensions, display-unit selection,
  finite checks, and existing AMX diagnostics.
- Lists preserve 1-based access/insertion/removal, range bounds/order,
  iteration order, append/pop behavior, mutation target validation, and
  recursive list-copy semantics for function arguments.
- Builtins cover the current supported names: `sum`, `min`, `max`, `mean`,
  `round`, `abs`, `sqrt`, `pow`, `len`, `trim`, `left`, `right`, `format`,
  `sin`, `cos`, `tan`, inverse/hyperbolic variants, `ln`, `log`, and `exp`.
  Measurement-specific acceptance/rejection matches the interpreter.
- Runtime errors retain the accepted AMX code and source/input context for
  mapped failures. No new code is claimed without allocation.

## Inputs and Enums

- Direct caller-input validation covers exact primitive types, finite Number,
  RFC 3339 DateTime string, enum value, nullable, nested list, record,
  defaults, optional fields, and measurement values with exact `{ value, unit }`
  shape and dimension identity.
- Unknown top-level and nested record keys reject. Missing, explicit null,
  defaulted, optional, and required fields remain distinct under the accepted
  S121 contract.
- String- and numeric-valued enums validate exact resolved members recursively
  in direct helper inputs and existing file-backed JSON/CSV validation. The
  S121 Number-only probe is not used as enum parity evidence.
- Direct helper enum default factories are tested, but AMX parity is required
  only for default expressions expressible by current AMX. Under D122-15,
  enum-valued record defaults remain an explicit no-parity residual because
  the checker rejects both enum-member expressions and primitive literals;
  S122 does not change AMX semantics.
- Invalid inputs fail before evaluation and return no success-shaped result.
  Error path identifies the input or nested field.

## Views and Result Types

- Generic result type carries typed exports and readonly `AMXShownView[]`.
  `run(inputs)` is synchronous, returns fresh result state, and does not prompt
  or access files/environment.
- Table/chart `show` snapshots and declaration-time diagram emissions retain
  their distinct kinds and accepted module/source/evaluation ordering.
- Table DTOs preserve column and row order, nulls, and detached nested values.
  Chart DTOs carry enough structured chart data, series/labels/headings,
  measurement descriptors, and `showTable` state to match AMX emissions.
  Diagram DTOs carry accepted declaration-time scene/timeline/initial-frame
  fields without renderer models or `show` syntax.
- DTO constructors detach mutable inputs and freeze the snapshot tree without
  freezing or changing the caller's original values.

## External Consumer and Verification

- A separately authored TypeScript fixture imports the built
  `openamx/transpiler-runtime` subpath and no private engine path.
- Strict typecheck passes with the accepted TS/module configuration. The
  fixture executes with the accepted runtime; `.ts` relative import behavior
  is explicitly recorded, not generalized beyond tested hosts.
- Fixture verifies operations, lists, builtins, measurement affine cases,
  direct enum and record inputs, error paths, result/view DTO types, and at
  least one table, chart, and diagram view.
- Fixture outputs are compared with `loadEntryModule`/AMX runtime outputs for
  identical cases. Exact and floating comparisons are listed per case.
- Root focused tests, no-emit typecheck, build, external consumer compile/run,
  package export check, and `git diff --check` have exact commands and raw
  results recorded. `dist` preservation is verified by file/hash manifest.
- No filesystem publication/rollback test is claimed; S121's
  best-effort/non-crash-atomic residual remains assigned to S124/S125.

## Evidence and Disposition

- `builder-evidence.md` records baseline, exact commands/CWDs, versions,
  first failures/retries, counts, output hashes, scope/preservation audit,
  residuals, and recommendation.
- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  Builder recommendation and product-owner disposition are separate.
- Product owner separately accepts/closes or blocks/opens S122. S123 remains
  blocked until S122 and S121 final feasibility closeout are accepted.
- The product owner ACCEPTED/CLOSED S122 WITH RECORDED RESIDUALS on
  2026-11-25 for the approved helper scope. The enum-default no-parity
  limitation and retry/stop-protocol deviation are recorded in
  `builder-evidence.md`; neither is reclassified as a passing test.
- No package/version, release, publication, deployment, distribution,
  installer, or platform-certification authority follows S122.