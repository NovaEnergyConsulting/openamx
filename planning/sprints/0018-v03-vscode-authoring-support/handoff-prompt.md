# 018 Handoff Prompt

You are the Builder for `openamx` Sprint 018.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0011-vscode-extension/acceptance.md`
- `planning/sprints/0017-csv-json-output/acceptance.md`
- `planning/sprints/0018-v03-vscode-authoring-support/requirements.md`
- `planning/sprints/0018-v03-vscode-authoring-support/blueprint.md`
- `planning/sprints/0018-v03-vscode-authoring-support/acceptance.md`
- `vscode-extension/README.md`

Execute only Sprint 018 scope. The V0.3 contract is authoritative. Do not invent editor-only language or import semantics. Record a genuinely blocking ambiguity in `planning/questions.md` before changing the contract.

Sprint 017 completed typed data input/output in the CLI. This sprint improves direct-provider authoring without running AMX or reading data inputs in the editor. Sprint 019 owns release examples, broad documentation, and final acceptance.

## Task Contract

**objective**: Deliver V0.3 executable-fence formatting, scoped completion, and source-located static diagnostics in the Node-host VS Code extension; verify host behavior and a locally installed VSIX while retaining V0.2 regression behavior.

**owns**:

- `vscode-extension/src/providers/formatting.ts`, `completion.ts`, and `diagnostics.ts`
- `vscode-extension/src/extension.ts` only if needed for provider lifecycle
- `vscode-extension/src/test/` and focused fixtures
- `src/formatter/formatAmx.ts` and focused formatter tests only for V0.3 parser-valid layout
- Focused pure parser/checker or read-only module-analysis support only where needed for imported editor symbols and diagnostics
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 018 artifacts only to correct facts or record approved clarifications

**must_not**:

- Call Bun or the evaluating `loadEntryModule` from the extension host; execute modules, read CSV/JSON inputs, write data files, or publish runtime validation as static diagnostics.
- Add an LSP or change CLI input/output behavior, V0.3 language grammar/type rules, Asset Management schemas, or V0.2 no-option behavior.
- Format narrative/front matter/ordinary fences, complete inaccessible imported/private/later names, or emit AMX diagnostics for inert source.
- Publish/upload a VSIX, choose/add a license, or expand into Sprint 019 examples/release documentation/version metadata.
- Weaken root or existing Extension Development Host tests to make this sprint pass.

**acceptance**:

- Meet every item in `planning/sprints/0018-v03-vscode-authoring-support/acceptance.md`.
- Prove V0.3 format/completion/type diagnostics and imported-symbol visibility against actual editor documents.
- Prove V0.2 provider regression and that unsaved-buffer checking does not execute code or read data inputs.
- Package/install a local VSIX and record observed host, artifact, warnings, and any unsupported installed-host check.

**verification**:

1. After the first provider/formatter edit, run the focused formatter or host test for an executable V0.3 `type` block alongside untouched ordinary Markdown and V0.2 fences.
2. Run host tests for in-scope V0.3 completion, explicit import visibility, original-coordinate type errors, and clearing on edit; confirm the legacy V0.2 host tests remain green.
3. Run root `bun run build && bun test`; from `vscode-extension/`, run `bun run compile` and `bun run test` in the Extension Development Host.
4. Package a VSIX with `CI=1 bun run package`, install with `bun run install-local`, confirm `code --list-extensions --show-versions`, and rerun host tests against the installed extension where supported.
5. Record exact commands, test counts, VS Code engine, package/install outcome, limitations, and license warning. Mark Sprint 018 complete only after required host and local-install gates pass.
