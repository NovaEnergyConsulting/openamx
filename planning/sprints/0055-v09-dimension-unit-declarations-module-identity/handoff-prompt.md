# Sprint 055 Handoff Prompt

You are the Builder for OpenAMX Sprint 055.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 dimension/unit identity and canonicalization contract, complete SI inventory, diagnostic catalog, static/runtime boundary, and cross-surface audit in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 055 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Module loader/canonical path logic, parser/AST, checker, export/import system, input/output schema-inspection paths, editor module analysis, and related tests/libraries

## Entry Gate

Sprint 055 depends on Sprint 052, which is **ACCEPTED WITH RECORDED RESIDUALS**. Sprint 053 is accepted and Sprint 054 is **COMPLETE / APPROVED**; neither is a dependency. The Sprint 053 Windows VS Code host run was 13 pass/6 fail (five `EBUSY` cleanup failures and one drive-letter case assertion). Sprint 054's Windows desktop RPC test failed on path slash direction; its VS Code host run was 15 pass/5 fail (four `EBUSY` cleanup failures and one drive-letter case assertion). These are unpassed residuals, not passing results or blockers absent a demonstrated Sprint 055 issue.

## Objective

Implement module-level dimension/unit declarations, normalized vectors and stable module identity, explicit imports/exports, the exact approved project-local SI library, and metadata registry construction suitable for later schema inspection without executing source statements or evaluating modules twice.

## Task Contract

**owns**: Dimension/unit declaration AST/parser/checker; normalized base identity/vector/unit scale metadata; declaration source order/scope/collision rules; explicit export/import/re-export; SI library; registry lifecycle and tests; declaration diagnostics/source locations.

**must_not**: Implement measurement values, attachment, arithmetic/conversion or measurement text (Sprint 056); external unit data, measurement JSON/CSV, tables/charts/reports (Sprint 057); implicit global units/aliases, package resolution, offset/imperial units, arbitrary SI prefixes, or broad Sprint 058 editor/docs scope; evaluate modules twice or execute AMX statements to populate registries.

**decision gates**: Use the exact Sprint 051 approved identity and SI contract. Base identity is canonical module identity plus declaration name; structural vector equality uses those identities. Require one independent base unit, explicit imports, source-ordered declarations, and finite positive scales. Use `AMX3006` for declaration syntax and `AMX3008` for declaration/name/scale semantics as specified. Ask for Lead Developer direction for any contract conflict before changing it.

**acceptance**: Meet every criterion in `planning/sprints/0055-v09-dimension-unit-declarations-module-identity/acceptance.md`.

## Verification

1. Test parser/typechecker behavior for every declaration form, invalid scope, forward/unknown/collision cases, finite scale constraints, and approved diagnostics/source ranges.
2. Test canonical module identity across imports/re-exports/alternate resolved paths and non-equivalence of independent same-name dimensions.
3. Test normalized structural vectors and exact unit scale/explicit relationship behavior.
4. Add the exact approved inventory in `libraries/si.amx`; automatically verify every name/count/definition/alias/export and excluded implicit names.
5. Prove the metadata registry is available before schema inspection without executing source statements or duplicate module evaluation.
6. Verify existing containment, strict checking, and accepted Sprints 052/054 behavior. Run focused and applicable root/desktop/extension checks and `git diff --check`, recording exact outcomes and host residuals.
7. Add Builder evidence and update planning records, then request a separate Lead Developer disposition. Do not self-accept or claim measurement/data/report functionality.
