# Sprint 080 Builder Evidence: Interactive HTML and Desktop Preview

## Status and recommendation

**Implemented and measured for the approved fixtures and repeated-emission workload on one Windows host; end-to-end V0.13 is not accepted or released.**

The Lead Developer explicitly approved the file-by-file plan and Sprint 080
execution on 2026-10-13. A separate plan amendment selected Bun's built-in
browser bundler and a static generated runtime asset. The Lead Developer also
approved failing diagram-enabled HTML above 1 MiB through the existing desktop
job error path. The starting worktree was clean on `feat/create-v0.13`; no
existing user edits or test artifacts were overwritten.

**Builder recommendation:** accept the Sprint 080 implementation evidence for
the tested scope, with the residuals below visible. This does not authorize
later sprints, release, publication, or a V0.13 end-to-end acceptance claim.

## Implementation delivered

- Added a versioned, tagged serialization envelope for immutable diagram
  models and their captured AMX evaluation contexts. It preserves supported
  AMX values, non-finite numbers, maps/sets, measurement registries, imported
  functions, records, enums, field registries, and immutable bindings without
  evaluating serialized source as code.
- Bundled the existing evaluator with Bun's browser target as an
  application-owned static runtime. `bun run build` regenerates
  `src/renderer/diagramBrowserRuntime.ts`; the renderer embeds the static
  runtime separately from gzip/base64 inert model/context data. The desktop
  worker build embeds that runtime; it does not depend on a neighboring file
  at runtime.
- Integrated diagrams into standalone `renderHtml` and prepared HTML without
  changing existing chart, narrative, PDF, or DOCX rendering. Imported
  diagram emissions appear in dependency/source order before entry-module
  emissions at the first executable entry block; emissions within an entry
  block are interleaved by statement order.
- Added SVG-in-DOM line, rectangle, circle, and text output with the approved
  bottom-left/Y-up coordinate mapping and intrinsic canvas aspect ratio.
  Every figure exposes its title and description. Play, pause, reset, arbitrary
  scrub, loop-off-by-default, exact endpoint, focus styling, and keyboard
  operation are per-diagram.
- Added frame-failure clearing/recovery and source-attributed AMXD009/010/011
  alerts. The runtime reports diagnostic data over the existing preview-token
  `MessagePort`. The host validates the payload/token/frame/identity and
  rejects stale messages. The existing sandbox remains
  `sandbox="allow-scripts"` with no `allow-same-origin`.
- Enforced the approved 1,048,576-byte UTF-8 ceiling for diagram-enabled HTML.
  Oversize output throws explicitly; the existing worker reports it as
  `DESKTOP_JOB`. No output is truncated, no emitted-instance cap is added, and
  authored-declaration counts remain unchanged. The desktop 8,000,000-character
  fail-safe remains in place.
- A dedicated stable-package test exercises the actual packaged WebView2
  preview and packaged worker. The test-only CDP endpoint and isolated profile
  were used only for this run; the product security policy was not changed.

## Verification results

