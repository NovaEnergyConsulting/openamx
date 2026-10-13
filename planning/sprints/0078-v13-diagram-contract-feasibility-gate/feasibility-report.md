# Sprint 078 Feasibility Report

Evidence window: 2026-10-11 to 2026-10-13  
Lead Developer clarifications recorded: 2026-10-12
Builder recommendation: **GO for Sprint 079 readiness, with recorded
implementation residuals**  
Lead Developer disposition: **GO for Sprint 079 readiness (2026-10-13)**  
Scope: authorized isolated contract and feasibility probes only. No production
language, report renderer, formatter, editor, or desktop code was changed.

## Decision summary

| Question | Evidence outcome | Readiness |
|---|---|---|
| Are the example equations/depictions within scope? | The Lead Developer confirmed the crank-slider's non-uniform angular progress is a consequence of its equations; authors own the model's variable relationships and time mapping. The constant-current circuit with moving direction arrow is approved. | **RESOLVED for the supplied examples.** No `sin`/`cos` addition or scope reduction is authorized. |
| Is the current-version grammar adequate? | The Lead Developer approved the grammar proposal for V0.13; future grammar expansion is deferred to a later version. | **RESOLVED for contract direction.** Production syntax is not implemented. |
| Is safe offline arbitrary-time evaluation technically possible without compiling authored expressions or executing report-authored JavaScript? | A static bundle of the existing AMX interpreter evaluated JSON-transported expression ASTs and a typed context containing an imported pure function, a measurement/unit, a record/enum value, and dimension/unit registry. Host/browser results matched at `t=0`, `0.25`, and `1`; no browser resource requests occurred. | **PROVED for the tested typed context** without generated author-code. Full AMX AST combinations and resource limits still need implementation tests. See “What the evaluator gap means” below. |
| Does one typed destination-neutral candidate model feed interactive HTML, sandboxed desktop preview, PDF and DOCX? | Yes within the isolated TypeScript model probe. The same two `DiagramModel` instances produce an HTML payload, a sandboxed `App.vue` harness preview, lower-bound PDF SVG, and lower-bound DOCX PNG images. | **PROBE PASS only.** These are isolated adapters, not production pipeline acceptance. Actual native Electrobun host/package was not run. |
| Which representation is approved? | SVG-in-DOM for candidate HTML/preview and inline SVG in PDF. DOCX embeds a PNG raster of the same starting SVG with native image alt text. | **DOCX PNG representation accepted by the Lead Developer.** Production integration and accessibility metadata tests remain for later sprints. |
| Are the proposed resource bounds acceptable? | 16 diagrams/report; 512 total elements; 1 MiB HTML; 16.7 ms p95 frame work; 8 MiB incremental preview heap; 2,000 whole-page DOM nodes. | **Accepted by the Lead Developer.** Single-host probe readings do not certify conformance on every target; acceptance tests remain pending implementation. |
| When will native desktop UAT occur? | The Lead Developer cannot run UAT until the feature exists and will perform it after implementation. | **Deferred to post-implementation UAT.** The Vite sandbox harness is not native-app acceptance. |
| Is V0.13 ready for Sprint 079? | AMXD001–AMXD011 and AMX3001/3002 reuse are recorded. Source locations and formatter expectations are frozen; the production frame-error channel, exhaustive AST/value tests, native desktop UAT and production acceptance tests remain implementation residuals. | **GO for Sprint 079 readiness.** Sprint 079 implementation still requires its own explicit authorization and approved file-by-file plan. |

The machine-readable traceability is in
[`requirement-test-matrix.md`](./requirement-test-matrix.md), source-location
and unallocated diagnostic details in
[`diagnostic-matrix.md`](./diagnostic-matrix.md), and candidate source fixtures
in [`grammar-examples.md`](./grammar-examples.md).

## Authority, scope and environment

- Scope authority: `planning/plan-openamxV13MasterSprintPlan.md`; Sprint 078
  acceptance criteria and the approved file-by-file plan.
