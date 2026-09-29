# 010 Blueprint: Canonical Formatter & Renderer Integration

## Approach

Build the smallest formatter that establishes deterministic layout without reprinting expression ASTs. The parser intentionally stores semantic expression nodes rather than raw token spans, and string escaping/operator-preserving pretty-printing would add a second grammar surface. Therefore format layout only: normalize line endings, trim boundary/line whitespace, preserve blank lines and all intra-line expression text, and indent braced `for`/`match` bodies at two spaces per level. Scan brace depth outside quoted strings; reject malformed source through the existing parser before returning formatted text. Prove idempotence by formatting already-formatted output again, and syntactic validity by parsing the result.

Factor document execution into one shared path. Walk document nodes in source order; for each `executableCodeBlock`, call Sprint 008's `evaluateStatements` with the same `Environment`. Return the final environment from a reusable helper, while retaining `evaluateDocument(doc, file)` as the existing plain-object API. Narrative and legacy top-level declaration nodes are never executable in V0.2.

In `renderHtml`, execute the entire document once before rendering any narrative. Then walk document nodes in source order: render narrative with inline substitution evaluated against the final environment, and render each executable block's formatted source as an escaped `<pre><code class="language-amx">` fragment. Do not pass code-block source through Markdown or interpolation. The ordering requirement is deliberately two-pass: code executes in source order, then output is assembled in source order; therefore a placeholder before the block that changes its value still sees the final value.

Keep the current title/fallback, marked narrative processing, HTML escaping, and standalone HTML5 wrapper. Keep error propagation and source locations through the existing evaluator/parser paths. Update test-only helpers that currently turn bare `let` lines into top-level executable nodes; model V0.2 by using executable-code-block statements or parsed fenced documents.

## Files to Update

- `src/formatter/formatAmx.ts` (or equivalent focused module) — canonical layout formatting of executable block content.
- `src/runtime/evaluateDocument.ts` — source-order execution of executable code blocks and reusable final-environment access, preserving the plain-object API.
- `src/renderer/renderHtml.ts` — two-pass document evaluation and output rendering; formatted, escaped visible code blocks; final-context interpolation.
- `tests/formatter.test.ts` — formatter normalization, indentation, strings/braces, parse-validity, idempotence, empty input.
- `tests/evaluator.test.ts` — multiple code blocks share state, mutations/loops/match execute in source order, bare narrative is ignored, context remains correct.
- `tests/renderer.test.ts` — visible escaped formatted blocks, source order, no execution/interpolation of ordinary fences/code, final-environment placeholders (including later mutation), standalone HTML/title regression coverage.
- `docs/language-spec-v0.2.md` — document canonical formatter behavior, visible code-block output, source-order execution, and final-environment interpolation.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` — status, final decisions, verification results, and actual deviations.

## Notes

- An `ExecutableCodeBlockNode` retains both raw `content` and parsed `statements`. The formatter should use raw block content so it can preserve token spelling and arm order; rendering should format, then HTML-escape, that source.
- Runtime execution must use parsed statements, not the formatted source, and each block must execute exactly once.
- Avoid evaluating inline placeholders during the execution pass. Parse/evaluate each only when rendering narrative, but against the completed final environment.
- Never emit raw HTML from code-block contents. Test at least `<`, `>`, `&`, and quotes to prove escaping.
- Existing helpers built for V0.1 may directly place declarations in `doc.nodes`. They must be migrated rather than supported as executable V0.2 behavior.
- Do not add extension files or implement extension providers; Sprint 011 owns those.
