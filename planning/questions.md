# Planning Questions (Sprint 002)

## V0.4 Sprint 025 Questions To Resolve

- What exact configuration schema/version and validation behavior should `.openamx/project.json` and ignored `.openamx/local.json` expose, including unknown keys, missing files, permissions, and private-path redaction?
- Which typed RPC response/status model prevents stale successful results from being shown after a newer run fails or is superseded, and how are cancellation/request ordering handled?
- What bounded result summary can the UI show without exposing unrestricted evaluated objects or input file contents through the webview?
- How should desktop destination selection and conflict handling coordinate HTML/PDF safe writes with existing JSON/CSV output semantics and project-root-relative paths?
- Which native build/launch prerequisites and exact owner checks are available on macOS 14+, Windows 11+, and Ubuntu 24.04+, and what remains open if Hutch/package commands continue to fail?

Resolve these during Sprint 025 or record explicit Lead Developer decisions before implementation; do not infer official platform acceptance from WSL2/Linux evidence.

## V0.4 Sprint 025 Builder Resolutions and Residuals

- Implemented strict version-1 JSON configuration with only `version` and `inputs` keys. Missing files are empty configuration; malformed JSON, unknown keys, invalid mappings, and project paths outside the canonical root are diagnostics. Project values must be relative. Local values may be absolute or root-relative and are never returned to the webview; POSIX local config must not grant group/other access. Per-run mappings override local, then project. Core validation remains aggregate by default or fail-fast when selected.
- RPC results use bounded structured diagnostics and a summary capped at 100 bindings. Declared input names are excluded; strings are capped at 500 characters, lists become item counts, and records become a kind label. The UI invalidates run/preview state when buffer or input settings change and ignores late replies; no execution cancellation is claimed.
- HTML/PDF destinations are confined to the canonical project root, require existing parents and exact lowercase extensions, reject symlinks and entry/input conflicts, and preserve prior files on analysis/preparation failure. HTML uses atomic replacement; PDF reuses the shared adapter and atomic writer.
- Official owner verification remains unresolved/unavailable: this workspace reports Ubuntu 24.04.4 LTS on Microsoft WSL2, not native Ubuntu. macOS 14+, Windows 11+, and native Ubuntu 24.04+ remain open release gates; WSL2 evidence is not substituted.
- The available result summary and configuration schema are implementation choices for Sprint 025 acceptance, not changes to the language contract. DOCX remains optional/unimplemented. License selection and Marketplace publication remain deferred.

## V0.4 Sprint 024 Resolutions

- RPC payloads use discriminated `{ ok: true, ... }` / `{ ok: false, error }` responses. Document text is bounded at 2,000,000 characters and preview HTML at 8,000,000 characters; diagnostics are source-located and completions are bounded display strings.
- Session state stores a canonical project root, file-backed entry path, current text, disk SHA-256 revision, dirty flag, and conflict flag. Save compares the current disk revision with the revision observed at open and refuses silent replacement.
- Project listing recursively returns only contained regular `.amx` files, skips dot/local/generated paths and symlinks, and all open/save candidates are canonicalized through the main-process containment check. Relative UI paths resolve from the selected project root.
- The lightest editor surface is a source-owned Vue textarea with AMX-aware formatting, static diagnostics, scoped keyword completion, dirty/save controls, and a sandboxed HTML `srcdoc` preview. Core parser, formatter, checker, loader, and renderer APIs remain shared; no VS Code provider replacement or duplicated evaluator was added.
- Verification uses direct desktop checks where Hutch is blocked. Hutch package preparation/build/dev behavior and persistent native window evidence remain Sprint 020 residuals; WSL2/Linux evidence does not claim macOS, Windows, or native Ubuntu release acceptance.

## V0.4 Sprint 024 Questions To Resolve

- Which typed RPC payload limits and structured error/status forms are sufficient for document text, HTML preview, diagnostics, project listings, and save conflicts without exposing arbitrary file handles or evaluation hooks?
- Which editor surface provides reliable AMX syntax highlighting and completion in the isolated Vue app without duplicating the core parser or importing the VS Code host?
- How should project/session state represent canonical root, current entry URI, dirty text, disk revision, save conflict, and an untitled/import-requiring limitation across open/save/reload transitions?
- Which safe file listing rules should cover ignored files, `.openamx/local.json`, generated outputs, symlinks, local modules, and user-selected save-as destinations while preserving V0.3 entry-root containment?
- Which direct desktop typecheck/web/native/host checks are available after the Sprint 020 Hutch residual, and how will Sprint 024 record the exact boundary between verified Linux evidence and unverified official targets?

Resolve these during Sprint 024 or record explicit decisions before implementation; do not widen webview capabilities or infer cross-platform acceptance.

## V0.4 Sprint 023 Builder Resolution

