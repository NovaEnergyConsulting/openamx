# Sprint 028 Handoff Prompt

You are the Builder for OpenAMX Sprint 028. This is contract work only.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/requirements.md`
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/blueprint.md`
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/acceptance.md`
- `docs/language-spec-v0.2.md`, `docs/language-spec-v0.3.md`, `docs/language-spec-v0.4.md`
- Existing project config, report adapters, desktop typed RPC/workflow, VS Code providers, and representative examples only as needed to specify the contract accurately.

## Task Contract

**objective**: Produce a precise, additive V0.5 product/UX/report identity/compatibility contract and a Lead Developer visual-review checklist with representative fixture manifest. Present them for explicit approval before implementation sprints proceed.

**owns**: The authoritative V0.5 contract (or explicitly linked alternative), visual-review checklist/fixture definitions, and planning state/decision/question updates.

**must_not**: Implement production desktop/editor/renderer/export/extension/CLI behavior; rewrite historical V0.2-V0.4 specs; change visible-source defaults without explicit approval/migration; grant the webview new authority; add network assets or private paths to shared config; imply V0.4 native platform, Hutch, Office, or license/Marketplace residuals are closed.

**acceptance**: Satisfy every item in `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/acceptance.md`. Resolve rules with concrete examples and deterministic diagnostics/fallbacks. If a policy cannot be decided, record the question and mark the dependent implementation blocked, rather than delegating the decision implicitly.

**verification**:

1. Cross-check the existing version-1 input config, source metadata, visible-source behavior, renderer/export order, desktop authority and direct-provider facts against proposed contract rules. Do not infer unverified release capability.
2. Review the contract and checklist against each acceptance item and representative fixture/state; explicitly record choices and any unresolved Lead Developer decisions in planning logs.
3. Run documentation/placeholder consistency checks and `git diff --check`. Record what was checked and request Lead Developer contract/visual-checklist approval. Sprint 029/031/033 implementation starts only after Sprint 028 acceptance; Sprint 030/032/034 retain their own dependencies.
