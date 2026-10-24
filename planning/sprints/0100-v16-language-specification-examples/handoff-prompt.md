# Sprint 100 Handoff Prompt

You are the Builder for OpenAMX Sprint 100: V0.16 Language Specification and
Examples.

## Read First

- Project instructions and current worktree state. Preserve user changes,
  generated outputs, test results, and accepted Sprint 095-099 evidence.
- `planning/plan-openamxV16MasterSprintPlan.md`, Sprint 100.
- Accepted Sprint 095 `function-body-contract.md`,
  `control-flow-fixtures.md`, and `diagnostic-matrix.md`.
- Sprint 096, 097, 098, and 099 `builder-evidence.md` files. Sprint 097's
  later disposition resolves D-095-13 as runtime `AMXF4002`; preserve the
  earlier Sprint 095 historical record.
- Sprint 100 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `spec-example-test-matrix.md`, `builder-evidence.md`, and this handoff.
- Current V0.14 spec, 00-14 learning guide, tests/examples and numbered-guide
  tests, root README, desktop Help JSON/UI test, extension README, and desktop
  guide resource allowlist/parity tests.

## Entry Gate

- Sprint 100 depends on Sprints 095 and 096; their contracts/AST/parser are
  accepted. Sprints 097-099 are also accepted and provide runtime/checker/
  editor evidence.
- Obtain separate explicit Sprint 100 execution authorization and approval
  of the concrete spec/example/invalid-fixture/README/help/test/resource file
  plan before editing any product-facing or test files.
- The accepted Sprint 095 contract is normative. Do not introduce new
  semantics through wording, examples, or expected values.
- `15_Function_Bodies.amx` and the standalone-reference role are proposed
  documentation decisions in this package. Confirm them in the approved file
  plan; do not renumber or remove 00-14.

## Task Contract

- Author additive `docs/language-spec-v0.16.md` with exact body forms,
  statement set, return/type path rules, lexical scope, list copy semantics,
  diagnostics, compatibility, and exclusions.
- Preserve `examples/03_Collections_and_Functions.amx` expression-body
  behavior and its expected values.
- Add the approved standalone function-body reference, update the index
  without altering the guided prerequisite path, and add one separate
  invalid-only missing-return source fixture.
- Keep valid source examples runnable; assert expression/statement returns,
  nested flow, zero-iteration fallback, parameter/local isolation, nested and
  repeated list argument copies, and returned lists.
- Assert the invalid fixture fails with exact `AMXF4001` at the function
  closing brace; never treat it as a successful example.
- Update root README, desktop Help/search/UI coverage, extension README as
  required, and offline guide resource allowlist/parity tests for new content.
- Run exact spec-link/index/runtime/negative-fixture/resource acceptance and
  record evidence; no release or integrated closeout claim.

## Mandatory Boundaries

- Do not edit parser/runtime/type-checker/formatter/editor code to make an
  example pass; report any newly found mismatch against accepted behavior.
- Do not change existing 00-14 example names, roles, expected outputs, or
  support files beyond the approved additions.
- Keep the invalid fixture distinct from valid user lessons and use the
  established `examples/fixtures/invalid/` boundary.
- Do not update desktop guide package allowlist without corresponding parity,
  staging, and offline materialization tests.
- Do not overwrite checked-in generated outputs or user data. Use a unique
  temporary output root for all command/render/export checks.
- No version change, release, publication, platform certification, or
  Sprint 101 integrated closeout is authorized by Sprint 100.

## Completion

Meet all criteria in `acceptance.md` and `spec-example-test-matrix.md`,
record exact approved paths and results in `builder-evidence.md`, and request
a separate Sprint 100 disposition. Sprint 101 remains responsible for
integrated acceptance and does not itself authorize publication.