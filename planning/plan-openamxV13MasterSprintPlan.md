# Plan: OpenAMX V0.13 Animated Diagrams

Confirmed planning scope. This plan defines required behavior, not implemented
or verified functionality. V0.13 is focused on formula-driven animated 2D
diagrams across the OpenAMX language, interactive HTML and desktop preview, and
static PDF/DOCX reports. Unrelated features and carryovers are excluded.

Continue sprint numbering after V0.12 Sprint 077, beginning with Sprint 078.
Publishing this plan does not authorize feature implementation or release.

## Recommended Approach

- Begin with a language/rendering contract and feasibility gate. Lock executable
  examples, diagnostics, source locations, and the shared time/canvas semantics;
  empirically test the proposed shared scene representation across the actual
  HTML, desktop, PDF, and DOCX paths before committing to a rendering adapter.
- Add a declarative `diagram` block to executable AMX. It emits an inline
  diagram where declared and evaluates geometry and labels as pure expressions
  of the current time and surrounding AMX values/functions.
- Use one typed, destination-neutral 2D diagram model as the source of meaning
  for animated and static outputs. Preserve existing AMX expression and
  function semantics at arbitrary playback times. The feasibility gate must
  prove a safe offline evaluator for this; do not generate executable source
  from authored expressions or execute report-authored JavaScript. Treat SVG as
  a candidate rendering representation to prove in the feasibility gate; do
  not assume the charting engine is appropriate for diagrams.
- Keep interactive playback in standalone HTML and the desktop live preview
  offline and within the existing preview security boundaries. PDF and DOCX
  render a static frame at the diagram's starting time using the same validated
  model.
- Extend the existing parser, AST, type checking, runtime, formatter, report
  preparation, renderer, editor, and test infrastructure. Preserve existing
  report and language behavior outside the approved additions.
- If feasibility appears to require changing a confirmed behavior contract,
  stop for a product decision rather than silently reducing scope or substituting
  an output fallback.

## Confirmed Feature Scope

### Diagram Declaration and Evaluation

- Provide a declarative `diagram` block in an executable AMX block. A diagram
  renders inline at its declaration; V0.13 does not require a second placement
  or reference mechanism.
- Require a visible title and an author-provided accessible text description.
- Each diagram declares exactly one diagram-local numeric time variable. The
  author chooses its identifier. Its finite start and end bounds, and the
  total wall-clock playback duration for one pass, may be numeric AMX
  expressions evaluated once from the surrounding document context.
- Geometry and labels may reference surrounding AMX values and functions and
  may use expressions derived from the local time variable. Labels may change
  continuously as time changes.
- Frames are formula-driven: each frame is computed directly from the selected
  time. Do not add stateful numerical solvers, numerical integration, or
  simulation-state mutation in V0.13.
- The only reader-controlled parameter is time. Do not add reader-adjustable
  geometry parameters or direct manipulation such as dragging components.

### Canvas, Elements, and Styling

- Support schematic 2D diagrams only, not engineering axes or physical-unit
  scaling. Require logical canvas width and height; scale responsively while
  preserving aspect ratio.
- Use a bottom-left origin with positive Y upward. Do not require visible axes
  or a grid.
- The initial primitive set is lines (including arrows), rectangles, circles,
  and text labels. Element geometry and label values may be expression-driven.
- Include basic static per-element styling for stroke/fill colors and line
  width. Styling does not animate in V0.13; dynamic properties are geometry
  and labels only.
- Defer 3D, custom paths/polygons, and domain-specific engineering symbol
  libraries.

### Interactive Playback

- Standalone HTML and desktop live preview provide play/pause, reset, a
  continuous scrubber covering the declared time interval, and a reader-
  controlled loop toggle.
- Start paused at the interval's lower bound; do not autoplay. Loop is off by
  default. With looping disabled, playback stops at the upper bound and leaves
  the final frame visible. With looping enabled, playback repeats from the
  lower bound.
- Map the declared interval to the author-provided total playback duration per
  pass. The scrubber can select any time in the interval.
- Do not add other viewer-adjustable parameters in V0.13.

### Static Reports and Editor Support

- PDF and DOCX render a static frame at the interval's lower bound; report
  documents do not contain active playback controls.
- DOCX uses a static embedded vector/image with the accessible description,
  not editable native Word shapes. The feasibility gate determines the exact
  supported representation and any necessary fallback that preserves the
  visual and accessibility contract.
- Update both the VS Code extension and desktop app authoring support so the
  new syntax remains usable across existing language services and editor
  workflows.
- Add two initial examples: a crank-slider mechanism and a simple
  battery-resistor DC circuit with a time-varying current indicator.

### Explicit Exclusions

- Stateful or numerical simulation engines, independent multiple time
  variables, arbitrary interactive parameters, draggable elements, and
  autoplay.
- 3D diagrams, freeform paths/polygons, physical-coordinate modes, and
  discipline-specific symbol libraries.
- Animated styling, chart overlays connected to diagram variables, editable
  Word shapes, unrelated language/reporting features, and version carryovers.
  Chart overlays are a future direction only, not V0.13 scope.
