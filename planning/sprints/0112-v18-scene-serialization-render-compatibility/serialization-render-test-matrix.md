# Sprint 112 Serialization and Render Test Matrix

This matrix assigns evidence to the accepted S111 in-process expansion
behavior. Every generated-control test must use the actual parser,
typechecker, model creation, serializer, and renderer paths unless a narrowly
documented unit boundary requires a constructed model.

| S112 ID | Required case | Assertion | Candidate owner surface |
| --- | --- | --- | --- |
| SER112-VERSION-01 | Legacy version 1 no-control serialized model | Deserializes and produces the same initial/frame values as before | `tests/diagram.test.ts` |
| SER112-VERSION-02 | New generated-model envelope | Version/schema is explicit; required expanded data is validated | `tests/diagram.test.ts` |
| SER112-ROUNDTRIP-01 | `GEN-BIND-01`, `GEN-ROUNDTRIP-01` | Serialize/deserialize one model, then evaluate lower/interior/upper frames; ordered semantic frames match pre-round-trip | `tests/diagram.test.ts` |
| SER112-ORDER-01 | `GEN-ORDER-01`, `GEN-MIX-01` | Descriptor order is preserved for direct content, iterations, and selected branches | `tests/diagram.test.ts` |
| SER112-EMPTY-01 | `GEN-EMPTY-01`, `GEN-BRANCH-01` | Empty/false/unselected content remains absent after round-trip; no re-expansion occurs | `tests/diagram.test.ts` |
| SER112-BIND-01 | Several different iterator values, repeated source primitive | Each restored instance retains its own binding and evaluates distinct property values | `tests/diagram.test.ts` |
| SER112-BIND-TYPES-01 | Supported iterable element values | Scalar/list/enum/record/measurement cases are either preserved with required semantics or explicitly rejected by the approved contract | `tests/diagram.test.ts` |
| SER112-SOURCE-01 | Invalid generated primitive at a non-lower frame, before/after round-trip | `AMXD009`/underlying diagnostic and authored property location remain accurate | `tests/diagram.test.ts` |
| SER112-MALFORMED-01 | Unknown version, missing/malformed instances, bad bindings/locator, cyclic/unsupported values | Deterministic rejection; never silently omit or flatten output | `tests/diagram.test.ts` |
| HTML112-PAYLOAD-01 | Standalone HTML with generated diagrams | Gzip/base64 payload deserializes in browser; all figures initialize with expected order and no page/console error | `tests/diagramHtml.test.ts`, UI test |
| HTML112-FRAME-01 | Same generated model at lower/interior/upper times in a real browser | DOM primitive count/order/attributes match in-process frames; iterator properties stay distinct while `t` changes | `desktop-app/tests/ui/diagram-playback.pw.ts` |
| HTML112-ACCESS-01 | Generated standalone report | Existing accessible captions/controls/descriptions and offline/no-network guarantees remain | UI test |
| HTML112-ERROR-01 | Corrupt/unsupported model payload | Browser surfaces a controlled diagram error, clears stale frame output, and does not report a false success | UI test |
| PDF112-STATIC-01 | Generated-control diagram in PDF | Lower-bound generated membership/order and geometry appear in the inline SVG; no playback controls/scripts | `tests/reportPdf.test.ts` |
| DOCX112-STATIC-01 | Same fixture in DOCX | Same lower-bound content is embedded as PNG; visible title/description, image metadata, proportions, and report order remain | `tests/reportDocx.test.ts` |
| OUTPUT112-PARITY-01 | Same generated source across in-process, browser, PDF, and DOCX paths | Compare semantic frame/element order and expected values; account for PDF SVG and DOCX PNG representation differences | Cross-surface matrix |
| OUTPUT112-NOGEN-01 | Existing no-control diagrams | Existing version 1 model and all HTML/PDF/DOCX results remain compatible | Existing focused suites |
| RESOURCE112-CAP-01 | 64 generated outputs; direct top-level elements plus per-diagram composition | Serialized bytes, HTML bytes, DOM count, per-frame timing, PDF/DOCX bytes/duration recorded against S109 | Benchmark artifacts |
| RESOURCE112-HTML-01 | Candidate interactive output around existing measured range | Existing 100 MiB runtime enforcement and separately documented 1 MiB discrepancy are reported unchanged | `tests/diagramHtml.test.ts` |
| RUNTIME112-BUNDLE-01 | Regenerated browser runtime | `bun run scripts/build-diagram-runtime.ts` produces the committed source bundle; root build/typecheck pass | Build/generator checks |

## Required Cross-Surface Comparison

- Use one accepted generated source and one evaluated model as the semantic
  reference. The model's controls are evaluated once. Browser frame requests
  must not change membership/order or repeat control evaluation.
- Compare primitive kind, sequence, source element provenance where exposed,
  geometry, text, and timeline-dependent properties at lower, interior, and
  upper times. Use tolerances only where output representation requires a
  documented numeric normalization.
- PDF and DOCX are static lower-bound outputs. Compare them to the same
  model's frame at `timeline.from`, not to an arbitrary browser time.
- Verify the generated HTML's serialized payload, not just the presence of a
  `<figure>` or inert script tag. At least one real browser test must evaluate
  frames using the generated runtime.
- Keep standalone browser, Vite desktop-preview harness, native WebView/package,
  and document export evidence distinct. Do not infer one host's status from
  another.

## Resource and Compatibility Evidence

At minimum record the S109 comparison workload: 16 diagrams, 512 authored
declarations across the report where applicable, and 64 generated
control-originating primitives per diagram. Record expanded JSON bytes,
gzip/base64 payload bytes, full UTF-8 HTML bytes, DOM node count, in-browser
frame timing, PDF bytes/duration, and DOCX bytes/duration. Preserve individual
measurements, environment, commands, and output hashes.

The S109 synthetic candidate measured 247,256 HTML bytes and 1,864 whole-page
DOM nodes for the 64-per-diagram composition; use these as comparison points,
not universal pass thresholds. The current renderer's 100 MiB enforcement
and the V0.13 1 MiB statement remain distinct. Do not change either policy
under S112. D111-02 remains an accepted unbounded-work residual; report
expansion/runtime measurements without implying a new iteration bound.