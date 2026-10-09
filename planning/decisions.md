# Planning Decisions

## V0.11 Sprint 065 Architect Preparation (2026-10-09)

- The V0.11 master plan is the scope authority. Sprint 065 is a no-dependency contract/feasibility gate; Sprint 066 depends on its separate Lead Developer approval.
- Preserve all existing language/evaluation, report identity/order, interpolation, show-time snapshot, measurement, emitted-table, working PDF, and atomic export behavior. No production code, dependency/lockfile, cap, iframe, or UX changes are authorized during Sprint 065.
- Required outcomes include destination-neutral Markdown behavior; visible authored prose newlines and whitespace-preserving code; inert raw HTML; stable headings; canonical local image containment; final-output-relative file links; and faithful editable native Word charts for all four existing chart kinds.
- Word desktop editing/save/reopen and Word web save/download preservation are application-level gates. OOXML/API success is not a substitute. If actual application access is unavailable, the gate remains blocked rather than passing by inference.
- A required chart case that cannot be represented faithfully as an editable native chart requires an explicit Lead Developer product decision. No coercion, axis-semantic change, chart-kind substitution, or static-image fallback is approved.
- The desktop preview protocol remains a proposal: click-only opaque target IDs, active frame/revision binding, host mapping/revalidation, allowlists and confirmation, retaining opaque-origin isolation and denying raw URLs/paths and privileged access. No protocol implementation or permission change is authorized yet.
- This entry records Architect preparation only; contract proposals, probe outcomes, Sprint 066 authorization, release readiness, and V0.11 acceptance remain pending.

## V0.10 Final Implementation Disposition (2026-10-08)

- **ACCEPTED / CLOSED WITH RECORDED RESIDUALS.** The Lead Developer accepts the V0.10 implementation and closes its implementation work.
- Sprint 064's SSIM miss, unmeasured 2 CSS px bounds, data-editor polling timeouts, and platform/accessibility limits remain recorded residuals. The acceptance does not change their pass/fail/unmeasured status.
- No release readiness, publication, or broader platform/accessibility certification is authorized or implied.

## V0.10 Sprint 064 Lead Developer Disposition (2026-10-08)

- **COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer accepts the Sprint 064 closeout and confirms testing of the new features.
- Accept the cross-surface SSIM miss and unmeasured 2 CSS px chart bounds as named Sprint residuals, without changing or waiving the target. Preserve the parallel and isolated desktop data-editor poll timeouts as unpassed.
- At the Sprint 064 disposition point, final V0.10 status remained separate. It is now resolved by the final implementation disposition above; release readiness and publication remain unapproved.

## V0.10 Sprint 064 Builder Evidence (2026-10-08)

- Preserve Sprint 064's matched-crop record-bar SSIM result (0.244895) as **below** the proposed >=0.97 target. The plot/label <=2 CSS px bounds were not measured. Do not waive or redefine either target; Lead Developer must disposition the evidence or approve an alternative measure.
- Preserve the parallel root full-suite result (400 passed, 2 Windows-only skips, 1 desktop data-editor polling timeout at 543.40 ms), the serial root result (401 passed, 2 skips, 0 failed), and isolated data-editor timeouts at 539.47 ms and 534.01 ms as separate runs. No data-editor change is authorized or made.
- The Linux x64 stable archive worker/resources and one mapped native Linux window were directly checked. These results do not imply native installer acceptance on other systems, cross-platform/browser support, or formal accessibility certification.
- Builder evidence is submitted; final V0.10 acceptance remains a separate Lead Developer decision. No release, publication, or self-acceptance.

## V0.10 Sprint 064 Architect Preparation (2026-10-08)

- Sprint 062 and Sprint 063 satisfy Sprint 064's dependencies with separate **COMPLETE / APPROVED WITH RECORDED RESIDUALS** dispositions. Sprint 064 owns integrated acceptance and closeout only; it adds no product feature scope.
- Preserve Sprint 063's desktop data-editor polling timeout as unpassed (parallel full suite: two timeouts; serial: one timeout at 532 ms versus a 500 ms poll). Do not alter unrelated data-editor code to force a pass absent a reproduced V0.10 defect and explicit direction.
- Reconcile every chart result across the shared Sprint 061 model, Sprint 062 HTML/desktop path, and Sprint 063 static PDF path. Measure visual parity against the approved proposal (SSIM >= 0.97; plot/label bounds within 2 CSS px where meaningful), or submit an evidence-backed alternative for approval.
- Retain the no-network HTML security result at its tested Chromium/Linux scope; verify the actual zero-request behavior in integrated output. Retain exact limits for native app launch, other hosts/browsers, formal accessibility, larger end-to-end data, and release/publication.
- Update only current reporting docs, representative existing examples/output, and bundled Help to accurately describe verified behavior. Historical specs and DOCX behavior remain unchanged unless a specific approved correction is required.
- Final V0.10 acceptance is a separate Lead Developer disposition after Builder evidence. Neither Sprint 064 completion nor prior sprint approvals imply V0.10 acceptance or publication authorization.

## V0.10 Sprint 063 Lead Developer Disposition (2026-10-08)

- Production PDF rendering consumes only Sprint 061 `createChartViewModel(emission, report.identity)` and exact root ECharts `6.1.0`. The PDF destination option is a non-mutating shallow derivation retaining formatter callbacks; only static tooltip/title/axis presentation is adjusted. Full shared table rows/headings remain searchable. Each SSR chart instance is disposed in `finally`.
- Empirical production output uses the Sprint 060 tested subset plus `<g>`. The `<g>` output was serialized by pdfmake `0.3.11` and visually inspected in actual CLI PDF rasters; no gradients, filters, patterns, or images appeared. The runtime rejects element tags outside the measured accepted set. Generated IDs remain variable; semantic and raster comparison is used instead of byte equality or regex normalization.
- A valid-render fault seam proves surfaced failure before atomic write, preserving an existing file with no temp residue. No public diagnostic code was added. Chart captions/descriptions/graphics are a chart-only unbreakable stack; actual report-width measurement exposed and corrected clipped unit axis names and empty-state axes. These do not alter chart data/meaning.
- DOCX and Sprint 062 source remain unchanged. Focused root/worker tests, desktop RPC, root build, desktop typecheck, actual PDF raster/font checks, and exact unpassed full-suite timing residuals are recorded in Sprint 063 Builder evidence.
- **COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer accepted Sprint 063 and closed the sprint. Preserve the desktop data-editor polling timeout as unpassed. This disposition does not claim native desktop launch, platform certification, Sprint 064 integrated acceptance, V0.10 completion, release readiness, or publication.

## V0.10 Sprint 063 Architect Preparation (2026-10-08)

- Sprint 063 depends on Sprint 061 only and may proceed independently of Sprint 062 per the master plan. Both Sprint 061 and Sprint 062 are **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by separate Lead Developer dispositions.
- Use the approved exact root `echarts@6.1.0` and `createChartViewModel` as the sole PDF chart meaning/theme/data source. Static Bun SSR SVG replaces only the custom chart graphic path in `reportPdf.ts`; existing pdfmake structure and CLI/worker destinations remain.
- Preserve full searchable captured table data, report order/identity/page breaks, existing A4/page-flow constraints, Roboto/local-only resource policy, and atomic destination handling. PDF is static and never consumes HTML legend/zoom state.
- Sprint 060 directly proved only a named ECharts SVG subset in pdfmake `0.3.11`. Inspect actual production SSR output and rasterized PDFs; do not infer appearance from successful serialization. SVG generated IDs cause raw byte variation; prefer semantic/raster stability evidence and avoid ad-hoc XML rewriting.
- Keep Sprint 062 HTML/desktop/security implementation and DOCX renderer unchanged. Native desktop launch, other platforms, formal accessibility, cross-surface tolerance, larger end-to-end data limits, and valid chart-render failure injection remain separate residuals unless directly tested in scope.

## V0.10 Sprint 062 Lead Developer Disposition (2026-10-08)

- **COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer accepts the Sprint 062 Builder evidence and closes the sprint.
- Accept the verified sanitizer/navigation containment and `allow-scripts`-only opaque preview gate, shared-model interactive HTML, offline standalone output, tested chart interactions/print/lifecycle, root and desktop regressions, and available Linux packaged-worker/resource evidence as recorded.
- Retain exact unverified boundaries: native Electrobun window/install/launch and non-Linux platforms; browser engines other than Chromium; formal accessibility audit; cross-surface visual tolerance; >5,000-point end-to-end bounds; valid chart-render failure injection. Sprint 060's generated SVG ID variability remains relevant to static output.
- This disposition does not close Sprint 063 PDF chart integration or Sprint 064 integrated acceptance and does not imply V0.10 completion, release readiness, platform certification, or publication. DOCX remains unchanged.

## V0.10 Sprint 062 Architect Preparation (2026-10-07)

- Sprint 061 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS**. Consume its exact `echarts@6.1.0` root dependency, pure `createChartViewModel` API, immutable captured measurement descriptors, complete ordered table data, tooltip/accessibility inputs, and shared theme. Do not duplicate the model or re-normalize units.
- Sprint 062 owns only interactive HTML/desktop preview integration. CLI HTML, desktop preview and desktop HTML export use the shared rendering path; static PDF remains Sprint 063 and DOCX remains unchanged.
- The Sprint 060 link/meta-refresh escape is a failed security gate. Report-authored content needs an allow-list policy and zero attempted external navigations/requests. A blocked response/DNS error, CSP `navigate-to`, or opaque origin alone does not prove containment.
- Keep both preview sandbox attributes empty until hostile-content tests pass. Then permit only `allow-scripts`; never combine with `allow-same-origin` or grant navigation, forms, popups, downloads, or bridge/application privileges.
- Preserve Sprint 061 chart semantics and all named Sprint 060 residual statuses, including unavailable actual Electrobun packaging, generated SVG ID variance, unmeasured visual tolerance/large-data behavior, untested input methods, and render-failure diagnostics. No cap increase or architecture substitution is authorized.

## V0.10 Sprint 062 Builder Decisions (2026-10-08)

- Use exact root `sanitize-html@2.17.0` (MIT; notice at `node_modules/sanitize-html/LICENSE`) with one explicit Markdown allow-list shared by direct and prepared HTML rendering. Preserve visible link text as inert spans; no authored URL/resource attributes or styles survive. This is implementation evidence, not a request to expand authoring capabilities.
- Serialize only JSON chart option data and approved Sprint 061 metadata. Record known formatter paths and reattach fixed trusted tooltip/category/UTC callbacks from bootstrap. Reject unexpected functions and non-finite numeric values. ECharts browser runtime is embedded from exact root `echarts@6.1.0`; no `unsafe-eval` CSP permission.
- Use nonce-only runtime/script/style policy, with a dedicated `style-src-attr 'unsafe-inline'` directive for trusted ECharts-generated style attributes. Keep default/network/frame/form/object/base/worker/media restrictions. Text-only HTML uses deterministic `script-src 'none'; style-src 'none'` because it has no runtime.
- The no-navigation gate passed in local-file standalone output, actual sandbox-empty app preview, and a real test-only opaque `allow-scripts` frame before changing preview permission. Therefore both declared `App.vue` iframe sites now use exactly `allow-scripts`, retaining opaque origins and granting no other sandbox capability.
- Browser interactions are destination presentation only. Full table rows remain independent of legend/zoom state. Chart resize uses ResizeObserver; removal/pagehide disconnects observers and disposes instances. Print hides transient controls and keeps the chart plot and complete table.
- Sprint 062 Builder evidence reports exact Linux package worker/resource preview success, but does not claim native Electrobun application launch or other platform results. The separate disposition request is in `planning/sprints/0062-v10-offline-interactive-html-desktop-preview/builder-evidence.md`; Sprint 063 PDF and Sprint 064 integrated acceptance remain distinct.

## V0.10 Sprint 061 Builder Finding (2026-10-07)

- The approved requirement to preserve normalized measurement values and dimensional metadata cannot currently be met by a downstream-only adapter: `normalizeChartMeasurements` turns each measurement into a number and writes only `unit.text` into headings; `ChartViewEmission` exposes only those values/headings, not unit identity or dimension vectors.
- Before authorization, do not infer dimensional metadata from heading strings or change runtime/evaluator semantics without direction. The 2026-10-07 Lead Developer authorization below resolves the additive metadata boundary only; other AMX/runtime semantics remain unchanged.
- Sprint 060 remains COMPLETE / APPROVED WITH RECORDED RESIDUALS. Its residual evidence is unchanged.
- **Lead Developer authorization (2026-10-07):** add a narrowly scoped immutable unit/dimension metadata field to captured chart emissions; Sprint 061 may edit the runtime snapshot boundary and add focused tests. The field records the already-chosen display unit and does not redo normalization.
- Builder implementation captures the selected unit text, scale, factors, and dimension vector for normalized chart series and scatter x/y fields, while retaining existing normalized data and line-x snapshot values. The shared adapter remains downstream and is not wired into HTML/PDF/desktop.
- Verification: focused chart/model + renderer/PDF/presentation/measurement regressions pass (52 tests); root build passes; final root suite passes (397 tests, 2 existing Windows-only skips). Exact commands, dependency graph, notice inventory, and residuals are recorded in Sprint 061 evidence.
- **Lead Developer disposition (2026-10-07): COMPLETE / APPROVED WITH RECORDED RESIDUALS.** Sprint 061 is accepted as completed and closed. Sprint 060's residual statuses and Sprint 062/063 ownership remain unchanged.

## V0.10 Sprint 061 Architect Preparation (2026-10-07)

- Sprint 060 is **COMPLETE / APPROVED WITH RECORDED RESIDUALS**; Sprint 061 is explicitly authorized. Implement the approved ECharts `6.1.0` exact root dependency baseline and shared model contract; no duplicate desktop-only dependency.
- The adapter consumes immutable captured `ChartViewEmission` data downstream of existing evaluation/normalization. Preserve source order, duplicates, null semantics, measurement unit/dimension metadata, complete table data, and report snapshot behavior. Do not change AMX/runtime semantics.
- Apply Sprint 060's approved chart behavior: horizontal first-row-top bars, vertical columns, source-order numeric/DateTime lines with UTC ISO presentation and null gaps, distinct named axes for independently normalized units, and first-seen scatter groups with null-coordinate points omitted only from plot data.
- Establish a deterministic theme using the existing renderer palette and restrained resolved report accent. Keep the complete data table independent of ECharts interaction state and provide truthful accessibility metadata rather than library-generated null/DateTime ARIA.
- Keep production HTML/PDF/desktop integration in Sprints 062/063. The Sprint 060 external-link/meta-refresh navigation finding is still failed; do not enable iframe scripts or treat CSP/opaque-origin evidence as a fix.
- Actual Electrobun packaging, SVG generated-ID byte stability, cross-surface visual tolerance, greater-than-5,000-point envelope, pointer/keyboard/touch interaction, and public chart failure diagnostics remain evidence residuals. Sprint 061 does not claim or silently close them.

## V0.10 Sprint 060 Lead Developer Disposition (2026-10-07)

- **COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer approved all contract and architecture proposals in the Sprint 060 blueprint and authorized Sprint 061. The exact ECharts `6.1.0` candidate and proposed shared root dependency placement are approved as the implementation baseline; this does not claim that application integration or packaged-resource verification has occurred.
- The navigation escape, inaccurate default ARIA for null/DateTime, unavailable actual Electrobun package run, generated SVG ID churn, unmeasured cross-surface visual tolerance, 5,000-point-only performance envelope, untested pointer/keyboard/touch cases, and unavailable public chart-render failure injection remain named residuals with their original evidence statuses.
- Sprint 061 may implement the shared model/theme within the approved scope. Do not enable production iframe scripts or claim the no-network gate closed until the untrusted-navigation path is remediated and adversarially verified in its owning sprint. Residuals do not become passes by disposition.
- Sprint 061 is authorized but has not started. Sprint 060 approval is not V0.10 implementation completion, release readiness, native/platform certification, or a legal conclusion about distribution notices.

## V0.10 Sprint 060 Builder Findings (2026-10-07)

- Direct isolated evidence is recorded in `planning/sprints/0060-v10-echarts-rendering-contract-technical-gate/builder-evidence.md`; proposals and per-case status are in the Sprint 060 `blueprint.md`. These are Builder findings, not accepted product decisions.
- Candidate `echarts@6.1.0` passed isolated Bun 1.4.2 SVG SSR, Chromium 152.0.7977.82 local-file rendering, and pdfmake 0.3.11 serialization plus visual PDF inspection for the tested subset. Raw SSR SVG bytes differ across runs due to generated zrender IDs; normalized structure was stable.
- The opaque sandbox denied parent reads and bridge visibility, and nonce CSP blocked inline event handlers. External link and meta-refresh navigation still escaped to the network; no-unapproved-network is **not satisfied**. ECharts built-in accessible summaries used `NaN` for null and epoch milliseconds for DateTime.
- A temporary Bun worker bundle resolved ECharts, but no actual Electrobun app package/native runtime was tested. The subsequent Lead Developer disposition approves the candidate implementation baseline but does not upgrade this unavailable check or approve limit changes.
- Historical Builder closeout recommendation was to keep Sprint 061 blocked. It was superseded by the separate Lead Developer disposition above.

## V0.10 Sprint 060 Architect Preparation (2026-10-07)

- Sprint 060 consumes the scope and recommended shared-adapter direction in `planning/plan-openamxV10MasterSprintPlan.md`; it may specify implementation-facing contracts but may not redefine AMX chart/data semantics or broaden product scope.
- Treat the ECharts version, package placement, browser bootstrap, security configuration, option/data model details, visual tolerances, limits, and PDF/desktop compatibility as gate questions until supported by direct evidence and explicit Lead Developer disposition.
- The proposed shared chart model must preserve captured emission order, existing normalization/dimensional metadata, null semantics, immutable snapshots, and report pipeline behavior. Interactive browser state must not alter static exports or captured AMX data.
- Feasibility experiments are isolated and disposable. No production renderer changes, iframe permission changes, or runtime dependency changes are authorized. If SVG/pdfmake or packaged desktop resolution fails, report alternatives and request approval before changing architecture.
- Sprint 061 is gated on explicit approval of Sprint 060's contract and architecture; Builder completion or a passing subset of probes does not close the gate.

## V0.9 Sprint 059 Builder Findings (2026-10-07)

- Add `vscode-textmate` and `vscode-oniguruma` as extension-only development dependencies because no compatible tokenizer was available in the workspace. The actual grammar now has tokenizer-backed scope coverage; the dependencies are not in production/runtime dependencies.
- Real tokenization revealed that an unterminated interpolated string in an executable AMX fence absorbed subsequent Markdown, causing `let` inside a later inert fence to receive `keyword.control.amx`. Following the user's direction to fix it, AMX double/single string, interpolation, and nested expression-brace rules now recover at end-of-line, consistent with single-line strings. The exact `}}` narrative interpolation delimiter is preserved. Actual tokenization and the full 22-test Linux Extension Development Host suite pass; no parser/runtime semantics changed.
- The single bounded Hutch `typecheck` wrapper attempt stalled at `hutch electrobun prepare` for 510 seconds and was stopped by TERM (exit 124). Direct Vue/Vite/worker/resource checks passed independently. `build:web` wrapper remains not run; no direct command upgrades a wrapper result.
- Full evidence and preserved Sprint 053/054/057 Windows residuals are in [Sprint 059 Builder evidence](sprints/0059-v09-final-acceptance-verification-closeout/builder-evidence.md). Final V0.9 disposition remains an explicit Lead Developer decision.

