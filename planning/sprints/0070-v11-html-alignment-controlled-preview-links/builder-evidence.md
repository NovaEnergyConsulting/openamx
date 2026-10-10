# Sprint 070 Builder Evidence

## Status and Authority

**Lead Developer disposition (provided by user, 2026-10-10): ACCEPTED WITH RECORDED RESIDUALS.** Before source/test edits, the user explicitly authorized Sprint 070 and approved the concrete file-by-file plan. After a Sprint-caused CLI golden mismatch surfaced, the user separately approved regenerating `examples/typed-asset-analysis.html`; after the Explorer screenshot, the user authorized its narrow Windows path-separator correction and regression test.

This disposition closes Sprint 070 only and does not authorize Sprint 071, V0.11 completion, release, or publication.

## Implementation

- `src/renderer/renderHtml.ts` renders prepared `PreparedReportItem.markdown` nodes for standalone HTML and desktop preview. It emits shared heading IDs, visible line breaks, formatting, nested lists, blockquotes, aligned Markdown tables, rules, page breaks, and sanitized PNG/JPEG data with proportional no-upscale dimensions. Raw HTML remains escaped literal text.
- Standalone links are emitted as safe HTTP/HTTPS links, validated internal anchors, or local URIs relative to the supplied final output directory. CLI passes its resolved destination; desktop HTML export passes the host-validated destination. Companion files are not copied.
- Preview external/local links contain only random 128-bit IDs. A random 256-bit per-preview token is bound to the current document/project/settings identity, worker job, source revisions, and active frame channel. The iframe sends only `{ version: 1, type: "navigate", previewToken, targetId }` over a parent-transferred `MessageChannel`; the message does not contain a URL or path.
- The target map crosses only the trusted worker/service boundary and is stored privately by the service. Public job and preview RPC results carry HTML/token but no map. New previews, stale identities, and iframe teardown invalidate mappings.
- The dedicated host action accepts only the ID, token, and exact active identity; resolves the host map; revalidates external HTTP/HTTPS credentials/scheme and local decoded path, canonical project containment, symlink components, regular-file status, and `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, `.json` extension; confirms through host UI; then revalidates the local file and calls only `Utils.openExternal` or `Utils.openPath`. Cancel performs no native open.
- Preview uses a trusted generated click handler gated on `event.isTrusted` and active user activation. The parent checks the current iframe/channel/token/identity. Internal fragments remain in-frame. `sandbox="allow-scripts"` without `allow-same-origin`, CSP prohibitions, offline image handling, chart implementation/interactions, report order/emissions, preview freshness, and output limits remain preserved.
- Chromium testing the actual generated **no-chart** preview found that `script-src 'none'` blocked its required navigation bootstrap. Preview mode now authorizes only the generated nonce-bearing handler; standalone no-chart HTML remains `script-src 'none'`. The actual no-chart iframe test verifies generated script execution, synthetic/internal/external/local behavior, opaque-only messages, offline image display, and forged-message rejection.
- The user-approved `examples/typed-asset-analysis.html` refresh preserves the CLI test's exact output comparison. The generated file now matches AST-rendered heading anchors and visible prose breaks. It was generated with:

  ```powershell
  $asset = (Resolve-Path 'examples\typed-asset.json').Path
  $screenings = (Resolve-Path 'examples\typed-screenings.csv').Path
  $reviewedAt = (Resolve-Path 'examples\typed-reviewed-at.json').Path
  bun src\cli.ts render examples\typed-asset-analysis.amx --out examples\typed-asset-analysis.html --input "asset=$asset" --input "screenings=$screenings" --input "reviewedAt=$reviewedAt"
  ```
- **User-approved Explorer follow-up:** the screenshot's nested files were incorrectly grouped at root because `ProjectExplorer.vue` checked/split `/` while Windows service paths use `\`. This Explorer/service path code was untouched by Sprint 070; the issue predated it. The user authorized normalizing either separator for grouping and displayed basenames, without changing or reformatting `file.path` sent to `open`.

## Environment

- Host: Windows x64, OS version `10.0.26300.0`.
- Bun `1.4.2`; Node.js `v24.13.1`.
- Playwright `1.63.0`; headless Chromium `153.0.8010.12`.
- Browser tests used `desktop-app/spikes/sprint042-workflow-harness` on `http://127.0.0.1:4183/`; no Electrobun desktop window was launched.

## Exact Verification

