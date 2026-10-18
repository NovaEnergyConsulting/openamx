# Sprint 094 Blueprint: Example Test Migration and V0.15 Acceptance Closeout

## Preconditions and Preservation

1. Confirm the Sprint 090-093 acceptance records and their residuals.
   Distinguish Builder recommendations from separate user dispositions.
2. Obtain separate explicit Sprint 094 authorization and an approved
   file-by-file test/reference/output/package/native-verification plan.
   The request to prepare this contract is not execution authorization.
3. Record branch, starting commit, complete worktree status, baseline hashes,
   tool versions, and all protected output/package paths before commands.
4. Preserve `examples/kitchen-sink.pdf` at SHA-256
   `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`,
   `examples/.openamx/local.json` unless specifically authorized,
   Sprint 093 package attempt outputs, and the accepted
   `desktop-app/build/dev-win-x64` incident state. Never attempt to restore
   that directory; no pre-incident hashes were captured.
5. Route all build/test/render/export/install outputs to approved isolated
   temporary directories. Do not overwrite stable installers or any
   pre-existing evidence. Do not invoke ambiguous commands such as
   `hutch electrobun build --help`; Sprint 093 established that it performed
   a build rather than displaying help.

## Migration and Acceptance Sequence

1. Build a current all-repository path/reference table from the accepted
   Sprint 090 inventory, including hidden authoring-skill files, current
   source/docs/tests/scripts/manifests, package resources, release smoke,
   and historical occurrences. Classify each match as active, test-only,
   generated-output, historical, or unrelated. Confirm direct consumers by
   reading their assertions/actions rather than replacing strings
   mechanically.
2. Establish final canonical 00-14 guide links and inputs from
   `tests/numbered-guide.test.ts`. Trace support closures and any explicit
   invalid cases before moving fixtures. Keep `examples/.openamx/local.json`
   separate from portable guide data.
3. Migrate root tests while retaining the existing behavior assertions:
   - Update `tests/examples.test.ts` path/document assertions and execute
     numbered lessons/references with their approved mappings.
   - Point `tests/formatter.test.ts` at the canonical first lesson or a
     documented test fixture.
   - Move Kitchen Sink report and HTML-chart-security material into a
     test-owned fixture location with the exact library closure; update
     `tests/reportPdf.test.ts` and
     `desktop-app/tests/ui/html-chart-security.pw.ts` without reducing
     report/chart/security coverage.
   - Preserve V0.5 project-settings compatibility in an explicit
     test-owned fixture and migrate the temporary-project test.
   - Migrate route Measurement tests to reference 13 and
     `examples/data/measurement-trips.json`; retain value, unit, output and
     render assertions.
   - Keep test-only fixtures outside the guide package and not linked as
     beginner content.
4. Migrate root package scripts and release CLI smoke paths to the numbered
   first lesson or appropriate fixture. Ensure dev/render scripts no longer
   write obsolete checked-in HTML destinations. Update current releasing
   guidance for the live smoke path while preserving historical language
   specification examples unless explicitly authorized.
5. Update any remaining active current-path documentation references
   identified in the audit. Verify the README, desktop/VS Code guidance,
   current V0.12-V0.14 link targets, searchable Help and authoring guide
   point to valid numbered files; report historical V0.1 snippets
   separately rather than silently rewriting them.
6. Once each of the four checked-in generated HTML output assertions has
   moved to a temporary destination and passes with focused content/
   structure checks, record the hashes and remove only the approved four
   HTML files. Re-run targeted tests. Never remove first and assume the
   deleted snapshot was obsolete.
7. Reconcile every old instructional path in `examples/`. Retire or move
   each only after its consumers are migrated and required behavior has a
   test-owned location. For an unresolved user/project-state file such as
   `.openamx/local.json`, preserve it and record the separate decision
   rather than widening the removal plan.
