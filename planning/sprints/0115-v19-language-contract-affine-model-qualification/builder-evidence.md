# Sprint 115 Builder Evidence: V0.19 Language Contract and Affine Model Qualification

## Status

Sprint 115 execution completed on 2026-11-21 within the separately authorized
read-only audit and planning-artifact scope. No production implementation or
product test was executed or changed.

**Builder recommendation:** ACCEPT/CLOSED for the Sprint 115 contract package,
subject to a separate product-owner disposition. The recommendation accepts
planning and arithmetic qualification evidence only; it does not claim current
parser, checker, runtime, chart, renderer, editor, external-data, or release
behavior.

**Separate product-owner disposition:** PENDING. Sprint 116 and Sprint 117
remain BLOCKED/OPEN until the product owner accepts the chart and affine
declaration contracts. Sprint 118 remains additionally gated by D115-08.

## Authorization and Baseline

| Evidence item | Status | Record |
| --- | --- | --- |
| Sprint 115 execution authorization | AUTHORIZED | User instructed `Proceed with implementation` on 2026-11-21 for the exact previously presented planning/qualification plan; the plan is interpreted as non-production Sprint 115 execution |
| Sprint 114/V0.18 closeout prerequisite | SOURCE VERIFIED | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-01; raw residuals unchanged and not reclassified |
| Repository baseline | VERIFIED | Branch `feat/create-V0.19`; commit `38627d8d783a2e99509eed79a75628451c271312`; initial `git status --short --branch` showed only the branch line |
| Host | RECORDED | Windows 10.0.26300, x64, 16 logical processors |
| Tool versions | RECORDED | Bun 1.4.4; Node 24.13.1; Windows PowerShell 5.1.26100.9818; Git 2.56.1.windows.1 |
| Existing generated/shared artifacts | PRESERVED | No generated, test, spec, example, editor, SI-library, manifest, release, or production file was written |

The initial and final baseline gates use `git status --short --branch`,
`git rev-parse HEAD`, and `git branch --show-current`. A baseline mismatch would
have stopped execution before the first artifact write.

## Exact Command Record

- `git status --short --branch` -> `## feat/create-V0.19`
- `git rev-parse HEAD` -> `38627d8d783a2e99509eed79a75628451c271312`
- `git branch --show-current` -> `feat/create-V0.19`
- Read-only source review/search was limited to the approved AST/parser/checker,
  registry, runtime, chart/model/renderer, external-data, SI, V0.18 spec/example,
  and focused-test surfaces.
- `bun run planning/sprints/0115-v19-language-contract-affine-model-qualification/artifacts/probes/s115-affine-arithmetic-probe.ts`
  -> exit 0; raw output in `artifacts/outputs/s115-affine-arithmetic.json`.
- Package-local PowerShell ID extraction/reconciliation -> 68 qualification
  rows, 68 distinct IDs, no duplicates, no missing matrix IDs; raw generated
  summary in `artifacts/outputs/s115-id-reconciliation.json`.
- Contract validation PowerShell procedure -> PASS for 68 IDs, browser payload
  omission, accessibility `tableId` omission, and phase-specific diagnostics.
- `pwsh -NoProfile -Command ...` -> UNAVAILABLE; `pwsh` is not installed. Retry
  through active Windows PowerShell succeeded with version 5.1.26100.9818.
- Product test suites, root build, parser/runtime/render execution, extension
  host tests, desktop checks, release commands, and publication commands were
  NOT RUN by the approved Sprint 115 boundary.
- Exact command details and limitations are also recorded in
  `artifacts/logs/s115-execution-log.md`.

## Contract and Source Review Evidence

- Confirmed master-plan requirements are separated in the contracts and matrix
  from current-source observations and candidate technical refinements.
- Chart source fact: current AST options have title, description, field, and
  series nodes only; parser option lines are restricted to existing forms;
  duplicate options are checked with `AMX3005`; chart emission and shared model
  have no `showTable` field.
- Renderer source fact: interactive HTML emits a chart table and serializes the
  full table model in chart JSON; PDF always appends a table; DOCX adds a table
  on rendered and fallback chart paths. Shared accessibility currently includes
  a mandatory table identity. Therefore production chart omission is absent at
  the Sprint 115 baseline.
