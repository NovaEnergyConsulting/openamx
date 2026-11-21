# Sprint 120 Builder Evidence: V0.19 Integrated Acceptance and Closeout

## Status

Sprint 120 was separately authorized and completed on 2026-11-21 after a
corrective diagnostic cycle. S115-S119 dependency reconciliation passed. The
initial PowerShell/Bun capture failure was diagnosed as a launch-capture issue;
the controlled run then exposed one stale test fixture that omitted `showTable
true` despite asserting chart-table preservation. The user separately
authorized the exact one-line test correction. The rerun focused, supplemental,
broad, build, typecheck, desktop, and artifact gates pass. The full VS Code host
aggregate remains 21 pass/8 fail on unrelated Windows cleanup/path/import cases
while the V0.19 format/diagnostic row passes.

**Builder recommendation:** `ACCEPT/CLOSED WITH RECORDED RESIDUALS` for V0.19
integrated scope.

**Separate product-owner disposition:** `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`
by the user on 2026-11-21. Sprint 120 is closed. This closes V0.19 integrated
acceptance scope only. No package/version, release, publication, deployment,
installer, distribution, certification, or native-platform authority follows.

## Authorization and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| S115-S119 dependency dispositions | VERIFIED | Accepted dates/counts and S119 raw residual reconciled |
| S119 VS Code residual | CARRY-FORWARD | 20 pass/9 fail full host; V0.19 rows pass |
| Sprint 120 execution authorization | AUTHORIZED | User approved exact baseline/worktree/commands/outputs/retries/evidence/cleanup on 2026-11-21 |
| Repository baseline | VERIFIED | `feat/create-V0.19`; `f05991a81571cabc96bd2d0b6f9634ac860ab4ec`; clean live and isolated status |
| Host/tool versions | RECORDED | Windows 10.0.26300 AMD64; Bun 1.4.4; Node 24.13.1; Git 2.56.1; TypeScript 5.9.3; VS Code 1.147.0; Vite 6.4.3; Playwright 1.64.1; Hutch 0.28.2 |
| Generated/prior artifacts | RECORDED | Key package/generator/runtime and all 9 prior artifact hashes in the execution summary/baseline record |
| S120 artifact manifest | RECORDED | 83 files, 3,776,297 bytes; paths/sizes/SHA-256 in `artifacts/hashes/s120-artifact-manifest.json` |

## Exact Command Ledger

| Run ID | Exact command/CWD | Raw result/counts/assertions | Log/artifact |
| --- | --- | --- | --- |
| S120-ROOT-FOCUSED-DIAG | Controlled diagnostic exact 10-file command | FAIL; 308 pass/1 fail at stale `Distance (kilometer)` assertion | `artifacts/logs/diagnostic/04-isolated-focused-start-process.*` |
| S120-ROOT-CORRECTIVE | `tests/reportPresentation.test.ts` after one-line explicit `showTable true` | PASS; 6 pass, 0 fail, 115 assertions | `artifacts/logs/diagnostic/06-report-presentation-after-fix.*` |
| S120-ROOT-FOCUSED | Exact master 10-file command after correction | PASS; 309 pass, 0 fail, 2,194 assertions | `artifacts/logs/s120-root-focused.after-correction.*` |
| S120-ROOT-SUPPLEMENTAL | Approved measurement/data/examples/guide selection | PASS; 52 pass, 0 fail, 1,113 assertions | `artifacts/logs/s120-root-supplemental.*` |
| S120-ROOT-ALL | Approved full `bun test` | PASS; 673 pass, 0 fail, 5,239 assertions, 47 files | `artifacts/logs/s120-root-all.*` |
| S120-BUILD | Isolated root `bun run build` | PASS; exit 0 | `artifacts/logs/s120-build.*`; runtime hash stable |
| S120-TYPE | Isolated root `bunx tsc --noEmit` | PASS; exit 0 | `artifacts/logs/s120-typecheck.*` |
| S120-VSCODE | Isolated `vscode-extension` `bun run test` | FAIL aggregate; 21 pass/8 fail; V0.19 format/diagnostic row PASS | `artifacts/logs/s120-vscode-host.*` |
| S120-DESKTOP-TYPE | Isolated `desktop-app` `bun run typecheck` | PASS; exit 0 | `artifacts/logs/s120-desktop-typecheck.*` |
| S120-DESKTOP-UI | Focused V0.19 Playwright `v16-language-editor` | First Windows harness launch FAIL; retry PASS 1/1 Vite evidence | `artifacts/logs/s120-desktop-ui.*`; `s120-desktop-ui.retry-01.*` |
| S120-EX05 | Example 05 run | PASS; exit 0; affine inspector PASS | `artifacts/outputs/example-05-run.json` |
| S120-EX07-HTML | Example 07 HTML render | PASS; 4-state omission/preservation inspector PASS | `artifacts/outputs/example-07.html` |
| S120-EX07-PDF | Example 07 PDF export | PASS; 5 pages; false absent/true and ordinary retained | `artifacts/outputs/example-07.pdf` |
| S120-EX07-DOCX | Example 07 DOCX export | PASS; 4 charts; 3 Word tables; correct alt/captions | `artifacts/outputs/example-07.docx` |
| S120-PATCH | `git diff --check` and changed-path audit | PASS; isolated worktree remains only after cleanup; live changed paths scoped | final scope record below |

Record all retries as separate run IDs. Preserve first failure/retry raw outputs
and never overwrite an earlier log/harness/output directory.

## Integrated Feature Evidence

