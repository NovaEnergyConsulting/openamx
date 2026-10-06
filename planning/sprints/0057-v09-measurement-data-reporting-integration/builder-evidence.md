# Sprint 057 Builder Evidence

## Scope and contract

Implemented measurement input/output and schema integration using the immutable Sprint 056 measurement values and Sprint 055 checked registry. No arithmetic, dimension identity, or unit-registry semantics were redefined.

- JSON measurements use exactly `{ "value": finiteNumber, "unit": "visible-unit-or-restricted-expression" }`; nested record/list/nullable values are supported. Bare numbers, malformed shapes, non-finite values, and incompatible dimensions are rejected.
- CSV measurements use finite numeric text followed by a space and restricted unit text, within the existing flat record-list shape. The parser accepts only entry-visible unit names, `*`, `/`, parentheses, and signed integer powers; it does not evaluate AMX text.
- Invalid or unknown/invisible unit text reports `AMX4004`; invalid measurement shape/value or incompatible dimensions reports `AMX4005`. JSON pointers and CSV record, field, row, and column context are retained. Aggregate and fail-fast validation modes remain available.
- Input schema and inspection expose human-readable dimensions and visible units. Output schema exposes measurement paths, dimension descriptions, and visible units. Desktop in-memory inspection supplies the checked registry without executing module bodies.
- JSON and CSV output preserve measurement display-unit text and serialize the numeric value with it. Measurement cells in tables retain their own units; each chart series/axis normalizes to its first non-null unit and receives the corresponding heading label.
- HTML, PDF, and DOCX consume the same prepared measurement snapshots while retaining their existing null/empty behavior. The PDF empty-chart table widths now match its header count, as directed in the resolved question; no chart SVG is fabricated for empty/all-null values.

## Changed files

- `src/runtime/externalUnits.ts`
- `src/typechecker/declarationRegistry.ts` (acceptance-finding fix)
- `src/renderer/reportPreparation.ts` (acceptance-finding fix)
- `src/runtime/inputData.ts`
- `src/runtime/outputData.ts`
- `src/runtime/moduleLoader.ts`
- `src/diagnostics/errors.ts`
- `src/typechecker/checkDocument.ts`
- `src/runtime/environment.ts`
- `src/runtime/evaluateExpression.ts`
- `src/renderer/renderHtml.ts`
- `src/renderer/reportPdf.ts`
- `src/renderer/reportDocx.ts`
- `desktop-app/src/shared/rpc.ts`
- `desktop-app/src/bun/jobWorker.ts`
- `desktop-app/src/mainview/components/DataEditorPane.vue`
- `desktop-app/src/mainview/components/ExportDialog.vue`
- `tests/measurementData.test.ts`
- `tests/renderer.test.ts`
- `tests/reportPresentation.test.ts`
- `desktop-app/src/bun/desktopDataEditor.test.ts`
- `planning/questions.md`

## Verification

| Command/check | Result |
|---|---|
| `bun run build` | Passed. |
| `bun test` | Passed: 373 tests across 31 files; 1,829 expectations. |
| `Set-Location desktop-app; bun run typecheck` | Passed. |
| `Set-Location desktop-app; bun run build:web` | Passed. Vite emitted its existing large-chunk advisory. |
| `Set-Location desktop-app; bun test src/bun/desktopDataEditor.test.ts` | Passed: 8 tests; 47 expectations, including non-file-backed inspection with visible measurement schema and an initializer that must not execute. |
| `Set-Location desktop-app; bun run test` | Failed at an existing Windows path-separator assertion in `desktop-app/tests/rpc-contract-check.ts:432`: actual `nested\\module.amx`, expected `nested/module.amx`. The focused measurement data-editor tests pass; this unrelated assertion was not changed. |
| `Set-Location vscode-extension; bun run test` | Compile and test compilation passed. Windows Extension Development Host: 14 passed / 6 failed (five `EBUSY` temporary-directory cleanup failures and one drive-letter casing assertion); the host suite did not pass. |
| `git diff --check` on Sprint 057-owned paths | Passed. |
| Full-worktree `git diff --check` | Passed in this run; no whitespace finding was present. The earlier Sprint 056 finding in unrelated `writing/2026-10-03_Computable_Documents.md` was not edited. |

