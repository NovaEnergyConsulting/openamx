# Sprint 114 Integrated Evidence Matrix

## Status and Evidence Rules

S114 verification matrix. Entry/disposition reconciliation was recorded after
explicit owner confirmation, and integrated checks ran after separate S114
execution authorization on 2026-10-31 at baseline
`a4839348d112b11ca20858a9554cbb2b5b03b1b6`. Each raw status remains separate
from the Builder recommendation and pending product-owner disposition.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
Keep raw test status separate from Builder recommendation and product-owner
disposition. Acceptance with residuals never rewrites failed/unavailable raw
evidence. Preserve every first failure, retry, and artifact.

For each executed row record exact command/action, cwd, OS/tool versions,
expected vs actual result, test/assertion counts, artifact path, residual
owner, and separate disposition.

## S114 Run Records

| Run ID | Exact action / cwd | Host and result | Raw artifact |
| --- | --- | --- | --- |
| R114-ROOT | From detached `C:\Users\gamez\Programming\openamx-s114-validation-a4839348`: `bun test tests/parser.test.ts tests/diagram.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/modules.test.ts tests/diagramHtml.test.ts tests/renderer.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts tests/examples.test.ts` | Windows x64, Bun 1.4.4, Node 24.13.1. 346 tests, 345 passed, 1 failed, 2,134 assertions. The single failure is the existing V0.14 desktop Help-index expectation. | `artifacts/logs/root-focused.log` |
| R114-BUILD | Same detached worktree root: `bun run build`; then `bunx tsc --noEmit` | Both exit 0. The build ran `scripts/build-diagram-runtime.ts`; generated runtime has no Git diff against the approved baseline. | `artifacts/logs/root-build-retry-02.log`, `artifacts/logs/root-typecheck.log`, `artifacts/hashes/s114-artifact-manifest.json` |
| R114-VSCODE | From detached worktree `vscode-extension/`: `bun run test` | Actual VS Code Extension Development Host 1.143.1; final recorded run 21 passed, 7 failed. Nested V0.18 tokenization passed. Failures are one import-root path case, two Windows drive-case assertions, and four `EBUSY` cleanup failures. | `artifacts/logs/vscode-host-final.log`; initial download `ECONNRESET` and intermediate attempt retained in `vscode-host.log` and `vscode-host-retry-02.log` |
| R114-DESKTOP-TYPE | From detached worktree `desktop-app/`: `bun run typecheck` | Hutch 0.28.2 / Cottontail 0.7.3 produced no `vue-tsc` result after approximately five minutes; identified process tree was stopped. Wrapper exited 255. Raw status `BLOCKED/UNAVAILABLE`. | `artifacts/logs/desktop-typecheck.log` |
| R114-DESKTOP-UI-01 | From detached worktree `desktop-app/`: approved `bun run test:ui -- tests/ui/diagram-playback.pw.ts tests/ui/v16-language-editor.pw.ts --output=../planning/sprints/0114-v18-integrated-acceptance-closeout/artifacts/playwright/s114-final` | The configured `./node_modules/.bin/vite` web server was not recognized by PowerShell; no tests ran. | `artifacts/logs/desktop-ui.log`, `artifacts/playwright/s114-final/` |
| R114-DESKTOP-UI | From detached worktree `desktop-app/`, with the same Vite harness started via `bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort`; same two-file Playwright selection, outputs `s114-retry-02` and `s114-retry-03` | Vite harness only, Chromium 156.0.8078.4. Both actual runs: 7 passed, 1 failed, 1 skipped. The preview bridge still returned “Preview reflects the current buffer” instead of `AMXD011`; native WebView2 test skipped. | `artifacts/logs/desktop-ui-vite-retry-02.log`, `artifacts/logs/desktop-ui-vite-final.log`, `artifacts/playwright/s114-retry-02/`, `artifacts/playwright/s114-retry-03/` |
| R114-EXAMPLE | From detached worktree root: `bun run dist/cli.js render examples/08_Formula_Driven_Diagrams.amx --out planning/sprints/0114-v18-integrated-acceptance-closeout/artifacts/outputs/example-08.html`; `bun run dist/cli.js export pdf examples/08_Formula_Driven_Diagrams.amx --out planning/sprints/0114-v18-integrated-acceptance-closeout/artifacts/outputs/example-08.pdf`; analogous `export docx`. Chromium and static-artifact checks used the exact generated files. | All three CLI exports and direct browser/static inspection exited 0. | `artifacts/logs/example-08-*.log`, `artifacts/outputs/example-08.*`, `artifacts/logs/example-08-browser.log`, `artifacts/logs/example-08-static-output-check-retry-02.log`, `artifacts/playwright/s114-example-08-interior.png` |

