# 005 Blueprint: Renderer + Inline {{ }} + HTML

## Approach

- Follow the master plan (planning/plan-openamxV01MasterSprintPlan.md) Phase 4 – Rendering & Delivery exactly for Sprint 005.
- Use the 0000-sprint-template as the source and customize all four files for this sprint.
- Focus exclusively on implementing the renderer layer: walking NarrativeNodes, performing full inline `{{ expression }}` substitution (using the complete expression parser + evaluator from Sprint 004), Markdown rendering via the existing `marked` package, omission of lets, and production of a standalone HTML5 document.
- Reuse `parseExpression`, `evaluateExpression`, `evaluateDocument`, and the AST without modification.
- Implement substitution by locating `{{ ... }}` inside narrative content, parsing the inner expression, evaluating it in the document's let context, and replacing with a clean string representation of the result.
- Use `marked` only on the post-substitution narrative text.
- Assemble a minimal, deterministic standalone HTML document with `<title>` from frontmatter (falling back gracefully).
- Write renderer tests using explicit expected strings / strong structural assertions (per updated decisions.md); avoid snapshot files for v0.1.
- Include at least one full-pipeline in-memory smoke test (parse → evaluate → render).
- Update planning/state.md and planning/decisions.md as required.
- Keep the build and test suite green at every step.
- All code must remain general-purpose; no Asset Management domain logic in the renderer.

## Files to Create or Update

**Primary implementation targets (Sprint 005 scope)**
- `src/renderer/renderHtml.ts` — replace the Sprint 001 placeholder with a real implementation:
  - Export `renderHtml(doc: OpenAmxDocument): string`
  - Internally obtain evaluated context (via evaluateDocument or equivalent walk).
  - For each NarrativeNode, perform `{{ expr }}` substitution supporting the full v0.1 grammar (arithmetic, comparisons, logicals, single-line conditionals, lists, all 8 stdlib calls).
  - Convert evaluated results to clean strings (numbers as-is or trimmed, booleans lowercase, strings verbatim, lists simple and deterministic).
  - Feed substituted content to `marked`.
  - Build and return complete `<!doctype html>` document.
  - Use frontmatter `title` for `<title>`; preserve source order of narrative blocks.
  - Omit every VariableDeclarationNode.
  - Surface evaluation errors (AMX1004 etc.) with location when present.

**Tests**
- `tests/renderer.test.ts` — replace the skeleton:
  - Headings (#, ##, ###) render as h1/h2/h3.
  - Paragraphs and bullet lists render correctly.
  - `let` declarations are absent from output.
  - `{{ var }}` and complex `{{ expr }}` (including conditionals, lists, stdlib) are substituted with correct values.
  - Multiple substitutions per block.
  - Frontmatter title appears in document `<title>`.
  - Output is stable and deterministic.
  - One or more in-memory full-pipeline smoke tests exercising parse + evaluate + render.

**Planning artifacts**
- `planning/state.md` — update current status, sprint history, and next steps (mark Sprint 005 prepared / in progress / complete as Builder executes).
- `planning/decisions.md` — record renderer testing strategy (explicit strings) and any renderer-specific decisions (substitution rules, stringification of values, title fallback, error surfacing).
- `planning/sprints/0005-renderer-inline-html/requirements.md`
- `planning/sprints/0005-renderer-inline-html/blueprint.md` (this file)
- `planning/sprints/0005-renderer-inline-html/acceptance.md`
- `planning/sprints/0005-renderer-inline-html/handoff-prompt.md`

**No changes to**
- `package.json`, `tsconfig.json`, `.gitignore`
- `src/parser/`, `src/runtime/`, `src/ast/`, `src/diagnostics/` (import and reuse only)
- `src/cli.ts`, `src/index.ts` (beyond existing exports)
- `examples/` content (stubs remain untouched)
- `tests/parser.test.ts`, `tests/evaluator.test.ts` (they stay as-is)
- No implementation of CLI commands, example population, or any Sprint 006 work.

## Notes

- Keep laser-focused on completing the render layer and the parse → evaluate → render pipeline. Do not begin CLI wiring or realistic example content.
- Substitution must support every expression form delivered by Sprint 004 inside `{{ }}`.
- Evaluation semantics for `{{ expr }}` must be identical to `let` evaluation (same environment, same coercion, same errors).
- `marked` is used strictly for narrative Markdown after substitution; do not attempt to parse or render lets.
- HTML output must be deterministic for the supported Markdown subset.
- Source locations on expressions inside `{{ }}` should be preserved where practical for error reporting (the inner parseExpression call can carry adjusted or original source info).
- If the Builder encounters ambiguity about exact stringification of values (e.g. how lists render inside text), record the assumption in questions.md and choose a simple, reviewable rule (e.g. `JSON.stringify` for complex or comma-join for lists).
- Verify at the end: `bun run build && bun test`.
