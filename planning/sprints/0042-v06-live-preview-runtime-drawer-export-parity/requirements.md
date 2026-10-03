# Sprint 042 Requirements: Live Preview, Runtime Drawer, and Export Parity

## Goal

Complete the active-document live analysis/preview and trusted export workflow across HTML, PDF, DOCX, JSON, and CSV. Provide honest stale/error/progress/cancellation state, run unsaved contained module graphs, expose contextual runtime details, and preserve every existing output on invalid, cancelled, stale, conflicting, or failed work.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 042
- `planning/openamxV06ProductUXContract.md`
- Sprint 035-041 accepted requirements, evidence, decisions, questions, and state
- Sprint 036 active-document/job identity, worker protocol, source overlay, data inspection, cancellation and main-process commit boundaries
- Sprint 037 workbench shell, content panes, runtime drawer layout, command registry, and themes
- Sprint 038 project generation, native destination/picker, generated-file, autosave/conflict, open/reveal, and project lifecycle services
- Sprint 039 input/settings snapshots, revision invalidation, report settings, and logo validation boundary
- Sprint 040 editor diagnostics/completion/highlighting and unsaved-module analysis facts
- Sprint 041 data editor, private external-input route, schema/validation, autosave/conflict behavior, and performance exception
- Existing report preparation, HTML/PDF/DOCX adapters, JSON/CSV output serializers, CLI compatibility tests, and typed RPC contracts

## In Scope

- Deliver debounced active-file live analysis and preview, pause/resume/manual refresh, explicit power Run, last-good stale state, source-linked diagnostics, progress, and cancellation.
- Execute the active AMX document and complete reachable unsaved contained module graph through Sprint 036's accepted overlay and current request identity. Switching tabs changes the operation target; designated-entry state does not return.
- Keep preview sandboxed and bounded. Switching files, editing active/imported modules or data, changing mappings/settings, pausing, cancelling, superseding, or changing project invalidates prior success. Late responses cannot become current.
- Implement the runtime drawer docked bottom/right with concise current operation state and expandable parser/static/input/runtime/export details. Keep static diagnostics inline and make the drawer contextual rather than permanently required.
- Replace separate HTML/PDF/DOCX controls with one Export workflow. Include explicit exported-binding discovery and only formats proven eligible by Sprint 036/041 schemas and existing V0.3 output rules.
- Support HTML, PDF, DOCX, JSON, and CSV. Target the active AMX document and its current unsaved graph, settings, and inputs; never silently export a designated or different tab.
- Use trusted native Save selection for validated destinations inside or outside the project after explicit user consent. Suggest safe filenames/recent format folders without putting private paths in shared state; confirm overwrite and reject conflicts, symlinks, unsupported suffixes/shapes, and invalid destinations.
- Complete analysis, input validation, report preparation, serialization, and destination preflight before main-process atomic replacement. Cancellation, stale jobs, validation/serialization/write failures, or overwrite cancellation preserve existing destination bytes.
- Provide compact Open and Reveal success actions. Refresh contained generated outputs in the explorer with Open, Reveal, and Delete actions without auto-launching.
- Integrate Sprint 041 structured/external data revision, schema, and validation state with preview invalidation and the job identity. Preserve explicitly opened private external data boundaries.
- Measure actual preview debounce, end-to-end cancellation/cleanup, serialization, memory, and webview main-thread tasks. Record that Sprint 041's 100,000-row responsiveness exception remains owned by Sprint 043 rather than treating it as solved here.
- Test all five formats, multiple explicitly exported named values, current active file, unsaved imports, invalid input/settings/source, stale revisions, cancellation at each phase, overwrite/cancel, destination conflicts, outside-project destinations, no-write preservation, Open/Reveal, and webview authority.

## Out of Scope

- New AMX syntax/type/runtime rules, changed CLI input/output semantics, report identity rules, or format semantics.
- Project lifecycle, autosave, trash, restore, recovery, or settings/mapping UI changes; consume Sprints 038-039.
- AMX editor intelligence/refactoring or structured-data editor implementation; consume Sprints 040-041.
- Onboarding/help completion, V0.5 state migration, integrated acceptance/release record, final product naming/version alignment; Sprint 043 owns them.
- Native platform release certification, Hutch reliability, broad Office certification, project license/Marketplace publication, or formal accessibility certification.
- Claiming Sprint 041's >100 ms grid/edit long tasks are resolved unless this sprint explicitly measures and fixes the relevant data-editor behavior within approved scope; Sprint 043 retains the recorded disposition gate.

## Constraints

- Use the Sprint 036 operation identity `{ canonicalActiveUri, projectGeneration, documentRevision, inputSettingsRevision, jobId }`. Only the matching current identity may publish preview, progress, diagnostics, or export status.
- Trusted Bun services/workers own filesystem reads, module/input loading, evaluation, report preparation, destination validation, overwrite/conflict checks, process/native dialogs, and final writes. The webview receives bounded typed state, redacted diagnostics, and sandboxed preview HTML only.
- The main process alone commits output. Prepare and serialize fully before atomic replacement; no worker or webview can write destinations.
- Keep cancellation truthful and phase-specific. Worker termination is experimental; cancellation cannot interrupt an atomic rename already underway. Report acknowledgement, cleanup completion, and write phase separately where needed.
- Preserve V0.2-V0.5 language, input, visualization, report identity, source visibility, export, CLI, and VS Code behavior. JSON/CSV export remains limited to explicitly exported compatible entry-module values.
- Preserve destination bytes on all failures and cancellation. Never expose private source/data/output paths, input contents, or settings secrets through shared project state, logs, diagnostics, or generic RPC.
- Native Save/Open/Reveal behavior must be supported by direct host evidence. Unit, mocked, browser, source-inspection, or WSL2 evidence cannot be reported as native platform acceptance.
- Record Sprint 041's measurable data-editor performance exception honestly; do not adjust the contract's 100 ms target by implication or substitute parser speed for interactive responsiveness.
