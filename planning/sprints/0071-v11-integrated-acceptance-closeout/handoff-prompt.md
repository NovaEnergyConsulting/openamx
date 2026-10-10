# Sprint 071 Handoff Prompt

You are the Builder for OpenAMX Sprint 071: V0.11 Integrated Acceptance and Closeout.

## Read First

- Applicable repository instructions and current worktree status; preserve existing edits, untracked files, and supplied artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 071 artifacts.
- Sprint 065 contract; Sprints 066-070 accepted artifacts, builder evidence, decisions, and residuals.
- Current renderer/chart/export/preview implementations and the root/desktop tests listed in the blueprint.
- `README.md`, desktop help content, `examples/kitchen-sink.amx`, and the read-only supplied `examples/kitchen-sink.pdf`.

## Authority and Scope

Sprint 071 is a no-product-feature integrated acceptance and documentation closeout. Its formal dependencies are Sprints 067, 069, and 070, which are accepted/closed with recorded residuals. Those dispositions do not authorize Sprint 071.

Before editing docs, examples, tests, or code, obtain explicit Sprint 071 authorization and approval of the concrete file-by-file plan. Do not modify product behavior. The master plan defines the evidence required across PDF, DOCX, standalone HTML, and desktop preview.

## Mandatory Boundaries

- Build and maintain a requirement-to-evidence matrix. Verify each surface directly using identical inputs where applicable; never infer a pass from adjacent formats.
- Keep failures, unavailable app/accessibility checks, timing timeouts, and not-run checks explicit with exact evidence and owners. Mandatory criteria remain blocked unless the Lead Developer makes a separate, explicit disposition of the named residual.
- Sprint 067 has no recorded PDF raster review or actual local-link viewer-open evidence.
- Sprint 069 retains a missing direct Word Web visual check for the numeric-X null-gap representation and a formal screen-reader review.
- Sprint 070 used injected callbacks and a Vite/Playwright harness; the actual Electrobun native message box and OS browser/file opener were not manually exercised.
- Inherited root failures are `tests/editor.test.ts:73` and `tests/examples.test.ts:43`; full root runs also showed timing-sensitive report-preparation/data-editor/DOCX job timeouts. Desktop `rpc-contract-check.ts` retains its sandbox-count assertion failure. Recheck current status; do not repair these unrelated residuals unless a Sprint 071 change causes them.
- Do not modify chart semantics, visual thresholds, PDF/DOCX/HTML renderer behavior, preview protocol, worker limits, dependencies/lockfiles, iframe sandbox, or the supplied PDF.
- Do not claim Word Web local companion-file support; prior Word Web evidence rewrote relative links as HTTPS. Document only verified viewer behavior.
- No release, publication, platform certification, or V0.11 completion may be inferred from Builder results.

## Task Contract

- **objective:** Produce an evidence-backed cross-surface V0.11 acceptance matrix, closeout documentation/example corrections, and a clear disposition request without adding product features.
- **owns:** `README.md`, `desktop-app/src/mainview/components/help-content.json`, only relevant example descriptions/known-limitations text, narrow integration-test corrections if proven regressions occur, planning ledgers, and Sprint 071 `builder-evidence.md`, as listed in `blueprint.md`.
- **must_not:** Change production feature behavior, chart semantics/thresholds, output caps, sandbox/security boundaries, dependencies, unrelated failures, supplied artifacts, or language/version contracts; do not claim any unpassed criterion passed.
- **acceptance:** Meet `acceptance.md`: populate the matrix, directly inspect PDF/DOCX/HTML/preview, close or accurately block the PDF visual, Word Web null-gap, screen-reader, and native dialog/OS opener residuals, correct stale documentation, and obtain a separate Lead Developer disposition.
- **verification:** Run `bun test tests\renderer.test.ts tests\reportPreparation.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts tests\reportPresentation.test.ts tests\chartModel.test.ts tests\pdfCli.test.ts tests\docxCli.test.ts`, `bun test tests\examples.test.ts`, `bun run build`, and `bun test`. From `desktop-app`, run `bun test src\bun\desktopPreviewNavigation.test.ts src\bun\jobWorker.test.ts src\bun\desktopPdfExport.test.ts src\bun\desktopDocxExport.test.ts`, `bun run typecheck`, `bun run build:web`, `bun run test`, and `bun run test:ui -- tests/ui/preview-navigation.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts tests/ui/project-explorer-paths.pw.ts`. Also perform the Word/PDF/native-host checks in `acceptance.md`; record all exact results and retries.

## Execution and Evidence

Run focused checks first, then integrated root and desktop checks. Generate outputs only in disposable locations. Capture PDF raster evidence, Word package and application evidence, screenshots for the DOCX null-gap chart in Word Web, accessibility review, and actual host confirmation/open/cancel results. Keep the supplied kitchen-sink PDF unchanged and record its before/after hash. Update README/help/example guidance only to match verified behavior; do not alter language specs. Complete the evidence matrix, update the planning ledgers, and request a separate Lead Developer disposition. If mandatory evidence is blocked, report it as blocked and do not claim V0.11 complete.
