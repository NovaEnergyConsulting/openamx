# Sprint 125 Builder Evidence: Desktop TypeScript Export and Documentation

## Status

S125 implementation and verification were authorized by the Product Owner on
2026-11-26 against the exact allowlist, API extensions, payload limits,
destination/overwrite policy, command set, artifact root, preservation rules,
and no-retry-cap policy recorded below. No authority was taken for S126,
release, package/version, publication, deployment, distribution, or
certification work.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for S125 desktop
graph export and additive documentation/example scope. The focused graph,
worker, RPC, UI harness, root typecheck, generated compile/run, and preservation
gates pass. The full desktop `bun run test` remains FAIL on an unrelated,
timing-sensitive report-export RPC poll; native WebView/cross-platform
acceptance is unavailable. See raw rows below.

**Separate Product Owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| S121 disposition/residual | Accepted/closed with recorded residuals on 2026-11-25; D121-18 remains best-effort and not crash-atomic. | PASS |
| S122 disposition/residuals | Accepted/closed with recorded residuals on 2026-11-25; preserve D122-15 and `S122-RETRY-LIMIT-DEVIATION` raw FAIL. | PASS |
| S123 disposition/residuals | Accepted/closed with recorded residuals on 2026-11-26; preserve `S123-RETRY-STOP-01` raw FAIL and every G123 status below. | PASS |
| S124 disposition/residuals | Accepted/closed with recorded residuals on 2026-11-26; preserve `S124-RETRY-STOP-01` raw FAIL, G124 cancellation/crash NOT RUN, and D121-18. | PASS |
| Baseline/worktree | Clean `feat/create-V0.20.0`, commit `778504b50c1d8e8cf183e6920f95ad7b047f6069`, 2026-11-26. Windows PowerShell 5.1.26100.9818; Bun 1.4.5; TypeScript 5.9.3; Git 2.56.1.windows.1; Node.js 24.13.1; package 0.19.0; lock `bun.lock`. | PASS |
| S125 authorization | Product Owner approved exact scope/allowlist, API extensions, 100-module/32,000,000-byte payload limit, existing-directory selection, exact graph conflict prompt, commands, Windows Vite/native route classification, artifact root, `dist` preservation, no retry cap, and cleanup. | PASS |
| Root `dist` and renderer preservation | Original root `dist`: 196 files / 1,661,955 bytes; baseline manifest SHA-256 `B32F176F487EBF3327C9FF757DC7AFBA1F15AD56F96DDF67A13564A32A80E22B`. Restored with zero path/length/hash differences. Renderer restored to `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. | PASS |
| Desktop generated output preservation | `desktop-app/dist`: 75 files / 33,519,303 bytes; baseline manifest SHA-256 `CA75539D034351E7D2128BB901E1A78728A32EF8BC461EBB15103E4A922B53B7`; final manifest comparison has zero differences. `desktop-app/artifacts/` and `desktop-app/test-results/` were not cleaned. | PASS |
| S125 artifact root | New artifacts are confined to `planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/`; manifest excludes itself. | 448 entries / 4,044,751 bytes; current path/size/hash comparison has zero differences; manifest SHA-256 `5891E487B9A3104ABFD65BB9A9F2E1150F02E3DB443BC241BD1B8011AB844283`. | PASS |

## Approved Decisions and Changed Paths

| Decision | Approved S125 behavior |
| --- | --- |
| Baseline and scope | Clean branch `feat/create-V0.20.0` at `778504b50c1d8e8cf183e6920f95ad7b047f6069`; exact changed paths listed below; no package/version, CLI, renderer, release, S126, or platform scope. |
| Resolver overlay API | Extend `ResolveTranspileGraphOptions` with `entryText` and canonical-path `sourceOverlay`; overlays take precedence, disk is fallback, no source writes. |
| Writer handoff | Add `inspectTranspiledGraphWrite` immutable plan; bind graph hash, canonical directory identity and all target snapshots; `writeTranspiledGraph` accepts `expectedPlan` and revalidates before and after staging. Existing CLI defaults remain unchanged. |
| Worker result bounds | Maximum 100 modules and 32,000,000 UTF-8 bytes for the complete serialized graph result; reject malformed/oversized results in both worker and service before output preflight. |
| Destination/overwrite | Native picker selects an existing canonical directory starting at project parent; reject directories inside/aliasing the import root. One native prompt lists every exact conflicting relative target. Refusal/cancel leaves targets unchanged; unrelated files are preserved. |
| Commit/cancellation | Cancellation remains available through worker and prepublication stage. Status becomes `committing` immediately before synchronous writer invocation; report per-path stage/publish/restore/unrecovered states. No crash-atomicity claim. |
| Retries/cleanup | No retry cap, as explicitly approved; first failures and each rerun retained. Delete only uniquely owned test temp roots and the explicitly approved accidental root test output; preserve all previous sprint evidence. |

Approved changed paths only:

- `src/transpiler/filesystemGraph.ts`, `src/transpiler/outputWriter.ts`, `tests/transpilerGraph.test.ts`, `tests/examples.test.ts`.
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/bun/jobWorker.test.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/index.ts`, `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/components/TypeScriptExportDialog.vue`, `desktop-app/tests/rpc-contract-check.ts`, `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts`, `desktop-app/tests/ui/typescript-export.pw.ts`, `desktop-app/README.md`.
- `README.md`, `docs/language-spec-v0.20.md`, `examples/16_TypeScript_Transpilation.amx`, and this S125 `builder-evidence.md` / `verification-plan.md`.
- Generated logs, screenshots, manifests, graph outputs and oracle files only under the approved S125 `artifacts/run-01/` root.