## V0.9 Sprint 059 Architect Preparation (2026-10-07)

- Sprint 059 is a final verification/acceptance closeout only, following Sprint 058 **COMPLETE / APPROVED**. It does not add product or language behavior and cannot reopen approved Sprint 052-058 semantics without a separate Lead Developer decision.
- Close Sprint 058's tokenizer evidence gap by executing the actual TextMate grammar with a compatible tokenizer. Any needed tokenizer dependency must be test-only, minimal, and documented; grammar JSON inspection alone is insufficient.
- Retry the Hutch desktop wrapper checks once with a bounded execution window. Record wrapper status independently from direct Vue/Vite/worker/resource checks; direct success does not convert a wrapper stall into a pass.
- Preserve historical Sprint 053/054/057 Windows host/RPC outcomes as their own unpassed residuals. Sprint 059's available-host run cannot reclassify those results or claim native/platform certification.
- Final V0.9 acceptance is the Lead Developer's explicit decision after reviewing Sprint 059 evidence; the Builder must only request that disposition.

## V0.9 Sprint 058 Builder Decisions (2026-10-07)

- The concrete parity fixes are limited to existing capabilities: add `dimension`/`unit` to shared completion, VS Code declaration coloring, and reserved rename identifiers. Imported dimension/unit navigation uses the existing shared symbol identities and declaring-module source ranges; no language behavior changed.
- The migration guide documents only constructor `:` to `=`, finite string escape decoding, and strict checking. It explicitly preserves type/annotation colons and promises neither auto-migration nor formatter repair.
- The representative workflow imports a local measurement model, reads approved JSON measurement objects, converts/rounds displayed values, and exercises JSON output plus HTML narrative/table/chart paths. It remains an example, not a new measurement or reporting rule.
- Available-host verification passed the root build/tests and Linux VS Code host. Hutch preparation stalled before wrapper typecheck/build; equivalent local typecheck and web/worker/resource build steps passed directly. Actual TextMate tokenization was not available, so the grammar regression verifies the grammar definitions, not token output. Keep both as explicit evidence boundaries pending Lead Developer disposition.
- Preserve all Sprint 053/054/057 Windows host/RPC findings as separate unpassed historical residuals. No Windows rerun or native desktop certification is claimed.
- **Lead Developer disposition (2026-10-07): COMPLETE / APPROVED.** Accept Sprint 058 closeout with the Hutch wrapper stall and unavailable TextMate-tokenizer run recorded as unpassed verification residuals. Do not recast those checks or the separate Sprint 053/054/057 Windows findings as passes; this is not final V0.9 acceptance or platform certification.

## V0.9 Sprint 058 Architect Preparation (2026-10-07)

- Sprint 058 consumes approved behavior from Sprints 052-057 and owns final editor parity, user-facing docs/migration guidance, representative examples, bundled help, and integrated available-host acceptance only. The V0.9 spec and approved Sprint 051 appendix remain authoritative; this preparation changes no language semantics.
- Audit shared editor facts, formatter, VS Code providers/TextMate grammar, and desktop analysis separately. Fix only demonstrated feature gaps; do not add new editor capabilities to force superficial parity. Incomplete drafts must remain safe to analyze, and inert fences/narrative remain outside executable-language behavior.
- Migration guidance must cover only the approved constructor-colon to `=` change, finite string escape decoding, and strict checking; annotation/type declaration colons remain valid. No automatic migration or formatter repair is promised.
- Preserve the separate unpassed Sprint 053, 054, and 057 Windows host/RPC residuals. Acceptance on available hosts does not certify other platforms or reclassify historical failures.

## V0.9 Sprint 057 Architect Preparation (2026-10-06)

- Sprint 057 consumes Sprint 056's immutable measurement values and Sprint 055's checked, entry-visible unit registry. External unit strings use only visible units with multiplication/division, parentheses, and signed integer powers; never execute AMX text from data.
- JSON measurement objects retain exactly `{ "value": finiteNumber, "unit": "visible-unit-or-restricted-expression" }`; CSV cells use equivalent measurement text. Bare numbers do not gain units implicitly. Compound output preserves declared factors where lossless and otherwise follows the approved canonical base-unit representation.
- Tables preserve each cell's chosen unit. Charts normalize per relevant axis/series to the first non-null display unit, label it, reject incompatible dimensions, preserve data order, and do not invent units for empty/all-null values.
- Preserve the Sprint 051 HTML/PDF/DOCX-specific empty/null behavior, report identity/source ordering, show-time snapshots, and export atomicity. Extend desktop non-file-backed schema/data-editor inspection as well as file-backed input paths.
- Keep Sprint 058 documentation/help/broad editor parity and the existing unpassed platform/whitespace residuals outside Sprint 057 implementation scope.

## V0.9 Sprint 057 Builder Decisions (2026-10-06)

- Use the exact approved external JSON `{value, unit}` measurement shape and CSV `number unit-expression` text form. Resolve unit identifiers only from the entry-visible Sprint 055 registry; parse the restricted unit grammar without evaluating external text.
- Present human-readable dimension names and visible-unit lists in schemas rather than leaking canonical module identities. Preserve each table cell's display unit and normalize each chart series/axis to its first non-null unit.
- Follow the existing HTML/PDF/DOCX-specific null/empty policies. Per Lead Developer direction, corrected PDF empty-chart table widths to match the approved header-only data table; this resolved implementation mismatch is not a broader renderer-policy change.
- Implementation evidence records exact checks/results and the desktop RPC/Windows extension residuals. Sprint 057 remains pending separate Lead Developer disposition; no Sprint 058 or integrated V0.9 acceptance is asserted.

## V0.9 Sprint 057 Acceptance-Finding Decisions (2026-10-07)

- Per Lead Developer direction, dimensions, units, and external unit text for record fields and function signatures resolve in the module that declares the record type or function, not in the importing or entry module. `src/typechecker/declarationRegistry.ts` records each declaration's module registry when `checkDocument` checks the declaring module. The checker (field access, record construction, defaults, view fields, function calls) and the runtime (JSON/CSV input, schemas, output serialization, computed-record and function validation, function-body unit literals) all consult it. Base identities remain the global Sprint 055 identities, so values compare correctly across modules.
- Record measurement defaults (for example `Spare: ApparentPower? = 1 MVA`) are evaluated with the declaring registry and accepted as already-materialized measurements after a dimension check; external data still requires the exact `{value, unit}` or CSV text forms.
- Narrative `{{...}}` interpolation formats measurements as displayed value plus unit text, matching the Sprint 056 string-interpolation form, in the shared report preparation used by HTML, PDF, and DOCX.
- **Lead Developer disposition (2026-10-07): COMPLETE / APPROVED.** The Lead Developer re-ran the acceptance scenario and approved Sprint 057. The desktop RPC Windows path-separator assertion and the Windows Extension Development Host failures remain unpassed platform residuals.

## V0.9 Sprint 056 Architect Preparation (2026-10-06)

- Sprint 056 consumes Sprint 055's approved dimension/unit identities, vectors, scales, explicit visibility, SI library, and registry; do not fork declaration metadata.
- Implement measurements with both physical arithmetic meaning and chosen display-unit identity. Preserve display behavior per operation: left unit for addition/subtraction, selected element for min/max, first element for sum/mean, current unit for abs/round, and requested target unit for conversion.
- Complete the measurement interpolation integration deferred by Sprint 053, using displayed value plus unit text; retain existing scalar and narrative behavior and continue rejecting implicit list/record stringification.
- Keep external measurement serialization/schema, tables/charts/reports in Sprint 057 and broad editor parity/docs in Sprint 058.

## V0.9 Sprint 056 Builder Decisions (2026-10-06)

- Measurement runtime values are immutable snapshots containing the displayed numeric value and an immutable unit descriptor with positive finite scale, Sprint 055 dimension vector, original declared/compound unit factors, and deterministic unit text. Physical value is derived as `value * unit.scale`; conversion changes displayed value and declared display unit, not physical meaning.
- The checker represents measurement types as normalized sparse vectors keyed by Sprint 055 base identity, rather than declared dimension names. This preserves equivalence of structurally matching derived dimensions and incompatibility of independently declared bases. Unit targets are resolved only from the current module's checked visible registry.
- Binary operators retain explicit operator source locations. Measurement addition/subtraction use the left display unit; multiplication/division compose scales and vectors and return Number on vector cancellation; comparison normalizes physical values. Powers require signed integer-literal exponents for measurement values, and runtime measurement domain errors use `AMX1009`.
- Aggregate display policies follow Sprint 051: sum/mean use the first measurement unit, min/max return the selected item unchanged, and abs/round retain the current unit. Typed empty measurement sum uses Sprint 055's base-unit registry; empty min/max/mean preserve `AMX2004`.
- Sprint 053 interpolation now accepts measurement values and formats displayed value plus unit text. Existing scalar interpolation and narrative interpolation were left unchanged. External data/output serialization and visualization support remain out of scope.
- Full-worktree `git diff --check` is blocked by an extra blank line at EOF in an unrelated `writing/2026-10-03_Computable_Documents.md` change that appeared during validation. The Builder left that change untouched and checked owned paths separately.
- Validation evidence and the unpassed Windows host residual are recorded in the Sprint 056 evidence file. **Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The Lead Developer accepted Sprint 056. The recorded host and unrelated full-worktree diff-check residuals remain unpassed.

## V0.9 Sprint 055 Decisions and Builder Closeout (2026-10-06)

- Sprint 055 depends on Sprint 052 only. Sprint 052's ACCEPTED WITH RECORDED RESIDUALS disposition satisfies the dependency; Sprints 053/054 are not dependencies, and their Windows host residuals remain unpassed context.
- Implement dimensions/units according to Sprint 051: base identity is canonical module identity plus declaration name; derived dimensions are normalized vectors over those identities; exactly one independent base unit per base identity; all scales are finite and positive.
- Implement the exact approved finite SI inventory in project-local `libraries/si.amx` with explicit imports/exports and no implicit global names or abbreviations.
- Registry construction must provide declaration metadata before later schema inspection without executing document statements or evaluating modules more than once. Sprint 055 does not implement measurements or external data/reporting.
- Re-export syntax is `export { Name, ... }` for explicitly imported dimensions/units; the re-export carries the original declaration metadata and base identity. This syntax was selected by the Lead Developer for Sprint 055 because the approved contract required re-exports but did not otherwise specify their spelling.
- Builder implementation constructs the registry from the same parsed/checker module graph used by normal loading. Base-unit uniqueness is tracked by canonical base identity across that graph; inspection returns the checked entry-visible metadata without running source statements.
- Sprint 055 verification results and Windows host residual are recorded in `planning/sprints/0055-v09-dimension-unit-declarations-module-identity/builder-evidence.md`. **Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The Lead Developer verified the evidence and approved Sprint 055; the Windows host failures remain unpassed residuals and are not represented as passing checks.

## V0.9 Sprint 054 Architect Preparation (2026-10-06)

- Sprint 054 depends on Sprint 052 only; it does not require Sprint 053. Sprint 052's ACCEPTED WITH RECORDED RESIDUALS disposition satisfies the dependency; Sprint 053 is ACCEPTED with an unpassed Windows host-suite residual and is documented for context only.
- Follow the approved 1-based list contract exactly, including typed reads, statement-only named-list mutation, `length + 1` insertion, full prevalidation, imported/nested alias immutability, local alias visibility, original-element loop snapshots, and emitted-view isolation.
- No-`at` removal validates a positive integer count but removes exactly one final element. `at` removal removes the full requested interval. Do not normalize these behaviors.
- Use `AMX3009` for statically provable invalid bounds/intervals and `AMX1008` for dynamic list-operation errors/immutable mutation. Do not execute code to predict dynamic values.
- Builder implementation followed these approved rules without changing their semantics. Validation outcomes and known platform-specific residuals are recorded in `planning/sprints/0054-v09-one-based-list-access-safe-mutation/builder-evidence.md`.
- **Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The user verified that the implemented functionality works as expected and approved Sprint 054 closeout. This approval retains the documented Windows desktop RPC and VS Code host failures as unpassed platform residuals.

## V0.9 Sprint 053 Architect Preparation (2026-10-06)

- Proceed with Sprint 053 on the basis of Sprint 052's **ACCEPTED WITH RECORDED RESIDUALS** disposition. Preserve the five Windows VS Code Development Host failures as unpassed; do not treat them as blockers absent a demonstrated Sprint 053 regression.
- Implement only the approved string contract: both quote styles decode the finite escape set; interpolation is full AMX `${...}` in double quotes only; unknown/incomplete syntax fails; source remains single-line; collections are not implicitly stringified.
- Keep narrative interpolation separate and unchanged. Coordinate measurement-to-string display assertions with Sprint 056; do not implement measurement values in Sprint 053.
- Limit integration to directly affected parser/checker/evaluator/formatter/editor behavior. Sprint 058 owns broad editor parity and user-facing docs/help.

## V0.9 Sprint 053 Builder Decisions (2026-10-06)

- Represent interpolated strings as ordered decoded text and AMX expression parts, preserving the existing string-literal node for strings without interpolation. Parse embedded expressions with the existing AMX parser and pass their original source locations into normal static checking and evaluation.
- Share string-boundary scanning across parser structural collection, formatter indentation, and editor source traversal so nested expression quotes/braces do not alter enclosing syntax boundaries.
- Use locale-independent `String(number)` conversion and explicit lowercase Boolean/null conversion. Allow nullable scalar types because their runtime values are either an approved scalar or null; reject records, lists, DateTime, and other values statically with `AMX3007`.
- Migrate only the positive kitchen-sink path literal from `"C:\demo"` to `"C:\\demo"` so it continues to evaluate as `C:\demo`. Measurement conversion remains unimplemented until Sprint 056.
- **Lead Developer disposition (2026-10-06): ACCEPTED; Sprint 053 approved for closure.** Retain the Windows VS Code Development Host failures as unpassed residuals and measurement-to-string verification as deferred to Sprint 056; this does not claim the host suite passed or other V0.9 feature groups completed.

## V0.9 Sprint 052 Builder Decisions (2026-10-06)

- Enforce checking at the shared document/module boundaries rather than introducing a new CLI/UI mode. Keep `checkingActivated` only as an always-true compatibility helper; the sole remaining gated caller is the non-product Sprint 035 feasibility spike.
- Use canonical constructor `field = value` syntax with commas and optional trailing commas. Reject constructor-colon syntax as `AMX3006`; preserve colons for type declaration fields and annotations. Do not auto-repair invalid syntax in the formatter.
- Keep migrated negative examples invalid for their intended field/type reasons by changing only their record delimiters. Keep historical V0.3 documentation and explicitly negative examples unchanged.
- Builder verification is recorded in `planning/sprints/0052-v09-strict-checking-multiline-records-migration/builder-evidence.md`. Core/root/desktop checks pass; the VS Code Development Host test has a Windows observed residual (14 pass, 5 fail).
- **Lead Developer disposition (2026-10-06): ACCEPTED WITH RECORDED RESIDUALS.** Accept Sprint 052 with the five VS Code host-test failures explicitly retained as residuals; do not represent the host suite as passing. This does not accept downstream V0.9 work.

## V0.9 Sprint 051 Architect Preparation (2026-10-06)

- Sprint 051 owns the V0.9 technical contract and cross-surface design gate only; it has no sprint dependency and must not implement features or migrate production fixtures.
- `docs/language-spec-v0.9.md` and `planning/plan-openamxV09MasterSprintPlan.md` are authoritative for settled business scope and compatibility. Sprint 051 may specify implementation-facing contracts but may not silently weaken or reopen those requirements.
- Require explicit review before implementation begins for precedence/conformance examples, dimension identity/canonicalization, the exact finite SI inventory, aggregate and empty/null presentation, safe static-check boundaries, diagnostic codes/locations, and migration cases. Pending review remains a blocker, not an assumed approval.
- Keep planning proposals, approved decisions, and unresolved owner questions explicitly distinguished. Planning completion is not evidence of implementation or verification.

## V0.9 Sprint 051 Builder Contract Proposal (2026-10-06)

