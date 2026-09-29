# Planning Decisions

This file records key technology choices, architecture decisions, scope limitations, and other material decisions made during the project. Updated by every sprint.

## v0.1 Core Decisions (from Master Plan)

- **Package manager**: bun is the primary and required package manager for v0.1. All scripts and instructions use bun. "npm install" wording in the language spec is treated as illustrative only. Cross-package-manager support (npm, pnpm, yarn) is not tested or guaranteed in v0.1.
- **Language / runtime**: Plain TypeScript (no Langium in v0.1). Langium is deferred to Phase 10 (full mono-repo language work).
- **Parser approach**: Hand-written recursive descent for statements + Pratt parser for expressions. No parser combinators or external parsing libraries for the core language in v0.1.
- **Lists + aggregates**: Included in v0.1 scope. `sum`, `min`, `max`, `mean` must work with list literals `[1, 2, 3]`.
- **Conditionals**: Only single-line `if E then E else E` is required in v0.1. Chained `else if` is a documented limitation.
- **Power operator associativity**: `^` is right-associative.
- **Renderer output**: Full standalone HTML document for `openamx render`. Document title comes from frontmatter `title`.
- **Markdown handling**: Use `marked` (or equivalent) only for narrative blocks. `let` declarations must never appear in rendered output.
- **Diagnostics**: Basic but clear. Use AMXxxxx error codes + file/line/column for undefined variables and similar errors. Source locations should be present on AST nodes from the beginning.
- **Project layout for v0.1**: Single package at the repository root (matches language-spec-v0.1.md section 5). Full mono-repo structure is planned for Phase 10+.
- **Architecture principles**:
  - Simple, modular, general-purpose core.
  - No Asset Management domain concepts inside the parser, AST, runtime, or renderer.
  - Explicit AST.
  - Source order is preserved.
  - Parser / runtime / renderer are cleanly separated.
- **Template fixes**: The 0000-sprint-template/handoff-prompt.md contained outdated references (".continue/rules", "e-lang"). These are corrected in the Sprint 001 handoff-prompt.md.
- **Scope discipline**: Strictly limited to language-spec-v0.1.md sections 1-18. Section 4 items remain explicitly out of scope for v0.1.
- **Style**: Simple, readable, maintainable code. No premature optimization.

## CLI Library Choice

- Confirmed: `cac` is the CLI library for the v0.1 prototype.
- It is used to provide a simple, Bun-friendly command surface for `render` and `run` with built-in help and version support.
- The CLI remains a thin orchestration layer over the existing parser, evaluator, and renderer outputs.

## Language Spec Location

- Authoritative copy currently lives in `.agents/language-spec-v0.1.md`.
- Per spec suggestion it "wants" to live at `docs/language-spec-v0.1.md`.
- Decision: keep authoritative copy in `.agents/` for now (planning/controlled). A copy or symlink decision can be made later if needed. Record any move here.

## Renderer Testing Strategy

- For Sprint 005 and v0.1: renderer tests use explicit expected HTML string matches (or strong contains + structure assertions) for core cases: headings, paragraphs, bullets, let omission, {{var}} and {{expr}} substitution, and stable document shape. This choice keeps tests self-documenting, reviewable in the same file, and avoids snapshot maintenance for the small v0.1 surface.
- "Stable output" means deterministic rendering: source order preserved, no non-determinism from marked or substitution, consistent formatting for primitives.
- marked is used for narrative MD blocks after {{ }} substitution; tests assert on the final combined HTML (title, body content) rather than internal marked details.
- If the rendered surface grows substantially after v0.1, snapshot testing may be re-evaluated.

## Source Locations

- Implement `SourceLocation` on all AST nodes from the start (supports diagnostics and future IDE features).

## Future Phases (Documented for Visibility, Explicitly Excluded from v0.1)