- Remote assets or network-dependent runtimes. Preserve OpenAMX's
  offline-first output expectations and the desktop preview's least-privilege
  security model.

## Sprint Sequence

### Sprint 078: V0.13 Diagram Contract and Feasibility Gate

- Translate the confirmed scope into valid/invalid AMX examples, a grammar
  outline, a diagnostic matrix, and requirement-to-test fixtures before
  production implementation.
- Lock the exact declaration structure, static and time-varying properties,
  expression evaluation rules, source ranges, local time scope, and formatter
  behavior.
- Define validation for finite canvas dimensions, finite ordered time bounds,
  positive finite playback duration, supported styling values, and finite
  geometry at the initial frame and across representative playback points.
  Invalid bounds or non-finite geometry must produce clear source-located
  diagnostics and stop rendering; no silent omission or success-shaped
  placeholder.
- Establish the shared diagram model and test a minimal crank-slider and
  battery-resistor case through interactive HTML/desktop preview and static
  PDF/DOCX paths. Verify packaging/resource availability, responsive sizing,
  accessibility metadata, offline behavior, and safe serialization.
- Prove how offline browser playback evaluates arbitrary-time expressions and
  referenced AMX functions without generated executable source. If the
  confirmed expression/function scope cannot be supported safely, stop with
  evidence and a specific product decision rather than silently restricting
  the language contract.
- Propose measurable rendering-time, output-size, and preview-resource bounds
  from representative evidence. Record technical residuals and explicit
  decisions required before implementation.
- This sprint is a contract and feasibility gate; isolated probes do not
  implement the feature or authorize production changes.

### Sprint 079: Diagram Language and Shared Scene Model (depends on Sprint 078)

- Extend the AST, parser, type checker, runtime, and formatter for the approved
  declarative diagram syntax and expression semantics.
- Validate title, accessible description, canvas, time declaration and range,
  playback duration, primitive properties, and static styling with useful
  source-located diagnostics.
- Capture an immutable, typed diagram emission/model that preserves source
  element order, logical canvas coordinates, title/description, the numeric
  timeline, source locations, and validated expressions needed to evaluate
  frames at arbitrary times in range.
- Evaluate geometry and labels from existing AMX values/functions plus the
  local time value, preserving existing language semantics. Evaluate timeline
  bounds and playback duration once from document values. Do not introduce an
  author-code-to-JavaScript compiler, mutable simulation state, or new
  general-purpose language semantics.
- Add focused parser, type-checker, evaluator, formatter, and model tests,
  including incorrect types, missing requirements, invalid bounds/duration,
  out-of-range time, non-finite values, document-scope references, and
  time-dependent labels/geometry.

### Sprint 080: Interactive HTML and Desktop Preview (depends on Sprint 079)

- Render the shared diagram model in standalone HTML and desktop live preview
  using an offline, application-owned runtime and the validated diagram data.
- Implement the agreed play/pause, reset, continuous scrubber, playback
  duration, start-paused behavior, and reader-controlled loop toggle. Verify
  endpoint behavior and ensure multiple diagrams play independently.
- Preserve logical aspect ratio and responsive resizing. Expose the title and
  accessible description; make controls meaningfully labeled and usable with
  keyboard and assistive technology.
- Keep report data separate from trusted runtime code. Do not use `eval`,
  `new Function`, remote scripts/assets, or report-authored active markup.
  Preserve desktop iframe sandboxing, preview lifecycle/freshness, output
  limits, and existing offline behavior.
- If a requested frame evaluates to invalid or non-finite geometry, stop that
  diagram and surface an explicit source-located error in the preview; do not
  silently keep a stale frame or substitute a placeholder.
- Test generated HTML in standalone local-file use and actual desktop preview,
  including offline requests, hostile labels/descriptions, scrubbing, looping,
  resize, preview replacement, accessibility, and non-autoplay.

### Sprint 081: Static PDF and DOCX Diagrams (depends on Sprint 079)

- Integrate static output from the shared diagram model into the existing PDF
  and DOCX report preparation/rendering pipelines.
- Render the frame at the time interval's lower bound and preserve its title,
  accessible description, proportionate dimensions, report reading order, and
  surrounding narrative.
- Use the static vector/image representation proven in Sprint 078. DOCX output
  remains an embedded static graphic, not editable shapes. No playback
  controls or timeline state are included in these formats.
- Preserve local/offline resource constraints and existing destination
  validation, atomic export behavior, and failure reporting. A diagram render
  failure must not silently produce a blank or success-looking fallback.
- Verify actual PDF and DOCX artifacts and accessibility metadata; byte
  generation alone is insufficient evidence of visible, correctly sized
  output.

### Sprint 082: Editor, Examples, and Documentation Integration (depends on Sprint 079)

- Update shared editor services and both editor clients for diagram syntax:
  highlighting, formatting, diagnostics, completion, symbols/navigation, and
  related supported language analysis.
- Keep formatter output canonical and idempotent; ensure incomplete diagram
  blocks remain editable and diagnostics identify the authored source range.
