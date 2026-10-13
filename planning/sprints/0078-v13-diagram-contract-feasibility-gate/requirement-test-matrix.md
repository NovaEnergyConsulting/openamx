# V0.13 Diagram Requirement-to-Evidence Matrix

**Builder recommendation: GO for Sprint 079 readiness with recorded
implementation residuals.** The Lead Developer approved
the V0.13 grammar, both example interpretations, DOCX PNG representation and
the proposed resource bounds on 2026-10-12. This matrix maps master-plan
requirements to fixtures, isolated evidence, later owner and residual.
`PROBE PASS` is experimental evidence, not production, language, platform or
acceptance evidence.

**Evidence paths** below are relative to this Sprint 078 directory. Probe
sources are `probe/diagram-model.ts` and `probe/run-probe.ts`; captured
measurements and actual artifacts are in `probe/artifacts/`. None is a
production renderer or implementation test. The approved language contract is
in `grammar-examples.md`; probe code and artifacts do not implement it.

## Stable fixture index

Every invalid fixture below has an explicit outcome and primary location in
`diagnostic-matrix.md`; this index makes the fixture-to-evidence map
unambiguous.

| Fixture | Requirement assertion / expected result |
|---|---|
| D-NEG-01 | Reject missing title; stop diagram output. |
| D-NEG-02 | Reject missing accessible description; stop diagram output. |
| D-NEG-03 | Reject non-String title. |
| D-NEG-04 | Reject missing canvas width. |
| D-NEG-05 | Reject missing canvas height. |
| D-NEG-06 | Reject missing local time declaration. |
| D-NEG-07 | Reject wrong canvas width type. |
| D-NEG-08 | Reject unsupported `path` primitive. |
| D-NEG-09 | Reject unknown `rotate` property. |
| D-NEG-10 | Reject non-positive canvas width. |
| D-NEG-11 | Reject unordered interval. |
| D-NEG-12 | Reject non-positive playback duration. |
| D-NEG-13 | Reject animated/static-style expression. |
| D-NEG-14 | Reject non-finite initial radius; no output frame. |
| D-NEG-15 | Stop and clear after invalid later `sqrt` frame. |
| D-NEG-16 | Reject diagram-local time used outside its scope. |
| D-NEG-17 | Reject non-finite canvas width. |
| D-NEG-18 | Reject non-finite interval start. |
| D-NEG-19 | Reject non-positive rectangle width. |
| D-NEG-20 | Reject line missing its required endpoint. |
| D-NEG-21 | Reject unsupported arrow literal. |
| D-NEG-22 | Stop and clear when later geometry becomes infinite. |
| D-NEG-23 | Reject selected time outside interval; never clamp silently. |
| D-NEG-24 | Stop and clear when geometry becomes non-finite at an interior selected time. |

## Contract, expressions, diagnostics, and formatter

