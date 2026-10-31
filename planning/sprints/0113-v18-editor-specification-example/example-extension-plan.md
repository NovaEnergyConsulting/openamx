# Sprint 113 Example 08 Extension Plan

## Goal and Preservation

Extend the existing crank-slider lesson in
`examples/08_Formula_Driven_Diagrams.amx` to demonstrate a loop and a
conditional generating multiple primitives within the existing diagram.
Keep the current crank-slider formulas, workflow, input-free setup, direct
mechanism elements, and navigation intact. The addition must be runnable,
small, and under the accepted 64 generated-output cap.

## Proposed Content

Add one diagram-local loop over a short numeric list. Nest a conditional in
the loop to omit one value, then emit the same primitive declaration for
the remaining iterations. Use `t` only in a supported primitive property,
for example the generated circles' `cy` property; do not use `t` in the
iterable or condition.

Suggested source shape, to be reviewed against the final accepted contract
before editing:

```amx
  for sample in [0, 1, 2, 3] {
    if sample > 0 {
      circle tracePoint {
        cx: pivotX + crankX(t, crankRadius) + sample * 4
        cy: 100 + crankY(t, crankRadius)
        r: 2
        stroke: "#263238"
        fill: "#F3B64B"
        lineWidth: 1
      }
    }
  }
```

This emits three generated primitives, uses both permitted mixed nesting
forms (loop containing conditional), keeps the control expressions
time-independent, and leaves each generated primitive's `cy` animated by
`t`. It does not add a source-level name/reference feature; `tracePoint` is
the repeated authored primitive declaration, not a unique identifier for
each emitted instance.

## Expected Outcome

- At model creation, the conditional omits `sample == 0`, so three ordered
  circle instances are generated after the existing direct diagram content.
- At the lower time bound `t = 0`, the crank height is at its centerline;
  at an interior time such as `t = 0.5`, the generated circles' `cy` changes
  while the three-instance membership/order remains fixed.
- Recreating the model is the only way control membership may change from
  changed non-time inputs. Animation itself does not change topology.
- Standalone HTML begins paused at the lower time bound and can scrub/play
  the generated points. PDF and DOCX show the same three points at the lower
  bound; DOCX remains a raster image rather than editable Word shapes.
- Total generated emissions for the diagram remain far below 64. Existing
  authored declarations continue to count once each toward the 512/report
  `AMXD013` limit.

## Documentation and Test Notes

- Update lesson objective, desktop workflow, expected outcome, and navigation
  text only as necessary to mention generated controls. Avoid a language
  tutorial or duplicating the full V0.18 specification in the example.
- Test the entire source document through parser, checker, formatter, and
  evaluator. Confirm the formatted output is stable.
- Verify actual browser frame attributes for all repeated source instances;
  a selector by `data-diagram-element="tracePoint"` may match multiple
  nodes. Do not assume that attribute is a unique generated identity.
- Verify PDF lower-bound SVG and DOCX PNG contain all three generated
  elements in source order.
- Preserve existing direct crank-slider behavior, time interval, geometry,
  standalone controls, static export claims, and all lesson links.