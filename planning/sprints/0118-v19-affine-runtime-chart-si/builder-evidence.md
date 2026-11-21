# Sprint 118 Builder Evidence: V0.19 Affine Runtime, Charts, External Data, and SI

## Status

Sprint 118 implementation completed on 2026-11-21 within the separately
approved baseline, preservation, file, command, generated-output, and evidence
plan. Runtime affine conversion, operations, external data, chart normalization,
and the four SI temperature exports are implemented.

**Builder recommendation:** ACCEPT/CLOSED for the authorized Sprint 118 scope.
No residual is recorded. Focused tests, no-emit typecheck, generated-runtime
provenance, SI inventory, diagnostics, and patch scope pass.

**Separate product-owner disposition:** ACCEPTED/CLOSED by the user on
2026-11-21. Sprint 118 is closed with no residual.

## Entry and Baseline

| Evidence item | Status | Exact record |
| --- | --- | --- |
| Sprint 115 operation/data/diagnostic contract | VERIFIED ACCEPTED 2026-11-21 | D115-06/08/09 authoritative |
| Sprint 117 affine declaration gate | VERIFIED ACCEPTED 2026-11-21 | 159 pass, 0 fail; 1,233 assertions; offset metadata complete; no residual |
| Sprint 118 execution authorization | AUTHORIZED 2026-11-21 | User approved the exact baseline, named production/test/SI/generated/evidence paths, commands, preservation rule, and stop-before-amendment process |
| Repository baseline | VERIFIED | Branch `feat/create-V0.19`; commit `e72fbba207e1e0a49fe6b1b0409aee8e749bd7e3`; initial `git status` was clean |
| Host/tool | RECORDED | Windows workspace; Bun 1.4.4 from the focused runner; TypeScript no-emit check exited 0 |
| Existing artifacts | PRESERVED | No pre-existing generated, test-result, release, documentation, renderer, or user artifact was replaced; generated browser runtime changed only through its approved script |
| Approved paths | VERIFIED | Six production paths, one SI path, five focused test paths, one generated path, and this evidence path; no scope amendment |

## Exact Focused Verification

| Check | Exact command | Result |
| --- | --- | --- |
| Runtime/data/chart/evaluator/dimensions suite | `bun test tests/measurements.test.ts tests/measurementData.test.ts tests/chartModel.test.ts tests/evaluator.test.ts tests/dimensions.test.ts` | PASS; final 169 pass, 0 fail, 1,297 assertions, 5 files, 294 ms |
| Root no-emit typecheck | `bunx tsc --noEmit` | PASS; exit 0, no output |
| Diagram runtime generation | `bun run scripts/build-diagram-runtime.ts` | PASS; generated hash stable on repeat |
| Patch integrity | `git diff --check` | PASS; exit 0; Git emitted only the generated file LF/CRLF working-tree warning |
| Scope audit | `git status --short`, `git diff --name-only`, `git diff --numstat`, SI diff review | PASS; only approved paths changed |
| Root build | `bun run build` | NOT RUN; not included in the exact authorization |

No check was skipped or unavailable within the approved command set. Renderer,
editor, desktop, extension, release, publication, and platform suites were not
substitutes for the focused runtime acceptance command.

## Runtime and Operation Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| Offset runtime unit and shared helpers | S118-UNIT-OFFSET-01, S118-PHYSICAL-01, S118-COMPOSE-01 | PASS | Required frozen offset; C `(scale 1, offset 273.15)`; F scale `5/9`; shared helper and inverse golden values; linear composition/power offset 0 |
| Conversion/equality/order | AFF-CONV-INVARIANT-01, AFF-CONV-REVERSE-01, AFF-ROUNDTRIP-01, AFF-EQUAL-01 | PASS | `0 C`, `32 F`, `273.15 K` compare physically; reverse/round-trip values pass; equality and all four order operators pass |
| Subtraction and unsupported operations | AFF-SUB-SAME-01, AFF-SUB-MIX-01, AFF-ADD-01, AFF-MUL-01, AFF-DIV-01, AFF-POW-01, AFF-SQRT-01 | PASS | Same subtraction `10 C`; mixed subtraction `-36 F` within floating tolerance; direct add/multiply/divide/binary power/`pow`/`sqrt` reject AMX3007 |
| Aggregates and unary display | AFF-SUM-01, AFF-SUM-MIX-01, AFF-MEAN-01, AFF-MINMAX-01, AFF-ABSROUND-01, AFF-NEG-01, S118-EMPTY-SUM-01 | PASS | `sum([10 C,20 C]) = 303.15 C`; mixed physical total/mean and min/max selection pass; abs/round/unary minus retain display units; typed empty sum stays canonical offset-zero Kelvin |
| Finite/incompatibility/linear regression | AFF-FINITE-01, AFF-INCOMPAT-01, AFF-NUMBER-REG-01, S118-CHECKER-FINITE-01 | PASS | Static AMX3010 and dynamic AMX1009 physical overflow pass; incompatible conversion AMX3007; Number and linear arithmetic regressions pass |

