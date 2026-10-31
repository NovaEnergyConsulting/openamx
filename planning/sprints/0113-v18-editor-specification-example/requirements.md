# Sprint 113 Requirements: V0.18 Editor Support, Specification, and Example

## Document Status and Entry Gate

Architect-prepared planning documentation. Sprint 110 is ACCEPTED/CLOSED;
Sprint 111 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS. Sprint 112 Builder
execution is complete with a recommendation of ACCEPT WITH RECORDED
RESIDUALS, but its separate product-owner disposition is still PENDING as of
2026-10-31. Sprint 113 depends on Sprint 112 and must not begin implementation
until that disposition is recorded.

This package authorizes planning only. Obtain separate Sprint 113 execution
authorization and approval of the concrete editor/specification/example/test
file plan before changes.

## Goal

Align authoring presentation, the additive V0.18 language specification, and
the formula-driven diagram lesson with the accepted implementation from
Sprints 109-112. Nested diagram controls and primitive declarations must be
highlighted consistently in the shared parser-proven desktop facts, desktop
editor, and VS Code TextMate tokenizer. Add the V0.18 language specification
without rewriting historical specifications, link it from the README, and
extend the existing runnable example with loop/conditional-generated
elements whose properties continue to animate with `t`.

## Entry and Authority

- Sprint 110 is ACCEPTED/CLOSED on 2026-10-31.
- Sprint 111 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-10-31.
  The accepted generated cap remains 64 control-block-originating emissions
  per evaluated diagram, `AMXD6004` handles output 65, and D111-02 remains a
  potentially unbounded-work residual.
- Sprint 112 implementation evidence records version 2 model payloads,
  backward reading of version 1 no-control models, real standalone browser
  frame parity, and static PDF/DOCX generated output. Its Vite preview bridge
  remains an intermittent harness residual; native and cross-platform
  evidence were unavailable. These raw results remain distinct from the
  pending owner disposition.
- The accepted S109-S112 contracts are behavior authority only after their
  separate dispositions are verified. Preserve all named residuals; do not
  infer S112 acceptance from the Builder recommendation.

## In Scope

- Extend shared parser-proven highlighting facts to recursively visit
  `DiagramDeclarationNode.content`, recognizing `for`/`if`/`else` controls,
  nested primitive keywords/names, and primitive properties/expressions.
- Verify desktop CodeMirror presents those facts for nested control content
  using focused UI coverage. Do not invent a separate editor parser or
  TextMate-like grammar for the desktop client.
- Exercise the actual VS Code TextMate grammar on nested diagram source and
  assert control keyword and primitive declaration/name scopes. Change
  `vscode-extension/amx.tmGrammar.json` only if a host tokenization assertion
  demonstrates a real gap.
- Add `docs/language-spec-v0.18.md` as an additive contract linked to the
  existing diagram, loop, and conditional specifications. Document the
  accepted control syntax/semantics, cap, diagnostics, source identity rule,
  and rendering behavior at user-language level.
- Update the relevant root README navigation to link the new specification
  and extended example. Do not rewrite prior specification contracts.
- Extend `examples/08_Formula_Driven_Diagrams.amx` with a runnable
  loop/conditional generation example that uses `t` only in supported
  primitive properties. Keep the existing crank-slider workflow and lesson
  objective intact.
- Verify formatter output, example parse/check/evaluation, standalone
  playback, and static PDF/DOCX lower-bound behavior using the accepted S112
  baseline, to the degree included in the approved focused checks.

## Out of Scope

- Parser, AST, typechecker, runtime expansion, serialization, renderer, or
  output policy changes; those are closed in S110-S112 unless a separately
  approved defect amendment is required.
- New completion, navigation, outline, rename, or symbol-reference behavior
  for generated instances. Generated instance identity remains internal and
  must not be presented as a source-addressable name.
- Editing historical language specifications or changing the accepted
  control contract, `AMXD6001`, `AMXD6004`, cap accounting, 64-element cap,
  512-authored/report cap, or D111-02 residual.
- New diagram kinds, property semantics, authoring APIs, remote assets,
  package/version changes, release, publication, or platform certification.
- Treating a Vite preview-harness pass as native WebView/package evidence.

## Downstream Boundary

Sprint 114 owns integrated acceptance across parsing, checking, evaluation,
serialized browser playback, static output, editor surfaces, documentation,
and the runnable example. S113 completion does not close V0.18 or authorize
release/publication/version/platform work.