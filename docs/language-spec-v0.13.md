# OpenAMX V0.13 Diagram Language Specification

V0.13 adds formula-driven 2D diagrams to the existing OpenAMX language. This
document describes the approved diagram contract additively; it does not replace
the [V0.12 specification](language-spec-v0.12.md), the
[V0.9 specification](language-spec-v0.9.md), or earlier language contracts.
The project overview and runnable examples are in the [README](../README.md).
V0.13 integrated acceptance and release status are tracked separately; this
specification does not claim milestone acceptance, publication, or platform
certification.

## 1. Compatibility and Source Rules

Existing AMX declarations, expressions, functions, imports, type checking, and
Markdown behavior remain in effect. A diagram is executable only when it is
inside an exact, case-sensitive `amx` fence. Ordinary Markdown and other code
fences remain inert. Declarations and imported names continue to follow the
existing source-order and visibility rules.

Diagram expressions use existing AMX values and pure functions. They do not
introduce implicit coercions, trigonometric functions, generated source, or a
second expression language. The diagram-local time identifier is available
only in element expressions; it is not in scope in the time bounds or duration,
or after the diagram.

## 2. Declaration and Timeline

The approved declaration outline is:

```ebnf
Diagram ::= "diagram" Identifier "{"
            "title:" StringLiteral
            "description:" StringLiteral
            "width:" NumberExpression
            "height:" NumberExpression
            "time" Identifier "from" NumberExpression
              "to" NumberExpression "duration" NumberExpression
            Element*
            "}"
Element ::= Line | Rectangle | Circle | Text
Line ::= "line" Identifier "{" X1 Y1 X2 Y2 StaticStyle Arrow? "}"
Rectangle ::= "rectangle" Identifier "{" X Y Width Height StaticStyle "}"
Circle ::= "circle" Identifier "{" CX CY Radius StaticStyle "}"
Text ::= "text" Identifier "{" X Y Value TextStyle "}"
Arrow ::= 'arrow: "none" | "start" | "end" | "both"'
```

This is an outline; the required/optional properties and their exact order are
listed in Section 3. A diagram is declared inline inside an executable AMX
block:

```amx
diagram mechanism {
  title: "Crank-slider mechanism"
  description: "A crank pin drives a piston through a connecting rod."
  width: 320
  height: 200
  time t from 0 to 2 duration 4
}
```

The shown comment is explanatory pseudocode; comments are not part of the
diagram grammar. Required diagram properties are `title`, `description`,
`width`, `height`, and exactly one `time` declaration. The title and
description are non-empty string literals. Canvas dimensions, time bounds,
and duration are Number expressions evaluated once in the surrounding
document scope. Width and height must be positive and finite; time bounds must
be finite with `from < to`; duration must be finite and positive.

The author chooses the diagram-local time identifier. It is a Number whose
value is evaluated directly at the selected time for each frame. Geometry and
labels can depend on that value and on existing surrounding values and pure
functions. Bounds and duration cannot depend on the local time. V0.13 adds no
stateful solver, numerical integration, accumulated simulation state, second
timeline, or reader-adjustable geometry.

## 3. Canvas, Elements, and Styling

Canvas coordinates are logical schematic units, not physical units or
engineering axes. The origin is at the bottom-left and positive Y points up.
Output scales responsively while preserving the declared aspect ratio.

The supported elements are:

| Element | Required properties | Optional properties |
| --- | --- | --- |
| `line name { ... }` | `x1`, `y1`, `x2`, `y2`, `stroke`, `lineWidth` | `arrow`, whose literal is `"none"`, `"start"`, `"end"`, or `"both"` |
| `rectangle name { ... }` | `x`, `y`, `width`, `height`, `stroke`, `lineWidth` | `fill` |
| `circle name { ... }` | `cx`, `cy`, `r`, `stroke`, `lineWidth` | `fill` |
| `text name { ... }` | `x`, `y`, `value`, `fill` | None |

Geometry is expressed with finite Numbers. Rectangle width and height, circle
radius, and line width must be positive. Text `value` is a String expression
and may vary with time. Static `stroke` and `fill` styles use `#RRGGBB`
literals or `none` where applicable. `lineWidth` is a positive finite literal;
it is not an expression. Styles do not animate. The order of elements is
preserved.

The canonical property order is `title`, `description`, `width`, `height`,
then `time`; for elements, use the required and optional properties in the
order shown in the approved grammar examples. Formatting uses two-space
indentation, one property per line, no semicolons, preserves element order,
and does not rewrite expression text. Formatting is canonical and idempotent.

## 4. Diagnostics and Source Locations

The diagram diagnostic identities and messages are allocated by the approved
[diagnostic matrix](../planning/sprints/0078-v13-diagram-contract-feasibility-gate/diagnostic-matrix.md).
The following messages are exact; diagnostic conditions retain their approved
source locations.

