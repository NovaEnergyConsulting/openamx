# 001 Blueprint: Project Scaffolding, Tooling & Planning Artifacts

## Approach

- Follow the master plan (plan-openamxV01MasterSprintPlan.md) Phase 1 – Foundation exactly for Sprint 001.
- Use the 0000-sprint-template as the source and customize all four files for this sprint.
- Establish the complete project layout, configuration, and empty-but-compilable skeleton so that later sprints can focus purely on language implementation.
- Prefer bun as the package manager and script runner (per main.md clarification and master plan).
- Create a strict TypeScript setup from the start.
- Produce only scaffolding artifacts: no parser logic, no evaluator logic, no renderer logic, no functional CLI behaviour.
- Populate planning/state.md and planning/decisions.md as required by the sprint workflow.
- Adapt the handoff-prompt.md to correct outdated references from the template (".continue/rules" → ".agents/main.md", "e-lang" → "openamx", and correct sprint directory).
- Add minimal but useful content to README.md so a new developer can install, build, test, and understand the current status.
- Create two minimal example .amx stubs and three test skeletons that pass when empty.
- Verify the green build at the end: `bun install && bun run build && bun test`.

## Files to Create or Update

**New configuration & project files**
- package.json (root)
- tsconfig.json (root)
- .gitignore (root, if not present)

**Source skeleton (per language-spec-v0.1.md section 5)**
- src/index.ts
- src/cli.ts
- src/parser/parseDocument.ts
- src/parser/parseFrontMatter.ts
- src/parser/parseStatements.ts
- src/parser/parseExpression.ts
- src/ast/types.ts
- src/runtime/evaluateDocument.ts
- src/runtime/evaluateExpression.ts
- src/runtime/environment.ts
- src/runtime/standardLibrary.ts
- src/renderer/renderHtml.ts
- src/diagnostics/errors.ts

**Examples (stubs only)**
- examples/hello-world.amx
- examples/transformer-strategy.amx

**Tests (skeletons only)**
- tests/parser.test.ts
- tests/evaluator.test.ts
- tests/renderer.test.ts

**Planning artifacts**
- planning/state.md (initial population)
- planning/decisions.md (tech choices and v0.1 scope decisions)
- planning/sprints/0001-project-scaffolding/requirements.md (already created)
- planning/sprints/0001-project-scaffolding/blueprint.md (this file)
- planning/sprints/0001-project-scaffolding/acceptance.md
- planning/sprints/0001-project-scaffolding/handoff-prompt.md

**Documentation**
- README.md (targeted updates)

## Notes

- Keep laser-focused on scaffolding. Do not begin implementing the language features described in Sprint 002 (AST details, frontmatter parsing, statement splitting, expression parsing, etc.).
- All core modules must remain general-purpose. Do not introduce Asset Management domain concepts into parser, ast, runtime, or renderer.
- Source locations should be anticipated in the AST types skeleton even if not populated yet.
- The project must be in a state where a fresh checkout + `bun install && bun run build && bun test` is completely clean.
- Record every material decision in planning/decisions.md.
- If any information is ambiguous, record it in planning/questions.md and mark assumptions clearly.
- After this sprint the repository is ready for the Builder of Sprint 002 to begin real implementation work.
