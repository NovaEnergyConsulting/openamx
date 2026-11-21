# Sprint 115 Execution Log

## Scope

Execution date: 2026-11-21.

Authorized scope: read-only review of the exact chart, unit-registry,
measurement, normalization, renderer, external-data, SI-library,
specification/example, and focused-test paths listed in the approval, plus
edits and generated artifacts only inside
`planning/sprints/0115-v19-language-contract-affine-model-qualification/`.

This log does not authorize or claim production implementation, tests, build,
editor integration, generated runtime work, specification/example changes,
release work, publication, deployment, or platform certification.

## Baseline Commands

```powershell
git status --short --branch
```

Raw output:

```text
## feat/create-V0.19
```

```powershell
git rev-parse HEAD
```

Raw output:

```text
38627d8d783a2e99509eed79a75628451c271312
```

```powershell
git branch --show-current
```

Raw output:

```text
feat/create-V0.19
```

Baseline status: CLEAN and exact baseline matched. No write occurred before the
baseline recheck.

## Read-Only Review

The approved review used repository search and direct reads for:

- `src/ast/types.ts`
- `src/parser/parseStatements.ts`
- `src/typechecker/checkDocument.ts`
- `src/typechecker/dimensionTypes.ts`
- `src/runtime/environment.ts`
- `src/runtime/evaluateExpression.ts`
- `src/runtime/measurement.ts`
- `src/runtime/externalUnits.ts`
- `src/runtime/inputData.ts`
- `src/runtime/standardLibrary.ts`
- `src/renderer/chartModel.ts`
- `src/renderer/renderHtml.ts`
- `src/renderer/reportPdf.ts`
- `src/renderer/reportDocx.ts`
- `libraries/si.amx`
- `docs/language-spec-v0.18.md`
- `examples/05_Measurements_and_Units.amx`
- `examples/07_Tables_Charts_and_Named_Outputs.amx`
- focused references in `tests/parser.test.ts`, `tests/chartModel.test.ts`,
  `tests/dimensions.test.ts`, `tests/measurements.test.ts`,
  `tests/measurementData.test.ts`, `tests/renderer.test.ts`, and report tests

Source findings are recorded in `builder-evidence.md`. They are source facts,
not feature PASS results.

## Arithmetic Probe

```powershell
bun run planning/sprints/0115-v19-language-contract-affine-model-qualification/artifacts/probes/s115-affine-arithmetic-probe.ts
```

First run: exit 0. No failure or retry was required. The same command was run a
second time after an evidence-quality edit so the output artifact included raw
inverse-conversion and round-trip values; second run also exited 0.

Raw generated output: `artifacts/outputs/s115-affine-arithmetic.json`.

Key raw values:

```text
0 C = 32 F = 273.15 K -> physical 273.15 K
20 C - 10 C -> 10 celsius
32 F - 20 C -> -36 fahrenheit
sum([10 C, 20 C]) -> 303.15 celsius
mixed mean(10 C, 50 F, 300 K) -> 15.616666666666674 celsius
Fahrenheit scale = 0.5555555555555556
Fahrenheit offset = 255.3722222222222
PI = 3.141592653589793
E = 2.718281828459045
tolerance = 1e-10
```

Limitation: arithmetic evidence only. The probe does not parse AMX, typecheck,
evaluate OpenAMX runtime values, validate external data, normalize a production
chart, render any output, or test a diagnostic source range.

## ID Reconciliation

The package-local PowerShell procedure extracted table-row IDs from
`qualification-cases.md`, all referenced IDs from
`requirement-test-matrix.md`, and diagnostic IDs from `diagnostic-matrix.md`.

Exact command:

```powershell
$root = 'planning/sprints/0115-v19-language-contract-affine-model-qualification'; $q = Get-Content "$root/qualification-cases.md" -Raw; $d = Get-Content "$root/diagnostic-matrix.md" -Raw; $m = Get-Content "$root/requirement-test-matrix.md" -Raw; $idPattern = '(?:CHT|AFF)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+'; $qRows = [regex]::Matches($q, '(?m)^\| ((?:CHT|AFF)-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d+) \|') | ForEach-Object { $_.Groups[1].Value }; $qCounts = $qRows | Group-Object | Where-Object Count -gt 1; $dIds = [regex]::Matches($d, $idPattern) | ForEach-Object Value | Sort-Object -Unique; $mIds = [regex]::Matches($m, $idPattern) | ForEach-Object Value | Sort-Object -Unique; $qIds = $qRows | Sort-Object -Unique; $missingMatrix = $qIds | Where-Object { $_ -notin $mIds }; $missingDiagnostics = @($dIds | Where-Object { $_ -notin $qIds }); $result = [ordered]@{ qualificationRows = $qRows.Count; qualificationDistinct = $qIds.Count; qualificationChtRows = @($qRows | Where-Object { $_ -like 'CHT-*' }).Count; qualificationAffRows = @($qRows | Where-Object { $_ -like 'AFF-*' }).Count; duplicateQualificationIds = @($qCounts | ForEach-Object { $_.Name }); diagnosticDistinctIds = $dIds.Count; matrixDistinctIds = $mIds.Count; missingFromRequirementMatrix = @($missingMatrix); diagnosticIdsMissingFromCases = @($missingDiagnostics); rangeOnlyLanguage = @([regex]::Matches($m, '(?m)^\|[^\n]*through[^\n]*\|') | ForEach-Object { $_.Value }) }; $result | ConvertTo-Json -Depth 5
```

