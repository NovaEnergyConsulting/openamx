# Sprint 127 Handoff Prompt

You are the Builder for OpenAMX Sprint 127: V0.20 Measurement Type Identity
Correction.

## Read First

- `.agents/main.md`, `planning/state.md`, `planning/decisions.md`, and the
  current V0.20 master sprint plan.
- S121/S122 public helper and dimension contracts, S123 AST lowering contract
  and parity matrix, S125 Measurement probe artifacts, and the complete S126
  Builder evidence/matrix/closeout contract.
- The exact generated S126 Measurement failure in
  `planning/sprints/0126-v20-integrated-acceptance-closeout/artifacts/run-01/`.
- `src/transpiler/emit.ts`, `src/transpiler/index.ts`, `src/transpiler/graph.ts`,
  `src/typechecker/checkDocument.ts`, `src/typechecker/dimensionTypes.ts`,
  `src/transpilerRuntime.ts`, and the focused `tests/transpiler.test.ts` path.

## Authority Gate

This package authorizes planning only. Before editing source/tests or running
S127 verification, obtain separate Product Owner authorization for the exact
baseline, primary/validation worktree, changed-file allowlist, command/CWD
matrix, artifact/output roots, `dist`/renderer preservation, retry/stop rule,
cleanup, and residual disposition process.

The approved planning scope is emitter plus focused tests, with optional
internal `src/transpiler/index.ts` wiring only. Do not change the S122 public
helper contract, checker semantics, CLI, desktop, package, docs, or examples.
If the correction requires any such change, stop and request a scope amendment.

## Builder Task After Authorization

- Implement one deterministic graph-wide canonical identity per AMX
  Measurement vector-equivalence class using prepared dimension metadata.
- Keep IDs independent of absolute roots and use the same ID in every module
  in the graph.
- Add the retained imported `averageSpeed` regression and adjacent identity
  cases in `tests/transpiler.test.ts`.
- Strictly compile the generated graph, execute a separate AMX oracle, and
  compare Measurement value, display unit, and exports.
- Preserve S125/S126 raw failures and all unrelated G123/G124 residuals.
  Do not claim full measurement or V0.20 parity from this narrow correction.

## Stop Conditions

- Stop if the generated graph still fails strict compilation or differs from
  AMX for an accepted source form.
- Stop if same-vector alias handling conflicts with current checker semantics.
- Stop before any helper/API/checker/CLI/desktop/docs/example change and request
  a separate amendment.
- Preserve every first failure and retry. No release or package/platform work
  is authorized.