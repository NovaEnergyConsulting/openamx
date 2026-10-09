# Sprint 066 Builder Evidence (2026-10-09)

## Status and Authority

**Lead Developer disposition (2026-10-09): ACCEPTED / CLOSED.** The shared narrative model and focused verification are complete. This closes Sprint 066 only; it does not imply V0.11 completion, release, publication, or authorization beyond the master-plan dependencies.

During this Builder session, the user explicitly selected the 4,000,000 decoded-pixel per-image limit and the proposed local hyperlink extension allowlist. Those directions are recorded as user selections, not attributed to an unstated Lead Developer role.

## Environment

- Host: Microsoft Windows 11 Home, version `10.0.26300`, build `26300`, 64-bit; Lenovo model `83L0`.
- Bun `1.4.2`; Node.js `v24.13.1`.
- Installed package versions: `marked 14.1.4`, `sharp 0.35.5`, `docx 9.8.1`.
- Word desktop: `16.0.20430.20092`; Office Click-to-Run platform `x64`; exact update-channel ID `492350f6-3a01-4f97-b9c0-c7c6ddf67d60`.
- Word for the Web: Microsoft 365 Word at `word.cloud.microsoft`; the UI did not expose a formal service build or channel.
- Date: 2026-10-09 (Windows local time, UTC+08:00).
- Reviewer: the user self-identified as reviewer in this session; display name not recorded.

## Decisions Recorded During Builder Execution

- User selected a maximum of 4,000,000 decoded pixels per narrative image. Per-image input and sanitized-output byte bounds remain 4 MiB each. Aggregate worker/output caps were not changed.
- User selected the proposed local-file hyperlink allowlist: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, `.json`.
- Heading IDs use NFKD-normalized visible heading text, remove combining marks, lowercase, collapse non-letter/digit runs to hyphens, use `section` for an empty result, and append the next unused numeric suffix for duplicates.
- Missing internal fragments become non-links. Unsupported schemes and invalid/disallowed local paths become non-links with structured preparation diagnostics.
- Exact final-output-relative link materialization remains a destination-adapter responsibility. Prepared local links retain only a decoded relative path and `document-directory` base marker; no machine-specific absolute source path is stored in the returned narrative model.

## Implementation

- Added `src/renderer/narrativeModel.ts` and shared path helpers in `src/renderer/reportPaths.ts`; integrated the model into `src/renderer/reportPreparation.ts`.
- Markdown uses the installed `marked` package with GFM tables and visible soft breaks. The model covers headings 1-6, paragraphs, nested emphasis, inline/fenced code, nested ordered/unordered lists, blockquotes, tables, horizontal rules, HTTP/HTTPS links, internal anchors, contained local links, PNG/JPEG images, explicit breaks, and the standalone exact `<!-- page-break -->` directive.
- CRLF is normalized to LF in the model. Fenced/inline code whitespace is preserved. Raw HTML becomes literal text. Interpolation values are restored into text and image-alt nodes only after tokenization; code and link/image destinations retain their authored expression syntax. Existing `PreparedReportItem.text` remains the current renderer input and is not changed in behavior.
- Local paths are decoded before canonical containment checks. Symlink components, missing/non-regular files, traversal outside the permitted root, unsupported extensions, and non-HTTP(S) schemes are rejected as active links. The selected local extension allowlist is applied. No local file is copied or bundled.
- PNG/JPEG input is capped at 4 MiB and 4,000,000 decoded pixels per image. Inputs are content-sniffed, checked against their extension, rejected if animated/multipage, re-encoded in the same format, and capped at 4 MiB sanitized output. JPEG is re-encoded at quality 90; metadata is stripped and EXIF rotation is applied. Nonempty alt text is required. `fitNarrativeImage` calculates proportional dimensions without upscaling.
- Destination renderers do not consume the new model in Sprint 066. No PDF/DOCX/HTML renderer, CLI/destination, desktop worker/service, chart model, preview/RPC, or iframe code was changed.

## Exact Verification

- `bun test tests\renderer.test.ts tests\reportPreparation.test.ts tests\reportPresentation.test.ts tests\reportPdf.test.ts tests\reportDocx.test.ts` — passed; 36 tests, 0 failures, 240 assertions.
- `bun run build` — passed (`tsc`).
- The focused tests cover Markdown structure, LF/CRLF equivalence, soft and hard breaks, nested formatting/lists, table and blockquote nodes, inline/fenced code whitespace, raw HTML and interpolation safety, page-break behavior inside/outside code, deterministic heading IDs, valid/missing internal links, external/local links, path containment, unsupported targets, PNG/JPEG sanitization, EXIF stripping/orientation, no-upscale dimensions, source/output byte caps, and the 4,000,000-pixel threshold.
- `examples/kitchen-sink.pdf` was not opened for writing or modified. SHA-256 before and after: `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.
- The test suite exercises current report/presentation behavior, including PDF chart rendering and captured measurement/table values. No chart semantics were changed.

## Windows Word Viewer Evidence

- Created a disposable DOCX titled `sprint066-word-viewer-probe.docx` with one relative hyperlink to `./sprint066-companion.txt`; the companion contained only non-sensitive test text.
- Word desktop was launched with that file. The reviewer confirmed it opened without a repair warning and that clicking the relative TXT link opened the companion without a prompt. This is evidence for that single relative TXT case only; no broader file-type or trust-policy conclusion is drawn.
- Signed into Word for the Web as the reviewer and used its “Upload a file” action for the same probe. The document loaded without a viewer prompt. Word's exposed hyperlink target was `https://./sprint066-companion.txt`, not a source-relative file target. The link was not clicked because the target had been transformed into a malformed HTTPS URL. The web UI exposed no formal application build/channel.
- After review, the uploaded web copy was moved to its Recycle Bin using Word's “Delete this file” confirmation. After the reviewer closed the desktop probe, the local DOCX and companion file were removed from the session artifact folder.
- No trust prompts were bypassed. The web observation does not prove local-file opening or behavior in Word web. The web-service version and additional local target types remain evidence residuals.

## Residuals Carried Forward

- Owner: destination sprint builders / Lead Developer — decide and verify final-output-relative link materialization in PDF/DOCX/HTML adapters, preserving the source base independently and avoiding temporary atomic-write paths.
- Owner: Lead Developer / reviewer — obtain a formal Word for the Web build/channel if required and disposition the observed relative-link mapping. Do not infer it from browser or package metadata.
- Owner: Sprint 069 Builder / Lead Developer — retain numeric line-axis, multiple-unit-axis, null/empty chart, and native Word fidelity residuals. No chart implementation is authorized by Sprint 066 completion.
- The acceptance closes Sprint 066; no additional authorization for later sprints was stated. Follow the master-plan dependencies and obtain any required separate scope authorization.
- No aggregate cap, dependency/lockfile, release, publication, platform certification, or V0.11 completion change is authorized or implied.
