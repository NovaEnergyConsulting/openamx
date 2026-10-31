# Sprint 112 Blueprint: Scene Serialization and Render Compatibility

## Approach

1. Recheck S109-S111 dispositions and the current worktree. S111 is accepted
  with residuals; preserve its `AMXD6004` overflow contract, cap 64
  accounting, and fail-closed behavior until production round-trip parity is
  verified. The exact S112 file, command, generated-output, and artifact plan
  was separately approved on 2026-10-31.
2. Implement the approved D112-01 through D112-04 decisions below without
  changing unrelated resource or report policy.
3. Keep the existing model/captured-context envelope semantics. Add a
   validated ordered expanded-instance payload. It must preserve the source
   primitive and location, instance identity/order, and iterator binding
   values without serializing an AMX-addressable name/reference feature.
4. On deserialization, validate the envelope/version and every instance
   descriptor, reconstruct the model and its expanded-instance runtime data,
   and restore the captured `Environment`. Never reevaluate control
   expressions to reconstruct membership. Keep legacy no-control v1 models
   working under the approved compatibility decision.
5. Test round-trip parity using the actual production serializer and
   deserializer: create one source model, evaluate lower/interior/upper
   frames, serialize/deserialize, then evaluate the same times. Compare
   ordered primitive kinds/values/source locations and confirm distinct
   iterator bindings remain distinct.
6. Regenerate `src/renderer/diagramBrowserRuntime.ts` by running
   `bun run scripts/build-diagram-runtime.ts` or the root build. Do not edit
   the generated file manually. Verify the bundled browser runtime accepts
   the selected envelope and produces the same frames as in-process code.
7. Extend standalone HTML browser coverage using the existing
   `desktop-app/tests/ui/diagram-playback.pw.ts` surface or an explicitly
   approved focused companion. Confirm multiple generated instances, order,
   lower/interior/upper time values, no unexpected network requests, no
   client errors, and clear recovery behavior if deserialization fails.
8. Extend PDF/DOCX tests to use a generated-control fixture. Verify both
   render from the lower-bound frame and preserve identical membership/order
   and expected geometry/text values. Keep PDF SVG and DOCX PNG
   representations, accessibility metadata, aspect ratio, and report order.
9. Exercise the S109 cap/composition measurements using production-generated
   models. Record serialized JSON, compressed model, full HTML, DOM count,
   frame time, PDF/DOCX output bytes and duration. Compare to S109 evidence;
   report limitations without changing the existing HTML size policy or
   claiming low-end/cross-platform qualification.
10. Complete `serialization-render-test-matrix.md`, preserve raw logs and
    Playwright outputs under approved sprint paths, regenerate and inspect
    generated outputs, run the focused gates, and submit Builder evidence for
    a separate disposition.

## Approved Decisions

- **D112-01:** Write envelope version 2 for all models. Continue reading
  version 1 no-control models; reject version 1 control-bearing payloads and
  unknown versions. Version 2 requires `instances` and a matching
  `instanceCount`.
- **D112-02:** Serialize every expanded instance in order with sequential
  model-local identity, a validated recursive content/branch path, and
  ordered loop bindings. Resolve primitive nodes and provenance from the
  serialized declaration AST. Restore the list without evaluating controls.
- **D112-03:** Support scalar, list/array, record, enum primitive, and
  measurement data values where their existing AMX semantics survive the
  tagged round trip. Reject maps/sets and unsupported or cyclic instance
  binding values deterministically.
- **D112-04:** Standalone HTML is the interactive output, initialized at
  `timeline.from`; PDF SVG and DOCX PNG are the static lower-bound outputs.
  There is no separate static HTML renderer in this scope.

## Approved Source and Test Surfaces

Production paths:

- `src/runtime/diagramModel.ts` - serialization envelope, descriptor
  validation, restoration of per-model expanded instances, compatibility.
- `src/renderer/diagramBrowserRuntime.ts` - generated output only; update
  through the approved build generator, never hand-edit.
- `scripts/build-diagram-runtime.ts` - likely generator invocation only; do
  not change its policy unless a concrete defect is separately approved.
- `src/renderer/diagramHtml.ts`, `src/renderer/diagramBrowserEntry.ts`, and
  `src/renderer/staticDiagram.ts` - inspect for integration; no changes
  assumed if the shared `DiagramSceneModel` path suffices.

Focused test candidates:

- `tests/diagram.test.ts` - serialization/deserialization frame parity and
  malformed/new/legacy payloads.
- `tests/diagramHtml.test.ts` - interactive model embedding and size checks.
- `desktop-app/tests/ui/diagram-playback.pw.ts` - actual standalone browser
  playback and, when supported, desktop-preview harness evidence.
- `tests/reportPdf.test.ts` and `tests/reportDocx.test.ts` - static lower-bound
  output order/geometry/metadata.
- `planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/production-composition-probe.ts`
  - production-generated 16-diagram workload and export measurements.

Generated outputs and test artifacts are restricted to the approved generator
and the Sprint 112 `artifacts/` roots. The existing S0080 artifact directory
and `desktop-app/test-results/` are preserved.

## Verification

Candidate commands from repository root:

```powershell
bun test tests/diagram.test.ts tests/diagramHtml.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts
bun run scripts/build-diagram-runtime.ts
bunx tsc --noEmit
bun run planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/production-composition-probe.ts
```

Candidate browser command from `desktop-app/`:

```powershell
bun run test:ui -- tests/ui/diagram-playback.pw.ts --output=../planning/sprints/0112-v18-scene-serialization-render-compatibility/artifacts/playwright-output/<attempt>
```

Capture command logs under `artifacts/raw/`; retain generated HTML/PDF/DOCX
under `artifacts/outputs/`, screenshots under `artifacts/ui/`, and Playwright
runner output under `artifacts/playwright-output/`. The browser Playwright
harness is not native package/WebView evidence. Missing native or
cross-platform checks remain explicitly BLOCKED/UNAVAILABLE.

## Stop Conditions

- Unresolved envelope compatibility or supported-value behavior blocks the
  corresponding serializer/deserializer claim.
- Do not remove the serialization rejection until expanded descriptors and
  bindings are restored and frame parity passes.
- Do not hand-edit `diagramBrowserRuntime.ts`; stop if the generator fails or
  generated output would overwrite unapproved artifacts.
- Do not change size caps to make S112 tests pass. The HTML discrepancy and
  D111-02 work residual remain separate.
- Any output/performance boundary failure is recorded and routed for product
  decision; it does not authorize a new cap or policy change.
- No release, publication, version change, platform certification, or S113
  editor/spec/example work is authorized.