# Sprint 117 Builder Evidence: V0.19 Affine Declarations and Unit Metadata

## Status

Sprint 117 implementation completed on 2026-11-21 within the separately
authorized exact baseline, preservation, path, command, and evidence plan.
The checked unit registry now carries required finite affine offsets, and the
declaration resolver separates dimensionless scalar evaluation from affine
unit composition.

**Builder recommendation:** ACCEPT/CLOSED for the authorized Sprint 117
metadata, declaration-resolution, registry, import/re-export/editor, and
focused-diagnostic scope. No S117 residual is recorded.

**Separate product-owner disposition:** PENDING. This recommendation closes no
product gate until the owner records ACCEPTED/CLOSED or BLOCKED/OPEN. No S118
runtime/SI authority follows this execution or recommendation.

## Entry and Baseline

| Evidence item | Status | Record |
| --- | --- | --- |
| Sprint 115 affine contract | VERIFIED ACCEPTED 2026-11-21 | D115-04/05/07/08/09 authoritative; runtime portions remain S118 |
| Sprint 116 chart closeout | VERIFIED ACCEPTED/CLOSED 2026-11-21 | 208/208 focused; no residual affecting S117 |
| Sprint 117 execution authorization | AUTHORIZED | User approved the exact prior baseline, preservation plan, production/test/evidence paths, commands, and amendment stop process on 2026-11-21 |
| Repository baseline | VERIFIED | Branch `feat/create-V0.19`; commit `559994e4f03884285cd9f64f2e0b772075f8104f`; initial `git status --short --branch` showed only the branch line |
| Host/tool versions | RECORDED | Windows workspace; Bun 1.4.4 reported by the final focused runner; TypeScript checked through `bunx tsc --noEmit` |
| Existing artifacts | PRESERVED | No generated output, test result, S115/S116 evidence, release, or user artifact was changed |
| Scope amendments | NONE | No production/test/evidence path outside the approved plan was needed |

## Exact Final Verification

| Check | Exact command | Status |
| --- | --- | --- |
| Dimensions/parser/editor/modules focused suite | `bun test tests/dimensions.test.ts tests/parser.test.ts tests/editor.test.ts tests/modules.test.ts` | PASS; 159 pass, 0 fail, 4 files, 1,233 `expect()` calls, 1.71 s |
| Root no-emit typecheck | `bunx tsc --noEmit` | PASS; exit 0, no output |
| Patch integrity | `git diff --check` | PASS; exit 0, no output after implementation and evidence finalization |
| Scope audit | `git status --short` and approved diff review | PASS; only approved production/test/evidence paths changed |

No requested check was unavailable. Product runtime, renderer, editor-host, SI,
external-data, release, and broad regression suites were not used as substitutes;
they remain outside the authorized Sprint 117 boundary.

## Requirement Evidence Ledger

| S115 declaration case | Status | Exact evidence |
| --- | --- | --- |
| AFF-LINEAR-01 | PASS | Existing identity/vector/scale retained; every V0.18 SI unit asserts offset 0; complete checked registry inventory is 46 units |
| AFF-DECL-CEL-01 | PASS | Celsius registry transform is scale 1, offset 273.15, temperature vector |
| AFF-DECL-FHR-01 | PASS | Fahrenheit registry transform is scale `5 / 9`, offset `273.15 - 160 / 9` |
| AFF-ALIAS-01 | PASS | `degC` and `degF` receive new alias identities/sources while scale/vector/offset equal their affine targets |
| AFF-IMPORT-01 | PASS | Celsius and Fahrenheit scale/offset/vector/identity survive runtime loader, explicit import, re-export, and editor maps |
| AFF-PRECEDENCE-01 | PASS | `2 * kelvin / 4 + PI` and parenthesized form produce scale 0.5, offset `Math.PI`; parser operator sources are 7:17, 7:26, and 7:30 |
| AFF-PI-01 | PASS | PI is accepted as scale and resolves to `Math.PI` |
| AFF-E-01 | PASS | E is accepted in scale and offset scalar positions and resolves to `Math.E` |
| AFF-USER-CONST-01 | PASS | AMX3008 `Unknown or not-yet-declared unit 'factor'` at 5:16; no binding folding |
| AFF-IMPORTED-CONST-01 | PASS | AMX3008 unknown-unit result for imported `factor` at 3:16; runtime and editor imports are not evaluated as constants |
| AFF-FORWARD-01 | PASS | AMX3008 unknown/not-yet-declared result at 4:16 |
| AFF-CALL-01 | PASS | AMX3008 unsupported unit expression at call 5:16; no function execution |
| AFF-TWO-UNIT-ADD-01 | PASS | Unit `+` at 5:23 and unit `-` at 5:24 emit the affine eligibility AMX3008 message |
| AFF-REVERSE-SUB-01 | PASS | AMX3008 at `-` 4:23 with the required left-unit message |
| AFF-SCALE-ZERO-01 | PASS | AMX3008 positive-scale failure at `*` 4:18 |
| AFF-SCALE-NEG-01 | PASS | AMX3008 positive-scale failure at `*` 4:19 |
| AFF-SCALE-INF-01 | PASS | Finite 1e200 unit composition overflows scale and emits AMX3008 at `*` 5:21 |
| AFF-OFFSET-INF-01 | PASS | Two finite 1e308 offsets overflow the effective offset and emit AMX3008 at `+` 5:21 |
| AFF-CYCLE-01 | PASS | Existing module-loader AMX5003 cycle family preserved |
| AFF-DIM-01 | PASS | Squared unit power overflow emits existing dimension-exponent AMX3008 at `^` 5:21 |
| AFF-COMPOUND-01 | PASS | Affine `*`, `/`, scalar-left `/`, and power 2 reject at their combining operators |
| AFF-POWER-IDENTITY-01 | PASS | `celsius ^ 1` retains vector, scale 1, and offset 273.15 |

