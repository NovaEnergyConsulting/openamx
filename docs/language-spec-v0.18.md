# OpenAMX V0.18 Diagram Content Generation

V0.18 adds loop- and conditional-generated primitives to formula-driven
diagrams. This specification is additive; it does not replace the
[V0.16 specification](language-spec-v0.16.md), the
[V0.14 specification](language-spec-v0.14.md), the
[V0.13 diagram specification](language-spec-v0.13.md), or earlier language
contracts. See the [project README](../README.md) and the runnable
[Formula-Driven Diagrams lesson](../examples/08_Formula_Driven_Diagrams.amx).
S109-S112 contracts were accepted by separate product-owner dispositions.
S112 was accepted with recorded residuals; this specification does not claim
native WebView2 or cross-platform certification, release, or publication.

## 1. Diagram Content

Diagram bodies accept the existing primitive declarations, diagram-local
`for` blocks, and braced `if`/`else` blocks:

```ebnf
DiagramContent ::= DiagramElement | DiagramForBlock | DiagramIfBlock
DiagramForBlock ::= "for" Identifier "in" Expression "{" DiagramContent* "}"
DiagramIfBlock ::= "if" Expression "{" DiagramContent* "}"
                   ["else" "{" DiagramContent* "}"]
```

This outline reuses the AMX expression, iterable, conditional, and primitive
property rules. Diagram bodies do not accept arbitrary AMX statements,
effects, or declarations. Existing diagrams without control blocks retain
their existing behavior.

## 2. Expansion, Ordering, and Animation

- Evaluate each diagram's controls while creating its model. Evaluate a loop
  iterable when entering that loop. Evaluate a condition when reached; a
  condition nested in a loop is evaluated once for each iteration that
  reaches it.
- Expand selected content depth-first in source order. Loop iterations follow
  the existing iterable order. Empty iterables and unselected branches emit
  no primitives.
- A model's ordered primitive membership stays fixed across its frames.
  Creating a new model may produce different membership when non-time inputs
  differ.
- Primitive properties are evaluated for each requested frame. A generated
  primitive uses its captured iterator value together with the requested
  timeline value.
- The diagram time identifier (normally `t`) is prohibited in loop iterables
  and conditional controls. It remains available in supported primitive
  property expressions.
- Conditional blocks may be nested in loops and loops may be nested in
  conditional branches. A `for` loop may not be nested within another `for`
  loop, including through an intervening conditional.

Formatting preserves source order, uses the established two-space block
indentation, and is idempotent.

## 3. Names, Identity, and Scope

Iterator variables are scoped to their loop and do not escape it. A loop
binding is restored after the block, including when it shadows an existing
binding. A loop iterator may not use the diagram time identifier.

Generated primitives have internal identities for evaluation and rendering
only. Repeated emissions from one authored declaration do not create unique
source names. AMX has no syntax or public editor contract for naming,
referencing, navigating to, completing, or renaming an individual generated
instance. Existing authored declaration names and source locations continue
to identify the declaration in source.

## 4. Limits and Diagnostics

At most 64 primitives originating from diagram control blocks may be emitted
per evaluated diagram. Direct top-level primitives outside control blocks do
not consume this generated-output cap. Each repeated loop emission counts
separately. The 65th control-originating emission fails before it is appended
or evaluated.

The separate authored-source limit remains 512 primitive declarations per
report. Each authored declaration counts once, regardless of branch
selection or loop repetition. The existing `AMXD013` rule is not reused for
generated output.

| Condition | Diagnostic |
| --- | --- |
| Timeline identifier used in a loop iterable or conditional control | `AMXD6001: Variable [<time-name>] is already used to control the diagrams timeline. Use a different variable name.` |
| Loop iterator uses the timeline identifier | `AMXD6001: Variable [<time-name>] is already used to control the diagrams timeline. Use a different variable name.` |
| Nested diagram loop | `AMX3006: No nested loops are allowed inside a diagram` |
| 65th control-originating primitive emission | `AMXD6004: Number of elements in this diagram exceed the maximum (64)` |
| More than 512 authored primitive declarations per report | `AMXD013: A single report can have up to 512 elements maximum.` |

Other iterable, condition, primitive, property, and frame diagnostics retain
their existing meanings and source-location behavior. The 64-output cap does
not bound loop iterations, condition evaluations, CPU time, or memory;
potentially unbounded work remains an explicit residual (D111-02). No
iteration limit or output truncation is defined here.

## 5. Interactive and Static Output

Standalone HTML remains interactive and starts at the lower time bound. Its
model keeps generated membership fixed while frame-dependent properties
animate. PDF uses SVG and DOCX uses a raster PNG for the static lower-bound
frame; DOCX diagrams are not editable Word shapes. There is no separate
static-HTML diagram renderer.

S112 preserved versioned scene-model serialization for generated membership
and supported iterator bindings. That serialization envelope is an internal
format, not a source-level identity or addressing contract. The S112
standalone-browser and static-export evidence was accepted with recorded
residuals: the Vite preview bridge was intermittent, native WebView2 was
skipped, and cross-platform checks were not run.

The V0.13 specification documents a 1 MiB interactive-HTML limit, while the
current renderer enforces 100 MiB. The S112 measured workload was below both
values; the discrepancy was not reconciled and neither policy changes here.

## 6. Compatibility and Exclusions

Diagrams without controls preserve existing membership, ordering, animation,
and output behavior. V0.18 does not add primitive kinds, property semantics,
arbitrary statements, side effects, generated source names, or changes to
output-size policy. It does not claim that a generated-output cap bounds
evaluation work. Release, publication, package/version changes, integrated
V0.18 closeout, and platform certification remain separately gated.

## 7. Runnable Example

- [Formula-Driven Diagrams](../examples/08_Formula_Driven_Diagrams.amx)
