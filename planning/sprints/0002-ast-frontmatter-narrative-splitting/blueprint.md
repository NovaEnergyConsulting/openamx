# 002 Blueprint: AST, Front Matter, Narrative Splitting

## Approach

- Follow the master plan (plan-openamxV01MasterSprintPlan.md) Phase 2 – Parsing & Model exactly for Sprint 002.
- Use the 0000-sprint-template as the source and customize all four files for this sprint.
- Focus exclusively on defining the document model (AST) and implementing the first parsing stages: front matter extraction and statement/narrative splitting.
- Implement only enough expression node construction to support capturing `let name = <raw expression text>` for now. Full Pratt/recursive descent expression parsing is explicitly deferred to Sprint 003.
- Preserve source order rigorously.
- Ensure `let` lines are completely stripped from narrative content.
- Introduce SourceLocation early on AST nodes to support future diagnostics.
- Write focused parser tests that validate front matter, narrative extraction, let detection, order preservation, and stripping behaviour.
- Update planning/state.md and planning/decisions.md as required.
- Keep the build and test suite green at every step.
- All code must remain general-purpose; no Asset Management domain logic in parser or AST.

## Files to Create or Update

**Primary implementation targets (Sprint 002 scope)**
- src/ast/types.ts — replace placeholder with complete, explicit AST definitions per language-spec-v0.1.md section 6.
- src/parser/parseFrontMatter.ts — implement YAML front matter detection and parsing.
- src/parser/parseDocument.ts — implement file reading, front matter delegation, and orchestration of statement splitting.
- src/parser/parseStatements.ts — implement the statement splitter that produces ordered DocumentNode[] (narrative + variable declarations).
- src/parser/parseExpression.ts — may receive minimal literal/identifier scaffolding if required to keep types clean; otherwise remains a placeholder. No operator parsing.
- src/diagnostics/errors.ts — may receive basic error types or helpers if parser needs to report front matter or let syntax issues (keep minimal).

**Tests**
- tests/parser.test.ts — expand the skeleton with real tests for the in-scope behaviours listed in requirements.md.

**Planning artifacts**
- planning/state.md — update current status, sprint history, and next steps.
- planning/decisions.md — record any new decisions (e.g., how raw expression text is stored temporarily, source location granularity, error code conventions if introduced).
- planning/sprints/0002-ast-frontmatter-narrative-splitting/requirements.md (already created)
- planning/sprints/0002-ast-frontmatter-narrative-splitting/blueprint.md (this file)
- planning/sprints/0002-ast-frontmatter-narrative-splitting/acceptance.md
- planning/sprints/0002-ast-frontmatter-narrative-splitting/handoff-prompt.md

**No changes to**
- package.json, tsconfig.json, .gitignore
- runtime/, renderer/, cli.ts (beyond existing stubs), index.ts (beyond existing exports)
- examples/ content (stubs remain)
- evaluator.test.ts or renderer.test.ts (they may stay as skeletons)

## Notes

- Keep laser-focused on AST + front matter + splitting. Do not begin expression evaluation, arithmetic, precedence, conditionals, lists, stdlib, or rendering.
- Expression nodes created during this sprint may be minimal (e.g., a temporary "raw" representation or simple literal/identifier nodes). The full expression grammar and parser belong to Sprint 003.
- SourceLocation should be attached where line information is readily available from the splitter. Column precision can be basic.
- Narrative content inside NarrativeNode must be the exact text with all `let ...` lines removed, preserving surrounding whitespace and paragraph structure for later Markdown rendering.
- Front matter parsing should tolerate common YAML edge cases (empty block, no block, simple scalars) but does not need to support complex YAML features.
- If the splitter encounters a line that looks like `let` but is malformed, record the question and produce a clear diagnostic (do not silently ignore).
- After this sprint the repository will have a working document model and parser foundation ready for the evaluator in Sprint 003.
- Verify at the end: `bun install && bun run build && bun test`.
