# Sprint 093 Builder Evidence and Closeout

## Builder recommendation

**Builder recommendation: `BLOCKED/OPEN`.**

A separate Lead Developer/product-owner disposition was received on
2026-10-18: `ACCEPTED/CLOSED` with the exceptions and residual owners
recorded below. Raw failed/blocked check results are preserved.

The approved guide payload, desktop entry flow, project materialization, local
workflow documentation, and focused package smoke checks are implemented.
Two items prevent an unconditional closeout recommendation:

1. A Hutch dev build ran before Sprint 093 authorization because
   `hutch electrobun build --help` executed a build rather than displaying
   help. Its pre-command package hashes were not captured. The user directed
   that output be left untouched and the incident recorded.
2. The existing `desktop-app` test script still fails before its legacy RPC
   project checks at a pre-existing sandbox-count assertion. The newly added
   guide/service tests, root guide tests, and Help UI tests pass separately.

No app installer was launched or manually installed. This evidence does not
claim native installation, macOS/Linux acceptance, or cross-platform
certification.

## Entry gate and authorization

- Sprint 090 is `ACCEPTED/CLOSED` by the dated Lead Developer/product-owner
  disposition, with no architecture exceptions:
  [`lead-developer-disposition-2026-10-18.md`](../0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md).
- Sprint 091 is `ACCEPTED/CLOSED` within its authorized scope:
  [`builder-evidence-and-closeout.md`](../0091-v15-numbered-guide-core-learning-path/builder-evidence-and-closeout.md).
- Sprint 092 is separately `ACCEPTED/CLOSED`:
  [`builder-evidence-and-closeout.md`](../0092-v15-feature-references-complete-example-cleanup/builder-evidence-and-closeout.md).
- Sprint 093 execution and the proposed file/test/output plan were separately
  authorized by the user on 2026-10-18 before source edits. A narrow
  amendment was separately approved on 2026-10-18 for the ten AMX documents
  listed under Documentation below.
- Branch: `feat/create-V015`.
- Starting commit: `3c3f0ab5601637083b8b3380ec2428af55f87fc0`.
- Initial tracked worktree: clean.
- Baseline and protected-output hashes:
  [`baseline-protected-outputs.json`](artifacts/baseline-protected-outputs.json).
- Final preservation comparison:
  [`final-output-preservation-closeout.json`](artifacts/final-output-preservation-closeout.json).
- The approved web build regenerated `desktop-app/dist` after recording its
  baseline. The original package attempts and all 75 files in other
  baselined package/output scopes remain byte-identical to the post-incident
  baseline. The tracked Kitchen Sink PDF is included in that comparison.

### Pre-authorization build incident

The attempted read-only probe `hutch electrobun build --help` instead ran a
dev build to `desktop-app/build/dev-win-x64` before Sprint 093 authorization.
That command emitted 64 files totaling 131,747,768 bytes. No hashes were
captured before it ran, so the original contents cannot be established or
reconstructed from this work. The user explicitly directed that the output
remain untouched. It was hashed in the post-incident baseline and remained
unchanged thereafter. Stable installer files were not overwritten.

This is a recorded boundary violation, not a successful preflight. The final
package was therefore built only into the approved isolated package root.

## Implemented scope

### Resource staging and package

- Added a single explicit allowlist in
  [`guideResources.ts`](../../../desktop-app/src/bun/guideResources.ts) and a
  deterministic stage command in
  [`stage-guide-resources.ts`](../../../desktop-app/scripts/stage-guide-resources.ts).
- Canonical source is repository `examples/`. The amended stage is
  `desktop-app/.cottontail-tmp/sprint-093-guide-attempt-2`; the first stage
  attempt is preserved.
- The package maps only that staged directory into the trusted Bun resource
  path `Resources/app/bun/guide`. Development and packaged resource roots
  are resolved from Bun's runtime directory; the webview supplies no source
  or resource path.
- Final package output:
  `desktop-app/.cottontail-tmp/sprint-093-package/attempt-3/dev-win-x64/OpenAMXDesktop-dev/Resources/app/bun/guide`.
  The first package and attempt 2 remain untouched.
- The final payload has exactly 24 files (56,096 bytes total):
  - AMX documents `00_Table_of_Contents.amx` through
    `14_Battery_Resistor_Circuit.amx`.
  - `data/asset.json`, `data/screenings.csv`,
    `data/reviewed-at.json`, `data/measurement-trips.json`.
  - `fixtures/invalid/asset.json` and `fixtures/invalid/screenings.csv`.
  - `libraries/asset-management.amx`, `libraries/screening.amx`, and
    `libraries/travel-measurements.amx`.
- Exact canonical/staged/package paths, sizes, and SHA-256 values:
  [`desktop-guide-package-parity-amendment.json`](artifacts/desktop-guide-package-parity-amendment.json).
  The exact-tree check excludes all other `examples/` content, local project
  state, legacy/test fixtures, generated outputs, unrelated libraries, and
  `kitchen-sink.pdf`.

