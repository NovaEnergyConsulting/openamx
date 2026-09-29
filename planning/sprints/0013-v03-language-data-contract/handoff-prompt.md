# 013 Handoff Prompt

You are the Builder for `openamx` Sprint 013.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `README.md`
- `planning/sprints/0013-v03-language-data-contract/requirements.md`
- `planning/sprints/0013-v03-language-data-contract/blueprint.md`
- `planning/sprints/0013-v03-language-data-contract/acceptance.md`

Execute only Sprint 013 scope. This is the V0.3 language/data contract sprint, not an implementation sprint. Do not invent language rules or begin parser, runtime, CLI, data, library, or extension work. Record a genuinely blocking ambiguity in `planning/questions.md` before changing the contract.

V0.2 is complete. Preserve its fenced-document syntax, runtime behavior, renderer behavior, and existing no-option `run` and `render` commands as the additive compatibility baseline. Sprint 014 is the first implementation sprint; it must not begin until this contract is complete and accepted.

## Task Contract

**objective**: Deliver the authoritative V0.3 language and data contract, the completed Sprint 013 planning artifacts, and an accurate planning record that resolves typed records, static checking, pure functions, local modules, logical data inputs, validation, output, and the opt-in Asset Management library.

The six Asset Management schemas are initial structural contracts only; do not assert domain calculations, scales, constraints, or standards approval. Their domain review remains a later stability gate.

**owns**:

- `docs/language-spec-v0.3.md`
- `planning/sprints/0013-v03-language-data-contract/requirements.md`
- `planning/sprints/0013-v03-language-data-contract/blueprint.md`
- `planning/sprints/0013-v03-language-data-contract/acceptance.md`
- `planning/sprints/0013-v03-language-data-contract/handoff-prompt.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

**must_not**:

- Modify `src/`, `tests/`, `examples/`, `vscode-extension/`, dependency manifests, generated HTML, or `docs/language-spec-v0.2.md`.
- Implement or partially scaffold V0.3 parser, AST, checker, runtime, CLI, input/output, library, or editor behavior.
- Redefine V0.2 compatibility, re-enable V0.1 bare declaration execution, or broaden the release to deferred features.
- Add a license, publish/upload a VSIX, or make a Marketplace decision.
- Leave syntax, path, null/default, CSV nested-value, validation, export, function-purity, or module-cycle rules ambiguous for later implementation sprints.

**acceptance**:

- Meet every criterion in `planning/sprints/0013-v03-language-data-contract/acceptance.md`.
- Make `docs/language-spec-v0.3.md` authoritative and explicit about V0.2 additive compatibility.
- Specify grammar and semantics for records/types, checker coverage, pure functions, modules/imports/exports, inputs, JSON/CSV conversion, validation, output, and the six opt-in Asset Management records.
- Define deterministic, source-located type/module/data/output diagnostic behavior and keep filesystem paths outside AMX execution.
- Treat the initial Asset Management field shapes as provisional structural contracts and record the later domain-review gate accurately.
- Update planning state, decisions, and questions with the active sprint, resolved choices, and any remaining non-blocking concerns.

**verification**:

1. Review the completed V0.3 specification against every Sprint 013 acceptance item and the V0.3 master plan.
2. Confirm the four Sprint 013 artifacts use the project template structure and are mutually consistent.
3. Run Markdown diagnostics for all new/changed Sprint 013 documents and repair diagnostics introduced by this sprint.
4. Run `git diff --check` from the repository root.
5. Run `bun run build` and `bun test` to confirm documentation-only work did not alter the V0.2 baseline. Record exact results and any pre-existing unrelated diagnostics in the planning logs; do not claim a command passed unless executed.
