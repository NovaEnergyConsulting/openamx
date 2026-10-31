# Sprint 110 Handoff Prompt

You are the Builder for OpenAMX Sprint 110: V0.18 Diagram AST, Parser, and
Typechecker.

## Read First

- Project instructions and current worktree status. Preserve user changes,
  prior Sprint 109 evidence, generated outputs, and test artifacts.
- `planning/plan-openamxV18MasterSprintPlan.md` and every document in this
  Sprint 110 package.
- Sprint 109 `builder-evidence.md`, accepted
  `diagram-generation-contract.md`, `diagnostic-matrix.md`, and
  `qualification-cases.md`.
- Only the AST, diagram parser, existing loop/if parsers, checker, formatter,
  direct AST consumers, and focused tests needed to approve the exact file
  plan. Recheck current code at the authorized commit.

## Authority and Entry Gate

- Sprint 110 is architect-prepared only. Obtain separate explicit execution
  authorization and approval of the exact source/test/evidence paths and
  commands before editing.
- The accepted S109 cap is 64 control-block-originating primitives per
  evaluated diagram. S110 does not enforce it. Preserve the existing
  authored 512-per-report `AMXD013` accounting separately.
- Do not implement prohibited-`t` checking until the Lead Developer has
  allocated the shared diagnostic identity/message. Do not implement nested
  loop rejection until the exact `AMX3006` message and inner-loop anchor are
  confirmed. Do not guess or reuse identities.
- Resolve D110-01 before changing AST shape: prevent current flat runtime
  consumers from silently flattening, omitting, or incorrectly rendering
  control content. Include any necessary fail-closed boundary in the approved
  file plan. If this needs scope beyond S110, stop and request an amendment.
- Sprint 109's separate acceptance does not authorize Sprint 110, and S110
  acceptance does not authorize S111 or release work.

## Task Contract

- Add ordered recursive diagram content nodes for primitive, `for`, and
  braced `if`/`else` content, with locations for controls, expressions,
  delimiters, primitive names, and properties.
- Parse the approved syntax and permitted mixed nesting. Reject any `for`
  within another `for` at parse time, including through conditional branches.
- Type-check iterable and condition types; preserve/restores lexical iterator
  scope; prohibit the diagram time variable in controls; apply existing
  primitive/property rules recursively.
- Count each authored primitive declaration once toward the existing
  report/module authored-element limit. Do not apply branch selection or
  runtime loop counts in the checker. Preserve `AMXD013` and the separate
  16-diagram limit.
- Format recursive content in source order with stable canonical
  indentation. Add the mapped parser/checker/formatter/source-location and
  static-diagram compatibility tests.
- Audit all existing `DiagramDeclarationNode.elements` consumers. Do not use
  broad casts, unsafe flattening, or duplicate mutable representations.
- Keep runtime expansion, cap enforcement, per-instance contexts, editor
  integration, docs/examples, rendering, and release outside S110.
- Complete Builder evidence, report all failures/retries and exact changed
  paths, and request a separate product-owner disposition.

## Mandatory Boundaries

- No nested `for`, time-dependent topology, generated source-level identity,
  new primitive kinds, unrelated parser/checker changes, or changes to
  historical specs.
- No `AMXD013` reuse for generated overflow. The future S111 overflow
  diagnostic must be allocated before S111 implementation.
- No runtime, browser, PDF, or DOCX success claim from parser/checker tests.
- If a new file, source surface, test, or behavior is required outside the
  approved plan, stop and request a precise scope amendment.
- No release, publication, package/version change, or platform
  certification.

## Completion

Meet `acceptance.md`, reconcile all IDs in
`parser-checker-test-matrix.md` and `diagnostics-and-gates.md`, and submit
traceable Builder evidence. A separate ACCEPTED/CLOSED disposition is
required before Sprint 111.