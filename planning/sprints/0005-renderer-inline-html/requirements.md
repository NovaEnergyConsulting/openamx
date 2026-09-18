# 005 Requirements: Renderer + Inline {{ }} + HTML

## Goal

Implement the HTML renderer for OpenAMX v0.1. The renderer must:

- Walk only NarrativeNode content from a parsed OpenAmxDocument (in source order).
- Substitute every inline `{{ expression }}` placeholder — supporting the *full* v0.1 expression grammar (arithmetic, comparisons, logicals, single-line conditionals, list literals, function calls to the 8 stdlib functions) — by parsing the inner expression and evaluating it against the document's let bindings.
- Render the post-substitution narrative as Markdown using the already-installed `marked` package.
- Completely omit all VariableDeclarationNodes (let declarations must never appear in output).
- Produce a complete, standalone HTML5 document.
- Use the frontmatter `title` (if present) for the `<title>` element (and surface it appropriately).
- Preserve exact source order of narrative blocks.

Add focused renderer tests covering headings/paragraphs/bullets, let omission, `{{var}}` and `{{expr}}` substitution (including complex expressions), and stable deterministic output. Include at least one in-memory parse + evaluate + render smoke test that exercises the full pipeline without relying on CLI or disk examples.

This sprint completes the core `.amx → parse → evaluate → render HTML` pipeline. CLI command wiring (`openamx render`) and full population of example `.amx` files (with expected outputs) are explicitly deferred to Sprint 006.

## Inputs

- Project brief / authoritative spec: `.agents/language-spec-v0.1.md` (sections 3.6 Inline Render Expressions, 10 Renderer Requirements, 12 Tests — renderer cases, 13 Examples structure, 16 Acceptance Criteria)
- Master plan: `planning/plan-openamxV01MasterSprintPlan.md` (Sprint 005 under Phase 4 – Rendering & Delivery)
- Operating model: `.agents/main.md` (120x Architect/Builder process)
- Template: `planning/sprints/0000-sprint-template/`
- Current project state (post-Sprint 004): full expression parser + evaluator + stdlib (54 green tests), `renderHtml.ts` and `renderer.test.ts` are pure Sprint 001 placeholders, `parseDocument` + `evaluateDocument` + `parseExpression` + `evaluateExpression` are complete and reusable, `marked` already in package.json, examples/ and cli.ts remain stubs.
- Existing modules to reuse (no modification required for core logic): `src/parser/parseExpression.ts`, `src/runtime/evaluateExpression.ts`, `src/runtime/evaluateDocument.ts`, `src/ast/types.ts`, `src/diagnostics/errors.ts`

## In Scope

- `src/renderer/renderHtml.ts`:
  - Export a function `renderHtml(doc: OpenAmxDocument): string` (or `renderHtml(doc, context?)` if helpful for testing; internal evaluation is acceptable).
  - Internally call `evaluateDocument` (or equivalent) to obtain the let bindings / Environment for substitution.
  - For every NarrativeNode, locate all `{{ ... }}` occurrences (non-nested), parse the inner text using `parseExpression`, evaluate using `evaluateExpression` against the populated environment, convert the result to a clean string (numbers without trailing .0 where natural, booleans as true/false, strings as-is, lists as comma-joined or JSON-ish but keep simple and deterministic), and replace.
  - Pass the fully substituted narrative content to `marked` for Markdown rendering (# → h1, ## → h2, ### → h3, paragraphs, - bullets).
  - Assemble and return a complete standalone HTML document:
    ```html
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>...</title>
    </head>
    <body>
      ...rendered narrative in source order...
    </body>
    </html>
    ```
  - Frontmatter `title` (metadata.title) becomes the `<title>` value. If absent, use a sensible fallback ("OpenAMX Document").
  - VariableDeclarationNodes are ignored (never rendered).
  - Source order of NarrativeNodes is strictly preserved.
  - Errors inside `{{ }}` (e.g. undefined var) must surface the same clear AMX errors (AMX1004 etc.) with location when available.
- `tests/renderer.test.ts`:
  - Replace the skeleton with real tests:
    - Renders headings (#, ##, ###) as corresponding h1/h2/h3.
    - Renders paragraphs and bullet lists.
    - `let` declarations are completely absent from the final HTML.
    - Simple `{{ var }}` substitution works.
    - Complex `{{ expr }}` (arithmetic, comparisons, logicals, conditionals, lists, stdlib calls) are evaluated and substituted.
    - Multiple substitutions in one narrative block.
    - Frontmatter title appears in `<title>`.
    - Output is stable/deterministic (same input → identical HTML structure and values).
  - At least one in-memory smoke test that does `parseDocument` (or constructs a doc in memory) → `evaluateDocument` → `renderHtml` → assertions on the resulting HTML string.
- Update `planning/state.md` (mark Sprint 005 prepared/active/complete as appropriate) and `planning/decisions.md` (record renderer testing choice and any new renderer decisions).
- Keep `bun run build && bun test` green at every step.
- All modules remain strictly general-purpose (no Asset Management domain concepts in renderer).

## Out of Scope

- CLI command implementation or execution (`openamx render`, `openamx run`) — Sprint 006 only.
- Populating realistic content in `examples/hello-world.amx` and `examples/transformer-strategy.amx` or generating their expected `.html` outputs — Sprint 006.
- Any modification to parser, runtime, AST, or diagnostics (only import and reuse).
- Chained `else if` conditionals (still single-line only; already documented limitation).
- Advanced substitution features (escaping `}}` inside expressions, nested `{{ }}`, custom formatters).
- CSS, scripts, or non-standalone HTML.
- Snapshot testing for HTML (use explicit string/contains assertions per updated decisions.md).
- Any items listed in language-spec-v0.1.md section 4.
- Changes to package.json, tsconfig.json, or project layout.
- Full acceptance criteria from spec section 16 that require CLI (those belong to Sprint 006).

## Constraints

- Strictly follow the 120x process and builder rules in `.agents/main.md`. Execute *only* the documented sprint scope.
- Use the existing `marked` dependency (already declared).
- Substitution must support the *entire* expression surface delivered by Sprint 004 (including `if ... then ... else`, list literals, and all 8 stdlib functions inside `{{ }}`).
- Evaluation for lets and for `{{ }}` expressions must be consistent (same rules, same errors).
- Source order must be strictly preserved.
- Output HTML must be deterministic (no random whitespace, no non-deterministic marked behavior for the supported subset).
- Identifiers remain case-sensitive.
- If information is missing or ambiguous, record clear assumptions in `planning/questions.md` before proceeding.
- At the end of the sprint the project must support `bun install && bun run build && bun test` cleanly.
- No scope creep into Sprint 006 (CLI + examples).
