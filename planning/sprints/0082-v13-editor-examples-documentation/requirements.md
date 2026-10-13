# Sprint 082 Requirements: Editor, Examples, and Documentation Integration

## Goal

Make the approved V0.13 diagram language usable and discoverable in the shared
editor services, VS Code extension, and desktop workbench. Publish the V0.13
language specification and relevant editor help, and add runnable crank-slider
and battery-resistor examples validated against the implemented language,
interactive HTML, PDF, and DOCX paths.

## Dependencies and Authority

- Sprint 079 reports the core language/model increment implemented, with
  focused parser/evaluator/formatter/model tests and a passing root build.
  Broader AMX AST/value parity and high-rate evaluation remain documented
  residuals; do not infer exhaustive parity.
- Sprint 080 reports standalone HTML and actual packaged desktop preview
  integration, including the tested repeated-emission workload. Manual
  screen-reader review, minimum-host/cross-platform qualification, exhaustive
  evaluator parity, and the full desktop RPC contract remain unavailable,
  untested, or failing as documented.
- Sprint 081 reports production PDF/DOCX integration with focused tests,
  builds, and inspected CLI artifacts. PDF tagged-structure/accessibility
  metadata is not present in the inspected output; the visible searchable
  title/description fallback and limitations are recorded. Full root suite,
  formal accessibility, platform qualification, and end-to-end acceptance
  remain unperformed.
- Sprint 082 depends on the Sprint 079 core language/model. Use Sprints 080
  and 081 as implemented output paths for example validation, while
  maintaining their recorded residuals. Do not treat their Builder evidence
  alone as milestone acceptance.
- Scope authority: `planning/plan-openamxV13MasterSprintPlan.md`, plus the
  approved Sprint 078 contract and diagnostics:
  `planning/sprints/0078-v13-diagram-contract-feasibility-gate/grammar-examples.md`
  and `diagnostic-matrix.md`.
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, current worktree status, the V0.12 specification and
  examples, shared editor services, both editor clients, and their existing
  tests/help conventions.
- Obtain separate explicit Sprint 082 execution authorization and approval
  of the concrete file-by-file plan before changing production files.

## In Scope

- Update shared editor analysis/highlighting/completion/symbol/navigation and
  supported language/refactoring services for the approved diagram syntax.
  Reuse the existing editor-service architecture; do not add a parallel
  analyzer.
- Integrate the shared services in both VS Code and the desktop CodeMirror
  authoring workflow. Cover syntax highlighting, canonical formatting,
  diagnostics and source ranges, completion, outline/symbols, navigation, and
  other established editor capabilities that apply to diagram constructs.
- Ensure incomplete diagram blocks remain editable and produce useful,
  source-located diagnostics without false success or destabilizing the rest
  of the document.
- Publish `docs/language-spec-v0.13.md` as an additive language specification
  linked to the project README. Document the approved grammar, validation,
  source locations, local time scope, evaluation and model behavior,
  diagnostics, formatter rules, interactive/static output semantics,
  accessibility, security/offline constraints, resource limits, and
  exclusions without overstating platform or accessibility guarantees.
- Update relevant searchable desktop language Help and VS Code-facing help or
  links according to existing project patterns.
- Add runnable examples for the crank-slider mechanism and battery-resistor
  current indicator, preserving the approved examples' meanings and existing
  AMX semantics.
- Validate both examples through analysis and the applicable standalone HTML,
  PDF, and DOCX render/export paths; test desktop preview when the existing
  workflow supports it. Verify expected static lower-bound frames and
  interactive time behavior.
- Add focused editor, documentation/help, and example regression coverage
  using existing root, VS Code Development Host, and desktop Playwright/UI
  test infrastructure.

## Out of Scope

- Changes to the approved grammar, runtime semantics, diagnostic identities,
  model behavior, resource bounds, rendering contracts, or desktop security.
- New diagram primitives, styling modes, playback controls, dynamic style,
  axes/physical coordinates, chart overlays, trigonometric standard-library
  functions, stateful simulation, or other future features.
- Reworking Sprint 079-081 product behavior or unrelated inherited test
  failures. Record any suspected regression and request separate
  authorization where needed.
- Migration guide unless an already-approved compatibility change is found;
  this is an additive V0.13 construct.
- Release engineering, version changes, publication, or platform
  certification.

## Constraints and Residuals

- Treat Sprint 078's approved grammar and exact diagnostic mappings as the
  authority, including AMXD001-AMXD015 and approved AMX3001/AMX3002 reuse.
  Include the Sprint 079 D-NEG-18 correction to `10:15`; do not regress it.
- Preserve the original-document 1-based line/column convention, UTF-16
  columns, exclusive diagnostic ends, and zero-based half-open editor-range
  mapping. Test LF and CRLF source where the editor APIs support it.
- Preserve diagram-local time scope, existing document/module/function
  semantics, canonical formatter output, and current behavior for
  unsupported/incomplete syntax.
- Preserve the static outputs: PDF uses inline SVG; DOCX uses embedded PNG
  with visible title/description and image alt metadata. Do not claim PDF/UA:
  Sprint 081 inspection found no tagged structure tree or `/Alt`.
- Preserve approved interactive security: application-owned runtime, inert
  serialized model data, no remote requests, no `eval`/`new Function`, and
  desktop iframe sandbox `allow-scripts` without `allow-same-origin`.
- Respect 1 MiB preview HTML, 16.7 ms p95 frame work, 8 MiB incremental heap,
  2,000 DOM nodes and the existing 8,000,000-character fail-safe; do not
  change or conceal recorded resource qualification limits.
- Report native screen-reader, minimum-host, cross-platform, and full-suite
  checks only when directly performed. Harness evidence, builds, and
  successful artifact generation do not substitute for those checks.
