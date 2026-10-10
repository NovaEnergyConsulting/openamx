# Planning Questions (Sprint 002)

## V0.11 Sprint 070 Preparation (2026-10-10)

- **Resolved for planning:** Sprint 070 is the master-plan HTML Alignment and Controlled Preview Links sprint. Its formal dependency on Sprint 066 is closed; Sprints 067-069 are also closed but did not authorize Sprint 070.
- **Resolved design selection (user, 2026-10-10):** use a dedicated host navigation action that accepts an opaque target ID, resolves and revalidates the host-held target, confirms with the user, and opens it only after confirmation. Do not reuse a generic raw-path `openPath` RPC as the preview API. This is not implementation authorization.
- **Implementation gate remains open:** obtain explicit Sprint 070 authorization and approval of the concrete file-by-file plan before source/test edits. The plan must spell out the wire schema, target-map lifecycle/invalidation, genuine-click and active-frame/revision checks, confirmation UI, cancel behavior, and native open action. Owner: Lead Developer.
- **Resolved constraints:** preview iframe stays `allow-scripts` without `allow-same-origin`; only HTTP/HTTPS and the Sprint 066 local extension allowlist are permitted; standalone local links use final-output-relative paths; preview messages carry opaque identifiers only.
- **Carry-forward chart evidence:** Sprint 069 is ACCEPTED / CLOSED WITH RECORDED RESIDUALS. Word Web visual evidence for the numeric-X null-gap encoding and a formal screen-reader review remain open for integrated closeout. Sprint 070 must not change charts. Owner: Sprint 071 reviewer / Lead Developer.
- **Carry-forward root/desktop test residuals:** root `tests/editor.test.ts:73`, root `tests/examples.test.ts:43`, and desktop `desktop-app/tests/rpc-contract-check.ts:74` remain as recorded in Sprint 068/069 evidence. Recheck for new regressions; do not make unrelated repairs. Owners: Lead Developer / respective maintainers.
- **Other evidence residuals:** Sprint 067 has no PDF raster review or actual viewer-open evidence. Sprint 069 has no formal screen-reader review. Sprint 070 does not close either item. Owner: Sprint 071 reviewer / Lead Developer.

## V0.11 Sprint 069 Preparation (2026-10-10)

- **Resolved for planning:** Sprint 069 is the roadmap's Editable Native Word Charts sprint and its formal dependencies (Sprints 065, 066, and 068) are closed. Sprint 068's disposition explicitly does not authorize Sprint 069.
- **Implementation gate resolved (2026-10-10):** Lead Developer approved the concrete file-by-file plan, including the DOCX-only presentation-test amendment, and explicitly authorized Sprint 069 before source/test edits.
- **Test-plan amendment approved (2026-10-10):** add `tests/reportPresentation.test.ts` for DOCX-only assertions made obsolete by native charts and the approved no-chart notice policy. Preserve its HTML and PDF assertions.
- **Numeric-X null-gap chart-data representation resolved:** Lead Developer accepted the DOCX-only split into multiple physical Word series on 2026-10-10. Word desktop showed the expected disconnected plot and editable workbook columns; the complete accessible table retains the original rows. No shared chart semantics change.
- **Generated-report numeric-X Web visual check passed:** Word Web showed the freshly generated report as `Saved` / `Autosaved online to Documents`; direct screenshot showed continuous X ticks 0 through 30 and source-order points `[10,30,30,11]` / `[1,9,8,2]`. Its downloaded copy reopened with seven native charts in Word desktop. The earlier blank capture limitation is superseded.
- **Generated numeric-X null-gap Web visual residual:** Word desktop confirmed that the split-series native chart does not bridge the null row. Word Web was directly checked for the generated numeric-X line without a gap, but not for this split-series gap case. Owner: Sprint 069 reviewer / Lead Developer disposition.
- **Axis capacity scope implemented:** charts exceeding representable unit axes produce no chart and a clear notice plus the complete table. Generated DOCX tests and Word desktop/Web checks confirmed a two-axis chart keeps distinct units and a three-axis chart is deferred without merging units.
- **Zero-point behavior implemented for DOCX:** empty, all-null, and no-coordinate charts emit no chart plus a no-data notice and complete table. Generated package tests and Word desktop/Web evidence verified the policy.
- **Mixed-group scatter scope implemented:** a null-only group alongside plotted groups produces no chart and an unsupported-group notice plus the complete table. Generated package tests and Word desktop/Web evidence verified the policy without dropping rows.
- **Numeric-X line no-coordinate series resolved for DOCX:** if other series have plotted points, omit a series with no plottable XY coordinates (all-null Y or values only at null X) from the native XY chart, preserve every row/series column in the full table, and disclose the omission accessibly. If the whole chart has no plotted coordinates, emit no chart. Test both paths after implementation.
- **No-chart deferrals verified:** generated DOCX emitted no chart for zero-point, >2-axis, and mixed-group cases and retained complete tables; Word desktop and Web showed the notices/table alternatives. No shared/PDF/HTML semantics changed.
- **Accessibility residual:** chart alternative text and native data tables are packaged and exposed in Word Web's accessibility snapshot; no formal screen-reader audit or human sign-off has been performed.
- **Remaining root test residuals:** final `bun test` had 425 pass and only the inherited `tests/editor.test.ts:73` and `tests/examples.test.ts:43` failures. An earlier full run also saw `tests/reportPreparation.test.ts` image-timeout and desktop PDF `committing` race; both passed in isolation and did not recur in the final run. Do not repair unrelated issues.
- **Remaining desktop suite residual:** `desktop-app/tests/rpc-contract-check.ts:74` sandbox-count assertion expected two matches and found one. Focused worker/DOCX tests and typecheck pass; production worker files were not changed.
- **Sprint 069 disposition resolved:** ACCEPTED / CLOSED WITH RECORDED RESIDUALS by the Lead Developer on 2026-10-10. The Web null-gap visual and formal screen-reader review remain recorded residuals; no Sprint 071, release, publication, or V0.11 completion is implied.

## V0.11 Sprint 068 Preparation (2026-10-09)

- **Resolved for planning:** Sprint 068 is the master-plan Native DOCX Narrative, Tables, and Code sprint. Its formal upstream sprint dependency is Sprint 066, ACCEPTED / CLOSED. Sprint 067 is now also ACCEPTED / CLOSED WITH RECORDED RESIDUALS, but its closeout expressly withholds downstream authorization.
- **Implementation gate resolved before edits:** the user explicitly authorized Sprint 068 and approved the concrete file-by-file code plan before source/test edits. The separate Lead Developer disposition is **ACCEPTED / CLOSED WITH RECORDED RESIDUALS (2026-10-10)**; this does not authorize Sprints 069-071.
- **Carried root-suite residuals:** Sprint 067's `tests/editor.test.ts:73` imported `Length` declaration fact and `tests/examples.test.ts:43` V0.9 help-topic terms assertion failed, including isolated reproductions. Do not repair unless Sprint 068 changes cause a regression. Owners: Lead Developer / editor and help test maintainers.
- **Carried desktop residual:** Sprint 067's `desktop-app/tests/rpc-contract-check.ts:74` sandbox-count assertion expected two `allow-scripts` occurrences and found one. Do not alter the preview or contract test in this sprint unless a DOCX change demonstrably causes the failure. Owner: desktop contract-test maintainer.
- **DOCX link evidence:** Sprint 066 recorded that Word desktop opened one relative TXT target without a prompt, while Word for the Web exposed `https://./sprint066-companion.txt` and it was not clicked. Sprint 068 package and desktop save/reopen checks confirmed relative targets. In the Web review, Word exposed `sprint068-companion.txt` as `https://sprint068-companion.txt`; the link was not clicked. Neither web target is treated as valid local-link support. Owner: Sprint 068 Builder / Lead Developer; a separate disposition is needed before claiming web support.
- **Builder verification:** the focused root DOCX command (10 passed), root build, focused desktop worker/DOCX command, and desktop typecheck passed. The full root suite reproduced only the two recorded failures; the desktop contract suite reproduced its known sandbox-count failure. Details and actual Word observations are in Sprint 068 `builder-evidence.md`.
- **Carry forward:** Sprint 067 did not perform PDF raster review or actual local-link opening in a viewer. This remains a closeout evidence residual, not a Sprint 068 feature. Owner: Lead Developer / Sprint 071 reviewer.
- **Chart gate:** Sprint 069 remains blocked on faithful Word chart semantics/application evidence or a specific Lead Developer decision. Sprint 068 must not make chart changes or treat its completion as chart authorization.

## V0.11 Sprint 067 Preparation (2026-10-09)

- **Resolved for planning:** Sprint 067 is the V0.11 PDF Markdown Fidelity sprint from the master plan and depends on Sprint 066, which was ACCEPTED / CLOSED on 2026-10-09.
- **Resolved (2026-10-09):** the Lead Developer explicitly authorized Sprint 067 and approved the concrete file-by-file code plan before source/test edits. The separate disposition is recorded below.
- **Resolved (2026-10-09):** the Lead Developer accepted and closed Sprint 067 with the recorded verification and viewer residuals. This does not authorize Sprints 068-071; downstream authorization remains a separate Lead Developer decision.
- **Carried evidence caution:** Sprint 065's Chromium PDF viewer refused a relocated local PDF because its directory was not trusted. Sprint 067 may verify relative URI annotations and bundle relocation without bypassing viewer policy; actual link opening must be reported only if directly observed in an allowed viewer. Owner: Sprint 067 Builder / Lead Developer disposition.
- No new product-scope decision is required to prepare this pack. Keep the Sprint 065 native Word chart residuals with Sprint 069; do not reinterpret or resolve them in the PDF adapter.

## V0.11 Sprint 067 Builder Closeout Residuals (2026-10-09)

- **Root test residuals:** `tests/editor.test.ts:73` fails because the imported `Length` declaration fact is absent; `tests/examples.test.ts:43` fails while checking V0.9 help-topic terms. Both reproduce in isolated runs, are outside the changed files, and were not repaired. Owner: Lead Developer / the respective editor and help test maintainers.
- **Desktop contract residual:** `desktop-app/tests/rpc-contract-check.ts:74` expects two `sandbox="allow-scripts"` occurrences but finds one in `desktop-app/src/mainview/App.vue`. This was not changed. Owner: Lead Developer / desktop contract-test maintainer.
- **Visual/viewer evidence:** no raster screenshot or actual viewer-open test was performed. PDF.js reports relative local annotations as `unsafeUrl`; it does not establish successful local-file opening. The previously observed Chromium untrusted-folder restriction was not bypassed. Owner: Lead Developer / reviewer on an approved viewer.
- **Disposition:** Sprint 067 is ACCEPTED / CLOSED WITH RECORDED RESIDUALS. Any downstream authorization remains separate. Owner: Lead Developer.

## V0.11 Sprint 065 Disposition and Sprint 066 Entry (2026-10-09)
- Kitchen-sink PDF baseline is preserved and recorded in Sprint 065 Builder evidence. No release, publication, platform certification, or V0.11 completion is implied.

## V0.11 Sprint 066 Entry Questions (2026-10-09)

- **Resolved:** Sprint 065 is COMPLETE / APPROVED WITH RECORDED RESIDUALS; Sprint 066 is authorized for the master-plan shared Markdown/assets/link model.
- **Resolved for Sprint 066 (2026-10-09):** the user selected a 4,000,000 decoded-pixel per-image limit, alongside the accepted 4 MiB input and 4 MiB sanitized-output bounds; the Lead Developer subsequently accepted and closed Sprint 066. Existing aggregate worker caps remain unchanged.
- **Resolved for Sprint 066 (2026-10-09):** the user selected the proposed local-file hyperlink extension allowlist `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, and `.json`; the Lead Developer subsequently accepted and closed Sprint 066. This does not claim that viewer prompts or restrictions are absent.
- **Windows viewer evidence (2026-10-09):** Windows 11 Home 10.0.26300 x64; Word desktop 16.0.20430.20092, Click-to-Run channel ID `492350f6-3a01-4f97-b9c0-c7c6ddf67d60`. The reviewer confirmed a disposable relative TXT hyperlink opened without a desktop repair or link prompt. Word for the Web loaded the probe but exposed its relative target as `https://./sprint066-companion.txt`; the target was not clicked. The web app did not expose a formal version/channel. Reviewer: the user, self-identified; display name not recorded. Other local target types and Word web link opening remain unverified.
- **Chart residual carried forward:** preserve existing OpenAMX semantics and HTML/PDF meaning. The numeric-line category-spacing mismatch, more than two unit axes, null/empty cases, and Word persistence remain unresolved until direct Windows Word testing. If still irreconcilable, obtain a specific Lead Developer decision before Sprint 069; no silent coercion or image fallback.
- **Preview design resolved for Sprint 070 only:** opaque target ID plus active frame/revision binding, host mapping/revalidation, allowlist, confirmation, and stale/forged/raw-path rejection are approved as design direction. No Sprint 066 RPC/iframe change.
- **Resolved:** the Lead Developer accepted and closed Sprint 066 on 2026-10-09. This closes Sprint 066 only; no release, publication, platform certification, V0.11 completion, or additional downstream authorization is implied.

- No new product-scope question is opened by preparation. Follow `planning/plan-openamxV11MasterSprintPlan.md`; implementation-facing details and feasibility evidence are owned by Sprint 065.
- **Resolved:** Sprint 065 is COMPLETE / APPROVED WITH RECORDED RESIDUALS by Lead Developer disposition (2026-10-09). Sprint 066 is authorized for the master-plan shared Markdown/assets/link model.
- **Windows evidence recorded for Sprint 066:** the Windows host and Word desktop versions, channel ID, reviewer role, date, and relative-TXT probe actions are in `planning/sprints/0066-v11-shared-markdown-assets-links/builder-evidence.md`. Sprint 065's chart edit/save/reopen and desktop confirmation of its Word web chart download remain blocked and are not retroactively counted as passed.
- **Cross-surface chart residual:** Native chart behavior must match established OpenAMX semantics and HTML/PDF meaning. Recheck on Windows. If numeric axes, multiple unit axes, null/empty data, order, or grouping cannot be represented faithfully, stop and return a concrete case for Lead Developer decision before Sprint 069 implementation. No coercion or static-image fallback is approved.
- **Resolved image bounds:** 4 MiB source, 4,000,000 decoded pixels, and 4 MiB sanitized output per image. No worker-cap change. Sprint 066 was accepted and closed by the Lead Developer on 2026-10-09.
- **Windows local-link follow-up:** Word desktop opened the relative TXT probe without a prompt; Word for the Web exposed its relative target as `https://./sprint066-companion.txt` and it was not clicked. Final-output-relative materialization and other target types remain for destination sprints. Do not generalize or bypass viewer restrictions. Owner: Lead Developer / destination sprint reviewer.
- **Resolved preview design:** The opaque target ID/current frame+revision/host validation/allowlist/confirmation protocol is approved as design direction for Sprint 070. Sprint 066 must not change RPC, preview behavior, or iframe permissions.
- Kitchen-sink PDF baseline is preserved and recorded in Sprint 065 Builder evidence. No release, publication, platform certification, or V0.11 completion is implied.

## V0.10 Sprint 064 Closeout (2026-10-08)

- **Resolved for Sprint 064 by Lead Developer disposition:** COMPLETE / APPROVED WITH RECORDED RESIDUALS. The measured SSIM miss remains below target, the 2 CSS px bounds remain unmeasured, and the data-editor polling timeouts remain unpassed; approval records these as residuals and does not waive or reclassify them.
- Final V0.10 implementation acceptance is resolved by the separate disposition below; no release or publication authorization is recorded.

## V0.10 Sprint 064 Lead Developer Disposition (2026-10-08)

- **Resolved for Sprint 064, not for the version:** the Lead Developer approved Sprint closeout with the SSIM miss and unmeasured 2 CSS px chart bounds retained as named residuals. The threshold was not changed or waived.
- **Resolved: final V0.10 implementation status.** The Lead Developer accepted and closed the implementation with recorded residuals. The data-editor full-suite timeout remains unpassed in its parallel and isolated reproductions; serial root pass does not erase those results.
- Native stable Linux x64 window startup passed once; other OS/architectures/browser engines and formal accessibility audit remain unverified. No publication/release readiness claim is made.

