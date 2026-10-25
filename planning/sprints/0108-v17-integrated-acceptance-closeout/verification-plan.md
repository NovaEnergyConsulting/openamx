# Sprint 108 Verification and Output Plan

## Status

Approved for execution by the user on 2026-10-25, against commit
`8c55827d1726190ff165c89388ee26a2ee6b811b` on `feat/create-V0.17`. The exact
authorized.
worktree, commands, generated-output, artifact, and evidence paths below were
approved before execution. A later corrective authorization allowed a
test-only stale-selector update in `desktop-app/tests/ui/initial-active-document.pw.ts`;
no product source or test/configuration infrastructure was changed.

## Approved Execution Manifest

- Source snapshot: clean `feat/create-V0.17` at
  `8c55827d1726190ff165c89388ee26a2ee6b811b`.
- Validation worktree: detached worktree at
  `C:\Users\gamez\AppData\Local\Temp\openamx-s108-validation-8c55827`.
- Worktree checkout: the normal checkout failed on tracked historical paths
  exceeding Windows filename limits. The user separately approved this exact
  process-only retry, which succeeded without persistent Git configuration:
  `git -c core.longpaths=true worktree add --detach "C:\Users\gamez\AppData\Local\Temp\openamx-s108-validation-8c55827" 8c55827d1726190ff165c89388ee26a2ee6b811b`.
- Dependencies: independently install with `bun install --frozen-lockfile`
  from the validation root and from its `desktop-app/`; do not link or write
  into the shared `node_modules` directories.
- Approved host baseline: Windows 11 Home 10.0.26300 x64; PowerShell
  5.1.26100.9711; Bun 1.4.4; Node 24.13.1; Playwright 1.64.1; Chromium
  156.0.8078.4.
- Shared artifact root, created for this run:
  `planning/sprints/0108-v17-integrated-acceptance-closeout/outputs/`.
  Logs are restricted to `outputs/logs/`; Playwright results are restricted
  to fresh subdirectories under `outputs/playwright/`.
- Approved log files: `environment-and-worktree.log`,
  `dependency-install-root.log`, `dependency-install-desktop.log`,
  `typecheck.log`, `typecheck-retry-02.log`, `desktop-test.log`, `build-web.log`,
  `build-web-retry-02.log`, `root-build.log`,
  `playwright-configured-shim.log`, `vite-direct-server.log`,
  `playwright-activation.log`, `playwright-explorer.log`,
  `playwright-commands.log`, `playwright-layout-runtime.log`,
  `playwright-activation-retry-02.log`, `playwright-explorer-retry-02.log`,
  `playwright-full-desktop.log`, `playwright-full-desktop-retry-02.log`,
  `root-bun-test.log`, `root-bun-test-retry-02.log`,
  `corrective-mapped.log`, `corrective-file-drop.log`,
  `corrective-mapped-retry-02.log`, `corrective-file-drop-retry-02.log`,
  `corrective-create-active-document.log`,
  `corrective-create-active-document-retry-02.log`, and `final-audit.log`,
  all under `outputs/logs/`.
- Approved Playwright output directories:
  `configured-shim-probe/`, `activation/`, `explorer/`, `commands/`,
  `layout-runtime/`, `full-desktop/`, `corrective-mapped/`,
  `corrective-file-drop/`, `corrective-mapped-retry-02/`,
  `corrective-file-drop-retry-02/`, `corrective-create-active-document/`,
  `corrective-create-active-document-retry-02/`, `activation-retry-02/`,
  `explorer-retry-02/`, and `full-desktop-retry-02/`, all under
  `outputs/playwright/`. Shared `desktop-app/test-results/` and all S102-S107
  artifact paths are excluded.
- Record updates authorized: this `verification-plan.md`,
  `integrated-evidence-matrix.md`, and `builder-evidence.md`; also the Sprint
  106 `builder-evidence.md` solely for the separate ACCEPTED/CLOSED
  disposition just recorded. No historical Sprint 102 gate, global planning
  ledger, or product/test/config path is authorized.
- Corrective authorization on 2026-10-25 allowed focused diagnosis only in
  `desktop-app/tests/ui/initial-active-document.pw.ts`,
  `desktop-app/tests/ui/project-explorer-workflows.pw.ts`,
  `desktop-app/spikes/sprint042-workflow-harness/src/main.ts`,
  `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`,
  `desktop-app/src/mainview/App.vue`, and
  `desktop-app/src/mainview/components/ProjectExplorer.vue`; any additional
  path required renewed approval. Only
  `desktop-app/tests/ui/initial-active-document.pw.ts` was changed, to replace
  obsolete “New AMX” and “Move / rename” controls with the current Project
  actions > New > AMX file and Rename / Move active file controls. Isolated
  diagnosis showed mapped-data and file-drop failures passed alone; the full
  corrected activation and explorer groups passed. No product files changed.
