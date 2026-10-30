# Sprint 109 Acceptance Criteria

Sprint 109 is complete only when the V0.18 control contract is source-grounded
and testable, the per-instance binding feasibility question is answered, the
cap accounting and numeric value are supported by reproducible evidence, and
a separate product-owner disposition is recorded. Sprint 109 adds no product
behavior.

## Contract

- `diagram-generation-contract.md` separates confirmed master-plan decisions,
  source-observed facts, proposals, and open decisions.
- Control syntax, evaluation timing, source order, `t` visibility, loop
  variable scope/restoration, permitted nesting, instance identity, and
  diagnostics are testable without assumptions.
- D109-01 through D109-06 are each resolved or explicitly accepted as a named
  residual with an owner and downstream impact. An unresolved cap accounting
  rule or numeric cap blocks Sprint 110.
- The existing authored-element limit/report accounting is documented and
  remains distinct from the generated cap.

## Feasibility and Resources

- The prototype emits distinct loop-bound values, evaluates multiple frame
  times, serializes/deserializes the model, and demonstrates stable ordered
  membership with correct per-instance values before and after round-trip.
- The existing ordered frame-element consumer remains intact, or any required
  contract/API change is reported as NO-GO and separately dispositioned.
- The benchmark covers baseline, low-cost elements, dynamic properties,
  text-heavy content, mixed controls, round-trip, interactive HTML, static
  HTML/PDF/DOCX, and practical multi-diagram composition.
- Raw measurements, environment, commands, repetitions, output sizes,
  failures/retries, limitations, and unavailable checks are recorded.
- A precise numeric cap is supported by cap and cap+1 results, limiting-case
  analysis, safety/headroom rationale, and explicit distinction from the
  authored 512-per-report check.
- The documented 1 MiB versus implemented 100 MiB HTML discrepancy is
  verified and its impact on cap selection is explicitly dispositioned.
- No broader HTML output-size policy or existing authored-element behavior
  changes in Sprint 109.

## Traceability and Boundaries

- Every master-plan Sprint 109 requirement maps to a case, measurement,
  decision, or explicit residual in `requirement-test-matrix.md`.
- Fixture and diagnostic IDs reconcile with `qualification-cases.md` and
  `diagnostic-matrix.md`; exact negative-case source anchors are verified
  against complete source envelopes.
- Evidence is reproducible and is limited to the approved sprint artifact
  paths. No historical artifacts or generated shared outputs are overwritten.
- No implementation, published language spec, example, release, publication,
  package/version change, or certification work occurs.
- The Builder recommendation and separate product-owner
  ACCEPTED/CLOSED or BLOCKED/OPEN disposition are recorded distinctly.
- Sprint 110 does not begin until Sprint 109 is separately accepted/closed
  and the cap decisions required by the master plan are resolved.