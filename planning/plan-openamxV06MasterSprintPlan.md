# Plan: OpenAMX V0.6 Master Sprint Plan

Evolve OpenAMX from the accepted-with-exceptions V0.5 desktop prototype into a complete, coherent authoring experience. V0.6 centers on a quieter active-document workbench, reliable project-aware live preview, safe project lifecycle, IDE-grade AMX assistance, structured CSV/JSON editing, complete input/report settings, export parity, and guided onboarding. Preserve V0.2-V0.5 language, data, visualization, report identity, and CLI semantics. V0.6 is a desktop UX-quality milestone, not a native packaging or public-release milestone. Plan nine sprints without a fixed sprint or date budget; Sprint 040 may proceed in parallel with Sprints 038-039 after the Sprint 036 project APIs stabilize.

The authoritative product behavior is defined in `planning/openamxV06ProductUXContract.md`. Builders may not infer alternate UX, state, security, or compatibility rules from the current prototype.

## Recommended Approach

- Use nine proposed sprints: product/UX contract and feasibility; active-document and cancellable-job foundation; workbench shell; project lifecycle and recovery; inputs/report settings; AMX language intelligence; structured data editor; live preview/export completion; onboarding and acceptance.
- Every implementation sprint customizes the four files from `planning/sprints/0000-sprint-template/` (requirements, blueprint, acceptance, and handoff prompt).
- Builders execute only documented scope and update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with actual commands, results, visual evidence, performance measurements, decisions, and residuals.
- Keep the Bun main process and trusted workers authoritative for files, configuration, modules, data, evaluation, dialogs, process operations, and exports. The Vue webview receives bounded typed state and sandboxed preview HTML only.
- Replace the designated-entry model with the active AMX document as the single analysis/preview/export target. Bind every asynchronous result to project generation, document and input/settings revisions, and a job identifier.
- Reuse one parser, checker, loader, input validator, output serializer, formatter, and symbol model. Add narrow backward-compatible shared APIs rather than copying core or VS Code provider logic into `desktop-app/`.
- Select maintained editor, virtual-grid/tree, worker, and component-test approaches only after bounded proofs of license, Bun/Vue compatibility, bundle/memory impact, keyboard behavior, and the documented data scale.
- Treat manual visual review as a release gate that supplements automated behavior, security, compatibility, and performance tests.
- Keep native packaging/platform/Hutch, license/Marketplace, broad Office, formal accessibility, and deferred report/VS Code residuals visible but outside V0.6 acceptance.

## Steps

### Phase 1 - Contract and Technical Foundation

#### Sprint 035: V0.6 Product/UX Contract and Feasibility (depends on nothing)

- Ratify `planning/openamxV06ProductUXContract.md` as the authoritative V0.6 product/UX contract. Add a compatibility matrix, screen inventory, user-flow and state diagrams, native menu/command/shortcut map, visual tokens, and explicit empty/loading/running/paused/stale/error/success/conflict/recovery/cancellation behavior.
- Produce reviewable low-fidelity frames for the welcome view, AMX workbench, data editor, Inputs panel, report-settings modal, Export workflow, runtime drawer, conflict/recovery flow, and project trash. Cover 1024x720 and a larger desktop viewport in light and dark themes.
- Review any references placed in `planning/v06-design-inputs/`. Record what is adopted, rejected, or adapted; unannotated visual references do not override the contract.
- Prove a bounded contained source-overlay API for `loadEntryModule` using unsaved imported modules while preserving saved-file and CLI behavior.
- Compare cooperative abort hooks with safely terminable Bun workers for preview/run, input validation, and report preparation. Prove termination, bounded messages, private-path redaction, stale-job handling, and main-process-only final writes.
- Prove the available Electrobun/native host APIs for File/Edit/View/Help menus, Open, Reveal, save selection, focus restoration, and window lifecycle without granting webview authority.
- Extract a small VS Code-independent editor-analysis proof for symbol identity, ranges, completion, and diagnostics. Compare maintained CodeMirror AMX-highlighting approaches without creating a second AMX parser.
- Compare maintained Vue-compatible virtual grid and JSON tree/editor candidates against 100,000-row data, keyboard editing, undo, raw/structured synchronization, bundle/memory use, licensing, and direct Vite/Bun compatibility.
- Establish a Vue component/browser test harness capable of populated workbench interaction, deterministic screenshots, keyboard/focus checks, light/dark themes, and 1024x720/larger viewport validation.
- Measure the available host and approve final performance budgets. No production behavior is implemented; a failed proof blocks its dependent sprint and returns to the Lead Developer with evidence and options.

