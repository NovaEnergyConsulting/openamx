# OpenAMX V0.6 Product and UX Contract

## Authority and Outcome

This contract defines the Lead Developer-ratified product and user-experience requirements for OpenAMX V0.6 (ratified 2026-10-01). The V0.2-V0.5 specifications retain authority over existing language, data, visualization, report identity, and export semantics.

V0.6 turns the accepted-with-exceptions V0.5 desktop prototype into a complete, coherent authoring experience. It is a desktop UX-quality milestone, not a native packaging or public-release certification milestone. By Lead Developer disposition on 2026-10-03, V0.6 is complete and approved for release with accepted exceptions; this does not claim native certification or publication. The release replaces manual path entry, designated-entry workflow, crowded controls, and disconnected actions with reliable project, authoring, data, preview, and export workflows.

## 1. Scope and Compatibility

- The primary audience is mixed: guide domain analysts without limiting analysts and developers comfortable with files, source, schemas, and diagnostics.
- V0.6 optimizes for mostly single-user, local projects. Collaboration, accounts, cloud storage, and shared editing are not introduced.
- The desktop application is the only changed product surface. Narrow backward-compatible shared-core APIs and internal provider refactoring are permitted only to avoid duplicated parser, checker, loader, validation, or symbol behavior.
- Existing CLI and VS Code extension behavior must remain compatible. Shared changes require their existing tests and commands to remain green.
- V0.6 introduces no AMX syntax or semantic changes. Existing V0.2-V0.5 documents, project configuration, inputs, views, report identity, and export formats remain valid.
- Workbench redesign, reliable live preview, input and report settings, export parity, AMX editor intelligence, full CSV/JSON editing, project lifecycle, and onboarding/help are all release requirements.

The following remain outside V0.6:

- Installers, signing, notarization, automatic updates, Hutch reliability, and native platform release certification.
- Project license selection, Marketplace publication, and broad Office compatibility certification.
- Cloud services, user accounts, telemetry, remote assets, and collaborative editing.
- New AMX language semantics, visualization kinds, or report-renderer redesign.
- Formal WCAG certification and full cross-platform screen-reader certification.
- V0.5 mobile source-visible report overflow and VS Code apply-time code-action remediation.

## 2. Information Architecture

### 2.1 Welcome Experience

When no project is open, the application presents a focused welcome view with:

- Create Project and Open Project commands.
- Validated recent projects.
- Runnable starter examples.
- A guided first-project workflow.
- Crash-recovery notices when snapshots exist.
- Release notes, searchable bundled help, and a keyboard-shortcut reference.

Create Project selects a folder, creates a valid version-1 `.openamx/project.json`, creates a minimal valid `.amx` report, opens the project, and selects the new report. Creation must fail without partial files when preflight or writing fails.

### 2.2 Main Workbench

The default workbench consists of:

- A searchable hierarchical project explorer on the left.
- A resizable active-file content area.
- A resizable contextual pane on the right.
- A runtime drawer dockable at the bottom or right.

An AMX tab shows the source editor and live report preview. A CSV or JSON tab shows the structured data editor and a schema, validation, and usage inspector. Project configuration is exposed through structured settings. Generated reports open through their system-default application.

Source-only and preview-only focus modes are reversible and preserve the active tab, selection, scroll, pane sizes, and focus restoration.

### 2.3 Visual Direction

- Use comfortable professional density: IDE structure, calmer document-authoring hierarchy, and analysis-tool clarity.
- Deliver polished system, light, and dark themes. System theme is the default; users may override it.
- Support a minimum workbench size of 1024x720 without clipped or unreachable primary workflows. When a full split cannot fit, secondary content becomes a drawer or tab rather than shrinking to zero.
- Use native File, Edit, View, and Help menus, a searchable command palette, and small contextual controls with Lucide icons and accessible names/tooltips.
- Do not retain the crowded global workflow strip, always-visible format buttons, wide-window selectors that do not change content, or plus/minus pane-resize buttons. Pane dividers are directly draggable and keyboard-adjustable.
- Visual references may be added under `planning/v06-design-inputs/`. Approved behavior and reviewed prototypes govern implementation; unannotated images do not override this contract.

## 3. Project and Document Model

### 3.1 Active Document

- Remove the designated-entry concept from desktop state and UI.
- The active AMX tab is always the analysis, preview, explicit Run, and export target.
- Switching AMX tabs switches the preview and operation context.
- Every valid AMX file may be analyzed and rendered independently, including a file normally imported as a library.
- Requests and responses identify the canonical active document, project generation, document revision, input/settings revision, and job identifier. Only a matching current response may update UI state.

### 3.2 Explorer and Tabs

The explorer includes contained regular:

- `.amx`, `.csv`, and `.json` files.
- Project configuration presented through the settings experience.
- Generated `.html`, `.pdf`, and `.docx` reports.

Ignore symlinks, hidden internal state, `.openamx/trash`, `node_modules`, and generated/build/artifact directories according to the approved project policy. Explicitly mapped external data appears in a clearly labeled External Inputs section and is never represented as a contained project file.