All commands ran in the detached validation worktree at baseline
`a4839348d112b11ca20858a9554cbb2b5b03b1b6`, on Windows x64, PowerShell
5.1.26100.9711, Bun 1.4.4, Node 24.13.1, and Git 2.56.0.windows.4. VS Code
1.144.0 was installed on the host; the extension script downloaded and ran
its pinned 1.143.1 host. The approved broader root `bun test` was explicitly
excluded and was not run.

## Entry and Disposition Reconciliation

| Evidence ID | Requirement | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-ENTRY-01 | S109 contract/resource gate | Verified accepted cap=64 control-only accounting, one-host qualification scope, diagnostic decisions, HTML discrepancy, and residuals against S109 evidence and decisions | Read-only evidence review completed 2026-10-31; accepted contract and residuals confirmed | PASS | Product owner; S109 one-host/synthetic and HTML-policy residuals remain |
| INT114-ENTRY-02 | S110 parser/checker/formatter | Verified ACCEPTED/CLOSED and exact accepted AST/diagnostic contracts against S110 evidence and decisions | Read-only evidence review completed 2026-10-31; disposition and contract confirmed | PASS | Product owner; no new disposition implied |
| INT114-ENTRY-03 | S111 runtime | Verified ACCEPTED/CLOSED WITH RECORDED RESIDUALS, AMXD6004, cap/accounting, and D111-02 | Read-only evidence review completed 2026-10-31; disposition and residual confirmed | PASS | Product owner; preserve unbounded-work residual |
| INT114-ENTRY-04 | S112 serialization/render | Product owner confirmed ACCEPTED WITH RECORDED RESIDUALS on 2026-10-31; canonical status/decision/state/briefing records reconciled. Raw S112 outcomes remain unchanged. | Explicit user confirmation and authorized lifecycle reconciliation completed 2026-10-31; no S112 raw evidence altered | PASS | Lead Developer/product owner; Vite bridge, native, and cross-platform residuals remain |
| INT114-ENTRY-05 | S113 editor/spec/example | Product owner confirmed ACCEPTED WITH RECORDED RESIDUALS on 2026-10-31; lifecycle records reconciled. Raw S113 outcomes remain unchanged. | Explicit user confirmation and authorized lifecycle reconciliation completed 2026-10-31; no S113 raw evidence altered | PASS | Product owner; preserve root/VS Code failures, Hutch no-result, analyzer disagreement, and host gaps |

## Integrated Product Evidence

