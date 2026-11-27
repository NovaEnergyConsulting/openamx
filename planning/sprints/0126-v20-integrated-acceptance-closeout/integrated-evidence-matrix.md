# Sprint 126 Integrated Evidence Matrix

## Status and Evidence Rules

Preparation snapshot. S126 was separately authorized on 2026-11-27 after
S124/S125 lifecycle reconciliation. The original `NOT RUN` entries retain the
pre-execution state; final S126 outcomes are recorded in the execution section
below. Every G123 raw status remains individually visible and is not promoted
by unrelated suite or desktop results.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`. An
accepted sprint disposition never rewrites an earlier raw status.

## S126 Execution Results

| Run group | Outcome | Raw status |
| --- | --- | --- |
| S126-ROOT-ALL | Attempt 01: 737/1 because the isolated worktree lacked `dist/cli.js`; attempt 02 after build: 738/0, 5,668 assertions, 51 files. | PASS (attempt 02); attempt 01 FAIL retained |
| S126-ROOT-TYPE / BUILD | Root no-emit typecheck passed; isolated build captured Bun exit 0 after preserving earlier PowerShell wrapper failures/no-result. | PASS |
| S126-EXAMPLE | Example 16 AMX/CLI, strict generated compile, and AMX oracle passed for the accepted Asset form. | PASS |
| S126-CLI-DESKTOP-EQUIV | Example 16 desktop service/worker and CLI graphs matched in module paths, bytes, import specifiers, and entry output path. | PASS |
| S126-MEASUREMENT | Retained probe AMX/CLI passed; strict generated Measurement compile reproduced TS2345. Oracle not run after compile failure. | FAIL |
| S126-DESKTOP-UI | Vite 6.4.3 / Playwright 1.64.1 / Chromium 156.0.8078.4; 9 tests passed on port 4183. | PASS (harness only) |
| S126-DOCS / PRESERVE | Spec/API audit passed; README/Example test passed; historical docs and primary protected manifests unchanged. | PASS |
| S126-UNSELECTED | Separate root-focused suite, desktop RPC/worker, desktop typechecks/full suite, and native/platform routes were not selected. | NOT RUN / BLOCKED/UNAVAILABLE as individually carried |

Exact commands, CWDs, retries, tool versions, artifact paths/hashes, and the
separate Builder recommendation are recorded in `builder-evidence.md`.

## Entry and Dependency Reconciliation

| Evidence ID | Gate | Required reconciliation | S126 record | Raw status |
| --- | --- | --- | --- | --- |
| INT126-ENTRY-121 | S121 final feasibility | Accepted closeout, four-case helper probe, D121-18 residual preserved. | Accepted 2026-11-25; D121-18 best-effort/non-crash-atomic. | PASS |
| INT126-ENTRY-122 | S122 helper/API | Accepted scope, public API, D122-15 no-parity, retry residual preserved. | Accepted 2026-11-25; no parity for unexpressible enum-valued defaults. | PASS |
| INT126-ENTRY-123 | S123 emitter | Owner disposition and every G123/E123 status; preserve S123 retry process FAIL. | Accepted 2026-11-26; incomplete rows remain blocked/unavailable. | PASS |
| INT126-ENTRY-124 | S124 graph/CLI | Owner disposition, G124 matrix, S124 retry process FAIL, cancellation/crash NOT RUN. | Accepted 2026-11-26; `G124-PUBLISH-CANCEL-01` and crash boundary NOT RUN. | PASS |
| INT126-ENTRY-125 | S125 desktop/docs/example | Verify Builder evidence disposition and residuals; reconcile canonical lifecycle ledgers. | S125 disposition verified and recorded in all four canonical lifecycle ledgers on 2026-11-27; historical evidence untouched. | PASS |
| INT126-RESIDUAL-123-PROCESS | S123 retry/stop | Preserve `S123-RETRY-STOP-01` raw FAIL and accepted residual. | Product Owner accepted as process residual 2026-11-26. | FAIL |
| INT126-RESIDUAL-124-PROCESS | S124 retry/stop | Preserve `S124-RETRY-STOP-01` raw FAIL and accepted residual. | Product Owner accepted as process residual 2026-11-26. | FAIL |
| INT126-RESIDUAL-125-DESKTOP | S125 desktop aggregate | Full desktop `bun run test` report-export poll failure. | S125 aggregate remains FAIL; desktop full suite was not selected for S126. | FAIL |
| INT126-RESIDUAL-125-NATIVE | S125 native/platform | Native WebView and cross-platform unavailable. | Vite UI is harness evidence only. | BLOCKED/UNAVAILABLE |
| INT126-RESIDUAL-125-MEASUREMENT | S125 emitter measurement probe | Generated Measurement identity compile failure. | S125 raw TS2339/TS2322 preserved; S126 rerun also failed with TS2345. | FAIL |
| INT126-RESIDUAL-125-TYPECHECK | S125 wrapper typecheck | Hutch wrapper blocked/no completion; pinned direct vue-tsc passed. | Preserve wrapper and direct command as distinct rows; no S126 desktop typecheck selected. | BLOCKED/UNAVAILABLE |

## Core Transpiler and G123 Coverage

Every G123 row remains individually visible; final S125 carry-forward status is
shown here. S126 must execute direct applicable evidence or preserve the
status. Desktop/example results do not implicitly pass an emitter row.

| Evidence ID | G123 row / behavior | S125 entering raw status | S126 evidence required | Raw status |
| --- | --- | --- | --- | --- |
| INT126-EMIT-SOURCE | G123-SOURCE-01 narrative/source order | PASS | Repeatable comments before/between/after fences and order. | NOT RUN |
| INT126-EMIT-FRONTMATTER | G123-FRONTMATTER-01 raw frontmatter | PASS | Raw source/frontmatter fidelity, mixed newline input. | NOT RUN |
| INT126-EMIT-COMMENT-ESCAPE | G123-COMMENT-ESCAPE-01 | BLOCKED/UNAVAILABLE | Full emitted non-ASCII, U+2028/U+2029, `*/`, `//#` safety. | NOT RUN |
| INT126-EMIT-REJECT | G123-REJECT-01 unknown lowering/source diagnostics | BLOCKED/UNAVAILABLE | Parse/type/unknown-node diagnostics and no generated graph. | NOT RUN |
| INT126-EMIT-DECL | G123-DECL-01 binding/declaration order | BLOCKED/UNAVAILABLE | Uninitialized declarations and multiple executable fences. | NOT RUN |
| INT126-EMIT-TYPE | G123-TYPE-01 type families | BLOCKED/UNAVAILABLE | DateTime, nullable/list combinations, inheritance/override/defaults. | NOT RUN |
| INT126-EMIT-NAME | G123-NAME-01 collision matrix | BLOCKED/UNAVAILABLE | Reserved words, wrapper/helper/import names, strict compile. | NOT RUN |
| INT126-EMIT-ENUM | G123-ENUM-01 | BLOCKED/UNAVAILABLE | Numeric and imported enum variants; no D122-15 default parity. | NOT RUN |
| INT126-EMIT-FUNCTION | G123-FUNCTION-01 | BLOCKED/UNAVAILABLE | Capture/alias/fallthrough and argument copy matrix. | NOT RUN |
| INT126-EMIT-EXPORT | G123-EXPORT-01 | BLOCKED/UNAVAILABLE | Export lists/re-export and entry result behavior. | NOT RUN |
| INT126-EMIT-LITERAL | G123-LITERAL-01 | BLOCKED/UNAVAILABLE | Null and complete literal family. | NOT RUN |
| INT126-EMIT-EXPR | G123-EXPR-01 | BLOCKED/UNAVAILABLE | Complete precedence/parenthesization matrix. | NOT RUN |
| INT126-EMIT-STRING | G123-STRING-01 | BLOCKED/UNAVAILABLE | Measurement/null/unsupported interpolation and error positions. | NOT RUN |
| INT126-EMIT-OPERATOR | G123-OPERATOR-01 | BLOCKED/UNAVAILABLE | Eager logical evaluation, unary and complete operator matrix. | NOT RUN |
| INT126-EMIT-CONTROL | G123-CONTROL-01 | BLOCKED/UNAVAILABLE | Braced-if scope/lazy-branch and control matrix. | NOT RUN |
| INT126-EMIT-MATCH | G123-MATCH-01 | BLOCKED/UNAVAILABLE | Later-case observable calls and unselected-branch non-evaluation. | NOT RUN |
| INT126-EMIT-CALL | G123-CALL-01 | BLOCKED/UNAVAILABLE | Builtin family and observable argument evaluation order. | NOT RUN |
| INT126-EMIT-MUTATION | G123-MUTATION-01 | BLOCKED/UNAVAILABLE | Remove and AMX1008 runtime parity. | NOT RUN |
| INT126-EMIT-LOOP | G123-LOOP-01 | BLOCKED/UNAVAILABLE | Descending/empty/nested iterator scope. | NOT RUN |
| INT126-EMIT-LIST | G123-LIST-01 | BLOCKED/UNAVAILABLE | Remove, recursive copy and alias cases. | NOT RUN |
| INT126-EMIT-BUILTIN | G123-BUILTIN-01 | BLOCKED/UNAVAILABLE | Complete numeric/measurement/text builtin matrix. | NOT RUN |
| INT126-EMIT-MEASURE | G123-MEASURE-01 | BLOCKED/UNAVAILABLE; Measurement probe raw FAIL in S125 | Retained probe AMX/CLI PASS; strict generated graph compile reproduces a Measurement identity failure. | FAIL |
| INT126-EMIT-RECORD | G123-RECORD-01 | BLOCKED/UNAVAILABLE | Inheritance/default/optional/null/full field-order matrix. | NOT RUN |
| INT126-EMIT-IMPORT | G123-IMPORT-01 | PASS | Example 16 CLI/desktop service graphs have identical module paths, bytes, and import specifiers. | PASS |
| INT126-EMIT-INPUT | G123-INPUT-01 | BLOCKED/UNAVAILABLE | Number/DateTime/list/record/measurement descriptor matrix. | NOT RUN |
| INT126-EMIT-VIEW-TABLE | G123-VIEW-TABLE-01 | BLOCKED/UNAVAILABLE | Null/nested rows and ordered columns. | NOT RUN |
| INT126-EMIT-VIEW-CHART | G123-VIEW-CHART-01 | BLOCKED/UNAVAILABLE | All chart kinds/options/labels/showTable states. | NOT RUN |
| INT126-EMIT-VIEW-SHOW | G123-VIEW-SHOW-01 | BLOCKED/UNAVAILABLE | Diagram interleaved between show snapshots. | NOT RUN |
| INT126-EMIT-VIEW-DIAGRAM | G123-VIEW-DIAGRAM-01 | BLOCKED/UNAVAILABLE | Line/rectangle/text and full geometry/error cases. | NOT RUN |
| INT126-EMIT-VIEW-ORDER | G123-VIEW-ORDER-01 | PASS | Reverify imported-module view event order. | NOT RUN |
| INT126-EMIT-RUN-FRESH | G123-RUN-FRESH-01 | BLOCKED/UNAVAILABLE | Different input and caller result-mutation isolation. | NOT RUN |
| INT126-EMIT-DETERMINISM | G123-DETERMINISM-01 | PASS | Reverify root-independent exact graph bytes. | NOT RUN |
| INT126-EMIT-AST-AUDIT | E123-AST-01 | BLOCKED/UNAVAILABLE | Unique current AST mapping + fixture reconciliation. | NOT RUN |
| INT126-EMIT-HELPER-AUDIT | E123-HELPER-01 | BLOCKED/UNAVAILABLE | Full helper family/public declaration audit. | NOT RUN |
| INT126-EMIT-SOURCE-AUDIT | E123-SOURCE-01 | BLOCKED/UNAVAILABLE | Full source fidelity including arbitrary non-ASCII. | NOT RUN |
| INT126-EMIT-PARITY-AUDIT | E123-PARITY-01 | BLOCKED/UNAVAILABLE | Complete applicable values/errors/views; D122-15 excluded. | NOT RUN |
| INT126-EMIT-REJECT-AUDIT | E123-REJECT-01 | BLOCKED/UNAVAILABLE | Unknown-lowering fail-closed direct fixture. | NOT RUN |

