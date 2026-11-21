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
| INT120-CHT-AST-01 | AST/parser source and kinds | expression/source retained for all chart kinds; malformed/duplicate/table misuse diagnostics | Focused parser/evaluator: 309/309 final | PASS |
| INT120-CHT-TYPE-01 | Boolean/default/environment | exact Boolean typing, omitted false, identifier/computed expression, normal diagnostics | Focused evaluator/chart model | PASS |
| INT120-CHT-EVAL-01 | Snapshot timing | one evaluation per `show`; repeated shows may differ after reassignment | Focused evaluator tests | PASS |
| INT120-CHT-MODEL-01 | Shared resolved field | emission/model Boolean copied; no renderer AST evaluation; internal table retained | Focused chart model/renderer tests | PASS |
| INT120-CHT-HTML-01 | HTML/preview | omitted/false no table/JSON/ARIA fallback; true/dynamic preserve data; tooltip labels work | 4-state inspector: false,false,true,true; no false markup/payload/tableId/caption | PASS |
| INT120-CHT-PDF-01 | PDF | false no chart table; true/dynamic preserve table; ordinary table unaffected | 5-page PDF; false omission; true headings and ordinary register retained | PASS |
| INT120-CHT-DOCX-01 | DOCX | false native/fallback no Word tables/alt; true/native/fallback preserve | 4 charts; 3 Word tables; false no caption/table alt, true/dynamic retained | PASS |
| INT120-CHT-MIGRATE-01 | Migration | spec/README/Example 07 state omitted false and add true | Supplemental examples/docs tests and Example 07 source/artifact review | PASS |

## Affine End-to-End Evidence

| Evidence ID | Requirement | Required evidence | Candidate action/suite | Raw status |
| --- | --- | --- | --- | --- |
| INT120-AFF-DECL-01 | Unit metadata/constants | finite scale/offset, PI/E, aliases/import/re-export/editor parity | Focused dimensions/parser/editor plus supplemental measurements | PASS |
| INT120-AFF-COMP-01 | Valid/invalid composition | affine +/- scalar, scalar scaling, identity power, compound rejection | Focused dimensions + supplemental measurements | PASS |
| INT120-AFF-CONV-01 | Conversion invariant | $0C=32F=273.15K$, forward/reverse/round trips | Example 05: 0, 31.999999999999986, 273.15; `sameTemperature=true` | PASS |
| INT120-AFF-COMPARE-01 | Comparison/order | all operators compare physical values | Supplemental affine runtime tests | PASS |
| INT120-AFF-SUB-01 | Subtraction | same and mixed C/F left-unit results, including `20 C-10 C=10 C` | Example 05 and measurements: 10 celsius | PASS |
| INT120-AFF-REJECT-01 | Unsupported operations | direct add, affine multiply/divide/power/pow/sqrt exact diagnostics | Focused/supplemental rejected-operation cases | PASS |
| INT120-AFF-AGG-01 | Aggregates/unary | sum/mean physical, 303.15 C sum, min/max selection, abs/round/unary display | Example 05: sum 303.15, mean 15; supplemental aggregate cases | PASS |
| INT120-AFF-CHART-01 | Chart normalization | mixed C/F/K normalize physically to first display unit; null/order/labels retained | Focused chartModel/renderer and supplemental data cases | PASS |
| INT120-AFF-DATA-01 | External/display shape | atomic affine aliases accepted; affine compound input rejected; `{value,unit}` exact output | Supplemental measurementData: AMX4004/4005 and shape pass | PASS |
| INT120-AFF-SI-01 | SI imports | 16 dimensions/50 units; C/F/degC/degF metadata/import/conversion | Focused dimensions + supplemental SI/measurements/examples | PASS |

## Authoring, Documentation, Examples, and Build

| Evidence ID | Requirement | Required evidence | Candidate action/suite | Raw status |
| --- | --- | --- | --- | --- |
| INT120-EDITOR-SHARED-01 | Shared parser facts | showTable + affine operator facts, LF/CRLF/UTF-16/inert boundaries | Focused editor tests: pass inside 309/309 | PASS |
| INT120-EDITOR-VSCODE-01 | Actual host | V0.19 TextMate/format/diagnostic rows and full host aggregate | V0.19 row passes; aggregate 21 pass/8 fail EBUSY/path-case/import-root residual | FAIL |
| INT120-EDITOR-DESKTOP-01 | Desktop | typecheck plus Vite V0.19 highlighting/format/diagnostic; native distinction | Typecheck pass; Vite 1/1 on retry; native unavailable | PASS |
| INT120-FORMAT-01 | Formatter | chart and affine source idempotence/expression spelling | Focused formatter plus host/Vite idempotence | PASS |
| INT120-DOC-01 | Spec/README | V0.19 additive contract, historical links, migration, exclusions | Supplemental examples/docs cases | PASS |
| INT120-EX05-01 | Example 05 | executes exact affine/PI/E/aggregate examples; invalid forms inert | CLI exit 0; inspector affine values; supplemental example test | PASS |
| INT120-EX07-01 | Example 07 | mappings/exports stable; four visibility states in HTML/PDF/DOCX | CLI/named outputs plus structural inspector and hashes | PASS |
| INT120-GUIDE-01 | Numbered guide | structure/navigation/support closure and docs examples remain valid | Supplemental numbered guide: pass | PASS |
| INT120-BUILD-01 | Build/type/generated provenance | build/no-emit pass; generated runtime source script; hash/diff reviewed | build/typecheck pass; runtime hash stable `582919dc...`; no diff | PASS |

