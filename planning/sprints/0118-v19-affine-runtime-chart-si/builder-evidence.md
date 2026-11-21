# Sprint 118 Builder Evidence: V0.19 Affine Runtime, Charts, External Data, and SI

## Status

**Architect preparation only.** Sprint 118 implementation has not been
separately authorized or performed. This template must be completed during
approved execution; preparation values are not product evidence.

**Builder recommendation:** NOT READY FOR IMPLEMENTATION UNTIL SEPARATELY
AUTHORIZED. Sprint 117 and its registry gate are accepted, but no S118 runtime,
SI, external, chart-normalization, or generated-output work is authorized.

**Separate product-owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| Sprint 115 operation/data/diagnostic contract | VERIFIED ACCEPTED 2026-11-21 | D115-06/08/09 authoritative |
| Sprint 117 affine declaration gate | VERIFIED ACCEPTED 2026-11-21 | 159 pass, 0 fail; offset metadata complete; no residual |
| Sprint 118 execution authorization | NOT RUN | Exact approver/date/baseline/path/command/generated-output/evidence plan |
| Repository baseline | NOT RECORDED | Branch, commit, dirty-state inventory, generated/runtime preservation |
| Host/tool versions | NOT RECORDED | OS/architecture, Bun/Node/PowerShell/Git/TypeScript as relevant |
| Approved changed paths | NOT RECORDED | Core, conditional, test, SI, generated, evidence scope plus amendments |

## Candidate Focused Verification

| Check | Candidate command | Status |
| --- | --- | --- |
| Runtime/data/chart/dimensions suite | `bun test tests/measurements.test.ts tests/measurementData.test.ts tests/chartModel.test.ts tests/evaluator.test.ts tests/dimensions.test.ts` | NOT RUN; exact approval required |
| Root no-emit typecheck | `bunx tsc --noEmit` | NOT RUN |
| Diagram runtime generation | `bun run scripts/build-diagram-runtime.ts` | NOT RUN; only if exact generated-output scope approves |
| Root build | `bun run build` | NOT RUN; only if exact approved plan requires regenerated browser runtime and compiler |
| Patch integrity/scope audit | `git diff --check`, `git status --short`, generated-file diff | NOT RUN |

Record exact commands, pass/fail/assertion counts, build outputs, hashes, raw
failures, retries, unavailable checks, and changed paths. Broader renderer,
editor, desktop, extension, release, or platform suites are not substitutes.

## Runtime and Operation Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| Offset runtime unit and shared helpers | S118-UNIT-OFFSET-01, S118-PHYSICAL-01, S118-COMPOSE-01 | NOT RUN | Record unit object, helper golden values, frozen regression |
| Conversion/equality/order | AFF-CONV-INVARIANT-01, AFF-CONV-REVERSE-01, AFF-ROUNDTRIP-01, AFF-EQUAL-01 | NOT RUN | Record C/F/K outputs/tolerance/unit identity |
| Subtraction and unsupported operations | AFF-SUB-SAME-01, AFF-SUB-MIX-01, AFF-ADD-01, AFF-MUL-01, AFF-DIV-01, AFF-POW-01, AFF-SQRT-01 | NOT RUN | Record exact values/codes/sources |
| Aggregates and unary display | AFF-SUM-01, AFF-SUM-MIX-01, AFF-MEAN-01, AFF-MINMAX-01, AFF-ABSROUND-01, AFF-NEG-01, S118-EMPTY-SUM-01 | NOT RUN | Record physical aggregate and units |
| Finite/incompatibility/linear regression | AFF-FINITE-01, AFF-INCOMPAT-01, AFF-NUMBER-REG-01, S118-CHECKER-FINITE-01 | NOT RUN | Record phase/code and old behavior |

## Chart, External, SI, and Output Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| Physical chart normalization | AFF-CHART-01, AFF-CHART-NULL-01, AFF-CHART-FIRST-01, AFF-CHART-FAIL-01 | NOT RUN | Record normalized values/headings/descriptors/nulls/source ranges |
| Scalar/table/narrative display | AFF-DISPLAY-01 | NOT RUN | Record no canonical physical leak |
| External atomic/alias/compound/shape | AFF-EXTERNAL-01, AFF-EXTERNAL-ALIAS-01, AFF-EXTERNAL-COMPOUND-01, AFF-EXTERNAL-SHAPE-01 | NOT RUN | Record JSON/CSV codes and paths |
| SI exports/imports | S118-SI-01, S118-SI-IMPORT-01 | NOT RUN | Record 16 dimensions/50 units and four transforms |
| Public output shape | S118-OUTPUT-SHAPE-01 | NOT RUN | Record exact JSON/CSV values and absent offset/scale fields |
| S116 showTable staging | S118-SHOWTABLE-STAGE-01 | NOT RUN / scope audit | No visibility output change; renderer omission remains S119 |

## Diagnostics and Source Ranges

| Case | Expected | Actual code/message/source | Status |
| --- | --- | --- | --- |
| AFF-ADD-01 | AMX3007 at `+` | NOT RECORDED | NOT RUN |
| AFF-MUL-01 / AFF-DIV-01 | AMX3007 at `*`/`/` | NOT RECORDED | NOT RUN |
| AFF-POW-01 / AFF-SQRT-01 | AMX3007 at `^`/call | NOT RECORDED | NOT RUN |
| AFF-INCOMPAT-01 | Existing AMX3007 | NOT RECORDED | NOT RUN |
| AFF-FINITE-01 | AMX3010 static / AMX1009 dynamic / AMX3007 chart | NOT RECORDED | NOT RUN |
| AFF-CHART-FAIL-01 | AMX3007 with chart/field context | NOT RECORDED | NOT RUN |
| AFF-EXTERNAL-COMPOUND-01 | AMX4004 at input unit path | NOT RECORDED | NOT RUN |
| AFF-EXTERNAL-SHAPE-01 | AMX4005 exact shape | NOT RECORDED | NOT RUN |

No new stable code may be invented. Exact LF/CRLF, source operator, UTF-16,
JSON pointer, CSV record, and field/declaration secondary context are recorded
when covered by approved fixtures.

## Generated Runtime and Scope Audit

Record at closeout:

- Approved source paths actually changed and why.
- SI diff contains exactly the four additive exports/declarations.
- Runtime `MeasurementUnit`, helpers, evaluator, external parser, and any output/
  checker compatibility changes stay inside approved plan.
- If `src/renderer/diagramBrowserRuntime.ts` changes, exact generator command,
  before/after hash, and confirmation it was not hand-edited.
- HTML/PDF/DOCX/browser table rendering, `showTable` output/accessibility, editor
  grammar/UI, specification/example/migration, package/release/publication,
  deployment, installer, distribution, and certification remain unchanged.
- External public shape remains exactly display value/unit text.

## Reconciliation and Limitations

During execution, report all 29 remaining Sprint 115 AFF cases, internal S118
IDs, missing/duplicate/renamed IDs, every raw command, focused test counts,
retries, skipped/unavailable checks, exact SI inventory, affine arithmetic
tolerance, generated-file changes, and residual owners.

## Final Recommendation and Disposition

At authorized completion, replace this section with Builder recommendation
(ACCEPT/CLOSED, ACCEPT WITH RECORDED RESIDUALS, or BLOCKED/OPEN), exact runtime/
SI/external/chart evidence, residuals and owners, and the separate product-owner
disposition. State explicitly that S119 renderer/editor/spec/example/migration
and all release work remain separately unauthorized.
