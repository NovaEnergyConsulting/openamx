# 019 Handoff Prompt

You are the Builder for `openamx` Sprint 019.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.3.md`
- `docs/language-spec-v0.2.md`
- `README.md`
- `vscode-extension/README.md`
- `planning/sprints/0016-csv-json-input-runtime-validation/acceptance.md`
- `planning/sprints/0017-csv-json-output/acceptance.md`
- `planning/sprints/0018-v03-vscode-authoring-support/acceptance.md`
- `planning/sprints/0019-v03-examples-documentation-acceptance/requirements.md`
- `planning/sprints/0019-v03-examples-documentation-acceptance/blueprint.md`
- `planning/sprints/0019-v03-examples-documentation-acceptance/acceptance.md`

Execute only Sprint 019 scope. This is the final V0.3 example, documentation, and acceptance sprint, not a new feature sprint. Repair only proven acceptance defects, with a focused regression and recorded deviation; do not silently redefine the language contract.

Sprint 018 completed V0.3 editor support and a locally installed VSIX. Its recorded constructor-in-`match`-arm parser limitation requires explicit conformance review. The six Asset Management shapes remain provisional and the missing license still blocks Marketplace publication, not local packaging.

## Task Contract

**objective**: Deliver one verified end-to-end typed-data example with CSV/JSON fixtures, pure-function computation, rendered HTML, named JSON/CSV exports, aggregate/fail-fast validation, accurate V0.3 documentation/version metadata, and the full release acceptance gates.

**owns**:

- `examples/` typed-data document/fixtures and its generated HTML; existing V0.2 examples only if regeneration shows a concrete discrepancy
- `tests/examples.test.ts` or one narrowly focused end-to-end acceptance test
- `README.md`, `docs/language-spec-v0.3.md` (only evidence-based corrections), `vscode-extension/README.md`, and concise migration/compatibility notes
- Root/extension package manifests and lockfiles, `src/cli.ts` version metadata, and extension install script only as required for release version alignment
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 019 artifacts only for verified corrections/deviations
- A narrowly scoped implementation/test fix only if an acceptance failure proves a contract defect

**must_not**:

- Add new language/domain/CLI/editor features, domain scoring standards, remote packages, or unrelated refactors under an acceptance label.
- Weaken the entry-directory module containment rule just to simplify the example; place example/library files so the import is valid instead.
- Change or replace the V0.2 historical specification or claim no-option compatibility without verifying it.
- Publish/upload the VSIX, choose/add a license, or claim the provisional Asset Management library is domain-certified.
- Mark V0.3 complete or claim a check passed if a required gate is blocked, skipped, or unverified.

**acceptance**:

- Meet every item in `planning/sprints/0019-v03-examples-documentation-acceptance/acceptance.md` with actual-file and CLI assertions.
- Verify all typed-data values, diagnostic ordering/context, rendered HTML, JSON/CSV bytes, and V0.2 compatibility before closure.
- Align documentation and metadata with observed commands and installed VSIX; record any residual parser/editor limitations and license status.

**verification**:

1. After the first example/fixture edit, run a focused real-file test or production CLI `run` that checks named expected values, then iterate on the same slice.
2. Run production CLI `render` and `run` with both input mappings, JSON/CSV output selections, overridden paths, and invalid fixtures under both validation modes; compare actual values, bytes, HTML, diagnostics, and absent files against explicit expectations.
3. Run `bun install`, `bun run build`, and `bun test`; render all old and new examples and verify V0.2 no-option CLI behavior and checked-in HTML parity.
4. From `vscode-extension/`, run `bun install`, `bun run compile`, `bun run test`, `CI=1 bun run package`, `bun run install-local`, and `code --list-extensions --show-versions`. Rerun host tests against the installed VSIX where supported and confirm version/artifact consistency.
5. Record exact results, counts, host/package warnings, deviations, release limitations, and license status. Close V0.3 only after every required gate passes.