- The **Builder Contract Proposal** appendix in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md` records the requested exact tables/examples, cross-surface audit, and Sprint 052–058 handoff.
- At preparation time, the precedence additions, canonical identity/serialization details, finite SI inventory and alias spellings, surface-specific empty/all-null view presentation, safe constant subset, and diagnostic allocations were Builder proposals. The later explicit Lead Developer disposition is recorded below.

## V0.9 Sprint 051 Lead Developer Approval (2026-10-06)

- The Lead Developer explicitly approved the Builder Contract Proposal in the Sprint 051 `blueprint.md`. Approval includes the exact precedence/grouping examples; qualified dimension identity and canonicalization; complete finite SI inventory, export names and exclusions; aggregates, math functions and empty/null view policy; static/runtime boundary; diagnostic codes and locations; conformance/migration matrix; cross-surface ownership; and Sprint 052–058 dependency handoff.
- These are approved Sprint 051 implementation-design decisions subordinate to `docs/language-spec-v0.9.md` and `planning/plan-openamxV09MasterSprintPlan.md`; they do not amend or expand the approved V0.9 scope.
- Sprint 051's technical contract gate is **CLOSED / APPROVED**. Subsequent implementation may proceed only in the master plan's dependency order and assigned sprint scope.
- Approval is not evidence of implementation, tests, builds, or runtime behavior. None is claimed by the Sprint 051 design work.
- The Lead Developer may reopen or revise a design decision explicitly; any scope-changing revision must be recorded before implementation relies on it.

## V0.9 Sprint 052 Architect Preparation (2026-10-06)

- Sprint 052 implements unconditional checking before document/module execution and analysis, canonical multiline record constructors with `=`, and focused migration of affected positive examples/tests.
- Preserve inference for valid unannotated programs. Keep intentionally invalid cases as rejection tests and do not weaken checking to produce a green suite.
- Reject constructor `field: value` as syntax (`AMX3006`) without deprecation or formatter repair. Type declaration fields and variable/parameter/return annotations retain `:`.
- Sprint 052 does not implement strings, list indexing/mutation, dimensions/units, or the integrated editor/documentation work assigned to later sprints.

## V0.8 Sprint 050 Architect Preparation (2026-10-04)

- Sprint 050 owns integrated repeat-release acceptance, adversarial failure/recovery validation, available-host evidence, and one consolidated operator runbook. It does not expand into new packaging features, signing, CI, native certification, or automated Marketplace publication.
- Sprint 048 is COMPLETE / APPROVED. At Sprint 050 preparation, Sprint 049 Builder implementation was complete with release-readiness blockers and its Lead Developer disposition was pending; the closeout disposition below resolves that entry gate with named residuals.
- Run two-version/same-version-repeat tests only in disposable fixtures. Real artifacts must share a clean committed full source revision and stable version; preserve the existing 0.8.0 Linux x64 bundle and reject its mismatch with Sprint 049's active source rather than rewriting either record.
- A current available-host end-to-end build requires an explicitly authorized version and absent target destination. If the current target/version collides with retained output, stop and request an authorized version or rely on fixtures; never overwrite to satisfy acceptance.
- Full AGPLv3 text is supplied and packaged, but the owner still must confirm dual-license Marketplace metadata and dependency-notice requirements. Fixture tests may cover these cases; `release:verify` and publication readiness remain blocked until confirmed.
- Automated publication verification remains mock-only. Any real GitHub release requires a separately selected real assembly and explicit operator authorization; Marketplace upload remains manual. No six-target or self-containment certification is implied.
- `docs/releasing.md` is the single operator runbook for prerequisites, per-host builds, unsigned/runtime warnings, version review/commit, transfer, collect/verify/publish, manual Marketplace submission, blockers, retries/recovery, retention, and next-version steps.

## V0.8 Sprint 050 Builder Decisions (2026-10-04)

- Exercise multi-version and repeat/conflict behavior only in temporary Git fixtures; versions `0.6.1` and `0.6.2` were never written to production package manifests. An identical same-version collection rerun is refused rather than treated as an overwrite/idempotent promotion; tests prove the accepted assembly and source manifests remain byte-identical.
- Do not build or collect a production release from the current dirty tree. Preserve the accepted 0.8.0 Linux x64 bundle and its distinct full source commit; no replacement version/destination is authorized. Do not interpret Sprint 048's historical authorization of 0.8.0 as authorization to overwrite its accepted target.
- License readiness remains blocked pending owner confirmation of Marketplace representation for the dual-license offer and required third-party notices. Keep all automated GitHub operations mocked and Marketplace submission manual.
- The Builder's pending recommendation was the status at the evidence checkpoint. Local assembly staging failure was not fault-injected and is listed as an accepted Sprint 050 residual below.

## V0.8 Sprint 049-050 Lead Developer Closeout (2026-10-04)

- By explicit Lead Developer direction, disposition Sprint 049 **COMPLETE WITH RECORDED RESIDUALS** and close Sprint 050 **COMPLETE WITH RECORDED RESIDUALS**. The Lead Developer reports all features tested and satisfactory; exact unrecorded host/session details are not inferred.
- Accept for sprint closure the absence of a fresh matching production release assembly/build, an unused explicitly authorized version/destination, a separate Sprint 050 native install matrix, and injected local post-staging failure coverage. These remain limitations in Builder evidence, not claimed passes.
- Accept unresolved license-owner confirmation and lack of real GitHub/Marketplace publication as Sprint 049/050 residuals only. Production `release:verify`/publication remains blocked until license/notices readiness is confirmed; publication remains a separate operator action.
- Preserve the retained 0.8.0 bundle and its provenance/checksums. Keep Linux arm64, Windows x64/arm64, and macOS x64/arm64 unverified. This closeout does not authorize a version change, stable-output overwrite, public release, or Marketplace upload.

## V0.8 Sprint 049 Builder Decisions (2026-10-04)

- Keep `EngineersTools` unchanged and build through existing esbuild/vsce tooling. VSIX inspection requires the stable root-authoritative version, publisher, `./dist/extension.js`, AMX grammar, language configuration and exact allowed archive entries. The actual package contains only JavaScript/JSON and no native binary, supporting one platform-neutral VSIX package without implying native desktop certification.
- Exclude `install-local.mjs` from the VSIX because it is a development/operator helper, not extension runtime. Preserve manual local install and manual-only Marketplace submission documentation.
- Preserve the user's supplied full AGPLv3 text in root `LICENSE.md` unchanged. The installed vsce 3.9.2 source supports `SEE LICENSE IN <file>`; the extension declares `SEE LICENSE IN LICENSE.md`, and package staging copies that file byte-for-byte beside the extension manifest. Do not claim that this resolves how the separate commercial option should be represented in Marketplace metadata or whether third-party notices are required. Keep readiness `blocked` until the license owner confirms both questions; do not suppress warnings.
- Keep the real output layout at `releases/<version>/assembled/` for release-wide assembly, rather than occupying/replacing `releases/<version>/linux-x64` or the extension bundle input. Collection stages only declared artifact bytes, validates all source bundle files first, and refuses an existing assembly.
- Publish only drafts; verify existing/created `v<version>` resolves to the recorded full commit before uploading. Never edit published releases, move tags, or replace remote asset bytes. Inject the GitHub client in tests; no public endpoint is part of automated verification.
- Current VSIX package evidence indicates platform-neutral package contents. This does not alter the Linux x64-only desktop package evidence or unverified remote native target status.

## V0.8 Sprint 049 Architect Preparation (2026-10-04)

- Sprint 047 is COMPLETE WITH RECORDED RESIDUALS and Sprint 048 is COMPLETE / APPROVED by explicit Lead Developer direction. Sprint 049 may proceed; these dispositions do not certify remote native targets or make Builder-time/manual-install evidence interchangeable.
- Preserve VS Code publisher `EngineersTools`. Build/package/inspect one VSIX through existing esbuild/vsce tooling; Marketplace upload remains manual. Claim platform neutrality only if actual VSIX metadata and contents support it.
- Integrate only accurate supplied license metadata and actual required notices. The current `LICENSE.md` is an overview that references a separate full `LICENSE` file not present in the workspace; do not draft terms or declare production licensing ready. Fixture tests and development may proceed, while verify/publish must report unresolved license/notices readiness.
- `release:collect` accepts only complete matching-version/full-source-commit bundles and VSIX; validates schema, completion, sizes, hashes, safe paths, and duplicates before staging. It preserves Electrobun sidecars, rejects corrupt/mixed/unsafe/conflicting inputs, promotes only to an absent destination, and never removes/overwrites prior releases.
- `release:verify` is read-only and includes provenance, integrity, identity, target status, build/package versus manual install evidence, and licensing readiness. It must not equate a built artifact with an installed/launch-tested package.
- `release:publish` is a separate explicit operation, defaults to `NovaEnergyConsulting/openamx`, permits an explicit repository override, and uses supported authentication without credential disclosure. Prefer draft creation; require acknowledgement for partial release; verify tag points to recorded revision; never move a tag or silently replace an asset. Retries may accept identical remote assets or add nonconflicting assets for the same version/revision only.
- All automated remote-operation tests are mocked and must never create public releases. Marketplace publication, real GitHub publication, legal interpretation, and Sprint 050 integrated acceptance/runbook remain separate.

## V0.8 Sprint 048 Architect Preparation (2026-10-03)

- Sprint 047 is **COMPLETE WITH RECORDED RESIDUALS** by explicit Lead Developer direction (2026-10-03); Sprint 048 is authorized to proceed with those residuals. The disposition accepts Builder completion for sprint closeout but does not upgrade native packaging, runtime self-containment, installation/launch behavior, or remote target status to verified.
- Sprint 048 is prepared for the native desktop packaging and target evidence scope in the approved V0.8 master plan. Preserve all remaining evidence boundaries and do not infer native support from configuration or preflight availability.
- Reuse Bun/Vite/Hutch/Electrobun and preserve the separate Bun job worker, web assets, application identity, version authority, and finalized Sprint 047 command/manifest/bundle contract. The desktop build validates source/version/provenance; it does not repair or increment versions.
- Installer format/tooling must be selected from bounded official-toolchain and available-host evidence. No archive/AppImage substitution or incompatible toolchain migration is authorized without explicit approval.
- Build only clean committed source into fresh per-target staging; inspect actual output contents and embedded identity/version/architecture; hash accepted artifacts; preserve prior outputs; and refuse silent overwrites. Staging/build checks are not proof of native installation/launch.
- The installed app must not require Bun, Node, or developer tooling. Record actual system webview/library requirements. `bundleCEF: false` and a successful packaging command are not evidence of runtime self-containment.
- Sprint 047's current Linux x64 preflight is available, but installer format, native installation and runtime requirements remain unverified. Other requested OS/architecture combinations remain unverified absent evidence. No broad platform or six-target certification claim is authorized.
- Keep Sprint 048 limited to desktop packaging and its target evidence. Sprint 049 owns VSIX, license/notices packaging, bundle collection, release verification and explicit publishing; Sprint 050 owns integrated repeat-release acceptance and the consolidated runbook.
- Evidence-backed installer selection: use the existing Hutch/Electrobun native stable outputs without additional installer tooling or format substitution. Current Linux x64 build produced Electrobun's `.tar.gz` Setup installer; documented Windows Setup `.zip` and macOS `.dmg` remain unverified until built on native hosts. Build only the current host target.
- Release builds use a clean detached worktree at the recorded commit, install both root and desktop frozen lockfiles, build web/worker/native resources, and collect only fresh Hutch artifacts and sidecars. Stage in `releases/.staging`; atomically promote only a complete checksummed bundle with a completion marker. Never reuse source-checkout build/artifact/spike outputs.
- `sharp` is required through shared report preparation. Copy only the current host's locked `@img/sharp-*` binding and matching `@img/sharp-libvips-*` package into app resources. Linux packages still depend on the system WebKitGTK 4.1/GTK/GLib and related graphics/media stack; do not claim self-containment.
- Current-source dev launch reaches embedded Bun `1.4.0` with system-only PATH after adding sharp native resources. The first stable installer tested before that correction failed at sharp loading. The post-sharp 0.6.0 installer then failed with `TarUnsupportedFileType` on a GNU LongLink/PAX record. Native preview acceptance remains unverified.
- The emitted `0.6.0/linux-x64` bundle is retained and immutable. Its installer rejects a GNU LongLink/PAX record for a 108-character `glibconfig.h` development-header path; the embedded Electrobun extractor reports USTAR support only. Commit `0c05a42` omits the unused `sharp-libvips` GLib header directory and rejects over-100-character app-payload paths before bundle completion. Validate on the authorized 0.8.0 build; replacing the retained 0.6.0 target requires explicit approval.
- Lead Developer authorized `0.8.0` as the next desktop build version on 2026-10-04. `release:prepare 0.8.0` synchronized all three manifests; the USTAR compatibility fix is committed as `0c05a42`. The build remains blocked until the three manifest edits and associated evidence updates are committed.
- **Lead Developer disposition (2026-10-04): Sprint 048 COMPLETE / APPROVED.** The Lead Developer reports that the latest correct installer was used and the application launches and works correctly. Accept this as the Lead Developer's native-host acceptance report; exact environment, test steps, close/uninstall, and user-data details were not supplied and are not inferred. Preserve `releases/0.8.0/linux-x64` and its manifest/checksums. Linux arm64, Windows x64/arm64, and macOS x64/arm64 remain unverified; the disposition does not certify them or claim runtime self-containment.

## V0.8 Sprint 047 Builder Decisions (2026-10-03)

- Preserve manifest formatting by validating package JSON structurally and changing only the top-level `version` field. The three Bun lockfiles have no package-version metadata to synchronize, so leave all lockfiles untouched; frozen-lock validation is not needed for unchanged lockfiles.
- `release:check` maps Node platforms `linux`/`win32`/`darwin` to project targets `linux`/`windows`/`macos`, and Electrobun target conventions `linux`/`win`/`mac`; `x64` and `arm64` map directly. A declared matrix row is `available` only for the current host when tool probes pass and manifest versions/identity are consistent. Other rows remain `unverified`; no unsupported target is asserted without evidence.
- `hutch --version` reports `0.27.1`; current config invokes Electrobun through Hutch and explicitly disables bundled CEF on all three operating systems. This is configuration evidence only. Installer format, complete runtime requirements, and installed-app self-containment remain Sprint 048 questions; no migration or format was selected.
- Extension local install invokes `code` with an argv path built from package name/version; Windows uses an explicit `cmd.exe` wrapper and Windows path/quoting rules. The produced VSIX must already exist; local install does not build or rename it.

## V0.8 Sprint 047 Architect Preparation (2026-10-03)

- Sprint 047 is authorized as the first V0.8 implementation sprint and has no sprint dependency. This does not change Sprint 046's separate pending Lead Developer disposition.
- Use root `package.json` as the sole version authority. Preparation accepts an explicit stable semantic version, updates root/desktop/extension package metadata as required, derives Electrobun's app version instead of duplicating it, and leaves reviewable changes without committing or tagging.
- Implement only `release:prepare <version>` and read-only `release:check` in Sprint 047. Document contracts for desktop build, extension package, collection, verification, and publication for later sprints; those commands are not Sprint 047 implementation scope.
- Use project-facing targets `linux`, `windows`, and `macos`, each with `x64` or `arm64`, and explicit native-tool mappings. `available`, `unverified`, and `unsupported` describe target evidence; `missing` describes an absent requested release artifact.
- Retain `releases/<version>/` as the planned accepted-output layout with incomplete staging separated, checksummed manifests, provenance checks, retained prior releases, and no silent overwrite. Final manifest details and artifact naming are to be completed in Sprint 047 without weakening the master plan's integrity/provenance rules.
- Do not claim remote native support, installer formats, or installation behavior from source configuration, mocked tests, or browser evidence. Do not expand into toolchain migration, signing/notarization, license authoring, CI, or publication automation without approval.

## V0.7 Sprint 046 Architect Preparation (2026-10-03)

- Sprint 046 owns only the current Help Center static-content extraction/layout and integrated acceptance observations documented in the V0.7 master plan.
- Preserve stable Help topic IDs, search terms, default section, and initial-section routing. Bundle static topic/search/release copy as JSON for offline use; keep rendering, filtering, navigation, and starter/diagnostic actions in Vue/application code.
- The shared app command registry remains the only source for shortcut labels and values. Do not duplicate shortcut metadata or executable action definitions in the JSON resource.
- Bound the dialog to approximately 80% of the available app viewport. Header, search, and footer remain fixed while the body content scrolls; search result count must not resize the dialog.
- **Lead Developer sequencing direction (2026-10-03):** Sprint 044 is COMPLETE WITH RESIDUALS; retain unavailable native Electrobun evidence as a residual. Sprint 046 is explicitly authorized to proceed with Sprint 045's documented residuals. This sequencing authorization does not disposition Sprint 045 as accepted or complete; native window resizing, actual app restart, and formal accessibility remain unverified. Browser evidence is not native or formal accessibility acceptance.
- Builder implementation: statically import `components/help-content.json` through Vite; keep only declarative `topics`/`copy` values in the resource. Keep starter sources imported from `starterExamples`, diagnostic download in `App.vue`, and shortcut labels/values passed from `commands`.
- Dialog uses an 80vw/80vh flex frame bounded by viewport padding; `.help-layout` is the independently scrolling body, leaving title/header, search, and footer outside the scroll container. The layout changes to one column on narrow screens without changing the fixed frame model.
- Integrated browser evidence passes, but remains fixture/browser evidence only. Sprint 045 acceptance, native host/restart, cross-platform, and formal accessibility dispositions remain separate.
- No changes to unrelated V0.7 backlog, AMX/CLI/VS Code behavior, native certification, formal accessibility certification, or release engineering are authorized.

## V0.7 Sprint 045 Architect Preparation (2026-10-03)

- Sprint 045 is authorized for the workbench viewport/scrolling, CodeMirror wrapping and indentation behavior, persistent global wrap preference, and runtime-drawer foreground corrections specified in its requirements.
- Preserve a user-resizable native window; constrain the app page to the current viewport and give explorer, editor, and preview independent scrolling in both desktop and adaptive layouts. Do not solve long content by clipping or page scrolling.
- Editor wrapping defaults on and is a persistent global device-local preference. Tab and Shift+Tab are editor indentation commands only while CodeMirror is focused; ordinary focus navigation outside the editor remains unchanged.
- Runtime drawer status, stage, diagnostics, links, muted text, and code use theme-aware foreground tokens in light and dark themes.
- Reuse the Sprint 044 Playwright/Vite fixture for repeatable UI checks. Sprint 044 Builder verification is recorded, but Lead Developer disposition remains pending; browser results do not close native-platform or formal accessibility gates.
- Sprint 045 does not include Help Center changes, further preview freshness work, unrelated V0.7 backlog, language/CLI/VS Code behavior, native certification, or release engineering.

## V0.7 Sprint 045 Builder Decisions (2026-10-03)

- The 820x720 baseline failure was page growth (`documentElement.scrollHeight=3053`) caused by intrinsic adaptive pane minimums under a min-height-only shell. Use a dynamic-viewport-bounded app shell and shrinkable workbench tracks; explorer, CodeMirror, preview iframe document, and runtime drawer each retain their own scrolling. Long runtime diagnostic tokens wrap instead of widening the page.
- Keep wrapping in a CodeMirror `Compartment` so preference changes reconfigure the current editor without discarding editor state. Missing `openamx.editor-wrap` means enabled; only the local device stores it. Reuse CodeMirror's `indentWithTab` key binding so Tab/Shift+Tab stay scoped to the editor.
- Runtime foreground tokens were extended for link, code, success, warning, and danger colors in explicit and resolved system light/dark themes. Browser checks calculate at least 4.5:1 against the drawer surface; this is not a formal accessibility claim.
- Sprint 045 Builder evidence is complete; Lead Developer disposition remains pending. Browser screenshots/reload checks do not establish native Electrobun, actual app-restart, cross-platform, or formal accessibility acceptance.

## V0.7 Sprint 044 Architect Preparation (2026-10-03)

- Sprint 044 is authorized to investigate and correct the reported preview freshness behavior within the existing active-document contract. The proposed autosave/disk-hash race remains a hypothesis; do not select a production fix until a deterministic delayed-worker regression confirms or falsifies it.
- Preserve all project/document/input/settings/job/cancellation freshness checks and last-good preview behavior. Automatic refresh pauses and resumes with the existing controls; manual refresh remains available while paused.
- Retain the 400 ms default preview debounce unless evidence supports a change, and preserve the 500 ms maximum.
- Reuse the Sprint 042 workflow harness if a bounded browser-automation compatibility proof supports it. Add a maintained browser dependency only if needed, and scope it to desktop test tooling.
- Sprint 044 scope is limited to the preview investigation/regression and UI-test feasibility in its requirements. Sprint 045/046 features, unrelated V0.7 backlog, native certification, accessibility certification, and release engineering are not authorized by this sprint.

## V0.7 Sprint 044 Builder Decisions (2026-10-03)

- Deterministic delayed-worker evidence confirmed the disk-hash/autosave cause before the production correction: the active request identity and document revision remained current, autosave committed the current AMX buffer and advanced the open tab's trusted disk hash, but the running job still held the pre-save hash and was rejected.
- For an open, clean AMX source only, job freshness now compares disk bytes against the document's current trusted disk hash while continuing to compare the captured document revision. Dirty AMX overlays retain the job-captured disk hash; closed sources and CSV/JSON inputs continue to use captured hashes. External changes remain rejected. No identity, job, cancellation, input/settings, or last-good guard was removed.
- Keep the product debounce at 400 ms; a Playwright UI assertion measured automatic job start within 380-600 ms of the edit and confirmed autosave preceded result publication. The UI spec also proves automatic pause suppression, resume, manual refresh while paused, iframe current output, and stale last-good retention.
- Reuse `spikes/sprint042-workflow-harness` as the production-App component fixture, but add `@playwright/test` 1.63.0 only to desktop devDependencies because the existing harness had no maintained runner and its RPC mock did not model delayed/source-dependent/autosaved output. Playwright's Chromium is test infrastructure only. Native Electrobun/browser certification is not inferred.

## V0.6 Sprint 043 Lead Developer Closeout and Release Decision (2026-10-03)

- The Lead Developer reports completing end-to-end testing of the integrated desktop app and explicitly accepts all open or partial residuals in the Sprint 043 Builder evidence as closed for V0.6. Sprint 043 and V0.6 are **COMPLETE**; V0.6 is approved for release with accepted exceptions.
- This acceptance does not turn missing measurements, matrix entries, or native/platform checks into verified passes. Native macOS/Windows/native Ubuntu, Hutch packaging/launch, broad Office, project licensing/Marketplace, formal accessibility, V0.5 report-mobile overflow, and VS Code apply-time action safety remain unverified accepted exceptions. No publication or certification claim is made.
- Do not extend Sprint 043 or the V0.6 plan for these residuals. Carry forward further work as V0.7 requirements in `planning/requirements-openamxV07.md`.
- Align root, desktop/Electrobun, and VS Code extension version metadata to `0.6.0`. Release approval is distinct from publication.

## V0.6 Sprint 043 Builder Decisions (2026-10-03)

- Implemented the V0.5 desktop session migration narrowly: accept the old `active` field only after existing root/containment validation, ignore the obsolete `entry` field, preserve bounded panel sizes, and persist normalized recents on normal restore. Migration does not invoke a worker or mutate project source. Corrupt/unsafe active paths remain omitted.
- Keep the new diagnostic artifact a local bounded summary rather than exporting raw process logs (none are retained by this workbench). It contains validated timestamps/codes and coarse tab counts only; paths, messages, source, data, recovery text, and credentials are not representable in its schema.
- Rename package/app presentation metadata from “OpenAMX Desktop Spike” to “OpenAMX Desktop” after verifying the current onboarding/workbench behaviors. At Builder evidence time, version alignment was deferred; the Lead Developer closeout above supersedes that deferral. The identifier change does not alter the hard-coded `~/.config/openamx/desktop-session.json` session path.
- No AMX, CLI, report, data, or VS Code semantics changed. No new 100k timing threshold was introduced; measured 100k timings remain descriptive under the 2026-10-03 product decision.

## V0.6 Sprint 043 Data-Editor Performance Disposition (2026-10-03)

- By explicit user direction, the current 100,000-row CSV/JSON table experience is acceptable; the prior strict timing objective does not materially affect the desired UX. Update the authoritative V0.6 contract: the 3-second first-viewport and 100-ms grid-task targets are no longer hard pass/fail limits for 100k data-editor load/edit.
- Sprint 043 must still record reproducible viewport, scroll, edit/history, cancellation, memory, and longest-task results. Acceptance requires complete/lossless access, practical editing/history/cancellation, bounded fallback, and explicit Lead Developer usability acceptance. Do not describe the superseded numeric target as passed.
- This adjustment is limited to the supported 100k CSV/JSON data-editor interaction. Project listing, preview debounce, cancellation acknowledgement, and background analysis/validation/export performance criteria remain unchanged.
- Sprint 041's historical measured results and `COMPLETE WITH RECORDED EXCEPTIONS` record remain intact; Sprint 043 closes the performance-policy disposition with new evidence. The subsequent Lead Developer closeout accepts the remaining V0.6 evidence gaps as release exceptions without relabeling them as passed or inferring native/accessibility certification.

## V0.6 Sprint 042 Lead Developer Acceptance (2026-10-03)

- The Lead Developer reports testing all Sprint 042 functionality and confirms every acceptance requirement is met. Sprint 042 is **COMPLETE** by explicit direction; this supersedes the Builder's pending-acceptance disposition.
- The direction did not include OS/session details or per-check observations, so no host matrix or additional measurements are inferred. Feature-sprint acceptance does not certify native release platforms, Hutch packaging, broad Office, licensing/Marketplace, or formal accessibility.
- At Sprint 042 acceptance, Sprint 041's measured 100k responsiveness exception remained assigned to Sprint 043; the final Sprint 043 closeout later accepted its remaining evidence/usability gaps as V0.6 release exceptions without recording the former 100 ms target as passed.

## V0.6 Sprint 042 Builder Implementation (2026-10-02)

- No Lead Developer product-policy amendment was made. Active-document identity, current unsaved import overlays, input/settings revision identity, eligibility through the existing explicit-export/core serializer contract, and main-process atomic commit authority remain unchanged.
- Added opt-in `outputInspection` to `loadEntryModule`; it returns existing JSON/CSV eligibility metadata without evaluator/input loading. Normal loader/CLI calls retain their prior return shape and behavior. Named data export passes one selected `{name, format}` through the trusted worker and `serializeOutputs`; the worker never writes a destination.
- Webview export now uses a one-use opaque native selection ID. Bun retains the canonical path, active identity, and selected destination byte snapshot; the RPC exposes only the ID and basename. Existing files receive a trusted Replace confirmation, and the selected file's streamed SHA-256 is rechecked immediately before commit. Only native-selected destinations may be outside the project; direct caller paths remain unsupported by the desktop export RPC.
- Lead Developer bug remediation (2026-10-03): replace the `zenity`/AppleScript/PowerShell subprocess Save adapter with Electrobun's built-in `Utils.openFileDialog` directory picker. The Export modal shows an editable basename (not a path); Bun combines it with the selected directory and validates extension, basename, symlinks, conflicts, and project containment/explicit outside selection. This uses no separately installed OS package/executable.
- Bun issues one native Replace/Cancel prompt containing only the basename. Direct target-host folder dialog/overwrite behavior remains unverified and requires native acceptance.
- Worker-close race correction (2026-10-03): mark a result as received before dispatching asynchronous main-process export commit. A worker `close`/`error` after that result is cleanup, not a missing-result failure; pre-result exit remains an error. The atomic rename remains non-interruptible.
- Export workers remain cancellable through complete serialization and same-directory staging. The job enters `committing` only in the final pre-rename guard; the atomic rename itself is non-interruptible. This corrects phase reporting to the accepted contract and preserves no-write behavior for pre-commit cancellation/staleness.
- No output eligibility, format semantics, privacy boundary, or AMX/CLI/report behavior is broadened. At the time of this Sprint 042 decision, Sprint 041's 100k responsiveness exception remained assigned to Sprint 043; final disposition is recorded in the Sprint 043 closeout above.

## V0.6 Sprint 041 Candidate Gate (2026-10-02)

- Lead Developer direction (2026-10-02): select `vxe-table@4.22.3` for the production CSV grid and `json-editor-vue@0.19.2` backed by `vanilla-jsoneditor@3.13.0` for the production JSON editor. Integrate and use both in `desktop-app`; the proof-only status is superseded. Pin dependencies and carry the audited production bundle, scale, fidelity, and service-boundary checks into implementation acceptance.
- The Lead Developer reports all listed manual checks completed successfully and both editors working as expected. OS/session, input method, and individual timing details were not recorded and must be marked unavailable, not inferred. This closes the reported manual checklist as successful on that host only; it is not cross-platform or formal accessibility certification.
- Do not hand-roll virtualization or claim Sprint 041 editing acceptance before production behavior and remaining acceptance evidence pass. Preserve Sprint 036 request identity/jobs, Sprint 038 atomic autosave/conflicts, Sprint 039 mapping privacy, Sprint 040 shared facts, and existing core JSON/CSV semantics.
- Available-browser results are supporting candidate evidence only. Synthetic `CompositionEvent` dispatch is not native IME evidence; measured parsing, candidate viewport, and synthetic worker cancellation are separate results and cannot substitute for one another.
- The isolated proof host remains supporting evidence, not the production workbench. For VXE integration, register its official `en-US` dictionary before mounting the grid and audit all enabled controls for untranslated strings; the proof confirms “No data yet” and no Han characters in the visible page, while unrelated dictionary entries remain untranslated.
- Builder implementation: use Vite ES-module worker output to preserve Buffer-before-parser dynamic loading; bind VXE rows reactively, classify JSON record arrays before mounting the JSON tree, transfer parsed JSON through structured clone, and expose accessible sort buttons because custom editable header slots bypass VXE's default sort renderer. Keep `keep-source` disabled due large-grid overhead. These are implementation choices, not product-contract changes.
- Use each row's existing `__editorRowId` through VXE's native `rowConfig.keyField`/`useKey` settings rather than generating a second key. This reduced measured 100k load tasks but did not meet the responsiveness target.
- Builder measurements do not meet the responsiveness goal. VXE one-shot virtual scrolling reaches the 100k tail with 11 rendered rows, but load/edit tasks exceed the 100 ms target. Do not hand-roll virtualization.
- Automated tests and integrated-browser behavior pass as recorded in Sprint 041 evidence. Service privacy, conflict/no-write, autosave, close, stale owner revisions and diagnostic redaction remain in trusted boundaries. Browser/service checks do not close native Electrobun, IME, screen-reader, or cross-platform gates.
- **Disposition by explicit user direction (2026-10-02): COMPLETE WITH RECORDED EXCEPTIONS; Sprint 042 may proceed.** This is a sequencing decision, not a performance pass or a change to the 100 ms target. Sprint 043 owns remeasurement and remediation/exception review using the recorded 100k CSV/JSON/edit traces.

## V0.6 Sprint 040 Builder Implementation (2026-10-02)

- Keep semantic authority in `src/parser`, `src/typechecker`, and the existing module-import contract. Add `src/editor/` as a host-neutral fact layer that accepts a host-supplied module resolver; it imports neither VS Code nor desktop APIs and does not evaluate AMX or read mapped input values.
- Bound static graph traversal to 101 modules (the active entry plus the accepted 100-module overlay budget). Trusted host resolvers retain canonicalization, project containment, symlink checks, disk access, and open-buffer preference. Unsupported identity/ranges are withheld.
- Convert parser UTF-16/CRLF offsets only at CodeMirror's normalized-document boundary. Preserve source bytes on emitted edits by restoring the active document's line ending; source/checker locations and VS Code host ranges remain unchanged.
- Desktop multi-file symbol rename is a trusted Bun transaction: recompute current graph facts, reject reserved identifiers/collisions/stale revisions/conflicts, statically validate the candidate graph, stage each changed file, install with backups, and roll back any partial commit. The webview submits only offset/name/revision intent and verifies its buffer snapshot before applying its local undoable transaction.
- Keep the diagnostic quick fix restricted to the exact unknown-view diagnostic and exactly one prior visible view. VS Code resolve-time guards are retained, but the known VS Code 1.85 apply-time `WorkspaceEdit` limitation remains open for explicit Lead Developer disposition.
- No product-policy change is made. Native host certification, language semantics, CLI behavior, evaluator/input access, and unrestricted indexing remain outside this sprint.
- Follow-up to Lead Developer verification (2026-10-02): treat local CodeMirror document edits as authoritative until `props.text` acknowledges the exact editor document. Ignore differing asynchronous/stale text props while a local edit is pending; explicitly map the selection through legitimate external diff transactions. This fixes the observed cursor-to-line-start regression without changing the trusted Bun update/sequence authority.

## V0.6 Sprint 039 Builder Implementation (2026-10-02)

- No Lead Developer product-policy decision was required or made. Preserve session/per-run > local > project precedence, local-by-default persistence, explicit contained promotion, the existing version-1 config schema, report field scope/precedence, source-visible default, logo security, and webview authority.
- Implement mapping/report writes in the trusted Bun service using SHA-256 expected revisions and same-directory atomic replacement. Validate the complete candidate input map and project report object before commit; malformed, stale, cancelled, insecure-local, outside-root, network, symlink, or invalid-logo cases do not replace the selected configuration.
- The Inputs panel receives only logical names, declared types, source/status, bounded diagnostics/locations, and non-path revision hashes. Picker selections are consumed in Bun; local absolute paths and file bytes do not enter mapping/configuration responses or diagnostics. Explicit Open remains limited to contained project data; private external data opening is deferred to the Sprint 041 data-editor boundary and fails without returning its path or contents.
- Project-default settings update `.openamx/project.json`; current-document overrides update only the active buffer's YAML frontmatter through the YAML AST/document API and the existing autosave/conflict flow. Report value validation, logo decoding/sanitization, and contrast fallback are shared with `reportPreparation.ts`.
- The final Sprint 038 dependency is satisfied by the recorded Lead Developer direction. That direction does not supply the final native/manual matrix; Sprint 039 records its own native-picker and UI evidence gaps rather than inferring passes.

## V0.6 Sprint 038 Final Acceptance (2026-10-02)

- By explicit Lead Developer direction, Sprint 038 is **COMPLETE**; the Lead Developer reports all acceptance tests passed. This supersedes the earlier interim/remediation status. The final manual test matrix and exact per-test outputs were not supplied with this disposition, so none are fabricated here.
- Feature-sprint completion does not imply native release/platform, Hutch release packaging, Office, license/Marketplace, or formal accessibility certification.

## V0.6 Sprint 038 Remediation Decisions (2026-10-02)

- Keep worker resolution independent of the Bun main-module URL suffix: select the source TypeScript worker when that sibling exists, otherwise select the bundled JavaScript worker. Build the worker separately and copy it into the app's Bun resources; verify the packaged worker itself rather than relying only on source-mode worker tests.
- Implement file move/rename only through trusted Bun service logic. Parse exact AMX import path locations, prepare rewrites from current open buffers or disk, reject unsafe source imports, preflight source/dependent disk hashes, stage same-directory files, and invalidate active jobs after success. The webview submits only a bounded relative destination intent; it does not gain filesystem or import-rewrite authority.
- Show directories as a separate bounded list in the project listing response. Folder records are presentation-only and do not become openable documents.
- No exception or acceptance waiver is made for remaining Sprint 038 criteria. This remediation does not resolve preview/settings work owned by later sprints or certify manual/native behavior.

## V0.6 Sprint 039 Builder Gate (2026-10-02)

- **Historical Builder disposition: BLOCKED BEFORE IMPLEMENTATION; superseded by the final Sprint 038 acceptance above.** At the time, Sprint 038 had only interim evidence and no recorded Lead Developer disposition.
- No Sprint 039 product-policy decision is made or changed: session/per-run > local > project precedence, local-by-default persistence, explicit contained promotion, report field scope/precedence, frontmatter preservation, logo security, and webview authority remain governed by the ratified contract. The Sprint 038 entry gate is now resolved; existing read-only service behavior is not an accepted config-write boundary and Sprint 039 must implement and test its own trusted write path.

## V0.6 Sprint 038 Interim Lifecycle Decisions (2026-10-01)

- Create Project is a trusted Bun operation. The webview invokes only `pickCreateProject`; the native picker returns an untrusted directory that the service requires to be an existing, real, empty directory. The service stages `.openamx/project.json` (`version: 1`, empty `inputs`) and `report.amx`, removes created artifacts on failure, and only changes project generation/current document after the scaffold succeeds.
- Autosave defaults to enabled but remains configurable with a bounded 100-10,000 ms delay. It reuses the established disk-hash conflict detection and same-directory atomic write path, saving exact invalid text. An unresolved conflict suppresses autosave rather than overwriting disk. Preference persistence and explicitly opened external files remain Sprint 038 work, not implemented policy.
- Delete is recoverable only for currently supported contained regular project files. The Bun service relocates the file into ignored `.openamx/trash/<uuid>/payload` with relative-path metadata, validates restore metadata/paths/symlinks/collisions, and invalidates the active project generation on delete/restore. Folder deletion and import/reference resolution require later decisions/evidence before being claimed.
- Create/duplicate paths are explicit bounded project-relative intents, validated solely by Bun against visible contained existing parents. New AMX/CSV/JSON files and duplicates use same-directory temporary files and atomic rename; no webview filesystem capability was introduced. Transactional rename/move with import rewrites remains a separate decision/implementation gate.
- Recovery snapshots contain only dirty contained AMX/CSV/JSON buffers and relative paths in private machine-local storage adjacent to desktop session metadata. Restore repopulates in-memory tabs only and preserves disk files; discard is explicit. External buffers, settings/preferences persistence, and size/retention policy beyond the implemented ten-document/five-million-character bound remain Sprint 038 follow-up work.

## V0.6 Sprint 035 Lead Developer Ratification (2026-10-01)

- The Lead Developer ratified `planning/openamxV06ProductUXContract.md` without amendment and authorized Sprint 036.
- Accepted active-document operation identity: `{ canonicalActiveUri, projectGeneration, documentRevision, inputSettingsRevision, jobId }`; only the matching current identity may publish results. Active AMX document replaces desktop designated-entry state.
- Accepted source-overlay approach: keep the existing loader/parser/checker/evaluator, add an optional map of open unsaved module source keyed by existing canonical contained file paths, prefer it for reachable imports, and preserve no-overlay CLI behavior. The Sprint 035 proof implementation is in `src/runtime/moduleLoader.ts`.
- Accepted cancellable-job approach: trusted Bun workers perform cancellable/supersedable preview/run, input-validation, and report-preparation/serialization work; the main process owns identity checks, path/destination validation, and final atomic writes. Workers and typed progress/results are bounded, local paths are redacted, and stale/cancelled work cannot commit. Bun Worker termination remains experimental; Sprint 036 must validate real job cleanup and limitations rather than claim unsupported cancellation guarantees.
- Sprint 035 is **ACCEPTED WITH RECORDED EXCEPTIONS**, not a claim that native APIs or a grid candidate passed. Native behavior is assigned to Lead Developer host evidence before the dependent native acceptance in Sprints 037-039/042. Data-editor candidate/100k viewport proof is assigned to Lead Developer / Sprint 041 Builder before Sprint 041 selection or implementation. Production worker cleanup/performance is assigned to Sprint 036/042 evidence. Each residual includes impact and fallback in `planning/state.md` and Sprint 035 acceptance.

## V0.6 Sprint 036 Builder Decisions (2026-10-01)

- Preserve the Lead Developer-accepted identity, overlay and worker boundaries. Add `inputInspection` as an opt-in `loadEntryModule` mode that shares canonical import resolution and unsaved source overlays, validates supplied JSON/CSV in memory, returns schema/diagnostics/export metadata, and skips AMX evaluation. Default loader and CLI behavior remain unchanged.
- Add `validate-data` to the existing typed worker job protocol. The Bun service validates the active identity and bounded request before worker creation; the worker never returns parsed data values or external mapped-data paths. The result advertises only schemas for explicitly exported values and formats supported by the existing serializers.
- Keep cancellation truthful by retaining a worker handle until its `close` event and exposing `cleanupPending` separately from cancelled/superseded acknowledgement. Bun Worker termination remains experimental; final destination validation and atomic writes stay in the main process, and an atomic rename already underway is not interruptible.
- No Lead Developer decision gate was crossed or changed. These are additive foundation APIs; no new product rule, AMX syntax, CLI semantic or VS Code behavior was introduced.

## V0.6 Sprint 037 Builder Decisions (2026-10-01)

- Keep shell presentation state typed in the webview and retain all project, document, job, destination, and filesystem authority in the existing Bun RPC service. `App.vue` composes focused shell components but does not add a second document or job model.
- Use stable command IDs with enabled predicates and disabled reasons as the shared webview registry for palette and shortcuts. Native menu integration remains intentionally unavailable rather than inferred from registry source.
- Persist only theme and drawer docking preferences locally in the webview plus the existing bounded service panel sizes. Do not persist document text, mappings, private paths, recovery content, or project lifecycle state.

## V0.6 Sprint 035 Builder Evidence (2026-10-01)

- Superseded by `V0.6 Sprint 035 Lead Developer Ratification` above. The prior Builder record is retained as an accurate pre-decision snapshot; the Lead Developer subsequently ratified the contract and accepted the three Sprint 036 entry approaches.
- The optional `ModuleLoadOptions.sourceOverlay` proof accepts only existing canonical paths, limits the map to 100 modules, requires every key below the canonical entry root, and takes precedence for reachable imported dependencies while retaining `entryText` for the entry. No existing caller was changed. Focused module/CLI regressions pass; Lead Developer acceptance remains required before Sprint 036.
- Cancellation evidence supports only this proposal: combine worker termination for non-yielding CPU phases with request identity/supersession checks; keep destination validation and final atomic writes in the main process. Bun 1.4.2 documents Worker termination as experimental, and the current test uses a synthetic busy loop rather than the parser/input/report pipeline. Do not treat this as an accepted cancellable-job architecture.
- `vxe-table@4.22.3` is the leading candidate for a bounded next proof because public metadata/docs indicate MIT, Vue 3, virtual scroll, keyboard/edit support, and undo/redo; this is not a selection. Its Bun/Vite host build, bundle impact, memory, actual 100k-row viewport, and pinned dependency graph remain untested. RevoGrid Community lacks demonstrated built-in history because documentation assigns it to Pro. JSON editor options do not yet prove exact invalid-text preservation plus large-data behavior. Lead Developer acceptance is pending any future selected component.
- The review harness uses the contract token intent with measured higher-contrast neutral divider fallbacks in the prototype only. No change to the authoritative V0.6 or V0.5 token contract is approved by this proof.

## V0.6 Product Discovery Decisions (2026-10-01)

- V0.6 is a desktop UX-quality milestone, not a packaging/release milestone. All selected desktop tracks are must-haves and there is no fixed sprint/date budget. No AMX language semantics change.
- The active AMX tab replaces designated-entry desktop state and owns analysis, preview, power Run, and export. Live preview uses all relevant open unsaved module buffers, is debounced by default, supports pause/cancel, and retains a clearly stale last-good preview after an invalid edit.
- Desktop remains the only changed product surface. Narrow backward-compatible shared loader/data/editor APIs and internal VS Code-provider extraction are approved only to prevent duplicated semantics; CLI and VS Code behavior must remain compatible.
- The workbench uses a contained relevant-file explorer, adjustable source/context split, bottom/right runtime drawer, native menus, command palette, contextual icons, system/light/dark themes, and a 1024x720 minimum. Remove the crowded workflow strip, dead wide-window selectors, entry controls, separate format buttons, and plus/minus resizing.
- Project scope includes create, duplicate, drag/move, rename, delete, reveal/open, project-local trash, delayed autosave for every explicitly editable file, disk-conflict checks, and local crash recovery. Rename/move updates relative AMX imports transactionally; delete remains recoverable until Empty Trash.
- AMX authoring requires exact fence-aware highlighting, completion, inline diagnostics, hover, definition, references, rename, and deterministic code actions through shared parser/checker/link facts. CSV/JSON requires virtualized structured and raw editing with mapped AMX schema validation, targeting supported 100,000-row data and 100 relevant project files.
- Declared inputs use picker-backed contextual slots and persist privately by default, with explicit portable-default promotion. Report settings edit effective project defaults and current-document overrides. One Export workflow owns HTML, PDF, DOCX, and explicitly exported JSON/CSV values and may use an explicitly selected validated destination outside the project.
- Local/offline operation, no telemetry, typed main-process/worker authority, bounded/redacted payloads, atomic writes, practical keyboard/focus/contrast quality, and available-host UX acceptance remain required. Native platform release certification, Hutch, Office, license/Marketplace, report-mobile overflow, VS Code apply-time remediation, and formal WCAG certification stay separate.

## Sprint 034 Builder Findings (2026-10-01)

- CLI `--version` had drifted to `0.3.0` while root/extension package metadata remained `0.4.0`; it now reports `0.4.0`. Package metadata remains `0.4.0` because V0.5 has not been released.
- CLI diagnostics now present workspace-relative locations or an external basename, omit raw configured data paths, and redact quoted absolute paths embedded in messages. Focused tests cover external input and output paths without weakening diagnostic codes or no-write behavior.
- F4 acceptance exposed a real asset-validation gap: Sharp accepted PNG bytes under a `.jpg` suffix. `prepareReport` now rejects a decoded-format/extension mismatch as `AMX6001`; focused asset and metadata tests cover this with other missing/malformed/oversize and invalid-field cases.
- These are verified acceptance corrections, not a change to the approved V0.5 contract. The Lead Developer's subsequent direction accepts V0.5 with the listed product/visual exceptions deferred to the V0.6 backlog; this does not close the separate release-engineering gates.

## Sprint 034 Lead Developer Acceptance (2026-10-01)

- On 2026-10-01 the Lead Developer directed that V0.5 be marked completed and accepted, with pending features/fixes carried into V0.6; the product is not being released yet. This supersedes the Builder's earlier OPEN/BLOCKED recommendation.
- Record as accepted with exceptions, not as every criterion passed: F1/F3 mobile source overflow; named DOCX/native desktop visual observations; Sprint 029 native/accessibility gaps; Sprint 030 editor/analysis/accessibility gaps; and Sprint 033's resolve-time-only `WorkspaceEdit` guard. V0.6 backlog owner is the Lead Developer/project maintainers; recheck at V0.6 acceptance, calendar date TBD.
- Keep native target platforms, Hutch package/native launch, broad Office compatibility, project licensing and Marketplace publication OPEN as separate release-engineering gates. No release-ready or published claim is authorized.

## V0.5 Sprint 034 Final Acceptance Handoff (2026-10-01)

- Sprint 034 is an evidence and disposition sprint, not permission to normalize existing gaps. Use the approved F0-F6 manifest, root/desktop/extension acceptance matrix and signed Lead Developer review form. Update public docs/version metadata only after the claimed behavior has focused evidence; historical specifications remain historical.
- Require a Lead Developer decision on Sprint 033's `WorkspaceEdit` limitation: VS Code 1.85 offers resolve-time document/token/diagnostic guarding but no apply-time version precondition. Either accept it as a bounded documented exception or authorize a separate guarded command/preview remediation; do not call that criterion fully satisfied without the decision.
- Treat Sprint 029 native workflow, Sprint 030 editor proof/functionality exceptions and Sprint 032 named viewer/visual evidence as distinct V0.5 product gates. An `Approved with recorded exceptions` result requires named owners/dates/rechecks for each; otherwise state V0.5 feature acceptance is OPEN/BLOCKED.
- Maintain an independent release-engineering disposition for native targets, Hutch, Office compatibility, project license and Marketplace. Local VSIX installation and WSL2 checks remain supporting evidence only and cannot become publication or native release proof in docs.

## Sprint 033 Direct Provider Implementation (2026-10-01)

- Share the extension's existing canonical, explicit-export import traversal with read-only navigation, locating declarations by checked keyword/name tokens in the original buffer. Recompute from current open documents rather than persisting a workspace index. Match references by resolved URI and declaration-token range; withhold nested uses whose scope/location the parser cannot establish. Hover uses escaped plain text and checker-confirmed binding types only where available.
- Restrict the initial quick fix to the checker's exact `AMX3001` unknown-visualization diagnostic and one preceding visible view, with same-document-only `WorkspaceEdit` assembled after a document-version/token/live-diagnostic recheck in `resolveCodeAction`. The VS Code 1.85 edit API has no apply-time version precondition; retain this as an explicit acceptance-review limitation rather than promising stale-proof application. Local VSIX verification used `--skip-license` only after the Lead Developer approved proceeding past the known missing-license warning; no project license or Marketplace decision was made.

## V0.5 Sprint 033 Architect Handoff (2026-10-01)

- Sprint 033 owns the direct Node-host extension providers described in the approved V0.5 contract; it depends on Sprint 028, not on the Sprint 029/030 desktop acceptance or Sprint 032 viewer review. Reuse parser/checker/read-only contained module facts and extend them for unsaved dependency buffers and exact symbol identity; withhold uncertain results rather than returning guessed locations or edits.
- Limit code actions to deterministic diagnostic/range/version-checked `WorkspaceEdit` results with no auto-apply, evaluator, input load, LSP process or arbitrary filesystem writes. Extend the existing formatting/completion/diagnostic host suite, and only describe/package functionality supported by actual Extension Development Host evidence.
- The Sprint 031 shared-preparation remediation and Sprint 032 automated report work are recorded as implemented below, not as Sprint 034 Lead Developer visual approval or broad Office compatibility. Keep Sprint 029/030 product exceptions, native/Hutch release checks and unresolved license/Marketplace publication independent of Sprint 033 acceptance.

## Sprint 031 Remediation Authorization and Sprint 032 Continuation (2026-10-01)

- The Lead Developer selected Option 1: complete the Sprint 031 remediation before Sprint 032 presentation work. The accepted implementation boundary is `PreparedReport`: trusted callers prepare validated project/frontmatter identity, bounded sanitized logo bytes, final narrative substitutions and immutable ordered source/view emissions once; HTML/PDF/DOCX serialize only that value.
- `sharp@0.35.5` is selected as the local decoder/re-encoder for PNG/JPEG logo validation and metadata stripping; installed package metadata declares Apache-2.0. PDF/DOCX receive prepared PNG bytes/data only, never raw paths, `data:` values, project config, frontmatter or evaluator access. The legacy direct PDF/DOCX adapter overloads were removed to make this boundary compile-time enforced.
- Automated remediation and export checks are sufficient to continue Sprint 032 implementation under the Lead Developer authorization. Final visual review, named PDF/DOCX viewer inspection, tagged-PDF/PDF-A, broad Office compatibility, native platform/Hutch and license/Marketplace release gates are not implied and remain under their existing owners/Sprint 034 process.

## Sprint 032 Builder Gate Disposition (2026-10-01)

- Do not authorize Sprint 032 implementation from a reported Sprint 031 completion alone. The gate review verified that the current adapters lack the contract-required shared prepared model: `renderHtml.ts` directly resolves raw identity/config/assets and permits `data:` logos with silent configuration/asset fallbacks, while `reportPdf.ts` and `reportDocx.ts` separately read frontmatter and interpolate narrative.
- The remediation decision remains with the Lead Developer: assign/accept Sprint 031 work that introduces one trusted immutable identity/content preparation boundary with strict source-located validation and sanitized contained PNG bytes, then rerun the Sprint 031 acceptance; alternatively record an explicit dependency disposition naming the prerequisite owner and remediation. Until then, PDF/DOCX must not consume raw logo/report values or claim branded presentation.
- This is a dependency decision only. It does not waive Sprint 029/030 exceptions, native platform/Hutch, Office, license/Marketplace or Sprint 034 visual-review gates.

## V0.5 Sprint 032 Conditional Handoff (2026-10-01)

- Prepare Sprint 032 documentation, not unconditional implementation authorization. Sprint 031 depends only on Sprint 028 but Sprint 032 depends on accepted Sprint 031; no Builder outcome/Lead Developer acceptance has been recorded. The current direct HTML resolver and independent PDF/DOCX metadata paths cannot be treated as the approved shared validated model.
- Require a named Sprint 031 remediation/acceptance owner or explicit Lead Developer dependency disposition before Sprint 032 export work consumes identity. In particular, reject unchecked `data:`/absolute/remote logos, missing-file silent fallback and catch-to-empty invalid project config; enforce source-located strict diagnostics, sanitized contained PNG and a single prepared identity/content sequence before any export write. Do not copy present HTML behavior into PDF/DOCX or silently change the approved V0.5 contract.
- After the gate, apply resolved values through format-native pdfmake/DOCX layout with existing searchable/editable content and destination safety. Sprint 034 owns final visual review; Sprint 029/030 desktop exceptions and inherited native/Hutch, Office and license/Marketplace gates stay independently open.

## V0.5 Sprint 031 Handoff and Residual Ownership (2026-09-30)

- Sprint 031 depends on the accepted Sprint 028 contract only; the Lead Developer's Sprint 030 closeout does not impose desktop residuals on report identity/HTML. Preserve a trusted shared preparation model with one evaluated document, final narrative context, immutable view emissions and validated portable identity. PDF/DOCX presentation remains Sprint 032, CLI/docs integration acceptance remains Sprint 034.
- Close the decision questions already explicitly answered: Sprint 029-to-030 dependency was authorized without accepting Sprint 029, CodeMirror selection was approved, and Sprint 030 was closed with documented exceptions. Historical pending-question text remains as an audit trail, not a reopened decision.
- Assign unresolved Sprint 029 native picker/project/quit and populated accessibility checks to the Sprint 029 desktop follow-up and Lead Developer native review. Assign Sprint 030's unfinished AMX token coloring, static import completion/linking, revision/export UI and accessibility/test proof to a separately authorized desktop remediation follow-up before full Sprint 034 V0.5 feature acceptance; the Lead Developer must approve scope/owner before declaring those criteria resolved. Neither is made Sprint 031 scope nor silently waived by a closed sprint label.
- Keep inherited V0.4 target-native/Hutch, Office round-trip/broad compatibility, and license/Marketplace issues as separate release-owner tracks. Sprint 034 must report them independently and never call unavailable evidence passed.

## Sprint 030 Closed With Recorded Exceptions (2026-09-30)

- Lead Developer tested the integrated UI, reported the CodeMirror editor works as expected, and directed Sprint 030 to close. Record **CLOSED with acceptance exceptions**, not "all criteria passed": AMX-token coloring, pure import-aware completion/linking, full editor/UI/request-state coverage, revision-labelled export feedback and native IME/screen-reader/200%-zoom proof remain unverified or unfinished. Do not reinterpret this direction as a Sprint 029 acceptance, native release-platform approval, or Sprint 034 visual sign-off. Assign and verify these exceptions separately before a full V0.5 feature-acceptance claim.

## Sprint 030 Editor Adoption Approved (2026-09-30)

- Lead Developer reviewed the isolated CodeMirror proof, reported it worked well, and explicitly approved using it. Pin `codemirror@6.0.2`, `@codemirror/lang-markdown@6.5.2` and `@codemirror/search@6.7.2` (npm metadata MIT) in the desktop package. Replace only the workbench source textarea; keep Bun main-process analysis/filesystem/export authority and per-tab editor states. Browser proof and Lead Developer approval authorize integration, but do not certify native screen-reader/IME/platform behavior or complete Sprint 030 acceptance.

## Sprint 030 Editor Candidate Research (2026-09-30; Superseded by Approval Above)

- Keep the production textarea while proving CodeMirror in an isolated Bun/Vite spike. npm registry metadata reports MIT for the pinned core and Markdown packages, but a 612.01 kB minified / 209.97 kB gzip proof JS bundle and browser keyboard smoke check do not satisfy the required IME, screen-reader, 200% zoom, AMX-fence highlighting or Electrobun-host proof. Do not install the candidate in the desktop package or label Sprint 030 complete until those checks pass; the authorized Sprint 029 dependency disposition remains separate.

## Sprint 030 Dependency Authorized (2026-09-30)

- Lead Developer explicitly authorized Sprint 030 with Sprint 029 still OPEN despite persistent native Open Project selection failure under WSL2. Preserve the Sprint 029 picker/save/close and UX residuals for follow-up before Sprint 034 acceptance; Recent projects may support bounded WSL2 Sprint 030 authoring checks but does not prove native project selection. This disposition does not select an editor or waive its accessibility/host proof, nor does it close any V0.4 release gates. Do not run Hutch checks as a Builder verification step.

## Sprint 029 Manual Verification Direction (2026-09-30)

- Lead Developer requested no further Builder Hutch checks and will verify the desktop app manually. Treat Hutch timeout as a separate inherited release residual, not the only Sprint 029 acceptance gate; native save/close behavior and populated workbench acceptance still require evidence. Ask for the recorded manual check outcome or explicit dependency disposition before Sprint 030 implementation; do not silently close Sprint 029 or waive its unverified criteria.

## Sprint 029 Option 1 Follow-Up (2026-09-30)

- Lead Developer chose option 1, not a waiver for Sprint 030: implement and verify the native save picker and native close/quit before asking for Sprint 029 acceptance. Electrobun 2.0.1 exposes no save panel but does expose a vetoable `will-close`; route export save selection through Bun-launched OS dialogs, then validate the returned path in the existing service. Linux `zenity` is a runtime prerequisite; no new native addon or webview authority is introduced. Direct command tests do not authorize acceptance without target-host dialog and close evidence.

## V0.5 Sprint 030 Conditional Handoff (2026-09-30)

- Prepare the Sprint 030 contract and Builder artifacts now, but do not interpret the Lead Developer's Sprint 029 change approval as Sprint 029 acceptance. Sprint 029's create-new native save picker and native close/quit proof remain open; obtain an explicit Sprint 029 acceptance or dependency disposition before editor implementation. No waiver is inferred from this preparation.
- Sprint 030 must select a maintained editor only after a bounded license, bundle, keyboard/IME, selection/undo, screen-reader, zoom, reduced-motion, large-file and Bun/Vue/available-native-host proof. Reuse the existing main-process tab/revision and pure formatter/parser/checker/local-link boundary; no second AMX grammar, data loading or webview filesystem/evaluator capability.
- Run/preview/export feedback must be tied to the designated entry's unsaved buffer, project/tab/input revisions and typed RPC; late/failing responses cannot appear as current success. Continue to record Sprint 029 native workflow and V0.4 release-engineering residuals separately from Sprint 030 editor outcomes.

## V0.5 Sprint 029 Follow-Up Authorization (2026-09-30)

- The Lead Developer approved using an audited cross-platform native save picker in Bun and confirmed Save All / Discard All / Cancel on dirty project switch and quit, with a vetoable native close/quit hook. This is authorization of the existing Sprint 028 policy, not approval of an alternate typed-path fallback or relaxed acceptance criteria.
- The Bun service now preflights all known tab conflicts before Save All; the project is committed only after confirmation and successful saves. The generated Electrobun `before-quit` veto has been wired for a native prompt and guarded retry. This is direct-test evidence, not proof that all native window-close paths invoke `before-quit` on release hosts.
- The proposed `tinyfiledialogs-node@1.1.8` dependency was rejected pending cross-platform/source audit: npm publishes linux x64/arm64, Windows x64, macOS arm64 prebuilds but no macOS x64, and its package tarball has binary addons but no native source. No new dependency, platform waiver, or save-picker implementation is approved from that candidate.

## V0.5 Sprint 029 Lead Developer Approval (2026-09-30)

- The Lead Developer approved the changes made on Sprint 029. No explicit exception to the Sprint 028 contract or closure of Sprint 029's previously recorded acceptance blockers was given; retain those items as open until separately resolved or explicitly decided.

## V0.5 Sprint 029 Initial Builder Disposition (2026-09-30; See Follow-Up Above)

- No deviation from the approved Sprint 028 policy is proposed or approved. The current native picker is limited to existing paths; explicit existing-output export retains destination validation and atomic writes, but is **not** accepted as the required create-new save dialog. Preserve the existing main-process report operations for direct callers while leaving the new UI workflow blocked pending a Lead Developer-approved implementation path.
- Use the project's generated Electrobun 2.0.1 SDK for API capability checks, not the unrelated cached Electrobun 1.16.0 copy. Its `openFileDialog` decodes structured paths; it has no `saveFileDialog`. The SDK exposes a `before-quit` approval API, but its window-close/quit behavior has not been integrated or verified on a native host. Do not infer native acceptance from the WSL2 Vite/browser shim.
- The workbench retains the existing textarea as Sprint 029's basic editing surface. Main-process tabs and relative session metadata are a candidate boundary for Sprint 030, contingent on resolving Sprint 029 workflow blockers; no editor-component selection or report identity redesign was made.

## V0.5 Sprint 029 Architect Handoff (2026-09-30)

- Sprint 028's approved `docs/language-spec-v0.5.md` section 5 is normative for the desktop shell; Sprint 029 preparation is not approval to change those product rules. Extend the existing typed main-process service from one current document to per-tab state with separate active and explicitly designated entry. Run/preview/export use the entry's unsaved text, and dirty dependencies must be saved before use.
- Native dialogs return untrusted path intents. All containment, symlink, extension, conflict and atomic destination validation remains in main-process operations. Explorer listings and project/session restore must reject ignored or substituted paths. Persist local session metadata only, never text or input secrets in project files.
- The workbench shell may retain the existing basic editor surface for Sprint 029. The named full editor and its keyboard/IME/screen-reader/bundle/license proof are Sprint 030's gated choice; Sprint 031 branding, Sprint 033 VS Code tooling and Sprint 034 visual sign-off are separate.
- Preserve open native macOS 14+, Windows 11+, native Ubuntu 24.04+, Hutch package/launch, broad Office and project license/Marketplace tracks. Do not infer release acceptance from a successful direct desktop test or WSL2 evidence.

## V0.5 Sprint 028 Approved Contract Choices (2026-09-30)

- The Lead Developer explicitly approved the [V0.5 contract](../docs/language-spec-v0.5.md) and [review manifest](sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md) on 2026-09-30. The Sprint 028 gate is satisfied for Sprints 029, 031 and 033; their own criteria remain in force. Retain version-1 `inputs`, local/per-run mapping precedence and CLI working-directory paths; add only optional portable project `report` and frontmatter `report`, with field-by-field overrides and visible source by default. CLI report commands opt in via explicit `--project-root`; no implicit discovery.
- Use strict identity validation with source JSON pointers/original YAML coordinates, fail-before-write invalid brand assets, local PNG/JPEG input with re-encoded bounded PNG embedding and canonical symlink-free project containment; effective accent fails over to neutral contrast for text/controls, not chart series. Preserve final-environment narrative, show-time snapshots, source/view order and format-native accessibility rather than pixel parity or tagged-PDF/Office claims.
- Desktop ownership: native dialogs validated after selection in main process, contained explorer and per-tab hash/dirty/conflict revisions, explicit entry for current-buffer run, no dirty dependency substitution, local-only session metadata and stale-request rejection. Direct extension providers use source-located pure facts and withhold uncertain results. Sprint 030 must prove the chosen editor rather than adopting one by name without accessibility/compatibility evidence.
- Sprint 034 runs the manifest and records Lead Developer visual approval or exceptions separately from automated tests and the inherited V0.4 native/Hutch, Office, license/Marketplace residuals. No production files or historical specs were changed in Sprint 028.

## V0.5 Sprint 028 Architect Handoff (2026-09-30)

- Prepare Sprint 028 as a contract-only Builder handoff. The master V0.5 roadmap supplies scope and compatibility defaults; its implementation-specific schema, security bounds, UI states, and review fixtures still require an authoritative reviewed contract and explicit Lead Developer acceptance. No implementation sprint is authorized by preparation alone.
- Preserve `.openamx/project.json` version-1 input mapping semantics while specifying the smallest additive portable identity schema. Report-level overrides, source locations, strict validation, safe local logo behavior, and visible-source default are normative decisions for Sprint 028 to document; unresolved policy choices must be raised before dependent implementation.
- The desktop remains main-process-authoritative through typed RPC. HTML/PDF/DOCX share evaluated report identity/content order with format-native layouts. VS Code remains pure direct Node-host providers. Do not reopen V0.2-V0.4 language semantics or infer release-engineering approval from V0.5 feature work.
- The Lead Developer visual review in Sprint 034 uses the Sprint 028 checklist and fixtures; it supplements automated checks. V0.4 native platform/Hutch, broad Office, and project license/Marketplace residuals remain separate OPEN tracks.

## V0.4 Sprint 027 Preparation

- Sprint 027 owns the final V0.4 example, documentation/version alignment, compatibility proof, CLI/extension/desktop acceptance, release-owner platform checks, and truthful final disposition. It must not add new product features or weaken a required gate.
- Sprint 026 DOCX was delivered as an approved stretch using `docx@9.8.1`; semantic OOXML inspection passed, but native Office/LibreOffice round trips and broad cross-platform compatibility remain unverified. Report this disposition without making DOCX a core gate.
- Sprint 025 implementation and tests passed, but official macOS 14+, Windows 11+, and native Ubuntu 24.04+ build/launch checks remain open, as do Hutch package/launch residuals. WSL2/Linux evidence cannot substitute for those release-owner checks.
- V0.4 may be marked `COMPLETE` only after every required core gate is directly verified. Otherwise leave release status `OPEN`, record the blocker/options and residual limitations, and do not imply a release claim.
- Preserve historical V0.2/V0.3 specifications, no-option compatibility, dependency/license notices, the unresolved project license/Marketplace status, and all exact verification evidence.

## V0.4 Sprint 026 Approval Decision (2026-09-30)

- The Lead Developer explicitly approved Sprint 026 implementation and confirmed sufficient time to bring the optional stretch into scope. The approval does not waive Sprint 025's open native platform matrix or Hutch residual and does not make DOCX a V0.4 core gate.
- The bounded comparison selects a maintained semantic DOCX generator over hand-authored OOXML for lower maintenance risk. The selected candidate must now prove Bun compatibility, local/offline generation, semantic editability, static chart-image insertion, package licensing, and inspectable OOXML structure before final acceptance.
- The adapter will consume the evaluated document and immutable `Environment.viewEmissions` through a shared report traversal. CLI and desktop entry points will reuse their existing main-process/CLI analysis and safe atomic-write boundaries.
- Final delivery must record exact dependency/runtime/OS/tool versions, license evidence, semantic package inspection, no-write behavior, supported entry points, and unverified cross-platform office compatibility.

## V0.4 Sprint 026 Delivered Outcome (2026-09-30)

- Selected and shipped `docx@9.8.1` (MIT) for semantic OOXML generation. The test-only package inspector uses `jszip@3.10.1` (MIT). The package runs in the Bun 1.4.2 root and desktop main-process pipelines on this Linux/WSL2 host.
- `src/renderer/reportDocx.ts` consumes the evaluated `OpenAmxDocument` and `Environment.viewEmissions` directly. Its output is editable WordprocessingML for headings, narrative paragraphs, bullet lists, tables, captions, and chart data; charts are static local SVG images with a required local PNG fallback. No second evaluation path or remote resource is used.
- CLI and desktop both use explicit `.docx` destination validation and atomic same-directory writes. Focused tests inspect OOXML content/order/media and verify invalid destinations, analysis failures, and existing-destination preservation.
- Exact byte identity and visual parity are not guaranteed. Native Office/LibreOffice round-trip checks and official macOS 14+, Windows 11+, and native Ubuntu 24.04+ checks were unavailable; no cross-platform compatibility claim is made. DOCX remains outside the V0.4 core gate.

## V0.4 Sprint 024 Builder Outcome

- Added the isolated typed desktop session/RPC boundary in `desktop-app/`. Main-process handlers own project root canonicalization, symlink-aware containment, safe local `.amx` listing, open/read/update/save, conflict detection, formatting, static analysis, and current-buffer HTML preview.
- Preview passes `entryText` to the existing `loadEntryModule` and renders the returned document/environment through `renderHtml`; the webview never receives filesystem or evaluation authority and never runs stale saved text.
- The workbench is a split source editor/live preview with local module navigation, dirty/conflict indicators, diagnostics, formatting, save, bounded status, and a sandboxed iframe. Sprint 025 remains responsible for input/run/result/export workflows.
- Focused verification passed: desktop payload/session contract (13 assertions), direct `bunx tsc --noEmit --skipLibCheck`, direct `bunx vite build` (625 modules), and shared renderer/module regressions (46 tests, 151 assertions). Hutch and full package/root/extension verification remain to be recorded below after execution.

## V0.4 Sprint 025 Preparation

- Sprint 025 owns current-buffer analysis/run, configuration precedence, diagnostics/status, HTML/PDF actions, safe desktop outputs, and official platform acceptance. Sprint 024's typed main-process RPC/session foundation remains the boundary; no webview authority is added.
- Desktop input precedence is per-run override, then ignored machine-local `.openamx/local.json`, then portable `.openamx/project.json`. Desktop-relative paths use the canonical project root; CLI path semantics remain unchanged. Private local paths never enter shared configuration or unbounded diagnostics.
- Current-buffer execution passes the supplied entry text plus file-backed URI through the existing loader/checker/input/evaluator path. The desktop calls the shared renderer and Sprint 023 PDF adapter after that barrier; it must not duplicate or re-evaluate core semantics.
- Run/preview/export responses are typed, bounded, and stateful. The webview remains incapable of direct filesystem, module/input loading, evaluation, shell, or PDF access. Invalid analysis and pre-rename export failures preserve no-write guarantees.
- Official acceptance targets remain macOS 14+, Windows 11+, and Ubuntu 24.04+. The WSL2/Hutch timeout residual is recorded but cannot substitute for owner checks or be silently claimed as passed.

## V0.4 Sprint 026 Preparation

- Sprint 026 is an optional stretch only. Sprint 025's native macOS 14+, Windows 11+, and Ubuntu 24.04+ acceptance remains open, so no DOCX implementation may begin without explicit Lead Developer confirmation that core V0.4 must-haves are on track and approval to spend stretch scope.
- The sprint may end successfully as `deferred` after a bounded feasibility comparison. It must not delay PDF, desktop, platform, example, or release acceptance, and DOCX must never become a V0.4 core gate.
- If delivered, DOCX reuses the shared evaluated report model and produces semantic editable headings, paragraphs, lists, tables, and static chart images locally/offline. It does not promise interactive charts, pixel parity, PDF conversion, or cross-platform office compatibility without evidence.
- Any approved entry point uses explicit `.docx` destination validation, complete pre-write preparation, same-directory temporary output, atomic rename, and existing-destination preservation on pre-rename failure. Dependencies/assets require recorded licenses and no remote content.

## V0.4 Sprint 025 Builder Outcome

- The desktop config shape is `{ "version": 1, "inputs": { "logicalName": "path" } }`; missing files mean no defaults, unknown keys and invalid values fail without modifying files. Project defaults must be relative and canonicalize inside the root. Local overrides may use absolute or project-relative paths and, on POSIX, must be owned by the current user with group/other access disabled. Per-run `name=path` values override local, then project defaults. This is a narrow desktop config contract; core/CLI semantics are unchanged.
- The workbench runs and previews the captured current buffer through `loadEntryModule` with the existing module, input, checker, evaluator, renderer, and PDF paths. It reports bounded diagnostics, omits declared inputs from the result summary, caps primitive strings and summary count, and represents collections/records only by count/kind. Late UI responses are ignored after a buffer or newer request revision.
- HTML/PDF output destinations are explicit project-root paths with existing parents, exact lowercase suffixes, symlink/conflict checks, and same-directory atomic writes. PDF calls `preparePdfReport`/`serializePdfReport` and the shared atomic PDF writer; no report/evaluator logic is duplicated.
- Configuration precedence, malformed config, POSIX local permissions, JSON/CSV data validation, aggregate/fail-fast errors, private-path redaction, current-buffer/import behavior, HTML/PDF success, symlink/path rejection, and existing-output preservation are covered by `desktop-app/tests/rpc-contract-check.ts`.
- DOCX was not implemented or authorized; it remains a non-blocking stretch for separate approval. No project license was selected and no Marketplace publication was attempted. Roboto's Apache 2.0 notice remains required for redistribution of bundled fonts.
- The official platform matrix remains open. Ubuntu 24.04.4 under WSL2 is supporting evidence only; package-script Hutch stalls and this environment do not verify native Ubuntu, macOS 14+, or Windows 11+.

## V0.4 Sprint 024 Preparation

- Sprint 024 evolves the isolated Electrobun 2.0.1 + Bun + Vue + shadcn-vue spike into a desktop foundation. It owns file/project open, safe navigation, dirty/save/conflict state, editor services, split live preview, and typed main-process RPC; Sprint 025 owns input/run/result/export workflows.
- The current buffer is authoritative for formatting, diagnostics, and preview. File-backed entry URIs remain required for local imports and containment-sensitive operations; untitled buffers may be edited/diagnosed but must receive an explicit limitation for project operations.
- All filesystem, canonical path/containment, module analysis, rendering, and future PDF adapter calls remain in the Bun main process. The webview receives bounded typed payloads only and cannot evaluate AMX or access files directly.
- Reuse Sprint 023's exported PDF adapter later, but do not add PDF export UI or run/input mapping workflows in Sprint 024. Preserve root and extension independence.
- Sprint 020 Option 2 remains the accepted desktop spike disposition: Hutch scripted prepare/build/dev reliability and persistent WSL window verification are residuals, not passed platform evidence or permission to change frameworks.

## V0.4 Sprint 023 Builder Outcome

- Added the shared typed `preparePdfReport`/`serializePdfReport` adapter in `src/renderer/reportPdf.ts`. It consumes the already evaluated `OpenAmxDocument` and `Environment.viewEmissions`, preserves document/source/show order, renders final-environment narrative interpolation, visible formatted AMX source, tables, static SVG charts, textual chart data, repeated table headers, A4/18 mm layout, page numbers, and the explicit `<!-- page-break -->` report marker. It never reads modules/inputs or evaluates AMX.
- Added `export pdf <input> --out <path>` through the existing loader path. Destination validation rejects non-lowercase extensions, missing parents, entry/input conflicts, symlinks, and non-regular destinations before analysis. PDF bytes are fully serialized before a same-directory temporary write, `sync`, close, and atomic rename; temporary files are removed on failure and existing destinations are preserved before rename.
- Dependency evidence: root `pdfmake@0.3.11`, `pdfjs-dist@6.3.289`; runtime evidence Bun 1.4.2, Node 24.20.0, Linux x64 under WSL2. pdfmake package `LICENSE` is MIT. Bundled Roboto files are `Roboto-Regular.ttf`, `Roboto-Medium.ttf`, `Roboto-Italic.ttf`, and `Roboto-MediumItalic.ttf`; authoritative Roboto source license evidence is Apache License 2.0 at `https://github.com/googlefonts/roboto/blob/main/LICENSE`. The package does not include a separate font license file; redistribution requires retaining the Apache notice with any shipped font assets.
- Focused evidence: `bun test tests/reportPdf.test.ts tests/pdfCli.test.ts` passed (5 tests, 23 assertions); the production fixture inspected a 2-page table with repeated `Asset` headers, 55 rows, searchable chart title/description/data, an explicit page break, page number `1 / 2`, and stable extracted page/text content across repeated preparation. A valid CLI smoke export produced 15,889 bytes. Full `bun run build && bun test` passed with 184 tests, 754 assertions, 0 failures; `git diff --check` passed.
- Limitations and boundary: exact PDF bytes are not claimed deterministic because pdfmake metadata identifiers vary; deterministic extracted content/layout properties are asserted. PDF/A, tagged accessibility, pixel parity, cross-platform font metrics, native Ubuntu, macOS, and Windows acceptance remain unverified; evidence is Linux/WSL2 only. Permission-denial tests were not claimed because the available test environment does not provide a portable permission failure boundary. Sprint 024/025 should call the typed adapter from main-process RPC with a file-backed entry path/current text and validated mappings; no desktop UI/RPC code belongs here.