| Feature | Matrix rows | Status | Exact evidence/result |
| --- | --- | --- | --- |
| Chart source/check/evaluate/model | INT120-CHT-AST/TYPE/EVAL/MODEL | PASS | Final focused 309/309; exact parser/evaluator/model paths |
| HTML/PDF/DOCX output | INT120-CHT-HTML/PDF/DOCX | PASS | Structural inspector proves omission/preservation and hashes |
| Chart migration/examples | INT120-CHT-MIGRATE, INT120-EX07 | PASS | Example 07 four states; named 38 and `[16,18,4]` |
| Affine declaration metadata/constants | INT120-AFF-DECL/COMP | PASS | Focused/supplemental dimensions/editor/measurement cases |
| Affine runtime/operations/aggregates | INT120-AFF-CONV/COMPARE/SUB/REJECT/AGG | PASS | $0C=32F=273.15K$; 10 C subtraction; 303.15 C sum; 15 C mean |
| Chart/data/external/SI | INT120-AFF-CHART/DATA/SI | PASS | Chart normalization, AMX4004/4005, 16/50 SI inventory |
| Shared/VS Code/desktop authoring | INT120-EDITOR-* | FAIL aggregate / PASS V0.19 | Host V0.19 pass; aggregate residual; desktop type and Vite pass |
| Formatter/spec/guide/build | INT120-FORMAT/DOC/GUIDE/BUILD | PASS | Focused/supplemental/host, stable generated runtime hash |

## Host, Artifact, and Resource Evidence

| Item | Status | Record |
| --- | --- | --- |
| Full VS Code host aggregate | FAIL/PARTIAL | 21 pass/8 fail; V0.19 row PASS; raw EBUSY/path-case/import-root signatures |
| Desktop typecheck/UI | PASS harness / native unavailable | Typecheck PASS; Vite UI retry PASS 1/1; not native/WebView evidence |
| Example 05 output | PASS | 12,332 bytes; SHA-256 `2a13e5396ca6f6f78be5f6ad89128bdc1a874231eeffe4ed4567c307002a750c` |
| Example 07 HTML/PDF/DOCX | PASS | HTML SHA-256 `54148b68f15d1e7a23ce75efdc1744163047ef407c5c90d886ae138a65d395fa`; PDF `c21e4e16d86cb63dcc6db859189d56a6c888ed4a5b8007df8b57c2763aa38f67`; DOCX `18764515df51b89a3363d25edfe57dac5c3ae11dc9bf034733c60a58fe037406`; exact structure in inspector JSON |
| Generated browser runtime | PASS | Before/after `582919dc1148dda3b803c2901bbb676501d3af38091719349c80fbbfb43c6116`; no Git diff |
| Timing/output observations | RECORDED | Focused 2.50 s; supplemental 24.24 s; broad 81.15 s; Vite 4.5 s; one-host evidence only |

## Raw Failure, Residual, and Disposition Ledger

| Item | Raw entering status | Final raw status | Owner/impact | Separate disposition |
| --- | --- | --- | --- | --- |
| S120 focused/corrective cycle | Startup-only capture FAIL; controlled 308/1 stale fixture FAIL | Final 309/309 PASS after authorized one-line correction | Test fixture correction; original failures preserved | Included in Builder recommendation with residual history |
| S119 VS Code full aggregate | FAIL/PARTIAL: 20 pass/9 fail; V0.19 rows pass | FAIL/PARTIAL: 21 pass/8 fail; V0.19 row pass | Extension harness owner; V0.19 evidence separate | Product owner at S120 closeout |
| Broad root regression | NOT RUN | PASS 673/673 | no residual | none |
| Native/platform | BLOCKED/UNAVAILABLE / not claimed | BLOCKED/UNAVAILABLE | Product owner/platform gate | no certification |
| Generated runtime diff | NOT RUN | PASS; no diff | build/runtime owner | no corrective scope |

Acceptance with residuals may not rewrite any raw row. Record first failures,
retries, skipped/unavailable checks, and artifacts independently.

## Scope and Preservation Audit

- Build/host work used detached isolated worktree `C:\Users\gamez\Programming\openamx-s120-v19-resume` at the approved commit with the authorized one-line test correction.
- The isolated runtime remained generator-stable and was removed after evidence capture.
- Prior S115-S119 artifacts and existing shared output roots were preserved; a zero-byte test-created root directory was inventoried and removed because it did not exist at baseline.
- Product source/test correction during S120: exactly one authorized test-only edit in `tests/reportPresentation.test.ts` adding `showTable true` to a fixture whose assertions require a table.
- No production, specification, example, generated, package, historical evidence, release, or platform file changed.
- Final `git diff --check` passes. S120 evidence/artifacts changed only as approved.
- Release/version/package/publication/deployment/installer/distribution/certification commands run: NONE.

## Final Recommendation and Disposition

- Builder recommendation: `ACCEPT/CLOSED WITH RECORDED RESIDUALS`.
- Dependency reconciliation: PASS for S115-S119; S119 raw host residual preserved.
- Final focused/supplemental/broad results: 309/309, 52/52, and 673/673 respectively.
- Build, typecheck, generated provenance, Examples 05/07, HTML/PDF/DOCX, and desktop Vite/typecheck evidence: PASS.
- Full extension aggregate remains raw FAIL at 21 pass/8 fail; V0.19 format/diagnostic evidence passes. Native desktop/cross-platform remains BLOCKED/UNAVAILABLE.
- Separate product-owner V0.19 disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the user on 2026-11-21.
- Sprint 120 and V0.19 integrated acceptance scope are closed; raw extension 21/8 and native/platform unavailable evidence remain unchanged.
- No release, publication, package/version, deployment, installer, distribution, native support, or certification authority follows.
