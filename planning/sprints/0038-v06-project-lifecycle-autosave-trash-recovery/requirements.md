# Sprint 038 Requirements: Project Lifecycle, Autosave, Trash, and Recovery

## Goal

Deliver safe V0.6 project lifecycle, persistence, conflict, trash, and crash-recovery workflows on top of the Sprint 036 operation foundation and Sprint 037 shell. Keep filesystem authority in the trusted Bun process, preserve user buffers on failure or cancellation, and make project changes transactional and recoverable.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 038
- `planning/openamxV06ProductUXContract.md`
- Sprint 035-037 accepted requirements, evidence, decisions, questions, and state
- `desktop-app/src/bun/desktopService.ts`, `desktopWorkflow.ts`, `index.ts`, native save/dialog services, project/session logic, RPC contracts and direct tests
- Sprint 037 shell components, command registry, active-document/job identity and layout persistence
- Existing module loader containment/import behavior, atomic writers, report/output services, examples, and V0.5 compatibility tests

## In Scope

- Expand safe project enumeration to contained regular AMX, CSV, JSON, project settings, and generated HTML/PDF/DOCX files. Exclude symlinks, internal state, trash, ignored/generated/build paths, and unsupported shapes.
- Present explicitly mapped external input files in a clearly labeled private/external section. Opening them is an explicit bounded main-process operation, not general external filesystem browsing.
- Implement Create Project with preflighted version-1 `.openamx/project.json`, a minimal valid `.amx` report, folder/file creation, and no partial state on failure.
- Implement create file/folder, duplicate, rename/move/drag, delete, reveal/open externally, restore, and empty-trash commands through typed trusted services and shell routes.
- Implement transactional AMX rename/move: resolve affected contained imports, validate current revisions/destinations, prepare replacements, and commit or roll back all file/source changes together.
- Move deletions into ignored `.openamx/trash` with restore metadata. Handle collisions, open/referenced files, nested folders, external changes, and explicit permanent emptying safely.
- Implement configurable delayed autosave for contained and explicitly opened external files. Save exact invalid text, retain explicit Save, use conflict-aware atomic replacement, and stop autosave on unresolved conflict.
- Provide compare/reload/discard/keep-editing conflict states and guarded project-switch/quit behavior. Cancellation or failure retains buffers and current project.
- Add private local crash snapshots, startup restore/discard, bounded recents/layout/preferences, and cleanup. Never store source text, private paths, input contents, or recovery data in shared project configuration.
- Add focused tests for symlinks/path substitution, race/conflict handling, invalid autosave, external data, partial-write prevention, restore/trash/restart recovery, project switching, quit, and webview authority.
- Obtain direct native host evidence for available project/open/save/reveal/window lifecycle workflows where possible; record unavailable native checks without substituting browser or mocked evidence.

## Out of Scope

- Inputs mapping/report-settings UX beyond lifecycle routes; Sprint 039 owns those features.
- AMX language intelligence/refactoring; Sprint 040 owns it.
- Structured CSV/JSON editing or grid/tree candidate selection; Sprint 041 owns it.
- Debounced live preview, runtime drawer detail, complete export workflow, and final cancellation/export parity; Sprint 042 owns it.
- Full onboarding/help, migration, release notes, and integrated V0.6 acceptance; Sprint 043 owns them.
- Cloud sync, collaboration, telemetry, remote assets, arbitrary external filesystem browsing, native packaging/release certification, broad Office, licensing/Marketplace, or formal accessibility certification.

## Constraints

- Preserve Sprint 036 active-document/project-generation/revision/job identity and Sprint 037 typed shell/command authority. Project transitions must invalidate or safely resolve affected jobs.
- Trusted Bun services own canonical path checks, symlink/path-substitution defense, file writes, trash metadata, recovery storage, native dialogs, and external-open/reveal operations. The webview receives bounded typed state only.
- Project scope includes only contained regular files permitted by the contract. External mappings remain explicit, private, labeled, and never silently copied into project configuration.
- Autosave writes exact text even when invalid. Every write uses revision/hash conflict detection, same-directory preparation, flush/close, atomic replacement, and no silent overwrite.
- Rename/move must update all affected relative imports atomically or leave both files and imports unchanged. Ambiguous, stale, cyclic, outside-root, symlink, and collision cases require a bounded refusal or explicit resolution.
- Recovery snapshots are local-only and must never automatically overwrite project source. Cancellation/failure must retain buffers, current project, and recoverable metadata.
- Native host evidence must be labeled by actual host/tool/version. Browser, mock, source inspection, and WSL2 evidence cannot be represented as native release acceptance.