## V0.4 Sprint 023 Preparation

- Sprint 023 owns the shared offline PDF adapter, additive `openamx export pdf` command, destination safety, report layout, and PDF evidence. Desktop UI/RPC integration remains Sprints 024–025; the adapter must be independently callable by the future main process.
- Use pdfmake 0.3.11 as the lead engine selected by Sprint 020. Chrome remains comparison evidence only, not a hidden runtime fallback. Verify production Bun compatibility and font redistribution terms before embedding fonts; replace bundled Roboto files if their terms cannot be established.
- Consume Sprint 022's ordered static view/data representation and `ViewEmission` snapshots. Do not re-evaluate AMX or read modules/inputs again during report generation. Interactive HTML state does not enter PDF output.
- PDF writes use complete preflight/preparation, a same-directory temporary file, close/flush, and atomic rename. Invalid destinations use AMX6001; layout, serialization, engine, and filesystem failures use AMX6002; existing destinations survive pre-rename failures.
- Preserve existing `run`, `render`, named JSON/CSV output, and V0.2/V0.3 behavior. DOCX remains optional and non-blocking; no desktop or platform acceptance is part of Sprint 023.

## V0.4 Sprint 022 Builder Outcome

- Rendered views from the loader-provided immutable emissions grouped by `documentNodeIndex`; source listings remain the first content at each executable fence, followed by emissions in statement order. Reports without emissions preserve the historical HTML bytes.
- Kept the browser layer dependency-free and offline: inline CSS/JavaScript, JSON payloads escaped for script context, semantic tables, local SVG chart graphics, and textual data alternatives. Interactive table state only changes DOM presentation; print markup is a separate original-order representation.
- Typed table sorting compares captured values directly, keeps nulls last in both directions, and uses source indices for stable ties. Labels, values, titles, descriptions, SVG text, source, and script payloads are escaped. No new chart kind or AMX checker rule was introduced.
- Direct providers remain the existing architecture. V0.4 completion adds source-visible view names and view keywords/options; module analysis treats view declarations as namespace occupants. Runtime/input evaluation remains outside editor analysis.
- Verification: root `bun test` passed with 179 tests and 727 assertions; extension host passed 12 tests on VS Code 1.85.0; browser interaction verified numeric sort and filter state in the integrated browser. The only implementation correction found by full regression was removal of an extra no-view HTML newline; the later browser check found and fixed DOM row reordering.

