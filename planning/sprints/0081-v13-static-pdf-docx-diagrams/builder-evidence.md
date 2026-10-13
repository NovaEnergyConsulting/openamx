# Sprint 081 Builder Evidence: Static PDF and DOCX Diagrams

## Status

**Implemented and artifact-inspected for the tested CLI and desktop export
paths. This does not accept or release V0.13 end to end.** Execution followed
the approved file plan and its narrowly approved addition of
`tests/reportPresentation.test.ts` for the asynchronous DOCX-preparation API.

The PDF and DOCX adapters consume the same ordered prepared-report sequence
and the same lower-bound SVG frame. PDF embeds inline SVG; DOCX rasterizes that
SVG to an embedded PNG and stores the diagram title and description in image
alt metadata. No interactive controls, scripts, or timeline state are added.

## Commands and results

Commands were run from the repository root unless otherwise indicated.

| Command | Result |
|---|---|
| `bun run build` | **PASS**; diagram runtime generation and root TypeScript build. |
| `bun test tests\reportSequence.test.ts tests\reportPreparation.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts tests\reportPresentation.test.ts tests\pdfCli.test.ts tests\docxCli.test.ts` | **PASS**; 45 tests, 0 failed, 495 expectations across 7 files. |
| `bun run src\cli.ts export pdf planning\sprints\0081-v13-static-pdf-docx-diagrams\artifacts\static-diagrams.amx --out planning\sprints\0081-v13-static-pdf-docx-diagrams\artifacts\static-diagrams.pdf` | **PASS**; CLI reported successful export. |
| `bun run src\cli.ts export docx planning\sprints\0081-v13-static-pdf-docx-diagrams\artifacts\static-diagrams.amx --out planning\sprints\0081-v13-static-pdf-docx-diagrams\artifacts\static-diagrams.docx` | **PASS**; CLI reported successful export. |
| From `desktop-app`: `bun run typecheck` | **PASS**; Electrobun preparation and `vue-tsc --noEmit`. |
| From `desktop-app`: `bun run build:web` | **PASS**; Vite, Bun worker bundle, native Sharp runtime, and PDFMake fonts completed. Vite retained its non-failing >500 kB chunk advisory; worker bundle was 8.87 MB. |
| From `desktop-app`: `bun test src\bun\desktopPdfExport.test.ts src\bun\desktopDocxExport.test.ts` | **PASS**; 3 tests, 0 failed, 29 expectations. Both actual desktop-service export operations included static diagrams; DOCX output contained PNG and alt metadata. |

## Artifacts and visual inspection

- Reproducible source fixture based on the approved D-CRANK-01 and
  D-BATTERY-01 declarations: [static-diagrams.amx](./artifacts/static-diagrams.amx).
- Production CLI outputs: [static-diagrams.pdf](./artifacts/static-diagrams.pdf)
  and [static-diagrams.docx](./artifacts/static-diagrams.docx).
- PDF viewer capture, opened at page 4 of 5:
  [pdf-page.png](./artifacts/pdf-page.png).
- Microsoft Word Desktop, Print Layout at 62% zoom, showing both pages:
  [docx-word-view.png](./artifacts/docx-word-view.png).

Artifact inspection commands:

```powershell
$script = @'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const path = 'planning/sprints/0081-v13-static-pdf-docx-diagrams/artifacts/static-diagrams.pdf';
const bytes = new Uint8Array(await Bun.file(path).arrayBuffer());
const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
const pages = [];
for (let index = 1; index <= pdf.numPages; index++) {
  const text = await (await pdf.getPage(index)).getTextContent();
  pages.push(text.items.map(item => 'str' in item ? item.str : '').join(' '));
}
console.log(JSON.stringify({ pages: pdf.numPages, figurePage: pages[3], narrativeAfterPage: pages[4] }, null, 2));
'@; bun -e $script
```

The PDF structure-tree check used the same loaded bytes and PDF.js page 4:

```js
const raw = new TextDecoder('latin1').decode(bytes);
const page = await pdf.getPage(4);
console.log({
  structTreeRoot: raw.includes('/StructTreeRoot'),
  altEntry: raw.includes('/Alt'),
  structure: await page.getStructTree()
});
```

The actual DOCX OOXML was opened through .NET `ZipFile`, parsed from
`word/document.xml`, and inspected for `wp:docPr`, `wp:extent`, and text node
order. The same archive listing confirmed the internal PNG media parts and
relationships.

