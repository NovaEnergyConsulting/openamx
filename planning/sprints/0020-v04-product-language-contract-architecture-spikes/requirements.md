# Sprint 020 Requirements: V0.4 Product/Language Contract and Architecture Spikes

## Goal

Establish the authoritative, implementable V0.4 language, rendering, export, and desktop contracts before feature implementation. Prove the three architecture risks identified by the V0.4 master plan and deliver evidence-backed choices, tested dependency versions, and a clear implementation boundary for Sprints 021–025.

## Inputs

- Approved roadmap: `planning/plan-openamxV04MasterSprintPlan.md`
- Compatibility contracts: `docs/language-spec-v0.2.md` and `docs/language-spec-v0.3.md`
- Current implementation boundaries: `src/parser/`, `src/typechecker/`, `src/runtime/`, `src/renderer/`, `src/cli.ts`, and `vscode-extension/`
- Existing data and module workflows: `src/runtime/moduleLoader.ts`, `src/runtime/inputData.ts`, and `src/runtime/outputData.ts`
- Sprint template: `planning/sprints/0000-sprint-template/`
- Project rules and planning record: `.agents/main.md`, `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## In Scope

- Create `docs/language-spec-v0.4.md` as the authoritative V0.4 contract. Preserve V0.2 and V0.3 specifications as historical contracts.
- Specify visualization declarations and expressions, static checking, source locations, typed record-list and scalar-list data shapes, field/series bindings, labels, ordering, empty-data behavior, escaping, accessibility semantics, and deterministic output.
- Define view placement at the executable AMX fence position while retaining the existing formatted, escaped AMX source listing there. Specify how declarations and views interact with source-order execution, multiple blocks, and final-environment interpolation.
- Define interactive HTML table sorting, filtering, and pagination; bar/column, line, and scatter chart semantics; and static print/export representations without remote assets.
- Define offline, report-ready PDF requirements, layout and pagination expectations, CLI and desktop entry points, destination validation/conflicts, failure reporting, and no-write behavior. Compare viable PDF approaches and select one only with recorded evidence.
- Define editable DOCX as a stretch goal, including semantic editable content and permitted chart images. Record whether the export spike supports pursuing it; it is not a core acceptance gate.
- Run a bounded unsaved-buffer spike proving reuse of core parsing and analysis with the current entry text plus local module imports and configured CSV/JSON inputs. Establish a narrow typed RPC boundary and keep filesystem and execution capabilities in the desktop main process.
- Prototype the required Electrobun + Vue + shadcn-vue combination in `desktop-app/`. Record exact tested versions and prove a Bun-backed main-process integration, or present a tested, evidence-based alternative.
- Define portable project-default input mappings, machine-local overrides, per-run override precedence, path resolution, private-path handling, project navigation needs, and safe output writes.
- Define isolated desktop dependency, development, test, build, and run commands. Record platform prerequisites and a truthful verification matrix for macOS 14+, Windows 11+, and Ubuntu 24.04+.
- Update the four Sprint 020 artifacts and planning state, decisions, and questions with resolved contract choices, spike evidence, tested versions, deviations, and remaining blockers.

## Out of Scope

- Production visualization AST/parser/typechecker/runtime/renderer/formatter/editor implementation; these belong to Sprints 021–022.
- Production PDF CLI/desktop export implementation; this belongs to Sprint 023.
- Desktop production workflows beyond the minimal architecture prototype; these belong to Sprints 024–025.
- Production DOCX export; it remains a stretch sprint after core must-haves are on track.
- Examples, release-wide documentation/version updates, Marketplace publication, license selection, and V0.4 release acceptance; these belong to Sprint 027 or separate decisions.
- Changes to V0.2/V0.3 behavior, historical specifications, existing extension architecture, or core general-purpose boundaries unless explicitly approved with migration guidance.

## Constraints

- Preserve V0.3 document, CLI, module, input, output, renderer, and VS Code behavior by default. Any compatibility exception requires an explicit Lead Developer decision and migration guidance before implementation.
- Keep the language/runtime core general-purpose. Put the prototype in the isolated `desktop-app/` package and reuse core APIs rather than duplicating parser, checker, evaluator, or renderer behavior.
- The webview must not receive unrestricted filesystem access or evaluate AMX. File access, module/input resolution, execution, and export stay in the desktop main process behind a narrow typed RPC.
- PDF generation must be local/offline for core workflows and must not require remote assets or arbitrary network access.
- Keep spikes short and disposable. Do not commit generated native outputs, secrets, or user-local configuration; do not destabilize root or extension workflows.
- Record exact versions, commands, environment, outcomes, limitations, and evidence for every architecture choice. Do not claim macOS or Windows verification from a Linux-only run.
- A spike finding a concrete blocker to a selected must-have is a review gate: present evidence and options to the Lead Developer and do not reduce scope without approval.
