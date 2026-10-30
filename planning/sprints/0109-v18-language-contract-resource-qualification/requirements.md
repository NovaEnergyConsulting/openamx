# Sprint 109 Requirements: V0.18 Language Contract and Resource Qualification

## Document Status

Architect-prepared planning package. Sprint 109 artifacts are proposals and
qualification instructions until separately reviewed and dispositioned by
the Lead Developer/product owner. This package authorizes planning only. It
does not authorize implementation, release, publication, package/version
changes, or platform certification.

## Goal

Turn the confirmed V0.18 diagram-generation scope into a precise, testable
contract and qualify a safe generated-element cap before AST, parser,
typechecker, runtime, renderer, editor, or user-facing documentation work
begins. Demonstrate whether generated primitives can retain distinct loop
bindings across frame evaluation and scene-model serialization without
changing the ordered frame-element renderer contract.

Sprint 109 changes no product behavior. Its accepted artifacts are the
behavior and resource authority for Sprints 110-114.

## Authority and Inputs

- Scope and confirmed decisions: [`plan-openamxV18MasterSprintPlan.md`](../../plan-openamxV18MasterSprintPlan.md).
- Preceding closeout: Sprint 108 product-owner disposition is
  ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-10-25, within the amended
  V0.17 scope. This satisfies the V0.18 planning prerequisite; it does not
  turn V0.17 raw BLOCKED/UNAVAILABLE evidence into PASS.
- Existing diagram and block conventions: `docs/language-spec-v0.13.md`,
  `docs/language-spec-v0.16.md`, `examples/08_Formula_Driven_Diagrams.amx`,
  and existing loop/conditional examples.
- Implementation surfaces for read-only inspection: parser diagram-body
  handling, `checkDiagram`, diagram model creation/frame evaluation,
  serialization/deserialization, HTML size enforcement, and static output.
- Sprint 109 planning artifacts: `blueprint.md`,
  `diagram-generation-contract.md`, `resource-qualification.md`,
  `qualification-cases.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, `acceptance.md`, `builder-evidence.md`, and
  `handoff-prompt.md`.

## In Scope

- Specify the approved `for item in iterable { ... }` and braced `if`/`else`
  forms within diagram bodies, reusing existing AMX iterable and conditional
  semantics.
- Define control evaluation timing, primitive ordering, control-variable
  scope/restoration, `t` visibility, legal nesting, and source-location
  expectations without exceeding the confirmed V0.18 scope.
- Decide whether the generated-output cap counts every emitted primitive or
  only primitives originating in control blocks. Keep the existing authored
  element limit separate and unchanged.
- Benchmark construction/expansion, frame evaluation, serialization size and
  time, deserialization, interactive playback, and static output over
  representative and stress workloads. Recommend and disposition a numeric
  per-evaluated-diagram cap from recorded evidence.
- Prototype distinct per-generated-element bindings through multiple frame
  evaluations and serialization/deserialization. Confirm source order and
  the ordered `DiagramFrame.elements` contract remain usable.
- Record the documented 1 MiB versus implemented 100 MiB interactive HTML
  size discrepancy and decide whether it constrains the generated cap. Do not
  revise the broader HTML output policy in this sprint.
- Establish traceable parser, checker, runtime, renderer, editor, and
  acceptance cases for downstream sprints.

## Out of Scope

- Production source, test behavior, generated runtime artifacts, editor
  grammars/providers, published specifications, examples, manifests, or
  release files.
- Implementation of diagram loops/conditionals or downstream Sprint 110-114
  work.
- Nested `for` loops, use of `t` in controls, topology changes across frames,
  source-level identities/references for generated instances, new primitive
  kinds, or arbitrary AMX statements/effects in diagrams.
- Changing the existing 512 authored-element report limit, its accounting or
  diagnostic, or the interactive HTML size policy.
- Release, publication, package/version changes, platform certification, or
  disposition of V0.17 residuals.

## Completion Outputs

- A reviewed contract with every statement labeled confirmed, source-observed,
  proposed, decided, or unresolved.
- A stable qualification-case set with expected order, membership, binding,
  diagnostic, serialization, and rendering outcomes.
- Reproducible benchmark/prototype records, including environment, workload,
  raw measurements, analysis, limitations, and a cap recommendation.
- A complete requirement-to-evidence matrix and a separate product-owner
  disposition. Sprint 110 remains gated until Sprint 109 is accepted/closed
  and the required decisions are resolved.