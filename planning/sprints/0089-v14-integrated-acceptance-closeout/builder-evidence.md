# Sprint 089 Builder Evidence: Integrated Acceptance and V0.14 Closeout

## Status

**VERIFICATION COMPLETE; BUILDER RECOMMENDATION BLOCKED/OPEN; SPRINT 089 ACCEPTED/CLOSED WITH NAMED RESIDUALS.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 085 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 087 implementation disposition: ACCEPTED by user on 2026-10-16.
- Sprint 088 implementation/disposition: ACCEPTED and CLOSED by user on
  2026-10-16.
- Sprint 088 root focused result: 66 passed, 0 failed, 875 expectations
  across five files; core build passed.
- Sprint 088 VS Code raw final retry: 17 passed, 8 failed (six Windows
  `EBUSY` cleanup failures and two drive-letter case comparisons); the user
  separately closed Sprint 088's aggregate disposition as PASS after local
  deployment testing. Retain both records.
- Sprint 088 desktop UI: 3 passed, 0 failed in the Vite workflow harness.
  The user separately confirmed local desktop build/deployment functionality;
  no native CDP artifact or user test transcript was supplied.
- Desktop RPC sandbox-occurrence mismatch: historical baseline from
  Sprints 082/083, not rerun in Sprint 088.
- Sprint 089 execution authorization and exact file/output plan: APPROVED by
  the user on 2026-10-16 before integrated workflows or evidence edits.
- Starting environment: Windows_NT, Windows PowerShell 5.1.26100.9711,
  repository `C:\Users\gamez\Programming\openamx`, branch
  `feat/create-v0.14`, clean worktree; Bun 1.4.2, Node.js v24.13.1, Git
  2.56.0.windows.2, TypeScript 5.9.3, Playwright 1.63.0, Vite 6.4.3,
  VS Code Extension Development Host 1.85.0, Electrobun 2.0.1.
- Sprint 084 inventory: 30 canonical requirement IDs and 44 canonical
  fixture IDs. Sprint 089 evidence will trace every requirement and fixture
  to applicable surfaces and raw results.
- Sprint 089 integrated tests/evidence: complete; full results, failures,
  amendments, and artifacts are recorded below.
- Sprint 089 Builder recommendation: BLOCKED/OPEN.
- Separate V0.14 Lead Developer/product-owner disposition: ACCEPTED/CLOSED
  by the user on 2026-10-16 with the named residuals below. Raw
  `FAIL`/`BLOCKED/UNAVAILABLE` test statuses remain unchanged.
- Release/publication/version/platform certification authority: NOT GRANTED.

## Approved Execution File and Output Plan

User approval on 2026-10-16 covers the following exact closeout files and
verification outputs:

- Update this `builder-evidence.md`, `planning/state.md`,
  `planning/decisions.md`, `planning/questions.md`,
  `planning/STATUS.json`, and `planning/ARCHITECT_BRIEFING.md`.
- Create raw command logs and new Playwright screenshots only under this
  sprint's `artifacts/` directory:
  `preflight.txt`, `root-focused.log`, `root-build.log`,
  `example-runtime-type-checks.log`,
  `example-math-and-measurements.log`,
  `example-text-and-formatting.log`, `root-full-suite.log`,
  `vscode-host.log`, `desktop-typecheck.log`, `desktop-web-build.log`,
  `desktop-rpc.log`, `desktop-ui-first-attempt.log`,
  `desktop-ui-vite-server.log`, `desktop-ui-retry.log`, and
  `ui/` for Playwright outputs, with short child directories and filenames
  to keep Windows release-worktree paths below the checkout limit.
