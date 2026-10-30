# Sprint 109 Resource Qualification Plan

## Purpose

Select and justify the separate generated-element cap per evaluated diagram.
The result must cover model expansion, frame evaluation, scene-model
serialization/deserialization, interactive output, and static export. It
must not repurpose the existing authored-element limit or change the broad
interactive HTML size policy.

## Qualification Questions

1. Can each generated primitive retain its own iterator binding across
   multiple frame evaluations, including after scene-model round-trip?
2. What are the construction, per-frame, serialization, and output-size
   costs as emitted element count grows?
3. Which workload is the limiting case for a useful cap: numerous small
   primitives, text-heavy output, expensive property expressions, frame
   playback, or static export?
4. Does the V0.13 1 MiB HTML statement or the current 100 MiB enforcement
   constrain a cap recommendation? No policy change is in scope.
5. Which counting rule is appropriate: all emitted primitives or only
   instances produced by control blocks?

## Prototype Protocol

Use a temporary, separately authorized prototype. Do not change production
source, tests, generated browser runtime, or committed product behavior under
this planning package. Record the exact prototype files and removal/retention
disposition in Builder evidence; do not delete pre-existing user data.

Minimum proof:

- Emit at least three primitives from a loop with distinct iterator values.
- Include one primitive whose property expression depends on `t` and one
  whose property depends on the iterator value.
- Create the model once; evaluate at least the lower bound, an interior time,
  and the upper bound. Assert membership/order are unchanged and
  iterator-dependent values remain distinct while `t`-dependent values
  change.
- Serialize and deserialize the model; repeat the same frame checks and
  compare values, source order, and relevant source locations.
- Include a conditional selection and a loop nested in a conditional, but no
  nested `for`.
- Keep the frame-element consumer ordered and report any proposed API change
  separately as a NO-GO or decision request.

## Benchmark Matrix

Run static baseline and generated cases at an increasing geometric series of
emitted counts, starting at 512 and doubling until the selected workload
fails a stated safety criterion or reaches a documented resource ceiling.
Include additional points near the proposed cap and exactly at cap and cap+1.
Do not treat these probe counts as a proposed product limit.

| Workload | Stress dimension | Required measurements |
| --- | --- | --- |
| B0 Static baseline | Existing diagrams with 1, representative count, and maximum authored count | Model creation, initial frame, repeated frame evaluation, serialization size/time, HTML output size, static frame rendering |
| B1 Minimal primitives | High count of low-cost circles/lines, simple property expressions | Expansion/model time, frame median/p95, memory if reliable, serialized bytes, playback frame time |
| B2 Dynamic properties | High count with arithmetic and function-based properties dependent on `t` and iterator values | Per-frame median/p95 at lower/interior/upper times; verify stable membership and correct per-instance bindings |
| B3 Text-heavy | Text primitive values and representative long values | Model and serialized size, compressed payload, complete HTML bytes, static HTML/PDF/DOCX output behavior |
| B4 Mixed controls | Direct primitives, loops, selected/empty branches, and permitted mixed nesting | Output count/order, model creation cost, source mapping, boundary accounting |
| B5 Serialization | Each candidate workload before and after serialize/deserialize | Round-trip time/bytes, frame parity, ordering and binding parity |
| B6 Static output | Static HTML, PDF, and DOCX at the lower time bound | Completion, output size, render duration, parity with the same model/frame |
| B7 Report composition | Multiple diagrams, up to the existing report limit where practical | Aggregate evaluation/output behavior. Report amplification; do not introduce a report-wide generated cap without a separate product decision. |

For each workload, record the evaluated count under both D109-01 accounting
options. Include empty iterables/branches and a static-only diagram so the
proposed rule's accounting can be compared without changing the existing
512-authored-element report accounting.

## Measurement Method

- Record OS/build, CPU, memory, runtime/tool versions, repository commit,
  exact commands, dataset/source hash, and whether outputs are cold or warm.
- Warm up each benchmark consistently, run at least five measured
  repetitions, and report individual samples plus median and p95 where the
  sample count supports it. Record outliers; do not discard them without a
  documented cause.