- pdfmake 0.3.11 runs in the root Bun pipeline without a browser runtime. The adapter uses the package-resolved local Roboto files and denies URL access; no remote assets or telemetry are used.
- Roboto redistribution evidence is now recorded: the authoritative Google Fonts Roboto repository license is Apache 2.0. The installed pdfmake package contains only its MIT package license beside the fonts, so a shipped artifact must carry the Apache notice; this repository does not claim Marketplace/legal approval.
- The shared adapter boundary is independent of CLI orchestration: Sprint 024/025 can pass an evaluated document/environment or main-process prepared request to `preparePdfReport` and `serializePdfReport` without re-reading or re-evaluating.
- Remaining unverified checks are explicitly non-blocking limitations for this Linux/WSL2 Builder environment: permission-denial simulation, native Ubuntu/macOS/Windows acceptance, PDF/A/tagged accessibility, exact byte identity, and pixel parity.

## V0.4 Sprint 023 Questions To Resolve

- Are pdfmake 0.3.11's production Bun API and required local font assets compatible with the repository's root and future Electrobun main-process packaging without adding a browser runtime?
- Can redistribution terms for the proof's bundled Roboto fonts be verified from authoritative package/font sources? If not, which approved local fonts replace them, and how are their licenses recorded?
- Which report-model representation best preserves narrative/source/view placement, explicit page breaks, repeated table headers, static charts, and textual chart data without duplicating renderer semantics?
- Which deterministic PDF properties can be asserted reliably with the selected engine, and which visual/layout/accessibility limitations must remain explicit?
- How can destination canonicalization, symlink rejection, input/module conflict checks, same-directory temporary writes, atomic rename, and cleanup be tested portably in the current Linux environment?

Resolve these during Sprint 023 or record a concrete Lead Developer decision; do not silently ship unverified fonts, a hidden browser fallback, or weaker no-write behavior.

## V0.4 Sprint 022 Builder Completion

- No blocking contract questions arose. The existing V0.4 specification was sufficient for source placement, captured snapshots, table interaction, chart alternatives, escaping, and editor scope.
- No new dependency was selected. Inline assets keep reports offline and deterministic; Sprint 023 may consume the static presentation/data boundary without inheriting browser interaction state.
- Browser interaction was verified on the available Linux integrated browser only. Cross-platform print rendering and visual metrics remain open for later release-owner checks, not silently passed by this sprint.
- Sprint 020 desktop residuals remain explicit: Hutch scripted prepare/build/dev reliability and persistent WSL window verification were not rerun or claimed as passed.

## V0.4 Sprint 020 Questions To Resolve

- What exact declaration and view-expression syntax will represent tables and charts, and how will declarations be visible across executable blocks while emitted views retain source-order placement?
- Which typed scalar-list and record-list forms are supported? How are columns, field bindings, chart series, labels, axis roles, ordering, and invalid/missing values expressed and checked?
- What are the deterministic table/chart semantics for empty values, sorting, filtering, pagination, accessibility labels, escaping, and static print fallbacks? Which chart types share a common data contract, and what role/type restrictions apply to scatter and line charts?
- How do visualization declarations participate in static-check activation, source-order evaluation, final-environment interpolation, diagnostics, and the existing visible AMX source listing without changing V0.3-only documents?
- What exact PDF CLI and desktop entry points, format constraints, destination conflict/path rules, write guarantees, pagination defaults, and actionable failure diagnostics are required? Which local/offline engine best satisfies them, and what guarantees/limitations does its proof demonstrate?
- Does the required Electrobun + Vue + shadcn-vue stack build and run with Bun-backed main-process integration in this environment? Which exact versions and native prerequisites are proven, and what evidence would justify an alternative?
- Can current-buffer execution reuse the core pipeline while resolving local imports and configured CSV/JSON mappings without stale-file execution or weakening path containment and validation? If not, does a bounded main-process CLI invocation preserve the required behavior?
- What typed RPC operations and payload boundaries are necessary for editor text, diagnostics, preview/run, input mapping, and exports while keeping filesystem and evaluation authority in the main process?
- What project-default format, local override location, per-run override precedence, path base/canonicalization rules, and safe-write behavior satisfy portability without leaking machine-private paths?
- Does the export spike justify Sprint 026 DOCX, and what concrete editable-content acceptance is feasible without threatening PDF and desktop must-haves?
- Which platform/runtime/build dependencies can be verified now, and what exact checks must the release owner perform later on macOS 14+, Windows 11+, and Ubuntu 24.04+?

These are Sprint 020 contract/evidence questions, not permission to defer decisions into feature implementation. Resolve each in the V0.4 spec or record a concrete Lead Developer scope decision. Do not downgrade a must-have without approval.

## V0.4 Sprint 020 Clarifications

