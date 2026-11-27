# Sprint 126 Integrated Evidence Matrix

## Status and Evidence Rules

Architect-prepared matrix. All rows are `NOT RUN` during preparation except
the entering dependency/residual state explicitly recorded below. Before
execution, reconcile S125 canonical disposition and obtain exact S126
authorization. For each executed row record command/action, CWD, host/tool
versions, expected/actual, counts/assertions, output path/hash, retry, raw
status, residual owner, and separate owner disposition.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, `NOT RUN`. An
accepted sprint disposition never rewrites an earlier raw status.

## Entry and Dependency Reconciliation

| Evidence ID | Gate | Required reconciliation | S126 record | Raw status |
| --- | --- | --- | --- | --- |
| INT126-ENTRY-121 | S121 final feasibility | Accepted closeout, four-case helper probe, D121-18 residual preserved. | Accepted 2026-11-25; D121-18 best-effort/non-crash-atomic. | NOT RUN |
| INT126-ENTRY-122 | S122 helper/API | Accepted scope, public API, D122-15 no-parity, retry residual preserved. | Accepted 2026-11-25; no parity for unexpressible enum-valued defaults. | NOT RUN |
| INT126-ENTRY-123 | S123 emitter | Owner disposition and every G123/E123 status; preserve S123 retry process FAIL. | Accepted 2026-11-26; incomplete rows remain blocked/unavailable. | NOT RUN |
| INT126-ENTRY-124 | S124 graph/CLI | Owner disposition, G124 matrix, S124 retry process FAIL, cancellation/crash NOT RUN. | Accepted 2026-11-26; `G124-PUBLISH-CANCEL-01` and crash boundary NOT RUN. | NOT RUN |
| INT126-ENTRY-125 | S125 desktop/docs/example | Verify Builder evidence disposition and residuals; reconcile canonical lifecycle ledgers. | Builder evidence says accepted 2026-11-27; state/decisions/status/briefing lag at S123 as of preparation. | BLOCKED/UNAVAILABLE until ledger reconciliation |
| INT126-RESIDUAL-123-PROCESS | S123 retry/stop | Preserve `S123-RETRY-STOP-01` raw FAIL and accepted residual. | Product Owner accepted as process residual 2026-11-26. | FAIL (carried) |
| INT126-RESIDUAL-124-PROCESS | S124 retry/stop | Preserve `S124-RETRY-STOP-01` raw FAIL and accepted residual. | Product Owner accepted as process residual 2026-11-26. | FAIL (carried) |
| INT126-RESIDUAL-125-DESKTOP | S125 desktop aggregate | Full desktop `bun run test` report-export poll failure. | S125 aggregate remains FAIL; rerun exact suite if authorized. | FAIL (carried) |
| INT126-RESIDUAL-125-NATIVE | S125 native/platform | Native WebView and cross-platform unavailable. | Vite UI is harness evidence only. | BLOCKED/UNAVAILABLE (carried) |
| INT126-RESIDUAL-125-MEASUREMENT | S125 emitter measurement probe | Generated Measurement identity compile failure. | `S125-MEASUREMENT-PROBE-01` remains raw FAIL; no repair in S126. | FAIL (carried) |
| INT126-RESIDUAL-125-TYPECHECK | S125 wrapper typecheck | Hutch wrapper blocked/no completion; pinned direct vue-tsc passed. | Preserve wrapper and direct command as distinct rows. | BLOCKED/UNAVAILABLE (carried) |

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
| INT126-EMIT-MEASURE | G123-MEASURE-01 | BLOCKED/UNAVAILABLE; Measurement probe raw FAIL in S125 | Affine operation/aggregate/rejection matrix and reproduce compile probe. | NOT RUN |
| INT126-EMIT-RECORD | G123-RECORD-01 | BLOCKED/UNAVAILABLE | Inheritance/default/optional/null/full field-order matrix. | NOT RUN |
| INT126-EMIT-IMPORT | G123-IMPORT-01 | PASS | Reverify nested generated imports in CLI/desktop graph. | NOT RUN |
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
| INT126-CLI-01 | CLI graph success | Example 16 and nested graph produce full module set and entry path. | NOT RUN |
| INT126-CLI-EQUIV-01 | CLI/desktop graph equivalence | Same captured source graph yields identical output-relative paths and bytes. | NOT RUN |
| INT126-CLI-INVALID-01 | Parse/type/import errors | Nonzero exit, source diagnostics, no output graph. | NOT RUN |
| INT126-CLI-PATH-01 | Containment/cycle/visibility | Existing module rules and ordered dependency output preserved. | NOT RUN |
| INT126-CLI-COLLISION-01 | Output collisions | Case/NFC/file-directory/escape/source alias preflight; no writes. | NOT RUN |
| INT126-CLI-OVERWRITE-01 | Overwrite safety | Default refusal, `--overwrite` exact graph-owned targets, unrelated files preserved. | NOT RUN |
| INT126-CLI-DETERMINISM-01 | Determinism | Repeat graph output bytes and import specifiers compare exactly. | NOT RUN |
| INT126-CLI-COMPILE-01 | Generated graph compilation | TS 5.9.3 strict compile, public helper path and `.ts` imports. | NOT RUN |
| INT126-WRITER-ROLLBACK-01 | Failure/rollback | Stage/publish/rollback injected states; per-path hashes and D121-18 limitations. | NOT RUN |
| INT126-G124-CANCEL | G124-PUBLISH-CANCEL-01 | Preserve existing NOT RUN unless the exact S124 CLI row is separately rerun. | NOT RUN |
| INT126-G124-CRASH | G124-PUBLISH-CRASH-BOUNDARY-01 | No crash atomicity claim; preserve NOT RUN unless explicitly and safely tested. | NOT RUN |

