# Sprint 071 Requirements: Integrated Acceptance and V0.11 Closeout

## Goal

Complete a requirement-to-evidence review of V0.11 reporting across CLI/desktop PDF, DOCX, standalone HTML, and desktop preview; bring reporting documentation and examples into line with verified behavior; and present all results and residuals for a separate Lead Developer disposition.

## Dependencies and Entry Gate

- The master plan lists dependencies on Sprints 067, 069, and 070. Each is ACCEPTED / CLOSED WITH RECORDED RESIDUALS in the current repository. Sprint 071 is the final planned V0.11 sprint, but those closeouts do not authorize it.
- Obtain explicit Sprint 071 implementation authorization and approval of the Builder's concrete file-by-file plan before edits to docs, examples, tests, or code.
- Sprint 071 adds no product feature scope. Do not use it to modify renderers, chart semantics, navigation security, worker limits, or prior visual thresholds.
- If any mandatory acceptance evidence is unavailable or any required behavior fails, mark that criterion BLOCKED/FAILED with evidence and owner. Do not infer success from adjacent surfaces. Obtain an explicit Lead Developer decision before claiming V0.11 closeout acceptance; a disposition must not relabel an unpassed check as passed.
- Preserve the exact pre-existing residuals listed in Sprint 067, Sprint 069, and Sprint 070 evidence unless Sprint 071 directly and explicitly closes them with the required evidence.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (integrated scope and verification authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 065 contract/feasibility evidence and all implementation artifacts/evidence for Sprints 066-070
- `src/renderer/reportPreparation.ts`, `src/renderer/narrativeModel.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/renderer/renderHtml.ts`, and `src/renderer/chartModel.ts`
- CLI and desktop export/preview flows, including desktop worker/service, host navigation action, and RPC/UI tests
- `tests/renderer.test.ts`, `tests/reportPreparation.test.ts`, `tests/reportPdf.test.ts`, `tests/reportDocx.test.ts`, `tests/reportPresentation.test.ts`, `tests/chartModel.test.ts`, CLI/example tests, and desktop worker/security/UI tests
- `README.md`, `desktop-app/src/mainview/components/help-content.json`, and `examples/kitchen-sink.amx`; use other examples only where a verified claim needs correction
- `examples/kitchen-sink.pdf` as a read-only baseline. Never generate over or modify the supplied PDF.

## In Scope

- Create an integrated requirement-to-evidence matrix spanning identical captured source/data/report inputs across CLI PDF, CLI DOCX, standalone HTML, desktop PDF/DOCX export, and desktop live preview.
- Verify cross-surface preservation of report identity and ordering, narrative/source/view separation, interpolated text, emitted table values, measurements/nulls, accessible chart alternatives, and compatible chart/table meaning.
- Inspect generated PDFs for visual layout, searchable narrative/data, fonts, page flow, page breaks, tables, charts, images, and link annotations. Use generated outputs in disposable directories; compare only against established evidence/thresholds and do not alter prior visual tolerances.
- Inspect DOCX package structure and relationships; review actual Word desktop and Word for the Web behavior. Verify native chart edit/save/close/reopen persistence in Word desktop and web display/save/download preservation followed by desktop reopening.
- Exercise the approved Word-chart mappings and truthful deferrals: bar/column, categorical and DateTime lines, numeric-X line representation, scatter, units/axes, duplicate/order/null-gap cases, no-plottable-data notices, unsupported-axis notices, mixed-group scatter deferral, and complete tables. Record the remaining Word Web null-gap visual result and formal screen-reader review; close them only with direct evidence.
- Verify standalone HTML offline rendering and desktop preview hostile-content/security behavior, including safe link activation, opaque target IDs, host revalidation/confirmation/cancellation, local path attacks, stale/forged messages, no automatic navigation/network fetches, iframe isolation, and freshness behavior.
- Exercise the actual approved Windows desktop host confirmation and OS-open path introduced in Sprint 070 where available. Distinguish injected callback/browser-harness results from native `Utils.showMessageBox`, `Utils.openExternal`, and `Utils.openPath` evidence. If native UI/action evidence is unavailable, retain the criterion as blocked and seek disposition.
- Update reporting guidance in `README.md` and desktop Help with supported Markdown, visible newline behavior, image source/containment rules, safe links, offline behavior, relative companion-file layout, and viewer limitations supported by evidence.
- Update `examples/kitchen-sink.amx` and any other relevant example descriptions/known-limitations text that contradict verified V0.11 behavior. Keep examples illustrative, not standards; do not imply a language-version change. Do not modify the supplied `examples/kitchen-sink.pdf`.
- Run focused checks first, then integrated root and desktop validation. Record exact commands, versions, counts, pass/fail/blocked/not-run status, artifacts, owners, and disposition requests.
- Preserve root/desktop tests and any pre-existing failures unless a Sprint 071 change directly causes a regression. Re-run timed-out checks in isolation when useful, without presenting an isolated pass as a full-suite pass.

## Out of Scope

- Any new report feature, Markdown construct, author setting, chart kind, chart-semantic change, language syntax/evaluation change, PDF/DOCX/HTML renderer redesign, preview protocol expansion, or broad desktop UX redesign.
- Repair of unrelated editor/help test failures, worker timing limits, the inherited desktop sandbox-count assertion, or historical V0.10 residuals unless a closeout investigation proves a Sprint 071 regression.
- Changes to previous SSIM/chart-layout thresholds, worker/output caps, dependencies/lockfiles, `allow-same-origin`, file/URL allowlists, or viewer trust policies.
- Release, publication, installer/platform certification, broad Office/browser compatibility claims, or claims beyond tested app versions and environments.

## Constraints

- Use a matrix that maps each master-plan behavior to source fixture, destination, exact test/action, artifact, status, and residual owner. A single format's evidence never stands in for another.
- Record all checks honestly as PASS, FAIL, BLOCKED/UNAVAILABLE, or NOT RUN. Keep each individual criterion separate; do not turn partial success into a gate pass.
- Current known residuals include root `tests/editor.test.ts:73` and `tests/examples.test.ts:43`; variable full-root test timeouts under parallel/serial load; desktop `rpc-contract-check.ts` sandbox-count failure; Sprint 067's missing PDF raster/viewer evidence; Sprint 069's Word Web null-gap visual and formal screen-reader evidence; Sprint 070's untested native dialog/OS opener and the inherited local-link viewer caveat. Reconfirm current status rather than copying old counts as current results.
- The Word for the Web UI exposed relative DOCX links as malformed HTTPS targets in Sprint 066/068. Do not claim Word Web local companion-link support without new valid evidence and explicit product disposition.
- DOCX chart documentation must match the accepted implementation: numeric-X OpenAMX lines use native XY scatter-with-straight-lines in Word; charts with unsupported axes, zero plottable points, or the approved mixed-group scatter case may be omitted with a clear notice and complete table; the numeric-X no-coordinate-series exception is disclosed while retaining complete table data.
- Documentation may describe only verified behavior and tested platform scope. Do not imply language syntax changes, universal Office compatibility, local link opening in every viewer, or release readiness.
- Preserve all existing user changes and untracked artifacts; generated PDFs, DOCX files, screenshots, and fixtures belong in isolated disposable locations.