| Evidence ID | Requirement family | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-PARSE-01 | Complete language path | Parse direct/nested primitive, loop, and conditional content in full AMX documents; source order and locations retained | `R114-ROOT`: parser, diagram, and Example 08 feature cases passed; 345/346 aggregate, with unrelated Help-index failure. | PASS | Parser owner; aggregate failure remains separately recorded |
| INT114-DIAG-01 | Control diagnostics | `AMX3006` nested-loop and malformed syntax; `AMXD6001` time-in-control; `AMXD6004` first output 65; exact file/line/column | `R114-ROOT`: focused parser/diagram assertions passed for allocated diagnostics and source anchors. | PASS | Language/runtime owner |
| INT114-CHECK-01 | Static validation and authored accounting | Iterable/condition/scope/property checks; 512 authored / 513 `AMXD013`; controls do not multiply authored count | `R114-ROOT`: diagram and Example 08 tests passed, including authored 512/513 and separate generated accounting. | PASS | Typechecker owner |
| INT114-FORMAT-01 | Recursive formatting | Format nested control example; parse-format-parse semantic tree equivalence and idempotence | `R114-ROOT`: recursive formatting, tree preservation, and Example 08 idempotence cases passed. | PASS | Formatter owner |
| INT114-EXPAND-01 | Model-creation expansion | Depth-first source order, iterable order, selected branches, empty content, model recreation | `R114-ROOT`: ordered expansion, selected branches, empty content, and model recreation assertions passed. | PASS | Runtime owner |
| INT114-CAP-01 | Generated cap | Exactly 64 control-originating emissions pass; 65th fails before append/evaluation; direct primitives excluded; counter per diagram | `R114-ROOT`: exact 64/65, direct-element exclusion, per-diagram cap, and overflow anchor assertions passed. | PASS | Runtime owner |
| INT114-BIND-01 | Frame binding | Distinct iterator values retained for each instance at lower/interior/upper and repeated/out-of-order times; same model membership/order stable | `R114-ROOT` and `R114-EXAMPLE`: iterator bindings and stable model membership/order passed; Example 08 browser values matched at 0, 0.5, 1, then repeated 0.5. | PASS | Runtime owner |
| INT114-RESOURCE-01 | D111-02 and S109 resource rationale | Preserve unbounded-work caveat; report exact host/timing/size; do not infer CPU/memory bound from output cap | `R114-DESKTOP-UI`: production composition 16 diagrams, 512 authored declarations, 64 generated/diagram, 1,520 frame elements; 1,852 DOM nodes; HTML 286,776 bytes; two-run p95 frame samples 4.1/4.9 ms. Five-run PDF/DOCX medians 371.69/296.54 ms; current policy discrepancy retained. | PASS | Product owner; D111-02 and one-host/synthetic limits remain residuals |
| INT114-SERIAL-01 | Versioned serialization | V2 order, identity/path, supported bindings and context round-trip; v1 no-control read; malformed/v1-control/unknown fail closed | `R114-ROOT` and `R114-DESKTOP-UI`: serialization cases passed; standalone production composition matched in-process frames. | PASS | Serialization owner |
| INT114-BROWSER-01 | Standalone interactive browser | Actual embedded runtime reads v2 payload and matches in-process order/geometry at lower/interior/upper; network/page/console/error recovery recorded | `R114-EXAMPLE`: exact S114 HTML passed lower/interior/upper/repeated-time assertions; 3 ordered elements; no browser errors or external requests. Production composition browser test also passed for 1,520 frame elements. | PASS | Renderer/host owner; Vite bridge remains a separate FAIL |
| INT114-STATIC-01 | PDF/DOCX | PDF SVG and DOCX PNG equal lower-bound semantic membership/order; report order, title/description, image metadata and proportions | `R114-ROOT` plus exact S114 CLI outputs: PDF is 35,847 bytes/four pages with diagram title; DOCX is 20,039 bytes, embeds 1200x750 PNG/title, and lower-bound point pixels passed. Adapter tests asserted SVG order and PNG semantics. | PASS | Export owner |
| INT114-EDITOR-SHARED-01 | Shared editor facts | Recursive controls, nested primitive/name/property facts; narrative and non-AMX fence boundaries | `R114-ROOT`: shared editor and formatter feature cases passed, including V0.18 nested facts and fence boundaries. | PASS | Editor owner |
| INT114-EDITOR-VSCODE-01 | VS Code host | Actual TextMate nested scopes and host/provider suite results; preserve Windows cleanup/path failures distinctly | `R114-VSCODE`: actual 1.143.1 host, 21 passed/7 failed; nested V0.18 TextMate/tokenization test passed. | FAIL | Product owner accepted with recorded residuals 2026-11-01; import-root, drive-case, and EBUSY failures remain raw. |
| INT114-EDITOR-DESKTOP-01 | Desktop editor | Typecheck and focused CodeMirror nested decorations/formatting; classify Vite harness vs native evidence | `R114-DESKTOP-TYPE` produced no result (exit 255); `R114-DESKTOP-UI` Vite harness 7 passed/1 failed/1 skipped; nested CodeMirror and formatting passed, preview bridge failed. | FAIL | Product owner accepted with recorded residuals 2026-11-01; Hutch no-result and Vite bridge remain; native not inferred. |
| INT114-EXAMPLE-01 | Example 08 | Run/check/format, below-cap generated count, fixed membership/order, animated `t` properties | `R114-ROOT` and `R114-EXAMPLE`: three generated points, no `t` controls, fixed ordered membership, and lower/interior/upper animated properties passed. | PASS | Example/diagram owner |
| INT114-EXAMPLE-02 | Example output paths | Standalone playback and PDF/DOCX lower-bound content agree with the accepted example | `R114-EXAMPLE`: exact generated HTML/PDF/DOCX paths inspected; browser playback and PDF/DOCX lower-bound content checks passed. | PASS | Renderer/export owner |
| INT114-BUILD-01 | Build/generated artifact | Root build/typecheck; browser bundle generated only through approved script; expected diff reviewed | `R114-BUILD`: build and no-emit typecheck exited 0; bundle generated through script; no normalized Git diff. | PASS | Build owner |
| INT114-SIZE-01 | Size/performance composition | Measure production composition against S109 synthetic and S112 production values; preserve 100 MiB/1 MiB discrepancy and no policy change | `R114-DESKTOP-UI`: compared 286,776 HTML bytes/1,852 nodes with S112 282,331/1,852 and S109 synthetic 247,256/1,864; static outputs 223,824-byte PDF and 16,016-byte DOCX. No limit or policy changed. | PASS | Product owner; one-host, synthetic, and HTML-policy residuals remain |

## Repository and Host Gates