## V0.10 Sprint 064 Preparation (2026-10-08)

- **Resolved by separate Lead Developer dispositions:** Sprint 062 and Sprint 063 are each COMPLETE / APPROVED WITH RECORDED RESIDUALS; Sprint 064's dependency gate is satisfied. These do not imply integrated V0.10 acceptance.
- **Unpassed full-suite residual:** Sprint 063's parallel root suite had two desktop data-editor polling timeouts; serial retry had one mapped-data diagnostic test timeout at 532 ms against the 500 ms polling window. Re-run and preserve the exact outcome; owner remains the existing test/runtime boundary unless a V0.10 reproduction proves otherwise. No unrelated fix is authorized.
- Re-measure approved cross-surface visual tolerance across HTML/desktop/PDF using matched crops and the proposed SSIM >= 0.97 / plot-label bounds <= 2 CSS px where meaningful. If inapplicable or missed, submit raw evidence and an alternative/tolerance decision for Lead Developer review.
- Carry explicit evidence gaps: no native Electrobun window/install/launch; other operating systems/architectures and browser engines not certified; no formal accessibility audit; no >5,000-point end-to-end bound; raw generated SVG IDs vary; product caps remain unchanged; no publication/release readiness.
- Sprint 064 must test standalone/offline and actual preview security, accessible data/print, PDF raster/text/fonts/page flow, package worker scope, and bounded end-to-end output. Record each target/status separately; no cross-surface result is inferred from an adjacent surface's pass.
- Current reporting docs, representative examples/output and bundled Help should describe only verified interactive HTML/desktop and static PDF behavior. Do not add language syntax, DOCX improvement claims, or platform guarantees.
- Request a separate Lead Developer final V0.10 disposition after evidence review. Sprint 064 Builder completion does not self-accept or authorize publication.

## V0.10 Sprint 063 Lead Developer Closeout (2026-10-08)

- **Resolved by Lead Developer disposition: COMPLETE / APPROVED WITH RECORDED RESIDUALS.** Sprint 063 is accepted and closed. Production static ECharts SSR, actual CLI PDF raster/font inspection, valid-chart failure/atomic preservation, desktop worker/RPC path, root build, and focused regressions are recorded in `planning/sprints/0063-v10-static-echarts-pdf-charts/builder-evidence.md`.
- Preserve one unpassed full-suite residual: the desktop data-editor mapped-data diagnostic test exceeded its fixed 500 ms job-poll window (532 ms) in the serial suite; the parallel run had two similar timeout failures. Focused PDF/CLI/presentation/model/DOCX/worker regressions pass. This is unrelated and unchanged.
- No new chart semantics, public diagnostic, engine, runtime dependency, or limit decision was made. Native desktop launch, other platforms, cross-surface tolerance, >5,000-point end-to-end behavior, and Sprint 064 integrated acceptance remain separate/unverified.

## V0.10 Sprint 063 Preparation (2026-10-08)

- **Resolved by prior Lead Developer dispositions:** Sprint 061 and Sprint 062 are COMPLETE / APPROVED WITH RECORDED RESIDUALS. Sprint 063 depends on Sprint 061 only and may proceed independently of Sprint 062; Sprint 064 still requires both integration sprints.
- **Resolved by approved architecture:** use ECharts `6.1.0` Bun SSR SVG and the shared `createChartViewModel` in the existing pdfmake pipeline. Keep PDF static, searchable, offline, and atomic; no browser-PDF architecture or DOCX chart work.
- Sprint 060's actual PDF feasibility was limited to five isolated SVG fixtures, pdfmake `0.3.11`, and Linux. Sprint 063 must inspect production model SVG and real rasterized reports, preserve the tested SVG-feature boundary, and record any unsupported construct rather than silently expanding renderer architecture.
- ECharts-generated SVG IDs differ by render. Establish semantic and raster appearance stability; do not assert PDF byte identity or normalize XML with regex. If deterministic identifiers are required beyond this evidence, document a structural solution and obtain direction before broad serialization changes.
- Sprint 060 did not expose a valid public chart-render failure seam/diagnostic. Sprint 063 should test a narrow failure path and atomic preservation; if a new public diagnostic contract is needed, record a minimal proposal and request Lead Developer direction instead of inventing a code.
- Carry Sprint 062 residuals unchanged: no native Electrobun window/install/launch or other OS/browser certification, no formal accessibility audit, no cross-surface visual tolerance, no >5,000-point end-to-end bound, and valid chart-render failure injection remains unavailable unless Sprint 063 directly resolves its PDF-specific path.

## V0.10 Sprint 062 Preparation (2026-10-07)

- **Resolved by Lead Developer disposition (2026-10-07):** Sprint 061 is COMPLETE / APPROVED WITH RECORDED RESIDUALS and closed. Sprint 062 may consume the shared `createChartViewModel` implementation and exact root ECharts `6.1.0` dependency. This is not browser, desktop, PDF, or V0.10 acceptance.
- **Open security gate carried from Sprint 060:** external link and meta-refresh content initiated navigations from an opaque script-enabled iframe despite CSP and `navigate-to 'none'`. Sprint 062 must eliminate the active navigation/resource paths and prove zero attempted requests in the actual HTML and both desktop preview frames before adding `allow-scripts`. Owner: Sprint 062 Builder; Lead Developer disposition required if containment needs scope/security changes.
- The report content policy must explicitly handle raw HTML, anchors/URL protocols, meta/base/form/frame/object/embed, remote images/styles/fonts/media, CSS/SVG references, chart labels/tooltips, and safely encoded script payloads. Preserve visible text without active external navigation; use a maintained allow-list sanitizer or request direction if no suitable solution fits Bun.
- Actual Electrobun package/resource resolution remains unavailable; a source bundle or dev preview is not package evidence. Verify the real packaged worker/resource path on available host(s), or record it blocked/unavailable.
- Carry Sprint 060 residuals accurately: inaccurate default ARIA (use Sprint 061 metadata instead), generated SVG ID variation, cross-surface tolerance and >5,000-point end-to-end envelope unmeasured, pointer/keyboard/touch behavior unverified, and public chart-render failure injection unavailable. Sprint 062 may add evidence only for its own tested behavior; Sprint 063/064 retain their ownership.

## V0.10 Sprint 062 Builder Closeout (2026-10-08)

- **Resolved by current-output reproduction and adversarial browser checks:** an authored external Markdown link generated a real request before remediation. Maintained `sanitize-html@2.17.0` allow-list removes dangerous/resource markup and makes links inert while preserving visible text. Sprint 060's meta-refresh case was a `srcdoc` injection; final checks cover refresh markup and observe request attempts in standalone and desktop preview contexts.
- **Resolved for the script permission gate:** actual standalone and sandbox-empty preview tests passed first; then an opaque test-only `allow-scripts` frame rendered generated charts, denied parent/bridge/application/storage access, and produced zero attempted requests. Only after these checks did both App.vue iframe call sites receive exactly `allow-scripts`. The actual app preview tests continue to prove zero external attempts and opaque-origin denial.
- **Resolved for destination evidence:** local `file://` Chromium rendered all four model kinds and 10 charts with networking disabled. The actual stable Electrobun archive contains the mapped Bun worker, sharp native resources and fonts; an extracted archive worker previewed an executable chart within the existing HTML cap. This is not a native Electrobun window/install/launch result.
- **Resolved for interaction/lifecycle checks:** focused browser evidence covers tooltip payload escaping, legend/table independence, numeric line wheel and drag pan, keyboard zoom/reset, touch zoom, wide/narrow rendering, print table/plot visibility, and ECharts disposal after chart removal. Formal accessibility audit, other browser engines, >5,000-point end-to-end bound, visual comparison tolerance, and valid-render failure injection remain residuals.
- **Resolved by Lead Developer disposition (2026-10-08): COMPLETE / APPROVED WITH RECORDED RESIDUALS.** Sprint 062 is closed. Its native launch/platform, non-Chromium, formal accessibility, visual-tolerance, >5,000-point, and valid render-failure gaps remain residuals in Builder evidence; they are not reported as passing. PDF chart work remains Sprint 063; cross-surface/integrated acceptance remains Sprint 064.

## V0.10 Sprint 061 Preparation (2026-10-07)

- **Resolved by Lead Developer authorization (2026-10-07):** add a narrowly scoped immutable unit/dimension metadata field to chart emissions; Sprint 061 may edit the runtime snapshot boundary and focused tests. Preserve existing normalized values and do not redo normalization. Implementation evidence is in `planning/sprints/0061-v10-shared-chart-model-openamx-theme/builder-evidence.md`.
- **Resolved by Lead Developer disposition (2026-10-07):** Sprint 061 is COMPLETE / APPROVED WITH RECORDED RESIDUALS and closed. The Sprint 060 residuals remain unpassed and retain their existing owners; this does not imply HTML/PDF/desktop integration or V0.10 acceptance.
- **Resolved by Lead Developer disposition (2026-10-07):** Sprint 060 is COMPLETE / APPROVED WITH RECORDED RESIDUALS and Sprint 061 is explicitly authorized. Use ECharts `6.1.0` at the proposed shared root dependency placement. The approval is not evidence of production integration, packaged desktop resolution, legal clearance, or final V0.10 acceptance.
- Sprint 060's approved contract resolves chart-kind orientation/order, numeric/DateTime/measurement behavior, unit axes, null/empty/group semantics, interactions, palette/accent direction, dimensions, and accessibility requirements. Implement those decisions; do not reopen semantics absent a concrete contradiction.
- Keep the Sprint 060 external-link/meta-refresh network-navigation failure open for the later script-enabled preview integration gate. Production iframe scripts remain disabled; CSP plus opaque origin alone did not prevent navigation.
- Preserve the other named residuals: actual Electrobun package/resource resolution unavailable; inaccurate default ECharts ARIA for null/DateTime; generated SVG IDs vary; cross-surface tolerance and >5,000-point end-to-end behavior unmeasured; pointer/keyboard/touch and public render-failure injection unavailable. Record any direct Sprint 061 evidence separately without retroactively promoting earlier statuses.
- If code reveals the captured `ChartViewEmission` or measurement representation cannot satisfy an approved rule without changing runtime semantics or scope, record a minimal repro and request Lead Developer direction. Otherwise proceed with a typed, pure model and deterministic theme.

## V0.10 Sprint 060 Gate Disposition and Residuals (2026-10-07)

- **Resolved by Lead Developer disposition (2026-10-07):** all Sprint 060 contract and architecture proposals are approved; Sprint 060 is COMPLETE / APPROVED WITH RECORDED RESIDUALS; Sprint 061 is explicitly authorized but has not started.
- Follow-up residuals remain: untrusted link/meta-refresh navigation attempts; inaccurate default ECharts ARIA for null/DateTime; actual Electrobun packaged-resource test unavailable; raw SVG ID churn; no cross-surface visual metric; only a 5,000-point evidence envelope; pointer/keyboard/touch behavior not tested; no public valid-render failure injection/diagnostic. Retain these exact statuses. Production iframe scripts must not be enabled until untrusted navigation is prevented and tested.
- Product limits, legal conclusions, cross-platform support, release readiness, and V0.10 implementation completion are not approved or claimed by this disposition.

## V0.10 Sprint 060 Preparation (2026-10-07)

- The V0.10 master plan resolves product scope but leaves implementation-facing chart, interaction, visual, packaging, and security detail to Sprint 060. Complete the Sprint 060 decision register with evidence-backed proposals; do not treat this preparation as approval.
- Which exact ECharts release and package placement can satisfy Bun SVG, browser-local standalone HTML, pdfmake, and desktop packaged-runtime needs while meeting license/notice and size constraints? Owner: Sprint 060 Builder; disposition: Lead Developer.
- Can ECharts SVG render reliably in the existing pdfmake pipeline and packaged desktop environments, including required fonts, labels, null states, and offline resources? If not, document alternatives and request explicit architecture/scope direction before implementation.
- What exact behavior is correct for all existing chart kinds, DateTime/measurement axes, independently normalized units, null/empty/grouped data, and per-kind interactions while preserving existing AMX semantics? Owner: Sprint 060 Builder proposal; Lead Developer approval required for any unresolved semantic choice.
- What isolated iframe/bootstrap/resource policy supports required interactions while denying report-authored execution, parent/application/bridge access, and unapproved network? Require adversarial evidence before enabling any script permission.
- What representative data/output bounds and measurable HTML/PDF comparison tolerances are justified by current limits and evidence? Propose values in the contract; no product-limit change is authorized here.
- Sprint 060 has no sprint dependency. Its gate remains open until the Lead Developer explicitly approves or keeps it blocked; Sprint 061 is not authorized by Builder completion alone.

## V0.9 Sprint 059 Builder Closeout (2026-10-07)

- **Resolved by tokenizer regression:** unterminated AMX strings/interpolations previously kept TextMate rules active across Markdown fences. End-of-line recovery now unwinds those rules; malformed strings, nested braces, exact fence lengths, following inert fences, and narrative interpolation boundaries pass actual tokenization tests. No language/runtime semantics changed.
- The Hutch wrapper retry stalled at 510 seconds; direct typecheck/build/resource equivalents passed independently. The wrapper and direct statuses are kept separate in Builder evidence.
- Request a separate final V0.9 disposition, including the repeated Hutch wrapper stall and historical Windows residuals. Sprint 059 Builder evidence is not self-acceptance.

## V0.9 Sprint 059 Preparation (2026-10-07)

- **Resolved by Sprint 058 disposition:** Sprint 059 follows Sprint 058 **COMPLETE / APPROVED** and owns only final verification/acceptance closeout. Sprint 058's actual TextMate tokenization and Hutch wrapper checks remain accepted, unpassed verification residuals.
- No new language/business-rule question is open. Keep the approved V0.9 contract and Sprint 051 technical appendix authoritative; do not introduce feature work under the closeout sprint.
- Builder should use an available TextMate-compatible tokenizer or justify a minimal test-only dependency; it must exercise the actual grammar. Make one bounded Hutch wrapper attempt and report wrapper and direct command outcomes distinctly.
- Preserve the Sprint 053/054/057 Windows results separately. If a new concrete functional defect or a blocker to required verification appears, record the exact reproduction and request Lead Developer direction. Final V0.9 acceptance remains a separate explicit Lead Developer disposition.

## V0.9 Sprint 058 Builder Closeout (2026-10-07)

- **Resolved by focused editor evidence:** shared completion lacked the V0.9 `dimension` and `unit` keywords; the VS Code TextMate keyword rule also omitted them. Both are corrected and covered. Rename now rejects those keywords. Shared and Extension Host checks prove imported dimension/unit declarations resolve to declaring-module ranges, references, hover, and unit rename.
- **Resolved by example execution:** the positive V0.9 report fixture uses a module-owned measurement type/function, JSON `{value, unit}` input, conversion and explicit rounding, JSON output, narrative display, a measurement table, and a chart. CLI run/render and its example regression pass.
- **Accepted verification residual:** a TextMate grammar tokenizer was not installed/available in this workspace. The host test inspects the actual grammar rule and executable/inert fence definitions, but does not execute TextMate tokenization; this remains unpassed.
- **Accepted verification residual:** `bun run --cwd desktop-app typecheck` and `build:web` did not get past `hutch electrobun prepare`, which waited idle for 7m47s and was stopped. Direct `vue-tsc`, Vite production build, Bun worker build, and runtime-resource copy scripts passed; the wrapped checks remain unpassed.
- Final root build passed; root suite passed 377 tests with 2 Windows-only skips and 0 failures; Linux VS Code host passed 22 tests. Keep the Sprint 053/054/057 Windows results as separate, unpassed historical findings; this Linux run did not rerun those hosts. Full results are in [Sprint 058 Builder evidence](sprints/0058-v09-editor-parity-documentation-acceptance/builder-evidence.md).
- **Lead Developer disposition (2026-10-07): COMPLETE / APPROVED.** The Lead Developer accepts Sprint 058 as complete with the above verification residuals recorded. The Builder's root/available-host results and historical Windows findings retain their exact pass/fail status. This does not claim final V0.9 acceptance or native/platform certification.