## Chart, External, SI, and Output Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| Physical chart normalization | AFF-CHART-01, AFF-CHART-NULL-01, AFF-CHART-FIRST-01, AFF-CHART-FAIL-01 | PASS | C/F/K normalize to retained first unit; null placement/source order preserved; Fahrenheit-first headings/unit pass; overflow AMX3007 at series source with declaration source |
| Scalar/table/narrative display | AFF-DISPLAY-01 | PASS | `273.15 K in celsius` displays exactly `0 celsius`; converted display unit is retained; no canonical physical leak |
| External atomic/alias/compound/shape | AFF-EXTERNAL-01, AFF-EXTERNAL-ALIAS-01, AFF-EXTERNAL-COMPOUND-01, AFF-EXTERNAL-SHAPE-01 | PASS | C/F/degC/degF accepted; JSON `/unit` and CSV `record[1].temperature` reject compound affine text AMX4004; extra/missing fields reject AMX4005 |
| SI exports/imports | S118-SI-01, S118-SI-IMPORT-01 | PASS | 16 dimensions, 50 exported units; exactly four additive rows; imported C/F/K/aliases execute conversion, equality, subtraction, aggregation, and conversion aliases |
| Public output shape | S118-OUTPUT-SHAPE-01 | PASS | JSON `{ value: 20, unit: "celsius" }`; CSV `20 celsius`; no offset/scale/factors/physical fields |
| S116 showTable staging | S118-SHOWTABLE-STAGE-01 | PASS SCOPE AUDIT | False model retains its existing table/accessibility staging; no renderer omission/accessibility output changed; S119 remains owner |

## Diagnostics and Source Ranges

| Case | Expected | Actual code/message/source | Status |
| --- | --- | --- | --- |
| AFF-ADD-01 | AMX3007 at `+` | `Direct addition of affine measurements is not supported`; 6:26 | PASS |
| AFF-MUL-01 | AMX3007 at `*` | `Affine measurement multiplication is not supported`; 6:17 | PASS |
| AFF-DIV-01 | AMX3007 at `/` | `Affine measurement division is not supported`; 6:26 | PASS |
| AFF-POW-01 | AMX3007 at `^`/call | `Affine measurement powers are not supported`; binary 6:26, call 6:15 | PASS |
| AFF-SQRT-01 | AMX3007 at call | Existing dimensional-policy message at 6:15 | PASS |
| AFF-INCOMPAT-01 | Existing AMX3007 | `Cannot convert ... to unit 'meter'`; `in` at 10:25 | PASS |
| AFF-FINITE-01 | AMX3010 static / AMX1009 dynamic | Static `Measurement physical value must be finite` at 5:15; dynamic same message at 6:15 | PASS |
| AFF-CHART-FAIL-01 | AMX3007 with chart/field context | `Chart 'temperatures' measurement cannot be normalized to its first display unit`; series 17:3, declaration 13:1 | PASS |
| AFF-EXTERNAL-COMPOUND-01 | AMX4004 at input unit path | JSON `/unit`; CSV `record[1].temperature`, line 2, column 1 | PASS |
| AFF-EXTERNAL-SHAPE-01 | AMX4005 exact shape | Root data path rejects added/missing `value`/`unit` fields | PASS |

No new stable code may be invented. Exact LF/CRLF, source operator, UTF-16,
JSON pointer, CSV record, and field/declaration secondary context are recorded
when covered by approved fixtures.

## Generated Runtime and Scope Audit

