# OpenAMX V0.18 Master Sprint Plan

## Problem and Proposed Approach

AMX diagrams currently declare a flat set of graphic primitives. AMX values
and expressions can parameterize those primitives, and diagram expressions can
continue to use the timeline variable for frame-by-frame animation. AMX loops
can emit whole diagram declarations, but there is no diagram-body construct
that programmatically emits multiple primitives within one diagram.

V0.18 will add bounded `for` iteration and conditional `if`/`else` emission
inside a diagram. It will reuse existing AMX block syntax and iterable
semantics. Loop iterables and conditions will be evaluated when the diagram is
evaluated, expanding its contents into one ordered set of primitives for that
model. That membership will remain fixed across the model's animation frames;
primitive property expressions will continue to be evaluated at each frame,
including expressions that depend on the diagram time variable.

Generated primitives will have internal identities for evaluation and
rendering, but no new AMX syntax for naming or referencing generated
instances. Loop and conditional blocks may nest in either direction, except
that a `for` loop may not appear within another `for` loop. A separate cap
will bound the emitted elements in each evaluated diagram. Its numeric value
will be selected after performance and resource qualification; the existing
authored-element limit remains distinct.

V0.18 is limited to this language feature and the supporting parser, runtime,
rendering, editor, documentation, and acceptance work. This plan records
scope and sequencing; it does not authorize release, publication, package
version changes, or platform certification. Implementation follows the V0.17
Sprint 108 closeout disposition and the V0.18 contract/resource gate in Sprint
109. V0.17 residuals are not carried into V0.18 scope unless separately
approved.

## Confirmed Product Decisions

- **Version scope:** Focus V0.18 on generating diagram elements. Do not add
  deferred folder-manager work or V0.17 closeout residuals to this release.
- **Syntax:** Reuse the existing `for item in iterable { ... }` and braced
  `if`/`else` forms, including established iterable and conditional semantics.
- **Expansion timing:** Evaluate loop iterables and branch conditions once
  when each diagram model is created. The resulting ordered primitive set is
  fixed for that model; a later diagram evaluation may produce a different
  set when its inputs differ.
- **Animation:** Continue evaluating primitive property expressions for each
  requested frame. Prohibit the diagram time variable `t` in loop iterables
  and conditional controls so that animation does not change model
  membership.
- **Block nesting:** Allow conditional blocks within loops and loops within
  conditional branches. Reject a `for` loop nested anywhere within another
  `for` loop, including through an intervening conditional.
- **Generated identity:** Generated instances receive internal identities
  only. Do not add language-level references or a new source-level identity
  contract for generated instances.
- **Resource limit:** Use a distinct cap per evaluated diagram. Determine its
  numeric value through performance/resource qualification. Preserve the
  existing authored-element limit and its accounting separately.
- **Output compatibility:** Preserve the existing interactive timeline and
  static HTML/PDF/DOCX rendering behavior for diagrams without generation.

## Recommended Approach

- Begin with a language contract and focused feasibility gate. Specify
  expansion timing, control-variable scope, ordering, diagnostics, and limit
  accounting before committing to the AST and serialized runtime-model shape.
  Use a small prototype to validate per-instance loop bindings across frames
  and browser serialization before broad implementation.
- Represent diagram bodies as ordered recursive content rather than forcing
  primitives into the generic statement AST. Add diagram-specific parsing for
  primitives, loops, and conditional branches, reusing existing expression,
  source-location, and block-parsing conventions where they fit.
- Extend diagram typechecking for loop iterable types, scoped variables,
  Boolean conditions, primitive property constraints, and prohibited uses of
  `t`. Keep authored-element accounting separate from the runtime expansion
  cap.
- Expand controls once in the diagram model creation path. Retain the
  environment binding for each generated primitive so frame evaluation can
  apply the requested `t` while preserving the loop's value. Preserve source
  order and source locations for rendering and diagnostics.
- Keep renderer interfaces based on ordered frame elements wherever
  possible. Update scene-model serialization and the generated browser
  runtime where the per-instance environment requires it. Do not hand-edit
  generated browser artifacts.
- Update both editor highlighting surfaces, the additive V0.18 language
  specification, README links, and a runnable example. Test both interactive
  and static output paths without changing existing diagram behavior.
