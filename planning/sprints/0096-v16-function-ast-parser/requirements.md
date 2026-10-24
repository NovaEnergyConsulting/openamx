# Sprint 096 Requirements: V0.16 Function AST and Parser

## Document Status and Entry Gate

Architect-prepared Sprint 096 documentation. Sprint 095 is
`ACCEPTED/CLOSED` on 2026-10-23; its accepted contract is the behavior
authority for this sprint. Sprint 095 explicitly did not authorize Sprint 096
execution. Obtain separate explicit Sprint 096 authorization and approval of
the concrete file-by-file implementation/evidence plan before editing product
source or tests.

This package authorizes planning only. It does not authorize Sprints 097-101,
release, publication, or package/version changes.

## Goal

Extend the function AST and parser to represent and parse both existing
expression-bodied functions and V0.16 braced statement bodies. Preserve the
existing expression-body parse path, parse approved function statements with
accurate source locations and return context, and reject malformed or
prohibited body syntax using the accepted Sprint 095 diagnostics.

Sprint 096 is AST/parser work. It does not implement function-body runtime
execution, return-path/type analysis, list-copy behavior, formatting, editor
support, user documentation, or runnable examples.

## Authority and Inputs

- Scope and sprint dependency:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 096.
- Accepted behavior authority:
  [Sprint 095 function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [control-flow fixtures](../0095-v16-function-body-contract-technical-gate/control-flow-fixtures.md),
  and [diagnostic matrix](../0095-v16-function-body-contract-technical-gate/diagnostic-matrix.md).
- Current parser/AST preservation references: `src/ast/types.ts`,
  `src/parser/parseStatements.ts`, `src/parser/parseIf.ts`,
  `src/parser/parseFor.ts`, `src/parser/stringScanner.ts`,
  `tests/parser.test.ts`, and current diagnostic/source-location helpers.
- Current expression-function, expression-loop, statement-loop, and
  braced-if behavior is a compatibility baseline, not authority to weaken
  the accepted V0.16 contract.

## In Scope

- Extend `FunctionDeclarationNode` with an explicit, typed distinction between
  an expression body and a statement body. Preserve the expression node and
  parsing behavior for existing `=` declarations.
- Parse braced function bodies using existing statement parsers for local
  `let`, assignment, `+=`, standalone if/else, statement-form for, return,
  and named-list add/remove.
- Carry an explicit function-return parse context through statement-form
  nested if/else and for blocks. Do not conflate it with the existing
  expression-form loop return context.
- Record function body opening/closing source locations needed for parse
  errors and the later `AMXF4001` closing-brace anchor. Preserve statement
  and expression locations in original AMX documents.
- Reject prohibited function-body declarations/actions with the accepted
  `AMX3006` message template at the prohibited keyword.
- Reject malformed body statements and unclosed bodies with the exact
  approved `AMX3006` messages and anchors.
- Preserve the accepted prohibition on nested statement loops, `break`,
  `continue`, and expression-form loops inside functions. Preserve expression-
  form loop collection behavior elsewhere. Parsing may still construct the
  existing expression AST; do not move the existing function-placement
  rejection from static checking into the parser as incidental scope change.
- Add parser tests for AST discrimination, both function forms, valid nested
  blocks, strings/braces, prohibited syntax, malformed/unclosed bodies,
  return-context boundaries, and original source locations.
- Make only the type-narrowing adaptations in AST consumers necessary to
  compile and run the parser slice. Do not implement new runtime, static
  checking, formatting, editor, or authoring behavior assigned to later
  sprints.

## Out of Scope

- Evaluating statement-body functions, propagating runtime returns, changing
  function frames, or copying list arguments. These are Sprint 097.
- Checking explicit return types, proving all-path returns, or registering
  `AMXF4001`. These are Sprint 098.
- Formatter, shared editor facts, VS Code grammar/providers, desktop editor
  behavior, documentation, examples, README/help, or release changes.
- Changes to `planning/state.md`, `planning/decisions.md`,
  `planning/questions.md`, `planning/STATUS.json`, historical sprint records,
  or Sprint 095 accepted evidence.
- Recursion, forward references, closures, nested loops, new general-purpose
  syntax, or changes to function visibility/declaration order.

## Constraints and Gates

- Treat the accepted Sprint 095 decisions as locked. Do not reinterpret
  expression-loop returns as function returns, permit nested loops, or change
  any of the exact approved diagnostics.
- Preserve existing AST expression nodes inside expression-bodied function
  declarations. Any outer AST representation change must be explicit and
  discriminated, not inferred from an array check or source-text inspection.
- `allowFunctionReturn` (or equivalent) must be independent from the existing
  expression-loop `allowReturn` mode. Function-return permission propagates
  through statement-form if/else and for bodies only; it must not leak into
  expression-form for loops or braced-if expressions used as expressions.
- The parser must reject semicolons as statement separators. Newlines
  separate statements, as approved in Sprint 095.
- The parser must not consume following top-level statements after a
  function's matching closing brace, and must reject unexpected trailing
  tokens on the closing-brace line rather than silently dropping them.
- Source positions use the existing 1-based line/column conventions. Check
  LF/CRLF and UTF-16 mapping through complete AMX document parsing.
- D-095-13 (defensive runtime-fallthrough diagnostic) remains a Sprint 097
  blocker only. Do not allocate a code or reuse `AMX1007` in Sprint 096.