## CLI and Graph Output

| Evidence ID | Gate | Required evidence | Raw status |
| --- | --- | --- | --- |
| INT126-CLI-01 | CLI graph success | Example 16 CLI output contains the entry and `libraries/asset-management.ts`. | PASS |
| INT126-CLI-EQUIV-01 | CLI/desktop graph equivalence | Same captured source graph has identical output-relative paths and exact bytes. | PASS |
| INT126-CLI-INVALID-01 | Parse/type/import errors | Invalid graph/output tests in the full root suite passed; no partial output. | PASS |
| INT126-CLI-PATH-01 | Containment/cycle/visibility | Graph resolver rules covered by the full root suite. | PASS |
| INT126-CLI-COLLISION-01 | Output collisions | Collision and path safety tests covered by the full root suite. | PASS |
| INT126-CLI-OVERWRITE-01 | Overwrite safety | Refusal, explicit overwrite, and unrelated-file tests covered by the full root suite. | PASS |
| INT126-CLI-DETERMINISM-01 | Determinism | Graph determinism tests covered by the full root suite; CLI/desktop bytes match. | PASS |
| INT126-CLI-COMPILE-01 | Generated graph compilation | Example 16 strict-compiles with TS 5.9.3, the public helper path, and `.ts` imports. | PASS |
| INT126-WRITER-ROLLBACK-01 | Failure/rollback | Injected stage/publish/rollback tests covered by the full root suite; D121-18 remains. | PASS |
| INT126-G124-CANCEL | G124-PUBLISH-CANCEL-01 | Preserve existing NOT RUN unless the exact S124 CLI row is separately rerun. | NOT RUN |
| INT126-G124-CRASH | G124-PUBLISH-CRASH-BOUNDARY-01 | No crash atomicity claim; preserve NOT RUN unless explicitly and safely tested. | NOT RUN |