- Before running build/host workflows, preserve the existing mutable
  generated outputs by copying them to
  `C:\Users\gamez\.copilot\session-state\b36bf0ab-a388-46d2-85a7-76b18a145f16\files\sprint089-output-backup\`:
  root `dist/`, `src/renderer/diagramBrowserRuntime.ts`, desktop
  `dist/` and `build/`, VS Code `dist/` and `out/`, and VS Code test
  `user-data/` and `extensions/`.
- Keep existing `desktop-app/test-results/` unchanged by directing Playwright
  output to the new Sprint 089 `artifacts/ui/` directory. Use short paths
  `ui/help/help-1024.png`, `ui/help/help-1440.png`, and
  `ui/editor/v14-editor.png`; do not
  clean, delete, or overwrite prior evidence, screenshots, logs, or generated
  artifacts. Unexpected changed output paths are a stop condition.
- No source, test, fixture, specification, example, dependency, package,
  release, or publication files are authorized. Do not change test
  assertions, Windows path behavior, sandbox behavior, or product behavior.
- The native/package workflow is not authorized as release work. Inspect
  whether a supported direct native-test route exists; otherwise record
  `BLOCKED/UNAVAILABLE` with the exact limitation. Do not infer native
  acceptance from the Vite harness or prior user confirmation.

## Approved Verification Commands

From the repository root, run the focused V0.14/editor/example tests, core
build, each example, then the full root suite:

```powershell
bun test tests\isTypeChecking.test.ts tests\v14MathLibrary.test.ts tests\v14TextFormatting.test.ts tests\editor.test.ts tests\examples.test.ts
bun run build
bun run dist\cli.js run examples\v0.14-runtime-type-checks.amx
bun run dist\cli.js run examples\v0.14-math-and-measurements.amx
bun run dist\cli.js run examples\v0.14-text-and-formatting.amx
bun test
```

From `vscode-extension`, run the actual Extension Development Host suite:

```powershell
bun run test
```

From `desktop-app`, run typecheck, web build, RPC contract, and the focused
Vite-harness UI tests:

```powershell
bun run typecheck
bun run build:web
bun run test
bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts --output=..\planning\sprints\0089-v14-integrated-acceptance-closeout\artifacts\ui
```

Preserve a first UI-run Windows web-server failure if observed. Retry only by
starting the same configured Vite workflow harness through Bun and rerunning
the focused UI command; do not change test or harness configuration. Finish
with `git diff --check` and record all first attempts, retries, counts,
versions, raw outputs, residual owners, and statuses.

## Approved Plan Amendment and Initial Run Record

After the first full root-suite run, the suite left the following unexpected
untracked output in the repository root:
`openamx-output-test-1792123310870-lr0lt7n6mz/.keep`. The user approved a
narrow plan amendment on 2026-10-16 to preserve this exact path unchanged
and continue the already-approved VS Code and desktop workflows. The
artifact has not been edited or deleted. No root-suite retry is authorized
by this amendment.

| Action | Result | Raw evidence |
| --- | --- | --- |
| Focused V0.14, editor, and example tests: `bun test tests\isTypeChecking.test.ts tests\v14MathLibrary.test.ts tests\v14TextFormatting.test.ts tests\editor.test.ts tests\examples.test.ts` | PASS; 66 passed, 0 failed, 875 expectations across five files. | `artifacts/root-focused.log` |
| Core build: `bun run build` | PASS; exit code 0. No product file change observed from the generated-runtime check. | `artifacts/root-build.log` |
| Three V0.14 CLI examples | PASS; each command exited 0 and emitted bindings/Measurement units matching its example assertions. | `artifacts/example-runtime-type-checks.log`, `artifacts/example-math-and-measurements.log`, `artifacts/example-text-and-formatting.log` |
| Full root suite: `bun test` | FAIL; 534 passed, 1 failed, 3,580 expectations; 535 tests across 43 files. `desktop release packaging > rejects inconsistent versions on a clean committed source tree` timed out after 5,000 ms; the runner reported one dangling process. | `artifacts/root-full-suite.log` |
| Unexpected full-suite output | Preserved unchanged at `openamx-output-test-1792123310870-lr0lt7n6mz/.keep`; user-approved amendment permits this exact observed path. | Repository-root untracked path; not cleaned |

The full-suite failure is recorded as observed; no test, assertion, release
behavior, or product code was changed. VS Code and desktop results are
recorded separately in the surface matrix; no root-suite retry was run.

## Second Approved Plan Amendment: Playwright Output Location

The approved Playwright command used `--output=..\..\planning\...` from
`desktop-app/`, which resolved one directory above the repository. The UI
retry passed 3/3, and Playwright wrote `.last-run.json` plus three screenshots
to
`C:\Users\gamez\Programming\planning\sprints\0089-v14-integrated-acceptance-closeout\artifacts\desktop-ui\`.
The user approved a second narrow amendment on 2026-10-16: preserve that
external directory unchanged, copy its four exact output files into this
sprint's approved in-repository `artifacts/ui/`, and continue with
evidence reconciliation and `git diff --check` only. No further test retry is
authorized. The prior `desktop-app/test-results/` files retain their original
timestamps and were not overwritten.

| Playwright artifact | In-repository evidence copy | SHA-256 |
|---|---|---|
| `.last-run.json` | `artifacts/ui/.last-run.json` | `91D1C43004802CD49950D78EB11C8FA7D05DA8FFFFE219A8B13B2F561BC00903` |
| `sprint046-help-1024x720.png` | `artifacts/ui/help/help-1024.png` | `A0556250E19F3C9F5C61174C46DBF5E365B4F534737BDB7DA8F6E50DB8945647` |
| `sprint046-help-1440x900.png` | `artifacts/ui/help/help-1440.png` | `2C974C7A0FD1CBD1C32E0A2184A10B09A7602BD7D3338A590BD05FCE8219DE88` |
| `v14-language-editor.png` | `artifacts/ui/editor/v14-editor.png` | `9116A97C23D565C4525C102E8474F9A2335AB7FB18501074102D3BC5A20C3DF3` |

The corrected future UI command uses `--output=..\planning\...` from
`desktop-app/` (one parent directory to the repository root) and the short
`artifacts/ui/` path. The original `..\..\...\artifacts\desktop-ui`
invocation remains in `artifacts/desktop-ui-retry.log` and the external
output location remains recorded above; historical provenance is not
rewritten.

## Requirement-to-Evidence Matrix

Use the complete Sprint 084
[`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
for contract authority. The matrix below has one row for each of its 30
requirements; the next matrix has one row for each of the 44 canonical
fixtures. Surface-level evidence is separated in the workflow table.

