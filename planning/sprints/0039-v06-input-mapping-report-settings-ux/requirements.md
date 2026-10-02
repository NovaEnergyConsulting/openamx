# Sprint 039 Requirements: Input Mapping and Report Settings UX

## Goal

Replace desktop `name=path` input entry with a contextual, active-document-aware Inputs experience and deliver safe report-settings editing with explicit project-default/current-document scope. Preserve V0.5 precedence, validation, report identity, logo security, source visibility, privacy, and atomic-write semantics while binding every configuration change to Sprint 036 revisions and job identity.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 039
- `planning/openamxV06ProductUXContract.md`
- Sprint 035-038 requirements, evidence, decisions, questions, and state; final Sprint 038 acceptance evidence is required before implementation acceptance
- `desktop-app/src/mainview/` shell/contextual-pane components and Sprint 036 active-document/job RPC contracts
- Trusted Bun input/config/report services, native picker/save services, `src/runtime/inputData.ts`, report preparation/config/frontmatter handling, and existing V0.5 tests
- V0.5 report identity, logo, visible-source, input precedence, and privacy contracts

## In Scope

- Replace typed `name=path` mappings with a contextual Inputs panel generated from the active AMX document's declared logical inputs.
- Show logical name, declared type, effective source (session/per-run, local, project, or missing), validation state, and Browse/Clear/Open in Data Editor actions.
- Link missing/invalid mappings to source/data diagnostics using bounded locations and redacted paths.
- Persist picker selections to secure machine-local `.openamx/local.json` by default. Provide an explicit promotion action for contained project-relative defaults in `.openamx/project.json`.
- Preserve session/per-run > local > project precedence, aggregate validation by default, advanced fail-fast behavior, POSIX local-file protections, private-path redaction, and no network paths.
- Implement structured, conflict-safe config writes that preserve unrelated valid keys and never partially replace selected project/local configuration. Use trusted main-process validation, revision/hash checks, and atomic replacement.
- Add Report Settings modal with effective values and explicit project-default/current-document scope for organization, logo, logoAlt, accent, author, status, classification, footer, and sourceVisible.
- Use native validated logo selection and retain V0.5 containment, format/size/sanitization, alt-text, contrast, precedence, and visible-source-default behavior.
- Preserve unrelated project configuration and YAML frontmatter content, including exact current-buffer/frontmatter behavior. Bind input/config revisions to preview invalidation and Sprint 036 job identity.
- Add focused component/RPC/service tests for precedence, inheritance/override, invalid/missing assets, conflicts, cancellation, privacy, current-buffer settings, and no-write guarantees.
- Record available native picker evidence separately from browser/service evidence; unavailable host behavior remains blocked.

## Out of Scope

- Project enumeration, creation, rename/move, autosave, trash, recovery, and lifecycle conflict flows; Sprint 038 owns them and must be accepted first.
- AMX language intelligence/refactoring; Sprint 040 owns it.
- Structured CSV/JSON editor implementation or grid/tree candidate selection; Sprint 041 owns it.
- Complete debounced live preview, runtime drawer details, final Export workflow, and all export parity; Sprint 042 owns them.
- Full onboarding/help, preferences completion, migration, release notes, and integrated acceptance; Sprint 043 owns them.
- Changes to AMX syntax, CLI input mapping semantics, V0.5 report identity semantics, VS Code behavior, native release certification, broad Office, licensing/Marketplace, telemetry, or network inputs.

## Constraints

- Use Sprint 036 active-document URI/generation/document/input-settings revision/job identity. A mapping or settings write must invalidate dependent work and reject stale responses.
- All path selection, containment, symlink/network/POSIX protection, config merge, conflict detection, logo validation, and writes remain in trusted Bun services. The webview receives bounded typed state and redacted diagnostics only.
- Local machine configuration may contain private paths but never enters shared project state, logs, screenshots, diagnostics, or RPC payloads beyond approved redacted metadata.
- Project promotion is explicit and only permits contained project-relative sources. Preserve unrelated valid keys and fail without partial replacement when configuration is invalid, stale, or externally changed.
- Report settings must preserve unrelated JSON/project configuration and YAML frontmatter text/content. Do not rewrite frontmatter or project keys through lossy string/object replacement when the contract requires preservation.
- Invalid or missing mappings/assets block dependent analysis/preview with actionable diagnostics; they must not silently fall back, erase buffers, overwrite existing outputs, or mutate unrelated settings.
- Do not claim native picker/menu/dialog behavior from mocks, browser shims, source inspection, or unavailable host evidence.