- Unit source fact: `UnitMetadata`, declaration resolution, runtime measurement
  units, and all physical conversion sites are scale-only. The resolver accepts
  positive numeric literals, visible units, `*`, `/`, and signed integer
  powers; PI/E are runtime identifiers only and are not declaration constants.
- Runtime source fact: conversion, comparison, subtraction/addition,
  multiplication, powers, aggregates, scalar normalization, and chart
  normalization use `value * scale`. The contract records every site that S117
  or S118 must move to the shared affine formula.
- External-data source fact: JSON measurements require exactly the two fields
  `{ value, unit }` under `AMX4005`; malformed/unknown compound unit text uses
  `AMX4004`; the parser currently supports visible unit atoms, `1`, `*`, `/`,
  parentheses, and signed integer powers.
- SI/spec/example source fact: `libraries/si.amx` contains Kelvin but no Celsius
  or Fahrenheit; V0.18 specification is additive diagram-only; Example 05 uses
  scale-only units and Example 07 relies on current implicit chart-table output.
- Published specification/example/editor/release evidence remains OUT OF SCOPE.

## Qualification Evidence

| Check | Command / method | Raw outcome | Limitation / disposition |
| --- | --- | --- | --- |
| $0\,C=32\,F=273.15\,K$ | Isolated arithmetic probe | Physical values all exactly evaluated as `273.15` K | ARITHMETIC EVIDENCE ONLY |
| Forward/reverse conversion | Isolated arithmetic probe | C/F/K formula recorded with tolerance `1e-10` | No OpenAMX conversion execution |
| Round trips | Isolated arithmetic probe at `-40`, `0`, `20`, `21.25` C | C->F->C and C->K->C passed; final unit identity retained | No parser/runtime evidence |
| Declaration precedence/composition | Isolated arithmetic metadata calculation | `2 / 4` scale `0.5`; PI offset `3.141592653589793` | S117 checker is NOT RUN |
| Same/mixed subtraction | Isolated arithmetic probe | `20 C - 10 C = 10 C`; `32 F - 20 C = -36 F` | S118 runtime is NOT RUN |
| `sum` | Isolated arithmetic probe | `sum([10 C, 20 C]) = 303.15 C` | Exceptional physical aggregate; no runtime evidence |
| `mean` | Isolated arithmetic probe | Mixed physical mean `15.616666666666674 C` for 10 C, 50 F, 300 K | Arithmetic evidence only |
| Direct affine operations | Policy/source review | AFF-ADD/MUL/DIV/POW/SQRT marked REJECT-POLICY-ONLY | Parser/checker/runtime diagnostics NOT RUN |
| PI/E declaration allowlist | Numeric metadata plus source review | Runtime values verified as `Math.PI`/`Math.E`; declaration acceptance NOT RUN | No arbitrary constant folding authorized |
| External shape/compound policy | Source audit and D115-08 contract | Exact `{ value, unit }` verified; affine compound factor resolved as REJECT | No external-data runtime test |
| Chart omitted/false/true/dynamic cases | Source audit and stable cases CHT-* | Contract complete; false browser JSON/accessibility now explicit | S116/S119 output behavior NOT RUN |

Raw arithmetic output is in `artifacts/outputs/s115-affine-arithmetic.json`.
Rejected-operation rows are not passing product tests; user/imported/call
constant cases are not parser evidence; no arithmetic result is presented as
renderer, parser, checker, or release evidence.

## Decision Recommendations

