# 006 Acceptance Criteria

006 is complete when:

- The sprint directory `planning/sprints/0006-cli-examples-full-tests-docs-acceptance/` exists with four customized files: requirements.md, blueprint.md, acceptance.md, and handoff-prompt.md.
- `planning/state.md` has been updated to reflect that Sprint 006 is active or complete and that the project status is "v0.1 complete".
- `planning/decisions.md` has been reviewed/updated (CLI library choice confirmed as `cac`; any final v0.1 decisions recorded).
- `src/cli.ts` implements working CLI commands:
  - `openamx render <input> --out <path>` parses a `.amx` file, evaluates it, renders a complete standalone HTML5 document via the existing renderer, and writes the output file.
  - `openamx run <input>` parses and evaluates the document and prints the resulting context as JSON to stdout.
  - Errors (including AMX1004 for undefined variables) are reported clearly with location information when available; the process exits non-zero on failure.
- `examples/hello-world.amx` and `examples/transformer-strategy.amx` contain exactly the document text prescribed in language-spec-v0.1.md section 13 (front matter, lets, narrative, and inline expressions, including the conditional in the transformer example).
- The package scripts `bun run render:hello` and `bun run render:transformer` complete successfully. The generated `.html` files:
  - Contain correct inline expression substitutions (arithmetic, conditional, etc.).
  - Contain no visible `let` declarations.
  - Preserve Markdown structure (headings, paragraphs, bullets where present).
- Every test case enumerated under "Parser tests", "Evaluator tests", and "Renderer tests" in language-spec-v0.1.md section 12 has an explicit, passing assertion in the test suite.
- `bun run build` succeeds cleanly.
- `bun test` succeeds (all prior tests + any additive coverage tests remain green).
- `README.md` documents:
  - Installation with `bun install`.
  - Build (`bun run build`) and test (`bun test`) commands.
  - CLI usage for `render ... --out ...` and `run`.
  - Current v0.1 limitations.
  - Basic guidance on extending the prototype.
- All items in language-spec-v0.1.md section 16 are observably true when verified with bun commands (install/build/test succeed; CLI renders both examples to HTML; inline expressions are correctly evaluated and replaced; `let` declarations are not visible in rendered HTML; arithmetic respects operator precedence; undefined variables produce a clear error; the README explains how to use the prototype).
- The handoff-prompt.md in this sprint folder correctly references `.agents/main.md`, the current sprint directory, and "openamx", and contains a complete task contract (`objective` / `owns` / `must_not` / `acceptance` / `verification`).
- No implementation work has started on anything outside the documented scope (no parser/runtime/renderer changes, no chained else-if, no section 4 features, no post-v0.1 work).
- All modules remain general-purpose with no Asset Management domain concepts added to the core.
- Any assumptions or open questions encountered were recorded in `planning/questions.md`.
- The full verification commands listed in the handoff prompt have been executed successfully and the project is left in a clean, demonstrable v0.1 state.