| Requirement ID | Canonical fixture IDs | Expected acceptance result | Core/runtime status and evidence | Related surface evidence | Residual owner / follow-up |
| --- | --- | --- | --- | --- | --- |
| `V14-CON-01` | `IS-VALID-01`, `IS-SYNTAX-01`, `IS-SYNTAX-SUFFIX-01`, `IS-TARGET-UNKNOWN-01`, `IS-TARGET-NONTYPE-01`, `IS-TARGET-UNICODE-UTF16-01` | `is` is Boolean with a type-reference target; malformed/invalid targets use exact diagnostics. | PASS; `tests/isTypeChecking.test.ts`; `artifacts/root-focused.log`. | Shared editor PASS; VS Code V0.14 cases PASS within a FAIL aggregate; desktop UI PASS via Vite; see E-05/E-06/E-09. | Extension/desktop owners to address aggregate residuals below. |
| `V14-CON-02` | `IS-PREC-01`, `IS-CHAIN-01` | Arithmetic and `in` bind first; comparison-level chain is left-associative; logic/conditional bind later. | PASS; exact grouping and outcomes asserted in `tests/isTypeChecking.test.ts`. | Shared editor PASS; VS Code/desktop host statuses in E-06/E-09. | None for fixture result. |
| `V14-CON-03` | `IS-TARGET-UNKNOWN-01`, `IS-TARGET-NONTYPE-01`, `IS-TARGET-FORWARD-01`, `IS-TARGET-IMPORT-01`, `IS-TARGET-UNICODE-UTF16-01` | Existing source-order/import visibility; exact invalid-target diagnostics and UTF-16 range. | PASS; exact outcomes/ranges asserted in `tests/isTypeChecking.test.ts`. | Shared editor PASS; VS Code diagnostic range check PASS within aggregate; desktop UI diagnostic PASS via Vite. | VS Code aggregate residual remains with extension test owner. |
| `V14-IS-01` | `IS-VALID-01` | Primitive match is true; valid mismatch is false without diagnostic. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-02` | `IS-VALID-01` | Structural records recurse, allow extra fields, and reject missing/incompatible required fields. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-03` | `IS-VALID-01` | Optional target field may be absent; present null and nullable/null targets follow distinct rules. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-04` | `IS-VALID-01` | Lists recurse; empty lists match any target element type. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-05` | `IS-VALID-01` | Enum membership uses underlying primitive values; overlapping members are not nominally distinct. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-06` | `IS-VALID-01` | Measurements match by dimension vector; Number remains distinct from dimensionless Measurement. | PASS; all approved bindings asserted. | Editor/host syntax facts in E-05/E-06/E-09. | None for fixture result. |
| `V14-IS-07` | `IS-NARROW-01` | `is` does not narrow nullable static type; `AMX3002`, `Expected String, got String?`. | PASS; exact diagnostic asserted in `tests/isTypeChecking.test.ts`. | VS Code/desktop only test source authoring, not flow-sensitive runtime behavior. | None for fixture result. |
| `V14-MATH-01` | `MATH-TEXT-FORMAT-VALID-01`, `MATH-ARITY-01`, `MATH-TYPE-01` | All 15 functions and `PI`/`E` have approved signatures and values/tolerance. | PASS; `tests/v14MathLibrary.test.ts`; `artifacts/root-focused.log`. | Built-in discovery/grammar covered by E-05/E-06/E-09; no host math evaluation claimed. | None for fixture result. |
| `V14-MATH-02` | `MATH-TEXT-FORMAT-VALID-01` | Trigonometric inputs and inverse-trigonometric outputs use radians; tangent has no epsilon pole check. | PASS; approved values and finite `tan(PI / 2)` asserted. | Built-in discovery only; see E-05/E-06/E-09. | None for fixture result. |
| `V14-MATH-03` | `MATH-TEXT-FORMAT-VALID-01` | `ln` is natural log, `log` base 10, and `PI`/`E` are IEEE-754 constants. | PASS; expected values asserted within accepted tolerance. | Built-in discovery only; see E-05/E-06/E-09. | None for fixture result. |
| `V14-MATH-04` | `MATH-TEXT-FORMAT-VALID-01`, `MATH-MEASUREMENT-DIM-01` | Number/dimensionless Measurement accepted, normalized by scale, and returns Number; dimensioned Measurement rejected. | PASS; scale-normalized case and exact `AMX3007` asserted. | Editor clients do not execute runtime math; no host execution inferred. | None for fixture result. |
| `V14-MATH-05` | `MATH-DOM-ASIN-01`, `MATH-DOM-ACOS-01`, `MATH-DOM-ACOSH-01`, `MATH-DOM-ATANH-01`, `MATH-DOM-LN-01`, `MATH-DOM-LOG-01`, `MATH-FINITE-01`, `MATH-NONFINITE-INPUT-01` | Invalid domains/non-finite input use `AMXSL001`; non-finite result uses `AMXSL002`. | PASS; exact diagnostics/ranges asserted in `tests/v14MathLibrary.test.ts`. | Editor clients do not execute runtime math; no host execution inferred. | None for fixture result. |
| `V14-MATH-06` | `MATH-SQRT-REGRESSION-01`, `MATH-SQRT-MEAS-REGRESSION-01` | Existing Number/Measurement negative sqrt behavior remains `AMX2005`/`AMX3010`. | PASS; exact regression diagnostics asserted. | Full root aggregate has a separate unrelated failure; see E-04. | Root-suite timeout owner; no sqrt residual observed. |
| `V14-MEAS-01` | `MEAS-STDLIB-VALID-01`, `MEAS-EMPTY-MEAN-01`, `MEAS-EMPTY-MIN-01`, `MEAS-EMPTY-MAX-01` | Measurement-aware operations preserve established values, units, typed-empty sum, and empty errors. | PASS; values/units/errors asserted in `tests/v14MathLibrary.test.ts`. | Desktop/VS Code editor hosts do not execute these runtime operations. | None for fixture result. |
| `V14-MEAS-02` | `MEAS-STDLIB-VALID-01`, `MEAS-COMPAT-01` | Compatible units convert as specified; aggregate/min/max result units are preserved; incompatible dimensions reject. | PASS; exact units and `AMX3007` asserted. | No editor runtime execution claimed. | None for fixture result. |
| `V14-TEXT-01` | `MATH-TEXT-FORMAT-VALID-01` | String lengths count Unicode code points; list lengths count elements. | PASS; supplementary and combining code points asserted in `tests/v14TextFormatting.test.ts`. | Built-in discovery/grammar in E-05/E-06/E-09. | None for fixture result. |
| `V14-TEXT-02` | `MATH-TEXT-FORMAT-VALID-01` | `trim` removes only approved Unicode 15.1 `White_Space`, preserving exclusions/internal characters. | PASS; full set/exclusions asserted. | No editor runtime execution claimed. | None for fixture result. |
| `V14-TEXT-03` | `MATH-TEXT-FORMAT-VALID-01` | `left`/`right` count code points; default, zero, and oversized boundaries are exact. | PASS; approved outputs asserted. | Built-in discovery/grammar in E-05/E-06/E-09. | None for fixture result. |
| `V14-TEXT-04` | `TEXT-COUNT-NEG-01`, `TEXT-COUNT-FRACTION-01`, `TEXT-COUNT-NONFINITE-01`, `TEXT-COUNT-TYPE-01` | Invalid counts use `AMXSL003`, `Invalid text slice count`, at the approved source range. | PASS; exact diagnostics/ranges asserted. | No host runtime execution claimed. | None for fixture result. |
| `V14-TEXT-05` | `TEXT-ARITY-01`, `TEXT-TYPE-01` | Text arity/type errors use the approved `AMX3004`/`AMX3002` messages. | PASS; exact diagnostics asserted. | Host completion/highlighting subset in E-06/E-09. | None for fixture result. |
| `V14-FMT-01` | `MATH-TEXT-FORMAT-VALID-01`, `FORMAT-ARITY-01`, `FORMAT-TYPE-01` | Number/Measurement formatting, grammar, arity, and input type match contract. | PASS; exact outputs/diagnostics asserted in `tests/v14TextFormatting.test.ts`. | VS Code/desktop only authoring behavior; desktop UI PASS via Vite. | None for fixture result. |
| `V14-FMT-02` | `MATH-TEXT-FORMAT-VALID-01` | Precision, grouping, percent, currency, negatives, tie rounding, negative zero are exact. | PASS; exact strings asserted. | No host runtime formatting execution claimed. | None for fixture result. |
| `V14-FMT-03` | `MATH-TEXT-FORMAT-VALID-01`, `FORMAT-LOCALE-INVALID-01`, `FORMAT-LOCALE-UNSUPPORTED-01` | Fixed `en-US` default and exact supported locale separators; invalid/unsupported locale uses `AMXSL005`. | PASS; outputs/errors asserted. | No host locale execution claimed. | None for fixture result. |
| `V14-FMT-04` | `MATH-TEXT-FORMAT-VALID-01` | Measurement formatting uses displayed value and appends one ASCII space plus unit. | PASS; meter/centimeter outputs asserted. | No native host execution claimed. | None for fixture result. |
| `V14-FMT-05` | `FORMAT-MALFORMED-01`, `FORMAT-UNSUPPORTED-01`, `FORMAT-PRECISION-OVERFLOW-01`, `FORMAT-LOCALE-INVALID-01`, `FORMAT-LOCALE-UNSUPPORTED-01`, `FORMAT-FINITE-01` | Unsupported pattern/locale and non-finite input use exact `AMXSL004`/`005`/`006` diagnostics. | PASS; exact diagnostics/ranges asserted. | No host runtime execution claimed. | None for fixture result. |
| `V14-COMP-01` | Existing V0.9-V0.13 parser/evaluator/Measurement suites and all V0.14 fixtures | Existing behavior outside additions remains unchanged. | FAIL for full root aggregate: 534/1; the only failing test is a desktop-release test timeout, not an observed language regression. Focused acceptance is PASS. | VS Code aggregate FAIL and desktop RPC FAIL are retained separately; no assertion/policy changes. | Root test/release owner; VS Code test owner; desktop RPC owner. |
| `V14-TRACE-01` | All 44 canonical Sprint 084 fixture IDs | Every fixture and all 30 requirement IDs map to direct evidence/status. | PASS for ID audit: 44/44 IDs referenced in focused test sources and executed by the passing focused selection. Full root aggregate FAIL is separate. | Surface-specific coverage/status is recorded below; no cross-surface inference. | Builder completed matrix; Lead Developer/product owner owns disposition. |

For every status, include exact command/action, environment, result/count,
log/screenshot/artifact location, and any failure, unavailable check, retry,
residual owner, or separate disposition. Do not leave `NOT RUN` items
unexplained at closeout.

## Canonical Fixture Matrix: All 44 Sprint 084 Fixtures

Every canonical ID from Sprint 084 `grammar-examples.md` is listed once.
The ID audit found all 44 in the focused V0.14 test sources; the focused
selection passed 66 tests/0 failures with 875 expectations. Invalid fixture
diagnostic codes/messages and exact primary ranges are as specified by Sprint
084 `diagnostic-matrix.md` and asserted by the cited focused test. Raw test
output is `artifacts/root-focused.log`.

| # | Fixture ID | Contract expectation / exact outcome | Direct test evidence | Status | Residual owner / follow-up |
|---:|---|---|---|---|---|
| 1 | `FORMAT-ARITY-01` | Missing `format` arguments -> `AMX3004`, `Invalid arity for 'format'`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 2 | `FORMAT-FINITE-01` | Direct `format(1 / 0, "0")` -> `AMXSL006`, `Input is non-finite`, at line 5, columns 21-26. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 3 | `FORMAT-LOCALE-INVALID-01` | Malformed locale -> `AMXSL005`, `Formatting locale is malformed or unsupported`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 4 | `FORMAT-LOCALE-UNSUPPORTED-01` | `zz-ZZ` -> `AMXSL005`, `Formatting locale is malformed or unsupported`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 5 | `FORMAT-MALFORMED-01` | `"0.0.0"` -> `AMXSL004`, `Incorrect formatting pattern`. | `tests/v14TextFormatting.test.ts`, `tests/examples.test.ts` | PASS | None for fixture. |
| 6 | `FORMAT-PRECISION-OVERFLOW-01` | Seven mandatory fractional digits -> `AMXSL004`, `Incorrect formatting pattern`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 7 | `FORMAT-TYPE-01` | String value -> `AMX3002`, `format expects a Number or Measurement, got String`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 8 | `FORMAT-UNSUPPORTED-01` | Date pattern -> `AMXSL004`, `Incorrect formatting pattern`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 9 | `IS-CHAIN-01` | `1 is Number == true` parses left-associatively and evaluates true. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 10 | `IS-NARROW-01` | Nullable true-branch use remains `AMX3002`, `Expected String, got String?`. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 11 | `IS-PREC-01` | Arithmetic/conversion/comparison/logic/conditional grouping matches contract; all five results true. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 12 | `IS-SYNTAX-01` | Missing target -> `AMX3006`, `Expected target type after 'is'`, zero-width target position. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 13 | `IS-SYNTAX-SUFFIX-01` | Repeated nullable suffix -> `AMX3006`, `Invalid type suffix in 'is' target`. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 14 | `IS-TARGET-FORWARD-01` | Forward target `Later` -> `AMX3001`, `Unknown type 'Later'`. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 15 | `IS-TARGET-IMPORT-01` | Visible imported `Point` target resolves and matches true. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 16 | `IS-TARGET-NONTYPE-01` | Value `candidate` used as type -> `AMX3001`, `Unknown type 'candidate'`. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 17 | `IS-TARGET-UNICODE-UTF16-01` | Unknown target after supplementary character -> exact `AMX3001` UTF-16 range; CRLF target range retained. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 18 | `IS-TARGET-UNKNOWN-01` | Unknown `Missing` -> `AMX3001`, `Unknown type 'Missing'`. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 19 | `IS-VALID-01` | All 19 approved primitive/record/list/optional/enum/Measurement Boolean bindings match, including valid false results. | `tests/isTypeChecking.test.ts` | PASS | None for fixture. |
| 20 | `MATH-ARITY-01` | Missing `sin` argument -> `AMX3004`, `Invalid arity for 'sin'`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 21 | `MATH-DOM-ACOS-01` | `acos(-2)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 22 | `MATH-DOM-ACOSH-01` | `acosh(0)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 23 | `MATH-DOM-ASIN-01` | `asin(2)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 24 | `MATH-DOM-ATANH-01` | `atanh(1)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 25 | `MATH-DOM-LN-01` | `ln(0)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 26 | `MATH-DOM-LOG-01` | `log(-1)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 27 | `MATH-FINITE-01` | `exp(10000)` -> `AMXSL002`, `Function evaluation results in infinite result`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 28 | `MATH-MEASUREMENT-DIM-01` | Dimensioned Measurement to `sin` -> `AMX3007`, `'<function>' requires a Number or dimensionless Measurement` (`sin`). | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 29 | `MATH-NONFINITE-INPUT-01` | Direct `sin(1 / 0)` -> `AMXSL001`, `Invalid input for mathematical function`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 30 | `MATH-SQRT-MEAS-REGRESSION-01` | Negative Measurement sqrt -> `AMX3010`, `sqrt of a negative measurement value`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 31 | `MATH-SQRT-REGRESSION-01` | Negative Number sqrt -> `AMX2005`, `sqrt of negative value`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 32 | `MATH-TEXT-FORMAT-VALID-01` | All 15 math outputs/constants within tolerance; text code-point/trim/slice values; exact locales, rounding, currency, negative-zero and Measurement display-unit strings. | `tests/v14MathLibrary.test.ts`, `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 33 | `MATH-TYPE-01` | String argument to `sin` -> `AMX3002`, `Expected Number or dimensionless Measurement, got String`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 34 | `MEAS-COMPAT-01` | Mixed Measurement dimensions in `sum` -> `AMX3007`, `List elements have incompatible types`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 35 | `MEAS-EMPTY-MAX-01` | Empty Measurement `max` -> `AMX2004`, `max of empty list`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 36 | `MEAS-EMPTY-MEAN-01` | Empty Measurement `mean` -> `AMX2004`, `mean of empty list`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 37 | `MEAS-EMPTY-MIN-01` | Empty Measurement `min` -> `AMX2004`, `min of empty list`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 38 | `MEAS-STDLIB-VALID-01` | Exact aggregate/mean/min/max/abs/round/sqrt/pow values and units; typed empty sum is `0 meter`. | `tests/v14MathLibrary.test.ts` | PASS | None for fixture. |
| 39 | `TEXT-ARITY-01` | Missing `len` argument -> `AMX3004`, `Invalid arity for 'len'`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 40 | `TEXT-COUNT-FRACTION-01` | Fractional count -> `AMXSL003`, `Invalid text slice count`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 41 | `TEXT-COUNT-NEG-01` | Negative count -> `AMXSL003`, `Invalid text slice count`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 42 | `TEXT-COUNT-NONFINITE-01` | Direct `right("A", 1 / 0)` -> `AMXSL003`, `Invalid text slice count`, at line 5, columns 25-30. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 43 | `TEXT-COUNT-TYPE-01` | String count -> `AMXSL003`, `Invalid text slice count`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |
| 44 | `TEXT-TYPE-01` | Number to `len` -> `AMX3002`, `len requires a String or list, got Number`. | `tests/v14TextFormatting.test.ts` | PASS | None for fixture. |

