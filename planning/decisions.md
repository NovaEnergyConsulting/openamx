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