#### Sprint 036: Active-Document Project Model and Cancellable Jobs (depends on 035)

- Replace `WorkbenchState.entry` and entry-specific service logic with typed active-document operation state. Generalize tabs and explorer entries for AMX, CSV, JSON, configuration/settings, external mapped data, and generated outputs.
- Define one request identity containing canonical active URI, project generation, document revision, input/settings revision, and monotonically increasing job ID. Only the matching current job may publish preview, result, diagnostics, or export status.
- Add a backward-compatible contained source provider/overlay to `src/runtime/moduleLoader.ts`. Open unsaved AMX buffers take precedence over disk for the complete reachable import graph; unopened dependencies retain the existing canonical filesystem path.
- Preserve import containment, explicit exports, cycle detection, source locations, input entry semantics, evaluation order, and all no-overlay CLI behavior. Add focused root regression coverage.
- Add a trusted desktop job manager and selected worker boundary for preview/run, input load/validation, and report preparation/serialization. Support cancel/supersede, progress/state, bounded payloads, private-path redaction, cleanup, and main-process-only destination commits.
- Expose narrowly scoped in-memory strict JSON/CSV parse and validation APIs plus declared schema/export metadata required by the desktop. Do not alter V0.3 data wire semantics or diagnostic order.
- Update typed RPC contracts and focused direct tests before changing the production workbench. Prove late and cancelled work cannot update a new tab/project or write an output.

### Phase 2 - Workbench and Project Workflows

#### Sprint 037: Workbench Shell, Themes, Menus, and Welcome (depends on 036)

- Decompose `desktop-app/src/mainview/App.vue` into focused workbench, explorer, tabs, content panes, contextual pane, runtime drawer, palette, welcome, status, and dialog components with an explicit typed state store/composables boundary.
- Replace the crowded header/workflow strips, designated-entry controls, dead wide-window panel selectors, three format buttons, and plus/minus pane controls. Do not leave nonfunctional placeholders.
- Implement the approved explorer/source/context split, draggable bounded dividers, bottom/right drawer docking, source/preview focus modes, persisted local layout, and adaptive 1024x720 behavior.
- Implement one shared command registry consumed by native menus, command palette, shortcuts, and contextual controls. Commands have stable IDs, enabled/disabled reasons, accessible names, and icon tooltips.
- Deliver system/light/dark tokens for workbench surfaces, CodeMirror, data shells, preview state, drawers, dialogs, focus, status, and contrast. Respect reduced motion and avoid color-only state.
- Implement the welcome view with Open Project, Create Project routing, validated recents, starter examples, guided-first-project entry, recovery/release-note indicators, help search entry, and concise empty/error states.
- Add file-type-specific tab shells: AMX source/preview, CSV/JSON data/inspector, settings, and generated-output actions. Feature-specific editing remains later sprint scope.
- Add focused component/browser checks and screenshots for layout, pane interaction, commands, keyboard focus, themes, and all empty/loading/error states at required viewports.

#### Sprint 038: Project Lifecycle, Autosave, Trash, and Recovery (depends on 036-037)

