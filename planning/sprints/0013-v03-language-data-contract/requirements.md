# Sprint 013 Requirements: V0.3 Language and Data Contract

## Goal

Define the authoritative, implementable V0.3 language and data contract before parser, runtime, CLI, data, or extension work begins. Preserve V0.2 documents and existing no-option `run` and `render` behavior when V0.3 features are unused.

## Inputs

- Approved V0.3 master plan: `planning/plan-openamxV03MasterSprintPlan.md`
- V0.2 compatibility baseline: `docs/language-spec-v0.2.md`, `README.md`, `src/cli.ts`, and current tests
- Sprint template: `planning/sprints/0000-sprint-template/`
- Builder workflow and active project record: `.agents/main.md`, `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## In Scope

- Create `docs/language-spec-v0.3.md` as the authoritative V0.3 contract; retain V0.2 as a historical contract.
- Specify data-only records, type annotations, construction/access, nullable and optional fields, defaults, lists, nested records, and date/time values.
- Define the V0.3 opt-in/checking boundary and static checking for every V0.2 expression/statement plus new records, functions, modules, exports, and inputs.
- Specify pure functions, local module path containment, explicit exports, module isolation/evaluation, name visibility, and deterministic cycle handling.
- Specify entry-only logical inputs, repeated CLI `--input name=path` mappings, exact JSON/CSV conversion, runtime validation, and deterministic aggregate/fail-fast ordering.
- Specify repeated CLI `--output name=path` mappings, supported JSON/CSV shapes, wire formats, and output diagnostics.
- Specify the six opt-in Asset Management record shapes as initial structural contracts only, not approved domain rules or calculations.
- Customize the four sprint artifacts and update planning state, decisions, and questions.

## Out of Scope

- TypeScript implementation, tests, examples, generated artifacts, dependencies, or extension changes.
- Charts, units/currency, inheritance, methods, computed fields, remote packages, broad multi-document workflows, Word/PDF output, and Marketplace publication.

## Constraints

- V0.3 is additive to V0.2; V0.1 bare declarations remain non-executable narrative.
- The core remains general-purpose; Asset Management definitions are opt-in local module content.
- Filesystem paths stay at the CLI boundary. AMX source cannot access arbitrary files.
- Resolve blocking grammar and semantic choices in this sprint; do not defer them to Builders.
- Do not modify implementation, test, example, extension, dependency, generated HTML, or V0.2 specification files.
- Do not implement or scaffold V0.3 behavior; no license or Marketplace decision is in scope.
- Record the Asset Management domain-review ambiguity before revising the contract; mark the initial schemas provisional until domain review.
