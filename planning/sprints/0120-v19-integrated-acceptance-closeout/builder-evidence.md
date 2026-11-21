# Sprint 120 Builder Evidence: V0.19 Integrated Acceptance and Closeout

## Status

Sprint 120 was separately authorized and began on 2026-11-21 at clean branch
`feat/create-V0.19`, commit
`f05991a81571cabc96bd2d0b6f9634ac860ab4ec`, in an isolated detached worktree.
S115-S119 dependency reconciliation passed. The exact focused 10-file command
failed at Bun test launch before any test/assertion output, and its one
authorized retry failed identically. The approved stop rule was applied; all
downstream gates are `NOT RUN`.

**Builder recommendation:** `BLOCKED/OPEN` pending narrowly scoped launch
diagnostics and a fresh separately approved acceptance cycle.

**Separate product-owner disposition:** PENDING. No V0.19 closeout, package,
release, publication, deployment, or certification authority follows.

## Authorization and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| S115-S119 dependency dispositions | VERIFIED | Accepted dates/counts and S119 raw residual reconciled |
| S119 VS Code residual | CARRY-FORWARD | 20 pass/9 fail full host; V0.19 rows pass |
| Sprint 120 execution authorization | AUTHORIZED | User approved exact baseline/worktree/commands/outputs/retries/evidence/cleanup on 2026-11-21 |
| Repository baseline | VERIFIED | `feat/create-V0.19`; `f05991a81571cabc96bd2d0b6f9634ac860ab4ec`; clean live and isolated status |
| Host/tool versions | RECORDED | Windows 10.0.26300 AMD64; Bun 1.4.4; Node 24.13.1; Git 2.56.1; TypeScript 5.9.3; VS Code 1.147.0; Vite 6.4.3; Playwright 1.64.1; Hutch 0.28.2 |
| Generated/prior artifacts | RECORDED | Key package/generator/runtime and all 9 prior artifact hashes in the execution summary/baseline record |

## Exact Command Ledger

| Run ID | Exact command/CWD | Raw result/counts/assertions | Log/artifact |
| --- | --- | --- | --- |
| S120-ROOT-FOCUSED | Isolated CWD; exact master 10-file `bun test ...` | FAIL; exit 1 after Bun banner; 0 tests/assertions | `artifacts/logs/s120-root-focused.log`; SHA-256 `490beefad0e64aa8540d8f118e8480b80d97b8f9ac8d98888dd47b03ba6e1390` |
| S120-ROOT-FOCUSED-R1 | Identical command; plain file redirection | FAIL; same exit 1/startup-only result; 0 tests/assertions | `artifacts/logs/s120-root-focused.retry-01.log`; identical SHA-256 |
| S120-ROOT-SUPPLEMENTAL | Approved measurement/data/examples/guide selection | NOT RUN; focused stop applied | `artifacts/logs/s120-execution-summary.md` |
| S120-ROOT-ALL | Approved full `bun test` | NOT RUN; focused stop applied | `artifacts/logs/s120-execution-summary.md` |
| S120-BUILD | Repository root `bun run build` | NOT RUN | NOT RECORDED |
| S120-TYPE | Repository root `bunx tsc --noEmit` | NOT RUN | NOT RECORDED |
| S120-VSCODE | `vscode-extension` `bun run test` | NOT RUN | NOT RECORDED |
| S120-DESKTOP-TYPE | `desktop-app` `bun run typecheck` | NOT RUN | NOT RECORDED |
| S120-DESKTOP-UI | Approved V0.19 Playwright `v16-language-editor` command | NOT RUN | NOT RECORDED |
| S120-EX05 | Example 05 run | NOT RUN | NOT RECORDED |
| S120-EX07-HTML | Example 07 HTML render | NOT RUN | NOT RECORDED |
| S120-EX07-PDF | Example 07 PDF export | NOT RUN | NOT RECORDED |
| S120-EX07-DOCX | Example 07 DOCX export | NOT RUN | NOT RECORDED |
| S120-PATCH | `git diff --check` and changed-path audit | NOT RUN | NOT RECORDED |

Record all retries as separate run IDs. Preserve first failure/retry raw outputs
and never overwrite an earlier log/harness/output directory.

## Integrated Feature Evidence

