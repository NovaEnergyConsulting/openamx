# Sprint 115 Requirement-to-Evidence Matrix

## Status and Usage

Architect-prepared traceability draft. `CANDIDATE` means the package defines a
testable rule but no separate Sprint 115 disposition has accepted it. `NOT RUN`
means current V0.19 production behavior was not implemented or exercised by
this planning preparation. A source observation is not a passing feature
test.

Every master-plan Sprint 115 bullet maps to at least one stable case, contract
rule, diagnostic, decision, or explicit compatibility audit. Downstream
sprints retain the case IDs in their test and evidence records.

| Requirement ID | Confirmed requirement | Contract / case IDs | Downstream owner | Preparation status |
| --- | --- | --- | --- | --- |
| V19-S115-01 | Convert chart decisions into executable syntax, typing, evaluation, rendering, and diagnostics | CHT-OMIT-01 through CHT-OUTPUT-TRUE-01; D115-01/02/03/09 | S116/S119 | CANDIDATE; NOT RUN |
| V19-S115-02 | Define `showTable` parse shape, any Boolean expression, and table-option exclusion | CHT-EXPR-01, CHT-KIND-01, CHT-PARSE-01, CHT-TABLE-01; D115-01 | S116 | CANDIDATE; parser feature absent |
| V19-S115-03 | Define Boolean typing and normal expression/name environment | CHT-TYPE-01, CHT-NAME-01 | S116 | CANDIDATE; static checker feature absent |
| V19-S115-04 | Define evaluation once per chart emission and dynamic environment timing | CHT-ENV-01; D115-02 | S116 | CANDIDATE; production emission field absent |
| V19-S115-05 | Define omitted false and duplicate-option behavior | CHT-OMIT-01, CHT-FALSE-01, CHT-TRUE-01, CHT-DUP-01, CHT-PARSE-01 | S116 | CANDIDATE; no `showTable` AST option |
| V19-S115-06 | Define exact output omission and all-output consistency without hidden markup | CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01, CHT-OUTPUT-OMISSION-01, CHT-OUTPUT-TRUE-01; D115-03 | S119/S120 | CANDIDATE; current outputs always emit tables |
| V19-S115-07 | Define migration from implicit V0.18 table to explicit true | CHT-DEFAULT-MIGRATION-01 | S119/S120 | CANDIDATE; documentation update owned later |
| V19-S115-08 | Formalize $p=v\times scale+offset$, inverse conversion, and display/physical distinction | AFF-CONV-INVARIANT-01, AFF-CONV-REVERSE-01, AFF-ROUNDTRIP-01, AFF-DISPLAY-01 | S117/S118 | CANDIDATE; current runtime scale-only |
| V19-S115-09 | Define affine declaration precedence and accepted `+`/`-` forms | AFF-PRECEDENCE-01, AFF-TWO-UNIT-ADD-01, AFF-REVERSE-SUB-01; D115-04 | S117 | CANDIDATE; product review required |
| V19-S115-10 | Preserve multiplication/division/power behavior and define affine composition | AFF-LINEAR-01, AFF-COMPOUND-01, AFF-POWER-IDENTITY-01; D115-05 | S117 | CANDIDATE; offset metadata absent |
| V19-S115-11 | Define scale/offset finite, positive-scale, cycle, import, alias, and identity rules | AFF-SCALE-ZERO-01, AFF-SCALE-NEG-01, AFF-SCALE-INF-01, AFF-OFFSET-INF-01, AFF-CYCLE-01, AFF-ALIAS-01, AFF-IMPORT-01, AFF-FORWARD-01, AFF-DIM-01 | S117 | CANDIDATE; source baseline verified |
| V19-S115-12 | Resolve only built-in PI/E in unit declarations | AFF-PI-01, AFF-E-01, AFF-USER-CONST-01, AFF-IMPORTED-CONST-01, AFF-CALL-01; D115-07 | S117 | CANDIDATE; production declaration resolver does not allow constants |
| V19-S115-13 | Define conversion, equality, ordering, and compatible dimension behavior | AFF-CONV-INVARIANT-01, AFF-EQUAL-01, AFF-INCOMPAT-01 | S118 | CANDIDATE; implementation NOT RUN |
| V19-S115-14 | Define affine subtraction and direct affine addition rejection | AFF-SUB-SAME-01, AFF-SUB-MIX-01, AFF-ADD-01 | S118 | CANDIDATE; current direct addition is linear-only physical sum |
| V19-S115-15 | Define affine multiplication/division/power/root rejection | AFF-MUL-01, AFF-DIV-01, AFF-POW-01, AFF-SQRT-01 | S118 | CANDIDATE; NOT RUN |
| V19-S115-16 | Define `sum`/`mean` exceptions and first-unit conversion | AFF-SUM-01, AFF-SUM-MIX-01, AFF-MEAN-01 | S118 | CANDIDATE; current aggregate uses scale only |
| V19-S115-17 | Define physical `min`/`max` and selected-unit `abs`/`round`/unary behavior | AFF-MINMAX-01, AFF-ABSROUND-01, AFF-NEG-01 | S118 | CANDIDATE; current display behavior source-audited |
| V19-S115-18 | Derive Celsius/Fahrenheit declarations and aliases from approved invariant | AFF-DECL-CEL-01, AFF-DECL-FHR-01, AFF-ALIAS-01, AFF-CONV-INVARIANT-01 | S117/S118 | CANDIDATE engineering derivation; NOT RUN |
| V19-S115-19 | Define affine chart normalization, selected display unit, null/order/label behavior | AFF-CHART-01, AFF-CHART-NULL-01, AFF-CHART-FIRST-01, AFF-CHART-FAIL-01 | S118/S120 | CANDIDATE; current chart normalization scale-only |
| V19-S115-20 | Define scalar/table display behavior and no canonical-value leak | AFF-DISPLAY-01 | S118/S119 | CANDIDATE; NOT RUN |
| V19-S115-21 | Verify external `{ value, unit }` shape remains sufficient | AFF-EXTERNAL-01, AFF-EXTERNAL-ALIAS-01, AFF-EXTERNAL-COMPOUND-01, AFF-EXTERNAL-SHAPE-01; D115-08 | S118 | SOURCE VERIFIED shape; candidate compound policy pending |
| V19-S115-22 | Define finite/invalid runtime and declaration behavior | AFF-FINITE-01, AFF-SCALE-INF-01, AFF-OFFSET-INF-01, diagnostic matrix | S117/S118 | CANDIDATE; existing finite error families source-audited |
| V19-S115-23 | Preserve linear Number/unit behavior outside approved affine changes | AFF-LINEAR-01, AFF-NUMBER-REG-01 | S117/S118/S120 | CANDIDATE regression requirement; NOT RUN |
| V19-S115-24 | Record exact diagnostic phase/anchor/code policy | All `diagnostic-matrix.md` rows; D115-09 | S116/S117/S118 | CANDIDATE; no new stable code allocated |
| V19-S115-25 | Establish complete golden fixtures and downstream ownership | All `CHT-*` and `AFF-*` rows in `qualification-cases.md` | S116-S120 | PREPARED; production implementation NOT RUN |
| V19-S115-26 | Preserve release/version/publication/certification boundary | Requirements and acceptance scope audits | S115/S120 | PASS PREPARATION SCOPE; no release files touched |

