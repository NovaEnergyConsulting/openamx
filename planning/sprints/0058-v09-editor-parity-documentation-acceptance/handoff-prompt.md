# Sprint 058 Handoff Prompt

You are the Builder for OpenAMX Sprint 058.

## Read First

- `.agents/main.md` and any applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 cross-surface audit and conformance/migration matrix in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 053, 054, and 057 requirements, blueprints, acceptance files, Builder evidence, and Lead Developer dispositions
- Sprint 052, 055, and 056 approved contracts/evidence where their language features or module identities are involved
- Sprint 058 `requirements.md`, `blueprint.md`, and `acceptance.md`
- `src/editor/`, `src/formatter/`, VS Code `src/providers/` and `amx.tmGrammar.json`, desktop editor/worker/RPC, and focused tests
- `README.md`, `docs/`, `examples/`, `libraries/`, bundled `help-content.json`, and related docs/help/example tests

## Entry Gate and Residuals

The required dependencies Sprint 053, Sprint 054, and Sprint 057 are **COMPLETE / APPROVED** by separate Lead Developer dispositions. Sprint 052 is **ACCEPTED WITH RECORDED RESIDUALS**; Sprints 055 and 056 are **COMPLETE / APPROVED**.

Keep the recorded platform findings distinct and unpassed:

- Sprint 053 Windows VS Code Extension Development Host: 13 passed / 6 failed (five `EBUSY` cleanup failures and one drive-letter case assertion).
- Sprint 054 Windows desktop RPC check: path-separator assertion failed; Windows Extension Development Host: 15 passed / 5 failed (four `EBUSY` cleanup failures and one drive-letter case assertion).
- Sprint 057 Windows desktop RPC check: path-separator assertion failed; Windows Extension Development Host: 15 passed / 5 failed (four `EBUSY` cleanup failures and one drive-letter case assertion).

These are context, not blanket Sprint 058 blockers. A new failure affecting the actual Sprint 058 behavior must be investigated and recorded; do not re-label historical or current failures as passing.

## Objective

Close demonstrated V0.9 editor parity gaps, publish accurate user-facing docs/migration/help/examples, and verify representative integrated V0.9 workflows across available surfaces.

## Task Contract

**owns**: Final parity audit and narrowly scoped fixes; focused cross-client regression tests; V0.9 spec/README discoverability; approved compatibility migration guide; representative runnable examples; bundled searchable help; integrated verification and Builder evidence.

**must_not**: Change approved language/runtime/data/report semantics; add unrelated editor features or UI redesign; weaken strict checking; delete negative tests; rewrite historical specs; silently repair invalid source; claim native/platform certification or final V0.9 acceptance; alter unrelated user changes.

**decision gates**: Treat `docs/language-spec-v0.9.md`, the approved Sprint 051 appendix, and the master plan as authoritative. If actual behavior contradicts them, record the smallest reproducible case in `planning/questions.md` and obtain Lead Developer direction before changing semantics. Mark unsupported editor capabilities not applicable; do not create new ones just to achieve superficial parity.

**acceptance**: Meet every criterion in `planning/sprints/0058-v09-editor-parity-documentation-acceptance/acceptance.md`.

## Verification and Closeout

1. Run focused parser/formatter/editor/module/data/report tests for changed behavior, then `bun run build` and `bun test`.
2. Run `bun run --cwd vscode-extension test`; record compilation, test compilation, and Windows/available-host results separately.
3. Run desktop RPC, typecheck, web build, and focused Playwright tests as applicable. Record exact platform failures and skipped checks.
4. Execute all changed positive examples. Verify docs links, migration examples, Help JSON shape/search terms, and help UI coverage.
5. Check `git diff --check` for owned files; record unrelated whole-tree findings without editing their files.
6. Write exact changed-file/command/result/host/test-total evidence to `builder-evidence.md`, update planning state/decisions/questions, and request separate Lead Developer disposition. Do not self-accept Sprint 058.