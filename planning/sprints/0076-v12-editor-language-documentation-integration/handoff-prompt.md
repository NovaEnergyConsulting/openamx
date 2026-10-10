# Sprint 076 Handoff Prompt

You are the Builder for OpenAMX Sprint 076: V0.12 Editor and Language Documentation Integration.

## Read First

- `.agents/main.md` and the current worktree status; preserve all existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All Sprint 076 artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Sprint 072 `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`.
- Sprint 073, 074, and 075 artifacts and `builder-evidence.md`; the approved diagnostic identities AMX3011-AMX3021 and effective-field order are binding.
- Shared editor/formatter services, VS Code grammar/providers/host tests, desktop CodeMirror/help/RPC/UI tests, README, language docs, and examples named in the blueprint.

## Authority and Entry Gate

- All confirmed feature semantics and diagnostic allocations are fixed by the V0.12 master plan, Sprint 072 fixtures, and approved decisions recorded in `planning/decisions.md`.
- Sprints 073-075 are implemented. Sprint 075's focused parser/evaluator/formatter/module suites and root build pass; its final root suite has two failures matching the preceding baseline.
- Before editing production code, tests, examples, README, Help, or language documentation, obtain explicit Sprint 076 execution authorization and approval of the concrete file-by-file implementation plan.

## Task Contract

- Deliver the V0.12 language specification, README links, two runnable V0.12 examples, and searchable desktop language Help.
- Make both existing editor clients consistent with the approved syntax through existing parser-derived services: VS Code grammar/providers and shared/desktop highlighting, diagnostics, completion, formatting, symbols/navigation, and related capabilities where already supported.
- Extend the existing formatter for V0.12 syntax and verify meaning preservation/idempotence, including the legacy conditional expression.
- Extend existing root, VS Code Development Host, and desktop RPC/UI tests. Do not add parallel editor services or test infrastructure.
- Record exact evidence in Sprint 076 `builder-evidence.md`; keep Sprint 077 as the integrated V0.12 closeout gate.

## Mandatory Boundaries

- Do not change inheritance ordering, `override` semantics, enum semantics, braced `if` behavior, source-order/module rules, diagnostic codes/messages/ranges, or the legacy conditional contract.
- Do not claim a feature/editor capability unless directly covered by relevant test or inspection evidence.
- Preserve LF/CRLF source mapping, Markdown/inert-fence boundaries, and existing capability behavior.
- Compare root and desktop results with known baselines. Record inherited residuals separately from new failures; investigate any new unexplained failure.
- No package/extension version bumps, migration guide, release workflow, release/publication, or platform certification is in scope.

## Completion

Meet every criterion in `acceptance.md`, update planning status and questions/decisions only when needed, and leave a traceable evidence matrix in `builder-evidence.md`. Do not claim V0.12 closeout; Sprint 077 must perform that integrated acceptance separately.
