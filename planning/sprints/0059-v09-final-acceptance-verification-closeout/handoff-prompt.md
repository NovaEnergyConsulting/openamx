# Sprint 059 Handoff Prompt

You are the Builder for OpenAMX Sprint 059.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- Approved Sprint 051 technical contract in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 058 requirements, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 052-057 evidence only where needed to retain the correct historical statuses
- Sprint 059 `requirements.md`, `blueprint.md`, and `acceptance.md`
- `vscode-extension/amx.tmGrammar.json`, extension host tests, desktop wrapper scripts/checks, root tests, and `examples/v09-measurement-report.amx`

## Entry Gate and Scope

Sprint 058 is **COMPLETE / APPROVED** by separate Lead Developer disposition. It delivered the V0.9 parity/docs/help/example work. Sprint 059 owns only the remaining final verification and acceptance evidence; it does not authorize new product behavior.

Sprint 058 recorded two unpassed verification residuals:

- The workspace lacked a TextMate tokenizer; grammar JSON/fence structure was checked, but actual TextMate token scopes were not exercised.
- Hutch `electrobun prepare` stalled for 7m47s before wrapped desktop typecheck/build. Direct Vue typecheck, Vite build, worker bundle, and runtime-resource copy steps passed; wrapper checks did not.

Historical Sprint 053/054/057 Windows host/RPC failures remain unpassed in their own evidence. Do not rerun or repair them unless specifically directed; do not represent them as passed.

## Task Contract

**owns**: Actual TextMate tokenization evidence; bounded Hutch wrapper reproduction and direct fallback checks; final available-host root/extension/desktop/example verification; Builder evidence and a separate final V0.9 disposition request.

**must_not**: Add language/product features; change the approved V0.9 contract; claim direct commands prove wrappers passed; treat missing tests or accepted residuals as passes; self-accept V0.9; claim native/Windows/macOS certification or release readiness.

**decision gates**: Use the smallest available TextMate-compatible tokenizer. If none is present, a minimal test-only dependency may be added with a clear rationale; do not add it to runtime dependencies. If verification demonstrates a real product defect, stop before semantic/source changes and obtain Lead Developer direction.

**acceptance**: Meet every criterion in `planning/sprints/0059-v09-final-acceptance-verification-closeout/acceptance.md`.

## Verification and Closeout

1. Run real TextMate tokenization against the actual grammar and assert token scopes, including executable versus inert/narrative boundaries.
2. Make one bounded Hutch wrapper attempt. If it stalls again, stop the idle process, retain the wrapper as unpassed, and run direct typecheck/build equivalents separately.
3. Run root build/full tests, VS Code compile/test/host checks, desktop RPC and Help UI, desktop wrapper/direct checks, and the representative example workflow. Record each command and result independently.
4. Compare results with the V0.9 contract and Sprint 058 capability matrix; do not expand implementation scope.
5. Update `builder-evidence.md`, `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Request the Lead Developer's explicit final V0.9 disposition; do not infer it from Sprint 058 approval or Sprint 059 Builder completion.