# Sprint 119 Builder Evidence: V0.19 Rendering, Editors, Specification, and Migration

## Status

Sprint 119 implementation completed on 2026-11-21 within the user's exact
approval of the package plan, commands, candidate paths, generated-output rule,
artifact roots, and stop-before-amendment boundary.

**Builder recommendation:** ACCEPT/CLOSED WITH RECORDED RESIDUALS for the
authorized Sprint 119 scope. All focused product cases, root build/typechecks,
desktop Vite behavior, and generated artifact inspections pass. The full VS Code
host command remains nonzero on unrelated Windows temp cleanup/path-case tests;
both V0.19 host cases pass independently within that host run.

**Separate product-owner disposition:** PENDING. This Builder recommendation does
not close Sprint 119, authorize Sprint 120, or authorize release/publication.

## Entry and Baseline

| Evidence item | Status | Exact record |
| --- | --- | --- |
| Sprint 116 propagation gate | VERIFIED ACCEPTED 2026-11-21 | 208/208; no residual; resolved `showTable` is authoritative |
| Sprint 118 runtime/SI gate | VERIFIED ACCEPTED 2026-11-21 | 169/169; 1,297 assertions; no residual |
| Sprint 119 authorization | AUTHORIZED 2026-11-21 | User approved the exact package plan and commands; baseline commit and all candidate path boundaries recorded below |
| Repository baseline | VERIFIED | Branch `feat/create-V0.19`; commit `b04906c15ff173e1178b2047f4cc9326385492a0`; initial `git status --short` clean |
| Worktree preservation | VERIFIED | No pre-existing user change; no unrelated source/test/doc path changed |
| Host/tools | RECORDED | Windows; Git 2.56.1; Bun 1.4.4; Node 24.13.1; TypeScript 5.9.3; VS Code host 1.143.1; Vite 6.4.3; Playwright package 1.64.1 |
| Generated source | VERIFIED | `bun run build` passed; `src/renderer/diagramBrowserRuntime.ts` remained unchanged |

## Final Verification

| Check | Exact command | Result |
| --- | --- | --- |
| Root focused suite | `bun test tests/renderer.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts tests/chartModel.test.ts tests/editor.test.ts tests/formatter.test.ts tests/examples.test.ts tests/numbered-guide.test.ts` | PASS; final 133 pass, 0 fail, 1,697 assertions, 8 files, 34.68 s |
| Root build | `bun run build` | PASS; generator plus TypeScript compile exit 0 |
| Root typecheck | `bunx tsc --noEmit` | PASS; exit 0, no output |
| Desktop typecheck | `bun run --cwd C:\Users\gamez\Programming\openamx\desktop-app typecheck` | PASS; Hutch prepare and `vue-tsc --noEmit` exit 0 |
| Desktop Vite UI | `bun run --cwd C:\Users\gamez\Programming\openamx\desktop-app test:ui -- tests/ui/v16-language-editor.pw.ts --grep "V0.19 chart visibility"` | PASS; 1/1; exact highlight ranges, keyword spans, no valid diagnostics, idempotent format, AMX3002 at line 6 column 13 |
| VS Code host | `bun run test` in `vscode-extension` | PARTIAL: V0.19 grammar/format/diagnostic tests pass in VS Code 1.143.1; whole command 20 pass, 9 fail on unrelated Windows EBUSY temp cleanup and drive-letter case comparisons |
| Patch integrity | `git diff --check` | PASS; exit 0, no output |
| Scope audit | `git status --short`, `git diff --name-only` | PASS; only approved renderer/editor/docs/example/test/evidence/artifact paths changed |

## Rendering Evidence

| Requirement/cases | Status | Exact evidence |
| --- | --- | --- |
| HTML four-state, payload, ARIA, tooltips | PASS | `tests/renderer.test.ts`: 21 tests pass; omitted/false/true/dynamic-true map `[false,false,true,true]`; false has no chart table, `table` JSON, `tableId`, or caption reference; category plots retain only 3 ID-label entries |
| HTML no-data and S119-HTML-EMPTY-01 | PASS | False all-null line retains `No data` plot and `emptyState` payload but no chart table or table JSON |
| PDF false/true and all chart kinds | PASS | `tests/reportPdf.test.ts`: 7 pass; 10 kitchen-sink chart blocks omit associated table objects; true production fixture retains complete table; Example 07 prepared structure proves `[false,false,true,true]` |
| PDF artifact | PASS | `example-07.pdf`: 5 pages; all four titles and ordinary `Screening register` searchable; false chart caption/text absent; true table heading present |
| DOCX native false and partial line | PASS | `tests/reportDocx.test.ts`: 11 pass; false bar/column/line/scatter/partial fixture emits 5 native charts and workbooks, zero Word tables; omitted-series notice says data is omitted from the chart |
| DOCX false fallback and alt | PASS | Zero-point, no-plottable scatter group, and unsupported three-axis fixtures emit notices with zero Word tables and no complete-table claim; false chart alt names are chart titles, never table IDs |
| DOCX true/fallback regression | PASS | Existing true native/fallback fixtures retain 5 complete native alternatives, zero/unsupported tables, headings, rows, null text, and table-linked alt behavior |
| Ordinary tables | PASS | Example 07 PDF retains `Screening register`; DOCX has 3 Word tables total: one ordinary plus two true chart tables |
| Internal model/no re-evaluation | PASS | S116 model still carries internal table/accessibility; every adapter consumes `model.showTable`; no parser/evaluator call added to renderers |
| No hidden fallback | PASS | Source/output searches and artifact inspection find no false chart table markup, CSS-hidden chart table, hidden rows, fallback table, or table-shaped JSON |

