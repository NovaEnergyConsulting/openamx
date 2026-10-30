# Sprint 109 Diagnostic and Failure Matrix

Diagnostic identities and exact messages are intentionally pending. Sprint
109 must inspect current registrations and source-location conventions and
request explicit allocation for new stable identities. Do not guess or reuse
an unrelated code.

| Case ID | Invalid condition | Required phase | Candidate primary anchor | Diagnostic status | Downstream owner |
| --- | --- | --- | --- | --- | --- |
| GEN-PARSE-01 | Malformed `for` header or missing iterable/block delimiter | Parse | First offending token or control opener, selected by existing convention | PENDING audit/allocation | S110 |
| GEN-PARSE-02 | Malformed conditional/else branch inside a diagram | Parse | First offending token | PENDING audit/allocation | S110 |
| GEN-PARSE-03 | Unsupported statement/declaration in a diagram body | Parse | Unsupported statement/declaration keyword | PENDING audit/allocation | S110 |
| GEN-NEST-01 | Direct nested `for` | Parse or static check, decision required | Inner `for` keyword | PENDING phase/code decision | S110 |
| GEN-NEST-02 | Nested `for` reached through conditional block(s) | Parse or static check, same rule as GEN-NEST-01 | Inner `for` keyword | PENDING phase/code decision | S110 |
| GEN-TYPE-01 | Iterable type not supported by existing AMX loop semantics | Static check | Iterable expression | Existing diagnostic only if semantically exact; verify | S110 |
| GEN-TYPE-02 | Conditional control is not Boolean under existing semantics | Static check | Condition expression | Existing diagnostic only if semantically exact; verify | S110 |
| GEN-CONTROL-T-01 | `t` appears in iterable | Static check | `t` identifier or entire iterable, per established location convention | PENDING audit/allocation | S110 |
| GEN-CONTROL-T-02 | `t` appears in a branch condition | Static check | `t` identifier or entire condition, per established location convention | PENDING audit/allocation | S110 |
| GEN-SCOPE-01 | Iterator binding used outside its valid scope | Static check | Out-of-scope identifier | Existing unknown-identifier diagnostic if exact; verify | S110 |
| GEN-CAP-OVER-01 | Expansion emits first primitive past selected cap | Evaluation/model creation | Source control or primitive responsible for overflow; decide exact anchor | PENDING allocation and source policy | S111 |
| GEN-ROUNDTRIP-01 | Per-instance context cannot be serialized/deserialized | Technical probe failure, not a user diagnostic by default | N/A | Record exception/failure; do not invent runtime code | S109/S112 |

## Required Decisions

- Choose parse-time versus static-check rejection for prohibited nested
  loops, consistent with the accepted AST/checker boundary.
- Verify whether existing iterable/condition type diagnostics can be reused
  without changing their meaning or location.
- Allocate an expansion-limit diagnostic identity/message and choose a
  deterministic source anchor before S111 implementation.
- Specify whether the limit diagnostic is a user-facing AMX diagnostic or a
  host/resource failure only if evidence shows the distinction is needed.
- Record exact line/column conventions using complete fixtures, including
  CRLF and UTF-16 behavior if that surface applies. Do not report unverified
  source spans as accepted.