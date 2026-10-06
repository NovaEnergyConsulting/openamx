# Sprint 053 Builder Evidence

Date: 2026-10-06

## Outcome and Disposition

The Sprint 053 implementation and Builder verification are recorded below. The work is submitted for a separate Lead Developer disposition; the Builder does not self-accept it. This evidence does not claim completion of V0.9 or any other feature group.

Sprint 052 remains **ACCEPTED WITH RECORDED RESIDUALS**. Its original Windows VS Code Development Host result (14 passing, five failing) is not upgraded or re-described as a pass. The Sprint 053 rerun also failed on this Windows host, with 13 passing and six failing: five `EBUSY` temporary-directory cleanup errors and the existing drive-letter case assertion. The extension compilation and test compilation passed; the host suite is not green.

## Implementation

- Added a segmented string-interpolation AST node. Both quote styles decode exactly `\"`, `\'`, `\\`, `\n`, `\r`, `\t`, and `\${`; only double-quoted strings parse `${...}` expressions. Unknown escapes, incomplete syntax, and raw source line breaks produce `AMX3006`.
- Interpolation expressions are parsed by the existing AMX expression parser with original source locations, including nested delimiters, quoted braces, escaped quotes, and nested strings. Shared string scanning is used by parser boundary collection, formatter brace counting, and editor cursor/highlight scanning so nested quotes do not terminate enclosing constructs early.
- The checker statically checks every interpolation and permits only String, Number, Boolean, null, and nullable forms of those scalars. Collections and other types are rejected with `AMX3007`; no host evaluation or collection serialization is used.
- Runtime concatenation uses decoded String contents, `String(number)` for deterministic locale-independent Number text, lowercase Boolean text, and `null`. Unexpected non-scalar runtime values fail explicitly with `AMX3007`.
- Shared editor highlighting, completion visibility, and symbol references traverse embedded expressions. The VS Code grammar recognizes string interpolation only in AMX double-quoted strings and handles nested expression braces. Narrative and inert fences remain outside AMX scanning.
- Formatting remains layout-only and idempotent for valid interpolated strings. Narrative interpolation remains on its existing parser/evaluation path.
- No measurement runtime or measurement display conversion was added. Measurement-to-string verification remains with Sprint 056.

## Fixture Migration

| File | Migration | Rationale |
| --- | --- | --- |
| `examples/kitchen-sink.amx` | Changed `"C:\demo"` to `"C:\\demo"`. | Preserve the intended decoded path `C:\demo` now that unknown escapes are rejected. The AMX fixture inventory found no other positive string escape migration. Negative coverage was retained. |

## Changed Files

Production and fixture:

- `examples/kitchen-sink.amx`
- `src/ast/types.ts`
- `src/editor/completion.ts`
- `src/editor/highlighting.ts`
- `src/editor/symbols.ts`
- `src/formatter/formatAmx.ts`
- `src/parser/parseExpression.ts`
- `src/parser/parseStatements.ts`
- `src/parser/stringScanner.ts`
- `src/runtime/evaluateExpression.ts`
- `src/typechecker/checkDocument.ts`
- `vscode-extension/amx.tmGrammar.json`

Tests:

- `tests/editor.test.ts`
- `tests/evaluator.test.ts`
- `tests/formatter.test.ts`
- `tests/parser.test.ts`

Planning and evidence:

- `planning/sprints/0053-v09-string-escapes-expression-interpolation/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

No dependency manifests were changed.

## Verification Results

| Command | Result |
| --- | --- |
| `bun test tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts` | Pass: 140 tests, 0 failures, 517 expectations across four focused files. Covers escapes, nested interpolation, static checking, scalar rendering, collection rejection, LF/CRLF locations, editor isolation, and formatter stability. |
| `bun run build` | Pass; root TypeScript build (`tsc`). |
| `bun test` | Pass: 333 tests, 0 failures, 1,388 expectations across 27 files. |
| `Set-Location desktop-app; bun test src/bun/jobWorker.test.ts src/bun/configuration.test.ts src/bun/desktopDataEditor.test.ts src/bun/desktopSettings.test.ts src/mainview/diagnosticSummary.test.ts src/mainview/starterExamples.test.ts; if ($?) { bun run typecheck }` | Pass: 24 tests, 0 failures, 126 expectations across six files; desktop typecheck passes (`hutch electrobun prepare` and `vue-tsc --noEmit`). |
| `Set-Location vscode-extension; bun run test` | Extension compilation and test compilation pass. VS Code Extension Development Host: 13 pass, 6 fail. Five failures are Windows `EBUSY` temporary-directory cleanup errors; one is a drive-letter case assertion (`c:\...` versus `C:\...`). This is a failed host suite, not a pass. |
| `node -e "JSON.parse(require('fs').readFileSync('vscode-extension/amx.tmGrammar.json','utf8')); console.log('Grammar JSON valid')"` | Pass; grammar JSON parses. |
| `git diff --check` | Pass after final planning/evidence updates. |

## Residuals and Lead Developer Request

- The VS Code host suite remains unpassed on this Windows host. Sprint 052's accepted five-failure residual remains recorded; the Sprint 053 rerun observed five `EBUSY` cleanup failures plus the same path-case assertion. No Sprint 053 behavior regression was identified from these host failures.
- Measurement interpolation text is intentionally not tested before Sprint 056 supplies measurement values.
- Please review this evidence and provide a separate Lead Developer disposition. No Sprint 053 acceptance is claimed by the Builder.