- Full Langium-based language implementation (Phase 10)
- Mono-repo package structure
- Imports (CSV, JSON, .amx)
- Units, currency, formatting, charts, tables
- Asset-management domain libraries and ISO 55001 schemas
- Visual editor, VS Code extension
- Multi-file packs, package manager, approval workflows, knowledge graph, AI-assisted authoring

All of the above are recorded here so that Builders and future sprints do not accidentally expand v0.1 scope.

## V0.2 Language Decisions (Sprint 007)

- **Breaking migration**: Only declarations inside executable `amx` fenced blocks are code. Bare V0.1 `let` lines outside those blocks are narrative; no compatibility execution mode is provided.
- **Executable fence recognition**: The info string is case-sensitive and, after trimming whitespace, must equal exactly `amx`. Openers use a backtick run of at least three characters with zero to three leading spaces. A matching closer uses at least the opener's number of backticks and has no trailing non-whitespace text. Other Markdown fences and their contents stay non-executable narrative.
- **Statement and match-arm separators**: Newlines separate statements and match arms. Semicolons are not separators. A braced construct may span lines; expressions do not implicitly continue across a newline outside a braced construct.
- **Match syntax**: `match <expression> {` followed by one arm per line in the form `case <number|string|boolean literal> => <expression>` and exactly one `default => <expression>`, then `}`. Cases are tested in source order and the first match wins; `default` is the fallback if no case matches. The `default` arm may appear anywhere among the arms.
- **Source locations**: Lines and columns are 1-based positions in the original document, including front matter and fence delimiters. Columns count UTF-16 code units to align with TypeScript and VS Code editor positions.
- **Sprint 007 parser representation**: Document nodes preserve narrative and represent each executable fence as an `executableCodeBlock` containing raw source and statement nodes. Sprint 007 parses declarations only and does not execute blocks.
- **Sprint boundaries**: Sprint 007 establishes the complete V0.2 contract and parses fenced declarations only. Assignment, `+=`, ranges, loops, and `match` implementation are deferred to Sprints 008–009; execution, formatting, rendering, and final-environment interpolation are deferred to Sprint 010.

## V0.2 Sprint 008 Decisions

- **Mutable declaration and assignment semantics**: First `let` introduces a binding; repeated `let` updates it. `=` and `+=` require an existing binding. `+=` uses the existing V0.1 `+` semantics. Undefined reads and writes use AMX1004.
- **Ranges**: `[start to end]` evaluates finite integer bounds and yields an inclusive sequence with step one, ascending or descending; equal bounds yield one value. Explicit list literals remain unchanged. No explicit step syntax is added.
- **Loop context and returns**: `for` in statement position is a side-effecting loop with no `return`. `for` in expression position requires exactly one `return expression`, collects its value once per iteration, continues later body statements, and evaluates to `[]` for empty input. `return` is invalid elsewhere and is not an early exit.
- **Loop scope**: The iteration variable shadows an existing binding while the loop runs and is restored when the loop exits, including error exit; it is rebound on each iteration. Other declarations and mutations use the caller's shared environment and persist after the loop.
- **Loop limits**: Only lists and ranges are iterable. Nested loops, `break`, `continue`, and range steps remain unsupported. The evaluator can run a statement list with a supplied `Environment`; Sprint 010 still owns document-wide code-block order and final-context rendering/interpolation.
- **Sprint 008 boundaries**: `match` remains Sprint 009. No renderer, CLI, extension, or domain-specific changes are included.

## V0.2 Sprint 008 Implementation Outcomes

- The statement-list evaluator accepts a caller-supplied `Environment`; declarations and ordinary assignments in loop bodies mutate that environment, while `for` temporarily shadows and restores only its iterator in a `finally` path.
- Expression-form `for` is parsed as a normal expression atom, including within other expression positions such as function arguments. Its single `return` value is collected per iteration and does not stop later body statements.
- Runtime diagnostics use AMX1005 for invalid range bounds, AMX1006 for non-list loop values, and AMX1007 for a return reaching runtime outside a valid expression-loop context. Undefined reads and writes continue to use AMX1004.
- Sprint 008 did not add document-wide block evaluation, rendering changes, `match`, dependencies, or other deferred language features.

