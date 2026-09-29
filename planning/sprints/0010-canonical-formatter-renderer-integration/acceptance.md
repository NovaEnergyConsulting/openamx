# 010 Acceptance Criteria

010 is complete when:

- A focused formatter API exists for executable-block source without fence delimiters and does not receive or modify surrounding Markdown.
- Formatter output follows the canonical layout rules in requirements: LF endings, normalized top-level/two-space block indentation, preserved blank-line positions, stripped boundary blank lines/trailing horizontal whitespace, preserved intra-line tokens/text, and exactly one final LF for nonempty input (empty input yields empty output).
- Formatting is idempotent: `format(format(source))` equals `format(source)` across declarations, assignments, loops, match expressions, nested expression forms, and blank-line/line-ending cases.
- Formatted output is syntactically valid and can be parsed as V0.2 executable statements. Formatter tests include quoted strings containing brace characters so brace scanning does not change indentation incorrectly.
- `evaluateDocument` executes only statements from `ExecutableCodeBlockNode`s, in document source order, using one shared environment. It returns the final bindings as a plain object, retaining its public API shape.
- Tests show declarations, assignment/reassignment, `+=`, loops/ranges, and match expressions in later blocks see and mutate values established by earlier blocks. Bare V0.1 let lines represented as narrative are not executed; ordinary Markdown fences do not execute.
- The renderer executes all code blocks exactly once before rendering any narrative or interpolation, with a single shared environment. An inline placeholder in early narrative resolves to the final value after a later block mutates that binding.
- Rendered output is complete standalone HTML5 with current title/fallback behavior and preserved Markdown narrative structure/source order.
- Each executable code block appears in its original document position as formatted escaped source inside a stable `<pre><code class="language-amx">…</code></pre>`-equivalent element. Fence delimiters are omitted; source cannot inject HTML; code is not interpolated. Ordinary Markdown fences remain rendered as ordinary Markdown and are not executed.
- No `let` declaration inside an executable block is omitted from the visible code source, while bare declaration-looking narrative remains visible as narrative text.
- Existing inline expression behavior remains intact and uses the V0.2 parser/evaluator, including mutation-final values, loops, ranges, and match expressions. Undefined references retain clear AMX1004 diagnostics with locations.
- Parser/evaluator/renderer test helpers use V0.2 executable-block AST or fenced parsing; none relies on the old bare-let execution behavior.
- Formatter, evaluator, and renderer focused tests pass; `bun run build` and full `bun test` pass with all pre-existing V0.1/V0.2 coverage retained.
- The V0.2 specification and planning records describe the implemented formatter/render behavior and verification. Sprint 010 is complete and Sprint 011 is the next sprint only after all criteria pass.
- No VS Code extension, CLI changes, Asset Management core behavior, or V0.3 feature is implemented.