| Decision | Builder resolution | Raw evidence/status | Next owner |
| --- | --- | --- | --- |
| D115-01 | ACCEPT proposal: single line, remainder expression, no colon | Source parser boundary and complete CHT cases | Product owner |
| D115-02 | ACCEPT proposal: typecheck in declaration environment; evaluate once at `show` snapshot | Source snapshot path and CHT-ENV-01 | Product owner / S116 |
| D115-03 | ACCEPT proposal: shared Boolean plus actual omission, no table-specific browser JSON, no dangling accessibility reference | Current HTML/PDF/DOCX source audit; all output cases defined | Product owner / S119 |
| D115-04 | ACCEPT proposal: one affine term plus one finite scalar; allow scalar-left `+`; reject scalar-left `-` and two-unit forms | Fahrenheit derivation and AFF-PRECEDENCE/TWO-UNIT/REVERSE-SUB cases | Product owner; blocks S117 |
| D115-05 | ACCEPT proposal: affine scalar scaling/division, identity power 1; reject nonzero-offset unit composition and other affine powers | Affine transform algebra and compound cases | Product owner; blocks S117 |
| D115-06 | ACCEPT operation matrix, including subtraction, rejected direct addition, physical `sum`/`mean`, selection and display rules | Probe plus source locations of all affected runtime paths | Product owner / S118 |
| D115-07 | ACCEPT PI/E declaration-only allowlist | `Math.PI`/`Math.E` equality to runtime constants; user/import/call/forward exclusions explicit | Product owner / S117 |
| D115-08 | ACCEPT unchanged `{ value, unit }`; reject an affine factor in compound external text | Exact input shape source verified; external parser boundary audited | Product owner; blocks S118 |
| D115-09 | ACCEPT phase-specific reuse: AMX3006/1/2/3/5/7/8, AMX3010 static finite, AMX1009 dynamic finite, AMX4004/5 | No new stable code allocated; exact new messages/ranges remain downstream evidence | Lead Developer diagnostic allocator, then owner |

All nine decisions are technically resolved for owner disposition. None is
silently treated as an accepted owner decision. S116/S117 remain gated by the
separate owner result; S118 also requires accepted D115-08.

## ID Reconciliation and Diagnostics

- Qualification rows: 68 distinct (`17` CHT, `51` AFF), with zero duplicate
  definitions.
- Requirement matrix references all 68 distinct qualification IDs; zero
  qualification IDs are missing.
- Diagnostic matrix references 29 distinct case IDs and no diagnostic ID is
  absent from the qualification cases. Repeated AFF-FINITE-01 rows are the
  intentionally distinct static/runtime/chart phases of one case.
- V19-S115-01 uses aggregate range wording, but all individual chart case IDs
  are present elsewhere in the matrix. This is recorded as a readability note,
  not a missing/hidden row.
- Exact V0.19 source coordinates are NOT VERIFIED. No production parser/checker
  creates complete fixtures in Sprint 115, so current rejection locations and
  messages are not claimed as final V0.19 diagnostics.
- No case requires a new product implementation file in Sprint 115. Downstream
  test fixtures belong to S116-S120 under separate authorization.

## Scope and Residual Register

- Changes are confined to this Sprint 115 folder and the approved artifact roots.
- Production source, tests, generated artifacts, editors/providers, SI library,
  published specifications, examples, README, package manifests, release files,
  global planning ledgers, and product state: UNCHANGED.
- Sprint 114 raw failures, retries, skipped checks, and residual statuses:
  UNCHANGED and outside this sprint's disposition.
- ShowTable parser/checker/evaluation/model/output checks: NOT RUN by mandatory
  boundary; no source-coordinate claim.
- Affine parser/checker/runtime/SI/chart/external/render checks: NOT RUN by
  mandatory boundary; arithmetic evidence is not implementation evidence.
- PowerShell 7 availability: UNAVAILABLE on this host; active Windows
  PowerShell 5.1 was recorded. No product check was affected.
- Public external measurement shape: preserved as `{ value, unit }` under
  D115-08; scale and offset remain internal metadata.
- No release, publication, package/version change, deployment, installer,
  distribution, or platform certification is authorized.

## Final Recommendation and Disposition

**Builder recommendation: ACCEPT/CLOSED** for the Sprint 115 language-contract
and affine-model qualification package. The chart and affine contracts are
complete and internally reconciled, the canonical formulas are arithmetically
qualified, all 68 stable cases are traceable, and D115-01 through D115-09 have
explicit dispositions ready for owner review.

**Separate product-owner disposition:** PENDING. Only a distinct product-owner
`ACCEPTED/CLOSED` or `BLOCKED/OPEN` decision may close this gate. This Builder
recommendation does not authorize S116, S117, S118, implementation, release,
publication, package/version changes, deployment, or certification.
