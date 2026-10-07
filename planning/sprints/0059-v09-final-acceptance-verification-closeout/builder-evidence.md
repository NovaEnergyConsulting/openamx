# Sprint 059 Builder Evidence: V0.9 Final Acceptance Verification

## Status

Builder verification evidence is complete and submitted for Lead Developer review; Sprint 059 disposition and final V0.9 acceptance are **PENDING**. Actual TextMate tokenization exposed a grammar boundary defect, which was corrected in the grammar after the user authorized the fix. The Hutch wrapper again stalled and remains unpassed.

## Environment

- Host: Omarchy Linux `nova`, x86_64, kernel `7.2.5-3-omarchy`
- Bun `1.4.2`; Node `v24.14.1`
- VS Code Extension Development Host `1.85.0`
- `vscode-textmate` `9.3.2`; `vscode-oniguruma` `2.0.1`
- Hutch `0.27.1`; Playwright `1.63.0`

The tokenizer packages were absent from the workspace before this sprint. Both were added only to `vscode-extension` `devDependencies`; neither is a runtime dependency.

## Changed Files

- `vscode-extension/package.json`
- `vscode-extension/bun.lock`
- `vscode-extension/amx.tmGrammar.json`
- `vscode-extension/src/test/providers.host.ts`
- `planning/sprints/0059-v09-final-acceptance-verification-closeout/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

The only production-facing change is TextMate grammar recovery at line endings for AMX strings and interpolation rules; no parser, checker, runtime, report, or language semantics changed.

## TextMate Tokenization

The host test loads the actual `vscode-extension/amx.tmGrammar.json` with `vscode-textmate` and the `vscode-oniguruma` WASM engine. This is real tokenization, not grammar JSON inspection.

Token scopes passed for `dimension`/`unit`, numbers, measurement conversion `in`, list indexing and `add`/`remove`, `=` record construction, escaped `${`, active string interpolation, malformed-but-closed interpolation, narrative prose, narrative `{{...}}`, and ordinary inert fences. The final Linux Extension Development Host run passed all 22 tests.

**Defect and correction:** before the fix, an unterminated interpolated string in an executable AMX fence kept the TextMate rule stack active after its closing Markdown fence. A later JavaScript/inert fence was tokenized as executable AMX; `let` received `keyword.control.amx`.

Minimal reproduction:

````markdown
```amx
let unfinished = "${1 +
```
```js
let inert = 2
```
````

The grammar now allows double-quoted strings, single-quoted strings, string interpolation, and nested interpolation expression braces to recover at end-of-line. V0.9 strings are single-line, so this unwinds malformed drafts before the enclosing Markdown fence is tokenized. The actual-tokenizer regression confirms the later inert `let` has no `keyword.control.amx` scope. It also verifies that a three-backtick line does not close a four-backtick executable fence, that following AMX remains executable until the exact closer, and that narrative `{{...}}` ends at both braces and leaves following prose outside the interpolation scope.

## Verification Results

| Command / check | Result |
|---|---|
| `bun run build` from repository root | **PASS** (`tsc`) |
| `bun test` from repository root | **PASS**: 377 passed, 2 skipped (Windows-only), 0 failed; 1,875 expectations across 31 files |
| `bun run compile-tests` from `vscode-extension/` | **PASS** |
| `bun run test` from `vscode-extension/` | **PASS**: extension compile and test compile passed; Linux Extension Development Host 22 passed, 0 failed, including actual TextMate scopes and malformed-draft/fence recovery |
| `bun run test` from `desktop-app/` | **PASS**: RPC/workflow contract assertions passed; final active resources 0 |
| `bun test` from `desktop-app/` | **PASS**: 28 passed, 0 failed; 149 expectations across 8 files |
| `bun run test:ui -- tests/ui/help-center.pw.ts` from `desktop-app/` | **PASS**: 2 passed, 0 failed |
| `bun run dist/cli.js run examples/v09-measurement-report.amx --input trips=examples/v09-trips.json --output exportedSummaries=<temporary-file>` from repository root | **PASS**; run completed and exported JSON matched exact route, value, and unit forms for both rows |
| `bun run dist/cli.js render examples/v09-measurement-report.amx --out <temporary-file> --input trips=examples/v09-trips.json` from repository root | **PASS**; HTML assertions passed for converted narrative, measurement table rows/units, both routes, and chart title |
| `timeout --signal=TERM --kill-after=15s 510s bun run typecheck` from `desktop-app/` | **UNPASSED / STALLED**: stopped at 510.002 seconds with exit 124; Hutch remained in `hutch electrobun prepare` and never reached `vue-tsc`. Timeout sent SIGTERM, and a process check found no remaining Hutch/typecheck process. |
| `bun run build:web` wrapper from `desktop-app/` | **NOT RUN**: the bounded preparation gate stalled. No wrapper build pass is inferred from direct steps. |
| `./node_modules/.bin/vue-tsc --noEmit` from `desktop-app/` | **PASS**, direct fallback only |
| `./node_modules/.bin/vite build` from `desktop-app/` | **PASS**, 3,272 modules; existing chunk-over-500-kB warning |
| `bun build src/bun/jobWorker.ts --target=bun --outfile=dist/jobWorker.js` from `desktop-app/` | **PASS**, direct worker bundle |
| `bun run scripts/copy-sharp-runtime.ts` from `desktop-app/` | **PASS**, copied host-native linux-x64 Sharp runtime |
| `bun run scripts/copy-pdfmake-fonts.ts` from `desktop-app/` | **PASS**, copied four PDF fonts |
| `git diff --check` on Sprint 059-owned files | **PASS** |

The direct Vue/Vite/worker/resource results verify only those individual steps. They do not convert the Hutch `typecheck` wrapper or the unrun `build:web` wrapper into passes.

## Reconciliation and Residuals

- Sprint 058's capability matrix remains the implementation baseline: V0.9 editor parity, docs/help, and representative example behavior were already delivered and approved there. Sprint 059 introduced no product features.
- Root build/tests, VS Code compile/host checks, desktop RPC/unit/UI checks, and the representative workflow pass on this Linux host. Actual TextMate execution verifies V0.9 scopes and malformed-draft recovery, including executable/inert and narrative boundaries.
- Hutch preparation stalled again. Direct equivalents passed separately; both wrapper outcomes remain unpassed/not run as stated above.
- Historical Sprint 053 Windows Extension Development Host (13 pass/6 fail), Sprint 054 Windows RPC path-separator failure and host suite (15 pass/5 fail), and Sprint 057 Windows RPC path-separator failure and host suite (15 pass/5 fail) remain separately unpassed. This Linux run did not rerun or reclassify them.
- No native Electrobun interaction, Windows/macOS verification, platform certification, release readiness, or publication is claimed.

## Disposition Request

Lead Developer: please review Sprint 059 evidence and record the separate final V0.9 disposition as **accepted**, **accepted with residuals**, or **pending**, including disposition of the unpassed Hutch wrapper checks and preserved historical Windows residuals. Sprint 058 approval and Builder completion do not constitute final acceptance.