# Sprint 114 Builder Evidence: V0.18 Integrated Acceptance and Closeout

## Status

S114 entry/disposition reconciliation and integrated verification were
separately authorized by the user on 2026-10-31. Verification ran against the
approved source baseline in an isolated detached worktree. No product source,
test, spec, example, renderer, editor, or runtime file was changed.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS for the approved
integrated V0.18 feature scope. The failing root/VS Code/Vite aggregates,
Hutch no-result, and unavailable native/cross-platform checks remain raw and
unresolved; this recommendation does not convert them to PASS.
**Separate product-owner disposition:** PENDING.

## Entry and Disposition Reconciliation

- S109 disposition and accepted contract verified: ACCEPTED/CLOSED WITH
  RECORDED RESIDUALS; cap 64 is control-originating only, authored `AMXD013`
  accounting is separate, and one-host/synthetic limits plus the HTML policy
  discrepancy remain.
- S110 disposition and accepted AST/checker contract verified: ACCEPTED/CLOSED;
  recursive AST, approved diagnostics, and authored-declaration accounting
  remain unchanged.
- S111 disposition, cap/overflow diagnostic, D111-02 residual verified:
  ACCEPTED/CLOSED WITH RECORDED RESIDUALS; `AMXD6004`, exact 64/65 behavior,
  and potentially unbounded work remain as accepted.
- S112 conflict resolution: resolved by explicit product-owner confirmation
  of ACCEPTED WITH RECORDED RESIDUALS; the historical S112 evidence remains
  unchanged.
- S112 canonical product-owner disposition/date and authorized record updates:
  ACCEPTED WITH RECORDED RESIDUALS, confirmed 2026-10-31; canonical ledgers
  updated under explicit user authorization. Raw outcomes were not changed.
- S113 product-owner disposition/date and lifecycle reconciliation:
  ACCEPTED WITH RECORDED RESIDUALS, confirmed 2026-10-31; canonical ledgers
  updated. Historical S113 evidence and raw outcomes were not changed.
- S114 execution authorization/date, baseline, worktree, and exact plan:
  User authorized execution on 2026-10-31 after review of the approved
  verification plan. Source baseline: `a4839348d112b11ca20858a9554cbb2b5b03b1b6`
  on `feat/create-v0.18`. Detached worktree:
  `C:\Users\gamez\Programming\openamx-s114-validation-a4839348`. Commands
  were limited to `verification-plan.md`; the broader root `bun test` was
  excluded. S114 outputs/logs were confined to its fresh `artifacts/logs/`,
  `artifacts/outputs/`, `artifacts/playwright/`, and `artifacts/hashes/` roots.

## Integrated Results

- `integrated-evidence-matrix.md` rows completed/count of total: 30/30 rows
  have an explicit raw status and owner. Entry rows are verified; root-all is
  NOT RUN by approved scope; desktop typecheck and native/platform are
  BLOCKED/UNAVAILABLE; root, VS Code, and Vite UI aggregates remain FAIL.
- Parser/checker/formatter diagnostics and source-location results: focused
  parser, diagram, and formatter cases passed, including nested-loop rejection,
  `AMXD6001`, `AMXD6004`, source anchors, and recursive formatting.
- Control order, cap 64/65, authored 512/513, and per-model counter results:
  focused tests passed for control-only accounting, exact cap/overflow,
  per-diagram reset, and independent authored `AMXD013` boundaries.
- Multiple frame-time membership/binding results: standalone Example 08 held
  three ordered points at `t=0`, `0.5`, and `1`, then returned to the same
  interior values on a repeated `0.5` seek. V2 production composition browser
  playback matched 1,520 in-process elements at 0/0.5/1.
- Version 2 round-trip, v1 compatibility, malformed-payload results: focused
  serialization tests passed for v2 bindings/order, v1 static compatibility,
  malformed-envelope failure, and supported instance/context round-trips.
- Standalone browser in-process parity, errors, offline/network results: S114
  Example 08 browser check passed with no console/page errors or external
  requests. Both approved Vite-harness production-composition runs passed
  standalone parity; the separate preview bridge test failed as recorded.
- PDF SVG and DOCX PNG lower-bound parity/results: generated Example 08 PDF
  (35,847 bytes, four pages) retained its title; DOCX (20,039 bytes) contains
  a 1200x750 diagram PNG and title, with all three lower-bound point pixels
  verified. Focused adapter/example assertions verified ordered SVG/PNG
  semantics.
- Shared editor/VS Code host/desktop CodeMirror results: shared and desktop
  nested V0.18 authoring tests passed. Actual VS Code 1.143.1 nested
  tokenization passed within a 21/7 host aggregate. Desktop Vite UI was 7/1/1;
  Hutch typecheck produced no `vue-tsc` result.
- Example 08 direct execution, playback, PDF/DOCX results: CLI render and PDF/
  DOCX exports exited 0; exact S114 HTML playback and static outputs passed
  the checks above. HTML output was 70,528 bytes.
- Build/generated runtime output and review: `bun run build` and
  `bunx tsc --noEmit` exited 0. The runtime generator ran through the root
  build; no normalized generated-runtime Git diff was present. SHA-256 values
  and output sizes are in `artifacts/hashes/s114-artifact-manifest.json`.
- Focused root/VS Code/desktop commands and counts: root 345/1 with 2,134
  assertions; VS Code 21/7; desktop UI 7/1/1; Hutch typecheck no-result with
  wrapper exit 255. Exact commands, cwd, versions, retries, and raw logs are
  indexed in `integrated-evidence-matrix.md` and `artifacts/logs/`.
