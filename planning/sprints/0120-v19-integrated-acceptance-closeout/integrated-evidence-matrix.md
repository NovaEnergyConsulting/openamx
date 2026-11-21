# Sprint 120 Integrated Evidence Matrix

## Status and Evidence Rules

Architect-prepared execution matrix. All rows are NOT RUN during preparation.
For every executed row record exact command/action, CWD, host/tool versions,
expected versus actual, pass/fail/assertion counts, output/artifact path/hash,
retry, raw status, residual owner, and separate disposition.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`. A later
owner disposition never rewrites the raw status.

## Entry and Dependency Reconciliation

| Evidence ID | Gate | Required evidence | S120 record | Raw status | Residual/disposition |
| --- | --- | --- | --- | --- | --- |
| INT120-ENTRY-115 | Sprint 115 contract gate | S115 disposition accepted; D115-01..09 and 68 cases/source audit reconciled | Accepted 2026-11-21; 68/68 IDs; no duplicates/missing | PASS | S115 owner evidence |
| INT120-ENTRY-116 | Chart AST/parser/checker/evaluation/model | S116 accepted; 208/208; no residual | Accepted 2026-11-21; 208 pass, 0 fail | PASS | No residual |
| INT120-ENTRY-117 | Affine declaration metadata | S117 accepted; 159/159; 1,233 assertions; no residual | Accepted 2026-11-21; 159 pass, 0 fail; 1,233 assertions | PASS | No residual |
| INT120-ENTRY-118 | Runtime/external/SI | S118 accepted; 169/169; 1,297 assertions; no residual | Accepted 2026-11-21; 169 pass, 0 fail; 1,297 assertions | PASS | No residual |
| INT120-ENTRY-119 | Rendering/editor/spec/examples | S119 accepted with residual; full VS Code 20/9 while V0.19 host rows pass | Accepted with residual 2026-11-21; focused 133 pass, 0 fail; host 20 pass/9 fail; V0.19 rows pass | PASS | Extension harness residual remains raw FAIL |

## Chart End-to-End Evidence

| Evidence ID | Requirement | Required evidence | Candidate action/suite | Raw status |
| --- | --- | --- | --- | --- |
| INT120-CHT-AST-01 | AST/parser source and kinds | expression/source retained for all chart kinds; malformed/duplicate/table misuse diagnostics | Master focused parser/evaluator | NOT RUN |
| INT120-CHT-TYPE-01 | Boolean/default/environment | exact Boolean typing, omitted false, identifier/computed expression, normal diagnostics | Master focused evaluator/chart model | NOT RUN |
| INT120-CHT-EVAL-01 | Snapshot timing | one evaluation per `show`; repeated shows may differ after reassignment | Focused/evaluator test | NOT RUN |
| INT120-CHT-MODEL-01 | Shared resolved field | emission/model Boolean copied; no renderer AST evaluation; internal table retained | Chart model/renderer tests | NOT RUN |
| INT120-CHT-HTML-01 | HTML/preview | omitted/false no table/JSON/ARIA fallback; true/dynamic preserve data; tooltip labels work | Focused renderer + Example 07 artifact | NOT RUN |
| INT120-CHT-PDF-01 | PDF | false no chart table; true/dynamic preserve table; ordinary table unaffected | Focused PDF + Example 07 artifact | NOT RUN |
| INT120-CHT-DOCX-01 | DOCX | false native/fallback no Word tables/alt; true/native/fallback preserve | Focused DOCX + Example 07 artifact | NOT RUN |
| INT120-CHT-MIGRATE-01 | Migration | spec/README/Example 07 state omitted false and add true | examples/spec review | NOT RUN |

## Affine End-to-End Evidence

| Evidence ID | Requirement | Required evidence | Candidate action/suite | Raw status |
| --- | --- | --- | --- | --- |
| INT120-AFF-DECL-01 | Unit metadata/constants | finite scale/offset, PI/E, aliases/import/re-export/editor parity | dimensions/parser/editor tests | NOT RUN |
| INT120-AFF-COMP-01 | Valid/invalid composition | affine +/- scalar, scalar scaling, identity power, compound rejection | dimensions/measurements | NOT RUN |
| INT120-AFF-CONV-01 | Conversion invariant | $0C=32F=273.15K$, forward/reverse/round trips | measurements + Example 05 | NOT RUN |
| INT120-AFF-COMPARE-01 | Comparison/order | all operators compare physical values | measurements/evaluator | NOT RUN |
| INT120-AFF-SUB-01 | Subtraction | same and mixed C/F left-unit results, including `20 C-10 C=10 C` | measurements + Example 05 | NOT RUN |
| INT120-AFF-REJECT-01 | Unsupported operations | direct add, affine multiply/divide/power/pow/sqrt exact diagnostics | measurements/evaluator | NOT RUN |
| INT120-AFF-AGG-01 | Aggregates/unary | sum/mean physical, 303.15 C sum, min/max selection, abs/round/unary display | measurements + Example 05 | NOT RUN |
| INT120-AFF-CHART-01 | Chart normalization | mixed C/F/K normalize physically to first display unit; null/order/labels retained | chartModel/measurementData/renderer | NOT RUN |
| INT120-AFF-DATA-01 | External/display shape | atomic affine aliases accepted; affine compound input rejected; `{value,unit}` exact output | measurementData/examples | NOT RUN |
| INT120-AFF-SI-01 | SI imports | 16 dimensions/50 units; C/F/degC/degF metadata/import/conversion | dimensions/measurements/examples | NOT RUN |

## Authoring, Documentation, Examples, and Build

| Evidence ID | Requirement | Required evidence | Candidate action/suite | Raw status |
| --- | --- | --- | --- | --- |
| INT120-EDITOR-SHARED-01 | Shared parser facts | showTable + affine operator facts, LF/CRLF/UTF-16/inert boundaries | editor focused tests | NOT RUN |
| INT120-EDITOR-VSCODE-01 | Actual host | V0.19 TextMate/format/diagnostic rows and full host aggregate | `vscode-extension: bun run test` | NOT RUN |
| INT120-EDITOR-DESKTOP-01 | Desktop | typecheck plus Vite V0.19 highlighting/format/diagnostic; native distinction | desktop commands | NOT RUN |
| INT120-FORMAT-01 | Formatter | chart and affine source idempotence/expression spelling | formatter/examples/host tests | NOT RUN |
| INT120-DOC-01 | Spec/README | V0.19 additive contract, historical links, migration, exclusions | examples/docs review | NOT RUN |
| INT120-EX05-01 | Example 05 | executes exact affine/PI/E/aggregate examples; invalid forms inert | CLI + tests + artifact/log | NOT RUN |
| INT120-EX07-01 | Example 07 | mappings/exports stable; four visibility states in HTML/PDF/DOCX | CLI exports + artifact inspection | NOT RUN |
| INT120-GUIDE-01 | Numbered guide | structure/navigation/support closure and docs examples remain valid | numbered guide + examples | NOT RUN |
| INT120-BUILD-01 | Build/type/generated provenance | build/no-emit pass; generated runtime source script; hash/diff reviewed | root build/typecheck/hash | NOT RUN |

## Repository and Host Gates

| Evidence ID | Gate | Required evidence | Candidate action | Raw status |
| --- | --- | --- | --- | --- |
| INT120-ROOT-FOCUSED | Exact master focused command | 10-file V0.19 chart/affine/editor/render command | First and retry each exited 1 after Bun startup banner; 0 tests/assertions produced; `artifacts/logs/s120-root-focused*.log` | FAIL |
| INT120-ROOT-SUPPLEMENTAL | Explicit affine/data/examples selection | measurement/data/examples/guide selection | Stop rule applied after focused launch failure; command not executed | NOT RUN |
| INT120-ROOT-ALL | Broader root regression | exact `bun test`, all raw failures/skip/retries | approved broad command | NOT RUN |
| INT120-VSCODE | Full extension host | full aggregate plus V0.19 row subset | extension command | NOT RUN |
| INT120-DESKTOP-TYPE | Desktop typecheck | configured typecheck result, no silent no-result | desktop command | NOT RUN |
| INT120-DESKTOP-UI | Desktop V0.19 UI | focused Vite UI pass/fail/skip and native distinction | desktop UI command | NOT RUN |
| INT120-NATIVE | Native/platform | available native/WebView/package/cross-platform routes only if authorized | separate host route | BLOCKED/UNAVAILABLE candidate |
| INT120-RELEASE | Release boundary | no package/version/release/publish/deploy/certification command run | scope audit | NOT RUN |
| INT120-PRESERVE | Preservation/scope | no prior artifacts overwritten; generated hashes; `git diff --check`; no product edits | inventory/diff | NOT RUN |

## Residual Register

| Residual ID | Raw entering condition | S120 action | Final raw status | Owner/disposition |
| --- | --- | --- | --- | --- |
| RES-S120-LAUNCH-01 | Bun test runner exits 1 after startup banner before any test/assertion output; identical authorized retry | preserve both logs; diagnose separately; fresh acceptance cycle required | FAIL | Test-host/Builder owner; corrective diagnostic plan and separate product owner |
| RES-S120-VSCODE-01 | S119 VS Code full host 20 pass/9 fail on unrelated Windows cleanup/path-case tests; V0.19 host rows pass | rerun exact host and classify failures | NOT RUN | Extension harness owner / separate product owner |
| RES-S120-NATIVE-01 | Native desktop/cross-platform not in evidence | report available/unavailable; no platform claim | NOT RUN | Product owner/platform gate |
| RES-S120-ROOT-01 | Any broad-root unrelated failure, if observed | preserve aggregate and first/retry log | NOT RUN | owning subsystem / product owner |
| RES-S120-GENERATED-01 | Any approved-build generated runtime diff | verify provenance; separate corrective scope if unexplained | NOT RUN | Build/runtime owner |

## Closeout Reconciliation

At completion, list exact case counts, all missing/duplicate/renamed IDs, raw
status totals, unavailable checks, focused and broad test counts, artifact
hashes, residual owners, and the separate product-owner disposition. Acceptance
with residuals may close V0.19 scope, but never release authority.