- **Syntax and declaration visibility:** `table name = table(binding) { ... }`, `chart name = kind(binding) { ... }`, and top-level `show name` are specified in `docs/language-spec-v0.4.md`. Declarations are entry-module-only, become visible in source order across executable blocks, and do not emit until shown. Each `show` snapshots the current binding and emits at that fence position.
- **Supported shapes and bindings:** Tables require typed record lists with scalar/nullable-scalar columns. Bar/column and line charts support typed record lists or scalar number lists with the required field roles and optional matching labels. Scatter is typed record-list-only with numeric x/y and optional string grouping. Unsupported types/options and nullable record elements fail static checking.
- **Ordering, invalid values, and empty states:** Table input order is initial and stable-sort ties preserve source order; nulls sort last. Chart categories, points, and series preserve specified input/declaration order. Numeric nulls create gaps or omit scatter points; other invalid values fail validation. Accessible empty/no-match states and static text/value representations are required.
- **Activation, execution, placement, and compatibility:** V0.4 syntax activates complete-graph parse/link/check before input loading/evaluation/output. V0.2/V0.3-only documents remain unchanged. Views emit after the existing escaped source listing at each `show` fence; narrative order and final-environment interpolation remain intact. V0.3 module/input/output semantics are preserved.
- **PDF entry points and paths:** CLI is `openamx export pdf <input> --out <path>`; desktop uses a typed main-process export request. PDF uses A4 portrait, 18 mm margins, page numbers, explicit breaks, text headings/tables, and static charts. Destination must be explicit `.pdf`; paths resolve from CLI cwd or desktop project root, parents must exist, input/module conflicts and symlinks are rejected, and temp-file-plus-atomic-rename preserves an existing destination on failure.
- **PDF engine:** pdfmake 0.3.11 is selected for Sprint 023 based on offline Bun/Linux evidence. Chrome 152.0.7977.82 was exercised but adds an independently versioned browser and produced different pagination. Neither proof claims exact visual parity; limitations are recorded in the spike report.
- **PDF font licensing follow-up:** pdfmake package metadata declares MIT, but its installed package does not include a separate license file with the bundled Roboto fonts. Sprint 023 must verify redistribution terms or use approved fonts before production embedding.
- **Electrobun/shadcn ownership correction:** Electrobun SDK aliases remain generated under `.hutch/devkit`; shadcn component/helper aliases use `@/` and source-owned files under `src/mainview`. The direct typecheck and Vite build pass after this correction. Hutch prepare's traced config loading does not access shadcn components and stalls after serializing the valid Electrobun config, so the command-path issue is separate.
- **tsconfig ownership:** The app tsconfig now explicitly maps only the Electrobun SDK API entrypoints into `.hutch/devkit`, maps `@/*` to `src/mainview/*`, and does not inherit Hutch's generated tsconfig/baseUrl. Direct TypeScript validation passes, but Hutch prepare still stalls, so tsconfig inheritance is not the remaining cause.
- **Electrobun native proof:** Ubuntu runtime libraries now resolve. Direct launch of the Electrobun dev bundle under Bun 1.4.0 produced a 720x520 X11 window and logged typed webview-to-main RPC requests with `LIBGL_ALWAYS_SOFTWARE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1`. The app exited cleanly later; screenshot/persistent-session proof is unavailable. Hutch prepare/build/dev package commands still time out, so keep the Sprint 020 gate open for review; no framework change or must-have reduction is adopted.
- **Unsaved buffers and RPC:** A file-backed entry path plus in-memory entry text reuses `parseDocumentText` and the existing loader. Local imports retain canonical entry-root containment; configured CSV/JSON mappings retain validation and original source locations. Webview RPC is typed and payload-only; future open/save/module/input/evaluation/export operations stay in the main process. Untitled execution with relative resources must first receive a project location.
- **Project config and precedence:** Portable defaults are `.openamx/project.json`; machine-local paths go in ignored `.openamx/local.json`; precedence is per-run override, local override, then project default. Relative desktop paths use project root; CLI V0.3 path bases remain unchanged. Local data paths are main-process-only and no secrets or private overrides enter shared config.
- **DOCX:** The export spike did not test editable DOCX. Keep it a non-blocking stretch with semantic editable text/tables and permitted chart images; no DOCX work is authorized by this sprint.
- **Platforms and prerequisites:** The available host is Ubuntu 24.04.4 under WSL2, not a native release-owner runner. GTK 3.24.41 and the WebKitGTK 4.1, JavaScriptCoreGTK 4.1, Ayatana AppIndicator, and librsvg runtime packages are now present. Native Ubuntu 24.04+, macOS 14+, and Windows 11+ build/launch checks remain explicitly unverified.

All contract questions have an adopted specification rule. The Electrobun must-have remains in scope. Lead Developer's Sprint 020 Option 2 disposition closes that sprint's gate for Sprint 021 while preserving Hutch scripted-command and persistent-window verification as explicit residuals.