## V0.2 Sprint 009 Decisions

- **Match placement and syntax**: `match expression { ... }` is a value expression. Each arm occupies one line and uses `case <number|string|boolean literal> => <expression>` or `default => <expression>`. Negative numeric literals are accepted; non-literal patterns are not.
- **Default cardinality**: Exactly one `default` arm is required and may appear anywhere. Zero or more case arms are allowed; a default-only match is valid.
- **Selection semantics**: Evaluate the scrutinee once; compare literal cases by strict type-and-value equality without coercion; evaluate cases in source order and select the first match. Duplicate literal cases are legal and the first wins. Evaluate only the selected branch, or default if there is no match.
- **Deferred features**: Guards, destructuring/richer patterns, fallthrough, match statements, and document-wide execution/rendering remain out of scope. Match is available to the expression parser/evaluator for later Sprint 010 interpolation integration.

## V0.2 Sprint 009 Implementation Outcomes

- Match nodes retain case arms in source order and store the sole default expression and its arm location separately. Parsing rejects absent/duplicate defaults and non-literal cases at original-document locations.
- The runtime evaluates the scrutinee once, compares primitive literal values with strict equality, and evaluates only the selected branch. Sprint 010 still owns document-wide orchestration, interpolation, and rendering.

## V0.2 Sprint 010 Decisions

- **Canonical formatter scope**: Format executable block layout only. Normalize line endings to LF; trim boundary blank lines and trailing horizontal whitespace; preserve interior blank lines and all intra-line expression/source text; use zero top-level indent and two spaces per braced `for`/`match` body; keep open braces on headers and dedent closing braces; nonempty output ends with one LF, empty output remains empty.
- **Formatter contract**: Formatting is deterministic, idempotent, and must produce parser-valid V0.2 source. Do not rewrite operators, precedence, string quoting, or match-arm ordering.
- **Document execution**: Only executable code-block statements run, in source order, once each, using one shared `Environment`. Keep the `evaluateDocument` plain-object result compatible and expose/reuse one evaluator path for the renderer's final environment.
- **Render ordering**: Execute all code blocks before rendering narratives. Then assemble rendered nodes in source order; narrative placeholders use final environment state, while code blocks display their formatted source at their original position.
- **Code display**: Render block content (without fence delimiters) as an escaped `language-amx` code element. Never run Markdown, HTML interpretation, or interpolation on executable source.
- **Legacy test fixtures**: Update test helpers that turn bare V0.1 `let` lines into executable top-level nodes. Do not add compatibility behavior for bare declarations outside `amx` fences.
- **Sprint boundary**: No CLI, example, VS Code extension, or V0.3 work; extension work is Sprint 011.

## V0.2 Sprint 010 Implementation Outcomes

- `evaluateDocumentEnvironment` evaluates each executable block's parsed statements once in source order with one shared `Environment`; `evaluateDocument` still returns the plain-object bindings API.
- `renderHtml` executes the document before rendering, resolves narrative interpolation against the final environment, and emits formatted executable source as HTML-escaped `language-amx` code at its document position.
- Evaluator and renderer fixture helpers now construct executable code-block AST nodes. Bare declaration narrative and ordinary Markdown fences remain non-executable; no production compatibility path was added.
- No language/runtime contract deviations were needed.
- Verification: formatter suite passed (3 tests); focused evaluator/renderer suites passed (70 tests); `bun run build` passed; final full `bun test` passed (96 tests, 261 assertions). Repeated renders remain deterministic, and executable source is escaped before HTML assembly.

## V0.2 Sprint 011 Decisions

