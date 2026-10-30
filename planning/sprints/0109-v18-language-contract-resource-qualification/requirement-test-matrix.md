# Sprint 109 Requirement-to-Evidence Matrix

Sprint 109 acceptance requires every row to link to a disposition, fixture,
prototype result, benchmark, or explicit residual. `PENDING` is not PASS.

| Requirement | Source of authority | Case/evidence | Decision or output | Downstream owner | Status |
| --- | --- | --- | --- | --- | --- |
| Diagram supports approved primitive, for, and if/else content | V18 master plan | GEN-PARSE-01/02/03 | Contract and syntax examples | S110 | PENDING |
| Reuse existing iterable/conditional semantics | V18 master plan | GEN-TYPE-01/02 | Existing semantic references and diagnostics | S110 | PENDING |
| Controls evaluate once during model creation | V18 master plan | GEN-BRANCH-01, GEN-EMPTY-01, GEN-STABLE-01 | Contract and runtime cases | S111 | PENDING |
| Emission preserves deterministic source order | V18 master plan | GEN-ORDER-01, GEN-MIX-01 | Explicit expected ordered output | S111 | PENDING |
| Branch and loop control nesting allowed except nested for | V18 master plan | GEN-MIX-01, GEN-NEST-01/02 | Diagnostic phase and nesting algorithm | S110/S111 | PENDING |
| `t` prohibited in controls, allowed in supported properties | V18 master plan | GEN-CONTROL-T-01/02, GEN-TIME-01 | Typecheck and frame cases | S110/S111 | PENDING |
| Loop binding scoped and preserved per generated instance | V18 master plan and existing loop conventions | GEN-SCOPE-01, GEN-BIND-01 | Round-trip feasibility result | S110/S111/S112 | PENDING |
| Expansion cap is separate from authored-element/report limit | V18 master plan; current `AMXD013` baseline | GEN-CAP-MIX-01, GEN-AUTHORED-01 | Separate accounting rule and compatibility result | S111 | PENDING |
| Counting rule is explicit | Open master-plan decision | GEN-CAP-EXACT-01, GEN-CAP-OVER-01, GEN-CAP-MIX-01 | D109-01 disposition | S111 | PENDING |
| Numeric per-diagram cap selected from evidence | V18 master plan | B0-B7; GEN-CAP-EXACT-01/OVER-01 | Exact integer, rationale, headroom | S111/S112/S114 | PENDING |
| Model membership/order fixed across frames | V18 master plan | GEN-FRAME-01, GEN-TIME-01 | Same-model multi-frame evidence | S111/S112 | PENDING |
| Per-instance bindings survive serialization | V18 master plan | GEN-ROUNDTRIP-01 | Before/after frame parity evidence | S111/S112 | PENDING |
| HTML-size discrepancy assessed without broad policy change | V18 master plan; V0.13 spec/current renderer | GEN-HTML-01, D109-03 | Cap impact decision and exact measured byte classes | S109 | PENDING |
| Interactive/static outputs preserve ordered generated model | V18 master plan | GEN-HTML-01, GEN-STATIC-01 | Output evidence and remaining owner work | S112/S114 | PENDING |
| Existing diagrams remain compatible | V18 master plan | GEN-NOGEN-01, B0 | Baseline results | S114 | PENDING |
| Editor/docs/example requirements are enumerated | V18 master plan | Requirement cross-check | Required S113 surfaces and acceptance cases | S113 | PENDING |
| No release/version/publication work occurs | V18 master plan | Scope audit | Changed-path and authorization record | S109 | PENDING |

## Reconciliation Rule

Before recommendation, mechanically or manually cross-check all `GEN-*`
IDs against this matrix and `diagnostic-matrix.md`; report exact counts,
missing IDs, duplicates, and any intentionally evidence-only ID. Keep raw
measurement status, Builder recommendation, and product-owner disposition as
separate fields.