- Separate model creation, frame evaluation, serialization, deserialization,
  HTML generation, and static renderer duration. Do not report only an
  end-to-end aggregate.
- Record model JSON bytes, compressed embedded payload bytes where
  applicable, final HTML bytes, and generated output sizes. Identify whether
  any size is before or after compression.
- Record peak memory only if the collection method is repeatable and
  attributable to the tested process. Otherwise mark it NOT MEASURED.
- Run at least one multi-frame sample per candidate count. Report whether
  frame timing is per frame and how many total frames were requested.
- Preserve raw logs and machine-readable measurements under this sprint's
  approved `artifacts/` folder. Do not overwrite historical or shared test
  artifacts.

## Cap Selection Record

The Builder must propose an exact integer and provide:

- Chosen D109-01 counting rule and exact boundary semantics: cap is accepted;
  first emitted element beyond cap is rejected.
- Results at cap and cap+1 for expansion, frame evaluation, round-trip,
  interactive HTML, and static output as applicable.
- Limiting workload, observed maximum safe workload, and the explicit
  headroom/risk rationale between observed stress and selected cap.
- Interaction with 512 authored elements per report, 16 diagrams per report,
  and composed multi-diagram models. Do not present separate limits as a
  combined arithmetic threshold unless a product decision approves it.
- The HTML discrepancy analysis, including whether the 1 MiB documented
  constraint would alter the recommendation. D109-03 must be dispositioned.
- Environment limitations, unavailable hosts/exports, any failure/retry, and
  residual owners. A single passing host is not cross-platform certification.

The numeric value remains OPEN until explicit product-owner disposition. If
the measurements cannot support a safe/useful cap or per-instance context
round-trip, recommend BLOCKED/OPEN and identify the smallest next decision or
experiment.

## Builder Execution Evidence

The following is evidence and a Builder recommendation, not product-owner
acceptance. Execution used approved source commit
`b9e26b846a1e3cb9a1bd5dde71081ed0ede12ba5` on Windows 11 build 10.0.26300 x64,
PowerShell 5.1, Intel Core Ultra 9 285H (16 logical CPUs), 64 GiB RAM, Bun
1.4.4, Node 26.3.0, and Chromium 156.0.8078.4. This is one high-performance
host only.

Exact commands:

```powershell
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --prototype
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --benchmark
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --browser
```

The probe performs one warmup plus five measured repetitions for in-process
operations; each browser workload has a page initialization measurement, one
warmup scrub, five client scrub latency samples, and 20 in-page synchronous
frame-work samples. The benchmark stops repetitions after a sample exceeds
60 seconds and never exceeds 16,384 elements per single-diagram workload.
Peak memory is `NOT MEASURED`; RSS before/after is contextual only.

