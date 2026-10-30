# Sprint 109 Blueprint: V0.18 Language Contract and Resource Qualification

## Approach

1. Obtain separate Sprint 109 execution authorization and approval of the
   exact read-only review, prototype, benchmark, artifact, and verification
   plan. Keep all new or changed files within this sprint folder unless a
   separate file-scope amendment is approved.
2. Read the V0.18 master plan and the smallest relevant existing syntax,
   runtime, renderer, limit, and test surfaces. Record source-observed facts
   separately from product requirements and proposals.
3. Complete `diagram-generation-contract.md`. Reuse existing AMX block,
   iterable, conditional, variable-scope, and source-location conventions.
   Do not infer new language behavior from incidental implementation details.
4. Finalize `qualification-cases.md` and `diagnostic-matrix.md` with stable
   IDs, input conditions, expected results, and ownership in Sprints 110-114.
   Do not invent diagnostic codes or messages; identify the required owner
   disposition for new stable diagnostics.
5. Execute the approved prototype to answer the per-instance binding
   question: generate at least two instances with distinct loop values,
   evaluate multiple `t` values, serialize/deserialize the scene model, and
   repeat frame evaluation. Membership and order must remain fixed while
   property values depending on `t` change.
6. Execute the benchmark matrix in `resource-qualification.md`. Preserve raw
   output, exact commands, host/tool versions, and all failed or unavailable
   runs. Compare candidate workloads with the existing static-diagram path.
7. Decide cap accounting and recommend a numeric per-diagram cap using the
   evidence. Separately decide whether the existing HTML byte limit is a
   binding constraint. Do not change either limit in product code.
8. Complete `requirement-test-matrix.md` and reconcile every requirement,
   fixture, diagnostic, measurement, and downstream owner. Submit
   `builder-evidence.md` for a separate Lead Developer/product-owner
   disposition.

## Source-Observed Baseline To Verify

The following observations were confirmed during Architect preparation and
must be rechecked against the authorized execution snapshot:

- `createDiagramModel` evaluates diagram-level values, creates an initial
  frame, and captures an evaluation environment for later frames.
- `evaluateFrame` clones an environment, sets the requested timeline value,
  and produces an ordered `DiagramFrame.elements` array from the flat
  declaration element list.
- The scene-model serializer serializes both the model and captured context;
  deserialization restores the model and context.
- The checker enforces at most 512 authored diagram elements per report using
  `AMXD013`; this remains distinct from the generated-output cap.
- Interactive diagram HTML currently enforces 100 MiB, while the V0.13
  specification states a 1 MiB interactive-preview constraint.

These are implementation facts, not permission to preserve an incompatible
behavior or change a confirmed V0.18 requirement.

## Required Sprint Artifacts

- `diagram-generation-contract.md`: proposed testable syntax and semantic
  contract, source facts, decision register, and unresolved questions.
- `resource-qualification.md`: prototype protocol, benchmark matrix,
  measurement method, cap-selection record, and HTML-size decision.
- `qualification-cases.md`: stable control-flow, ordering, scope, frame,
  serialization, and resource cases.
- `diagnostic-matrix.md`: failure phase, expected diagnostic policy, source
  anchor, and downstream owner for negative cases.
- `requirement-test-matrix.md`: traceability from master-plan requirements to
  decisions, cases, measurements, and owning sprint.
- `builder-evidence.md`: exact authorized actions and outcomes, raw evidence,
  residuals, recommendation, and pending separate disposition.

## Boundaries

- This sprint is a contract and feasibility gate, not a feature sprint.
- Do not edit historical language specifications or silently resolve a
  product question in implementation-oriented prose.
- A passing prototype demonstrates only the tested host/workload. It does not
  establish broad performance, cross-platform, or release qualification.
- Do not begin Sprint 110 until the contract, cap accounting, numeric cap,
  diagnostics, and required evidence have a separate ACCEPTED/CLOSED
  disposition.