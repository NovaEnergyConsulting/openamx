# Sprint 064 Requirements: V0.10 Cross-Surface Acceptance and Closeout

## Goal

Complete integrated acceptance of the V0.10 ECharts reporting cycle after Sprints 062 and 063 by verifying cross-surface chart meaning/appearance, offline behavior, security, accessibility, print, packaged resources, regression safety, and representative CLI/desktop workflows. Update only the relevant current reporting documentation, examples, and bundled Help content; submit a complete evidence package for a separate Lead Developer V0.10 disposition.

This is an acceptance, documentation, and closeout sprint. It adds no product feature scope and does not authorize public release, publication, installer certification, or platform support claims.

## Dependencies and Entry Gate

- Sprint 062: **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-08.
- Sprint 063: **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-08.
- Sprint 061's shared model and ECharts `6.1.0` implementation baseline is approved and integrated by the two destination sprints.
- All three Builder evidence files (Sprints 061, 062, 063), their individual Lead Developer dispositions, and the V0.10 master plan are the baseline. Preserve each prior result's exact scope/status; integrated evidence does not retroactively upgrade historical checks.
- Sprint 063's full root suite retains an unpassed desktop data-editor polling residual: 2 timeouts on the parallel full suite and 1 same-area timeout at 532 ms versus a 500 ms poll in the serial suite. It is unrelated to the PDF change and must not be called passing or repaired without a demonstrated defect and explicit direction.
- Sprint 062 verified Linux package/worker resource execution but did not perform native Electrobun window/install/launch or non-Linux/non-Chromium acceptance. Sprint 063's PDF evidence is Linux x86_64. Do not claim native/platform certification.
- The worktree must be inspected before any acceptance/doc edits; preserve user changes and keep acceptance artifacts separate from product output.

## Inputs

- `planning/plan-openamxV10MasterSprintPlan.md`, Phase 3 Sprint 064 and Verification
- Sprint 060 approved chart/security contract and evidence
- Sprint 061 model implementation/evidence/disposition
- Sprint 062 HTML/desktop security, offline, interaction, package and residual evidence/disposition
- Sprint 063 static PDF, raster/font, atomicity, test and residual evidence/disposition
- Current renderer/model, desktop preview/worker/package path, CLI export paths, documentation, examples and bundled Help Center
- Existing root, desktop, CLI, renderer/PDF, Playwright and RPC tests

## In Scope

- Run integrated behavior checks through the final Sprint 061 shared model, Sprint 062 standalone HTML/desktop preview/export path, and Sprint 063 static PDF path for all existing chart kinds and representative scalar/record, grouped/multi-series, mixed-unit, DateTime, negative/zero, duplicate/order, null/empty, and multi-chart cases.
- Verify shared meaning/theme across HTML/desktop/PDF: series/group identity and color ordering, orientation, axis/units, labels/titles/descriptions, captured order, null/empty handling, and complete table data. Measure cross-surface visual comparison using matched chart crops at agreed representative output dimensions and record clipping/overlap findings. Use the Sprint 060 proposed comparison thresholds (SSIM >= 0.97 and label/plot bounds within 2 CSS px) as the verification target unless direct measurement shows they are inapplicable; any tolerance change requires explicit Lead Developer approval.
- Verify offline standalone local-file HTML, zero attempted external requests in HTML/desktop hostile-content tests, opaque-origin `allow-scripts`-only preview isolation, and no parent/bridge/application privilege access. Preserve sanitizer, nonce/CSP and browser bundle policy.
- Verify accessible title/description/table linkage, truthful null/DateTime descriptions, complete data independent of legend/zoom state, keyboard/pointer/touch controls within existing test coverage, and usable print output for HTML/desktop; inspect PDF searchable titles/data tables and rendered chart text. Record the limits of automated checks and conduct a focused manual accessibility review on available Chromium/Linux surfaces without claiming formal certification.
- Verify actual packaged Linux worker/resource chart preview and static PDF output using existing artifacts/path where reproducible; record that this does not establish native Electrobun GUI launch/install or other hosts. Run native smoke only if an installed target/artifact and host are available and authorized; otherwise mark unavailable/not performed.
- Re-run representative CLI HTML and PDF exports (kitchen-sink and measurement-report workflows) and inspect resulting HTML/PDF output. Verify static exports do not inherit transient browser zoom/legend state and include all source data/tables.
- Establish an integrated bounded-data profile from current evidence, existing output caps, and the 5,000-point Sprint 060 measurement. Test an appropriately larger representative end-to-end dataset where feasible, recording point/row counts, number of charts, HTML chars, worker bytes, generation timings, and PDF page/raster results. This profile is evidence, not a new product limit; do not change existing caps.
- Run root build/full tests, focused report/model/PDF/CLI regressions, desktop RPC/worker/UI checks, typecheck/build, Help tests, and packaged worker checks where available. Record the Sprint 063 data-editor timeout if it recurs; do not alter unrelated data-editor behavior to make acceptance green.
- Update relevant current reporting docs, representative existing examples/generated report output where maintained, and bundled searchable Help text to describe implemented interactive HTML/desktop charts, static PDF charts, offline behavior, data tables, and honest platform/accessibility limits. Keep docs accurate and scoped; do not invent AMX syntax or claim DOCX chart improvements.
- Reconcile every acceptance criterion and earlier residual against evidence, including exact commands, host/tool versions, artifacts/screenshots, test totals, skipped/failed/unavailable checks, and reasons. Request a separate Lead Developer disposition of final V0.10 acceptance.