Case reconciliation covers CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01,
CHT-OUTPUT-OMISSION-01, CHT-OUTPUT-TRUE-01, S119-HTML-JSON-01/02,
S119-HTML-A11Y-01/02, S119-HTML-TOOLTIP-01, S119-HTML-EMPTY-01,
S119-PDF-STRUCT/TEXT/VIEW-01, S119-DOCX-NATIVE/FALLBACK/PARTIAL/ALT/TRUE/VIEW-01,
S119-MODEL-01/02, S119-TRUE-MODEL-01, and S119-NO-CSS-01.

## Editor Evidence

| Requirement/cases | Status | Exact evidence |
| --- | --- | --- |
| VS Code `showTable` scope | PASS | Actual TextMate host scopes the token as `keyword.other.option.amx`; inert JavaScript fence lacks the scope |
| Affine TextMate boundaries | PASS | Actual host preserves `+`, `-`, `*`, `/`, numeric, identifier, PI, and E scopes in unit expressions; existing grammar is unchanged except adding `showTable` |
| Extension valid format/diagnostic | PASS | V0.19 host document has zero diagnostics and second formatting pass returns zero edits; invalid `showTable 1` is AMX3002 at the exact expression; invalid affine addition is AMX3008 at `+` |
| Shared facts | PASS | `tests/editor.test.ts`: 32 pass; `showTable` and binary `operatorSource` facts are exact AST-derived ranges; LF/CRLF/UTF-16 narrative boundaries pass |
| Desktop Vite UI | PASS | 1/1 on Vite 6.4.3; `.amx-token-keyword` contains `showTable`, `+`, `-`, `*`, `/`; PI/E render as references; AMX3002 marks only `1` on line 6; format is idempotent |
| Native desktop | NOT RUN / NOT CLAIMED | Vite harness evidence is not promoted to native WebView or cross-platform certification |

Case reconciliation covers S119-TM-SHOWTABLE-01, S119-TM-AFFINE-01,
S119-TM-BOUNDARY-01, S119-EXT-FORMAT-01, S119-EXT-DIAG-01,
S119-FACT-SHOWTABLE/AFFINE/RANGE-01, S119-DESKTOP-UI-01/02,
S119-DESKTOP-DIAG-01, and S119-DESKTOP-BOUNDARY-01.

## Specification, README, and Examples

| Requirement/cases | Status | Exact evidence |
| --- | --- | --- |
| Additive V0.19 specification | PASS | `docs/language-spec-v0.19.md` links V0.18/V0.16/V0.14/V0.13 and README; covers visibility, affine model, PI/E, SI, operations, charts, external shape, diagnostics, exclusions, and migration |
| Historical specs | PASS | No `docs/language-spec-v0.*` historical file changed |
| README/migration | PASS | README links V0.19 and updated Examples 05/07 and states omitted V0.19 tables are false; `showTable true` or a true expression retains them |
| Example 05 | PASS | CLI/source evaluation proves 0 C = 32 F = 273.15 K, left-unit subtraction `10 celsius`, physical sum/mean, min/max display selection, abs/round, PI/E units; rejected add/multiply/divide/power/root remain only in inert `text`; formatting is idempotent |
| Example 07 | PASS | Exports remain 38 and rows `[16,18,4]`; four charts evaluate `[false,false,true,true]`; ordinary register and named outputs unchanged |
| Numbered guide | PASS | Navigation/support closure and the full documented lesson execution pass inside the 133-test selection |

Case reconciliation covers S119-SPEC-LINK/CONTRACT/EXCLUSION-01,
S119-README-01, CHT-DEFAULT-MIGRATION-01, S119-EX05-RUN/INERT/FORMAT-01, and
S119-EX07-RUN/HTML/STATIC/NAV-01.

## Rendered Artifacts

Files and the reproducible inspector are under
`planning/sprints/0119-v19-rendering-editors-specification-migration/artifacts/`.

