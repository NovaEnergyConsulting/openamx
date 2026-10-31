# Sprint 113 Candidate Language Specification Addendum

## Status and Compatibility

This document is the content plan for the additive
`docs/language-spec-v0.18.md`; it is not itself a published language
specification. The final specification must identify the accepted S109-S112
behavior sources and remain consistent with their separate product-owner
dispositions. It must not rewrite V0.13 or any other historical contract.

V0.18 adds generated diagram content using existing AMX loop and conditional
forms. Existing diagrams with no controls retain their existing behavior.

## Candidate User-Language Contract

### Diagram Content

```ebnf
DiagramContent ::= DiagramElement | DiagramForBlock | DiagramIfBlock
DiagramForBlock ::= "for" Identifier "in" Expression "{" DiagramContent* "}"
DiagramIfBlock ::= "if" Expression "{" DiagramContent* "}"
                    ["else" "{" DiagramContent* "}"]
```

The grammar is schematic: exact expression and primitive productions remain
those of the existing AMX and V0.13 diagram specifications. Diagram bodies
may contain primitive declarations, loops, and conditional blocks only; they
do not accept arbitrary AMX statements, effects, or declarations.

### Evaluation, Ordering, and Animation

- Evaluate each diagram's control content when its scene model is created.
  Evaluate a loop iterable when entering that loop. Evaluate a condition
  when its control is reached, including once per loop traversal visit if
  nested in a loop.
- Expand selected content depth-first in source order. Loop iterations use
  existing AMX iterable order. Empty iterables and unselected branches emit
  no primitives.
- A model's ordered primitive membership remains fixed across its frames.
  Recreating the model may produce different membership when non-time inputs
  differ.
- Primitive properties are evaluated for each frame. A generated primitive
  observes its captured iterator value and the requested timeline value.
- The diagram time identifier must not appear in a loop iterable or branch
  condition (`AMXD6001`). It may be used in supported primitive properties.
- Conditional blocks may occur within loops, and loops may occur in
  conditional branches. A loop may not be nested within another loop at any
  depth; the inner loop is rejected at parse time with the accepted
  `AMX3006` diagnostic.

### Generated Identity and Limits

- Generated instances have internal identities for evaluation and rendering
  only. AMX source cannot name, reference, or address an individual generated
  instance; repeated loop emissions from one primitive declaration do not
  create a language-level name contract.
- A diagram may emit at most 64 primitives originating from diagram control
  blocks. Direct top-level primitives do not consume this cap. The 65th
  control-originating output fails during model creation with
  `AMXD6004: Number of elements in this diagram exceed the maximum (64)` at
  the authored primitive declaration responsible for the excess output.
- The separate existing limit of 512 authored primitive declarations per
  report remains enforced once per authored declaration with `AMXD013`.
  Control-block repetitions do not change authored declaration count.
- The 64-output cap does not bound loop iteration count, CPU time, or memory;
  D111-02 remains a recorded residual. Do not state that evaluation is
  bounded solely because the emission cap exists.

### Rendering

- Standalone HTML is interactive and starts at the lower time bound. Its
  model payload retains fixed membership while frame properties can animate.
- PDF and DOCX exports use a static lower-bound frame; PDF uses SVG and DOCX
  uses a raster image, not editable Word shapes.
- There is no separate static HTML diagram renderer. Do not repeat S109's
  synthetic browser-only output as static HTML behavior.
- State output-size policy as currently implemented only if S112 disposition
  accepts the related evidence. Do not claim that the historical V0.13 1 MiB
  statement and current renderer's 100 MiB enforcement have been reconciled;
  that discrepancy remains unchanged.

## Diagnostic Table Requirements

The published S113 specification should use the following exact allocated
identities after verifying S112's separate disposition:

| Condition | Diagnostic |
| --- | --- |
| Diagram time identifier used in a loop iterable or branch condition | `AMXD6001: Variable [<time-name>] is already used to control the diagrams timeline. Use a different variable name.` |
| Nested diagram loop | `AMX3006: No nested loops are allowed inside a diagram` |
| 65th control-originating primitive emission | `AMXD6004: Number of elements in this diagram exceed the maximum (64)` |
| Existing authored declarations exceed 512 per report | `AMXD013: A single report can have up to 512 elements maximum.` |

Other iterable, Boolean-condition, primitive/property, and frame diagnostics
reuse the exact existing meanings documented in V0.13 and S110-S112 evidence.
Do not present internal serializer-envelope failures as language diagnostics.

## Spec Cross-Check

Before publication within S113, compare the draft against:

- `docs/language-spec-v0.13.md` for primitive grammar, properties, timeline,
  rendering, limits, and existing diagnostics.
- S109 accepted contract for ordering, timing, nesting, `t`, identity, and
  cap accounting.
- S110 accepted AST/checker evidence for syntax, `AMXD6001`, nested-loop
  parsing, source locations, and authored-element accounting.
- S111 accepted runtime evidence for `AMXD6004`, in-process expansion, and
  the D111-02 residual.
- S112 accepted product-owner disposition for versioned serialization,
  standalone browser playback, static PDF/DOCX, and the absence of a static
  HTML diagram path. Until S112 is dispositioned, mark these as pending and
  do not publish them as accepted claims.