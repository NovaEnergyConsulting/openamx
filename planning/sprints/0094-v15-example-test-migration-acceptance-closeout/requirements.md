# Sprint 094 Requirements: Example Test Migration and V0.15 Acceptance Closeout

## Document Status and Entry Gate

Architect-prepared Sprint 094 documentation. Sprints 090-092 are
`ACCEPTED/CLOSED`. Sprint 093 is separately `ACCEPTED/CLOSED` with a
documented process exception and named residuals; its Builder
recommendation remains `BLOCKED/OPEN`. See
[`builder-evidence-and-closeout.md`](../0093-v15-desktop-guide-packaging-entry-point/builder-evidence-and-closeout.md)
for the raw results, preserved package artifacts, and exception disposition.

These prerequisite dispositions do not authorize Sprint 094 execution.
Obtain separate explicit Sprint 094 authorization and approval of the
concrete source/test/reference/output/package/native-verification file plan.
The request to prepare these documents authorizes planning only.

## Goal

Complete the V0.15 example-corpus migration and acceptance closeout:
migrate remaining tests and active path consumers to the approved 00-14
guide; preserve behavior and meaningful negative, renderer, release and
security coverage; retire redundant legacy material and checked-in generated
HTML only under their accepted policies; verify package parity and the
offline desktop learning journey; and record all outcomes, platform limits,
residuals and separate product-owner disposition.

Sprint 094 is verification, test/reference migration and corpus cleanup only.
It adds no product or AMX feature scope.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md).
- Accepted architecture and per-file mapping:
  [`final-information-architecture-and-feature-matrix.md`](../0090-v15-example-information-architecture/final-information-architecture-and-feature-matrix.md)
  and
  [`corpus-inventory-and-reference-trace.md`](../0090-v15-example-information-architecture/corpus-inventory-and-reference-trace.md).
- Sprint 090, 091, and 092 closeout records and residuals.
- Sprint 093 package allowlist, parity manifest, outputs, incident record,
  accepted exception, and desktop test blocker:
  [`builder-evidence-and-closeout.md`](../0093-v15-desktop-guide-packaging-entry-point/builder-evidence-and-closeout.md)
  plus its `artifacts/` evidence.
- `docs/language-spec-v0.14.md` and applicable earlier specifications are
  the behavior authority. Tests preserve their contracts rather than
  redefining features during path migration.

## In Scope

- Migrate all remaining tests and active references from legacy example
  paths to the approved numbered files, canonical support data, or explicit
  test-only fixtures.
- Preserve/restore the intent of existing assertions for:
  - runnable example bindings and diagnostics;
  - V0.12-V0.14 feature examples and README/spec/extension Help links;
  - formatter behavior;
  - HTML/PDF/DOCX/report output content and export behavior;
  - V0.5 project-settings compatibility;
  - V0.9 route Measurement values, units and outputs;
  - Kitchen Sink report and desktop chart-security coverage;
  - desktop starter and packaged guide workflows;
  - release CLI smoke behavior and its temporary output boundary.
- Move Kitchen Sink, V0.5 compatibility material, and any other retained
  non-guide AMX regression fixture to a clearly test-owned location with
  its complete relative module/input closure. Do not leave unnumbered,
  unlinked instructional documents presented as current guide material.
- Migrate root `package.json` scripts and release smoke/docs consumers away
  from stale source/output paths, or retire obsolete scripts with an
  explicitly recorded rationale. Rendering commands must not overwrite
  tracked golden files as a side effect.
- Remove these four checked-in generated HTML outputs only after their
  snapshot equality tests are migrated to temporary render outputs and
  focused structural/content assertions remain:
  - `examples/hello-world.html`
  - `examples/transformer-strategy.html`
  - `examples/asset-fleet-risk-analysis.html`
  - `examples/typed-asset-analysis.html`
- Verify every guide/reference link, support-file path, input mapping,
  package dependency, instructional role, and remaining legacy reference
  against the accepted 00-14 architecture.
- Verify packaged resource integrity and offline guide project creation;
  perform direct installed/native desktop workflow checks on available
  supported hosts under the approved preservation plan. Record unavailable
  platform routes explicitly.
