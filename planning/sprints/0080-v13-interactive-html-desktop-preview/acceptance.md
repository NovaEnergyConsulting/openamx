# Sprint 080 Acceptance Criteria

Sprint 080 is complete when standalone HTML and the actual desktop live
preview render and control the approved diagram model offline, securely, and
accessibly; playback and failure behavior meet the approved contract; and
resource behavior is measured against the accepted limits.

## Rendering and Playback

- The standalone HTML renderer and desktop live preview consume the shared
  immutable Sprint 079 model and render each diagram inline in document order.
  The interactive rendering uses the approved SVG-in-DOM representation.
- Every diagram starts paused at its lower-bound time; autoplay is absent and
  loop is off by default. Each diagram has independent play/pause, reset,
  continuous scrubber, and loop controls.
- Scrubbing selects arbitrary in-range time and renders that frame directly.
  Playback maps the interval to the declared wall-clock duration per pass.
  With looping off, playback stops at the exact upper bound and leaves the
  final frame visible; with looping on, the next pass starts at the lower
  bound. Reset returns to the lower bound.
- Resize preserves the logical canvas aspect ratio, bottom-left origin and
  positive-Y-up mapping. Geometry, labels, and static styles match the shared
  model at lower, interior, and upper time values.
- Title and accessible description are exposed for every figure; controls have
  meaningful accessible names, keyboard operation, visible focus, and usable
  focus order. Screen-reader/manual review is recorded separately from DOM
  assertions.

## Frame Errors and Preview Lifecycle

- A frame evaluation error stops and clears only the affected diagram and
  displays an explicit source-located failure. It does not retain a stale
  graphic, silently omit the diagram, or show a success-looking placeholder.
- AMXD009 (thrown base AMX error), AMXD010 (upper-bound infinity), and
  AMXD011 (interior selected-time infinity) are surfaced with their allocated
  messages and source locations. Invalid initial-frame/report rendering fails
  explicitly before presenting a successful preview.
- Other diagrams remain independently usable after one diagram fails. Reset,
  pause, loop state, and scrub behavior do not cause stale frames after a
  failure.
- Replacement/cancellation of a preview stops its old playback work. Delayed
  callbacks or frame-error messages from an old preview token cannot mutate
  the current preview or surface as current errors.
- Desktop rendering is exercised in the actual running/packaged desktop
  application when supported by the host. `App.vue`/Vite harness and RPC
  contract tests are supporting evidence only, not a substitute for visible
  desktop acceptance.

## Security, Offline Behavior, and Accessibility

- Generated standalone HTML opens as a local file and renders with zero
  remote/network requests. Runtime code is application-owned and data remains
  separate, inert, and safely escaped/serialized.
- No `eval`, `new Function`, report-authored JavaScript/active markup, remote
  scripts/assets, or untrusted HTML interpolation is introduced.
- Desktop iframe sandboxing remains least-privilege and unchanged:
  `sandbox="allow-scripts"` without `allow-same-origin`. CSP and existing
  preview freshness/security behavior are preserved.
- A frame-error message channel, if used, is schema-validated, tied to the
  active preview/frame, rejects stale or hostile messages, and transports
  diagnostic data rather than report-authored HTML.
- Hostile titles, descriptions, labels, text values, and dynamic strings are
  rendered as inert text. They cannot create script, image, frame, link,
  object, or embed execution paths or issue network requests.
- Controls are fully operable by keyboard with accessible labels and state;
  accessibility limitations or unavailable formal assistive-technology
  reviews remain explicit.

## Resource Bounds and Repeated Emissions

- Generated interactive preview HTML is at most 1 MiB UTF-8 and remains below
  the existing 8,000,000-character desktop fail-safe.
- Frame work meets the approved 16.7 ms p95 limit under a documented,
  repeatable workload; incremental preview heap is at most 8 MiB under a
  documented, repeatable measurement; the measured whole page remains at or
  below 2,000 DOM nodes.
- Measurements identify hardware/OS/browser/package, workload, sample count,
  warm/cold conditions, percentile method, garbage-collection method where
  applicable, and any variability. The high-performance Sprint 078 host is
  not evidence of minimum-host conformance.
- Exercise valid nested/loop declarations that emit more than 16 model
  instances or 512 element instances. Preserve Sprint 079's approved
  authored-declaration counting semantics. Do not silently drop or truncate
  rendered instances to meet a resource bound.
- If repeated emissions or evaluation can exceed accepted output/runtime
  bounds, use only an explicitly approved fail-fast policy and diagnostic.
  Any unresolved product decision or unallocated diagnostic is marked
  BLOCKED; it is not a pass and does not justify silently changing language
  semantics or approved caps.

## Verification, Residuals, and Boundaries

- Standalone local-file, production renderer, actual desktop preview, and
  relevant regression tests are directly evidenced. Record exact commands,
  counts, artifacts, screenshots, first failures/retries, and all
  BLOCKED/UNAVAILABLE/NOT RUN cases in `builder-evidence.md`.
- Run focused root renderer tests and root build; run desktop typecheck,
  web build, RPC tests and focused UI tests. Record native desktop build/UAT
  separately.
- The output does not include PDF/DOCX diagram integration, editor-language
  integration, release/publication, versioning, platform certification, or
  end-to-end V0.13 acceptance; those remain later sprint scope.
