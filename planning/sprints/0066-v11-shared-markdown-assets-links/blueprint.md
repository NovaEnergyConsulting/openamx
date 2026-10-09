# Sprint 066 Blueprint: Shared Markdown, Assets, and Link Model

## Approach

1. Re-read the master plan, Sprint 065 disposition, current ledgers, and exact existing call sites before implementation. Confirm the Windows host and Word desktop/web versions. Preserve the Lead Developer's 2026-10-09 scope boundaries.
2. Build a source fixture matrix for every supported block/inline node, LF/CRLF, soft and hard breaks, blank paragraphs, nested structures, raw HTML, interpolation, code whitespace, page-break markers inside/outside code, duplicate headings, and missing fragments. Assert a single normalized representation rather than guessing from one output renderer.
3. Introduce one small immutable narrative AST/normalizer at the report-preparation boundary. Keep narrative, executable source, and captured view emissions as distinct ordered items. Interpolation becomes text, never recursively parsed syntax. Leave PDF/DOCX renderer line adapters and HTML integration untouched in this sprint.
4. Define stable heading IDs and duplicate behavior in this sprint's blueprint/test cases. Preserve original visible heading text. Resolve internal fragments only to generated IDs; missing fragments are non-links. Keep any OOXML bookmark encoding as destination-adapter work.
5. Design typed link nodes for HTTP/HTTPS, internal fragments, and relative local files. Validate local authored targets from the canonical source document/project root, decode URI segments before containment checks, reject traversal/symlinks/executable types, and store a validated logical target rather than a machine absolute URI. Keep final output directory as a separate adapter input for Sprints 067/068; never use atomic temp directory.
6. Resolve the Lead Developer's pending pixel-bound decision before image reads/decoding. Once approved, enforce the accepted 4 MiB input and sanitized-output limits, content-sniff PNG/JPEG, reject animation/multipage, sanitize by re-encoding, require nonempty alt text, and expose intrinsic dimensions for proportional no-upscale adapters. Leave worker aggregate caps unchanged.
7. Test links and local-file prompts on the designated Windows Word desktop/web environment. Record exact app/channel versions and prompt text; do not disable or bypass viewer restrictions. This is link/viewer evidence only, not the Sprint 069 native-chart pilot.
8. Run focused tests, root build, and any scoped desktop typecheck required by imported shared types. Do not run unrelated full acceptance work or wire the model into destination renderers.
9. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with exact results, unresolved owners, and whether each downstream dependency is satisfied. Sprint 066 requests a separate Lead Developer disposition; it cannot authorize Sprints 067-070.

## Contract Decisions to Encode

- CRLF is equivalent to LF. Prose newlines are visible line breaks; blank lines create paragraph boundaries. Two trailing spaces or trailing backslash are hard breaks. Code preserves whitespace except CRLF-to-LF normalization.
- Raw HTML is escaped literal text. Interpolation is inserted into text nodes and escaped at destination adapters; it cannot introduce Markdown or HTML structure.
- The exact standalone page-break directive is recognized outside code only. Source text and captured view data are never recursively parsed as Markdown.
- Image byte caps are accepted by the Lead Developer at 4 MiB input and 4 MiB sanitized output per image. The 4,000,000 decoded-pixel proposal is unresolved and gates image decoding/embedding. No aggregate worker cap changes.
- Local links validate relative to the authored source; PDF/DOCX/HTML adapters later materialize URIs relative to the final output directory. Companion files remain caller-managed and must retain their relative layout.
- Preview navigation design is approved for Sprint 070 only. Sprint 066 does not alter RPC, App.vue event handling, sandbox permissions, or user-visible preview behavior.

## Risks and Stop Conditions

- If source-order interpolation cannot be represented without changing current evaluation/output, stop and request direction; AMX evaluation and snapshots are compatibility requirements.
- If a requested image exceeds the accepted byte limit, report a clear asset diagnostic. Do not increase caps to accommodate a sample.
- If Windows Word or web-viewer prompts restrict local links, record the behavior and ask the Lead Developer; do not suppress or bypass the prompt.
- If implementing shared links requires an unresolved output-base or allowlist decision, keep the source-reference model distinct and return the exact question before destination adapters.
- If any chart-model semantic conflict arises, preserve the existing shared model and defer to the separate Lead Developer decision. Sprint 066 does not map chart data or authorize chart implementation.

## Files to Update

- New shared narrative preparation/model module only if existing ownership surfaces cannot host it cleanly
- `src/renderer/reportPreparation.ts` only for the shared preparation boundary and approved asset/link resolution
- Existing `tests/renderer.test.ts` and `tests/reportPresentation.test.ts` (reuse; avoid redundant test files)
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 066 `builder-evidence.md` after execution

No PDF/DOCX/HTML renderer, desktop RPC/preview, manifest, lockfile, output cap, or iframe permission changes are in scope.