| Evidence ID | Gate | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-ROOT-FOCUSED | Root focused selection | Parser/diagram/evaluator/formatter/editor/renderer/serialization/PDF/DOCX/example tests | `R114-ROOT`: exact 11-file command; 345 passed, 1 failed, 2,134 assertions; Help-index failure retained. | FAIL | Product owner accepted with recorded residuals 2026-11-01; original FAIL retained; separate post-S114 full root run passed 629/0. |
| INT114-ROOT-ALL | Broader root regression | Run only if included in approved S114 plan; record aggregate and unrelated failures | Explicitly excluded from approved plan; not run. | NOT RUN | Product owner acknowledged S114 scope exclusion; separate 2026-11-01 full root follow-up passed 629/0. |
| INT114-VSCODE | Extension suite | Actual Extension Development Host, including S113 nested tokenization tests | `R114-VSCODE`: exact package command; final 21 passed, 7 failed; V0.18 tokenization passed. | FAIL | Product owner accepted with recorded residuals 2026-11-01; raw Windows/import failures retained. |
| INT114-DESKTOP-TYPE | Desktop typecheck | Hutch wrapper and/or explicitly approved direct typecheck, with no-result/stall separated from PASS | `R114-DESKTOP-TYPE`: Hutch/Cottontail ran about five minutes without `vue-tsc`; stopped identified process tree; wrapper 255. | BLOCKED/UNAVAILABLE | Product owner accepted with recorded residuals 2026-11-01; no typecheck result claimed. |
| INT114-DESKTOP-UI | Desktop UI | Focused diagram playback/editor tests; harness/native classifications distinct | `R114-DESKTOP-UI`: Vite harness 7 passed/1 failed/1 skipped; default PowerShell server launch failed before tests; Bun launch used for actual runs. | FAIL | Product owner accepted with recorded residuals 2026-11-01; bridge failure remains raw; harness is not native evidence. |
| INT114-NATIVE | Native/platform | Supported native WebView/package and OS routes if available | Native WebView2 test skipped; no direct native route or cross-platform execution. | BLOCKED/UNAVAILABLE | Product owner accepted with recorded residuals 2026-11-01; no platform certification. |
| INT114-PRESERVE | Preservation and changed paths | Artifact roots, generated hashes/diffs, prior S109-S113 outputs untouched, `git diff --check` | Primary protected roots inventoried; S112 test side effects in isolated copy were retained under S114 then restored hash-identically; four long-path historical screenshots were byte-identical across worktrees; primary runtime hash unchanged; approved changed paths audited; `git diff --check` passed. | PASS | S114 Builder |

## Residual Register to Reconcile

Carry these raw outcomes forward until new direct evidence resolves them:

- S109 qualification used one Windows host and synthetic control/render
  workloads; peak memory and cross-platform performance were not established.
- The V0.13 specification says a 1 MiB interactive HTML limit; the current
  renderer enforces 100 MiB and desktop worker has an 8,000,000-character
  guard. S112 measured below both but did not reconcile policy.
- D111-02: no iteration/work cap; potentially unbounded traversal remains an
  accepted residual. No bounded CPU/memory claim.
- S112's Vite preview bridge was intermittent; native WebView2 was skipped
  and cross-platform evidence was not run.
- S113 root focused suite had 70 pass/1 fail on the unchanged V0.14 Help-index
  expectation; VS Code host had 21 pass/7 fail on Windows cleanup/drive-case
  failures; desktop Hutch typecheck produced no result; desktop Vite UI passed
  3/3; native was not run.
- S113's `get_errors` analyzer reported `Invalid diagram property` at Example
  08's `for` line despite passing CLI/parser/Extension Host evidence. Owner
  triage remains unresolved.
- S112/S113 owner dispositions were confirmed and canonical lifecycle records
  reconciled before execution. Their raw test outcomes remain as recorded.
- S114 root focused aggregate remains 345 passed/1 failed; the sole failure is
  the unchanged V0.14 Help-index expectation.
- S114 VS Code host remains 21 passed/7 failed, with nested V0.18 tokenization
  passing; import-root, drive-case, and Windows cleanup failures remain.
- S114 Hutch typecheck produced no `vue-tsc` result and exited 255 after the
  identified stalled preparation process was stopped.
- S114 Vite UI remains 7 passed/1 failed/1 skipped; the preview bridge
  diagnostic failure persists. Native WebView2 was skipped and cross-platform
  checks were not run.
- Four long-path S106/S107 screenshots are byte-identical between primary and
  isolated worktrees despite Git for Windows reporting path-related
  modification markers. Do not rewrite or clean these files.

Do not delete a residual because an unrelated later check passes. Record raw
status, owner, and separate disposition for each item.

## Product-Owner Closeout Disposition (2026-11-01)

The product owner ACCEPTED/CLOSED Sprint 114 and V0.18 as complete, WITH
RECORDED RESIDUALS. This disposition acknowledges the raw S114 FAIL,
BLOCKED/UNAVAILABLE, and NOT RUN rows above; it does not reclassify them.
The separate 2026-11-01 post-S114 root test follow-up passed 629 tests with
0 failures and 4,574 expectations, but does not rewrite S114's original
`INT114-ROOT-FOCUSED` result or its scope-excluded `INT114-ROOT-ALL` status.
V0.18 is accepted as complete. A GitHub release description is drafted under
`artifacts/outputs/`; no GitHub release was created or published.