# 006 Requirements: CLI, Examples, Full Tests, Docs, Acceptance

## Goal

Deliver the final pieces for the OpenAMX v0.1 prototype: a working CLI (`openamx render` and `openamx run`), the two canonical example `.amx` files populated exactly as specified in the language spec, test coverage for every case listed in spec section 12, a complete and accurate README, and verification that all acceptance criteria in spec section 16 are satisfied. Update planning artifacts to record that v0.1 is complete. This is the closing sprint of the v0.1 master plan.

## Inputs

- Authoritative specification: `.agents/language-spec-v0.1.md` (sections 11 CLI Requirements, 12 Tests, 13 Example Files, 14 Documentation, 16 Acceptance Criteria, 17 Suggested Commands, 18 Final Deliverable)
- Master plan: `planning/plan-openamxV01MasterSprintPlan.md` (Sprint 006 under Phase 4 – Rendering & Delivery)
- Operating model: `.agents/main.md` (120x Architect/Builder process and builder rules)
- Template: `planning/sprints/0000-sprint-template/`
- Current project state (post-Sprint 005): full `.amx → parse → evaluate → render HTML` pipeline is operational and tested (64 passing tests). `cac` is already a dependency. `src/cli.ts` and the two files under `examples/` are Sprint 001 stubs. The `render:hello` and `render:transformer` scripts exist in package.json. The renderer and evaluator already cover the large majority of behaviors listed in spec section 12.
- Existing modules to reuse (no modification to their implementation): `src/parser/parseDocument.ts`, `src/runtime/evaluateDocument.ts`, `src/renderer/renderHtml.ts`, `src/diagnostics/errors.ts`, and the AST types.

## In Scope

- `src/cli.ts`:
  - Replace the placeholder implementation with real commands using the existing `cac` setup.
  - `render <input>` (required): accepts an `.amx` path, optional `--out <path>`. Parses the file (UTF-8), evaluates declarations in source order, renders via the existing renderer to a complete standalone HTML5 document, and writes the result to the output path. Clear errors (including AMX1004 with file/line/col for undefined variables) must be printed; non-zero exit on failure.
  - `run <input>` (optional but required per master plan): parses and evaluates the document, then prints the final evaluated context as JSON to stdout.
  - Retain built-in help and version support.
- Populate the example files exactly per language-spec-v0.1.md section 13:
  - `examples/hello-world.amx`
  - `examples/transformer-strategy.amx`
- Ensure the existing `render:*` scripts in `package.json` function end-to-end (minor adjustments only if required for the real CLI).
- Expand or augment tests (primarily additive) in `tests/parser.test.ts`, `tests/evaluator.test.ts`, and `tests/renderer.test.ts` so that every bullet listed under "Parser tests", "Evaluator tests", and "Renderer tests" in spec section 12 has an explicit, passing assertion. (Most coverage already exists; close any gaps.)
- Complete `README.md`:
  - Installation instructions using `bun install`.
  - Build (`bun run build`) and test (`bun test`) commands.
  - CLI usage for both `render` (with `--out`) and `run`.
  - Current v0.1 limitations.
  - Brief guidance on how to extend the prototype.
- Update `planning/state.md` to reflect Sprint 006 status and overall "v0.1 complete".
- Review / update `planning/decisions.md` (confirm `cac` choice, record any final CLI or v0.1 decisions).
- Execute the full verification steps defined in the master plan and in this sprint's acceptance criteria.
- Keep `bun run build && bun test` green at every step.

## Out of Scope

- Any changes to the expression grammar, parser, evaluator, renderer, AST, or diagnostics (import and reuse only; no new features or behavior changes).
- Chained `else if` conditionals (single-line `if E then E else E` only; already documented as a v0.1 limitation).
- Any features listed in language-spec-v0.1.md section 4 (imports, units, charts, tables, exports, domain libraries, VS Code extension, etc.).
- Changes to project layout, tsconfig.json, or addition of new runtime dependencies.
- Snapshot testing for the renderer (continue using explicit string/contains assertions).
- Introduction of Asset Management domain concepts into the core parser/runtime/renderer.
- Any post-v0.1 roadmap work.

## Constraints

- Strictly follow the 120x process and builder rules in `.agents/main.md`. Implement only the documented sprint scope.
- bun is the primary and required package manager for v0.1. All commands, scripts, and verification use bun. "npm install" / "npm run" wording in the language spec is treated as illustrative only (per prior decisions).
- The CLI must be built on the already-declared `cac` dependency.
- Rendering must be performed exclusively by the existing `renderHtml` implementation; do not duplicate rendering logic in the CLI.
- The two example files must contain the exact text (front matter, lets, narrative, and inline expressions) shown in spec section 13.
- Evaluation and error semantics for CLI-driven runs must be identical to the in-memory paths already tested.
- Source order must be preserved.
- Identifiers remain case-sensitive.
- If information is missing or ambiguous, record clear assumptions in `planning/questions.md` before proceeding.
- At the end of the sprint the project must support `bun install && bun run build && bun test` cleanly.
- No scope creep into future phases.