# Sprint 112 Requirements: V0.18 Scene Serialization and Render Compatibility

## Document Status and Entry Gate

Architect-prepared planning documentation. Sprint 111 was ACCEPTED/CLOSED
WITH RECORDED RESIDUALS on 2026-10-31. Its in-process expansion and frame
binding behavior are the baseline for this sprint. S111 did not verify
generated-model serialization, browser playback, or static export parity.

This package authorizes planning only. Obtain separate Sprint 112 execution
authorization and approval of the concrete source/test/generated-output,
command, and artifact plan before edits or workflows that rewrite generated
artifacts.

## Goal

Extend scene-model serialization/deserialization to preserve S111's expanded
primitive membership, deterministic order, internal instance data, source
locations, and per-instance iterator bindings. Make the generated browser
runtime evaluate the restored model consistently with in-process evaluation.
Verify interactive HTML playback and lower-bound static HTML/PDF/DOCX output
use the same generated membership and expected frame-dependent values.

Exercise the HTML/output and composition boundaries measured in S109 without
changing unrelated size policies. Regenerate the browser runtime only through
`scripts/build-diagram-runtime.ts`.

## Accepted Behavior Authority

- Sprint 109 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS. The generated cap is
  64 control-block-originating emissions per evaluated diagram; direct
  top-level primitives do not consume it. The measured candidate was below
  the documented 1 MiB HTML statement and current 100 MiB renderer limit; the
  broader discrepancy remains an accepted residual and is not changed here.
- Sprint 110 is ACCEPTED/CLOSED. `DiagramDeclarationNode.content` is the
  canonical ordered recursive AST. `AMXD6001` rejects the diagram time
  variable in controls. Nested loops are rejected during parsing.
- Sprint 111 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS. `AMXD6004` rejects
  the 65th control-originating primitive during model creation before it is
  appended/evaluated. In-process models retain ordered expanded descriptors
  with cloned iterator bindings. Direct authored elements remain separate
  from the generated cap; `AMXD013` continues to mean more than 512 authored
  elements per report.
- D111-02 is an accepted potentially unbounded-work residual. S112 does not
  introduce an iteration/work cap or claim that the 64-output cap bounds
  evaluation time or memory.
- S111 intentionally rejects serialization of control-bearing diagrams
  until the per-instance bindings can be preserved. S112 owns removing that
  limitation for the supported serialized/browser path.

## In Scope

- Define and implement a serialized representation for expanded instances,
  preserving ordered membership, the source primitive needed for property
  evaluation/diagnostics, unique internal instance identity within the
  model, and every iterator binding/value needed by that instance.
- Restore the instance list after deserialization without reevaluating loop
  iterables or conditional branches. A serialized model's membership/order
  stays fixed even if the caller's current inputs differ.
- Preserve the captured AMX environment, declaration registries, timeline,
  initial frame, and current no-control scene-model behavior.
- Make the bundled browser runtime deserialize the new model and evaluate
  frames with the same ordered element values as `evaluateDiagramFrame` in
  process.
- Preserve and verify offline standalone HTML playback and the applicable
  preview workflow. Report harness and native-host evidence separately.
- Verify static HTML/report output plus PDF inline SVG and DOCX embedded PNG
  at the diagram's lower-bound time. Preserve report order, visible title,
  description/alt metadata where already required, proportions, and frame
  values.
- Exercise S109-measured per-diagram and 16-diagram composition boundaries,
  HTML size, serialization size, frame performance, and static output size.
  Record observations and residuals; do not broaden resource policy.
- Add serializer, browser, renderer, export, and legacy static-model
  regressions mapped in `serialization-render-test-matrix.md`.

## Out of Scope

- Changing the accepted 64 cap, its control-only accounting, the `AMXD6004`
  identity/message/anchor, or `AMXD013` authored accounting.
- Adding a loop-iteration, CPU, or memory cap; resolving D111-02 without a
  separate product decision; changing HTML output-size policy or the V0.13
  documented 1 MiB discrepancy.
- Parser/checker/formatter behavior, editor support, published V0.18
  specification, README/examples, release, package/version changes, or
  platform certification.
- New primitives, source-level generated-instance names/references, or
  changes to geometry/style or report narrative ordering.
- Hand-editing generated browser bundle output.

## Open Design Decisions

- **D112-01 Serialized format compatibility:** The current envelope is
  version 1 and contains `model` plus captured `context`; S111's expanded
  instances live only in a `WeakMap`. Recommend a versioned new envelope for
  generated models, with v1 static payloads still deserializable. Confirm the
  writer/reader compatibility contract before implementation. Do not silently
  accept a control-bearing legacy payload without expanded-instance data.
- **D112-02 Instance encoding:** Choose whether serialized descriptors carry
  an embedded primitive node or a validated locator into the model's
  recursive AST, plus identity and bindings. Preserve order and source
  locations; avoid introducing a source-level identity API. Record payload
  size and malformed-payload behavior.
- **D112-03 Binding value support:** Define which existing AMX values can be
  carried through the current tagged `serializeValue`/`deserializeValue`
  mechanism. Verify records, measurements, enums, lists, and ordinary scalar
  values as applicable. Reject unsupported/cyclic/malformed values
  deterministically rather than restoring corrupted frames.
- **D112-04 Static HTML meaning:** Confirm whether acceptance treats the
  generated standalone report's interactive HTML model and the lower-bound
  static HTML/report path as separate outputs. Do not infer static output
  parity from the interactive HTML test alone.

Resolve these in the execution plan or record explicit owners/residuals.
Unresolved D112-01, D112-02, or D112-03 blocks claiming serialization
compatibility; unresolved D112-04 blocks complete output parity acceptance.