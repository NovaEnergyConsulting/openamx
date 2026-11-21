# Sprint 120 Blueprint: V0.19 Integrated Acceptance and Closeout

## Approach

1. Obtain separate Sprint 120 authorization for exact baseline/worktree, output
   roots, commands, preservation, retries, and evidence path. Record branch,
   commit, status, OS/tool/host versions, and prior artifact hashes before any
   command.
2. Reconcile S115-S119 accepted dispositions and raw evidence. Preserve the S119
   full VS Code host aggregate 20 pass/9 fail and V0.19-specific PASS rows as
   distinct facts; do not convert the aggregate to PASS.
3. Prefer an isolated validation worktree. Keep S120 logs, outputs, screenshots,
   hashes, and inspectors under this sprint's `artifacts/` root. Do not overwrite
   S115-S119 artifacts or existing desktop/extension output trees.
4. Run the exact master-plan V0.19 focused root suite, then the explicitly
   approved supplemental affine/data/example selection needed to avoid a
   coverage gap left by the master command.
5. Run root build and no-emit typecheck. Verify the generated browser runtime is
   produced only through the build script; compare hashes/diff and retain exact
   build output.
6. Run the full configured VS Code extension command from its package CWD. Also
   identify the V0.19 host cases in its raw log. A full-host failure remains raw
   even if the V0.19 rows pass.
7. Run desktop typecheck and the focused V0.19 editor UI case with an explicit
   output root. Record Vite harness/native/host distinctions and any unavailable
   native platform route.
8. Run Example 05 and Example 07 directly, generate exact HTML/PDF/DOCX artifacts,
   inspect them structurally and semantically, and compare hashes/sizes. Verify
   omitted/false absence, true/dynamic preservation, affine golden values,
   named outputs, and migration/spec/navigation links.
9. Run the broader root `bun test` only after the focused gates and only if the
   exact S120 command plan authorizes it. Preserve unrelated failures rather than
   repairing them.
10. Reconcile the integrated matrix, raw statuses, residual owner/disposition,
    resource observations, and changed paths. Submit a Builder recommendation
    and separate owner disposition. No release command is run.

## Verification Architecture

| Stream | Primary proof | Secondary artifact/inspection |
| --- | --- | --- |
| Entry contracts | S115-S119 evidence/dispositions | decision/case reconciliation and residual register |
| Chart source-to-output | parser/checker/evaluator/chart model plus HTML/PDF/DOCX tests | Example 07 four-state artifact inspection |
| Affine source-to-output | dimensions/measurements/evaluator/data/chart tests | Example 05 values and Example 07 affine chart normalization |
| Editors | VS Code actual host + desktop Vite UI | exact scopes/facts/ranges/format/diagnostic status |
| Build/generated | root `bun run build` + typecheck | generated runtime hash/diff/provenance |
| Public docs/examples | spec/README/Examples/guide tests | link/migration/content/artifact review |
| Broad regression | exact focused selection then full `bun test` if approved | raw aggregate and unrelated failures |
| Closeout | integrated matrix + residual/disposition separation | owner decision; no release authority |

## Candidate Run Sequence

1. Baseline/preservation inventory.
2. Master focused root suite.
3. Supplemental V0.19 affine/data/example root selection.
4. Broader root suite.
5. Root build and no-emit typecheck.
6. VS Code host suite.
7. Desktop typecheck and V0.19 UI.
8. Example 05 run and Example 07 HTML/PDF/DOCX exports.
9. Output/artifact/hash/source inspection.
10. Final status/changed-path/scope reconciliation.

Exact retry policy must be approved in advance. Default: stop on a product defect,
record a failed command, and request corrective scope before rerun; allow a retry
only for a documented host/transient reason named in the approved plan.

## Stop Conditions

- S115-S119 disposition or S119 residual reconciliation is incomplete.
- The validation worktree/output roots cannot preserve prior artifacts or would
  overwrite existing S115-S119 evidence.
- A product defect is discovered. Sprint 120 is verification-only; request a
  separate corrective sprint/plan before editing.
- A release/version/package/deployment/certification command is requested; stop
  and separate that work from V0.19 closeout.
- A full host/desktop test stalls, writes outside approved roots, or requires an
  unapproved cleanup/overwrite.
- Generated runtime source differs after an approved build and no exact provenance
  review or follow-up authorization exists.
- A raw FAIL/BLOCKED/UNAVAILABLE would otherwise be silently upgraded to PASS.

## Closeout Decision Shape

The Builder recommendation may be:

- `ACCEPT/CLOSED` when all required V0.19 product rows pass and residuals are
  absent or separately acceptable;
- `ACCEPT/CLOSED WITH RECORDED RESIDUALS` when owner-authorized raw failures or
  unavailable checks do not invalidate V0.19 scope;
- `BLOCKED/OPEN` when a required contract path lacks evidence, a product gate
  fails, or the dependency/residual record cannot be reconciled.

Only a separate product-owner disposition closes V0.19. Even acceptance grants
no release, publication, package/version, deployment, installer, distribution,
or certification authority.