The Sprint 056 Windows Extension Development Host residual remains its recorded 15 passed / 5 failed (four `EBUSY` cleanup failures and one drive-letter casing assertion); it is not being reclassified as passing. The Sprint 057 host result above is recorded separately.

Temporary `openamx-output-test-*` directories created by the root tests were removed by their exact resolved names.

## Residuals and disposition request

### Lead Developer acceptance-finding fix (2026-10-07)

- **Finding:** an imported `NameplateData` record with `PowerRating_MVA: ApparentPower`, used as `input nameplateData: NameplateData[]` from CSV (`75 MVA`), failed with `AMX4003 CSV records may contain only scalar fields`. The cause was that field annotations were resolved against the entry module's dimensions; the entry imported only `NameplateData`. This is not deferred by the master plan, so it was fixed here.
- **Fix (Lead Developer direction):** record field and function annotations resolve dimensions and external unit text in the declaring module. This covers checker field access, record construction, defaults, view fields, and calls; and runtime JSON/CSV input, schemas and inspection, output serialization, computed-record and function validation, and function-body unit literals. Measurement record defaults evaluate in the declaring registry.
- **Coupled fixes:** narrative `{{measurement}}` now renders `value unit` instead of `[object Object]`. Imported dimension-typed functions no longer fail with `AMX3001`; this is Sprint 056-owned and was fixed with Lead Developer approval.
- **Regression test:** `tests/measurementData.test.ts`, "resolves imported record measurement fields and unit text in the declaring module". It covers CSV `75 MVA`/`50000 kVA`, `nameplateData[2]`, the `1 MVA` default, CSV and JSON output, JSON input, the inspection schema (`ApparentPower`, `['MVA','kVA']`), `AMX4004` at `record[1].PowerRating_MVA` for `75 meter`, the imported `uprated(p: ApparentPower) = p + 1 MVA` returning `51000 kVA`, and HTML narrative `Rating for TX-002 50000 kVA upgraded 51000 kVA`.
- **The exact Lead Developer scenario** rendered through the CLI as `Imlpementation of AS 60076-7 for TX-002 50 MVA`.

| Command/check (2026-10-07) | Result |
|---|---|
| `bun run build` | Passed. |
| `bun test` | Passed: 374 tests across 31 files; 1,840 expectations. |
| `Set-Location desktop-app; bun run typecheck` | Passed. |
| `Set-Location desktop-app; bun test src/bun/desktopDataEditor.test.ts` | Passed: 8 tests; 47 expectations. |
| `Set-Location vscode-extension; bun run test` | Compile and test compilation passed. Windows host suite 15 passed / 5 failed (four `EBUSY` cleanup failures, one drive-letter casing assertion); not passing. |
| Full-worktree `git diff --check` | Passed. |

### Residuals
- The desktop RPC contract check retains the Windows path-separator assertion failure noted above.
- The Sprint 057 Windows Extension Development Host suite remains unpassed as recorded above.
- No Sprint 058 scope, integrated V0.9 completion, or Sprint 057 acceptance is claimed.

**Lead Developer disposition requested:** review this implementation and evidence and provide Sprint 057 disposition separately. The Builder does not self-accept the sprint.

## Lead Developer Disposition

**2026-10-07: COMPLETE / APPROVED.** The Lead Developer re-ran the acceptance scenario (imported `NameplateData` CSV input with `ApparentPower`/`MVA`) and confirmed that everything works as expected, then approved Sprint 057 as complete. The desktop RPC contract Windows path-separator assertion and the Windows Extension Development Host result (15 passed / 5 failed) remain accurately recorded; approval does not represent those checks as passing. No Sprint 058 or integrated V0.9 completion is claimed.
