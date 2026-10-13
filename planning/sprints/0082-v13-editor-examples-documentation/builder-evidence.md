# Sprint 082 Builder Evidence: Editor, Examples, and Documentation

## Status and authority

**Implemented to the authorized Sprint 082 plan with explicit residuals. This
does not accept or release V0.13 end to end.** Sprint 083 owns integrated
acceptance and closeout.

The Lead Developer explicitly authorized execution and approved the concrete
file-by-file plan before production/test changes. The approved plan included
the collapsible outline within the existing CodeMirror editor. A subsequent
narrow amendment approved `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`
solely to delegate the test harness's `formatBuffer` call to the canonical
formatter; production RPC and formatter behavior were not changed.

Preparation began on clean branch `feat/create-v0.13`; no pre-existing
worktree changes or artifacts were overwritten. Validation environment:
Windows x64, OS version `10.0.26300.0`, Bun `1.4.2`, Node `v24.13.1`.

## Requirement-to-host/output matrix

| Requirement | Shared/editor evidence | VS Code host | Desktop host | Output/documentation | Status |
| --- | --- | --- | --- | --- | --- |
| Approved diagram tokens, nested properties, expressions, strings and inert-fence boundaries | [editor.test.ts](../../../tests/editor.test.ts): parser-proven highlighting and original source ranges | [providers.host.ts](../../../vscode-extension/src/test/providers.host.ts): actual TextMate tokenization of complete and incomplete V0.13 forms; V0.13 declaration, time and element scopes | [v13-language-editor.pw.ts](../../../desktop-app/tests/ui/v13-language-editor.pw.ts): actual CodeMirror decoration classes and visible source | — | PASS |
| Canonical formatting, diagnostics, source positions and ranges | Shared facts tested for LF/CRLF, UTF-16 and half-open ranges; [diagram.test.ts](../../../tests/diagram.test.ts) retains canonical formatter coverage | Development Host test directly formats/idempotence-checks diagrams and checks AMXD001 range at an incomplete line | Visible Format button is exercised through the approved mock adapter; Playwright checks canonical result/idempotence, an AMXD001 mark, line and column, and 820 px outline layout | — | PASS |
| Diagram completion, local time, symbols/outline and navigation | Shared tests cover property/arrow candidates, local `t` scope, declaration/reference identities, parent identities and rename facts | Development Host verifies `arrow` property and `"none"`, `"start"`, `"end"`, `"both"` completions; diagram outline children; time definition and references | Playwright verifies element-property and arrow-literal completions, outline tree (`motion` → `t`, `rod`, `timer`), outline navigation and F12 from a local-time reference | [desktop-editor-outline.png](./artifacts/desktop-editor-outline.png) | PASS |
| Published V0.13 specification and searchable assistance | [examples.test.ts](../../../tests/examples.test.ts): README/spec/help links and accuracy assertions | [vscode-extension/README.md](../../../vscode-extension/README.md) links the specification and both examples | [help-center.pw.ts](../../../desktop-app/tests/ui/help-center.pw.ts): searchable topic/content; responsive help frame | [language-spec-v0.13.md](../../../docs/language-spec-v0.13.md), [README.md](../../../README.md), [help-content.json](../../../desktop-app/src/mainview/components/help-content.json) | PASS |
| Runnable crank-slider and battery-resistor examples | [examples.test.ts](../../../tests/examples.test.ts): analysis, evaluation, CLI run and interactive HTML contract | Examples were not inferred from shared-service results as VS Code acceptance | Examples were not inferred from UI RPC results as native preview acceptance | [crank-slider](../../../examples/v0.13-crank-slider.amx), [battery-resistor](../../../examples/v0.13-battery-resistor.amx) | PASS |
| Standalone HTML, interactive selected-time behavior and initial frame | `diagramHtml.test.ts` passes offline/resource/accessibility contract tests | — | Browser inspected both actual standalone HTML artifacts: crank scrubbed from `t=0` to `t=1.5` (label and geometry changed); battery scrubbed from `t=0` to `t=2` (geometry changed while label remained `I = 0.6 A`) | [crank HTML frame](./artifacts/crank-slider-html-lower-bound.png), [battery HTML frame](./artifacts/battery-resistor-html-lower-bound.png) | PASS |
| Static PDF and DOCX lower-bound frames | Existing PDF/DOCX-focused root tests pass | — | Word COM opened each DOCX read-only and rendered its page; this is artifact evidence, not desktop live-preview evidence | PDF and DOCX artifacts/screenshots listed below | PASS |
| Native packaged desktop preview of these examples | Not established by shared renderer results | — | `OPENAMX_NATIVE_CDP_URL` was not configured. The Sprint 042 Vite harness directly tests the CodeMirror/workbench UI but its preview RPC is mocked; the native example preview is therefore **UNAVAILABLE**, not passed | — | UNAVAILABLE |

