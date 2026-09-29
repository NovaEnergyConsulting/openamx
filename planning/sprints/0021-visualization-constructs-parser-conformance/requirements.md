# Sprint 021 Requirements: Visualization Constructs and Parser Conformance

## Goal

Implement the V0.4 visualization language contract through parsing, static checking, evaluation, and source-located diagnostics. Leave HTML view rendering and editor support to Sprint 022. Fix the known record-constructor-in-`match`-arm parser defect with a positive parser and checker regression.

## Inputs

- `planning/plan-openamxV04MasterSprintPlan.md`, Sprint 021 section
- `docs/language-spec-v0.4.md`, especially sections 1-5 and 11; `docs/language-spec-v0.3.md` for compatibility
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `src/ast/types.ts`, `src/parser/`, `src/typechecker/checkDocument.ts`, `src/runtime/`, `src/diagnostics/errors.ts`, and neighboring tests

## Entry Gate

Sprint 020's state currently remains OPEN for Lead Developer review of the Hutch prepare/build/dev and persistent-window evidence. These Sprint 021 artifacts are prepared for continuation, not approval to start production code. Before Builder execution, record either completed Sprint 020 acceptance or explicit Lead Developer disposition of the residual desktop tooling verification in `planning/decisions.md` and `planning/state.md`. Do not treat the user's report of Builder completion as a recorded acceptance decision or silently reduce the desktop must-have.

## In Scope

- Add source-located AST nodes and exact fenced-AMX parsing for `table`, `chart`, and top-level `show` per the V0.4 grammar, with option-level locations and original-document coordinates. Preserve case-sensitive names, source order, and inert narrative/ordinary fences.
- Activate V0.4 checking for a document containing any visualization declaration or `show`. Check the complete reachable program before input loading, evaluation, or any output write, including imported module restrictions.
- Enforce entry-module-only, non-exported, immutable view declarations; shared declaration namespace and earlier-source visibility for bindings/views; top-level-only `show` referencing an earlier view. Reject invalid forms, duplicate/irrelevant options, duplicate fields and names, and unsupported shapes using the specified AMX3001-3005 diagnostic families.
- Check table columns and bar/column/line/scatter bindings for exact typed record-list/scalar-list rules, field roles, nullable restrictions, required title/description/series, optional labels/group, and source types. No dynamic or untyped view data.
- Evaluate view definitions and `show` in document source order. Capture immutable snapshots of the source value at each `show`, including across separate executable blocks; later mutation must not change prior emissions. Expose ordered fence-associated emission data to Sprint 022 without modifying V0.3 plain-object `run` results.
- Validate runtime-only constraints such as scalar-list label/value length equality before any document output is written. Preserve typed input validation, module isolation/evaluate-once, and existing output semantics.
- Repair record constructors directly in `match` arms in the core parser and prove positive parse and activated-type-check behavior, including original source locations and unchanged match selection.
- Add focused parser, checker, runtime/module, and compatibility tests. Update planning logs with exact results, deviations, and remaining Sprint 022 work.

## Out of Scope

- Interactive HTML tables/charts, charting library, visual layout, static print fallbacks, VS Code provider changes, or production renderer insertion (Sprint 022).
- PDF engine/CLI/export or destination handling (Sprint 023); desktop workflow/product UI (Sprints 024-025); DOCX stretch (Sprint 026).
- Broad parser rewrites, dynamic/untyped view data, nested field paths, new language coercions, domain-specific scoring, arbitrary AMX filesystem access, or changes to V0.2/V0.3 historical specifications.

## Constraints

- Treat `docs/language-spec-v0.4.md` as authoritative. An underspecified or contradictory contract rule must be recorded in `planning/questions.md` and resolved with the Lead Developer before implementing that rule; do not invent it in code.
- Preserve V0.2/V0.3 behavior for documents without V0.4 constructs, including no-option CLI/run/render, existing HTML/source display, VS Code behavior, and module/input/output paths.
- Do not turn declarations alone into rendered output. A `show` records a value snapshot at its exact evaluation point; keep existing final-environment narrative interpolation unchanged.
- Reuse the core loader/checker/evaluator phases. Do not read imports or input data from the renderer or change desktop RPC as a shortcut.
- Avoid claiming Sprint 020 desktop verification is complete unless its outstanding gate is explicitly disposed.
