# Sprint 052 Requirements: Strict Static Checking, Multiline Records, and Migration

## Goal

Implement the first V0.9 language slice: enforce static checking for every document/module and supported analysis/execution path; parse and format multiline record constructors and nested expressions using canonical `field = value` syntax; and migrate repository-owned positive fixtures that rely on invalid syntax or type usage while retaining rejection coverage.

This sprint implements strict checking and record syntax only. Completing Sprint 052 does not imply that string interpolation/escapes, indexed list operations, measurements, or the rest of V0.9 are implemented.

## Dependencies and Entry Gate

- Sprint 052 depends on Sprint 051. The Sprint 051 technical contract gate is **CLOSED / APPROVED** by Lead Developer disposition dated 2026-10-06.
- Read the approved Builder Contract Proposal and cross-surface audit in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`, especially its precedence/conformance rules, diagnostic catalog, migration matrix, and assigned downstream seams.
- `docs/language-spec-v0.9.md` and `planning/plan-openamxV09MasterSprintPlan.md` remain authoritative. If an implementation discovery appears to require changing approved behavior, record the issue in `planning/questions.md` and obtain Lead Developer direction; do not silently change the contract.
- The sprint may migrate relevant positive fixtures as part of implementation. Preserve unrelated/uncommitted work and inspect the worktree before editing.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 052 and the V0.9 strict-checking/record scope
- `docs/language-spec-v0.9.md`, especially scope/compatibility and record rules
- `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`, approved contract appendix, conformance/migration matrix, diagnostics, and checker/parser/formatter audit
- Sprint 052 `requirements.md`, `blueprint.md`, `acceptance.md`, and `handoff-prompt.md`
- `src/ast/types.ts`, `src/parser/parseExpression.ts`, `parseStatements.ts`, `parseFor.ts`, `parseDocument.ts`, `src/formatter/formatAmx.ts`
- `src/typechecker/checkDocument.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts`, `src/cli.ts`, `src/editor/moduleAnalysis.ts`, `src/editor/completion.ts`, `desktop-app/src/bun/desktopService.ts`, and every other production call site that can gate checking
- `src/diagnostics/errors.ts` and parser/checker diagnostic wrappers
- Relevant parser, formatter, evaluator, module, editor, CLI, desktop worker/service, example, and migration tests; positive/negative AMX fixtures and repository examples

## In Scope

- Remove conditional-checking exemptions from document/module evaluation and analysis paths. Statically check all documents, including unannotated documents, imported modules, CLI and direct/non-file-backed execution, editor analysis/completion, and desktop worker/service analysis, before evaluation or other document execution.
- Preserve type inference for valid unannotated programs. Ensure invalid typed operations fail before their document can execute; do not make checking dependent on annotations, file-backed input, UI mode, or a caller flag.
- Audit every production checker entry point and `checkingActivated` gate. Remove or neutralize obsolete opt-in behavior consistently. Identify any feasibility-only/non-product checker caller and ensure it cannot be used to bypass checking in a supported product path.
- Implement multiline record constructor parsing with `field = value`, required commas between fields, optional trailing comma, line breaks between tokens, and correct nesting with existing list literals and parenthesized expressions. Handle nested records and strings without confusing braces/indentation inside strings for record delimiters.
- Keep type declaration fields and variable/parameter/return annotations on `:`. Preserve field access and existing required/optional/default field behavior, duplicate-field checks, unknown-field checks, and field value type checking.
- Reject old constructor `field: value` syntax as invalid syntax with approved code `AMX3006`; do not issue a deprecation warning, silently accept it, repair it in the formatter, or add a migration action.
- Preserve the approved Sprint 051 precedence/associativity behavior and loop-header `in` parsing. Do not introduce Sprint 053 string decoding/interpolation, Sprint 054 list indexing/mutation, or dimension/unit semantics.
- Migrate repository-owned positive examples/tests that fail because strict checking now runs or because record constructors use the old delimiter. Keep and strengthen negative tests so invalid programs remain rejected for the right reason.
- Update focused parser/formatter/checker/evaluator/module/editor/desktop tests for record syntax, strict-checking coverage, source locations, and compatibility.
- Validate formatter idempotence and meaning preservation for valid record syntax; invalid constructor syntax must fail formatting rather than being normalized.
- Record exact implementation changes, commands/results, migration scope, remaining incompatibilities, and evidence in a Sprint 052 Builder evidence record and planning state/decision/question records, following established sprint conventions.

## Out of Scope

- String escape decoding or expression interpolation; Sprint 053 owns these changes. Record parsing must handle existing string tokens robustly but must not implement the future string contract.
- List indexing, `add`/`remove`, shared mutation, or loop snapshot changes; Sprint 054 owns these.
- Dimension/unit declarations, measurements, SI library, unit arithmetic, JSON/CSV measurement support, or report/chart measurement behavior; Sprints 055-057 own these.
- Completing editor parity for all V0.9 features, broad UI redesign, or unrelated documentation/help updates; Sprint 058 owns integrated parity and documentation.
- Weakening the checker, deleting failing negative tests, skipping modules, checking only annotated code, running invalid programs before reporting type errors, or automatically rewriting rejected record syntax.
- Unrelated refactors, behavior changes, fixture migrations, UI features, or changes to report identity, pure functions, module containment, immutable imports, narrative interpolation, show-time snapshots, or export atomicity.

## Constraints

- Run checking before evaluation for each document/module and through every supported caller. Avoid duplicate module evaluation or changing the module graph/evaluation ordering merely to install checking.
- Keep inferred types for valid unannotated code. Strictness is rejection of invalid programs, not a requirement to add annotations everywhere.
- Constructor syntax is exclusively `field = value`; annotations/declarations continue to use colons. Require commas between fields; permit a trailing comma.
- Invalid old record constructors report `AMX3006` at the original source token/insertion point. Static type/operator failures use the approved `AMX3007` allocation where applicable; preserve existing diagnostic meanings.
- LF and CRLF inputs must produce equivalent AST/diagnostic outcomes with locations measured in the original source.
- Preserve executable-fence/inert-content boundaries and prevent multiline collection from consuming unrelated following statements or narrative.
- Formatting accepts valid syntax, preserves meaning, and is idempotent. Formatting invalid syntax must return an explicit failure, not success-shaped output.
- Preserve unrelated user changes and avoid reverting or broad fixture rewrites.
