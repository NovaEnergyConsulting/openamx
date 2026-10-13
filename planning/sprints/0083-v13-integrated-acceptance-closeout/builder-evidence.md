# Sprint 083 Builder Evidence: V0.13 Integrated Acceptance and Closeout

## Status and recommendation

**Builder recommendation: BLOCKED / OPEN. Lead Developer disposition:
ACCEPTED / CLOSED WITH RECORDED RESIDUALS (2026-10-13).** Core, editor-host,
standalone HTML, CLI export, and desktop build checks produced substantial
passing evidence, but the integrated acceptance record retains the native
packaged desktop preview, battery PDF figure-page visual, and Word DOCX
page-flow gaps. The pre-existing local stable-package output also was not
snapshotted before its authorized rebuild, so byte-for-byte preservation of
that prior ignored directory cannot be established.

This is verification-only work. No language/runtime/editor/renderer/security
implementation, test assertion, specification, example, dependency, version,
release, or publication file was changed. No V0.13 acceptance/closure is
claimed by the Builder.

The initial worktree was clean on `feat/create-v0.13`. The execution plan and
verification/evidence paths were explicitly approved before repository files
were created. Original build/test outputs and the three Sprint 080 screenshots
written by the playback test were snapshotted. The latter and all other
snapshotted directories were restored and hash-verified; the generated
`src/renderer/diagramBrowserRuntime.ts` hash was unchanged.

## Environment

| Item | Observed |
| --- | --- |
| OS / architecture | Windows 11 Home `10.0.26300` x64 |
| PowerShell | `5.1.26100.9444` |
| Bun / Node | Bun `1.4.2`; Node `v24.13.1` |
| VS Code CLI / Development Host | CLI `1.141.0`; Extension Development Host `1.85.0` |
| Desktop toolchain | Hutch `0.27.1`; Vite `6.4.3` |
| Browser test | Playwright `1.63.0`; headless Chromium `153.0.8010.12`; 16 reported logical processors |
| Report inspection | PDF.js `6.3.289`; DOCX `9.8.1`; Word COM `16.0`, executable file version `16.0.20430.20146` |
| Native preview endpoint | `OPENAMX_NATIVE_CDP_URL` was not set. |
| Package versions | Root, desktop and extension manifests all remained `0.12.4`; no version change was made. |

## Integrated master-plan-to-evidence matrix

The fixture contract and exact diagnostic map are Sprint 078's
`grammar-examples.md`, `diagnostic-matrix.md`, and
`requirement-test-matrix.md`. The rows below report each applicable surface
independently; a host or renderer result is not inferred from a neighboring
surface.

