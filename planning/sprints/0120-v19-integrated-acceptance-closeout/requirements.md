# Sprint 120 Requirements: V0.19 Integrated Acceptance and Closeout

## Document Status and Entry Gate

Architect-prepared Sprint 120 planning package. Sprint 120 is an integrated
verification and closeout gate; it adds no product behavior. Obtain separate
explicit execution authorization and approval of the exact worktree, commands,
artifact roots, preservation policy, and changed-path rule before running any
check.

Sprints 115-119 must be independently recognized in their recorded dispositions:

- Sprint 115: ACCEPTED/CLOSED on 2026-11-21; D115-01 through D115-09 accepted.
- Sprint 116: ACCEPTED/CLOSED on 2026-11-21; no residual recorded.
- Sprint 117: ACCEPTED/CLOSED on 2026-11-21; no residual recorded.
- Sprint 118: ACCEPTED/CLOSED on 2026-11-21; no residual recorded.
- Sprint 119: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-21. The V0.19
  VS Code host cases pass, while the full extension command remains 20 pass/9
  fail on unrelated Windows `EBUSY` cleanup and drive-letter/path-case checks.

The separate Sprint 119 disposition is the authority for that residual. Its raw
full-host result remains FAIL/PARTIAL; S120 must not rewrite it as a passing
aggregate even if V0.19-specific extension tests pass again.

## Goal

Establish traceable integrated V0.19 evidence from chart source and affine unit
declarations through checking, runtime, SI imports, normalization, shared chart
models, HTML/preview, PDF, DOCX, editor authoring, formatting, specification,
examples, and migration. Reconcile S115-S119 decisions and residuals, run focused
and broader gates, record exact raw outcomes and artifacts, and submit a
separate evidence-based V0.19 closeout recommendation.

Sprint 120 authorizes no release, publication, package/version change, installer
distribution, deployment, or platform certification.

## Accepted V0.19 Contract

- Charts accept `showTable <Boolean expression>`. Omitted resolves to false;
  present expressions evaluate once per chart emission in the ordinary
  environment. Duplicate/non-Boolean/malformed behavior retains the accepted
  S116 diagnostics.
- A resolved false omits actual chart-table output from interactive HTML,
  preview, PDF, and DOCX, including table JSON and table accessibility/alt
  references. A true result preserves the existing table model and output.
- Every checked unit retains finite positive scale and finite offset. PI/E are
  declaration-only allowlisted constants; user/imported constants are excluded.
- Runtime conversion uses $p=v\times scale+offset$ and preserves display intent.
  Equality/order compare physical values. Compatible subtraction returns the
  left display unit. Direct affine addition and unsupported multiplication,
  division, powers, `pow`, and `sqrt` reject.
- `sum` and `mean` aggregate physical values and convert to the first display
  unit. `min`/`max` select physically and retain the selected unit. `abs`,
  `round`, and unary minus preserve display-unit behavior.
- SI exports include `kelvin`, `celsius`, `fahrenheit`, `K`, `degC`, and `degF`.
  The invariant $0\,C=32\,F=273.15\,K$ holds.
- Mixed affine chart values normalize physically into the first selected display
  unit. External data remains exactly `{ value, unit }`; no scale/offset/physical
  value is serialized.
- VS Code and desktop authoring recognize V0.19 syntax, the additive V0.19 spec
  links from README, and Examples 05/07 demonstrate affine behavior and the
  intentional chart-table migration.

## In Scope

- Read-only reconciliation of S115-S119 contracts, Builder evidence, decisions,
  case counts, output artifacts, accepted residuals, and dependency status before
  execution.
- Execute the exact V0.19 focused root suite from the master plan, supplemental
  affine/data/example regressions as separately approved, and the broader root
  regression gate.
- Run root build and no-emit typecheck, verify generated browser runtime provenance
  and hashes, and distinguish a generator/build warning from a product failure.
- Run the configured VS Code extension host command, focused V0.19 tokenization/
  formatting/diagnostic cases, and preserve the full aggregate raw result even
  when V0.19-specific rows pass.
- Run desktop typecheck and the applicable V0.19 editor UI test, record Vite
  harness/native distinction, and report unavailable native/cross-platform
  evidence explicitly.
- Run Examples 05 and 07, render Example 07 HTML/PDF/DOCX, inspect exact false/
  true/dynamic chart table states, SI conversions, external shape, output units,
  migration text, and named-output regressions.
- Produce an integrated requirement/evidence matrix with exact command, CWD,
  host/tool versions, raw result, counts/assertions, artifact path/hash, retry,
  residual owner, Builder recommendation, and separate owner disposition.
- Record performance/resource observations that are relevant to rendered output
  and checks, but do not turn them into capacity or platform certification.
- Submit a separate V0.19 closeout recommendation and product-owner disposition.

## Out of Scope

- Product-source, test, specification, editor, renderer, SI, example, generated
  artifact, or package fixes discovered during integrated verification. Stop and
  request a separately authorized corrective plan and new acceptance cycle.
- Reinterpreting accepted contracts, diagnostic identities/messages, affine
  operation rules, output-omission semantics, external shape, or migration.
- Rewriting S115-S119 raw evidence, changing recorded residuals to PASS, or
  deleting first failures/retries/unavailable checks.
- Historical specification revisions, unrelated V0.18 residual remediation,
  new feature work, or broad documentation restructuring.
- Release preparation/publication, package/version changes, deployment,
  installer distribution, GitHub release work, platform certification, or claims
  based on unavailable native/cross-platform routes.

## Required Raw Result Vocabulary

Use exactly `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` for raw evidence.
Keep Builder recommendation and product-owner disposition in separate fields.
An owner acceptance with a residual never rewrites a raw failure/unavailable row.

## Completion Outputs

- A verified entry/dependency reconciliation for S115-S119.
- A completed `verification-plan.md` with exact approved commands/CWD/output roots
  and isolation/preservation rules.
- A populated `integrated-evidence-matrix.md` and `closeout-contract.md` covering
  every V0.19 requirement stream and accepted residual.
- Exact output artifacts and hashes for Examples 05/07, HTML/PDF/DOCX, relevant
  logs, build/generated-runtime audit, and extension/desktop results.
- `builder-evidence.md` with recommendation; separate owner disposition only.
- No release/package/version/publication/deployment/certification work.
