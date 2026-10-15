# Sprint 084 Handoff Prompt

You are the Builder for OpenAMX Sprint 084: V0.14 Language Contract and
Acceptance Fixtures.

## Read First

- Project agent instructions and the current worktree status. Preserve all
  existing changes and artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- Every Sprint 084 artifact: `requirements.md`, `blueprint.md`,
  `acceptance.md`, `grammar-examples.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, `builder-evidence.md`, and this handoff.
- The V0.13/V0.12 language specifications and relevant V0.9 Measurement
  contract.
- Relevant existing parser, type checker, declaration registry, runtime,
  Measurement, standard-library, and diagnostic code only to preserve current
  syntax and behavior.

## Authority and Entry Gate

- The V0.14 master plan is the confirmed scope authority.
- Sprint 084's candidate details are drafts until reviewed and locked.
  Preparing or executing this sprint does not authorize feature
  implementation, release, or publication.
- Obtain explicit Sprint 084 execution authorization and approval of the
  concrete file-by-file execution/evidence plan before making changes beyond
  the preparation artifacts.
- Do not modify production implementation or user-facing language documents.
  Do not begin Sprint 085 while any behavior required by the confirmed
  contract is unresolved or unapproved.

## Task Contract

- Lock the `is` grammar, precedence, target-type resolution, runtime
  semantics, and diagnostics.
- Lock math and Measurement signatures, domain/finite behavior, constants,
  and regressions; lock Unicode text behavior and the bounded numeric
  formatting grammar/locale/output contract.
- Finalize the valid/invalid examples, diagnostic matrix, and
  requirement-to-test matrix with stable IDs and exact source ranges.
- Use separate statuses for approved, proposed, unresolved, blocked, and
  not-run items. Do not treat a plausible candidate or current implementation
  behavior as product approval.
- Complete `builder-evidence.md` with exact decisions and checks, unresolved
  items, residual owners, and a recommendation for the separate contract
  disposition.

## Mandatory Boundaries

- Do not weaken a confirmed V0.14 requirement to fit existing implementation.
- Do not invent or reuse diagnostic identities without verifying their
  established meaning; record exact messages and source locations.
- A well-formed runtime mismatch for `is` is `false`; invalid type references
  are diagnostics. Do not add flow-sensitive type narrowing or nominal enum
  identity.
- Do not add angle units, date/time/text formatting patterns, locale fallback,
  or other unapproved feature scope.
- Do not claim V0.14 behavior is implemented because an example is written
  or a contract probe succeeds.
- No release, publication, package/version change, or platform certification
  is authorized by Sprint 084.

## Completion

Meet every criterion in `acceptance.md`. Submit a traceable contract
recommendation and request a separate Lead Developer/product-owner
disposition. If disposition is pending or a behavior is unresolved, leave the
affected contract and Sprint 085 readiness explicitly pending/BLOCKED.
