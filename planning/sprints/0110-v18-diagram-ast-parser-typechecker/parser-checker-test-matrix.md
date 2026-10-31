# Sprint 110 Parser, Checker, and Formatter Test Matrix

This matrix assigns S110 evidence to the accepted Sprint 109 qualification
cases. Cases still require complete source envelopes and verified locations
before execution acceptance. The V0.18 syntax is not expected to pass the
current parser before implementation.

| S110 ID | Source case | Required assertion | Diagnostic/compatibility expectation | Surface |
| --- | --- | --- | --- | --- |
| P110-AST-01 | Existing diagram with only primitive declarations | Recursive content contains the same ordered primitives and original sources; no control nodes | Existing static diagrams retain their accepted shape/behavior | Parser, `tests/parser.test.ts` |
| P110-AST-02 | `GEN-MIX-01` | AST preserves loop -> conditional -> primitive and conditional -> loop -> primitive nesting in source order | No runtime expansion assertion | Parser |
| P110-AST-03 | `GEN-BIND-01` | Loop iterator/iterable/body and all source locations are represented | Parsing only; binding evaluation is S111 | Parser |
| P110-PARSE-01 | `GEN-PARSE-01` | Malformed loop header/body and unclosed block fail deterministically | Confirmed `AMX3006` family and approved message/anchor | Parser |
| P110-PARSE-02 | `GEN-PARSE-02` | Malformed if/else condition or block fails deterministically | Confirmed `AMX3006` family and approved message/anchor | Parser |
| P110-PARSE-03 | `GEN-PARSE-03` | Unsupported statement/declaration is not parsed as a diagram property | `AMX3006`; no fallback to property parsing | Parser |
| P110-NEST-01 | `GEN-NEST-01` | Direct nested `for` is rejected at inner loop token | Parse phase, approved `AMX3006` message/anchor; no plain `Error` | Parser |
| P110-NEST-02 | `GEN-NEST-02` | Nested `for` through a conditional is rejected at inner loop token | Same diagnostic contract as P110-NEST-01 | Parser |
| P110-TYPE-01 | `GEN-TYPE-01` | List/range accepted; unsupported iterable rejected | Reuse `AMX3003`/`AMX3007` only for matching semantics | Checker, `tests/diagram.test.ts` |
| P110-TYPE-02 | `GEN-TYPE-02` | Boolean condition accepted; non-Boolean rejected | Existing `AMX3002` mismatch | Checker |
| P110-SCOPE-01 | `GEN-SCOPE-01` | Shadowing restores prior binding; a new iterator does not escape | Out-of-scope name uses `AMX3001` | Checker |
| P110-TIME-01 | `GEN-CONTROL-T-01/02` | Time identifier in iterable and condition rejected at the identifier | Shared allocated diagnostic for both cases | Checker |
| P110-TIME-02 | `GEN-TIME-01` | Time identifier remains valid in supported primitive properties | Existing property validation; no topology/runtime claim | Checker |
| P110-PRIMITIVE-01 | Direct and nested primitive cases | Required/optional fields, type/style constraints, duplicate properties, and source anchors match current rules | Preserve `AMXD001/002/006/007/015`, `AMX3002/3005` as applicable | Checker |
| P110-LIMIT-01 | `GEN-AUTHORED-01` plus nested-authored declarations | Every authored primitive is counted once across the report/modules | Existing 512 limit and `AMXD013` remain unchanged | Checker/module integration |
| P110-FORMAT-01 | `GEN-MIX-01` | Formatter emits recursive blocks in canonical indentation and preserves source order | Parse-format-parse tree equivalence | Formatter, `tests/formatter.test.ts` |
| P110-LOCATION-01 | Positive and negative fixtures in complete documents | Exact original-document locations are retained | Verify LF and CRLF, and UTF-16 columns | Parser/checker |
| P110-COMPAT-01 | Existing static diagram fixtures/examples | No control syntax preserves existing parse/check/format behavior | Do not expand or change static geometry | Parser/checker/formatter |
| P110-STAGE-01 | Control-bearing document through the current evaluator boundary | No silent unconditional flattening or dropped controls | Assert the approved fail-closed/staging rule only; not S111 behavior | Approved boundary surface |

## Test Construction Rules

- Reuse the complete envelopes in Sprint 109 `qualification-cases.md` where
  applicable; do not change expected semantics silently.
- Add complete invalid control fixtures only after diagnostic allocation and
  anchor confirmation. Include full front matter/narrative/fenced AMX when
  verifying document-relative positions.
- Assert each source span against literal fixture text. Cover LF and CRLF;
  include a non-BMP character before a diagnostic to validate UTF-16 columns.
- Check parser and formatter separately from runtime. No S110 test may claim
  generated membership, branch execution, per-instance bindings, cap
  enforcement, or export parity.
- Run the existing 512-authored/report and imported-module cases unchanged,
  then add a focused nested-authored case proving static counting happens
  once per authored primitive.
- Cross-check IDs against `diagnostics-and-gates.md` and the matrix here;
  record missing/duplicate IDs in Builder evidence.