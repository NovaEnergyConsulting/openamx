# Sprint 116 Builder Evidence: V0.19 Chart AST, Parsing, Checking, and Evaluation

## Status

Sprint 116 implementation completed on 2026-11-21 within the separately
authorized exact baseline, worktree-preservation, file, command, and evidence
plan. The implementation carries a resolved Boolean from source through the
shared chart model while preserving existing renderer and accessibility output.

**Builder recommendation:** ACCEPT/CLOSED for the authorized Sprint 116
AST/parser/checker/emission/model scope. Focused behavior, diagnostics, source
mapping, typecheck, and patch integrity pass; no S116 residual is recorded.

**Separate product-owner disposition:** ACCEPTED/CLOSED by the user on
2026-11-21. This closes Sprint 116 only; it does not authorize Sprint 119
rendering, release, publication, package/version, deployment, installer, or
certification work.

## Entry and Baseline

| Evidence item | Status | Record |
| --- | --- | --- |
| Sprint 115 contract gate | VERIFIED | ACCEPTED/CLOSED on 2026-11-21; D115-01/02/03/09 authoritative |
| Sprint 116 execution authorization | AUTHORIZED | User approved the exact baseline, worktree preservation, six production candidates plus four focused tests, command plan, and this evidence output on 2026-11-21 |
| Repository baseline | VERIFIED | Branch `feat/create-V0.19`; commit `efff546ac03f8075058ac4aa74cd175202edc4ef`; initial `git status --short` produced no paths |
| Existing generated/shared artifacts | PRESERVED | No generated, rendered, release, package, desktop, extension, spec, example, or prior sprint artifact changed |
| Host/tool versions | RECORDED | Windows workspace; Bun 1.4.4 as reported by the focused test runner; TypeScript no-emit check executed through `bunx` |
| Approved changed paths | VERIFIED | Six production files, four focused test files, and this approved evidence file; formatter production remained unchanged |

## Focused Verification

| Check | Exact command | Status |
| --- | --- | --- |
| Parser/checker/evaluator/formatter/model suite | `bun test tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/chartModel.test.ts` | PASS; final run 208 pass, 0 fail, 4 files, 235 ms |
| Root no-emit typecheck | `bunx tsc --noEmit` | PASS; exit 0 with no output after final edits |
| Patch integrity | `git diff --check` | PASS; exit 0 with no output after final edits |
| Changed-path scope audit | `git status --short` and approved diff review | PASS; only the authorized production/test/evidence paths changed |

No broad product suite was used as a substitute. No requested check was
unavailable. Earlier focused retries are raw evidence, not hidden failures:
initial checker coverage had one test-only fenced-coordinate failure (104/1),
and the corrected retry exposed one test-only measurement message expectation
failure (104/1); the following run passed 105/105. The expanded formatter run
had one Bun assertion-API misuse (128/1); after correcting that test only, it
passed 129/129. All final authorized commands were rerun after the repairs.

## Requirement Evidence Ledger

| Requirement | Case IDs | Status | Exact evidence |
| --- | --- | --- | --- |
| AST and source locations | CHT-AST-01, CHT-ORDER-01, CHT-SOURCE-01 | PASS | `tests/parser.test.ts`: all kinds, source order, duplicate retention, LF/CRLF, and UTF-16 operator column verified |
| Parser all kinds/malformed/table | CHT-KIND-01, CHT-PARSE-01/02/03, CHT-TABLE-01 | PASS | Recognized `chartShowTableOption`; missing/colon/trailing tail reject with AMX3006; table option reaches AMX3003 checking |
| Boolean/duplicates/names/calls/operators | CHT-TYPE-01, CHT-DUP-01, CHT-NAME-01, CHT-CALL-01, S116-EXPR-CALL-01 | PASS | `tests/evaluator.test.ts`: Number/String/list/record/nullable/Measurement, duplicate, unknown, valid/invalid call, and ordinary operator diagnostics |
| Omitted/false/true/dynamic | CHT-OMIT-01, CHT-FALSE-01, CHT-TRUE-01, CHT-EXPR-01, CHT-ENV-01 | PASS | Emissions are `[false, true, false]` for omitted/dynamic/reassignment and `[false, true, false, true]` across bar/column/line/scatter |
| Formatter round trip | FMT-S116-01/02/03/04, CHT-FORMAT-01 | PASS | `tests/formatter.test.ts`: indentation, expression spelling, order, parse-format-parse shape, LF, and CRLF verified; production formatter unchanged |
| Emission shared model | MOD-S116-01/02/03/04/05, CHT-DEFAULT-REG-01, CHT-IMMUTABLE-01 | PASS | `tests/chartModel.test.ts`: omitted/false/true/dynamic copied; false model still has table/tableId; frozen emission/model verified |
| Renderer omission | CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01, CHT-OUTPUT-OMISSION-01, CHT-OUTPUT-TRUE-01 | OUT OF SCOPE / NOT RUN | S119 owns output omission and true-output behavior; existing output remains unchanged |
| Migration/spec/editor/SI/affine | CHT-DEFAULT-MIGRATION-01 and S117-S119 rows | OUT OF SCOPE / NOT RUN | No cross-sprint implementation or claim |