| Artifact | SHA-256 |
| --- | --- |
| `outputs/example-07.html` | `e24dd30da04f6caaf90d3f3036d7bea54aac1a22d32f13e06e2ffa014e4fa03f` |
| `outputs/example-07.pdf` | `13bd1ffcd44d8ae77478cdd5c81285bd2a6fb4192f37795bfe068207e8423e0a` |
| `outputs/example-07.docx` | `278350e7bd4ed18076143b765772c85f15ae3af07e812718c2b55ac03717434f` |

Run `bun run planning/sprints/0119-v19-rendering-editors-specification-migration/artifacts/inspect-example-07.ts`
from the repository root. Final results:

- HTML: omitted/false have no table markup, table JSON, table ID, or caption
  reference; true/dynamic have all three; false category payloads contain only
  three row-ID-label entries;
- PDF: 5 pages, all four titles present, no false table text, true heading and
  ordinary register retained;
- DOCX: 4 native charts, exactly 3 Word tables, true/dynamic captions retained,
  false/omitted captions absent, false alt text has no table reference, and true
  alt text retains its allowed table link.

## Diagnostics and Output Gates

- Existing AMX3001/3002/3005/3006/3007/3008 behavior remains parser/checker-owned;
  S119 adds no stable diagnostic or renderer-specific error.
- AMX3002 and AMX3008 exact extension-host ranges and AMX3002 Vite range pass.
- Public output remains `{ value, unit }`; no affine `offset`, `scale`, factors,
  vector, or physical value is exposed through the external output shape.
- No renderer reparses/evaluates chart options and no editor implementation adds
  a second parser or broad chart/unit scanner.

## Scope Audit

Changed production paths are limited to `src/renderer/renderHtml.ts`,
`reportPdf.ts`, `reportDocx.ts`, and `src/editor/highlighting.ts`. Changed tests
are `tests/renderer.test.ts`, `reportPdf.test.ts`, `reportDocx.test.ts`,
`editor.test.ts`, `formatter.test.ts`, `examples.test.ts`, the Vite UI test, and
the actual VS Code host test. Public changes are README, the new V0.19 spec,
and Examples 05/07. The approved evidence file, inspector, and three generated
output artifacts are the only additional files. No out-of-scope amendment was
required.

No package/version, historical specification, release, publication, deployment,
installer, distribution, certification, or Sprint 120 file changed. No
hand-edited generated browser runtime exists; the authorized root build left
`src/renderer/diagramBrowserRuntime.ts` unchanged.

## Raw Retries and Residuals

Raw retries are retained rather than hidden:

- Renderer: initial 18 pass/2 fail after V0.19 default changed; two legacy table
  fixtures were explicitly opted into `showTable true`, final slice 21 pass.
- DOCX: initial 5 pass/4 fail exposed four legacy complete-table fixtures; they
  were explicitly made true. A new fallback fixture initially used unsupported
  AMX type-assertion syntax, and a later revision initially selected the no-data
  branch; both fixtures were corrected, final slice 11 pass.
- Shared editor: two test-only selection failures; operator checks were limited
  to parser-proven `operatorSource` tokens and inert prose selection was removed.
- Formatter: one test-only failure expected canonical operator spacing, contrary
  to the accepted expression-spelling contract; the exact spelling assertion passed.
- V0.19 example tests: affine IEEE-754 equality, loader option shape, CRLF text,
  and default 5-second integration timeout were repaired in tests only; final
  V0.19 group 3 pass/0 fail/71 assertions.
- Vite: initial harness path/CRLF issues were corrected; final focused result 1 pass.
- Extension host first run: V0.19 tests passed, while the full command ended 20
  pass/8 fail on Windows cleanup/path comparisons. Final run with added V0.19
  format/diagnostics ended 20 pass/9 fail; the V0.19 host test and TextMate test
  both passed. Nine failures are all existing temp `EBUSY` cleanup or drive-letter
  case comparisons outside the S119-owned paths. Owner: extension test harness
  owner; no S119 behavior residual.

Native desktop, cross-platform, extension publication, and platform certification
were not run and are not claimed. The Vite result is harness evidence only.

## Final Recommendation and Disposition

**Builder recommendation: ACCEPT/CLOSED WITH RECORDED RESIDUALS.** The authorized
product cases pass 133/133 with 1,697 assertions, build/typechecks/patch integrity
pass, actual extension-host V0.19 cases and Vite UI pass, and final HTML/PDF/DOCX
artifacts prove actual omission and true preservation. The sole residual is the
full extension-host suite's unrelated Windows cleanup/path-case failures, owned by
the extension test harness and recorded above.

**Separate product-owner disposition:** PENDING. Sprint 120, V0.19 integrated
closeout, release, publication, package/version, deployment, installer,
distribution, certification, and platform actions remain independently gated.