### Entry point and project creation

- Added a distinct `guide` project intent to
  [`rpc.ts`](../../../desktop-app/src/shared/rpc.ts). The Help UI passes only
  the typed intent; no renderer-provided source/resource path is accepted.
- Added **OpenAMX learning guide** under the existing Help > Starter examples
  flow reachable from Welcome. Hello OpenAMX and Operations note remain the
  two input-free inline starters; Getting Started's Hello action and ordinary
  project creation remain on the standard report path.
- The trusted Bun service validates the selected real empty directory and
  transition action, verifies the fixed allowlisted resource tree, writes
  files exclusively with rollback on materialization failures, creates the
  normal `.openamx/project.json`, omits `report.amx` for the guide, and opens
  `00_Table_of_Contents.amx`.
- Focused tests cover package-root creation, index rendering, local input and
  library resolution from the created root, standard project preservation,
  missing resources, nonempty and symlink destinations, and picker/transition
  cancellation. The safe relative-AMX navigation and local attachment
  confirmation tests also pass.

### Documentation

- Updated the root, desktop, and VS Code READMEs; V0.12-V0.14 spec example
  links; authoring skill; searchable Help; and direct-link assertions.
- By approved amendment, updated only
  `examples/00_Table_of_Contents.amx`,
  `examples/01_First_Computable_Document.amx`,
  `examples/02_Expressions_and_Decisions.amx`,
  `examples/03_Collections_and_Functions.amx`,
  `examples/04_Typed_Records_Enums_and_Modules.amx`,
  `examples/05_Measurements_and_Units.amx`,
  `examples/06_Mapped_Data_and_Validation.amx`,
  `examples/07_Tables_Charts_and_Named_Outputs.amx`,
  `examples/12_Complete_Asset_Screening_Report.amx`, and
  `examples/13_Route_Measurement_Report.amx` to distinguish the packaged
  project-root paths from repository-checkout `examples/...` paths. The index
  no longer disclaims desktop integration.
- Historical V0.1 snippets, language semantics, the rest of the example
  corpus, release scripts, and broad test migration were not changed.

## Verification evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Guide resource helper and project/service unit tests | **PASS**; 8 tests in the file (9 when the package-parity case is enabled). | [`guide-project-local-smoke-amendment.log`](artifacts/guide-project-local-smoke-amendment.log) and [`desktop-package-resource-smoke-amendment.log`](artifacts/desktop-package-resource-smoke-amendment.log). |
| Package parity and offline project smoke | **PASS**; 9 tests, 0 failures. Renders the packaged index and runs lessons 06, 07, 12, and 13 using project-root data/module paths. | [`desktop-package-resource-smoke-amendment.log`](artifacts/desktop-package-resource-smoke-amendment.log), [`desktop-guide-package-parity-amendment.json`](artifacts/desktop-guide-package-parity-amendment.json). |
| Root guide/link and examples tests | **PASS**; 16 tests, 0 failures. | [`root-guide-tests-amendment.log`](artifacts/root-guide-tests-amendment.log). |
| Help/Welcome UI test | **PASS**; 2 tests, no external requests. The configured Windows webServer command initially failed because it uses a POSIX `./node_modules/.bin/vite` path; retry started the harness with Bun and used the approved isolated Playwright output directory. | [`desktop-ui-retry.log`](artifacts/desktop-ui-retry.log), [`desktop-ui-vite.stdout.log`](artifacts/desktop-ui-vite.stdout.log), [`desktop-ui-vite.stderr.log`](artifacts/desktop-ui-vite.stderr.log). |
| Safe relative-AMX/local attachment navigation | **PASS**; 3 tests. | Focused `desktopPreviewNavigation.test.ts` run. |
| Desktop typecheck | **PASS**; `bunx vue-tsc --noEmit`. | Command result recorded in this Builder evidence. |
| Desktop web/resource build | **PASS**; Vite build, deterministic 24-file stage, worker, Sharp runtime, and four PDF fonts. | [`desktop-web-build-amendment.log`](artifacts/desktop-web-build-amendment.log). |
| Electrobun Windows dev package | **PASS**; isolated attempt 3, no stable bundle overwrite. | [`desktop-package-build-amendment.log`](artifacts/desktop-package-build-amendment.log). |
| Existing desktop `bun run test` script | **BLOCKED** after its focused unit tests pass: `rpc-contract-check.ts` stops at line 153 because it expects two `sandbox="allow-scripts"` attributes, while both HEAD and current `App.vue` contain one. The assertion and RPC script were not changed; later assertions in that script are not reached. | [`desktop-bun-tests-amendment.log`](artifacts/desktop-bun-tests-amendment.log). |
| Installer launch/manual installation | **NOT RUN**. This was package/resource inspection and service smoke only, not platform installation acceptance. | Windows package was built; macOS/Linux routes and full installer acceptance remain for Sprint 094. |