| Requirement / fixture family | Core | VS Code Development Host | Desktop CodeMirror / preview | Standalone HTML | PDF | DOCX | Residual owner / follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Approved language/model semantics: D-CRANK-01, D-BATTERY-01; local time, source order, immutable model, selected frames | **PASS** — `tests/diagram.test.ts`; positive, typed-context, order, limits and immutability coverage in the 312-test focused run and 502-test full run. | **PASS** — both V0.13-specific host tests passed; grammar tokenization, format/ranges, completion, outline and navigation. | **PASS** for direct user-visible editor behavior in the Vite workflow harness; **BLOCKED/UNAVAILABLE** for native workbench/UAT. | **PASS** — fresh CLI outputs opened locally; crank `t=0` → `1.5` moved pin x `36` → `70`; battery `t=0` → `2` moved arrow x `58` → `108`, with `I = 0.6 A` unchanged. | **PASS** for generation and extracted content; crank lower-bound page was visually inspected. Battery diagram page 3 was text-extracted but not visually reached: **BLOCKED/UNAVAILABLE** for that visual check. | **PASS** for generated DOCX, OOXML title/description, internal PNG relationship, extents and embedded lower-bound image. Word page-flow view: **BLOCKED/UNAVAILABLE**. | Lead Developer / reviewer: direct battery PDF page and actual Word DOCX view. |
| D-NEG-01–24; AMXD001–AMXD015 and approved AMX3001/AMX3002 reuse; source location, including D-NEG-18 at `10:15` | **PASS** — all 24 fixture diagnostics/messages/primary positions, UTF-16 range and approved cap/style diagnostics covered by `tests/diagram.test.ts`. | **PASS** for the V0.13-specific incomplete declaration/range case and source-range host coverage; aggregate host status is separately **FAIL** below. | **PASS** for visible incomplete-block diagnostic marks/ranges in Vite CodeMirror. **PASS** for Vite preview error/clear/recovery bridge; native error lifecycle **BLOCKED/UNAVAILABLE**. | **PASS** — standalone AMXD009, AMXD010 and AMXD011 stop/clear/recover behavior passed the focused Playwright test. | **PASS** for lower-bound AMXD008 failure/no-write assertions in `tests/pdfCli.test.ts`; full report output is not silently substituted. | **PASS** for lower-bound AMXD008 failure/no-write assertions in `tests/docxCli.test.ts`. Word visual rendering of invalid output: **NOT RUN**. | Desktop RPC owner: retain the inherited sandbox-occurrence failure; no assertion or sandbox change authorized. |
| Canonical formatter, editor highlighting/completion/symbols/navigation/help | **PASS** — formatter idempotence/meaning preservation and shared editor facts in the focused and full root tests. | V0.13 behavior **PASS**; aggregate suite **FAIL** (17 passed / 7 failed). | **PASS** in Playwright/Vite harness for visible CodeMirror decorations, formatting, completion, outline/navigation and Help search. Native desktop UI **BLOCKED/UNAVAILABLE**. | **PASS** for both documents' source/diagram ordering in generated HTML. | **PASS** for source, title/description and narrative reading order in extracted PDF text. | Package text/relationship order **PASS**; application page-flow **BLOCKED/UNAVAILABLE**. | VS Code test maintainers; Lead Developer / native desktop reviewer. |
| Playback controls, time behavior, aspect ratio, no autoplay, isolation, accessibility semantics | Core model/frame behavior **PASS**. | **PASS** for supported authoring services; playback is not a VS Code capability. | Vite harness UI/preview bridge **PASS**; packaged desktop playback/UAT **BLOCKED/UNAVAILABLE**. | **PASS** — local-file controls, lower-bound paused state, scrub, play/pause, reset, loop endpoints, independent diagrams, keyboard/focus, 1.6 ratio and zero resource requests passed; both examples directly scrubbed. | Static lower-bound only; no controls. Extracted reading order **PASS**; full battery diagram visual **BLOCKED/UNAVAILABLE**. | Static image/no controls in the generated package **PASS**; actual Word page-flow **BLOCKED/UNAVAILABLE**. | Lead Developer to provide the approved native CDP/UAT endpoint; assistive-technology reviewer. |
| Offline/security, hostile text, active-frame errors and preview freshness | **PASS** for typed model serialization/diagnostic regression tests. | **PASS** for normal V0.13 editor support; extension aggregate failures remain separate. | **PASS** for test-harness security/freshness/host-message cases; this does not establish packaged native behavior. | **PASS** — local files, no unexpected resource entries for either example, hosted runtime/data separation and the standalone security/error suite. | **PASS** for generated static SVG/text; no tagged accessibility is inferred. | Internal PNG relationship/alt metadata inspection **PASS**; relationship targets for the diagram images are internal `word/media/*.png` parts. | Native desktop/resource inspection remains Lead Developer-owned. |
| Interactive resource bounds and repeated emissions | Structural authored caps and diagnostics **PASS** in core fixtures. | **NOT RUN** — not an extension-host resource capability. | Package-bound workload **BLOCKED/UNAVAILABLE** without CDP; do not substitute Chromium numbers. | **PASS** on the measured headless Chromium standalone workload: 17 diagrams / 544 elements, 180,968 UTF-8 bytes, 895 whole-page nodes, 2.8 ms p95 over 60 samples and 2,144,500-byte incremental heap after forced GC. | **NOT RUN** — interactive bounds do not apply to static PDF. | **NOT RUN** — interactive bounds do not apply to static DOCX. | Lead Developer / minimum-host and native performance reviewer; the sample is not platform qualification. |
| Final integrated host/artifact acceptance | Root full suite **PASS**. | Development Host aggregate **FAIL**, despite V0.13 tests passing. | Desktop typecheck/build **PASS**; RPC aggregate **FAIL**; browser UI **PASS**; native package preview **BLOCKED/UNAVAILABLE**. | Example artifacts directly inspected; **PASS**. | CLI outputs/text **PASS**; crank visual **PASS**; battery diagram-page visual **BLOCKED/UNAVAILABLE**. | Package/alt/PNG **PASS**; direct Word view **BLOCKED/UNAVAILABLE**. | Lead Developer to disposition V0.13 separately, with named residuals and owners. |