## Desktop Graph Export and Documentation

| Evidence ID | Gate | Required evidence | Raw status |
| --- | --- | --- | --- |
| INT126-DESKTOP-RPC-01 | RPC/worker/service contract | Broad RPC/worker bounds and error matrix were not selected; graph success path is separately compared. | NOT RUN |
| INT126-DESKTOP-STALE-01 | Stale identity/conflicts | Active/dependency revisions, project generation and destination revalidation. | NOT RUN |
| INT126-DESKTOP-CANCEL-01 | Desktop cancellation | Picker/worker precommit cancel; committing boundary accurately shown. | NOT RUN |
| INT126-DESKTOP-OVERWRITE-01 | Desktop overwrite | Graph-level exact target confirmation, refusal/accept, unrelated files intact. | NOT RUN |
| INT126-DESKTOP-WRITER-01 | Desktop writer result | Multi-file publish and path outcomes including rollback incomplete. | NOT RUN |
| INT126-DESKTOP-UI-01 | Vite UI harness | Export action, progress, dialog, cancel, stale, errors, success/open/reveal. | PASS |
| INT126-DESKTOP-NATIVE-01 | Native WebView | No direct native route was authorized or available. | BLOCKED/UNAVAILABLE |
| INT126-DESKTOP-FULL-01 | Full desktop suite | S126 full suite was not selected; preserve the S125 timing-sensitive report-export failure. | NOT RUN |
| INT126-DESKTOP-TYPE-01 | Desktop typecheck | S126 configured Hutch wrapper and pinned direct vue-tsc were not selected. | NOT RUN |
| INT126-DOC-SPEC-01 | V0.20 spec | API/helpers/views/graph/rollback/residual/exclusion claims match S121-S125 source/contracts. | PASS |
| INT126-DOC-README-01 | README navigation | New links valid; historical spec links unchanged. | PASS |
| INT126-EXAMPLE-01 | Example 16 | AMX run, CLI graph, strict compile, generated runtime/oracle for accepted Asset source form. | PASS |
| INT126-SCOPE-01 | Preservation/release boundary | Primary output manifests match; no product or release/package/platform command ran. | PASS |

