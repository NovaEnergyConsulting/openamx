# Sprint 115 Requirements: V0.19 Language Contract and Affine Model Qualification

## Document Status

Architect-prepared Sprint 115 documentation. The contract refinements in this
folder are proposals until separately reviewed and dispositioned by the
product owner. Preparing this package does not authorize Sprint 115
execution, production changes, V0.19 implementation, release, publication,
package/version changes, or platform certification.

## Goal

Convert the confirmed V0.19 product decisions into executable, testable
contracts for chart table visibility and affine/offset measurements before
AST, parser, typechecker, runtime, renderer, editor, standard-library, or
published-documentation work begins. Qualify one canonical affine model and a
finite set of golden cases so later implementation surfaces cannot define
conflicting conversion or output behavior.

Sprint 115 changes no product behavior. Its accepted artifacts become the
behavior authority for Sprints 116-120, subject to the entry and acceptance
gates recorded below.

## Authority and Inputs

- Scope and confirmed decisions:
  [`plan-openamxV19MasterSprintPlan.md`](../../plan-openamxV19MasterSprintPlan.md).
- V0.18 closeout prerequisite: Sprint 114 and V0.18 were separately
  ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-01. Sprint 115 does not
  reopen, absorb, or reclassify those residuals.
- Existing compatibility references: `docs/language-spec-v0.18.md`,
  `examples/05_Measurements_and_Units.amx`,
  `examples/07_Tables_Charts_and_Named_Outputs.amx`, and
  `libraries/si.amx`.
- Implementation surfaces for read-only inspection: chart AST/parser/checker,
  chart evaluation/emission/model, unit declaration registry construction,
  measurement conversion/arithmetic/aggregates, chart normalization, external
  data measurement validation, and HTML/PDF/DOCX chart output.
- Sprint 115 planning artifacts: `blueprint.md`,
  `language-and-rendering-contract.md`, `affine-model-and-operations.md`,
  `qualification-cases.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, `acceptance.md`, `builder-evidence.md`, and
  `handoff-prompt.md`.

## Entry Conditions

- The product owner has recognized Sprint 114/V0.18 as accepted and closed;
  the source worktree and applicable V0.19 baseline are recorded before
  implementation review begins.
- Sprint 115 execution is separately authorized for exact read-only review,
  fixture, probe, documentation, command, and output roots. This package alone
  supplies planning authority, not execution authority.
- The V0.19 master-plan decisions remain authoritative. Any candidate in this
  folder that would narrow, broaden, or contradict those decisions remains
  pending until explicitly dispositioned.

## In Scope

- Define the complete `showTable <expression>` chart-option syntax for bar,
  column, line, and scatter charts, including duplicate handling, source
  ranges, expression environment, static Boolean checking, omitted default,
  evaluation timing, and exact output-omission behavior.
- Define the affine declaration model $p = v \times scale + offset$, including
  scale/offset metadata, canonical base identity, alias and import behavior,
  affine declaration precedence, accepted operands, composition, inverse
  conversion, and finite/effective-scale rules.
- Permit the runtime-standard `PI` and `E` values as narrow declaration-time
  constants while excluding user variables, user/imported constants, forward
  references, function calls, and arbitrary compile-time evaluation.
- Lock the measurement operation matrix for attachment, conversion,
  equality/order, direct addition, subtraction, multiplication/division,
  powers/roots, aggregates, unary operations, chart normalization, scalar
  display, and external data.
- Derive the SI declarations for `celsius`, `fahrenheit`, `degC`, and `degF`
  from the approved $0\,C = 32\,F = 273.15\,K$ invariant.
- Establish stable positive, negative, boundary, compatibility, conversion,
  round-trip, chart, and rendering fixtures with downstream ownership.
- Define a diagnostic policy and candidate exact message/anchor behavior for
  invalid affine declarations, unsupported affine operations, invalid
  `showTable` values, duplicates, and normalization failures.
- Verify by source audit that the external measurement shape remains
  `{ value, unit }` and record any required change as a blocking compatibility
  decision.

## Out of Scope

- Production source, test, generated artifact, editor, standard-library,
  published specification, README, migration, or example changes.
- Implementation of `showTable`, affine unit metadata, affine runtime
  arithmetic, SI temperature exports, or downstream renderer/editor work.
- A general declaration evaluator, arbitrary constant folding, decimal/exact
  arithmetic, new chart kinds, alternate table markup, CSS-hidden fallback
  tables, or new external measurement serialization.
- User-declared/imported unit-declaration constants, delta/interval unit
  types, arbitrary affine composition, or unapproved units.
- V0.19 release work, package/version changes, publication, deployment, or
  platform certification, including any change to the separately recorded
  V0.18 residuals.

## Contract Rules

- Product-owner decisions in the V0.19 master plan are confirmed requirements.
  Source-observed behavior constrains implementation compatibility but does
  not authorize a conflicting language rule.
- Every accepted rule must have a stable case ID and downstream owner. A
  prose-only behavior with no fixture or explicit source-audit case is not a
  complete Sprint 115 contract.
- Existing linear units have offset $0$. Existing multiplication-only
  declarations, dimension identity, aliases, imports/exports, external
  `{ value, unit }` shape, and display-unit intent remain unchanged.
- A displayed affine measurement and its physical value are distinct. Display
  operations preserve the approved display unit; conversion/equality/order
  and physical aggregates use the canonical formula.
- A false or omitted `showTable` controls actual output omission. It does not
  authorize CSS hiding, screen-reader-only fallback tables, or alternate data
  markup.
- Candidate diagnostic codes and exact messages are not allocations. Reuse an
  existing identity only when the condition is semantically exact; otherwise
  record the downstream allocator and keep the row pending.
- Source ranges use 1-based lines and columns, UTF-16 code-unit columns, and
  exclusive ends under the repository's established diagnostic conventions.

## Completion Outputs

- A reviewed chart and affine contract that separates confirmed requirements,
  source observations, candidate implementation refinements, blocking
  decisions, and explicitly retained compatibility boundaries.
- Golden cases for declaration grammar, constants, finite rules, composition,
  conversion, round trips, subtraction, rejected operations, aggregates,
  charts, external data, and omitted/false/true/dynamic `showTable` behavior.
- A diagnostic matrix with phase, anchor, existing/candidate identity,
  ownership, and no invented stable code or claim of current support.
- A requirement-to-evidence matrix covering every Sprint 115 master-plan
  bullet and assigning downstream ownership to Sprints 116-120.
- `builder-evidence.md` completed with the reviewed baseline, commands,
  outcomes, unresolved decisions, residuals, and a recommendation. Raw
  NOT RUN, BLOCKED, and unavailable checks remain distinct from PASS.
- A separate product-owner disposition closes the contract gate. Sprint 116
  and Sprint 117 remain blocked until that disposition accepts the canonical
  affine declaration model, chart contract, operation matrix, diagnostics,
  and compatibility conclusion.
