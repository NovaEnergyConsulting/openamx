# V0.13 Diagram Grammar and Examples

**Contract status: GRAMMAR APPROVED FOR V0.13 BY THE LEAD DEVELOPER
(2026-10-12); NOT YET IMPLEMENTED.**
The V0.13 master plan remains the scope authority. The approved grammar is
adequate for the current version and may be extended in a later version. The
two valid fixtures are also the exact source inputs used by the isolated probe
models; they are not yet accepted by the production parser.

## Approved declaration contract for V0.13

The candidate emits inline where it is declared inside an executable `amx`
fence. It does not use `show`. Names are document-unique identifiers.

```ebnf
Diagram       ::= "diagram" Identifier "{"
                  Title Description Width Height Time Element*
                  "}"
Title         ::= "title:" StringLiteral
Description   ::= "description:" StringLiteral
Width         ::= "width:" NumberExpression
Height        ::= "height:" NumberExpression
Time          ::= "time" Identifier "from" NumberExpression
                  "to" NumberExpression "duration" NumberExpression
Element       ::= Line | Rectangle | Circle | Text
Line          ::= "line" Identifier "{" X1 Y1 X2 Y2 StaticStyle Arrow? "}"
Rectangle     ::= "rectangle" Identifier "{"
                  X Y Width Height StaticStyle "}"
Circle        ::= "circle" Identifier "{" CX CY Radius StaticStyle "}"
Text          ::= "text" Identifier "{" X Y Value TextStyle "}"
StaticStyle   ::= Stroke Fill? LineWidth
TextStyle     ::= Fill
Arrow         ::= 'arrow: "none" | "start" | "end" | "both"'
```

This is intentionally an outline, not a parser grammar. The proposed property
spelling and order are:

| Construct | Required properties | Optional properties | Rule |
|---|---|---|---|
| Diagram | `title`, `description`, `width`, `height`, one `time` declaration | None | Title/description are non-empty string literals; size/time values are Number expressions. |
| Time | Author-chosen local identifier, `from`, `to`, `duration` | None | Bounds are evaluated once in document scope; require finite `from < to`; duration is finite and positive. Local `t` is a Number and is in scope only in elements, not its own declaration or after the diagram. |
| Line | `x1`, `y1`, `x2`, `y2`, `stroke`, `lineWidth` | `arrow`, `fill` is not applicable | Coordinates are finite Numbers each frame. `arrow` is a static literal from `none`, `start`, `end`, `both`. |
| Rectangle | `x`, `y`, `width`, `height`, `stroke`, `lineWidth` | `fill` | Coordinates/dimensions are finite Numbers; dimensions are positive. |
| Circle | `cx`, `cy`, `r`, `stroke`, `lineWidth` | `fill` | Coordinates/radius are finite Numbers; radius is positive. |
| Text | `x`, `y`, `value`, `fill` | None | `value` is a String expression and may vary with local time. |
| Static styles | `stroke`, `fill`, `lineWidth` | `arrow` for lines | `stroke`/`fill` are literals in `#RRGGBB` form or `none` where applicable; `lineWidth` is a positive finite literal. Styling cannot depend on time. |

The block and property order shown above is the approved V0.13 canonical order.
Element source order is preserved. The formatter expectation is two-space
indentation, one property per line, no semicolons, one closing brace per nested
block, and no rewriting of expression text. Production formatter support is
still future implementation work; this approval does not change the current
formatter.

Canvas coordinates are logical schematic units, with bottom-left origin and
positive Y upward. Output scales responsively and keeps the declared aspect
ratio. Geometry and text expressions can use surrounding AMX Number/String
values and pure functions plus the local time value. Bounds and duration are
evaluated once in surrounding document context. Each frame is evaluated
directly at its selected time; no accumulated simulation state is introduced.

### Lead Developer scope clarifications (2026-10-12)

- Both required depictions are approved as written. Non-uniform angular
  velocity in `D-CRANK-01` is a consequence of its equations; the diagram
  author is responsible for correctly defining the variables and their
  relationships. No trigonometric standard-library function is authorized.
- The battery example's constant 0.6 A and moving conventional-current arrow
  satisfy the confirmed scope. The indicator position varies; the current
  magnitude need not vary.
- The approved grammar is adequate for V0.13. Future grammar expansion belongs
  to a later project version and does not expand Sprint 078.
- Diagnostic code/message mappings are listed in `diagnostic-matrix.md`.
  AMXD009 applies when a frame evaluation carries a base AMX error; AMXD010
  covers non-finite geometry at the upper bound, and AMXD011 covers a
  non-finite result at an interior selected time.
  Full existing-AMX context transport remains implementation evidence; this
  grammar approval does not narrow that scope.

## Valid contract fixtures