- **Extension architecture**: Add a focused `vscode-extension/` package; keep the root TypeScript/Bun project layout. Use direct VS Code providers, not a separate LSP server.
- **Extension runtime**: The extension runs in the supported Node-based VS Code extension host and bundles the pure core parser/formatter APIs. Bun remains the main project's package manager/runtime; extension runtime code must not call Bun APIs.
- **Editor buffer parsing**: Add a pure text-buffer parser shared with `parseDocument(path)` so providers can analyze unsaved content without disk I/O or duplicated fence recognition.
- **Provider scope**: Format only `amx` fence contents; complete keywords, standard-library functions, source-order-visible document variables, and the active loop iterator; publish parser diagnostics with document-relative source positions. Runtime diagnostics and richer language features are excluded.
- **Packaging**: Use publisher identifier `EngineersTools`; build and locally install a Marketplace-ready VSIX. Do not publish/upload during V0.2.
- **Verification**: Define extension-local install/build/test/package commands, exercise providers in an Extension Development Host, and verify local VSIX installation.

## V0.2 Sprint 011 Implementation Outcomes

- `parseDocumentText(content)` now shares front-matter and fenced-document parsing with `parseDocument(path)`; the path API still reads through Bun and delegates after reading.
- The extension bundle targets Node 18 and imports the shared parser/formatter. Bundle inspection found no Bun runtime reference. The extension engine range is `^1.85.0`, and the host suite ran on VS Code 1.85.0.
- Completion uses parsed statement order and active loop-body ranges; parser diagnostics map original 1-based UTF-16 locations to VS Code positions. Formatting adapts canonical block output to the document EOL so CRLF documents remain idempotent without touching surrounding text.
- Host-only test files use a non-Bun discovery suffix so the unchanged root `bun test` remains isolated from VS Code API tests.
- Verification passed: `bun run build && bun test` (97 tests, 265 assertions); extension `bun install`; `bun run test` (3 Extension Development Host tests); `CI=1 bun run package` (6 VSIX files, 61.67 KB); `bun run install-local`; CLI listing confirmed `engineerstools.openamx-vscode@0.2.0`. The final installed VSIX also passed all 3 host tests against a real `.amx` file; malformed front matter, bare declarations, and ordinary fences produce no extension diagnostics.
- `vsce` reported no repository license file and required confirmation to package. The local artifact was produced and installed; no license was inferred or added, and publication remains deferred pending the project license decision.

## V0.2 Sprint 012 Decisions

- **Acceptance examples**: Use `examples/transformer-strategy.amx` for the Power Transformer Failure Mode Analysis and add `examples/asset-fleet-risk-analysis.amx` for the asset-fleet Risk Analysis. Keep all domain concepts in prose and ordinary values; the core remains general-purpose.
- **Acceptance proof**: Tests parse the actual example files and assert named final values plus rendered outputs. Checked-in `.html` artifacts are regenerated by the production CLI. The examples collectively prove mutation, loops/ranges, match, visible formatted source, and final-environment interpolation after a later block mutation.
- **Documentation**: Replace stale V0.1-only README content with the V0.2 install/build/test/CLI/migration/examples/limitations/extension guide. Keep `docs/language-spec-v0.2.md` authoritative and align extension commands with the verified package scripts.
- **Ordered V0.3 roadmap**: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring. None is in Sprint 012 scope.
- **License and publication**: No license file exists; `vsce` required confirmation for local packaging. Do not infer or add a license without project authorization. Marketplace publication is outside V0.2 and requires an explicit license decision/file.
- **Closure gate**: Mark V0.2 acceptance complete only after root build/tests, both examples' end-to-end render/run checks, extension host tests, VSIX packaging, and local installation pass; accurately record any unavailable check or deviation.

## V0.2 Sprint 012 Implementation Outcomes