## DX125 Row Reconciliation

| Fixture ID | Raw status | Evidence |
| --- | --- | --- |
| DX125-RPC-01 | PASS | Exact operation, graph token, malformed identity, extra fields, and single-file token rejection in `rpc-contract-check.ts`; worker rejects extra/operation-incompatible fields. |
| DX125-WORKER-01 | PASS | Worker returns a complete two-module graph result; service publishes only after writer success. |
| DX125-OVERLAY-01 | PASS | Unsaved entry and open dependency overlays reflected in emitted graph; source bytes remain unchanged with autosave disabled in isolated test. |
| DX125-PAYLOAD-01 | PASS | Exact serialized UTF-8 accounting; 100-module and 32,000,000-byte boundaries and service runtime result-shape validation covered. |
| DX125-DEST-01 | PASS | Native directory picker token binds identity/generation and canonical path; isolated test uses paths containing spaces. |
| DX125-DEST-CANCEL-01 | PASS | Picker returns cancelled and no job starts. |
| DX125-JOB-STALE-01 | PASS | Active edit cancels Vite harness job; service rejects stale active identity before worker startup and prevents publish. |
| DX125-JOB-DEPENDENCY-01 | PASS | Dependency buffer revision changes while overwrite dialog is outstanding; service supersedes and writes nothing. |
| DX125-JOB-CONFLICT-01 | PASS | External dependency disk edit after confirmation supersedes before publish; destination bytes unchanged. |
| DX125-OVERWRITE-NONE-01 | PASS | New graph skips prompt and commits both modules. |
| DX125-OVERWRITE-COLLISION-01 | PASS | One confirmation receives exact `library.ts` and `main.ts` conflicts; refusal preserves originals; acceptance publishes graph. |
| DX125-OVERWRITE-UNRELATED-01 | PASS | `unrelated.txt` remains byte-identical across successful and refused graph export. |
| DX125-OVERWRITE-RACE-01 | PASS | Mutation during confirmation rejects against expected plan before target writes; another test mutates during staging and the writer revalidates before publication. |
| DX125-COMMIT-OK-01 | PASS | Multi-file publish result contains module count/bytes/output ID and registers the entry and directory. |
| DX125-COMMIT-STAGE-FAIL-01 | PASS | Injected staging failure returns staged path state and leaves all final targets unchanged. |
| DX125-COMMIT-ROLLBACK-01 | PASS | Real S124 writer publish failure restores originals; service reports `restored` and `staged`. |
| DX125-COMMIT-ROLLBACK-INCOMPLETE-01 | PASS | Injected rollback failure reports `unrecovered`; no success result; no crash-atomicity claim. |
| DX125-CANCEL-WORKER-01 | PASS | Cancelled running worker job leaves only the pre-existing unrelated file. |
| DX125-CANCEL-COMMIT-01 | PASS | UI shows non-interruptible committing status; true committing status is set immediately before synchronous writer call. |
| DX125-OUTPUT-ACTIONS-01 | PASS | Registered open/reveal targets the generated entry/root; unknown ID and replaced output-directory identity reject. |
| DX125-UI-ENTRY-01 | PASS | Toolbar and command palette expose action for active AMX; absent/empty document hides toolbar action and disables palette action. |
| DX125-UI-SUCCESS-01 | PASS | Vite harness shows module paths/count/bytes and output actions for a two-module graph. |
| DX125-UI-CANCEL-01 | PASS | Picker cancellation and running graph preparation cancellation produce no graph output. |
| DX125-UI-OVERWRITE-01 | PASS | Browser harness displays all exact mocked conflict paths; service contract covers native confirmation accept/refuse. Native message-box interaction not claimed. |
| DX125-UI-ERROR-01 | PASS | Vite harness displays writer diagnostics and per-path rollback state; service exercises actual S124 writer failures. |
| DX125-UI-STALE-01 | PASS | Editing active AMX cancels/closes the in-flight Vite harness workflow; service tests active/dependency staleness and no publication. |
| DX125-UI-DIALOG-01 | PASS | Close button receives focus; Escape cancels and restores focus to invoking action; close controls disable in true committing status. |
| DX125-DOC-01 | PASS | V0.20 spec checked against S121-S124 contracts and exact CLI/helper routes; no historical spec edited. |
| DX125-README-01 | PASS | V0.20 spec/example links added; all prior spec navigation remains present; desktop guide states Vite/native boundary accurately. |
| DX125-EXAMPLE-SOURCE-01 | PASS | Example 16 parses/checks/runs/formats; narrative interpolation and non-AMX fence remain inert. |
| DX125-EXAMPLE-GRAPH-01 | PASS | CLI emits entry plus `libraries/asset-management.ts`; import specifier mirrors graph path. |
| DX125-EXAMPLE-COMPILE-01 | PASS | Final supported graph strict-compiles with TypeScript 5.9.3/ES2022/ESNext/bundler/`allowImportingTsExtensions` against built helper. |
| DX125-EXAMPLE-RUN-01 | PASS | Oracle deep-compares explicit export, ordered table/chart values, and structured-v2 diagram DTO to AMX runtime for accepted source forms. |
| DX125-EXAMPLE-ENUM-DEFAULT-01 | PASS | Example excludes enum-valued record defaults; no parity claim under D122-15. |

