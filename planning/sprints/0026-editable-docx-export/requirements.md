# Sprint 026 Requirements: Editable DOCX Export (Stretch)

## Goal

If explicitly approved after the V0.4 core must-haves are on track, add an editable DOCX export built from the shared report model. Prioritize semantic, editable headings, paragraphs, lists, and tables; charts may be embedded images. DOCX is optional and never a core V0.4 release gate.

## Entry Gate

- Sprint 023 PDF delivery is complete and its shared report/export boundary is available.
- Sprint 024 desktop foundation and Sprint 025 desktop workflow are accepted or their residuals have an explicit Lead Developer disposition; the official platform matrix must not be silently waived.
- The Lead Developer explicitly approves Sprint 026 as a stretch investment after reviewing the remaining PDF, desktop, platform, and release-acceptance risk.
- A short feasibility spike identifies a maintainable local/offline DOCX approach, compatible runtime/package versions, licensing terms, and a representative proof. If evidence is insufficient, close this sprint as deferred with no production DOCX implementation.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 026 scope
- `docs/language-spec-v0.4.md`, sections 6 and 10
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `src/renderer/reportPdf.ts` and the shared report/view data boundary from Sprints 022–023
- Desktop main-process export boundary from Sprint 025, if accepted
- Existing CLI output/path/error conventions and representative report fixtures

## In Scope

- Compare and select a local/offline DOCX generation approach only after the entry gate is approved. Record exact versions, runtime compatibility, licensing, and whether the approach supports semantic editable content.
- Generate an editable `.docx` containing report headings, narrative paragraphs, lists, tables, captions, and static chart images where feasible. Preserve report/source/view order and declaration-order table data.
- Define an additive CLI entry point and desktop main-process action only where the shared export boundary makes both practical; otherwise document the narrower supported entry point and remaining work.
- Validate `.docx` destinations, complete report preparation/serialization before writing, preserve existing destinations on pre-rename failure, and report actionable output diagnostics consistently with PDF.
- Verify the resulting document by inspecting package structure and opening/round-tripping representative content with an available compatible tool. Assert semantic/editable content rather than pixel identity or chart interactivity.
- Record DOCX limitations, chart-image behavior, compatibility/licensing evidence, tests, and final disposition for Sprint 027.

## Out of Scope

- Any change to AMX syntax, AST, checker, evaluator, HTML/PDF semantics, VS Code providers, or desktop core workflows.
- Interactive charts, editable chart data, pixel-identical HTML/PDF/DOCX output, PDF-to-DOCX conversion, macros, embedded remote content, arbitrary external templates, or network services.
- Starting implementation before explicit stretch approval or using DOCX work to justify delaying PDF, desktop, platform, or release acceptance.
- Installers, updater support, Marketplace publication, project license selection, and domain-specific document semantics.

## Constraints

- DOCX remains non-blocking. If feasibility, licensing, or core schedule risk is unfavorable, record `deferred` and stop without adding a dependency or partial export.
- Keep generation local/offline and avoid remote images, fonts, templates, or network calls. Verify all redistributed assets and package licenses.
- Reuse the shared evaluated report model; do not re-evaluate AMX, reread inputs/modules, or duplicate table/chart semantics in a DOCX-only path.
- Use the same safe destination and no-write-before-complete-preparation principles as PDF, while recording any format-specific guarantees and limitations.
- Do not claim cross-platform DOCX compatibility without direct evidence. Record the actual operating system, runtime, office/parser tool, and version used for verification.