- The transformer FMEA uses severity [8, 6, 9] times occurrence 3 to produce [24, 18, 27], aggregate 69 and post-inspection score 60. The fleet uses inclusive levels [1 to 3] times five to produce [5, 10, 15], aggregate 30 and post-adjustment score 35. Its unmatched literal case selects the default decision. Both documents use final-environment interpolation before the later mutation block. Checked-in HTML is generated by the production CLI and compared exactly with renderer output in tests.
- Acceptance found that interpolated string values containing `<north>` were sent to Markdown unescaped, allowing computed values to inject raw HTML even though executable source was already escaped. The only runtime deviation in Sprint 012 is a one-line renderer fix escaping the substituted value before Markdown parsing. A real-file regression asserts escaped narrative/source and absence of raw `<north>`; the V0.2 spec records this clarified output contract. Core syntax, evaluation and extension behavior are unchanged.
- Root verification passed: `bun install`, `bun run build`, `bun test` (100 tests, 294 assertions), all three render scripts, and both domain example `run` commands. Extension verification passed: `bun install`, `bun run compile`, `bun run test` (3 host tests, VS Code 1.85.0), `CI=1 bun run package` (6 files, 61.74 KB), `bun run install-local`, installed extension listing (`engineerstools.openamx-vscode@0.2.0`), and an installed-VSIX host rerun (3 tests). No license was selected or added; `vsce` required a yes confirmation even with `CI=1`. Marketplace publication remains blocked on an explicit project license decision/file and was not attempted.

## V0.3 Sprint 013 Contract Decisions

- **Compatibility**: V0.3 is additive to V0.2. Existing fenced documents and no-option `run`/`render` calls retain behavior; V0.1 bare declarations remain narrative.
- **Type model**: Use primitives, named records, lists, and nullable `T?`; omit `any`, general unions, implicit nullability, and uninitialized declarations.
- **Records**: `field?: T` controls construction presence and `T?` controls nullability. Optional fields without defaults must be nullable and materialize as `null`; defaults are literal, checked, and copied per instance.
- **Purity**: Functions are typed, expression-bodied, non-recursive, and limited to parameter, earlier/imported-function, and standard-library references. They cannot capture document values or mutate shared state.
- **Modules**: Imports are explicit names from relative `.amx` paths inside the entry directory tree. Dependencies use source-order DFS, evaluate once, and reject cycles.
- **Data boundary**: Entry-only logical inputs map through repeated CLI `--input name=path`; AMX has no filesystem API. JSON is recursive; CSV is scalar-field record lists only, with no JSON-in-cell convention.
- **Validation/output**: Aggregate validation is deterministic by default; `--validation fail-fast` stops at the first ordered failure. Exported entry-module values are selected by `--output name=path`; JSON is recursive and CSV is shallow record-list only.
- **Asset library**: The six initial Asset Management records live in opt-in `./libraries/asset-management.amx`, never as core defaults.

### V0.3 Sprint 013 Contract Details

- **Checker activation**: A V0.3 declaration/construct, V0.3 module-graph feature, or V0.3 CLI option activates parse/link/type checking for the complete reachable program before evaluation. A V0.2-only document with no V0.3 options bypasses the new checker, preserving its V0.2 behavior.
- **Type compatibility**: Types are nominal for records, exact otherwise, with only non-null-to-nullable and corresponding list-element widening. Checked V0.3 operators do not use V0.2 runtime truthiness or scalar-to-number coercion. DateTime literals are contextually accepted only when valid RFC 3339 wire strings; equality preserves exact wire-string semantics.
- **Construction**: Omission is accepted for optional or defaulted fields. Defaults win when present; otherwise an omitted optional field materializes as null and therefore must be nullable. Unmarked fields without defaults are required. Literal list/record defaults are copied per construction.
- **Computed validation**: Inputs aggregate/fail-fast in deterministic declaration/data order. A computed record reports all invalid fields in declaration order in aggregate mode or its first invalid field in fail-fast mode; evaluation stops at that invalid construction in either mode rather than propagating an invalid value.
- **Static operations**: V0.2 operators/statements receive explicit types; V0.3 matching is restricted to non-null scalar cases, and standard-library signatures are fixed. Loops retain V0.2 runtime behavior; new bindings introduced only inside a loop are not definitely available afterward.
- **Module/data/output contract**: Relative slash-separated `.amx` paths are canonicalized and constrained to the entry directory tree. Inputs are entry-only. JSON rejects duplicate keys and maps recursively; CSV supports scalar record lists, with unquoted empty as nullable null and quoted empty as empty String. Output mappings select only exported entry `let` values; deterministic serialization precedes writes.
- **Diagnostics**: Stable AMX3001-3005, AMX4001-4003, AMX5001-5003, and AMX6001-6002 assignments, ordering, phase barriers, and source/data context are part of the contract.
- **Asset Management**: The six schemas are initial shape contracts only. They express no severity/likelihood scale, score formula, or other domain validation; domain review is required before the library is treated as stable.

