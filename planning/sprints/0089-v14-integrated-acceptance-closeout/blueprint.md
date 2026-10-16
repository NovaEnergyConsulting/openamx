# Sprint 089 Blueprint: Integrated Acceptance and V0.14 Closeout

## Approach

1. Obtain separate explicit Sprint 089 execution authorization and approval
   of the concrete verification/evidence file plan. Record starting
   worktree/branch and preserve prior evidence, test outputs, generated
   artifacts, and user changes. Do not perform production fixes.
2. Read the V0.14 master plan, all Sprint 084-088 requirements/acceptance/
   evidence, current planning ledgers, specification/examples, and the
   existing root, extension, and desktop validation scripts. Build the
   integrated matrix before running tests.
3. Map every Sprint 084 `V14-*` requirement and canonical fixture ID to:
   expected behavior, implementation, applicable surface(s), exact test or
   action, evidence/artifact path, current status, residual owner, and
   follow-up. Keep separate rows for core, shared editor, VS Code, desktop,
   docs/help, and examples wherever the capability is duplicated.
4. Establish prior-sprint baselines and clearly separate:
   - Sprint 085-087 focused results from new Sprint 089 runs.
   - Sprint 088's V0.14 VS Code-specific passes from its full-host aggregate
     17/8 raw failure and its later user acceptance disposition.
   - Sprint 088's Vite desktop UI evidence from the user's local
     build/deployment confirmation and any direct native Sprint 089 test.
   - The known desktop RPC sandbox-occurrence mismatch from the desktop UI
     results.
5. Run focused V0.14 core acceptance first:
   - Execute `IS-VALID-01`, all `IS-*` syntax/target/precedence/import/
     narrow fixtures, and assert every expected binding/diagnostic.
   - Execute every math/domain/finite/Measurement standard-library fixture,
     including all expected numbers and result units.
   - Execute every text/format valid and invalid fixture, including direct
     non-finite call fixtures and exact Unicode/locale/format expectations.
   - Record original-document source positions, UTF-16 columns, LF/CRLF
     behavior, and editor range conversion where applicable.
6. Verify all three runnable examples through analysis and execution.
   Compare documented expected bindings, Measurement units, locale/text
   outputs, and diagnostic behavior. Verify formatter fixed-point
   idempotence and README/specification/help references.
7. Run root `bun run build`, focused affected tests, and full `bun test`.
   Capture full aggregate counts and individual failures. Do not treat the
   focused result as a full-suite pass.
8. Run the VS Code Development Host via its existing `bun run test`. Record
   each V0.14-specific host test, the full aggregate, exact Windows cleanup/
   path failures, and comparison to Sprint 088's raw result. Do not suppress
   failures or change path assertions.
9. Run desktop `bun run typecheck`, `bun run build:web`, `bun run test`, and
   focused UI tests for the V0.14 editor and Help. Distinguish UI harness
   from native desktop. Run a supported actual packaged/native check if the
   approved path is available; otherwise mark it
   `BLOCKED/UNAVAILABLE` with the exact missing endpoint/instructions.
   Preserve the sandbox-occurrence mismatch if it repeats; do not alter
   sandbox or test behavior.
10. Reconcile every matrix entry and status against direct evidence. Record
    first failures and retries, unavailable/not-run items, tool/runtime
    versions, artifacts, residual owners, and whether results changed from
    the prior sprint baselines. Do not silently waive or rewrite evidence.
11. Submit a Builder recommendation with named residuals and follow-up
    owners. Request a separate Lead Developer/product-owner V0.14
    disposition. If disposition is pending, leave V0.14 closeout explicitly
    pending. Do not release, publish, or change versions.

## Files to Update

The exact file list must be approved before execution. Expected closeout
artifacts:

- Sprint 089 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `handoff-prompt.md`, and `builder-evidence.md`
- Sprint 089-owned logs/screenshots/artifacts only when included in the
  approved file plan
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
  to record evidence, residuals, owners, recommendation, and separate
  disposition request
- `planning/STATUS.json` and `planning/ARCHITECT_BRIEFING.md` only as
  authorized by the approved lifecycle plan

No production source, test assertion, specification, example, editor,
renderer, security policy, dependency, package/version, or release file is
in scope. A demonstrated defect must be isolated and sent for separate
corrective authorization rather than fixed within the closeout.

## Verification

From the repository root:

1. Run the focused V0.14 acceptance suites and example/documentation checks
   according to the approved command list.
2. Run `bun run build`.
3. Run the complete `bun test` root suite and record aggregate and individual
   outcomes.

From `vscode-extension`:

4. Run `bun run test` and record actual Extension Development Host results,
   including V0.14-specific tests, aggregate counts, and Windows failures.

From `desktop-app`:

5. Run `bun run typecheck`, `bun run build:web`, and `bun run test`.
6. Run focused Playwright UI tests:
   `bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts`.
7. Run actual packaged/native UAT only if the approved test route and
   preservation plan exist. Otherwise record the exact BLOCKED/UNAVAILABLE
   prerequisite and keep harness/user-reported evidence separate.

Record exact working directory, commands, runtime/tool versions, counts,
screenshots/logs/artifacts, retry history, and output statuses. Do not
weaken existing assertions or infer success from a build.

## Notes

Sprint 089 adds no product scope. The Builder reports evidence and requests
disposition; the Lead Developer/product owner decides V0.14 closeout
separately. Release and publication remain separate authorization gates.
