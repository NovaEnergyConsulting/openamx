# 007 Handoff Prompt

You are the Builder for `openamx` Sprint 007.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md` (create it in this sprint if it does not yet exist)
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/requirements.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/blueprint.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/acceptance.md`

Execute only the documented Sprint 007 scope. Do not invent business rules or redefine language decisions. If the repository lacks `.agents/main.md` or another referenced input, proceed using these sprint artifacts and record the missing reference in `planning/questions.md`; do not expand scope to recreate unrelated process files.

This sprint establishes the V0.2 language contract and executable-block parsing foundation. The key behavior change is deliberate: only `amx` fenced blocks are parsed as executable source, and bare V0.1 `let` lines outside such blocks become narrative. Ordinary Markdown fences and all surrounding narrative must remain non-executable and preserved.

## Task Contract

**objective**: Define the V0.2 language contract and extend the AST/parser to recognize executable `amx` fences, parse declaration statements inside them, preserve Markdown/front matter/source order, and report original-document source locations. Deliver the complete Sprint 007 acceptance criteria without implementing later-sprint features.

**owns**:
- `docs/language-spec-v0.2.md` (authoritative V0.2 grammar, migration and non-goals; create `docs/` if required)
- `src/ast/types.ts`
- `src/parser/parseDocument.ts`
- `src/parser/parseStatements.ts` and narrowly required parser support modules
- `tests/parser.test.ts`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/` (update this pack only to clarify verified details; do not silently change decisions)

**must_not**:
- Execute code blocks, evaluate documents, or change runtime/environment behavior.
- Implement assignment, `+=`, ranges, loops, loop-scoped bindings, `return`, or `match` parsing/evaluation; those belong to Sprints 008 and 009. Define their committed syntax/semantics in the language contract only.
- Change rendering, formatting, HTML output, inline interpolation resolution, CLI, examples, or extension packaging.
- Preserve a mode that executes bare V0.1 declarations.
- Treat ordinary backtick/tilde fences, non-executable labels, or `{{ expression }}` as executable blocks.
- Add Asset Management concepts or dependencies, replace the hand-written parser, reorganize the repository, or implement V0.3 candidates.
- Weaken unrelated tests or modify files outside the owns list without recording a concrete blocker and rationale.

**acceptance**:
- Meet every item in `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/acceptance.md`.
- Fence detection is case-sensitive and accepts only trimmed info string `amx`; opener and closer behavior follows the exact fence rules in requirements and decisions.
- Declaration statements are parsed only within executable blocks. Bare `let` outside them stays narrative.
- Preserve ordinary Markdown fences and source order, and report locations as 1-based document coordinates including front matter and delimiters.
- Newline is the only statement/match-arm separator; semicolons do not act as separators. The language contract records the committed `match` syntax and fallback behavior.
- Later-sprint syntax is specified but not implemented.

**verification**:

1. Run focused parser tests after the first parser/AST implementation change, especially executable fence vs bare-let narrative behavior and original source coordinates.
2. Run `bun run build`.
3. Run `bun test`.
4. Inspect parser test results to confirm all boundary cases in the acceptance criteria are explicitly exercised.
5. Update `planning/state.md` and `planning/questions.md` with completion status and any actual deviations; do not mark Sprint 007 complete until all acceptance criteria pass.