## Surface and Workflow Evidence

| ID | Surface/workflow | Exact action / command | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence/artifacts | Residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Execution authorization and approved file plan | User separately authorized Sprint 089 and approved the exact file/output plan on 2026-10-16; recorded above before workflows. | PASS | User approval; clean starting worktree on `feat/create-v0.14`; environment and preservation plan recorded above. | Builder |
| E-02 | Focused V0.14 fixtures and exact diagnostics/ranges | Exact approved focused Bun command; separate read-only fixture-reference audit. | PASS | 66 passed, 0 failed, 875 expectations across five files: editor 25 + examples 14 + `is` 11 + math/Measurement 6 + text/format 10 = 66. All 44 canonical IDs are present in focused test sources; `artifacts/root-focused.log`. | Builder |
| E-03 | Core build and three V0.14 example executions | `bun run build`; each named example via `bun run dist\cli.js run ...`. | PASS | Build exit 0; all three CLI runs exit 0 with expected bindings/units; `artifacts/root-build.log` and `artifacts/example-*.log`. | Builder |
| E-04 | Full root Bun suite | Exact command `bun test`; no retry authorized. | FAIL | 534 passed, 1 failed, 3,580 expectations; 535 tests/43 files. One desktop release packaging test timed out at 5,000 ms; runner reported one dangling process. `artifacts/root-full-suite.log`. | Root release/test owner; Lead Developer |
| E-05 | Shared editor, documentation, Help, and examples | Focused `tests\editor.test.ts`/`tests\examples.test.ts` within E-02; direct CLI execution of all three examples. | PASS | Shared V0.14 editor facts and docs/Help/example tests pass; example outputs/units verified. `artifacts/root-focused.log` and example logs. | Builder |
| E-06 | VS Code Extension Development Host | `vscode-extension`: `bun run test`; actual VS Code 1.85.0 host. | FAIL | 17 passed, 8 failed. Both V0.14-specific provider and TextMate grammar tests pass; six Windows `EBUSY` temp-directory cleanup failures and two drive-letter case comparisons remain. `artifacts/vscode-host.log`. | VS Code extension/test owner; Lead Developer |
| E-07 | Desktop typecheck | `desktop-app`: `bun run typecheck`. | PASS | Exit 0; Hutch Electrobun prepare and `vue-tsc --noEmit` completed. `artifacts/desktop-typecheck.log`. | Builder |
| E-08 | Desktop web build | `desktop-app`: `bun run build:web`. | PASS | Exit 0; Vite 6.4.3 transformed 3,273 modules; 8.90 MB worker bundled; sharp and four Roboto fonts copied. Large-chunk advisory retained. `artifacts/desktop-web-build.log`. | Builder |
| E-09 | Desktop editor and Help UI | Focused Playwright attempt, then same tests against the configured Vite harness started through Bun. | PASS on retry; first attempt FAIL | First attempt: Windows `'.' is not recognized` webServer failure. Retry: 3 passed, 0 failed through Vite workflow harness; HTTP 200 verified. Four Playwright outputs copied with matching SHA-256 into `artifacts/ui/`; external originals remain unchanged. | Builder; desktop owner for native follow-up |
| E-10 | Desktop RPC/webview boundary contract | `desktop-app`: `bun run test`. | FAIL | `tests/rpc-contract-check.ts:152`: expected two `sandbox="allow-scripts"` occurrences, found one. No source/assertion/sandbox changes. `artifacts/desktop-rpc.log`. | Desktop RPC/security owner; Lead Developer |
| E-11 | Direct native/package desktop acceptance | Inspect existing route; no native package build/launch or user-reported deployment inference. | BLOCKED/UNAVAILABLE | Configured Playwright target is the Vite harness; no supported direct native/CDP acceptance route was available in the approved scope. Release/package workflows are excluded. | Lead Developer / desktop owner to provide direct UAT route |
| E-12 | Output preservation and artifact-path reconciliation | Snapshot approved mutable build/host outputs; retain test artifacts; reconcile two user-approved path amendments. | FAIL for initial output-path mistakes; preservation completed | Root test `.keep` path retained unchanged. UI command initially wrote four files outside the repo; external originals retained and copies hash-verified in Sprint 089 artifacts. Historical `desktop-app\test-results` timestamps unchanged. | Builder |
| E-13 | Baseline and 30-requirement/44-fixture reconciliation | Compare Sprints 084-088 raw results; audit fixture/test references. | PASS for trace/comparison; underlying failures remain FAIL | 30 requirements and 44 fixtures represented below; raw attempt/retry and residual-owner history follows. | Builder; owners listed above |
| E-14 | Builder recommendation and separate V0.14 disposition | Submit recommendation and request a separate Lead Developer/product-owner decision. | PASS: disposition recorded | User separately recorded `ACCEPTED/CLOSED` on 2026-10-16 with named owners for root timeout, VS Code failures, desktop RPC mismatch, and unavailable native UAT. Builder recommendation remains BLOCKED/OPEN; underlying results remain FAIL/BLOCKED. | Named residual owners; Lead Developer / product owner |