## Repository and Host Gates

| Evidence ID | Gate | Required evidence | Candidate action | Raw status |
| --- | --- | --- | --- | --- |
| INT120-ROOT-FOCUSED | Exact master focused command | 10-file V0.19 chart/affine/editor/render command | Final after corrective fixture: 309 pass, 0 fail, 2,194 assertions; initial diagnostic first failure retained | PASS |
| INT120-ROOT-SUPPLEMENTAL | Explicit affine/data/examples selection | measurement/data/examples/guide selection | 52 pass, 0 fail, 1,113 assertions | PASS |
| INT120-ROOT-ALL | Broader root regression | exact `bun test`, all raw failures/skip/retries | 673 pass, 0 fail, 5,239 assertions | PASS |
| INT120-VSCODE | Full extension host | full aggregate plus V0.19 row subset | 21 pass/8 fail aggregate; V0.19 format/diagnostic row pass | FAIL |
| INT120-DESKTOP-TYPE | Desktop typecheck | configured typecheck result, no silent no-result | `bun run typecheck` exit 0 | PASS |
| INT120-DESKTOP-UI | Desktop V0.19 UI | focused Vite UI pass/fail/skip and native distinction | Initial harness command failed Windows shim startup; one retry with `vite.exe` passed 1/1 | PASS |
| INT120-NATIVE | Native/platform | available native/WebView/package/cross-platform routes only if authorized | No native route authorized/available | BLOCKED/UNAVAILABLE |
| INT120-RELEASE | Release boundary | no package/version/release/publish/deploy/certification command run | Scope audit; none run | PASS |
| INT120-PRESERVE | Preservation/scope | no prior artifacts overwritten; generated hashes; `git diff --check`; changed paths | Final `git diff --check` pass; prior/shared hashes/counts preserved; isolated outputs used | PASS |

## Residual Register

| Residual ID | Raw entering condition | S120 action | Final raw status | Owner/disposition |
| --- | --- | --- | --- | --- |
| RES-S120-LAUNCH-01 | Bun startup-only capture failure, then controlled 308/1 stale fixture failure | preserved original logs; diagnosed capture; authorized test correction; final focused 309/309 | PASS | Diagnostic resolved by explicit `showTable true`; first failures retained |
| RES-S120-VSCODE-01 | S119 VS Code full host 20 pass/9 fail; V0.19 host rows pass | rerun exact host: 21 pass/8 fail; V0.19 format/diagnostic row pass | FAIL | Extension harness owner / separate product owner |
| RES-S120-NATIVE-01 | Native desktop/cross-platform not in evidence | no native route authorized; Vite 1/1 labeled harness-only | BLOCKED/UNAVAILABLE | Product owner/platform gate |
| RES-S120-ROOT-01 | Broad-root unrelated failure, if observed | broad suite passed 673/673 | PASS | No subsystem residual |
| RES-S120-GENERATED-01 | Any approved-build generated runtime diff | before/after hash stable; no Git diff | PASS | Build/runtime owner; provenance proven |

## Closeout Reconciliation

Reconciliation complete: entry dependencies have no missing/contradictory
dispositions; final focused 309/309 (2,194 assertions), supplemental 52/52
(1,113 assertions), broad 673/673 (5,239 assertions), build/typecheck,
desktop typecheck/Vite, and all Example 05/07 structural inspections pass.
The full VS Code aggregate is raw FAIL at 21 pass/8 fail; V0.19 host evidence
passes independently. Native/platform is BLOCKED/UNAVAILABLE. No release gate
ran. Artifact hashes, sizes, first failures, corrective rerun, residual owner,
and command logs are recorded in `artifacts/` and `builder-evidence.md`.
Builder recommends `ACCEPT/CLOSED WITH RECORDED RESIDUALS`; separate
product-owner disposition is `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the
user on 2026-11-21. Sprint 120 is closed for V0.19 integrated acceptance scope
only; release and platform authority remain absent.
