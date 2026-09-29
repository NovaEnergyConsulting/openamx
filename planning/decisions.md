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

## V0.3 Sprint 014 Builder Outcome

- The document checker is a pure, first-error, source-order pass over executable blocks; it activates for parsed V0.3 forms and runs before the shared evaluation environment is created. Independent errors may be aggregated in later work, but no runtime block runs after a static error.
- Record field declarations retain source order; constructed values evaluate supplied expressions then materialize in declaration order, creating fresh nested/list default values per instance. Direct access to nullable records is rejected; a null comparison narrows the appropriate `if` branch.
- The historical V0.2 path, executable fences, CLI, formatter, and renderer remain unchanged. The later complete V0.3 contract is retained without semantic modification; deferred function/module/input/output work was not started.
- Verification on 2026-09-29: final `bun run build` passed; `bun test` passed (106 tests, 403 assertions, 0 failures); `git diff --check` passed. No contract deviation.