- Supplemental authorization on 2026-10-25: retry isolated `bun run build:web`
  - Separate product-owner V0.17 disposition on 2026-10-25:
    ACCEPTED/CLOSED WITH RECORDED RESIDUALS within the amended file-only scope.
    The disposition does not change raw `BLOCKED/UNAVAILABLE` statuses for the
    Hutch web build, full desktop UI collection, or native/platform routes.
  - Supplemental authorization on 2026-10-25: retry isolated `bun run build:web`
  from validation `desktop-app/` with log `outputs/logs/build-web-retry-02.log`,
  then `bunx vue-tsc --noEmit` with log `outputs/logs/typecheck-retry-02.log`;
  run root `bun run build` with log `outputs/logs/root-build.log`; if the
  desktop build succeeds, run full Playwright with output
  `outputs/playwright/full-desktop-retry-02/` and log
  `outputs/logs/playwright-full-desktop-retry-02.log`; after root build, rerun
  root `bun test` with log `outputs/logs/root-bun-test-retry-02.log`. Generated
  files stay only in the detached validation worktree. Preserve the initial
  blocked/failing logs and results. Stop on a new product failure or stall.
- Environment, dependency, typecheck, package/RPC, build, Playwright,
  repository-test, and final-audit command output is captured to its
  corresponding approved log file. Browser results remain harness evidence,
  not native-host or platform certification.

## Validation Workspace

- Preferred: create a fresh temporary validation copy/worktree from the
  approved source snapshot. Reuse installed dependencies only by an approved
  read-only/link strategy. Run typecheck/build/tests in that copy so desktop
  `dist/`, staged resources, generated diagram runtime, and caches cannot
  overwrite the shared source tree.
- If a copy/worktree is not feasible, stop and approve exact existing output
  paths and baseline hashes before running any command that writes them.
- Use a new Sprint 108 artifact root:
  `planning/sprints/0108-v17-integrated-acceptance-closeout/outputs/`.
  Keep logs, Playwright results, screenshots, build inventory, and hashes in
  separate named subdirectories. Do not reuse S104-S107 artifact directories
  or `desktop-app/test-results/`.
- Record OS/architecture, Bun/Node, Playwright/Chromium, Electron/Bun host if
  used, branch/commit/status, and the isolated workspace path before tests.

## Authorized Commands

The following approved commands run from the isolated validation worktree.
Unless stated otherwise, the working directory is its `desktop-app/`.

1. Direct typecheck: `bunx vue-tsc --noEmit`. If `bun run typecheck` is also
   run, record Hutch's result separately; prior S103/S104 wrappers stalled
   while direct typecheck completed.
2. Desktop package/RPC checks: `bun run test`.
3. Fresh desktop web build: `bun run build:web`; run only in the isolated
   validation root because it writes generated runtime and `dist`/staging
   outputs.
4. First retain the configured-shim attempt with
  `bunx playwright test tests/ui/initial-active-document.pw.ts --output
  "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\configured-shim-probe"`.
  Do not change Playwright/Vite configuration. If the configured Unix shim
  fails on Windows, preserve the failure, start the unchanged existing
  harness with the direct `bunx vite` command below, and rerun the approved
  UI groups.
5. Focused S108 UI selection (each with a fresh output directory):

```powershell
bunx playwright test tests/ui/initial-active-document.pw.ts tests/ui/preview-freshness.pw.ts tests/ui/preview-navigation.pw.ts --output "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\activation"
bunx playwright test tests/ui/project-explorer-workflows.pw.ts tests/ui/project-explorer-paths.pw.ts --output "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\explorer"
bunx playwright test tests/ui/command-palette.pw.ts tests/ui/help-center.pw.ts --output "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\commands"
bunx playwright test tests/ui/resizable-runtime.pw.ts tests/ui/shell-components.pw.ts tests/ui/workbench-comfort.pw.ts --output "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\layout-runtime"
```

6. Windows Vite harness: start the unchanged existing harness directly in a
   separate terminal only after preserving the configured-shim failure:

```powershell
bunx vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort
```

    With that server running, run the focused UI groups above. Do not modify
    Playwright/Vite config.
  7. Full applicable desktop UI suite:
    `bunx playwright test --output
    "C:\Users\gamez\Programming\openamx\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\full-desktop"`.
8. Repository gate: `bun test` from the isolated repository root. No VS Code
  suite or release/package command is included.
9. Close with `git diff --check`, exact status/path inventory, and comparison
  against the pre-run generated-output/artifact inventory.

## Integrated Gate Order

- S102-S107 acceptance/disposition reconciliation.
- Focused activation and preview freshness tests.
- File-scoped explorer and actual RPC/service contract tests.
- Command palette/Help and Trash restore residual tests.
- Resizer actual A/B service persistence and App.vue/UI tests.
- Runtime bottom-only/content/scrolling tests.
- Desktop direct typecheck, `bun run test`, isolated `build:web`, focused UI,
  and approved full desktop UI/repository gate.
- Artifact preservation, raw outcome matrix, residual owner/disposition, and
  final path audit.

## Stop Conditions

- Any test requests an unapproved source/test/config path or writes outside
  the approved isolated roots: stop and request a plan amendment.
- Any product defect requires code/test correction: stop verification and
  request a separate corrective authorization and exact file plan.
- S106 acceptance is ACCEPTED/CLOSED with recorded residuals on 2026-10-25.
  S108 still requires a separate product-owner V0.17 closeout disposition.
- Native host or other-platform routes unavailable: mark
  `BLOCKED/UNAVAILABLE`; do not infer a pass or certification.