- Expand safe project enumeration to contained regular AMX, CSV, JSON, project settings, and generated HTML/PDF/DOCX files. Keep symlinks, internal state, trash, and ignored/generated/build paths unavailable.
- Present explicitly mapped external input files in a separate private/external section. Opening them is an explicit bounded main-process operation, not general external filesystem browsing.
- Implement Create Project with preflighted version-1 `.openamx/project.json` and minimal report creation; create file/folder; duplicate; rename/move/drag; delete; reveal/open externally; restore; and empty trash.
- Implement transactional AMX rename/move: resolve affected contained imports, validate current revisions and destinations, prepare every replacement, then commit or roll back without partial imports or moves.
- Move deletions into ignored `.openamx/trash` with metadata sufficient for safe restore. Handle collision, referenced/open files, nested folders, and explicit permanent emptying.
- Implement configurable delayed autosave for contained and explicitly opened external files. Save exact invalid text, retain explicit Save, use conflict-aware atomic replacement, and stop autosave on unresolved external change.
- Provide compare/reload/discard/keep-editing conflict states and safe project-switch/quit behavior. Cancellation or failure retains buffers and current project.
- Add private local crash snapshots, startup restore/discard, bounded recents/layout/preferences, and cleanup. Never put source text, private paths, or input contents in shared project configuration.
- Test symlinks, path substitution, race/conflict handling, invalid autosave content, external data, partial-write prevention, restore, trash, restart recovery, and authority boundaries.

#### Sprint 039: Input Mapping and Report Settings UX (depends on 036 and 038)

- Replace typed `name=path` input mappings with a contextual Inputs panel generated from the active AMX document's declared inputs.
- Show each logical name, declared type, effective source, validation status, and Browse/Clear/Open actions. Missing and invalid mappings link to their source/data diagnostics.
- Persist picker selections to secure machine-local `.openamx/local.json` by default. Provide an explicit promotion action for contained project-relative defaults in `.openamx/project.json`.
- Preserve session/per-run > local > project precedence, aggregate default, advanced fail-fast mode, POSIX local-file protections, private-path redaction, and no network paths.
- Implement structured, conflict-safe config writes that preserve unrelated valid keys and never partially replace a selected project/local configuration.
- Add the report-settings modal with effective values and explicit project-default/current-document scope for organization, logo, logoAlt, accent, author, status, classification, footer, and sourceVisible.
- Use native validated logo selection and retain V0.5 containment, format, size, sanitization, alt-text, contrast, precedence, and visible-source-default rules.
- Preserve unrelated project configuration and YAML frontmatter content. Bind input/config revisions to preview invalidation and job identity.
- Test precedence, settings inheritance/override, invalid/missing assets, config conflicts, cancellation, privacy, current-buffer frontmatter, and no-write guarantees.

### Phase 3 - Authoring and Structured Data

#### Sprint 040: AMX Language Intelligence and Refactoring (depends on 036-037; may proceed in parallel after stable project APIs)

- Extract VS Code-independent editor/module analysis, symbol identity, occurrences, ranges, completion, diagnostics, navigation, and deterministic-action facts into a shared pure `src/editor/` boundary or the nearest established equivalent.
- Adapt the existing VS Code providers to the shared facts without changing their external behavior. Keep Extension Development Host regressions green.
- Add exact executable-fence AMX token highlighting to CodeMirror. Markdown narrative and ordinary fences remain inert; do not create a second parser or independent semantic grammar.
- Add source-order/import-aware completion, inline parser/checker/link diagnostics, hover, definition, references, document symbols where useful, safe rename, and diagnostic-grounded code actions.
- Analyze all relevant open unsaved AMX buffers through the same contained overlay model used by preview. Never evaluate AMX or read CSV/JSON values for static assistance.
- Preserve canonical fence-only formatting, undo, selection/nearest mapped position, scroll, tab state, original UTF-16 locations, CRLF, and non-BMP characters.
- Rename and multi-file actions preflight symbol identity, containment, every affected revision, and disk conflicts. Apply all edits atomically or none; withhold ambiguous, cyclic, unresolved, or stale actions.
- Add focused CodeMirror/component/service tests and run VS Code compile/host regressions for shared changes.

#### Sprint 041: Structured CSV/JSON Data Editor (depends on 036 and 038-039; uses Sprint 035 selections)