### Fixture disposition

| Cases | Core result | Cross-surface evidence and limitation |
| --- | --- | --- |
| D-CRANK-01, D-BATTERY-01 | **PASS** — exact Sprint 078 source fixtures parse/check/evaluate; dynamic start/interior/end values and model capture are asserted. | Both current examples also pass shared editor analysis, CLI `run`, and production HTML/PDF/DOCX generation. Direct HTML interaction passed. PDF.js confirms static lower-bound text/order; the crank figure page is visible in the retained PDF screenshot, while the battery PDF figure page is not. DOCX image bytes/alt metadata pass; actual Word layout did not complete. |
| D-NEG-01–24 | **PASS** — exact diagnostic code/message/source position suite, including AMXD009/010/011 frame distinctions and D-NEG-18 `10:15`. | Standalone playback tests exercise AMXD009/010/011; root CLI tests exercise invalid lower-bound PDF/DOCX atomicity. VS Code and desktop editor UI tests cover representative incomplete/range cases, not all 24 independently. |
| AMXD012–AMXD015 and module/nested execution | **PASS** — authored caps, invalid height/style, dependency/source order and repeated execution assertions are in `tests/diagram.test.ts`. | Standalone browser repeated emissions retain all 17 models / 544 elements. The native packaged workload remains unavailable in Sprint 083. |

## Exact commands and aggregate results

All commands ran on the environment above. Complete runner output, first
results, retries and warnings are retained in [`artifacts/verification.log`](./artifacts/verification.log).

| Directory / command | Result |
| --- | --- |
| Repository root: `bun run build` | **PASS**, exit 0. The generator rewrote no content: `src/renderer/diagramBrowserRuntime.ts` matched its pre-run SHA-256 `8928DD8EEF2D71311DFC72EB3C43102EF51BBCCC7B79A1E0741936948E316844`. |
| Repository root: combined `bun test tests\parser.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\editor.test.ts tests\modules.test.ts tests\diagram.test.ts tests\diagramHtml.test.ts tests\reportPreparation.test.ts tests\reportSequence.test.ts tests\renderer.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts tests\examples.test.ts tests\pdfCli.test.ts tests\docxCli.test.ts tests\outputCli.test.ts tests\reportIdentityCli.test.ts` | **PASS** — 312 passed, 0 failed, 1,890 expectations, 17 files; 31.20 s. |
| Repository root: `bun test` | **PASS** — 502 passed, 0 failed, 3,111 expectations across 40 files; 57.59 s. |
| `vscode-extension`: `bun run test` | **FAIL** — Development Host 1.85.0: 17 passed / 7 failed. The V0.13 TextMate and completion/outline/navigation/format/range host tests passed. Failures: five `EBUSY` temp-directory cleanup errors and two lowercase-vs-uppercase Windows drive-letter assertions (`c:\...` actual vs `C:\...` expected). This matches Sprint 082's 17/24 baseline; no retry or fix was made. |
| `desktop-app`: `bun run typecheck` | **PASS**, `hutch electrobun prepare && vue-tsc --noEmit`. |
| `desktop-app`: `bun run build:web` | **PASS** — Vite 6.4.3 transformed 3,273 modules; worker bundle 8.87 MB; host-native Sharp and four PDFMake fonts copied. Existing >500 kB chunk advisory retained. |
| `desktop-app`: `bun run build` | **PASS** — local stable Windows x64 package at `desktop-app\build\stable-win-x64`; no release or publication. Package artifacts are listed by hash in the verification log. Preservation caveat is below. |
| `desktop-app`: `bun run test` | **FAIL**, inherited contract mismatch at `tests/rpc-contract-check.ts:152`: expects two literal `sandbox="allow-scripts"` occurrences, finds one. No production sandbox or assertion was changed. |
| `desktop-app`: initial `bun run test:ui -- tests/ui/v13-language-editor.pw.ts tests/ui/help-center.pw.ts tests/ui/diagram-playback.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts` | **FAIL before tests** — configured `./node_modules/.bin/vite` launcher is not recognized on Windows. |
| Same focused `test:ui` command after manually starting `bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort` | **PASS for harness UI**, HTTP readiness 200; 9 passed, 1 skipped native-package test. The skip was because `OPENAMX_NATIVE_CDP_URL` was absent. Playwright UI coverage is not native package acceptance. |

