# Sprint 072 Requirements: V0.12 Language Contract and Acceptance Fixtures

## Goal

Translate the confirmed V0.12 language semantics into a reviewable grammar-example set, diagnostic matrix, and requirement-to-test fixture map before feature implementation begins in Sprints 073-075. The artifacts must make the accepted behavior, rejected behavior, source locations, module rules, formatter expectations, and `if` return-path requirements testable without changing production behavior.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md` (scope and behavior authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/sprints/0000-sprint-template/`
- `.agents/main.md`
- Existing V0.3 language specification and parser, type-checker, runtime, module, formatter, and test conventions, consulted only to preserve established behavior

## In Scope

- Produce a canonical set of valid and invalid grammar examples for record inheritance, enumerations, and braced `if` expressions/statements.
- Produce a diagnostic matrix for rejected forms, including diagnostic identity and exact source ranges using the repository's source-location convention.
- Produce a requirement-to-test fixture map that traces every applicable V0.12 master-plan requirement to example/fixture IDs, expected results, and the existing or intended test suites for Sprints 073-077.
- Lock examples and expectations for source-order visibility, imports/exports, formatting, construction/type-checking behavior, and `if` branch return and scope rules.
- Record any genuine ambiguity or proposed contract change as a question for a Lead Developer decision; do not resolve it by silently weakening or extending the approved plan.

## Out of Scope

- Production changes to the parser, AST, type checker, runtime, formatter, modules, editor clients, or documentation.
- Executable feature tests that fail against the pre-feature implementation. The Sprint 072 fixture map may specify later tests and provide inert source examples; feature tests are implemented with Sprints 073-075.
- Publishing the V0.12 language specification or updating examples/editor help; this is Sprint 076 scope.
- New test infrastructure, unrelated language features, release engineering, or release/publication authorization.

## Constraints

- The V0.12 master plan is the confirmed scope authority. Sprint 072 may make the contract more precise but may not change its semantics.
- Preserve all existing behavior, especially the legacy single-line conditional expression and established source-order/module rules.
- Source positions are 1-based positions in the original document, including front matter and fence delimiters; columns count UTF-16 code units, as recorded in the existing language decisions.
- Use existing diagnostic conventions. Pin exact codes/messages only when they are supported by the existing diagnostic catalog or an explicit decision; otherwise record the issue for disposition rather than inventing a contract.
- The Sprint 072 pack and its handoff do not authorize production feature implementation or release.