| Command | Result |
|---|---|
| `bun test tests\renderer.test.ts tests\reportPresentation.test.ts` | **23 passed, 0 failed; 150 expectations** |
| `bun run build` | **Passed** (`tsc`) |
| `bun test tests\examples.test.ts` after fixture refresh | **7 passed, 1 failed; 135 expectations**. The only failure is inherited `tests/examples.test.ts:43`; the Sprint-caused exact-output comparison at line 165 passes. |
| `bun test` | **425 passed, 6 failed; 431 tests across 35 files.** Two failures are inherited: `tests/editor.test.ts:73` and `tests/examples.test.ts:43`. Four are timeouts under the default parallel run: one image-preparation case and three Sprint 041 mapped-data worker cases. |
| `bun test --parallel=1 --max-concurrency=1` | Two serial full-suite runs were timing-sensitive: the first had **429 passed, 2 failed** (only the same inherited failures); the final run had **427 passed, 4 failed**, adding two desktop DOCX jobs left `committing` at their short poll limit. |
| `bun test tests\reportPreparation.test.ts` | **9 passed, 0 failed; 69 expectations**; the case that timed out under parallel full-suite load passes alone. |
| From `desktop-app`: `bun test src\bun\desktopDataEditor.test.ts` | **8 passed, 0 failed; 47 expectations**; the three mapped-data cases that timed out under parallel full-suite load pass alone. |
| From `desktop-app`: `bun test src\bun\desktopPreviewNavigation.test.ts` | **2 passed, 0 failed; 38 expectations** |
| From `desktop-app`: `bun test src\bun\desktopPreviewNavigation.test.ts src\bun\jobWorker.test.ts` | **7 passed, 0 failed; 68 expectations** |
| From `desktop-app`: `bun test src\bun\desktopDocxExport.test.ts` | **2 passed, 0 failed; 15 expectations** when run alone after the full-suite `committing` timeouts. |
| From `desktop-app`: `bun run typecheck` | **Passed** (`hutch electrobun prepare` and `vue-tsc --noEmit`) |
| From `desktop-app`: `bun run build:web` | **Passed**. Vite emitted its existing large-chunk advisory; Bun bundled 915 worker modules into an 8.74 MB worker, and the Sharp runtime/PDF fonts copied successfully. |
| From `desktop-app`: `bun run test` | **Failed at inherited `tests/rpc-contract-check.ts:70`**: expected two `sandbox="allow-scripts"` matches, found one. The iframe and assertion were not relaxed or repaired. |
| From `desktop-app`: `bun run test:ui -- tests/ui/preview-navigation.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts` | **3 passed** in headless Chromium. A first attempt could not start the configured Unix-style `./node_modules/.bin/vite` command under Windows; starting the same harness with `bun run vite` returned HTTP 200, after which the exact Playwright command passed. |
| From `desktop-app`: `bun run test:ui -- tests/ui/project-explorer-paths.pw.ts` | **1 passed**; verified Windows backslash paths are grouped under `libraries`, basenames display correctly, and the unchanged backslash path reaches RPC. |
| From `desktop-app`: UI suite including all three required preview tests plus `tests/ui/project-explorer-paths.pw.ts` | **4 passed** in headless Chromium. |

The browser tests observed a genuine Playwright click reaching the mocked trusted host action once; internal-anchor navigation, a synthetic click, and forged global `postMessage` did not reach it. They recorded no outbound requests. The security test rendered the sanitized data image offline in both standalone and sandboxed preview (`naturalWidth === 1`), retained 10 chart nodes/canvases, and verified parent-document access remained denied. A second production-rendered no-chart iframe used the real renderer's nonce bootstrap and exercised external/local IDs, internal anchors, synthetic clicks, and forged parent/child messages. The freshness test verified pause, refresh, resume, autosave-before-publication, and stale-output behavior.

Playwright retained these screenshots in the ignored test-output directory (generated, not separately inspected): `desktop-app/test-results/html-chart-security.pw.ts--6e393-without-authored-navigation/sprint062-standalone-wide.png`, `sprint062-standalone-narrow.png`, `sprint062-standalone-print.png`, and `sprint062-desktop-preview.png`.

## Host Confirmation Results and Evidence Boundary

`desktopPreviewNavigation.test.ts` injects host confirmation/native-action callbacks rather than invoking Windows UI. It verifies:

- Confirmed HTTPS and local targets call the appropriate opener, with confirmation recorded first.
- Local cancel performs no file opener call.
- A local file removed during the confirmation callback is rejected by the second revalidation and is not opened.
- Unknown, raw-target-injected, replaced-preview, stale-revision, unsupported-scheme, credentialed URL, traversal, missing-file, symlink, and disallowed-extension cases fail closed.
- The preview job result contains the token and rendered HTML but no `targets` map.

The actual Electrobun `Utils.showMessageBox` dialog, user button input, and OS URL/file handoff were **not manually exercised**. The callback tests are service-boundary evidence, not proof of the native dialog’s presentation or OS opener behavior. Owner: Lead Developer / desktop reviewer for disposition or additional native-host evidence.

## Residuals and Disposition

- Default-parallel root test execution retains the four observed worker/image timeouts above. The two serial full-suite runs also differed: one had only the two inherited failures; the later run had two additional DOCX exports still `committing`. Each affected image/data-editor/DOCX test file passes in isolation. No stable Sprint-caused failure was found; do not repair these test-runner timing limits in Sprint 070.
- The desktop RPC sandbox-count residual remains open; no sandbox permission was added.
- Sprint 067 PDF raster/viewer evidence and Sprint 069 Word Web null-gap visual and screen-reader evidence remain for Sprint 071 closeout.
- Native host-dialog/OS-open evidence remains unverified as stated above.
- The accepted disposition closes Sprint 070 only. It does not authorize Sprint 071, release, publication, or V0.11 completion.