### V0.3 Sprint 013 Builder Outcome

- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (100 tests, 294 assertions, 0 failures); `git diff --check` passed. No product implementation files were changed.

## V0.3 Sprint 014 Preparation Decisions

- **Implementation slice**: Sprint 014 owns records, typed bindings, null, record access, runtime record values, and full static checking of activated programs. Functions/modules/library, inputs/validation, and outputs remain in Sprints 015-017.
- **Checker integration**: The checker is a pure document-level phase run before existing evaluation. It activates only under the V0.3 activation rule, preserving V0.2-only truthiness and mixed-list behavior.
- **Runtime boundary**: Runtime work materializes and accesses valid record values; it does not implement file-input validation, module values, serialization, or domain constraints.
- **Contract consolidation**: The completed V0.3 specification contains a duplicated obsolete leading draft. Sprint 014 may remove that duplicate only, retaining the later complete contract text without a semantic rewrite.

## V0.3 Sprint 015 Preparation Decisions

- **Function runtime**: User functions are callable definitions evaluated through parameter-only call frames, not closures over a mutable `Environment`; this enforces the contract's capture and mutation prohibition.
- **Module boundary**: A focused loader owns all local-path filesystem access. It resolves the complete graph before evaluation, uses source-order DFS, and exposes only explicit exports to isolated importers.
- **Export scope**: Exports are needed for module visibility now; CLI output selection and serialization remain exclusively Sprint 017.
- **Asset library**: Create `libraries/asset-management.amx` as a local opt-in module containing exactly the six approved structural schemas, with no calculations or domain constraints.

## V0.3 Sprint 016 Preparation Decisions

- **Data boundary**: Input paths are parsed by the CLI and data files are read only by focused loader/validator support. Validated values enter the entry environment before evaluation; imported modules cannot declare inputs.
- **CSV implementation**: Use a proven RFC 4180 CSV parser rather than split-based parsing. Nested records/lists and JSON-in-cell remain explicitly unsupported.
- **Diagnostic behavior**: Input mapping/read failures are AMX4001, malformed JSON/CSV is AMX4002, and shape/nullability/conversion failures are AMX4003. Aggregate and fail-fast share one deterministic traversal order.
- **JSON duplicate keys**: Reject duplicates rather than accepting JavaScript parser last-key-wins semantics; retain data-path/location context whenever the parser exposes it.

## V0.3 Sprint 017 Preparation Decisions

- **Output visibility**: Only explicit entry-module exported `let` values are output-selectable. Module exports enable reuse but do not make imported/private names CLI outputs.
- **Serialization boundary**: Typed values are serialized completely in memory before destination writes. JSON/CSV formats preserve declaration-order type metadata; arbitrary object keys do not establish a CSV shape.
- **Write ordering**: `render` produces/serializes HTML and exports before writing any destination, writes HTML first, then exports in option order. Filesystem failures use AMX6002 and may leave prior writes intact.
- **CSV scope**: CSV output is limited to typed scalar-field record lists, including empty lists. Null and empty-string cells remain distinct per the V0.3 contract.

## V0.3 Sprint 018 Preparation Decisions

