# Sprint 112 Builder Evidence: V0.18 Scene Serialization and Render Compatibility

## Status

Builder execution was separately authorized on 2026-10-31 after approval of
the exact implementation, command, generated-output, and artifact plan.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for the approved
serialization, standalone browser, static export, and measured composition
scope. The desktop Vite preview bridge remains an intermittent harness
residual; native package and cross-platform evidence are unavailable.
**Separate product-owner disposition:** PENDING.

## Entry Decisions and Authorization

- S109/S110/S111 dispositions rechecked: S109 ACCEPTED/CLOSED WITH RECORDED
	RESIDUALS; S110 ACCEPTED/CLOSED; S111 ACCEPTED/CLOSED WITH RECORDED
	RESIDUALS on 2026-10-31. D111-02 remains an accepted potentially
	unbounded-work residual.
- D112-01: version 2 writer for all models; version 1 no-control reader;
	reject version 1 control-bearing and unknown-version payloads.
- D112-02: ordered descriptors with sequential model-local identity, a
	validated recursive AST content/branch path, ordered loop bindings, and an
	`instanceCount` that must match the descriptor list.
- D112-03: scalar, array/list, plain record, enum primitive, and measurement
	data values are preserved. Maps, sets, non-data objects, and cyclic values
	are rejected as instance bindings.
- D112-04: standalone HTML is interactive and starts at `timeline.from`;
	PDF SVG and DOCX PNG are the static lower-bound outputs. No distinct static
	HTML renderer is claimed.
- Authorized paths: `src/runtime/diagramModel.ts`, generated
	`src/renderer/diagramBrowserRuntime.ts`, `tests/diagram.test.ts`,
	`tests/diagramHtml.test.ts`, `tests/reportPdf.test.ts`,
	`tests/reportDocx.test.ts`, `desktop-app/tests/ui/diagram-playback.pw.ts`,
	the approved production composition probe, and the S112 decision/evidence/
	lifecycle files. The browser bundle was generated only by
	`scripts/build-diagram-runtime.ts`.
- Baseline: clean `feat/create-v0.18` at
	`c007cba8d59b19aa3a771d4befd632477b21c47c`.
- Host/runtime/browser: Windows x64; Bun 1.4.4; Node v26.3.0; Chromium
	156.0.8078.4; 16 logical CPUs; reported host memory 68,276,973,568 bytes.
- Approved new artifact roots: `artifacts/raw/`, `artifacts/outputs/`,
	`artifacts/ui/`, and `artifacts/playwright-output/`. Existing S109-S111
	evidence, the S0080 fixture directory, and `desktop-app/test-results/` were
	not modified.

## Serialization and Runtime Evidence

- New payload version/schema: version 2 contains serialized `model` and
	captured `context`, ordered `instances`, and `instanceCount`. Each instance
	stores its sequential identity, source path, and tagged loop bindings.
	Deserialization resolves source nodes and restores both captured context
	and instances without evaluating controls.
- Legacy v1 no-control model round-trip: PASS. A v1 control-bearing model
	fails with `Version 1 control-bearing diagram models are missing expanded
	instances.`
- Generated instance order/source provenance: PASS. Direct, selected-branch,
	and repeated loop-body instances preserve their order and source path; the
	serialized instance list is authoritative even when a serialized branch
	condition is changed.
- Binding values: PASS for scalar, nested list, record, enum primitive, and
	measurement values. Restored properties retain numeric, field, indexing,
	enum-branch, and measurement-arithmetic behavior.
- Lower/interior/upper frame parity: PASS in production round-trip tests.
	Generated diagnostic provenance also matches before/after serialization at
	the upper frame (`AMXD008`, original file/line/column).
- Malformed payloads: PASS for unknown version, missing list, mismatched
	`instanceCount`, unresolved source path, incomplete bindings, and
	unsupported map-valued bindings. No fallback to flat declaration content.
- `AMXD6004`, the 64 control-only cap, `AMXD013`, and D111-02 were unchanged.
- Browser runtime evaluation: PASS in real standalone Chromium. All 16
	generated figures matched in-process ordered circle frames at times 0, 0.5,
	and 1; each of 1,520 DOM primitives matched name, geometry, style, and
	order.
- Corrupt browser payload: PASS. A v99 first-diagram envelope produced a
	controlled `DIAGRAM_RUNTIME: Invalid serialized diagram model envelope.`
	alert, no false AMX diagnostic, an empty failed canvas, and continued
	playback for the next diagram.
- Offline/security/accessibility: PASS in standalone browser. No external
	requests or page/console errors; figure order, accessible title, and
	existing standalone controls were verified.

## Static Output and Resource Evidence

