# Sprint 111 Requirements: V0.18 Evaluation-Time Expansion and Frame Bindings

## Document Status and Entry Gate

Architect-prepared planning documentation. Sprint 110 is ACCEPTED/CLOSED by
the user on 2026-10-31. Its recursive AST, parser, typechecker, formatter,
`AMXD6001` control-time diagnostic, and fail-closed boundary are the current
baseline.

This package authorizes planning only. Obtain separate Sprint 111 execution
authorization and approval of the concrete file-by-file implementation,
test, and evidence plan before editing source or tests.

**Blocking diagnostic prerequisite:** Sprint 110 evidence leaves the
generated-cap overflow diagnostic unallocated. Before implementation, the
Lead Developer must allocate its new stable identity, exact message, failure
phase, and primary source anchor. Do not guess a code, reuse `AMXD013`, or
use `AMXD6002`/`AMXD6003` (declined in the S110 disposition).

The accepted S109 one-host qualification has no peak-memory or
cross-platform claim. S111 must use it as rationale for the accepted cap, not
as evidence that the new production expansion path has been qualified.

## Goal

Expand each diagram's ordered recursive content once when its model is
created, selecting branches and iterating with existing AMX semantics.
Produce an ordered set of primitive instances, enforce the accepted
64-control-emission cap per evaluated diagram, and evaluate each instance's
properties at requested frames with the correct captured iterator binding
and current timeline value.

Keep authored primitive accounting and `AMXD013` separate. Preserve
existing behavior for diagrams without controls. This sprint does not
implement scene serialization compatibility, generated browser playback,
editor support, published documentation, or release work.

## Accepted Behavior Authority

- Sprint 109 was ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-10-30.
  Count only primitives emitted from diagram control blocks toward the new
  cap; the cap is exactly 64 per evaluated diagram. Direct top-level
  primitives do not consume it. The 65th control-originating emission is
  the first overflow.
- Sprint 110 was ACCEPTED/CLOSED on 2026-10-31. The AST's canonical
  `DiagramDeclarationNode.content` is an ordered recursive union of primitive,
  `for`, and `if` nodes. Parse-time nested-loop rejection and checker
  semantics are accepted. `AMXD6001` rejects the diagram time variable in
  iterables/conditions at the identifier.
- Every accepted control is traversed during model creation, not per frame.
  A condition nested inside a loop is evaluated once per loop traversal, not
  once per animation frame.
- Source order is depth-first: direct content remains in place; loop output
  follows iterable order; a conditional emits only its selected branch.
- Primitive properties are evaluated for each requested frame. An emitted
  instance retains its loop-variable value while the timeline variable is
  set to the requested frame time.
- Generated instances have internal identities needed for evaluation and
  rendering, but no source-level names/references or cross-model identity
  guarantee.
- The existing authored 512-elements-per-report rule and `AMXD013` remain
  separate. Each syntactically authored primitive was counted once in S110,
  regardless of branch/loop repetition.

## In Scope

- Recursively walk `DiagramDeclarationNode.content` in `createDiagramModel`.
- Evaluate each encountered loop iterable using existing list/range runtime
  semantics. Scope and restore the iterator binding as existing AMX loops do.
- Evaluate each encountered conditional using existing Boolean expression
  semantics and visit only the selected branch.
- Produce ordered internal primitive instances and an independent count of
  control-block-originating emissions. Direct top-level primitives do not
  increment that count; any primitive reached inside a loop or selected
  conditional block does. Nested legal controls preserve the same rule.
- Stop before allocating/evaluating the first emitted instance beyond 64 and
  raise the separately allocated overflow diagnostic at its approved source
  anchor.
- Retain the iterator binding needed by each generated primitive. At each
  frame, evaluate properties against the captured diagram context plus that
  instance binding and the requested timeline value.
- Keep membership and order fixed for one model across all frames. Recreating
  a diagram model with different non-time inputs may produce different
  membership.
- Remove the S110 fail-closed evaluator rejection only for paths that now
  perform correct in-process expansion. Keep a safe boundary for any
  serialized/browser path that cannot yet preserve per-instance bindings.
- Add runtime tests from `runtime-test-matrix.md`, including cap boundaries,
  environment restoration, source order, multiple frames, and unchanged
  static diagrams.

## Out of Scope

- Changes to the accepted cap/accounting rule, authored `AMXD013` accounting,
  diagram/report limits, or broad HTML-size policy.
- Scene-model serialization/deserialization changes, generated browser
  runtime rebuilds, interactive browser playback, static PDF/DOCX parity,
  editor support, language-spec publication, examples, README, and release.
  These belong to S112-S114.
- Nested `for` loops, `t` in control expressions, source-level generated
  instance names/references, new primitive kinds, or general diagram
  statements/effects.
- Adding a new iteration-count cap or other product resource policy without
  a separate product decision.
- Cross-platform or low-end-device performance certification.

## Open Entry Decisions

- **D111-01, iterator/time-name collision:** S110 rejects references to the
  timeline variable in control expressions but currently allows a loop
  iterator with the same name as that timeline variable. Such shadowing
  conflicts with S111's requirement to preserve both the loop value and
  frame-time value in primitive properties. Obtain an explicit product
  decision; recommended behavior is reject the collision at the iterator
  identifier using `AMXD6001`, subject to allocator/product confirmation.
- **D111-02, work bound:** the accepted cap bounds emitted control primitives,
  not iteration count or control evaluations. Large iterable values with an
  empty body, false branches, or fewer than 65 emissions may still require
  unbounded traversal and `evaluateLoopIterable` may materialize an entire
  range. Verify a separate existing bound or request a product decision.
  Do not silently add an iteration cap or claim the 64-output cap bounds CPU
  or memory.
- **D111-03, serialization boundary:** S112 owns production per-instance
  serialization and browser runtime support. Determine how S111 keeps
  generated models from being serialized into a browser path that cannot yet
  restore their bindings. Do not silently allow incorrect playback or expand
  S111 into S112 renderer/runtime-bundle work.
- **D111-04, overflow diagnostic:** resolve the required Lead Developer
  allocation before cap-enforcement implementation.

Unresolved D111-01 through D111-04 block the affected implementation. If
the required product/diagnostic decision is not available, leave the
corresponding case unimplemented and recommend BLOCKED/OPEN rather than
guessing.