- **Provider architecture**: Extend the existing direct VS Code providers; reuse pure buffer parsing, canonical formatting, and static checking. Do not add an LSP or call Bun APIs in the Node host.
- **Editor import boundary**: Use read-only local dependency resolution for imported completion/checker symbols. The evaluating CLI module loader is not suitable for editor diagnostics because it can read data inputs and execute modules.
- **Editor diagnostics**: Preserve parser-only V0.2 behavior and report V0.3 type diagnostics at original-document source coordinates for activated buffers. Do not claim CLI input or computed-value validation in the extension.
- **Acceptance gate**: Exercise providers in the Extension Development Host, package and locally install a VSIX, and document the unresolved license prerequisite; defer release-wide documentation/version changes to Sprint 019.

## V0.3 Sprint 014 Builder Outcome

- The document checker is a pure, first-error, source-order pass over executable blocks; it activates for parsed V0.3 forms and runs before the shared evaluation environment is created. Independent errors may be aggregated in later work, but no runtime block runs after a static error.
- Record field declarations retain source order; constructed values evaluate supplied expressions then materialize in declaration order, creating fresh nested/list default values per instance. Direct access to nullable records is rejected; a null comparison narrows the appropriate `if` branch.
- The historical V0.2 path, executable fences, CLI, formatter, and renderer remain unchanged. The later complete V0.3 contract is retained without semantic modification; deferred function/module/input/output work was not started.
- Verification on 2026-09-29: final `bun run build` passed; `bun test` passed (106 tests, 403 assertions, 0 failures); `git diff --check` passed. No contract deviation.

## V0.3 Sprint 015 Builder Outcome

- **Functions**: implemented as typed callable definitions (`FunctionDeclarationNode`), not JavaScript closures over `Environment`. Calls execute in a fresh `Environment.createCallFrame` containing only bound parameters plus the module's shared (immutable during the call) `recordTypes`/`functions` maps. The checker verifies purity by checking each function body in an isolated `bindings` scope containing only its parameters (module/import bindings are invisible), rejecting any body containing a `for` expression, and only registering the function into the callable table after its body is checked (this single ordering rule simultaneously blocks self-recursion and forward references without special-casing either).
- **Modules**: `src/runtime/moduleLoader.ts` is the sole filesystem-access boundary. It resolves each import relative to the importing module, requires `./`/`../`-prefixed, `/`-separated, lowercase-`.amx`-suffixed paths, canonicalizes via `fs.realpathSync`, and rejects any target outside the entry file's directory (computed once from the entry's canonical path). Depth-first resolution follows import source order; a module already on the current DFS stack is a cycle (`AMX5003`, reporting the ordered path list); a module already fully resolved is reused (evaluate-once). Each module's own statements are flattened across its executable blocks preserving source order for placement/collision checks even though blocks still evaluate independently in document order during actual evaluation.
- **Exports/imports**: `checkDocument` now accepts an optional `ModuleCheckContext` (imported types/functions/bindings) and returns a `ModuleCheckResult` of only the `export`-marked declarations. The loader pre-populates each module's own `types`/`functions`/`bindings` maps with its imports before checking, which lets the pre-existing duplicate-declaration checks catch import/local collisions for free; a dedicated `immutableNames` set additionally blocks assignment to or redeclaration of an imported binding. Both are diagnosed as `AMX5002` per the acceptance criteria's explicit listing of "imported-value mutation" under that family, not `AMX3005`.
- **Evaluation order**: the loader evaluates modules in dependency-first (post-order DFS) order into per-module isolated `Environment`s; an importer's environment is seeded only with the specific exported types/functions/values it named, with value bindings pulled from the exact dependency environment that produced them (not a name-based scan), so two different import paths to the same dependency observe the identical value by reference (diamond graphs evaluate the shared dependency exactly once).
- **CLI/compatibility**: `cli.ts` `run`/`render` now call `loadEntryModule`, which for a document with no imports performs the same `checkingActivated` gate, `Environment`, and per-block `evaluateStatements` sequence as the prior direct `evaluateDocumentEnvironment` path, so V0.2-only and Sprint-014-only documents are unaffected. All three checked-in example HTML files regenerated byte-identical to the committed versions, confirming no behavior change for non-module documents.
- **Library**: `libraries/asset-management.amx` exports exactly the six schemas from V0.3 section 13, verbatim, with no calculations/constraints and no core registration; it is a normal opt-in module resolved like any other local import.
- A parser bug was found and fixed during implementation: the `export` keyword was blanked to spaces on a locally scoped `rawLine` copy without writing the change back into the shared `lines` array used by the multi-line `fn`/type collectors, causing multi-statement files to merge an exported declaration's tail with unrelated following lines. Fixed by writing the blanked line back into `lines[i]`. A second bug in the brace-balance scanner for function bodies (`findFunctionEnd`) advanced past the declaration line even when the body had no braces at all; fixed to return immediately for brace-free (single-line) bodies.
- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (128 tests, 462 assertions, 0 failures), including 17 new module-loader tests and 5 new parser tests. All three example renders/`run` commands were regenerated and reported no `git status` diff against committed output; `git diff --check` passed. No input/output/validation/serialization/extension work was started.