## Out of Scope

- Any new product feature, AMX syntax/chart type/option, chart model semantics, language/runtime behavior, or report redesign.
- Expanding renderer, desktop preview, PDF, or DOCX implementation except for a narrow acceptance defect explicitly authorized by the Lead Developer after a reproducible failure.
- DOCX chart conversion, DOCX styling, or claims of Word chart parity.
- Fixing the unrelated desktop data-editor polling timeout without proof it is a V0.10 regression and explicit direction.
- Changing HTML/worker output limits, ECharts version, PDF engine, iframe origin/sandbox capabilities, network policy, CSP, or architecture to satisfy a check without approval.
- Release version changes, packaging/publishing, signing, installer certification, Marketplace/GitHub publication, or cross-platform support certification.
- Treating previous accepted residuals, source build success, RPC tests, archive inspection, or browser automation as native GUI/platform/accessibility certification.

## Constraints

- The V0.10 master plan and individually approved Sprint 060-063 contracts remain authoritative. Do not reopen behavior absent a concrete contradiction.
- No feature code change is authorized by this closeout pack alone. For a demonstrated regression, record exact input, expected contract, actual surface/output, minimal reproduction, and affected owners; obtain Lead Developer authorization before implementation edits.
- Keep security claims specific: verify attempted requests/navigation are zero, not merely blocked; assert only `allow-scripts`, opaque origin, and denial of privileged access. Never weaken sanitizer/CSP/sandbox for test convenience.
- Separate each surface and check outcome: passed, failed, blocked, unavailable, not run, or residual. Direct commands do not upgrade wrapper results; a packaged worker is not a native app launch.
- Do not classify the known Sprint 063 timeout as a pass. Re-run it exactly and record the current result independently from focused PDF tests.
- Preserve existing 8,000,000-character HTML and 32,000,000-byte worker caps; no limit increase is authorized. A tested data envelope is evidence only, not a product cap unless separately approved.
- Visual comparisons use stable matched chart crops/geometry, not raw PDF/SVG byte equality because generated ECharts IDs vary. Do not normalize SVG identifiers with regex.
- Documentation and examples describe only verified behavior. Historical specifications remain historical unless the owner explicitly selects them for update; no unsupported DOCX, native-platform, legal, or accessibility-certificate claims.
- Only the Lead Developer may disposition final V0.10 acceptance. Builder evidence and Sprint 064 completion do not self-accept the version or authorize publication.