- Re-run the complete applicable root and desktop verification gates,
  including the pre-existing desktop RPC sandbox-count mismatch recorded
  in Sprint 093. Resolve it only after reviewing the actual markup/test
  contract and with explicit authorization for any test change; otherwise
  preserve its raw failure and request a named residual disposition.
- Produce a complete evidence matrix, Builder recommendation, residual
  owners, and separate Lead Developer/product-owner V0.15 closeout request.

## Required Corpus Dispositions

- Canonical learner/reference set: `examples/00_...amx` through
  `examples/14_...amx`, as named and linked by the accepted architecture.
- Canonical support groups remain `examples/data/`,
  `examples/fixtures/invalid/`, and `examples/libraries/`; reuse the
  Sprint 093 package allowlist and verify its transitive closure.
- Legacy examples retained for tests or compatibility are outside the
  guide/index/package boundary and are explicitly classified with an owner.
  Their location and module/input closure must be approved before moves.
- The four generated HTML files listed above are not retained as
  checked-in snapshots after assertions are safely migrated to temporary
  destinations.
- `examples/kitchen-sink.pdf` is user-supplied and immutable. Preserve its
  Sprint 090/093 baseline SHA-256:
  `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.
  Never overwrite, regenerate, move, or remove it.
- `examples/.openamx/local.json` is host-specific project state and is
  excluded from the package. Do not remove it unless the approved Sprint
  094 file plan explicitly authorizes the exact path; preserve/hash it
  otherwise.
- Preserve the accepted Sprint 093 development-build incident output at
  `desktop-app/build/dev-win-x64` byte-for-byte as it exists at Sprint 094
  start. Its pre-incident content cannot be reconstructed. Do not restore,
  clean, rebuild into, or claim recovery of that directory.
- Preserve accepted S093 package attempt outputs under
  `desktop-app/.cottontail-tmp/` and use a separate authorized Sprint 094
  output path. Do not overwrite accepted attempts or installers.

## Explicit Sprint 093 Residuals to Carry Forward

1. **Desktop test blocker:** `desktop-app`'s `bun run test` stopped at the
   existing assertion in `tests/rpc-contract-check.ts` expecting two
   `sandbox="allow-scripts"` attributes while current `App.vue` contains
   one. Sprint 093 left the assertion/script unchanged and later checks in
   that script did not run. Re-run it, establish the intended contract from
   actual markup and security requirements, and either:
   - obtain authorization for a narrowly justified test correction, then
     run the full desktop contract script; or
   - record the unchanged raw failure and request explicit disposition with
     a named owner. Never weaken security or silently change an expected
     count to force a pass.
2. **Pre-authorization package build incident:** Lead Developer/product
   owner accepted this as a documented process exception. Keep the
   `desktop-app/build/dev-win-x64` state untouched; pre-command hashes do
   not exist, so no restoration or claim of pre-incident integrity is
   possible.
3. **Native/platform acceptance:** Sprint 093 inspected and smoke-tested a
   packaged Windows resource payload but did not launch/install an
   application. Sprint 094 owns supported direct offline journey tests and
   records exact macOS/Linux/Windows route availability. Do not infer
   installation or cross-platform support from parity/service smoke.
4. **Legacy consumers and generated snapshots:** migrate remaining root
   tests, package scripts, release smoke, and direct fixture references;
   migrate HTML assertions before deleting snapshots. Keep V0.1 historical
   snippets historical unless separately authorized.

## Out of Scope

- New syntax, runtime/library semantics, editor/renderer capability, user
  workflow beyond the approved guide/package behavior, or changes to safe
  link/security policies.
- Release, publication, version changes, installer distribution, platform
  certification claims, or changes to `planning/STATUS.json` and historical
  sprint records.
- Unapproved removal or modification of user-supplied/incident artifacts.
- Silent acceptance of raw failures, unavailable checks, or residuals.

## Exit Gate

Sprint 094 is complete only when every applicable master-plan and accepted
Sprint 090 fixture is dispositioned with direct evidence; all authorized
tests, path migrations and cleanup decisions are recorded; all failures and
unavailable platform checks have explicit disposition and owners; and a
separate Lead Developer/product-owner records V0.15 `ACCEPTED/CLOSED` with
named exceptions or `BLOCKED/OPEN` with follow-up. Builder evidence alone
does not close V0.15 or authorize release/publication.