| S117 internal case | Status | Exact evidence |
| --- | --- | --- |
| S117-SCALAR-01 | PASS | `meter + (273.15 - 300)` stores offset -26.85 |
| S117-SCALAR-02 | PASS | `meter + (2 - 3)` stores offset -1; negative intermediate is not scale-validated |
| S117-SCALAR-NONFINITE-01 | PASS | Zero denominator at 4:27 and arithmetic overflow at 4:227 emit AMX3008 finite-scalar diagnostics |
| S117-SCALAR-ONLY-01 | PASS | Scalar-only `PI` emits AMX3008 at 2:16 |
| S117-POWER-01 | PASS | Non-integer exponent at 4:24 and dimension overflow at 5:21 reject under existing AMX3008 families |
| S117-AFFINE-SCALE-01 | PASS | `2 * celsius` and `celsius / 2` produce `(2, 546.3)` and `(0.5, 136.575)` |
| S117-LINEAR-COMPOUND-01 | PASS | `meter / second` and `2 / second` preserve vectors/scales with offset 0 |
| S117-BASE-01 | PASS | Base units store scale 1 and offset 0 with base uniqueness unchanged |
| S117-METADATA-01 | PASS | Every constructed checked unit in the complete registry and SI inventory has a finite numeric offset |
| S117-NAME-01 | PASS | Alias receives its own module/name/identity/source while copying transform metadata |
| S117-SOURCE-01 | PASS | Invalid affine `+`, `-`, `*`, `/`, `^`, scalar, scale, offset, and overflow fixtures assert exact primary 1-based line/column; LF and CRLF parity passes at 5:23 |
| S117-EDITOR-01 | PASS | Editor import map has the same Celsius/Fahrenheit scale, offset, vector, and identity as runtime loader |
| S117-REEXPORT-01 | PASS | Bridge re-export preserves Celsius/Fahrenheit metadata and base-vector identity |
| S117-NORUNTIME-01 | PASS SCOPE AUDIT / RUNTIME NOT RUN | No measurement, conversion, arithmetic, aggregate, chart, external-unit, or display consumer changed |
| S117-NOSI-01 | PASS SCOPE AUDIT | Exact V0.18 SI inventory remains 16 dimensions/46 units; every unit offset is 0; `libraries/si.amx` is unchanged |

## Diagnostic Evidence

All declaration eligibility/finite/scale/offset/call/name failures reuse AMX3008;
module cycle reuse remains AMX5003. No stable diagnostic code was allocated or
invented.

| Case | Actual code/message/source | Status |
| --- | --- | --- |
| User/forward/imported constant | AMX3008 `Unknown or not-yet-declared unit '<name>'` at 5:16, 4:16, and imported 3:16 | PASS |
| AFF-CALL-01 | AMX3008 `Unit expressions may use only finite scalars, visible units, PI, E, +, -, *, /, and signed integer powers` at 5:16 | PASS |
| AFF-TWO-UNIT-ADD-01 | AMX3008 `Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar` at `+` 5:23 and `-` 5:24 | PASS |
| AFF-REVERSE-SUB-01 | AMX3008 `Unit declaration subtraction requires the unit term on the left` at 4:23 | PASS |
| AFF-SCALE-* | AMX3008 `Unit scale must be finite and greater than zero` at zero 4:18, negative 4:19, overflow 5:21 | PASS |
| AFF-OFFSET-INF-01 | AMX3008 `Unit offset must be finite` at 5:21 | PASS |
| AFF-COMPOUND-01 | AMX3008 `Affine units may not be multiplied, divided, or raised to non-identity powers in declarations` at affine `*`/`/` 7:24, scalar-left `/` 5:18, and `^` 5:24 | PASS |
| S117-SCALAR-NONFINITE-01 | AMX3008 `Unit expression scalar division requires a non-zero denominator` at 4:27; `Unit expression scalar must be finite` at overflow 4:227 | PASS |
| S117-SCALAR-ONLY-01 | AMX3008 `A derived unit must reference at least one visible unit` at 2:16 | PASS |
| S117-POWER-01 | AMX3008 signed-integer power at 4:24; dimension exponent range at 5:21 | PASS |
| AFF-CYCLE-01 | AMX5003 `Import cycle detected: ...` from existing module path | PASS |