- Initial worktree was clean. Final changes stay within the approved Sprint 078
  contract files, the approved `probe/` sources/artifact paths, and the three
  planning ledgers. No dependency manifest or lockfile changed.
- Windows 11 Home 10.0.26300 build 26300; Intel Core Ultra 9 285H, 16 logical
  processors, 63.6 GiB physical RAM; Bun 1.4.2; Node 26.3.0; Chromium
  153.0.8010.12; Microsoft Word 365 version 16.0; `pdfjs-dist` 6.3.289;
  root `pdfmake` 0.3.11; `docx` 9.8.1; Sharp 0.35.5.
- The probe was designed for representative feasibility evidence, not
  production qualification. It ran on one high-performance Windows host with
  one Chromium version. Reported time/heap numbers are not universal limits,
  cold-start guarantees, low-end device evidence, or measured release-package
  resource use.

## Candidate scene model and AMX expression evaluation

`probe/diagram-model.ts` defines an isolated typed candidate with:

- logical canvas width/height; one local Number time identifier and interval/
  duration; title and description;
- a source-ordered array of `line`, `rectangle`, `circle`, and `text` elements;
- a Number/String AMX expression AST per dynamic property, literal static
  style, and source file/line/column for each element/time declaration;
- document-scope values and user-function ASTs needed by the two fixtures.

`probe/run-probe.ts` uses the existing AMX `parseExpression`,
`evaluateDocumentEnvironment`, and `evaluateExpression` APIs for host
evaluation. The browser bundle is built from the **existing application-owned
interpreter code**. The document transmits expression/function ASTs as JSON
data; it does not compile authored expressions into executable JavaScript.
Evaluation creates a fresh environment at each selected `t`. The only script in
the candidate HTML is nonce-authorized static runtime code; diagram values are
in a separate JSON script element. The hostile text check kept a `<script>` and
`<img onerror>` string visible as an SVG text node, created no HTML image
element, executed no injected action, and made no outbound request.

The exact crank and battery source in `grammar-examples.md` was asserted byte-
for-byte equal (after newline normalization) to the source parsed/evaluated by
the probe. The three existing user functions in the crank-slider case and the
one function in the battery case were registered as existing AMX AST
functions. At crank `t=1.5`, both host and browser returned crank-pin center
`(70,66)` and label `t = 1.5 s`. At battery `t=2`, both returned indicator
`x1=108`; current remains `0.6 A`. All six initial/interior/upper-bound host
frames evaluated without error.

### What the evaluator gap means

The master plan says that geometry and labels may use surrounding AMX values
and functions while preserving the **existing AMX expression/function
semantics**. A numeric coordinate can therefore depend on a valid AMX
expression over more than a Number literal: for example, an expression can
refer to a record field or perform measurement arithmetic/conversion before it
produces the required Number. Labels must likewise preserve existing
String-expression behavior.

The initial probe passed only Number/String bindings and functions. A second
isolated probe loaded an entry document and an imported module from existing
source paths through in-memory overlays. It transported evaluated bindings
(including a measurement), an imported pure-function AST, a record
declaration/value, enum values, binding types, and dimension/unit/base-unit
registries as JSON data. The probe reconstructed the Maps in an environment
using the same bundled `evaluateExpression` code; it did not execute authored
source as JavaScript.

The imported function evaluated `(distance / 1 meter) * profile.factor`, with
distance `2 kilometer`, profile factor `3`, and an enum-valued record field.
The selected-time expression
`scale(distance, profile) * (1 + t) / 1000` produced `6`, `7.5`, and `12` at
`t=0`, `0.25`, and `1`, respectively, in both host and browser evaluators.
The serialized typed context was 6,155 bytes; the browser made no external
requests. This demonstrates feasible typed registry serialization/hydration
for the tested context; production snapshot serialization does not yet provide
this path.

The approved product-scope default remains **full existing AMX
expression/function semantics**; no Number/String-only restriction is
proposed or approved. More AST/value combinations (including lists/nullable
values and derived-unit operations), larger module dependency graphs, and
evaluation/resource budgets remain implementation test work. Continue to pass
only AST and typed data to the bundled interpreter.