## Root, Build, and Aggregate Gates

| Evidence ID | Gate | Required evidence | Raw status |
| --- | --- | --- | --- |
| INT126-ROOT-FOCUSED | Focused root suites | Exact approved transpiler/parser/runtime/measurement/input/graph/CLI/example selection. | NOT RUN |
| INT126-ROOT-ALL | Full root suite | `bun test`; attempt 01 lacked built `dist/cli.js`, attempt 02 passed. | PASS |
| INT126-ROOT-TYPE | Root no-emit typecheck | `bunx tsc --noEmit`. | PASS |
| INT126-ROOT-BUILD | Root build | Isolated `bun run build`; captured Bun exit 0 on attempt 04. | PASS |
| INT126-DIFF | Scope/whitespace | `git diff --check`, changed path and artifact preservation audit. | PASS |

## Closeout Reconciliation

For every row record exact command/action, CWD, tool versions, counts, output
hash, retry, raw status, residual owner, and separate disposition. Builder
recommendation must state complete coverage or exact missing scope; Product
Owner acceptance does not upgrade any raw failure/unavailable row.

## S126 Execution Results

Authorized baseline: clean `feat/create-V0.20.0` at
`08fbfa3592bc815e1a6617d3c003a468bd8da9a0`; mutating checks ran in the named
detached worktree. Host/tool versions and the full command ledger are in
`builder-evidence.md`. New outputs are under `artifacts/run-01/`; its recursive
manifest has 62 files / 2,251,499 bytes and SHA-256
`834731015C8DFD0102AF9942183F28FD937BCE9E7088BDC661B125899A3D657A`.

