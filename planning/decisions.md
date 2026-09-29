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