### Bounds of the proof

- Directly demonstrated host/browser equivalence covers the Number-based
  engineering fixtures and an imported function using measurement
  arithmetic/unit conversion, a typed record and an enum-valued field.
- Other AST/value combinations, larger import graphs and evaluation budgets
  remain engineering acceptance work. The approved full expression contract
  is not narrowed.
- Preview UAT in the native desktop app is explicitly deferred by the Lead
  Developer until after feature implementation. Sprint 078 harness isolation
  evidence does not count as native app/package acceptance.

## Rendering path experiments

All four candidate destinations consumed the **same** pair of in-memory typed
`DiagramModel` fixtures:

1. A single-file standalone HTML document embeds the model JSON and static
   interpreter/control/runtime code, with CSP, no remote scripts/assets, and
   an SVG generated via DOM APIs.
2. The existing desktop `App.vue` live-preview iframe was exercised in the
   Sprint 042 Vite workflow harness. Playwright injected the candidate HTML
   into the iframe's `srcdoc`, keeping its actual sandbox attribute
   `allow-scripts` (no `allow-same-origin`). It rendered both diagrams, exposed
   controls, matched selected crank time `1.5`, and rendered a separate stress
   page with 32 diagrams. The sandbox made zero child resource requests.
3. PDFMake generated an A4, one-page PDF with the model lower-bound frame
   embedded as SVG; PDF.js rendered the current artifact to a visible PNG.
4. DOCX Packer generated a one-page DOCX with the model lower-bound SVG
   rasterized as two embedded PNG image runs. Each has Word image alt text set
   to the candidate accessible description. OOXML order/text/alt were
   inspected, then Microsoft Word 365 opened the artifact read-only in Print
   Layout and was visually inspected at fit-to-page.

### What was and was not inspected

- Standalone HTML screenshot:
  [`probe/artifacts/standalone-html.png`](./probe/artifacts/standalone-html.png).
  Both diagrams, titles, descriptions, separate controls, crank guides and
  slider, battery/resistor, animated-direction arrow, and labels were visible.
- Desktop component/harness captures:
  [`probe/artifacts/desktop-preview-crank-slider.png`](./probe/artifacts/desktop-preview-crank-slider.png)
  and
  [`probe/artifacts/desktop-preview-battery-resistor.png`](./probe/artifacts/desktop-preview-battery-resistor.png).
  The sandbox attribute remained `allow-scripts`; no external content elements,
  console errors, or network requests were observed.
- PDF:
  [`probe/artifacts/diagrams.pdf`](./probe/artifacts/diagrams.pdf), rendered
  page screenshot [`probe/artifacts/pdf-page.png`](./probe/artifacts/pdf-page.png).
  PDF.js reported one page at 833×1178 for 1.4 scale; text extraction included
  both titles, descriptions, `t = 0 s`, `9 V`, `15 ohm`, and `I = 0.6 A`.
- DOCX:
  [`probe/artifacts/diagrams.docx`](./probe/artifacts/diagrams.docx), captured
  Word screenshot [`probe/artifacts/docx-page.png`](./probe/artifacts/docx-page.png).
  Word reported one page and two inline images; visible order was crank-slider
  title/description/frame followed by battery-resistor title/description/frame.
  Word exposes the text/captions and image alt descriptions. No screen reader
  or formal accessibility audit was done.
- The Vite desktop workflow harness rendered the production `App.vue` preview
  component and its actual iframe element, but candidate `srcdoc` was injected
  by Playwright. This is not the running native Electrobun application, not a
  packaged build, and not native desktop-host verification.
- PDF generation used the existing installed PDFMake library directly with
  the candidate model adapter, not the production report-preparation or CLI
  export pipeline. DOCX likewise used a probe adapter rather than production
  report preparation. These files demonstrate visual feasibility only.

## Invalid geometry and explicit failures