## V0.4 Sprint 021 Contract Clarification (Resolved)

- Lead Developer selected `AMX4003` for a runtime mismatch between scalar chart values and their `String[]` labels. Validate at `show`, before rendering or output writes, and identify the view and labels option location. This is a runtime typed-data validation diagnostic, not a static type error.

## V0.4 Sprint 021 Builder Completion

- No blocking contract questions remain. The approved `AMX4003` clarification is reflected in `docs/language-spec-v0.4.md`.
- Root verification on 2026-09-29: `bun run build` passed; `bun test` passed (176 tests, 710 assertions, 0 failures); `git diff --check` passed. Focused parser/checker/runtime/module/CLI no-write checks also passed.
- Sprint 022 receives only typed ordered emission snapshots; interactive/static HTML and editor work remain deferred. Sprint 020's Hutch package-command and persistent-window residuals remain explicit and do not become passed by this Sprint 021 completion.

## Assumptions Made (clearly marked per builder rules)

- **Expression placeholder for lets in Sprint 002**: The requirements state "capture identifier name and the raw expression text (or a minimal ExpressionNode placeholder)". Full expression parsing is explicitly out of scope (Sprint 003). 
  - Assumption: We will implement minimal scaffolding in `parseExpression.ts` supporting only atomic cases (number literals, string literals, boolean literals, simple identifiers). 
  - For any RHS that is not a simple atomic (e.g. contains operators like `a + b`), during Sprint 002 the splitter will produce an `IdentifierNode` whose `name` holds the raw RHS text as a placeholder. This satisfies the `expression: ExpressionNode` type contract on `VariableDeclarationNode` without implementing any operator/Pratt logic.
  - This placeholder approach will be replaced in Sprint 003; no tests in this sprint rely on complex expressions being correctly structured.
  - Recorded here so future sprints know this was temporary scaffolding.

- **Malformed let lines**: If a line starts with `let ` but does not match `let <valid-id> = <expr>`, the statement splitter will throw a descriptive Error (e.g. "Malformed let declaration..."). This fulfills "do not silently ignore". Full AMX error codes + diagnostics objects are out of scope for this sprint (only basic error handling for front matter is called out in acceptance). Tests for this sprint focus on happy paths + front matter errors.

- **SourceLocation granularity**: Per blueprint, "Column precision can be basic." We set `column: 1` for all nodes in this sprint. Line numbers are accurate.

- **parseDocument API**: It reads from disk (per requirements) so it is `async`. Lower level `parseFrontMatter(content: string)` and `parseStatements(body: string)` are pure and used directly by tests to avoid temp files for most cases.

- **Narrative whitespace**: Empty lines and paragraph structure inside narrative are preserved exactly (by collecting original lines). Only `let ...` lines are omitted.

- **Front matter edge cases**: We handle absent, empty `---\n---`, simple key/values. Complex YAML (anchors, tags) not required for v0.1. Malformed YAML throws Error with message (tests expect clear indication).

- **Identifier rules**: Strictly case-sensitive. Regex: starts with letter, followed by letter/digit/_ . Matches spec examples.

No other ambiguities found in the sprint artifacts. If new questions arise during implementation they will be appended here before proceeding.

## Open Questions (none currently blocking)

## V0.2 Sprint 007 Clarifications

- Resolved the master-plan question about newline/semicolon behavior: newlines are the only statement and match-arm separators; semicolons do not separate either construct.
- Resolved match-arm syntax and placement: `case <literal> => <expression>` and exactly one `default => <expression>`; default is fallback and may appear at any position; cases are evaluated in source order.
- Resolved fence and source-location rules in `planning/decisions.md` and Sprint 007 requirements. No blocking language-contract questions remain for the Builder handoff.
- The remaining implementation details belong to their assigned later sprints; do not treat them as open requirements for Sprint 007.
- Sprint 007 input check: `.agents/main.md` and all requested planning/sprint inputs were present. `docs/language-spec-v0.2.md` was created as the requested sprint deliverable; there were no missing referenced inputs to carry forward.
- Verification deviation: existing evaluator and renderer test helpers used `parseStatements` as a mixed bare-let/narrative document splitter. Once it became the declaration-only code-block parser, those helpers failed. Their test-only fixture construction now builds the same lower-level AST directly; production parsing remains fenced-only, and runtime/renderer code is unchanged.

## V0.2 Sprint 008 Clarifications

- The authoritative V0.2 grammar had `for` only as a statement despite defining expression-form loops in prose. Resolved by adding `ForExpression` to the grammar: expression-context loops require exactly one `return expression`; statement-context loops contain none.
- The return may appear among ordinary loop-body statements; statements after it still execute. It records this iteration's result and never exits the loop early.
- Only the iterator is loop-scoped. It shadows and restores an outer binding, including on evaluation failure; other declarations and mutations use and persist in the caller-provided shared environment.
- No blocking questions remain for the Sprint 008 Builder handoff. `match` remains reserved for Sprint 009; whole-document multi-block evaluation/rendering remains Sprint 010.