## V0.9 Sprint 058 Preparation (2026-10-07)

- **Resolved by prior Lead Developer dispositions:** Sprint 053, Sprint 054, and Sprint 057 satisfy Sprint 058's dependency gate. Their Windows VS Code host/desktop RPC findings remain separate, unpassed residuals in their respective evidence; Sprint 058 does not presume those checks passed.
- No new V0.9 business-rule decision is open for Sprint 058 preparation. Follow the approved `docs/language-spec-v0.9.md`, Sprint 051 technical appendix, and master plan. Editor differences are handled by verifying/fixing only capabilities each client already supports.
- If the Builder finds a concrete implementation/specification conflict or a platform residual blocks a required behavior check, record the minimal reproduction, expected contract, actual result, and affected surface here. Obtain Lead Developer direction before changing approved semantics; otherwise proceed with the bounded scope and report the residual.
- Builder evidence and a separate Lead Developer disposition remain required. Sprint preparation does not claim integrated acceptance or V0.9 completion.

## V0.9 Sprint 057 Preparation (2026-10-06)

- **Resolved by Sprint 056 disposition:** Sprint 057 may proceed using the approved measurement runtime values and Sprint 055 registry. Sprint 056 is COMPLETE / APPROVED; its Windows Extension Development Host run (15 pass/5 fail) and unrelated full-worktree whitespace finding remain unpassed residuals.
- The approved Sprint 051 contract resolves JSON/CSV shapes, restricted external unit syntax, diagnostics/locations, schema inspection, chart normalization/labels, and renderer-specific empty/null behavior. No other new business-rule decision is open for Sprint 057.
- If implementation exposes an actual conflict in the approved data/report contract, record a minimal reproducible case here and request Lead Developer direction before changing behavior. The Builder must separately record actual results and request disposition.
- **Resolved by Lead Developer direction (2026-10-06):** for the record-backed empty-chart case below, align PDF table widths with the existing heading count so the approved output (no chart SVG plus a header-only data table) is produced. The Builder applied the narrow width fix and verified the empty/all-null report cases; this decision is not a Sprint 057 disposition. Focused reproduction: an empty `bar(rows)` where `rows: Row[]` and `Row` has a category plus one series field, then `preparePdfReport` and `serializePdfReport`. Before the fix, pdfmake threw in `DocMeasure.measureTable` because `c._minWidth` was undefined.
- **Lead Developer acceptance finding (2026-10-07), resolved by Lead Developer direction:** `types/nameplate.amx` exports `dimension ApparentPower`, `unit MVA: ApparentPower`, and `type NameplateData { PowerRating_MVA: ApparentPower, ... }`. The report imports only `{NameplateData}` and declares `input nameplateData: NameplateData[]` from CSV cells such as `75 MVA`. Loading failed with `AMX4003 CSV records may contain only scalar fields`, because record field annotations were resolved against the entry module's dimensions. This is not scheduled for a later sprint (Sprint 057 owns JSON/CSV contracts and unit validation), so it was fixed in Sprint 057. Direction: imported record fields resolve their dimension, and external unit text, against the units visible in the module that **declares the record type**; the report needs no extra import.
- The same acceptance run exposed two coupled defects, now also fixed in Sprint 057:
  - Narrative `{{transformer.PowerRating_MVA}}` rendered `[object Object]` instead of `value unit`.
  - An imported function with a dimension-typed parameter or return failed with `AMX3001 Unknown type` when called from a module that does not import the dimension. This one is Sprint 056-owned; the Lead Developer approved fixing it in Sprint 057 with a regression test.
- **Resolved by Lead Developer disposition (2026-10-07): COMPLETE / APPROVED.** The Lead Developer re-tested the acceptance scenario and accepted Sprint 057 as complete. The desktop RPC Windows path-separator assertion and the Windows extension-host result (15 pass/5 fail) remain unpassed residuals, documented in [Sprint 057 Builder evidence](sprints/0057-v09-measurement-data-reporting-integration/builder-evidence.md).

## V0.9 Sprint 056 Preparation (2026-10-06)

- **Resolved by Sprint 055 disposition:** Sprint 056 may proceed using its approved metadata registry. Sprint 055 is COMPLETE / APPROVED; its Windows Extension Development Host result (15 pass/5 fail) remains unpassed.
- **Resolved by Sprint 053 disposition:** Sprint 053 measurement-to-string behavior was deferred to Sprint 056. The approved text form is displayed numeric value followed by the selected unit text; existing scalar conversion and narrative interpolation remain unchanged.
- No new business-rule decision is open for Sprint 056 preparation. Follow the approved Sprint 051 measurement precedence, arithmetic, scale/canonicalization, aggregate, domain, and diagnostic rules. If implementation uncovers a conflict, record a minimal case and request Lead Developer direction before changing behavior.

## V0.9 Sprint 056 Builder Closeout (2026-10-06)

- Builder implementation followed the approved Sprint 051 semantics and Sprint 055 registry without identifying a contract conflict requiring changed behavior. No new semantic question is being proposed.
- **Resolved by Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The Lead Developer accepted Sprint 056 as complete. The Windows extension-host result remains unpassed (isolated run 15 pass/5 fail), and the unrelated full-worktree diff-check residual remains documented in [Sprint 056 Builder evidence](sprints/0056-v09-measurement-expressions-arithmetic-conversion/builder-evidence.md).

## V0.9 Sprint 055 Builder Closeout (2026-10-06)

- **Resolved by Sprint 052 disposition:** Sprint 055 may proceed. Sprint 052 is ACCEPTED WITH RECORDED RESIDUALS. Sprint 053 is accepted and Sprint 054 is COMPLETE / APPROVED; neither is a dependency. Existing Windows extension/desktop test failures remain unpassed.
- The approved Sprint 051 blueprint resolves identity, vectors, unit scales, source order, explicit imports/exports, the exact SI inventory, diagnostics, and registry constraints. No new business-rule decision is open for Sprint 055 preparation.
- **Resolved by Lead Developer direction (2026-10-06):** implement explicit dimension/unit re-exports as `export { Name, ... }`, preserving imported declaration identity.
- Builder found no remaining contract conflict; metadata-only registry construction and canonical identity are implemented and verified. **Resolved by Lead Developer disposition (2026-10-06): Sprint 055 is COMPLETE / APPROVED.** The Lead Developer verified the evidence; the Windows extension-host failures remain recorded as unpassed residuals.

## V0.9 Sprint 054 Preparation (2026-10-06)

- **Resolved by prior disposition:** Sprint 052 is ACCEPTED WITH RECORDED RESIDUALS; Sprint 054 may proceed. Sprint 053 is ACCEPTED but is not a dependency; its Windows Extension Development Host result remains unpassed (13 pass, 6 fail).
- The approved Sprint 051 list contract resolves indexing, insertion/removal semantics, diagnostics, static/runtime checks, alias/import protection, loop snapshots, and view isolation. No additional business-rule decision is open for Sprint 054 preparation.
- Builder implementation found no conflict or gap requiring a semantic decision. Validation residuals are environmental Windows host/path failures, recorded without changing the approved contract; see `planning/sprints/0054-v09-one-based-list-access-safe-mutation/builder-evidence.md`.
- **Resolved by Lead Developer disposition (2026-10-06):** Sprint 054 is COMPLETE / APPROVED. The Windows desktop RPC and VS Code host failures remain documented, unpassed platform residuals.
- If implementation exposes a conflict or gap in the approved list contract, record the exact source/operation and expected alternatives here and obtain Lead Developer direction before changing behavior.

## V0.9 Sprint 053 Preparation (2026-10-06)

- **Resolved by Lead Developer disposition:** Sprint 052 is ACCEPTED WITH RECORDED RESIDUALS; Sprint 053 may proceed. Its five Windows VS Code Development Host failures are preserved as unpassed residuals, not silently waived as passes.
- No new business-rule decision is required for Sprint 053 preparation. The approved string contract and Sprint 051 precedence/diagnostic decisions govern escapes, interpolation, conversion, and source mapping.
- Coordinate measurement-to-string verification with Sprint 056, when measurement values exist. If interpolation integration reveals a scope ambiguity or requires a semantic change, add the precise case here and request Lead Developer direction before proceeding with that change.

## V0.9 Sprint 053 Builder Closeout (2026-10-06)

- No new semantic question remained after implementation; the approved finite escapes, double-quote-only interpolation, scalar conversion, diagnostics, and narrative isolation rules were applied as written.
- Measurement-to-string output remains deferred to Sprint 056; Sprint 053 did not invent measurement runtime semantics.
- The extension host rerun is still not green on Windows (13 pass, 6 fail: five `EBUSY` cleanup failures and one path-case assertion). Sprint 052's accepted five-failure residual remains intact; the current result is reported separately in [Sprint 053 Builder evidence](sprints/0053-v09-string-escapes-expression-interpolation/builder-evidence.md).
- **Resolved by Lead Developer disposition (2026-10-06): Sprint 053 ACCEPTED and approved for closure.** The Windows VS Code Development Host result remains an unpassed residual; measurement-to-string verification remains with Sprint 056. No unresolved behavior question remains for Sprint 053.

## V0.9 Sprint 052 Lead Developer Disposition (2026-10-06)

- **Resolved by explicit Lead Developer disposition (2026-10-06): ACCEPTED WITH RECORDED RESIDUALS.** Accept Sprint 052 with the Builder evidence and the Windows VS Code Development Host residual below. This disposition does not claim the host suite passed or accept downstream V0.9 work.
- The extension script compiles the extension and host tests successfully, but its Windows Development Host run reports 14 passing tests and five failures: four `EBUSY` temp-directory cleanup errors and one path-case assertion. Keep those failures visible in `builder-evidence.md`.
- No ambiguity in the approved language contract was found. Any future behavior or scope change still requires a new Lead Developer decision.

## V0.9 Sprint 052 Preparation (2026-10-06)

- **Resolved by Sprint 051 approval:** Sprint 052 may begin; the contract gate is CLOSED / APPROVED. Strict checking, valid unannotated inference, constructor `=`/colon rejection, multiline nesting, diagnostics, and compatibility boundaries are specified by the approved language contract and Sprint 051 blueprint.
- No new business-rule decision is required for Sprint 052 preparation. If implementation reveals an ambiguity or a behavior change beyond the approved contract, record the concrete case here and request Lead Developer direction before changing the contract.
- Builder to report any supported checking entry point that cannot be made unconditional within this sprint's scope as a blocker; do not silently leave a bypass or defer it without disposition.

## V0.9 Sprint 051 Technical Contract Gate (2026-10-06)

- **Resolved by explicit Lead Developer approval (2026-10-06): precedence.** The exact grouping, precedence/associativity table, attachment/conversion/indexing examples, malformed cases, and loop `in` distinction in the Sprint 051 blueprint are approved.
- **Resolved by explicit Lead Developer approval (2026-10-06): dimension identity and canonicalization.** Qualified module/declaration identity, structural vectors, scale/conversion/cancellation behavior, canonical compound serialization, and external-unit round trips in the blueprint are approved.
- **Resolved by explicit Lead Developer approval (2026-10-06): SI library.** The complete enumerated inventory, exact names/definitions/aliases, project-local `./libraries/si.amx` placement and imports, export syntax, and stated exclusions in the blueprint are approved.
- **Resolved by explicit Lead Developer approval (2026-10-06): aggregates and views.** The aggregate/math examples, display-unit rules, typed empty sum, empty `min`/`max`/`mean` errors, chart labels, and existing HTML/PDF/DOCX empty/all-null behavior documented in the blueprint are approved.
- **Resolved by explicit Lead Developer approval (2026-10-06): static/runtime boundary.** The syntax-directed safe constant subset and runtime ownership of dynamic values/lengths, with no arbitrary execution during analysis, are approved.
- **Resolved by explicit Lead Developer approval (2026-10-06): diagnostics.** The proposed `AMX3006`–`AMX3010`, `AMX1008`–`AMX1009`, and `AMX4004`–`AMX4005` allocations, messages/categories and location payload expectations in the blueprint are approved; existing code meanings remain unchanged.
- **Resolved by explicit Lead Developer approval (2026-10-06): compatibility and handoff.** The conformance/migration cases, cross-surface ownership/test seams, and Sprint 052–058 dependency sequence in the blueprint are approved. Existing requirements in the V0.9 contract/master plan remain authoritative.
- **Disposition:** The Lead Developer approved the Builder Contract Proposal in the Sprint 051 `blueprint.md` on 2026-10-06. The Sprint 051 technical contract gate is closed. This approval authorizes the approved design as the implementation contract, not implementation completion; subsequent sprints remain subject to their documented dependencies and scope.
- No unresolved Sprint 051 technical gate question remains. Any later request that would change the approved V0.9 scope must be raised as a new Lead Developer decision before implementation.

## V0.8 Sprint 050 Builder Closeout (2026-10-04)

- **Resolved by fixture evidence:** disposable versions `0.6.1` and `0.6.2` collect independently at distinct full fixture commits. Identical and conflicting same-version collection attempts are refused; accepted assembly bytes and source manifests remain unchanged. Stale-version, mixed-commit, incomplete transfer, unsafe/corrupt/duplicate inputs, mocked publication retries, and the no-credentials path are covered by `tests/release.test.ts`.
- **Resolved by Lead Developer disposition:** Sprint 049 is COMPLETE WITH RECORDED RESIDUALS and Sprint 050 is COMPLETE WITH RECORDED RESIDUALS. The user reports all features tested and satisfactory; this satisfies the sprint closeout gate without upgrading Builder work to acceptance retroactively.
- **Accepted residual for sprint closure:** no fresh matching production release build/collection or separately authorized unused version/destination was available. Preserve the existing 0.8.0 output and do not combine mismatched commits. This is not a release artifact or publication-readiness claim.
- **Accepted residual for sprint closure:** Marketplace metadata for the dual-license offer and third-party notice requirements remain unconfirmed by the license owner. Production verification/publication remains blocked until confirmed.
- **Accepted residual for sprint closure:** no injected filesystem failure after local assembly staging began. Incomplete transferred bundles are rejected before output mutation; remote interrupted-upload/retry behavior is mock-tested.
- **Accepted native-evidence residual:** the Lead Developer reports feature testing satisfactory, but no new Sprint 050 installer/host/step matrix was recorded. Sprint 048's report remains separately attributed and the other five requested targets remain unverified.

## V0.8 Sprint 050 Closeout Resolution (2026-10-04)

- Sprint 049's required Lead Developer disposition is recorded as COMPLETE WITH RECORDED RESIDUALS in its Builder evidence; the Sprint 050 dependency gate is closed.
- The current production release exercise is accepted as a named residual because a fresh matching commit/version and absent accepted destination were unavailable. The retained 0.8.0 target is preserved byte-for-byte; fixture results are not represented as matching production artifacts.
- License and notice readiness is accepted as a Sprint 050 closeout residual only. The extension metadata/notices require owner confirmation before `release:verify` or publication readiness can pass.
- No real GitHub release was selected; tests remained mocked. Marketplace upload remains manual and was not attempted.
- The Lead Developer's feature acceptance is recorded without inferring exact host/session steps, a new native install/launch result, or target support beyond existing evidence.
- The un-injected local assembly staging-failure path is accepted as a residual for this sprint; no follow-up test is required for Sprint 050 closeout.
- Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified as native targets and are accepted residuals for this sprint.

## V0.8 Sprint 049 Accepted Residuals (2026-10-04)