The host probe rejects non-finite numbers; an existing `sqrt` of a negative
argument raises existing AMX2005 with argument source. Browser evaluation
tested the corresponding initial-frame failure, later-frame failure after a
valid initial frame, and initial `1 / 0` non-finite geometry. For each, it
cleared the diagram graphic and surfaced a visible `role=alert` carrying
`crank-slider.amx:58:8`; no blank/stale/placeholder success was counted.
Out-of-interval selected times are rejected before evaluating a frame.

These are the probe's human-facing status text and behavior, not allocated
production diagnostic messages. Existing `SourceLocation` is start-only; the
candidate range/end-boundary contract, diagnostic identity, exact message and
desktop live-preview communication path require explicit decisions. Invalid
initial PDF/DOCX report export, atomic destination preservation, and native
per-frame preview status delivery were not exercised.

## Measurements and approved bounds

Full machine-readable readings are in
[`probe/artifacts/measurements.json`](./probe/artifacts/measurements.json).
Representative results:

| Case | Output bytes | Initial candidate render | Input/setup duration | DOM evidence |
|---|---:|---:|---:|---:|
| Required two-model HTML report, 21 primitives | 62,770 HTML | 2.9 ms candidate render | `file://` open 94.136 ms | 2 diagrams, aspect 1.6, `step=any`, no remote resource entries |
| Imported typed evaluation context | 6,155 JSON bytes | existing bundled AMX evaluator: outputs 6 / 7.5 / 12 at `t=0` / `0.25` / `1` | 3 browser-evaluated frames | measurement + registry (1 dimension, 2 units, 1 base unit), record + enum field, imported function; 0 resource requests |
| PDF report | 18,187 PDF | PDFMake SVG serialization 44.249 ms | — | One A4 page; SVGs/text present, visually inspected |
| DOCX report | 14,976 DOCX | DOCX/PNG serialization 41.211 ms | — | One Word page; 2 PNGs; alt text present |
| 512 primitives in one diagram | 289,112 HTML | 4.2 ms candidate render | 31.544 ms Playwright `setContent` | 537 document nodes / 513 SVG descendants |
| 1,032 primitives in one diagram | 530,936 HTML | 7.2 ms candidate render | 41.255 ms Playwright `setContent` | 1,057 document nodes / 1,033 SVG descendants |
| 16 diagrams / 208 primitives | 166,804 HTML | 4.0 ms candidate render | 13.001 ms Playwright `setContent` | 459 document nodes / 240 SVG descendants |
| 32 diagrams / 416 primitives (over approved cap) | 292,964 HTML | 5.4 ms candidate render | 19.103 ms Playwright `setContent` | 907 document nodes / 480 SVG descendants; zero resource requests |
| Synchronous arbitrary-time update (60 samples, 504 primitives) | — | — | p50 1.1 ms; p95 1.6 ms; max 2.1 ms | Input-to-finished synchronous DOM/update measurement |
| Synchronous arbitrary-time update (60 samples, 1,032 primitives) | — | — | p50 2.1 ms; p95 2.7 ms; max 3.4 ms | Initial-render sample 13 ms |

The Lead Developer accepted these measurable bounds on 2026-10-12: at most
**16 diagrams and 512 semantic primitive elements total**, **1 MiB UTF-8
preview HTML**, **16.7 ms p95 frame work**, **8 MiB incremental preview heap**,
and **2,000 whole-page DOM nodes**, alongside the existing desktop
8,000,000-character fail-safe.

The approved 16-diagram/512-element combination was exercised in the
`App.vue` sandbox harness: 306,050-byte HTML, 4.9 ms initial render, 528 SVG
descendants (512 semantic elements plus 16 arrowheads), zero child resources,
983 additional whole-page DOM nodes, and 2,047,976 bytes (about 1.95 MiB)
`JSHeapUsedSize` increase after forced garbage collection. The measured page
had 1,361 total nodes, within the 2,000-node cap. Native Electrobun UAT was
explicitly deferred and is not inferred from this harness evidence.