Parser/operator `SourceLocation` values and diagnostic lines/columns follow the
existing 1-based, UTF-16 column convention. Complete-document LF and CRLF affine
error fixtures execute identically. The accepted S117 fixtures contain no
non-BMP identifier context after which a later valid declaration operator can
be parsed, so a separate S117 non-BMP diagnostic fixture was not applicable.

## Scope and Boundary Audit

- Production paths changed: `src/typechecker/dimensionTypes.ts` and
  `src/typechecker/checkDocument.ts`.
- Test paths changed: `tests/dimensions.test.ts` and `tests/parser.test.ts`.
- Evidence path changed: this file.
- `tests/editor.test.ts` and `tests/modules.test.ts` were executed unchanged;
  integration ownership remained in `tests/dimensions.test.ts`.
- Runtime `MeasurementUnit`, `unitFromMetadata`, conversion, arithmetic,
  aggregates, chart normalization, external-unit parsing, scalar/table display,
  and runtime PI/E resolution are unchanged.
- `libraries/si.amx`, editor UI/grammar, renderer, chart/showTable, V0.19
  specification, README, examples, migration docs, package/version, generated
  artifacts, release, publication, deployment, installer, distribution, and
  certification are unchanged.
- Registry offset metadata exists only as checked-unit declaration metadata in
  S117; no runtime conversion or attachment claim is made.
- No unapproved production/test/evidence path and no scope amendment was used.

## Reconciliation and Limitations

- All 22 Sprint 115 declaration AFF IDs assigned to S117 have executed evidence
  above. No ID is missing, duplicated, or renamed in the ownership ledger.
- All 15 S117 scalar, metadata, integration, source, staging, and scope IDs have
  executed or explicit scope-audit evidence above.
- The exact final command is 159 pass, 0 fail, 1,233 assertions across four
  files. Final typecheck exits 0 with no output.
- No check was skipped or unavailable in the final approved command set.
- Initial implementation retries are retained as raw execution evidence:
  - Initial metadata/resolver probe: `bun test tests/dimensions.test.ts` passed
    11/11 and 176 assertions before affine tests were added.
  - Initial `bunx tsc --noEmit` exposed 17 local union-narrowing errors; the
    resolver branches were made explicit and the immediate retry exited 0.
  - First expanded matrix run was 15 pass/2 fail/302 assertions: scientific
    notation was not an accepted numeric literal and one power column was
    test-expected at 22 instead of actual exponent 24. Fixtures were corrected;
    no production behavior was changed for those failures.
  - Dimension-overflow fixture retries produced 16 pass/1 fail/320 assertions
    because the selected exponent still yielded a safe integer. The exponent was
    corrected to the first unsafe doubled result; the suite then passed 17/17
    with 324 assertions.
  - All final approved commands were rerun after the corrections and final
    exact-location assertions.
- Runtime loader/editor affine metadata parity passes with no unresolved
  discrepancy.
- SI inventory, linear scales/vectors/identities, import visibility,
  base-unit uniqueness, and AMX5003 cycle behavior regressions pass.
- No S117 residual remains. Sprint 118 still independently owns runtime affine
  conversion/arithmetic/aggregate/chart/external/SI behavior.

## Final Recommendation and Disposition

**Builder recommendation: ACCEPT/CLOSED.** The exact focused suite, no-emit
typecheck, patch integrity, source ranges, registry values, module/editor
parity, SI/linear regressions, and changed-path audit pass. No residual requires
owner acceptance and no production boundary was crossed.

**Separate product-owner disposition:** PENDING. The distinct owner action must
record ACCEPTED/CLOSED or BLOCKED/OPEN for Sprint 117. This recommendation does
not authorize Sprint 118 runtime/SI work, and it does not authorize release,
package/version change, publication, deployment, installer, distribution, or
certification.
