# 010 Handoff Prompt

You are the Builder for `openamx` Sprint 010.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/acceptance.md`
- `planning/sprints/0008-mutable-bindings-ranges-loops/acceptance.md`
- `planning/sprints/0009-match-expressions/acceptance.md`
- `planning/sprints/0010-canonical-formatter-renderer-integration/requirements.md`
- `planning/sprints/0010-canonical-formatter-renderer-integration/blueprint.md`
- `planning/sprints/0010-canonical-formatter-renderer-integration/acceptance.md`

Execute only Sprint 010 scope. Do not invent language/runtime rules or silently redefine accepted V0.2 semantics. Record any genuinely blocking ambiguity in `planning/questions.md` before changing the contract.

Sprint 007–009 language parsing and per-expression/statement evaluation are complete. This sprint connects parsed executable blocks into document evaluation/rendering, adds final-environment interpolation, and formats/displays executable source. Sprint 011 is the VS Code extension sprint; do not start extension work here.

## Task Contract

**objective**: Implement an idempotent canonical layout formatter for `amx` source; evaluate executable code blocks in source order in one shared environment; render visible escaped formatted blocks in the generated HTML; and resolve narrative `{{ expression }}` against the final environment after all blocks execute.

**owns**:
- `src/formatter/formatAmx.ts` (or an equivalent focused formatter module)
- `src/runtime/evaluateDocument.ts`
- `src/renderer/renderHtml.ts`
- `tests/formatter.test.ts`
- `tests/evaluator.test.ts`
- `tests/renderer.test.ts`
- `docs/language-spec-v0.2.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- The four Sprint 010 artifacts only for verified clarifications/deviations

**must_not**:
- Execute declarations outside `ExecutableCodeBlockNode`s or reintroduce V0.1 bare-let execution.
- Execute an executable code block more than once, evaluate inline placeholders before all blocks finish, or use separate environments per block.
- Pass executable source through Markdown or inline interpolation; render it only as HTML-escaped code.
- Change V0.2 grammar or Sprint 007–009 semantics. Do not change CLI commands, examples, or add VS Code extension work.
- Add dependencies or Asset Management domain behavior, or implement V0.3 candidates.
- Modify surrounding Markdown during formatter operation or weaken existing tests.

**acceptance**:
- Meet every item in `planning/sprints/0010-canonical-formatter-renderer-integration/acceptance.md`.
- Formatter is idempotent and syntactically valid; use canonical layout exactly as specified and preserve expression tokens/text within lines.
- `evaluateDocument` executes all executable-block statements in source order against one shared environment and retains its plain-object return API.
- Rendering uses a two-pass flow: execute every block once; then render nodes in source order, resolving all narrative interpolations against final context and showing each executable block as escaped formatted code.
- Preserve standalone HTML/title behavior and Markdown rendering. Non-`amx` fences and bare declarations remain non-executable.
- Migrate old V0.1 test fixture helpers to V0.2 fenced/code-block fixtures; do not add a production compatibility path for them.

**verification**:

1. After the first formatter edit, run focused formatter tests for idempotence, parse-valid output, nested indentation, and strings containing braces.
2. After integration, run focused evaluator/renderer tests for a shared mutation across blocks, final-context interpolation before a later mutation, visible escaped formatted source, and an ordinary Markdown fence.
3. Run `bun run build`.
4. Run `bun test`.
5. Confirm output remains deterministic and all generated executable code is escaped; document actual verification results and any deviations. Mark Sprint 010 complete only after all acceptance criteria pass.
