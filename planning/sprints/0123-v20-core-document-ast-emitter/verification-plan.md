# Sprint 123 Verification Plan

## Status and Entry Gate

Architect-prepared verification plan. S121 final feasibility closeout remains
pending in canonical planning records; S123 implementation and execution are
blocked until that disposition is separately accepted and exact S123 scope is
authorized.

Before execution, separately approve baseline/worktree, changed paths, exact
commands, build outputs, generated fixture/oracle roots, `dist` preservation,
retry/stop policy, and cleanup. No command below is authorized by this plan.

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

## Candidate Focused Checks

Use the exact authorized subset and record CWD, tool versions, result counts,
assertions and raw output. Candidate focused tests:

```text
bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts tests/evaluator.test.ts tests/parser.test.ts tests/measurements.test.ts tests/modules.test.ts
bunx tsc --noEmit
bun run build
git diff --check
```

These are candidates only; use actual repository scripts and existing suites
after a narrow source/test audit. Do not run broad or UI/release suites without
specific approval.

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