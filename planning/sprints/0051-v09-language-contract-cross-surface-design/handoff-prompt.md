# Sprint 051 Handoff Prompt

You are the Builder for OpenAMX Sprint 051.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md`
- `docs/language-spec-v0.9.md` and `planning/ideas/amx-language-features.md`
- Sprint 051 `requirements.md`, `blueprint.md`, and `acceptance.md`
- The current AST, parser, type checker and all checking call sites, diagnostics, runtime/module system, formatter, data/schema, reporting, and both editor pipelines identified by the master plan
- Representative current tests, examples, libraries, language documentation, and desktop bundled help

## Objective

Deliver the exact, reviewable V0.9 implementation contracts, conformance examples, compatibility/migration matrix, cross-surface audit, and implementation-sprint handoff required by the Sprint 051 acceptance criteria.

The Builder contract proposal and cross-surface audit belong in the **Builder Contract Proposal** appendix of `blueprint.md`. At handoff, implementation details not directly specified by the approved V0.9 contract were pending review; the later approval disposition below resolves that review gate.

## Lead Developer Disposition (2026-10-06)

The Lead Developer explicitly approved the Builder Contract Proposal in `blueprint.md`. The Sprint 051 technical contract gate is closed. This disposition supersedes the prompt's pending-review status; it does not start implementation or authorize work outside the master plan's dependencies and assigned sprint scopes.

## Scope and Guardrails

- Work only on Sprint 051 design/documentation outputs and the planning status, decision, and question records listed in the blueprint.
- Treat the approved V0.9 language contract as authoritative. Do not invent or silently change business behavior. If a needed decision changes approved scope, record it in `planning/questions.md` and stop that decision for Lead Developer direction.
- Resolve all technical contract gates with exact tables/examples: grammar and precedence; qualified dimension identity and canonical unit behavior; a finite exact SI inventory; aggregate and empty/null view cases; safe static-check bounds; diagnostic codes/locations; cross-surface ownership; and migration acceptance.
- Distinguish accepted rules from proposals and pending review. Do not claim a proposal or the Sprint 051 contract gate is approved until the Lead Developer has reviewed it.
- Audit paths to identify work and test seams only. Do not implement or prototype features, alter production examples/tests, migrate fixtures, update user-facing language docs, or refactor code.
- Preserve strict checking, approved record/string compatibility changes, list mutation/import/snapshot rules, pure functions, module semantics, report behavior, and executable-fence boundaries.
- Do not start Sprint 052-058 implementation. A pending technical gate is a blocker, not permission to guess.

## Completion

Meet every criterion in `acceptance.md`. Record exact outputs and remaining decisions in the durable planning files. Do not report code changes, test passes, builds, or implemented V0.9 behavior unless they were actually performed in scope; implementation work is out of scope for this sprint.
