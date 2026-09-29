# Planning State

## Current Status

- Master plan approved (plan-openamxV02MasterSprintPlan.md); V0.2 planning is active.
- Sprint 007: V0.2 Language Contract, AST & Fenced Parsing — COMPLETE.
- Sprint folder: planning/sprints/0007-v02-language-contract-ast-fenced-parsing/
- Sprint 008: Mutable Bindings, Ranges & Loops — ARCHITECT PACK PREPARED; Builder handoff ready; implementation not started.
- Sprint folder: planning/sprints/0008-mutable-bindings-ranges-loops/
- Project status: v0.1 complete; V0.2 in progress.
- Sprint 007 acceptance passed: V0.2 spec established; only exact executable `amx` fences produce code-block AST nodes; declarations outside those fences remain narrative; original-document locations and Markdown preservation are covered by parser tests.
- Master plan approved (plan-openamxV01MasterSprintPlan.md).
- Sprint 001: Project scaffolding, tooling, and planning artifacts COMPLETE.
- Sprint folder: planning/sprints/0001-project-scaffolding/
- Sprint 002: AST, Front Matter, Narrative Splitting — COMPLETE.
- Sprint folder: planning/sprints/0002-ast-frontmatter-narrative-splitting/
- Sprint 003: Variable Declarations + Basic Expressions + Evaluator — COMPLETE.
- Sprint folder: planning/sprints/0003-variable-declarations-basic-expressions-evaluator/
- Sprint 004: Comparisons, Logical, Conditionals, Stdlib, Lists — COMPLETE.
- Sprint folder: planning/sprints/0004-comparisons-logicals-conditionals-stdlib-lists/
- Sprint 005: Renderer + Inline {{ }} + HTML — COMPLETE.
- Sprint folder: planning/sprints/0005-renderer-inline-html/
- Sprint 006: CLI, Examples, Full Tests, Docs, Acceptance — COMPLETE.
- Project status: v0.1 complete.
- Project root contains: package.json, tsconfig.json, .gitignore, src/ with parser + AST + runtime implementation, examples/ with canonical v0.1 documents, tests/ with parser + evaluator + renderer coverage.
- Core modules implemented:
  - Full expression parser in src/parser/parseExpression.ts (arithmetic + comparisons == != > >= < <=, logicals and/or/not, single-line if/then/else conditionals, list literals [], function calls, full precedence table, right-associative ^).
  - src/parser/parseStatements.ts delegates to parseExpression for let RHS (all new expression forms supported).
  - src/runtime/environment.ts: Environment with set/get (AMX1004 on undefined).
  - src/runtime/evaluateExpression.ts: recursive evaluation for all expression node types (Binary with comparisons/logicals, Unary not, ConditionalExpressionNode, ListLiteralNode, FunctionCallNode); delegates stdlib; toBoolean coercion for logicals/conditionals.
  - src/runtime/standardLibrary.ts: full implementation of sum/min/max/mean/round/abs/sqrt/pow with list/scalar handling and AMX200x errors.
  - src/runtime/evaluateDocument.ts: source-order evaluation unchanged.
  - src/diagnostics/errors.ts: AmxError + AMX1004 (undefined) + AMX2000-2005 (stdlib type/arg/empty/negative).
  - src/cli.ts: functional `render` and `run` commands backed by the existing parse/evaluate/render pipeline.
- Parser tests (tests/parser.test.ts) continue to pass (front matter, narrative, lets, order).
- Evaluator tests in tests/evaluator.test.ts: all v0.1 expressions supported and passing.
- Renderer tests in tests/renderer.test.ts: explicit assertions for headings, paragraphs, let omission, substitution, title, stability, and pipeline smoke tests.
- Verification commands succeed cleanly: `bun install && bun run build && bun test` and the CLI verification sequence for both examples, including an undefined-variable failure check.
- Renderer implemented: src/renderer/renderHtml.ts (inline {{ }} substitution for full expression grammar, marked post-substitution, standalone HTML5, let omission, title from frontmatter).
- All modules remain general-purpose; no Asset Management domain concepts.
- Chained else-if conditionals explicitly not implemented (single-line if/then/else only; documented limitation).