## Prior-Sprint Baselines and Residuals

- Sprint 085 focused direct Bun run: 241/0 across eight files; build passed.
  The full root suite was not run. The `functions.runTests` retry reported
  182/0 for the same selection while direct Bun reported 241/0; retain the
  discrepancy.
- Sprint 086 focused direct Bun run: 123/0 across five files; build and
  generated runtime inspection passed. Full root suite was not run.
- Sprint 087 focused direct Bun run: 141/0 across six files; build and
  generated runtime inspection passed. Full root suite was not run.
- Sprint 088 root focused run: 66/0 across five files; build passed.
- Sprint 088 VS Code raw final retry: 17/8. V0.14-specific checks passed;
  six `EBUSY` cleanup errors and two drive-letter case comparisons remained
  in the aggregate. The user separately closed its acceptance disposition
  as PASS following local deployment testing; this does not erase the raw
  automated result.
- Sprint 088 desktop Playwright: 3/0 using Vite workflow harness, not native
  Electrobun. User separately confirmed local deployment functionality;
  no CDP/test artifact was supplied. Treat any new Sprint 089 native test
  separately.
- Desktop RPC sandbox-occurrence mismatch: Sprint 082/083 baseline
  (`tests/rpc-contract-check.ts` expected 2, found 1); not rerun in Sprint
  088. Re-run and report without changing policy or assertion.