8. Address the S093 desktop RPC test blocker without hiding the original
   result:
   - rerun the desktop test script and capture its current raw failure;
   - inspect the iframe markup and security intent;
   - obtain approval for any narrow expectation change;
   - rerun the full RPC contract suite after any approved correction;
   - if unresolved, keep the test result `FAIL`/`BLOCKED`, name an owner,
     and request explicit product-owner disposition.
9. Verify the packaged guide again after path changes. Compare the actual
   24-file resource against the canonical allowlist and hashes. Exercise
   project creation from that package, confirm relative data/module paths,
   open/render the index, and follow guide links offline.
10. Perform the approved native desktop installation/launch and offline
    guide workflow on available supported hosts. Record exact OS/runtime,
    package identity, actions, outcomes, logs/screenshots, and limits.
    Unsupported or unavailable host checks remain `BLOCKED/UNAVAILABLE`;
    never claim cross-platform certification from one Windows run.
11. Run focused example/render/documentation tests, desktop tests/typecheck/
    UI/resource build, the full root `bun test`, root build, and other
    applicable approved checks. Preserve first failures and retries with
    exact counts. A focused or package-resource pass is not the full suite
    or manual installation acceptance.
12. Complete the traceability and residual matrix. Submit the Builder
    recommendation and request a separate Lead Developer/product-owner
    V0.15 disposition. Do not release or publish.

## Desktop RPC Failure Handling

The S093 desktop test script stopped at a pre-existing sandbox-count
assertion before later RPC checks. Its expected count was two while the
current `App.vue` contained one. This discrepancy is a named residual, not a
pre-approved test edit.

If an approved narrow correction is made, record the old and new expected
behavior, security/markup evidence, approval, exact test, and rerun result.
Do not change `App.vue`, CSP, sandbox permissions, or the assertion merely to
make the suite green. If the contract is not established or authorization
does not arrive, preserve the raw failure and keep Sprint 094 blocked or
request an explicit accepted residual.

## Generated Outputs and Immutable Evidence

- The four HTML snapshots may be removed only after all of their equality
  assertions have been replaced with deterministic temporary renders plus
  focused structural/content tests. Record their before hashes and exact
  removal disposition.
- Keep `examples/kitchen-sink.pdf` immutable; compare its SHA-256 before and
  after any broad cleanup.
- Preserve accepted Sprint 093 package artifacts and the
  `desktop-app/build/dev-win-x64` incident output. Sprint 094 package builds
  must use an approved unique output root.
- Do not delete non-hidden generated artifacts, logs or screenshots merely
  because they are old; classify and preserve user/historical evidence.

## Verification Matrix

At minimum, capture:

1. Root `bun run build` and complete root `bun test` results, including test
   and expectation counts, failures and output paths.
2. Focused `tests/numbered-guide.test.ts`, affected portions of
   `tests/examples.test.ts`, formatter/PDF/security tests, and any negative
   or renderer selection not adequately isolated by the full suite.
3. Desktop `bun run test`, `bun run typecheck`, `bun run build:web`, and
   focused UI tests for Help/Starter Examples, guide creation, and safe
   navigation. Record whether the sandbox assertion was authorized/fixed or
   remains a residual.
4. Exact 24-file package allowlist parity and a project-root smoke using only
   packaged files, without network or source checkout.
5. Manual/native packaged workflow on each available host; record unavailable
   routes honestly.
6. A reference audit showing no unexplained active old example/output paths;
   retained historical/test-only paths have explicit rationale/owner.
7. `git diff --check`, output hash comparison, and final scoped worktree
   status with every changed/deleted file in the approved plan.

## Closeout Status Rules

- Keep raw `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` statuses.
- A user may separately accept a named residual, but that does not convert
  its raw verification result into `PASS`.
- Builder recommendation is not product-owner acceptance.
- If any required disposition remains pending, V0.15 is `BLOCKED/OPEN`.
- No release, publication, version change, or platform certification is
  inferred from V0.15 acceptance.