The PDF was opened in the integrated Chromium PDF viewer and visually inspected.
Both figures appear together on page 4 in the sequence crank-slider then
battery-resistor. Their titles, descriptions, crank time label, battery
voltage/current/resistance labels, and surrounding narrative are visible.
The rendered SVGs preserve the declared 320:200 (1.6:1) aspect ratio; neither
graphic is cropped or wider than the printable content area. The output is five
pages because the fixture retains the default visible formatted AMX source;
the source occupies earlier pages, the figures follow it, and the final
narrative continues onto page 5.

The actual DOCX was opened read-only in Microsoft Word Print Layout and
visually inspected at 62% zoom. Word reported two pages. Page 1 contains the
report introduction and visible source; page 2 contains both figures with
their visible titles and descriptions in the expected order. The crank
diagram's label is `t = 0 s`; the battery diagram shows `I = 0.6 A`, `9 V`,
`15 ohm`, and the conventional-current arrow. Both figures fit within page
width and page height, remain proportionate, and are not split or cropped.

For the Word inspection, the existing document was queried with
`$document.ComputeStatistics(2)` (2 pages), set to Print Layout
(`$word.ActiveWindow.View.Type = 3`) and 62% zoom, then captured from the Word
window to `artifacts/docx-word-view.png`.

Word's COM `ComputeStatistics(2)` reported 2 pages. A Word-generated PDF was
not produced: the COM `ExportAsFixedFormat`/`SaveAs2` automation calls did not
complete in this host. This did not prevent direct visual inspection of the
actual DOCX in Word Print Layout; the screenshot above is a direct capture of
that view, not a substitute-rendered HTML or reconstructed document.

## Artifact metadata and frame results

- PDF.js text extraction from the actual CLI PDF reported 5 pages. Page 4
  contains both diagram titles and descriptions, `t = 0 s`, `9 V`, `15 ohm`,
  and `I = 0.6 A`; page 5 contains the remaining final narrative.
- The actual DOCX OOXML has two inline images and two local media relationships.
  `wp:docPr` title/description values are:
  - `Crank-slider mechanism` / `A crank pin follows one full circular path and drives a piston through a fixed-length connecting rod.`
  - `Battery-resistor DC circuit` / `A 9 volt battery drives a 15 ohm resistor; the arrow travels clockwise to indicate conventional current.`
- Both DOCX image extents are 5,715,000 × 3,571,875 EMU (1.6:1). Width is
  below the 9,026-twip usable-width limit. The relationships target embedded
  PNG parts; no external image target, SVG media, or macro project is emitted.
- Focused renderer tests use a frame whose geometry and label differ at lower,
  interior, and upper times. PDF output embeds the `t = 0` geometry/text and
  excludes the interior frame. The DOCX test inspects the embedded PNG pixels:
  the lower-bound marker is present at its expected position and the
  upper-bound position is transparent.
- The same static serializer adds escaped SVG `title` and `desc`, and
  production tests verify authored text cannot become active markup. The PDF
  keeps title/description as visible, searchable text in report order; no
  formal tagged-PDF or PDF/UA property is claimed.

## Failure, offline, and atomicity checks

- Focused PDF and DOCX CLI tests use lower-bound `cx: 1 / 0` geometry. Both
  exports fail with `AMXD008`; a pre-existing destination retains its exact
  original bytes, and the output directory contains no temporary artifact.
- The ordered-sequence helper rejects invalid insertion positions and
  duplicate diagram order instead of silently omitting a diagram.
- Rendering/evaluation/rasterization errors propagate; no blank, placeholder,
  omission, or success-shaped fallback is emitted.
- Existing PDFMake URL access remains disabled and local font access remains
  restricted to the packaged font directory. Diagrams use inline SVG or
  embedded PNG only; no remote resource is introduced. Destination validation
  and atomic writer implementations were not weakened or changed.
- Desktop PDF and DOCX export tests passed through the desktop service/job
  path. The worker build includes the asynchronous DOCX rasterization path.

## Residuals and boundaries

- No PDF/UA certification, screen-reader or assistive-technology audit,
  minimum-host/cross-platform qualification, or formal accessibility audit
  was performed. PDF title/description are visibly searchable and are present
  in the source SVG; the adapter's retained tagged accessibility metadata was
  not established.
- The full root test suite and the full desktop RPC contract script were not
  run. The existing Sprint 080 RPC sandbox-occurrence assertion mismatch
  remains recorded separately and was not changed or treated as export
  evidence.
- No packaged desktop host qualification, end-to-end V0.13 acceptance,
  release, publication, version change, or platform certification is claimed.
- Sprint 079's broader AMX AST/value parity and high-rate performance
  residuals remain unchanged.