## Decision-to-Case Coverage

| Decision | Confirmed/candidate boundary | Required cases | Disposition gate |
| --- | --- | --- | --- |
| D115-01 | Candidate single-line expression shape | CHT-EXPR-01, CHT-PARSE-01, CHT-TYPE-01 | Sprint 115 product-owner disposition |
| D115-02 | Candidate `show`-snapshot evaluation | CHT-ENV-01 | Sprint 115 product-owner disposition |
| D115-03 | Confirmed omission; candidate accessibility/model detail | CHT-HTML-01, CHT-PDF-01, CHT-DOCX-01 | Sprint 115/S119 readiness |
| D115-04 | Candidate declaration offset operands | AFF-PRECEDENCE-01, AFF-TWO-UNIT-ADD-01, AFF-REVERSE-SUB-01 | Blocks S117 |
| D115-05 | Candidate affine composition restrictions | AFF-COMPOUND-01, AFF-POWER-IDENTITY-01, AFF-EXTERNAL-COMPOUND-01 | Blocks S117 |
| D115-06 | Confirmed operation behavior plus candidate unary/compound treatment | AFF-SUB/MUL/DIV/POW/SUM/MEAN/MINMAX/ABSROUND cases | Blocks S118 |
| D115-07 | Confirmed narrow PI/E allowlist | AFF-PI-01, AFF-E-01, AFF-USER-CONST-01, AFF-IMPORTED-CONST-01 | Blocks S117 |
| D115-08 | Confirmed shape stability; candidate compound affine external rejection | AFF-EXTERNAL-* cases | Blocks S118 compatibility acceptance |
| D115-09 | Existing-code candidate policy | All negative cases | Lead Developer diagnostic review |

## Reconciliation Rule

Before acceptance, mechanically or manually compare all `CHT-*` and `AFF-*`
IDs in `qualification-cases.md`, negative IDs in `diagnostic-matrix.md`, and
this matrix. Record distinct counts, missing IDs, duplicate IDs, renamed IDs,
and any intentionally evidence-only IDs. No `PENDING`, `CANDIDATE`, or `NOT RUN`
row is upgraded to PASS by prose alone.

## Required Downstream Evidence

- **Sprint 116:** AST/parser/checker/evaluator/formatter/model tests for all
  chart option cases, exact diagnostics/ranges, and expression evaluation.
- **Sprint 117:** Registry/parser/checker/import/export tests for affine
  metadata, declaration composition, constants, finite rules, aliases, and
  exact declaration diagnostics.
- **Sprint 118:** Runtime/conversion/operation/aggregate/chart/external-data/SI
  tests, including the canonical golden values and shape regression.
- **Sprint 119:** HTML/PDF/DOCX/editor/specification/example/migration tests,
  including actual table omission rather than style hiding.
- **Sprint 120:** integrated acceptance across all surfaces and explicit
  results for focused, broad, build, extension, desktop, and unavailable
  checks.