## Carried G123 Raw Statuses

S123 remains `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`; none of the following
raw rows are upgraded by desktop/example evidence.

| G123 ID | Entering raw status |
| --- | --- |
| G123-SOURCE-01 | PASS |
| G123-FRONTMATTER-01 | PASS |
| G123-COMMENT-ESCAPE-01 | BLOCKED/UNAVAILABLE |
| G123-REJECT-01 | BLOCKED/UNAVAILABLE |
| G123-DECL-01 | BLOCKED/UNAVAILABLE |
| G123-TYPE-01 | PASS |
| G123-NAME-01 | BLOCKED/UNAVAILABLE |
| G123-ENUM-01 | PASS |
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
| G123-IMPORT-01 | PASS |
| G123-INPUT-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-TABLE-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-CHART-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-SHOW-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-DIAGRAM-01 | BLOCKED/UNAVAILABLE |
| G123-VIEW-ORDER-01 | PASS |
| G123-RUN-FRESH-01 | BLOCKED/UNAVAILABLE |
| G123-DETERMINISM-01 | PASS |

| Other carried row | Entering raw status |
| --- | --- |
| E123-AST-01 | BLOCKED/UNAVAILABLE |
| E123-HELPER-01 | BLOCKED/UNAVAILABLE |
| E123-SOURCE-01 | BLOCKED/UNAVAILABLE |
| E123-PARITY-01 | BLOCKED/UNAVAILABLE |
| E123-REJECT-01 | BLOCKED/UNAVAILABLE |
| G124-PUBLISH-CANCEL-01 | NOT RUN |
| G124-PUBLISH-CRASH-BOUNDARY-01 | NOT RUN |
| D121-18 | Accepted residual: best-effort rollback, not crash-atomic. |
| D122-15 | Accepted residual: no AMX parity for enum-valued record defaults that current AMX cannot express. |