This file records key technology choices, architecture decisions, scope limitations, and other material decisions made during the project. Updated by every sprint.

## V0.4 Sprint 022 Preparation

- Sprint 022 consumes Sprint 021's immutable `ViewEmission` snapshots by document node/statement position, appending views after the owning fence's existing visible formatted source; the renderer must not evaluate the CLI's already-loaded environment again. Narrative interpolation remains final-environment based.
- Provide browser-interactive, accessible offline HTML and original-order static print content now; PDF composition/command and production font approval remain Sprint 023. Table sorting/filtering/pagination must not change the captured snapshot or the print content.
- Extend the existing direct VS Code providers for pure-buffer formatting/completion/static diagnostics. Runtime input-validation failures, including `AMX4003` label-length mismatches, remain outside editor diagnostics.
- Sprint 020 Option 2 closure is recorded. The deferred Hutch command reliability and persistent WSL window proof stay desktop residuals, not a change to Sprint 022 or platform acceptance claims.

## V0.4 Sprint 021 Preparation

- Lead Developer approved Sprint 020 closure under Option 2 on 2026-09-29 and authorized Sprint 021 implementation. Accept the direct native Bun RPC launch proof for this gate while explicitly retaining Hutch scripted prepare/build/dev reliability and persistent WSL window verification as unverified residuals. This does not remove the desktop must-have or claim full desktop acceptance.
- Lead Developer selected `AMX4003` for runtime scalar chart label/value length mismatches. The check occurs at `show` and reports the view and labels-option location before rendering, serialization, or any output write.
- Sprint 021 owns the typed visualization AST, parser, checker, runtime snapshots, and the direct record-constructor-in-`match` conformance fix. Interactive/static HTML and editor support remain Sprint 022; PDF and desktop production workflows remain later sprints.
- Keep `show` emissions separate from final-environment narrative interpolation and existing V0.3 plain-object evaluation output. Type and source-order validation precedes input loading; runtime-only list-length validation precedes rendering and writes.
- Sprint 021 implementation outcome (2026-09-29): added source-located table/chart/show AST and parsing, static typed-shape/field/option/name/placement checks, entry-only view enforcement, and frozen show snapshots ordered by original document node and statement. Fixed match-brace scanning so direct record constructors in arms parse and typecheck without changing first-match/lazy evaluation. `evaluateDocument` retains its plain-object shape; the loader exposes `viewEmissions` separately. No HTML, PDF, editor, or desktop production workflow was added.
- Verification passed: focused table/show parser (1 test); match parser/checker regression (2 tests); focused checker, cross-fence runtime snapshot, module-boundary, and CLI no-write/pre-input-barrier tests; root `bun run build`; full `bun test` (176 tests, 710 assertions); and `git diff --check`. No further contract deviation beyond the approved AMX4003 runtime diagnostic clarification.

