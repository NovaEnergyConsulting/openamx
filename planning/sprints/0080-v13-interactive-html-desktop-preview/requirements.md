# Sprint 080 Requirements: Interactive HTML and Desktop Preview

## Goal

Render the immutable diagram model from Sprint 079 as interactive, offline
diagrams in standalone HTML and the desktop live preview. Deliver the approved
playback controls, responsive and accessible presentation, safe typed-data
evaluation, and explicit per-diagram frame failures while preserving existing
preview security, freshness, and resource constraints.

## Dependencies and Authority

- Sprint 079 is reported implemented as the V0.13 language/model increment.
  Its `builder-evidence.md` records 206 focused tests passing and a passing
  root build, alongside residuals for broader AMX AST/value coverage and
  high-rate performance. Do not represent those residuals as passes.
- Sprint 080 depends on the stable Sprint 079 diagram model and evaluator.
  Confirm its disposition and current worktree before implementation.
- The scope authority is `planning/plan-openamxV13MasterSprintPlan.md`.
- The approved contract/evidence inputs are:
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/diagnostic-matrix.md`
  - `planning/sprints/0078-v13-diagram-contract-feasibility-gate/feasibility-report.md`
  - `planning/sprints/0079-v13-diagram-language-shared-scene-model/requirements.md`
  - `planning/sprints/0079-v13-diagram-language-shared-scene-model/builder-evidence.md`
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, and the current worktree status.
- Obtain separate explicit Sprint 080 execution authorization and approval of
  the concrete file-by-file plan before changing production code or tests.

## In Scope

- Render validated Sprint 079 diagram models inline in standalone HTML and
  desktop preview with an offline, application-owned runtime and renderer.
  Reuse the approved SVG-in-DOM candidate for interactive HTML/preview; do not
  generate executable source from authored expressions.
- Implement per-diagram play/pause, reset, continuous scrubber, declared
  duration mapping, and a reader-controlled loop toggle. Start paused at the
  lower time bound; loop defaults off. With looping disabled, stop at the
  upper bound and keep the final frame visible; with looping enabled, start the
  next pass at the lower bound. Each diagram's controls and time are
  independent.
- Preserve the approved logical canvas coordinate system and aspect ratio
  while resizing. Present each title and accessible description; provide
  meaningfully labeled, keyboard-usable playback controls.
- Evaluate frames in trusted application-owned code using validated
  expression/model data as inert serialized data. Support standalone
  local-file operation without remote assets or network requests.
- Wire the actual desktop preview to report a runtime frame failure with its
  allocated diagnostic and source location. Stop playback for that diagram,
  clear its last graphic, and surface an explicit message; never retain a
  stale frame, silently omit it, or display a success-shaped placeholder.
- Preserve the desktop iframe least-privilege boundary (`sandbox="allow-scripts"`
  without `allow-same-origin`), preview token/freshness behavior, lifecycle
  replacement, cancellation, stale-result handling, and existing offline
  policy. Define and validate any structured runtime-to-host message channel
  without trusting report-derived content.
- Enforce the approved measurable bounds:
  - At most 1 MiB UTF-8 for generated interactive preview HTML.
  - 16.7 ms p95 frame-work target/bound using a repeatable documented method.
  - At most 8 MiB incremental preview heap using a documented measurement
    method.
  - At most 2,000 whole-page DOM nodes in the measured desktop preview case.
  - Preserve the existing desktop 8,000,000-character fail-safe.
- Validate both approved examples, hostile text, offline behavior, resizing,
  controls, errors, lifecycle replacement, and resource behavior through
  standalone local-file and actual desktop preview paths.

## Out of Scope

- Changes to the approved AMX grammar, semantics, diagnostic allocations, or
  the authored-declaration limits of 16 diagrams and 512 semantic elements.
- Static PDF/DOCX diagram rendering; Sprint 081 owns those outputs.
- VS Code/desktop authoring integration, editor help, production examples, or
  language specification; Sprint 082 owns those surfaces.
- Native Word/PDF accessibility implementation, release/publication,
  versioning, or platform certification.
- `eval`, `new Function`, report-authored JavaScript/active markup, remote
  scripts/assets, weakening iframe sandboxing, or silent/truncating output
  fallbacks.

## Constraints and Residuals

- The runtime and serialized data must remain separate. Never execute AMX
  source, AMX-derived JavaScript, or report-authored HTML as code.
- Keep the approved diagnostic identities/messages and source positions:
  AMXD009 wraps a frame error carrying a base AMX error; AMXD010 reports
  infinity at the upper bound; AMXD011 reports infinity at an interior
  selected time. Preserve the allocated source location in the preview
  error.
- Sprint 079 caps count authored declarations. A diagram declaration inside
  an executed `if`/`for` can yield more than 16 model instances or 512 emitted
  element instances. Do not reinterpret the authored-source cap as an
  emitted-instance cap. Establish explicit resource-exhaustion behavior for
  rendered instances before introducing an additional cap or dropping output.
- The 078 resource readings came from one high-performance host and candidate
  adapters. Re-measure the production implementation and record methodology,
  environment, repetitions, percentiles, and limitations. Do not claim
  minimum-host conformance from the probe.
- Sprint 079 did not exhaust every existing AMX AST/value/function
  combination. Include parity and safe-serialization tests for the supported
  typed context; record uncovered cases and do not silently narrow language
  semantics.
- If a hard resource ceiling can be exceeded by valid repeated emissions,
  stop and request the product decision needed to preserve both the approved
  language behavior and preview limits. Do not silently truncate diagrams or
  weaken limits.
