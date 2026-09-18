# 005 Acceptance Criteria

005 is complete when:

- The sprint directory planning/sprints/0005-renderer-inline-html/ exists with four customized files: requirements.md, blueprint.md, acceptance.md, and handoff-prompt.md.
- planning/state.md has been updated to reflect that Sprint 005 (Renderer + Inline {{ }} + HTML) is active or complete.
- planning/decisions.md has been reviewed/updated (renderer testing strategy recorded as explicit string assertions for v0.1).
- src/renderer/renderHtml.ts implements a working HTML renderer:
  - Exports a function that accepts an OpenAmxDocument and returns a complete standalone HTML5 string.
  - Walks only NarrativeNode entries in source order.
  - Locates every `{{ expression }}` (non-nested), parses the inner expression using the full v0.1 grammar (via parseExpression), evaluates it (via evaluateExpression / evaluateDocument context), and substitutes the result as a clean string.
  - Supports the entire expression surface: arithmetic, comparisons, logicals, single-line conditionals, list literals, and all 8 stdlib functions inside `{{ }}`.
  - Uses the installed `marked` package to render the post-substitution narrative content (headings, paragraphs, bullets).
  - Completely omits every VariableDeclarationNode (let declarations never appear in output).
  - Uses frontmatter `title` (if present) for the `<title>` element; falls back to a sensible default when absent.
  - Produces deterministic, stable HTML for the supported Markdown subset.
  - Evaluation errors inside `{{ }}` surface the same clear AMX errors (AMX1004 etc.) with location when available.
- tests/renderer.test.ts replaces the skeleton with real tests covering at minimum:
  - Headings (#, ##, ###) render as h1/h2/h3.
  - Paragraphs and bullet lists render correctly.
  - `let` declarations are absent from the final HTML.
  - Simple `{{ var }}` substitution works.
  - Complex `{{ expr }}` (arithmetic, comparisons, logicals, conditionals, lists, stdlib calls) evaluate and substitute correctly.
  - Multiple substitutions within a single narrative block.
  - Frontmatter title appears in the document `<title>`.
  - Output is stable and deterministic (identical input produces identical HTML structure and values).
  - At least one in-memory full-pipeline smoke test: construct or parse a document, evaluate, render, and assert on the resulting HTML.
- All new and existing tests pass: `bun test`.
- The project builds cleanly: `bun run build`.
- No implementation work has started on CLI commands (`openamx render` etc.) or populating full example .amx content.
- Chained else-if conditionals remain unimplemented (single-line only); the limitation is already documented.
- All modules remain general-purpose with no Asset Management domain concepts.
- Any assumptions or open questions encountered were recorded in planning/questions.md.
- The handoff-prompt.md in this sprint folder correctly references .agents/main.md, the current sprint directory, and "openamx", and contains a complete task contract (objective / owns / must_not / acceptance / verification).
