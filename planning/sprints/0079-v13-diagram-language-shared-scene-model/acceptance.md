# Sprint 079 Acceptance Criteria

Sprint 079 is complete when the approved diagram contract is implemented in
the core language/runtime/formatter, the typed scene model preserves the
required meaning and source information, and focused tests demonstrate the
contract without changing existing AMX behavior.

## Approved Language Contract

- Executable AMX accepts the approved `diagram Identifier` declaration with
  required non-empty String-literal title and accessible description, finite
  positive Number-expression canvas width/height, exactly one local numeric
  time variable, and one or more supported elements as required by the
  approved grammar.
- The parser/type checker accept the approved `line`, `rectangle`, `circle`,
  and `text` forms and reject unsupported primitives/properties, missing
  fields, wrong value types, invalid arrow literals, and animated style
  expressions according to the Sprint 078 fixtures.
- Diagram-local time is visible only in diagram element expressions and is
  not visible in its own bound/duration declaration or outside the diagram.
  Existing document-scope values, pure functions, source ordering, and module
  visibility rules continue to apply.
- Bounds and playback duration evaluate once in document scope. Bounds are
  finite and strictly ordered; duration is finite and positive. A requested
  time outside the interval is rejected, not clamped.
- Geometry and String labels are evaluated directly at the selected time,
  with no stateful simulation, time accumulation, additional timeline, or
  reader-controlled geometry. All evaluated coordinates and dimensions obey
  finite/positive validation rules in the approved contract.
- Positive fixtures `D-CRANK-01` and `D-BATTERY-01` parse, type-check, and
  evaluate consistently at lower, representative interior, and upper times.
  The accepted crank equations and the constant-current/moving-direction
  battery indicator remain unchanged; no trigonometric standard-library
  function is added.

## Diagnostics and Source Locations

- Tests cover every invalid fixture `D-NEG-01`–`D-NEG-24` using the approved
  exact mapping in Sprint 078 `diagnostic-matrix.md`: AMXD001–AMXD011 and
  AMX3001/AMX3002 reuse. AMXD009, AMXD010, and AMXD011 retain their distinct
  base-AMX-error, upper-bound-infinity, and interior-infinity behavior.
- Each diagnostic reports the approved primary source position in the
  complete original document. Columns count UTF-16 code units; line/column
  positions include front matter, narrative, and executable-fence delimiters.
  Any `EditorRange` conversion remains zero-based and half-open.
- Invalid initial geometry produces no model/frame. Invalid geometry on a
  later selected time returns an explicit source-located error to the
  evaluator caller; it does not return a stale frame, blank success, or
  placeholder. Desktop error delivery is reserved for Sprint 080.
- The approved 16-diagram and 512-semantic-element limits are tested at the
  boundary and above it. Above-limit failure is explicit and deterministic;
  its user-facing diagnostic identity/message must have Lead Developer
  approval before this criterion is marked PASS. Do not guess or reuse an
  unrelated diagnostic.

## Typed Scene Model and Evaluation

- The model is immutable and destination-neutral and preserves source element
  order, logical canvas dimensions and coordinate convention, title,
  accessible description, interval, duration, source attribution, validated
  dynamic expressions, and static styles.
- Each frame is evaluated from the selected time and captured document
  context. Model construction/evaluation does not mutate authored values or
  reuse a previously evaluated frame as a success fallback.
- Host evaluation preserves existing AMX semantics for supported values and
  functions. Tests include references to surrounding document values and
  pure functions, imported-function/context behavior, and typed cases for
  measurements/units and record/enum data; test breadth and any known runtime
  limitation are recorded explicitly rather than treated as covered by a
  single probe.
- Expressions are stored/evaluated as validated AMX data/AST through the
  existing runtime; no generated executable source, `eval`, `new Function`,
  or author-provided JavaScript is introduced.
- The approved grammar does not silently broaden. In particular, the known
  existing AMX1004 behavior for an imported function directly referencing an
  enum identifier is not changed as unrelated runtime work.

## Formatter and Regression

- Formatter output follows the approved canonical declaration/property order,
  two-space indentation, one property per line, no semicolons, stable element
  ordering, and unchanged expression text.
- Diagram formatting is idempotent; parse-format-parse preserves the typed
  model and evaluated values.
- Existing AMX documents without diagrams retain established parsing,
  evaluation, diagnostic, and formatting behavior. No existing fixture is
  weakened to make diagram tests pass.

## Verification and Boundaries

- Focused parser, evaluator, formatter, and shared-model tests pass, and the
  root build passes. `builder-evidence.md` records exact commands, outcomes,
  diagnostic allocation for cap overflow, residuals, and any not-run cases.
- No HTML/desktop playback integration, PDF/DOCX report renderer integration,
  editor integration, feature documentation, release, publication, or
  platform-certification claim is made. Those surfaces remain assigned to
  their later sprints.
- Production changes begin only after separate explicit Sprint 079 execution
  authorization and approval of the concrete file-by-file plan.
