# Sprint 110 Acceptance Criteria

Sprint 110 is complete only when its recursive diagram AST, parser, static
checker, and formatter satisfy the accepted V0.18 contract, source locations
and existing limits remain stable, the AST/runtime staging boundary is safe,
and a separate product-owner disposition is recorded. Sprint 110 does not
implement generated output evaluation.

## Entry and Scope

- Sprint 109 is verified ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-10-30. The accepted cap is 64 control-block-originating primitives
  per evaluated diagram.
- The Lead Developer's `t` diagnostic allocation and nested-loop
  `AMX3006` message/anchor confirmation are recorded before affected
  implementation work. The separate cap-overflow diagnostic is allocated
  before S111.
- D110-01 AST/runtime staging strategy is explicit and tested; no control
  content is silently flattened into unconditional runtime output or silently
  dropped.
- Only separately approved S110 files and outputs are changed. Runtime
  expansion, editor integration, published specification, examples, release,
  and version work remain out of scope.

## AST, Parser, and Checker

- Diagram content is represented as an ordered recursive union of primitives,
  `for` blocks, and conditional branches with complete source locations.
- Valid primitive/loop/conditional syntax parses with the confirmed nesting
  directions. A `for` nested within any outer `for`, including through an
  `if`, fails at the inner loop token during parsing.
- Invalid/unsupported diagram body content produces approved typed syntax
  diagnostics, not property fallback or plain untyped errors.
- Iterable, condition, loop-variable, primitive/property, `t`, name, and
  limit checks are covered by the focused matrix and exact diagnostics.
- The existing `AMX3001/2/3/7`, `AMXD013`, 512-authored report accounting,
  16-diagram limit, and imported-module aggregation are preserved where
  semantically applicable.
- Each authored primitive nested in controls is counted once statically;
  no runtime iteration or branch reachability affects authored accounting.

## Formatter, Compatibility, and Verification

- Recursive formatting preserves source order, canonical indentation, and
  existing primitive property order. Parse-format-parse preserves the
  recursive tree and expressions.
- Existing diagrams without controls retain their prior parse/check/format
  behavior.
- Exact source locations are checked in complete AMX documents for LF and
  CRLF, including UTF-16 columns and fenced-document offsets.
- The focused parser, checker, formatter, and any approved staging-boundary
  tests pass; type/build checks named in the approved file plan pass.
- No S110 claim is made for runtime expansion, branch selection, animated
  per-instance bindings, the 64 cap at runtime, serialization, interactive
  playback, or static exports.
- Builder evidence distinguishes raw test outcomes, unavailable checks,
  residuals, recommendation, and separate product-owner disposition.
- Sprint 111 remains gated on a separate ACCEPTED/CLOSED disposition and
  completion of its diagnostic/implementation prerequisites.