- Record the current HTML output-size contract discrepancy during resource
  qualification: the V0.13 documentation describes a 1 MiB bound, while the
  current renderer uses 100 MiB. Do not revise that broader policy as part of
  V0.18 unless resolving it is necessary to select a safe generated-element
  cap.

## Confirmed Scope

### Diagram Content Syntax and Semantics

- Add `for` blocks and braced conditional blocks to diagram bodies, alongside
  existing primitive declarations.
- Reuse existing AMX iterable and conditional expression semantics; define
  how those controls are scoped and checked within a diagram.
- Preserve source order when emitting primitives from unconditional content,
  loop iterations, and selected conditional branches.
- Support conditional blocks inside loops and loops inside conditional
  branches, but reject nested loops, including nesting through conditional
  branches.
- Evaluate controls once for each diagram evaluation. Do not reevaluate
  iterable membership or branch selection for each animation frame.
- Reject use of the diagram time variable `t` in loop iterables and branch
  conditions. Continue to allow `t` in supported primitive property
  expressions.
- Define precise source diagnostics for malformed controls, invalid
  iterables/conditions, prohibited nesting, and expansion-limit overflow.

### Runtime Expansion and Resource Bounds

- Expand each diagram body to an ordered primitive set when the diagram model
  is created, using the current AMX evaluation environment.
- Preserve the correct loop-variable binding for every generated primitive
  throughout frame evaluation and scene-model serialization.
- Apply a separate generated-output cap per evaluated diagram. Choose the
  numeric limit, accounting rule, and diagnostic after benchmarking. The
  resource gate must explicitly decide whether the count includes all emitted
  primitives or only instances originating in control blocks.
- Retain the existing authored-element limit as a separate validation rule;
  do not repurpose its diagnostic or silently change its accounting.
- Keep a model's generated primitive membership and order stable across its
  frames while continuing to evaluate time-dependent property expressions at
  each frame.
- Preserve existing diagram behavior when no control blocks are present.

### Rendering, Editors, and Documentation

- Preserve ordered primitive consumption in interactive browser rendering
  and static HTML/PDF/DOCX output. Update the serialized scene model and
  generated browser runtime as required by per-instance bindings.
- Verify authoring support in the VS Code TextMate grammar and tests, and in
  the desktop editor's parser-proven highlighting and UI tests. Existing
  keyword tokenization may already recognize `for`, `if`, and `else`; add
  coverage for their use inside diagrams and for primitive declarations in
  nested blocks.
- Add `docs/language-spec-v0.18.md` as an additive contract, update relevant
  README navigation, and extend
  `examples/08_Formula_Driven_Diagrams.amx` with a runnable generated-elements
  example.

### Tests and Acceptance

- Add focused coverage for parsing, typechecking, formatting, runtime
  expansion, and diagnostics.
- Verify deterministic source ordering, empty iterables and branches, mixed
  block nesting, loop-variable scope restoration, and rejection of nested
  loops and `t` in controls.
- Verify the selected cap's exact boundary and overflow diagnostic, including
  its composition with the authored-element limit.
- Verify per-instance loop bindings at multiple frame times and after
  scene-model serialization/deserialization.
- Verify interactive browser output and static HTML/PDF/DOCX output preserve
  primitive membership and ordering.
- Verify VS Code and desktop editor highlighting, formatter output, and the
  documented example.
- Record evidence and any unavailable checks in integrated acceptance;
  distinguish a passing product test from a check that was not run.

## Explicit Exclusions

- Nested `for` loops, loop-driven topology changes during one model's
  animation, or use of `t` in loop iterables and conditional controls.
- New names, references, or APIs for addressing generated primitive
  instances.
- Arbitrary AMX statements, side effects, declarations, or function bodies
  inside a diagram; only the approved primitive, loop, and conditional
  content forms are in scope.
- New primitive kinds, changes to existing geometry/style semantics, or
  unrelated diagram layout and animation behavior.
- Deferred desktop file-manager work, V0.17 residual fixes, unrelated
  language/runtime changes, broad output-limit policy changes, and
  release/version/publication work.
- Changes to historical language specifications; V0.18 documentation is
  additive and records the new contract.

## Sprint Sequence

Continue after V0.17 Sprint 108, beginning with Sprint 109. Planning may
proceed independently of V0.17 closeout, but implementation work beyond the
V0.18 contract/feasibility gate is gated on the V0.17 closeout disposition
being recorded and Sprint 109 acceptance. V0.17 residuals remain outside this
version unless separately approved.

