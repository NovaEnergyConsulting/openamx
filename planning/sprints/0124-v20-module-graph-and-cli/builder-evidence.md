# Sprint 124 Builder Evidence: Module Graph and CLI

## Status

S124 graph resolution, safe output publication, CLI integration and focused
verification were performed under the Product Owner authorization recorded in
the verification plan. All applicable focused graph/CLI tests, root
typecheck, build and generated-graph compile passed in the recorded runs.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for S124 graph/CLI
scope only.

**Separate Product Owner disposition:** ACCEPTED/CLOSED WITH RECORDED RESIDUALS
by the Product Owner on 2026-11-26. The accepted scope is S124 module graph
resolution, safe output publication and CLI only. The disposition preserves
the S124 retry-process raw FAIL, non-run cancellation/crash rows, and every
carried S121-S123 residual; it grants no S125/S126 or release authority.

The original authorization set a two-retry cap. The writer-test slice needed
three repair reruns before passing; preserve this as raw process `FAIL`
`S124-RETRY-STOP-01`. The Product Owner removed the cap on 2026-11-26 and
authorized continued sprint development and accepted `S124-RETRY-STOP-01` as a
named process residual at closeout on 2026-11-26. The raw `FAIL` and retry
history remain unchanged.

## Entry and Baseline