## V0.2 Sprint 008 Builder Completion

- No blocking ambiguities or contract deviations arose during implementation. The grammar clarification for expression-form loops remains consistent with the approved Sprint 008 requirements and decisions.
- Acceptance coverage includes both undefined assignment operators, ascending/descending/equal and invalid ranges, list/range statement loops, nested expression-loop use, exactly-one-return validation, empty expression loops, continued side effects after return, iterator restoration after success and failure, shared loop-body declarations/mutations, invalid iterables, and the Sprint 007 executable-fence boundary.
- Verification: focused `bun test tests/parser.test.ts tests/evaluator.test.ts` passed (70 tests); `bun run build` passed; full `bun test` passed (81 tests, 198 assertions). No implementation deviation to carry forward.
- `match` remains Sprint 009, and document-wide multi-block execution/rendering remains Sprint 010.

## V0.2 Sprint 009 Clarifications

- Resolved match cardinality: exactly one default is required; case arms are optional, making a default-only match valid. The default may occur at any arm position.
- Match selection uses strict type-and-value equality, evaluates the scrutinee once, checks cases in source order, selects the first match (including duplicate literal cases), and evaluates only the selected branch.
- Negative numeric literal patterns are accepted; guards, destructuring, non-literal patterns, and match statements remain deferred/out of scope.
- No blocking questions remain for the Sprint 009 Builder handoff. Sprint 010 still owns document-wide execution, rendering, and final-environment interpolation integration.

## V0.2 Sprint 009 Builder Completion

- No blocking ambiguities or deviations arose. Default-only, default placement, strict typing, duplicate first-match selection, non-selected branch laziness, nested expression/loop composition, malformed arms, and original-document match/arm coordinates are covered.
- Verification: initial case/fallback/strict/location probe passed; focused parser/evaluator suites passed (78 tests); `bun run build` passed; final full `bun test` passed (89 tests, 244 assertions), including the strengthened scrutinee-once assertion. Sprint 010 remains responsible for rendering and document-wide execution.

## V0.2 Sprint 010 Clarifications

- Formatter scope is explicitly layout-only because the parser AST does not retain original token spans/string quoting. It canonicalizes line endings, indentation, blank-line edges, and trailing whitespace while preserving intra-line expression/source text; this keeps formatting semantics-preserving and avoids introducing a second expression printer.
- Document execution is a first pass over executable blocks only, sharing one environment. Rendering is a second pass in document order; all narrative interpolation observes final state, including later mutations.
- Executable source is rendered as HTML-escaped formatted code without fence delimiters, Markdown parsing, or inline interpolation. Ordinary Markdown fences and bare declarations remain non-executable.
- No blocking questions remain for the Sprint 010 Builder handoff. Sprint 011 extension work remains out of scope.

## V0.2 Sprint 010 Builder Completion

- No blocking ambiguities or contract deviations arose. Formatter idempotence, parser-valid formatted output, nested indentation, and quoted brace handling passed focused tests.
- Verification: focused evaluator/renderer tests passed (70 tests); `bun run build` passed; final `bun test` passed (96 tests, 261 assertions). Output determinism, final-environment interpolation, once-only execution, and escaped executable code are covered.
- Sprint 010 is complete. Sprint 011 extension work remains out of scope for this handoff.

## V0.2 Sprint 011 Clarifications

- Use `vscode-extension/` as the focused package; leave the root project layout and root TypeScript build configuration intact.
- Providers must parse unsaved buffers through a pure core text API. Path-based `parseDocument` remains compatible and delegates to the shared text parser; extension runtime code is Node-based and must not call Bun APIs.
- Completion scope means variables declared in preceding executable blocks or before the cursor in the current block, plus the active loop iterator. Later-only and narrative-only names are excluded.
- Publisher is `EngineersTools`. Package and locally install a VSIX, but do not publish it. Provider checks run in an Extension Development Host.
- No blocking questions remain for the Sprint 011 Builder handoff. Marketplace publication and LSP remain explicitly out of scope.

## V0.2 Sprint 011 Builder Completion