A separate uncollected sequential `srcdoc` replacement observation retained
more heap than a fresh/forced-GC measurement; it is preserved in
`measurements.json` and not used as the active-preview per-document bound.
This is a lifecycle/GC observation for the eventual implementation tests, not
a reason to silently raise the accepted 8 MiB bound. `setContent` includes
browser navigation overhead and must not be confused with frame render time.
All measured limits still require implementation enforcement and the agreed
post-implementation desktop UAT; the host is high-performance Windows and
does not certify other platforms/minimum hardware.

The harness contains a fresh-page sweep after an earlier reused-page sweep
produced incomplete samples (no rerun render dataset was retained for those
attempts). The retained resource table uses the later, fresh-page results.
Timings vary between runs: the two-model startup measurement, for example, was
about 2.9–3.4 ms. `setContent` includes browser setup/navigation overhead and
must not be confused with the measured candidate render field.

## Failures, retries and deviations

1. **No production diagram syntax exists.** Production parser/typechecker
   reject/unrecognize the proposal by design. Probe fixtures feed only
   existing AMX declarations/expressions to current AMX parsers; isolated
   candidate diagram blocks are converted into the separately typed probe
   model. No claim that complete `diagram` fences run in the CLI is made.
2. **Candidate harness startup errors corrected:** first Bun script invocation
   with PowerShell quoting failed; retried with a here-string. First Bun static
   bundle options omitted required entrypoints; after API feedback, switched
   to the already-installed desktop `esbuild` package and produced a 28,926
   byte bundle. First PDFMake run lacked Roboto configuration; retried using
   the existing renderer's fonts and URL/local-file policies. No dependency
   file was edited.
3. **Initial live-preview injection race:** a first Playwright attempt injected
   `srcdoc` before the harness's debounced preview settled, so the next preview
   replaced it. The retry waited for workbench load, paused preview, then
   injected the disposable candidate; it passed. The final desktop recording
   identifies the Vite workflow harness and explicit HTML injection. Native
   Electrobun remains unverified.
4. **Browser invalid-frame source:** the first candidate reporter used the
   diagram-level time location when a non-finite interpreter error lacked a
   structured source property. The error source selection was corrected to
   preserve the AMX error's file/line/column; initial `sqrt`, `1/0`, and later
   `sqrt` failures were rerun and now report `58:8`.
5. **Initial stress sweep contamination:** a reused Playwright page yielded
   partial/empty later measurements and no errors. It was discarded; every
   retained shape case used a fresh browser page, waited for SVG output, and
   asserted element/node count. Synchronous frame latency used 60 input
   samples per size.
6. **PDF visual path:** navigating Chromium directly to `file://...pdf`
   triggered a download, so no PDF-viewer screenshot was obtained that way.
   Retried with local `pdfjs-dist` 6.3.289 loaded from the Vite file-system
   route; current PDF was rendered to `pdf-page.png`, text inspected, and the
   visual screenshot retained. No Poppler or browser PDF viewer integration
   was available/used.
7. **Word visual path:** initial COM screenshot attempts had invalid HWND/
   by-reference handling and yielded no evidence. Corrected by reading the
   Word process window handle, applying page-fit in Print Layout, and capturing
   the screen. Current DOCX was reopened read-only; Word 16.0 reported 1 page
   and 2 inline images. Screenshot and OOXML checks retained. No screen-reader
   review.
8. **Typed-context fixture corrections:** the first imported-function test
   referenced `Surface.Rough` directly from the function body and the existing
   call frame raised AMX1004 `Undefined identifier 'Surface'`. The retry passes
   the already evaluated enum value as the record's String field and compares
   that field with `"rough"`; host/browser parity then passes. A separate first
   retry omitted the imported `meter` unit and raised existing AMX3008
   `Unknown or invisible unit 'meter'`; adding `meter` to the entry import
   corrected that fixture. Neither existing AMX runtime behavior was changed.