- Current full root, extension, and desktop suites: NOT RUN in Sprint 088;
  Sprint 089 owns them.

## Exact Prior-Sprint Failure, Retry, and Disposition History

| Sprint | Raw attempts and environment | Separate disposition / residual |
|---|---|---|
| 084 | Contract gate; 44 source envelopes, 44 matrix IDs, 38 diagnostic spans. V0.14 implementation/runtime suites intentionally NOT RUN. | User accepted the contract on 2026-10-15. This is behavior authority, not runtime acceptance. |
| 085 | First `functions.runTests` attempt: 171 passed/11 failed because `is` was consumed as a Measurement unit attachment. After parser correction, wrapper retry: 182/0. Direct Bun focused run: 241/0 across eight files. Wrapper and direct Bun totals differ by 59 tests; full root suite NOT RUN. | User accepted Sprint 085 on 2026-10-16. Preserve the count discrepancy; no full-suite pass is inferred. |
| 086 | First focused direct Bun run: 119 passed/3 failed, 751 expectations across five files. Two test expectation issues were corrected; the third exposed the non-finite Number-binding conflict and led to the separately approved direct-call fixture amendment. Corrected intermediate: 122/0; final: 123/0, 838 expectations. Build and `git diff --check` passed. | User accepted Sprint 086 on 2026-10-16. The amendment preserves Number-binding behavior. Full root suite NOT RUN. |
| 087 | Focused direct Bun attempts: 135/4 (865 expectations), 136/3 (892), 137/2 (983), then 141/0 (1,024) across six files. Failures exposed fixture/test setup and argument-source range plumbing; no contract relaxation. Build and `git diff --check` passed. | User accepted Sprint 087 on 2026-10-16. Direct-call non-finite fixtures preserve the finite Number-binding invariant. Full root suite NOT RUN. |
| 088 | Root focused attempts: 63/3 (848 expectations), 65/1 (860), final 66/0 (875) across five files. VS Code first host run 17/8 (five `EBUSY`, two drive-letter comparisons, and a grammar-test assertion); retry after correcting only that assertion remained 17/8 with six `EBUSY` and two path-case failures. Desktop UI first harness run 2/1 due a non-contiguous Help search phrase; final 3/0 after correcting the search phrase. Configured Windows webServer command failed; same Vite harness was started via Bun. RPC not rerun. | User separately accepted/closed Sprint 088 after reporting local deployment tests; raw failures remain. UI was Vite harness, not native. No native log/CDP artifact was supplied. |
| 082/083 desktop RPC baseline | `tests/rpc-contract-check.ts` expected two `sandbox="allow-scripts"` occurrences and observed one at line 152. Sprint 088 did not rerun this check. | Historical failure retained; no sandbox policy or assertion change. Sprint 089 reproduces the same expected/actual mismatch. |

