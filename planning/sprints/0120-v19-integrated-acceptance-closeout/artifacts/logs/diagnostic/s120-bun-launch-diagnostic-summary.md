# Sprint 120 Bun Launch Diagnostic Summary

Date: 2026-11-21.

## Authorized Scope

Read-only diagnostic execution, one run per diagnostic variant, S120-local logs, no installs, no Bun/package change, and no product/test/spec/example/generated edit.

## Isolated Baseline

- Worktree: `C:\Users\gamez\Programming\openamx-s120-v19-diagnostic`.
- Detached commit: `f05991a81571cabc96bd2d0b6f9634ac860ab4ec`.
- Git status was clean after checkout.
- Existing live root, desktop, and extension `node_modules` were junctioned; no install ran.
- Commands were launched with PowerShell `Start-Process` and separate stdout/stderr files to avoid the prior native-command stream reinterpretation.

## Diagnostic Variants

1. `bun -e ...` in isolated worktree: PASS; exit 0; Bun 1.4.4 and expected CWD returned.
2. Isolated `bun test tests/chartModel.test.ts`: PASS; 14 pass, 0 fail, 81 assertions, exit 0.
3. Live `bun test tests/chartModel.test.ts`: PASS; 14 pass, 0 fail, 81 assertions, exit 0.
4. Exact isolated 10-file focused command through `Start-Process`: FAIL; 308 pass, 1 fail, 2,175 assertions, exit 1.
5. Isolated `bun test tests/reportPresentation.test.ts`: FAIL; 5 pass, 1 fail, 96 assertions, exit 1.

Raw stdout, stderr, and metadata are preserved beside this summary as `01-*` through `05-*`.

## Finding

The original startup-only failure was a PowerShell/Bun capture or invocation artifact. Bun executes normally in both isolated and live worktrees, including one real repository test file.

The exact controlled focused run reaches the tests and exposes one deterministic failure at `tests/reportPresentation.test.ts:295`:

```text
Expected to contain: "Distance (kilometer)"
```

The fixture declares a line chart without `showTable`. V0.19 correctly defaults omitted `showTable` to false, so chart-table output is absent. The test still expects the table's unit heading in HTML and then repeats that expectation for PDF and DOCX. The isolated single-file run reproduces the same failure, ruling out multi-file interference.

## Scope Classification

- Bun runner/installation: NOT THE BLOCKER.
- Dependency junction: NOT THE BLOCKER.
- Cross-file test interference: NOT THE BLOCKER.
- Stale V0.19 report fixture expectation: CONFIRMED DIAGNOSTIC BLOCKER.

No production behavior was edited or proven defective. The likely correction is a test-fixture update in a separately authorized corrective scope, most plausibly adding an explicit `showTable true` when this regression intentionally requires table preservation. The accepted V0.19 default must not be changed to make the stale test pass.

## Required Unblock Sequence

1. Open and approve a narrowly scoped corrective plan for the `tests/reportPresentation.test.ts` fixture expectation at line 295 and its PDF/DOCX downstream assertions.
2. Confirm whether the fixture is intended to test true table preservation; if so, add explicit `showTable true` to that chart fixture under corrective authorization.
3. Run the focused failing file, then the exact S120 10-file command.
4. Preserve first failure/repair/retest evidence.
5. Issue fresh Sprint 120 integrated acceptance authorization and restart from the exact focused gate.

The subsequently required corrective authorization and rerun were completed.
Final product-owner disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the
user on 2026-11-21. Sprint 120 is closed for V0.19 integrated acceptance scope
only; the original launch, fixture, extension aggregate, and native/platform
limitations remain preserved as raw evidence.
