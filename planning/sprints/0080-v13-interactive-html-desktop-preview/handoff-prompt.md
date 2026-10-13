# Sprint 080 Handoff Prompt

You are the Builder for OpenAMX Sprint 080: Interactive HTML and Desktop
Preview.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user
  changes and test artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 080 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- Sprint 078 `grammar-examples.md`, `diagnostic-matrix.md`, and
  `feasibility-report.md`.
- Sprint 079 `requirements.md`, `acceptance.md`, and `builder-evidence.md`,
  plus the implemented `src/runtime/diagramModel.ts` and its focused tests.
- Existing HTML/chart security tests, desktop preview freshness/security
  behavior, worker/RPC path, and `App.vue` iframe integration.

## Authority and Entry Gate

- Sprint 078's approved diagram grammar, output choices, resource bounds,
  source-location rules, and diagnostic mappings are fixed.
- Sprint 079's immutable diagram model, AMX evaluator semantics, authored
  declaration caps, and nested/imported emission behavior are the input
  contract. Its reported residuals remain visible; do not infer exhaustive
  evaluator parity from its focused test suite.
- Before changing production source or tests, obtain explicit Sprint 080
  execution authorization and approval of a concrete file-by-file plan.
- Sprint 079 completion and Sprint 080 preparation do not authorize edits,
  Sprints 081-083, release, or publication.

## Task Contract

- Implement standalone HTML and actual desktop-preview rendering using the
  shared model and an offline, application-owned SVG runtime.
- Implement the exact start-paused, controls, scrubber, duration mapping,
  loop, reset, endpoint, independence, resize, and accessible-control
  behavior in `acceptance.md`.
- Wire per-diagram frame failures through the desktop preview lifecycle.
  Preserve the AMXD009/010/011 distinction, source attribution, stop/clear
  behavior, preview freshness, and independent operation of other diagrams.
- Preserve the iframe security boundary and keep runtime code separate from
  escaped inert model/context data. No report-authored active content, dynamic
  code generation, or remote resources.
- Measure the approved HTML, frame-work, heap, and DOM limits. Explicitly test
  repeated `if`/`for` diagram emissions because Sprint 079 limits count
  authored declarations, not emitted instances.
- If resource exhaustion requires rejecting output or changing the approved
  authored-count semantics, stop and request explicit product disposition.
  Never silently truncate diagrams or weaken a limit to obtain a pass.
- Test standalone HTML via local-file use and the actual desktop app/package.
  A Vite/component harness or RPC assertion is not sufficient desktop UI
  evidence.
- Create `builder-evidence.md` with exact outcomes, resource methodology,
  screenshots/artifacts, failures/retries, residuals, and blocked/unavailable
  native/accessibility checks.

## Mandatory Boundaries

- Do not change AMX grammar, runtime semantics, diagnostic allocation,
  authored declaration caps, existing chart/report behavior, or desktop
  security policy.
- Do not use `eval`, `new Function`, generated JavaScript from authored
  expressions, report-authored executable markup, remote scripts/assets, or
  `allow-same-origin`.
- Do not retain stale geometry or replace invalid diagrams with a blank or
  success-looking fallback.
- Do not claim native desktop, screen-reader, minimum-host, or platform
  acceptance from a harness or single-host metric.
- PDF/DOCX, editor integration, examples/specification, release, and
  publication are out of scope.

## Completion

Meet all criteria in `acceptance.md`. Update the planning ledgers with exact
implementation/evidence status, resource results, unresolved decisions, and
the Builder recommendation. Do not report V0.13 as end-to-end accepted or
released by completion of Sprint 080.
