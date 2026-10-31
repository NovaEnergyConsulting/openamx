# Sprint 113 Handoff Prompt

You are the Builder for OpenAMX Sprint 113: V0.18 Editor Support,
Specification, and Example.

## Read First

- Project instructions and current worktree status. Preserve user changes,
  S109-S112 evidence/dispositions, generated artifacts, VS Code output roots,
  and existing desktop test results.
- `planning/plan-openamxV18MasterSprintPlan.md` and every Sprint 113 package
  document.
- Accepted S109-S111 contracts and S112 Builder evidence plus its separate
  product-owner disposition. As of preparation, S112 disposition is
  PENDING; do not start implementation until it is recorded.
- Current shared `highlighting.ts`, TextMate grammar/host tests, desktop
  CodeMirror component/UI tests, V0.13 diagram spec, V0.16 additive spec,
  README navigation, and Example 08 at the approved commit.

## Authority and Entry Gate

- This package is Architect preparation only. Obtain separate explicit S113
  execution authorization and approval of exact files, commands, and output
  roots before editing or running workflows that write artifacts.
- S112 raw Builder evidence includes a passing standalone generated browser
  test and static export evidence, an intermittent Vite preview bridge
  failure/retry, skipped native WebView2, and no cross-platform run. Preserve
  all statuses separately from the still-pending owner disposition.
- Do not change accepted syntax/runtime/serialization behavior under S113.
  Any behavior conflict requires a separate decision or corrective sprint.
- TextMate grammar edits are conditional on a failing actual tokenization
  assertion. Existing grammar patterns may already cover the syntax.

## Task Contract

- Recursively derive shared editor highlighting facts from S110's canonical
  diagram content tree for controls, nested primitive declarations, names,
  properties, and expressions.
- Verify actual VS Code TextMate keyword and primitive scopes inside nested
  controls. Preserve Markdown/non-AMX boundaries.
- Verify desktop CodeMirror rendering with parser-proven facts; keep its
  evidence separate from shared fact tests and from native-host evidence.
- Add an additive V0.18 language specification consistent with accepted
  S109-S112 decisions, and update root README navigation.
- Extend Example 08 with a small loop/conditional-generated group that keeps
  `t` out of controls and uses `t` in supported primitive properties.
- Preserve repeated source identity semantics: generated instances have
  internal identities only; do not add public symbol, navigation, completion,
  or rename contracts.
- Verify formatting, example execution, interactive playback, and lower-bound
  PDF/DOCX behavior to the scope approved for S113; keep unavailable hosts
  explicit.
- Complete Builder evidence and obtain a separate product-owner disposition.

## Mandatory Boundaries

- No parser/typechecker/runtime/serializer/renderer changes, generated bundle
  edits, historical spec rewrites, new primitives, output policy changes, or
  release/version actions.
- No generated-instance source names, per-instance editor references, or
  claims that repeated declaration labels are unique IDs.
- Do not infer S112 owner acceptance or native/platform success from Builder
  results, retries, or Vite harness output.
- Do not say the 64 cap bounds iteration time or memory; preserve D111-02.
- If a new source/test/doc/output path is needed outside the approved plan,
  stop and request a precise amendment.

## Completion

Meet `acceptance.md`, reconcile the editor/spec/example matrix, preserve
generated/test artifacts, record all raw outcomes, and submit evidence for a
separate disposition. Sprint 114 and release work remain separately gated.