## Commands and results

Commands ran from the repository root unless the directory is stated.

| Command | Result |
| --- | --- |
| `bun run build` | **PASS**; root TypeScript build. |
| `bun test tests\editor.test.ts tests\examples.test.ts tests\diagram.test.ts tests\diagramHtml.test.ts tests\formatter.test.ts` | **PASS**; 66 tests, 0 failed, 679 expectations across 5 files. |
| `bun test tests\examples.test.ts` | **PASS**; 11 tests, 0 failed, 177 expectations. Rerun after the final test-file indentation correction. |
| From `vscode-extension`: `bun run test` | Extension compile and test compile **PASS**; Development Host ran 24 tests: **17 passed, 7 failed**. Both V0.13-specific host tests (TextMate scopes and completion/outline/navigation/formatting/diagnostic ranges) passed. Failures are the recorded Windows path-case and temporary-directory cleanup failures below. |
| From `desktop-app`: `bun run typecheck` | **PASS** (`hutch electrobun prepare && vue-tsc --noEmit`). |
| From `desktop-app`: `bun run build:web` | **PASS**; Vite, worker bundle, Sharp runtime and PDFMake fonts completed. The existing non-failing Vite >500 kB chunk advisory remained; worker bundle was 8.87 MB. |
| From `desktop-app`: `bun run test:ui -- tests/ui/v13-language-editor.pw.ts tests/ui/help-center.pw.ts` | **PASS**; 3 tests, 0 failed. Direct browser-side checks cover actual CodeMirror decorations, formatting, diagnostic marks/ranges, property/arrow completion, outline and navigation, plus searchable Help. |
| From `desktop-app`: `bun run test` | **FAIL, inherited test-contract mismatch** at `tests/rpc-contract-check.ts:152`: the test expects two literal `sandbox="allow-scripts"` occurrences but the unchanged production App has one preview iframe. No sandbox or assertion was changed. Sprint 080 also records the Windows path-separator expectation exposed after temporarily bypassing that assertion; that workaround was not repeated here. |
| Root `bun test` full suite | **NOT RUN**; focused root suites and root build were run. |

The desktop Playwright config starts Vite through the Unix-only
`./node_modules/.bin/vite`; the first final combined UI invocation failed
because that command is not recognized in Windows PowerShell. Retried with
the established command
`bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort`,
verified HTTP 200, then reran the exact focused UI command successfully.

## Example runs and inspected artifacts

The root build produced `dist/cli.js`. Both documents analyzed without
diagnostics and completed CLI `run`; the binding results were:

- Crank-slider: `crankRadius=34`, `rodLength=105`, `pivotX=70`.
- Battery-resistor: `supplyVoltage=9`, `resistance=15`, `current=0.6`.

The exact CLI output commands were:

```powershell
bun run dist/cli.js run examples\v0.13-crank-slider.amx
bun run dist/cli.js render examples\v0.13-crank-slider.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\crank-slider.html
bun run dist/cli.js export pdf examples\v0.13-crank-slider.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\crank-slider.pdf
bun run dist/cli.js export docx examples\v0.13-crank-slider.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\crank-slider.docx
bun run dist/cli.js run examples\v0.13-battery-resistor.amx
bun run dist/cli.js render examples\v0.13-battery-resistor.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\battery-resistor.html
bun run dist/cli.js export pdf examples\v0.13-battery-resistor.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\battery-resistor.pdf
bun run dist/cli.js export docx examples\v0.13-battery-resistor.amx --out planning\sprints\0082-v13-editor-examples-documentation\artifacts\battery-resistor.docx
```

| Format | Crank-slider | Battery-resistor | Inspection |
| --- | --- | --- | --- |
| Standalone HTML | 54,819 bytes | 54,937 bytes | Browser accessibility snapshots confirmed titled figures, descriptions, Play/Reset, time scrubber and loop controls; each began at `t=0`. The HTML remained below 1 MiB. Direct scrubbing selected `t=1.5` for crank-slider and `t=2` for battery-resistor; geometry changed in both, while battery current stayed `0.6 A`. |
| PDF | 26,088 bytes, 2 pages | 25,989 bytes, 3 pages | PDF.js text extraction found each title, description and lower-bound label; browser PDF pages were visually inspected. The figures visibly show the `t=0` crank frame and the battery’s initial current indicator. |
| DOCX | 17,907 bytes, 1 Word-rendered page | 20,607 bytes, 1 Word-rendered page | Word COM opened each file read-only, repaginated, counted one page, exported a Word-rendered PDF and verified one embedded PNG. Word `AlternativeText` and OOXML `wp:docPr/@descr` both matched the approved diagram description. Embedded PNGs and Word-rendered pages were visually inspected. |

Current output screenshots and representative embedded images:

- HTML: [crank-slider](./artifacts/crank-slider-html-lower-bound.png),
  [battery-resistor](./artifacts/battery-resistor-html-lower-bound.png).
- PDF: [crank-slider](./artifacts/crank-slider-pdf-page.png),
  [battery-resistor](./artifacts/battery-resistor-pdf-page.png).
- Word-rendered DOCX: [crank-slider](./artifacts/crank-slider-docx-word-page.png),
  [battery-resistor](./artifacts/battery-resistor-docx-word-page.png).
- Extracted DOCX images: [crank-slider](./artifacts/crank-slider-docx-embedded.png),
  [battery-resistor](./artifacts/battery-resistor-docx-embedded.png).
- Visible desktop authoring/outline: [desktop-editor-outline.png](./artifacts/desktop-editor-outline.png).
- Word-rendered PDF files: [crank-slider](./artifacts/crank-slider-docx-word-render.pdf),
  [battery-resistor](./artifacts/battery-resistor-docx-word-render.pdf).

Both current example PDFs were checked for accessibility structure markers:
neither contains `/StructTreeRoot` or `/Alt`. Titles and descriptions are
visible/searchable text, but this does not establish tagged PDF, PDF/UA, or
screen-reader support.

## Failures, retries, and scope deviations

- The first root editor test addition was accidentally nested inside an
  existing test and failed with “Cannot call test() inside a test”; the new
  cases were moved to top level and the focused suite passed.
- The first desktop typecheck found three callback-signature errors after
  passing a scoped symbol visitor directly to `forEach`. The calls were
  changed to explicit wrappers; the final desktop typecheck passed.
- Early VS Code V0.13 host assertions selected the first `t` in `time` rather
  than the time-variable token, expected two rather than three reference
  locations, and assumed completion ordering. The assertions were corrected
  to target `t from`, expect the declaration plus two uses, and compare the
  approved arrow values independent of provider sort order. Final V0.13 host
  checks pass.
- The desktop harness initially lacked `formatBuffer`; after explicit Lead
  Developer amendment, the mock delegates that request to
  `formatAmxDocument`. No production formatter/RPC behavior changed.
- Desktop UI checks initially found an incorrect Help topic ordering and
  needed the test cursor positioned at the start of the arrow literal to
  inspect all provider options rather than the filtered `"end"` item. Those
  assertions were corrected; the final combined UI suite passes.
- Initial browser opens of local crank HTML/PDF and Word-rendered PDF failed
  once with `ERR_FAILED`; retrying the same local paths succeeded. An
  element-only screenshot attempt timed out waiting for stable layout; after
  scrolling the figure into view, viewport screenshots were saved and
  inspected. A first PDF.js text-inspection command used an unavailable
  `pdf.destroy()` method; rerunning without that cleanup call returned both
  page counts and searchable text successfully.
- Final `git diff --check` passed. No language or renderer contract amendment
  was made.

## Residuals and owners

| Status | Residual | Owner / follow-up |
| --- | --- | --- |
| **FAIL** | VS Code suite has 7 non-V0.13 failures: 5 `EBUSY` temporary-directory cleanup errors and 2 case-sensitive comparisons of Windows drive paths (`c:\...` actual vs `C:\...` expected). The new V0.13 host tests pass; these inherited failures were not changed or suppressed. | Sprint 083 / extension test maintainers to disposition Windows-host failures. |
| **FAIL** | Desktop `bun run test` still fails on the pre-existing sandbox-occurrence expectation (`2` expected, `1` actual). Production App sandbox remains unchanged. | Sprint 083 / desktop contract-test owner. |
| **UNAVAILABLE** | Native packaged desktop preview of these examples was not run: `OPENAMX_NATIVE_CDP_URL` was not configured. The Vite test harness’s preview RPC is mocked and does not establish native preview behavior. | Sprint 083 / Lead Developer to provide the approved native CDP/UAT path. |
| **NOT RUN** | Native screen-reader/assistive-technology review, minimum-host/low-memory testing, cross-platform qualification and formal accessibility audit. Keyboard focus, control semantics, Help search and desktop outline UI checks do not replace those reviews. | Sprint 083 / accessibility and platform acceptance owners. |
| **UNSUPPORTED** | PDF tagged structure/PDF/UA and screen-reader accessibility are not established; current PDFs have no `/StructTreeRoot` or `/Alt`. | Product/accessibility owner; preserve the documented limitation unless separately authorized. |
| **NOT RUN** | Full root test suite and integrated V0.13 end-to-end acceptance/release. Broader Sprint 079 AMX AST/value parity and high-rate evaluation, plus Sprint 080 measured-host/resource qualification residuals, remain open. | Sprint 083 owns integrated acceptance and residual disposition. |

No release, version change, publication, platform certification, or V0.13
integrated acceptance is claimed. Sprint 083 owns the closeout decision.
