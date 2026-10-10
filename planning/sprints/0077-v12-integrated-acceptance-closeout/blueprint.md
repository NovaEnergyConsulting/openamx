# Sprint 077 Blueprint: Integrated Acceptance and V0.12 Closeout

## Approach

1. Confirm explicit Sprint 077 authorization and the approved verification-only file plan. Record the worktree and inspect Sprints 072-076 evidence before running checks. Do not start product changes under this closeout.
2. Create the integrated acceptance matrix in Sprint 077 `builder-evidence.md` before verification. Map each master-plan behavior to fixture IDs, owning suite/surface, exact command or manual action, evidence path, status, residual owner, and any required disposition. Include separate rows for core, VS Code, and desktop where applicable.
3. Core semantic acceptance:
   - Re-run parser and diagnostic fixtures for RI-V01–RI-I10, EN-V01–EN-I09 plus duplicate String values, and IF-V01–IF-I05.
   - Re-run type checking, evaluation, constructor/effective-field behavior, enum primitive values, branch scoping/return behavior, selected-branch evaluation, and module visibility.
   - Verify all approved diagnostic identities/messages and exact source ranges, including AMX3011-AMX3021, plus established AMX3001/AMX3002/AMX3006/AMX5002 cases. Verify LF and CRLF editor/source-coordinate behavior.
4. Formatter and documentation acceptance:
   - Run focused idempotence and parse-format-parse meaning checks for inherited records/overrides, enums, braced blocks, nested branches, and the legacy conditional. Compare evaluated output before and after formatting.
   - Verify the V0.12 spec, README links, both runnable V0.12 examples, and searchable desktop Help through existing tests. Check that language behavior, diagnostics, and exclusions match the approved contracts and no release/certification claim is introduced.
5. VS Code acceptance:
   - Run its existing Development Host test suite.
   - Identify direct evidence for actual TextMate scopes, formatter output/idempotence, V0.12 diagnostics and ranges, completion, outline/member symbols, and definition/navigation. Distinguish a passing V0.12 host test from suite-level Windows EBUSY/path-case failures.
   - Record exact affected tests/errors and retry results. Do not classify the whole Development Host suite as PASS when it has failures.
6. Desktop acceptance:
   - Run the desktop RPC contract suite, typecheck, web build, focused Help UI, and focused editor UI tests.
   - RPC checks establish shared fact payloads only. Verify user-visible CodeMirror token/diagnostic marks and completion/navigation in the existing desktop UI harness. If current Playwright coverage lacks it, add one focused test within the existing Playwright suite (for example `desktop-app/tests/ui/v12-language-editor.pw.ts`) using the existing harness.
   - Record the existing sandbox-count failure separately. Never relax the iframe sandbox or change production security behavior to green the contract check.
7. Run root focused suites and build, followed by the full root suite. Compare to Sprint 076's results (460 passed, 1 failed on retry; inherited imported dimension/unit symbol identity), and record intermittent failures plus isolated retries without suppressing first-run results.
8. Run all required surface checks in the existing project scripts. Use the documented Windows Vite launch workaround for UI tests if needed; verify the test server responds before invoking Playwright and record the exact workaround/HTTP check.
9. If a V0.12 requirement fails or evidence is unavailable, retain FAIL/BLOCKED/NOT RUN status with evidence and owner. Do not patch product behavior or dismiss residuals as accepted without a separate Lead Developer decision.
10. Complete the matrix and submit a V0.12 closeout disposition request: ACCEPTED/CLOSED with explicitly named residuals, or BLOCKED/OPEN pending specified follow-up. Release/publication remains a separate authorization.

## Files to Update

- Sprint 077 `builder-evidence.md` with the integrated requirement-to-evidence matrix, commands, results, artifacts, residual owners, and explicit closeout recommendation (create)
- `desktop-app/tests/ui/v12-language-editor.pw.ts` only if direct user-visible editor coverage is absent from existing Playwright tests
- Existing fixture/test files only if a verification assertion is demonstrated to be invalid or a test regression is caused directly by Sprint 077 work; no product implementation changes
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` to record exact closeout evidence, unresolved owners, and the requested/received disposition

No language implementation, editor production code, formatter, README, Help, language specification, example, dependency/lockfile, version, release workflow, or security-boundary changes are in scope.

## Risks and Stop Conditions

- If a direct desktop editor UI path cannot be exercised in the existing harness, mark those UI capabilities BLOCKED/UNAVAILABLE; RPC/shared-fact evidence is not a substitute.
- If the VS Code Development Host remains non-green from Windows cleanup/path-case failures, retain the exact suite status. Do not delete broad temp locations, loosen path behavior, or relabel failures as passes.
- If the desktop RPC check stops at the inherited sandbox-count assertion, retain FAIL for the whole runner and cite which V0.12 assertions ran before it; do not change sandbox/CSP behavior.
- If any root/full-surface failure differs from the Sprint 076 baseline, isolate it and establish ownership before recommending closeout.
- If a required semantic/editor behavior fails, stop product implementation, preserve evidence, and request a separate corrective sprint/authorization. Sprint 077 is not a feature-fix sprint.
- Do not report V0.12 ACCEPTED/CLOSED without an explicit Lead Developer disposition; do not infer release/publication authorization from closeout.

## Verification

From repository root:

1. `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\formatter.test.ts tests\\editor.test.ts tests\\modules.test.ts tests\\examples.test.ts`
2. `bun run build`
3. `bun test`

From `vscode-extension`:

4. `bun run test`

From `desktop-app`:

5. `bun run typecheck`
6. `bun run build:web`
7. `bun run test`
8. `bun run test:ui -- tests/ui/help-center.pw.ts tests/ui/v12-language-editor.pw.ts` (if the focused editor test is added)

Record exact commands, tool/environment versions, pass/fail counts, retries, HTTP readiness if using the Windows Vite workaround, and evidence file paths. No single build or aggregated test result substitutes for the matrix.