- No blocking language or provider ambiguities arose. Formatting, completion scope, parser-only diagnostics, diagnostic clearing, pure text parsing, host behavior, packaging, and local installation were verified.
- The Extension Development Host ran on VS Code 1.85.0. `xvfb-run` was unavailable, but the active `DISPLAY=:0` allowed the host to run. The host emitted environment/built-in extension DBus/API warnings; all OpenAMX tests passed.
- `vsce` warned that the repository has no license file. This did not prevent a local VSIX from being built and installed; choosing and adding the project license remains necessary before any Marketplace publication.
- Exact verification: root `bun run build && bun test` passed (97 tests, 265 assertions); extension `bun run test` passed (3 tests); installed-artifact run with `OPENAMX_EXTENSION_PATH=/home/cgamez/.vscode-server/extensions/engineerstools.openamx-vscode-0.2.0 bun run test` passed (3 tests); `CI=1 bun run package` produced the 6-file `vscode-extension/openamx-vscode-0.2.0.vsix` (61.67 KB); `bun run install-local` succeeded; `code --list-extensions --show-versions` reported `engineerstools.openamx-vscode@0.2.0`. Nothing was published or uploaded.

## V0.2 Sprint 012 Clarifications

- The transformer-strategy example will become the Power Transformer Failure Mode Analysis, and `examples/asset-fleet-risk-analysis.amx` will be the second end-to-end Risk Analysis document. Both examples collectively cover the V0.2 acceptance surface without adding domain-specific core features.
- Expected computed values must be stated in tests and checked against parsing/evaluation of the real example source; checked-in HTML is regenerated through the CLI.
- The ordered V0.3 roadmap is recorded in `planning/decisions.md` and remains explicitly unimplemented.
- The repository has no license file. Do not select or add one during Sprint 012; record that Marketplace publication remains deferred until the project makes an explicit license decision. Local VSIX packaging/install is still a Sprint 012 verification requirement.
- No blocking questions remain for the Sprint 012 Builder handoff. V0.2 must not be marked complete if a required core, example, extension-host, packaging, or local-install check is blocked or unverified.

## V0.2 Sprint 012 Builder Completion

- No blocking questions arose. The actual-file tests exposed one concrete renderer defect: interpolated markup-significant characters were not escaped before Markdown conversion. The narrow fix and regression are recorded in decisions and the V0.2 spec; no other language/extension change was needed.
- Root build and full test suite passed (100 tests, 294 assertions), all example renders and both domain CLI run outputs passed, and checked-in HTML matches renderer output. Extension host tests passed on VS Code 1.85.0 (3 from source, 3 from installed VSIX). Packaging yielded `openamx-vscode-0.2.0.vsix` (6 files, 61.74 KB); local install and installed extension listing succeeded.
- Nonblocking environmental warnings: VS Code host DBus portal/built-in Python extension API warnings; `vsce` reports a newer version and a 297.03 KB bundled JS file. `vsce` prompted to continue without a license file despite `CI=1`; local packaging required and received confirmation. The project license selection/file remains an unresolved publication prerequisite for the Lead Developer, not a Sprint 012 language or acceptance blocker. Marketplace publication was not attempted.
- Ordered V0.3 candidates, unimplemented: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring.

## V0.3 Sprint 013 Clarifications

- **Blocking ambiguity recorded before contract revision**: The V0.3 master plan requires initial field contracts for six Asset Management records, while its further considerations say their exact fields and meanings need domain review before the library is stable. It is unclear whether Sprint 013 is expected to approve normative domain semantics or only publish initial schemas. For this contract, the conservative disposition is initial structural schemas only: fields are data shape, not endorsed domain rules, calculations, or constraints. Domain approval remains a gate before treating the library as stable; this does not block Sprint 013 or the general-purpose type system.
- Resolved absence/null/default behavior: optional field presence and nullable type are separate; constructors materialize every field, and an optional no-default field is nullable and becomes `null`.
- Resolved nested CSV policy: CSV supports scalar-field record lists only; nested records/lists and JSON-in-cell encoding are rejected.
- Resolved purity: functions are non-recursive expression bodies without document captures or expression loops, making shared-state mutation impossible.
- Resolved module boundary: named local relative imports stay within the entry directory tree; DFS source-order loading evaluates each dependency once and rejects cycles.
- Resolved validation/output: aggregate validation is default with deterministic fail-fast option; only exported entry-module values are eligible for `--output name=path`.
- No blocking Sprint 014 language/type-system contract questions remain. The six Asset Management schemas are initial structural contracts only; domain review is required before they are treated as stable. The project license decision remains unrelated and non-blocking for this sprint.

## V0.3 Sprint 013 Builder Verification

- On 2026-09-29, `bun run build` passed; `bun test` passed (100 tests, 294 assertions, 0 failures); and `git diff --check` passed from the repository root. These checks confirm the documentation-only sprint did not alter the V0.2 implementation baseline.
- Markdown diagnostics reported no errors in `docs/language-spec-v0.3.md` or the four Sprint 013 artifacts. `planning/questions.md` reports three existing diagnostics in its pre-Sprint-013 V0.1 section: MD009 trailing spaces at its historical lines 5 and 6, and MD038 spacing in an existing code span at historical line 11. The new Sprint 013 question/clarification text has no reported diagnostic. Historical text was left unchanged.
- The V0.3 contract and four sprint artifacts are delivered pending Lead Developer review. Sprint 014 implementation must wait for acceptance. No changes were made to `src/`, `tests/`, `examples/`, `vscode-extension/`, manifests, generated HTML, or the V0.2 specification.

