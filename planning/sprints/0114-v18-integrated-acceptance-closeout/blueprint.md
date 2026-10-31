# Sprint 114 Blueprint: V0.18 Integrated Acceptance and Closeout

## Approach

1. Reconcile S112 and S113 owner dispositions against their Builder evidence
   and canonical planning records. Resolve the S112 contradiction before
   execution: S113 evidence says accepted with residuals, while S112 evidence
   and global ledgers still say pending. Obtain explicit owner confirmation
   and approve exact lifecycle-record amendments if needed.
2. Obtain separate S114 authorization and approve the exact baseline commit,
   isolated worktree, root/extension/desktop commands, browser/export output
   roots, generated-file policy, and evidence paths. Record preservation
   inventory before any command that can write outputs.
3. Complete the entry/disposition section of
   `integrated-evidence-matrix.md`. Verify accepted S109-S113 contracts,
   scope amendments, raw outcomes, and residual owners. Do not relabel old
   failures as PASS because a later owner disposition accepted residuals.
4. Run integrated language regressions in dependency order: parser and
   diagnostics; checker/cap accounting; formatter; model expansion/frame
   evaluation; v2 serialization and v1 static compatibility; browser runtime;
   static PDF/DOCX; shared editor facts; VS Code host; desktop CodeMirror UI;
   Example 08 end-to-end.
5. Use one canonical generated fixture/example for cross-surface comparisons.
   Assert ordered membership and property values at lower, interior, and
   upper timeline values. Confirm the same model retains membership while
   `t`-dependent properties animate. Compare PDF/DOCX with the lower-bound
   frame only.
6. Run the root focused tests/build, VS Code Extension Development Host tests,
   desktop typecheck, and applicable desktop UI tests. Run broader root
   regressions only as explicitly approved in the S114 command plan. Preserve
   current VS Code output roots and desktop `test-results/`; use isolated
   validation and new S114 artifact directories.
7. Record known residuals accurately: S109 one-host/synthetic qualification
   and size discrepancy; S111 potentially unbounded work; S112 intermittent
   preview bridge/native/cross-platform gaps; S113 root Help-index failure,
   VS Code Windows failures, Hutch typecheck no-result, `get_errors` analyzer
   disagreement, and Vite/native limitations. Verify whether any are resolved
   only with new direct evidence and separate disposition.
8. Reconcile performance/output sizes with S109/S112 baseline values. Record
   environment, repetitions, timing, sizes, failures/retries and artifacts.
   Do not change caps or output policy to make a run pass.
9. If any product defect is found, stop the verification slice and request a
   separate corrective authorization and exact file plan. Do not modify
   source/tests under S114 closeout authorization.
10. Complete every matrix row, audit artifacts/changed paths, run
    `git diff --check`, and submit a Builder recommendation. Obtain a
    separate product-owner closeout disposition. Release/version/publication
    work remains separately gated.

## Evidence Surfaces

- Parser/AST/checker/formatter: `tests/parser.test.ts`,
  `tests/diagram.test.ts`, `tests/formatter.test.ts`.
- Runtime/model/serialization/HTML: `tests/diagram.test.ts`,
  `tests/diagramHtml.test.ts`, plus standalone browser automation.
- Static exports: `tests/reportPdf.test.ts` and `tests/reportDocx.test.ts`.
- Shared authoring: `tests/editor.test.ts` and focused formatter/editor
  suites.
- VS Code: actual Extension Development Host from `vscode-extension/`.
- Desktop: `bun run typecheck`/approved direct fallback and focused
  `diagram-playback.pw.ts` plus `v16-language-editor.pw.ts` through the
  approved harness. Label Vite harness evidence separately from native.
- Example: execute `examples/08_Formula_Driven_Diagrams.amx`, inspect
  standalone generated playback and lower-bound PDF/DOCX outputs.
- Generated browser runtime: root build/generator output only; no manual
  bundle editing.

## Verification Plan

The exact command list and cwd are proposed in `verification-plan.md` and
require separate approval. Use an isolated worktree because root build
regenerates `src/renderer/diagramBrowserRuntime.ts` and creates `dist/`; the
VS Code suite writes `dist/`, `out/`, and `.vscode-test/`; Hutch and desktop
UI workflows may write generated state and Playwright output.

## Stop Conditions

- S112/S113 disposition record conflict remains unresolved.
- Any test requests unapproved writes, overwrites prior artifacts, or
  requires a product fix.
- Native/cross-platform host is unavailable; record
  BLOCKED/UNAVAILABLE, do not infer PASS.
- A build/test stalls or fails outside the agreed retry policy.
- No release, publication, version/package change, installer, or certification
  command is run.