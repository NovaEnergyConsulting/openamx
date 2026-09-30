# Sprint 023 Requirements: Report-Ready PDF Export

## Goal

Implement the shared offline PDF export boundary for the CLI and future desktop main process. Produce report-ready PDFs from the existing evaluated document and Sprint 022 static visual/data representation, with deterministic layout, safe destinations, actionable failures, and no writes after analysis or rendering failure.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 023 scope
- `docs/language-spec-v0.4.md`, especially sections 4-6 and 9-11
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 022 completion record and static visual/data boundary
- `src/runtime/moduleLoader.ts`, `src/runtime/outputData.ts`, `src/renderer/renderHtml.ts`, `src/cli.ts`, and existing diagnostics/tests

## In Scope

- Add the shared PDF report/export adapter selected by the contract: pdfmake 0.3.11, using approved locally bundled fonts or a documented approved replacement. Verify font redistribution terms before embedding any font in a shipped artifact.
- Add the additive CLI command `openamx export pdf <input> --out <path>`, with repeated V0.3 `--input name=path` and `--validation aggregate|fail-fast` options. Preserve existing `run`, `render`, JSON, and CSV behavior.
- Reuse one analysis/evaluation path and Sprint 022's static visual/data model. Do not re-read modules/inputs, re-evaluate views, or create a second semantic interpretation of AMX. Provide a typed export boundary callable by the future desktop main-process RPC without coupling root CLI code to desktop UI.
- Generate local/offline PDFs containing narrative headings/text, visible formatted executable AMX source, all emitted tables in original order, static charts and textual chart data, and report-document order. Support A4 portrait defaults, 18 mm margins, page numbers, repeated table headers, explicit page breaks where represented by the report model, readable wrapping, and deterministic layout settings.
- Validate/prepare the complete analysis, input data, evaluated values, report model, and serialized PDF before modifying the destination. Require explicit lowercase `.pdf`; resolve CLI paths from process working directory; require existing parents; reject entry/module/input conflicts, duplicate/conflicting destinations, destination symlinks, and invalid paths.
- Write through a unique temporary file in the same destination directory, close/flush it, atomically rename it over the destination, remove the temporary file on pre-rename failure, and preserve an existing destination on analysis/layout/serialization failure. Use `AMX6001` for invalid selection/path/conflict and `AMX6002` for layout, serialization, PDF-engine, or filesystem failures.
- Add representative tests for searchable headings/narrative/table text, static charts, multi-page tables, explicit page breaks, page numbers, deterministic output properties guaranteed by the selected engine, destination safety, permissions/write failures, invalid input, and no-write behavior.
- Record exact dependency/runtime versions, font decision/evidence, limitations, PDF inspection results, and the Sprint 024/025 desktop integration boundary in planning logs.

## Out of Scope

- Desktop UI, Electrobun packaging, project navigation, current-buffer workflow, RPC handler implementation, and cross-platform owner acceptance (Sprints 024-025). The adapter may expose a typed callable boundary for later integration.
- Editable DOCX (optional Sprint 026), HTML interaction changes, chart/table language changes, new chart types, and VS Code provider changes.
- Exact HTML/PDF pixel parity, PDF/A certification, tagged-PDF accessibility certification, arbitrary browser printing as a runtime dependency, automatic directory creation, multi-file transaction guarantees for existing JSON/CSV outputs, or remote assets/network access.

## Constraints

- Treat `docs/language-spec-v0.4.md` as authoritative. Approved pdfmake 0.3.11 is the lead engine, but verify its production Bun/Electrobun compatibility and font licensing before shipping embedded fonts.
- Keep PDF generation local/offline and deterministic for the same analyzed source and inputs. Do not use Chrome as a hidden fallback; it remains only a comparison path.
- Do not write any destination until parsing/linking/checking, input validation, evaluation, report preparation, layout, serialization, and destination validation succeed.
- Preserve V0.2/V0.3 no-option and existing export behavior. Avoid changes to historical specifications and unrelated CLI/output paths.
- Keep all output paths and temporary files within the documented safety boundary. Never expose arbitrary filesystem access to AMX or the future webview.
- Record unavailable platform/font/license checks honestly; Linux-only evidence is not macOS/Windows acceptance.