## V0.3 Sprint 014 Clarifications

- Sprint 013 is accepted for Sprint 014 planning. The V0.3 specification accidentally contains an obsolete preliminary draft before the later complete contract; Sprint 014 removes the duplicate without altering approved semantics before implementation.
- No blocking language/type-system question remains. The checker activates only for V0.3 documents/options, so strict V0.3 typing does not retroactively reject V0.2-only programs.

## V0.3 Sprint 015 Clarifications

- No blocking function/module question remains. Function call frames contain parameters and permitted callable symbols only; they do not capture module or document bindings.
- Module resolution and canonical containment are loader responsibilities. Sprint 015 exposes exports only to imports; CLI input/output behavior remains deferred.
- The initial Asset Management library remains structural and opt-in. Domain review is still required before calling its schemas stable standards.

## V0.3 Sprint 016 Clarifications

- No blocking input/validation question remains. Input declarations are entry-only and mappings always originate at the CLI boundary; imported modules remain input-free.
- CSV is deliberately shallow. Nested JSON remains supported, but nested/list CSV fields and JSON-in-cell encoding are rejected.
- Duplicate JSON keys must be rejected rather than silently overwritten. Aggregate and fail-fast diagnostics use the same deterministic input/data traversal.

## V0.3 Sprint 017 Clarifications

- No blocking output question remains. Output names select only explicit entry-module exported bindings; imports never implicitly become CLI outputs.
- Serialization completes before writes, but individual filesystem write failures may leave earlier destinations present. This is deterministic ordering, not a transaction guarantee.
- CSV stays limited to typed scalar-field record lists. Empty record lists still emit their declared headers; nested/list/scalar CSV exports are rejected.
- The Sprint 017 acceptance text groups non-finite numbers with `AMX6001`, while authoritative V0.3 spec section 11 assigns `AMX6002` to serialization failures and section 12 rejects non-finite JSON numbers. Following the handoff's spec-authoritative rule, unsupported export shapes use `AMX6001`; non-finite values discovered during serialization use `AMX6002`.

## V0.3 Sprint 017 Builder Completion

- No blocking ambiguity arose. The only acceptance/spec mismatch and its conservative, spec-authoritative disposition are recorded above; no language or serialization rule was otherwise invented.
- Final verification on 2026-09-29: `bun run build` passed; focused serializer/CLI tests passed (9 tests); integrated output/loader/regression tests passed (35 tests); `bun test` passed (156 tests across 9 files, 0 failures); `git diff --check` passed. Output ordering, no-option compatibility, explicit entry-export selection, declared-type JSON/CSV round trips, and AMX6002 write failure behavior are covered.

## V0.3 Sprint 018 Clarifications

- No blocking authoring-contract question is known. Editor checks use the current unsaved buffer for the entry document and may read local `.amx` dependencies only for explicit import visibility; they never evaluate AMX or load CSV/JSON data files.
- If a dependency cannot be resolved accurately, report the localized issue or withhold that completion; do not invent symbols. The implemented resolver requires a file-backed entry URI and confines dependencies to its canonical directory tree; untitled entry documents with imports therefore receive an unavailable-import diagnostic and no imported completions.
- Release-wide extension documentation/version metadata and Marketplace publication remain outside Sprint 018. Packaging and local VSIX installation remain required despite the unresolved license decision.

## V0.3 Sprint 018 Builder Completion

- No blocking ambiguity or contract deviation arose. The host tests prove unsaved entry-buffer checking, explicit import visibility, missing-export/cycle reporting, original-coordinate AMX3002 diagnostics, edit clearing, V0.2 behavior, and no input mapping/runtime validation in the editor.
- Verification on 2026-09-29: root `bun run build && bun test` passed (157 tests, 607 assertions); focused formatter tests passed (4 tests, 11 assertions); extension compile passed; source and installed-VSIX host suites each passed (11 tests on VS Code 1.85.0); local package/install and installed-extension listing passed. Exact artifact, commands, warnings, and limitations are recorded in `planning/state.md`.
- Local packaging continued only after confirmation of the missing-license warning. No license was selected or added, and no Marketplace upload was attempted. DBus/Python API-proposal host warnings were unrelated and did not affect tests.
- Formatter probing found an existing core parser limitation for record constructors directly in `match` arms; the formatter cannot format that composition until the parser brace scanner is corrected. No language rule was changed and no editor-only parser workaround was added in Sprint 018.

## V0.3 Sprint 019 Clarifications

