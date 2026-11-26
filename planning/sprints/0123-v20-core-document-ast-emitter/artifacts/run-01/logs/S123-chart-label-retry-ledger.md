# S123 Chart-Label Retry Ledger

## Scope

This ledger documents the chart-label fixture correction slice that exceeded
the approved maximum of two retries. The exact full console output for these
three failed runs was not retained as files; the excerpts below are
transcriptions of the command results available in the session record and are
not represented as complete raw logs.

**CWD:** `C:\Users\gamez\Programming\openamx`

**Command for each attempt:**

```text
bun test tests/transpiler.test.ts tests/transpilerGolden.test.ts
```

| Run ID | Fixture attempt | Raw result excerpt | Raw status |
| --- | --- | --- | --- |
| S123-CHART-LABEL-01 | Initial attempt: record-backed line chart with `labels` | `AMX3003: Option 'labels' is not valid for line charts` | FAIL |
| S123-CHART-LABEL-02 | Retry 1: record-backed column chart with `labels` | `AMX3003: Option 'labels' is not valid for column charts` | FAIL |
| S123-CHART-LABEL-03 | Retry 2: scatter chart with `labels` | `AMX3003: Scatter charts do not accept category or labels` | FAIL |
| S123-CHART-LABEL-04 | Retry 3: scalar-list column chart with `labels` | Focused transpiler suites passed; 8 tests, 0 failures, 32 assertions at that run. | PASS; retry cap exceeded |

The approved policy allowed at most two retries after the first failed run.
`S123-CHART-LABEL-03` was the second retry; the Builder then made the
`S123-CHART-LABEL-04` third retry and continued execution. This is the raw
S123 process `FAIL` recorded as `S123-RETRY-STOP-01`. Product Owner disposition
is pending. This ledger does not upgrade the breach or imply S123 acceptance.