| Feature | Matrix rows | Status | Exact evidence/result |
| --- | --- | --- | --- |
| Chart source/check/evaluate/model | INT120-CHT-AST/TYPE/EVAL/MODEL | NOT RUN | Record focused suites and source ranges |
| HTML/PDF/DOCX output | INT120-CHT-HTML/PDF/DOCX | NOT RUN | Record structural/artifact inspection and hashes |
| Chart migration/examples | INT120-CHT-MIGRATE, INT120-EX07 | NOT RUN | Record four-state output and named exports |
| Affine declaration metadata/constants | INT120-AFF-DECL/COMP | NOT RUN | Record registry/import/editor values and diagnostics |
| Affine runtime/operations/aggregates | INT120-AFF-CONV/COMPARE/SUB/REJECT/AGG | NOT RUN | Record golden values, units, exact codes |
| Chart/data/external/SI | INT120-AFF-CHART/DATA/SI | NOT RUN | Record normalized units, shape, 50-unit inventory |
| Shared/VS Code/desktop authoring | INT120-EDITOR-* | NOT RUN | Record host/harness/native classifications |
| Formatter/spec/guide/build | INT120-FORMAT/DOC/GUIDE/BUILD | NOT RUN | Record links/idempotence/generated hash |

## Host, Artifact, and Resource Evidence

| Item | Status | Record |
| --- | --- | --- |
| Full VS Code host aggregate | NOT RUN | Pass/fail, V0.19 subset, EBUSY/drive/path signatures |
| Desktop typecheck/UI | NOT RUN | Pass/fail/skip, Vite versus native, unavailable checks |
| Example 05 output | NOT RUN | Values, display units, bytes/hash, no physical/offset serialization |
| Example 07 HTML/PDF/DOCX | NOT RUN | four-state table evidence, ordinary register, hashes/sizes/pages/tables |
| Generated browser runtime | NOT RUN | source script, before/after hash, diff, generator-only provenance |
| Timing/output observations | NOT RUN | exact host, durations/sizes/counts; no performance or platform inference |

## Raw Failure, Residual, and Disposition Ledger

| Item | Raw entering status | Final raw status | Owner/impact | Separate disposition |
| --- | --- | --- | --- | --- |
| S120 focused launch | NOT APPLICABLE | FAIL; identical first/retry exit 1 before tests | Test-host/Builder; all downstream gates blocked | Separate corrective diagnostic plan required |
| S119 VS Code full aggregate | FAIL/PARTIAL: 20 pass/9 fail; V0.19 rows pass | NOT RUN | Extension test harness owner; V0.19 evidence separate | Product owner at S120 closeout |
| Broad root regression | NOT RUN | NOT RUN | subsystem owner if failure | Separate product owner decision |
| Native/platform | BLOCKED/UNAVAILABLE / not claimed | NOT RUN | Product owner/platform gate | no certification |
| Generated runtime diff | NOT RUN | NOT RUN | build/runtime owner | corrective scope if unexplained |

Acceptance with residuals may not rewrite any raw row. Record first failures,
retries, skipped/unavailable checks, and artifacts independently.

## Scope and Preservation Audit

- Worktree used: `C:\Users\gamez\Programming\openamx-s120-v19-verify`, detached at `f05991a81571cabc96bd2d0b6f9634ac860ab4ec`; isolated status remained clean and the path was removed after evidence capture.
- Final `git diff --check` passed. Package/generator/runtime hashes, all 9 prior artifacts, and shared output counts/bytes match baseline.
- Prior S115-S119 artifacts and existing `dist`, `desktop-app/test-results`, extension `dist/out/.vscode-test`, and live source remained unchanged.
- Product source/test/spec/example/generated/package changes during S120: NONE.
- S120 planning evidence/artifact roots changed only as approved.
- Release/version/package/publication/deployment/installer/distribution/certification commands run: NONE.

## Final Recommendation and Disposition

- Builder recommendation: `BLOCKED/OPEN`.
- Dependency reconciliation: PASS for S115-S119; S119 raw host residual preserved.
- Focused root gate: first run FAIL and authorized retry FAIL at Bun launch, with 0 tests/assertions and identical 60-byte startup-only logs.
- Supplemental, broad, build, typecheck, generated-runtime, extension, desktop, Example 05/07, artifact-inspection, and final patch gates: `NOT RUN` under the approved stop rule.
- Required next step: separate narrowly scoped diagnostic plan for the isolated Bun test-launch failure, followed by a fresh acceptance cycle.
- Separate product-owner V0.19 disposition: PENDING.
- No release, publication, package/version, deployment, installer, distribution, or certification authority follows.
