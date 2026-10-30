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