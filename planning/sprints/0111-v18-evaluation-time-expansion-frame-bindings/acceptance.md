# Sprint 111 Acceptance Criteria

Sprint 111 is complete only when evaluation-time expansion obeys the accepted
control contract, generated frame properties retain their own iterator
bindings, the cap and authored limit remain separate, and all entry/resource
gates have explicit outcomes. A separate product-owner disposition is
required. S111 does not authorize or prove S112 serialization/render parity.

## Entry

- Sprint 109 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS; Sprint 110 is
  ACCEPTED/CLOSED.
- Lead Developer allocation of the 64-output overflow diagnostic is
  recorded, including code, message, phase, and source anchor.
- D111-01 iterator/timeline-name collision is dispositioned before affected
  runtime behavior is implemented.
- D111-02 confirms an existing work bound or records a separate product
  decision. The 64-output cap is not represented as a loop-iteration or
  memory bound without evidence.
- D111-03 defines a safe serialization/browser staging boundary while S112
  remains pending.
- Separate S111 execution authorization and exact file/command/evidence plan
  are recorded before implementation edits.

## Expansion and Frame Evaluation

- Diagram controls are evaluated during model creation, not per frame.
  Conditions nested inside loops are evaluated once per traversal visit.
- Loop/branch traversal is deterministic and preserves depth-first source
  order and existing iterable order. Empty/unselected content emits nothing.
- Membership and internal instance identity/order remain fixed over all
  frame requests for one model. Recreating the model may change membership.
- Each generated primitive evaluates properties using the captured loop
  binding plus the requested timeline value. Distinct iterations do not
  share the final iterator value or mutate the document environment.
- Timeline variable collision follows D111-01; neither loop value nor frame
  time is silently overwritten.
- The existing ordered `DiagramFrame.elements` contract remains usable.
  Generated identities are unique internally but not source-addressable.

## Limits, Diagnostics, Compatibility

- Exactly 64 control-originating primitive emissions per evaluated diagram
  succeed. The 65th fails before it is appended/evaluated with the allocated
  diagnostic and approved source anchor.
- Direct top-level primitives do not consume the 64 cap. The cap resets per
  diagram and does not become report-wide.
- Existing authored 512-per-report counting and `AMXD013` remain unchanged.
  The valid mixed boundary is 511 direct authored primitives plus one
  loop-authored primitive emitted 64 times: 512 authored declarations and
  575 frame elements. A 512-direct plus 64-generated composition would
  require 513 authored declarations and remains invalid under `AMXD013`.
- Existing diagrams without controls retain prior initial and frame output.
- Source and property diagnostics keep authored source locations.
- High-iteration zero/low-output evidence is recorded. Any unbounded work
  result is reported as a blocker/residual and is not hidden by cap success.
- S111 does not claim model serialization/deserialization, generated browser
  playback, static export parity, editor behavior, cross-platform performance,
  or release readiness.

## Evidence and Disposition

- All cases in `runtime-test-matrix.md` map to focused tests or a named
  blocked/residual disposition. Exact boundary/error spans use complete
  fixtures.
- Record commands, host, timing/allocation observations, changed paths,
  failures/retries, unavailable tests, and generated artifact preservation.
- Builder recommendation and separate product-owner ACCEPTED/CLOSED or
  BLOCKED/OPEN disposition are recorded distinctly.
- Sprint 112 and later work remain separate authorization gates.