## Desktop Graph Export and Documentation

| Evidence ID | Gate | Required evidence | Raw status |
| --- | --- | --- | --- |
| INT126-DESKTOP-RPC-01 | RPC/worker/service contract | Operation bounds, source overlays, job result and errors. | NOT RUN |
| INT126-DESKTOP-STALE-01 | Stale identity/conflicts | Active/dependency revisions, project generation and destination revalidation. | NOT RUN |
| INT126-DESKTOP-CANCEL-01 | Desktop cancellation | Picker/worker precommit cancel; committing boundary accurately shown. | NOT RUN |
| INT126-DESKTOP-OVERWRITE-01 | Desktop overwrite | Graph-level exact target confirmation, refusal/accept, unrelated files intact. | NOT RUN |
| INT126-DESKTOP-WRITER-01 | Desktop writer result | Multi-file publish and path outcomes including rollback incomplete. | NOT RUN |
| INT126-DESKTOP-UI-01 | Vite UI harness | Export action, progress, dialog, cancel, stale, errors, success/open/reveal. | NOT RUN |
| INT126-DESKTOP-NATIVE-01 | Native WebView | Direct native acceptance only if authorized/available. | BLOCKED/UNAVAILABLE until direct route exists |
| INT126-DESKTOP-FULL-01 | Full desktop suite | Exact configured `bun run test`, preserve timing-sensitive report-export failure. | NOT RUN |
| INT126-DESKTOP-TYPE-01 | Desktop typecheck | Configured Hutch wrapper and pinned direct vue-tsc as separate rows. | NOT RUN |
| INT126-DOC-SPEC-01 | V0.20 spec | API/helpers/views/graph/rollback/residual/exclusion claims match S121-S125. | NOT RUN |
| INT126-DOC-README-01 | README navigation | New links valid; historical spec links unchanged. | NOT RUN |
| INT126-EXAMPLE-01 | Example 16 | AMX run/format, CLI graph, strict compile, generated runtime/oracle. | NOT RUN |
| INT126-SCOPE-01 | Preservation/release boundary | Changed-path audit, output hashes, no package/release/platform commands. | NOT RUN |

## Root, Build, and Aggregate Gates

| Evidence ID | Gate | Required evidence | Raw status |
| --- | --- | --- | --- |
| INT126-ROOT-FOCUSED | Focused root suites | Exact approved transpiler/parser/runtime/measurement/input/graph/CLI/example selection. | NOT RUN |
| INT126-ROOT-ALL | Full root suite | `bun test`, complete raw aggregate and unrelated failures/retries/skips. | NOT RUN |
| INT126-ROOT-TYPE | Root no-emit typecheck | `bunx tsc --noEmit`. | NOT RUN |
| INT126-ROOT-BUILD | Root build | Isolated/preserved `bun run build`, generated renderer/helper hashes. | NOT RUN |
| INT126-DIFF | Scope/whitespace | `git diff --check`, changed path and artifact preservation audit. | NOT RUN |

## Closeout Reconciliation

For every row record exact command/action, CWD, tool versions, counts, output
hash, retry, raw status, residual owner, and separate disposition. Builder
recommendation must state complete coverage or exact missing scope; Product
Owner acceptance does not upgrade any raw failure/unavailable row.