- Broader root suite: NOT RUN; excluded by the approved plan.

## Resource and Residual Register

- S109 vs S112/S114 workload/size/performance comparison: current production
  composition measured 16 diagrams, 512 authored declarations, 64 generated
  emissions per diagram, and 1,520 frame elements. S114 browser HTML measured
  286,776 bytes and 1,852 DOM nodes; two runs reported p95 frame samples of
  4.1 and 4.9 ms. Five-run static medians were 371.69 ms PDF and 296.54 ms
  DOCX. S112 recorded 282,331 HTML bytes/1,852 nodes; S109 synthetic recorded
  247,256 bytes/1,864 nodes. These are one-host observations, not thresholds.
- 1 MiB spec / 100 MiB renderer / desktop worker discrepancy: unchanged; the
  desktop worker retains its 8,000,000-character guard. No new limit or policy
  was introduced.
- D111-02 iteration/resource limitation: potentially unbounded traversal
  remains accepted; no bounded CPU, iteration, or memory claim is made.
- S112 Vite bridge/native/cross-platform residual outcomes: prior S112 raw
  4/1/1 full-file result, intermittent bridge retry, skipped native WebView2,
  and unrun cross-platform checks remain unchanged.
- S113/S114 root Help-index test, VS Code Windows failures, Hutch typecheck,
  analyzer disagreement, native/platform status: root Help-index failed again
  at 345/1; VS Code was 21/7 with V0.18 tokenization passing; Hutch produced
  no result; desktop Vite was 7/1/1. S113 `get_errors` disagreement remains
  unresolved. Native is BLOCKED/UNAVAILABLE; cross-platform was NOT RUN.
- Any newly observed residual, owner, and raw status: root focused aggregate
  FAIL (root test owner); VS Code aggregate FAIL (VS Code owner); Hutch
  BLOCKED/UNAVAILABLE (desktop tooling owner); Vite bridge FAIL (desktop UI
  owner). Separate S114 owner dispositions remain pending.
- Checks not run/unavailable and reason: broader root suite excluded; native
  WebView2 skipped for lack of direct route; cross-platform unavailable on the
  current host; Hutch produced no typecheck result after stalled preparation.

## Preservation, Scope, and Disposition

- Exact commands, cwd, host/tool versions, raw logs and artifact paths:
  indexed in the matrix; Windows 10.0.26300 x64, 16 logical CPUs, PowerShell
  5.1.26100.9711, Bun 1.4.4, Node 24.13.1, Git 2.56.0.windows.4, VS Code
  host 1.143.1, Chromium 156.0.8078.4, Hutch 0.28.2, Cottontail 0.7.3.
- Failure/retry chronology and preservation audit: first VS Code host fetch
  failed with `ECONNRESET`; next/final actual host runs completed and both
  recorded 21/7. Default Playwright web-server launch failed under PowerShell;
  Bun-launched Vite retries both recorded 7/1/1. Two S112 files were written
  only in the isolated checkout by the Playwright tests; generated versions
  were retained under S114, then original S112 files were restored and
  SHA-256 matched to the primary worktree. Four long-path S106/S107 screenshot
  files were byte-identical across worktrees despite Git path warnings.
- Changed-path inventory and `git diff --check`: primary worktree changes are
  limited to `planning/state.md`, `planning/decisions.md`,
  `planning/STATUS.json`, `planning/ARCHITECT_BRIEFING.md`, this Builder
  evidence, the S114 matrix, and S114 `artifacts/`. No product/test/spec/
  example/runtime/editor files changed. Final `git diff --check` passed.
- Builder recommendation and rationale: ACCEPT WITH RECORDED RESIDUALS for
  the integrated feature behavior demonstrated by the approved focused tests,
  standalone browser and static exports. Raw root/VS Code/Vite failures,
  Hutch no-result, and native/cross-platform gaps remain explicit and are not
  converted to PASS.
- Separate product-owner disposition/date: PENDING.
- V0.18 integrated closeout status: Builder submission complete; awaiting the
  separate product-owner closeout disposition. No release authority follows.
- Release/publication/package-version/installer/certification: NOT AUTHORIZED.

## Post-S114 Root Test Follow-up (2026-11-01)

- The user requested diagnosis and correction of root `bun test` failures
  separately from the original S114 verification scope. The historical S114
  matrix statuses are unchanged; in particular, `INT114-ROOT-ALL` remains
  `NOT RUN` for S114.
- The first reproduced failure was the V0.14 desktop Help-index test missing
  the required integrated-acceptance/release/publication boundary. The Help
  sentence is present in HEAD `e29422f`.
- The second reproduced failure came from the numbered-guide integration
  test launching stale `dist` modules. `bun run build` refreshed the primary
  generated runtime and transitive CLI modules; the numbered-guide test then
  passed 2/2. The generated runtime's normalized Git diff is empty.
- Full-suite load exposed two bounded-wait issues: three mapped-data job polls
  used only 100 attempts at 5 ms, and an image-security test exceeded Bun's
  default 5-second timeout while generating a 2000x2000 noisy PNG. Polling is
  now bounded at 1000 attempts, and that one image test has a 15-second
  timeout; its workload/assertions are unchanged.
- Focused post-fix checks passed: examples 19/19, numbered guide 2/2, mapped
  data editor 8/8, and report preparation 11/11. Final primary-root
  `bun test` passed 629 tests, 0 failures, and 4,574 expectations across 46
  files. Raw first/failing/retry/final logs are under `artifacts/logs/`.
- Root tests left two `.keep` output directories in the primary root; they
  were preserved and not cleaned. The previously observed S114 test output
  directories were likewise not removed.