| Command or path | Result |
|---|---|
| Root `bun run build` | **PASS**; generated the browser runtime and TypeScript build completed. |
| Root `bun test tests\diagram.test.ts tests\diagramHtml.test.ts tests\reportPreparation.test.ts tests\renderer.test.ts` | **PASS**; 43 tests, 0 failed, 382 expectations. Includes typed-context serialization round-trip, imported diagram output order, hostile inert strings, output-boundary checks, and regressions. |
| `desktop-app`: `bun run typecheck` | **PASS** (`hutch electrobun prepare && vue-tsc --noEmit`). |
| `desktop-app`: `bun test src/bun/jobWorker.test.ts` | **PASS**; 7 tests, 0 failed, 39 expectations. Includes successful preview/HTML worker output and explicit rejection above 1 MiB. |
| `desktop-app`: `bun run build` | **PASS**; stable Windows x64 package built, including the packaged worker and assets. Vite emitted the existing >500 kB chunk advisory; it did not fail the build. |
| `desktop-app`: `bun run test:ui -- tests/ui/diagram-playback.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts` | **PASS**; 6 passed, 0 failed, 1 native-package test skipped because no CDP URL was set. The Vite harness was used only for these supporting tests. |
| Actual stable package WebView2 test (`OPENAMX_NATIVE_CDP_URL` set for the extracted stable payload) | **PASS**; 1 passed. It opened a temporary project through the packaged desktop RPC, restored it through the visible workbench UI, rendered two diagrams, exercised the error/recovery lifecycle, then loaded and measured 17 loop-emitted diagrams / 544 elements using the packaged worker. |
| `desktop-app`: `bun run test` | **FAIL, pre-existing test-contract mismatch** at `tests/rpc-contract-check.ts:152`: the assertion expects two literal `sandbox="allow-scripts"` occurrences, while the unchanged production App has one preview iframe. No production sandbox change was made. A temporary assertion correction exposed a separate Windows path-separator expectation later in the same script; that test file was restored unchanged. Focused security and native-package UI tests passed independently. |

The Playwright config's web-server command uses the Unix-only path
`./node_modules/.bin/vite` and initially failed on Windows before tests started.
I started the existing Vite harness with `bun run vite --config
spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183
--strictPort`, verified HTTP 200, and reused it. The harness configuration was
not changed.

## Resource measurement

The accepted repeated-emission case contains one authored diagram declaration
with 32 circle declarations inside a `for` loop over 17 values. It produces
17 model instances and 544 semantic element instances, exceeding the
authored-source caps of 16 diagrams and 512 elements without changing those
caps or dropping any emission.

The primary measurement came from the **actual stable packaged WebView2**:

| Metric | Measured result | Accepted limit |
|---|---:|---:|
| Generated preview HTML (`Buffer.byteLength(..., "utf8")`) | 185,065 bytes | 1,048,576 bytes |
| Emitted diagrams / elements | 17 / 544 | All emissions retained |
| Combined whole-page and iframe DOM nodes | 1,149 | 2,000 |
| p95 frame work | 2.5 ms | 16.7 ms |
| Incremental `JSHeapUsedSize` after forced GC | 2,577,456 bytes (about 2.46 MiB) | 8 MiB |

The native measurement used 60 synchronous samples. Each sample dispatched an
`input` event to every one of the 17 scrubbers in a single JavaScript task,
covering 544 element evaluations and DOM updates. Samples were sorted
ascending; p95 is the nearest-rank element at `ceil(0.95 * n)`. For heap,
`HeapProfiler.collectGarbage` ran before the baseline on the loaded Welcome
view and after preview rendering/scrubbing; the reported increment is the
non-negative final-minus-baseline `Performance.getMetrics()` value for
`JSHeapUsedSize`. The baseline therefore includes the app shell but no report
preview.

Environment: Windows 11 Home 10.0.26300; Intel Core Ultra 9 285H, 16 logical
processors, 68,276,973,568 bytes physical memory; Bun 1.4.2 for the test
runner, packaged Bun 1.4.0; stable Electrobun Windows x64 payload; actual
WebView2 user agent `Chrome/155.0.0.0 Edg/155.0.0.0`. A separate headless
Chromium 153.0.8010.12 run also passed the same repeated-emission limits
(180,972 bytes, 895 nodes, 2.6 ms p95, 2,144,500-byte heap delta). These are
single-host results, not minimum-host or cross-platform qualification.

An initial uncompressed per-model payload was 1,909,816 bytes for this
workload. Gzip/base64 encoding reduced the generated file to about 181 kB
without omitting any model or changing evaluator semantics. No truncation or
instance cap was introduced. A worker test verifies that a document whose
diagram-enabled output exceeds the 1 MiB UTF-8 threshold fails explicitly via
the authorized `DESKTOP_JOB` path.