### Retained failure and retry outcomes

- The first Playwright command failure is retained in the log. Starting the
  same Vite harness through Bun and confirming HTTP 200 allowed the exact UI
  test selection to run; this retry does not erase the startup failure.
- The VS Code aggregate was run once and matches the Sprint 082 failure
  families/count. No cleanup/path test was altered or retried.
- The desktop RPC suite stopped at the inherited sandbox occurrence
  assertion. No workaround, temporary assertion change or retry was used.
- The first optional inline `bun -e` analyzer wrapper failed before invoking
  application code because Windows PowerShell stripped its quotes. The
  repository's real `tests/examples.test.ts` analyzer path passed, and both
  production CLI `run` commands succeeded.
- The first crank PDF viewer open returned `ERR_FAILED`; retry succeeded and
  produced the visible crank figure capture. For the battery PDF, page count
  and page-3 text were extracted, but the available viewer capture remained
  on pages 1–2; page-3 visual evidence is therefore **BLOCKED/UNAVAILABLE**.
- Word COM inspection opened the DOCX read-only but its
  `ExportAsFixedFormat` operation did not complete after more than nine
  minutes. A subsequent desktop capture did not produce a verified Word view;
  that capture was deleted and no Word screenshot is claimed. The read-only
  automation processes were stopped by their specific process IDs.
- Several initial ad hoc PowerShell inspection wrappers had syntax/quoting
  errors before inspecting or writing any document; the final OOXML extraction
  succeeded. They did not alter source, tests, examples or DOCX inputs.
- The first attempted lower-bound crank HTML screenshot was bound to the PDF
  viewer page rather than the HTML page. It was replaced only after explicitly
  navigating back to the crank HTML and confirming its `t=0` DOM state; the
  retained `crank-slider-html.png` is the corrected local-HTML capture.
- `git diff --check` passed for changed tracked hunks. A supplementary
  whole-file trailing-whitespace scan found a pre-existing trailing space in
  the historical Sprint 002 assumptions section of `planning/questions.md`;
  that untouched line was left as-is.

## Example outputs and artifact inspection

All outputs below were generated from the current source using the production
CLI. `run` results: crank `crankRadius=34`, `rodLength=105`, `pivotX=70`;
battery `supplyVoltage=9`, `resistance=15`, `current=0.6`.

