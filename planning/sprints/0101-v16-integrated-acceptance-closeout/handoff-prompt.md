# Sprint 101 Handoff Prompt

You are the Builder for OpenAMX Sprint 101: V0.16 Integrated Acceptance and
Closeout.

## Read First

- Project instructions and worktree status. Preserve all user changes,
  accepted Sprint 095-100 evidence, generated outputs, logs, screenshots,
  and test results.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 101.
- Accepted Sprint 095 contract, fixtures, diagnostics and requirement map;
  Sprints 096-100 `builder-evidence.md`; Sprint 101 `requirements.md`,
  `blueprint.md`, `acceptance.md`, `integrated-evidence-matrix.md`,
  `builder-evidence.md`, and this handoff.
- Current source/test/package scripts for parser, runtime, checker, formatter,
  shared editor, module loader, examples, desktop, and VS Code.
- Existing known residuals from Sprints 099/100 and prior desktop RPC
  baseline. Raw status and separate owner disposition are not interchangeable.

## Entry Gate

- Sprints 097-100 are separately accepted/closed, satisfying Sprint 101's
  dependencies. Sprint 095/096 contract/parser foundations are also accepted.
- Obtain separate explicit Sprint 101 execution authorization and approval
  of the exact verification command, changed-file, output, and evidence plan
  before broad checks or evidence/status edits.
- Sprint 101 is verification/closeout only. Any product defect requires a
  separate corrective sprint/file authorization; do not expand this scope.
- Use a fresh isolated build/output tree. Sprint 100 deliberately left the
  repository `dist/cli.js` stale and unchanged; root build also writes the
  generated diagram runtime source. Preserve original outputs before testing.

## Task Contract

- Complete every applicable row in `integrated-evidence-matrix.md` with raw
  status, exact command/action, tool/environment, counts, expected/actual
  results, artifact, residual owner, and separate disposition.
- Run focused parser, evaluator, return/type checker, formatter, shared
  editor, module, and example tests; then fresh root build/full suite.
- Verify exported/imported functions in both forms. Add a narrow test-only
  module case if existing coverage does not prove a braced export/import
  roundtrip; obtain approval if that path is outside the approved plan.
- Verify V0.16 spec/example/negative fixture, README/Help links, guide
  navigation, offline allowlist/parity/materialization, VS Code actual host,
  and desktop typecheck/web/RPC/UI separately.
- Re-run the invalid fixture only as an expected failure (`AMXF4001`); keep
  `AMXF4002` as the runtime guard; preserve `AMX3021` expression-only meaning.
- Record all first attempts/retries and carry Sprint 099 residuals forward.
  Do not claim broader host/platform support than directly tested.
- Submit a closeout recommendation and request separate owner disposition.

## Mandatory Boundaries

- Do not change implementation or weaken tests/security policies during
  closeout. Separate corrective authorization is required for any fix.
- Do not overwrite existing `dist/`, generated runtime source, VS Code
  `dist/out`, desktop `dist/build`, test-results, S100 artifacts, or other
  accepted outputs. Stop if a command writes outside the approved isolated
  root.
- Do not treat the installed VS Code 1.143.1 host result as the configured
  runner result; record the default 1.85.0 engine issue separately.
- Do not treat desktop Vite Playwright as native packaging/launch evidence.
  Record Linux fallback and unavailable platforms honestly.
- Do not fix the desktop RPC sandbox-count mismatch by editing the assertion,
  sandbox markup, or CSP. Record raw result and disposition.
- No release, publication, version change, installer distribution,
  certification, `planning/STATUS.json` or historical-record update is
  authorized by this handoff.

## Completion

Meet the acceptance criteria, fill the entire evidence matrix, preserve all
raw outcomes and residual owners, and obtain a separate Lead
Developer/product-owner V0.16 `ACCEPTED/CLOSED` or `BLOCKED/OPEN` disposition.
Builder evidence does not authorize release/publication.