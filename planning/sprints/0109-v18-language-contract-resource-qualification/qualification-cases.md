# Sprint 109 Qualification Cases

These cases are planning fixtures for contract and feasibility review, not
claims that the syntax currently parses or runs. Stable IDs are retained for
downstream traceability. The exact complete AMX envelopes and expected
source locations must be recorded before Sprint 109 execution is accepted.

## Contract and Expansion Cases

| ID | Shape | Expected contract result | Owning evidence |
| --- | --- | --- | --- |
| GEN-ORDER-01 | Direct primitive, loop with multiple values, then direct primitive | Emission follows source order; loop iteration order follows existing iterable semantics | Contract prototype; S111 test |
| GEN-EMPTY-01 | Empty iterable around a primitive body | Emits no instances from the loop; surrounding direct primitives remain ordered | Fixture; S111 test |
| GEN-BRANCH-01 | True/false conditional branches each containing distinct primitives | Only selected branch emits, at the branch's source position | Fixture; S111 test |
| GEN-MIX-01 | Conditional inside a loop, and loop inside a conditional branch | Both approved nesting directions work and preserve source order | Fixture; S110/S111 tests |
| GEN-NEST-01 | A `for` nested within a `for` directly | Rejected, even when inner loop body would emit no primitives | Diagnostic; S110 test |
| GEN-NEST-02 | A `for` nested within another `for` through one or more conditionals | Rejected by the same nesting rule | Diagnostic; S110 test |
| GEN-SCOPE-01 | Iterator shadows an existing binding; separately, use the iterator after its block when no outer binding exists | Existing binding is restored; a new iterator binding does not escape and later out-of-scope use is rejected | Contract decision and diagnostic; S110/S111 tests |
| GEN-BIND-01 | Several iterations emit equivalent primitive expressions using the iterator | Each instance evaluates using its own captured iterator value | Prototype; S111 test |
| GEN-TIME-01 | `t` in a supported primitive property across multiple frames | Membership stays fixed; property values change with requested frame time | Prototype; S111/S112 tests |
| GEN-CONTROL-T-01 | `t` in an iterable expression | Rejected at the control expression source | Diagnostic; S110 test |
| GEN-CONTROL-T-02 | `t` in an if/else condition | Rejected at the control expression source | Diagnostic; S110 test |
| GEN-STABLE-01 | Recreate model with different non-time inputs | Each model may have its own evaluated membership; one model's frames remain stable | Contract; S111 test |
| GEN-PARSE-01 | Malformed `for` header or missing iterable/block delimiter | Rejected during parsing at the first offending token or control opener | Diagnostic; S110 test |
| GEN-PARSE-02 | Malformed conditional/else branch inside a diagram | Rejected during parsing at the first offending token | Diagnostic; S110 test |
| GEN-PARSE-03 | Unsupported statement or declaration in a diagram body | Rejected during parsing at the unsupported keyword | Diagnostic; S110 test |
| GEN-TYPE-01 | Loop iterable has a type unsupported by existing AMX loop semantics | Rejected during static checking with an existing semantically exact diagnostic, if available | Diagnostic audit; S110 test |
| GEN-TYPE-02 | Conditional control is not Boolean under existing AMX semantics | Rejected during static checking with an existing semantically exact diagnostic, if available | Diagnostic audit; S110 test |

## Resource and Compatibility Cases

| ID | Shape | Expected result | Owning evidence |
| --- | --- | --- | --- |
| GEN-CAP-EXACT-01 | Exactly selected cap under each proposed counting rule | Accepted; emitted membership and order match expected count | Benchmark; S111 test |
| GEN-CAP-OVER-01 | First output element beyond selected cap | Rejected deterministically with selected overflow diagnostic and source anchor | Diagnostic; S111 test |
| GEN-CAP-MIX-01 | Direct and generated elements composed near cap | Outcome follows D109-01; authored 512-per-report check remains independent | Decision; S111 test |
| GEN-AUTHORED-01 | Existing diagram/report reaches authored 512 limit with no generated controls | Existing `AMXD013` behavior remains unchanged | Baseline; S110/S111 regression |
| GEN-FRAME-01 | Same model evaluated at lower, interior, upper, and repeated times | Membership/order invariant; allowed properties reflect each requested time | Prototype; S111/S112 test |
| GEN-ROUNDTRIP-01 | Generated model serialize/deserialize then evaluate frames | Frame values, membership, order, and needed source locations match pre-round-trip | Prototype; S112 test |
| GEN-HTML-01 | Candidate workload embedded in interactive HTML | Correct playback; bytes and timing recorded against current 100 MiB implementation bound and documented 1 MiB statement | Benchmark; S112/S114 |
| GEN-STATIC-01 | Candidate workload rendered to static HTML/PDF/DOCX | Same model membership/order at static time; output result and size recorded | Benchmark; S112/S114 |
| GEN-NOGEN-01 | Existing static diagrams with no control blocks | Existing interactive and static behavior unchanged | Baseline; S114 regression |
| GEN-MULTI-01 | Several diagrams in one report near per-diagram candidate cap | Per-diagram rule is applied consistently; aggregate behavior recorded, with no unapproved report-level cap | Benchmark; S111/S114 |

## Fixture Requirements

- Before execution acceptance, turn each syntax case into a complete source
  envelope that is compatible with the repository's parser fixture
  conventions. Include all diagram metadata/time declarations needed for a
  meaningful parser or runtime case.
- Record expected emitted primitive kind, internal identity policy, source
  location, property values, and order. Internal identity assertions must
  not establish a source-level name/reference feature.
- For time cases, use the same created model at multiple frame values; a
  model recreated per frame would not test topology stability.
- For round-trip cases, evaluate both before and after serialization using the
  same frame values and compare the semantic ordered elements.
- Attach a diagnostic ID only after its identity, message, phase, and source
  anchor have been verified or explicitly allocated.