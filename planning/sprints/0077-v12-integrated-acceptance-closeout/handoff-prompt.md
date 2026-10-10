# Sprint 077 Handoff Prompt

You are the Builder for OpenAMX Sprint 077: V0.12 Integrated Acceptance and Closeout.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user changes and test artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All Sprint 077 artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Sprint 072 fixtures and Sprint 073-076 artifacts/evidence, including the latest VS Code and desktop residuals.
- Current V0.12 spec/examples/Help, core editor/formatter services, VS Code grammar/providers, desktop editor UI, and relevant test scripts.

## Authority and Entry Gate

- Sprint 072 fixtures plus approved Sprint 073-075 decisions and Sprint 076 integration are the acceptance authority.
- Sprints 072-076 are recorded implemented. Sprint 076 evidence includes a passing root build, focused V0.12 cases, Help UI, desktop typecheck/web build, and feature-specific VS Code tests, alongside the exact partial-suite residuals specified in `acceptance.md`.
- Before changing source, tests, examples, documentation, or planning ledgers, obtain explicit Sprint 077 authorization and approval of the concrete file-by-file verification/evidence plan.

## Task Contract

- Deliver an integrated master-plan-to-evidence matrix with direct outcomes for core semantics, diagnostics/source locations, formatting, documentation/examples, VS Code, and desktop editor.
- Run focused root suites/build/full suite, VS Code Development Host, and desktop typecheck/build/RPC/UI scripts as specified in the blueprint.
- Verify desktop user-visible CodeMirror behavior. If existing UI tests do not cover it, add one focused test to the existing Playwright suite; shared RPC assertions alone are insufficient.
- Compare with Sprint 076 baselines, including the root imported-dimension identity failure, VS Code Windows host EBUSY/path-case failures, the desktop sandbox-count assertion, and any intermittent worker timeout.
- Present a closeout recommendation and request a separate Lead Developer disposition. Do not accept the sprint or milestone on the Builder's own authority.

## Mandatory Boundaries

- Sprint 077 is an acceptance/closeout sprint, not a feature-fix sprint. Do not change the language contract, parser/runtime/formatter/editor production behavior, diagnostic identities/ranges, or security boundary.
- Preserve each status as PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN. Do not infer one editor's or subsystem's outcome from another's.
- Record first-run failures and retries; retries do not erase prior results. Investigate any new failure against the exact Sprint 076 baseline.
- Do not relax the desktop sandbox/CSP or broaden filesystem/path behavior to satisfy inherited test assertions.
- No version bump, release engineering, software release/publication, or platform certification is in scope.

## Completion

Meet every criterion in `acceptance.md` and create Sprint 077 `builder-evidence.md` with the integrated matrix, exact commands/results, residual owners, and closeout request. If mandatory evidence is unavailable or failures remain, state that clearly and request disposition; do not claim V0.12 accepted/closed without the Lead Developer's explicit decision.
