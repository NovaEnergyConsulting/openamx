# Sprint 126 Blueprint: V0.20 Integrated Acceptance and Closeout

## Approach

1. Reconcile S121-S125 dispositions directly from canonical records and each
   sprint's Builder evidence. Repair the stale lifecycle ledgers only under
   separate explicit authorization; do not edit historical raw evidence.
2. Record baseline, user changes, generated-output manifests, host/tool
   versions, approved command matrix, isolated worktrees, artifact roots,
   retries/stop cap, and cleanup policy before any check.
3. Inventory all V0.20 requirements and S123 G123 rows. Preserve the accepted
   incomplete coverage and S125 Measurement probe FAIL; assign each row a
   direct S126 check or retain its raw blocker/NOT RUN status.
4. Finalize `integrated-evidence-matrix.md` with separate feature, host,
   artifact, and residual rows. A focused pass must not imply a broad suite or
   native-host pass.
5. Execute the exact approved root focused transpiler/AST/runtime/input/view
   checks, then root build/no-emit typecheck and full root suite. Preserve
   first failures and every retry separately.
6. Exercise Example 16 end-to-end: AMX parse/check/format/runtime, CLI graph
   transpile, strict TypeScript compile, generated `run(inputs)`, AMX oracle
   comparison, comment/frontmatter fidelity, imports, and ordered views.
7. Verify S124 CLI and S125 desktop graph outputs are equivalent in module
   paths/content for the same source overlay. Exercise path safety, collision,
   overwrite/refusal, cancel, stale identity/source, writer failure and
   per-path best-effort rollback outcomes.
8. Run desktop typecheck, full unit/RPC suite, focused Vite UI and any approved
   native route. Record S125's existing report-export timing failure and
   Hutch-wrapper behavior distinctly; do not modify unrelated timing tests.
9. Inspect V0.20 spec/README/example claims and all artifact hashes. Verify
   historical specs, `dist`, generated renderer, desktop outputs and prior
   sprint artifacts are preserved/restored as approved.
10. Complete `closeout-contract.md`, `builder-evidence.md`, residual owner
    register and recommendation. Submit for separate Product Owner disposition.

## Decision Register

Candidate closeout decisions; S121-S125 accepted product decisions remain
authoritative.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D126-01 | Lifecycle ledger | Reconcile S124/S125 owner dispositions into state/decisions/status/briefing only under explicit owner approval; preserve sprint evidence and raw rows. | Product Owner |
| D126-02 | S123 coverage gaps | Audit every G123 row against S123 evidence and S126 direct checks. Keep incomplete AST/helper/source/parity rows blocked/unavailable or not run unless direct evidence closes the exact row. | Product Owner / S126 |
| D126-03 | Measurement probe | Re-run the exact S125 Measurement generated-code probe or an approved equivalent. If failure persists, record raw FAIL and require separately authorized correction; no in-closeout patch. | Product Owner / runtime owner |
| D126-04 | Desktop full-suite failure | Re-run configured desktop suite. Preserve the report-export poll failure if repeated; do not weaken timing/assertions inside S126. | Desktop owner |
| D126-05 | Host classification | Vite UI and pinned direct vue-tsc are distinct from configured desktop test/typecheck wrapper and native WebView; classify raw rows separately. | S126 evidence owner |
| D126-06 | Residual closeout | Owner may accept V0.20 with explicitly named residuals; no accepted disposition upgrades raw FAIL/BLOCKED/NOT RUN rows. | Product Owner |
| D126-07 | Release boundary | S126 may recommend integrated acceptance/closeout only. Release/package/platform activity requires a separate plan and approval. | Product Owner |

## Source-Grounded Constraints

- S123 `transpileDocument` receives a complete in-memory module graph and
  returns a complete generated graph or diagnostics; it does not write files.
- S124 `resolveTranspileGraph` and CLI provide parse-only graph discovery;
  `writeTranspiledGraph` stages and publishes with explicit overwrite and
  per-path best-effort rollback. D121-18 denies crash atomicity.
- S125 desktop export consumes active source overlays and uses directory
  selection, graph preflight, one graph-level overwrite prompt, stale identity
  checks, S124 writer, and result actions.
- S125 recorded: focused graph/worker/RPC/UI harness, root typecheck, generated
  compile/run, preservation and docs/example checks passed. Full desktop
  `bun run test` remains FAIL on a timing-sensitive report-export RPC poll;
  native/cross-platform remains BLOCKED/UNAVAILABLE; Hutch wrapper emitted no
  typecheck result while the pinned direct vue-tsc check passed.
- S125 Measurement probe is a raw FAIL from generated Measurement type identity
  (`TS2339`/`TS2322`); it was removed from Example 16 and no emitter fix was
  authorized. This remains a closeout risk, not a product pass.
- S123 has accepted but incomplete G123 rows; S126 must preserve and reconcile
  each row rather than infer coverage from Example 16 or graph export success.

## Required Sprint Artifacts

- `requirements.md`, `blueprint.md`, `acceptance.md`.
- `integrated-evidence-matrix.md`, `verification-plan.md`,
  `closeout-contract.md`, `builder-evidence.md`, `handoff-prompt.md`.

## Boundaries

- S126 is verification/closeout only. On product defect, preserve evidence and
  request separate corrective scope; do not edit source/tests/docs/examples.
- Preserve every historical raw failure, retry, unavailable route and output
  manifest. No release or package/platform action.