## V0.3 Sprint 016 Implementation Outcomes

- `csv-parse@7.0.3` is the sole new dependency and provides RFC CSV parsing with quote metadata. A focused strict JSON parser detects duplicate keys and preserves JSON Pointer/data coordinates without adding a JSON dependency.
- Entry inputs are converted and validated after full graph checking but before any module evaluation. Input declaration order and data traversal determine aggregate/fail-fast diagnostics; validated values are immutable and seeded only into the entry environment. Computed typed boundaries use the same aggregate/fail-fast policy.
- Verification on 2026-09-29: `bun run build` passed; `bun test` passed (147 tests, 549 assertions, 0 failures); `git diff --check` passed. No output selection, serialization, writes, or other Sprint 017 work was started.

## V0.3 Sprint 017 Implementation Outcomes

- Output mappings are validated against the entry check result's explicit exported bindings and retained `CheckedType` metadata. `run` continues printing its final context; `render` continues producing its standalone HTML. Both serialize every requested export before writes. Render then writes HTML followed by exports in option order. Writes are ordered, not transactional.
- JSON recursively serializes finite declared values and rebuilds records in field declaration order. CSV accepts only a list of one declared record type with scalar/nullable-scalar fields; cell escaping preserves commas, quotes, newlines, boundary spaces, nulls, and quoted empty strings. Empty record lists use declared headers.
- No dependency was added. No input validation, module/function/library behavior, renderer output, editor, or release-example work changed. CAC's absent repeated options are normalized at the CLI boundary using actual argv presence so output support does not turn absent `--input`/`--output` options into mappings.
- Verification on 2026-09-29: focused output tests passed (9 tests); integrated output/loader/regression tests passed (35 tests); `bun run build` passed; full `bun test` passed (156 tests across 9 files, 0 failures); `git diff --check` passed. See `planning/questions.md` for the acceptance/spec AMX6001/AMX6002 diagnostic-code clarification.

## V0.3 Sprint 018 Implementation Outcomes

- The existing layout-only `formatAmx` handles V0.3 type/function/import/input/export declarations, nested record constructors, composed constructor fields, and braced expressions; Sprint 018 added focused core and real-host coverage without changing language syntax or formatting semantics. A constructor directly inside a match arm remains blocked by an existing core parser brace-scanner limitation, recorded in `planning/state.md`.
- Editor module analysis is a separate read-only Node path rather than reuse of `loadEntryModule`. It uses unsaved text for the entry, canonical local `.amx` reads for dependencies, explicit export maps, and `checkDocument`; it never evaluates declarations, loads input files, or writes files.
- V0.3 completions are limited to preceding/in-scope declarations and successfully resolved explicit imports. Record fields are offered only for known record receivers. V0.2 standard completions remain available and V0.2-only diagnostics remain parser-only.
- Static/link diagnostics use core AMX codes and original source positions, including dependency source documents; stale results clear on entry edits/close. The core checker is first-error, so each analysis currently publishes one static/link failure at a time.
