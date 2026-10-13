# V0.13 Diagram Diagnostic Matrix

**Allocation status: AMXD001–AMXD011 and reuses AMX3001/AMX3002 recorded
(2026-10-13).** The
`D-NEG-*` strings below identify fixtures, not diagnostic codes. Production
AMX implementation and editor/preview delivery remain future work. Probe
human-readable errors are not production AMX diagnostics.

## Lead Developer allocations

The following are the distinct diagram diagnostic conditions represented by
the current fixtures. The Lead Developer assigned the identity/message shown
in the final column, or approved existing-code reuse. Do not use the
`D-NEG-*` fixture labels as diagnostic codes.

| Allocated identity / exact message | Fixture cases | Required distinction |
|---|---|---|
| AMXD001 — `Missing required field: <field_name>` | D-NEG-01, D-NEG-02, D-NEG-04, D-NEG-05, D-NEG-06, D-NEG-20 | Identify the missing title, description, width, height, time, or primitive property. |
| Reuse AMX3002 (existing type mismatch) | D-NEG-03, D-NEG-07 | Preserve the existing type-mismatch identity/message for String/Number type errors. |
| AMXD002 — `Unknown diagram property` | D-NEG-08, D-NEG-09 | Reject unsupported `path` primitive and unknown `rotate` property at the offending token. |
| AMXD003 — `Canvas width is invalid` | D-NEG-10, D-NEG-17 | Reject non-positive or non-finite evaluated canvas width. |
| AMXD004 — `Invalid time bounds` | D-NEG-11, D-NEG-18, D-NEG-23 | Reject unordered/non-finite bounds and selected time outside the interval; do not clamp silently. |
| AMXD005 — `Invalid playback duration value` | D-NEG-12 | Reject non-positive/non-finite duration. |
| AMXD006 — `Inconsistent time style` | D-NEG-13 | Reject a style expression dependent on diagram-local time. |
| AMXD007 — `Unsupported arrow literal` | D-NEG-21 | Reject an arrow value outside the approved static literal set. |
| AMXD008 — `Invalid primitive geometry` | D-NEG-14, D-NEG-19 | Reject non-finite initial geometry or non-positive rectangle width. |
| AMXD009 — `Frame evaluation leads to invalid results. The underlying error is: <base amx error>` | D-NEG-15 | Stop and clear that diagram when expression evaluation throws an AMX error; include the underlying error and source location. |
| AMXD010 — `Infinity value calculated for time upper bound` | D-NEG-22 | Stop and clear when geometry evaluates to Infinity at the declared upper-bound time without a thrown AMX error. |
| AMXD011 — `Expression produces an infinite result` | D-NEG-24 | Stop and clear when geometry evaluates to Infinity at an interior selected time without a thrown AMX error. |
| Reuse AMX3001 (`Unknown identifier 't'`) | D-NEG-16 | Preserve the existing undefined-identifier diagnostic for diagram-local time outside its scope. |

AMXD009 applies when expression evaluation throws a base AMX error; for
example, D-NEG-15's negative `sqrt` carries existing AMX2005. AMXD010 is the
separate identity for a non-finite upper-bound result such as D-NEG-22, which
has no thrown base AMX error. AMXD011 is assigned to D-NEG-24's non-finite
interior selected time, also without a thrown base AMX error.

AMX3006 syntax reuse for D-NEG-08/09/20/21 was considered but not allocated;
AMXD002/007 and AMXD001 above are the Lead Developer's explicit allocations.

## Source-location contract

- Coordinates are 1-based against the complete original `.amx` document,
  including front matter, narrative, and both opening/closing AMX-fence lines.
- Diagnostic `SourceLocation` remains a 1-based original-document line/column,
  counting UTF-16 code units and including front matter/narrative/fence
  delimiters. For UI highlighting, map it through the existing editor
  `sourceOffset`/`sourceTokenRange` convention: zero-based UTF-16 offsets with a
  half-open `[from, to)` `EditorRange`. This reuses the existing helper contract
  rather than adding source-range language semantics.
- Required-field and diagram-level validation failures point to the `diagram`
  keyword/name token. Element validation failures point to the offending
  element keyword/name, property name, literal/expression, or unknown property
  as listed below. Incomplete elements point to their element keyword/name.
- Invalid selected time points to the complete `time` declaration.
- When a bounds expression relates to a second declaration, a secondary
  location may point at that referenced declaration; it is not needed by the
  fixtures in this matrix.
- All candidate diagnostics stop the current report preparation/render. A
  failed initial evaluation emits no frame. A later-frame failure stops
  playback, clears the just-failed diagram's prior graphic (no stale frame),
  and announces an explicit source-located failure. No omission, blank
  placeholder, or success-shaped fallback is valid.

The field's primary start location is frozen to the cited line/column; the
diagnostic end position is exclusive. A UI selection uses the existing
zero-based half-open UTF-16 `EditorRange` produced by `sourceOffset` and
`sourceTokenRange` in `src/editor/sourceRanges.ts`. The runtime frame-error
protocol remains an implementation responsibility: it must stop and clear
the diagram and surface the allocated diagnostic/source through the
live-preview path rather than retain stale output.

## Fixture expectations