## V0.4 Sprint 020 Preparation Decisions

- Sprint 020 owns the authoritative V0.4 language/export contract and bounded feasibility evidence. Production visualization work remains in Sprints 021–022, production PDF export in Sprint 023, desktop workflows in Sprints 024–025, and release acceptance in Sprint 027.
- Preserve V0.3 document, CLI, module, input/output, HTML, and VS Code behavior by default. Any compatibility exception requires explicit Lead Developer approval and migration guidance.
- The core stays general-purpose. The desktop prototype is isolated under `desktop-app/` and must reuse core APIs. The desktop webview receives only narrow typed RPC; filesystem access, module/input resolution, execution, and export stay in the main process.
- The V0.4 plan selects Electrobun + Vue + shadcn-vue for the prototype and requires local/offline PDF generation. Sprint 020 must prove and pin tested versions; no PDF engine or charting library is preselected.
- DOCX remains an optional stretch, not a V0.4 core gate. Its exact disposition follows export-spike evidence and core schedule risk.
- Do not reduce tables/charts, report-ready PDF, or the working desktop prototype based on a feasibility result alone. A concrete blocker and options go to the Lead Developer for approval before scope changes.
- The active environment is Linux. macOS 14+, Windows 11+, and Ubuntu 24.04+ release-owner build/launch checks remain required later and must not be inferred from this sprint's Linux evidence.