9. **Unverified/pending implementation by agreement:** actual Electrobun
   native app/packaged bundle (Lead Developer will perform UAT after the
   feature exists); production report pipelines and packaged evaluator/runtime
   file placement; AMX AST/value combinations beyond the tested
   measurement/record/enum/imported-function case; formal keyboard/screen-reader
   review; low-memory/minimum-supported hardware; static-frame production
   export atomicity and diagnostic plumbing; production PDF/DOCX adapters;
   cross-platform checks.

## Decisions recorded and next steps

The Lead Developer's 2026-10-12 clarifications resolve example interpretation,
current-version grammar adequacy, DOCX PNG representation, and the six
resource bounds. Desktop-app UAT is explicitly deferred until after
implementation; production acceptance tests are pending implementation.

### Diagnostic allocation recorded

On 2026-10-13, the Lead Developer allocated eleven new identities, AMXD001–AMXD011,
and approved reuse of AMX3001 for D-NEG-16 and AMX3002 for D-NEG-03/07. The
exact per-fixture identities/messages are in `diagnostic-matrix.md`; AMX3006
syntax-code reuse was not selected. `D-NEG-*` labels remain fixture IDs.

AMXD009 is allocated for later-frame evaluation that carries a base AMX error:
`Frame evaluation leads to invalid results. The underlying error is: <base amx error>`.
AMXD010 is allocated specifically for D-NEG-22's non-finite upper-bound
result, with exact message `Infinity value calculated for time upper bound`.
AMXD011 is allocated for D-NEG-24's interior-time non-finite result, with exact
message `Expression produces an infinite result`. Both non-finite cases without
a thrown AMX error now have distinct identities.

### Meaning of the evaluator gap

“Expression-evaluation gap” means missing feasibility evidence—not a proposal
to change the approved V0.13 language scope. The existing AMX environment
contains typed definitions and JavaScript Maps for record types, enum values,
functions, binding types, dimensions and units. A browser JSON payload cannot
carry Maps as-is; `JSON.stringify` drops their entries. While a measurement
value has a plain structured representation, operations and unit conversion
also require its typed dimension/unit registry. Imported types, enums and pure
functions likewise need their checked declaration graph. A typed-context
follow-up now demonstrates a serializer/hydrator for the tested subset of
those values and registries.

The implementation feasibility test is whether environment maps and typed
values can be encoded as inert data, reconstructed for the existing bundled
interpreter, and evaluated with unchanged AMX semantics at arbitrary time. The
master-plan default is to preserve the full contract; no Number/String-only
restriction is authorized or implied. The extended probe uses a measurement,
record, enum-valued field, imported function, and dimension/unit metadata. It
does not exhaustively cover all AST/value combinations or bounded execution
under repeated/high-rate scrubbing.

### Implementation residuals and closeout disposition

- The probe demonstrated safe offline evaluation for the tested Number/String
  forms and the typed measurement/record/enum/imported-function case. It does
  not exhaustively test lists, nullables, every AMX AST/value combination,
  larger import graphs, or bounded high-frequency frame work. Preserve full
  existing AMX semantics; these belong in implementation acceptance. The
  enum-inside-function AMX1004 behavior found during the probe remains an
  existing runtime edge and was not changed.
- Production parsing, checking, formatting, rendering, frame-error transport
  and actual desktop preview integration remain unimplemented. Later-frame
  failures must stop and clear rather than retain stale output; the probe's
  `role=alert` is feasibility evidence, not the production channel.
- Native desktop UAT is deferred until after implementation as directed; no
  native app test is counted as passed. Production acceptance tests and UAT
  remain pending implementation.
- Sprint 079 implementation requires its own explicit execution authorization
  and approved file-by-file plan. No production implementation, release,
  publication, versioning or platform-certification claim follows from this
  readiness disposition.

**Lead Developer disposition (2026-10-13): GO for Sprint 079 readiness and
close Sprint 078 with the implementation residuals above.** The user directed
the Builder to finalize and close this sprint so work can move to the next.
**Builder recommendation: GO for Sprint 079 readiness with recorded
residuals.** The additional evaluator evidence does not claim exhaustive AMX
parity or authorize production implementation.
