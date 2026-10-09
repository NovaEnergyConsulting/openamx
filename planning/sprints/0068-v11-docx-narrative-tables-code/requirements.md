# Sprint 068 Requirements: Native DOCX Narrative, Tables, and Code

## Goal

Render the shared V0.11 narrative model as readable, native, editable Word content: paragraphs and runs, headings/bookmarks, lists, links, tables, images, rules, and code. Preserve the existing DOCX report identity, order, emitted data, charts, and atomic export behavior.

## Entry Gate

- The V0.11 master plan gives Sprint 068 a dependency on Sprint 066 only; Sprint 066 is ACCEPTED / CLOSED. Sprint 067 is also ACCEPTED / CLOSED in the current repository, but its closeout does not authorize Sprint 068.
- Obtain explicit Sprint 068 implementation authorization and approval of the concrete file-by-file code plan before source or test edits. If either is absent, stop before those edits.
- Sprint 065 / 066 recorded Word desktop evidence for one relative TXT link without a prompt, but Word for the Web exposed the relative target as `https://./sprint066-companion.txt` and it was not clicked. Recheck the intended DOCX behavior; record exact OS/Word versions, channels when available, reviewer, actions, and prompts. Never bypass viewer restrictions or reinterpret the observed web target as a valid local link.
- Sprint 067's known validation residuals remain in force: root `tests/editor.test.ts:73`, root `tests/examples.test.ts:43`, desktop `tests/rpc-contract-check.ts:74`, and no PDF visual/actual viewer-open evidence. Do not repair these unrelated failures in Sprint 068. Record any rerun results and distinguish known failures from regressions.
- Sprint 069 remains separately gated on faithful native chart behavior and the recorded chart-semantics residuals. Sprint 068 must not implement, redesign, or authorize native chart work.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (scope and compatibility authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 065 contract/evidence and Sprint 066 accepted model/evidence, especially the link-target and Word viewer observations
- Sprint 067 PDF implementation/evidence for the final-output-relative link pattern and known closeout residuals
- `src/renderer/narrativeModel.ts`, `src/renderer/reportPreparation.ts`, and `src/renderer/reportDocx.ts`
- `src/runtime/docxDestination.ts`, DOCX CLI flow in `src/cli.ts`, and desktop DOCX worker/service flow
- `tests/reportDocx.test.ts`, `tests/docxCli.test.ts`, `tests/reportPresentation.test.ts`, and relevant desktop job/export tests
- `examples/kitchen-sink.amx` as a read-only regression input; the supplied `examples/kitchen-sink.pdf` remains read-only

## In Scope

- Replace the DOCX adapter's line-based narrative conversion with a typed traversal of the prepared shared narrative AST. Do not parse Markdown a second time.
- Produce native editable Word paragraphs and `TextRun`s for headings 1-6, paragraphs, nested strong/emphasis, inline code, visible line breaks, and links. Keep narrative text selectable and searchable.
- Represent fenced code as selectable, monospaced text while preserving authored spaces, tabs, and line breaks; use restrained built-in formatting and readable wrapping without author-facing settings or syntax highlighting.
- Map ordered and nested lists to native numbering, nested blockquotes to native paragraph structure, horizontal rules to a native document rule, and page breaks to native page-break behavior.
- Map Markdown tables to editable native Word tables with inline formatting preserved in cells. Emphasize and repeat header rows where supported, fit tables to page width, and use sensible row-splitting behavior.
- Map shared heading IDs to deterministic, valid Word bookmarks. Map valid internal links to those bookmarks; missing fragments remain non-links. Preserve duplicate-heading identity without changing the shared model's IDs.
- Map validated external HTTP/HTTPS links to external hyperlink relationships. Materialize validated local links as relative DOCX hyperlink targets based on the final validated `.docx` destination, not the source document directory alone or an atomic temporary path.
- Pass source-document and final-output context through CLI and desktop DOCX export. Desktop destination context must originate from the host-validated export request and must not bypass existing overwrite, conflict, or atomic-commit checks.
- Embed narrative PNG/JPEG assets from the already-sanitized shared-model data only, preserve alt text, and fit images proportionally within the document page width without upscaling. Do not fetch remote resources or reread author paths.
- Keep interpolation inert text, raw HTML literal/inert, and emitted table cells/source/view items distinct from narrative Markdown. Preserve metadata, footer, title, report order, source visibility, emitted values, nulls, and measurement display semantics.
- Preserve the current chart path and meaning exactly. Chart implementation remains out of scope for Sprint 069.
- Add package-level and export-flow tests for editable structures, relationships/bookmarks, pagination, safe paths, and atomic failure behavior. Review representative output in actual Word applications and record application evidence.

## Out of Scope

- Native Word chart implementation, changes to existing chart image/table output, chart-model semantics, or any decision resolving numeric-axis, multiple-axis, null/empty, or Word-persistence residuals.
- PDF renderer work; standalone HTML or desktop-preview changes; preview RPC, navigation, or iframe changes.
- AMX syntax/evaluation, shared narrative model semantics, report preparation, captured snapshots, emitted values, measurement semantics, report identity/order, or atomic destination behavior.
- Word templates, merged-cell features, syntax highlighting, new author styles/settings, macros, DOCX import/round-trip, automatic companion copying, remote images, `mailto:`, new dependencies, lockfiles, fonts, or output-cap changes.
- Unrelated historical test failures, general document redesign, release/publication work, and V0.11 closeout.

## Constraints

- Use existing `docx` dependency/API and shared-model types. The package version remains unchanged; no dependency or lockfile edits are authorized.
- Local image and link validation belongs to shared preparation. DOCX serialization consumes validated targets and sanitized image data; it must not expand the allowlist or trust authored URLs/paths.
- Keep source-relative validation separate from final-output-relative DOCX target construction. Use the final destination path provided by the CLI or validated desktop service; never use the atomic temp path or emit a machine-specific absolute target.
- Preserve allowed local-link types from Sprint 066: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, and `.json`. Do not copy or bundle companion files.
- Test XML/package structure and actual Word behavior separately. Package inspection alone is not Word compatibility evidence. Record blocked checks honestly; do not treat Word web's malformed relative-target mapping as a pass.
- Preserve Sprint 067's known root/desktop failures as residuals if they reproduce unchanged. Fix only a failure shown to be caused by Sprint 068 changes.
- Record exact commands, test counts, app/runtime versions, actions, prompts, visual observations, and residual owners in Sprint 068 `builder-evidence.md`. No release or V0.11 completion is implied.