- **Verified package evidence:** the supplied AGPLv3 file is included in the 8-file VSIX and the archive is platform-neutral by contents. This does not establish Marketplace acceptance for the dual-license offer.
- **Accepted license/notices residual:** owner confirmation of Marketplace metadata and whether third-party notices are required remains unresolved. No legal terms/notices were authored. Production `release:verify` and publication readiness remain blocked until resolved.
- **Verified fixture behavior:** collection validates versions, full commits, exact files, hashes, sidecars, and safe archive paths; mock-only publication coverage includes tags, partial acknowledgement, authentication, conflict, interrupted upload, retries, and additions.
- **Accepted production-assembly residual:** the retained desktop target and extension candidate have different source provenance; no real matching extension bundle/assembly was produced. Preserve the 0.8.0 desktop bundle unchanged; never force the mismatch.
- **Accepted publication/target residual:** no public GitHub release or Marketplace upload occurred. Marketplace remains manual; five desktop targets remain unverified, not unsupported.

## V0.8 Sprint 048 Desktop Packaging Questions (2026-10-03)

- **Resolved for installer feasibility:** Hutch `0.27.1` with exact Electrobun `2.0.1` and `hutch electrobun build --env=stable` produced a fresh Linux x64 `.tar.gz` Setup installer plus update metadata/archive. No extra installer tool or format substitution was required. Build evidence is from detached clean commit `91682f150a491aee7ff3c0c8320555b6c594d449`; it is feasibility evidence, not a publishable artifact for the active source changes.
- **Resolved for Sprint 048 approval by Lead Developer direction (2026-10-04):** the Lead Developer reports using the latest correct installer and confirms that the application launches and works correctly. Record this as Lead Developer-reported native-host acceptance. Exact OS/session, sample-preview actions, close/uninstall, and user-data behavior were not supplied; the Builder did not independently repeat those checks. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified.
- **Packaging failure/correction retained:** the 0.6.0 Setup installer failed because Electrobun's bundled USTAR parser rejected a PAX LongLink for a long GLib development header. Commit `0c05a42` omits that unused header and adds a long-path guard. The 0.6.0 target remains retained and unchanged; 0.8.0 is the approved built target.
- **Partially resolved for tested Linux only:** host is Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`. The installed native wrapper requires system WebKitGTK 4.1, GTK/GLib, and related graphics/media libraries. This establishes neither minimum OS nor universal Linux support. Other Linux distributions and unsigned-warning behavior remain unverified.
- Can the existing stable packaging chain produce the approved native installer formats for each other requested target, and which architectures are known supported, unavailable, or confirmed unsupported? Owner: Sprint 048 Builder / Lead Developer with access to native hosts. Remote targets remain `unverified` without direct/toolchain evidence; any format/toolchain substitution needs explicit approval.
- What actual native install/launch/uninstall behavior can be evidenced on this host, including whether application data and user documents survive uninstall? Owner: Sprint 048 Builder. Browser or mock checks are not substitutes.
- **Historical sequencing resolution (2026-10-03):** Sprint 047 was dispositioned COMPLETE WITH RECORDED RESIDUALS and Sprint 048 was authorized to proceed. At that checkpoint, remote target builds and native install/launch were unverified. The later 2026-10-04 Sprint 048 COMPLETE / APPROVED disposition records the Lead Developer's successful latest-installer report for the tested host; remote target status remains unverified.

## V0.8 Sprint 047 Builder Findings and Open Items (2026-10-03)

- **Resolved by source audit:** the root, desktop, and extension Bun lockfiles contain workspace names and dependency resolutions but no `0.6.0` package-version field. They are unchanged; no frozen-lock validation is applicable to Sprint 047. No dependency churn was introduced.
- **Observed, not certified:** this host is Linux x86_64 with Bun `1.4.2`, Node `v24.14.1`, Hutch `0.27.1`, and an extension-local `vsce` executable. Preflight checks executable availability and `--version`; the existence of those tools does not establish any installer format or native installation behavior.
- **Resolved mapping, open capability:** project/native OS mappings are Linux/Linux, Windows/Win, macOS/Mac; x64 and arm64 map directly. Current Linux x64 can be reported available only when consistency, identity and prerequisites pass. Remote targets remain unverified; no official installer/toolchain evidence was used to mark any target unsupported.
- Which installer formats can Hutch/Electrobun produce on Linux x64/arm64, Windows x64/arm64 and macOS x64/arm64, and what exact native libraries/webview runtime must an installed app provide? Owner: Sprint 048; obtain official toolchain evidence and native artifact/install observations. Request approval before any required migration or contract expansion.
- Does the supplied `LICENSE.md` require package metadata or dependency notices beyond later-sprint inspection? Owner: Sprint 049; interpret actual supplied terms and Marketplace/package requirements there. Sprint 047 makes no legal or publication-readiness claim.

## V0.8 Sprint 047 Contract and Preflight Questions (2026-10-03)

- Which native installer formats and exact host prerequisites can the existing Hutch/Electrobun chain produce on each available host/architecture? Sprint 047 should document only evidence-backed feasibility; Sprint 048 selects formats and implements packaging. Unavailable native hosts remain `unverified`, not assumed unsupported.
- Which fields in the three Bun lockfiles are truly tied to package versions, and can version preparation leave them untouched? Inspect before deciding; update only metadata required to preserve frozen installs.
- What exact native-tool conventions map from project targets (`linux`, `windows`, `macos` + `x64`/`arm64`), and which are available or confirmed unsupported on this host? Record source/documentation or experiment for each conclusion.
- Which desktop runtime/resource requirements are carried into a packaged app by the current worker and web asset configuration, and which remain to be proven by Sprint 048 artifact inspection and native install/launch checks?
- The repository contains `LICENSE.md`; what actual metadata, dependency-notice, and packaging requirements follow from its supplied terms? Sprint 047 does not interpret or modify legal terms. Sprint 049 must inspect actual packaging/Marketplace requirements and report readiness accurately.

## V0.7 Sprint 046 Entry and Implementation Questions (2026-10-03)

- **Resolved for Sprint 046 sequencing by Lead Developer direction (2026-10-03):** Sprint 044 is COMPLETE WITH RESIDUALS; Sprint 046 is explicitly authorized to proceed with Sprint 045's residuals. Sprint 045's Lead Developer acceptance disposition remains pending. Native Electrobun/window behavior, actual app restart, and formal accessibility remain unverified and are not upgraded by this authorization.
- **Resolved by build and browser evidence:** the production Vite bundle contains Help topic/search/footer strings from the statically imported JSON module; the browser observes no external-origin requests while using the Help Center. No runtime filesystem/network loader was added.
- **Resolved by browser regression:** all nine stable IDs and each original search-term string remain present/effective; default `getting-started`, valid `language`, command-routed `release-notes`, and unknown-ID fallback are verified.
- **Resolved by browser geometry checks:** the frame remains 80% at 1024x720 and 1440x900, bounded within the viewport, with fixed header/search/footer and independently scrolling body; filtering to different result counts does not change bounds or chrome positions.
- **Evidence boundary recorded:** integrated Sprint 044-046 acceptance is browser automation against production `App.vue` mounted in the Vite fixture. Native Electrobun, native resize/restart, cross-platform, and formal accessibility observations were unavailable/not performed; do not claim them as passed. See [Sprint 046 Builder evidence](sprints/0046-v07-help-center-integrated-acceptance/builder-evidence.md).

## V0.7 Sprint 045 Implementation Questions (2026-10-03)

- **Resolved by Builder browser evidence:** at 820x720, intrinsic adaptive pane minimums under the min-height-only shell expanded the document to 3,053 px. The viewport-bound shell and shrinkable tracks keep the document bounded at 1024x720, 1440x900, and adaptive 820x720; explorer, CodeMirror, preview iframe content, and runtime drawer scroll independently.
- **Resolved by Builder browser evidence:** global wrapping defaults on when the local value is absent, applies across two AMX documents, toggles without editor recreation, persists through browser reload, and does not change source text. Actual native app restart was not tested; no project/source setting is used.
- **Resolved by Builder browser evidence:** all listed runtime text categories and idle/running/success/failure/stale/cancelled state samples pass the 4.5:1 computed contrast threshold against both explicit light and dark drawer surfaces. This is not formal accessibility certification.
- Can direct native Electrobun visual evidence be obtained for this sprint? Owner: Lead Developer/native acceptance. Browser screenshots are required supporting evidence but must not be described as native proof if the host is unavailable.

## V0.7 Sprint 044 Investigation Questions (2026-10-03)

- **Resolved: autosave/disk-hash hypothesis confirmed.** A deterministic source-dependent preview result held until autosave completed was rejected as `superseded` before the fix despite unchanged request identity/revision. The trusted current hash for a clean open AMX source is now used; captured hashes remain for dirty overlays and non-AMX sources. See [Sprint 044 Builder evidence](sprints/0044-v07-preview-freshness-ui-test-foundation/builder-evidence.md).
- **Resolved: controlling condition identified.** `jobIsCurrent()` compared all captured source disk hashes unconditionally; conflict-safe autosave changed the active AMX file's hash after the request had captured it. UI scheduling remained at 400 ms, and the browser test confirms current iframe publication and stale-last-good presentation.
- **Resolved: harness is compatible but required a maintained runner.** The existing fixture mounts production `App.vue`; its original synchronous constant-output mock could not represent the required delayed autosave race. Added test-only Playwright coverage using the Vite fixture and pinned Chromium; frozen-lock install and focused UI test pass.
- **Residual / open evidence boundary:** no direct Electrobun IPC/native-window run was performed. The service delayed-worker case and browser UI harness validate adjacent boundaries independently; they do not certify native integrated timing or platform behavior. Owner: Lead Developer/native acceptance; close only with actual supported-host observation if required.
- Preserved constraints: 400 ms default debounce (500 ms maximum), pause suppresses automatic refresh, manual refresh remains available, obsolete identities remain rejected, and invalid/stale input retains the last-good preview.

## V0.6 Sprint 043 Closeout (2026-10-03)

- **Resolved by Lead Developer direction:** the Lead Developer reports completing end-to-end testing of the integrated desktop app, accepts all listed Sprint 043 residuals/gaps as closed for V0.6, marks Sprint 043 and V0.6 complete, and approves V0.6 for release with accepted exceptions. No additional Sprint 043 work remains.
- Repeatable integrated fixture artifacts, mounted-grid cancellation/supersession, background-task long-task measurement, complete visual/keyboard/focus-state evidence, native platform/Hutch, broad Office, license/Marketplace, report-mobile overflow, VS Code apply-time safety, and formal accessibility remain unverified where noted. The disposition accepts these as exceptions; it does not report them as passed. Further work belongs in [V0.7 requirements](requirements-openamxV07.md).
- Root, desktop/Electrobun, and VS Code extension package metadata are aligned to `0.6.0`. Release approval is not publication or native certification.

## V0.6 Sprint 043 Performance Decision (2026-10-03)

- **Resolved by explicit user direction:** current 100,000-row table performance is acceptable. The 3-second first-viewport and 100-ms grid-task criteria are qualitative evidence, not hard acceptance thresholds for supported 100k CSV/JSON grid loading/editing. Sprint 043 must still record actual results, prove complete/lossless access and usable scroll/edit/history/cancellation/fallback, and obtain explicit Lead Developer acceptance.
- Other performance budgets are unchanged: 100-file listing, preview debounce, cancellation acknowledgement, and background analysis/validation/export responsiveness remain independently testable.
- Sprint 041's original timings remain historical evidence; they are not changed to passes. Sprint 043 records the new integrated measurements and closes the explicitly relaxed data-editor timing disposition.

## V0.6 Sprint 042 Builder Residuals (2026-10-02)

- **Resolved for Sprint 042 feature acceptance (2026-10-03):** the Lead Developer states all Sprint 042 functionality and requirements were tested and met, including native destination and output-action behavior. Exact OS/session and per-check results were not supplied; they remain unavailable and are not inferred. This supersedes the Builder's earlier native-host question for Sprint 042 closure, not separate platform-release certification.
- **Resolved at Sprint 043 closeout:** the remaining 100,000-row evidence/usability gaps are accepted for V0.6 by the Lead Developer, with unmeasured mounted-grid cancellation and background-task performance retained as V0.7 follow-up requirements. The 2026-10-03 timing adjustment remains descriptive; no numeric target is recorded as passed.
- **Separate release residuals:** native macOS/Windows/Ubuntu release certification, Hutch packaging, broad Office, licensing/Marketplace, and formal accessibility remain outside Sprint 042 feature closure.

## V0.6 Sprint 041 Builder Residuals (2026-10-02)

- **Resolved by Lead Developer direction:** select and integrate `vxe-table@4.22.3` for CSV and `json-editor-vue@0.19.2`/`vanilla-jsoneditor@3.13.0` for JSON in the production desktop app. The Lead Developer reports the isolated-host manual checklist passed and both editors worked as intended.
- **Unavailable details, not failed checks:** OS/session type, input method, and per-check timing were not recorded. Record these as unavailable; do not infer other platform or formal accessibility results. The reported manual checklist itself is complete/successful for the tested host.
- **Disposition:** Sprint 041 was `COMPLETE WITH RECORDED EXCEPTIONS` by explicit user direction so Sprint 042 could proceed. Its historical 100k measurements (CSV viewport/longest task `681/434 ms`; JSON `631/572 ms`; one JSON edit `1,205 ms` with an `862 ms` task) did not meet the former 100 ms target. Sprint 043 recorded new descriptive measurements and the Lead Developer accepted remaining performance evidence/usability gaps as V0.6 release exceptions. Follow-up is tracked in `planning/requirements-openamxV07.md`; do not relabel historical results as passes.
- Implemented and verified: production build/typecheck, 100k CSV and JSON grids, tail scrolling, view-only search/sort, cell/tree edit history, row/field operations, exact 100001-row fallback, malformed JSON preservation, external autosave/conflict/close, stale owner validation and path/content-free diagnostics. Exact evidence is in the Sprint 041 builder evidence.
- Native evidence remains unavailable: the Lead Developer reports the standalone candidate-host checklist passed, but OS/session, input method and timings were not recorded. The Builder browser was VS Code integrated Chromium; no formal accessibility or cross-platform pass is inferred.
- Builder verification completed: production build/typecheck, 100k CSV/JSON array grids, raw fallback, schema-aware service validation, external autosave/conflict/close, stale owner supersession, path-free diagnostics and enabled visible English labels. Sprint 043 later dispositioned the responsiveness exception as accepted for V0.6; see the evidence record.

## V0.8 Sprint 049-050 Lead Developer Closeout (2026-10-04)

- **Disposition: COMPLETE WITH RECORDED RESIDUALS for both sprints.** By explicit Lead Developer direction, Sprint 049's prerequisite disposition is accepted and Sprint 050 is closed. The Lead Developer reports all features tested and satisfactory.
- **Verified fixtures:** versions `0.6.1` and `0.6.2` collect independently at distinct fixture commits; identical and conflicting same-version attempts are refused with accepted outputs/source manifests unchanged. Mixed/stale/incomplete/unsafe/corrupt/duplicate inputs, mocked retry/tag/partial/auth cases, and safe additions are tested.
- **Accepted release-workflow residual:** a fresh matching production release was not built/collected because there is no newly authorized version and the retained 0.8.0 target is immutable. Do not combine its recorded commit with other provenance or treat fixtures as production artifacts.
- **Accepted license/publication residual:** Marketplace representation of the AGPL/commercial offer and third-party notice requirements remain unconfirmed. `release:verify` and publication readiness remain blocked until license-owner confirmation. No GitHub release or Marketplace upload occurred; Marketplace submission remains manual.
- **Accepted native/staging residuals:** the Lead Developer's feature acceptance does not supply exact host/session/step evidence or upgrade five other targets from `unverified`. No fresh Sprint 050 installer matrix was recorded, and local filesystem failure after assembly staging was not injected. These items are accepted for sprint closure, not marked as executed passes.
- **Preserved evidence:** Sprint 048's user-reported launch disposition remains separate from its Builder-time `not_performed` record. The retained 0.8.0 Linux x64 bundle is unchanged and its checksums remain valid. The follow-up PDF resource fix and packaged-worker PDF smoke are in Sprint 050 Builder evidence.
- How will external mapped input records be derived and exposed privately without returning raw paths broadly or enabling general external browsing? Owner: Sprint 038 Builder / Sprint 039 integration.
- Which recovery snapshot retention/cleanup behavior safely covers explicitly opened external files, completed Save All/Discard All/close paths, and bounded machine-local preferences without retaining input contents or stale private paths? Owner: Sprint 038 Builder.

## V0.6 Sprint 035 Lead Developer Disposition (2026-10-01)

- Resolved: the Lead Developer ratified the V0.6 contract without amendment and accepted the active-document identity, source-overlay, and cancellable-job approaches. Sprint 036 is authorized.
- Still OPEN for dependent work: native API/host evidence (Lead Developer; required before native acceptance in Sprints 037-039/042); selected data-editor component and 100k viewport proof (Lead Developer / Sprint 041 Builder; required before Sprint 041 selection/implementation); full worker cleanup/latency and preview/webview performance (Sprint 036/042 Builder). See recorded owners, impacts and fallbacks in `planning/state.md`.
- Sprint 035 disposition: **ACCEPTED WITH RECORDED EXCEPTIONS**. These exceptions are not passed tests or scope waivers for their dependent sprints.

## V0.6 Sprint 036 Builder Resolutions and Residuals (2026-10-01)

- Resolved: active-document identity and worker lifecycle remain on the Lead Developer-accepted Sprint 035 boundary. Direct jobs bind canonical URI, project generation, document revision, input/settings revision and assigned job ID; tests cover edits, tab changes, project changes, cancellation and stale no-write behavior.
- Resolved: the optional source-overlay production path remains in the existing loader and preserves no-overlay CLI behavior. A trusted `validate-data` job now reuses that module graph for schema-aware in-memory JSON/CSV validation and serializer-derived explicit-export metadata.
- Resolved: cancellation acknowledgement and worker cleanup are separate observable states. On this host a real 250,000-row JSON validation acknowledged cancellation in 0.72 ms and emitted worker close; repeated process RSS deltas were noisy (-17,141,760 to +22,085,632 bytes). Bun termination remains experimental/non-cooperative, and an atomic rename already underway cannot be interrupted.
- OPEN with existing owners: native Electrobun menus/dialogs/window lifecycle and native target platforms remain unavailable; no grid candidate or first 100,000-row viewport proof was selected; Hutch packaging/launch, Office, license/Marketplace and formal accessibility remain separate residuals. Do not treat this Builder evidence as closing them.
- Sprint 037 handoff is unblocked for the typed operation/RPC foundation. It must retain identity guards, use `cleanupPending` only as close-state evidence, keep parsed data values/private paths out of webview results, and keep output validation/commit authority in Bun.

## V0.6 Sprint 037 Residuals (2026-10-01)

- Which direct SDK-enabled host can exercise native File/Edit/View/Help menus, native dialogs/window lifecycle, and host focus restoration against the shared command registry? Owner: Lead Developer/native acceptance.
- Which bridge-backed component/browser harness can mount the production Vue entry with deterministic fake RPC state for populated/empty, 1024x720/larger, reduced-motion, focus restoration, theme, divider, and drawer evidence? Owner: Sprint 043 acceptance harness. The plain Vite page cannot construct `Electroview`.
- Create Project, starter installation, recovery restoration, lifecycle operations, autosave, and trash are deliberately unavailable pending Sprint 038; do not reinterpret disabled welcome routing as implemented behavior.

## V0.6 Sprint 035 Feasibility and Contract Questions (2026-10-01)

- Which bounded contained source-provider shape lets `loadEntryModule` prefer every relevant open unsaved AMX buffer while preserving canonical imports, cycles, diagnostics, evaluation order, and unchanged CLI behavior?
- Does cooperative abort, Bun worker termination, or a combined job boundary provide prompt cancellation and cleanup for preview/run, data validation, and report preparation while keeping final filesystem writes in the main process?
- Which Electrobun 2.0.1 and available-host APIs support native menus, Open/Reveal, focus restoration, save selection, and window lifecycle without adding webview filesystem/process authority?
- What smallest VS Code-independent editor-analysis API can preserve current provider behavior while supplying CodeMirror symbols, ranges, completion, diagnostics, navigation, rename, and actions over unsaved module overlays?
- Which maintained Vue-compatible virtual CSV grid and JSON tree/editor meet the 100,000-row, raw/structured, keyboard, undo, license, bundle, and memory requirements on the actual Bun/Vite host?
- Which structured JSON/YAML editing approach preserves unrelated `.openamx/project.json` keys and AMX frontmatter content while applying validated input/report settings with conflict-safe atomic writes?
- What measured available-host budgets replace or confirm the initial targets for project listing, first usable 100,000-row viewport, preview debounce, cancellation acknowledgement, and webview main-thread responsiveness?
- Which component/browser harness can exercise populated RPC states, keyboard/focus, light/dark themes, drawer/split behavior, and deterministic 1024x720/larger screenshots without presenting browser-shim evidence as native release proof?

Resolve these in Sprint 035 through bounded evidence and record the selected approaches before their dependent implementation sprints. They are technical proof gates, not permission to reduce the approved V0.6 product scope silently.

## Sprint 034 Final Disposition Questions (2026-10-01)

- After reviewing the generated F0-F6 desktop/HTML/PDF/DOCX evidence, does the Lead Developer sign `Approved`, `Approved with recorded exceptions`, or `Rejected`? Record reviewer/date/environment/viewer/artifact hashes and an owner/date for every exception; unavailable observation is `Blocked`, not pass.
- Does the Sprint 033 resolve-time document/token/live-diagnostic recheck provide an acceptable bounded safeguard for the current VS Code 1.85 quick fix, or must a guarded command/preview flow be scoped before that provider criterion can close?
- What is the explicit product disposition for the still-open Sprint 029 native picker/project/quit/accessibility and Sprint 030 editor/analysis/accessibility exceptions? Assign remediation or approved exception; Sprint 034 cannot erase them by documentation.
- Which native target hosts, named PDF/DOCX viewer/OOXML checks and package/Office tools are actually available for final verification, and which native/Hutch/Office/license/Marketplace checks remain separate release-owner blockers after Sprint 034?

These were the Sprint 034 decision questions. The Lead Developer's V0.5 feature acceptance and V0.6 deferral are recorded under Builder Evidence Status below; the separate release-engineering gates remain OPEN.

### Builder Evidence Status (2026-10-01)

- Root/desktop/extension automated checks and temporary F0-F6 report generation are recorded in [Sprint 034 builder evidence](sprints/0034-v05-cli-docs-examples-acceptance-release-record/builder-evidence.md). The Lead Developer accepted V0.5 with known product/visual exceptions deferred to V0.6 on 2026-10-01; this does not constitute release approval.
- Builder browser observations found source-visible F1/F3 horizontal overflow at 360 px. F2 hidden source measured 345 px content width and 345 px document width with its table and chart retained. Preserve these as V0.6 remediation/review work, not V0.5 passes.
- The PDF artifact was opened in Chrome's built-in viewer; no standalone PDF/Office application, DOCX viewer, or native desktop review was available. OOXML and automated checks are not substitutes for those observations.
- Sprint 033 apply-time safety, Sprint 029 native/accessibility work, Sprint 030 editor exceptions, F1/F3 overflow and unavailable named viewer/native desktop observations are accepted exceptions deferred to V0.6. Accountable owner: Lead Developer/project maintainers; recheck at V0.6 acceptance (calendar date TBD).
- Native platforms, Hutch, broad Office, project license and Marketplace remain independent OPEN release-engineering gates. V0.5 acceptance does not close or waive them.

## Sprint 033 Builder Answers and Residual (2026-10-01)

- Parser locations are one-based UTF-16; declaration statements start at their keyword and imports/fields/selected expression uses carry token locations. Original-buffer token validation supports CRLF and non-BMP prefixes; unsupported function-body/iterator spans are withheld. Checked graph exports/explicit import edges use canonical contained files, reject symlinked path segments and prefer open unsaved VS Code dependencies; reanalysis on every request plus existing diagnostic refresh handles edits/close without a global index. Duplicate declarations and cycle/outside/unknown imports do not get fabricated targets.
- The only safe proposed fix is a unique prior view for the exact unknown `show` diagnostic. Its edit is constructed during resolution after checking version/token/live diagnostic, with no automatic application or dependency write. **Open acceptance question for Sprint 034/Lead Developer:** does resolve-time guarding meet the sprint's revision-safety intent, given a stale already-resolved `WorkspaceEdit` cannot be made atomically conditional on document version by VS Code 1.85? If strict apply-time protection is required, authorize an alternative guarded command/preview UX before marking that criterion accepted. Additional function/loop scope references require proven parser locations before expansion; no speculative text matching is approved.
- Local packaging/install and installed-host tests passed; the missing project license was bypassed only for local packaging and Marketplace publication remains unapproved. Sprint 029/030 desktop, Sprint 032 manual visual/Office, native/Hutch and project-license residuals retain their prior owners.

## V0.5 Sprint 033 Provider Proof Questions (2026-10-01)

- Which existing AST/checker source spans prove declaration-token ranges and identity across local scopes, shadowed names and explicit exported imports? Where a token/range is not provable, which provider must return no result instead of relying on raw text matching?
- How will read-only module analysis prefer each open unsaved dependency buffer over disk, invalidate after edits/close, and still reject symlinks, cycles and files outside the canonical entry root without scanning unrelated workspace files?
- Which parser/static diagnostics permit a unique, version-checked deterministic code action, and how will Extension Development Host tests prove no stale range or speculative edit is offered after unsaved changes?
- Which local VSIX package/install/installed-host checks are available in the current environment, and what exact evidence keeps local installation distinct from the open project-license/Marketplace publication decision?

Answer these within the Sprint 033 direct-provider contract or record a concrete blocker. Sprint 032's outstanding viewer/visual review, Sprint 029/030 desktop exceptions and release-engineering residuals retain their existing owners.

## Sprint 031/Sprint 032 Gate Resolution (2026-10-01)

- **Resolved by Lead Developer Option 1 and Builder evidence:** Sprint 031 remediation is implemented through the shared `PreparedReport` boundary and Sprint 032 adapters consume it without independent identity/assets/evaluation reads. Focused preparation, PDF/DOCX structure and CLI no-write tests plus root/desktop checks are recorded in `planning/state.md`. Sprint 034 retains the separate manual PDF/DOCX viewer and visual-review evidence.

## Sprint 032 Builder Gate Follow-Up (2026-10-01)

- Lead Developer: record one of the following before Sprint 032 resumes: (1) Sprint 031 acceptance with focused evidence for the immutable shared identity/content preparer, strict project/frontmatter diagnostics, sanitized bounded PNG bytes and HTML consumption without raw asset/config reads; or (2) an explicit dependency disposition naming the Sprint 031 remediation owner and stating that no branded PDF/DOCX implementation is authorized until that remediation completes. Which disposition applies?

## Sprint 032 Entry and Report Identity Evidence (2026-10-01)

- Who owns Sprint 031 remediation and who will record its Builder outcome/Lead Developer acceptance? Before Sprint 032 implementation, verify one immutable evaluated-content/identity model shared by HTML/PDF/DOCX, strict project/frontmatter diagnostics, and fail-before-write logo behavior against Sprint 031 acceptance. If the Lead Developer explicitly dispositions the dependency instead, name the prerequisite owner and do not ship unsafe PDF/DOCX exports in the interim.
- Does the accepted preparer reject data URIs, absolute/outside-root/symlink paths, unsupported/missing/malformed/oversize assets and invalid project JSON with approved source locations, while embedding only bounded sanitized PNG and preserving existing destinations? Current `renderHtml.ts` allows `data:` and silent fallback; tests or a Builder-complete label alone do not resolve that security/compatibility gap.
- Which engine-native PDF/DOCX mappings support header/footer/metadata/logo alt, table header repetition, source visibility, static chart data and page breaks with the resolved model, and which viewer/font/OOXML properties can actually be verified on this host? Record unsupported behavior rather than claiming pixel parity, tagged PDF or broad Office compatibility.

The prior open-item ledger remains in force: Sprint 029 native workflow, Sprint 030 editor exceptions and V0.4 release-engineering residuals do not transfer to Sprint 032. Sprint 034 visual approval remains separate.

## V0.5 Open-Item Ledger for Sprint 031 Handoff (2026-09-30)

| Item | Status and decision | Owner / closure evidence |
| --- | --- | --- |
| Sprint 028 contract and visual-checklist approval | Resolved by explicit Lead Developer approval; no new report-policy question | Sprint 031 implements approved rules; Sprint 034 reviews actual outputs |
| Sprint 029 dependency decision for editor work | Resolved: Lead Developer authorized Sprint 030 while Sprint 029 stayed OPEN | Decision recorded in `planning/decisions.md`; not Sprint 029 acceptance |
| Sprint 030 editor selection and sprint close | Resolved: CodeMirror approved, sprint CLOSED with exceptions | Lead Developer closeout in `planning/state.md`; do not call outstanding criteria passed |
| Sprint 029 native project/save/close and populated accessibility checks | OPEN; not a Sprint 031 dependency | Sprint 029 desktop follow-up and Lead Developer native review; real new/existing save/cancel/no-write, Open Project, close/quit and populated viewport/focus evidence on supported hosts, or explicit exception disposition |
| Sprint 030 AMX token coloring, static import completion/linking, UI/RPC/request/export state and IME/screen-reader/zoom proof | OPEN; not a Sprint 031 dependency | Separate Lead Developer-approved desktop remediation owner before full Sprint 034 feature acceptance; focused implemented behavior/tests plus available native/a11y evidence or explicit documented exceptions |
| Native V0.4 platform/Hutch, broad Office, project license/Marketplace | OPEN separate release-engineering tracks | Release owners; direct target-host/package/Office and license/publication decisions, not report/desktop unit tests |

Do not convert OPEN items into passes by transferring them into Sprint 031 or by running only WSL2/direct tests. The earlier question lists below are historical; this ledger is the current disposition and identifies which decisions are closed versus which evidence/implementation remains outstanding.

## Sprint 030 Closed-Sprint Follow-Up Ownership (2026-09-30; assigned to V0.6)

- Lead Developer closed Sprint 030 after an integrated UI check with recorded exceptions. On 2026-10-01, those product exceptions were accepted for V0.5 and deferred to the V0.6 backlog: AMX-specific fence/token coloring, source-order/import-aware completion and linking, desktop UI/feedback tests, revision-labelled export state, and native IME/screen-reader/200%-zoom evidence. Accountable owner: Lead Developer/project maintainers; plan and verify in V0.6, recheck at V0.6 acceptance (calendar date TBD). This assignment is not evidence that the criteria passed.

## Sprint 030 Isolated Editor Proof Gate (2026-09-30)

- Lead Developer: using the isolated editor proof, record OS/browser/screen-reader and pass/fail for native keyboard focus and shortcuts, IME composition, multi-line selection/undo, find/replace, 200% zoom, reduced motion, resize/scroll and a 6,001-line buffer. The integrated browser covered only focus/type/undo and large-buffer visibility, not these manual items. A separate actual Electrobun-host proof is still required before component adoption; if unavailable, keep Sprint 030 editor selection OPEN rather than treating browser evidence as host proof.
- The Markdown-language probe does not yet highlight AMX expressions inside exact executable fences. Which parser-fact-driven decoration strategy supplies that without a second AMX grammar or treating ordinary fences/narrative as executable? Validate the strategy before replacing the textarea.

## Sprint 029 Option 1 Native Evidence Pending (2026-09-30)

- On macOS 14+ arm64/x64, Windows 11+, and native Ubuntu 24.04+ with `zenity` installed, does the packaged Bun process display a real save panel and return new/existing paths and cancel correctly? Verify extension/containment/conflict rejection and output preservation after invalid analysis or cancelled selection; PowerShell/AppleScript/zenity command tests under WSL2 are not substitutes.
- Does each target's native window-close event reach the `will-close` veto before disposal, and does native app quit reach `before-quit`? Exercise Save All, Discard All, Cancel, later-tab conflict, failed save and retry on each host. Resolve the Hutch prepare/package blocker before claiming packaged-native evidence. Keep Sprint 030 gated until the Lead Developer records acceptance.

## V0.5 Sprint 030 Entry Gate and Proof Questions (2026-09-30)

- Will the Lead Developer record Sprint 029 acceptance after the create-new native save picker and actual native close/quit verification, or explicitly disposition Sprint 030's dependency while keeping those Sprint 029 blockers open? Approval of Sprint 029 changes alone is not this decision.
- Which maintained Vue-compatible editor passes the approved license/bundle, keyboard, IME, undo/selection, screen-reader, 200% zoom, reduced-motion, large-file and actual Bun/Electrobun host proof? If no candidate passes, request a Lead Developer decision before integrating one.
- Which existing parser/checker/local-link facts provide reliable original UTF-16 source locations and completion candidates for unsaved entry/imports, and where must editor analysis withhold results rather than invent symbols or evaluate inputs?
- How will per-tab/project/input request identities and selection restoration prevent late editor, diagnostic, preview and export responses from overwriting a newer tab or presenting failed/stale success? Which focused UI/native checks can prove this beyond direct RPC tests?

These are Sprint 030 implementation/proof questions subject to the Sprint 029 entry gate, not approval to weaken the V0.5 contract or absorb Sprint 029's open native workflow into editor acceptance.

## V0.5 Sprint 029 Follow-Up Residuals (2026-09-30)

- **Save picker direction approved, implementation still blocked:** obtain an auditable native save-panel API or maintained source-backed package with Bun, macOS 14+ (arm64 and x64), Windows 11+, native Ubuntu 24.04+ coverage. Electrobun 2.0.1 has no save API; `tinyfiledialogs-node@1.1.8` is not an acceptable published cross-platform artifact. Validate cancellation, selected new/existing destination, exact extension, containment, conflicts and no-write/atomic guarantees on the resulting adapter. Do not infer an approval to use a webview path input.
- **Native quit verification pending:** direct service tests cover approved Save All / Discard All / Cancel and a generated-SDK `before-quit` veto is wired, but verify actual native window-close, application quit, conflict/retry and cancelled save on each supported host. A post-close event is not a substitute for a veto; if OS window close bypasses `before-quit`, the hook remains a blocker, not a pass.

## V0.5 Sprint 029 Initial Options (2026-09-30; Policy Resolved Above)

- **Native export save dialog:** Generated Electrobun 2.0.1 `Utils.openFileDialog` selects only existing files; no save-file dialog is exposed. Option A: add/upgrade an audited cross-platform native save picker in the Bun main process and validate its untrusted result before the existing atomic export calls. Option B: keep Sprint 029 acceptance open until a supported native picker exists. Do **not** adopt a webview-typed destination or an implicit overwrite as a policy exception without explicit Lead Developer approval.
- **Project switch and quit:** Currently the service blocks a switch with dirty/conflicted tabs, and tab close offers Save/Discard/Cancel; neither project switch nor native quit offers the complete transactional confirmation sequence. Option A: implement a typed multi-tab preflight/confirmation operation and test a vetoable native close/quit hook on all supported hosts (failed save retains every dirty tab); Option B: leave Sprint 029 open pending that integration. The generated SDK's `before-quit` approval alone is not native window-close proof.
- **Verification outstanding:** Native dialog cancel/selection, multi-tab UI with live RPC, 1280x720 and 800x600 populated layouts, keyboard/zoom/screen-reader focus, Hutch package/native launch and target-OS tests cannot be certified by this WSL2 direct build or browser bridge shim. Sprint 034 owns final visual sign-off after the blockers are resolved; Sprint 030 can review the tab/RPC boundary but must not assume this sprint accepted.

## V0.5 Sprint 029 Builder Execution Questions (2026-09-30)

- Which available Electrobun native dialog and application close/quit hooks satisfy the approved main-process typed RPC lifecycle on this host? Record the actual API/version and tested cancel/validation behavior; report a blocker if the package/native boundary cannot be verified.
- Which service response/revision shape makes active-versus-entry requests unambiguous when projects or tabs change during an asynchronous preview/run/export, without dropping an existing safe write or presenting a stale success?
- Where can recent/session metadata be stored locally on each supported host using the existing stack, with bounded contents, safe restore/clear behavior and no project-file or version-control leakage?
- Which current desktop UI test/harness can demonstrate dialog, tab, keyboard, focus and 800x600/1280x720 layout states, and which native observations remain unavailable under WSL2/Hutch?

These are implementation/proof questions within the approved Sprint 028 contract, not permission to change authority, privacy, dirty-dependency or conflict rules. Record concrete answers and evidence in the Sprint 029 outcome; escalate any contract-affecting blocker for Lead Developer review.

## Sprint 028 Review and Blocking Decisions (2026-09-30)

- **Resolved 2026-09-30**: The Lead Developer explicitly approved [the V0.5 contract](../docs/language-spec-v0.5.md), resolving the six Sprint 028 contract-question groups below, including visible-source default, exact `report` keys, CLI `--project-root`, strict missing-logo no-write policy, contrast fallback and desktop authority. Sprint 028 no longer blocks Sprints 029, 031 or 033; any later change to an approved policy requires a separately recorded decision.
- **Resolved 2026-09-30**: The Lead Developer explicitly approved [the visual-review checklist, fixture manifest and evidence policy](sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md). This approves the review procedure, not the yet-to-be-generated reports or workbench; actual Lead Developer visual sign-off remains a separate Sprint 034 decision.
- **Later gated proof, not an undecided product policy**: Sprint 030 must demonstrate a named editor component's keyboard, IME, screen reader, selection, bundle and license compatibility with the isolated desktop stack; failure blocks the editor integration pending Lead Developer selection. Actual native platform/Hutch package/launch, Office round trips, license and Marketplace decisions remain independent open tracks, not approvals implied by this review.

## V0.5 Sprint 028 Contract Questions (2026-09-30)

- Which exact additive version-1 project config keys and report metadata keys/types carry portable identity and source visibility, and what are the precedence, unknown-key, error/fallback, and migration rules? Preserve existing `inputs` semantics and visible source by default unless explicitly approved otherwise.
- Which offline logo formats, byte/dimension/path bounds, canonical containment/symlink rules, missing-asset diagnostics, alt text and format-specific embed limits are safe for all three adapters and CLI/desktop callers?
- What measurable accent contrast/fallback and font licensing/offline rules constitute the shared visual/accessibility baseline in desktop, HTML, PDF, and DOCX without claiming formal certification?
- What is the exact desktop multi-tab entry/current-buffer, session privacy, native-dialog, command/shortcut and stale-result state contract, including unsaved close/reload and conflict handling across tabs?
- Which parser/checker/link facts can support each VS Code hover/definition/symbol/reference/action with original UTF-16 locations and unsaved module context, and which cases must return no result rather than speculative symbols?
- Which fixture sources, safe assets, screen sizes, PDF/DOCX viewers, review evidence fields and pass/exception criteria will the Lead Developer use at the Sprint 034 manual visual sign-off?

Sprint 028 must resolve these in the authoritative contract or record a blocking Lead Developer decision for the affected later sprint; none is approval to start implementation or close the inherited V0.4 release residuals.

## V0.4 Sprint 027 Questions To Resolve

- Which one auditable V0.4 example and fixture layout best covers typed data, local imports, CSV/JSON inputs, tables, charts, HTML, PDF, desktop workflow, and delivered DOCX without creating unsupported domain claims?
- Which exact HTML/PDF/DOCX properties are deterministic or structurally inspectable, and which engine metadata, visual parity, accessibility, Office round-trip, and cross-platform limitations must be documented?
- Which root/extension/desktop version metadata and command documentation should be aligned with the verified artifacts without claiming package commands or platforms that remain unverified?
- Can the release owner run the required Electrobun build/launch checks on macOS 14+, Windows 11+, and native Ubuntu 24.04+, and what exact residual status follows if any target is unavailable or fails?
- What is the final V0.4 status (`COMPLETE` or `OPEN`) after all core gates, DOCX disposition, license/publication status, and known limitations are reviewed?

Resolve these with actual acceptance evidence. Do not close V0.4 or claim a platform/release gate based on WSL2/Linux substitution.

## V0.4 Sprint 026 Approval Resolution (2026-09-30)

- The Lead Developer approved implementation and confirmed sufficient schedule for the stretch. The native platform/Hutch residual remains open but is not silently waived.
- The selected feasibility direction is a maintained semantic DOCX generator. Verify its exact package/runtime compatibility, license, semantic OOXML structure, local SVG/PNG chart behavior, and available office/parser round trip during implementation.
- Sprint 027 must report the final DOCX disposition and all unavailable native-office/cross-platform checks; it must not claim interactive charts, pixel parity, or broad office compatibility without evidence.

## V0.4 Sprint 026 Delivered Resolution (2026-09-30)

- The selected approach is `docx@9.8.1` with MIT licensing; package inspection and focused semantic tests passed on Bun 1.4.2 under Ubuntu 24.04.4 WSL2.
- Supported entry points are the root CLI `export docx` command and the desktop main-process `exportDocx` RPC/workbench action. Both preserve the shared analysis boundary and safe-write guarantees.
- Remaining evidence gaps are native Office/LibreOffice round trips, official macOS/Windows/native Ubuntu verification, and cross-platform Office compatibility. Sprint 027 must record these as limitations rather than treating WSL2/package inspection as release-owner proof.

## V0.4 Sprint 026 Questions To Resolve

- Has the Lead Developer explicitly approved the optional DOCX stretch after reviewing the open Sprint 025 native platform matrix and remaining core release risk?
- Which local/offline DOCX approach best supports editable headings, paragraphs, lists, tables, static chart images, Bun compatibility, round-trip inspection, deterministic ordering, maintenance, and licensing?
- Which document structure and style mapping preserves report/source/view order without duplicating HTML/PDF semantics, and how are page breaks, captions, null/empty values, and long tables represented?
- Which CLI and/or desktop entry point is justified by the selected adapter, and how will explicit `.docx` destination validation and no-write behavior be shared?
- What exact office/parser tool, OS, runtime, package versions, and license evidence are available for verification, and what compatibility remains unverified?

Resolve these only after the stretch entry gate is approved. If evidence or schedule risk is unfavorable, record a concrete deferral and do not add production dependencies.

## V0.4 Sprint 025 Questions To Resolve

- What exact configuration schema/version and validation behavior should `.openamx/project.json` and ignored `.openamx/local.json` expose, including unknown keys, missing files, permissions, and private-path redaction?
- Which typed RPC response/status model prevents stale successful results from being shown after a newer run fails or is superseded, and how are cancellation/request ordering handled?
- What bounded result summary can the UI show without exposing unrestricted evaluated objects or input file contents through the webview?
- How should desktop destination selection and conflict handling coordinate HTML/PDF safe writes with existing JSON/CSV output semantics and project-root-relative paths?
- Which native build/launch prerequisites and exact owner checks are available on macOS 14+, Windows 11+, and Ubuntu 24.04+, and what remains open if Hutch/package commands continue to fail?

Resolve these during Sprint 025 or record explicit Lead Developer decisions before implementation; do not infer official platform acceptance from WSL2/Linux evidence.

## V0.4 Sprint 025 Builder Resolutions and Residuals

- Implemented strict version-1 JSON configuration with only `version` and `inputs` keys. Missing files are empty configuration; malformed JSON, unknown keys, invalid mappings, and project paths outside the canonical root are diagnostics. Project values must be relative. Local values may be absolute or root-relative and are never returned to the webview; POSIX local config must not grant group/other access. Per-run mappings override local, then project. Core validation remains aggregate by default or fail-fast when selected.
- RPC results use bounded structured diagnostics and a summary capped at 100 bindings. Declared input names are excluded; strings are capped at 500 characters, lists become item counts, and records become a kind label. The UI invalidates run/preview state when buffer or input settings change and ignores late replies; no execution cancellation is claimed.
- HTML/PDF destinations are confined to the canonical project root, require existing parents and exact lowercase extensions, reject symlinks and entry/input conflicts, and preserve prior files on analysis/preparation failure. HTML uses atomic replacement; PDF reuses the shared adapter and atomic writer.
- Official owner verification remains unresolved/unavailable: this workspace reports Ubuntu 24.04.4 LTS on Microsoft WSL2, not native Ubuntu. macOS 14+, Windows 11+, and native Ubuntu 24.04+ remain open release gates; WSL2 evidence is not substituted.
- The available result summary and configuration schema are implementation choices for Sprint 025 acceptance, not changes to the language contract. DOCX remains optional/unimplemented. License selection and Marketplace publication remain deferred.

## V0.4 Sprint 024 Resolutions

- RPC payloads use discriminated `{ ok: true, ... }` / `{ ok: false, error }` responses. Document text is bounded at 2,000,000 characters and preview HTML at 8,000,000 characters; diagnostics are source-located and completions are bounded display strings.
- Session state stores a canonical project root, file-backed entry path, current text, disk SHA-256 revision, dirty flag, and conflict flag. Save compares the current disk revision with the revision observed at open and refuses silent replacement.
- Project listing recursively returns only contained regular `.amx` files, skips dot/local/generated paths and symlinks, and all open/save candidates are canonicalized through the main-process containment check. Relative UI paths resolve from the selected project root.
- The lightest editor surface is a source-owned Vue textarea with AMX-aware formatting, static diagnostics, scoped keyword completion, dirty/save controls, and a sandboxed HTML `srcdoc` preview. Core parser, formatter, checker, loader, and renderer APIs remain shared; no VS Code provider replacement or duplicated evaluator was added.
- Verification uses direct desktop checks where Hutch is blocked. Hutch package preparation/build/dev behavior and persistent native window evidence remain Sprint 020 residuals; WSL2/Linux evidence does not claim macOS, Windows, or native Ubuntu release acceptance.

## V0.4 Sprint 024 Questions To Resolve

- Which typed RPC payload limits and structured error/status forms are sufficient for document text, HTML preview, diagnostics, project listings, and save conflicts without exposing arbitrary file handles or evaluation hooks?
- Which editor surface provides reliable AMX syntax highlighting and completion in the isolated Vue app without duplicating the core parser or importing the VS Code host?
- How should project/session state represent canonical root, current entry URI, dirty text, disk revision, save conflict, and an untitled/import-requiring limitation across open/save/reload transitions?
- Which safe file listing rules should cover ignored files, `.openamx/local.json`, generated outputs, symlinks, local modules, and user-selected save-as destinations while preserving V0.3 entry-root containment?
- Which direct desktop typecheck/web/native/host checks are available after the Sprint 020 Hutch residual, and how will Sprint 024 record the exact boundary between verified Linux evidence and unverified official targets?

Resolve these during Sprint 024 or record explicit decisions before implementation; do not widen webview capabilities or infer cross-platform acceptance.

## V0.4 Sprint 023 Builder Resolution

- pdfmake 0.3.11 runs in the root Bun pipeline without a browser runtime. The adapter uses the package-resolved local Roboto files and denies URL access; no remote assets or telemetry are used.
- Roboto redistribution evidence is now recorded: the authoritative Google Fonts Roboto repository license is Apache 2.0. The installed pdfmake package contains only its MIT package license beside the fonts, so a shipped artifact must carry the Apache notice; this repository does not claim Marketplace/legal approval.
- The shared adapter boundary is independent of CLI orchestration: Sprint 024/025 can pass an evaluated document/environment or main-process prepared request to `preparePdfReport` and `serializePdfReport` without re-reading or re-evaluating.
- Remaining unverified checks are explicitly non-blocking limitations for this Linux/WSL2 Builder environment: permission-denial simulation, native Ubuntu/macOS/Windows acceptance, PDF/A/tagged accessibility, exact byte identity, and pixel parity.

## V0.4 Sprint 023 Questions To Resolve

- Are pdfmake 0.3.11's production Bun API and required local font assets compatible with the repository's root and future Electrobun main-process packaging without adding a browser runtime?
- Can redistribution terms for the proof's bundled Roboto fonts be verified from authoritative package/font sources? If not, which approved local fonts replace them, and how are their licenses recorded?
- Which report-model representation best preserves narrative/source/view placement, explicit page breaks, repeated table headers, static charts, and textual chart data without duplicating renderer semantics?
- Which deterministic PDF properties can be asserted reliably with the selected engine, and which visual/layout/accessibility limitations must remain explicit?
- How can destination canonicalization, symlink rejection, input/module conflict checks, same-directory temporary writes, atomic rename, and cleanup be tested portably in the current Linux environment?

Resolve these during Sprint 023 or record a concrete Lead Developer decision; do not silently ship unverified fonts, a hidden browser fallback, or weaker no-write behavior.

## V0.4 Sprint 022 Builder Completion

- No blocking contract questions arose. The existing V0.4 specification was sufficient for source placement, captured snapshots, table interaction, chart alternatives, escaping, and editor scope.
- No new dependency was selected. Inline assets keep reports offline and deterministic; Sprint 023 may consume the static presentation/data boundary without inheriting browser interaction state.
- Browser interaction was verified on the available Linux integrated browser only. Cross-platform print rendering and visual metrics remain open for later release-owner checks, not silently passed by this sprint.
- Sprint 020 desktop residuals remain explicit: Hutch scripted prepare/build/dev reliability and persistent WSL window verification were not rerun or claimed as passed.

## V0.4 Sprint 020 Questions To Resolve

- What exact declaration and view-expression syntax will represent tables and charts, and how will declarations be visible across executable blocks while emitted views retain source-order placement?
- Which typed scalar-list and record-list forms are supported? How are columns, field bindings, chart series, labels, axis roles, ordering, and invalid/missing values expressed and checked?
- What are the deterministic table/chart semantics for empty values, sorting, filtering, pagination, accessibility labels, escaping, and static print fallbacks? Which chart types share a common data contract, and what role/type restrictions apply to scatter and line charts?
- How do visualization declarations participate in static-check activation, source-order evaluation, final-environment interpolation, diagnostics, and the existing visible AMX source listing without changing V0.3-only documents?
- What exact PDF CLI and desktop entry points, format constraints, destination conflict/path rules, write guarantees, pagination defaults, and actionable failure diagnostics are required? Which local/offline engine best satisfies them, and what guarantees/limitations does its proof demonstrate?
- Does the required Electrobun + Vue + shadcn-vue stack build and run with Bun-backed main-process integration in this environment? Which exact versions and native prerequisites are proven, and what evidence would justify an alternative?
- Can current-buffer execution reuse the core pipeline while resolving local imports and configured CSV/JSON mappings without stale-file execution or weakening path containment and validation? If not, does a bounded main-process CLI invocation preserve the required behavior?
- What typed RPC operations and payload boundaries are necessary for editor text, diagnostics, preview/run, input mapping, and exports while keeping filesystem and evaluation authority in the main process?
- What project-default format, local override location, per-run override precedence, path base/canonicalization rules, and safe-write behavior satisfy portability without leaking machine-private paths?
- Does the export spike justify Sprint 026 DOCX, and what concrete editable-content acceptance is feasible without threatening PDF and desktop must-haves?
- Which platform/runtime/build dependencies can be verified now, and what exact checks must the release owner perform later on macOS 14+, Windows 11+, and Ubuntu 24.04+?

These are Sprint 020 contract/evidence questions, not permission to defer decisions into feature implementation. Resolve each in the V0.4 spec or record a concrete Lead Developer scope decision. Do not downgrade a must-have without approval.

## V0.4 Sprint 020 Clarifications

- **Syntax and declaration visibility:** `table name = table(binding) { ... }`, `chart name = kind(binding) { ... }`, and top-level `show name` are specified in `docs/language-spec-v0.4.md`. Declarations are entry-module-only, become visible in source order across executable blocks, and do not emit until shown. Each `show` snapshots the current binding and emits at that fence position.
- **Supported shapes and bindings:** Tables require typed record lists with scalar/nullable-scalar columns. Bar/column and line charts support typed record lists or scalar number lists with the required field roles and optional matching labels. Scatter is typed record-list-only with numeric x/y and optional string grouping. Unsupported types/options and nullable record elements fail static checking.
- **Ordering, invalid values, and empty states:** Table input order is initial and stable-sort ties preserve source order; nulls sort last. Chart categories, points, and series preserve specified input/declaration order. Numeric nulls create gaps or omit scatter points; other invalid values fail validation. Accessible empty/no-match states and static text/value representations are required.
- **Activation, execution, placement, and compatibility:** V0.4 syntax activates complete-graph parse/link/check before input loading/evaluation/output. V0.2/V0.3-only documents remain unchanged. Views emit after the existing escaped source listing at each `show` fence; narrative order and final-environment interpolation remain intact. V0.3 module/input/output semantics are preserved.
- **PDF entry points and paths:** CLI is `openamx export pdf <input> --out <path>`; desktop uses a typed main-process export request. PDF uses A4 portrait, 18 mm margins, page numbers, explicit breaks, text headings/tables, and static charts. Destination must be explicit `.pdf`; paths resolve from CLI cwd or desktop project root, parents must exist, input/module conflicts and symlinks are rejected, and temp-file-plus-atomic-rename preserves an existing destination on failure.
- **PDF engine:** pdfmake 0.3.11 is selected for Sprint 023 based on offline Bun/Linux evidence. Chrome 152.0.7977.82 was exercised but adds an independently versioned browser and produced different pagination. Neither proof claims exact visual parity; limitations are recorded in the spike report.
- **PDF font licensing follow-up:** pdfmake package metadata declares MIT, but its installed package does not include a separate license file with the bundled Roboto fonts. Sprint 023 must verify redistribution terms or use approved fonts before production embedding.
- **Electrobun/shadcn ownership correction:** Electrobun SDK aliases remain generated under `.hutch/devkit`; shadcn component/helper aliases use `@/` and source-owned files under `src/mainview`. The direct typecheck and Vite build pass after this correction. Hutch prepare's traced config loading does not access shadcn components and stalls after serializing the valid Electrobun config, so the command-path issue is separate.
- **tsconfig ownership:** The app tsconfig now explicitly maps only the Electrobun SDK API entrypoints into `.hutch/devkit`, maps `@/*` to `src/mainview/*`, and does not inherit Hutch's generated tsconfig/baseUrl. Direct TypeScript validation passes, but Hutch prepare still stalls, so tsconfig inheritance is not the remaining cause.
- **Electrobun native proof:** Ubuntu runtime libraries now resolve. Direct launch of the Electrobun dev bundle under Bun 1.4.0 produced a 720x520 X11 window and logged typed webview-to-main RPC requests with `LIBGL_ALWAYS_SOFTWARE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1`. The app exited cleanly later; screenshot/persistent-session proof is unavailable. Hutch prepare/build/dev package commands still time out, so keep the Sprint 020 gate open for review; no framework change or must-have reduction is adopted.
- **Unsaved buffers and RPC:** A file-backed entry path plus in-memory entry text reuses `parseDocumentText` and the existing loader. Local imports retain canonical entry-root containment; configured CSV/JSON mappings retain validation and original source locations. Webview RPC is typed and payload-only; future open/save/module/input/evaluation/export operations stay in the main process. Untitled execution with relative resources must first receive a project location.
- **Project config and precedence:** Portable defaults are `.openamx/project.json`; machine-local paths go in ignored `.openamx/local.json`; precedence is per-run override, local override, then project default. Relative desktop paths use project root; CLI V0.3 path bases remain unchanged. Local data paths are main-process-only and no secrets or private overrides enter shared config.
- **DOCX:** The export spike did not test editable DOCX. Keep it a non-blocking stretch with semantic editable text/tables and permitted chart images; no DOCX work is authorized by this sprint.
- **Platforms and prerequisites:** The available host is Ubuntu 24.04.4 under WSL2, not a native release-owner runner. GTK 3.24.41 and the WebKitGTK 4.1, JavaScriptCoreGTK 4.1, Ayatana AppIndicator, and librsvg runtime packages are now present. Native Ubuntu 24.04+, macOS 14+, and Windows 11+ build/launch checks remain explicitly unverified.

All contract questions have an adopted specification rule. The Electrobun must-have remains in scope. Lead Developer's Sprint 020 Option 2 disposition closes that sprint's gate for Sprint 021 while preserving Hutch scripted-command and persistent-window verification as explicit residuals.

## V0.4 Sprint 021 Contract Clarification (Resolved)

- Lead Developer selected `AMX4003` for a runtime mismatch between scalar chart values and their `String[]` labels. Validate at `show`, before rendering or output writes, and identify the view and labels option location. This is a runtime typed-data validation diagnostic, not a static type error.

## V0.4 Sprint 021 Builder Completion

- No blocking contract questions remain. The approved `AMX4003` clarification is reflected in `docs/language-spec-v0.4.md`.
- Root verification on 2026-09-29: `bun run build` passed; `bun test` passed (176 tests, 710 assertions, 0 failures); `git diff --check` passed. Focused parser/checker/runtime/module/CLI no-write checks also passed.
- Sprint 022 receives only typed ordered emission snapshots; interactive/static HTML and editor work remain deferred. Sprint 020's Hutch package-command and persistent-window residuals remain explicit and do not become passed by this Sprint 021 completion.

## Assumptions Made (clearly marked per builder rules)

- **Expression placeholder for lets in Sprint 002**: The requirements state "capture identifier name and the raw expression text (or a minimal ExpressionNode placeholder)". Full expression parsing is explicitly out of scope (Sprint 003). 
  - Assumption: We will implement minimal scaffolding in `parseExpression.ts` supporting only atomic cases (number literals, string literals, boolean literals, simple identifiers). 
  - For any RHS that is not a simple atomic (e.g. contains operators like `a + b`), during Sprint 002 the splitter will produce an `IdentifierNode` whose `name` holds the raw RHS text as a placeholder. This satisfies the `expression: ExpressionNode` type contract on `VariableDeclarationNode` without implementing any operator/Pratt logic.
  - This placeholder approach will be replaced in Sprint 003; no tests in this sprint rely on complex expressions being correctly structured.
  - Recorded here so future sprints know this was temporary scaffolding.

- **Malformed let lines**: If a line starts with `let ` but does not match `let <valid-id> = <expr>`, the statement splitter will throw a descriptive Error (e.g. "Malformed let declaration..."). This fulfills "do not silently ignore". Full AMX error codes + diagnostics objects are out of scope for this sprint (only basic error handling for front matter is called out in acceptance). Tests for this sprint focus on happy paths + front matter errors.

- **SourceLocation granularity**: Per blueprint, "Column precision can be basic." We set `column: 1` for all nodes in this sprint. Line numbers are accurate.

- **parseDocument API**: It reads from disk (per requirements) so it is `async`. Lower level `parseFrontMatter(content: string)` and `parseStatements(body: string)` are pure and used directly by tests to avoid temp files for most cases.

- **Narrative whitespace**: Empty lines and paragraph structure inside narrative are preserved exactly (by collecting original lines). Only `let ...` lines are omitted.

- **Front matter edge cases**: We handle absent, empty `---\n---`, simple key/values. Complex YAML (anchors, tags) not required for v0.1. Malformed YAML throws Error with message (tests expect clear indication).

- **Identifier rules**: Strictly case-sensitive. Regex: starts with letter, followed by letter/digit/_ . Matches spec examples.

No other ambiguities found in the sprint artifacts. If new questions arise during implementation they will be appended here before proceeding.

## Open Questions (none currently blocking)

## V0.2 Sprint 007 Clarifications

- Resolved the master-plan question about newline/semicolon behavior: newlines are the only statement and match-arm separators; semicolons do not separate either construct.
- Resolved match-arm syntax and placement: `case <literal> => <expression>` and exactly one `default => <expression>`; default is fallback and may appear at any position; cases are evaluated in source order.
- Resolved fence and source-location rules in `planning/decisions.md` and Sprint 007 requirements. No blocking language-contract questions remain for the Builder handoff.
- The remaining implementation details belong to their assigned later sprints; do not treat them as open requirements for Sprint 007.
- Sprint 007 input check: `.agents/main.md` and all requested planning/sprint inputs were present. `docs/language-spec-v0.2.md` was created as the requested sprint deliverable; there were no missing referenced inputs to carry forward.
- Verification deviation: existing evaluator and renderer test helpers used `parseStatements` as a mixed bare-let/narrative document splitter. Once it became the declaration-only code-block parser, those helpers failed. Their test-only fixture construction now builds the same lower-level AST directly; production parsing remains fenced-only, and runtime/renderer code is unchanged.

## V0.2 Sprint 008 Clarifications

- The authoritative V0.2 grammar had `for` only as a statement despite defining expression-form loops in prose. Resolved by adding `ForExpression` to the grammar: expression-context loops require exactly one `return expression`; statement-context loops contain none.
- The return may appear among ordinary loop-body statements; statements after it still execute. It records this iteration's result and never exits the loop early.
- Only the iterator is loop-scoped. It shadows and restores an outer binding, including on evaluation failure; other declarations and mutations use and persist in the caller-provided shared environment.
- No blocking questions remain for the Sprint 008 Builder handoff. `match` remains reserved for Sprint 009; whole-document multi-block evaluation/rendering remains Sprint 010.

## V0.2 Sprint 008 Builder Completion

- No blocking ambiguities or contract deviations arose during implementation. The grammar clarification for expression-form loops remains consistent with the approved Sprint 008 requirements and decisions.
- Acceptance coverage includes both undefined assignment operators, ascending/descending/equal and invalid ranges, list/range statement loops, nested expression-loop use, exactly-one-return validation, empty expression loops, continued side effects after return, iterator restoration after success and failure, shared loop-body declarations/mutations, invalid iterables, and the Sprint 007 executable-fence boundary.
- Verification: focused `bun test tests/parser.test.ts tests/evaluator.test.ts` passed (70 tests); `bun run build` passed; full `bun test` passed (81 tests, 198 assertions). No implementation deviation to carry forward.
- `match` remains Sprint 009, and document-wide multi-block execution/rendering remains Sprint 010.

## V0.2 Sprint 009 Clarifications

- Resolved match cardinality: exactly one default is required; case arms are optional, making a default-only match valid. The default may occur at any arm position.
- Match selection uses strict type-and-value equality, evaluates the scrutinee once, checks cases in source order, selects the first match (including duplicate literal cases), and evaluates only the selected branch.
- Negative numeric literal patterns are accepted; guards, destructuring, non-literal patterns, and match statements remain deferred/out of scope.
- No blocking questions remain for the Sprint 009 Builder handoff. Sprint 010 still owns document-wide execution, rendering, and final-environment interpolation integration.

## V0.2 Sprint 009 Builder Completion

- No blocking ambiguities or deviations arose. Default-only, default placement, strict typing, duplicate first-match selection, non-selected branch laziness, nested expression/loop composition, malformed arms, and original-document match/arm coordinates are covered.
- Verification: initial case/fallback/strict/location probe passed; focused parser/evaluator suites passed (78 tests); `bun run build` passed; final full `bun test` passed (89 tests, 244 assertions), including the strengthened scrutinee-once assertion. Sprint 010 remains responsible for rendering and document-wide execution.

## V0.2 Sprint 010 Clarifications

- Formatter scope is explicitly layout-only because the parser AST does not retain original token spans/string quoting. It canonicalizes line endings, indentation, blank-line edges, and trailing whitespace while preserving intra-line expression/source text; this keeps formatting semantics-preserving and avoids introducing a second expression printer.
- Document execution is a first pass over executable blocks only, sharing one environment. Rendering is a second pass in document order; all narrative interpolation observes final state, including later mutations.
- Executable source is rendered as HTML-escaped formatted code without fence delimiters, Markdown parsing, or inline interpolation. Ordinary Markdown fences and bare declarations remain non-executable.
- No blocking questions remain for the Sprint 010 Builder handoff. Sprint 011 extension work remains out of scope.

## V0.2 Sprint 010 Builder Completion

- No blocking ambiguities or contract deviations arose. Formatter idempotence, parser-valid formatted output, nested indentation, and quoted brace handling passed focused tests.
- Verification: focused evaluator/renderer tests passed (70 tests); `bun run build` passed; final `bun test` passed (96 tests, 261 assertions). Output determinism, final-environment interpolation, once-only execution, and escaped executable code are covered.
- Sprint 010 is complete. Sprint 011 extension work remains out of scope for this handoff.

## V0.2 Sprint 011 Clarifications

- Use `vscode-extension/` as the focused package; leave the root project layout and root TypeScript build configuration intact.
- Providers must parse unsaved buffers through a pure core text API. Path-based `parseDocument` remains compatible and delegates to the shared text parser; extension runtime code is Node-based and must not call Bun APIs.
- Completion scope means variables declared in preceding executable blocks or before the cursor in the current block, plus the active loop iterator. Later-only and narrative-only names are excluded.
- Publisher is `EngineersTools`. Package and locally install a VSIX, but do not publish it. Provider checks run in an Extension Development Host.
- No blocking questions remain for the Sprint 011 Builder handoff. Marketplace publication and LSP remain explicitly out of scope.

## V0.2 Sprint 011 Builder Completion

- No blocking language or provider ambiguities arose. Formatting, completion scope, parser-only diagnostics, diagnostic clearing, pure text parsing, host behavior, packaging, and local installation were verified.
- The Extension Development Host ran on VS Code 1.85.0. `xvfb-run` was unavailable, but the active `DISPLAY=:0` allowed the host to run. The host emitted environment/built-in extension DBus/API warnings; all OpenAMX tests passed.
- `vsce` warned that the repository has no license file. This did not prevent a local VSIX from being built and installed; choosing and adding the project license remains necessary before any Marketplace publication.
- Exact verification: root `bun run build && bun test` passed (97 tests, 265 assertions); extension `bun run test` passed (3 tests); installed-artifact run with `OPENAMX_EXTENSION_PATH=/home/cgamez/.vscode-server/extensions/engineerstools.openamx-vscode-0.2.0 bun run test` passed (3 tests); `CI=1 bun run package` produced the 6-file `vscode-extension/openamx-vscode-0.2.0.vsix` (61.67 KB); `bun run install-local` succeeded; `code --list-extensions --show-versions` reported `engineerstools.openamx-vscode@0.2.0`. Nothing was published or uploaded.

## V0.2 Sprint 012 Clarifications

- The transformer-strategy example will become the Power Transformer Failure Mode Analysis, and `examples/asset-fleet-risk-analysis.amx` will be the second end-to-end Risk Analysis document. Both examples collectively cover the V0.2 acceptance surface without adding domain-specific core features.
- Expected computed values must be stated in tests and checked against parsing/evaluation of the real example source; checked-in HTML is regenerated through the CLI.
- The ordered V0.3 roadmap is recorded in `planning/decisions.md` and remains explicitly unimplemented.
- The repository has no license file. Do not select or add one during Sprint 012; record that Marketplace publication remains deferred until the project makes an explicit license decision. Local VSIX packaging/install is still a Sprint 012 verification requirement.
- No blocking questions remain for the Sprint 012 Builder handoff. V0.2 must not be marked complete if a required core, example, extension-host, packaging, or local-install check is blocked or unverified.

## V0.2 Sprint 012 Builder Completion

- No blocking questions arose. The actual-file tests exposed one concrete renderer defect: interpolated markup-significant characters were not escaped before Markdown conversion. The narrow fix and regression are recorded in decisions and the V0.2 spec; no other language/extension change was needed.
- Root build and full test suite passed (100 tests, 294 assertions), all example renders and both domain CLI run outputs passed, and checked-in HTML matches renderer output. Extension host tests passed on VS Code 1.85.0 (3 from source, 3 from installed VSIX). Packaging yielded `openamx-vscode-0.2.0.vsix` (6 files, 61.74 KB); local install and installed extension listing succeeded.
- Nonblocking environmental warnings: VS Code host DBus portal/built-in Python extension API warnings; `vsce` reports a newer version and a 297.03 KB bundled JS file. `vsce` prompted to continue without a license file despite `CI=1`; local packaging required and received confirmation. The project license selection/file remains an unresolved publication prerequisite for the Lead Developer, not a Sprint 012 language or acceptance blocker. Marketplace publication was not attempted.
- Ordered V0.3 candidates, unimplemented: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring.

## V0.3 Sprint 013 Clarifications

- **Blocking ambiguity recorded before contract revision**: The V0.3 master plan requires initial field contracts for six Asset Management records, while its further considerations say their exact fields and meanings need domain review before the library is stable. It is unclear whether Sprint 013 is expected to approve normative domain semantics or only publish initial schemas. For this contract, the conservative disposition is initial structural schemas only: fields are data shape, not endorsed domain rules, calculations, or constraints. Domain approval remains a gate before treating the library as stable; this does not block Sprint 013 or the general-purpose type system.
- Resolved absence/null/default behavior: optional field presence and nullable type are separate; constructors materialize every field, and an optional no-default field is nullable and becomes `null`.
- Resolved nested CSV policy: CSV supports scalar-field record lists only; nested records/lists and JSON-in-cell encoding are rejected.
- Resolved purity: functions are non-recursive expression bodies without document captures or expression loops, making shared-state mutation impossible.
- Resolved module boundary: named local relative imports stay within the entry directory tree; DFS source-order loading evaluates each dependency once and rejects cycles.
- Resolved validation/output: aggregate validation is default with deterministic fail-fast option; only exported entry-module values are eligible for `--output name=path`.
- No blocking Sprint 014 language/type-system contract questions remain. The six Asset Management schemas are initial structural contracts only; domain review is required before they are treated as stable. The project license decision remains unrelated and non-blocking for this sprint.

## V0.3 Sprint 013 Builder Verification

- On 2026-09-29, `bun run build` passed; `bun test` passed (100 tests, 294 assertions, 0 failures); and `git diff --check` passed from the repository root. These checks confirm the documentation-only sprint did not alter the V0.2 implementation baseline.
- Markdown diagnostics reported no errors in `docs/language-spec-v0.3.md` or the four Sprint 013 artifacts. `planning/questions.md` reports three existing diagnostics in its pre-Sprint-013 V0.1 section: MD009 trailing spaces at its historical lines 5 and 6, and MD038 spacing in an existing code span at historical line 11. The new Sprint 013 question/clarification text has no reported diagnostic. Historical text was left unchanged.
- The V0.3 contract and four sprint artifacts are delivered pending Lead Developer review. Sprint 014 implementation must wait for acceptance. No changes were made to `src/`, `tests/`, `examples/`, `vscode-extension/`, manifests, generated HTML, or the V0.2 specification.

## V0.3 Sprint 014 Clarifications

- Sprint 013 is accepted for Sprint 014 planning. The V0.3 specification accidentally contains an obsolete preliminary draft before the later complete contract; Sprint 014 removes the duplicate without altering approved semantics before implementation.
- No blocking language/type-system question remains. The checker activates only for V0.3 documents/options, so strict V0.3 typing does not retroactively reject V0.2-only programs.

## V0.3 Sprint 015 Clarifications

- No blocking function/module question remains. Function call frames contain parameters and permitted callable symbols only; they do not capture module or document bindings.
- Module resolution and canonical containment are loader responsibilities. Sprint 015 exposes exports only to imports; CLI input/output behavior remains deferred.
- The initial Asset Management library remains structural and opt-in. Domain review is still required before calling its schemas stable standards.

## V0.3 Sprint 016 Clarifications

- No blocking input/validation question remains. Input declarations are entry-only and mappings always originate at the CLI boundary; imported modules remain input-free.
- CSV is deliberately shallow. Nested JSON remains supported, but nested/list CSV fields and JSON-in-cell encoding are rejected.
- Duplicate JSON keys must be rejected rather than silently overwritten. Aggregate and fail-fast diagnostics use the same deterministic input/data traversal.

## V0.3 Sprint 017 Clarifications

- No blocking output question remains. Output names select only explicit entry-module exported bindings; imports never implicitly become CLI outputs.
- Serialization completes before writes, but individual filesystem write failures may leave earlier destinations present. This is deterministic ordering, not a transaction guarantee.
- CSV stays limited to typed scalar-field record lists. Empty record lists still emit their declared headers; nested/list/scalar CSV exports are rejected.
- The Sprint 017 acceptance text groups non-finite numbers with `AMX6001`, while authoritative V0.3 spec section 11 assigns `AMX6002` to serialization failures and section 12 rejects non-finite JSON numbers. Following the handoff's spec-authoritative rule, unsupported export shapes use `AMX6001`; non-finite values discovered during serialization use `AMX6002`.

## V0.3 Sprint 017 Builder Completion

- No blocking ambiguity arose. The only acceptance/spec mismatch and its conservative, spec-authoritative disposition are recorded above; no language or serialization rule was otherwise invented.
- Final verification on 2026-09-29: `bun run build` passed; focused serializer/CLI tests passed (9 tests); integrated output/loader/regression tests passed (35 tests); `bun test` passed (156 tests across 9 files, 0 failures); `git diff --check` passed. Output ordering, no-option compatibility, explicit entry-export selection, declared-type JSON/CSV round trips, and AMX6002 write failure behavior are covered.

## V0.3 Sprint 018 Clarifications

- No blocking authoring-contract question is known. Editor checks use the current unsaved buffer for the entry document and may read local `.amx` dependencies only for explicit import visibility; they never evaluate AMX or load CSV/JSON data files.
- If a dependency cannot be resolved accurately, report the localized issue or withhold that completion; do not invent symbols. The implemented resolver requires a file-backed entry URI and confines dependencies to its canonical directory tree; untitled entry documents with imports therefore receive an unavailable-import diagnostic and no imported completions.
- Release-wide extension documentation/version metadata and Marketplace publication remain outside Sprint 018. Packaging and local VSIX installation remain required despite the unresolved license decision.

## V0.3 Sprint 018 Builder Completion

- No blocking ambiguity or contract deviation arose. The host tests prove unsaved entry-buffer checking, explicit import visibility, missing-export/cycle reporting, original-coordinate AMX3002 diagnostics, edit clearing, V0.2 behavior, and no input mapping/runtime validation in the editor.
- Verification on 2026-09-29: root `bun run build && bun test` passed (157 tests, 607 assertions); focused formatter tests passed (4 tests, 11 assertions); extension compile passed; source and installed-VSIX host suites each passed (11 tests on VS Code 1.85.0); local package/install and installed-extension listing passed. Exact artifact, commands, warnings, and limitations are recorded in `planning/state.md`.
- Local packaging continued only after confirmation of the missing-license warning. No license was selected or added, and no Marketplace upload was attempted. DBus/Python API-proposal host warnings were unrelated and did not affect tests.
- Formatter probing found an existing core parser limitation for record constructors directly in `match` arms; the formatter cannot format that composition until the parser brace scanner is corrected. No language rule was changed and no editor-only parser workaround was added in Sprint 018.

## V0.3 Sprint 019 Clarifications

- No blocking acceptance-scope question is known. The typed-data example must import opt-in schemas from a valid local module path inside its entry root; a fixture-local library copy is permissible, but a core built-in or relaxed path rule is not.
- Sprint 018's record-constructor-in-`match`-arm parser limitation needs a direct contract conformance test and explicit disposition in the V0.3 release record. Do not claim full support if that test remains failing.
- The six Asset Management shapes are initial schemas without domain validation or certified scoring rules. A project license decision/file remains a separate prerequisite for Marketplace publication; do not infer or add one during Sprint 019.

## V0.3 Sprint 019 Builder Completion

- No blocking questions arose. The typed example, exact CLI assertions, root gates, extension host gates, VSIX packaging/install, and installed-artifact host rerun passed.
- The known constructor-in-`match` limitation is a recorded residual conformance issue, not a silently accepted feature. The V0.3 release record and README identify it as unsupported.
- No license was selected or added. Marketplace publication/upload remains outside the completed local acceptance scope.

## V0.3 Sprint 014 Builder Completion

- No genuinely blocking type-system ambiguity arose; no unapproved language rule was introduced. The obsolete draft was removed without altering the later complete contract. Sprint 014 does not provide V0.3 CLI options, modules, inputs, or outputs; their activation paths belong to Sprints 015-017.
- Final verification on 2026-09-29: `bun run build` passed; `bun test` passed (106 tests, 403 assertions, 0 failures); `git diff --check` passed. Focused parser probe passed (1 test); focused checker/evaluator probe passed (5 tests, 101 assertions); combined parser/evaluator suites passed (86 tests, 316 assertions before the final cases). Markdown diagnostics were clean for the corrected specification and all four Sprint 014 artifacts. No contract deviations or blockers remain for this sprint.

## V0.3 Sprint 015 Builder Clarifications

- **Non-blocking ambiguity resolved before implementation**: Section 8 states "Imports and inputs may not appear in an imported module" immediately after describing depth-first, cycle-aware module resolution, which is only meaningful for graphs deeper than one level. Read literally, that sentence would make transitive imports and any cycle other than direct self-import impossible, contradicting the DFS/cycle-detection language in the same section. The conservative, contract-consistent disposition adopted here: only `input` is entry-module-only; `import` may appear in any module (entry or dependency), enabling genuine transitive graphs and multi-module cycles. This is recorded here rather than left silently assumed; it does not relax any other module rule (containment, explicit exports only, no re-export, isolated environments, evaluate-once).
- Imported-value mutation and redeclaration are diagnosed as `AMX5002` (not `AMX3005`), matching the acceptance criteria's explicit listing of "imported-value mutation" alongside missing/duplicate exports and collisions under the `AMX5002` family.
- No other blocking function/module/library ambiguity arose. The six Asset Management schemas were packaged verbatim from the V0.3 contract with no calculations or constraints added.

## V0.3 Sprint 015 Builder Completion

- Implemented typed pure functions (unique parameters, required return type, single-expression body, purity enforcement: no document/import capture, no recursion, no forward calls, no `for` expressions, no standard-library name shadowing), local module imports/exports (`fn`, `import { ... } from "..."`, `export` prefixing `type`/`fn`/top-level `let`), and a dedicated module loader (`src/runtime/moduleLoader.ts`) that canonicalizes paths, enforces entry-directory containment, performs source-order depth-first resolution, evaluates each module once before its importer in isolated environments, and detects cycles. Added `libraries/asset-management.amx` exporting exactly the six approved schemas with no core registration. CLI `run`/`render` now go through the loader; a document with no imports follows the identical checked/unchecked V0.2 path as before.
- Verification on 2026-09-29: `bun run build` passed; full `bun test` passed (128 tests, 462 assertions, 0 failures), including 17 new focused module-loader tests (function purity/calls, import/export visibility, diamond dependency evaluate-once-by-reference, immutable-import protection, missing/duplicate/colliding names, invalid/outside-root paths, cycle detection, and real `libraries/asset-management.amx` usage) and 5 new focused parser tests for `fn`/`import`/`export` syntax and placement. All three example renders and both example `run` commands were regenerated and are byte-identical to the committed HTML (`git status --porcelain` reported no example diffs); `git diff --check` passed. No input/output/validation/serialization/extension feature was implemented; Sprint 016/017 scope was not started.

## V0.3 Sprint 016 Builder Completion

- No blocking ambiguity or contract deviation arose. UTF-8 failures are malformed-data diagnostics; duplicate JSON keys are rejected with data-path/location context; CSV uses the specified shallow record-list mapping. Output selection and serialization remain deferred to Sprint 017.
- Final verification on 2026-09-29: `bun run build` passed; `bun test` passed (147 tests, 549 assertions, 0 failures); `git diff --check` passed. Focused parser, JSON/CSV, checker, loader, and CLI checks passed, including aggregate/fail-fast ordering, prevention of evaluation/HTML writes after invalid input, and V0.2 no-option `run` compatibility.
