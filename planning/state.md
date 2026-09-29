# Planning State

## Current Status

- Master plan approved (plan-openamxV02MasterSprintPlan.md); V0.2 implementation is active.
- Sprint 007: V0.2 Language Contract, AST & Fenced Parsing — COMPLETE.
- Sprint folder: planning/sprints/0007-v02-language-contract-ast-fenced-parsing/
- Sprint 008: Mutable Bindings, Ranges & Loops — COMPLETE.
- Sprint folder: planning/sprints/0008-mutable-bindings-ranges-loops/
- Sprint 009: Match Expressions — COMPLETE; Sprint 010 is next.
- Sprint folder: planning/sprints/0009-match-expressions/
- Sprint 010: Canonical Formatter & Renderer Integration — COMPLETE; canonical formatting, shared block evaluation, and final-context rendering verified.
- Sprint folder: planning/sprints/0010-canonical-formatter-renderer-integration/
- Sprint 011: VS Code Extension — COMPLETE; direct providers tested in VS Code 1.85.0 and VSIX locally installed.
- Sprint folder: planning/sprints/0011-vscode-extension/
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
- Sprint 008: Implemented mutable/redeclared bindings, assignment and `+=`, inclusive finite-integer ranges, statement and expression loops, contextual return validation, shared-environment evaluation, and iterator shadow restoration. Added parser/evaluator acceptance coverage while preserving the Sprint 007 fenced-code boundary. `bun run build` passes; focused parser/evaluator tests pass (70 tests); `bun test` passes (81 tests). Sprint 008 COMPLETE with no deviations; match remains Sprint 009 and document orchestration remains Sprint 010.
- Sprint 009 Architect preparation: customized the four sprint artifacts for match-expression parsing/evaluation and aligned the V0.2 spec on literal equality, default cardinality/placement, first-match ordering, and lazy branch evaluation. No Sprint 009 implementation has started.
- Sprint 009 Builder completion: Added braced match expression parsing and strict, lazy evaluation with case order, mandatory default, nested composition, and original-document match/arm locations. Focused parser/evaluator tests passed (78 tests); `bun run build` passed; full `bun test` passed (89 tests). A strengthened once-only scrutinee assertion subsequently passed in the focused evaluator suite (55 tests). No renderer or document-wide execution changes; no contract deviations.
- Sprint 010 Architect preparation: customized the four sprint artifacts for canonical code-block layout formatting, shared source-order document execution, visible escaped code blocks, and final-environment interpolation. Updated the V0.2 language spec with formatting/output behavior. No Sprint 010 implementation has started.
- Sprint 010 Builder completion: Added an idempotent layout formatter; document evaluation now executes executable-block statements once in source order through one shared environment while preserving the plain-object API. Rendering formats and escapes visible code blocks and resolves narrative interpolation after execution. Formatter tests passed (3 tests); focused evaluator/renderer tests passed (70 tests); `bun run build` passed; final full `bun test` passed (96 tests, 261 assertions). Bare declarations and ordinary fences remain non-executable. No contract deviations.
- Sprint 011 Architect preparation: customized the four sprint artifacts for the direct-provider VS Code extension, pure buffer parsing, Node-host bundling, Extension Development Host tests, and local VSIX packaging/installation. Added the optional editor-support contract to the V0.2 spec. No Sprint 011 implementation has started.
- Sprint 011 Builder completion: Added `parseDocumentText` and preserved `parseDocument(path)` through delegation. Added the Node-host `vscode-extension/` package with block-only canonical formatting, scoped completions, parser diagnostics that exclude front matter/narrative, Extension Development Host tests, and local VSIX packaging. Root verification passed (`bun run build && bun test`: 97 tests, 265 assertions); extension host tests passed (3 tests) on VS Code 1.85.0 both from the source package and the installed VSIX. `openamx-vscode-0.2.0.vsix` packaged (6 files, 61.67 KB) and installed with the WSL VS Code CLI; the installed extension opened a real `.amx` test document and all provider tests passed. No language-contract or runtime deviations. `vsce` warned that the repository has no license file; local packaging continued, and a license decision/file is needed before publication.

## Next Steps

- Sprint 006 COMPLETE (see Sprint History). CLI, examples, full tests, documentation, and V0.1 acceptance are complete.
- Sprint 007 COMPLETE (V0.2 Language Contract, AST & Fenced Parsing).
- Sprint 008 COMPLETE (Mutable Bindings, Ranges & Loops). Sprint 009 COMPLETE (Match Expressions). Sprint 010 COMPLETE (Canonical Formatter & Renderer Integration). Sprint 011 COMPLETE (VS Code Extension); Sprint 012 is next.
- Continue to follow 120x process: only documented scope per active sprint.
- Keep build and test green: `bun install && bun run build && bun test`.
- Record any future clarifications in planning/decisions.md or planning/questions.md.