| Code | Message |
| --- | --- |
| AMXD001 | `Missing required field: <field_name>` |
| AMXD002 | `Unknown diagram property` |
| AMXD003 | `Canvas width is invalid` |
| AMXD004 | `Invalid time bounds` |
| AMXD005 | `Invalid playback duration value` |
| AMXD006 | `Inconsistent time style` |
| AMXD007 | `Unsupported arrow literal` |
| AMXD008 | `Invalid primitive geometry` |
| AMXD009 | `Frame evaluation leads to invalid results. The underlying error is: <base amx error>` |
| AMXD010 | `Infinity value calculated for time upper bound` |
| AMXD011 | `Expression produces an infinite result` |
| AMXD012 | `A single report can have up to 16 diagrams maximum.` |
| AMXD013 | `A single report can have up to 512 elements maximum.` |
| AMXD014 | `Canvas height is invalid` |
| AMXD015 | `Invalid diagram style specified` |

Existing AMX diagnostic identities are reused where approved. In particular,
AMX3001 reports an unknown diagram-local time name outside its scope, and
AMX3002 remains the existing type-mismatch diagnostic. AMXD009 wraps a thrown
base AMX evaluation error; AMXD010 and AMXD011 separately identify a
non-finite upper-bound result and a non-finite interior selected-time result.

Locations are measured against the complete original document, including
front matter, narrative, and executable-fence lines. Lines and columns are
1-based; columns count UTF-16 code units; diagnostic ends are exclusive.
Editors map these locations to zero-based, half-open ranges in the original
LF or CRLF source using the existing `sourceOffset` and `sourceTokenRange`
conventions. Incomplete constructs remain editable and report source-located
diagnostics under the existing parser/checker behavior; they are not silently
treated as valid.

## 5. Interactive HTML and Desktop Preview

Standalone HTML and desktop preview render the same validated diagram model.
Each diagram starts paused at its interval's lower bound; there is no autoplay.
The reader can play, pause, reset, scrub across the interval, and enable or
disable looping. Looping is off by default. Without looping, playback stops at
the upper bound and leaves the final frame visible; with looping, playback
restarts at the lower bound. The declared duration sets the wall-clock time for
one pass. Each diagram has independent playback controls.

Every frame is evaluated directly at its selected time. A frame evaluation
failure stops and clears that diagram and reports a source-located error; a
stale frame or success-looking blank fallback is not the error behavior.
Accessible names and keyboard-operable controls are part of the UI contract.
Manual screen-reader/assistive-technology review has not been completed, so no
screen-reader support claim is made.

Preview uses an application-owned evaluator and inert serialized model data.
It does not execute report-authored JavaScript, use `eval` or `new Function`,
or fetch remote resources. The desktop preview iframe retains its
least-privilege sandbox (`allow-scripts` without `allow-same-origin`).

## 6. Static PDF and DOCX

PDF and DOCX output contain a static frame evaluated at the diagram's lower
time bound; neither contains active playback controls. PDF embeds inline SVG.
DOCX embeds a PNG image and does not create editable native Word shapes.
Titles and descriptions remain visible in report order; DOCX also carries
image alternative-text metadata.

The inspected production PDF exposed visible, searchable title and description
text and source SVG title/description metadata, but had no tagged structure
tree or `/Alt`. Those facts do **not** establish tagged PDF, PDF/UA, or
screen-reader support. Formal PDF/UA and assistive-technology accessibility
are not claimed.

## 7. Limits and Explicit Exclusions

The approved authored-source limits are 16 diagrams per report and 512 total
semantic primitive declarations (`line`, `rectangle`, `circle`, and `text`)
per report. These count authored declarations across the report; repeated
runtime execution of a declaration does not increase the structural count.
For interactive preview, the approved constraints include a 1 MiB UTF-8 HTML
limit, 16.7 ms p95 frame-work limit, 8 MiB incremental heap limit, 2,000
whole-page DOM-node limit, and the existing 8,000,000-character fail-safe.
Output exceeding the HTML limit fails explicitly; it is not truncated.

Performance and resource qualification is limited to the recorded tested
workloads on one high-performance Windows host. Minimum-host, low-memory,
cross-platform, and broader high-emission behavior are not certified. The
existing evaluator's full AMX AST/value parity and high-rate evaluation also
remain residuals. These limits and evidence do not imply V0.13 end-to-end
acceptance.

V0.13 excludes 3D, axes or physical-coordinate modes, freeform paths and
polygons, engineering symbol libraries, dynamic styling, chart overlays,
extra timelines, reader-adjustable parameters, dragging, autoplay, and
stateful or numerical simulation. It adds no trigonometric standard-library
functions such as `sin` or `cos`. Release, publication, version changes,
platform certification, and integrated milestone closeout are outside this
language specification.

## 8. Runnable Examples

- [Formula-driven diagrams](../examples/08_Formula_Driven_Diagrams.amx)
- [Battery-resistor current indicator](../examples/14_Battery_Resistor_Circuit.amx)

Both examples use only the approved V0.13 constructs and existing AMX
expressions. The crank-slider uses `abs`, conditionals, `sqrt`, and arithmetic;
the battery example uses a constant `9 / 15 = 0.6 A` current while its
conventional-current arrow moves.
