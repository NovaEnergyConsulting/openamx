# Sprint 082 Acceptance Criteria

Sprint 082 is complete when both editor clients expose the approved diagram
language through their supported language services, the V0.13 specification
and Help accurately document the feature, and both required examples validate
through the applicable implemented output paths.

## Shared Editor Services and Host Parity

- Shared editor services recognize approved diagram declarations, time
  variables, supported elements/properties, static styles, arrow literals,
  and expressions without introducing a parallel parser/analyzer or changing
  language semantics.
- Highlighting/tokenization is correct for complete and incomplete diagrams,
  nested element/property blocks, strings/interpolation, and inert narrative
  or non-AMX fences.
- Formatting delegates to the canonical formatter and remains idempotent.
  Existing non-diagram formatting behavior is unchanged.
- Diagnostics and editor markers preserve AMXD001-AMXD015 and approved
  AMX3001/AMX3002 reuse, with exact source positions for valid/invalid
  fixtures and original-document coordinates. Verify LF/CRLF where supported,
  UTF-16 columns, exclusive ends, and zero-based half-open editor ranges.
- Completion offers only valid in-scope constructs/properties/values where
  existing providers support completion. Symbols/outline/navigation represent
  diagram declarations, local time, elements and relevant references
  consistently with each host's existing capability contract.
- Incomplete diagram blocks remain editable and report source-located
  diagnostics without crashing, hiding unrelated diagnostics, or producing
  false successful analysis.
- Verify actual VS Code Development Host behavior and actual desktop
  CodeMirror/workbench behavior separately for highlighting, formatting,
  diagnostics/ranges, completion, symbols/outline and navigation. Shared
  service unit tests do not substitute for either user-visible host.
- Preserve the desktop preview security/freshness behavior and do not modify
  rendering behavior as part of editor integration.

## Specification, Help, and Examples

- `docs/language-spec-v0.13.md` accurately documents the approved grammar,
  requirements, local time scope, expression/function behavior, diagnostics,
  source positions, formatter contract, static styling, primitive set,
  playback controls/defaults/endpoints, static PDF/DOCX behavior, accessibility
  facts, offline/security boundaries, resource bounds, and exclusions.
- Link the new specification from the project README and update the relevant
  searchable desktop Help/editor assistance using established project
  patterns.
- The documentation does not claim PDF/UA, screen-reader, minimum-host,
  cross-platform, release, or full milestone acceptance that has not been
  demonstrated.
- Add the crank-slider and battery-resistor examples as valid executable AMX
  documents with visible titles and accessible descriptions. Preserve the
  approved example behavior and use no new trigonometric standard-library
  functions.
- Run analysis/type checking for each example and validate each via
  standalone HTML, PDF, and DOCX. Verify the HTML is interactive and offline;
  the PDF/DOCX use the lower-bound static frame. Inspect visible rendered
  artifacts and DOCX image alt metadata rather than relying on byte generation
  alone.
- Where a desktop live-preview example check is available, directly verify
  preview behavior; otherwise mark it BLOCKED/UNAVAILABLE with the reason.

## Regression and Evidence

- Relevant root parser/evaluator/formatter/editor/diagram/renderer/
  preparation/PDF/DOCX/example/documentation tests pass, and root build
  passes, or each failure is explicitly classified and compared with the
  recorded baseline.
- VS Code Development Host and desktop typecheck/build/focused UI tests are
  run. Record aggregate failures (including known Windows path/temp failures
  or the desktop RPC sandbox-occurrence mismatch) honestly; do not change
  security behavior or relabel failures as passes.
- `builder-evidence.md` contains a requirement-to-surface matrix, exact
  commands, environment, counts, direct host evidence/screenshots, example
  output artifacts, retries, residual owner, and every FAIL,
  BLOCKED/UNAVAILABLE, or NOT RUN item.
- Sprint 082 does not claim V0.13 integrated acceptance/closeout, release,
  publication, version change, or platform certification. Sprint 083 owns
  cross-surface acceptance and milestone closeout.

## Boundaries

- No change to approved language semantics, diagnostic contracts, runtime
  model, renderer behavior, output/resource bounds, or desktop sandbox.
- No migration guide is added unless an already-approved compatibility
  change requires one.
- Full root/extension/desktop residuals and PDF/assistive-technology
  accessibility limitations remain visible for Sprint 083.