### Sprint 109: Language Contract and Resource Qualification

Architect-prepared Sprint 109 documentation package:
[`requirements.md`](sprints/0109-v18-language-contract-resource-qualification/requirements.md).

- Turn the approved product decisions into an executable language contract
  for control syntax, evaluation timing, iteration/branch ordering, `t`
  visibility, permitted nesting, loop-variable scope, and diagnostics.
- Decide generated-element cap accounting, including whether it counts every
  emitted primitive or only primitives produced by control blocks. Preserve
  the existing authored-element/report limit as a separate rule.
- Benchmark representative and worst-case expansions, frame evaluation,
  serialized model size, and interactive/static rendering. Select and record
  the per-evaluated-diagram cap from evidence.
- Prototype per-generated-element environment capture through frame
  evaluation and serialization/deserialization. Confirm the model can retain
  distinct loop bindings without changing the existing renderer's ordered
  frame-element contract.
- Record the HTML output-size discrepancy and determine whether it affects
  the selected expansion cap. Do not change the broader HTML size policy
  without a separate product decision.
- Establish parser, typechecker, runtime, renderer, editor, and acceptance
  cases before implementation proceeds.

### Sprint 110: Diagram AST, Parser, and Typechecker (depends on Sprint 109)

Architect-prepared Sprint 110 documentation package:
[`requirements.md`](sprints/0110-v18-diagram-ast-parser-typechecker/requirements.md).

- Add ordered recursive diagram-content nodes for primitives, `for` blocks,
  and conditional branches, preserving locations for controls and generated
  content.
- Extend diagram-body parsing in `parseDiagramDeclaration` to recognize the
  approved existing block syntax and primitive forms.
- Add clear syntax diagnostics for invalid content and nested loops,
  including a loop nested through a conditional branch.
- Extend `checkDiagram` for iterable and condition types, loop-variable scope,
  diagram primitive/property validation, and rejection of `t` in controls.
- Keep authored-element counting and existing diagnostics intact; add parser,
  checker, and source-location tests.
- Update diagram formatting for recursive content and add formatter regression
  cases for mixed block nesting.

### Sprint 111: Evaluation-Time Expansion and Frame Bindings (depends on Sprint 110)

Architect-prepared Sprint 111 documentation package:
[`requirements.md`](sprints/0111-v18-evaluation-time-expansion-frame-bindings/requirements.md).

- Evaluate loop iterables and branch conditions once when creating each
  diagram model, using the existing AMX evaluation semantics.
- Emit primitive instances in source order and retain the correct loop-variable
  binding for each instance. Ensure temporary loop bindings are scoped and
  restored consistently with existing AMX loops.
- Apply the qualified per-evaluated-diagram cap with a precise diagnostic and
  source location. Preserve the separate authored-element check.
- Update frame evaluation so each primitive expression observes its captured
  instance binding and the current frame's `t`.
- Add tests for ordering, empty control results, mixed nesting, scope
  restoration, limit boundaries, multiple frame times, and unchanged static
  diagrams.

### Sprint 112: Scene Serialization and Render Compatibility (depends on Sprint 111)

Architect-prepared Sprint 112 documentation package:
[`requirements.md`](sprints/0112-v18-scene-serialization-render-compatibility/requirements.md).

- Update scene-model serialization/deserialization to preserve generated
  primitive membership, order, and per-instance environments.
- Ensure the browser runtime evaluates serialized models consistently with
  the in-process runtime. Regenerate artifacts through
  `scripts/build-diagram-runtime.ts` rather than editing generated bundles.
- Verify interactive HTML playback and static HTML/PDF/DOCX output retain the
  same generated membership/order and expected frame-dependent values.
- Exercise output-size and performance boundaries selected in Sprint 109;
  document any limitation without changing unrelated output policy.
- Add or update renderer, serialization, and export regressions.

### Sprint 113: Editor Support, Specification, and Example (depends on Sprints 110-112)

- Update VS Code TextMate grammar behavior only where existing patterns do
  not tokenize diagram-local loops, conditionals, and primitive declarations
  correctly; add host/tokenization tests.
- Update desktop parser-proven highlighting facts and editor tests so nested
  diagram controls and primitive names highlight correctly.
