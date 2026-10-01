# Sprint 034 Handoff Prompt

You are the Builder for OpenAMX Sprint 034.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`
- Sprint 029-033 requirements, acceptance criteria and recorded outcomes
- `planning/sprints/0034-v05-cli-docs-examples-acceptance-release-record/requirements.md`
- `planning/sprints/0034-v05-cli-docs-examples-acceptance-release-record/blueprint.md`
- `planning/sprints/0034-v05-cli-docs-examples-acceptance-release-record/acceptance.md`
- `README.md`, `package.json`, `src/cli.ts`, `desktop-app/README.md`, `vscode-extension/README.md`, examples and current acceptance tests

## Task Contract

**objective**: Deliver the auditable V0.5 onboarding/docs/examples/automated acceptance record and Lead Developer visual-review evidence, then record truthful feature and release-engineering dispositions.

**owns**: V0.5 examples/temporary review fixtures, focused acceptance tests, verified documentation/version alignment, command/artifact evidence, visual-review orchestration/recording and final planning disposition.

**must_not**: Invent product behavior, weaken existing no-write/authority/privacy/compatibility rules, silently fix/waive earlier sprint exceptions, publish a VSIX, select/add a license, claim native platform/Hutch/Office success without direct evidence, or replace automated tests with visual review.

**decision gates**: Obtain Lead Developer determinations for the Sprint 033 code-action apply-time limitation and for every blocked visual/product acceptance item. If evidence is unavailable, record `Blocked` or an explicit approved exception with owner/date. Do not report V0.5 fully feature accepted or release ready by default.

**acceptance**: Meet every item in `planning/sprints/0034-v05-cli-docs-examples-acceptance-release-record/acceptance.md`. A final status may be `Approved with recorded exceptions` only when the signed visual decision and all exception owners/remediation are recorded; otherwise leave the relevant disposition OPEN/BLOCKED.

**verification**:

1. Build temporary F0-F6 fixture projects and a focused production-path test first; assert identity/source/order/no-write behavior before broad documentation changes. Capture hashes and avoid committing private/generated review content.
2. Run root build/tests, focused CLI/report/example checks, desktop direct checks, extension compile/host/package/install/installed-host checks where supported, then `git diff --check`. Record commands, counts, artifacts, warnings and unavailable checks exactly.
3. Execute the Lead Developer visual checklist against actual HTML/PDF/DOCX/desktop artifacts in named viewers/hosts. A browser shim, WSL2 direct build or OOXML structure inspection does not substitute for an unavailable required visual/native observation.
4. Update docs only with verified behavior and planning records with the signed feature, visual and release-engineering dispositions. Preserve all remaining residuals visibly for their owner; do not close an item by omission.
