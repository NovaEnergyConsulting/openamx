# Sprint 038 Builder Evidence

## Disposition

**COMPLETE (2026-10-02, Lead Developer acceptance).** This record includes the initial lifecycle slice, Builder remediation, user testing observations, and final Lead Developer disposition. The earlier interim/open-item notes are historical snapshots superseded by the final acceptance below. The Builder did not independently reproduce the Lead Developer's full acceptance run.

## Delivered Boundary

- `createProject` accepts only an existing empty real directory, stages version-1 `.openamx/project.json` and a minimal `report.amx`, rolls back created artifacts on failure, then transitions through the existing guarded project generation boundary.
- `pickCreateProject` performs folder selection only in the trusted Bun picker route; Vue receives the bounded project/document state and cannot submit arbitrary filesystem paths.
- Autosave defaults to enabled with a configurable 100-10,000 ms delay. It routes every write through the existing disk-hash, same-directory temporary-file, flush, and atomic-replace path. Invalid AMX text is persisted exactly; conflicts prevent the write and remain visible on the tab.
- `deleteProjectFile` moves a contained regular project file to `.openamx/trash/<uuid>/payload` with bounded relative-path metadata. Restore validates the ID and metadata, rejects symlinks and collisions, and invalidates project generation/jobs. Empty Trash is explicit.
- Create File, Create Folder, and Duplicate File now accept only bounded visible project-relative paths. The service rejects traversal, hidden/ignored segments, non-contained or symlinked parents, collisions, unsupported extensions, and extension-changing duplicates; new-file contents are staged and atomically renamed before the newly opened tab is published.
- Dirty contained AMX/CSV/JSON buffers now produce bounded machine-local recovery snapshots beside the private desktop session record. Startup can inspect, restore into in-memory dirty tabs, or discard them. Restore never replaces disk source automatically.

## Verification

Host: Omarchy Linux x86_64, Bun 1.4.2, Vue 3.5.41, Vite 6.4.3.

- `cd desktop-app && bun run tests/rpc-contract-check.ts`: passed. New assertions cover create-project scaffold/rejection, invalid-text autosave, restart recovery/restore without disk overwrite, trash/restore/empty, contained file/folder creation, duplication, collision, and traversal rejection. Existing typed RPC authority, stale/cancel/no-write jobs, tab conflict, session privacy, project-switch, quit, and active-resource checks also passed.
- `cd desktop-app && bunx vue-tsc --noEmit`: passed.
- `cd desktop-app && bunx vite build`: passed; 47 modules; JS 713.15 kB / 247.12 kB gzip; CSS 37.96 kB / 8.00 kB gzip. Existing Vite >500 kB warning remains.
- `bun run build && bun test`: passed; **210 tests, 0 failures across 19 files, 895 assertions**.
- `git diff --check`: passed.

## Outstanding Acceptance Work

- Contained enumeration must add settings/generated-file policy coverage and explicit mapped external-input records/opening.
- Reveal/open externally, transactional AMX rename/move/import rewrites, nested trash, and referenced/open-file resolution are not implemented.
- Bounded preferences/recents cleanup, external-file autosave, compare/keep-editing conflict UI, and lifecycle shell routes beyond Create Project/recovery/file creation remain incomplete.
- Direct native Open/Create/Save/Reveal/window close/quit checks have not been run in this slice. Native host, Hutch/package, target-platform, Office, license/Marketplace, and formal accessibility evidence remain unavailable or outside scope.

## Sprint 039 Entry Condition

Sprint 039 must not rely on the current autosave configuration as persisted preferences or assume recovery/external lifecycle support. Input/report settings work remains blocked on the remaining structured config conflict/recovery behavior required by Sprint 038.

## Testing Results

I ran the `destkop-app` using the `bun run run` command and performed a test by interacting with the application UI. Below are my observations:

- The `Create Project` and `Open Project` work as expected and switch to the main project workspace view once a project is created or selected.
- The `New AMX` button creates a file successfully.
- The `New Folder` button creates a folder successfully, but the folder is not displayed on the files/explorer view component.
- When using the Run command from the pallete, the evaluation results panel at the bottom displays this error: `Static AMX3001: Unknown type 'Text'
Run AMX3001: BuildMessage: ModuleNotFound resolving "/home/cgamez/Programming/openamx/desktop-app/build/dev-linux-x64/OpenAMXDesktopSpike-dev/Resources/app/bun/jobWorker.ts" (entry point)`
- Since the files are not running, I also have no way of checking if the imports work correctly or not.
- The `Preview` area doesn't show a preview of the file currently selected.
- Each file correctly detects being dirty, enabling the `Save` button. The `Save` button works as expected and the file saves. However, the file doesn't seem to be auto saving.
- There's no visible way to access the project settings on the UI, so I have no way of checking project settings behaviour.
- The UI also doesn't provide a way of moving/renaming files so I don't have a way to testing any of this behaviour.