Tabs retain independent text, editor state, revision, disk hash, autosave state, conflict state, and file kind. Opening external data requires explicit user selection or an existing logical-input mapping and clearly labels the tab as external/private.

### 3.3 Project Operations

The explorer supports:

- Create file and folder.
- Duplicate.
- Rename and move, including drag and drop.
- Delete, restore, and empty trash.
- Reveal in the system file manager and open externally where applicable.

Renaming or moving an AMX file automatically rewrites affected relative AMX imports. The application must preflight every affected current revision and destination, preview the impact when useful, and commit the file move and source updates as one transaction or not at all. It must not leave partially rewritten imports.

Delete moves contained files and folders into an ignored `.openamx/trash` area. Trash remains until the user restores items or explicitly empties it. Name collisions, open tabs, imports, and external disk changes require a clear resolution before mutation.

## 4. Saving, Conflicts, and Recovery

- Delayed autosave is enabled by default and configurable in Preferences.
- Autosave applies to all editable contained files and explicitly opened external input files.
- Autosave writes the user's exact text even when AMX, JSON, or CSV is invalid. Validity controls analysis and preview, not persistence.
- Explicit Save remains available through the native menu, command palette, shortcut, and relevant contextual action.
- Every write uses disk-hash conflict detection, same-directory temporary preparation where applicable, flush/close, and atomic replacement. No action silently overwrites an externally changed file.
- Conflicts offer compare, reload, discard, or keep editing. An unresolved conflict blocks autosave and dependent transactional operations.
- Closing a project or the application waits for active writes and offers safe resolution for conflicts or failed saves. Cancellation leaves the project and buffers open.

Local recovery snapshots preserve unsaved and not-yet-committed buffers after a crash or forced restart. On the next launch, the user may inspect, restore, or discard them. Recovery never writes into project source automatically and never stores input contents or private paths in shared project configuration.

Recents, layout, preferences, recovery data, local input mappings, and private paths are machine-local and excluded from version control.

## 5. Live Analysis and Preview

- Live analysis and preview are debounced and enabled by default.
- Users may pause, resume, or manually refresh preview. Explicit Run remains a power command available through menus, palette, and shortcut rather than primary chrome.
- Analysis uses the complete open in-memory AMX module graph. Unsaved imported modules take precedence over saved disk content.
- The shared module loader receives a bounded contained source provider or overlay. Desktop must not duplicate the loader, create a parallel parser/checker, or materialize a temporary project mirror.
- Invalid edits retain the last successful preview with an unmistakable stale/error state. The UI links diagnostics to the source and never presents stale content as current success.
- Preview/run, input loading and validation, and report preparation run as trusted cancellable Bun jobs or workers. Cancellation and supersession stop work where supported; a cancelled or stale job cannot commit results or output.
- Final filesystem writes occur only in the trusted main process after current-job, destination, conflict, and overwrite checks.

Runtime, input, and export details appear in a contextual drawer dockable at the bottom or right. Static parser, checker, and linker diagnostics appear inline in the editor rather than in a permanently visible Problems panel.

## 6. AMX Authoring

The desktop retains CodeMirror and adds:

- Accurate AMX token highlighting only inside exact executable `amx` fences.
- Source-order and import-aware completion for keywords, types, functions, bindings, fields, inputs, and views.
- Inline parser, checker, and module-link diagnostics.
- Hover and go-to-definition.
- Exact symbol references.
- Safe rename across the contained reachable project graph.
- Deterministic diagnostic-grounded code actions.

Extract VS Code-independent module analysis, symbol identity, occurrence/range, completion, and action facts into a shared pure editor service. Desktop and VS Code adapters consume the same facts. Static assistance never evaluates AMX or loads CSV/JSON input values.

Formatting remains canonical and limited to executable AMX fence contents. It preserves undo, selection or the nearest safe mapped position, and scroll. Rename and code actions preflight all affected revisions and apply atomically or not at all. Ambiguous, cyclic, unresolved, or unlocated facts produce no fabricated target or edit.

## 7. Inputs and Settings

### 7.1 Logical Inputs

The active AMX document exposes declared logical inputs in a collapsible contextual Inputs panel. Each input shows:

- Logical name and declared type.
- Effective mapping source: session, local, project, or missing.
- Current validation state.
- Browse, Clear, and Open in Data Editor actions.

The primary UI never requires `name=path` text entry.

Picker selections persist to secure machine-local `.openamx/local.json` by default. A separate explicit action promotes a contained file to a portable project-relative default in `.openamx/project.json`. Existing precedence remains session/per-run, local, then project. Aggregate validation is the default; fail-fast is an advanced Inputs/Preferences/palette option.

Configuration writes preserve unrelated valid keys, enforce existing permissions and containment rules, and use conflict-safe atomic replacement. Diagnostics and UI payloads redact private paths.

### 7.2 Report Settings

Report Settings is a modal opened through menus, palette, or contextual actions. It:

- Shows effective report identity values.
- Supports explicit project-default and current-document-override scope.
- Covers all V0.5 fields: organization, logo, logo alternative text, accent, author, status, classification, footer, and source visibility.
- Uses a validated logo picker rather than typed asset paths.
- Shows inheritance, override, validation, and contrast fallback clearly.
- Preserves unrelated project configuration and frontmatter content.

