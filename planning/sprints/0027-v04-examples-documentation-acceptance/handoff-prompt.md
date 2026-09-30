# Sprint 027 Handoff Prompt

You are the Builder for OpenAMX Sprint 027.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.4.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/acceptance.md`
- `planning/sprints/0021-visualization-constructs-parser-conformance/acceptance.md`
- `planning/sprints/0022-html-visuals-vscode-authoring-support/acceptance.md`
- `planning/sprints/0023-report-ready-pdf-export/acceptance.md`
- `planning/sprints/0024-desktop-application-foundation/acceptance.md`
- `planning/sprints/0025-desktop-analysis-platform-acceptance/acceptance.md`
- `planning/sprints/0026-editable-docx-export/acceptance.md`
- `planning/sprints/0027-v04-examples-documentation-acceptance/requirements.md`
- `planning/sprints/0027-v04-examples-documentation-acceptance/blueprint.md`
- `planning/sprints/0027-v04-examples-documentation-acceptance/acceptance.md`

## Task Contract

**objective**: Deliver the auditable V0.4 example, aligned documentation/version metadata, compatibility proof, full CLI/extension/desktop acceptance, and truthful final release disposition.

**owns**: Examples/fixtures/generated artifacts, focused acceptance tests, README/spec/editor/desktop documentation and metadata, release verification, and planning records.

**must_not**: Invent features, weaken required gates, rewrite historical V0.2/V0.3 contracts, claim native platform checks from WSL2, silently accept failed/unavailable tests, choose a project license, publish to Marketplace, or add unrelated refactors.

**acceptance**: Meet every item in `planning/sprints/0027-v04-examples-documentation-acceptance/acceptance.md`. Mark V0.4 `COMPLETE` only when every required core gate, including native platform acceptance, is directly verified; otherwise leave it `OPEN` with evidence and options.

**verification**:

1. Create the example/fixtures and immediately run a focused production CLI/example test asserting concrete values and view placement; iterate on that slice before broad documentation edits.
2. Run production HTML/PDF/DOCX paths, V0.2/V0.3 compatibility paths, invalid input/output/no-write cases, and desktop current-buffer/configuration/export workflows against actual files and RPCs.
3. Run root build/full tests, extension compile/host/package/install checks, desktop isolated/direct/package checks, and release-owner macOS 14+, Windows 11+, and Ubuntu 24.04+ build/launch checks. Record exact artifacts and environment outcomes; do not substitute platforms.
4. Update all docs/metadata and planning records with actual results, DOCX disposition, license/publication status, residuals, and final `COMPLETE`/`OPEN` status. Run `git diff --check` before closure.
