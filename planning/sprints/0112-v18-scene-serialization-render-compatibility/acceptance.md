# Sprint 112 Acceptance Criteria

Sprint 112 is complete only when generated scene models round-trip with
ordered membership and per-instance bindings intact, the generated browser
runtime matches in-process frames, and interactive/static report outputs
preserve the accepted contract. Resource evidence and compatibility decisions
must be recorded. A separate product-owner disposition is required.

## Entry and Serialization Contract

- Sprint 111 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-10-31.
- The accepted S111 cap is 64 control-block-originating primitives per
  evaluated diagram; `AMXD6004` handles output 65; direct top-level elements
  do not consume the cap; `AMXD013` remains authored-only.
- D112-01 through D112-04 are resolved or recorded as explicit residuals that
  do not invalidate round-trip, binding, or output parity claims.
- New generated models serialize all expanded instance data and captured
  environments needed for frame evaluation. Deserialization restores these
  descriptors without reevaluating controls.
- Version 1 static model compatibility, malformed/unknown payload behavior,
  and the supported binding-value contract are verified.
- No generated-control payload silently falls back to flat content or drops
  an instance/binding.

## Runtime and Render Parity

- Production round-trip of a model with multiple distinct loop values
  preserves identity/order/provenance and yields equivalent lower/interior/
  upper frame values before and after serialize/deserialize.
- The generated browser runtime evaluates the serialized model to the same
  semantic ordered frame elements as the in-process runtime.
- A real browser test exercises lower/interior/upper times and actual DOM
  geometry/attributes. It records page/console errors and network requests.
- PDF static SVG and DOCX embedded PNG use the same lower-bound generated
  membership/order and expected values; report order, title/description,
  metadata, and proportions remain correct.
- Existing diagrams without controls retain prior serialization, browser,
  static PDF, and DOCX behavior.
- `src/renderer/diagramBrowserRuntime.ts` is regenerated through the approved
  script and is not hand-edited.

## Resource Evidence and Boundaries

- Measure the accepted 64-per-diagram composition and compare with S109's
  247,256-byte HTML / 1,864-DOM-node synthetic baseline. Record the actual
  host, repetitions, timing, sizes, failures, and output artifacts; do not
  claim these synthetic values are universal thresholds.
- Exercise current HTML and desktop-worker limits as applicable. Preserve
  the 100 MiB renderer enforcement and the documented 1 MiB discrepancy; no
  broad policy change is made.
- D111-02 remains an accepted potentially unbounded-work residual. No new
  iteration cap or bounded-memory claim is introduced.
- Browser harness, desktop preview harness, native host, and platform
  evidence remain separately labeled. Missing native or cross-platform
  checks remain BLOCKED/UNAVAILABLE, not inferred PASS.
- All mapped cases in `serialization-render-test-matrix.md` have evidence or
  explicit residual dispositions. Builder results and product-owner
  disposition are distinct.
- No editor/spec/example work, release, publication, package/version change,
  or platform certification is authorized.