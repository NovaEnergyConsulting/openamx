# Sprint 022 Requirements: HTML Tables, Charts, and VS Code V0.4 Authoring Support

## Goal

Render Sprint 021's checked, immutable view emissions as accessible, interactive offline HTML and stable printable representations. Extend the existing direct VS Code providers for V0.4 visualization authoring while preserving all V0.2/V0.3 behavior.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 022 scope
- `docs/language-spec-v0.4.md`, especially sections 1-5; historical V0.2/V0.3 specifications
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 021 acceptance results
- `src/runtime/environment.ts` (`ViewEmission`), `src/runtime/moduleLoader.ts`, `src/renderer/renderHtml.ts`, `src/formatter/formatAmx.ts`, `src/cli.ts`
- `vscode-extension/src/providers/` and existing Extension Development Host tests

## In Scope

- Insert each `ViewEmission` after its containing executable fence's existing escaped, canonically formatted AMX source listing, in show-statement order; preserve narrative, inert fences, final-environment interpolation, and single source-order evaluation.
- Render semantic HTML tables from typed snapshots: caption, column header labels with `scope="col"`, escaped cells, keyboard-operable sorting, case-insensitive substring filtering, pagination (10/25/50, default 25), accessible state/status, and distinct empty/no-match states. Preserve original row order by default; stable typed sorting with nulls last in both directions and page reset after sort/filter.
- Render locally interactive bar, column, line, and scatter charts from the exact captured data/labels/series, with fixed ordered visual styling, tooltips or equivalent data inspection, accessible names/descriptions, text/tabular data alternatives, null gaps/omitted scatter points, and deterministic empty-data states. Preserve input/series and first-seen grouping order; do not reinterpret or re-evaluate source expressions.
- Provide stable noninteractive print representations of every view: full original-order tables with repeated headers where supported and static chart graphics with corresponding textual data. Print excludes transient HTML filter/sort/page state. Keep a reusable presentation boundary for Sprint 023's PDF adapter without generating a PDF in this sprint.
- Keep reports self-contained and offline, with bundled/local-only scripts, styles, fonts/assets as needed; escape all untrusted labels, data, titles, descriptions and source in HTML, script-data, and SVG contexts. Do not introduce report network requests.
- Extend layout formatting of V0.4 executable declarations so canonical source remains parser-valid and idempotent. Update direct VS Code formatting, source-order-scoped completion (keywords, view names, valid view fields/options where determinable), and static/parse/link diagnostics for the current unsaved buffer. Keep editor checks read-only and non-evaluating.
- Add focused renderer/formatter tests, browser interaction and print checks, extension host tests, and V0.2/V0.3 compatibility checks. Record exact verification results and limitations in planning logs.

## Out of Scope

- PDF generation, CLI `export pdf`, font redistribution approval, pagination in PDF, output path/write changes (Sprint 023).
- Desktop application authoring/preview workflows and native platform acceptance (Sprints 024-025); editable DOCX (optional Sprint 026).
- New AMX syntax, dynamic view data, new chart kinds, changes to checker semantics or `ViewEmission` unless a demonstrated contract defect is reviewed and recorded.
- Replacing the direct VS Code providers with an LSP, running AMX or loading CSV/JSON data for editor diagnostics, remote assets, Marketplace publication, or selecting a project license.

## Constraints

- The authoritative V0.4 contract determines table/chart semantics and HTML/print behavior. Any gap affecting observable behavior must be logged and resolved before invention in code.
- Rendering receives the same evaluated environment from the module loader where available; do not execute the document twice or read inputs/modules from rendering. For direct `renderHtml(doc)` calls, execute once via its existing evaluation path.
- The formatter and providers must not touch narrative, front matter, or ordinary fences. Imported symbols remain governed by existing editor path containment and explicit-export checks.
- Preserve standalone V0.2/V0.3 HTML output and no-option CLI behavior for documents without views; keep named JSON/CSV output and failure/no-write behavior unchanged.
- Sprint 020 was closed by Lead Developer Option 2. Hutch scripted build/dev reliability and persistent-window checks remain desktop residuals, not Sprint 022 completion gates and not verified platform claims.