| Example / output | Size | SHA-256 | Inspection |
| --- | ---: | --- | --- |
| [`crank-slider.html`](./artifacts/crank-slider.html) | 54,819 B | `8E7198B1D9C095B361850ACF2707045C4151690C070B920577CCE8144C30D66C` | Local-file HTML directly inspected; no resource entries; `t=0` screenshot and scrubbed `t=1.5` screenshot retained. |
| [`crank-slider.pdf`](./artifacts/crank-slider.pdf) | 26,088 B | `8F2DD083D1615C8A502BB9689C434335E7C2C7F5C52519199F813EA516C4F538` | PDF.js: 2 pages; page 2 title/description and `t=0`; actual page with crank frame visually inspected. No `/StructTreeRoot` or `/Alt`. |
| [`crank-slider.docx`](./artifacts/crank-slider.docx) | 17,906 B | `4109472A8249228EB07EA2C590614CE0E6F07FF526248EA4C531C1F4701C7B07` | OOXML title/description, internal PNG, aspect ratio and embedded image verified. Actual Word page-flow inspection unavailable. |
| [`battery-resistor.html`](./artifacts/battery-resistor.html) | 54,937 B | `21DC48E208E05D38A9E6E0119C83CEAB2A74F253C6FFF4FD766CD782BC7B79A7` | Local-file HTML directly inspected; no resource entries; initial `x=58` and scrubbed `t=2`, `x=108`, `I = 0.6 A` retained. |
| [`battery-resistor.pdf`](./artifacts/battery-resistor.pdf) | 25,989 B | `C5C8B40B3A38F388E8A762C02E0408CA361D62F2CBAFCB073A14A5ABB5DF208A` | PDF.js: 3 pages; page 3 text includes title, description, `9 V`, `15 ohm`, `I = 0.6 A`; visual page-3 capture unavailable. No `/StructTreeRoot` or `/Alt`. |
| [`battery-resistor.docx`](./artifacts/battery-resistor.docx) | 20,606 B | `42FEC67AFAACC5C8E39CDBA4967E735861673C11BD607EAE5A35CA0141AB6720` | OOXML title/description, internal PNG, aspect ratio and embedded image verified. Actual Word page-flow inspection unavailable. |

HTML screenshots: [`crank-slider-html.png`](./artifacts/crank-slider-html.png),
[`crank-slider-html-interior.png`](./artifacts/crank-slider-html-interior.png),
[`battery-resistor-html.png`](./artifacts/battery-resistor-html.png), and
[`battery-resistor-html-interior.png`](./artifacts/battery-resistor-html-interior.png).

PDF screenshots: [`crank-slider-pdf-page.png`](./artifacts/crank-slider-pdf-page.png)
shows the figure page at `t=0`; [`battery-resistor-pdf-source-pages-1-2.png`](./artifacts/battery-resistor-pdf-source-pages-1-2.png)
is explicitly the source pages only and is not represented as a figure-page
capture.

DOCX images extracted from the actual package and visually inspected:
[`crank-slider-docx-embedded.png`](./artifacts/crank-slider-docx-embedded.png)
and [`battery-resistor-docx-embedded.png`](./artifacts/battery-resistor-docx-embedded.png).
OOXML `wp:docPr` title/description matches the approved title/description for
each example. Each document contains one internal PNG relationship; image
extents are `5,715,000 × 3,571,875` EMU (1.6:1). No Word-rendered page
screenshots exist because the direct Word render did not complete.

Desktop/Vite harness screenshots:
[`desktop-editor-outline-vite-harness.png`](./artifacts/desktop-editor-outline-vite-harness.png),
[`desktop-help-vite-harness.png`](./artifacts/desktop-help-vite-harness.png),
[`desktop-security-preview-vite-harness.png`](./artifacts/desktop-security-preview-vite-harness.png),
[`desktop-preview-harness-frame-error.png`](./artifacts/desktop-preview-harness-frame-error.png),
[`standalone-playback-controls.png`](./artifacts/standalone-playback-controls.png),
and [`standalone-frame-error-clear.png`](./artifacts/standalone-frame-error-clear.png).
These are browser/harness captures, not native desktop screenshots.

### DOCX/PDF accessibility boundary

The PDF.js raw-byte checks found no `/StructTreeRoot` and no `/Alt` in either
inspected PDF. This is a recorded artifact limitation; it is not PDF/UA,
tagged-PDF or screen-reader acceptance. Visible/searchable text and source
SVG metadata do not establish those claims. DOCX alternative text is verified
in the package, but no assistive-technology review or verified Word-rendered
page-flow screenshot is available.

## Native package, resources and preservation

- `desktop-app` typecheck, web build and local stable package build passed.
  The built package is a local verification artifact only; no installer was
  launched, released or published.