The modal does not change V0.5 field semantics, logo security, precedence, or visible-source default.

## 8. Structured Data Editing

### 8.1 CSV

Provide a virtualized editable CSV grid with:

- Row and column editing, insertion, deletion, and reordering where format-safe.
- Search and non-destructive sort/filter views.
- Undo/redo and raw-text toggle.
- RFC 4180 parsing and deterministic serialization.
- Schema-aware type, required-field, null, DateTime, header, and row-width diagnostics.

### 8.2 JSON

Provide:

- An editable nested tree.
- A tabular editor for arrays of similarly shaped records.
- A raw-text mode.
- Add, remove, and reorder operations.
- Lossless transitions between supported structured and raw representations.
- Duplicate-key, syntax, pointer, shape, required-field, null, DateTime, and type diagnostics.

Data validation reuses the existing strict JSON, CSV, and AMX type rules and retains source/data locations. The inspector shows the mapped logical input, declared type, errors, and usage links back to AMX.

Support projects with up to 100 relevant files and structured data up to 100,000 rows on the documented acceptance host. For the 100,000-row CSV/JSON table workflow, measure and report viewport, scrolling, editing/history, cancellation, memory, and long-task behavior, but do not apply a fixed loading/edit latency ceiling. Acceptance is based on complete and lossless data access, usable scrolling and editing/history, cancellation and bounded fallback behavior, and explicit Lead Developer acceptance of the measured experience. Larger or unsupported irregular values receive an actionable bounded fallback rather than silently truncating editable data.

## 9. Export Workflow

One Export workflow supports:

- Standalone HTML.
- PDF.
- DOCX.
- JSON and CSV for explicitly exported entry-module `let` bindings allowed by the existing V0.3 output contract.

Named data export lists only proven explicitly exported bindings and valid format choices. It does not expose private, imported, untyped, or incompatible values.

Native Save dialogs may select any validated local destination after explicit user consent, including a destination outside the project. The application suggests a safe filename and recent format folder without exposing paths in shared state.

Existing destinations require overwrite confirmation. Analysis, input validation, report preparation, and serialization complete before atomic replacement. Cancellation, invalid state, stale jobs, and failures preserve existing outputs.

Success provides compact Open and Reveal actions without launching automatically. Contained generated outputs refresh in the explorer and offer Open, Reveal, and Delete actions.

## 10. Trust, Privacy, and Accessibility

- Bun main process and trusted workers retain all filesystem, module/input loading, evaluation, native dialog, process, and export authority.
- The webview receives bounded typed payloads, redacted diagnostics, and sandboxed preview HTML. It receives no unrestricted filesystem, process, evaluator, loader, or arbitrary-path capability.
- The product operates locally and offline. It performs no telemetry, analytics, crash upload, or remote asset fetch.
- Users may export bounded local diagnostic logs. Logs omit private paths, input contents, recovery text, and credentials.
- Core workflows must be keyboard operable with visible focus, focus restoration, contrast-safe light/dark themes, reduced-motion respect, accessible names/tooltips, and no color-only status.
- V0.6 records practical keyboard and contrast evidence but does not claim formal WCAG certification or complete cross-platform assistive-technology certification.

## 11. Performance and Evidence

Sprint 035 measures the available host and fixes final budgets. Initial targets are:

- Project listing and filtering for 100 relevant files within 1 second.
- For a supported 100,000-row data-editor view, record first-usable-viewport and edit timings; there is no fixed latency threshold. Evaluate the measured interaction qualitatively against the current accepted experience and require explicit Lead Developer acceptance. This supersedes the earlier 3-second first-viewport target for the data editor only.
- Default live-preview debounce no greater than 500 milliseconds.
- Cancellation acknowledgement within 250 milliseconds where cooperative cancellation is supported.
- No webview main-thread task longer than 100 milliseconds during background analysis, validation, or export work, excluding the measured grid initialization/edit path for supported 100,000-row CSV/JSON data. Record the data-editor longest tasks and judge their usability qualitatively; this exclusion does not apply to other background operations.

Acceptance evidence must cover:

- Welcome, empty, loading, running, paused, stale, error, success, conflict, recovery, and cancellation states.
- AMX, CSV, JSON, settings, and output-file workflows.
- System, light, and dark themes.
- 1024x720 and a larger desktop viewport.
- Keyboard navigation, focus visibility/restoration, and contrast.
- Projects with 100 relevant files and supported 100,000-row data fixtures.
- Current-buffer imports, input mappings, report settings, every export format, atomic failure behavior, crash recovery, and V0.5 project migration.

Available-host UX acceptance may complete V0.6. The Lead Developer's 2026-10-03 closeout accepts the remaining evidence gaps as V0.6 release exceptions; it does not represent them as passed or certify native macOS, Windows, or Ubuntu readiness, Hutch packaging reliability, broad Office compatibility, Marketplace publication, or formal accessibility. Further work is tracked in `planning/requirements-openamxV07.md`.
