# Sprint 120 Handoff Prompt

You are the Builder for OpenAMX Sprint 120: V0.19 Integrated Acceptance and
Closeout.

## Read First

- Project instructions, current worktree, all user changes, V0.19 master plan,
  and every Sprint 120 package document.
- Accepted Sprint 115-119 contracts, Builder evidence, dispositions, artifacts,
  case matrices, and residuals. Reconcile exact source evidence rather than
  relying on this package's summary.
- Sprint 119 accepted residual: full VS Code host aggregate 20 pass/9 fail on
  Windows cleanup/path-case tests while V0.19 host rows pass.
- Only scripts/config/tests/source paths needed for verification and artifact
  inspection. Sprint 120 is read-only verification unless separately authorized
  corrective scope is opened.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain exact approval
  for baseline/worktree, command sequence, output roots, preservation,
  generated artifacts, retries, evidence, and cleanup before the first command.
- Verify S115-S119 dispositions and case/evidence reconciliation before S120
  tests. A PENDING/BLOCKED dependency stops execution.
- Keep all logs/artifacts in approved S120 roots and preserve prior S115-S119 and
  existing desktop/extension/test output. Do not clean shared directories.
- No production/test/spec/example/generated/package fix belongs to S120. On a
  product defect, stop and request a corrective plan; do not fold implementation
  into acceptance verification.

## Task Contract

- Run the exact 10-file master V0.19 focused root suite.
- Run the separately approved supplemental measurement/data/example/guide
  selection, then the approved broader `bun test` gate.
- Run root build/no-emit typecheck and prove generated browser runtime provenance
  with hashes/diff; never hand-edit generated output.
- Run full `vscode-extension` tests. Record aggregate and V0.19-specific grammar,
  formatting, and diagnostic cases separately. Preserve Windows failures raw.
- Run desktop typecheck and focused V0.19 Vite UI; classify harness versus native
  evidence and record unavailable native/cross-platform checks.
- Execute Example 05 and render Example 07 to HTML/PDF/DOCX. Inspect actual table
  omission/preservation, browser payload/ARIA, PDF structures/text, DOCX XML/
  tables/alt text, affine values/units, named outputs, links, and hashes.
- Reconcile every INT120 matrix row, all S115-S119 accepted cases/residuals,
  command counts/assertions, artifacts, host versions, and changed-path scope.

## Mandatory Evidence Rules

- Raw statuses are only PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN.
- A V0.19 host subtest PASS does not convert a full extension aggregate FAIL.
- A Vite harness PASS is not native desktop/platform PASS.
- A test fixture/object assertion is not final HTML/PDF/DOCX artifact inspection.
- A later owner acceptance never deletes or rewrites raw failure/unavailable
  evidence, first failures, retries, skips, or artifact hashes.
- A generated-runtime hash diff must be explained as approved source generation;
  otherwise stop for corrective review.
- Do not infer performance/capacity/platform certification from a one-host run.

## Mandatory Boundaries

- Do not implement fixes, broaden language/product scope, revise historical
  contracts, or silently update S115-S119 evidence.
- Do not run any release/package/version/publication/deployment/installer/
  distribution/Marketplace/registry/certification command.
- Do not claim package readiness, release readiness, native platform support, or
  cross-platform qualification from Sprint 120.
- Do not overwrite prior logs/artifacts or clean existing desktop/extension
  output roots.

## Verification Candidates

Execute only approved equivalents of:

```text
bun test tests/chartModel.test.ts tests/dimensions.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/renderer.test.ts tests/reportPresentation.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts
bun test tests/measurements.test.ts tests/measurementData.test.ts tests/examples.test.ts tests/numbered-guide.test.ts
bun test
bun run build
bunx tsc --noEmit
vscode-extension: bun run test
desktop-app: bun run typecheck
desktop-app: bun run test:ui -- tests/ui/v16-language-editor.pw.ts --grep "V0.19 chart visibility" --output=<approved S120 root>
git diff --check
```

Run the exact Example 05/07 commands from `verification-plan.md`. Record every
CWD, exact argument, host/tool version, count, status, output, hash, retry, and
limitation. Stop on unapproved prompts/overwrites.

## Completion

Meet `acceptance.md`, fully populate `integrated-evidence-matrix.md` and
`builder-evidence.md`, reconcile residuals and preservation, and submit a
Builder recommendation for a separate owner ACCEPTED/CLOSED, ACCEPTED/CLOSED
WITH RECORDED RESIDUALS, or BLOCKED/OPEN disposition. That disposition closes only
V0.19 scope; release, publication, package/version, deployment, installer,
distribution, and certification remain separately unauthorized.
