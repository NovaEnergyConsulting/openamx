# Sprint 119 Builder Evidence: V0.19 Rendering, Editors, Specification, and Migration

## Status

**Architect preparation only.** Sprint 119 implementation has not been
separately authorized or performed. This template must be populated during
approved execution; planning values below are not product evidence.

**Builder recommendation:** NOT READY FOR IMPLEMENTATION UNTIL SEPARATELY
AUTHORIZED. S116 and S118 are accepted, but their dispositions do not execute
S119 or Sprint 120.

**Separate product-owner disposition:** PENDING.

## Entry and Baseline

| Evidence item | Status | Record required during execution |
| --- | --- | --- |
| Sprint 116 showTable propagation gate | VERIFIED ACCEPTED 2026-11-21 | 208/208; no residual |
| Sprint 118 affine runtime/SI gate | VERIFIED ACCEPTED 2026-11-21 | 169/169; 1,297 assertions; no residual |
| Sprint 119 execution authorization | NOT RUN | Approver/date, exact baseline, paths, UI/extension/docs/output commands, generated-artifact plan |
| Repository baseline | NOT RECORDED | Branch, commit, clean/dirty inventory, artifact preservation |
| Host/tool versions | NOT RECORDED | Windows/Bun/Node/Git/TypeScript/VS Code/desktop harness/browser/PDF/DOCX as used |
| Approved changed paths | NOT RECORDED | Renderer/editor/docs/example/test/generated/evidence scope and amendments |

## Candidate Focused Verification

| Check | Candidate command | Status |
| --- | --- | --- |
| Root focused renderer/editor/docs suite | exact approved Bun test selection including renderer/PDF/DOCX/chart/editor/formatter/examples/guide | NOT RUN |
| Root no-emit typecheck | `bunx tsc --noEmit` | NOT RUN |
| Root build/generated artifacts | `bun run build` if authorized | NOT RUN |
| VS Code extension host/grammar test | configured extension test command | NOT RUN; record exact command and host version |
| Desktop Vite editor UI test | configured desktop UI/typecheck command | NOT RUN; record harness/native distinction |
| Patch/scope/output audit | `git diff --check`, `git status`, artifact/XML/HTML inspection | NOT RUN |

Record exact commands and raw pass/fail/assertion counts, browser/extension/
desktop versions, output paths/hashes, retries, unavailable checks, and changed
paths. Do not use a root unit suite to replace actual extension-host, UI, PDF,
DOCX, or artifact inspection.

## Rendering Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| HTML false omission/true preservation | CHT-HTML-01, CHT-OUTPUT-OMISSION-01, CHT-OUTPUT-TRUE-01, S119-HTML-* | NOT RUN | Record DOM/markup/JSON/ARIA/tooltips |
| PDF false/true | CHT-PDF-01, S119-PDF-* | NOT RUN | Record definition objects and rendered text/artifact |
| DOCX false native/fallback/alt | CHT-DOCX-01, S119-DOCX-* | NOT RUN | Record package XML, chart parts, Word tables, alt/notices |
| Shared model staging | S119-MODEL-01/02, S119-TRUE-MODEL-01, S119-NO-CSS-01 | NOT RUN | Record no AST reeval and internal table preserved |
| Ordinary table regression | S119-PDF-VIEW-01, S119-DOCX-VIEW-01 | NOT RUN | Record ordinary table unaffected |

## Editor Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| VS Code TextMate/host | S119-TM-SHOWTABLE-01, S119-TM-AFFINE-01, S119-TM-BOUNDARY-01, S119-EXT-FORMAT-01, S119-EXT-DIAG-01 | NOT RUN | Record actual grammar/token scopes and VS Code host version |
| Shared highlighting/source ranges | S119-FACT-SHOWTABLE-01, S119-FACT-AFFINE-01, S119-FACT-RANGE-01 | NOT RUN | Record exact offsets and LF/CRLF/UTF-16 evidence |
| Desktop Vite UI | S119-DESKTOP-UI-01/02, S119-DESKTOP-DIAG-01, S119-DESKTOP-BOUNDARY-01 | NOT RUN | Record harness output/screens/tests; label native status separately |

## Specification, README, Migration, and Example Evidence

| Requirement | Cases | Status | Exact evidence |
| --- | --- | --- | --- |
| V0.19 spec/additive/history | S119-SPEC-LINK-01, S119-SPEC-CONTRACT-01, S119-SPEC-EXCLUSION-01 | NOT RUN | Record links/contract review and unchanged historical specs |
| README and migration | S119-README-01, CHT-DEFAULT-MIGRATION-01 | NOT RUN | Record exact additive links and omitted-false statement |
| Example 05 affine lesson | S119-EX05-RUN-01, S119-EX05-INERT-01, S119-EX05-FORMAT-01 | NOT RUN | Record CLI/evaluation/interpolation/format results |
| Example 07 four visibility states | S119-EX07-RUN-01, S119-EX07-HTML-01, S119-EX07-STATIC-01, S119-EX07-NAV-01 | NOT RUN | Record exports plus all output formats/cases |

## Diagnostic and Output Gate Evidence

At closeout, record exact results for:

- false HTML markup/payload/ARIA absence;
- true HTML table preservation;
- PDF chart-table object/text absence/presence;
- DOCX chart table/notice/alt-text absence/presence for native and fallback;
- existing AMX3001/3002/3005/3006/3007/3008/3010/1009/4004/4005 editor and
  example surfaces, as applicable;
- no CSS/screen-reader/alternate hidden table fallback;
- no public offset/scale/physical or `{ value, unit }` shape regression;
- no AST renderer re-evaluation and no broad editor scanner.

## Scope and Artifact Audit

Record during closeout:

- production/test/docs/example paths changed and approved amendments;
- historical specs unchanged;
- any generated runtime/browser artifact changed only through source generator;
- extension-host, Vite-harness, native desktop, cross-platform, and unavailable
  statuses kept distinct;
- no package/version, release, publication, deployment, installer, distribution,
  certification, or Sprint 120 closeout work;
- raw output hashes/paths for inspected HTML/PDF/DOCX/screenshots where applicable.

## Reconciliation and Limitations

At closeout, report all stable CHT output/migration IDs and S119 internal IDs;
missing, duplicate, or renamed IDs; exact commands/results/retries; unavailable
checks; named residuals and owners. A Vite pass is not native evidence, a unit
renderer test is not final artifact inspection, and a planning prose statement
is not an executed user-language result.

## Final Recommendation and Disposition

At authorized completion, replace with Builder recommendation (ACCEPT/CLOSED,
ACCEPT WITH RECORDED RESIDUALS, or BLOCKED/OPEN), exact evidence, residuals,
separate product-owner disposition/date, and an explicit statement that Sprint
120 and every release/platform action remain separately gated.
