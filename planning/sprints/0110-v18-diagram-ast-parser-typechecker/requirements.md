# Sprint 110 Requirements: V0.18 Diagram AST, Parser, and Typechecker

## Document Status and Entry Gate

Architect-prepared planning documentation. Sprint 109 was separately
ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-10-30. Its accepted decisions
are the V0.18 behavior authority; its residuals remain explicit gates.

This package authorizes planning only. Obtain separate Sprint 110 execution
authorization and approval of the concrete file-by-file implementation and
verification plan before editing source or tests.

Before implementation of affected diagnostic behavior, the Lead Developer
must allocate the shared new diagnostic identity/message for `t` in diagram
controls, confirm the nested-loop parse diagnostic message and source anchor
within the existing `AMX3006` family, and decide the source anchor/message
for nested-loop parse rejection. Allocate the distinct cap-overflow
diagnostic identity/message/anchor before Sprint 111 implements expansion.
Do not guess identities or reuse `AMXD013`.

The AST transition must also have an approved boundary with existing flat
`diagram.elements` consumers. Parser/checker acceptance must not cause
control-block content to be silently rendered as an unconditional flat list.
If the boundary cannot be made safe within the approved Sprint 110 files,
stop for a file-plan amendment or a coordinated Sprint 111 implementation
decision.

## Goal

Represent diagram bodies as ordered recursive content; parse the approved
diagram-local `for` and braced `if`/`else` forms; statically validate control
expressions, scoped iterator bindings, `t` restrictions, and primitive
properties; and format the recursive syntax. Preserve existing static
diagrams, source locations, diagnostics, and the separate authored-element
limit.

Sprint 110 does not evaluate loops/branches, expand primitive instances,
capture per-instance frame environments, apply the generated-element cap, or
change rendering. Those behaviors belong to Sprint 111 and later. No release
or publication follows from this sprint.

## Accepted Sprint 109 Decisions

- The generated-output cap is 64 control-block-originating primitives per
  evaluated diagram. This runtime cap is not implemented in Sprint 110.
- Only primitives emitted from diagram control blocks count toward that cap.
  Direct authored primitives do not consume it.
- The existing 512 authored-element/report limit remains separate and keeps
  its current accounting and `AMXD013` diagnostic. Count each authored
  primitive declaration once, irrespective of branch selection or runtime
  loop repetitions; verify report/module aggregation remains consistent.
- Diagram controls use existing iterable and conditional semantics. For
  controls may nest in conditional branches and conditionals may nest in
  loops, but a `for` may not occur anywhere within another `for`.
- Branch selection and iterable membership are fixed at model creation;
  primitive property expressions may use the diagram time variable `t`.
  `t` is prohibited in a loop iterable or branch condition.
- Generated instances receive internal identities only; there are no new
  source-level names or references.
- D109-04 diagnostic work is an accepted residual with the Lead Developer as
  allocator. See `diagnostics-and-gates.md` for exact blockers and permitted
  reuse of existing diagnostics.

## In Scope

- Add a diagram-specific discriminated recursive content model for primitive
  declarations, `for` blocks, and conditional branches, preserving content
  order and source locations for headers, expressions, block delimiters,
  primitives, and properties.
- Extend `parseDiagramDeclaration` to parse only the approved content forms,
  reuse existing expression parsing, support both permitted control-nesting
  directions, and reject nested loops at parse time, including through
  intervening conditionals.
- Reject malformed or unsupported diagram content with the confirmed parse
  error family and approved message/anchor after Lead Developer confirmation.
- Extend `checkDiagram` for loop iterable types, Boolean conditions, scoped
  iterator bindings, all primitive/property constraints, `t` prohibition in
  controls, and source-grounded diagnostics.
- Preserve diagram-level properties, timeline checks, name rules, the
  16-diagram report limit, and the separate 512 authored-element/report rule.
- Format recursive content in source order using canonical indentation and
  existing primitive property ordering.
- Add parser, checker, formatter, compatibility, and source-location tests
  mapped to `parser-checker-test-matrix.md`.

## Out of Scope

- Runtime control evaluation, model expansion, per-instance bindings,
  generated identity behavior, generated cap enforcement, frame evaluation,
  serialization changes, browser/static rendering, and HTML policy changes.
- Editor completion/highlighting/navigation redesign, VS Code grammar,
  desktop editor support, published language specification, README, example,
  release, package/version changes, and certification.
- Nested `for` loops, `t` in controls, new primitive kinds, generic AMX
  statements/effects in diagrams, source-level generated-instance addressing,
  or changes to diagram geometry/style semantics.
- Changes to the 512 authored-element limit, its report/module aggregation,
  `AMXD013`, or the 16-diagram limit.
- Changes to historical specifications or prior sprint evidence.

## Downstream Boundary

Sprints 111-114 remain separately gated. Sprint 111 owns evaluation-time
expansion and cap enforcement; Sprint 112 owns production per-instance frame
binding and serialization; Sprint 113 owns editor/spec/example integration;
Sprint 114 owns integrated acceptance. The intermediate S110 branch is not
release-ready and must not claim generated diagram output works end to end.