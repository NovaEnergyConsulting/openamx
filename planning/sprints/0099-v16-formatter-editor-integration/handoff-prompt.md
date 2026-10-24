# Sprint 099 Handoff Prompt

You are the Builder for OpenAMX Sprint 099: V0.16 Formatter and Editor
Integration.

## Read First

- Project instructions and current branch/worktree. Preserve user changes,
  generated artifacts, screenshots, test results, and accepted Sprint 095-098
  records.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 099.
- Accepted Sprint 095 function contract/fixtures/diagnostics; Sprint 096 AST
  and parser evidence; Sprint 097 runtime evidence; Sprint 098 checker
  evidence.
- Sprint 099 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `formatter-editor-test-matrix.md`, `builder-evidence.md`, and this handoff.
- Current shared formatter/editor facts, their tests, VS Code grammar/providers
  and host tests, desktop CodeEditor/shared analysis service, and desktop
  V0.14 editor UI acceptance.

## Entry Gate

- Sprints 096 and 098, which Sprint 099 depends on, are separately
  `ACCEPTED/CLOSED`. Sprint 097 runtime is also accepted; preserve its
  `AMXF4002` guard and test.
- Obtain separate explicit Sprint 099 execution authorization and approval
  of the exact changed-path/host/evidence plan before edits.
- The V0.16 master plan and accepted Sprint 095 contract control semantics.
  Do not revise earlier sprint records or reopen function language decisions.
- Keep changes within the approved shared formatter/editor, VS Code,
  desktop-test, and evidence paths. Request approval before widening scope.

## Task Contract

- Make formatter output stable/idempotent for braced function bodies without
  changing expression spelling, expression-body formatting, or text outside
  executable AMX blocks.
- Extend shared highlighting facts over function parameters and statement
  bodies with parser-grounded locations.
- Sprint 096 parameter source fields currently point to the function header
  start, not parameter/type tokens. Correct existing parameter-name and
  annotation anchors with parser tests only if those parser paths are included
  in the separately approved Sprint 099 file plan; otherwise use only an
  approved and tested exact header-range derivation.
- Extend completion with cursor-sensitive function lexical scopes and source
  order. Include parameters, earlier locals, active iterators, and nested
  shadow behavior; exclude caller/module captures and out-of-scope names.
- Extend shared symbol facts for definition/reference/rename of parameters and
  locals. Nested shadows remain distinct; same-scope repeated `let` follows
  the accepted update identity.
- Preserve diagnostic identities/locations from accepted parser/checker work.
- Test VS Code with the actual TextMate tokenizer and Extension Development
  Host providers. Test desktop through its shared analysis path and focused
  CodeMirror Playwright acceptance.
- Keep the two host integrations thin over shared services; do not duplicate
  language semantics or redesign the editor UI.
- Complete `builder-evidence.md` with exact authorized paths, commands,
  results, residuals, and unavailable platform/host checks.

## Mandatory Boundaries

- Do not change parser, runtime, or type-checker semantics to make editor
  features easier. Any correctness defect in those accepted sprints needs a
  separate scope/authorization plan.
- Do not implement unapproved editor features, broad UX redesign, new
  shortcuts, rendering changes, release/version changes, publication, or
  platform-certification claims.
- Do not claim TextMate parity from inspecting JSON alone; run the actual
  grammar tokenizer test.
- Do not claim desktop acceptance from shared unit tests alone; execute the
  focused UI test when the approved environment supports it.
- Preserve existing host security and RPC test contracts; do not edit
  unrelated tests to force acceptance.

## Completion

Meet the acceptance criteria and fixture matrix across shared, VS Code, and
desktop surfaces; record exact focused results and residual owners; then
request separate Sprint 099 disposition. Sprint 100/101 and release remain
independently gated.