| Requirement | Fixture / evidence | Status | Owning sprint / later proof |
|---|---|---|---|
| A diagram is declared inline in executable AMX with a required title and accessible text description. | `D-CRANK-01`, `D-BATTERY-01`; invalid title/description `D-NEG-01`–`02`; approved grammar. | CONTRACT APPROVED; parser/typechecker remain unimplemented. | Sprint 079 implements the approved declaration and tests it. |
| Diagram declaration has exactly one authored numeric local time variable. | Both valid fixtures have one `t`; `D-NEG-06`, `D-NEG-16`. | CONTRACT APPROVED; local time is diagram-scoped. Out-of-scope `t` should use existing AMX3001 unless explicitly allocated otherwise. | Sprint 079 scope/type tests; Sprint 082 editor symbol/range tests. |
| Finite ordered start/end bounds and positive finite duration are evaluated once in surrounding document scope. | Valid intervals; `D-NEG-11`, `D-NEG-12`, `D-NEG-18`. Probe models store evaluated finite bounds/duration. | CONTRACT APPROVED; production validation remains unimplemented. AMXD004 covers invalid bounds; AMXD005 covers invalid duration. | Sprint 079 checking/evaluation and later-format lower-bound tests. |
| Bounds and frame expressions may use existing surrounding values and pure AMX functions. | Crank/battery document values and functions; added isolated typed-context case with an imported function, record, enum-valued field, measurement, unit/dimension registry, and serialized binding/type metadata. Browser/host selected-frame results match at three times. | PROBE PASS for Number/String plus the added measurement/record/enum/imported-function case. Full expression inventory, other collections/nullability cases and implementation resource budgets are not exhaustively proven. | Sprint 079 tests for the remaining AMX AST/value cases and context capture without altering existing semantics. |
| Evaluate arbitrary selected time directly, without generated code from authored expressions, `eval`, `new Function`, or authored JavaScript. | Browser bundle statically contains application-owned existing `evaluateExpression`; AST and typed context metadata travel as escaped JSON. Existing interpreter returns host-identical values for direct Number formulas and the imported typed-context case at `t=0`, `0.25`, and `1`; no external requests. Static audit found no `eval`/`new Function` in the probe output. | PROBE PASS for those tested forms; a static registry serializer/hydrator is feasible. Full AST/type combinations and adversarial operation-budget behavior remain tests for implementation. | Sprint 079 complete semantic parity tests; Sprint 080 offline/browser isolation tests. |
| Geometry and labels can vary with time; evaluate selected, interior, and upper-bound time. | Both fixtures sampled at start/mid/end. Browser exact scrub: crank at `t=1.5`, battery arrow at `t=2`; crank label updates. | PROBE PASS for tested selected/interior/end values. | Sprint 079 runtime/model tests and Sprint 080 real scrub/control tests. |
| Do not introduce a stateful numerical solver, state mutation, a second timeline, or reader-controlled geometry. | Every host/browser evaluation builds fresh environment at the selected time; one `t` per model. | PROBE PASS for the model/evaluator under test; not a production guarantee. | Sprint 079 model immutability and semantic tests; Sprint 080 control audit. |
| The crank-slider example demonstrates circular motion using only existing AMX capabilities. | `D-CRANK-01` executes using `abs`, conditional `if`, `sqrt`, arithmetic and pure Number functions; six host frames rendered. No trigonometric function was introduced. | SCOPE ACCEPTED by Lead Developer: non-uniform angular progress comes from the author-defined equations; the diagram author owns variable relationships and correct time mapping/consistent spacing. | Sprint 079 tests the equations and time sampling; no new standard function is authorized. |
| Battery-resistor DC circuit with a time-varying current indicator. | `D-BATTERY-01` evaluates constant 0.6 A; arrow position moves with time and is animated in HTML. | SCOPE ACCEPTED by Lead Developer: current magnitude may remain constant while the direction arrow moves. | Sprint 079 tests; no time-varying electrical waveform is required. |
| Use a logical 2D schematic canvas, positive dimensions, responsive scale preserving aspect ratio, bottom-left origin and positive Y up. | Both models use 320×200. Standalone 1280 viewport ratio 1.6; 390 viewport produces 316×197.5 ratio 1.6. Screenshot and SVG use bottom-left conversion. `D-NEG-10`, `D-NEG-17`. | PROBE PASS for rendering candidate and dimensions. No production layout integration. | Sprint 079 value checks; Sprint 080 responsive/manual plus resize tests; Sprints 081/082 output checks. |
| Support line/arrow, rectangle, circle, text and static per-element stroke/fill/width. | 8 crank and 13 circuit elements; arrow, static palette and width; `D-NEG-08`, `09`, `13`, `19`, `20`, `21`. | GRAMMAR APPROVED for V0.13; production parser/type-check/model coverage and renderers remain unimplemented. Future grammar expansion is deferred to a later version. | Sprint 079 parser/type-check/model coverage and Sprint 080 SVG semantics. |
| Frame geometry is finite at the initial frame and at every requested playback point. Errors stop rendering/playback explicitly and are source located; do not omit, keep stale output or show a placeholder. | `D-NEG-14`, `15`, `22`–`24`; host/browser Number failures plus imported typed-context parity. Probe clears prior SVG and exposes `role=alert`. | BEHAVIOR CONTRACT APPROVED; AMXD008/AMXD009/AMXD010/AMXD011 allocated for D-NEG-14/15/22/24. Production desktop error delivery remains implementation work. | Sprint 079 implements diagnostics; Sprint 080 wires actual preview error reporting; Sprint 081 verifies export failure atomicity. |
| All required fields, types, unsupported elements/properties and style/time/bounds failures have stable exact source ranges. | `D-NEG-01`–`24` map to AMXD001–AMXD011 and approved AMX3001/AMX3002 reuse. 1-based original-document positions include front matter/fences and UTF-16 columns; exclusive ends map to existing zero-based half-open `EditorRange` offsets. | CONTRACT CONVENTION FROZEN; no new source-location semantics are introduced. Production diagnostics remain unimplemented. | Sprint 079 checker/parser fixtures; Sprint 082 editor marker/selection. |
| Preserve source element order, static style, source attribution, title/description, canvas and time in a typed destination-neutral model. | `DiagramModel` preserves element arrays and source file/line/column; HTML/PDF/DOCX built from same model. | PROBE PASS for model payload/render paths; candidate TypeScript interface does not establish an approved AST/model contract. | Sprint 079 freezes immutable typed emission; Sprints 080/081 assert parity. |
| Canonical formatter is idempotent and does not mutate expression meaning. | Approved contract states block/property order, two-space indentation, line endings and element order; all valid examples use that layout. | CONTRACT EXPECTATION APPROVED; existing formatter rejects `diagram`, and no production formatter test was run. | Sprint 079/082 add formatter and meaning-preservation/idempotence tests. |

