# 006 Handoff Prompt

You are the Builder for `openamx`.

Read these files first:

- .agents/main.md
- planning/state.md
- planning/decisions.md
- planning/sprints/0006-cli-examples-full-tests-docs-acceptance/requirements.md
- planning/sprints/0006-cli-examples-full-tests-docs-acceptance/blueprint.md
- planning/sprints/0006-cli-examples-full-tests-docs-acceptance/acceptance.md

Execute only the documented sprint scope. Do not invent business rules or redefine requirements. If information is missing, update planning/questions.md and proceed only when assumptions are clearly marked.

This is the final sprint for OpenAMX v0.1. The core `.amx → parse → evaluate → render HTML` pipeline (including the complete expression grammar, stdlib, inline `{{ }}` substitution, and standalone HTML output) is already complete and tested. Your work is strictly delivery and closure:

- Implement real behavior for the two CLI commands in the existing `cac`-based stub (`src/cli.ts`).
- Populate `examples/hello-world.amx` and `examples/transformer-strategy.amx` with the exact text from language-spec-v0.1.md section 13.
- Add (or document) explicit test coverage for every case listed in spec section 12.
- Complete `README.md` with accurate bun-based install/usage/limitations content.
- Run the full verification sequence, update planning/state.md to "v0.1 complete", and ensure every item in spec section 16 is observably satisfied.

Do NOT modify `src/parser/`, `src/runtime/`, `src/renderer/`, `src/ast/`, or `src/diagnostics/` (import and reuse only; no behavior changes).
Do NOT implement chained `else if` or any expression features beyond what Sprint 004 delivered.
Do NOT add imports, units, charts, tables, exports, or any language-spec section 4 items.
Do NOT switch renderer tests to snapshots.
Do NOT begin Phase 10 or later work.

Keep `bun run build && bun test` green. All modules must remain general-purpose.

---

## Task Contract

**objective**: Wire a functional CLI (`openamx render <input> --out <html>` and `openamx run <input>`), populate the two example `.amx` files exactly per spec section 13, ensure test coverage for all section 12 cases, complete the README with usage and limitations, satisfy every acceptance item in spec section 16, and update planning artifacts so that v0.1 can be declared complete. The one outcome this sprint exists for is a working, documented, tested, and verified v0.1 prototype that a user can install with bun and successfully render both canonical examples.

**owns**:
- src/cli.ts (implement the render and run commands)
- examples/hello-world.amx
- examples/transformer-strategy.amx
- README.md
- package.json (only if the render:* scripts require a minimal adjustment)
- tests/parser.test.ts, tests/evaluator.test.ts, tests/renderer.test.ts (additive coverage only for spec section 12)
- planning/state.md
- planning/decisions.md
- The four files inside planning/sprints/0006-cli-examples-full-tests-docs-acceptance/

**must_not**:
- Edit any source file under src/parser/, src/runtime/, src/renderer/, src/ast/, or src/diagnostics/ except to import existing public exports
- Introduce new language syntax, relax the single-line conditional limitation, or implement chained else-if
- Implement or exercise any features listed in language-spec-v0.1.md section 4
- Change the renderer testing strategy to use snapshot files
- Modify tsconfig.json or add new runtime dependencies
- Perform any work described for future phases

**acceptance**:
- `openamx render <input> --out <path>` successfully writes a correct standalone HTML5 file for both example documents (inline expressions substituted, lets omitted, Markdown structure preserved).
- `openamx run <input>` prints the evaluated context as JSON.
- Both `examples/hello-world.amx` and `examples/transformer-strategy.amx` contain exactly the content specified in language-spec-v0.1.md section 13.
- Every bullet listed under Parser tests / Evaluator tests / Renderer tests in spec section 12 has an explicit passing test.
- `bun run build && bun test` exits 0 with a clean, green test run.
- `README.md` accurately documents bun installation, build/test commands, CLI usage for render and run, v0.1 limitations, and basic extension guidance.
- All items in language-spec-v0.1.md section 16 are true when verified with bun commands (install/build/test succeed; CLI renders both examples; inline expressions and let omission work; precedence is respected; undefined variables produce a clear error with location; the README explains the prototype).
- `planning/state.md` records Sprint 006 complete and overall status "v0.1 complete".
- A clear AMX1004 (or equivalent) error with location is produced when the CLI encounters an undefined variable.
- No work was performed outside the documented owns list.

**verification**:
```
cd "c:\Users\gamez\Programming\openamx"
bun install
bun run build
bun test
bun run render:hello
bun run render:transformer
# Inspect the generated HTML files (examples/hello-world.html and examples/transformer-strategy.html):
# - they must exist and be valid standalone HTML5
# - they must contain the expected substituted numeric/string/boolean values
# - they must not contain any "let " declarations
# - headings and paragraphs must be present as rendered Markdown
bun run dist/cli.js run examples/transformer-strategy.amx
# Must print a JSON object containing at minimum the keys from the example (replacementCost, annualRiskCost, ..., priority, etc.) with correct evaluated values.

# Demonstrate error reporting (example; adapt path as needed):
#   echo 'let total = missing + 1' > /tmp/undef.amx
#   bun run dist/cli.js render /tmp/undef.amx --out /tmp/out.html
# Expected: clear error message containing AMX1004 (or equivalent undefined identifier error) and location; non-zero exit code.
```
