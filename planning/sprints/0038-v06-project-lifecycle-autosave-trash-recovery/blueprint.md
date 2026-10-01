# Sprint 038 Blueprint: Project Lifecycle, Autosave, Trash, and Recovery

## Approach

1. Map the lifecycle authority. Read Sprint 036/037 contracts and identify the Bun service boundaries for project enumeration, path validation, native selection, writes, session state, active-document generation, and shell commands. Define typed lifecycle operations before expanding UI handlers.
2. Harden project discovery. Implement one contained enumeration policy for regular permitted files, generated outputs, settings and explicitly mapped external inputs. Add symlink, path substitution, ignored-directory, collision, and private-path tests. Return stable bounded explorer records rather than raw directory authority.
3. Implement project creation and file operations. Preflight a version-1 project plus minimal report, then prepare and commit creation atomically. Add create/duplicate/rename/move/delete/restore/empty/reveal/open operations with explicit error/conflict states and no partial mutations.
4. Implement transactional import rewrites. Build the affected-module graph from canonical contained imports, validate all current revisions and destinations, prepare moved files and import replacements, then commit as one transaction or roll back. Refuse ambiguous or unlocated rewrites instead of guessing.
5. Add trash and external labeling. Move deletions into ignored project-local trash with restore metadata and collision handling. Keep explicitly opened/mapped external files in a private external section and prevent general path browsing through the webview.
6. Add autosave and conflict resolution. Schedule bounded delayed saves, preserve exact invalid text, compare disk revisions before write, atomically replace, and pause autosave on conflict. Wire compare/reload/discard/keep-editing decisions to the shell while retaining buffers after cancellation or failure.
7. Add recovery and guarded transitions. Persist private local snapshots, restore/discard on startup, bound and validate recents/preferences/layout, and guard project switch/window close/quit with Save All/Discard All/Cancel plus retry after failure. Invalidate Sprint 036 jobs when generation changes.
8. Exercise native and browser paths honestly. Use the existing shell/command routes for deterministic component checks and direct native APIs when an SDK-enabled host exists. Record unavailable native behavior, do not replace it with path fields or mocks in acceptance claims.
9. Verify and hand off. Run focused filesystem/project/RPC tests, root compatibility suites, desktop typecheck/Vite/direct tests, recovery/restart fixtures, conflict/no-write checks, and `git diff --check`. Record evidence, residual native/accessibility gaps, and Sprint 039 entry conditions.

## Files to Update

- `desktop-app/src/bun/desktopService.ts`, `desktopWorkflow.ts`, project/file/trash/recovery/config services, native dialog/open/reveal services, and typed RPC contracts
- `desktop-app/src/mainview/` lifecycle dialogs, explorer/context actions, welcome/project-switch/quit flows, and focused components/composables
- Focused desktop, root module/input/output, persistence, recovery, and authority tests
- `desktop-app/README.md` only for verified lifecycle/recovery behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 038 builder-evidence record

## Notes

The difficult contract is not the happy-path file menu; it is preserving user text and project integrity under stale disks, invalid content, rename graphs, cancellation, collisions, and process restart. Make every mutation preflightable and every failure observable. Native host acceptance is a separate evidence concern and must not be silently satisfied by service tests.
