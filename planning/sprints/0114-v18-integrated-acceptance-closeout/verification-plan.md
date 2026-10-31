# Sprint 114 Verification and Output Plan

## Status

Architect-prepared candidate verification plan. No S114 command, worktree,
artifact, lifecycle update, or source/test change is authorized yet. Obtain
separate user approval of the exact baseline, commands, output paths, and
preservation plan before execution.

## Entry Reconciliation

- Verify S109-S111 separate dispositions from their evidence and canonical
  records.
- Resolve the S112 conflict before S114: S112 `builder-evidence.md`,
  `planning/state.md`, `planning/decisions.md`, `planning/STATUS.json`, and
  `planning/ARCHITECT_BRIEFING.md` say product-owner disposition PENDING;
  S113 `builder-evidence.md` says the user ACCEPTED S112 WITH RECORDED
  RESIDUALS on 2026-10-31. Obtain explicit owner confirmation and authorize
  exact canonical record reconciliation.
- Verify S113 ACCEPTED WITH RECORDED RESIDUALS from its Builder evidence;
  separately reconcile the S113 status into the approved lifecycle records.
- Record the status discrepancies and their resolution without modifying raw
  S112/S113 test outcomes.

## Isolation and Preservation

- Record branch, commit, full status, OS/architecture, Bun/Node/VS Code/
  Playwright/Chromium/Hutch versions, and all prior generated/test output
  roots before execution.
- Prefer a fresh isolated validation worktree at the separately approved
  commit. Do not use shared `node_modules` by linking unless explicitly
  approved.
- New S114 artifacts are limited to fresh subdirectories under
  `planning/sprints/0114-v18-integrated-acceptance-closeout/artifacts/`:
  `logs/`, `playwright/`, `outputs/`, and `hashes/`.
- Preserve S109-S113 artifacts, `desktop-app/test-results/`, existing
  `vscode-extension/dist/`, `out/`, `.vscode-test/`, and all generated
  artifacts. Do not clean existing output trees.
- Root `bun run build` invokes `scripts/build-diagram-runtime.ts` and writes
  `src/renderer/diagramBrowserRuntime.ts` plus build output. Run only in the
  isolated worktree; compare and retain the generated result as an approved
  output.
- VS Code `bun run test` compiles `dist/` and `out/` and may use
  `.vscode-test/`. Use isolated directories or approve precise output/hash
  preservation before running.
- Desktop `bun run typecheck` may invoke Hutch preparation; desktop UI may
  write test output. Keep logs and Playwright output under fresh S114 roots.

## Candidate Commands and CWD

All commands below are proposals and require approval. Record any equivalent
workflow actually authorized and run.

From repository root, focused integrated tests:

```powershell
bun test tests/parser.test.ts tests/diagram.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/modules.test.ts tests/diagramHtml.test.ts tests/renderer.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts tests/examples.test.ts
```

Root build/typecheck and generated runtime:

```powershell
bun run build
bunx tsc --noEmit
```

The root build already runs the generated diagram runtime script. An explicit
`bun run scripts/build-diagram-runtime.ts` may be run instead or additionally
only if separately approved and needed for the evidence record.

From `vscode-extension/`:

```powershell
bun run test
```

From `desktop-app/`, subject to Hutch readiness and approved output paths:

```powershell
bun run typecheck
bun run test:ui -- tests/ui/diagram-playback.pw.ts tests/ui/v16-language-editor.pw.ts --output=../planning/sprints/0114-v18-integrated-acceptance-closeout/artifacts/playwright/s114-final
```

Run the broader root `bun test` only if explicitly included in the approved
S114 execution plan. The master plan calls for broader regressions as agreed
in S109; do not infer authorization for a full suite from this proposal.

## Example and Output Checks

- Execute Example 08 through the approved CLI/runtime path and generate a
  fresh standalone HTML artifact under S114 `artifacts/outputs/`.
- Open that exact output in the approved browser test path. Compare generated
  element order/count and geometry with in-process frames at lower, interior,
  and upper times. Confirm membership is fixed and `t`-dependent properties
  animate.
- Verify PDF SVG and DOCX PNG at the lower time bound using focused root
  tests or an approved direct export. Keep the two static export formats
  distinct from interactive HTML.
- Exercise the S112 16-diagram/64-per-diagram composition only if the probe
  and new output paths are included in the approved file plan. Do not
  overwrite S112 probe results.
- Preserve the 100 MiB renderer limit, 1 MiB V0.13 statement, and desktop
  worker guard as current separate facts; S114 makes no policy change.

## Stop Conditions

- S112/S113 disposition reconciliation is incomplete.
- Any output would overwrite a prior artifact or write outside approved
  isolated roots.
- Any product defect appears; stop and request a separate corrective scope.
- Hutch/VS Code/desktop harness stalls or fails beyond the approved retry
  plan; preserve raw outcome and report `FAIL` or `BLOCKED/UNAVAILABLE`.
- Native route unavailable; record `BLOCKED/UNAVAILABLE`, not PASS.
- No release, publication, version/package change, installer, or certification
  command is run.