## Diagnostics and Source Ranges

| Case | Expected | Actual code/message/source | Status |
| --- | --- | --- | --- |
| CHT-TYPE-01 | AMX3002 at expression | Number/String/list: AMX3002 at fenced 6:13, respectively `Expected Boolean, got Number`, `... String`, `... Boolean[]`; nullable Boolean at 7:13; record at 10:13; Measurement at 8:13 with the existing `Measurement<["show-table-measurement.amx","Length"]^1>` type text | PASS |
| CHT-DUP-01 | AMX3005 at second option | AMX3005 `Repeated 'showTable' option` at fenced 7:3 | PASS |
| CHT-PARSE-01/02/03 | AMX3006 existing parse family | Missing and colon: AMX3006 `Invalid chart option` at bare fixture 2:3; trailing identifier: AMX3006 `Unexpected input after expression at token identifier` at 2:18 | PASS |
| CHT-TABLE-01 | AMX3003 at option | AMX3003 `Option is not valid for a table` at fenced 8:3 | PASS |
| CHT-NAME-01 | AMX3001 at identifier | AMX3001 `Unknown identifier 'missing'` at fenced 6:13 | PASS |
| S116-EXPR-CALL-01 | Preserve ordinary diagnostic | Invalid call: AMX3002 `Expected Number, got String` at fenced 7:22; invalid operator: AMX3007 `Expected Boolean, got Number` at 7:13 | PASS |
| CHT-SOURCE-01 | Exact LF/CRLF UTF-16 locations | Duplicate CRLF options at 3:3 and 4:3; expression at 4:13; binary operator after emoji string at UTF-16 4:18 | PASS |
| S116-RUNTIME-TYPE-01 | AMX3002 defensive mismatch | Guard implemented at expression source with exact `typeof value === 'boolean'`; bypassed unchecked harness NOT RUN as optional matrix row | IMPLEMENTED / NOT RUN |

No stable diagnostic identity or message allocation was added. Existing
AMX3001/3002/3003/3005/3006/3007 families were reused exactly.

## Scope and Boundary Audit

- Production files changed: `src/ast/types.ts`,
  `src/parser/parseStatements.ts`, `src/typechecker/checkDocument.ts`,
  `src/runtime/environment.ts`, `src/runtime/evaluateExpression.ts`, and
  `src/renderer/chartModel.ts`.
- Test files changed: `tests/parser.test.ts`, `tests/evaluator.test.ts`,
  `tests/formatter.test.ts`, and `tests/chartModel.test.ts`.
- Evidence file changed: this approved Sprint 116 evidence path only.
- `src/formatter/formatAmx.ts` remained unchanged because focused regressions
  demonstrated the generic line formatter already satisfies S116.
- Renderer HTML/PDF/DOCX/browser JSON/accessibility output remained unchanged.
- Editor, spec/example/migration, SI library, affine metadata/runtime, package,
  release, publication, deployment, and certification remained unchanged.
- False `showTable` still constructs the existing internal table and
  accessibility `tableId` in the S116 model; this is a staging invariant.
- No out-of-plan path or scope amendment was required.

## Reconciliation and Limitations

- Every Sprint 115 CHT ID assigned to S116 is represented in the ledger; the
  output/migration IDs remain explicit S119/S120 NOT RUN rows. No ID was
  missing, duplicated, or renamed, and all S116 internal matrix IDs are mapped.
- Final focused result: 208 pass, 0 fail. Final typecheck and patch checks both
  exited 0. No test skip or unavailable check was introduced.
- LF/CRLF formatter behavior and CRLF parser locations were executed; the emoji
  fixture verified UTF-16 operator columns.
- Adding `chartShowTableOption` to the visualization union and adding required
  emission/model fields produced no compiler error or unhandled union consumer.
- A runtime defensive AMX3002 guard exists for a bypassed unchecked path, but no
  separate optional bypass harness was run; ordinary source cases stop at static
  checking, as required.
- No S116 residual is recorded. The sole downstream dependency is that S119
  must consume the accepted resolved field for actual renderer omission and
  separately amend output-facing accessibility behavior.
- False-model presence did not trigger HTML/PDF/DOCX/browser JSON/accessibility
  omission work and is not reported as a renderer PASS.

## Final Recommendation and Disposition

**Builder recommendation: ACCEPT/CLOSED.** The exact focused suite passes 208
of 208 tests, `bunx tsc --noEmit` and `git diff --check` exit 0, diagnostics and
source ranges are reconciled, and the changed-path audit remains inside the
authorized S116 scope. There are no unexplained raw failures or unresolved S116
residuals; earlier test-only retries are recorded above.

**Separate product-owner disposition:** ACCEPTED/CLOSED by the user on
2026-11-21. Sprint 116 is closed. Sprint 119 remains independently gated by this
accepted propagation result and must own all renderer, output omission, browser
JSON, and accessibility-output changes. This disposition authorizes no renderer,
release, publication, package/version, deployment, installer, or certification
work.