## Screenshots and artifacts

- [Standalone diagrams, controls, and initial frames](./artifacts/standalone-diagram-playback.png)
- [Standalone AMXD011 clear/error state with an independent second diagram](./artifacts/standalone-diagram-frame-error.png)
- [Desktop Vite-harness error bridge screenshot (supporting evidence only)](./artifacts/desktop-preview-harness-diagram-error.png)
- [Actual stable-package WebView2 preview with frame error surfaced in the host](./artifacts/desktop-preview-native-package.png)
- [Actual stable-package repeated-emission preview](./artifacts/desktop-preview-native-repeated-emissions.png)
- [Native-package AMXD011 fixture](./artifacts/native-preview-fixture.amx)

## Failures, retries, and deviations

1. The initial browser harness invocation failed because its configured
   `./node_modules/.bin/vite` command is not recognized by Windows PowerShell.
   Retrying with Bun's installed Vite command produced HTTP 200 and the focused
   UI suites passed; no config change was needed.
2. A first repeated-emission measurement exceeded 1 MiB because every emitted
   model duplicated the full typed context in plain JSON. I stopped before
   adding any count cap, compressed the inert payloads, and reran the
   17/544-instance case successfully at about 181 kB with all emissions
   retained.
3. The first scrubber test revealed that stopping playback synchronized the
   old state back into the range input before reading its selected value.
   Capturing the selected time before stopping fixed arbitrary-time selection
   and the error tests.
4. The initial SVG CSS `max-height` constrained the box independently of its
   viewBox. Adding intrinsic width/height and removing that cap restored the
   exact aspect ratio in wide and narrow viewports.
5. Loading a runtime bundle with a filesystem lookup worked in source tests
   but was not a safe packaged-worker dependency. The runtime is now generated
   as a static TypeScript string module and bundled into the desktop worker.
6. Direct execution of the generated `launcher.exe`/stable launcher path
   failed with `Not a valid self-extracting installer`. The package archive
   itself was valid; extracting its `.tar.zst` payload to a task-owned temp
   directory and launching the included `bun.exe ..\Resources\main.js`
   started the actual stable WebView2 app and packaged worker. This extracted
   package path passed the native test. No installer was run.
7. The first native recovery run left the host status string on the old
   failure after the frame had recovered. The host now clears that status only
   when the matching diagram recovers (or reports another still-failing
   diagram); the rebuilt stable package test passed.
8. One initial full-desktop screenshot attempt was discarded and deleted. The
   retained screenshots are captured from the standalone browser or the
   packaged WebView page, not the full desktop.

## Residuals and boundaries

- No manual screen-reader/assistive-technology review was available. DOM
  semantics, accessible names, visible keyboard focus, Tab/Enter/Space use,
  and range interaction were tested; those checks do not substitute for a
  screen-reader review.
- Performance/resource numbers are from one high-performance Windows host.
  Minimum-supported hardware, low-memory behavior, cross-platform packages,
  and broader repeated-emission counts were not qualified.
- The 17/544 case passes. Still, authored-declaration caps do not bound
  arbitrary loop executions. The approved 1 MiB fail-fast is enforced; no
  other emitted-instance limit or truncation behavior was added. Larger valid
  reports and resource behavior beyond the measured case remain a residual.
- Sprint 079's broader AMX AST/value/function parity and high-rate evaluator
  residuals remain visible; the serializer round-trip tests cover representative
  imported measurement/record/enum/function context, not every AMX value or
  AST combination.
- `desktop-app bun run test` remains red on the pre-existing
  `rpc-contract-check.ts` iframe-occurrence expectation described above.
  Focused worker, typecheck, Playwright security/freshness, and actual packaged
  preview tests pass.
- PDF/DOCX diagrams, editor integration, examples/specification, release,
  publication, minimum-host certification, and end-to-end V0.13 acceptance
  remain out of scope.
