# Sprint 056 Handoff Prompt

You are the Builder for OpenAMX Sprint 056.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 measurement precedence, dimension/unit canonicalization, aggregate/display, static/runtime, diagnostic, and conformance contracts in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 055 requirements, blueprint, acceptance, Builder evidence, `libraries/si.amx`, registry interfaces, and Lead Developer disposition
- Sprint 053 requirements, acceptance, Builder evidence, and implementation (measurement-to-string was explicitly deferred here)
- Sprint 056 `requirements.md`, `blueprint.md`, and `acceptance.md`
- AST/parser/checker/runtime/evaluator/stdlib/type/registry/interpolation code and relevant focused tests

## Entry Gate

Sprint 055 is **COMPLETE / APPROVED** by Lead Developer disposition dated 2026-10-06. Its dimension/unit metadata, explicit imports/exports/re-exports, SI inventory, and metadata-only registry are the required Sprint 056 foundation. The Windows Extension Development Host suite had 15 pass/5 fail and remains unpassed (four `EBUSY` cleanup failures and one drive-letter casing assertion); do not describe it as green.

## Objective

Implement measurement attachment, typing, arithmetic/comparison, powers/roots, conversions, aggregates/math functions, metadata preservation, display text, and Sprint 053 interpolation integration exactly as approved.

## Task Contract

**owns**: Measurement runtime representation; expression grammar and typing; arithmetic/scales/vectors; conversion; dimensional functions/aggregates; scalar display; data-independent metadata preservation through functions/records/lists/nullables/assignments; measurement interpolation; diagnostics and focused feature tests.

**must_not**: Redefine Sprint 055 identities, scales, SI inventory, or registry; add offset/imperial/arbitrary units; erase dimensions; permit Number addition/subtraction/comparison with measurements; treat arbitrary juxtaposition as multiplication; serialize external data or implement measurement tables/charts/reports; undertake broad Sprint 058 parity; claim the Sprint 055 Windows host suite passed.

**decision gates**: Implement the exact Sprint 051 precedence, operations, canonicalization, display-unit, aggregate, empty-sum and diagnostic behavior. Reuse Sprint 055 metadata. Use approved diagnostics `AMX3007`, `AMX3008`, `AMX3010`, and `AMX1009` as applicable. If behavior conflicts with an approved contract, record the minimal reproducible case in `planning/questions.md` and obtain Lead Developer direction before changing semantics.

**acceptance**: Meet every criterion in `planning/sprints/0056-v09-measurement-expressions-arithmetic-conversion/acceptance.md`.

## Verification

1. Test approved attachment/conversion grammar and exact Sprint 051 precedence outcomes.
2. Test vector compatibility, physical/display value conversions, all arithmetic scale formulas, dimension cancellation, powers/roots, and rejected operations.
3. Test aggregate/math edge rules, including typed empty sum and existing empty errors.
4. Test metadata preservation through assignments, functions, records/defaults, lists, and nullable types.
5. Integrate Sprint 053 interpolation with exact measurement display text; preserve prior scalar and narrative behavior.
6. Test static/dynamic domain failures, approved diagnostic codes, and original-source locations.
7. Run focused tests, root build/tests, affected desktop/extension checks and relevant regressions; record exact results including any Windows host residuals. Run `git diff --check`.
8. Record implementation/evidence and planning updates; request a separate Lead Developer disposition. Do not implement Sprint 057/058 work or self-accept.
