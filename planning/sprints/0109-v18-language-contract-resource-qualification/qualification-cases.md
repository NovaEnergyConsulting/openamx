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

## Proposed Complete Source Envelopes

These are complete source envelopes for downstream parser/runtime fixtures.
They encode only confirmed V0.18 syntax and are **proposals**, not source
accepted by the current parser. Source positions below are calculated from
the literal fixture text and remain unverified until S110 parser fixtures.

### GEN-BIND-01 / GEN-FRAME-01 / GEN-ROUNDTRIP-01

````text
---
title: Generated diagram binding fixture
---
# Generated diagram binding fixture

```amx
diagram generated {
  title: "Generated bindings"
  description: "Three loop values and an animated property"
  width: 120
  height: 40
  time t from 0 to 1 duration 1
  for item in [2, 5, 9] {
    circle sample {
      cx: item * 10
      cy: t * 4
      r: 2
      stroke: "#263238"
      lineWidth: 1
    }
  }
}
```
````

Expected contract output: three ordered circles with `cx` values `[20, 50,
90]` at all times. `cy` is `[0, 0, 0]`, `[2, 2, 2]`, and `[4, 4, 4]` at `t =
0`, `0.5`, and `1`, respectively. Compare before/after scene-model
serialization semantically; do not make a source-level name/reference
assertion for generated instances. The source `sample` is the primitive
declaration label, not a way to address an emitted instance.

### GEN-MIX-01

````text
---
title: Generated diagram nesting fixture
---
# Generated diagram nesting fixture

```amx
diagram nested {
  title: "Mixed nesting"
  description: "Conditional inside loop and loop inside conditional"
  width: 100
  height: 50
  time t from 0 to 1 duration 1
  for item in [1, 2] {
    if item == 1 {
      circle loopBranch {
        cx: item * 10
        cy: t
        r: 2
        stroke: "#263238"
        lineWidth: 1
      }
    }
  }
  if true {
    for other in [3, 4] {
      circle conditionalLoop {
        cx: other * 10
        cy: t
        r: 2
        stroke: "#263238"
        lineWidth: 1
      }
    }
  }
}
```
````

Expected output order is the `item == 1` circle followed by the two
`conditionalLoop` circles, for three total. The fixture has no nested `for`.
Empty iterable/branch and `t`-in-control negative envelopes remain separate
cases to be completed with exact diagnostic spans after the source grammar
and allocator decisions are dispositioned.

## Builder Evidence Disposition

The qualification inventory contains **27 distinct `GEN-*` cases** and the
diagnostic matrix contains **12 distinct diagnostic/technical-probe IDs**.
All diagnostic IDs reconcile to a qualification case or explicit technical
probe; all case families are represented in the requirement matrix. No ID is
duplicated or silently reassigned.

| Case family | Sprint 109 evidence status | Boundary |
| --- | --- | --- |
| GEN-BIND-01, GEN-TIME-01, GEN-FRAME-01, GEN-ROUNDTRIP-01 | Prototype PASS, limited | Prototype descriptors round-trip through the production serializer; prototype evaluator consumes them, production evaluator does not. |
| GEN-ORDER-01, GEN-MIX-01 | Synthetic traversal/browser projection PASS | Ordered flattened outputs and permitted synthetic tree traversal were measured; production diagram syntax does not exist in this commit. |
| GEN-CAP-EXACT-01, GEN-CAP-MIX-01 | Synthetic benchmark PASS | Candidate 64 was measured for both accounting options, with 512 authored declarations retained separately. |
| GEN-CAP-OVER-01 | NOT RUN | No product cap/overflow diagnostic exists in the source revision; workload at 65 completed, but product rejection was not asserted. |
| GEN-AUTHORED-01 | Source verified; test NOT RUN | `AMXD013` remains the separate 512-authored-elements-per-report rule. |
| GEN-HTML-01, GEN-STATIC-01, GEN-MULTI-01 | Synthetic renderer/export PASS | Browser, HTML, PDF, and DOCX paths completed; the 16-diagram and 512-authored composition is synthetic and not a production generated-control report. |
| GEN-PARSE-01/02/03, GEN-NEST-01/02, GEN-TYPE-01/02, GEN-CONTROL-T-01/02, GEN-SCOPE-01 | NOT RUN | No production diagram control syntax or associated feature diagnostics exist at the reviewed commit. |
| GEN-NOGEN-01 | Benchmark baseline PASS; regression NOT RUN | Existing example rendered through the measured paths; no product test suite was run. |