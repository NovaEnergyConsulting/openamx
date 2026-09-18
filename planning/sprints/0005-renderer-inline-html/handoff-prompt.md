# 005 Handoff Prompt

You are the Builder for `openamx`.

Read these files first:

- .agents/main.md
- planning/state.md
- planning/decisions.md
- planning/sprints/0005-renderer-inline-html/requirements.md
- planning/sprints/0005-renderer-inline-html/blueprint.md
- planning/sprints/0005-renderer-inline-html/acceptance.md

Execute only the documented sprint scope. Do not invent business rules or redefine requirements. If information is missing, update planning/questions.md and proceed only when assumptions are clearly marked.

This sprint is strictly about implementing the renderer layer for v0.1: walking NarrativeNodes, performing full inline `{{ expression }}` substitution using the complete expression grammar and evaluator from Sprint 004, Markdown rendering via the existing `marked` package, omission of lets, and production of a standalone HTML5 document with title from frontmatter. 

Do NOT implement or exercise CLI commands (`openamx render`, `openamx run`).
Do NOT populate or modify full example .amx content.
Do NOT modify parser, runtime, AST, or diagnostics modules (import and reuse only).

All language features beyond the render pipeline (CLI, full examples, acceptance) belong to Sprint 006. Keep the build and tests green. All modules must remain general-purpose.

---

## Task Contract

**objective**: Deliver a working `renderHtml(doc)` implementation that substitutes every `{{ full-expression }}` (using the complete v0.1 expression surface), renders post-substitution narrative via `marked`, omits all lets, produces a deterministic standalone HTML5 document using frontmatter title, and add renderer tests (explicit strings + one full-pipeline smoke test) so that `bun run build && bun test` passes with the new renderer coverage.

**owns**:
- src/renderer/renderHtml.ts (full implementation replacing the placeholder)
- tests/renderer.test.ts (replace skeleton with real tests for headings/paragraphs/bullets, let omission, {{var}}/{{expr}} substitution including complex cases, title, stability, and at least one in-memory parse+eval+render smoke test)
- planning/state.md (status updates)
- planning/decisions.md (renderer testing strategy and any new renderer decisions)

**must_not**:
- Modify src/parser/, src/runtime/, src/ast/, src/diagnostics/ (reuse only)
- Implement or call any CLI command wiring or execution
- Populate or change examples/hello-world.amx or examples/transformer-strategy.amx
- Add snapshot files or switch to snapshot testing (use explicit string/contains assertions)
- Implement chained else-if or any expression features beyond Sprint 004
- Change package.json, tsconfig.json, or project layout
- Begin any Sprint 006 work

**acceptance**:
- renderHtml produces complete standalone HTML5 for documents containing headings, paragraphs, bullets, lets, and inline expressions.
- Every `{{ expr }}` (arithmetic, comparisons, logicals, single-line conditionals, lists, all 8 stdlib functions) is parsed, evaluated, and substituted with a clean deterministic string.
- All let declarations are absent from the final HTML.
- Frontmatter title (when present) appears in `<title>`; sensible fallback when absent.
- Source order of narrative blocks is preserved.
- Renderer tests cover the cases listed in acceptance.md and pass.
- `bun run build && bun test` is green (existing 54 tests + new renderer tests).
- No work outside the documented scope has been started.

**verification**:
```
bun run build && bun test
```
(Optionally, after implementation, a manual smoke using the in-memory test path or a minimal constructed document to confirm HTML shape and substitution.)
