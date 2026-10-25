# Sprint 108 Requirements: V0.17 Integrated Acceptance and Closeout

## Document Status

Architect-prepared Sprint 108 planning package. It defines integrated
verification and closeout only; it does not authorize test execution, product
edits, release, or publication. Obtain separate explicit Sprint 108 execution
authorization and approval of the exact commands, validation worktree,
generated-output paths, test artifacts, and evidence files before running
gates or editing evidence.

## Goal

Verify the V0.17 desktop workbench as an integrated experience across
component refactoring, active-document initialization, the dispositioned
file-scoped explorer workflows, command-palette keyboard navigation, and the
resizable bottom-runtime workbench. Reconcile accepted Sprint evidence,
preserve raw failures and residuals, record unavailable platform checks, and
request a separate product-owner V0.17 disposition.

Sprint 108 adds no product feature scope. It is not a release sprint.

## Authority and Inputs

- V0.17 scope and Sprint 108 sequence:
  [`plan-openamxV17MasterSprintPlan.md`](../../plan-openamxV17MasterSprintPlan.md).
- Accepted desktop UX contract and version-specific bottom-only runtime
  decision:
  [`desktop-ux-contract.md`](../0102-v17-desktop-ux-contract-technical-gate/desktop-ux-contract.md).
- Sprints 102-107 builder evidence, acceptance, and technical-gate records.
- Sprint 108 artifacts: `blueprint.md`, `integrated-evidence-matrix.md`,
  `verification-plan.md`, `acceptance.md`, `builder-evidence.md`, and
  `handoff-prompt.md`.
- Current desktop package scripts, RPC contract, Playwright/Vite harness,
  and the focused tests named in `verification-plan.md`.

## In Scope

- Reconcile implementation and separate product-owner dispositions for
  Sprints 102-107. Preserve distinct raw test outcomes and owner dispositions.
- Verify Sprint 103's shell/component boundaries and preservation of current
  panel workflows.
- Verify Sprint 104 project-open/reopen/recovery/selection active-document
  initialization, exactly-once analysis/highlighting and preview, pause and
  non-AMX behavior, identity and freshness protections.
- Verify Sprint 105 only against its separately amended file-scoped V0.17
  disposition: project counts/search, menus/context actions, file
  create/duplicate/move/drop/trash/restore, trusted native open/reveal, and
  existing file/import safeguards.
- Record folder duplicate/move/tree drag/trash/restore as explicitly deferred
  from V0.17 with no target version committed. Do not implement or report
  those behaviors as passing. The accepted S105-FOLDER-01/02 status remains
  deferred/not accepted; the original broader master-plan explorer scope is
  not represented as fully delivered.
- Verify Sprint 106 palette selection/navigation/execution and the Trash
  restore-error list-retention follow-up. Record the S106-TRASH-04 failure/list
  refresh case and untested macOS Cmd shortcut as residuals unless covered by
  directly approved evidence. Obtain or record the separate S106 acceptance
  disposition; its current evidence says PENDING.
- Verify Sprint 107's Reka UI 2.10.5 technical GO, local wrapper integration,
  real service A/B `setPanelSizes` persistence, bounds, keyboard/focus,
  responsive behavior, bottom-only runtime, and preserved runtime content.
- Run the approved focused desktop typecheck, build, RPC/UI checks, and
  integrated repository verification gate in an isolated validation root.
- Record exact commands, environment, counts, output paths, first failures and
  retries, artifacts, residual owners, and platform limitations in
  `integrated-evidence-matrix.md` and `builder-evidence.md`.

## Out of Scope

- New product behavior, implementation changes, test weakening, dependency
  changes, or unrelated bug fixes. Any product defect requires a separately
  authorized corrective scope.
- Re-enabling deferred folder mutations or assigning them a future target
  version without a separate product decision.
- Changes to AMX language semantics, CLI, VS Code extension, package/version,
  release workflows, installers, publication, signing, or certification.
- Rewriting historical raw results, accepted Sprint 102-107 evidence, or
  existing test artifacts.
- Editing `planning/state.md`, `planning/decisions.md`,
  `planning/STATUS.json`, or historical sprint records unless the separate
  execution approval explicitly names the exact disposition update.

## Baseline and Known Residuals

- Sprint 102: UX contract ACCEPTED/CLOSED; Sprint 107 later closed the
  implementation gap with a Reka technical GO. The historical S102 gate file
  intentionally remains unchanged.
- Sprint 103: ACCEPTED/CLOSED with recorded verification residuals. The
  Hutch-wrapped typecheck did not complete; direct `bunx vue-tsc --noEmit`
  passed. The combined preview/workbench/diagram run had two diagram time-text
  assertion failures and one native WebView skip.
- Sprint 104: ACCEPTED/CLOSED with recorded residuals. Hutch typecheck wrapper
  did not complete; direct Vue typecheck and focused browser tests passed.
  The configured Windows Vite shim failed, so the same harness was started
  with `bunx vite`. The existing private reload helper has no UI call site.
- Sprint 105: ACCEPTED/CLOSED only against the amended file-only V0.17 scope.
  Folder operations were deferred without a target version. Its file UI/RPC
  tests and typecheck passed.
- Sprint 106: focused implementation checks passed, but separate product-owner
  acceptance is PENDING in the current builder evidence. S106-TRASH-04 was not
  exercised, and Cmd+Shift+P was tested on Windows/Chromium but not Cmd on a
  macOS host.
- Sprint 107: ACCEPTED/CLOSED; technical Reka GO. Direct typecheck, desktop
  unit/RPC, and focused UI checks passed. No standalone production build or
  native Electrobun host check was run. The Playwright harness RPC is mocked;
  real service persistence is covered separately.
- Native Electrobun host, non-Windows platforms, and platform certification
  remain unverified unless a separately approved supported route is available.

## Constraints and Gates

- V0.17 is desktop-only. Preserve the approved V0.17 scope amendment and
  report deferred folder work honestly.
- Sprint 108 begins only after Sprints 104-107 have their required separate
  acceptance dispositions. Resolve S106's pending disposition before claiming
  integrated V0.17 acceptance; if it remains pending, report the blocker and
  request a separate owner disposition.
- Verification is read-only with respect to product behavior. Stop if a test
  requires a product fix or the approved file/output plan is insufficient.
- Run builds in a fresh isolated copy/worktree because desktop web build can
  generate runtime/build outputs. Do not overwrite existing generated source,
  `dist`/`build`, Playwright results, screenshots/logs, or earlier Sprint
  artifacts.
- On Windows PowerShell the configured Playwright webServer's Unix
  `./node_modules/.bin/vite` shim has failed. A direct `bunx vite` route has
  been used successfully; record the exact startup/test commands and output
  paths. Do not edit test configuration as part of closeout.
- Distinguish browser harness, actual service/RPC, native Electrobun, OS, and
  architecture evidence. Never imply native or cross-platform certification
  from the Vite harness.
- Separate raw status (`PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`) from
  the product-owner disposition. Do not convert a raw failure to PASS because
  a residual is accepted.