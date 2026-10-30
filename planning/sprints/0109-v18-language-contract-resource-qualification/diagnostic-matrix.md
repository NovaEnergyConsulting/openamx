# Sprint 109 Diagnostic and Failure Matrix

Diagnostic identities and exact messages are intentionally pending. Sprint
109 must inspect current registrations and source-location conventions and
request explicit allocation for new stable identities. Do not guess or reuse
an unrelated code.

| Case ID | Invalid condition | Required phase | Candidate primary anchor | Diagnostic status | Downstream owner |
| --- | --- | --- | --- | --- | --- |
| GEN-PARSE-01 | Malformed `for` header or missing iterable/block delimiter | Parse | First offending token or control opener, selected by existing convention | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-PARSE-02 | Malformed conditional/else branch inside a diagram | Parse | First offending token | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-PARSE-03 | Unsupported statement/declaration in a diagram body | Parse | Unsupported statement/declaration keyword | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-NEST-01 | Direct nested `for` | Parse (recommended) | Inner `for` keyword | Current generic loop parser throws a plain `Error`; no stable AMX identity exists for this feature failure | S110 |
| GEN-NEST-02 | Nested `for` reached through conditional block(s) | Parse (recommended; same rule as GEN-NEST-01) | Inner `for` keyword | No stable feature diagnostic exists; allocate/approve before implementation | S110 |
| GEN-TYPE-01 | Iterable type not supported by existing AMX loop semantics | Static check | Iterable expression | Reuse existing `AMX3003` (`For loop needs a list or range`); `AMX3007` remains the existing measurement-type mismatch | S110 |
| GEN-TYPE-02 | Conditional control is not Boolean under existing AMX semantics | Static check | Condition expression | Reuse the existing `AMX3002` expected/actual type mismatch produced by `requireType` | S110 |
| GEN-CONTROL-T-01 | `t` appears in iterable | Static check | `t` identifier or whole iterable, per the established location convention | Requires a new explicitly allocated identity; do not reuse style or unknown-identifier diagnostics | S110 |
| GEN-CONTROL-T-02 | `t` appears in a branch condition | Static check | `t` identifier or whole condition, per the established location convention | Requires a new explicitly allocated identity; do not reuse style or unknown-identifier diagnostics | S110 |
| GEN-SCOPE-01 | Iterator binding used outside its valid scope | Static check | Out-of-scope identifier | Reuse existing `AMX3001` unknown-identifier behavior when the checker confirms the identifier is not visible | S110 |
| GEN-CAP-OVER-01 | Expansion emits first primitive past selected cap | Evaluation/model creation | Source control or primitive responsible for overflow; exact anchor must be verified | Requires a new explicitly allocated identity; `AMXD013` is reserved for authored elements | S111 |
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

## Builder Source Audit

Source facts were rechecked at the authorized commit. The generic parser
reports syntax errors through `AMX3006`; the diagram parser currently treats
unrecognized diagram-body lines as diagram properties. Existing loop checking
rejects non-list/range values with `AMX3003` and measurement mismatch with
`AMX3007`. Existing braced-if checking requires Boolean through `AMX3002`,
and unknown identifiers use `AMX3001`. These existing identities are
recommended only for the semantically matching conditions listed above.

The current parser's generic nested-loop rejection is a plain thrown `Error`,
not an `AmxError` with a stable diagnostic. Diagram-local `t` rejection and
generated-cap overflow do not exist. Allocate and approve new stable
identities for nested-loop diagnostics if a feature-specific message is
required, both prohibited-control uses of `t`, and cap overflow. No identity
is assigned by the Builder. Keep source-location tests pending until the
complete fixtures are integrated and verified; in particular, this sprint
did not run CRLF or UTF-16 diagnostic tests.