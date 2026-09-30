# Sprint 024 Requirements: Desktop Application Foundation

## Goal

Turn the isolated Electrobun + Vue + shadcn-vue architecture spike into a usable desktop authoring foundation: open and save `.amx` projects, track dirty state, navigate local modules, edit AMX with core authoring services, and preview the current document as live HTML through a typed main-process boundary.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 024 scope
- `docs/language-spec-v0.4.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.2.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md` and its recorded adapter boundary
- Existing `desktop-app/` prototype, especially `src/bun/`, `src/mainview/`, `src/shared/rpc.ts`, and `README.md`
- Core parser, formatter, module analysis, renderer, and direct VS Code provider APIs

## In Scope

- Evolve the isolated `desktop-app/` package without changing root or `vscode-extension/` ownership. Keep Electrobun 2.0.1, Bun main process, Vue, shadcn-vue, and source-owned application aliases unless an approved blocker requires a recorded decision.
- Add typed main-process RPC operations for opening a file/project, reading and saving a document, listing safe local project files/modules, formatting, static diagnostics, and generating a live HTML preview from the current editor buffer.
- Support `.amx` file/folder opening, project-root selection, local module navigation, explicit save/save-as, dirty state, reload/conflict awareness, and clear success/error states. Never silently overwrite a changed file or run stale saved text.
- Build the first usable split editor/live HTML preview surface. The editor must preserve current unsaved text; preview requests analyze that exact buffer through shared core APIs and return HTML/structured diagnostics/status rather than evaluating in the webview.
- Reuse core parser/formatter/static-checker/module-analysis/rendering APIs. Provide AMX-aware syntax highlighting, canonical formatting, scoped V0.2/V0.3/V0.4 completion where the existing provider logic supports it, and source-located parser/static/link diagnostics.
- Keep all filesystem, path canonicalization/containment, module/input resolution, evaluation, HTML preparation, and future PDF adapter access in the Bun main process. The webview receives only typed bounded payloads and has no direct filesystem, process, Bun/Node, evaluator, or arbitrary RPC capability.
- Add focused desktop host/UI/RPC tests for open/save/dirty state, safe project navigation, current-buffer preview, formatting, completion/diagnostics payloads, errors, and stale-buffer prevention. Document isolated development/typecheck/build/test/run commands and prerequisites.
- Record exact versions, available platform checks, Hutch residuals, and the Sprint 025 workflow boundary in planning logs.

## Out of Scope

- Full run/input mapping workflow, portable `.openamx` defaults/local overrides, per-run data configuration, result state, HTML/PDF export actions, and end-to-end current-buffer analysis with CSV/JSON inputs (Sprint 025).
- New language syntax, runtime/typechecker rules, HTML visual semantics, PDF adapter changes, DOCX, installer/updater, Marketplace publication, or replacing the VS Code extension with an LSP.
- Arbitrary workspace access, remote modules/assets, shell execution, secrets, network paths, implicit directory creation, or unrestricted file APIs in the webview.
- Claiming native macOS 14+, Windows 11+, or Ubuntu 24.04+ release acceptance from the existing WSL2/Linux evidence.

## Constraints

- The current editor buffer is authoritative for format, diagnostics, and preview. A file-backed entry URI is required for local imports/project navigation; untitled buffers may be edited and diagnosed but must receive an actionable project/file-location limitation for operations requiring containment.
- Enforce the V0.3 symlink-aware entry-root containment rule for module navigation and file operations. Exclude `.openamx/local.json`, ignored files, generated outputs, and files outside the selected canonical project root by default.
- Save only to explicitly selected project paths. Detect dirty/conflict state and require an explicit user action before replacing changed disk content.
- Use typed request/response schemas with bounded text, path, diagnostic, and HTML payloads. Validate inputs and destinations in the main process before invoking core APIs.
- Preserve root and extension scripts independently. Hutch prepare/build/dev/persistent-window residuals from Sprint 020 remain recorded and must not be presented as passed by Sprint 024.