Raw summary:

```text
qualificationRows: 68
qualificationDistinct: 68
qualificationChtRows: 17
qualificationAffRows: 51
duplicateQualificationIds: []
diagnosticDistinctIds: 29
matrixDistinctIds: 68
missingFromRequirementMatrix: []
diagnosticIdsMissingFromCases: []
```

Result: RECONCILED. Generated artifact:
`artifacts/outputs/s115-id-reconciliation.json`.

## Reconciliation Artifact Validation

```powershell
bun -e "const data = await Bun.file('planning/sprints/0115-v19-language-contract-affine-model-qualification/artifacts/outputs/s115-id-reconciliation.json').json(); if (data.qualificationRows !== 68 || data.qualificationDistinct !== 68 || data.missingFromRequirementMatrix.length || data.duplicateQualificationIds.length) throw new Error('ID reconciliation invariant failed'); console.log(JSON.stringify({ rows: data.qualificationRows, chart: data.qualificationChtRows, affine: data.qualificationAffRows, status: data.status }))"
```

Exit: 0. Raw output:

```json
{"rows":68,"chart":17,"affine":51,"status":"RECONCILED"}
```

## Contract Refinement Validation

After the chart browser-payload/accessibility and diagnostic-phase edits, a
PowerShell check required 68 unique IDs, explicit false-state serialized-table
omission, explicit `tableId` omission, no stale `AMX3010` runtime wording, and
both `AMX3010`/`AMX1009` phase families.

Raw output:

```text
PASS: 68 IDs reconciled; chart payload/accessibility and diagnostic phases are explicit.
```

## Builder Evidence Validation

A PowerShell completeness check rejected the Architect template markers,
required D115-01 through D115-09, required the 68-case summary, and required a
Builder recommendation.

Raw output:

```text
PASS: Builder evidence is complete, has D115-01..09, and reconciles 68 cases.
```

## Enhanced Evidence Validation

After the probe gained raw inverse-conversion and round-trip fields, the first
validation command failed because it matched the phrase `second run` across a
Markdown line wrap. A whitespace-normalized retry failed because the log says
`second time`. The corrected normalized predicate passed on the third attempt:

```text
PASS: repeat-run note and four raw conversion/round-trip records are present.
```

These are validation-script defects, not probe/product failures. The JSON
already contained four conversion records on both failed assertions. A
subsequent exact-string check of the chronology also hit line wrapping and then
passed with whitespace normalization. All retry chronology records refer to
validation scripts; none is a probe failure or product failure.

## Environment

Command:

```powershell
bun --version; node --version; pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' 2>$null; git --version; [System.Environment]::OSVersion.VersionString; [System.Environment]::Is64BitOperatingSystem; [System.Environment]::ProcessorCount
```

Raw outputs:

```text
1.4.4
v24.13.1
pwsh : The term 'pwsh' is not recognized ...
git version 2.56.1.windows.1
Microsoft Windows NT 10.0.26300.0
True
16
```

Status: the `pwsh` subcheck was UNAVAILABLE. Retry through the active Windows
PowerShell:

```powershell
[string]$PSVersionTable.PSVersion
```

Raw output:

```text
5.1.26100.9818
```

No product check failed or retried. The only unavailable check was PowerShell
7 executable discovery, and no product command depended on it.

## Final Integrity Record

```powershell
git status --short
```

Raw output listed only the approved Sprint 115 files and its `artifacts/`
subtree. The modified planning files were `affine-model-and-operations.md`,
`blueprint.md`, `builder-evidence.md`, `diagnostic-matrix.md`,
`language-and-rendering-contract.md`, `qualification-cases.md`, and
`requirement-test-matrix.md`.

```powershell
git diff --check
```

Exit: 0, no output.

```powershell
git diff --stat
```

The tracked patch summarized to 7 files changed, 197 insertions, and 98
deletions. Untracked approved artifacts remain represented in the SHA-256
manifest.

VS Code file diagnostics for the Sprint 115 package reported no errors.

## Product-Owner Disposition

On 2026-11-21, after the Builder recommendation and integrity validation, the
user issued the explicit instruction `Accept and close Sprint 115`.

Disposition: ACCEPTED/CLOSED. D115-01 through D115-09 are accepted as the
Sprint 115 contract. The closeout satisfies the Sprint 115 chart, affine
declaration, and D115-08 external-compatibility planning gates. It does not
convert any NOT RUN, arithmetic-only, source-audit, or downstream production
check into PASS, and it does not authorize Sprint 116-118 execution,
implementation, release, publication, deployment, or certification.

`artifacts/hashes/s115-artifact-manifest.json` records SHA-256 hashes, byte
sizes, and final modification disposition for the planning and generated
evidence inputs. The manifest itself is validated by recomputing all listed
hashes; it intentionally does not hash itself.
