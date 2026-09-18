# 006 Blueprint: CLI, Examples, Full Tests, Docs, Acceptance

## Approach

Follow the master plan (planning/plan-openamxV01MasterSprintPlan.md) Sprint 006 description exactly. This is the final v0.1 sprint. The parse → evaluate → render pipeline is already complete and green. The work here is integration and delivery:

- Wire the existing CLI stub (cac-based) to the real pipeline so that `openamx render` produces a file and `openamx run` emits JSON context.
- Replace the stub content of both example files with the exact documents prescribed in language-spec-v0.1.md section 13.
- Audit the three test suites against the explicit bullet list in spec section 12 and add any missing explicit assertions (additive only).
- Replace the "scaffolding only" language in README.md with accurate, current usage instructions for bun + the finished CLI.
- Use the pre-existing `render:hello` and `render:transformer` scripts as the primary verification vehicles for the CLI + examples.
- Demonstrate clear error reporting (AMX1004 with location) via the CLI for an undefined variable.
- Update planning/state.md and decisions.md as required.
- Keep the build and all 64+ tests green throughout.
- All code and examples must remain strictly general-purpose; no Asset Management domain logic is added to core modules.

## Files to Create or Update

**Primary implementation targets (Sprint 006 scope)**
- `src/cli.ts` — replace the Sprint 001 placeholder. Implement:
  - `render <input>` + `--out <path>`: async `parseDocument`, render via `renderHtml`, `Bun.write` the resulting HTML. Surface AmxError messages (including location) and exit non-zero on failure.
  - `run <input>`: parse + `evaluateDocument`, `console.log(JSON.stringify(context, null, 2))`.
  - Preserve `cli.help()` and `cli.version("0.1.0")`.
- `examples/hello-world.amx` — replace stub with the exact content from spec section 13.
- `examples/transformer-strategy.amx` — replace stub with the exact content from spec section 13 (includes arithmetic, conditional, and multiple narrative blocks).

**Configuration / documentation**
- `package.json` — only touch if the existing `render:*` scripts require a one-line adjustment to work with the real CLI (prefer no change).
- `README.md` — rewrite the usage, status, and limitations sections so a newcomer can:
  - `bun install`
  - `bun run build && bun test`
  - `bun run render:hello` (or direct `openamx render ...`)
  - `openamx run ...`
  - Understand v0.1 limitations and how to extend.

**Tests**
- `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/renderer.test.ts` — additive changes only. Ensure every bullet under the three "Tests" headings in spec section 12 has a clear, passing test. Do not delete or weaken existing tests.

**Planning artifacts**
- `planning/state.md` — mark Sprint 006 prepared/active/complete and record "v0.1 complete".
- `planning/decisions.md` — confirm `cac` as the CLI library, record any final v0.1 CLI or documentation decisions.
- `planning/sprints/0006-cli-examples-full-tests-docs-acceptance/requirements.md`
- `planning/sprints/0006-cli-examples-full-tests-docs-acceptance/blueprint.md` (this file)
- `planning/sprints/0006-cli-examples-full-tests-docs-acceptance/acceptance.md`
- `planning/sprints/0006-cli-examples-full-tests-docs-acceptance/handoff-prompt.md`

**No changes to**
- `src/parser/`, `src/runtime/`, `src/renderer/`, `src/ast/`, `src/diagnostics/` (import and call only)
- `tsconfig.json`, `.gitignore`, or project layout
- Existing passing test logic (additive coverage only)
- Any post-v0.1 features

## Notes

- The CLI is a thin orchestration layer. All semantic work (parsing expressions, evaluation, substitution, Markdown rendering) must continue to flow through the modules delivered in Sprints 002–005.
- HTML written by `render` must be identical in structure and values to what the existing renderer tests already assert.
- For `run`, the printed JSON is the plain object returned by `evaluateDocument` (variable names → final values).
- Because the examples will now contain realistic content, running the render scripts will produce real, viewable `.html` files.
- Error handling in the CLI should print the message from AmxError (which already includes file/line/col when available) and exit with code 1.
- Precedence, let omission, and substitution correctness are already proven by unit tests; the CLI + examples prove the end-to-end user experience.
- Keep implementation simple, readable, and maintainable.
- Re-run `bun run build && bun test` after every meaningful change.
- At close, execute the full verification command sequence listed in the handoff prompt and acceptance criteria.