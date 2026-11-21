# Sprint 120 Verification and Output Plan

## Status

Sprint 120 was separately authorized and completed on 2026-11-21. The initial
PowerShell/Bun capture failure was diagnosed, a controlled focused run exposed
one stale report fixture, and the user authorized the exact test-only correction
that adds `showTable true`. Final focused 309/309, supplemental 52/52, broad
673/673, root build/typecheck, desktop typecheck/Vite UI, and Example 05/07
artifact gates pass. Full VS Code host remains raw 21 pass/8 fail while the
V0.19 format/diagnostic row passes. Native desktop/platform remains unavailable.

Builder recommendation: `ACCEPT/CLOSED WITH RECORDED RESIDUALS`. Separate
product-owner disposition: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` by the user
on 2026-11-21. Sprint 120 is closed for V0.19 integrated acceptance scope only.
Exact logs and hashes are under `artifacts/`. No release, package, publication,
deployment, installer, distribution, certification, or native-platform action
occurred.

## Baseline and Preservation

Before execution record:

- branch, commit, `git status --short --branch`, dirty/untracked inventory;
- OS/architecture, Bun, Node, Git, TypeScript, VS Code, Playwright/Chromium,
  Vite, Hutch/Cottontail, and desktop/extension tool versions actually available;
- hashes/status for `src/renderer/diagramBrowserRuntime.ts`, package manifests,
  S115-S119 artifact roots, `desktop-app/test-results/`, and existing extension
  `dist/`, `out/`, `.vscode-test/`;
- whether a fresh isolated worktree is used and how dependencies are installed.

Create/retain fresh S120 artifact roots only after authorization:

```text
planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/logs/
planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs/
planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/hashes/
planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/playwright/
planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/screenshots/
```

Preserve S115-S119 logs/results/hashes/artifacts and all existing generated/test
output trees. Do not clean a pre-existing directory. A root build or extension
command that writes tracked/generated/shared paths must be run in an isolated
approved worktree or have explicit preservation approval.

## Exact Focused Root Suite

CWD: repository root.

```powershell
bun test tests/chartModel.test.ts tests/dimensions.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/renderer.test.ts tests/reportPresentation.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts
```

This is the exact V0.19 master-plan focused command. Record pass/fail/assertion
counts and identify the V0.19 cases it exercises.

## Supplemental V0.19 Runtime/Data/Examples Suite

The master focused list does not directly name measurement-data or the examples
suite. Only if included in the approved S120 command plan, run:

```powershell
bun test tests/measurements.test.ts tests/measurementData.test.ts tests/examples.test.ts tests/numbered-guide.test.ts
```

This closes evidence for affine conversions/operations/aggregates/external shape
and Examples 05/07. Do not imply the master focused command alone covered it.

## Broader Regression Suite

CWD: repository root. Run only after focused evidence and only if explicitly
approved:

```powershell
bun test
```

Record the full raw result, all failures, retries, skips, and assertion count.
An unrelated failure remains FAIL in the aggregate; it is not silently excluded
from the command after discovery. Any targeted retry is a separate named run.

## Build, Typecheck, and Generated Runtime

CWD: repository root.

```powershell
bun run build
bunx tsc --noEmit
git diff --check
```

The root build invokes `scripts/build-diagram-runtime.ts`. Record the command's
full output, generated runtime hash, source script hash, and before/after Git
diff. A required generated result must be source-generated; no hand edit is
accepted. A line-ending warning is recorded separately from whitespace failure.

## VS Code Extension

CWD: `vscode-extension`.

```powershell
bun run test
```

The command compiles `dist/` and `out/`, runs the Extension Development Host, and
may use `.vscode-test/`. Use isolation/preservation as approved. Record VS Code
host version, pass/fail count, V0.19 TextMate/format/diagnostic case results,
all Windows `EBUSY` cleanup or drive-letter/path-case failures, downloads,
retries, and full logs.

Required comparison with S119 raw baseline: 20 pass/9 fail, while V0.19 grammar,
format, and diagnostic host cases pass. S120 must report the exact new aggregate;
it may not label the aggregate PASS merely because V0.19-specific rows pass.

## Desktop

CWD: `desktop-app`.

```powershell
bun run typecheck
bun run test:ui -- tests/ui/v16-language-editor.pw.ts --grep "V0.19 chart visibility" --output=../planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/playwright/s120-v19
```

If the configured UI runner requires a server/harness adjustment, use only the
exact approved harness command and record it separately. Record Vite/Playwright/
Chromium versions, screenshots/traces, pass/fail/skip counts, exact source ranges,
format idempotence, and diagnostics. Vite harness evidence is not native WebView
or cross-platform evidence.

Native desktop or package launch is `BLOCKED/UNAVAILABLE` unless separately
available and authorized. S120 makes no platform certification claim.

## Example 05: Affine Runtime and Display

CWD: repository root, after approved build:

```powershell
bun run dist/cli.js run examples/05_Measurements_and_Units.amx > planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs/example-05-run.json
```

Record exact command/output without relying on shell-redirection status alone.
Verify:

- `0 C = 32 F = 273.15 K` and round trips;
- `20 C - 10 C = 10 C`;
- rejected affine addition/scaling/power/root cases are inert in the lesson;
- `sum`/`mean` physical aggregation and display units;
- PI/E declaration examples and SI imports/aliases;
- no external shape/offset/scale/physical leak.

## Example 07: Four-State Chart Output

CWD: repository root, after approved build. Use the documented Example 06
input/output mappings and fresh S120 output paths:

```powershell
bun run dist/cli.js render examples/07_Tables_Charts_and_Named_Outputs.amx --out planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs/example-07.html --input asset=examples/data/asset.json --input screenings=examples/data/screenings.csv --input reviewedAt=examples/data/reviewed-at.json
bun run dist/cli.js export pdf examples/07_Tables_Charts_and_Named_Outputs.amx --out planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs/example-07.pdf --input asset=examples/data/asset.json --input screenings=examples/data/screenings.csv --input reviewedAt=examples/data/reviewed-at.json
bun run dist/cli.js export docx examples/07_Tables_Charts_and_Named_Outputs.amx --out planning/sprints/0120-v19-integrated-acceptance-closeout/artifacts/outputs/example-07.docx --input asset=examples/data/asset.json --input screenings=examples/data/screenings.csv --input reviewedAt=examples/data/reviewed-at.json
```

Also run a source/CLI path for named outputs as approved, without overwriting
example or repository-owned files.

Inspect exact artifacts:

- HTML: omitted/false no table markup, table JSON, ID/caption link, or hidden
  fallback; true/dynamic true preserve table contents and labels;
- PDF: false no chart table object/text; true/dynamic plus ordinary screening
  register remain;
- DOCX: false no associated Word table/alt reference; true/dynamic and ordinary
  register retain data; native chart/workbook parts are distinct from Word tables;
- named outputs retain `summary.totalScore = 38` and rows `[16, 18, 4]`;
- all four chart titles are present and output size/hash is recorded.

Use an S120-local inspector if separately approved and path-scoped; do not edit
product files to inspect output.

## Artifact and Resource Evidence

For each generated HTML/PDF/DOCX/log/screenshot:

- preserve exact path, bytes, SHA-256, command, CWD, time, tool/host version;
- record parser/object/XML/DOM/visible evidence, not only filename presence;
- compare relevant generated runtime/build hashes and line-ending warnings;
- record focused/broad timing, output size, and any relevant DOM/table count;
- do not infer performance bounds or platform capacity from one host.

## Stop and Retry Rules

- Product assertion/behavior failure: stop, preserve raw output, request
  corrective scope; no unrelated retry may be relabeled final PASS.
- Host/download/cleanup transient: one exact retry may be authorized; retain
  first and retry logs, reason, and raw aggregate.
- Native/platform unavailable: record BLOCKED/UNAVAILABLE, not PASS or zero-test
  PASS.
- Full VS Code aggregate nonzero on known residuals: do not stop V0.19 row review,
  but keep aggregate FAIL/PARTIAL and seek separate disposition at closeout.
- Any cleanup/overwrite outside approved roots: stop immediately and preserve
  inventory.
