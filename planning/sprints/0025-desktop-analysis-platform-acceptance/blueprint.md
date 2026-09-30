# Sprint 025 Blueprint: Desktop Analysis Workflow and Platform Acceptance

## Approach

- Confirm Sprint 024's RPC/session contract and Sprint 023's exported PDF adapter first. Add one focused current-buffer run test with a local module, JSON input, CSV input, and an intentional unsaved change; verify the saved entry remains untouched and the result reflects only the buffer.
- Create a main-process configuration resolver for project defaults, machine-local overrides, and per-run mappings. Parse `.openamx/project.json` and `.openamx/local.json` with strict schemas, reject secrets/invalid paths as specified, normalize desktop-relative paths from the canonical project root, and return bounded configuration/diagnostic data. Keep `.openamx/local.json` ignored and never emit its private values into shared state.
- Extend typed RPC schemas with `analyzeBuffer`, `runBuffer`, `resolveInputs` or equivalent, `previewBuffer`, `saveHtml`, and `exportPdf` operations. Define discriminated running/success/failure responses, request IDs or stale-response protection, bounded diagnostics, and cancellation/ignore behavior for superseded requests where the UI can issue concurrent actions.
- Route the main process through the same core loader with `entryText`, resolved validated input mappings, and the file-backed entry URI. Use its evaluated environment and `ViewEmission` data for HTML; call `preparePdfReport`/`serializePdfReport` or the approved exported adapter for PDF. Do not run an alternate CLI subprocess or duplicate input/module/evaluator logic.
- Build the result workflow in Vue: input/configuration status, run/preview controls, progress/disabled states, result context or bounded result summary, HTML preview/save, PDF destination action, and structured diagnostics grouped by parser/type/module/input/runtime/render/export phase. Make failure states actionable and keep stale successful results visibly distinct from the current failed run.
- Add end-to-end fixtures for portable defaults, local overrides, per-run overrides, precedence conflicts, nested JSON/scalar CSV, local imports, malformed/invalid data, missing mappings, output conflicts, PDF failures, and no-write guarantees. Include path traversal/symlink/privacy cases and ensure the webview receives no raw filesystem authority.
- Execute the required platform matrix with the release owner. On each target, record OS release, architecture, Bun/Node/Electrobun/Hutch versions, native prerequisites, install/build/launch commands, window/preview/RPC observations, and failures. Treat WSL2 as supporting evidence only; do not mark native target gates from it.
- Update `desktop-app/README.md` and planning logs with the supported prototype workflow, configuration examples without private paths, exact verified commands, residual Hutch behavior, and Sprint 027 handoff. Keep DOCX disposition and licensing/publication status explicit.

## Files to Update

- `desktop-app/src/shared/rpc.ts`
- `desktop-app/src/bun/` configuration, input/run/preview/export handlers, path and status services
- `desktop-app/src/mainview/` workflow controls, diagnostics/results/configuration UI, and preview/export states
- `desktop-app/tests/` focused RPC, configuration, workflow, and host/e2e tests
- `desktop-app/README.md`, package scripts/configuration, and lockfile as required
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Root/core files only for a demonstrated shared API boundary defect; no desktop duplicate implementation

## Notes

The official platform targets are macOS 14+, Windows 11+, and Ubuntu 24.04+. The current repository history contains WSL2/Linux Hutch timeouts and a direct native bundle proof; Sprint 025 must report the owner matrix separately and cannot convert those residuals into successful official-target acceptance.
