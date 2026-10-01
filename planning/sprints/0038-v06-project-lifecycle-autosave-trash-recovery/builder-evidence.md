# Sprint 038 Builder Evidence

## Disposition

**IN PROGRESS.** This record covers the first verified lifecycle slice only: picker-backed project creation, delayed conflict-aware autosave, and project-local trash/restore/empty operations. It does not claim the complete Sprint 038 acceptance criteria.

## Delivered Boundary

- `createProject` accepts only an existing empty real directory, stages version-1 `.openamx/project.json` and a minimal `report.amx`, rolls back created artifacts on failure, then transitions through the existing guarded project generation boundary.
- `pickCreateProject` performs folder selection only in the trusted Bun picker route; Vue receives the bounded project/document state and cannot submit arbitrary filesystem paths.
- Autosave defaults to enabled with a configurable 100-10,000 ms delay. It routes every write through the existing disk-hash, same-directory temporary-file, flush, and atomic-replace path. Invalid AMX text is persisted exactly; conflicts prevent the write and remain visible on the tab.
- `deleteProjectFile` moves a contained regular project file to `.openamx/trash/<uuid>/payload` with bounded relative-path metadata. Restore validates the ID and metadata, rejects symlinks and collisions, and invalidates project generation/jobs. Empty Trash is explicit.

## Verification

Host: Omarchy Linux x86_64, Bun 1.4.2, Vue 3.5.41, Vite 6.4.3.

- `cd desktop-app && bun run tests/rpc-contract-check.ts`: passed. New assertions cover create-project scaffold/rejection, invalid-text autosave, and trash/restore/empty. Existing typed RPC authority, stale/cancel/no-write jobs, tab conflict, session privacy, project-switch, quit, and active-resource checks also passed.
- `cd desktop-app && bunx vue-tsc --noEmit`: passed.
- `cd desktop-app && bunx vite build`: passed; 47 modules; JS 713.15 kB / 247.12 kB gzip; CSS 37.96 kB / 8.00 kB gzip. Existing Vite >500 kB warning remains.
- `bun run build && bun test`: passed; **210 tests, 0 failures across 19 files, 895 assertions**.
- `git diff --check`: passed.

## Outstanding Acceptance Work

- Contained enumeration must add settings/generated-file policy coverage and explicit mapped external-input records/opening.
- File/folder creation, duplicate, reveal/open externally, transactional AMX rename/move/import rewrites, nested trash, and referenced/open-file resolution are not implemented.
- Recovery snapshots/startup restore-discard, bounded preferences/recents cleanup, external-file autosave, compare/keep-editing conflict UI, and lifecycle shell routes beyond Create Project remain incomplete.
- Direct native Open/Create/Save/Reveal/window close/quit checks have not been run in this slice. Native host, Hutch/package, target-platform, Office, license/Marketplace, and formal accessibility evidence remain unavailable or outside scope.

## Sprint 039 Entry Condition

Sprint 039 must not rely on the current autosave configuration as persisted preferences or assume recovery/external lifecycle support. Input/report settings work remains blocked on the remaining structured config conflict/recovery behavior required by Sprint 038.
