# 009 Requirements: Match Expressions

## Goal

Implement `match` as a braced value expression in the V0.2 hand-written parser and evaluator. Match supports numeric, string, and boolean literal cases, exactly one fallback `default`, and first-match source-order selection using strict primitive equality. It must compose with the expression, range, loop, and environment behavior completed in Sprint 008.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md`, Sprint 009.
- Authoritative language contract: `docs/language-spec-v0.2.md`.
- Completed Sprint 007 parser/AST and Sprint 008 expression/runtime surfaces.
- Sprint completion and implementation outcomes in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- Current AST, expression parser, evaluator, diagnostics, and parser/evaluator test suites.

## In Scope

- Parse `match expression { ... }` as a V0.2 expression, usable in `let` bindings and anywhere a normal expression is accepted. A match may appear in a branch expression or another match arm expression as allowed by the ordinary expression grammar.
- Parse arms as one logical line each: `case <number|string|boolean literal> => <expression>` or `default => <expression>`. The scrutinee is a full expression and may be a compound arithmetic, comparison, or logical expression.
- Require exactly one `default` arm. Zero or more `case` arms are allowed, so a default-only match is valid. The default arm may appear before, between, or after case arms.
- Restrict case patterns to numeric, string, and boolean literals; allow an optional unary minus on numeric literals. Identifiers, ranges, lists, expressions, guards, and destructuring are not valid patterns.
- Preserve case-arm source order. Evaluate the scrutinee once, then evaluate case literals/compare them in source order; evaluate only the expression for the first matching case, or the default expression if none matches. Duplicate literal case values are legal; the first matching case wins.
- Compare primitive values by strict type-and-value equality with no coercion (`1` does not match `"1"`; `true` does not match `1`). Do not evaluate non-selected branch expressions.
- Extend the AST only as needed; preserve the existing `MatchExpressionNode` / `MatchCaseNode` public shape where suitable, retaining document-relative 1-based UTF-16 locations on the match, each case/default arm, and expressions.
- Add parser/evaluator tests for all literal kinds, negative/decimal numbers, default placement/cardinality, zero-case default-only match, source-order and duplicate-case selection, strict typing, short-circuit branch evaluation, compound scrutinees, nesting/composition, source locations, and malformed arms.
- Update `docs/language-spec-v0.2.md` to capture the settled details above and update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with Sprint 009 outcomes/status.

## Out of Scope

- Guards, wildcard or identifier patterns, destructuring, ranges/lists as patterns, fallthrough, multiple/default-priority rules beyond exactly one fallback, or match statements.
- Runtime document orchestration across executable blocks, shared document evaluation, inline interpolation against final state, rendering/formatting executable fences; those belong to Sprint 010.
- Changing the V0.1 operator precedence or equality semantics.
- Renderer/CLI/extension changes, Asset Management domain behavior, or V0.3 candidates.

## Constraints

- Keep TypeScript/Bun, the existing hand-written parser, and dependencies unchanged.
- Match expressions are expressions, not statements; do not change statement grammar except where existing expression positions must accept match.
- Statement and arm separators remain newline-only; semicolons are invalid as separators. A braced match can span lines, but each arm occupies one logical line.
- Enforce exactly one default at parse time with a clear source-located error. Invalid match syntax, non-literal case patterns, missing arrows/expressions, and missing/duplicate defaults must report useful source positions.
- Preserve current V0.2 fences, source locations, mutation, range, and loop behavior. Keep the core general-purpose.
- Do not add renderer integration merely to demonstrate inline support; prove that match parses/evaluates in general expression positions, leaving the existing interpolation/render path integration to Sprint 010.
- Run focused parser/evaluator tests after the first implementation change, then `bun run build` and the full `bun test` suite.