- Production changes: `src/runtime/measurement.ts`, `src/runtime/evaluateExpression.ts`, `src/typechecker/checkDocument.ts`, `src/runtime/externalUnits.ts`, `src/runtime/inputData.ts`, and `src/runtime/outputData.ts`.
- SI/test changes: `libraries/si.amx`, `tests/measurements.test.ts`, `tests/measurementData.test.ts`, `tests/chartModel.test.ts`, `tests/evaluator.test.ts`, and `tests/dimensions.test.ts`.
- Generated path: `src/renderer/diagramBrowserRuntime.ts` changed only through `bun run scripts/build-diagram-runtime.ts`; the one-line generated diff contains 1 insertion/1 deletion.
- Browser-runtime before hash: `81DEB9CFA78001B539E2B20782F0F2888FB6E5D5CA0248DB916730A4B757B876`.
- Browser-runtime after hash: `E70577D4B512D90BFBCC43B8DF4610F8325091F70DBD74701915C88FC39C5A8C`.
- Generator hash: `1F77A4D354D3B3887D453E9B998CD605AB4552C835A56E48A97FD9DC56197552`; repeat generation left the after hash unchanged.
- SI diff has exactly four additions: `celsius`, `fahrenheit`, `degC`, and `degF`; all historical rows remain in the exact 46-row baseline plus the four insertions.
- Chart descriptors remain offset-free; JSON/CSV output remains display `value` plus `unit`.
- HTML/PDF/DOCX/browser table rendering, `showTable` output/accessibility, editor grammar/UI, V0.19 specification, examples, README, migration, package/version, release, publication, deployment, installer, distribution, and certification are unchanged.
- `git diff --check` exited 0. It reported Git's generated-runtime LF/CRLF conversion warning only; there is no whitespace error.

## Reconciliation and Limitations

All 29 post-S117 Sprint 115 runtime AFF cases have executed evidence: AFF-CONV-INVARIANT/REVERSE/ROUNDTRIP/EQUAL, SUB-SAME/SUB-MIX, ADD/MUL/DIV/POW/SQRT, SUM/SUM-MIX/MEAN/MINMAX/ABSROUND/NEG/FINITE/INCOMPAT/NUMBER-REG, CHART/CHART-NULL/CHART-FIRST/CHART-FAIL, DISPLAY, and EXTERNAL/EXTERNAL-ALIAS/EXTERNAL-COMPOUND/EXTERNAL-SHAPE. No case is missing, duplicated, renamed, or left NOT RUN.

S118 internal cases reconcile with executed or scope-audit evidence: S118-UNIT-OFFSET-01, S118-PHYSICAL-01, S118-COMPOSE-01, S118-EMPTY-SUM-01, S118-SI-01, S118-SI-IMPORT-01, S118-OUTPUT-SHAPE-01, S118-CHECKER-FINITE-01, S118-GENERATED-RUNTIME-01, and S118-SHOWTABLE-STAGE-01.

Raw retries were retained and repaired; none are converted to final PASS prose:
- Initial helper construction: 8 pass/1 fail/81 assertions because the evaluator's synthetic unitless unit lacked required offset; zero-offset repair then passed 9/9/102.
- Exact SI inventory before expectation update: 17 pass/1 fail/258 assertions, receiving only the intended four declaration additions; updated test passed 18/18/488.
- Two display fixture retries at 17 pass/1 fail/192 assertions demonstrated ordinary C/F IEEE-754 text; fixtures moved to the exact `273.15 K -> 0 C` invariant without production rounding changes.
- External test-fixture setup: 6 pass/3 fail/65 assertions from single-line type syntax and checker/input fixture mixing; separated metadata/schema and used valid multiline records; final data slice passed 9/9/90.
- Evaluator finite anchor: 108 pass/1 fail/424 assertions; expected column corrected from 1 to the verified expression column 15.
- Central-helper import probe: 2 pass/17 fail/28 assertions after the checker formula replacement preceded its import; missing import repaired and the suite passed 19/19/207 at that stage.
- Incompatible conversion coordinate probes: 18 pass/1 fail/207 assertions exposed the semantic `in` anchor at 10:25; the corrected assertion passed 19/19/209.

Floating C/F-derived values use explicit tolerance; exact identity, display-unit text, unit identity, shape, codes, data paths, and source coordinates use exact assertions. No approved check was unavailable. No residual owner is required.

## Final Recommendation and Disposition

**Builder recommendation: ACCEPT/CLOSED.** Runtime offset metadata and shared conversion helpers, physical conversion/comparison/subtraction/aggregation, affine operation rejection, chart normalization, external atomic/alias/compound handling, exact output shape, SI 16/50 inventory, generated runtime provenance, diagnostics, source ranges, linear regressions, focused tests, typecheck, and patch integrity all pass. No residual is recorded.

**Separate product-owner disposition:** ACCEPTED/CLOSED by the user on 2026-11-21. Sprint 118 is closed with no residual. S119 renderer/editor/specification/example/migration work and every release, package/version, publication, deployment, installer, and certification action remain separately unauthorized.
