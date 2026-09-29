# 010 Requirements: Canonical Formatter & Renderer Integration

## Goal

Complete the V0.2 parse → execute → render pipeline. Implement an idempotent canonical layout formatter for executable `amx` block source; evaluate executable blocks in document order using one shared environment; render each executable block as escaped, formatted source code; and resolve narrative `{{ expression }}` against the final environment after all blocks have executed.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md`, Sprint 010.
- Authoritative language contract: `docs/language-spec-v0.2.md`.
- Completed Sprint 007 parser/fence contract, Sprint 008 mutation/range/loop runtime, and Sprint 009 match parser/evaluator.
- Current parser, AST, diagnostics, evaluator, renderer, CLI, and focused tests under `src/` and `tests/`.
- Sprint 007–009 completion records in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.

## In Scope

- Add a canonical formatter for executable `amx` source. The formatter accepts block content without fence delimiters and returns formatted source without modifying any surrounding Markdown.
- Canonical layout rules:
  - Convert CRLF and bare CR line endings to LF.
  - Remove leading/trailing blank lines and trailing horizontal whitespace; preserve blank lines between statements as empty lines.
  - Normalize indentation to zero at top level and two spaces per open braced `for` or `match` body. A closing brace dedents before output; opening braces remain on their header line.
  - Preserve the text/tokens within each nonblank logical line, including expression spelling and whitespace, rather than rewriting operator precedence, string quoting, or match-arm order.
  - Emit exactly one final LF for nonempty formatted source; empty/whitespace-only input formats to the empty string.
- Formatter output must be deterministic, idempotent, syntactically valid V0.2 source, and parseable by the existing parser. Quotes in strings must not cause their contents to be mistaken for braces.
- Add document-level evaluation that processes only executable code-block statements in source order using one shared `Environment`. Preserve the public `evaluateDocument` result as a plain object of final bindings; expose/reuse an environment-returning helper or equivalent so rendering does not duplicate execution logic.
- Ensure declarations, assignments, `+=`, statement loops, expression loops, and match expressions execute through Sprint 008–009 statement/expression evaluators. Bare V0.1 `let` lines and all ordinary Markdown remain non-executable.
- Integrate `renderHtml` with the formatter and evaluator:
  - Execute every executable block once in source order before interpolation begins.
  - Resolve every narrative `{{ expression }}` against the final environment, including bindings introduced or mutated by later blocks.
  - Render narrative through the existing Markdown renderer, preserving narrative order/content and current standalone HTML/title behavior.
  - Render each executable block in its source position as `<pre><code class="language-amx">…</code></pre>` (or equivalent stable code element), using canonical formatted block content, HTML-escaped so code is displayed rather than interpreted. Fence delimiters are not included; code inside blocks is never interpolated.
  - Do not display or execute declarations outside `amx` fences.
- Add formatter-focused tests and extend renderer/evaluator tests for idempotence, syntactic validity, untouched surrounding Markdown, escaping, source order, shared mutation across blocks, and final-environment interpolation including a value changed by a later block.
- Update `docs/language-spec-v0.2.md` for formatter/output/integration behavior and update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with Sprint 010 outcomes/status.

## Out of Scope

- VS Code extension, extension packaging, examples/product documentation acceptance work beyond required spec clarification, or V0.3 candidates.
- New language syntax or changes to Sprint 007–009 semantics, including ranges, loops, or match behavior.
- Rich syntax highlighting assets, source maps, configurable formatter settings, comments, code execution from non-`amx` fences, or interactive rendering.
- Asset Management concepts in the core parser/runtime/renderer.

## Constraints

- Keep TypeScript/Bun, the hand-written parser, current Markdown renderer, and dependency set; add no package unless a material requirement cannot otherwise be met and record that blocker first.
- Preserve the breaking V0.2 migration: only `ExecutableCodeBlockNode` statements execute. Do not retain compatibility by evaluating top-level V0.1 declaration fixtures; update test helpers to construct fenced code-block ASTs or parse actual fenced documents.
- Preserve document source order for execution and output. Execution happens once before rendering so early narrative interpolation observes mutations from later blocks.
- Keep `evaluateDocument`'s existing plain-object API compatible; factor/reuse document execution to give the renderer access to the final environment rather than duplicating evaluator logic.
- HTML-escape formatted code, but do not escape or otherwise rewrite surrounding Markdown beyond the current narrative/marked pipeline.
- Keep renderer behavior deterministic and standalone HTML output stable for identical input.
- Run formatter tests first after the formatter slice, then focused evaluator/renderer tests, `bun run build`, and full `bun test`.