Carry the S122 `S122-RETRY-LIMIT-DEVIATION` raw FAIL (owner accepted), S123
`S123-RETRY-STOP-01` raw FAIL (owner accepted), and S124
`S124-RETRY-STOP-01` raw FAIL (owner accepted). `G124-PUBLISH-CANCEL-01` and
`G124-PUBLISH-CRASH-BOUNDARY-01` remain NOT RUN. D121-18 remains
best-effort/non-crash-atomic; D122-15 remains enum-default no-parity.

## Command and Host Ledger

| Run ID | Required gate | Exact command/action, CWD and version | Result/artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S125-TOOLS-01 | Toolchain | `bun --version`; pinned `typescript`/`vue-tsc` package metadata; `git --version`; `node --version`; Windows PowerShell 5.1.26100.9818. | Bun 1.4.5; TypeScript 5.9.3; vue-tsc 2.2.12; Git 2.56.1.windows.1; Node.js 24.13.1. | PASS |
| S125-ROOT-TSC-01 | Root no-emit typecheck | `bunx tsc --noEmit` from repository root with restored baseline `dist`. | No diagnostics. | PASS |
| S125-ROOT-FOCUSED-01 | Graph, CLI, examples | `bun test tests/transpilerGraph.test.ts tests/transpileCli.test.ts tests/examples.test.ts` from repository root. | 53 tests / 513 assertions passed; final `tests/examples.test.ts` rerun after Example 16 correction: 23 tests / 383 assertions passed. | PASS |
| S125-BUILD-01 | Root build for helper consumer | `bun run build` from repository root. | 228 generated files / 1,980,565 bytes; generated manifest SHA-256 `394EE28DC110119059BA5330A169B4A6F29F50FBC57093462BE0C42421071EBB`. Archive: `artifacts/run-01/generated-dist/`. | PASS |
| S125-DESKTOP-TYPE-PINNED-01 | Desktop source typecheck | `bun run desktop-app/node_modules/vue-tsc/bin/vue-tsc.js --noEmit -p desktop-app/tsconfig.json` from repository root; pinned vue-tsc 2.2.12 / TypeScript 5.9.3. | No diagnostics. | PASS |
| S125-DESKTOP-TYPE-SCRIPT-01 | Configured typecheck wrapper | `bun run typecheck` from `desktop-app/`. Hutch 0.28.2 displayed an updater prompt; after selecting skip, no typecheck completion was emitted before the wrapper was stopped. | Wrapper blocked at Hutch update prompt; direct pinned typecheck above passed. | BLOCKED/UNAVAILABLE |
| S125-WORKER-01 | Worker graph, overlays, bounds, malformed requests | `bun test src/bun/jobWorker.test.ts` from `desktop-app/`. | 11 tests / 63 assertions passed, including unsaved overlays, no generated-code execution, exact serialized-byte cap, module cap, malformed and operation-incompatible request rejection. | PASS |
| S125-RPC-01 | Desktop RPC/service graph workflow | `bun run tests/rpc-contract-check.ts` from `desktop-app/`. | Pass: overlays, multi-file output, no-write picker/worker/precommit cancellation, overwrite refusal/acceptance, stale active/dependency/disk conflicts, post-confirm target mutation, stage failure, verified rollback, incomplete rollback, malformed worker result, stale output identity, open/reveal. | PASS |
| S125-UI-HARNESS-01 | TypeScript export browser workflow | From `desktop-app/`, start Vite 6.4.3 on verified-free port 4183 with `bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort`; run `bun run test:ui -- tests/ui/typescript-export.pw.ts --output=../planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/playwright`. | Final: 9 Playwright tests passed. Vite harness only; native WebView is not established. | PASS |
| S125-NATIVE-01 | Native WebView route | No authorized/native route available in this host session. | No native WebView evidence. | BLOCKED/UNAVAILABLE |
| S125-PLATFORM-ROUTES-01 | Native/cross-platform routes | Only Windows x64 PowerShell/Bun host was available; no native WebView or macOS/Linux host route was run. | No native or cross-platform acceptance implied by Vite results. | BLOCKED/UNAVAILABLE |
| S125-EXAMPLE-AMX-01 | Example 16 parse/check/format/runtime | Covered by final `bun test tests/examples.test.ts`; AMX runtime input is `examples/data/asset.json`. | Parse/check/runtime, idempotent format, ordered table/chart and declaration-time diagram emissions pass. | PASS |
| S125-EXAMPLE-CLI-01 | Example 16 full graph CLI transpile | `bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/generated-supported`. | Two modules: entry and `libraries/asset-management.ts`; exact generated graph retained. | PASS |
| S125-EXAMPLE-COMPILE-01 | Strict generated graph consumer compile | `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/oracle.ts planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/generated-supported/16_TypeScript_Transpilation.ts` with archived S125 helper build temporarily restored. | No diagnostics; TypeScript 5.9.3. Root `dist` restored and hash-compared afterward. | PASS |
| S125-EXAMPLE-RUN-01 | Generated run and AMX oracle | `bun run planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/oracle.ts`. | Deep equality passed for explicit export, ordered table/chart values, and structured-v2 diagram DTO; `assetName=North Pump 01`, table scores 4/8, chart data 4/8. | PASS |
| S125-MEASUREMENT-PROBE-01 | Experimental imported `averageSpeed` Measurement graph | Strict compile of an isolated three-module probe against generated helper build; output retained in `artifacts/run-01/example-16/generated-final/` and `logs/S125-EXAMPLE-MEASUREMENT-PROBE-COMPILE-FAIL.txt`. | TS2339/TS2322 diagnostics in generated measurement helper/type identity. Probe was removed from Example 16; no S123/S122 repair or semantic change was made. | FAIL |
| S125-ROOT-INCIDENTAL-TEST-01 | Mis-CWD root full test command | `bun run test` initially executed at repository root instead of `desktop-app/`. | 734 pass / 1 fail; 5-second desktop packaging test timeout. It modified seven S123 run-01 fixture outputs and created one root `openamx-output-test-*` directory; with separate approval these exact outputs were restored/removed. | FAIL |
| S125-DESKTOP-TEST-01 | Full desktop unit/RPC suite | `bun run test` from `desktop-app/`; raw first failures and reruns retained below. | Guide-resource test initially timed out at 5 seconds; later attempts passed 9 unit tests, then the existing report-export RPC poll failed with `currentPdf.status === "running"`. S125 graph RPC passes when run directly. No unrelated report-export timing change made. | FAIL |
| S125-PRESERVE-01 | Root/desktop generated outputs and renderer | Baseline/generated/post-restore manifests and SHA-256 checks in `artifacts/run-01/{baseline,generated-dist}/`. | Root `dist` 196 files / 1,661,955 bytes, zero differences; `desktop-app/dist` 75 files / 33,519,303 bytes, zero differences; renderer SHA-256 equals baseline `582919DC1148DDA3B803C2901BBB676501D3AF38091719349C80FBBFB43C6116`. | PASS |
| S125-DIFF-CHECK-01 | Whitespace check | `git diff --check` from repository root. | No whitespace errors. | PASS |

