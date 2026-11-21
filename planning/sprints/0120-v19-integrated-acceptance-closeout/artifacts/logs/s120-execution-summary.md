# Sprint 120 Execution Summary

Execution date: 2026-11-21.

## Final Continuation Status

The initial stop and all raw failures below are preserved unchanged. The user
subsequently authorized diagnostic investigation, one exact test correction,
and continuation. Diagnostics proved Bun and dependency junctions worked;
PowerShell stream handling caused the startup-only logs. The controlled run
exposed one stale test fixture, corrected by adding explicit `showTable true`
where its assertions require chart-table preservation.

Final raw results: focused 309 pass/0 fail/2,194 assertions; supplemental 52
pass/0 fail/1,113 assertions; broad 673 pass/0 fail/5,239 assertions; build and
typecheck PASS; VS Code host 21 pass/8 fail with the V0.19 row passing; desktop
typecheck PASS and focused Vite UI 1/1 on its authorized retry; Examples 05/07
and artifact inspection PASS; native/platform BLOCKED/UNAVAILABLE.

Final Builder recommendation: `ACCEPT/CLOSED WITH RECORDED RESIDUALS`.
The original raw stop record follows. **Final disposition recorded after the
continuation:** `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the user on
2026-11-21. Sprint 120 is closed for V0.19 integrated acceptance scope only.

## Authorization and Baseline

- User approved the exact baseline/worktree, command sequence, S120-only output roots, generated-runtime provenance rule, retry/stop policy, evidence edits, and isolated cleanup.
- Baseline branch: `feat/create-V0.19`.
- Baseline commit: `f05991a81571cabc96bd2d0b6f9634ac860ab4ec`.
- Baseline live-worktree status: clean (`## feat/create-V0.19`).
- Isolated worktree: `C:\Users\gamez\Programming\openamx-s120-v19-verify` at the exact baseline commit, with clean Git status after checkout and dependency junction validation.
- Dependency roots were junctioned to the existing root, desktop, and VS Code extension `node_modules`; no install command ran.
- The S120 `artifacts/` root did not exist before authorization and was created fresh.
- Existing `dist`, desktop `test-results`, extension `dist/out/.vscode-test`, and S115-S119 artifacts were not modified.
- Host: Windows 10.0.26300, AMD64, 16 logical processors; Windows PowerShell 5.1.26100.9818.
- Tools: Bun 1.4.4; Node v24.13.1; Git 2.56.1.windows.1; TypeScript 5.9.3; Vite 6.4.3; Playwright 1.64.1; Hutch 0.28.2; VS Code 1.147.0.

## Dependency Reconciliation

- Sprint 115: ACCEPTED/CLOSED on 2026-11-21; D115-01 through D115-09 accepted; 68 distinct qualification cases, no missing IDs or duplicates.
- Sprint 116: ACCEPTED/CLOSED on 2026-11-21; 208 pass, 0 fail; no residual.
- Sprint 117: ACCEPTED/CLOSED on 2026-11-21; 159 pass, 0 fail; 1,233 assertions; no residual.
- Sprint 118: ACCEPTED/CLOSED on 2026-11-21; 169 pass, 0 fail; 1,297 assertions; no residual.
- Sprint 119: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-21; focused 133 pass, 0 fail; full VS Code host 20 pass/9 fail on unrelated Windows cleanup/path-case tests while V0.19 host cases pass.
- No PENDING/BLOCKED dependency contradiction was found.

## Focused Gate Stop

CWD: `C:\Users\gamez\Programming\openamx-s120-v19-verify`.

Exact command:

```text
bun test tests/chartModel.test.ts tests/dimensions.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/renderer.test.ts tests/reportPresentation.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts
```

- First run: raw status `FAIL`; Bun 1.4.4 printed only its startup banner and exited 1 before any test result or assertion output.
- The first capture used a PowerShell `2>&1 | Tee-Object` wrapper and ended as a native-command error.
- Authorized retry 01: identical command with plain file redirection; raw status `FAIL`; the same startup-only, exit-1 result occurred.
- No product assertion was reached, so the failure is classified as a blocked Bun test-launch/harness condition, not a demonstrated product failure.
- Per the approved retry policy, no further test command was attempted.
- Both preserved logs are UTF-16, 60 bytes, and SHA-256 `490beefad0e64aa8540d8f118e8480b80d97b8f9ac8d98888dd47b03ba6e1390`.

## Downstream Status

All supplemental, broad, build, typecheck, VS Code, desktop, Example 05/07, artifact inspection, generated-runtime provenance, and final patch gates are `NOT RUN` because the exact focused-gate stop condition applied.

## Raw Scope Audit

- No release, package/version, publication, installer, deployment, distribution, Marketplace, registry, certification, or platform command ran.
- No production, test, specification, example, generated, package, desktop, or extension file changed in either worktree.
- The only live-worktree writes are approved S120 planning evidence/artifacts.
- The isolated worktree remained at the exact baseline with clean Git status and was removed after evidence capture.
- Final `git diff --name-only` contains only the four approved S120 evidence documents; `git diff --check` exits 0.
- Key package/generator/runtime hashes are unchanged. Prior S115-S119 artifacts remain 9 files / 1,246,418 bytes. Shared `dist`, desktop test-results, and extension output counts/bytes match the baseline.

## Builder Recommendation

The original gate state above was `BLOCKED/OPEN`. It was subsequently resolved
through separately authorized diagnostics and the exact test-fixture correction.
Final Builder recommendation: `ACCEPT/CLOSED WITH RECORDED RESIDUALS` for V0.19
integrated scope. The raw extension aggregate 21 pass/8 fail and native/platform
unavailability remain explicit residuals. Separate product-owner disposition:
`ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the user on 2026-11-21. Sprint 120
is closed for V0.19 integrated acceptance scope only; no release or platform
authority follows.