## Acceptance reconciliation

| ID | Status | Evidence / disposition |
| --- | --- | --- |
| `V15-DESK-GATE-01` | **PASS with incident recorded** | Sprints 090-092 were accepted prerequisites; Sprint 093 execution/file/output approval and the narrow guide-document amendment were obtained before source edits. The earlier accidental package build is separately recorded above and under `V15-DESK-SCOPE-01`. |
| `V15-DESK-RESOURCE-01` | **PASS** | Explicit allowlist and deterministic canonical stage. |
| `V15-DESK-RESOURCE-02` | **PASS** | Exact 24-file package tree and byte/hash parity manifest. |
| `V15-DESK-RESOURCE-03` | **PASS, bounded** | Fixed development/package lookup and package resource directory verified; no app installation or standalone launch claim. |
| `V15-DESK-ENTRY-01` | **PASS** | Distinct guide action is visible in Help Starter examples from Welcome; local Help describes project-root workflow. |
| `V15-DESK-ENTRY-02` | **PASS** | Existing two starter IDs/content and ordinary project behavior remain; focused unit/UI assertions pass. |
| `V15-DESK-PROJECT-01` | **PASS** | Full allowlisted guide and configuration materialize; no default report; index active; package-root CLI smoke uses local assets/modules. |
| `V15-DESK-PROJECT-02` | **PASS** | Standard project still creates configuration and `report.amx`; focused service test passes. |
| `V15-DESK-FAIL-01` | **PASS** | Nonempty/symlink/missing-resource/cancel cases reject safely; no partial guide project is left. |
| `V15-DESK-SECURITY-01` | **PASS** | Typed intent only, fixed trusted resource root, strict tree and containment checks; relative-link/attachment behavior unchanged. |
| `V15-DESK-OFFLINE-01` | **PASS, bounded** | Package resource payload creates a project; rendered index and mapped-data/module lessons execute from project-root files without network requests. No installed-app/offline platform claim. |
| `V15-DESK-DOC-01` | **PASS** | Assigned current user documentation and the amended packaged-project workflows are updated. |
| `V15-DESK-REF-01` | **PASS** | Current V0.12-V0.14 references resolve; focused root link tests pass. |
| `V15-DESK-TEST-01` | **BLOCKED** | Scoped guide, package, UI, type, root, and navigation tests pass, but the existing desktop RPC script fails at the pre-existing sandbox-count assertion before its later checks. |
| `V15-DESK-SCOPE-01` | **FAIL / owner disposition required** | The pre-authorization Hutch build violated the handoff boundary; no pre-run package hashes exist. User directed preservation; this Builder record does not retroactively waive the boundary. No release/version/status/historical evidence changes were made. |
| `V15-DESK-CLOSEOUT-01` | **PASS** | Separate Lead Developer/product-owner disposition received on 2026-10-18: `ACCEPTED/CLOSED` with documented exceptions and named residual owners. |

## Residual owners and closeout request

- **Lead Developer/product owner:** decide whether the pre-authorization
  package-build incident permits an `ACCEPTED/CLOSED` exception or requires
  follow-up. The original `desktop-app/build/dev-win-x64` state cannot be
  reconstructed from this session because it was not hashed before the
  accidental command; it has not been changed since the post-incident
  baseline.
- **Desktop maintainer:** correct or disposition the stale sandbox-count
  assertion in `desktop-app/tests/rpc-contract-check.ts`, then rerun the
  complete desktop contract suite.
- **Sprint 094 desktop/release owners:** perform manual installer launch and
  integrated/offline acceptance on available native hosts, cover unsupported
  macOS/Linux routes on their native hosts, and migrate remaining root
  package-script and release/test consumers.

## Separate Lead Developer/product-owner disposition

- Decision date: 2026-10-18.
- Disposition: `ACCEPTED/CLOSED` with documented exceptions and residual
  owners.
- The pre-authorization `desktop-app/build/dev-win-x64` rebuild is accepted
  as a documented process exception. Preserve its current state; do not
  attempt restoration because pre-command hashes were not captured.
- The existing RPC contract test mismatch remains a named desktop-maintainer
  residual. Its raw result remains `BLOCKED` in the acceptance matrix.
- This disposition does not claim installer launch, manual installation,
  native cross-platform acceptance, release, publication, or version change.
- Sprint 094 still requires its own execution authorization and approved
  plan.

No commit was created. `planning/STATUS.json`, release/version state,
historical sprint evidence, tracked generated outputs, and the Kitchen Sink
PDF were not modified. Sprint 093 is `ACCEPTED/CLOSED` per the separate
disposition above; the Builder recommendation and technical limitations
remain visible for follow-up.