## Requirement and Residual Reconciliation

| Evidence ID | Required reconciliation | Result / missing IDs | Raw status |
| --- | --- | --- | --- |
| E125-ENTRY-01 | S121-S124 dispositions and all entering residuals reconciled. | Accepted dispositions verified; S122/S123/S124 process FAILs, all G123 rows, G124 NOT RUN rows, D121-18, and D122-15 retained below. | PASS |
| E125-RPC-01 | Operation/destination/result schemas and worker bounds tested. | Exact operation, selection/identity shape, malformed fields, result validation, module and UTF-8 bounds tested. | PASS |
| E125-ID-01 | Active/dependency revisions, project generation, stale and cancel paths tested. | Active identity, dependency revision/disk conflict, picker/worker/precommit cancellation and output-directory identity covered. | PASS |
| E125-WRITE-01 | Graph preflight, overwrite, writer outcomes and unrelated-file preservation. | Exact conflict prompt, refusal/acceptance, target mutation, stage failure, verified rollback, incomplete rollback, multi-file output and unrelated-file preservation covered. D121-18 unchanged. | PASS |
| E125-DOC-01 | V0.20 spec and README navigation match accepted API and graph/desktop behavior. | Additive spec and README/desktop links checked against existing APIs; historical specifications unchanged. | PASS |
| E125-EXAMPLE-01 | Example source, graph, strict compile/run and view parity. | Final Asset example passes AMX/CLI/strict compile/oracle on accepted source forms. Separate imported Measurement probe is retained as a failure and does not change Example 16 or G123 statuses. | PASS |
| E125-G123-01 | Incomplete S123 rows remain raw and are not upgraded by desktop/example tests. | All 32 G123 rows are listed individually with their accepted run-03 raw status above. | PASS |
| E125-SCOPE-01 | Changed paths exclude S126/release/package/platform work. | Final status matches approved allowlist; no package/version, CLI, renderer, release, historical spec, S126, or distribution changes. | PASS |