## Builder Closeout Recommendation and Separate Disposition

**Builder recommendation: BLOCKED/OPEN.** Focused acceptance covered all 44
canonical fixtures and passed (66/0, 875 expectations); the core build, all
three example CLI runs, shared editor/docs/example checks, desktop typecheck
and web build, and the Vite-harness UI retry passed. Integrated closeout is
not acceptable as complete while the full root aggregate is 534/1, the
Extension Development Host aggregate is 17/8, the desktop RPC boundary check
fails, and direct native/package acceptance is unavailable.

| Residual | Observed result | Follow-up owner |
|---|---|---|
| Full root aggregate | `desktop release packaging > rejects inconsistent versions on a clean committed source tree` timed out at 5,000 ms; one dangling process reported. No retry or fix authorized. | Root release/test owner and Lead Developer to investigate and disposition. |
| VS Code aggregate | 17 passed/8 failed; six Windows `EBUSY` cleanup failures and two drive-letter case comparisons. V0.14-specific host tests passed; Sprint 088's separate user acceptance does not dispose of the Sprint 089 run. | VS Code extension/test owner and Lead Developer to separately accept named residuals or authorize corrective work. |
| Desktop RPC boundary | `tests/rpc-contract-check.ts:152` expected two `sandbox="allow-scripts"` occurrences, found one. No security boundary/assertion changed. | Desktop RPC/security owner and Lead Developer. |
| Native/package acceptance | `BLOCKED/UNAVAILABLE`; only the Vite workflow harness was directly automated, and no supported native/CDP route was approved or supplied. | Lead Developer / desktop owner to supply a direct native UAT route and separate file/output plan. |
| Evidence output path | Two path mistakes are preserved transparently; the root `.keep` remains untouched and the UI originals remain outside the repository while in-repo copies are hash-verified. | Builder; no source/test change required. |

