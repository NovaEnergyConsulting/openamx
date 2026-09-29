# Sprint 021 Handoff Prompt

You are the Builder for OpenAMX Sprint 021.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.4.md` and `docs/language-spec-v0.3.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`
- `planning/sprints/0021-visualization-constructs-parser-conformance/requirements.md`
- `planning/sprints/0021-visualization-constructs-parser-conformance/blueprint.md`
- `planning/sprints/0021-visualization-constructs-parser-conformance/acceptance.md`

## Preflight

Sprint 020 is currently OPEN in `planning/state.md`: the typed native Bun RPC proof passed, but Hutch package prepare/build/dev and persistent WSL window verification remain unresolved. Confirm that the Lead Developer has recorded Sprint 020 acceptance or an explicit disposition of this residual before implementing production Sprint 021 code. If not, stop at this gate and present the recorded options; do not claim the desktop must-have was removed or silently treat Sprint 020 as accepted.

## Task Contract

**objective**: Implement V0.4 table/chart declarations and show semantics through AST, parser, static checker, evaluator, and diagnostics; repair direct record constructors in `match` arms.

**owns**: The exact files and narrow boundaries in the Sprint 021 blueprint, focused parser/checker/runtime tests, and planning logs with actual verification results.

**must_not**: Add interactive or static HTML visuals, change the VS Code providers, implement PDF or desktop workflows, weaken V0.3 module/input/output rules, or claim unverified Sprint 020 platform results. Do not invent missing grammar or data rules; raise a contract question first.

**acceptance**: Meet every item in `planning/sprints/0021-visualization-constructs-parser-conformance/acceptance.md` with positive and negative tests. Preserve V0.2/V0.3 paths and hand Sprint 022 a deterministic, typed, ordered emission model, not generated markup.

**verification**:

1. After the first substantive edit, run a focused parser or checker test for one typed table/show example; repair that slice before expanding to charts.
2. Run focused match-arm parser and checker regression tests, then table/chart checker and runtime snapshot/label-length tests with precise diagnostics and no-write assertions.
3. Verify the existing module/input/output examples and V0.2/V0.3 behavior with relevant tests. Run root `bun run build`, `bun test`, and `git diff --check`.
4. Record commands, results, approved deviations, and the Sprint 022 boundary in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Do not mark Sprint 021 complete if a required gate is unverified.
