# S128 Setup and Inspection Failures

These first failures and recoveries are preserved; no failure was erased or retried past a stop condition.

## Worktree Creation Attempt 1

Command: `git worktree add --detach C:\Users\gamez\Programming\openamx-s128-validation-d36ca2a9 d36ca2a9d715b5a6b7b0d29004eaa872de08c5a4`

```text
Preparing worktree (detached HEAD d36ca2a)
error: unable to create file planning/sprints/0106-v17-command-palette-navigation/outputs/command-palette-playwright/help-regression-final-2/help-center.pw.ts-help-fra-3e38b-hrome-and-a-scrollable-body/sprint046-help-1024x720.png: Filename too long
error: unable to create file planning/sprints/0106-v17-command-palette-navigation/outputs/command-palette-playwright/help-regression-final-2/help-center.pw.ts-help-fra-3e38b-hrome-and-a-scrollable-body/sprint046-help-1440x900.png: Filename too long
error: unable to create file planning/sprints/0107-v17-resizable-workbench-runtime/artifacts/playwright/sprint107-workbench-comfort/workbench-comfort.pw.ts-lo-083a4-lorer-and-runtime-scrolling/sprint045-820x720-adaptive-light.png: Filename too long
error: unable to create file planning/sprints/0107-v17-resizable-workbench-runtime/artifacts/playwright/sprint107-workbench-comfort/workbench-comfort.pw.ts-ru-72f69-ve-in-light-and-dark-themes/sprint045-1440x900-light-runtime.png: Filename too long
Updating files: 100% (2371/2371), done.
fatal: Could not reset index file to revision 'HEAD'.
```

Read-only inspection found no registered or partial S128 worktree. The retry added only a per-command configuration override and succeeded:

```text
git -c core.longpaths=true worktree add --detach C:\Users\gamez\Programming\openamx-s128-validation-d36ca2a9 d36ca2a9d715b5a6b7b0d29004eaa872de08c5a4
Preparing worktree (detached HEAD d36ca2a)
Updating files: 100% (2371/2371), done.
HEAD is now at d36ca2a feat: Add Sprint 128 documentation for V0.21 Toolchain and Update-Host Contract
```

## Focused Test Before Dependency Installation

```text
bun test v1.4.5 (a7733435c)
error: Cannot find package 'jszip' from 'C:\Users\gamez\Programming\openamx-s128-validation-d36ca2a9\tests\release.test.ts'
0 pass
1 fail
1 error
```

`bun install --frozen-lockfile` installed 80 packages in the validation worktree. The same test command then passed 62/0 with 236 expectations. Full attempt transcripts are in `release-test-run-01.log` through `release-test-run-07.log`.

## Inline Artifact Inspection Attempt

The first PowerShell 5.1 `bun -e` attempt failed before loading artifacts because native argument quoting removed the inline script's double quotes. The first diagnostics were:

```text
1 | import { createHash } from node:crypto;
                               ^
error: Expected string but found "node"
...
Bun v1.4.5 (Windows x64)
Command exited with code 1
```

No artifact assertion ran. The equivalent checks were moved to `inspect-windows-artifacts.ts` in this evidence directory and passed; the structured result is preserved in `windows-artifact-inspection.json`.
