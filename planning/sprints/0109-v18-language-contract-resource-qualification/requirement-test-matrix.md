# Sprint 109 Requirement-to-Evidence Matrix

Sprint 109 acceptance requires every row to link to a disposition, fixture,
prototype result, benchmark, or explicit residual. `PENDING` is not PASS.

Status labels distinguish evidence from product disposition:
`SOURCE VERIFIED` is read-only source evidence; `PROTOTYPE PASS - LIMITED` and
`BENCHMARK PASS - SYNTHETIC` apply only to the recorded probe; `NOT RUN` means
no product test was executed; `OPEN` requires owner disposition. None of these
labels accepts the V0.18 contract.

| Requirement | Source of authority | Case/evidence | Decision or output | Downstream owner | Status |
| --- | --- | --- | --- | --- | --- |
| Diagram supports approved primitive, for, and if/else content | V18 master plan | GEN-PARSE-01/02/03 | Current diagram AST/parser is flat; proposed full envelopes are in `qualification-cases.md` | S110 | NOT RUN; parser feature absent |
| Reuse existing iterable/conditional semantics | V18 master plan | GEN-TYPE-01/02 | `AMX3003`/`AMX3007` loop checks and `AMX3002` Boolean mismatch source-reviewed | S110 | SOURCE VERIFIED; feature integration NOT RUN |
| Controls evaluate once during model creation | V18 master plan | GEN-BRANCH-01, GEN-EMPTY-01, GEN-STABLE-01 | Candidate contract and proposed cases | S111 | NOT RUN; production control nodes absent |
| Emission preserves deterministic source order | V18 master plan | GEN-ORDER-01, GEN-MIX-01 | Prototype and browser projections retained ordered elements | S111 | PROTOTYPE PASS - LIMITED |
| Branch and loop control nesting allowed except nested for | V18 master plan | GEN-MIX-01, GEN-NEST-01/02 | Synthetic control-tree traversal passed; product parser/checker cases not run | S110/S111 | BENCHMARK PASS - SYNTHETIC; diagnostic phase/identity partly OPEN |
| `t` prohibited in controls, allowed in supported properties | V18 master plan | GEN-CONTROL-T-01/02, GEN-TIME-01 | Prototype properties changed across three `t` values; control checks absent | S110/S111 | PROTOTYPE PASS - LIMITED; control diagnostics OPEN |
| Loop binding scoped and preserved per generated instance | V18 master plan and existing loop conventions | GEN-SCOPE-01, GEN-BIND-01 | Prototype descriptors round-tripped in a real scene-model envelope; custom evaluator consumed them | S110/S111/S112 | PROTOTYPE PASS - LIMITED; production frame evaluator does not consume descriptors |
| Expansion cap is separate from authored-element/report limit | V18 master plan; current `AMXD013` baseline | GEN-CAP-MIX-01, GEN-AUTHORED-01 | 512 authored declarations + 64 generated per diagram measured in B7; source confirms `AMXD013` is unchanged | S111 | SOURCE VERIFIED; SYNTHETIC composition PASS; production regression NOT RUN |
| D109-01 counting rule | Open master-plan decision | GEN-CAP-EXACT-01, GEN-CAP-OVER-01, GEN-CAP-MIX-01 | Builder recommends counting control-block-originating emissions only to preserve no-control diagrams | S111 | OPEN pending product-owner disposition |
| D109-02 numeric cap | V18 master plan | B0-B7; GEN-CAP-EXACT-01/OVER-01 | Builder recommends 64 control-block-originating elements per evaluated diagram | S111/S112/S114 | BENCHMARK PASS - SYNTHETIC; OPEN pending product-owner disposition; product overflow NOT RUN |
| Model membership/order fixed across frames | V18 master plan | GEN-FRAME-01, GEN-TIME-01 | Three frames before/after descriptor serialization; browser scrub membership stable | S111/S112 | PROTOTYPE PASS - LIMITED |
| D109-04 diagnostic policy and identities | Open diagnostic allocation | All 12 diagnostic/technical IDs | Existing exact type/unknown-name behavior source-audited; new identities required for `t`, nested-loop policy if feature-specific, and cap overflow | S110/S111 | PARTIAL SOURCE VERIFIED; new stable identities and exact anchors OPEN |
| D109-05 per-instance binding feasibility | V18 master plan | GEN-BIND-01, GEN-FRAME-01, GEN-ROUNDTRIP-01 | Production serializer preserves prototype descriptors; prototype evaluator applies them; ordered renderer projection passes | S109/S111/S112 | PROTOTYPE PASS - LIMITED; production evaluator integration OPEN |
| D109-03 HTML discrepancy | V18 master plan; V0.13 spec/current renderer | GEN-HTML-01 | Verified 1 MiB spec, 100 MiB renderer, and 8,000,000-character desktop guard; candidate composition 247,256 bytes | S109 | SOURCE VERIFIED; candidate below 1 MiB; policy unchanged; owner disposition pending |
| D109-06 resource-evidence sufficiency | Open master-plan decision | B0-B7, GEN-HTML-01, GEN-STATIC-01, GEN-MULTI-01 | One high-performance Windows host; five timed samples, browser in-page samples, RSS before/after only; no peak memory | S109 | LIMITED EVIDENCE; owner must decide sufficiency; no cross-platform claim |
| Per-instance bindings survive serialization | V18 master plan | GEN-ROUNDTRIP-01 | Production serializer preserved prototype descriptors; frame values evaluated by prototype code | S111/S112 | PROTOTYPE PASS - LIMITED; production evaluator integration OPEN |
| Interactive/static outputs preserve ordered generated model | V18 master plan | GEN-HTML-01, GEN-STATIC-01 | Browser/SVG projection and B0/B6/B7 PDF/DOCX benchmark paths completed | S112/S114 | BENCHMARK PASS - SYNTHETIC; production generated model NOT RUN |
| Existing diagrams remain compatible | V18 master plan | GEN-NOGEN-01, B0 | Existing formula-driven example used as B0; no product suite run | S114 | BENCHMARK PASS baseline; regression NOT RUN |
| Editor/docs/example requirements are enumerated | V18 master plan | Requirement cross-check | S113 surfaces cross-checked against master plan; no editor/doc/example edits | S113 | SOURCE/PLAN VERIFIED; implementation NOT RUN |
| No release/version/publication work occurs | V18 master plan | Scope audit | Only Sprint 109 package and artifact roots changed; no release or product files touched | S109 | PASS scope audit; separate owner disposition pending |

## Reconciliation Rule

Before recommendation, mechanically or manually cross-check all `GEN-*`
IDs against this matrix and `diagnostic-matrix.md`; report exact counts,
missing IDs, duplicates, and any intentionally evidence-only ID. Keep raw
measurement status, Builder recommendation, and product-owner disposition as
separate fields.

## Builder Reconciliation Result

Audit result: 27 distinct qualification-case IDs; 12 distinct diagnostic or
technical-probe IDs; no duplicates; no unrepresented diagnostic ID; every
case family maps to a requirement row or is explicitly identified as
evidence-only. Product parser/checker/runtime tests for generated syntax and
cap overflow were not run because those behaviors are absent at the reviewed
commit. Product-owner disposition remains `PENDING` and is not inferred from
synthetic probe outcomes.