# Sprint 123 Verification Plan

## Owner Disposition and Replan Authorization

S121 final feasibility closeout was accepted on 2026-11-25. S122 was accepted
with D122-15 enum-default no-parity and the retry/stop-process residual on
2026-11-25. D123-01 through D123-13 were approved on 2026-11-26. The S123
implementation is committed at `257cf3f4d9395b8820a9e4e63e5f2abd310fd481` on
`feat/create-V0.20.0`. At run-02 start, the worktree held approved
planning/evidence changes and the S123 artifact tree; the focused test's
artifact-root override was separately approved to preserve `run-01`.

The approved retry cap was two retries per failing slice. The initial
chart-label attempt (line chart, `AMX3003`) and two retries (record-backed
column chart and scatter chart, both `AMX3003`) failed. The Builder then made
a third retry using a scalar-list column chart, which passed. That third retry
exceeded the cap by one. This remains a raw S123 process `FAIL`, separate from
S122's accepted residual.

**Product Owner disposition (2026-11-26):** Accept `S123-RETRY-STOP-01` as a
named process residual and authorize the closeout-only plan below. Do not
rewrite its raw status or infer S123 acceptance from the disposition.
The Product Owner also approved changing the existing focused test's artifact
root via `OPENAMX_S123_ARTIFACT_ROOT` and the PowerShell command below so new
fixtures are written to `run-02/fixtures`, preserving `run-01`.

**Authorized baseline:** commit
`257cf3f4d9395b8820a9e4e63e5f2abd310fd481` on `feat/create-V0.20.0`, with the
approved planning/evidence changes, artifact-root test-harness override, and
run-02 evidence paths in the current worktree.

**Authorized scope:** verification and evidence only. Do not edit source or
test implementation files, change package exports/version, modify AMX
checker/runtime behavior, touch renderer/CLI/desktop/docs/examples/release
surfaces, or expand beyond the exact commands and paths below. New source/test
paths or extra retries require a separate Product Owner approval.

## Authorized Closeout Scope

- Reconcile every `G123-*` row and every unique current AST discriminant to a
  test, parity artifact, or explicit `BLOCKED/UNAVAILABLE` status. Do not mark
  partially covered families as `PASS`.
- Audit actual generated helper imports against the committed S122 declaration
  and record remaining lowering/API gaps. Any new source/test path requires a
  separate exact approval before editing.
- On the approved closeout baseline, run the focused six-file suite, root
  typecheck, generated-fixture strict compile, AMX oracle, root build, and
  `git diff --check`. These are separate evidence rows, not one aggregate.
- Store new run output under a fresh
  `planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/`
  root; retain all `run-01` artifacts. Preserve and compare the current root
  `dist` and `src/renderer/diagramBrowserRuntime.ts` before/after build.
- The retry cap is two retries per failing slice. Stop immediately at the cap;
  do not extend it implicitly or continue after a stop condition.

## Authorized Closeout Commands

Run the following exact commands from `C:\Users\gamez\Programming\openamx`:

```text
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts
bunx tsc --noEmit
bun run build
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/main.ts planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/oracle.ts
bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-02/fixtures/oracle.ts
git diff --check
```

The focused suite routes generated fixture inputs and outputs to the approved
`run-02/fixtures` root using `OPENAMX_S123_ARTIFACT_ROOT`; without that
environment variable it retains the existing `run-01` default for ordinary
local test runs. Do not run broad root, CLI, desktop, UI, release, renderer, or
platform suites.

## Preservation and Baseline

- Record branch, commit, dirty state/user changes, Windows/Bun/TypeScript/Git
  versions, package version/lock status, and current `dist` manifest.
- Prefer an isolated worktree/build root. `bun run build` can regenerate
  `src/renderer/diagramBrowserRuntime.ts` and `dist`; preserve/hash all existing
  files and restore only under explicit approval, verifying every original hash.
- Preserve S121/S122 artifacts, generated outputs, ignored output directories,
  user changes, and all first failures. Store new logs/generated TS/JS/oracle
  outputs only under the approved S123 artifact root.
- No release/version/package publication/deployment/installer/registry/
  certification workflow is run.

## Verification Criteria

Run the focused suite and root typecheck before the build. The build must
precede generated-fixture compilation so `openamx/transpiler-runtime` resolves
to the accepted S122 declaration. Archive the generated build, execute the
oracle, then restore and hash-verify the baseline `dist` and renderer output.
Do not run broad or UI/release suites.

## Generated Source Checks

- For each valid golden case, record source/module-context fixture hash,
  emitted TypeScript path/hash, helper import list, compiler flags, compiler
  output, and execution output.
- Strictly compile with the approved TypeScript configuration (S121/S122
  baseline was 5.9.3, ES2022, ESNext, strict, bundler; `.ts` imports used
  `allowImportingTsExtensions` with noEmit).
- Execute the compiled or Bun-consumed generated fixtures with identical AMX
  oracle inputs. Record whether execution is raw TS via Bun or compiled JS and
  do not imply arbitrary runner compatibility.
- Compare exports and `views` using the policy in `parity-matrix.md`; retain
  exact AMX diagnostic code/source and D122-15 enum-default exclusion.
- Run invalid parse/type/lowering fixtures and verify no success code output.
  This is per-module code generation only; no graph destination/file writer is
  part of S123.

## Required Evidence Rows

- S121 final disposition and S122 disposition verified before source edits.
- AST count reconciliation and helper API declaration audit.
- Golden/comment/source/frontmatter output and deterministic repeat hashes.
- Valid generated-source compile and runtime parity by fixture family.
- Invalid parse/type/lowering diagnostics and no-code result.
- `run(inputs)` input validation, explicit exports, views order and fresh state.
- Changed-path audit proving S123/S124/S125 boundaries and user artifact
  preservation.