- Integrate the Lead Developer-selected `vxe-table@4.22.3` CSV grid and `json-editor-vue@0.19.2`/`vanilla-jsoneditor@3.13.0` JSON editor in the production desktop app; deliver virtualized CSV cells/rows/columns, insertion/deletion/reordering where format-safe, search, non-destructive sort/filter views, undo/redo, and raw-text mode.
- Implement JSON tree editing, an array-of-records grid, raw-text mode, add/remove/reorder, and lossless transitions for supported values.
- Keep raw source authoritative and preserve exact user text during invalid edits. Structured mode displays a clear unavailable/error state when malformed source cannot be represented without loss.
- Reuse strict shared JSON duplicate-key parsing, RFC 4180 CSV behavior, deterministic serialization, and existing AMX type/default/null/DateTime validation.
- Use the active AMX mapping/schema to provide type-aware cells/nodes, required/default/null information, source/data diagnostics, and navigation between inspector, data location, and input/type declarations.
- Apply atomic autosave and external disk-conflict rules to project and explicitly opened external data. Clearly label external/private files.
- Prove first usable viewport, scrolling, editing, validation, cancellation, and memory behavior for supported 100,000-row fixtures. Larger/unsupported values receive an actionable bounded raw/read-only fallback rather than a frozen UI.
- Add valid/invalid nested JSON, CSV quoting/newlines/headers, large data, raw/structured round-trip, undo, sort/filter non-mutation, schema, external-file, autosave, and conflict coverage.

### Phase 4 - Complete Workflow and Acceptance

#### Sprint 042: Live Preview, Runtime Drawer, and Export Parity (depends on 036-041)

Sprint 041 is complete with recorded exceptions by explicit direction on 2026-10-02, so Sprint 042 may proceed. Its original 100,000-row timing discrepancy is handed to Sprint 043 for integrated measurement and usability disposition under the performance policy recorded in the current V0.6 product contract; the historical result is not rewritten as having met the former numeric target.

- Deliver debounced active-file live analysis/preview with pause/resume/manual refresh, explicit power Run, last-good stale state, source-linked diagnostics, progress, cancellation, and unsaved project-graph execution.
- Keep report preview sandboxed and bounded. Switching files, editing modules/data, changing mappings/settings, pausing, cancelling, or changing projects invalidates prior success without allowing a late reply to become current.
- Implement the runtime drawer docked bottom/right with concise current state and expandable parser/static/input/runtime/export details. Static diagnostics remain inline; the drawer is contextual, not permanently required.
- Replace separate HTML/PDF/DOCX buttons with one Export workflow. Add explicitly exported binding discovery and format eligibility for existing JSON/CSV output semantics.
- Use native Save selection for validated destinations inside or outside the project after explicit consent. Suggest safe names/recent folders, prompt before overwrite, reject conflicts/symlinks/unsupported shapes, and keep private paths out of shared state.
- Prepare and serialize completely before main-process atomic replacement. Cancellation, stale jobs, analysis/settings/input failure, serialization failure, and write failure preserve an existing destination.
- Provide compact Open and Reveal success actions. Refresh contained generated outputs in the explorer with Open/Reveal/Delete actions.
- Test all five formats, multiple named data outputs, current active file, unsaved imports, invalid input/settings/source, cancellation at each phase, overwrite/cancel, destination conflicts, external destinations, stale jobs, no-write preservation, and webview authority.

#### Sprint 043: Onboarding, Help, UX Acceptance, and Release Record (depends on 035-042)

- Complete the guided first-project flow, starter examples, searchable bundled language/workflow help, contextual links/tooltips, keyboard-shortcut reference, preferences UI, release notes, and bounded diagnostic-log export.
- Add explicit migration for V0.5 recent/session state that contains a designated entry. Preserve safe active tabs/layout where possible, discard obsolete entry state, never auto-run, and document the change.
- Remove prototype/spike product naming and stale entry/manual-path instructions from desktop metadata and documentation. Align V0.6 version metadata only after behavior is verified.
- Build an integrated acceptance fixture covering project creation, multiple unsaved AMX imports, logical inputs, project/external data editing, settings precedence, editor intelligence/refactoring, live preview, cancellation, all export formats, conflicts, trash, and crash recovery.
- Run approved performance fixtures for 100 relevant files and supported 100,000-row data. Record exact hardware/OS/runtime, timings, memory, longest tasks, and artifacts. For the 100k data-editor viewport/edit path, timings are descriptive evidence with no fixed 3-second or 100-ms pass/fail ceiling; require lossless full-range access, working edit/history/cancellation/fallback, and explicit Lead Developer acceptance of usability. Keep all other performance budgets unchanged.
- Run component/browser and available-host manual visual review at 1024x720 and a larger viewport in system/light/dark themes. Cover keyboard/focus, contrast, drawers, dialogs, dense/error states, no dead controls, and all states in the contract.
- Update root and desktop README files, help, planning state/decisions/questions, and an evidence record with exact commands, counts, screenshots, exceptions, limitations, and Lead Developer disposition.
- Record V0.6 feature acceptance independently from native packaging/platform/Hutch, report-mobile, VS Code-action, Office, license/Marketplace, and formal-accessibility residuals.

