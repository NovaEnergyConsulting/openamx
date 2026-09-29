# Plan: OpenAMX V0.4 Master Sprint Plan

Evolve OpenAMX from typed-data analyses toward richer report communication and a standalone desktop authoring workflow. V0.4 adds tables and charts, report-ready PDF export, and a cross-platform desktop prototype alongside the existing VS Code extension. DOCX is a stretch goal, not a core release gate. Preserve V0.3 behavior by default; compatibility exceptions require an explicit decision and migration guidance. Plan eight sequential sprints without a fixed sprint budget, beginning with a language contract and architecture spikes.

## Recommended Approach

- Eight proposed sprints: V0.4 contract and feasibility; visualization language constructs and parser conformance; HTML visuals and editor support; PDF export; desktop foundation; desktop workflows and platform acceptance; optional editable DOCX; examples, documentation, and release acceptance.
- Every sprint customizes the four files from `planning/sprints/0000-sprint-template/` (requirements, blueprint, acceptance, handoff prompt).
- Builders execute only documented sprint scope; update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` as work progresses.
- Keep the TypeScript/Bun language/runtime core general-purpose. Place the new Electrobun + Vue + shadcn-vue application in its own `desktop-app/` subdirectory and reuse core APIs rather than duplicating parser, checker, evaluator, or renderer behavior.
- Define the V0.4 language and export contracts before implementation. Preserve V0.3 document, CLI, and VS Code behavior by default.
- Start with short feasibility spikes for unsaved-buffer execution, Electrobun runtime integration, and PDF generation. Review evidence with the Lead Developer before changing a selected must-have.
- Desktop scope is a working prototype, not an installer/updater program. Release acceptance requires owner build and launch checks on each selected official Electrobun target.
- Marketplace publication and project license selection remain separate from V0.4 acceptance.

## Steps

### Phase 1 – Language Contract and Feasibility

#### Sprint 020: V0.4 Product/Language Contract and Architecture Spikes (depends on nothing)

- Create authoritative `docs/language-spec-v0.4.md`, compatibility rules, and explicit non-goals before implementation.
- Specify table/chart declarations, type checking, supported data shapes (typed record lists and scalar lists), chart field bindings, labels/series, ordering, errors/source locations, view placement, and compatibility with V0.3 modules, inputs, validation, outputs, and HTML rendering.
- Views emit at the executable AMX fence position; retain the existing formatted, escaped AMX source display at that position. Decide how declarations and view emission relate while preserving source-order semantics.
- Define interactive HTML table behavior (sorting, filtering, pagination) and deterministic chart output. Initial chart types are bar/column, line, and scatter. HTML charts are interactive; PDF/DOCX charts use static representations.
- Define report-ready PDF expectations, page layout and pagination, offline operation, CLI interface, desktop entry point, output path validation, and failure/no-write behavior. Compare implementation approaches before selecting a PDF engine.
- Define editable DOCX as a stretch goal: semantic headings, paragraphs, lists, and tables; charts may be embedded images. Decide its exact acceptance only after the export spike.
- Prototype Electrobun with Vue and shadcn-vue in `desktop-app/`; record tested versions and prove a Bun-backed main-process integration or document an evidence-based alternative.
- Prove reuse of pure text parsing and core analysis from an unsaved editor buffer, including local imports and configured CSV/JSON inputs. Establish the narrow RPC and filesystem boundary between the desktop main process and webview.
- Define portable project-default input mappings, machine-local overrides, project navigation needs, isolated package/test/build commands, and platform verification mechanics.
- If a spike demonstrates a concrete blocker to a selected must-have, present the evidence and options for approval before reducing scope.

#### Sprint 021: Visualization Constructs and Parser Conformance (depends on 020)

- Extend the AST, parser, typechecker, runtime, and diagnostics for the V0.4 visualization contract.
- Support the agreed typed record-list and scalar-list shapes without adding dynamic or untyped view data.
- Fix the existing parser limitation for record constructors directly in `match` arms. Add a focused positive parser and typechecker regression test while preserving existing match semantics.
- Keep declarations source-located and deterministic. Invalid view names, fields, bindings, and unsupported shapes fail before document output is written.
- Preserve V0.2/V0.3 behavior for documents that do not use V0.4 constructs.

### Phase 2 – HTML Visuals and PDF

#### Sprint 022: HTML Tables, Charts, and VS Code V0.4 Authoring Support (depends on 021)

- Render views at their specified executable-block positions while preserving the escaped, formatted source listing and narrative order.
- Add interactive HTML tables with the contracted sorting, filtering, and pagination behavior. Add interactive bar/column, line, and scatter charts with no remote asset requirement.
- Provide stable static representations suitable for printing and downstream export. Define accessibility labels/semantics and empty-data states in the contract and acceptance tests.
- Extend the existing VS Code formatter, completions, and static diagnostics only as needed for V0.4 declarations and view expressions. Retain the direct-provider architecture and V0.3 behavior.
- Test exact data binding, source-order behavior, HTML escaping, interaction, empty values, and deterministic output.

#### Sprint 023: Report-Ready PDF Export (depends on 022)

- Add a shared report-export boundary for the CLI and desktop application; retain HTML and existing JSON/CSV exports.
- Generate offline PDFs with readable typography, headings, tables, charts, and print pagination close to the HTML report. Use static charts and ensure rendering is complete before capture.
- Validate analysis and serialize/prepare the complete PDF before writing the destination. Report actionable errors and do not write an output for invalid input or failed rendering.
- Add CLI PDF output selection and tests for supported paths, destination conflicts, permissions/write failures, deterministic content, and representative layouts.
- Record any rendering limitations; do not claim exact HTML/PDF pixel parity.

### Phase 3 – Desktop Application

#### Sprint 024: Desktop Application Foundation (depends on 020; may prototype in parallel after the Sprint 020 scope gate)

- Create the isolated `desktop-app/` package using Electrobun, Vue, and shadcn-vue. Keep root package and existing `vscode-extension/` workflows independently buildable and testable.
- Add file/folder opening, save/dirty state, project navigation for local modules, and a split editor/live HTML preview.
- Provide AMX-aware editing with syntax highlighting, formatting, completion, and source-located static diagnostics by reusing core APIs.
- Keep file access, module/input resolution, execution, and export in the desktop main process behind a narrow typed RPC. The webview must not receive unrestricted filesystem capabilities or independently evaluate AMX.
- Add focused desktop host/UI tests and document prerequisites, development, and run commands.

#### Sprint 025: Desktop Analysis Workflow and Platform Acceptance (depends on 021–024)

- Run and preview from the current unsaved entry buffer through the same parsing, module, type-checking, input-validation, evaluation, and rendering behavior as the core/CLI. Do not silently run a stale saved copy.
- Support declared CSV/JSON input mapping, portable project defaults and machine-local overrides, and per-run overrides. Resolve secrets/private paths locally; define config precedence, path handling, and safe writes in Sprint 020.
- Show actionable parser, type, module, input-validation, and runtime diagnostics, and expose result/preview states for running, success, and failure.
- Support safe output selection, HTML preview/save, and PDF export. Add end-to-end tests covering edits, unsaved execution, local imports, data overrides, failure behavior, and exports.
- Require the release owner to build and launch the prototype on macOS 14+, Windows 11+, and Ubuntu 24.04+. Record exact OS/runtime versions and outcomes. Installers, automatic updates, and support for other Linux distributions are not required for this prototype.

### Phase 4 – Stretch and Release Acceptance

#### Sprint 026: Editable DOCX Export (stretch; depends on 023)

- Proceed only after PDF and desktop must-haves are on track and the export feasibility evidence supports it.
- Produce an editable Word document with semantic headings, paragraphs, lists, and tables. Charts may be embedded images; do not promise interactive or pixel-identical charts.
- Support CLI and desktop entry points where the shared export architecture makes that feasible. If not, record the narrower result and remaining work; DOCX is not a V0.4 core acceptance gate.

#### Sprint 027: Examples, Documentation, and V0.4 Acceptance (depends on 020–025; Sprint 026 disposition recorded)

- Add an end-to-end example exercising typed records/scalar lists, tables, the initial chart set, interactive HTML, and static PDF output. Use existing CSV/JSON inputs and local modules where appropriate.
- Assert actual evaluated values, chart/table data and placement, HTML output, PDF content/layout, data diagnostics, and no-output behavior on invalid analysis. Assert V0.3 compatibility through existing examples and CLI paths.
- Add desktop acceptance for opening/editing `.amx`, V0.4 language support, unsaved-buffer preview/run, local imports, input mapping/default overrides, and PDF export.
- Update the authoritative V0.4 spec, README, CLI/desktop/extension documentation, limitations, and aligned version metadata. Preserve V0.2 and V0.3 specifications as historical contracts.
- Run and record root build/tests, CLI acceptance, extension host tests and local package checks, desktop tests/builds, and release-owner launch checks on all three target operating systems.
- Update planning state, decisions, and questions with exact results, deviations, DOCX disposition, residual limitations, and license/publication status. Do not claim a platform or release gate passed if it was not run.

## Relevant Files

- `docs/language-spec-v0.2.md` and `docs/language-spec-v0.3.md` — preserve the historical contracts; add `docs/language-spec-v0.4.md` as the new authoritative contract.
- `src/ast/types.ts` — V0.4 visualization AST nodes and view data references.
- `src/parser/parseStatements.ts` and `src/parser/parseExpression.ts` — visualization syntax and the direct record-constructor-in-`match` parser fix.
- `src/typechecker/checkDocument.ts` — static validation for visualization values, fields, and data shapes.
- `src/runtime/evaluateExpression.ts` and `src/runtime/moduleLoader.ts` — view evaluation and shared current-buffer/module/data execution path as established by the contract spike.
- `src/formatter/formatAmx.ts` and `src/renderer/renderHtml.ts` — formatting new syntax and rendering views at document positions.
- `src/cli.ts`, `src/runtime/inputData.ts`, and `src/runtime/outputData.ts` — CLI PDF integration, declared input reuse, and output boundaries.
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/renderer.test.ts`, `tests/examples.test.ts`, and new focused export/desktop tests as ownership boundaries require.
- `vscode-extension/src/` — existing direct providers and host tests to extend without replacing the extension.
- `desktop-app/` — new Electrobun main process, Vue/shadcn-vue webview, typed RPC, project configuration, tests, and platform build instructions.
- `examples/`, `README.md`, `vscode-extension/README.md`, root/extension/desktop manifests, `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and `planning/sprints/0000-sprint-template/` — examples, documentation, release metadata, planning state, and sprint artifacts.

## Verification

1. Each sprint ends with its acceptance criteria passing. Keep root `bun run build && bun test` green; define isolated desktop dependency, typecheck/build, test, and run commands without destabilizing root or extension workflows.
2. Contract/type-checker tests cover visualization declarations, typed record-list/scalar-list inputs, declared fields, source locations, declaration/placement behavior, unsupported shapes, and V0.3/V0.2 compatibility. The parser-constructor-in-match regression must pass.
3. Renderer tests prove view placement, interactive HTML table behavior, bar/column/line/scatter chart data, static print representations, escaping, accessibility labels, empty-data behavior, and deterministic output while retaining visible formatted source.
4. PDF tests cover headings, tables, static charts, page layout, representative output inspection, deterministic properties that the selected engine guarantees, destination validation, and absence of output after analysis/render failure.
5. Desktop tests cover file open/save, formatting/diagnostics/completion, current-buffer preview/run, local modules and CSV/JSON inputs, project defaults/local overrides, PDF export, typed main-process RPC, and main-process-only filesystem access.
6. Release-owner build and launch checks are required for macOS 14+, Windows 11+, and Ubuntu 24.04+. Record exact toolchain/OS versions; do not substitute a Linux-only run for these gates.
7. Run the existing VS Code extension compile and Extension Development Host suite, package/install checks where supported, all old/new example run/render paths, and `git diff --check`.
8. DOCX verification is required only if the stretch is explicitly accepted as delivered; otherwise record its disposition without blocking V0.4 core acceptance.

## Decisions

- Primary user: analysts building reports. V0.4 must-haves are tables/charts, report-ready PDF, and a working desktop authoring/preview/run/export prototype. Editable DOCX is a stretch goal.
- Compatibility is decided per feature, but preserve V0.3 document and CLI behavior by default. Any breaking exception needs explicit approval and migration guidance.
- Tables are interactive in HTML and printable. Initial chart types are bar/column, line, and scatter; charts are interactive in HTML and static in report exports.
- Visualization data initially binds to typed record lists and scalar lists. Exact syntax, labeling/series semantics, placement behavior, and empty-data rules are established in Sprint 020 before implementation.
- Views emit at their AMX fence position while existing formatted, escaped AMX source remains visible. Document-wide source-order execution and final-environment interpolation remain intact.
- The desktop app is a separate Electrobun + Vue + shadcn-vue project alongside VS Code. It runs the current buffer, supports portable project defaults and machine-local input-path overrides, and does not require installers or automatic updates in V0.4.
- Official Electrobun targets at planning time are macOS 14+, Windows 11+, and Ubuntu 24.04+. Release-owner build and launch verification is expected on all three; other Linux distributions are out of scope for this release.
- Fix the known constructor-in-`match` parser limitation. Asset Management schema certification, units/currency, broad multi-document workflows, AI authoring, license selection, and Marketplace publication remain out of scope.
- Sprint 020 must pin the chosen Electrobun/Vue/shadcn-vue and PDF toolchain versions after compatibility/feasibility proof. This plan does not preselect a charting or PDF library.

## Further Considerations

1. The current file-based module loader owns local filesystem access. Sprint 020 must prove an in-memory entry-buffer path that retains module containment, data validation, and diagnostics. If direct core reuse cannot meet the desktop workflow, compare an explicitly bounded main-process CLI invocation before selecting an alternative.
2. Electrobun application runtime, package installation, native build requirements, and system dependencies must be tested on the project’s available environment. Record exact versions and avoid committing generated native outputs or user-local configuration.
3. Interactive HTML and static PDF are distinct presentations. Specify accessible table/chart semantics and print fallbacks; do not imply interactive controls survive PDF export.
4. DOCX editability and visual fidelity are competing goals. The stretch acceptance prioritizes editable semantic content and permits chart images; no DOCX parity claim is made.
5. PDF generation must remain local/offline for core workflows and should not require arbitrary network access or remote chart assets.

## Next Actions (Architect / Lead Developer)

- Review and approve this V0.4 master plan.
- When ready, prepare Sprint 020 by customizing the four artifacts in `planning/sprints/0000-sprint-template/` and record the active status in `planning/state.md`.
- Hand off only Sprint 020 contract and feasibility work. Do not begin visualization syntax, PDF implementation, or desktop production scope before the contract and architecture evidence are reviewed.
- Record clarifications and decisions in `planning/questions.md` and `planning/decisions.md`; keep stretch and deferred candidates out of active sprint scope.

This plan defines the proposed V0.4 roadmap based on the approved product discovery. It is a planning artifact only; no implementation work is included.