| Path | Generated membership/order | Selected frame | Bytes/duration | Metadata/proportion | Result/artifact |
| --- | --- | --- | --- | --- | --- |
| Standalone interactive HTML | 16 figures; ordered membership equals in-process model | 0 / 0.5 / 1 | 282,331 UTF-8 bytes | Accessible captions; offline; 1,852 whole-page DOM nodes | PASS; `outputs/64-cap-composition-v2.html`, `raw/production-browser-measurements-v2.json` |
| Static HTML | No separate static HTML diagram path exists; not a distinct output | N/A | N/A | No new renderer introduced | D112-04 RESOLVED; not claimed |
| PDF inline SVG | Same report/model; generated membership and order preserved | Lower bound | 223,824 bytes; five-run median 371.69 ms | SVG/title/description and report order asserted | PASS; `outputs/64-cap-composition-v2.pdf` |
| DOCX embedded PNG | Same report/model; generated membership and order preserved | Lower bound | 16,016 bytes; five-run median 296.54 ms | PNG proportions, visible title/description, image metadata asserted | PASS; `outputs/64-cap-composition-v2.docx` |
| 16-diagram production composition | 31 direct declarations + one loop-body declaration per diagram; 64 emissions/diagram | 0 / 0.5 / 1 | 512 authored declarations; 1,520 frame elements | 2,325,466 serialized model bytes; 95,140 gzip bytes; 126,872 base64 bytes | PASS; `artifacts/production-composition-probe.ts`, `raw/production-composition-v2.json` |

- Browser frame work: 60 whole-report scrub samples; p95 10.0 ms in the
	final focused browser run. In-process evaluation of all 16 models at three
	times had five-run median 5.59 ms. These are one-host observations, not
	bounded-work or cross-platform claims.
- S109 comparison (synthetic, not a threshold): 247,256 HTML bytes, 1,864
	DOM nodes, 7,714,079 serialized JSON bytes, 131,896 gzip bytes, PDF
	122,505 bytes / 72.58 ms median, DOCX 11,766 bytes / 239.46 ms median.
	The production model has 282,331 HTML bytes (+35,075), 1,852 DOM nodes
	(-12), PDF 223,824 bytes / 371.69 ms median, and DOCX 16,016 bytes /
	296.54 ms median. The S109 1,536 frame-element workload was synthetic;
	production accounting includes each loop-body declaration in the 512
	authored limit, yielding 1,520 elements here.
- HTML size policy: actual output is below both the existing 100 MiB renderer
	limit and the V0.13 1 MiB statement. The discrepancy remains unchanged;
	neither value is changed or newly qualified by this workload.
- D111-02: carried unchanged. No iteration/work cap or bounded time/memory
	claim is made.

## Verification and Scope

- `bun test tests/diagram.test.ts tests/diagramHtml.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts`:
	PASS, 46 tests, 0 failures, 564 expectations.
- `bunx tsc --noEmit`: PASS.
- `bun run scripts/build-diagram-runtime.ts`: PASS after the final schema
	change; generated bundle was never hand-edited.
- `bun run planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/production-composition-probe.ts`:
	PASS; five PDF and five DOCX timing samples preserved.
- Browser command from `desktop-app/`, with S112 output override:
	`bun run test:ui -- tests/ui/diagram-playback.pw.ts --output=../planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/playwright-output/<attempt>`.
	Final full-file attempt: 4 passed, 1 failed, 1 skipped. The standalone
	generated composition case passed; the desktop Vite preview bridge failed
	intermittently while the mocked host reported “Preview reflects the current
	buffer” instead of forwarding `AMXD011`. Another full-file retry passed
	that bridge case, so it remains a Vite harness residual, not a stable PASS.
- Native WebView2 test: SKIPPED because `OPENAMX_NATIVE_CDP_URL` was not
	supplied. Cross-platform checks: NOT RUN. Neither is inferred from Chromium.
- Case-ID reconciliation: PASS for
	`SER112-VERSION-01/02`, `SER112-ROUNDTRIP-01`, `SER112-ORDER-01`,
	`SER112-EMPTY-01`, `SER112-BIND-01`, `SER112-BIND-TYPES-01`,
	`SER112-SOURCE-01`, `SER112-MALFORMED-01`, `HTML112-PAYLOAD-01`,
	`HTML112-FRAME-01`, `HTML112-ACCESS-01`, `HTML112-ERROR-01`,
	`PDF112-STATIC-01`, `DOCX112-STATIC-01`, `OUTPUT112-PARITY-01`,
	`OUTPUT112-NOGEN-01`, `RESOURCE112-CAP-01`, `RESOURCE112-HTML-01`, and
	`RUNTIME112-BUNDLE-01`. Host-specific residuals are listed above.
- Changed source/test/generated paths: `src/runtime/diagramModel.ts`,
	`src/renderer/diagramBrowserRuntime.ts`, `tests/diagram.test.ts`,
	`tests/diagramHtml.test.ts`, `tests/reportPdf.test.ts`,
	`tests/reportDocx.test.ts`, and `desktop-app/tests/ui/diagram-playback.pw.ts`.
	Planning/evidence paths: `planning/decisions.md`, this S112 blueprint and
	evidence, `planning/state.md`, `planning/STATUS.json`, and
	`planning/ARCHITECT_BRIEFING.md`. New probe and outputs are confined to the
	approved S112 `artifacts/` roots. `git diff --check` was not in the approved
	command list and was not run.
- Preservation note: a focused browser retry reused the v2 screenshot and
	browser-measurement filenames from the preceding attempt; the files now
	represent the latest run. Raw attempt logs and separate Playwright runner
	directories remain preserved. No S109-S111, S0080, or existing desktop
	`test-results/` files were edited.
- Release, publication, package/version changes, platform certification,
	Sprint 113 editor/spec/example work: NOT AUTHORIZED.
- Builder recommendation: ACCEPT WITH RECORDED RESIDUALS for the approved
	S112 scope; the Vite bridge residual requires separate product-owner
	disposition.
- Separate product-owner disposition/date: PENDING.
- Sprint 113 and release gates: remain separate and unauthorized.