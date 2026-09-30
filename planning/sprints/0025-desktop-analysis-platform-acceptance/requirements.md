# Sprint 025 Requirements: Desktop Analysis Workflow and Platform Acceptance

## Goal

Complete the desktop analysis workflow on top of Sprint 024's typed main-process boundary: run and preview the current unsaved buffer with validated CSV/JSON inputs, apply portable/local/per-run configuration precedence, show actionable states and diagnostics, support HTML/PDF output actions, and perform the required owner platform acceptance checks.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 025 scope
- `docs/language-spec-v0.4.md`, especially sections 6-8 and 11
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md` and `src/renderer/reportPdf.ts`
- Sprint 024 desktop foundation and its RPC/session tests
- Existing `src/runtime/moduleLoader.ts`, input/output support, renderer, CLI, and desktop package documentation

## In Scope

- Add typed main-process operations for current-buffer analysis/run, validated input mapping resolution, result/status retrieval, HTML preview/save, and PDF export through the shared adapter. Keep the webview as a presentation/client surface with bounded payloads.
- Always run the exact current unsaved entry buffer with its file-backed URI/project root. Reuse the shared parser, module loader, checker, input validation, evaluator, renderer, and PDF adapter; never silently fall back to stale saved text or duplicate semantics in desktop code.
- Implement `.openamx/project.json` portable defaults, ignored `.openamx/local.json` machine-local overrides, and per-run input overrides with the contract precedence: per-run, then local, then project default. Validate names, paths, containment/privacy rules, missing/invalid configs, and safe writes in the main process.
- Support success, running, and failure states for analysis/run/preview/export. Display parser, static, module, input-validation, runtime, rendering, PDF, and filesystem diagnostics with source/data context where supplied by core. Preserve invalid-run no-write and existing-destination guarantees.
- Provide HTML preview and explicit HTML save plus PDF export actions. Resolve desktop paths from the open project root, call the shared typed PDF adapter, validate destination conflicts/symlinks, and surface export status without granting PDF/filesystem authority to the webview.
- Support local module/project navigation and declared CSV/JSON input mapping in the workflow, including edits, local imports, data overrides, invalid data, and output destination selection. Keep machine-private paths out of portable configuration and bounded diagnostics.
- Run and record the official release-owner build/launch checks on macOS 14+, Windows 11+, and Ubuntu 24.04+, with exact OS/runtime/tool versions and outcomes. Record unavailable target checks as unverified; do not infer them from WSL2/Linux or direct bundle evidence.
- Add focused desktop end-to-end tests covering edits, unsaved execution, local imports, defaults/overrides, diagnostics, HTML/PDF actions, failure/no-write behavior, typed RPC validation, and main-process-only capabilities. Update desktop docs and planning logs with exact commands and residuals.

## Out of Scope

- Installer/updater program, Marketplace publication, project license selection, broad multi-project collaboration, remote modules/assets, network inputs, secrets management beyond local path privacy, and arbitrary shell/filesystem APIs.
- Changes to V0.2/V0.3/V0.4 language semantics, HTML visual interaction, PDF engine/layout contract, VS Code provider architecture, or DOCX production (optional Sprint 026).
- Supporting Linux distributions beyond Ubuntu 24.04+, platform claims without owner evidence, or replacing Electrobun because of a previously recorded residual without Lead Developer approval.

## Constraints

- Main-process authority is mandatory: webview requests are typed and bounded; the webview cannot read files, resolve modules, load data, evaluate AMX, call the PDF adapter directly, or write destinations.
- Input mapping precedence and path bases must match the V0.4 contract. CLI path semantics remain process-working-directory based; desktop relative paths use project root. No implicit directories or silent config overwrites.
- Current-buffer execution must preserve V0.3 symlink-aware module containment and input diagnostics. An untitled document requiring relative imports or inputs must ask for a file-backed project location rather than guess.
- Output preparation must complete before writes. Preserve existing destinations on pre-rename PDF failure and retain the documented non-transactional behavior of existing multiple JSON/CSV outputs.
- Record the Sprint 020 Hutch residual accurately. A native WSL2 proof, Linux browser, or isolated direct check cannot substitute for official macOS 14+, Windows 11+, and native Ubuntu 24.04+ owner acceptance.