## V0.4 Sprint 020 Builder Outcomes

- Adopt the V0.4 contract in `docs/language-spec-v0.4.md`: entry-only named table/chart declarations, top-level `show` snapshots at source position, the specified typed-list shapes, deterministic accessible HTML behavior, static print views, and additive activation that preserves V0.2/V0.3-only documents.
- Select pdfmake 0.3.11 (package metadata MIT) as the Sprint 023 lead after its Bun/Linux offline proof generated a searchable two-page PDF with headings, all 24 table rows, an inline SVG chart, and a forced appendix page break. Keep Chrome 152.0.7977.82 as a comparison only. The pdfmake package has no separate license file beside its bundled Roboto fonts, so verify redistribution rights or replace those fonts before production. Proof versions, commands, limitations, and output measurements are in `planning/sprints/0020-v04-product-language-contract-architecture-spikes/spike-results.md`.
- Direct core reuse is selected for file-backed unsaved entry text: the loader parses an optional in-memory entry override while keeping canonical filesystem modules, containment, inputs, checking, and evaluation on the existing main-process path. The focused tests passed without changing the saved entry.
- The isolated prototype uses Electrobun 2.0.1 with Bun, Vue 3.5.41, and shadcn-vue 2.8.2. shadcn aliases now resolve source-owned `src/mainview/components` and `src/mainview/lib`; `.hutch/devkit` is only for the Electrobun SDK. Direct typecheck and Vite webview build pass. A generated native bundle launched with the WSL software-rendering workaround, showed a 720x520 window, and logged typed RPC requests to Bun 1.4.0. Hutch prepare/build/dev package tasks still time out after config serialization, and the app later exited cleanly; keep the desktop acceptance gate open for review.
- The app tsconfig no longer extends the generated `.hutch/devkit/tsconfig.json`; it defines explicit relative SDK API aliases plus an app-source `@/*` alias and omits deprecated `baseUrl`. Direct typechecking passes. Hutch prepare still times out with this change, so the stall is independent of the shadcn/.hutch alias mismatch.
- This is a must-have verification blocker, not approval to reduce desktop scope or change frameworks. Keep Sprint 020 blocked for Lead Developer review; options and platform matrix are recorded in the spike results. No production visualization, PDF export, or desktop workflows were started.
- DOCX is not justified by the PDF proof: editable document generation was not tested. Keep it optional and non-blocking; do not start Sprint 026 without a separate approval after the core must-haves are on track.

## v0.1 Core Decisions (from Master Plan)

- **Package manager**: bun is the primary and required package manager for v0.1. All scripts and instructions use bun. "npm install" wording in the language spec is treated as illustrative only. Cross-package-manager support (npm, pnpm, yarn) is not tested or guaranteed in v0.1.
- **Language / runtime**: Plain TypeScript (no Langium in v0.1). Langium is deferred to Phase 10 (full mono-repo language work).
- **Parser approach**: Hand-written recursive descent for statements + Pratt parser for expressions. No parser combinators or external parsing libraries for the core language in v0.1.
- **Lists + aggregates**: Included in v0.1 scope. `sum`, `min`, `max`, `mean` must work with list literals `[1, 2, 3]`.
- **Conditionals**: Only single-line `if E then E else E` is required in v0.1. Chained `else if` is a documented limitation.
- **Power operator associativity**: `^` is right-associative.
- **Renderer output**: Full standalone HTML document for `openamx render`. Document title comes from frontmatter `title`.
- **Markdown handling**: Use `marked` (or equivalent) only for narrative blocks. `let` declarations must never appear in rendered output.
- **Diagnostics**: Basic but clear. Use AMXxxxx error codes + file/line/column for undefined variables and similar errors. Source locations should be present on AST nodes from the beginning.
- **Project layout for v0.1**: Single package at the repository root (matches language-spec-v0.1.md section 5). Full mono-repo structure is planned for Phase 10+.
- **Architecture principles**:
  - Simple, modular, general-purpose core.
  - No Asset Management domain concepts inside the parser, AST, runtime, or renderer.
  - Explicit AST.
  - Source order is preserved.
  - Parser / runtime / renderer are cleanly separated.
- **Template fixes**: The 0000-sprint-template/handoff-prompt.md contained outdated references (".continue/rules", "e-lang"). These are corrected in the Sprint 001 handoff-prompt.md.
- **Scope discipline**: Strictly limited to language-spec-v0.1.md sections 1-18. Section 4 items remain explicitly out of scope for v0.1.
- **Style**: Simple, readable, maintainable code. No premature optimization.

## CLI Library Choice

- Confirmed: `cac` is the CLI library for the v0.1 prototype.
- It is used to provide a simple, Bun-friendly command surface for `render` and `run` with built-in help and version support.
- The CLI remains a thin orchestration layer over the existing parser, evaluator, and renderer outputs.

## Language Spec Location

- Authoritative copy currently lives in `.agents/language-spec-v0.1.md`.
- Per spec suggestion it "wants" to live at `docs/language-spec-v0.1.md`.
- Decision: keep authoritative copy in `.agents/` for now (planning/controlled). A copy or symlink decision can be made later if needed. Record any move here.

## Renderer Testing Strategy

- For Sprint 005 and v0.1: renderer tests use explicit expected HTML string matches (or strong contains + structure assertions) for core cases: headings, paragraphs, bullets, let omission, {{var}} and {{expr}} substitution, and stable document shape. This choice keeps tests self-documenting, reviewable in the same file, and avoids snapshot maintenance for the small v0.1 surface.
- "Stable output" means deterministic rendering: source order preserved, no non-determinism from marked or substitution, consistent formatting for primitives.
- marked is used for narrative MD blocks after {{ }} substitution; tests assert on the final combined HTML (title, body content) rather than internal marked details.
- If the rendered surface grows substantially after v0.1, snapshot testing may be re-evaluated.

## Source Locations

- Implement `SourceLocation` on all AST nodes from the start (supports diagnostics and future IDE features).

## Future Phases (Documented for Visibility, Explicitly Excluded from v0.1)

- Full Langium-based language implementation (Phase 10)
- Mono-repo package structure
- Imports (CSV, JSON, .amx)
- Units, currency, formatting, charts, tables
- Asset-management domain libraries and ISO 55001 schemas
- Visual editor, VS Code extension
- Multi-file packs, package manager, approval workflows, knowledge graph, AI-assisted authoring

All of the above are recorded here so that Builders and future sprints do not accidentally expand v0.1 scope.

## V0.2 Language Decisions (Sprint 007)

- **Breaking migration**: Only declarations inside executable `amx` fenced blocks are code. Bare V0.1 `let` lines outside those blocks are narrative; no compatibility execution mode is provided.
- **Executable fence recognition**: The info string is case-sensitive and, after trimming whitespace, must equal exactly `amx`. Openers use a backtick run of at least three characters with zero to three leading spaces. A matching closer uses at least the opener's number of backticks and has no trailing non-whitespace text. Other Markdown fences and their contents stay non-executable narrative.
- **Statement and match-arm separators**: Newlines separate statements and match arms. Semicolons are not separators. A braced construct may span lines; expressions do not implicitly continue across a newline outside a braced construct.
- **Match syntax**: `match <expression> {` followed by one arm per line in the form `case <number|string|boolean literal> => <expression>` and exactly one `default => <expression>`, then `}`. Cases are tested in source order and the first match wins; `default` is the fallback if no case matches. The `default` arm may appear anywhere among the arms.
- **Source locations**: Lines and columns are 1-based positions in the original document, including front matter and fence delimiters. Columns count UTF-16 code units to align with TypeScript and VS Code editor positions.
- **Sprint 007 parser representation**: Document nodes preserve narrative and represent each executable fence as an `executableCodeBlock` containing raw source and statement nodes. Sprint 007 parses declarations only and does not execute blocks.
- **Sprint boundaries**: Sprint 007 establishes the complete V0.2 contract and parses fenced declarations only. Assignment, `+=`, ranges, loops, and `match` implementation are deferred to Sprints 008–009; execution, formatting, rendering, and final-environment interpolation are deferred to Sprint 010.

## V0.2 Sprint 008 Decisions

- **Mutable declaration and assignment semantics**: First `let` introduces a binding; repeated `let` updates it. `=` and `+=` require an existing binding. `+=` uses the existing V0.1 `+` semantics. Undefined reads and writes use AMX1004.
- **Ranges**: `[start to end]` evaluates finite integer bounds and yields an inclusive sequence with step one, ascending or descending; equal bounds yield one value. Explicit list literals remain unchanged. No explicit step syntax is added.
- **Loop context and returns**: `for` in statement position is a side-effecting loop with no `return`. `for` in expression position requires exactly one `return expression`, collects its value once per iteration, continues later body statements, and evaluates to `[]` for empty input. `return` is invalid elsewhere and is not an early exit.
- **Loop scope**: The iteration variable shadows an existing binding while the loop runs and is restored when the loop exits, including error exit; it is rebound on each iteration. Other declarations and mutations use the caller's shared environment and persist after the loop.
- **Loop limits**: Only lists and ranges are iterable. Nested loops, `break`, `continue`, and range steps remain unsupported. The evaluator can run a statement list with a supplied `Environment`; Sprint 010 still owns document-wide code-block order and final-context rendering/interpolation.
- **Sprint 008 boundaries**: `match` remains Sprint 009. No renderer, CLI, extension, or domain-specific changes are included.

## V0.2 Sprint 008 Implementation Outcomes

- The statement-list evaluator accepts a caller-supplied `Environment`; declarations and ordinary assignments in loop bodies mutate that environment, while `for` temporarily shadows and restores only its iterator in a `finally` path.
- Expression-form `for` is parsed as a normal expression atom, including within other expression positions such as function arguments. Its single `return` value is collected per iteration and does not stop later body statements.
- Runtime diagnostics use AMX1005 for invalid range bounds, AMX1006 for non-list loop values, and AMX1007 for a return reaching runtime outside a valid expression-loop context. Undefined reads and writes continue to use AMX1004.
- Sprint 008 did not add document-wide block evaluation, rendering changes, `match`, dependencies, or other deferred language features.

## V0.2 Sprint 009 Decisions

- **Match placement and syntax**: `match expression { ... }` is a value expression. Each arm occupies one line and uses `case <number|string|boolean literal> => <expression>` or `default => <expression>`. Negative numeric literals are accepted; non-literal patterns are not.
- **Default cardinality**: Exactly one `default` arm is required and may appear anywhere. Zero or more case arms are allowed; a default-only match is valid.
- **Selection semantics**: Evaluate the scrutinee once; compare literal cases by strict type-and-value equality without coercion; evaluate cases in source order and select the first match. Duplicate literal cases are legal and the first wins. Evaluate only the selected branch, or default if there is no match.
- **Deferred features**: Guards, destructuring/richer patterns, fallthrough, match statements, and document-wide execution/rendering remain out of scope. Match is available to the expression parser/evaluator for later Sprint 010 interpolation integration.

## V0.2 Sprint 009 Implementation Outcomes

- Match nodes retain case arms in source order and store the sole default expression and its arm location separately. Parsing rejects absent/duplicate defaults and non-literal cases at original-document locations.
- The runtime evaluates the scrutinee once, compares primitive literal values with strict equality, and evaluates only the selected branch. Sprint 010 still owns document-wide orchestration, interpolation, and rendering.

## V0.2 Sprint 010 Decisions

- **Canonical formatter scope**: Format executable block layout only. Normalize line endings to LF; trim boundary blank lines and trailing horizontal whitespace; preserve interior blank lines and all intra-line expression/source text; use zero top-level indent and two spaces per braced `for`/`match` body; keep open braces on headers and dedent closing braces; nonempty output ends with one LF, empty output remains empty.
- **Formatter contract**: Formatting is deterministic, idempotent, and must produce parser-valid V0.2 source. Do not rewrite operators, precedence, string quoting, or match-arm ordering.
- **Document execution**: Only executable code-block statements run, in source order, once each, using one shared `Environment`. Keep the `evaluateDocument` plain-object result compatible and expose/reuse one evaluator path for the renderer's final environment.
- **Render ordering**: Execute all code blocks before rendering narratives. Then assemble rendered nodes in source order; narrative placeholders use final environment state, while code blocks display their formatted source at their original position.
- **Code display**: Render block content (without fence delimiters) as an escaped `language-amx` code element. Never run Markdown, HTML interpretation, or interpolation on executable source.
- **Legacy test fixtures**: Update test helpers that turn bare V0.1 `let` lines into executable top-level nodes. Do not add compatibility behavior for bare declarations outside `amx` fences.
- **Sprint boundary**: No CLI, example, VS Code extension, or V0.3 work; extension work is Sprint 011.

## V0.2 Sprint 010 Implementation Outcomes

- `evaluateDocumentEnvironment` evaluates each executable block's parsed statements once in source order with one shared `Environment`; `evaluateDocument` still returns the plain-object bindings API.
- `renderHtml` executes the document before rendering, resolves narrative interpolation against the final environment, and emits formatted executable source as HTML-escaped `language-amx` code at its document position.
- Evaluator and renderer fixture helpers now construct executable code-block AST nodes. Bare declaration narrative and ordinary Markdown fences remain non-executable; no production compatibility path was added.
- No language/runtime contract deviations were needed.
- Verification: formatter suite passed (3 tests); focused evaluator/renderer suites passed (70 tests); `bun run build` passed; final full `bun test` passed (96 tests, 261 assertions). Repeated renders remain deterministic, and executable source is escaped before HTML assembly.

## V0.2 Sprint 011 Decisions

- **Extension architecture**: Add a focused `vscode-extension/` package; keep the root TypeScript/Bun project layout. Use direct VS Code providers, not a separate LSP server.
- **Extension runtime**: The extension runs in the supported Node-based VS Code extension host and bundles the pure core parser/formatter APIs. Bun remains the main project's package manager/runtime; extension runtime code must not call Bun APIs.
- **Editor buffer parsing**: Add a pure text-buffer parser shared with `parseDocument(path)` so providers can analyze unsaved content without disk I/O or duplicated fence recognition.
- **Provider scope**: Format only `amx` fence contents; complete keywords, standard-library functions, source-order-visible document variables, and the active loop iterator; publish parser diagnostics with document-relative source positions. Runtime diagnostics and richer language features are excluded.
- **Packaging**: Use publisher identifier `EngineersTools`; build and locally install a Marketplace-ready VSIX. Do not publish/upload during V0.2.
- **Verification**: Define extension-local install/build/test/package commands, exercise providers in an Extension Development Host, and verify local VSIX installation.

## V0.2 Sprint 011 Implementation Outcomes

- `parseDocumentText(content)` now shares front-matter and fenced-document parsing with `parseDocument(path)`; the path API still reads through Bun and delegates after reading.
- The extension bundle targets Node 18 and imports the shared parser/formatter. Bundle inspection found no Bun runtime reference. The extension engine range is `^1.85.0`, and the host suite ran on VS Code 1.85.0.
- Completion uses parsed statement order and active loop-body ranges; parser diagnostics map original 1-based UTF-16 locations to VS Code positions. Formatting adapts canonical block output to the document EOL so CRLF documents remain idempotent without touching surrounding text.
- Host-only test files use a non-Bun discovery suffix so the unchanged root `bun test` remains isolated from VS Code API tests.
- Verification passed: `bun run build && bun test` (97 tests, 265 assertions); extension `bun install`; `bun run test` (3 Extension Development Host tests); `CI=1 bun run package` (6 VSIX files, 61.67 KB); `bun run install-local`; CLI listing confirmed `engineerstools.openamx-vscode@0.2.0`. The final installed VSIX also passed all 3 host tests against a real `.amx` file; malformed front matter, bare declarations, and ordinary fences produce no extension diagnostics.
- `vsce` reported no repository license file and required confirmation to package. The local artifact was produced and installed; no license was inferred or added, and publication remains deferred pending the project license decision.

