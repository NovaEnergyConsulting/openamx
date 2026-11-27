# Sprint 126 Acceptance Criteria

Sprint 126 is complete only when S121-S125 dispositions/residuals are
reconciled, all required V0.20 end-to-end paths have reproducible evidence, raw
root/CLI/build/desktop/artifact results are recorded, documentation/example
claims are checked, and a separate Product Owner closeout disposition exists.
S126 changes no product behavior and authorizes no release action.

## Entry and Authority

- S121 final feasibility closeout is ACCEPTED/CLOSED WITH RECORDED RESIDUALS.
- S122 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS; D122-15 and the accepted
  S122 retry process residual remain visible.
- S123 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS; `S123-RETRY-STOP-01` raw
  FAIL and every remaining G123/E123 `BLOCKED/UNAVAILABLE` or `NOT RUN` row
  remain unchanged.
- S124 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS; `S124-RETRY-STOP-01` raw
  FAIL, G124 cancellation/crash rows NOT RUN, and D121-18 remain unchanged.
- S125 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-27 from its
  Builder evidence. Preserve full desktop `bun run test` FAIL on the
  report-export timing poll, Hutch wrapper BLOCKED/UNAVAILABLE vs direct
  pinned typecheck PASS, native/cross-platform BLOCKED/UNAVAILABLE, and
  `S125-MEASUREMENT-PROBE-01` raw FAIL.
- Canonical lifecycle records currently lag at S123. Reconcile S124/S125
  dispositions in `state.md`, `decisions.md`, `STATUS.json`, and
  `ARCHITECT_BRIEFING.md` only with separate explicit authorization before
  S126 execution. Historical Builder evidence remains immutable.
- Exact S126 baseline/worktree, commands, outputs, retries, preservation,
  artifacts, and cleanup are separately authorized.

## Core and Generated TypeScript

- S123 G123 matrix is reconciled row-by-row. Any row that remains incomplete
  is still raw BLOCKED/UNAVAILABLE or NOT RUN; no aggregate “full AST covered”
  claim is made unless every accepted construct has direct evidence.
- Example 16 and approved fixtures parse/check/format, transpile as a complete
  graph, compile under the documented TypeScript configuration, execute, and
  compare `run(inputs).exports` and `run(inputs).views` with AMX runtime for
  accepted source forms.
- Source comments/frontmatter, non-AMX fences, literal interpolation,
  imported-module paths, deterministic output, explicit exports, typed inputs,
  table/chart snapshots, structured-v2 diagram DTOs, and repeated fresh runs
  have direct evidence.
- Measurement/list/builtin/input/error parity is reported at exact G123/G124/
  S125 IDs. The S125 Measurement type-identity compile FAIL is rechecked or
  carried raw; if unresolved, V0.20 closeout cannot state complete measurement
  parity.
- D122-15 enum-default no-parity is preserved; no AMX checker/runtime change or
  unsupported parity claim is allowed.

## CLI and Graph Output

- CLI graph output matches desktop graph output for the same source and module
  graph: output-relative file set, exact bytes, import specifiers, helper
  imports, deterministic order and entry path.
- Parse/type/module errors block output and retain source path/location.
  Import-root containment, symlink escape, cycle, missing/private export,
  collision, case/NFC collision, output-root escape, overwrite refusal/accept,
  unrelated-file preservation and determinism are directly verified.
- S124 preflight/stage/publish failure rows retain exact per-path state.
  D121-18 remains best-effort and non-crash-atomic even if all injected tests
  pass. G124 cancellation/crash NOT RUN rows are not silently upgraded.
- CLI never executes generated TypeScript. Generated graph compilation and
  execution are separate S126 test steps.

## Desktop Graph Export

- Active/unsaved entry and imported dependency buffers produce the expected
  graph. Worker/source/result limits and RPC validation are exercised.
- Destination directory selection, picker cancellation, graph-wide overwrite
  refusal/acceptance, destination mutation after confirmation, stale active/
  dependency identity, disk conflicts, worker cancellation, commit state and
  open/reveal are verified.
- Writer stage/publish/rollback success and injected failures report the exact
  per-path state and never return success on incomplete publication.
- Focused Vite UI evidence is labeled harness-only. Native WebView and
  cross-platform remain BLOCKED/UNAVAILABLE unless directly authorized and
  proven.
- Full desktop `bun run test` raw aggregate is reported. The known report-export
  poll failure is preserved if it recurs; S125 did not authorize changing its
  timeout/assertion.

## Docs, Examples, Builds, and Aggregate Gates

- V0.20 specification and README links match implemented CLI/desktop/helper
  APIs; historical language specs are unchanged. Example 16 runs and its
  generated graph compiles/executes under the documented setup.
- Root focused selection, full root `bun test`, `bun run build`, root no-emit
  typecheck, desktop typecheck/test/RPC/UI, generated compile/run, CLI graph
  outputs and preservation all have separate raw evidence rows.
- A configured wrapper no-result and a direct pinned toolchain PASS remain
  distinct. Root `bun test` and desktop test aggregate failures are not hidden
  by focused passes.
- `dist`, renderer runtime, desktop generated/test outputs and prior sprint
  artifacts are hash-preserved/restored per the approved plan. Changed-path
  audit proves no S126 source/test/spec/example fix occurred.
- Every command, CWD, tool version, count/assertion, output path/hash, retry,
  residual owner and status is recorded. No NOT RUN/BLOCKED row is claimed PASS.

## Disposition Boundary

- Builder recommendation and Product Owner disposition are separate.
- Product Owner may ACCEPT/CLOSE WITH RECORDED RESIDUALS only for the verified
  scope; incomplete rows retain their raw statuses and named owners.
- No release, package/version, publication, deployment, distribution,
  installer, Marketplace/registry, native/cross-platform certification, or
  release-readiness authority follows S126.