| Fixture | Failure category and expected result | Primary candidate source range | Secondary | Diagnostic identity / exact message |
|---|---|---|---|---|
| D-NEG-01 | Missing required title; reject diagram, no output. | Diagram declaration token `5:1` (`diagram bad`) | — | AMXD001 `Missing required field: title` |
| D-NEG-02 | Missing required accessible description; reject diagram. | Diagram declaration token `5:1` | — | AMXD001 `Missing required field: description` |
| D-NEG-03 | Title is not a String literal; reject declaration. | Title expression `6:10` (literal `7`) | — | Reuse AMX3002 |
| D-NEG-04 | Missing canvas width; reject diagram. | Diagram declaration token `5:1` | — | AMXD001 `Missing required field: width` |
| D-NEG-05 | Missing canvas height; reject diagram. | Diagram declaration token `5:1` | — | AMXD001 `Missing required field: height` |
| D-NEG-06 | Missing diagram-local time declaration; reject diagram. | Diagram declaration token `5:1` | — | AMXD001 `Missing required field: time` |
| D-NEG-07 | Width expression has non-Number type; reject. | Width expression `8:10` (string literal) | — | Reuse AMX3002 |
| D-NEG-08 | Unsupported primitive `path`; reject whole diagram. | `path route` token `11:3` | — | AMXD002 `Unknown diagram property` |
| D-NEG-09 | Unknown property `rotate`; reject element and diagram. | Property name `15:5` (`rotate`) | — | AMXD002 `Unknown diagram property` |
| D-NEG-10 | Canvas width is not positive; reject before layout. | Width literal `8:10` (`0`) | — | AMXD003 `Canvas width is invalid` |
| D-NEG-11 | Time interval is not strictly ordered; reject. | Complete time declaration `10:3` | — | AMXD004 `Invalid time bounds` |
| D-NEG-12 | Playback duration is not positive; reject. | Duration literal `10:31` (`0`) | — | AMXD005 `Invalid playback duration value` |
| D-NEG-13 | Dynamic `stroke` violates static-style rule; reject property. | Complete style expression `15:13` | — | AMXD006 `Inconsistent time style` |
| D-NEG-14 | Initial circle radius evaluates non-finite; reject frame/report. | Geometry expression `14:8` (`1 / 0`) | — | AMXD008 `Invalid primitive geometry` |
| D-NEG-15 | Radius is valid at t=0 but `sqrt` fails at t=2; stop and clear. | Geometry expression `14:8` (`sqrt(1 - t)`) | — | AMXD009 template; underlying AMX2005 `sqrt` error |
| D-NEG-16 | Diagram-local `t` escapes its diagram scope; reject reference. | Identifier `t` in `18:23` | Local time declaration `10:3` in the diagram | Reuse AMX3001 `Unknown identifier 't'` |
| D-NEG-17 | Canvas width expression evaluates non-finite; reject. | Width expression `8:10` (`1 / 0`) | — | AMXD003 `Canvas width is invalid` |
| D-NEG-18 | Timeline start evaluates non-finite; reject before frame evaluation. | Start expression `10:16` (`1 / 0`) | — | AMXD004 `Invalid time bounds` |
| D-NEG-19 | Rectangle width is not positive; reject element. | Width literal `14:12` (`-1`) | — | AMXD008 `Invalid primitive geometry` |
| D-NEG-20 | Required line endpoint `x2` is missing; reject element. | Incomplete element declaration `11:3` | — | AMXD001 `Missing required field: <field_name>` |
| D-NEG-21 | Arrow value is outside supported literal set; reject element. | Arrow literal `18:12` (`"sideways"`) | — | AMXD007 `Unsupported arrow literal` |
| D-NEG-22 | Initially finite radius becomes `Infinity` at t=2; stop and clear. | Geometry expression `14:8` (`1 / (2 - t)`) | — | AMXD010 `Infinity value calculated for time upper bound` |
| D-NEG-23 | Internal selected time outside interval; reject frame request, never clamp silently. | Time declaration `10:3` | — | AMXD004 `Invalid time bounds` |
| D-NEG-24 | Initial and upper-bound radii are finite; radius becomes `Infinity` at interior t=1; stop and clear. | Geometry expression `14:8` (`1 / ((t - 1) * (t - 1))`) | — | AMXD011 `Expression produces an infinite result` |

## Valid-fixture location anchors

The point locations below are included so a future parser/runtime test can tie
the candidate expressions to original-document ranges. They are not production
AST facts.

| Fixture | Declaration/time | Dynamic element/property examples |
|---|---|---|
| D-CRANK-01 | Diagram `13:1`; time `18:3` | `crank.x2` `49:9`; `crankPin.cy` `65:9`; `piston.x` `72:8`; dynamic label `timeLabel.value` `83:12` |
| D-BATTERY-01 | Diagram `11:1`; time `16:3` | `currentIndicator.x1` `99:9`; dynamic current label `currentLabel.value` `122:12` |

## Existing diagnostics and unresolved questions

- Existing standard `sqrt` of a negative argument raises AMX2005 and carries
  the argument-expression location. This is demonstrated by the isolated
  evaluator, but its use as a public diagram diagnostic, wrapper message, and
  current-frame stop behavior remain unapproved.
- The parser/formatter currently has no `diagram` grammar. Do not treat its
  generic unsupported-statement or syntax errors as the approved future
  diagnostic contract.
- The desktop live-preview RPC currently returns a single report-level error
  for preview rendering. There is no established per-diagram frame update
  diagnostic lifecycle. Sprint 080 needs a specific decision on how a runtime
  frame diagnostic is conveyed, labeled, and cleared.
- AMXD011 is specifically for D-NEG-24's interior non-finite frame; retain
  AMXD010 for the upper-bound case.
