# Sprint 083 Acceptance Criteria

Sprint 083 is complete when an integrated, requirement-traceable V0.13
acceptance matrix records direct evidence for each applicable surface,
failures and unverified items are dispositioned honestly, and a separate Lead
Developer records the V0.13 closeout disposition. Sprint 083 adds no product
scope and does not authorize release or publication.

## Integrated Requirement Matrix

- Every applicable V0.13 master-plan requirement and Sprint 078 fixture family
  is represented in `builder-evidence.md`.
- Each row identifies requirement/case IDs, expected behavior, implementation
  and surface, exact command/action, evidence/artifact, status
  (`PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`), residual owner, and
  required follow-up/disposition.
- Core, VS Code, desktop editor/preview, standalone HTML, PDF, and DOCX
  outcomes are recorded separately wherever a capability exists on more than
  one surface. No result is inferred from a neighboring surface or a prior
  sprint.

## Core Language, Diagnostics, Model, and Formatter

- Re-run both valid language fixtures and all invalid diagram fixtures
  D-NEG-01–D-NEG-24. Confirm exact expected results and the final approved
  diagnostic mapping: AMXD001-AMXD015 and AMX3001/AMX3002 reuse.
- Confirm D-NEG-18 uses the corrected source location `10:15`; verify
  original-document positions, UTF-16 columns, exclusive diagnostic ends,
  zero-based half-open editor-range conversion, and LF/CRLF behavior where
  applicable.
- Verify all approved diagram declaration, primitive/property/style,
  finite-canvas/time/duration, local-time-scope, selected-time,
  non-finite-frame, authored-cap, import-order, nested-execution, and
  expression/context semantics using the Sprint 078 contract and Sprint 079
  implementation tests.
- Verify immutable scene-model content/order/source data, arbitrary-time
  frame values and errors, typed context, and formatter idempotence and
  meaning-preserving parse-format-parse behavior.
- Existing AMX regressions pass or are recorded against their concrete
  baselines. Broader AST/value combinations and high-rate evaluation are
  classified by actual test coverage, not by the Sprint 078 probe or a
  representative Sprint 079 case.

## Standalone HTML and Desktop Preview

- Both examples and relevant diagram fixtures render in standalone HTML and
  start paused at the lower bound with loop disabled and no autoplay.
- Verify independent play/pause, reset, arbitrary-time scrub, declared
  duration mapping, loop-off stop at exact upper bound/final frame retention,
  loop-on restart, responsive aspect ratio and time-varying geometry/labels.
- Verify AMXD009/AMXD010/AMXD011 stop and clear the affected diagram,
  surface exact source-located diagnostics, and reject stale frame messages
  after replacement/recovery without corrupting other diagrams.
- Verify local-file offline behavior, zero unexpected requests, hostile
  report text safety, trusted runtime/data separation, unchanged iframe
  sandbox policy, accessibility names/keyboard behavior, preview freshness,
  and replacement lifecycle.
- Measure/record the approved 1 MiB UTF-8 output ceiling, 16.7 ms p95 frame
  work, 8 MiB incremental heap, 2,000-node limit, existing desktop
  8,000,000-character fail-safe, and repeated-emission behavior. Record
  workload, host, method, samples and variability; do not claim
  minimum-host/cross-platform qualification from one machine.
- Actual packaged desktop preview/UAT is a distinct status from the Vite
  harness, mocked RPC, and earlier packaged test. If unavailable, mark
  `BLOCKED/UNAVAILABLE` and identify the exact missing path.

## PDF and DOCX

- Both formats use the lower-bound frame and preserve the prepared report
  order, aspect ratio, title/description and surrounding narrative. PDF uses
  inline SVG; DOCX uses a static embedded PNG and no editable Word shapes or
  playback controls.
- Inspect actual PDF pages and DOCX render/Word view; verify PDF extracted
  text/order, DOCX image parts, internal relationships, image alt metadata,
  dimensions and page flow.
- Verify invalid lower-bound rendering errors explicitly and preserve existing
  destinations byte-for-byte with no temporary artifact for both export
  formats.
- State PDF accessibility accurately: absence of `/StructTreeRoot`/`/Alt` in
  inspected artifacts means no tagged-PDF/PDF/UA or screen-reader acceptance
  may be claimed. DOCX alt metadata inspection does not substitute for formal
  assistive-technology review.

## VS Code, Desktop Editor, Help, Specification, and Examples

- Directly verify VS Code Development Host syntax scopes, formatting,
  diagnostics/source ranges, completion, outline/symbols and navigation for
  complete and incomplete representative documents.
- Directly verify desktop CodeMirror/workbench highlighting, formatting,
  visible diagnostic marks/ranges, completion, outline/navigation and
  searchable Help. Shared facts/RPC alone do not establish user-visible UI
  behavior.
- Confirm `docs/language-spec-v0.13.md`, README links, desktop Help, and both
  examples match the approved contract and do not overstate support,
  accessibility, platform qualification, or release status.
- Analyze/run both examples. Verify standalone HTML interactive behavior and
  inspect production PDF/DOCX output for lower-bound frames. Verify native
  packaged preview separately where available.

## Integrated Verification, Residuals, and Disposition

- Run focused root tests/build and the complete root suite; run VS Code
  Development Host and desktop typecheck/build/RPC/UI/package workflows as
  specified in the blueprint. Record full aggregate counts and per-test
  failures. A focused V0.13 pass does not convert a failing host suite to
  PASS.
- Compare directly with the documented residuals: VS Code Sprint 082
  17 passed/7 Windows path/cleanup failures; desktop RPC sandbox-occurrence
  mismatch; Sprint 080 packaged workload vs minimum-host/cross-platform and
  screen-reader gaps; Sprint 081 lack of tagged PDF structure/accessibility;
  Sprint 082 native preview unavailable and full root suite not run.
- Record first-run failures, retries, unavailable checks and any changed/new
  failures. Retries do not erase initial results; no security, path, sandbox,
  or assertion weakening is allowed to create a pass.
- `builder-evidence.md` includes exact commands, versions, counts, fixture
  IDs, direct host/artifact evidence, screenshots/logs, owners, residuals and
  a Builder closeout recommendation.
- A separate Lead Developer explicitly records `ACCEPTED/CLOSED` with named
  residuals or `BLOCKED/OPEN` with required follow-up. Builder evidence or
  recommendation alone does not establish milestone acceptance.
- No product feature work, package/version change, release, publication, or
  platform certification occurs.