## Interactive HTML and desktop preview

| Requirement | Fixture / evidence | Status | Owning sprint / later proof |
|---|---|---|---|
| Standalone HTML starts paused at lower bound; no autoplay. | Both controls initially at 0; both Play; `loop=false`. | PROBE PASS, standalone Chromium. | Sprint 080 production HTML/playwright coverage. |
| Interactive play/pause, reset, continuous scrubber and reader loop toggle. | Chromium clicked play/pause, reset; `input[type=range] step=any`; loop off stops at exact upper bound and loop on wraps. | PROBE PASS, standalone; keyboard/screen-reader review not performed. | Sprint 080 actual HTML and live-preview control/accessibility tests. |
| Loop off retains final frame; looping starts next pass at lower bound; diagrams operate independently. | Chromium non-loop stop `2`; loop wraps; changing crank `t=1.5` leaves battery `t=0`; desktop sandbox tested 32 independent battery diagrams. | PROBE PASS for exercised controls. | Sprint 080 production lifecycle, endpoint, and multiple-diagram tests. |
| Map interval to authored wall duration per pass. | Candidate playback uses `duration` when mapping `requestAnimationFrame` delta to interval; loop on/off exercised. | PARTIAL: timing logic ran in Chromium, but measured perceived duration/clock drift and throttled/background behavior were not tested. | Sprint 080 deterministic timing, visibility and endpoint tests. |
| Offline operation, no remote scripts/assets, safe report-data serialization, hostile-label inertness. | Self-contained standalone HTML; Chromium `resourceEntries=0`, no outbound requests, hostile `<script>/<img onerror>` remained SVG text; no DOM image created. Desktop frame also 0 child resource entries/network requests. | PROBE PASS for candidate labels/resources on Chromium; full hostile-input corpus, CSP/browser policy review remain. | Sprint 080 adversarial and offline test suite, standalone local-file test. |
| Do not weaken desktop sandbox/least privilege. | Live preview iframe in actual `App.vue` component through existing Sprint 042 Vite workflow harness; sandbox=`allow-scripts`, no `allow-same-origin`; no iframe/object/embed/img injected. | PROBE PASS for the component harness only. Native desktop UAT is explicitly deferred until after implementation; it is NOT RUN and not a Sprint 078 native/package pass. | Sprint 080 implementation; Lead Developer performs desktop UAT after the feature exists, with Sprint 083 integration acceptance. |
| Verify usable titles/descriptions and accessible keyboard/assistive-technology controls. | HTML figure/heading/description and aria-labelled buttons/range/loop are inspectable in DOM; screenshot confirms visible captions. | PARTIAL: semantic structure present; keyboard-only and screen-reader evaluation not performed. | Sprint 080 accessibility tests/manual review; Sprint 081 DOCX accessibility review. |

## PDF and DOCX outputs

| Requirement | Fixture / evidence | Status | Owning sprint / later proof |
|---|---|---|---|
| PDF renders static lower-bound frame from same model with visible proportionate diagram/title/description and correct flow. | Generated `diagrams.pdf` uses the same 2 models, start `t=0`, inline SVG; PDF.js 6.3.289 rendered page 1 at 833×1178. Text extraction includes both titles/descriptions and lower-bound values. | PROBE PASS for isolated candidate PDF renderer; not production `preparePdfReport`/CLI export. | Sprint 081 integration through production PDF report pipeline, inspect real artifact. |
| DOCX renders static lower-bound embedded image, not editable native shapes, with alt description and proper flow. | Generated `diagrams.docx` includes exactly 2 PNG media parts; image alt descriptions and heading/caption order checked in OOXML; Microsoft Word 365 COM read-only Print Layout shows both figures on one page. | PROBE PASS for isolated DOCX adapter; Lead Developer approved the PNG representation. No screen-reader test or production integration yet. | Sprint 081 production path and accessibility metadata tests; Lead Developer's post-implementation UAT remains separate. |
| Output failures must be explicit; no silent diagram omission or success-shaped fallback. | Probe frame failures throw; PDF/DOCX probe exits on construction/serialization/package assertion. | PARTIAL: valid fixture path only through output serialization; malformed-model atomic/visible PDF and DOCX failure paths not exercised. | Sprint 081 tests complete report/export transaction, retained prior destination and surfaced error. |
| Reading order and accessible descriptions in actual output formats. | PDF extracted text ordering and OOXML paragraphs plus image alt text checked; Word screenshot inspected. | PROBE PASS for candidate package and visible Word render; formal assistive technology review unavailable. | Sprint 081 production artifact and accessibility reviewer. |