The outer four-backtick fence below is documentation only. Each fixture is the
complete inner document, including front matter, narrative, and the executable
fence. Source coordinates in the matrices are relative to that inner document:
line and column are 1-based; columns and offsets count UTF-16 code units;
diagnostic end positions are exclusive. Thus front matter and the inner
` ```amx ` delimiters count, while this Markdown wrapper does not.

### D-CRANK-01 — crank-slider

This exact document is the crank-slider probe input. The crank pin follows a
full circular path through a non-uniform time parameterization; the connecting
rod remains fixed length and drives the slider.

````amx-source
---
title: Crank-slider feasibility fixture
---
# Crank-slider

```amx
let crankRadius: Number = 34
let rodLength: Number = 105
let pivotX: Number = 70
fn crankX(t: Number, r: Number): Number = r * (1 - 2 * abs(t - 1))
fn crankY(t: Number, r: Number): Number = if t <= 1 then sqrt(r * r - crankX(t, r) * crankX(t, r)) else -sqrt(r * r - crankX(t, r) * crankX(t, r))
fn sliderX(t: Number, pivot: Number, r: Number, rod: Number): Number = pivot + crankX(t, r) + sqrt(rod * rod - crankY(t, r) * crankY(t, r))
diagram crankSlider {
  title: "Crank-slider mechanism"
  description: "A crank pin follows one full circular path and drives a piston through a fixed-length connecting rod."
  width: 320
  height: 200
  time t from 0 to 2 duration 4
  line lowerGuide {
    x1: 115
    y1: 88
    x2: 260
    y2: 88
    stroke: "#52616B"
    lineWidth: 2
    arrow: "none"
  }
  line upperGuide {
    x1: 115
    y1: 112
    x2: 260
    y2: 112
    stroke: "#52616B"
    lineWidth: 2
    arrow: "none"
  }
  line connectingRod {
    x1: pivotX + crankX(t, crankRadius)
    y1: 100 + crankY(t, crankRadius)
    x2: sliderX(t, pivotX, crankRadius, rodLength)
    y2: 100
    stroke: "#D07A32"
    lineWidth: 5
    arrow: "none"
  }
  line crank {
    x1: pivotX
    y1: 100
    x2: pivotX + crankX(t, crankRadius)
    y2: 100 + crankY(t, crankRadius)
    stroke: "#6950A1"
    lineWidth: 4
    arrow: "none"
  }
  circle pivot {
    cx: pivotX
    cy: 100
    r: 7
    stroke: "#263238"
    fill: "#FFFFFF"
    lineWidth: 2
  }
  circle crankPin {
    cx: pivotX + crankX(t, crankRadius)
    cy: 100 + crankY(t, crankRadius)
    r: 6
    stroke: "#263238"
    fill: "#F3B64B"
    lineWidth: 2
  }
  rectangle piston {
    x: sliderX(t, pivotX, crankRadius, rodLength) - 12
    y: 90
    width: 24
    height: 20
    stroke: "#263238"
    fill: "#DCE8F0"
    lineWidth: 2
  }
  text timeLabel {
    x: 18
    y: 24
    value: "t = ${round(t, 2)} s"
    fill: "#263238"
  }
}
```
````

### D-BATTERY-01 — battery-resistor DC circuit

This exact document is the battery-resistor probe input. The battery/resistor
current is constant at `9 / 15 = 0.6 A`; a short arrow moves along the upper
wire to indicate conventional-current direction.

````amx-source
---
title: Battery-resistor feasibility fixture
---
# Battery-resistor circuit

```amx
let supplyVoltage: Number = 9
let resistance: Number = 15
let current: Number = supplyVoltage / resistance
fn indicatorX(t: Number): Number = 58 + 25 * t
diagram batteryResistor {
  title: "Battery-resistor DC circuit"
  description: "A 9 volt battery drives a 15 ohm resistor; the arrow travels clockwise to indicate conventional current."
  width: 320
  height: 200
  time t from 0 to 4 duration 4
  line upperLeftWire {
    x1: 50
    y1: 130
    x2: 188
    y2: 130
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line upperRightWire {
    x1: 218
    y1: 130
    x2: 250
    y2: 130
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line leftUpperWire {
    x1: 50
    y1: 130
    x2: 50
    y2: 98
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line leftLowerWire {
    x1: 50
    y1: 68
    x2: 50
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line rightWire {
    x1: 250
    y1: 130
    x2: 250
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line lowerWire {
    x1: 250
    y1: 50
    x2: 50
    y2: 50
    stroke: "#52616B"
    lineWidth: 3
    arrow: "none"
  }
  line positivePlate {
    x1: 39
    y1: 92
    x2: 61
    y2: 92
    stroke: "#263238"
    lineWidth: 4
    arrow: "none"
  }
  line negativePlate {
    x1: 43
    y1: 74
    x2: 57
    y2: 74
    stroke: "#263238"
    lineWidth: 3
    arrow: "none"
  }
  rectangle resistor {
    x: 188
    y: 118
    width: 30
    height: 24
    stroke: "#263238"
    fill: "#FFF5E6"
    lineWidth: 2
  }
  line currentIndicator {
    x1: indicatorX(t)
    y1: 130
    x2: indicatorX(t) + 14
    y2: 130
    stroke: "#D04A3A"
    lineWidth: 4
    arrow: "end"
  }
  text voltageLabel {
    x: 20
    y: 24
    value: "9 V"
    fill: "#263238"
  }
  text resistanceLabel {
    x: 180
    y: 156
    value: "15 ohm"
    fill: "#263238"
  }
  text currentLabel {
    x: 88
    y: 154
    value: "I = ${round(current, 2)} A"
    fill: "#263238"
  }
}
```
````

## Invalid contract fixtures

Each item is a separate full document. Expected behavior is to stop model
creation/rendering with a source-located failure; do not omit the diagram,
reuse a stale frame, or substitute a blank/placeholder success. The exact
diagnostic identities/messages are allocated in `diagnostic-matrix.md`; the
AMXD009 non-finite-frame placeholder remains unresolved.

### D-NEG-01 — missing title

````amx-source
---
title: D-NEG-01
---
```amx
diagram bad {
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-02 — missing description

````amx-source
---
title: D-NEG-02
---
```amx
diagram bad {
  title: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-03 — title has the wrong type

````amx-source
---
title: D-NEG-03
---
```amx
diagram bad {
  title: 7
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-04 — missing width

````amx-source
---
title: D-NEG-04
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-05 — missing height

````amx-source
---
title: D-NEG-05
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-06 — missing time declaration

````amx-source
---
title: D-NEG-06
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-07 — width has the wrong type

````amx-source
---
title: D-NEG-07
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: "wide"
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-08 — unsupported element

````amx-source
---
title: D-NEG-08
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  path route {
    points: "unsupported"
  }
}
```
````

### D-NEG-09 — unsupported property

````amx-source
---
title: D-NEG-09
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  circle point {
    cx: 10
    cy: 10
    r: 5
    rotate: 30
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-10 — non-positive canvas dimension

````amx-source
---
title: D-NEG-10
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 0
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-11 — unordered time bounds

````amx-source
---
title: D-NEG-11
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 1 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-12 — zero playback duration

````amx-source
---
title: D-NEG-12
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 0
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-13 — time-varying style

````amx-source
---
title: D-NEG-13
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  circle point {
    cx: 10
    cy: 10
    r: 5
    stroke: if t < 0.5 then "#263238" else "#D04A3A"
    lineWidth: 1
  }
}
```
````

### D-NEG-14 — non-finite initial geometry

````amx-source
---
title: D-NEG-14
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  circle point {
    cx: 10
    cy: 10
    r: 1 / 0
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-15 — geometry becomes invalid after the initial frame

````amx-source
---
title: D-NEG-15
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 2 duration 2
  circle point {
    cx: 10
    cy: 10
    r: sqrt(1 - t)
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-16 — diagram-local time escapes its scope

````amx-source
---
title: D-NEG-16
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "inside"
    fill: "#263238"
  }
}
let escaped: Number = t
```
````

### D-NEG-17 — non-finite canvas width

````amx-source
---
title: D-NEG-17
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 1 / 0
  height: 100
  time t from 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-18 — non-finite timeline start

````amx-source
---
title: D-NEG-18
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 1 / 0 to 1 duration 1
  text label {
    x: 10
    y: 10
    value: "bad"
    fill: "#263238"
  }
}
```
````

### D-NEG-19 — non-positive rectangle dimension

````amx-source
---
title: D-NEG-19
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  rectangle badSize {
    x: 10
    y: 10
    width: -1
    height: 10
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-20 — missing required line endpoint

````amx-source
---
title: D-NEG-20
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  line incomplete {
    x1: 10
    y1: 10
    y2: 20
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-21 — unsupported arrow value

````amx-source
---
title: D-NEG-21
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  line incomplete {
    x1: 10
    y1: 10
    x2: 20
    y2: 20
    stroke: "#263238"
    lineWidth: 1
    arrow: "sideways"
  }
}
```
````

### D-NEG-22 — later non-finite geometry

````amx-source
---
title: D-NEG-22
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 2 duration 2
  circle point {
    cx: 10
    cy: 10
    r: 1 / (2 - t)
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-23 — selected time is outside the declared interval

The candidate reader control is bounded to the declared interval; any internal
or corrupted request outside it must fail at the `time` declaration before
rendering a frame.

````amx-source
---
title: D-NEG-23
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 1 duration 1
  circle point {
    cx: t
    cy: 10
    r: 5
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````

### D-NEG-24 — non-finite geometry at an interior selected time

This differs from D-NEG-22: the initial and upper-bound frames are finite,
while an interior selected time makes the geometry non-finite.

````amx-source
---
title: D-NEG-24
---
```amx
diagram bad {
  title: "Invalid"
  description: "Invalid"
  width: 100
  height: 100
  time t from 0 to 2 duration 2
  circle point {
    cx: 10
    cy: 10
    r: 1 / ((t - 1) * (t - 1))
    stroke: "#263238"
    lineWidth: 1
  }
}
```
````