| Evidence ID | S126 action and result | Raw status |
| --- | --- | --- |
| INT126-ENTRY-121..125 | Verified owner dispositions/residuals; reconciled four canonical lifecycle ledgers without editing S125 raw evidence. | PASS |
| INT126-ROOT-ALL | `bun test`: attempt 01 failed 737/1 because the fresh worktree lacked `dist/cli.js`; after build, attempt 02 passed 738/0 with 5,668 assertions across 51 files. | PASS (attempt 02); attempt 01 FAIL retained |
| INT126-ROOT-TYPE / BUILD | Root no-emit typecheck and isolated build passed. Bun build exit 0; helper JS/declaration hashes are in Builder evidence. | PASS |
| INT126-ROOT-FOCUSED | Separate ten-file focused selection was not selected. Its tests ran within the full aggregate; no separate focused-suite result is claimed. | NOT RUN |
| INT126-CLI-01 / EXAMPLE-01 | Example 16 AMX and CLI graph passed; two modules emitted. Strict TS 5.9.3 compile and generated oracle matched exports and ordered table/chart/structured-v2 diagram views. | PASS |
| INT126-CLI-EQUIV-01 / EMIT-IMPORT | The desktop service/worker and CLI produced identical two-module paths and bytes for identical Example 16 source; import specifiers and entry output path matched. | PASS |
| INT126-CLI-INVALID / PATH / COLLISION / OVERWRITE / DETERMINISM / WRITER | Applicable graph and CLI tests passed within the full root suite. | PASS |
| INT126-EMIT-MEASURE | Retained probe AMX/CLI run passed; strict generated graph compilation failed with TS2345 Measurement identity mismatch. Measurement oracle was not run after compile failure. | FAIL |
| INT126-DESKTOP-UI | Playwright Vite workflow harness passed 9/9 on port 4183. It is not native WebView evidence. Initial Windows webServer launch and wrong-CWD startup failures remain separately logged. | PASS (final attempt); first attempts FAIL retained |
| INT126-DESKTOP-RPC / FULL / TYPE | Worker/RPC contract, full desktop suite, configured Hutch wrapper, and direct pinned desktop typecheck were not selected. Carry S125 full desktop FAIL, Hutch BLOCKED/UNAVAILABLE, and direct vue-tsc PASS unchanged. | NOT RUN (S125 statuses carried) |
| INT126-DESKTOP-NATIVE | No native WebView or macOS/Linux route was run. | BLOCKED/UNAVAILABLE |
| INT126-DOC-SPEC / README / SCOPE | API/behavior audit passed; README/Example 16 test passed in full root suite; historical specs are unchanged. Primary protected-output manifest is hash-identical before/after. | PASS |
| INT126-G124-CANCEL / CRASH | CLI cancel and crash/power-loss cases were not rerun. D121-18 remains best-effort/non-crash-atomic. | NOT RUN |

S122/S123/S124 process FAILs, every incomplete G123 row, S125
`S125-MEASUREMENT-PROBE-01` raw FAIL (TS2339/TS2322), S125 full desktop FAIL,
Hutch wrapper no-result, native/platform unavailable, D122-15, and D121-18
remain independently recorded. No accepted sprint disposition upgrades them.