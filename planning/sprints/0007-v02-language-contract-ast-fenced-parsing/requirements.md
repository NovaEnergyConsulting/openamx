# 007 Requirements: V0.2 Language Contract, AST & Fenced Parsing

## Goal

Establish the V0.2 language contract and parsing foundation for executable `amx` fences. Only explicitly labeled `amx` fenced blocks are executable; ordinary Markdown, ordinary fenced code, and former V0.1 bare `let` lines remain narrative. Preserve front matter and source order, and define stable source-location and statement-separator rules for the follow-on language sprints.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md` (Phase 1, Sprint 007).
- Current implementation: V0.1 AST, hand-written parser, runtime, renderer, tests, and CLI.
- Current decisions: `planning/decisions.md`.
- Project status and sprint process: `planning/state.md` and the four files in `planning/sprints/0000-sprint-template/`.
- V0.2 product decisions in the approved master plan: breaking migration; shared document environment; `amx` executable fences; inline `{{ expression }}` is separate and resolved after all executable blocks; general-purpose core.

## In Scope

- Write and maintain the V0.2 language contract/specification in the project’s established documentation location, covering the syntax and semantics committed by the V0.2 master plan, migration from V0.1, source locations, and explicit non-goals.
- Define unambiguous syntax for declarations, assignment (`=`), compound addition (`+=`), inclusive ranges (`[start to end]`), `for` loops, per-iteration `return`, and `match` expressions so later sprint implementation does not need to invent language rules. This sprint does not implement features assigned to Sprints 008 or 009.
- Fix separator rules: logical statements and `match` arms are separated by line breaks; semicolons are not statement or arm separators. A braced construct may span lines. A statement occupies one logical line except for a braced construct; expressions outside braced constructs do not continue implicitly across a newline.
- Extend the AST for executable code blocks and statement forms needed by the V0.2 contract while keeping it explicit and source-located. Keep the core AST and parser independent of Asset Management concepts.
- Parse case-sensitive `amx` fenced blocks as code blocks, preserving their source order and mapping their content and diagnostics to original document coordinates. Accept a backtick fence of at least three backticks, optionally indented by up to three spaces; its trimmed info string must be exactly `amx`. Close it with a backtick fence at least as long as the opener and with no trailing non-whitespace text.
- Preserve ordinary Markdown, including non-`amx` backtick fences and tilde fences, as non-executable narrative. Do not recognize code-looking text inside those fences as executable.
- Treat every V0.1 bare `let` line outside an `amx` fence as narrative; no legacy execution mode is added. Inside an `amx` block, parse the declaration form already supported by the V0.1 expression parser; later statement forms are implemented in their assigned sprints.
- Preserve front matter as metadata and keep inline `{{ expression }}` distinct from executable blocks. Do not evaluate or render inline expressions in this sprint.
- Add focused parser/AST coverage for fence boundaries and labels, ordinary fences, bare-let migration, front matter/narrative preservation, and document-relative locations, including malformed/unclosed executable fences.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` for the prepared Sprint 007 contract and active handoff.

## Out of Scope

- Implementing assignment, `+=`, ranges, loops, loop scoping/returns, or `match` parsing/evaluation; these belong to Sprints 008 and 009.
- Executing code blocks, sharing a runtime environment, formatting code, rendering blocks, or changing final-environment interpolation behavior; these belong to Sprint 010 and later.
- VS Code extension work, examples, release packaging, Marketplace publication, or V0.3 roadmap candidates implementation.
- Asset Management syntax, standard-library/domain additions, or domain-specific types in the core.
- A legacy mode that executes bare V0.1 declarations.

## Constraints

- Keep TypeScript/Bun, the existing hand-written parser, and the root project layout. Do not add a parser framework or dependency.
- Preserve V0.1 behavior only where compatible with the explicitly breaking V0.2 migration; update affected tests rather than retaining bare-let execution.
- The `amx` info string is case-sensitive and must be the complete trimmed info string; labels such as `amx demo` are not executable in this sprint.
- Source line and column coordinates are 1-based and refer to the original document including front matter and fence delimiters. Columns count UTF-16 code units, matching TypeScript/VS Code editor positions. AST nodes and parse diagnostics within a block point to the corresponding original document position.
- An unclosed executable fence is a clear parse error located at its opening fence. An ordinary unclosed Markdown fence remains ordinary Markdown and is not an executable-block error.
- Keep parsing deterministic and preserve narrative text and source order outside executable blocks. Do not silently discard lines.
- Keep `bun run build && bun test` green. Run the narrow parser tests first after implementation, then the project build and complete test suite.
- Follow only this sprint’s owns list in the handoff prompt; do not start implementation of later sprint behavior.
