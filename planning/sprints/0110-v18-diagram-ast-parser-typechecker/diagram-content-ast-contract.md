# Sprint 110 Candidate AST and Static-Checking Contract

## Status

This is the implementation contract proposed for Sprint 110. Confirmed
behavior comes from the V0.18 master plan and accepted Sprint 109 decisions.
Concrete TypeScript names may follow local conventions, but the discriminants,
ordering, and location guarantees below are required. No runtime expansion is
implemented here.

## Recursive Content Shape

Represent the diagram body as an ordered recursive sequence with exactly
these content forms:

- A primitive declaration node, reusing the existing primitive kind, name,
  properties, expressions, and source locations.
- A `for` block node containing the iterator identifier and location, parsed
  iterable expression and location, ordered child content, and opening,
  closing, and whole-block source locations.
- An `if` block node containing the parsed Boolean condition and location,
  ordered consequent content, optional ordered alternate content, and the
  source locations for both branches and delimiters.

The recursive content sequence is authoritative for source order and checker
traversal. Do not represent diagram controls as general `StatementNode`
values or invent an expression-form loop in diagrams. Do not assign AMX names
or references to generated instances.

## Parsing Rules

- Reuse existing expression parsing and the established AMX syntax:
  `for item in iterable { ... }` and braced `if`/`else`.
- Primitive declarations remain valid wherever diagram content is allowed.
- A conditional may contain a loop; a loop may contain conditionals.
- A loop may not contain another loop at any depth, including through one or
  more conditional branches. Reject during parsing at the inner `for` token.
- Unknown or unsupported diagram-body content is a syntax error, not a
  diagram property fallback.
- Preserve source order exactly; a formatter or checker must not sort
  content.
- Preserve full-document source mapping, including indentation, nested
  blocks, line endings, and UTF-16 column behavior.

## Static-Checking Rules

- Use existing iterable semantics and diagnostics. Lists and ranges are
  accepted according to the existing checker; semantically matching errors
  retain `AMX3003`/`AMX3007`.
- Require a Boolean condition using the existing `AMX3002` type-mismatch
  behavior.
- Iterator variables are scoped to their loop body. Restore a shadowed outer
  binding after checking the body; an iterator binding does not escape.
- A condition or iterable may refer to other in-scope bindings but may not
  refer to the diagram time variable `t`. Use the one newly allocated shared
  diagnostic for both prohibited control uses, anchored on the `t`
  identifier.
- Primitive property validation is identical in direct and nested content.
  `t` remains allowed in supported primitive property expressions; style and
  literal restrictions remain unchanged.
- Each syntactically authored primitive declaration is validated and counted
  exactly once toward the existing 512-authored-elements-per-report rule,
  regardless of control reachability. Imported-module aggregation remains
  intact. Runtime expansion count is not a typechecker calculation.
- Preserve the separate 16-diagram/report limit, existing duplicate/name
  rules, and all current static-diagram diagnostics.

## AST Compatibility Decision D110-01

Current consumers rely on `DiagramDeclarationNode.elements`: checker,
formatter, module loader, runtime model evaluation, and editor services.
Before edits, record which transition strategy is approved:

1. Add canonical recursive content and a narrowly defined legacy projection
   for consumers that cannot yet migrate; document exactly which consumers
   use the projection and prevent runtime from treating control content as
   unconditional output.
2. Migrate selected consumers to recursive content now, with runtime/editor
   semantic changes explicitly excluded and their affected surfaces gated.

Do not keep two independently mutable representations. If a projection is
used, derive it deterministically from the recursive tree and define whether
it includes primitives nested in control blocks. The old runtime's flat
mapping must not be allowed to create misleading output for a control-bearing
diagram. Resolve the fail-closed or sequencing mechanism in the approved
file plan. If it requires product behavior beyond S110, stop and request a
scope amendment rather than silently dropping controls.

## Explicit Non-Goals

- Do not evaluate iterable or condition values, choose branches, expand
  instances, enforce the accepted 64 cap, retain runtime loop environments,
  or change frame membership.
- Do not allocate generated identities visible to AMX.
- Do not change primitive geometry/style rules, existing authored limits,
  output size policies, or renderer APIs.
- Do not claim that a parser/checker pass proves runtime, browser, or static
  export behavior.