# Sprint 108 Verification and Output Plan

## Status

Proposed only. Obtain separate execution authorization and approval of the
exact command, worktree, generated-output, artifact, and evidence paths before
running any gate. Do not write over shared generated outputs or prior sprint
results.

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

## Proposed Commands

Exact commands and paths remain subject to approval. From the isolated
`desktop-app/` directory:

1. Direct typecheck: `bunx vue-tsc --noEmit`. If `bun run typecheck` is also
   run, record Hutch's result separately; prior S103/S104 wrappers stalled
   while direct typecheck completed.
2. Desktop package/RPC checks: `bun run test`.
3. Fresh desktop web build: `bun run build:web`; run only in the isolated
   validation root because it writes generated runtime and `dist`/staging
   outputs.
4. Focused S108 UI selection (each with a fresh output directory):

```powershell
bunx playwright test tests/ui/initial-active-document.pw.ts tests/ui/preview-freshness.pw.ts tests/ui/preview-navigation.pw.ts --output ..\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\activation
bunx playwright test tests/ui/project-explorer-workflows.pw.ts tests/ui/project-explorer-paths.pw.ts --output ..\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\explorer
bunx playwright test tests/ui/command-palette.pw.ts tests/ui/help-center.pw.ts --output ..\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\commands
bunx playwright test tests/ui/resizable-runtime.pw.ts tests/ui/shell-components.pw.ts tests/ui/workbench-comfort.pw.ts --output ..\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\layout-runtime
```

5. Full applicable desktop UI suite: `bunx playwright test --output
   ..\planning\sprints\0108-v17-integrated-acceptance-closeout\outputs\playwright\full-desktop`
   from the isolated desktop directory, subject to approval and feasibility.
6. Windows Vite harness: the configured `./node_modules/.bin/vite` webServer
   shim has failed under PowerShell. If it fails and reuse is unavailable,
   start the unchanged existing harness directly in a separate approved
   terminal:

```powershell
Push-Location desktop-app; bunx vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort; Pop-Location
```

   Then rerun the approved Playwright command against the same base URL and
   record both the failed configured attempt and successful direct-server
   retry. Do not modify Playwright/Vite config as part of verification.
7. Run root `bun test` or VS Code tests only if the separately approved
   repository verification gate explicitly includes them. V0.17 is
   desktop-only; do not infer those surfaces from desktop passes.
8. Close with `git diff --check`, exact status/path inventory, and comparison
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
- S106 acceptance remains pending: record it and seek separate disposition;
  do not claim integrated V0.17 acceptance meanwhile.
- Native host or other-platform routes unavailable: mark
  `BLOCKED/UNAVAILABLE`; do not infer a pass or certification.