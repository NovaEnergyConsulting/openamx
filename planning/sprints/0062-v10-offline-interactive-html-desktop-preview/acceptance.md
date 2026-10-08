# Sprint 062 Acceptance Criteria

## Lead Developer Disposition (2026-10-08)

**COMPLETE / APPROVED WITH RECORDED RESIDUALS.** The Lead Developer accepts the Sprint 062 Builder evidence and closes this sprint. All implemented acceptance criteria are accepted based on the recorded root, browser, desktop, and packaged-worker evidence. The named evidence gaps below remain residuals; this closeout does not promote them to passes or waive the no-unapproved-network gate.

- No native Electrobun window/install/launch or non-Linux target was exercised. The Linux stable package and its worker/resource preview were verified; this is not native/platform certification.
- No browser engine other than Chromium was tested; formal accessibility audit, cross-surface visual tolerance, >5,000-point end-to-end bounds, and valid chart-render failure injection remain unverified.
- Sprint 060 generated SVG ID variance remains relevant to static SVG output; PDF chart rendering remains Sprint 063 scope. DOCX source and behavior remain unchanged.
- Sprint 062 closeout does not imply Sprint 063 PDF completion, Sprint 064 integrated acceptance, V0.10 completion, release readiness, or publication.

Sprint 062 is complete when all criteria below are evidenced or explicitly retained as a Lead Developer-approved residual; the no-unapproved-network security gate cannot be waived by a blocked request or by Builder completion:

- Shared HTML rendering uses Sprint 061's `createChartViewModel` for all `bar`, `column`, `line`, and `scatter` charts. CLI standalone HTML, desktop live preview, and desktop HTML export share this path and do not separately reinterpret rows, unit normalization, ordering, grouping, empty state, or theme.
- Generated report HTML embeds the ECharts `6.1.0` browser runtime and fixed application-owned initialization code in the same document. Opening the HTML as a local `file://` report with networking disabled works without CDN, adjacent files, or services.
- Chart model payloads are safely serialized as data. Hostile `</script>`, markup, URL, title, description, label, category, group, value, and unit strings cannot escape the data boundary, execute, alter bootstrap code, or inject active HTML through ECharts tooltips/labels.
- Because Sprint 061's ECharts options contain function-valued formatters, HTML uses a serializable projection plus fixed allow-listed application callbacks reattached by trusted bootstrap. It never serializes function source, evaluates content-derived code, or requires `eval`, `new Function`, or CSP `unsafe-eval`.
- All four chart kinds and representative supported input forms visibly render. Charts are nonblank and unclipped at desktop and narrow widths; multiple chart instances work independently.
- Tooltips provide category or x/y coordinates, series/group, value, and display units. Legend toggles exist only where multiple series/groups make them meaningful. Numeric/DateTime line and scatter provide zoom/pan plus a labeled reset; bar/column do not gain category zoom. Interactions do not mutate data, emissions, or full table content.
- Applicable visible interaction controls are keyboard-, pointer-, and touch-operable, with explicit tests for supported input methods. Touch/pointer gestures do not make reset or full table access unavailable.
- Resize behavior responds to the document container. Replacing/reloading preview documents disposes ECharts instances and resize/listener resources; repeated previews do not accumulate handlers or leak prior chart state.
- Every chart retains its truthful title/description association and complete ordered accessible table alternative. The implementation does not expose inaccurate ECharts-generated ARIA text for null/DateTime. Empty/all-null and partial-null chart/table behavior follows Sprint 061's model.
- Print output hides transient chart controls and preserves the chart identity, description, static current chart view as appropriate, and complete table independent of interactive legend/zoom state. Printed output is legible and unclipped at representative report width.
- Before enabling preview scripts, a maintained allow-list sanitizer or equivalently reviewable structured rendering policy is applied to report-authored narrative/markup and all chart/table text. External/relative navigation targets are inactive; meta refresh, script, event handlers, base, forms, frames, object/embed, untrusted resource URLs, CSS fetches, and SVG external references are removed or rejected. Visible text is preserved where safe.
- Actual standalone output and both desktop preview iframe paths pass adversarial request/navigation tests for Sprint 060's external-link and meta-refresh repros and the expanded malicious-content matrix. Tests observe attempted requests/navigations and require zero external attempts; network failure/DNS blocking alone is not success.
- CSP is restrictive defense in depth, not the only navigation control. After security passes, desktop iframe sandbox uses only `allow-scripts`; it retains opaque origin and does not include `allow-same-origin`, top-navigation, popups, forms, downloads, or other capabilities. Tests prove denial of parent document, application state, desktop bridge, and privileged APIs while trusted chart rendering/interactions work.
- If the security gate does not pass, both iframe sandboxes remain unchanged and no script-enabled desktop preview is claimed. The Builder records the blocker and seeks a separate Lead Developer direction; the failed gate is not silently waived.
- Existing preview freshness, cancellable job behavior, last-good output, HTML export workflow, and exact 8,000,000-character HTML / 32,000,000-byte worker limits remain intact. No limit is increased; over-limit behavior remains explicit and safe.
- Actual packaged desktop worker/runtime/resource resolution is exercised on an available host, or is explicitly marked blocked/unavailable with precise evidence. A temporary source bundle or Vite dev server does not count as package proof.
- Focused renderer/security/Playwright tests, existing preview freshness/desktop tests, root build and relevant/full test suites are run where available. Evidence gives exact commands, versions, host, results/skips, screenshots/request logs, changed files, and any limitation.
- PDF ECharts rendering remains unchanged for Sprint 063; DOCX remains unchanged regression baseline. The separate Lead Developer disposition is recorded above; Sprint 062 closure does not claim V0.10 integrated acceptance, native/platform certification, release readiness, or publication.

## Required Regression Set

1. Local-file offline standalone HTML with all chart assets embedded and no external requests.
2. All chart kinds, grouped/multi-series, mixed display units, DateTime, null/empty, duplicate/order cases.
3. Tooltips, legend, applicable zoom/pan/reset, resize, repeat/replacement cleanup, independent complete tables.
4. Truthful accessible title/description and table access; print output with full data independent of interaction state.
5. Exact Sprint 060 external link/meta refresh attack cases plus script, event handler, URL, image, style, SVG, form, frame, tooltip and payload injection cases with attempted-navigation/request assertions.
6. Both desktop iframe locations: opaque origin; no parent/bridge access; `allow-scripts` only after security gate passes.
7. Desktop preview freshness/cancellation/output-limit regressions and actual package/resource result.
8. Root build and renderer/presentation/full test results; DOCX unchanged baseline.