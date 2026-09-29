# Plan: OpenAMX V0.3 Master Sprint Plan

Evolve OpenAMX from computed documents toward typed, real-world data. V0.3 adds user-defined data structures and pure functions, opt-in Asset Management structures, CSV/JSON input and output, static type checking, and runtime validation. Preserve V0.2 documents and CLI behavior. Keep the release centered on typed-data workflows; defer charts, units/currency, and broad multi-document workflows. Estimate seven sequential sprints; there is no fixed sprint budget.

## Recommended Approach

- Seven sequential sprints: language/data contract; typed structures and static checking; pure functions/modules/domain library; CSV/JSON input and runtime validation; CSV/JSON output; VS Code support; examples, documentation, and acceptance.
- Every sprint customizes the four files from `planning/sprints/0000-sprint-template/` (requirements, blueprint, acceptance, handoff prompt).
- Builders execute only the documented sprint scope; update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` as work progresses.
- Extend the TypeScript/Bun core and hand-written parser. Keep filesystem paths in the CLI rather than allowing arbitrary file access from AMX expressions.
- Define the V0.3 language contract before implementation. Preserve V0.2 syntax and CLI behavior as additive compatibility requirements.
- Keep the language/runtime general-purpose. Deliver Asset Management structures through a separate opt-in `.amx` library.
- Marketplace publication is not an acceptance gate until the project makes and records its license decision.

## Steps

### Phase 1 – Language Contract and Type System

#### Sprint 013: V0.3 Language and Data Contract (depends on nothing)

- Define the authoritative V0.3 specification, additive compatibility contract, and explicit non-goals before implementation.
- Specify custom data-only record/type declarations, fields, type annotations, construction/access, required and optional fields, nullability, defaults, lists, nested records, and date/time representation.
- Define static-checking semantics for all existing V0.2 expressions and statements as well as records and pure functions. Specify type errors, source locations, and behavior for unknown or incompatible values.
- Define declared logical data inputs with CLI-supplied or overridden paths, for example `--input name=path`; no arbitrary filesystem access from the language runtime.
- Define CSV/JSON mappings: CSV with header rows maps to records; JSON supports a single object or an array, including nested records and lists. Set date/time wire values to ISO 8601 strings and decide the supported CSV representation for nested values.
- Define local `.amx` module imports and explicit named exports for types, values, and functions, including path resolution, module isolation, evaluation/visibility, collisions, and cycle handling.
- Define typed pure functions with typed parameters and return values and no mutation of shared document bindings.
- Define opt-in Asset Management library structures: Failure Mode, Risk, Strategy, Asset, Maintenance Task, and Lifecycle Cost. Set their initial field contracts in the spec.
- Define runtime validation for imported and computed records, including aggregate diagnostics and fail-fast mode, and CLI export selection/path behavior, for example `--output name=path`.
- Confirm V0.2 documents and existing `run`/`render` CLI behavior remain valid.

#### Sprint 014: Structure AST, Runtime Values, and Static Type Checker (depends on 013)

- Extend the AST and parser for record declarations, typed fields, type annotations, record values/construction, and field access.
- Implement static checking across the complete V0.2 expression/statement surface and the new typed forms: assignments, branches, loops, match, and unknown/incompatible identifiers.
- Produce deterministic, source-located diagnostics for declaration and expression type errors.
- Add parser and checker tests; verify existing V0.2 programs remain valid.

### Phase 2 – Reuse and Data Exchange

#### Sprint 015: Pure Functions, Modules, and Asset Management Library (depends on 014)

- Add typed user-defined pure functions, argument and return checking, and function calls.
- Add local `.amx` imports with explicit named exports for types, values, and functions. Resolve dependencies deterministically and enforce the module rules established in Sprint 013.
- Package the six initial Asset Management structures in a separate opt-in `.amx` library; do not make them core defaults.
- Test module isolation, import/export visibility, function calls, missing or colliding names, and module errors.

#### Sprint 016: CSV/JSON Input and Runtime Validation (depends on 014 and 015)

- Load declared logical inputs from CSV or JSON using CLI-provided or overridden file paths.
- Map header-row CSV data to record lists. Accept JSON objects, arrays, nested records, and lists.
- Validate imported and computed values against declared types, required/optional fields, nullability, and defaults.
- Support aggregate and fail-fast validation modes. Report file, row/record, field path, expected and actual type/value, and declaration location where available.
- Keep filesystem access outside executable AMX expressions.

#### Sprint 017: CSV/JSON Output (depends on 016)

- Export explicitly selected named values or records to JSON or CSV using CLI output paths.
- Define deterministic serialization, date preservation, and CSV headers/record behavior. Reject unsupported export shapes with actionable diagnostics.
- Test supported-shape round trips and stable output.

### Phase 3 – Authoring and Acceptance

#### Sprint 018: VS Code V0.3 Authoring Support (depends on stable grammar/checker from 015; data diagnostics integrate after 016)

- Extend the existing direct-provider extension with formatting, completion, and source-located static type diagnostics for V0.3 syntax.
- Include imported symbols where supported by the completed module contract and preserve existing V0.2 formatting and diagnostics.
- Run Extension Development Host tests and package/install a local VSIX.
- Marketplace publication remains conditional on an explicit project license decision and is not part of this sprint.

#### Sprint 019: Examples, Documentation, and V0.3 Acceptance (depends on 013–018)

- Add an end-to-end typed-data example using a custom structure and an opt-in Asset Management structure, CSV and JSON fixtures, a typed pure-function computation, aggregate and fail-fast validation, and named JSON/CSV exports.
- Assert actual values, validation results, rendered HTML, and exported file contents. Generate checked-in HTML through the production CLI where applicable.
- Update the authoritative language specification, README, extension documentation, migration/compatibility notes, CLI usage, limitations, and version metadata.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`; record exact verification results, deviations, residual limitations, and the license/publication status.

