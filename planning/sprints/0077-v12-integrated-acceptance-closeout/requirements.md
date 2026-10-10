# Sprint 077 Requirements: Integrated Acceptance and V0.12 Closeout

## Goal

Complete direct, traceable integrated acceptance of V0.12 across the core language, VS Code extension, and desktop editor. Re-run the approved fixture contract, verify Sprint 076 documentation/examples/formatter integration, record exact results and residuals, and present an evidence-backed V0.12 closeout disposition request.

## Dependencies and Entry Gates

- Sprints 072-076 are recorded implemented. Their requirements, decisions, fixtures, acceptance results, and Builder evidence are the scope and baseline inputs.
- The accepted feature contracts and diagnostic allocations are fixed: inheritance AMX3011-AMX3014; enums AMX3015-AMX3020; braced-if return path AMX3021; established syntax/type/module diagnostic categories remain unchanged.
- Obtain explicit Sprint 077 execution authorization and approval of the concrete file-by-file verification/evidence plan before editing any source, tests, examples, documentation, or planning ledgers.
- Sprint 077 adds no product feature scope. If verification exposes a code defect, isolate and report it for a separate corrective authorization rather than expanding the closeout into implementation.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 072 contract fixtures: `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`
- Sprint 073-076 `requirements.md`, `acceptance.md`, and `builder-evidence.md`
- Current language specification, both V0.12 runnable examples, README, desktop Help, and relevant core/VS Code/desktop editor code and tests
- Existing root, VS Code Development Host, desktop RPC, typecheck/build, and Playwright baselines, including residuals recorded by Sprint 076

## In Scope

- Build a master-plan-to-evidence matrix covering every record inheritance, enum, braced `if`, formatter, documentation/example, and editor capability requirement.
- Re-run the fixture-derived core parser, type checker, evaluator/runtime, module, formatter, and example acceptance. Verify exact values, diagnostics, and source locations rather than inferring semantics from builds or editor behavior.
- Verify formatter idempotence and parse-format-parse meaning preservation for inheritance, overrides, enums, nested braced expressions/statements, and the legacy single-line conditional.
- Verify the V0.12 language specification, README links, both runnable examples, and desktop Help agree with the approved contracts and pass their existing documentation/example/help tests.
- Verify VS Code directly through its existing Development Host: TextMate token scopes, formatting, diagnostics/ranges, completion, outline/symbols, and navigation for representative valid/invalid fixtures.
- Verify the desktop editor directly through its existing CodeMirror/workbench surface where available, including visible highlighting/diagnostics, completion and symbol/navigation on representative V0.12 documents. Add focused coverage to the existing Playwright suite if the current desktop UI tests do not directly exercise these behaviors. RPC fact assertions alone do not establish user-visible editor integration.
- Re-run desktop RPC/editor contract assertions, desktop typecheck, web build, and focused Help/editor UI tests. Preserve the sandbox/isolation contract and existing UI/editor behavior.
- Classify every matrix item as PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN, with exact command/action, evidence location, residual owner, and required follow-up.
- Compare results with Sprint 075-076 baselines, especially the root imported-dimension symbol assertion, VS Code Windows Development Host temporary-directory/path-case failures, the desktop RPC sandbox-count assertion, and the isolated/retried timing-sensitive root worker test.
- Produce a final V0.12 status/disposition request naming every remaining failed, blocked, or unavailable item. Do not turn Builder evidence into a Lead Developer disposition.

## Out of Scope

- New language features, semantics, syntax, diagnostic allocation, source ranges, editor capabilities, examples, or product behavior changes.
- Reworking inherited failures, host-specific tooling, worker timing, or sandbox assertions unless Sprint 077 proves a regression directly caused by Sprint 077 verification/test edits.
- New test frameworks or validation tooling; use and extend only the existing test infrastructure.
- Release engineering, package/version changes, software release, publication authorization, platform certification, or broad compatibility claims.

## Constraints

- Sprint 072 fixtures plus approved Sprint 073-075 decisions and Sprint 076 documentation are the acceptance authority. No contract is weakened to make a check pass.
- Evaluate each required capability on its own surface. A root test, RPC assertion, or shared service result does not by itself prove the corresponding VS Code or user-visible desktop capability.
- Record full-suite residuals honestly, including failed initial runs, isolated retries, Windows host limitations, and not-run checks. A retry may clarify intermittency but does not erase the earlier result.
- Preserve worktree changes and generated/example artifacts. Verification uses existing scripts and safe/disposable outputs.
- V0.12 closeout status is distinct from release/publication approval. Sprint 077 does not itself authorize a software release.
