# Sprint 124 Requirements: V0.20 Module Graph and CLI

## Document Status

Architect-prepared Sprint 124 package. It scopes recursive filesystem graph
resolution, safe module output, and the `openamx transpile` CLI over the
accepted S123 core API. Technical decisions remain candidates until separately
reviewed and dispositioned. Preparing these documents does not authorize
implementation, release, publication, package/version changes, deployment, or
platform certification.

## Goal

Resolve the complete imported `.amx` graph without evaluating it, preserve the
existing module containment/cycle/visibility rules, convert it into the
`TranspileGraphInput` accepted by S123, and safely write the complete emitted
`.ts` graph through a new `openamx transpile` command. Invalid graphs and
destination conflicts must fail clearly without success-shaped partial output.

S124 adds no AMX syntax, runtime semantic changes, desktop export, documentation
or rendering. It implements graph orchestration and CLI only.

## Authority and Inputs

- Confirmed V0.20 sequence and S124 scope:
  [`plan-openamxV20MasterSprintPlan.md`](../../plan-openamxV20MasterSprintPlan.md).
- S121 final feasibility closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-25. Preserve D121-18: multi-file publication rollback is
  best-effort and not crash-atomic.
- S122 closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25.
  Preserve D122-15 enum-default no-parity for enum-valued record defaults that
  current AMX cannot express, plus the accepted retry/stop-protocol residual.
- S123 closeout: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26.
  Preserve raw S123 retry-cap process `FAIL`, and every `BLOCKED/UNAVAILABLE`
  and `NOT RUN` G123 row in
  `planning/sprints/0123-v20-core-document-ast-emitter/builder-evidence.md` and
  its parity matrix. Acceptance does not upgrade incomplete AST, helper,
  source-fidelity, parity, or unknown-lowering evidence to PASS.
- S123 core API: `src/index.ts` exports `transpileDocument`; graph contract and
  types are in `src/transpiler/types.ts`, `src/transpiler/graph.ts`, and
  `src/transpiler/index.ts`. It accepts a complete in-memory graph and returns
  dependency-ordered generated modules or diagnostics.
- Existing source module rules: `src/runtime/moduleLoader.ts` requires
  relative `./` or `../` `.amx` imports with `/`, canonicalizes real paths,
  defaults import root to the entry module's directory, enforces root
  containment, detects cycles, source-order imports, explicit export
  visibility, and entry-only inputs. S124 must preserve these without calling
  `loadEntryModule`, because it evaluates AMX.
- Existing CLI: `src/cli.ts` uses `cac`, reports `AmxError` diagnostics, and
  exits nonzero on failure. Root `package.json` bin is `./dist/cli.js`; no
  package version or bin change is in scope.
- Build/API baseline: S123 commit
  `257cf3f4d9395b8820a9e4e63e5f2abd310fd481` on `feat/create-V0.20.0`;
  verify the actual current clean/dirty state and preserve user changes before
  execution.

## Entry Conditions

- Verify owner dispositions for S121, S122 and S123 from canonical state,
  decisions, status, and sprint evidence. Preserve raw residuals and incomplete
  S123 G123 rows.
- Obtain separate S124 execution authorization for exact baseline/worktree,
  files, commands, temp/output roots, overwrite interaction, failure injection,
  retry/stop policy, and artifact preservation before implementation.
- Confirm S123 API shape and helper build/package resolution at the baseline.
  Do not alter the accepted `TranspileGraphInput`/`TranspileResult` contract
  without a separately dispositioned S123/API amendment.
- Ensure all graph discovery uses parse-only operations. Do not call
  `loadEntryModule` or evaluate AMX/generated TypeScript during transpilation.

## In Scope

- Recursively discover local imports from an entry `.amx` source, preserving
  original source text/frontmatter for every module, canonical module identity,
  dependency order, and explicit import specifier mappings.
- Enforce relative import syntax, exact `.amx` suffix, slash separators,
  canonical path identity, entry/import-root containment, import-before-code
  rule, cycle diagnostics, duplicate/unresolved imports, and export visibility.
- Construct the complete `TranspileGraphInput` for `transpileDocument`, with
  deterministic module IDs and `.ts` output-relative paths mirroring source
  paths under the chosen import root.
- Add `openamx transpile <entry.amx> --out-dir <directory>` with source-aware
  parse/type/module/output diagnostics, clear failure exit status, deterministic
  output, and no generated-code execution.
- Require explicit destination selection. Detect graph duplicates,
  normalized/case-fold collisions and existing destinations before writes.
  Never silently overwrite; support explicit confirmation/overwrite policy and
  cancellation without unexpected changes.
- Stage graph output and implement the accepted D121-18 best-effort rollback
  contract with per-path staged/published/restored/unrecovered reporting. Make
  no crash-atomicity claim.
- Add focused graph/CLI tests for nested imports, invalid graphs, containment,
  cycles, exports, deterministic paths, destination conflicts, overwrite,
  cancellation, failure/rollback reporting, and generated TypeScript compile.

## Out of Scope

- AST lowering changes or remediation of all residual S123 G123 cases. S124
  preserves their statuses and tests the graph API; any product defect or
  missing AST family requires a separate corrective scope.
- Desktop export, RPC/job/UI integration, published spec, README, example,
  renderer, HTML/PDF/DOCX output, source maps, or new AMX syntax.
- AMX evaluation or generated TypeScript execution as part of transpile.
- Strengthening D121-18 into crash-atomic multi-file transactions. Filesystem
  crash atomicity is not promised; S124 implements bounded best-effort rollback
  and reports exact outcome.
- Package version changes, release/publication, deployment, installer or
  registry distribution, or platform certification.

## Contract Rules

- Construct one complete graph before invoking S123 `transpileDocument`.
  Parse-only graph discovery does not execute AMX. S123 remains responsible for
  checking the in-memory graph and returning code for all modules or diagnostics.
- Stable module identity uses canonical real source path within the approved
  import root; output identity/path is relative and portable. Module graph
  traversal is deterministic and dependency-first.
- Output path replaces only the exact lowercase `.amx` suffix with `.ts`,
  retains nested relative path segments, and uses `/` in generated import
  specifiers. Absolute host paths never appear in generated code.
- Existing destination files are refused by default. Overwrite requires an
  explicit CLI choice; only graph-owned target files may be replaced.
- Validate all graph imports, paths, output mappings and collisions before
  publishing. Parse/type/module/preflight failure writes no generated graph.
- For a write-time failure, attempt rollback; report each path as staged,
  published, restored, or unrecovered. Do not claim no partial state after
  process/power loss.
- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  Builder recommendation and owner disposition are separate.

## Completion Outputs

- Accepted graph-loader, path-mapping, diagnostics, output safety, and CLI
  contracts with explicit decisions and residuals.
- Focused graph/CLI tests and command evidence for all required paths.
- A successful generated `.ts` graph compiles under the S121/S122 compiler
  baseline and imports `openamx/transpiler-runtime` via the package subpath.
- Failure tests prove no output on invalid graph/preflight failures and
  accurate best-effort rollback state for injected publication failures.
- `builder-evidence.md` records baseline, exact commands/CWDs, host versions,
  artifact hashes, failures/retries, incomplete S123 coverage carried forward,
  residual owners, changed-path audit, recommendation and separate owner
  disposition.
- S125 desktop/docs and S126 integrated acceptance remain separate. No
  release/package/platform authority follows S124.