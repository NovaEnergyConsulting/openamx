# Sprint 109 Diagnostic and Failure Matrix

Existing semantically exact diagnostics and source-location conventions were
source-audited. Exact new identities/messages remain pending for the accepted
D109-04 residual; the Lead Developer is the allocator. Do not guess or reuse
an unrelated code.

| Case ID | Invalid condition | Required phase | Candidate primary anchor | Diagnostic status | Downstream owner |
| --- | --- | --- | --- | --- | --- |
| GEN-PARSE-01 | Malformed `for` header or missing iterable/block delimiter | Parse | First offending token or control opener, selected by existing convention | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-PARSE-02 | Malformed conditional/else branch inside a diagram | Parse | First offending token | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-PARSE-03 | Unsupported statement/declaration in a diagram body | Parse | Unsupported statement/declaration keyword | `AMX3006` is the current generic syntax identity; exact feature message/anchor remains unapproved | S110 |
| GEN-NEST-01 | Direct nested `for` | Parse (accepted) | Inner `for` keyword | Current generic loop parser throws a plain `Error`; feature diagnostic identity/message remains an accepted D109-04 residual assigned to Lead Developer | S110 |
| GEN-NEST-02 | Nested `for` reached through conditional block(s) | Parse (accepted; same rule as GEN-NEST-01) | Inner `for` keyword | Same accepted D109-04 residual; Lead Developer to allocate before feature implementation | S110 |
| GEN-TYPE-01 | Iterable type not supported by existing AMX loop semantics | Static check | Iterable expression | Reuse existing `AMX3003` (`For loop needs a list or range`); `AMX3007` remains the existing measurement-type mismatch | S110 |
| GEN-TYPE-02 | Conditional control is not Boolean under existing AMX semantics | Static check | Condition expression | Reuse the existing `AMX3002` expected/actual type mismatch produced by `requireType` | S110 |
| GEN-CONTROL-T-01 | `t` appears in iterable | Static check | `t` identifier | One shared new diagnostic identity/message for both prohibited control uses; Lead Developer to allocate before S110 implementation | S110 |
| GEN-CONTROL-T-02 | `t` appears in a branch condition | Static check | `t` identifier | Same shared new diagnostic identity/message as GEN-CONTROL-T-01; Lead Developer to allocate before S110 implementation | S110 |
| GEN-SCOPE-01 | Iterator binding used outside its valid scope | Static check | Out-of-scope identifier | Reuse existing `AMX3001` unknown-identifier behavior when the checker confirms the identifier is not visible | S110 |
| GEN-CAP-OVER-01 | Expansion emits first primitive past selected cap | Evaluation/model creation | Source control or primitive responsible for overflow; exact anchor must be verified | Accepted D109-04 residual: Lead Developer to allocate a new identity/message/anchor before S111; `AMXD013` remains reserved | S111 |
| GEN-ROUNDTRIP-01 | Per-instance context cannot be serialized/deserialized | Technical probe failure, not a user diagnostic by default | N/A | Record exception/failure; do not invent runtime code | S109/S112 |

## Required Decisions

- **RESOLVED 2026-10-30:** reject prohibited nested loops at parse time,
  anchored on the inner `for` keyword. Use the existing parse-error family;
  the Lead Developer owns final message/anchor verification before S110.
- **RESOLVED 2026-10-30:** reuse `AMX3003`/`AMX3007` for semantically exact
  iterable failures, `AMX3002` for Boolean mismatch, and `AMX3001` for an
  out-of-scope identifier.
- **ACCEPTED RESIDUAL:** allocate one shared new identity/message for both
  prohibited uses of `t`, anchored at the `t` identifier; Lead Developer is
  the allocator and owns final source-location verification.
- **ACCEPTED RESIDUAL:** allocate a new expansion-overflow identity/message
  and verify the source anchor on the control/primitive responsible for the
  first output beyond cap. `AMXD013` remains unavailable for this purpose.
- The Lead Developer must also decide whether cap overflow is a user-facing
  AMX diagnostic or a host/resource failure before S111 implementation.
- Exact CRLF and UTF-16 diagnostic spans were not tested in Sprint 109 and
  remain a pre-implementation verification item.

## Product-Owner Disposition

On 2026-10-30, the Lead Developer/product owner accepted D109-04 as a recorded
residual and assigned the Lead Developer as diagnostic allocator. Both
prohibited uses of `t` share one new diagnostic, anchored at the `t`
identifier. Nested `for` is rejected at parse time at the inner `for` token.
The cap-overflow diagnostic receives a new identity and an anchor at the
source control/primitive responsible for the first output beyond cap. Exact
new codes/messages and cap-overflow anchor details remain unallocated and are
a blocking prerequisite for the affected S110/S111 implementation work.

## Builder Source Audit

Source facts were rechecked at the authorized commit. The generic parser
reports syntax errors through `AMX3006`; the diagram parser currently treats
unrecognized diagram-body lines as diagram properties. Existing loop checking
rejects non-list/range values with `AMX3003` and measurement mismatch with
`AMX3007`. Existing braced-if checking requires Boolean through `AMX3002`,
and unknown identifiers use `AMX3001`. These existing identities are
recommended only for the semantically matching conditions listed above.

The current parser's generic nested-loop rejection is a plain thrown `Error`,
not an `AmxError`; S110 must route the accepted parse-time rejection through
the existing syntax diagnostic family. Diagram-local `t` rejection and
generated-cap overflow do not exist. New stable identities for the shared
`t` diagnostic and cap overflow remain unallocated; the Lead Developer owns
allocation. Keep exact source-location tests pending until complete fixtures
are integrated and verified; this sprint did not run CRLF or UTF-16
diagnostic tests.