## Sprint History

- Sprint 001: Artifacts prepared (requirements.md, blueprint.md, acceptance.md, handoff-prompt.md). Builder executed scaffolding. Sprint 001 complete.
- Sprint 002: Requirements, blueprint, acceptance criteria, and handoff prompt created per master plan. Builder implemented AST definitions, front matter parsing (YAML via `yaml` package), statement/narrative splitter (let stripping + order preservation), document orchestration (Bun file read), and comprehensive parser tests. All acceptance criteria met. Sprint 002 complete.
- Sprint 003: Requirements, blueprint, acceptance criteria, and handoff prompt created per master plan. Full implementation of arithmetic expression parsing, Environment, evaluators, AMX1004 diagnostics, and 16 new evaluator tests completed. All acceptance criteria met; 30 tests pass cleanly. Sprint 003 COMPLETE.
- Sprint 004: Requirements, blueprint, acceptance criteria, and handoff prompt created per master plan (Architect phase). Builder executed full scope: tokenizer + parser extensions for comparisons/logicals/conditionals/lists/calls, evaluator dispatch + toBoolean, complete standardLibrary.ts (8 functions + validation), exhaustive evaluator.test.ts additions (comparisons, logicals, conditionals, lists, stdlib, errors, precedence, integration). Parser bugs (lone > < tokenizer; leading 'if' before primary) discovered via new tests and fixed with two targeted edits. All 54 tests pass; build clean. Sprint 004 COMPLETE.
- Sprint 005: Requirements, blueprint, acceptance criteria, and handoff prompt created per master plan. Builder implemented full renderer layer: src/renderer/renderHtml.ts (inline {{ }} substitution for the complete v0.1 expression grammar using parseExpression + evaluateExpression, post-substitution marked rendering, standalone HTML5 document assembly, frontmatter title, deterministic value stringification, let omission). Replaced tests/renderer.test.ts skeleton with 10 real test suites (headings/paragraphs/bullets, let omission, simple+complex {{ }} substitution including all expression forms, multiple subs, AMX1004 surfacing, title handling, stability, full-pipeline in-memory smoke test using parseStatements + renderHtml). All 64 tests pass; build clean. No CLI or example work started. Sprint 005 COMPLETE.
- Sprint 007: Added `docs/language-spec-v0.2.md` as the authoritative V0.2 contract; extended AST with executable code blocks and V0.2 statement/expression scaffolding; changed document parsing to recognize exact case-sensitive `amx` fences only, preserve ordinary Markdown and bare declarations as narrative, and attach original-document locations. Added fence, migration, source-order, front-matter, interpolation, CRLF, and error-boundary coverage. `bun run build` passes; `bun test` passes (68 tests). Existing evaluator/renderer test-only fixture helpers were updated to construct lower-level AST fixtures directly after their former use of `parseStatements` as a mixed-document splitter failed; production runtime and renderer were not changed. Sprint 007 COMPLETE.
- Sprint 008 Architect preparation: customized the four sprint artifacts for mutable bindings, assignment, inclusive ranges, and simple statement/expression loops. Clarified the V0.2 grammar to include expression-form loops, exactly one per-iteration return, statement-loop return exclusion, and loop-variable scope. No Sprint 008 implementation has started.

## Next Steps

- Sprint 006 COMPLETE (see Sprint History). CLI, examples, full tests, documentation, and V0.1 acceptance are complete.
- Sprint 007 COMPLETE (V0.2 Language Contract, AST & Fenced Parsing). Sprint 008 pack is prepared at planning/sprints/0008-mutable-bindings-ranges-loops/; Builder executes only its documented scope.
- Continue to follow 120x process: only documented scope per active sprint.
- Keep build and test green: `bun install && bun run build && bun test`.
- Record any future clarifications in planning/decisions.md or planning/questions.md.
