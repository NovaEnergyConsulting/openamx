# Sprint 052 Handoff Prompt

You are the Builder for OpenAMX Sprint 052.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 contract and cross-surface audit in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 052 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Relevant checker entry points and gates: `src/typechecker/checkDocument.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts`, `src/cli.ts`, `src/editor/moduleAnalysis.ts`, `src/editor/completion.ts`, `desktop-app/src/bun/desktopService.ts`, and every other supported production caller
- `src/ast/types.ts`, parser/document collection code, `src/formatter/formatAmx.ts`, `src/diagnostics/errors.ts`, focused test suites, positive examples, and intentionally negative fixtures

## Entry Gate

Sprint 051 is **CLOSED / APPROVED** by Lead Developer disposition dated 2026-10-06. Its implementation design is approved subordinate to the V0.9 language contract and master sprint plan. Do not reopen or alter approved rules without a new explicit Lead Developer decision.

## Objective

Implement unconditional static checking, canonical multiline record literals, and the narrow fixture migrations required for valid repository-owned content, with focused regression evidence.

## Task Contract

**owns**: Static-check enforcement at all supported document/module execution and analysis paths; multiline record/nested-expression parsing; canonical `=` record constructors; formatter handling; relevant fixture/test migration and acceptance evidence.

**must_not**: Weaken or condition checking; run invalid documents before checking; delete negative tests; repair invalid record syntax silently; alter annotation/declaration colons; implement string interpolation/escapes, list indexing/mutation, units/measurements, or broad editor parity; change unrelated user files or product behavior.

**decision gates**: Preserve valid type inference and approved diagnostic meanings. Reject constructor-colon syntax with `AMX3006`. Keep LF/CRLF source positions accurate. If actual parser/runtime behavior conflicts with the approved contract, document the minimal evidence and ask for a Lead Developer decision rather than inventing semantics.

**acceptance**: Meet every criterion in `planning/sprints/0052-v09-strict-checking-multiline-records-migration/acceptance.md`.

## Verification

1. Audit all production check entry points and demonstrate checking is unconditional for CLI, modules, direct/non-file-backed execution, shared editor analysis/completion, and desktop worker/service paths.
2. Prove a valid unannotated program is inferred and accepted; prove an invalid untyped program and an invalid imported module are rejected before execution.
3. Cover multiline and nested records, nested existing lists/parenthesized expressions, separators/trailing commas, malformed syntax, strings containing delimiters, field validation, and LF/CRLF locations.
4. Verify constructor `:` rejects with `AMX3006`; declaration and annotation colons remain valid; formatter is idempotent on valid forms and refuses invalid syntax.
5. Migrate only affected positive fixtures and preserve negative rejection coverage. Record each migration rationale and the complete changed-file list.
6. Run focused parser/formatter/evaluator/module/editor/CLI and affected desktop tests, relevant root tests and `bun run build`, other relevant integration checks, and `git diff --check`. Record exact commands, totals, failures, and unavailable checks.
7. Add/update Builder evidence and planning state/decisions/questions, then request a separate Lead Developer disposition. Do not self-accept or claim downstream V0.9 features.
