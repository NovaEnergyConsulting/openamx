# Sprint 112 Handoff Prompt

You are the Builder for OpenAMX Sprint 112: V0.18 Scene Serialization and
Render Compatibility.

## Read First

- Project instructions and current worktree status. Preserve all user
  changes, prior S109/S110/S111 evidence, generated outputs, and test results.
- `planning/plan-openamxV18MasterSprintPlan.md` and every Sprint 112 package
  document.
- Sprint 109 accepted resource evidence; Sprint 110 accepted AST/checker
  evidence; Sprint 111 accepted runtime/diagnostic decisions and residuals.
- Current `diagramModel.ts` expanded descriptors, serializer guard, HTML
  payload, browser entry/runtime generator, static renderer, focused tests,
  and existing `diagram-playback.pw.ts` coverage at the authorized commit.

## Authority and Entry Gate

- This is Architect preparation only. Obtain separate Sprint 112 execution
  authorization and exact file/output/command approval before edits, builds,
  browser runs, or artifact generation.
- Resolve D112-01 envelope version/legacy compatibility, D112-02 instance
  encoding, D112-03 supported binding values, and D112-04 static HTML scope
  in the approved implementation plan.
- Keep the S111 accepted `AMXD6004`, 64 control-only cap, and separate
  512-authored `AMXD013` behavior unchanged.
- Keep D111-02 as an accepted residual. Do not add a work cap or claim
  bounded time/memory.
- Do not remove S111's serialization rejection until generated instance
  descriptors/bindings are serialized, restored, and frame-parity tested.
- Generate browser bundle changes only by running
  `scripts/build-diagram-runtime.ts`; never hand-edit generated output.

## Task Contract

- Preserve ordered generated membership, source provenance, model-local
  identity, and each instance's loop bindings through serialization and
  deserialization.
- Preserve the existing captured AMX environment and ensure deserialization
  does not reevaluate iterables/conditions or change membership.
- Support legacy no-control serialized models under the approved version
  policy; reject malformed, unsupported, or incomplete payloads safely.
- Verify in-process versus browser frames at multiple times, then verify the
  same model's static lower-bound PDF/DOCX outputs.
- Preserve offline/security behavior, report insertion order, visible and
  accessible metadata, and current output-size policy.
- Exercise the S109 64-per-diagram composition and report actual size,
  browser timing, and export measurements against the accepted baseline.
- Keep standalone browser, desktop Vite harness, native package, and
  cross-platform evidence separate. Complete evidence and request a separate
  product-owner disposition.

## Mandatory Boundaries

- No cap changes, `AMXD013` reuse, iteration/work limit, HTML size policy
  change, editor support, language-spec/example work, or release/version
  action.
- No false parity claim from serialized markup alone; a real browser must
  evaluate generated frames.
- No static export claim from browser playback; PDF and DOCX require their
  own artifact assertions.
- No manual edits to `diagramBrowserRuntime.ts`.
- If a new source/test/output path or behavior is required beyond the
  approved plan, stop and request a precise amendment.

## Completion

Meet `acceptance.md`, reconcile the runtime/render case IDs, preserve raw
logs/artifacts, record generated bundle verification, and submit evidence for
a separate disposition. Sprint 113 and release work remain separately gated.