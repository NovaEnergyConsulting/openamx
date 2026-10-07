# Sprint 061 Builder Evidence

Date: 2026-10-07
Status: **COMPLETE / APPROVED WITH RECORDED RESIDUALS** by Lead Developer disposition on 2026-10-07. Sprint 060 remains COMPLETE / APPROVED WITH RECORDED RESIDUALS.
Host: Arch Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`.

## Implementation

- Added exact root production dependency `echarts@6.1.0` using `bun add echarts@6.1.0`; `package.json` and `bun.lock` are updated. There is no desktop-only ECharts copy.
- Locked graph: root `echarts@6.1.0` -> `zrender@6.1.0` and `tslib@2.3.0`; `zrender@6.1.0` also uses `tslib@2.3.0`. Other existing `tslib@2.8.1` resolutions belong to unrelated `@emnapi/runtime`/`@swc/helpers` branches.
- Added a pure internal adapter in `src/renderer/chartModel.ts`: `createChartViewModel(emission, resolvedIdentity)` returns typed ECharts option data, stable row/series/group identities, axes/unit metadata, complete table rows/headings, tooltip/accessibility inputs, and empty-state metadata. It does not create an ECharts instance, use DOM/filesystem/network APIs, construct SVG, or execute report-authored code.
- Captured immutable `measurementDescriptors` additively on `ChartViewEmission`. Descriptors copy selected series and scatter x/y role, field/label, unit text, scale, unit factors, and dimensional vector from the already-selected normalization unit. Every descriptor, factor, array, and vector is frozen. Existing measurement normalization values remain unchanged; line x snapshot values are not reinterpreted or converted by this change.
- Shared model behavior: horizontal inverse-category bar (first source row at top); vertical column; captured-order scalar/record lines with null gaps; DateTime axis labels and pointers formatted as UTC ISO; grouped first-seen scatter series with only null-coordinate plot points omitted; duplicate rows/categories/coordinates retained; separate named axes and tooltip units; full ordered data tables independent of plot filtering; deterministic existing four-color palette plus deterministic HSL extension; resolved accent used as a restrained highlight; animations and ECharts-generated ARIA disabled; explicit title/description/table linkage and truthful `No data` state.
- Non-DateTime string line coordinates remain category strings and use stable per-row IDs so duplicate display strings stay distinct. The existing snapshot representation is preserved rather than inferred to be DateTime or silently normalized.

## Authorization and Contract Resolution

The initial metadata-boundary conflict was resolved by the Lead Developer's 2026-10-07 authorization: add a narrowly scoped immutable unit/dimension metadata field to chart emissions, including edits to the runtime snapshot boundary and focused tests. The Builder captured metadata from the existing normalization selection; no AMX syntax, checker behavior, measurement arithmetic, display-unit selection, report preparation, or production renderer behavior was changed.

## Verification

- `bun test tests/chartModel.test.ts`: **11 passed**, 0 failed, 63 expectations.
- `bun test tests/chartModel.test.ts tests/renderer.test.ts tests/reportPdf.test.ts tests/reportPresentation.test.ts tests/pdfCli.test.ts tests/measurements.test.ts tests/measurementData.test.ts`: **52 passed**, 0 failed, 357 expectations across 7 files. Covers the shared model, HTML renderer, PDF/CLI, PDF/DOCX presentation baselines, and measurement paths.
- `bun run build`: **passed** (`tsc`).
- `bun test`: **397 passed, 2 skipped, 0 failed**, 1,975 expectations; 399 tests across 32 files. The two skips are existing Windows-only release-preflight tests.
- `git diff --check`: **passed**.
- `bun pm ls --all` confirmed the exact installed ECharts/ZRender/tslib graph above.

Third-party license/notice file inventory (paths only; no legal conclusion): `node_modules/echarts/LICENSE`, `node_modules/echarts/NOTICE`, `node_modules/echarts/licenses/LICENSE-d3`, `node_modules/zrender/LICENSE`, `node_modules/tslib/LICENSE.txt`, and `node_modules/tslib/CopyrightNotice.txt`.

## Changed Files

- `package.json`, `bun.lock`: exact root dependency and locked resolutions.
- `src/runtime/environment.ts`, `src/runtime/evaluateExpression.ts`: additive immutable chart measurement descriptors at the existing snapshot/normalization boundary.
- `src/renderer/chartModel.ts`: pure shared model and theme adapter; not wired into a destination renderer.
- `tests/chartModel.test.ts`: 11 option/model regressions.
- `tests/measurementData.test.ts`: captured descriptor value, dimension/vector, and deep-freeze regression.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and this evidence file: implementation status, authorization, residuals, handoff, and disposition request.

No edits were made to `renderHtml.ts`, `reportPdf.ts`, `reportDocx.ts`, `reportPreparation.ts`, desktop `App.vue`, workers/resources, iframe sandbox settings, AMX parser/typechecker semantics, product limits, or DOCX behavior.

## Residuals and Handoff

Sprint 060 residuals retain their exact original statuses: external-link/meta-refresh navigation escape remains a failed security gate; actual Electrobun packaging remains unavailable; generated ECharts ARIA for null/DateTime was inaccurate in the probe (this model disables generated ARIA and carries truthful metadata, but no surface accessibility acceptance is claimed); raw SVG IDs vary; cross-surface visual tolerance is unmeasured; performance evidence remains limited to 5,000 points; pointer/keyboard/touch behavior and public render-failure diagnostics remain unverified. Production iframe scripts remain disabled.

Sprints 062/063 should consume `createChartViewModel` and its captured immutable descriptors, complete table, axes, tooltip/accessibility inputs, and common theme. Sprint 062 still owns browser HTML/desktop wiring, offline assets, security remediation and adversarial navigation verification. Sprint 063 still owns static ECharts/PDF integration and visual verification. This Sprint 061 work claims no HTML/PDF/desktop integration, package/offline behavior, security closure, visual parity, V0.10 acceptance, platform certification, or release readiness.

## Lead Developer Disposition

On 2026-10-07 the Lead Developer accepted Sprint 061 as complete and authorized closeout. The Builder evidence and verification above are accepted for Sprint 061. This disposition does not upgrade Sprint 060's failed or unavailable evidence, close security/package/accessibility/visual/performance/input-method/render-failure residuals, or claim HTML/PDF/desktop integration, V0.10 completion, platform certification, legal clearance, or release readiness. The Builder does not self-accept; this is the separate Lead Developer disposition.