# Sprint 117 Builder Evidence: V0.19 Affine Declarations and Unit Metadata

## Status

**Architect preparation only.** Sprint 117 implementation has not been
separately authorized or performed. This template must be populated during
approved execution; all preparation statuses below are not production evidence.

**Builder recommendation:** NOT READY FOR IMPLEMENTATION UNTIL SEPARATELY
AUTHORIZED. Sprint 115 and Sprint 116 are accepted, but neither disposition
executes S117.

**Separate product-owner disposition:** PENDING; no S117 implementation or S118
runtime authority follows this package.

## Entry and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| Sprint 115 affine contract | VERIFIED ACCEPTED 2026-11-21 | D115-04/05/07/08/09 authority; S118 runtime portions remain downstream |
| Sprint 116 chart closeout | VERIFIED ACCEPTED 2026-11-21 | 208/208 focused, no residual, unrelated to S117 files |
| Sprint 117 execution authorization | NOT RUN | Approver, date, exact baseline/file/command/evidence/output plan |
| Repository baseline | NOT RECORDED | Branch, commit, clean/dirty inventory, preservation hashes/paths |
| Host/tool versions | NOT RECORDED | OS/architecture, Bun/Node/PowerShell/Git/TypeScript as relevant |
| Approved changed paths | NOT RECORDED | Final source/test/evidence scope and amendments |

## Candidate Focused Verification

| Check | Candidate command | Preparation status |
| --- | --- | --- |
| Dimensions/parser/editor/modules focused suite | `bun test tests/dimensions.test.ts tests/parser.test.ts tests/editor.test.ts tests/modules.test.ts` | NOT RUN; exact approved selection required |
| Root no-emit typecheck | `bunx tsc --noEmit` | NOT RUN |
| Patch integrity | `git diff --check` | NOT RUN for implementation |
| Scope audit | `git status --short` and approved diff | NOT RUN |

Record exact test/pass/fail/assertion counts, command durations, raw failures,
retries, unavailable checks, and any narrower reruns required for diagnostics.
No broad runtime/renderer/editor-host suite is a substitute for S117 registry
qualification.

## Requirement Evidence Ledger

| Requirement | Case IDs | Status | Exact evidence/command |
| --- | --- | --- | --- |
| UnitMetadata offset/base/linear | AFF-LINEAR-01, S117-BASE-01, S117-METADATA-01 | NOT RUN | Record all registry assertions |
| Celsius/Fahrenheit metadata and precedence | AFF-DECL-CEL-01, AFF-DECL-FHR-01, AFF-PRECEDENCE-01 | NOT RUN | Record exact scale/offset values |
| Aliases/imports/re-exports/editor | AFF-ALIAS-01, AFF-IMPORT-01, S117-NAME-01, S117-REEXPORT-01, S117-EDITOR-01 | NOT RUN | Record runtime/editor metadata parity |
| PI/E declaration allowlist | AFF-PI-01, AFF-E-01, AFF-USER-CONST-01, AFF-IMPORTED-CONST-01, AFF-CALL-01 | NOT RUN | Record accepted/rejected identifiers and no folding |
| Affine plus/minus/scaling | AFF-TWO-UNIT-ADD-01, AFF-REVERSE-SUB-01, S117-AFFINE-SCALE-01, S117-SCALAR-01/02 | NOT RUN | Record operator outcomes and transform pairs |
| Affine compound/power restrictions | AFF-COMPOUND-01, AFF-POWER-IDENTITY-01, S117-LINEAR-COMPOUND-01 | NOT RUN | Record AMX3008 and regressions |
| Finite/scale/offset/scalar validation | AFF-SCALE-ZERO-01, AFF-SCALE-NEG-01, AFF-SCALE-INF-01, AFF-OFFSET-INF-01, S117-SCALAR-NONFINITE-01, S117-SCALAR-ONLY-01 | NOT RUN | Record code/message/operator source |
| Order/dimension/cycle | AFF-FORWARD-01, AFF-DIM-01, AFF-CYCLE-01, AFF-POWER-IDENTITY-01, S117-POWER-01 | NOT RUN | Record resolver/module error phase |
| Runtime staging | S117-NORUNTIME-01, S117-NOSI-01 | OUT OF SCOPE / NOT RUN | Confirm no measurement/SI/runtime consumer changes |

## Diagnostic Evidence

| Case | Expected | Actual code/message/source | Status |
| --- | --- | --- | --- |
| AFF-USER-CONST-01 / AFF-IMPORTED-CONST-01 / AFF-FORWARD-01 | AMX3008 unknown/not-yet-declared unit | NOT RECORDED | NOT RUN |
| AFF-CALL-01 | AMX3008 unsupported unit expression | NOT RECORDED | NOT RUN |
| AFF-TWO-UNIT-ADD-01 / AFF-REVERSE-SUB-01 | AMX3008 eligibility at operator | NOT RECORDED | NOT RUN |
| AFF-SCALE-ZERO-01 / NEG / INF | AMX3008 finite positive scale | NOT RECORDED | NOT RUN |
| AFF-OFFSET-INF-01 | AMX3008 finite offset | NOT RECORDED | NOT RUN |
| AFF-COMPOUND-01 | AMX3008 affine composition prohibition | NOT RECORDED | NOT RUN |
| S117-SCALAR-NONFINITE-01 | AMX3008 finite scalar/zero denominator | NOT RECORDED | NOT RUN |
| AFF-CYCLE-01 | Existing AMX5003 module-cycle family | NOT RECORDED | NOT RUN |

No stable diagnostic code may be invented. Any allocation need blocks affected
implementation until separately recorded by the Lead Developer.

## Scope and Boundary Audit

Record during closeout:

- Core production paths changed: `src/typechecker/dimensionTypes.ts` and
  `src/typechecker/checkDocument.ts`, plus exact approved compatibility paths.
- Test paths changed and no unrelated files changed.
- Runtime `MeasurementUnit`, `unitFromMetadata`, conversion/arithmetic/aggregate,
  external unit parser, chart normalization, and scalar display: UNCHANGED.
- `libraries/si.amx`, editor UI/grammar, specification/example/migration,
  package/release/publication/deployment/certification: UNCHANGED.
- Registry offset metadata exists but is not consumed by runtime behavior in
  S117; no success-shaped conversion claim is made.
- Any file outside plan requires exact approval record; otherwise it is a scope
  failure.

## Reconciliation and Limitations

At closeout, record:

- all 22 S115 declaration AFF cases assigned to S117 and their evidence paths;
- S117 scalar/staging IDs and diagnostic ownership;
- missing/duplicate/renamed IDs and exact resolution;
- all raw commands, pass/fail counts, assertions, retries, unavailable checks;
- complete-document LF/CRLF and UTF-16 diagnostic coordinates where tested;
- runtime loader/editor metadata parity and any unresolved discrepancy;
- exact current SI inventory comparison and no new temperature declaration;
- residual owners and S118 impact.

## Final Recommendation and Disposition

At authorized execution completion, replace this section with:

- Builder recommendation: ACCEPT/CLOSED, ACCEPT WITH RECORDED RESIDUALS, or
  BLOCKED/OPEN;
- exact focused test/type/patch/scope outcomes;
- named accepted residuals, if any;
- separate product-owner disposition and date;
- explicit statement that S118 runtime/SI implementation, release, package,
  publication, deployment, and certification are not authorized by the S117
  disposition unless separately approved.
