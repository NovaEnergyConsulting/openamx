# 001 Acceptance Criteria

001 is complete when:

- The sprint directory planning/sprints/0001-project-scaffolding/ exists with four customized files: requirements.md, blueprint.md, acceptance.md, and handoff-prompt.md.
- planning/state.md has been updated to reflect that the master plan is approved and Sprint 001 is active (or complete, depending on timing of handoff).
- planning/decisions.md contains the key technology and scope decisions for v0.1 (bun as package manager, plain TypeScript, hand-written parser approach, list of out-of-scope items, architecture notes).
- package.json exists at the project root with:
  - correct name "openamx"
  - bin entry enabling the `openamx` command
  - scripts for build, test, dev, and render:* commands using bun
  - appropriate dependencies (yaml, marked, cac) and devDependencies (typescript, etc.)
- tsconfig.json exists with "strict": true and suitable ESM + dist output settings.
- .gitignore exists and covers standard build artifacts, node_modules, dist, etc.
- The full src/ directory structure exists exactly as specified in language-spec-v0.1.md section 5, with all listed files present (even if they contain only placeholder comments or minimal valid TypeScript that compiles).
- examples/ directory exists containing at least:
  - examples/hello-world.amx (minimal valid frontmatter + heading stub)
  - examples/transformer-strategy.amx (minimal valid frontmatter + heading stub)
- tests/ directory exists containing at least:
  - tests/parser.test.ts
  - tests/evaluator.test.ts
  - tests/renderer.test.ts
  (These may be empty describe blocks or minimal passing tests.)
- README.md has been updated with at least basic sections describing installation (bun), build, test, and current project status / limitations.
- The handoff-prompt.md in this sprint folder has been customized to reference the correct paths (.agents/main.md, current sprint directory, "openamx" instead of "e-lang").
- Running the following commands from the project root produces clean success with no errors:
  - `bun install`
  - `bun run build`
  - `bun test`
- No language implementation work has been started (no actual parsing, evaluation, or rendering logic exists yet).
- All changes follow the builder rules in .agents/main.md: no scope redefinition, planning files updated, no secrets stored, etc.
- Any assumptions made during scaffolding are recorded in planning/questions.md.
