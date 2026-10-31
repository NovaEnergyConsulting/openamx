# Sprint 112 Diagnostics and Compatibility Gates

## Accepted Diagnostics and Limits

- `AMXD6001`: diagram time identifier in a loop iterable or branch condition;
  rejected by the S110 checker at the identifier.
- `AMXD6004`: generated control-originating output exceeds 64 per evaluated
  diagram; exact allocated message is
  `Number of elements in this diagram exceed the maximum (64)`. The 65th
  instance fails during S111 model creation before append/evaluation, anchored
  at its authored primitive declaration.
- `AMXD013`: more than 512 authored primitive declarations per report; it is
  independent from generated output and is never the overflow diagnostic.
- D111-02 remains an accepted potentially unbounded-work residual. S112 does
  not add a loop-iteration or work cap.

## Serialization Errors

S112 must define deterministic failure behavior for malformed versioned
payloads, unsupported versions, incomplete per-instance bindings, invalid
instance references/locators, unsupported or cyclic values, and missing
captured environments. Do not silently drop generated instances, use direct
declaration elements as a fallback for a control-bearing model, or report a
partially rendered frame as success.

Browser error presentation should follow the existing controlled diagram
failure/recovery path in `diagramBrowserEntry.ts`. S112 must preserve raw AMX
diagnostic data where available and avoid exposing internal exceptions as
false AMX diagnostics. Do not weaken existing CSP, offline, gzip/base64, or
sanitization behavior.

## Backward Compatibility Gate D112-01

- Preserve deserialization and playback of existing version 1 no-control
  models, subject to the selected envelope policy.
- Reject version 1 payloads that contain control-bearing declarations but no
  expanded instance data; do not reevaluate controls during deserialization.
- Reject unknown envelope versions deterministically.
- Keep old standalone HTML self-contained: it embeds its own browser runtime
  and payload. S112's new runtime must correctly read supported legacy payloads
  when tests invoke the new runtime with them; do not promise that old embedded
  runtimes can read new payloads.

## Render Compatibility

- Interactive HTML uses the serialized scene-model payload and the generated
  browser bundle. Prove actual frame evaluation in browser automation.
- PDF uses the static inline SVG. DOCX uses a rasterized PNG from the same
  lower-bound static frame; it is not editable native Word geometry.
- Keep metadata/title/description, report insertion order, aspect ratio,
  offline behavior, and error handling. Any output representation change
  needs an explicit contract amendment.
- Regenerate `src/renderer/diagramBrowserRuntime.ts` only via
  `scripts/build-diagram-runtime.ts`. Review generated diff and ensure it is
  the expected build product; do not apply manual bundle edits.

## Resource Policy

Measure generated serialized-model size, compressed payload, full HTML,
browser DOM/timing, PDF, and DOCX against S109's selected 64-element and
composition evidence. Existing HTML enforcement remains 100 MiB in the
renderer; the V0.13 specification states 1 MiB; the desktop worker also has
an 8,000,000-character guard. This accepted discrepancy is reported, not
resolved, by S112. No output-size limit changes are authorized.