- Native WebView2 preview test: **BLOCKED/UNAVAILABLE** because
  `OPENAMX_NATIVE_CDP_URL` was absent. The Playwright test reported one
  native-package skip. Vite UI, mocked RPC, generated HTML and the local
  package build are not substitutes.
- Headless Chromium repeated-emission measurements are standalone browser
  evidence only, not package/device qualification. Minimum-host/low-memory
  and cross-platform measurements remain **NOT RUN**.
- Existing tracked source and Sprint 078–082 evidence were preserved.
  Snapshotted output directories were restored and hash-verified, and the
  three overwritten Sprint 080 screenshots were restored to their recorded
  original hashes.
- **Preservation gap:** the local `desktop-app\build\stable-win-x64` directory
  was not snapshotted before `bun run build`; whether prior ignored package
  bytes were replaced cannot be determined. The current seven-file,
  92,469,649-byte package was copied and hash-verified after the build under
  session-state. The Lead Developer selected continuation with this gap
  explicitly recorded. No further command modified the package directory.
- Root test-created `openamx-output-test-1791888372633-w461vj2s4op` contained
  only `.keep`; that exact temporary test directory was removed after the run.

## Residuals and owners

| Status | Residual | Owner / required follow-up |
| --- | --- | --- |
| **FAIL** | VS Code aggregate 17/24 on Windows; five `EBUSY` cleanup failures and two path-case assertions. V0.13-specific host tests passed. | Extension test maintainers / Lead Developer; keep this distinct from V0.13-specific host passes. |
| **FAIL** | Desktop RPC contract stops at inherited sandbox occurrence assertion (`2` expected, `1` actual). | Desktop contract-test owner / Lead Developer; no sandbox/assertion edit authorized. |
| **BLOCKED/UNAVAILABLE** | Actual packaged desktop preview/UAT and packaged repeated-emission measurement; native CDP URL not configured. | Lead Developer / Windows desktop reviewer to provide the approved host endpoint and directly exercise the package. |
| **BLOCKED/UNAVAILABLE** | Battery PDF figure-page raster/visual inspection; PDF.js text/order extraction passed. | Lead Developer / PDF reviewer to inspect the actual page in an approved viewer. |
| **BLOCKED/UNAVAILABLE** | Actual Word-rendered DOCX page flow; Word COM export hung and no Word screenshot is retained. | Lead Developer / Word reviewer to inspect both generated DOCX documents read-only in Word Print Layout and record page count/flow. |
| **BLOCKED/UNAVAILABLE** | Tagged-PDF/PDF/UA or screen-reader support is not evidenced; inspected PDFs lack `/StructTreeRoot` and `/Alt`. | Product/accessibility owner; do not claim these capabilities. |
| **NOT RUN** | Native screen-reader/assistive-technology review, minimum-host/low-memory qualification and cross-platform qualification. | Lead Developer / accessibility and platform owners. |
| **BLOCKED/UNAVAILABLE** | Prior ignored stable package output cannot be compared because `desktop-app\build` was not snapshotted before the approved build. Current post-build output is preserved. | Lead Developer to decide whether recovery or additional evidence is required. |
| **NOT RUN** | Exhaustive AMX AST/value/function parity and high-rate evaluation beyond documented fixture/workload coverage. | Core runtime owner; separate follow-up if required. |

## Builder closeout request

**Builder recommendation: BLOCKED / OPEN.** The repository verification did
not expose a core regression, but all mandatory acceptance criteria cannot be
claimed complete with the native package, battery PDF figure-page and Word
page-flow evidence gaps above. Residual failures/unavailable checks remain
separate statuses; no cross-surface inference is made.

**Lead Developer disposition (user selection, 2026-10-13):
ACCEPTED / CLOSED WITH RECORDED RESIDUALS.** This disposition accepts the
V0.13 closeout while retaining every PASS, FAIL, BLOCKED/UNAVAILABLE, and
NOT RUN status above. It does not promote unverified checks, authorize release
or publication, change a version, or certify a platform.
