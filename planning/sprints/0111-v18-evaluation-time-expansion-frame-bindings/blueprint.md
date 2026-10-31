# Sprint 111 Blueprint: Evaluation-Time Expansion and Frame Bindings

## Approach

1. Recheck S109 and S110 separate dispositions and the current worktree.
   Obtain explicit S111 execution authorization and exact file/test/output
   approval before any implementation changes.
2. Resolve D111-01 through D111-04 in `requirements.md` and
   `diagnostics-and-gates.md`. In particular, allocate the cap-overflow
   diagnostic and decide the iterator/timeline-name collision before
   implementing affected paths.
3. Design an immutable internal expanded-instance representation from the
   accepted recursive AST. Keep source declaration name/location separately
   from any unique internal instance identity. Do not expose an AMX reference
   or alter source-level names.
4. Expand in `createDiagramModel` in ordered depth-first traversal. Evaluate
   each iterable once per traversal visit, each condition once per visit, and
   preserve existing list/range and Boolean semantics. A condition inside a
   loop is evaluated for that iteration during model creation; no control is
   reevaluated for each frame.
5. Track whether each emitted primitive originated inside a control block.
   Increment the accepted per-model generated count only for those outputs.
   Permit exactly 64; before emitting the 65th control-originating primitive,
   raise the allocated diagnostic at the agreed source location. Direct
   primitives do not consume this counter. Keep `AMXD013` unchanged.
6. Preserve per-instance iterator values. At frame evaluation, derive a
   working environment from the captured diagram environment, bind the
   instance's iterator value, and assign the requested timeline value. Use
   the approved D111-01 rule to prevent one binding from overwriting the
   other. Ensure one instance's bindings cannot leak to another or to the
   caller's document environment.
7. Retain the existing `DiagramFrame.elements` ordered contract and all
   primitive geometry/style/time diagnostics. Verify model membership/order
   across lower, interior, upper, repeated, and out-of-order frame requests.
8. Resolve D111-03 before removing the S110 fail-closed boundary. S112 owns
   serialization of per-instance contexts and generated browser runtime
   behavior. Keep the S111 implementation from producing misleading
   serialized playback; do not hand-edit `diagramBrowserRuntime.ts`.
9. Verify empty and low-emission high-iteration controls as required by
   D111-02. If the output cap does not bound traversal and no existing bound
   is established, stop for a product decision; do not invent a second cap.
10. Add focused tests and runtime-focused evidence. Preserve failed attempts,
    avoid unrelated suites, record all changed paths, and request a separate
    S111 product-owner disposition.

## Candidate Source and Test Surfaces

Production candidates, subject to the approved plan:

- `src/runtime/diagramModel.ts` - recursive expansion during model creation,
  generated count, captured bindings, frame evaluation, and safe serialization
  boundary as approved.
- `src/runtime/evaluateExpression.ts` - only if a shared loop iterable or
  binding helper must be exposed/reused. Avoid duplicating semantics or
  broad evaluator refactoring.
- `src/diagnostics/errors.ts` - only if the allocated overflow code requires
  a new registration. No allocation is authorized by this package.
- `src/runtime/diagramBrowserEntry.ts`, `src/renderer/diagramHtml.ts`, or
  generated browser runtime are not blanket S111 scope; S112 owns browser
  serialization/playback integration.

Focused test candidate:

- `tests/diagram.test.ts` - expand and evaluate controls in-process, verify
  bindings/order/cap/scope/diagnostics, and preserve static diagrams.
- Add a separate runtime test file only if the approved plan demonstrates
  that existing diagram fixtures/helpers are unsuitable.

No production path or test file is approved by this preparation. Any added
path requires separate explicit approval.

## Verification

- Focused runtime tests from `runtime-test-matrix.md` and the precise
  typecheck/build commands approved for S111.
- Verify exact overflow boundary at 64 and 65 under control-only accounting,
  including mixed direct/generated output and independent per-diagram
  counters.
- Verify the same model at multiple frame times and confirm properties
  observe both the captured loop value and requested timeline value.
- Verify source environment and shadowed iterator restoration, including
  exceptional expansion paths where practical.
- Exercise an empty/false-branch high-iteration workload and record timing /
  allocation observations. Do not assert an unapproved iteration limit.
- Audit in-process, serialization, interactive, and static paths separately.
  S111 runtime evidence is not S112 browser/export acceptance.
- Check exact source locations for frame and overflow failures; report all
  checks not run. Run `git diff --check` and final changed-path inventory.

## Stop Conditions

- No overflow implementation until its diagnostic is allocated with phase,
  exact message, and anchor. Never reuse `AMXD013` or declined IDs.
- No runtime behavior until D111-01 settles iterator/time-variable collision.
- No claim that the output cap bounds traversal/resource use until D111-02
  is resolved with evidence or a separate product decision.
- No removal of fail-closed behavior until D111-03 prevents incomplete
  per-instance context from reaching a serialized browser path.
- Any scope beyond the approved S111 plan requires separate approval.
- Sprint 112, release, publication, version change, and certification remain
  separately gated.