## Carried Residuals

| Residual | Entering raw status | S125 treatment |
| --- | --- | --- |
| S122-RETRY-LIMIT-DEVIATION | FAIL; Product Owner accepted as process residual on 2026-11-25. | Preserve raw FAIL and disposition; no S125 inference changes its status. |
| S123-RETRY-STOP-01 | FAIL; owner accepted as process residual. | Preserve raw FAIL/disposition. |
| S123 E123-AST/HELPER/SOURCE/PARITY/REJECT and incomplete G123 rows | BLOCKED/UNAVAILABLE (individual G123 statuses listed above). | Preserve each row; desktop/example success is not full emitter coverage. |
| S124-RETRY-STOP-01 | FAIL; owner accepted as process residual. | Preserve raw FAIL/disposition. |
| G124-PUBLISH-CANCEL-01 | NOT RUN for noninteractive CLI. | S125 desktop cancellation is separate evidence; do not relabel S124 row. |
| G124-PUBLISH-CRASH-BOUNDARY-01 / D121-18 | NOT RUN / accepted non-crash-atomic residual. | Preserve; report best-effort writer outcome only. |
| D122-15 | Accepted enum-default no-parity residual. | No AMX semantic changes or unsupported parity claims. |
| Native/cross-platform acceptance | BLOCKED/UNAVAILABLE in this Windows Vite-only session. | Vite UI evidence is not native WebView or cross-platform acceptance. |

