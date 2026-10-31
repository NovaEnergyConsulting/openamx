# Sprint 111 Runtime Expansion Contract

## Status

This document combines confirmed V0.18 behavior with the accepted Sprint 109
cap decision and the accepted Sprint 110 AST/checker implementation. Items
under **Open Runtime Decisions** require explicit disposition before their
affected implementation. This is not authorization to edit runtime code.

## Model-Creation Expansion

- Expand `DiagramDeclarationNode.content` once per `createDiagramModel` call.
- Traverse content depth-first and in source order. Emit direct primitive
  nodes in place; visit loop bodies in existing iterable order; visit only
  the selected conditional branch.
- Evaluate a loop iterable when entering that loop during model creation.
  For a conditional nested inside a loop, evaluate its condition once for
  each loop iteration that reaches it. No iterable or condition is evaluated
  again by `evaluateDiagramFrame`.
- Empty iterables and unselected branches emit no primitives. They do not
  affect direct siblings or reorder later content.
- Recreating a model reevaluates controls against that model's current
  document environment and may produce a different membership/order.

## Accepted Generated-Element Cap

- Cap: **64 control-block-originating primitive emissions per evaluated
  diagram**.
- Counting begins when an emitted primitive is reached through any diagram
  `for` block or selected `if`/`else` branch. This includes direct primitives
  inside a conditional outside a loop, and primitives inside a conditional
  nested within a loop.
- Direct top-level primitives outside all control blocks do not consume the
  generated cap.
- Each repeated loop emission counts as a separate generated primitive.
  Unselected branches and empty iterables contribute zero emissions.
- Exactly 64 control-originating emissions are accepted. Before appending or
  evaluating the 65th such primitive, fail deterministically with the
  separately allocated overflow diagnostic and source anchor.
- The counter is per evaluated diagram, not per report. No report-wide
  generated cap is added.
- The existing authored declaration count stays independent: each authored
  primitive is counted once by the S110 checker toward 512 per report, with
  `AMXD013`. Never reinterpret that count as expanded output or reuse its
  diagnostic for generated overflow.

## Per-Instance Frame Bindings

- Every emitted primitive retains its source node/location, an internal
  unique instance identity, whether it is control-originating, and the loop
  binding necessary to evaluate its properties. A primitive outside a loop
  has no iterator binding, even if it is inside a conditional branch.
- The internal identity is unique within one model and deterministic in
  emission order if required by the renderer. It is not a source-level name,
  stable cross-model key, or AMX-addressable reference.
- For each requested frame, evaluate primitive properties using the captured
  diagram context plus that instance's iterator binding and the current
  timeline value. Preserve existing function/module/record/enum evaluation
  context through the existing model environment.
- Keep `DiagramFrame.elements` in the same order at every frame. Property
  values may vary with time; membership and identity may not.
- Scope and restore iterator bindings consistently with existing loop
  semantics, including restoration of a shadowed outer value. Never mutate
  the source document environment during diagram expansion.
- Apply existing primitive validation and frame-time diagnostics at the
  originating property source. Generated identity must not replace the
  authoring source location.

## Open Runtime Decisions

### D111-01: Iterator Name Equals Timeline Name

S110 rejects references to the timeline variable inside loop iterables and
conditional tests with `AMXD6001`, but it does not reject a loop iterator
whose declared name equals the timeline variable. S111 must preserve both
the loop value and frame time; one AMX name cannot denote both inside the
primitive properties.

**Recommendation:** reject a loop iterator whose name equals the declared
timeline variable at `variableSource`, using `AMXD6001` only if the Lead
Developer/product owner confirms this condition is within that diagnostic's
allocated meaning. Otherwise allocate/approve the appropriate contract before
implementation. Do not silently let the loop binding shadow frame time.

### D111-02: Work Bound Beyond Output Count

The accepted cap limits emitted primitives, not loop iterations or condition
evaluations. A large iterable whose body is empty or whose conditions select
no primitives can perform substantial work while emitting zero elements.
The current generic range evaluator materializes a full array. The 64-output
cap alone therefore does not prove bounded evaluation time or memory.

Verify whether an existing accepted input/iterable bound makes this safe. If
not, request a separate product decision for an iteration/work bound or
another scoped resource strategy. Do not add a silent iteration cap, truncate
iteration, or claim the generated-output cap bounds CPU/memory.

### D111-03: Serialization and Browser Staging

S112 owns preserving per-instance contexts through scene-model
serialization/deserialization and generated browser runtime behavior. S111
may validate in-process frame evaluation, but it must not pass a generated
model into existing serialization/playback if its per-instance context will
be lost or ignored.

Resolve the exact fail-closed or staged-output boundary in the approved file
plan. Keep current serialized/generated output behavior for diagrams without
controls unchanged. Do not hand-edit generated browser artifacts.