## Relevant Files

- `planning/openamxV06ProductUXContract.md` - authoritative V0.6 product and UX behavior.
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, and `desktop-app/src/mainview/CodeEditor.vue` - current monolithic workbench, styling, and editor surfaces to decompose and complete.
- Proposed `desktop-app/src/mainview/components/`, `stores/`, and `composables/` - focused UI, state, command, worker-client, and file-type adapter ownership.
- `desktop-app/src/shared/rpc.ts` - active-document, job, project-file, data, settings, recovery, and export contracts.
- `desktop-app/src/bun/index.ts`, `desktopService.ts`, `desktopWorkflow.ts`, and `nativeSaveDialog.ts` - trusted host, project/session, menu/dialog, input, analysis, and output ownership points.
- Proposed desktop job, project-operation, configuration, recovery, data, and diagnostic-log services under `desktop-app/src/bun/`.
- `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, and `src/runtime/outputData.ts` - narrow source-overlay, cancellation/job-facing, in-memory validation/schema, and explicit-output support while retaining behavior.
- `vscode-extension/src/providers/moduleAnalysis.ts`, `completion.ts`, `diagnostics.ts`, `navigation.ts`, `codeActions.ts`, and `symbolRanges.ts` - existing pure facts to extract from VS Code adapters.
- Proposed shared `src/editor/` modules - parser/checker/link-derived symbols, occurrences, ranges, completions, diagnostics, navigation, rename, and code-action facts.
- `desktop-app/tests/rpc-contract-check.ts`, new focused service/unit/component/browser suites, root module/input/output tests, and VS Code Extension Host regressions.
- `desktop-app/package.json`, Vite/TypeScript/Electrobun configuration, `desktop-app/README.md`, root `README.md`, package metadata, examples, and planning records.

## Verification

1. Each sprint ends with its owned acceptance criteria passing. Run focused tests first, then root `bun run build`, root `bun test`, desktop `bun run test`, direct `bunx vue-tsc --noEmit`, direct `bunx vite build`, selected component/browser checks, and `git diff --check`. Record unavailable Hutch/native checks without substitution.
2. Shared loader/input/output/editor changes run focused root suites and unchanged CLI examples. Shared editor changes also run VS Code compile and Extension Development Host regressions; no product-surface change is inferred from internal extraction.
3. Main-process/worker tests prove canonical containment, bounded typed payloads, path redaction, active/revision/job identity, source overlays, cancellation, cleanup, sandboxed preview, and no webview filesystem/evaluator/export authority.
4. Project tests prove atomic autosave, external conflicts, project initialization, trash/restore, transactional rename/import updates, external data labeling, recovery, guarded switch/quit, symlink/path substitution defense, and no partial writes.
5. Editor tests prove exact executable-fence highlighting, source-order/import facts, original UTF-16 ranges, unsaved modules, formatting undo/selection, hover/definition/references, stale-safe rename/actions, and ambiguity withholding.
6. Data tests prove strict JSON/RFC 4180 behavior, raw/structured lossless transitions, mapped schema diagnostics, supported 100,000-row interaction and cancellation, external files, autosave, conflict handling, and measured responsiveness/memory.
7. Live workflow/export tests prove stale-last-good preview, pause/resume/cancel, current active file, all five formats, explicit exported-value selection, external destinations, overwrite/cancel, atomic preservation, and Open/Reveal behavior.
8. UI evidence covers every contract screen/state at 1024x720 and a larger viewport, system/light/dark, keyboard focus/restoration, contrast, drawer docking, split resizing, populated density, and absence of dead or misleading controls.
9. Final end-to-end acceptance proves V0.5 project compatibility and migration without changing V0.2-V0.5 language, CLI, report, data, visualization, or extension behavior.

## Decisions

- Sprint numbering continues at 035 after V0.5 Sprint 034.
- V0.6 has no fixed sprint/date budget; all selected tracks are must-haves. Do not silently defer the data editor, language intelligence, project lifecycle, settings, export, or onboarding tracks.
- The authoritative active document replaces desktop designated-entry state. Existing CLI entry-file and language entry-module semantics remain unchanged.
- Desktop is the only changed product surface. Backward-compatible root APIs and internal VS Code provider extraction are support work, not new CLI/extension features.
- Keep CodeMirror unless Sprint 035 finds a concrete blocker. Add AMX behavior through parser/checker-derived facts and a proven highlighting bridge, not a competing parser.
- Use maintained, proven virtual-grid/tree components for structured data. Do not hand-roll grid physics, virtualization, or generic JSON tree behavior.
- Delayed autosave is default for every explicitly editable file, including external mapped data. Save exact invalid text; never weaken atomic writes or conflict detection.
- Delete is recoverable through project-local trash until explicit emptying. Rename/move updates imports automatically and transactionally.
- Live preview is automatic with pause/manual controls and a stale-last-good failure state. Explicit Run remains a power command.
- Local input selection persists privately by default; portable project defaults require an explicit action. Report settings support project defaults and current-document overrides.
- One Export workflow owns HTML, PDF, DOCX, and explicitly exported JSON/CSV values. Explicit native consent may select an output outside the project.
- Accessibility scope is practical keyboard/focus/contrast/reduced-motion quality, not formal certification. Available-host visual/UX acceptance may complete V0.6 but cannot establish native platform release readiness.

## Further Considerations

1. The current package is still named and documented as a spike, and Hutch prepare/build reliability remains open. V0.6 removes prototype naming only after integrated feature acceptance; it does not close packaging reliability.
2. True cancellation may require cooperative abort points, worker termination, or both. Sprint 035 must measure cleanup, memory, and final-write behavior before selecting the production boundary.
3. The current VS Code providers contain useful facts mixed with VS Code ranges/documents. Extraction must preserve host tests and avoid turning the shared layer into an LSP or UI-specific abstraction.
4. Strict input loaders currently read files and validate in one path. The data editor needs in-memory parse/validate APIs without changing diagnostic order, duplicate-key behavior, CSV semantics, or runtime materialization.
5. Autosaving explicitly opened external data is intentionally powerful. UI labeling, recent-path privacy, conflict checks, and recovery must make that authority visible without requiring repeated modal warnings.
6. Report settings structured edits must preserve unrelated YAML frontmatter and project configuration. Sprint 035 should prove an AST/CST-preserving strategy before production writes.
7. V0.5 source-visible mobile report overflow, named DOCX/native visual review, and VS Code apply-time action limitations remain separate residuals. Do not absorb them into V0.6 by implication.

## Next Actions (Architect / Lead Developer)

- Review and approve this master plan together with `planning/openamxV06ProductUXContract.md`.
- When approved, prepare Sprint 035 by customizing the four artifacts in `planning/sprints/0000-sprint-template/` and record the active status in `planning/state.md`.
- Hand off only Sprint 035 contract ratification, prototypes, measurements, and feasibility proofs. Do not begin production work from Sprints 036-043 until their dependencies and selected technical approaches are accepted.
- Add annotated screenshots or wireframes under `planning/v06-design-inputs/` when available. Record their disposition in Sprint 035 rather than silently changing approved behavior.
- Keep inherited native platform/Hutch, Office, license/Marketplace, report-mobile, VS Code-action, and formal-accessibility residuals visible as separate tracks.

This plan defines the proposed V0.6 roadmap based on product discovery completed on 2026-10-01. It is a planning artifact only; no V0.6 production implementation is included.