**Separate Lead Developer/product-owner V0.14 disposition: ACCEPTED/CLOSED**
by the user on 2026-10-16 with these named residuals:

- Root test/release owner: investigate the 5-second root test timeout.
- VS Code extension/test owner: address or separately accept six `EBUSY`
  cleanup errors and two drive-letter path failures.
- Desktop RPC/security owner: disposition the expected-2/actual-1 assertion
  without weakening sandbox policy.
- Desktop owner: provide a direct native UAT route or retain
  `BLOCKED/UNAVAILABLE`.

The Builder recommendation remains BLOCKED/OPEN, and all raw
`FAIL`/`BLOCKED/UNAVAILABLE` evidence remains unchanged. The separate product
disposition closes Sprint 089/V0.14 with named residual follow-up; it does
not authorize release, publication, version change, package release, or
platform certification.

## Decisions, Failures, and Closeout

Record all first-run failures and retries without replacing earlier results.
Keep `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` visible even when a
separate user/product decision accepts a residual. Record owner, risk,
mitigation/follow-up, and disposition explicitly.

Builder recommendation: BLOCKED/OPEN.

Separate Lead Developer/product-owner V0.14 disposition:
`ACCEPTED/CLOSED` by the user on 2026-10-16 with the named residuals and
owners recorded above. The separate disposition does not convert any raw
`FAIL` or `BLOCKED/UNAVAILABLE` result to PASS. No release, publication,
version change, package release, or platform certification is authorized.

## Post-Closeout Windows Worktree Path Correction

After the separate closeout disposition, the user reported that
`bun run release:desktop` at commit `b874fe7` failed while adding a detached
worktree because three tracked Playwright screenshot paths exceeded the
Windows path limit under the long staging directory. The command reported
its incomplete staging output at
`releases/.staging/0.14.0/windows-x64/b874fe7eb749-QqdVzM/` as retained, but
a read-only check after the report found that exact directory and its
`windows-x64` parent absent. This follow-up did not alter or clean any
release-staging files.

In the worktree, the former long Sprint 089 UI artifact paths are replaced
with:

- `artifacts/ui/help/help-1024.png`
- `artifacts/ui/help/help-1440.png`
- `artifacts/ui/editor/v14-editor.png`
- `artifacts/ui/.last-run.json`

All four files retain their original content and SHA-256 values recorded
above. The original external Playwright outputs remain untouched. With the
observed 98-character staging worktree base, the new complete artifact paths
measure at most 190 characters, below the Windows 260-character limit. The
approved future UI command now uses one parent traversal from `desktop-app/`
and writes to the short `artifacts/ui/` path.

`bun run release:desktop` was not rerun: Sprint 089 does not authorize
release/package work. These path and instruction edits are in the current
worktree and must be included in a clean committed revision before any
separately authorized release attempt.
