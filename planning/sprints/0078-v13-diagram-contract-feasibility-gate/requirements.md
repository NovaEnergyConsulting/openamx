# Sprint 078 Requirements: V0.13 Diagram Contract and Feasibility Gate

## Goal

Turn the confirmed V0.13 diagram scope into a reviewable language/rendering
contract and determine, with isolated evidence, whether the proposed shared
diagram model can safely support interactive HTML, desktop preview, PDF, and
DOCX. Produce a traceable go/no-go recommendation and identify any product
decisions required before Sprint 079 begins.

This is a contract and feasibility sprint. It does not implement the feature or
authorize production changes.

## Dependencies and Inputs

- `planning/plan-openamxV13MasterSprintPlan.md` is the confirmed V0.13 scope
  and delivery authority.
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, and `planning/sprints/0000-sprint-template/`.
- Consult the current language specification, parser/type-checker/runtime,
  report-preparation and renderer paths, desktop preview security/lifecycle,
  and existing tests only as needed to assess compatibility and design probes.
- Sprint 078 is the first V0.13 sprint. It has no implementation dependency on
  V0.12 feature work beyond the existing language and output behavior.

## In Scope

- Define candidate and then freeze the diagram declaration structure, element
  property rules, local time scope, bound/duration evaluation, expression
  evaluation contract, source-location rules, and canonical formatter behavior.
- Produce mutually consistent valid/invalid language examples, a
  source-located diagnostic matrix, and a requirement-to-test fixture map.
- Specify the minimal destination-neutral scene data needed to preserve
  element order, geometry, static style, title/description, timeline, and
  source locations across output destinations.
- Use isolated probes to exercise a crank-slider and a battery-resistor current
  indicator through standalone HTML, the actual desktop live-preview path, PDF,
  and DOCX. Inspect generated artifacts and preview behavior; serialization
  success alone is insufficient.
- Test responsive aspect-ratio behavior, accessibility metadata, offline
  operation, safe serialization of report-derived text/data, and availability
  of packaged rendering resources.
- Demonstrate safe arbitrary-time expression evaluation with existing AMX
  values/functions. The probe must not generate executable source from AMX
  expressions or execute report-authored JavaScript.
- Measure representative rendering time, output size, and preview resource use;
  recommend measurable bounds based on recorded evidence rather than
  unsupported guesses.
- Record residual risks, blockers, and explicit product decisions needed
  before feature implementation.

## Out of Scope

- Production parser, AST, type checker, runtime, formatter, editor, renderer,
  or desktop-preview implementation.
- A V0.13 language specification, production examples, editor help, or
  integration work assigned to later sprints.
- Relaxing the desktop preview security boundary, adding remote dependencies,
  generated executable AMX-derived code, or substituting a silent rendering
  fallback.
- Release engineering, version changes, publication, or release authorization.

## Constraints

- The V0.13 master plan is the behavior authority. Refine structure and
  validation details without reducing or silently extending its confirmed
  semantics.
- Keep confirmed requirements distinct from candidate grammar, probe
  assumptions, and decisions requiring Lead Developer approval.
- Preserve existing AMX expression/function semantics and source locations.
  Do not silently add language-wide semantics or math functions to make a
  probe work. If the required examples cannot be expressed with the existing
  contract, stop and request a specific product decision.
- Invalid bounds or geometry must produce explicit source-located failures and
  stop rendering; no omission, stale frame, blank output, or placeholder may
  be counted as success.
- Any probes or generated artifacts must be isolated to the sprint workspace
  and must not alter production behavior. Obtain explicit Sprint 078 execution
  authorization and approval of the concrete file-by-file plan before making
  changes.
- A feasibility result is evidence, not approval to begin Sprint 079 or release
  the feature.
