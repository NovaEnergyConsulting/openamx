# Sprint 054 Handoff Prompt

You are the Builder for OpenAMX Sprint 054.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 list semantics, conformance matrix, diagnostics, static/runtime boundary, and cross-surface audit in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 053 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition for residual context only; Sprint 053 is not a dependency
- Sprint 054 `requirements.md`, `blueprint.md`, and `acceptance.md`
- AST/parser/checker/runtime/environment/module import safety/formatter/diagnostics/editor code and relevant list, alias, loop, pure-function, and view-snapshot tests

## Entry Gate

Sprint 052 is **ACCEPTED WITH RECORDED RESIDUALS**. Its Windows VS Code Development Host suite remains unpassed (14 pass, 5 fail). Sprint 053 is **ACCEPTED** for closure, but its Windows host rerun is also unpassed (13 pass, 6 fail). Sprint 054 depends on Sprint 052 only; these residuals are not passes and are not list-semantic blockers unless a concrete failure affects this sprint.

## Objective

Implement 1-based list reads and statement-form `add`/`remove` with statically known element types, safe dynamic validation, atomic mutations, alias/import correctness, loop snapshots, view isolation, and focused editor support.

## Task Contract

**owns**: List index AST/parser/checking/runtime; statement-form `add`/`remove`; 1-based validation; atomicity; local alias visibility; imported/nested alias protection; loop iteration over original-item snapshots; emitted-view snapshot regression; relevant formatter/editor diagnostics and tests.

**must_not**: Add indexed assignment/replacement, slicing, new loop syntax, or list-returning mutation expressions; weaken pure functions or import immutability; execute code to predict dynamic bounds; implement units/measurements or broad Sprint 058 parity; represent Sprints 052/053 Windows host suites as passing.

**decision gates**: Follow the approved rules exactly: no-`at` removal validates a positive integer but removes only one final item; `at` removal removes the count-sized interval; insertion uses 1-based positions and accepts `length + 1`; validate fully before mutation. Use `AMX3009` for statically provable bounds and `AMX1008` for dynamic faults/immutable mutation. Raise any contract ambiguity in `planning/questions.md` before changing semantics.

**acceptance**: Meet every criterion in `planning/sprints/0054-v09-one-based-list-access-safe-mutation/acceptance.md`.

## Verification

1. Test 1-based and computed reads, element typing, valid chaining, and all invalid read boundaries.
2. Test append/insert/removal semantics including exact no-`at` count behavior, empty list, invalid intervals/types, and full failure atomicity.
3. Test shared local alias visibility and direct/nested/aliased imported immutability.
4. Test mutation during statement-form loops visits the original list snapshot exactly once and preserves order.
5. Test emitted view/report snapshots remain unchanged after subsequent list mutation.
6. Verify pure-function constraints, source locations, formatter behavior, and affected editor/desktop paths.
7. Run focused suites, root build/tests, affected desktop/extension checks, and `git diff --check`; record exact results and residuals, including Windows host failures if they persist.
8. Update Builder evidence and planning records, then request a separate Lead Developer disposition. Do not self-accept or claim unrelated V0.9 features.
