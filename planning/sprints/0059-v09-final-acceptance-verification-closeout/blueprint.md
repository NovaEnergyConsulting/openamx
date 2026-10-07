# Sprint 059 Blueprint: V0.9 Final Acceptance and Verification Closeout

## Approach

1. Confirm Sprint 058's separate **COMPLETE / APPROVED** disposition and read its Builder evidence. Preserve the actual pass/fail status of every historical Windows result and the two Sprint 058 verification residuals.
2. Freeze product scope to the approved V0.9 contract. Do not patch runtime or editor behavior unless a test demonstrates a product defect and the Lead Developer explicitly directs that correction.
3. Establish a real grammar-tokenization test for `vscode-extension/amx.tmGrammar.json`. First inspect whether a compatible TextMate tokenizer is already available. If not, add only the smallest test-only dependency required (not a production dependency), update its lockfile, and explain the choice. Test token scopes for declarations/keywords, measurement syntax, record delimiters, strings and interpolation, malformed/incomplete drafts, exact AMX fences, inert fences, and Markdown narrative.
4. Reproduce the `hutch electrobun prepare` stall with an explicit bounded execution window appropriate to the observed 7m47s stall. Capture command, elapsed time, output, and process status. If preparation completes, run the wrapper typecheck and `build:web`; if it stalls, stop the idle process and record it as unpassed. Run the direct Vue typecheck, Vite build, worker bundle, and runtime-resource copy steps to confirm their own statuses without claiming wrapper success.
5. Run the integrated available-host acceptance set from a cleanly observed worktree state: `bun run build`, `bun test`, VS Code compile/test/Development Host, desktop RPC contract, desktop typecheck/build or clearly scoped direct equivalents, focused Help UI tests, and CLI execution/render/output of `examples/v09-measurement-report.amx` with its JSON fixture. Record environment and results per command.
6. Review results against Sprint 058's capability matrix and V0.9 acceptance contract. Compare exact grammar scopes, shared editor facts, diagnostics/source ranges, example JSON/HTML behavior, and desktop Help behavior. Do not expand the test suite beyond these final acceptance risks unless a concrete failure requires it.
7. If a required verification remains blocked/unavailable, document the evidence boundary and concrete follow-up; do not silently waive it. Preserve Sprint 053/054/057 Windows findings separately and do not spend this sprint repairing them.
8. Write `builder-evidence.md` with exact commands, versions/host, exit statuses, test totals, tokenizer output, wrapper/direct result distinction, example artifacts, and residuals. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with Builder completion and a request for final Lead Developer V0.9 disposition.
9. The Lead Developer makes the final V0.9 disposition separately. The disposition may accept with explicitly recorded residuals or keep acceptance pending; the Builder must not claim or infer it.

## Files to Update

- `vscode-extension/package.json` and its lockfile only if a test-only TextMate tokenizer is unavailable and required; do not add runtime dependencies
- Focused VS Code grammar-tokenization tests and, if needed, a small reusable tokenizer test helper
- No production behavior files unless an explicit Lead Developer-directed acceptance fix is authorized
- `planning/sprints/0059-v09-final-acceptance-verification-closeout/builder-evidence.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| TextMate grammar | A TextMate-compatible tokenizer executes the actual grammar and asserts expected scopes for V0.9 syntax, incomplete syntax, executable fences, inert fences, and narrative. |
| Desktop wrapper | The Hutch preparation/typecheck/build attempt has a bounded, explicit result; direct steps are separately recorded and never misreported as wrapper passes. |
| Integrated root | Root build and full tests pass, with exact totals and skips/failures recorded. |
| Integrated VS Code | Extension compilation, test compilation, and available-host tests pass; TextMate tokenization result is independent evidence. |
| Integrated desktop | RPC, direct or wrapped typecheck/build, and focused Help UI checks pass or retain precise unpassed outcomes. |
| User workflow | The representative V0.9 example runs/renders and exposes the expected measurement JSON and HTML report content. |
| Evidence | All new and historical residuals remain accurately classified; final V0.9 disposition is requested separately from sprint implementation status. |

## Verification

- `bun run build`
- `bun test`
- `bun run --cwd vscode-extension test`, plus the tokenizer-backed grammar test
- `bun run --cwd desktop-app test`
- Bounded `bun run --cwd desktop-app typecheck` and `bun run --cwd desktop-app build:web`; if Hutch stalls, run and record direct equivalents from `desktop-app/`
- Focused desktop Help UI test: `bun run --cwd desktop-app test:ui -- tests/ui/help-center.pw.ts`
- Run/render the V0.9 example using existing `tests/examples.test.ts` coverage and inspect/assert exact JSON and HTML results
- `git diff --check` on owned paths; record unrelated whole-worktree findings without modifying unrelated files

No check is inferred from another command's result. Record exact command, working directory, host/tool versions, exit status, test totals, duration for bounded wrapper checks, and any output artifact/hash in Builder evidence.

## Notes

- Sprint 058 is the implementation/editor/docs sprint. Sprint 059 is only the final acceptance evidence gate and must not become an unplanned feature sprint.
- Lead Developer final V0.9 acceptance is an explicit separate decision. Sprint completion alone does not establish it.