- No blocking acceptance-scope question is known. The typed-data example must import opt-in schemas from a valid local module path inside its entry root; a fixture-local library copy is permissible, but a core built-in or relaxed path rule is not.
- Sprint 018's record-constructor-in-`match`-arm parser limitation needs a direct contract conformance test and explicit disposition in the V0.3 release record. Do not claim full support if that test remains failing.
- The six Asset Management shapes are initial schemas without domain validation or certified scoring rules. A project license decision/file remains a separate prerequisite for Marketplace publication; do not infer or add one during Sprint 019.

## V0.3 Sprint 019 Builder Completion

- No blocking questions arose. The typed example, exact CLI assertions, root gates, extension host gates, VSIX packaging/install, and installed-artifact host rerun passed.
- The known constructor-in-`match` limitation is a recorded residual conformance issue, not a silently accepted feature. The V0.3 release record and README identify it as unsupported.
- No license was selected or added. Marketplace publication/upload remains outside the completed local acceptance scope.

## V0.3 Sprint 014 Builder Completion

- No genuinely blocking type-system ambiguity arose; no unapproved language rule was introduced. The obsolete draft was removed without altering the later complete contract. Sprint 014 does not provide V0.3 CLI options, modules, inputs, or outputs; their activation paths belong to Sprints 015-017.
- Final verification on 2026-09-29: `bun run build` passed; `bun test` passed (106 tests, 403 assertions, 0 failures); `git diff --check` passed. Focused parser probe passed (1 test); focused checker/evaluator probe passed (5 tests, 101 assertions); combined parser/evaluator suites passed (86 tests, 316 assertions before the final cases). Markdown diagnostics were clean for the corrected specification and all four Sprint 014 artifacts. No contract deviations or blockers remain for this sprint.

## V0.3 Sprint 015 Builder Clarifications

- **Non-blocking ambiguity resolved before implementation**: Section 8 states "Imports and inputs may not appear in an imported module" immediately after describing depth-first, cycle-aware module resolution, which is only meaningful for graphs deeper than one level. Read literally, that sentence would make transitive imports and any cycle other than direct self-import impossible, contradicting the DFS/cycle-detection language in the same section. The conservative, contract-consistent disposition adopted here: only `input` is entry-module-only; `import` may appear in any module (entry or dependency), enabling genuine transitive graphs and multi-module cycles. This is recorded here rather than left silently assumed; it does not relax any other module rule (containment, explicit exports only, no re-export, isolated environments, evaluate-once).
- Imported-value mutation and redeclaration are diagnosed as `AMX5002` (not `AMX3005`), matching the acceptance criteria's explicit listing of "imported-value mutation" alongside missing/duplicate exports and collisions under the `AMX5002` family.
- No other blocking function/module/library ambiguity arose. The six Asset Management schemas were packaged verbatim from the V0.3 contract with no calculations or constraints added.

## V0.3 Sprint 015 Builder Completion

- Implemented typed pure functions (unique parameters, required return type, single-expression body, purity enforcement: no document/import capture, no recursion, no forward calls, no `for` expressions, no standard-library name shadowing), local module imports/exports (`fn`, `import { ... } from "..."`, `export` prefixing `type`/`fn`/top-level `let`), and a dedicated module loader (`src/runtime/moduleLoader.ts`) that canonicalizes paths, enforces entry-directory containment, performs source-order depth-first resolution, evaluates each module once before its importer in isolated environments, and detects cycles. Added `libraries/asset-management.amx` exporting exactly the six approved schemas with no core registration. CLI `run`/`render` now go through the loader; a document with no imports follows the identical checked/unchecked V0.2 path as before.
- Verification on 2026-09-29: `bun run build` passed; full `bun test` passed (128 tests, 462 assertions, 0 failures), including 17 new focused module-loader tests (function purity/calls, import/export visibility, diamond dependency evaluate-once-by-reference, immutable-import protection, missing/duplicate/colliding names, invalid/outside-root paths, cycle detection, and real `libraries/asset-management.amx` usage) and 5 new focused parser tests for `fn`/`import`/`export` syntax and placement. All three example renders and both example `run` commands were regenerated and are byte-identical to the committed HTML (`git status --porcelain` reported no example diffs); `git diff --check` passed. No input/output/validation/serialization/extension feature was implemented; Sprint 016/017 scope was not started.

## V0.3 Sprint 016 Builder Completion

- No blocking ambiguity or contract deviation arose. UTF-8 failures are malformed-data diagnostics; duplicate JSON keys are rejected with data-path/location context; CSV uses the specified shallow record-list mapping. Output selection and serialization remain deferred to Sprint 017.
- Final verification on 2026-09-29: `bun run build` passed; `bun test` passed (147 tests, 549 assertions, 0 failures); `git diff --check` passed. Focused parser, JSON/CSV, checker, loader, and CLI checks passed, including aggregate/fail-fast ordering, prevention of evaluation/HTML writes after invalid input, and V0.2 no-option `run` compatibility.