## Failures and Disposition

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S125-ROOT-ACCIDENTAL-TEST-01 | FAIL | Initial `bun run test` at repository root: 734 pass / 1 timeout in a desktop packaging test. It modified seven S123 run-01 fixture outputs and created one untracked root output folder. With explicit user approval, those exact paths were restored/removed; no other previous evidence was touched. | Builder command routing and output preservation. | Recovery verified; raw FAIL retained. |
| S125-DESKTOP-TEST-GUIDE-01 | FAIL | Initial desktop `bun run test`: guide-resource integration exceeded its 5-second timeout (8 pass / 1 fail). Later run passed the 9 unit tests. | Existing guide-resource integration timing. | Raw FAIL retained; later unit-only run passed. |
| S125-DESKTOP-TEST-PDF-01 | FAIL | Repeated full desktop `bun run test` attempts passed the 9 unit tests, then `rpc-contract-check.ts` observed `currentPdf.status === "running"` instead of `"succeeded"` at its existing 1-second poll boundary. S125 graph RPC passes independently. | Existing report-export timing, not graph export. | Not changed as unrelated scope; raw failures retained. |
| S125-DESKTOP-TEST-PDF-01 | FAIL | Full desktop rerun: `currentPdf.status` remained `running` at `rpc-contract-check.ts:1102`. | Existing report-export polling window. | Preserved; subsequent attempts below also reached the same unrelated timing failure. |
| S125-DESKTOP-TEST-PDF-02 | FAIL | Full desktop rerun: `currentPdf.status` remained `running` at `rpc-contract-check.ts:1099`. | Existing report-export polling window. | Preserved; no S125 code change made to report timing. |
| S125-DESKTOP-TEST-PDF-03 | FAIL | Later full desktop rerun again observed `currentPdf.status === "running"` before the existing poll limit. | Existing report-export polling window. | Preserved; S125 graph RPC suite passes independently. |
| S125-UI-PATH-LOCATOR-01 | FAIL | Initial Playwright locator matched a path in both generated and overwrite lists. | Builder test locator. | Scoped to named region on rerun; final UI suite passes. |
| S125-UI-ENTRY-LOCATOR-01 | FAIL | Entry path matched both the summary and generated-path list. | Builder test locator. | Scoped to generated-path region on rerun; final UI suite passes. |
| S125-UI-COMMIT-PREVIEW-01 | FAIL | Automatic preview superseded the deliberately delayed committing harness job. | Harness setup. | Paused preview before controlled graph job; final UI suite passes. |
| S125-UI-EMPTY-PROJECT-01 | FAIL | No-document harness case waited for a nonexistent Pause Preview button. | Harness setup. | Pause preview only when present; final UI suite passes. |
| S125-EXAMPLE-CHART-DESC-01 | FAIL | Initial Example 16 chart lacked required description (`AMX3003`). | Example source. | Added accepted description; final examples suite passes. |
| S125-EXAMPLE-DIAGRAM-DESC-01 | FAIL | Initial diagram lacked required description (`AMXD001`). | Example source. | Added accepted description; final examples suite passes. |
| S125-EXAMPLE-IMPORT-CLOSURE-01 | FAIL | `Asset` input referenced `FailureMode` without explicitly importing it (`AMX4003`). | Example import closure. | Added `FailureMode` import; final examples suite passes. |
| S125-MEASUREMENT-PROBE-01 | FAIL | Experimental imported `averageSpeed` Measurement graph hit generated Measurement type-identity errors during strict compile; full output is retained at `artifacts/run-01/logs/S125-EXAMPLE-MEASUREMENT-PROBE-COMPILE-FAIL.txt`. | S123 Measurement/emitter residual. | Removed from product example; no S123/S122 repair or semantic workaround. |
| S125-HUTCH-TYPECHECK-01 | BLOCKED/UNAVAILABLE | `bun run typecheck` paused on Hutch 0.28.2's updater prompt; selecting skip did not yield completion before the wrapper was stopped. | Host updater interaction. | Direct pinned vue-tsc/TypeScript check passed. |
| S125-BUNX-VUE-TSC-01 | FAIL | `bunx vue-tsc --noEmit` from repo root fetched latest vue-tsc and failed `ERR_PACKAGE_PATH_NOT_EXPORTED` under Node 24.13.1. | Wrong CWD/unpinned invocation. | Replaced by direct pinned desktop vue-tsc command; direct check passed. |
| S125-ARTIFACT-MANIFEST-01 | FAIL | First manifest attempt enumerated its own still-open output file. | Builder manifest command. | Removed only that S125 manifest and regenerated from a materialized input list; final manifest excludes itself. |
| S125-RECOVERY-PATH-01 | FAIL | First fixture recovery command had a duplicated path segment for six S123 fixture arguments. | Builder recovery command. | Corrected the path list; restored fixture hashes match baseline and S123 paths are clean. |
| S125-RPC-INTERRUPTED-01 | NOT RUN | One RPC test launch returned `^C` before test output. | Terminal execution. | Immediate rerun passed, followed by final RPC pass with all S125 cases. |

- **Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for S125 graph
  export and additive docs/example scope; cite the full desktop suite failure,
  Measurement probe residual, native-unavailable status, and carried S121-S124
  rows.
- **Product Owner disposition:** PENDING; record separately with date/scope.
- **S126 readiness:** PENDING on S125 accepted scope and separate S126
  integrated acceptance authorization.
- **Release/package/platform authority:** NONE.