- Add the additive V0.18 language specification and link it from the README.
- Extend `examples/08_Formula_Driven_Diagrams.amx` with a runnable loop and
  conditional generation example that retains `t`-driven primitive
  properties.
- Confirm formatting, editor presentation, and documented syntax agree with
  the implementation and tested contract.

### Sprint 114: Integrated Acceptance and V0.18 Closeout (depends on Sprints 109-113)

- Verify the complete language path from parsing and checking through
  evaluation, serialized interactive playback, and static document output.
- Run focused root tests/build, VS Code extension tests, desktop typecheck,
  and the applicable desktop editor UI test. Run broader regression suites as
  agreed in Sprint 109.
- Preview the generated-elements example and confirm model membership stays
  fixed during playback while `t`-dependent properties animate.
- Record exact test evidence, failures, unavailable checks, performance
  measurements, final limit rationale, and residuals. Closeout authorizes no
  release, publication, package/version change, or platform certification.

## Relevant Files and Surfaces

- `planning/plan-openamxV17MasterSprintPlan.md` — preceding master-plan
  structure and sequence through Sprint 108.
- `docs/language-spec-v0.13.md`, `docs/language-spec-v0.12.md`, and
  `docs/language-spec-v0.16.md` — historical diagram grammar, block syntax,
  and AMX loop/conditional conventions. Do not rewrite these historical
  contracts.
- `src/ast/types.ts` — `DiagramDeclarationNode` and `DiagramElementNode`;
  extend with recursive diagram content.
- `src/parser/parseStatements.ts` — `parseDiagramDeclaration` and
  diagram-body parsing; `src/parser/parseFor.ts` and
  `src/parser/parseIf.ts` are syntax and source-location references.
- `src/typechecker/checkDocument.ts` — `checkDiagram`, control checks, and
  existing authored-element accounting.
- `src/formatter/formatAmx.ts` — `formatDiagram` and nested content output.
- `src/runtime/evaluateExpression.ts` — diagram declaration evaluation and
  existing `evaluateLoopIterable`/`withLoopBinding` semantics.
- `src/runtime/diagramModel.ts` — `createDiagramModel`, `evaluateFrame`,
  `evaluateDiagramFrame`, scene serialization, and captured evaluation
  contexts.
- `src/renderer/diagramBrowserEntry.ts`, `src/renderer/diagramHtml.ts`, and
  `src/renderer/staticDiagram.ts` — browser playback, model embedding, and
  static frame rendering.
- `scripts/build-diagram-runtime.ts` — generated browser runtime build.
- `vscode-extension/amx.tmGrammar.json` and
  `vscode-extension/src/test/providers.host.ts` — VS Code grammar and tests.
- `src/editor/highlighting.ts`, `desktop-app/src/mainview/CodeEditor.vue`,
  and `desktop-app/tests/ui/v16-language-editor.pw.ts` — desktop highlighting
  and UI coverage.
- `tests/diagram.test.ts`, `tests/diagramHtml.test.ts`,
  `tests/parser.test.ts`, `tests/evaluator.test.ts`,
  `tests/formatter.test.ts`, `tests/editor.test.ts`,
  `tests/renderer.test.ts`, `tests/reportPdf.test.ts`, and
  `tests/reportDocx.test.ts` — focused language, runtime, and output
  regressions.
- `docs/language-spec-v0.18.md`, `README.md`, and
  `examples/08_Formula_Driven_Diagrams.amx` — proposed additive contract,
  documentation navigation, and runnable example.

## Verification

1. Sprint 109 records the contract, measurable expansion cases, selected
   limit accounting, numeric per-diagram cap, and performance baseline before
   broad implementation.
2. Root focused suite: `bun test tests/diagram.test.ts tests/diagramHtml.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/renderer.test.ts`.
3. Root build: `bun run build`; verify generated browser runtime artifacts
   are produced from their source generator.
4. In `vscode-extension`, run `bun run test`. In `desktop-app`, run
   `bun run typecheck` and `bun run test:ui -- tests/ui/v16-language-editor.pw.ts`.
5. Verify the generated-elements example in the desktop app and confirm
   ordered membership, stable frame topology, and animated primitive
   properties.
6. Exercise HTML, PDF, and DOCX paths and record the results. Run the broader
   root regression gate when scheduled; report skipped, blocked, or
   unavailable checks explicitly rather than treating them as passing.