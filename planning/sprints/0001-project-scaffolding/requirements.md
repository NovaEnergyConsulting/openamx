# 001 Requirements: Project Scaffolding, Tooling & Planning Artifacts

## Goal

Set up the initial project structure, tooling, package configuration, source skeleton, example stubs, test skeletons, and planning artifacts. This establishes the foundation so that subsequent sprints (002+) can implement the parser, evaluator, renderer, and CLI following language-spec-v0.1.md without friction.

## Inputs

- Project brief / authoritative spec: .agents/language-spec-v0.1.md (sections 1-18, especially section 5 architecture, section 6 AST design, section 12 tests, section 13 examples, section 16 acceptance)
- Master plan: .agents/planning/plan-openamxV01MasterSprintPlan.md (Sprint 001 details under Phase 1)
- Operating model: .agents/main.md (120x Architect/Builder, sprint workflow, builder rules)
- Template: planning/sprints/0000-sprint-template/ (source files to customize)
- Current project: README.md
- Planning state files: planning/state.md, planning/decisions.md, planning/questions.md

## In Scope

- package.json at root:
  - "name": "openamx"
  - "version": "0.1.0"
  - "bin": entry that enables the `openamx` command (pointing to compiled cli, e.g. "./dist/cli.js")
  - "type": "module" (ESM)
  - scripts using bun conventions:
    - "build": "tsc"
    - "test": "bun test"
    - "dev": "bun --watch src/cli.ts" (or equivalent)
    - render scripts e.g. "render:hello": "bun run dist/cli.js render examples/hello-world.amx --out examples/hello-world.html"
    - "render:transformer": similar for the second example
  - dependencies (prod): "yaml", "marked", "cac" (CLI library)
  - devDependencies: "typescript", "@types/node" (as needed), and test runner (prefer bun's built-in test; vitest acceptable if it integrates cleanly)
- tsconfig.json:
  - "strict": true
  - target/module settings suitable for ESM + Node/bun
  - "outDir": "dist"
  - "rootDir": "src"
  - include/exclude appropriate for the layout
- .gitignore covering: node_modules/, dist/, *.log, .DS_Store, coverage/, etc. (bun lockfile bunn.lockb or bun.lock should be committed)
- src/ skeleton per language-spec-v0.1.md section 5 (all directories and files created; files may contain only placeholder comments or minimal valid exports so that `tsc` succeeds with no errors):
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
- examples/ directory containing two stub files:
  - examples/hello-world.amx (at minimum a frontmatter block + title heading)
  - examples/transformer-strategy.amx (at minimum a frontmatter block + title heading)
- tests/ directory with skeleton test files (empty test suites or describe blocks that pass):
  - tests/parser.test.ts
  - tests/evaluator.test.ts
  - tests/renderer.test.ts
- Populate planning/state.md (initial status, Sprint 001 active)
- Populate planning/decisions.md (record all tech choices, architecture decisions, and v0.1 limitations from the master plan)
- Customize planning/sprints/0001-project-scaffolding/handoff-prompt.md (fix outdated references from the 0000 template)
- Initial updates to README.md (add or expand sections covering: installation with bun, build, test, basic usage of the future render command, and current status/limitations note)
- Verification that the following succeed with clean/empty results:
  - bun install
  - bun run build
  - bun test

## Out of Scope

- Implementation of any parsing logic (frontmatter, statements, expressions)
- Implementation of evaluation, environment, or standard library functions
- Implementation of the renderer or inline {{ }} substitution
- Full content or correctness of the two example .amx files (full versions come in Sprint 006)
- Functional CLI commands (the cli.ts may be a stub that parses args but does not yet execute render/run)
- Any passing tests that validate language behaviour (skeletons only)
- Langium, VS Code extension, imports (CSV/JSON/.amx), units, charts, PDF/Word export, or any items listed in spec section 4
- Mono-repo restructuring or additional packages
- Complete user documentation or acceptance test suite

## Constraints

- Strictly follow the 120x process and builder rules in .agents/main.md. Work only from the written sprint artifacts.
- Use bun as the package manager and script runner (per master plan clarification; "npm install" wording in the language spec is illustrative only).
- Architecture must remain simple, modular, and general-purpose. Do not embed Asset Management domain concepts inside parser, ast, runtime, or renderer.
- All files created must be new; do not overwrite existing content without explicit Lead Developer approval.
- TypeScript strict mode from day one.
- Source locations and full AST shape should be anticipated in the types.ts skeleton (even if not used yet).
- Keep changes minimal and focused. No scope creep into Sprint 002 (AST details, frontmatter parsing, statement splitting, basic expressions).
- At end of sprint the project must be in a state where a fresh clone + bun install + build + test is green.
- Record decisions and status updates in the planning/ files.
- If any assumption is required, mark it clearly and record in planning/questions.md.