- Publish the V0.13 language specification and relevant editor help. No
  migration guide is required for this additive construct unless the contract
  gate identifies a compatibility change.
- Add runnable examples for the crank-slider mechanism and the
  battery-resistor current indicator. Validate each example through analysis
  and the applicable HTML, PDF, and DOCX render paths.

### Sprint 083: Integrated Acceptance and V0.13 Closeout (depends on Sprints 080, 081, and 082)

- Complete cross-surface language and regression acceptance across the core
  runtime, VS Code extension, desktop workbench, standalone HTML, PDF, and DOCX.
- Verify diagram semantics, source-located diagnostics, static initial-frame
  exports, interactive time behavior, accessibility, offline/security
  constraints, renderer failures, and report-output integrity using the
  requirements and fixtures approved in Sprint 078.
- Run focused checks followed by existing root, VS Code extension, and desktop
  validation workflows. Verify built/package paths where the host permits;
  record unavailable checks and residuals without treating them as passes.
- Record exact commands and results. Closeout adds no product scope and does
  not itself authorize publication or release.

Sprint 079 depends on Sprint 078. Sprints 080, 081, and 082 share Sprint 079's
stable language and diagram model and may proceed as separate surface
integrations. Sprint 083 depends on all three integrations.

## Relevant Files

- Language implementation: [AST types](../src/ast/types.ts), [statement parser](../src/parser/parseStatements.ts), [expression parser](../src/parser/parseExpression.ts), [document parser](../src/parser/parseDocument.ts), [type checker](../src/typechecker/checkDocument.ts), [declaration registry](../src/typechecker/declarationRegistry.ts), [document evaluator](../src/runtime/evaluateDocument.ts), [expression evaluator](../src/runtime/evaluateExpression.ts), [runtime environment](../src/runtime/environment.ts), and [formatter](../src/formatter/formatAmx.ts).
- Report model and output: [report preparation](../src/renderer/reportPreparation.ts), [HTML renderer](../src/renderer/renderHtml.ts), [PDF renderer](../src/renderer/reportPdf.ts), [DOCX renderer](../src/renderer/reportDocx.ts), and [existing chart model](../src/renderer/chartModel.ts) as a cross-surface precedent, not a required diagram dependency.
- Shared editor services: [highlighting](../src/editor/highlighting.ts), [completion](../src/editor/completion.ts), [symbols](../src/editor/symbols.ts), and related analysis/refactoring modules.
- VS Code grammar at `vscode-extension/amx.tmGrammar.json`, existing language providers, and VS Code host tests.
- Desktop CodeMirror editor, live preview integration, worker/rendering paths, and desktop editor/UI tests.
- Existing [parser tests](../tests/parser.test.ts), [evaluator tests](../tests/evaluator.test.ts), [formatter tests](../tests/formatter.test.ts), [editor tests](../tests/editor.test.ts), [renderer tests](../tests/renderer.test.ts), [PDF tests](../tests/reportPdf.test.ts), [DOCX tests](../tests/reportDocx.test.ts), and [report preparation tests](../tests/reportPreparation.test.ts).
- New [V0.13 language specification](../docs/language-spec-v0.13.md) and runnable examples for the two confirmed engineering depictions.

## Verification

1. Test parser acceptance/rejection, formatter stability, and accurate source
   locations for all required diagram declarations and element properties.
2. Cover correct local time scoping, document value/function references,
   numeric bound/duration expressions, continuous evaluation at arbitrary
   times, dynamic labels and geometry, and immutability of captured model data.
3. Reject missing title/description/time/canvas, unsupported elements, invalid
   primitive properties, non-finite/invalid canvas dimensions, non-finite or
   unordered time bounds, non-positive/non-finite playback duration, and
   non-finite evaluated geometry. Confirm errors stop report rendering without
   a silent omission or placeholder. Trigger a frame error during playback and
   verify that the diagram stops with a source-located message, not a stale
   frame or fallback.
4. For HTML and desktop preview, verify offline operation, non-autoplay,
   independent controls, pause/resume, reset, arbitrary-time scrubbing,
   declared playback duration, loop off/on behavior, endpoint handling,
   responsive aspect ratio, keyboard/accessibility behavior, lifecycle
   replacement, and hostile report-derived text safety.
5. For PDF and DOCX, verify the visible static frame uses the declared start
   time, preserves title/description and aspect ratio, remains in report flow,
   and fails explicitly on invalid or unrenderable diagrams. Inspect generated
   artifacts rather than relying only on successful serialization.
6. Validate the crank-slider and battery-resistor examples in the CLI and
   supported renderers. Verify editor highlighting, formatting, completion,
   diagnostics, symbols/navigation, and regression behavior in both VS Code
   and the desktop editor where those services are supported.
7. Run focused language and renderer tests, then the root test/build, VS Code
   extension checks, desktop tests/build, and available packaging checks.
   Record unavailable platform-specific validation and residuals explicitly.

This plan does not claim feature implementation, feasibility approval, build or
test completion, platform certification, or release readiness.