| Workload/evidence | Raw outcome and measurements | Interpretation |
| --- | --- | --- |
| B0 real example, 8 elements | Model creation median 4.73 ms; frame median 0.41-0.55 ms across tested times; serialized model 63,083 bytes / 3,732 gzip bytes; HTML 59,497 bytes; PDF 15,963 bytes / 22.13 ms median; DOCX 17,227 bytes / 31.12 ms median | Existing formula-driven diagram baseline completed through actual report paths. This is a benchmark, not a regression suite. |
| B1-B6, 64 generated-equivalent elements | Minimal, dynamic, text-heavy, mixed-control, serialization, and static-output classes all completed; full HTML ranged 61,766-64,318 bytes; per-frame medians were below 0.15 ms in-process | Synthetic flattened workloads; B4 traverses direct elements, loop/conditional nesting in both approved directions, and an empty unselected branch. It does not exercise production diagram syntax. |
| Candidate boundary, B4-GEN 512 direct + 64 control-originating | 576 total frame elements; model JSON 2,810,249 bytes / 58,517 gzip bytes; HTML 126,814 bytes; frame medians 0.49-0.57 ms | Exact candidate boundary completed. Under all-emitted accounting it is over 64; under control-only accounting it is exactly 64. |
| Cap+1, B4-GEN 512 direct + 65 control-originating | 577 total frame elements; model JSON 2,815,100 bytes / 58,571 gzip bytes; HTML 126,878 bytes; frame medians 0.38-0.60 ms | Workload completed; production rejection is `NOT RUN` because no generated-output cap exists in this revision. |
| B7 16-diagram authored/generated composition | 512 authored declarations across the report plus 64 generated outputs per diagram: 1,536 frame elements, 1,864 DOM nodes, 247,256 HTML bytes; 7,714,079 serialized JSON bytes / 131,896 gzip bytes; PDF 122,505 bytes / 72.58 ms median; DOCX 11,766 bytes / 239.46 ms median | Meets the documented 2,000 DOM-node target in this measured workload and preserves the 512 authored declarations as an independent count. |
| B7 cap+1 composition | 512 authored declarations plus 65 generated outputs per diagram: 1,552 frame elements, 1,880 DOM nodes, 248,244 HTML bytes | Completes and remains below 2,000 DOM nodes; this demonstrates cap+1 workload resource behavior, not rejection behavior. |
| B7 128-per-diagram comparison | 16 diagrams x 128 circles or text: 2,376 DOM nodes in each browser workload | Exceeds the V0.13 whole-page 2,000 DOM-node target. HTML remains below 1 MiB, showing that the observed constraint here is DOM size, not the broad HTML byte limit. |
| Browser membership and frame-work | Browser retry `browser-retry-09.json` preserves ordered membership through scrub at all sampled single-diagram counts and 16-diagram compositions. At the final 64-per-diagram authored/generated composition the browser retained 1,864 DOM nodes. | Browser evidence is for flattened scene models, not generated-control parsing or production per-instance bindings. In-page synchronous handler time and client automation latency are recorded separately. |

The candidate comparison recommends **64 control-block-originating emitted
primitives per evaluated diagram**. Control-only accounting is preferred
because a cap on all frame elements would change existing static diagrams
without control blocks. The benchmark specifically demonstrates that 512
authored declarations plus 64 generated elements per diagram is distinct from
512 authored declarations and keeps the tested 16-diagram page below the
documented DOM target. The numeric value is a conservative power-of-two
selection below the first tested 128-per-diagram composition that exceeded
the 2,000-node target. It is not a claim that 65 fails: the measured 65 cap+1
composition also completed below that target. The Builder recommends 64 for
headroom and a predictable boundary; D109-01 and D109-02 remain pending
product-owner disposition.

### HTML Discrepancy

The V0.13 specification states 1 MiB for interactive preview; the current
renderer enforces 100 MiB of full UTF-8 HTML. Desktop preview/HTML worker
paths additionally enforce 8,000,000 characters. These are distinct source
facts, not interchangeable limits. The selected candidate's largest measured
authored/generated composition was 248,244 bytes, below 1 MiB. Higher
single-diagram workloads crossed 1 MiB at 8,192 circles (1,076,786 bytes) and
2,095,426 bytes at 16,384; several large workloads also crossed the documented
frame-work and DOM targets. No broad HTML policy was changed. Builder
recommendation: the 1 MiB discrepancy does not constrain the candidate 64
cap, but remains an unresolved documentation/runtime discrepancy for other
workloads pending separate product disposition.

### Prototype and Residuals

`artifacts/raw/prototype-retry-02.json` records three distinct iterator values
across `t = 0`, `0.5`, and `1`, stable ordered membership, production scene
serializer/deserializer round-trip of per-instance descriptors, and ordered
SVG/interactive HTML projection. The prototype's custom evaluator consumes
the restored descriptors; production `evaluateDiagramFrame` does not. This
is a feasibility result for the prototype representation only.

The current source was not modified and contains no implementation of
diagram-local controls. Consequently parser/checker diagnostic tests,
production expansion, production overflow rejection at cap+1, editor checks,
and the full `GEN-CAP-OVER-01` behavior remain `NOT RUN`. No cross-platform,
low-memory-host, peak-memory, or certification claim is made. The numeric cap
and accounting rule are Builder recommendations, not accepted behavior.