## Resources, packaging and delivery boundary

| Requirement | Fixture / evidence | Status | Owning sprint / later proof |
|---|---|---|---|
| Measure render time, output size, preview resource use with representative probes. | `probe/artifacts/measurements.json`: Windows 11 Home 10.0.26300, Bun 1.4.2, Node 26.3.0, Chromium 153.0.8010.12; 24/72/264/512/1032 element and 2/8/16/32 diagram sweeps; HTML/PDF/DOCX sizes and timing; desktop CDP DOM/heap deltas. | PROBE PASS within a candidate 2D SVG renderer; one host, repeated runs, no low-end device, packaging or real production frames. | Sprints 080/081 performance baselines on supported packaged environments; Lead Developer approves provisional bounds. |
| Enforce report preview/output limits using empirical bounds, preserve existing desktop limits. | At the approved 16-diagram/512-element combined cap in the App.vue sandbox harness: 306,050-byte HTML, 4.9 ms initial render, 1,361 page nodes and +2,047,976 bytes JS heap after forced GC. Existing desktop MAX_HTML is 8,000,000 characters. | **BOUNDS APPROVED and PROBE PASS at the combined cap** by Lead Developer 2026-10-12: ≤16 diagrams and ≤512 total primitives/report, ≤1 MiB HTML, ≤16.7 ms p95 frame work, ≤8 MiB incremental preview heap, ≤2,000 whole-page DOM nodes. One-host evidence is not universal certification. | Sprint 080/083 implements/enforces and verifies bounds on the target host; keep native/platform-specific results explicit. |
| Prove offline rendering resources are application-owned and available when packaged. | Browser interpreter bundle is 28,926 bytes minified; standalone file HTML has no external resource requests. Rendering libs are SVG/DOM, bundled static AMX evaluator. | PROBE PASS for candidate HTML resource behavior; native packaged desktop check deferred until after implementation and NOT RUN. | Sprint 080 packaging; Lead Developer performs desktop UAT after implementation. |
| Keep two editor clients, language docs/examples, implementation, release outside Sprint 078. | Worktree changes confined to approved Sprint 078 contract, isolated probe and evidence paths; root production tree untouched. | PASS scope boundary. No production build/full suite claimed. | Sprint 079–082 with separate plan and authorization. |
| Separate Builder recommendation from Lead Developer readiness disposition. | Report and planning ledgers record the Builder recommendation separately. The Lead Developer accepted the grammar/examples, DOCX PNG, resource bounds and post-implementation desktop UAT plan, allocated AMXD011 for D-NEG-24, and directed closeout/moving to the next sprint. | **Builder recommendation: GO with recorded implementation residuals. Lead Developer disposition: GO for Sprint 079 readiness; this is not Sprint 079 execution authorization.** | Sprint 079 execution still requires its own explicit authorization and file-by-file plan. Native desktop UAT and production acceptance tests remain post-implementation. |

## Decisions recorded and implementation residuals

- **Scope/grammar approved (2026-10-12):** both example interpretations,
  V0.13 grammar, DOCX PNG representation and resource bounds. See
  `grammar-examples.md`; no standard function or language-semantic change was
  introduced.
- **Diagnostics allocated (2026-10-13):** AMXD001–AMXD011 and AMX3001/AMX3002
  reuse cover D-NEG-01–24 as listed in `diagnostic-matrix.md`. AMXD009 wraps
  failures carrying a base AMX error; AMXD010 is upper-bound `Infinity`;
  AMXD011 is interior-time `Infinity`.
- **Source locations frozen:** 1-based original-document line/UTF-16 columns,
  exclusive ends, mapped to zero-based half-open `EditorRange` offsets via
  `sourceOffset`/`sourceTokenRange` in `src/editor/sourceRanges.ts`. The
  approved formatter order and indentation are in `grammar-examples.md`.
- **Evaluator scope preserved:** the typed-context probe matched host/browser
  behavior for an imported function, measurement/unit registry, record and
  enum-valued field at three selected times. Lists/nullables, additional
  AST/value combinations, larger import graphs and high-frequency budgets
  remain implementation acceptance tests; no scope narrowing is proposed.
- **Deferred by agreement:** native desktop UAT and production acceptance
  tests follow implementation. The Vite harness is not native package
  acceptance. The production frame-error channel must still stop and clear
  failed output.
- **Disposition (2026-10-13):** the Lead Developer directed closeout and
  movement to Sprint 079; this is recorded as GO for Sprint 079 readiness.
  Builder recommendation is GO with the implementation residuals above.
  Sprint 079 implementation still requires its own explicit authorization
  and approved file-by-file plan.
