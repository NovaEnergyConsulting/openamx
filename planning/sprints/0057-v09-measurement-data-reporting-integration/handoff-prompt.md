# Sprint 057 Handoff Prompt

You are the Builder for OpenAMX Sprint 057.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 external data/report, serialization, chart normalization/labels, diagnostic/location, empty/null and cross-surface contracts in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 055 requirements, acceptance, Builder evidence, `libraries/si.amx`, registry interface, and Lead Developer disposition
- Sprint 056 requirements, acceptance, Builder evidence, measurement runtime descriptor, interpolation integration, and Lead Developer disposition
- Sprint 057 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Runtime input/output/schema code, desktop data-editor/worker/RPC, report preparation, charts/tables, HTML/PDF/DOCX renderers, and relevant tests

## Entry Gate

Sprint 056 is **COMPLETE / APPROVED** by Lead Developer disposition dated 2026-10-06. Reuse its immutable measurement values and Sprint 055 registry; do not redefine them.

Known residuals remain unpassed:

- Sprint 056 Windows VS Code Extension Development Host: 15 pass / 5 fail (four `EBUSY` temporary-directory cleanup failures and one drive-letter casing assertion). Compilation and test compilation passed; the host suite did not.
- Sprint 056 full-worktree `git diff --check` found an extra blank line at EOF in unrelated `writing/2026-10-03_Computable_Documents.md`. Sprint-owned paths passed; do not edit or revert that unrelated file.

These residuals are context, not Sprint 057 blockers unless a demonstrated integration dependency is affected. Do not describe either result as passing.

## Objective

Implement and verify measurement IO/schema/data-editor integration and unit-aware table/chart/report rendering across JSON, CSV, HTML, PDF, and DOCX.

## Task Contract

**owns**: Exact JSON/CSV measurement parsing and serialization; restricted external unit-expression parser; input/output schema and inspection; desktop data-editor/non-file-backed schema integration; measurement tables/charts; renderer-specific HTML/PDF/DOCX output; diagnostic source/data locations and focused tests.

**must_not**: Redefine measurement runtime representation, dimension identities, unit registry or arithmetic; infer units for bare numbers; execute AMX from external unit strings; add nested CSV; normalize all renderer null/empty policies; change unrelated report ordering/snapshots/export atomicity; undertake broad Sprint 058 parity/docs/help; alter the unrelated writing file; claim Sprint 056 host checks passed.

**decision gates**: Follow the exact JSON shape, CSV text contract, visible-unit restricted grammar, round-trip rules, `AMX4004`/`AMX4005` payload expectations, table own-unit behavior, chart first-non-null normalization/labels, and renderer-specific empty/null policy from Sprint 051. If actual behavior conflicts with the approved contract, record a minimal case in `planning/questions.md` and obtain Lead Developer direction before changing semantics.

**acceptance**: Meet every criterion in `planning/sprints/0057-v09-measurement-data-reporting-integration/acceptance.md`.

## Verification

1. Test exact nested JSON shapes, bare-number rejection, finite values, visibility/compatibility, and canonical compound-unit round trips.
2. Test CSV measurement cells and restricted unit-expression syntax while preserving flat-record-list shape.
3. Test aggregate/fail-fast diagnostic modes and exact JSON pointer / CSV row, field, and location payloads.
4. Test input/output schema and desktop data-editor inspection on non-file-backed paths and before input loading, with registry/module evaluation counters proving no duplicate execution.
5. Test table cell display units and chart normalization, labels, row/category ordering, incompatible dimensions, empty/all-null cases, and existing HTML/PDF/DOCX differences.
6. Verify snapshots, report identity/source order, and export atomicity.
7. Run focused and applicable root/desktop/extension checks. Record the Windows host residual and any full-tree whitespace issue truthfully; check owned paths without modifying unrelated files. Run `git diff --check`.
8. Record changed files, output shapes, commands/results, residuals, and a separate Lead Developer disposition request. Do not self-accept or claim Sprint 058/integrated V0.9 completion.
