# Sprint 111 Runtime Test Matrix

Use the accepted GEN cases in Sprint 109
`qualification-cases.md`; add runtime assertions below. Product-generated
syntax is now represented by the S110 canonical AST, but tests must exercise
the actual parser/checker/evaluator path rather than synthetic ASTs unless a
specific internal boundary requires a constructed node.

| S111 ID | Accepted case(s) | Required runtime assertion | Diagnostic/limit | Owner surface |
| --- | --- | --- | --- | --- |
| R111-EXPAND-01 | `GEN-ORDER-01` | Direct primitive, multiple loop outputs, and following direct primitive retain exact recursive source/iteration order | No runtime-name API assertion | `tests/diagram.test.ts` |
| R111-EMPTY-01 | `GEN-EMPTY-01` | Empty list/range and unselected conditional emit nothing; ordered direct siblings remain | Count generated emissions only | Diagram runtime |
| R111-BRANCH-01 | `GEN-BRANCH-01` | Only selected branch is expanded; condition does not change across frames | Existing Boolean checker behavior | Diagram runtime |
| R111-MIX-01 | `GEN-MIX-01` | Conditional-in-loop and loop-in-conditional are evaluated in source order; no nested loop | Parser/checker remain authoritative | Diagram runtime |
| R111-BIND-01 | `GEN-BIND-01` | Distinct iterator values produce distinct property values for every emitted instance | No cross-instance binding leakage | Diagram runtime |
| R111-SCOPE-01 | `GEN-SCOPE-01` | Shadowed binding is restored; expansion does not mutate document environment | `AMX3001` remains checker behavior for out-of-scope use | Diagram/runtime integration |
| R111-FRAME-01 | `GEN-TIME-01`, `GEN-FRAME-01` | Same model at lower/interior/upper/repeated/out-of-order times has stable element identities/order and expected time-varying properties | Existing frame-time checks retained | Diagram runtime |
| R111-STABLE-01 | `GEN-STABLE-01` | Two model creations with different inputs may differ; each model's frames remain internally stable | One cap counter per evaluated diagram | Diagram runtime |
| R111-CAP-EXACT-01 | `GEN-CAP-EXACT-01` | Exactly 64 control-originating emissions succeed | Direct elements are excluded from count | Diagram runtime |
| R111-CAP-OVER-01 | `GEN-CAP-OVER-01` | 65th control-originating emission fails before it is appended/evaluated | Allocated new diagnostic, exact message and source anchor; never `AMXD013` | Diagram runtime |
| R111-CAP-MIX-01 | `GEN-CAP-MIX-01` | 511 direct authored primitives plus one loop-authored primitive emitted 64 times produce 575 frame elements; all 512 authored declarations pass checker | Authored 513th remains `AMXD013`; generated count remains 64 | Checker/runtime integration |
| R111-CAP-DIAGRAM-01 | `GEN-MULTI-01` | Two evaluated diagrams may each independently emit 64; no shared report counter | No report-wide generated limit | Diagram runtime |
| R111-AUTHORED-01 | `GEN-AUTHORED-01` | Static authored-only 512/513 boundary remains unchanged | Existing 512/report `AMXD013` | Diagram tests |
| R111-NOGEN-01 | `GEN-NOGEN-01` | Existing no-control diagrams produce the same initial and requested frames | No changed geometry, order, or errors | Diagram tests |
| R111-ITER-WORK-01 | Empty body/false branch at increasing iterable sizes | Record traversal time/allocation and establish whether an existing bound is sufficient | Does not set a new cap; unresolved result blocks claim of bounded work | Diagram/runtime probe |
| R111-TIME-NAME-01 | D111-01 | Iterator variable name equal to timeline name follows explicit disposition | Recommended reject at source identifier; no silent shadow | Checker/runtime tests |
| R111-SERIALIZE-GATE-01 | D111-03 | A control-bearing model cannot silently enter a serialized path that loses bindings; static diagrams remain unaffected | Exact staging behavior decided before edits; S112 owns full support | Approved boundary test |

## Assertions and Non-Claims

- Assert each generated element's property values and order at multiple times
  using the same model. Do not recreate the model between frame assertions.
- Assert distinct internal identities as uniqueness/order properties only;
  never expose a generated-instance lookup API or promise identity across
  separate evaluations.
- Assert that `evaluateDiagramFrame` does not re-run iterable or condition
  expressions per frame. Use a pure observable test seam or deterministic
  expression result; do not introduce side effects into AMX expressions.
- Exercise `withLoopBinding`-equivalent restoration after normal expansion
  and, where practical, after an overflow/evaluation exception.
- Verify overflow points to the source primitive/control that would emit the
  first excess item. Assert exact 1-based line/column against complete
  document source.
- Test that a diagram with 64 generated and 512 authored elements passes the
  separate counts; the 65th generated output fails only the generated cap.
- Do not claim production scene-model round-trip, browser playback, PDF/DOCX
  parity, editor behavior, or cross-platform qualification. These are S112-
  S114 gates.