## Relevant Files

- `src/ast/types.ts` — AST for typed records, declarations, imports/exports, and functions.
- `src/parser/parseDocument.ts`, `src/parser/parseStatements.ts`, and `src/parser/parseExpression.ts` — document imports and new declaration/expression grammar.
- `src/runtime/environment.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and `src/runtime/standardLibrary.ts` — typed values, function/module evaluation, validation, and serialization boundaries.
- `src/diagnostics/errors.ts` — source-located static, module, import, validation, and export diagnostics.
- `src/cli.ts` — named data input/output mappings while preserving existing `run` and `render` behavior.
- `vscode-extension/src/` — existing providers and host tests to extend.
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/renderer.test.ts`, plus focused type-checker, data, and module tests as ownership boundaries require.
- `docs/language-spec-v0.2.md` — preserve as the historical V0.2 contract; add authoritative `docs/language-spec-v0.3.md`.
- `examples/`, `README.md`, `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and `planning/sprints/0000-sprint-template/` — examples, release documentation, planning state, and sprint artifacts.

## Verification

1. Each sprint ends with its acceptance criteria passing. Keep `bun run build && bun test` green; add and run extension-specific build, host-test, package, and local-install commands.
2. Static checker coverage includes every V0.2 expression and statement form, typed declarations and record operations, pure-function parameters/returns, imported exports, assignments, branches, loops, and match expressions.
3. Input validation coverage includes CSV header mappings, JSON objects/arrays/nesting, ISO 8601 date/time strings, required/optional/null/default behavior, malformed files, aggregate and fail-fast diagnostics, and CLI path overrides.
4. Export coverage proves named selection, deterministic JSON/CSV output, supported-shape round trips, and actionable errors for unsupported shapes.
5. Module coverage proves explicit exports, opt-in domain types, local path handling, deterministic dependency order, pure function calls, missing/colliding names, and cycle behavior.
6. Extension Host checks cover V0.2 regression and V0.3 formatting, completion, and type diagnostics. Package and locally install a VSIX; Marketplace publication is not required while licensing is unresolved.
7. End-to-end acceptance asserts actual parsed/evaluated values, rendered output, exported contents, and validation errors rather than only successful command exit codes.
8. Final gates include root and extension builds/tests, all example renders, CLI input/output checks, local VSIX packaging/install, and documented V0.2 compatibility checks.

## Decisions

- Primary user: OpenAMX authors. V0.3's intended outcome is authoring typed analyses over real-world data.
- V0.3 includes CSV/JSON read and write, full static type checking, runtime validation in aggregate and fail-fast modes, custom data-only structures, and typed pure functions.
- Data shapes: CSV header rows map to records; JSON accepts a single object or an array, including nested records/lists. Date/time wire values use ISO 8601 strings.
- AMX declares logical input names and types; the CLI supplies or overrides filesystem paths. Named values are selected for export through the CLI.
- Local `.amx` modules expose explicit named types, values, and callable pure functions. No remote package manager is introduced.
- Initial opt-in Asset Management structures: Failure Mode, Risk, Strategy, Asset, Maintenance Task, and Lifecycle Cost. They are delivered separately from the general-purpose core.
- V0.3 is additive: V0.2 document syntax and existing CLI behavior remain supported.
- Defer charts, units/currency, broad multi-document workflows, user-defined constraints/enums, inheritance, methods, computed fields, and Marketplace publication. Multi-file support is limited to local modules and declared data inputs needed for this release.
- Seven sprints is an estimate, not a fixed budget. Sprint 013 must resolve exact syntax, null/default semantics, CSV representation of nested values, module evaluation/visibility, and diagnostic format before implementation begins.

## Further Considerations

1. Full static checking and pure user-defined functions are substantial language additions. Sprint 013 should confirm their smallest coherent semantics and identify any contract details that would otherwise force a breaking redesign.
2. The exact fields and meanings of the six opt-in Asset Management structures need domain review before the library is treated as stable.
3. CSV does not natively represent nested structures. Sprint 013 should select an explicit policy, such as rejecting nested CSV values or using a documented JSON-in-cell encoding.
4. The repository has no license file. Local VSIX packaging/install is the editor acceptance target; Marketplace publication remains deferred until the project makes a license decision.

## Next Actions (Architect / Lead Developer)

- Review and approve this V0.3 master plan.
- When ready, prepare Sprint 013 by customizing the four artifacts in `planning/sprints/0000-sprint-template/` and record the active status in `planning/state.md`.
- Hand off only the approved Sprint 013 contract work. Do not begin language or runtime implementation before the V0.3 specification and compatibility rules are explicit.
- Record clarifications and decisions in `planning/questions.md` and `planning/decisions.md`; keep deferred candidates out of the active sprint scope.

This plan is based on V0.2's completed language, runtime, renderer, CLI, extension, and acceptance baseline, together with the V0.3 product requirements gathered during discovery. It defines the V0.3 roadmap only; no implementation work is included.
