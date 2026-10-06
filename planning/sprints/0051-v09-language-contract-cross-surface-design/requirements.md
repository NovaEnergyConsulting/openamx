# Sprint 051 Requirements: V0.9 Language Contract and Cross-Surface Design

## Goal

Turn the approved V0.9 language and compatibility contract into an exact, reviewable implementation contract before feature work begins. Close the parser/precedence, dimension and unit identity, optional SI library, aggregate/chart edge-case, static-checking boundary, diagnostic, migration, and cross-surface design gates. Leave Sprint 052-058 with positive and negative examples, expected results, compatibility constraints, and explicit dependency boundaries.

Sprint 051 is a design and documentation sprint. A completed sprint does not mean any V0.9 language feature has been implemented or verified.

## Dependencies and Entry Gate

- Sprint 051 has no sprint dependency. V0.8 work is complete; it does not authorize V0.9 implementation or alter the approved V0.9 scope.
- The approved authority is `docs/language-spec-v0.9.md`, with sequencing and technical gates in `planning/plan-openamxV09MasterSprintPlan.md`. The source ideas are in `planning/ideas/amx-language-features.md`.
- Scope and compatibility choices in the V0.9 contract are settled. Sprint 051 may resolve implementation contracts but must not weaken or silently reopen those choices.
- Record any genuinely scope-changing question in `planning/questions.md` and obtain Lead Developer direction before treating it as resolved.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, especially the approved scope, current-codebase evidence, Sprint 051, and its technical contract gate
- `docs/language-spec-v0.9.md` and `planning/ideas/amx-language-features.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- AST, expression/statement/document parsers, formatter, type checker and its call sites, diagnostics, runtime, module loader, standard library, input/output, schema inspection, report preparation/renderers, shared editor analysis, VS Code providers/grammar, desktop editor/worker/RPC, tests, examples, libraries, language docs, and bundled help
- Existing V0.1-V0.8 valid examples/tests and intentionally invalid or rejection cases

## In Scope

- Define and record exact expression grammar/precedence and positive/negative examples for unit attachment, conversion with `in`, indexing, unary operators, and powers. Include interactions with existing loop `in` syntax, parentheses, and valid postfix/field chaining. Preserve existing operator precedence/associativity except where an explicitly approved V0.9 change requires otherwise.
- Specify externally observable dimension/unit semantics: stable qualified base-dimension identity through imports/re-exports, structural derived-dimension equivalence, scale validity and conversion, cancellation, and deterministic canonical spelling/serialization of compound units. Do not require a particular internal runtime representation without a demonstrated need.
- Propose and finalize a finite optional SI library inventory: exported dimension, unit, and alias names; scale relationships; derived units; and relative-import examples. Make explicit what is not included. No global names, implicit aliases, package resolver, offset units, or promise of every SI prefix/derived unit.
- Specify exact `sum`, `mean`, `min`, `max`, `abs`, `round`, `sqrt`, and `pow` behavior for relevant measurement cases, including empty typed measurement sums and existing empty `min`/`max`/`mean` errors.
- Specify all-null/empty table and chart presentation using existing view policies. Do not invent or fabricate a unit when no measurement value exists.
- Bound static validation to values provable without arbitrary program execution. State which safe constant forms may be checked statically and require runtime validation for dynamic list lengths/values.
- Allocate stable diagnostic codes and define required message/category and source/data location behavior for parser, checker, runtime, external-data, and editor diagnostics. Follow repository conventions and keep client presentations consistent.
- Audit feature-relevant AST and consumer paths, static-check entry points, module identity/import immutability, runtime snapshots, input/output serialization, reporting, formatter, and both editor pipelines. Record ownership and dependency handoff for Sprints 052-058.
- Establish exact positive/negative examples, expected values/types/data shapes/diagnostics, and migration acceptance cases. Cover LF/CRLF and malformed/incomplete editing states where relevant.
- Update the four Sprint 051 artifacts and planning status/decision/question records to capture the completed design work and any explicitly unresolved items.

## Out of Scope

- Implementing or prototyping parser, AST, checker, runtime, formatter, data, report, or editor changes.
- Migrating production examples/tests or changing existing behavior during this design sprint.
- Completing feature implementation, integrated V0.9 acceptance, native packaging, release work, or unrelated UI/product work.
- Reopening approved requirements: strict checking of every document/module/path; `=` record constructor fields; agreed string escape/interpolation rules; 1-based list rules and safe shared mutation; explicit unit imports; linear/scaled measurements; JSON/CSV shapes; editor parity; and stated exclusions.
- Claiming any proposed contract, fixture, build, or behavior is implemented or verified.

## Constraints

- Keep confirmed compatibility exceptions explicit: constructor `:` is rejected while type annotations retain `:`; string escapes intentionally change prior mostly literal backslash behavior; previously unchecked invalid programs must fail strict checking.
- Preserve pure-function rules, immutable imports (including nested aliases), loop snapshot behavior, executable-fence boundaries, final-environment narrative interpolation, show-time snapshots, and atomic export behavior.
- Do not permit arbitrary juxtaposition as multiplication, arbitrary AMX execution in external unit strings, or a static checker that executes programs to predict dynamic values.
- Measurements retain dimension and unit meaning across values, functions, records, lists, nullable types, input/output, tables/charts, narrative, and HTML/PDF/DOCX. No path may silently discard units.
- Keep optional SI declarations project-local and explicitly imported. Base-dimension identity is declaration/module identity, not a matching unqualified name.
- No implementation sprint may start before the Sprint 051 contract gate has been reviewed and approved.

## Required Reviewable Output

The Builder contract proposal, exact conformance and migration matrix, diagnostic catalog, and current-owner/test-seam audit are recorded in the **Builder Contract Proposal** appendix of `blueprint.md`. The Lead Developer approved its implementation-level choices on 2026-10-06. Those decisions are subordinate to the approved V0.9 contract and master plan. The technical contract gate is closed; subsequent implementation remains constrained by the master plan's dependencies and sprint scopes.
