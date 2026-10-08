# Sprint 064 Handoff Prompt

You are the Builder for OpenAMX Sprint 064.

## Read First

- Applicable repository instructions and `.agents/main.md` if present
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV10MasterSprintPlan.md`
- Sprint 064 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Sprint 060 contract/evidence and disposition
- Sprint 061 model/evidence and disposition
- Sprint 062 HTML/desktop evidence and disposition
- Sprint 063 PDF evidence and disposition, especially full-suite data-editor timeout, actual raster proof, and atomicity seam
- Current root README, desktop README, bundled Help JSON/UI test, `examples/kitchen-sink.amx`, measurement report/input fixtures, current renderers, and relevant root/desktop tests

## Entry Gate and Authority

Sprint 062 and 063 are each **COMPLETE / APPROVED WITH RECORDED RESIDUALS**. Sprint 064 is the integrated cross-surface acceptance/closeout sprint defined by the master plan. The approved Sprints 060-063 contracts and code are authoritative.

Sprint 063's full root suite did not pass cleanly: its parallel run had two desktop data-editor polling timeouts; the serial run had one test exceed its 500 ms poll window at 532 ms. The focused PDF set, root build and other named checks passed. Preserve this residual as unpassed. Do not alter the unrelated data-editor test/implementation to force a green result without a demonstrated V0.10 defect and explicit Lead Developer direction.

Sprint 062's security gate passed for its tested Chromium/Linux surfaces and actual Linux packaged worker resources. It did not perform native Electrobun window/install/launch, other OS/architectures/browser engines, or a formal accessibility audit. Sprint 063's raster evidence is Linux PDF evidence, not native app certification.

## Task Contract

**owns**: Integrated acceptance matrix and available-host tests; cross-surface chart behavior/visual checks; offline/security/accessibility/print/package verification; representative CLI HTML/PDF smoke; bounded end-to-end size/timing evidence; accurate current reporting docs/examples/bundled Help updates; complete Builder evidence and separate Lead Developer final V0.10 disposition request.

**must_not**: Add product features; change AMX/model/report semantics, limits, ECharts version, CSP/sandbox, PDF engine or DOCX implementation; self-accept V0.10; claim unavailable hosts/browser/accessibility/native checks; hide existing test timeouts; or publish/release artifacts.

## Execution Rules

1. Inspect the worktree before running or editing. Preserve user changes and retained outputs. Use disposable acceptance export paths.
2. Read all sprint evidence and build a criterion-to-check matrix. Preserve original statuses and distinguish focused passes, full-suite outcomes, wrappers, direct commands, packaged worker, native app, and platform results.
3. Use representative actual AMX reports through final HTML and PDF paths. Include all chart types, measurement/DateTime, groups/series, duplicate/source order, null/empty, multi-chart, full table, and static-vs-interactive state. Verify HTML/desktop and PDF behavior separately and together.
4. Measure matched chart crops at agreed dimensions using SSIM >= 0.97 and label/plot bounds within 2 CSS px where meaningful. Record tooling, crop rules and raw evidence. If this comparison is invalid/inapplicable, document why and seek Lead Developer direction on another measure; do not silently waive parity.
5. Re-run local-file/offline HTML, actual desktop preview security/navigation, keyboard/pointer/touch, print, full-table and disposal checks. Assert zero attempted requests, not only zero successful requests. Do not relax sanitizer, CSP or sandbox for test convenience.
6. Inspect actual CLI PDF rasters/text/fonts/page flow and desktop worker/RPC path. Actual archive/worker evidence is not a native Electrobun GUI run. Try a native launch only when a matching artifact/host is available and authorized; otherwise say unavailable/not performed.
7. Measure a bounded integrated workload informed by Sprint 060's 5,000-point evidence and the current 8,000,000-character HTML/32,000,000-byte worker limits. A larger representative workload is desired where feasible; do not turn its count into a product cap or change caps.
8. Run root build/full suite and scoped root/desktop suites. Reproduce/record the desktop data-editor timeout separately and do not claim it passed. Do not repair it unless a direct reproduction demonstrates a V0.10 defect and the Lead Developer directs the fix.
9. Update only current reporting docs, relevant existing examples/generated outputs, and bundled Help needed to communicate implemented behavior. Test bundled Help search/UI if content changes. Do not claim DOCX charts, unsupported OS/browser support, formal accessibility certification, legal clearance or release readiness.
10. If an integration defect is found, record exact inputs, expected contract, actual outputs, minimal reproduction and affected sprint owner. Stop before expanding product implementation and request Lead Developer authorization.
11. Write `builder-evidence.md` with criterion outcomes, exact commands/versions/hosts, totals/skips, screenshots/PDF rasters/text/font/package artifacts, visual/data measurements, docs changes and unpassed/unavailable residuals. Update planning records and request an explicit Lead Developer V0.10 disposition; never self-accept or publish.

## Closeout

The Lead Developer must separately decide final V0.10 acceptance after reviewing evidence. Sprint 064 work and its documentation do not by themselves establish release readiness, platform certification, native installer acceptance or publication.