# Sprint 101 Requirements: V0.16 Integrated Acceptance and Closeout

## Document Status and Entry Gate

Architect-prepared Sprint 101 documentation. Sprints 095-100 have separate
accepted dispositions. Sprint 100 is `ACCEPTED/CLOSED` on 2026-10-24. This
package does not authorize execution, implementation fixes, release,
publication, package/version changes, platform certification, or updates to
historical sprint records.

Obtain separate explicit Sprint 101 execution authorization and approval of
the exact verification command, changed-file, build-output, and evidence plan
before running broad gates or changing planning ledgers/evidence files.

## Goal

Verify the accepted V0.16 function-body feature as an integrated whole across
parser, runtime, type checker, formatter, shared editor services, VS Code,
desktop, modules, specification, valid/invalid examples, and the repository's
applicable verification gate. Produce traceable evidence for each requirement,
fixture family, surface, limitation, failure, and residual owner; submit a
separate closeout recommendation and request a Lead Developer/product-owner
disposition.

Sprint 101 adds no product feature scope. A closeout disposition does not
itself authorize release or publication.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 101.
- Approved behavior and fixtures: Sprint 095
  [function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [fixtures](../0095-v16-function-body-contract-technical-gate/control-flow-fixtures.md),
  [diagnostic matrix](../0095-v16-function-body-contract-technical-gate/diagnostic-matrix.md),
  and [requirement matrix](../0095-v16-function-body-contract-technical-gate/requirement-test-matrix.md).
- Accepted implementation evidence: Sprints 096-100
  [AST/parser](../0096-v16-function-ast-parser/builder-evidence.md),
  [runtime](../0097-v16-function-runtime-list-value-semantics/builder-evidence.md),
  [type checker](../0098-v16-return-path-type-checking/builder-evidence.md),
  [editor](../0099-v16-formatter-editor-integration/builder-evidence.md),
  and [spec/examples](../0100-v16-language-specification-examples/builder-evidence.md).
- Current product tests/builds, desktop and VS Code host workflows, guide
  resources, V0.16 specification/examples, and prior raw failure baselines
  cited in this package.

## In Scope

- Reconcile all accepted V0.16 requirements and stable fixture families to
  current direct evidence. Use `integrated-evidence-matrix.md` to record
  parser, runtime, checker, formatter, editor, modules, documentation,
  examples, and host surfaces separately.
- Run focused parser, evaluator, type-checker, formatter, shared-editor,
  module, and example tests, followed by the approved root build/full test
  gate.
- Verify both function forms, parser boundaries/locations, nested returns,
  type-compatible all-path flow, lexical locals, list isolation/returned
  lists, formatter stability, and editor behavior on shared, VS Code, and
  desktop surfaces.
- Verify exported/imported braced functions and preserve expression-body
  module behavior; add a focused test-only module assertion if existing
  tests do not directly cover the braced form.
- Verify the V0.16 specification, 15 reference, negative-only fixture,
  root/extension README references, searchable desktop Help, numbered-guide
  index/navigation, and offline guide-resource allowlist/parity.
- Verify the invalid missing-return fixture fails with `AMXF4001`; verify the
  runtime defensive guard remains `AMXF4002`. Preserve exact code/message/
  location and keep invalid fixtures out of valid-example success loops.
- Record raw outcomes for the full VS Code Extension Development Host suite,
  desktop typecheck/build/RPC/UI workflows, root tests/build, and any direct
  native/package routes available under approved scope.
- Record every failure, retry, unavailable route, inherited residual,
  platform limitation, artifact/output path, owner, and separate disposition.
- Submit a Builder recommendation and request separate V0.16
  `ACCEPTED/CLOSED` with named residuals or `BLOCKED/OPEN` with follow-up.

## Out of Scope

- New language behavior, diagnostics, test weakening, product fixes, editor
  redesign, dependency/version changes, or unrelated cleanup.
- Release engineering, release, publication, package/version changes,
  installer distribution, certification, or broad platform qualification.
- Rewriting accepted Sprint 095-100 evidence or changing raw statuses to
  remove historical failures.
- Updating `planning/STATUS.json`, state/decision/question ledgers, or
  historical sprint records unless a separate explicit file plan names the
  exact paths and intended change.

## Constraints and Gates

- Accepted Sprint 095 contract controls behavior; later accepted sprint
  evidence is implementation history, not a substitute for current integrated
  verification.
- Report statuses only as `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT
  RUN`. A separate owner disposition may accept a residual but never rewrites
  the underlying raw result.
- Sprint 100 records that repository `dist/cli.js` is stale and was preserved
  intentionally. Do not use it to claim fresh compiled V0.16 CLI acceptance.
  Build/test a fresh copy or isolated output tree under the approved plan;
  the root build script also writes `src/renderer/diagramBrowserRuntime.ts`.
- Preserve all pre-existing `dist/`, generated runtime, VS Code `dist/out`,
  desktop `dist/build`, test-results, screenshots/logs, user outputs, and
  accepted sprint evidence. No cleanup or overwrite.
- Root full-suite, VS Code runner, desktop RPC, desktop Playwright harness,
  and native/package routes are separate evidence surfaces. Do not infer one
  from another or from an earlier sprint's user disposition.
- Carry Sprint 099 residuals forward: default VS Code script pins 1.85.0
  below the extension engine; installed VS Code 1.143.1 host passed 26 tests;
  Linux Playwright uses Ubuntu 24.04 fallback Chromium; native packaging and
  other OS/architectures remain unverified; editor Mocha ambient diagnostics
  are tooling-only.
- Preserve the historical desktop RPC sandbox-count failure unless directly
  rerun; do not alter assertions, app security markup, CSP, or sandbox policy
  to force a pass. Record the exact current result and disposition separately.
- If the approved isolated build/output boundary is unavailable, stop before
  writing generated outputs and request a specific plan amendment.