## V0.2 Sprint 012 Decisions

- **Acceptance examples**: Use `examples/transformer-strategy.amx` for the Power Transformer Failure Mode Analysis and add `examples/asset-fleet-risk-analysis.amx` for the asset-fleet Risk Analysis. Keep all domain concepts in prose and ordinary values; the core remains general-purpose.
- **Acceptance proof**: Tests parse the actual example files and assert named final values plus rendered outputs. Checked-in `.html` artifacts are regenerated by the production CLI. The examples collectively prove mutation, loops/ranges, match, visible formatted source, and final-environment interpolation after a later block mutation.
- **Documentation**: Replace stale V0.1-only README content with the V0.2 install/build/test/CLI/migration/examples/limitations/extension guide. Keep `docs/language-spec-v0.2.md` authoritative and align extension commands with the verified package scripts.
- **Ordered V0.3 roadmap**: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring. None is in Sprint 012 scope.
- **License and publication**: No license file exists; `vsce` required confirmation for local packaging. Do not infer or add a license without project authorization. Marketplace publication is outside V0.2 and requires an explicit license decision/file.
- **Closure gate**: Mark V0.2 acceptance complete only after root build/tests, both examples' end-to-end render/run checks, extension host tests, VSIX packaging, and local installation pass; accurately record any unavailable check or deviation.

## V0.2 Sprint 012 Implementation Outcomes

- The transformer FMEA uses severity [8, 6, 9] times occurrence 3 to produce [24, 18, 27], aggregate 69 and post-inspection score 60. The fleet uses inclusive levels [1 to 3] times five to produce [5, 10, 15], aggregate 30 and post-adjustment score 35. Its unmatched literal case selects the default decision. Both documents use final-environment interpolation before the later mutation block. Checked-in HTML is generated by the production CLI and compared exactly with renderer output in tests.
- Acceptance found that interpolated string values containing `<north>` were sent to Markdown unescaped, allowing computed values to inject raw HTML even though executable source was already escaped. The only runtime deviation in Sprint 012 is a one-line renderer fix escaping the substituted value before Markdown parsing. A real-file regression asserts escaped narrative/source and absence of raw `<north>`; the V0.2 spec records this clarified output contract. Core syntax, evaluation and extension behavior are unchanged.
- Root verification passed: `bun install`, `bun run build`, `bun test` (100 tests, 294 assertions), all three render scripts, and both domain example `run` commands. Extension verification passed: `bun install`, `bun run compile`, `bun run test` (3 host tests, VS Code 1.85.0), `CI=1 bun run package` (6 files, 61.74 KB), `bun run install-local`, installed extension listing (`engineerstools.openamx-vscode@0.2.0`), and an installed-VSIX host rerun (3 tests). No license was selected or added; `vsce` required a yes confirmation even with `CI=1`. Marketplace publication remains blocked on an explicit project license decision/file and was not attempted.

## V0.3 Sprint 013 Contract Decisions

- **Compatibility**: V0.3 is additive to V0.2. Existing fenced documents and no-option `run`/`render` calls retain behavior; V0.1 bare declarations remain narrative.
- **Type model**: Use primitives, named records, lists, and nullable `T?`; omit `any`, general unions, implicit nullability, and uninitialized declarations.
- **Records**: `field?: T` controls construction presence and `T?` controls nullability. Optional fields without defaults must be nullable and materialize as `null`; defaults are literal, checked, and copied per instance.
- **Purity**: Functions are typed, expression-bodied, non-recursive, and limited to parameter, earlier/imported-function, and standard-library references. They cannot capture document values or mutate shared state.
- **Modules**: Imports are explicit names from relative `.amx` paths inside the entry directory tree. Dependencies use source-order DFS, evaluate once, and reject cycles.
- **Data boundary**: Entry-only logical inputs map through repeated CLI `--input name=path`; AMX has no filesystem API. JSON is recursive; CSV is scalar-field record lists only, with no JSON-in-cell convention.
- **Validation/output**: Aggregate validation is deterministic by default; `--validation fail-fast` stops at the first ordered failure. Exported entry-module values are selected by `--output name=path`; JSON is recursive and CSV is shallow record-list only.
- **Asset library**: The six initial Asset Management records live in opt-in `./libraries/asset-management.amx`, never as core defaults.

### V0.3 Sprint 013 Contract Details

- **Checker activation**: A V0.3 declaration/construct, V0.3 module-graph feature, or V0.3 CLI option activates parse/link/type checking for the complete reachable program before evaluation. A V0.2-only document with no V0.3 options bypasses the new checker, preserving its V0.2 behavior.
- **Type compatibility**: Types are nominal for records, exact otherwise, with only non-null-to-nullable and corresponding list-element widening. Checked V0.3 operators do not use V0.2 runtime truthiness or scalar-to-number coercion. DateTime literals are contextually accepted only when valid RFC 3339 wire strings; equality preserves exact wire-string semantics.
- **Construction**: Omission is accepted for optional or defaulted fields. Defaults win when present; otherwise an omitted optional field materializes as null and therefore must be nullable. Unmarked fields without defaults are required. Literal list/record defaults are copied per construction.
- **Computed validation**: Inputs aggregate/fail-fast in deterministic declaration/data order. A computed record reports all invalid fields in declaration order in aggregate mode or its first invalid field in fail-fast mode; evaluation stops at that invalid construction in either mode rather than propagating an invalid value.
- **Static operations**: V0.2 operators/statements receive explicit types; V0.3 matching is restricted to non-null scalar cases, and standard-library signatures are fixed. Loops retain V0.2 runtime behavior; new bindings introduced only inside a loop are not definitely available afterward.
- **Module/data/output contract**: Relative slash-separated `.amx` paths are canonicalized and constrained to the entry directory tree. Inputs are entry-only. JSON rejects duplicate keys and maps recursively; CSV supports scalar record lists, with unquoted empty as nullable null and quoted empty as empty String. Output mappings select only exported entry `let` values; deterministic serialization precedes writes.
- **Diagnostics**: Stable AMX3001-3005, AMX4001-4003, AMX5001-5003, and AMX6001-6002 assignments, ordering, phase barriers, and source/data context are part of the contract.
- **Asset Management**: The six schemas are initial shape contracts only. They express no severity/likelihood scale, score formula, or other domain validation; domain review is required before the library is treated as stable.

### V0.3 Sprint 013 Builder Outcome

- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (100 tests, 294 assertions, 0 failures); `git diff --check` passed. No product implementation files were changed.

## V0.3 Sprint 014 Preparation Decisions

- **Implementation slice**: Sprint 014 owns records, typed bindings, null, record access, runtime record values, and full static checking of activated programs. Functions/modules/library, inputs/validation, and outputs remain in Sprints 015-017.
- **Checker integration**: The checker is a pure document-level phase run before existing evaluation. It activates only under the V0.3 activation rule, preserving V0.2-only truthiness and mixed-list behavior.
- **Runtime boundary**: Runtime work materializes and accesses valid record values; it does not implement file-input validation, module values, serialization, or domain constraints.
- **Contract consolidation**: The completed V0.3 specification contains a duplicated obsolete leading draft. Sprint 014 may remove that duplicate only, retaining the later complete contract text without a semantic rewrite.

## V0.3 Sprint 015 Preparation Decisions

- **Function runtime**: User functions are callable definitions evaluated through parameter-only call frames, not closures over a mutable `Environment`; this enforces the contract's capture and mutation prohibition.
- **Module boundary**: A focused loader owns all local-path filesystem access. It resolves the complete graph before evaluation, uses source-order DFS, and exposes only explicit exports to isolated importers.
- **Export scope**: Exports are needed for module visibility now; CLI output selection and serialization remain exclusively Sprint 017.
- **Asset library**: Create `libraries/asset-management.amx` as a local opt-in module containing exactly the six approved structural schemas, with no calculations or domain constraints.

## V0.3 Sprint 016 Preparation Decisions

- **Data boundary**: Input paths are parsed by the CLI and data files are read only by focused loader/validator support. Validated values enter the entry environment before evaluation; imported modules cannot declare inputs.
- **CSV implementation**: Use a proven RFC 4180 CSV parser rather than split-based parsing. Nested records/lists and JSON-in-cell remain explicitly unsupported.
- **Diagnostic behavior**: Input mapping/read failures are AMX4001, malformed JSON/CSV is AMX4002, and shape/nullability/conversion failures are AMX4003. Aggregate and fail-fast share one deterministic traversal order.
- **JSON duplicate keys**: Reject duplicates rather than accepting JavaScript parser last-key-wins semantics; retain data-path/location context whenever the parser exposes it.

## V0.3 Sprint 017 Preparation Decisions

- **Output visibility**: Only explicit entry-module exported `let` values are output-selectable. Module exports enable reuse but do not make imported/private names CLI outputs.
- **Serialization boundary**: Typed values are serialized completely in memory before destination writes. JSON/CSV formats preserve declaration-order type metadata; arbitrary object keys do not establish a CSV shape.
- **Write ordering**: `render` produces/serializes HTML and exports before writing any destination, writes HTML first, then exports in option order. Filesystem failures use AMX6002 and may leave prior writes intact.
- **CSV scope**: CSV output is limited to typed scalar-field record lists, including empty lists. Null and empty-string cells remain distinct per the V0.3 contract.

## V0.3 Sprint 019 Preparation Decisions

- **Example architecture**: Use one auditable typed-data analysis with custom and explicitly imported opt-in records, CSV/JSON fixtures, typed pure function, named JSON/CSV exports, and aggregate/fail-fast invalid fixtures. Keep imports inside the entry directory tree without weakening path containment.
- **Acceptance evidence**: Assert actual values, stable rendered HTML, exact exported file bytes, ordered error context, absent writes on failure, and V0.2 no-option compatibility through production APIs/CLI. Avoid exit-code-only tests and generated-output churn.
- **Release documentation**: Update root/editor guidance, migration notes, limitations, and package/CLI/VSIX version metadata to match observed commands. Preserve the historical V0.2 contract and keep Asset Management shapes provisional.
- **Known conformance issue**: Check Sprint 018's record constructor directly in a `match` arm against the language contract. Repair only if required for acceptance, with a focused regression; otherwise disclose the tested limitation and its release disposition. Do not assert support without proof.
- **Closure gate**: Root and extension builds/tests, example renders, real CLI validation/import/export checks, local VSIX packaging/install, installed-host check where supported, and recorded license/publication status are required before marking V0.3 complete. Marketplace publication remains deferred.

## V0.3 Sprint 018 Preparation Decisions

- **Provider architecture**: Extend the existing direct VS Code providers; reuse pure buffer parsing, canonical formatting, and static checking. Do not add an LSP or call Bun APIs in the Node host.
- **Editor import boundary**: Use read-only local dependency resolution for imported completion/checker symbols. The evaluating CLI module loader is not suitable for editor diagnostics because it can read data inputs and execute modules.
- **Editor diagnostics**: Preserve parser-only V0.2 behavior and report V0.3 type diagnostics at original-document source coordinates for activated buffers. Do not claim CLI input or computed-value validation in the extension.
- **Acceptance gate**: Exercise providers in the Extension Development Host, package and locally install a VSIX, and document the unresolved license prerequisite; defer release-wide documentation/version changes to Sprint 019.

## V0.3 Sprint 014 Builder Outcome

- The document checker is a pure, first-error, source-order pass over executable blocks; it activates for parsed V0.3 forms and runs before the shared evaluation environment is created. Independent errors may be aggregated in later work, but no runtime block runs after a static error.
- Record field declarations retain source order; constructed values evaluate supplied expressions then materialize in declaration order, creating fresh nested/list default values per instance. Direct access to nullable records is rejected; a null comparison narrows the appropriate `if` branch.
- The historical V0.2 path, executable fences, CLI, formatter, and renderer remain unchanged. The later complete V0.3 contract is retained without semantic modification; deferred function/module/input/output work was not started.
- Verification on 2026-09-29: final `bun run build` passed; `bun test` passed (106 tests, 403 assertions, 0 failures); `git diff --check` passed. No contract deviation.

## V0.3 Sprint 015 Builder Outcome

- **Functions**: implemented as typed callable definitions (`FunctionDeclarationNode`), not JavaScript closures over `Environment`. Calls execute in a fresh `Environment.createCallFrame` containing only bound parameters plus the module's shared (immutable during the call) `recordTypes`/`functions` maps. The checker verifies purity by checking each function body in an isolated `bindings` scope containing only its parameters (module/import bindings are invisible), rejecting any body containing a `for` expression, and only registering the function into the callable table after its body is checked (this single ordering rule simultaneously blocks self-recursion and forward references without special-casing either).
- **Modules**: `src/runtime/moduleLoader.ts` is the sole filesystem-access boundary. It resolves each import relative to the importing module, requires `./`/`../`-prefixed, `/`-separated, lowercase-`.amx`-suffixed paths, canonicalizes via `fs.realpathSync`, and rejects any target outside the entry file's directory (computed once from the entry's canonical path). Depth-first resolution follows import source order; a module already on the current DFS stack is a cycle (`AMX5003`, reporting the ordered path list); a module already fully resolved is reused (evaluate-once). Each module's own statements are flattened across its executable blocks preserving source order for placement/collision checks even though blocks still evaluate independently in document order during actual evaluation.
- **Exports/imports**: `checkDocument` now accepts an optional `ModuleCheckContext` (imported types/functions/bindings) and returns a `ModuleCheckResult` of only the `export`-marked declarations. The loader pre-populates each module's own `types`/`functions`/`bindings` maps with its imports before checking, which lets the pre-existing duplicate-declaration checks catch import/local collisions for free; a dedicated `immutableNames` set additionally blocks assignment to or redeclaration of an imported binding. Both are diagnosed as `AMX5002` per the acceptance criteria's explicit listing of "imported-value mutation" under that family, not `AMX3005`.
- **Evaluation order**: the loader evaluates modules in dependency-first (post-order DFS) order into per-module isolated `Environment`s; an importer's environment is seeded only with the specific exported types/functions/values it named, with value bindings pulled from the exact dependency environment that produced them (not a name-based scan), so two different import paths to the same dependency observe the identical value by reference (diamond graphs evaluate the shared dependency exactly once).
- **CLI/compatibility**: `cli.ts` `run`/`render` now call `loadEntryModule`, which for a document with no imports performs the same `checkingActivated` gate, `Environment`, and per-block `evaluateStatements` sequence as the prior direct `evaluateDocumentEnvironment` path, so V0.2-only and Sprint-014-only documents are unaffected. All three checked-in example HTML files regenerated byte-identical to the committed versions, confirming no behavior change for non-module documents.
- **Library**: `libraries/asset-management.amx` exports exactly the six schemas from V0.3 section 13, verbatim, with no calculations/constraints and no core registration; it is a normal opt-in module resolved like any other local import.
- A parser bug was found and fixed during implementation: the `export` keyword was blanked to spaces on a locally scoped `rawLine` copy without writing the change back into the shared `lines` array used by the multi-line `fn`/type collectors, causing multi-statement files to merge an exported declaration's tail with unrelated following lines. Fixed by writing the blanked line back into `lines[i]`. A second bug in the brace-balance scanner for function bodies (`findFunctionEnd`) advanced past the declaration line even when the body had no braces at all; fixed to return immediately for brace-free (single-line) bodies.
- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (128 tests, 462 assertions, 0 failures), including 17 new module-loader tests and 5 new parser tests. All three example renders/`run` commands were regenerated and reported no `git status` diff against committed output; `git diff --check` passed. No input/output/validation/serialization/extension work was started.

## V0.3 Sprint 016 Implementation Outcomes

- `csv-parse@7.0.3` is the sole new dependency and provides RFC CSV parsing with quote metadata. A focused strict JSON parser detects duplicate keys and preserves JSON Pointer/data coordinates without adding a JSON dependency.
- Entry inputs are converted and validated after full graph checking but before any module evaluation. Input declaration order and data traversal determine aggregate/fail-fast diagnostics; validated values are immutable and seeded only into the entry environment. Computed typed boundaries use the same aggregate/fail-fast policy.
- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (147 tests, 549 assertions, 0 failures); `git diff --check` passed. No output selection, serialization, writes, or other Sprint 017 work was started.

## V0.3 Sprint 017 Implementation Outcomes

- Output mappings are validated against the entry check result's explicit exported bindings and retained `CheckedType` metadata. `run` continues printing its final context; `render` continues producing its standalone HTML. Both serialize every requested export before writes. Render then writes HTML followed by exports in option order. Writes are ordered, not transactional.
- JSON recursively serializes finite declared values and rebuilds records in field declaration order. CSV accepts only a list of one declared record type with scalar/nullable-scalar fields; cell escaping preserves commas, quotes, newlines, boundary spaces, nulls, and quoted empty strings. Empty record lists use declared headers.
- No dependency was added. No input validation, module/function/library behavior, renderer output, editor, or release-example work changed. CAC's absent repeated options are normalized at the CLI boundary using actual argv presence so output support does not turn absent `--input`/`--output` options into mappings.
- Verification on 2026-09-29: focused output tests passed (9 tests); integrated output/loader/regression tests passed (35 tests); `bun run build` passed; full `bun test` passed (156 tests across 9 files, 0 failures); `git diff --check` passed. See `planning/questions.md` for the acceptance/spec AMX6001/AMX6002 diagnostic-code clarification.

## V0.3 Sprint 018 Implementation Outcomes

- The existing layout-only `formatAmx` handles V0.3 type/function/import/input/export declarations, nested record constructors, composed constructor fields, and braced expressions; Sprint 018 added focused core and real-host coverage without changing language syntax or formatting semantics. A constructor directly inside a match arm remains blocked by an existing core parser brace-scanner limitation, recorded in `planning/state.md`.
- Editor module analysis is a separate read-only Node path rather than reuse of `loadEntryModule`. It uses unsaved text for the entry, canonical local `.amx` reads for dependencies, explicit export maps, and `checkDocument`; it never evaluates declarations, loads input files, or writes files.
- V0.3 completions are limited to preceding/in-scope declarations and successfully resolved explicit imports. Record fields are offered only for known record receivers. V0.2 standard completions remain available and V0.2-only diagnostics remain parser-only.
- Static/link diagnostics use core AMX codes and original source positions, including dependency source documents; stale results clear on entry edits/close. The core checker is first-error, so each analysis currently publishes one static/link failure at a time.

## V0.3 Sprint 019 Builder Outcome

- The acceptance example keeps the entry-directory containment rule intact by placing fixture-local schema modules under `examples/libraries/`. Inputs appear immediately after imports and use imported record types, matching the loader's enforced input-placement and type-visibility rules.
- The example formula `severity * occurrence` is explicitly illustrative. It is not introduced as an Asset Management standard; the six library schemas remain structural and provisional pending domain review.
- Direct record constructors in `match` arms were checked against the V0.3 grammar and still fail with `Unclosed match expression`. A focused parser regression records this residual limitation; no parser workaround or contract redefinition was made in Sprint 019.
- Release metadata is aligned at 0.3.0 across root package, CLI, extension manifest, VSIX artifact, installed listing, and documented install command. Marketplace publication remains deferred because the project has no license decision/file.