## Raw Result Rules

- Use only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` for raw rows.
- Preserve first failures and each retry as separate run IDs. Observe the
  approved retry/stop protocol; stop and request replan immediately if its
  retry cap is reached.
- Root tests, typecheck, build, source goldens, generated compile, execution
  parity and preservation are separate evidence. A narrow suite does not
  imply full root/CLI/desktop/native/release acceptance.
- D121-18 multi-file rollback is not tested or resolved by S123.

## Authorized G123 Completion Replan

Run-02 is complete for its approved closeout scope. The Product Owner
subsequently approved the exact run-03 follow-up tranche below on 2026-11-26;
its source/test, fixture, command, output, preservation and retry boundaries
were followed. Remaining `BLOCKED/UNAVAILABLE` or `NOT RUN` G123 rows were
accepted as recorded residuals at S123 closeout.

### Authorized File Scope

- Emitter/source: `src/transpiler/emit.ts`, `src/transpiler/graph.ts`, and
  `src/transpiler/source.ts` only as required by a failing G123 case.
- Tests: existing `tests/transpiler.test.ts` and
  `tests/transpilerGolden.test.ts` only. Do not add a new test file.
- Contract/evidence: `ast-lowering-contract.md`, `golden-fixtures.md`,
  `parity-matrix.md`, `verification-plan.md`, and `builder-evidence.md`.
- Generated fixtures, logs and hashes: fresh
  `planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/`.
- No changes to `src/index.ts`, `package.json`, `bun.lock`, parser/checker,
  AMX runtime, loader, renderer, CLI, desktop, docs/example, release, or
  platform files unless a separate Product Owner disposition expands scope.

### Authorized Test Slices

1. Source preservation and rejection: CRLF/CR/LF/U+2028/U+2029 frontmatter and
   body, mixed AMX/non-AMX fences, narrative before/between/after fences,
   `*/`, `//#`, Unicode, literal interpolation, and parse/type/lowering
   no-module results. Map `G123-SOURCE-01`, `FRONTMATTER-01`,
   `COMMENT-ESCAPE-01`, and `REJECT-01`.
2. Declarations and expressions: uninitialized/multi-fence bindings,
   DateTime/list/nullable/record inheritance/defaults, string/numeric enum
   input and type tests, name collisions, export lists, interpolation types,
   eager logical operands, unary operations, lazy conditional/braced-if/match,
   builtin argument ordering, and statement/expression function behavior.
   Map `G123-DECL-01`, `TYPE-01`, `NAME-01`, `ENUM-01`, `FUNCTION-01`,
   `EXPORT-01`, `LITERAL-01`, `EXPR-01`, `STRING-01`, `OPERATOR-01`,
   `CONTROL-01`, `MATCH-01`, and `CALL-01`.
3. Mutation, collections and measurements: assignment/compound assignment,
   add/remove, immutable imported-list rejection, descending/empty/nested
   loops, 1-based access, recursive list argument copying, supported builtin
   families, linear and affine measurements, and rejected operations. Map
   `G123-MUTATION-01`, `LOOP-01`, `LIST-01`, `BUILTIN-01`, `MEASURE-01`, and
   `RECORD-01`.
4. Inputs and views: Number/DateTime/list/record/measurement/string-enum
   inputs, invalid `AMX4003` paths, all chart kinds/options/measurement
   normalization, detached table snapshots, all structured-v2 diagram
   primitives and controls, imported diagram ordering, and fresh state with
   differing inputs. Map `G123-INPUT-01`, `VIEW-TABLE-01`, `VIEW-CHART-01`,
   `VIEW-SHOW-01`, `VIEW-DIAGRAM-01`, `VIEW-ORDER-01`, and `RUN-FRESH-01`.
5. Determinism/import boundary: repeat emissions and strict compile of a
   resolved imported graph with the supported output-relative specifiers.
   Map `G123-IMPORT-01` and `DETERMINISM-01`.

These are coverage targets, not claims that current code already passes them.
After each slice, update the G123 row with raw `PASS`, `FAIL`,
`BLOCKED/UNAVAILABLE`, or `NOT RUN`. Do not change AMX semantics to create a
fixture. A local enum-annotated runtime binding has previously returned
`AMX4003: Expected a Status record`; do not claim parity for that case without
a separate Product Owner decision. D122-15 enum-default no-parity remains
unchanged.

### Run-03 Commands and Preservation

From `C:\Users\gamez\Programming\openamx`, after exact approval:

```text
$env:OPENAMX_S123_ARTIFACT_ROOT='planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03'; bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts
bunx tsc --noEmit
bun run build
bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/main.ts planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/oracle.ts
bun run planning/sprints/0123-v20-core-document-ast-emitter/artifacts/run-03/fixtures/oracle.ts
git diff --check
```

Before build, capture a new run-03 manifest and backup of root `dist` and
`src/renderer/diagramBrowserRuntime.ts`; archive generated outputs under
`run-03/generated-dist/`, then restore and verify every baseline path, size,
and SHA-256. Preserve all run-01/run-02 artifacts. Keep the two-retry maximum
per failing slice; stop at the cap and request another disposition. No
cleanup/deletion of pre-existing artifacts is authorized.

Run-03 completed on 2026-11-26. The focused suite passed 267/0 with 1,302
assertions; root typecheck, build, strict generated compile, AMX oracle,
`git diff --check`, and baseline restoration passed. The pre-build generated
compile failure and optional-record-field compile failure remain archived as
raw failures; succeeding checks and remaining G123 residuals are recorded in
`builder-evidence.md`.