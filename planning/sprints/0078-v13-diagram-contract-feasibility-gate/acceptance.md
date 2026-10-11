# Sprint 078 Acceptance Criteria

Sprint 078 is complete when the confirmed V0.13 scope has a traceable contract,
the cross-surface feasibility questions have evidence-backed outcomes, and
every blocker or product decision is explicit. Completion does not itself
authorize production implementation or release.

## Contract Artifacts

- `grammar-examples.md` contains stable-ID candidate syntax examples for all
  required diagram declarations, primitives, static styles, time behavior,
  surrounding AMX values/functions, and dynamic labels/geometry. It includes
  both required engineering depictions and representative invalid cases.
- Confirmed scope, proposed grammar, probe-only assumptions, and unresolved
  choices are labeled separately. The declaration structure and formatter
  expectations are either explicitly frozen for Sprint 079 or marked BLOCKED
  pending a named decision.
- `diagnostic-matrix.md` covers required-field/type errors, unsupported
  elements/properties, invalid canvas/time/playback values, non-finite initial
  geometry, and invalid geometry encountered at a later frame. Each fixture
  has explicit failure behavior and exact primary source location; secondary
  locations are included when useful. Unapproved diagnostic identities remain
  unallocated rather than guessed.
- `requirement-test-matrix.md` traces every applicable V0.13 master-plan
  requirement to fixture IDs, expected behavior, later owning sprint/surface,
  and required evidence.
- All fixture IDs, text, expected outcomes, and locations agree across the
  artifacts. Source positions are 1-based in the original document, include
  front matter and executable-fence delimiters where applicable, and count
  columns as UTF-16 code units.

## Expression and Diagram Model Feasibility

- The report identifies the proposed typed, destination-neutral scene data
  and demonstrates preservation of logical canvas coordinates, aspect ratio,
  source element order, static styling, title/description, timeline, and
  source attribution across destinations.
- The probe demonstrates evaluation at the initial, representative interior,
  and upper-bound times for both required depictions, with dynamic geometry
  and/or labels. Bounds and playback duration are evaluated once from
  surrounding document context; local time is diagram-scoped.
- The report establishes whether existing AMX expressions and functions can
  be evaluated safely at arbitrary selected times offline without generated
  executable source or report-authored JavaScript. It records unsupported
  operations and any dependency on a product decision.
- Invalid initial geometry stops rendering with a source-located error.
  Invalid geometry encountered during playback stops that diagram and
  surfaces an explicit error; no stale frame or placeholder is treated as a
  pass.

## Output and Runtime Feasibility

- Both depictions are exercised through standalone local-file HTML and the
  actual desktop live-preview path, plus generated PDF and DOCX artifacts,
  using the same validated model.
- HTML/desktop evidence covers paused initial state, arbitrary-time selection,
  responsive aspect ratio, title/description and control accessibility,
  offline resource availability, hostile report-derived text, and absence of
  report-authored executable markup.
- PDF and DOCX artifacts visibly contain the lower-bound static frame,
  proportionate dimensions, title and accessible description, and correct
  report reading order. DOCX is a static embedded graphic, not editable
  native Word shapes. The candidate representation and any accessibility
  limitation/fallback are recorded.
- Resource packaging and offline behavior are exercised. Actual output
  artifacts and preview behavior are inspected; serialization-only success
  is insufficient.
- Representative render time, output size, and preview resource consumption
  are measured and reported with environment and method. Proposed limits are
  evidence-based, measurable, and explicitly provisional until approved.

## Feasibility Decision and Boundaries

- `feasibility-report.md` records exact commands/actions, environment,
  artifacts, metrics, failures/retries, evidence locations, remaining
  limitations, and a GO / NO-GO / BLOCKED recommendation for Sprint 079.
- If any confirmed requirement requires reducing the expression contract,
  changing output/accessibility behavior, using generated executable source,
  weakening preview security, or introducing an unapproved language feature,
  Sprint 078 stops and names the required Lead Developer decision.
- No production implementation, feature claims, release/publication,
  versioning, or platform-certification claims are made.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
  reflect only the completed preparation/evidence and explicitly separate
  Builder recommendation from Lead Developer disposition.