| Evidence item | Record | Raw status |
| --- | --- | --- |
| S121 disposition/residual | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25. D121-18 remains best-effort and not crash-atomic. | PASS |
| S122 disposition/residuals | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25. Preserve D122-15 enum-default no-parity and the S122 retry/stop residual. | PASS |
| S123 disposition/residuals | ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26. Preserve S123-RETRY-STOP-01 raw FAIL and incomplete G123 statuses. | PASS |
| Baseline/worktree | Clean `feat/create-V0.20.0`, commit `e93c78daf8676eb6dbd7a536552c58a7bac9a747`; Windows PowerShell 5.1.26100.9818; Bun 1.4.5; TypeScript 5.9.3; Git 2.56.1.windows.1; package 0.19.0; lockfile `bun.lock`. | PASS |
| Root generated-output baseline | `dist/`: 196 files / 1,661,955 bytes. Renderer SHA-256 `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. Before/after path, length and SHA-256 manifests match. | PASS |
| S124 authorization | User approved S124 as proposed on 2026-11-26, including exact paths, commands, roots, overwrite, failure injection, preservation and cleanup. User later removed the retry cap for sprint development. | PASS |

## Approved D124 Behavior

| Decision | Implemented behavior |
| --- | --- |
| D124-01 | `transpile <input>` requires `--out-dir`; `--import-root` is optional; `--overwrite` is explicit and noninteractive. |
| D124-02 | Filesystem discovery reads and parses source only; `loadEntryModule` and AMX evaluation are not used. |
| D124-03 | `realpath` identities; default root is the entry directory; explicit root must contain entry and dependencies. |
| D124-04 | Only relative `./`/`../` imports, `/` separators, exact `.amx`; import-before-code and existing visibility rules retained. |
| D124-05 | Mirror source paths relative to root, replacing only `.amx` with `.ts`; generated specifiers use `/`. |
| D124-06 | Existing targets refused unless `--overwrite`; no interactive prompt, so cancellation is NOT RUN. |
| D124-07 | Full graph preflight and staging precede publication; per-path staged/published/restored/unrecovered rollback states reported. |
| D124-08 | D121-18 remains best-effort and not crash-atomic. |
| D124-09 | Reject source-tree output, target escapes, aliases and symlink output targets. |
| D124-10 | Collision key uses Unicode NFC normalization followed by locale-independent JavaScript `toLowerCase()`. |
| D124-11 | Reuse AMX5001-5003 for graph diagnostics and AMX6001-6002 for output diagnostics; no new diagnostic codes. |
| D124-12 | S123 incomplete G123 rows and process FAIL remain unchanged. |

## Changed Paths

- `src/transpiler/filesystemGraph.ts` and `src/transpiler/outputWriter.ts` added.
- `src/cli.ts` updated with `transpile <input> --out-dir <directory>` plus
    `--import-root` and `--overwrite`.
- `tests/transpilerGraph.test.ts` and `tests/transpileCli.test.ts` added.
- Only S124 `verification-plan.md`, this `builder-evidence.md`, and the approved
    `artifacts/run-01/` tree were changed in planning/evidence.
- No changes to S121/S122/S123 artifacts, `src/transpiler/types.ts`,
    `src/transpiler/graph.ts`, `src/transpiler/index.ts`, `src/transpiler/source.ts`,
    `src/runtime/moduleLoader.ts`, package exports/version, release files,
    desktop, renderer feature code, docs/spec/examples, S125 or S126.

## Command Ledger

Repository-root CWD for all rows:
`C:\Users\gamez\Programming\openamx`.

| Run ID | Command/action and outcome | Artifact/hash | Raw status |
| --- | --- | --- | --- |
| S124-TOOLS | `bun --version`; `bunx tsc --version`; `git --version`; versions as above. | Captured in verification-plan.md. | PASS |
| S124-GRAPH-FOCUSED | `bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts`; 27 tests, 0 failures, 116 assertions. | `logs/focused-tests-final.log`; SHA-256 `15FFA0E7F6BEC5C64026FF4A7158F67AAA65E9FB87C65DC03A2BF9EA900FB8A9`. | PASS |
| S124-CLI-SUCCESS | `bun run src/cli.ts transpile planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/fixtures/main.amx --out-dir planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/generated --overwrite`; two modules listed. | `logs/cli-success-final.log`; SHA-256 `3BDF76F6D9E376EF4A306703CDDD7F70AA50263E1C3A8A3F5820C80127002916`; generated `main.ts` SHA-256 `8649A2B6533CD1AAB7B92DF0085027E37A9591C130F64CC4F052FDFBCA920D6A`; `lib/math.ts` SHA-256 `C9962E8621B0861AB64FFCB0565BD739CB405EEE117ABE2BFCB7498AE12E56EE`. | PASS |
| S124-CLI-INVALID | Focused CLI tests cover missing `--out-dir`, type-invalid AMX, missing import, default refusal, overwrite and no false-success stdout. | `logs/focused-tests-final.log`. | PASS |
| S124-TYPECHECK | `bunx tsc --noEmit`; exit 0. | `logs/typecheck-final.log`; SHA-256 `78E1EEFDD5B61C51D0683723752D200301095922E4BB612EA6DD3EA448D410BF`. | PASS |
| S124-BUILD-02 | `bun run build`; exit 0; 228 files / 1,971,496 bytes. | `logs/build-r02.log`; SHA-256 `C84063DBB1D69469C08FE0DB508903C5083F2F41ED3B917189D6141B4F73BB10`; archive manifest SHA-256 `8422232CB6CE099FADACFF99A3E1A861DBD709C0DF6CB0DDC3FD3870C8F0284E`. | PASS |
| S124-GENERATED-COMPILE-WRONG-DIST | Strict TS 5.9.3 compile after root `dist` restoration. | `logs/generated-compile-final.log`; SHA-256 `ED7C9ECFBB301FA4D44358CA634AFFD1E91B6C5C7221F5A4CE329192EBDE9D56`; helper subpath unresolved because restored baseline `dist` intentionally lacks it. | FAIL |
| S124-GENERATED-COMPILE | Strict command: `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0124-v20-module-graph-and-cli/artifacts/run-01/generated/main.ts`; run after build, before restore; exit 0. | `logs/generated-compile-r02.log`; SHA-256 `78E1EEFDD5B61C51D0683723752D200301095922E4BB612EA6DD3EA448D410BF`. | PASS |
| S124-PRESERVE | Restore and compare root `dist` and renderer. | `preservation/dist-before.csv` and `dist-after.csv`, each SHA-256 `8A1E6895D53DA16345C2FDC28C5BDF466EC35A8399A777B010B1BC30CF0E06A`; renderer manifests each SHA-256 `CB1E177759ED72048054386B4A1533FF58A1C9EBDEE3313B7CE02BBB16A91C41`. | PASS |
| S124-DIFF-CHECK | `git diff --check` after final evidence edits. | Exit 0; no diagnostics. | PASS |

Run-01 artifact manifest: 673 files; SHA-256
`F1EA18D42001DBFBE378D44B7A65B30460B4F0500CAE3254F21B9B3352E898CF`.
The manifest excludes itself. Generated public helper hashes in the archived
build are `transpilerRuntime.js`
`D942C580796D52B4C190ED3D06CDC31EAC5EEBC8350EAA7CB3AAACC89B08A8B1` and
`transpilerRuntime.d.ts`
`DD921796854E94E5AC1D998F53DC61B66DE85F9A94D30194E0E5B06CF39C0E33`.

## Requirement Reconciliation

| Evidence ID | Required reconciliation | Result | Raw status |
| --- | --- | --- | --- |
| E124-ENTRY-01 | S121/S122/S123 dispositions and residuals preserved. | Closeouts verified; D121-18, D122-15, S122 retry residual, S123 process FAIL and incomplete G123 rows retained. | PASS |
| E124-GRAPH-01 | Filesystem source graph matches exact S123 input graph. | Canonical identities, original text, resolved imports and dependency-first order tested; S123 called once from CLI after complete resolution. | PASS |
| E124-PATH-01 | Output paths/import specifiers deterministic and collision-free. | Mirror, POSIX import rewrites, traversal, case/NFC, file-directory, alias and repeat-byte cases covered. | PASS |
| E124-CLI-01 | Help, argument validation, success/failure status and diagnostics. | Root/subcommand help, required destination, success, diagnostics, path spaces and no false success covered. | PASS |
| E124-SAFE-01 | No-write preflight failures, overwrite isolation and best-effort rollback. | Existing/unrelated files preserved; staged, published, restored and unrecovered states injected and checked. Cancellation has no approved interactive path; see G124-PUBLISH-CANCEL-01. | PASS |
| E124-COMPILE-01 | Generated nested graph compiles with public S122 helper package. | Strict TypeScript 5.9.3 compile passed after build; wrong-dist first attempt preserved separately. | PASS |
| E124-S123-RESIDUAL-01 | Every incomplete G123 row and S123 process FAIL remains separately classified. | Carry-forward table below retains all entering BLOCKED/UNAVAILABLE rows and S123-RETRY-STOP-01 raw FAIL. | PASS |
| E124-SCOPE-01 | Changes exclude S125/S126/release/package/platform work. | Changed-path audit below; generated root outputs restored. | PASS |

## G124 Matrix

Every row is mapped to the focused suites or explicitly retained as NOT RUN.

| G124 ID | Raw status | Evidence |
| --- | --- | --- |
| G124-GRAPH-ENTRY-01 | PASS | Nested single-module entry mapping test. |
| G124-GRAPH-NESTED-01 | PASS | Four-module depth-first graph with shared leaf. |
| G124-GRAPH-SHARED-01 | PASS | Canonical shared dependency and symlink aliases deduplicate to one module. |
| G124-GRAPH-ROOT-DEFAULT-01 | PASS | Default entry-directory root in graph and CLI tests. |
| G124-GRAPH-ROOT-EXPLICIT-01 | PASS | Explicit root acceptance and mirrored nested entry paths. |
| G124-GRAPH-ESCAPE-01 | PASS | Explicit-root traversal and symlink escape rejection. |
| G124-GRAPH-SYMLINK-01 | PASS | In-root alias identity and out-of-root symlink rejection. |
| G124-GRAPH-CYCLE-01 | PASS | Cycle code, ordered graph context and importing-file source location. |
| G124-GRAPH-MISSING-01 | PASS | Missing dependency returns AMX5001 before output. |
| G124-GRAPH-SYNTAX-01 | PASS | Bare, URL, absolute, backslash and wrong-case suffix imports rejected. |
| G124-GRAPH-IMPORT-ORDER-01 | PASS | Import-after-code rejects with AMX5001. |
| G124-GRAPH-IMPORT-DUP-01 | PASS | Duplicate import/local collisions preserve AMX5002 and AMX3008. |
| G124-GRAPH-EXPORT-01 | PASS | Private/missing rejection and exported type, enum, function, binding, dimension and unit coverage. |
| G124-GRAPH-ENTRY-INPUT-01 | PASS | Entry input accepted; imported input rejects with AMX3005. |
| G124-GRAPH-PARSE-01 | PASS | Malformed dependency preserves source-local parse diagnostic. |
| G124-GRAPH-TYPE-01 | PASS | Type-invalid dependency returns AMX3002; no write path invoked. |
| G124-GRAPH-UNREACHABLE-01 | PASS | Resolver includes only reachable modules. |
| G124-GRAPH-NO-EVAL-01 | PASS | CLI transpiles a graph containing a runtime-failing expression without evaluating it. |
| G124-PATH-MIRROR-01 | PASS | Nested module paths map to relative `.ts` targets. |
| G124-PATH-IMPORT-01 | PASS | Relative `.ts` import specifiers compile in the generated graph. |
| G124-PATH-SOURCE-COLLIDE-01 | PASS | Source-root output and a target aliasing an AMX source are rejected. |
| G124-PATH-TRAVERSAL-01 | PASS | Absolute, traversal, backslash and empty-segment targets rejected before writes. |
| G124-PATH-CASE-01 | PASS | Case-fold and NFC-normalization collisions rejected. |
| G124-PATH-FILEDIR-01 | PASS | Parent-file/child-directory conflict rejected. |
| G124-PATH-EXISTING-01 | PASS | All existing graph targets refused without overwrite and bytes preserved. |
| G124-PATH-OVERWRITE-01 | PASS | Explicit overwrite replaces graph-owned targets only. |
| G124-PATH-UNRELATED-01 | PASS | Unrelated output file preserved across success/refusal. |
| G124-PATH-DETERMINISM-01 | PASS | Repeated CLI output bytes compare exactly. |
| G124-PUBLISH-STAGE-FAIL-01 | PASS | Injected middle-stage failure leaves no final targets. |
| G124-PUBLISH-FIRST-FAIL-01 | PASS | Injected first-publish failure leaves no final targets. |
| G124-PUBLISH-AFTER-ONE-FAIL-01 | PASS | Later publish failure rolls earlier publish back and reports staged/restored states. |
| G124-PUBLISH-ROLLBACK-FAIL-01 | PASS | Injected rollback failure preserves backup and reports unrecovered path. |
| G124-PUBLISH-CANCEL-01 | NOT RUN | CLI is noninteractive under approved `--overwrite` behavior; no cancellation interaction exists. Product Owner accepted this residual on 2026-11-26. |
| G124-PUBLISH-CRASH-BOUNDARY-01 | NOT RUN | No crash/power-loss injection; D121-18 explicitly remains non-crash-atomic and is accepted as a residual. |
| G124-CLI-HELP-01 | PASS | Root and `transpile --help` checks. |
| G124-CLI-SUCCESS-01 | PASS | Nested success writes all modules and reports entry/module list. |
| G124-CLI-ERROR-01 | PASS | Parse/type/import/output failures return nonzero without success-shaped stdout. |
| G124-CLI-SPACES-01 | PASS | Entry, import root and output root paths include spaces. |
| G124-CLI-NOEXEC-01 | PASS | Runtime-failing AMX expression is emitted but not executed by CLI. |
| G124-CLI-COMPILE-01 | PASS | Generated nested graph compiles with TypeScript 5.9.3 and built public helper subpath. |

## S123 Residual Carry-Forward

These statuses remain exactly as recorded in S123 `parity-matrix.md` and
`builder-evidence.md`; S124 graph/CLI evidence does not upgrade them.

| S123 row | Entering raw status |
| --- | --- |
| E123-AST-01 | BLOCKED/UNAVAILABLE |
| E123-HELPER-01 | BLOCKED/UNAVAILABLE |
| E123-SOURCE-01 | BLOCKED/UNAVAILABLE |
| E123-PARITY-01 | BLOCKED/UNAVAILABLE |
| E123-REJECT-01 | BLOCKED/UNAVAILABLE |
| G123-COMMENT-ESCAPE-01 | BLOCKED/UNAVAILABLE |
| G123-REJECT-01 | BLOCKED/UNAVAILABLE |
| G123-DECL-01 | BLOCKED/UNAVAILABLE |
| G123-NAME-01 | BLOCKED/UNAVAILABLE |
| G123-FUNCTION-01 | BLOCKED/UNAVAILABLE |
| G123-EXPORT-01 | BLOCKED/UNAVAILABLE |
| G123-LITERAL-01 | BLOCKED/UNAVAILABLE |
| G123-EXPR-01 | BLOCKED/UNAVAILABLE |
| G123-STRING-01 | BLOCKED/UNAVAILABLE |
| G123-OPERATOR-01 | BLOCKED/UNAVAILABLE |
| G123-CONTROL-01 | BLOCKED/UNAVAILABLE |
| G123-MATCH-01 | BLOCKED/UNAVAILABLE |
| G123-CALL-01 | BLOCKED/UNAVAILABLE |
| G123-MUTATION-01 | BLOCKED/UNAVAILABLE |
| G123-LOOP-01 | BLOCKED/UNAVAILABLE |
| G123-LIST-01 | BLOCKED/UNAVAILABLE |
| G123-BUILTIN-01 | BLOCKED/UNAVAILABLE |
| G123-MEASURE-01 | BLOCKED/UNAVAILABLE |
| G123-RECORD-01 | BLOCKED/UNAVAILABLE |
| G123-INPUT-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-TABLE-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-CHART-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-SHOW-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-DIAGRAM-01 | BLOCKED/UNAVAILABLE |
| G123-RUN-FRESH-01 | BLOCKED/UNAVAILABLE |
| S123-RETRY-STOP-01 | FAIL; Product Owner accepted as named process residual on 2026-11-26. |

D121-18 remains best-effort/non-crash-atomic. D122-15 enum-default no-parity
and the accepted S122 retry/stop residual remain unchanged.

## Failures, Limitations and Residuals

| ID | Raw status | First failure / retries | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S124-RETRY-STOP-01 | FAIL | Writer suite: initial 6/2; retry 1 6/2 due Error matcher; retry 2 7/1 due expecting a moved file in staging; retry 3 passed 8/0, exceeding the earlier cap by one. | Builder process. | Product Owner accepted as a named process residual on 2026-11-26; raw FAIL and history retained. |
| S124-GRAPH-CYCLE-ASSERT | FAIL then PASS | Initial assertion expected entry file; actual AMX5003 correctly points to the importing dependency. One correction passed. | Builder test expectation. | Resolved; initial failure retained in conversation/tool output. |
| S124-CLI-FIXTURE | FAIL then PASS | First success-path run: untyped empty list caused AMX3003; output under source root correctly refused with AMX6001. Diagnostic rerun isolated both; fixture was corrected. | Builder test fixture. | Resolved; final focused suite passes. |
| S124-IMPORT-INPUT-GAP | FAIL then PASS | S123 in-memory API accepted imported input; filesystem resolver was amended to preserve loader AMX3005 behavior. | S124 resolver. | Resolved in S124; no S123 API or AMX runtime changes. |
| S124-COLLISION-FIXTURE | FAIL then PASS | Case-fold test supplied two paths to a one-module graph; fixture changed to a real two-module graph. | Builder test fixture. | Resolved. |
| S124-ROLLBACK-FIXTURE | FAIL then PASS | Existing rollback target was seeded without `overwrite: true`; first patch hit neighboring test, then corrected target fixture passed. | Builder test fixture. | Resolved; history preserved. |
| S124-TYPECHECK-FIRST | FAIL then PASS | TS2322: `Stats.size`/`mode`, then `mtimeMs`, typed `number | bigint`; numeric normalization fixed both. | Builder typing. | Resolved; root typecheck PASS. |
| S124-COMPILE-WRONG-DIST | FAIL then PASS | Compile after baseline `dist` restoration could not resolve helper subpath; rebuilt before compile, which passed. | Builder sequencing. | Resolved; both outcomes preserved. |
| S124-FOCUSED-INTERRUPTED | NOT RUN then PASS | One focused test invocation returned only `^C`; immediate rerun passed, then final logged run passed 27/0. | Terminal execution. | Preserve interrupted attempt separately; no test result inferred for it. |

## Recommendation and Disposition

- **Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for S124 graph/CLI
    behavior; cite the cancellation row, crash-boundary row, historical retry
    process event, and all carried S123 statuses.
- **Separate Product Owner disposition:** ACCEPTED/CLOSED WITH RECORDED
    RESIDUALS by the Product Owner on 2026-11-26. G124 cancellation remains
    NOT RUN under the accepted noninteractive CLI behavior.
- **S125/S126 readiness:** PENDING on separate authorization and disposition.
- **Release/package/platform authority:** NONE.