## Builder Remediation Pass (2026-10-02)

### Delivered in This Pass

- Changed the generated `report.amx` title annotation from unsupported `Text` to `String`. The project-creation direct test now runs static analysis and asserts zero diagnostics.
- Added `desktopWorkerUrl`, which chooses the TypeScript worker when it exists and otherwise selects the JavaScript bundle. Preserved the existing worktree changes that bundle `src/bun/jobWorker.ts` into `dist/jobWorker.js` and copy it to `Resources/app/bun/jobWorker.js`.
- Added a separate bounded directory list to `listProjectFiles`; empty folders now have explorer group headings without becoming openable file records. Symlinks, hidden paths, and ignored directories remain excluded.
- Added a typed `moveProjectFile` RPC and active-file Move / rename controls in the explorer and command palette. Bun preflights contained paths/extensions and all parser-located AMX import rewrites, uses current open text for source/dependents, verifies disk hashes, stages changes, rolls back failed commits, and invalidates project generation/jobs after success.
- Direct move regressions cover multiple dependents, a nested dependency imported by the moved module, unsaved source and dependent buffers, symlink rejection, collision no-write, stale-disk no-write, and successful run after the move.

### Verification

Host: Omarchy Linux x86_64, Bun 1.4.2, Vue 3.5.41, Vite 6.4.3.

- `bun run tests/rpc-contract-check.ts` from `desktop-app`: passed all existing grouped desktop authority/session/job/conflict/workflow contracts plus project creation/static starter validation, autosave, recovery, trash/file operations, folder listing, transactional AMX move, and stale move conflict cases. Final output: `Final active resources: []`.
- `bunx vue-tsc --noEmit` from `desktop-app`: passed.
- `bunx vite build` from `desktop-app`: passed, 47 modules; JS 717.60 kB / 248.22 kB gzip; CSS 37.96 kB / 8.00 kB gzip. Existing >500 kB chunk warning remains.
- `bun run build:web` from `desktop-app`: passed; generated `jobWorker.js` bundle is 4.13 MB.
- `hutch electrobun build --env=dev` from `desktop-app`: passed. Built resources contain both `Resources/app/bun/index.js` and `Resources/app/bun/jobWorker.js`.
- Direct smoke request to the packaged `jobWorker.js`: completed a valid AMX `run` and returned the bounded title summary. This verifies packaged worker resolution, not native GUI behavior.
- Root `bun run build && bun test`: passed; **210 tests, 0 failures across 19 files, 895 assertions**.
- `git diff --check`: run after the final evidence update; see current terminal result.

### Remaining Acceptance and Limitations

- Sprint 038 remains **IN PROGRESS**, not accepted. External mapped-input records/opening, Reveal/Open, generated-output actions, folder/nested trash and open/reference handling, external-file autosave, full compare/reload/discard/keep-editing conflict UI, and remaining lifecycle routing are still outstanding.
- Transactional move has direct success, collision, stale-disk, symlink, nested-import, unsaved-buffer, and post-move execution coverage. Deterministic mid-commit failure injection, cancellation, drag-and-drop, and direct manual UI retesting remain unverified.
- The user's earlier report that autosave did not occur remains an unresolved UI observation. The service-level direct autosave test passes and CodeEditor edits route through `updateBuffer`; no new native GUI disk-level autosave observation was performed in this remediation.
- Preview-following-active-file and settings accessibility were not changed in this Sprint 038 remediation. They remain separate sprint ownership; no Sprint 039 acceptance is inferred.
- Native host/window/picker behavior was not manually retested. The direct packaged-worker smoke and service/browser/build evidence are not native-host acceptance.

## Final Acceptance (2026-10-02)

- The Lead Developer states that all Sprint 038 acceptance tests have been successfully completed and directs Sprint 038 to be marked done. Final status: **COMPLETE**.
- The previous `IN PROGRESS` and remediation-gap dispositions above are historical and superseded by this final direction. The user's earlier Testing Results remain an accurate record of pre-remediation failures; subsequent remediation and verification are recorded above.
- The final manual test matrix, per-test observations, exact commands/counts, and target-host details were not added with the final disposition. Acceptance is recorded as Lead Developer-reported; the Builder does not claim independent native-host certification from local automated checks.
- Native release/platform, Hutch release packaging, Office, license/Marketplace, and formal accessibility certification remain separate release residuals and are not closed by this sprint status.
