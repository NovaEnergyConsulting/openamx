# Sprint 079 Requirements: Diagram Language and Shared Scene Model

## Goal

Implement the approved V0.13 declarative diagram language and its immutable,
typed, destination-neutral scene model. Extend parsing, type checking, runtime
evaluation, and formatting so a diagram can be validated and evaluated at any
selected time in its declared interval while preserving existing AMX
expression/function semantics. Add focused, fixture-driven tests before the
rendering-surface integrations in Sprints 080 and 081.

## Dependencies and Authority

- Sprint 078 is recorded **GO / CLOSED WITH RECORDED IMPLEMENTATION
  RESIDUALS**, with Lead Developer GO for Sprint 079 readiness. This is a
  readiness decision, not execution authorization.
- The V0.13 master plan and the approved Sprint 078 contract artifacts are
  authoritative:
  - `planning/plan-openamxV13MasterSprintPlan.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/diagnostic-matrix.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/requirement-test-matrix.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/feasibility-report.md`
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, and the current worktree status before planning code edits.
- Obtain separate explicit Sprint 079 execution authorization and approval of
  the concrete file-by-file plan before changing production code or tests.

## In Scope

- Add the approved `diagram Identifier { ... }` declaration and the exact
  title, description, width, height, time, primitive, property, style, and
  ordering rules from the Sprint 078 grammar contract.
- Extend AST/parser/type-checking and source tracking for declarations,
  expressions, elements, and diagram-local time. Preserve document scope,
  source ordering, imports, existing AMX syntax and all unrelated semantics.
- Validate required values and types; finite positive canvas dimensions;
  finite ordered time bounds; finite positive playback duration; supported
  primitives/properties/styles; and positive primitive dimensions.
- Evaluate bounds and duration once in document scope. Evaluate geometry and
  labels directly at an explicitly selected in-range time, using existing AMX
  values and pure functions plus the local numeric time variable. Do not add
  stateful simulation, additional time variables, generated executable source,
  or general-purpose language semantics.
- Capture an immutable typed model/emission preserving declaration/source
  order, logical canvas, title, accessible description, timeline, static
  style, source attribution, and the validated expressions/context needed for
  arbitrary-time evaluation.
- Enforce the approved structural limits of at most 16 diagrams per report
  and 512 semantic primitive elements total per report. A semantic element is
  one `line`, `rectangle`, `circle`, or `text` declaration; renderer-generated
  arrowheads and controls do not count as authored elements.
- Implement the approved canonical formatter order, two-space indentation,
  one property per line, no semicolons, and preservation of expression text.
- Add focused parser, type-checker, evaluator/model, formatter, and regression
  tests using the complete Sprint 078 fixture documents and exact diagnostic
  contract.

## Out of Scope

- Interactive HTML or desktop playback controls, SVG/UI rendering, preview
  lifecycle or runtime frame-error communication; Sprint 080 owns these.
- PDF or DOCX rendering/export integration; Sprint 081 owns these.
- VS Code and desktop editor integration, highlighting, completion,
  diagnostics UI, language specification, or production examples; Sprint 082
  owns these.
- Changes to standard-library functions, coercions, serialization semantics,
  unrelated AMX runtime behavior, or preview security boundaries.
- Release engineering, version changes, publication, platform certification,
  or claims of V0.13 acceptance.

## Constraints and Open Items

- Implement the approved V0.13 grammar and diagnostic allocations exactly.
  Diagnostic fixture IDs such as `D-NEG-01` are not diagnostic codes.
- AMXD001-AMXD011 and approved AMX3001/AMX3002 reuse must retain their
  allocated messages and source locations from the Sprint 078 matrix. Do not
  replace them with generic syntax errors or guessed identities.
- Source locations are 1-based against the original document, including
  front matter, narrative, and executable-fence delimiters; columns count
  UTF-16 code units. Diagnostic ends are exclusive; UI `EditorRange` mapping
  remains zero-based and half-open through the existing source-range helpers.
- Preserve full existing AMX expression/function semantics. Sprint 078
  proved representative typed-context transport, not every AST/value
  combination. Broaden evaluator/model tests; do not interpret probe coverage
  as permission to narrow scope.
- The Lead Developer-approved resource caps are fixed. The diagnostic
  identity/message for exceeding the 16-diagram/512-element cap is not
  allocated in the Sprint 078 matrix; obtain an explicit decision before
  finalizing user-visible cap diagnostics. Do not reuse an unrelated code or
  report a cap failure as success.
- Sprint 078's native desktop UAT and production acceptance remain pending
  until implementation. Its isolated probe is feasibility evidence only.
- Preserve the existing AMX1004 behavior observed when an imported function
  directly references an enum identifier in its call frame. Do not silently
  change that unrelated runtime behavior; establish and record the feature's
  required coverage or escalate a scope conflict.
