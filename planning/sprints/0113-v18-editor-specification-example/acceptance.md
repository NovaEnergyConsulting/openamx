# Sprint 113 Acceptance Criteria

Sprint 113 is complete only when nested diagram syntax is presented
consistently in the shared editor facts, VS Code TextMate host, and desktop
CodeMirror UI; the additive specification reflects accepted behavior; and
Example 08 demonstrates runnable generation without changing the existing
lesson contract. A separate product-owner disposition is required.

## Entry and Scope

- Sprints 110 and 111 have their recorded ACCEPTED/CLOSED dispositions.
- Sprint 112's separate product-owner disposition is recorded before S113
  implementation; its Vite preview residual and native/cross-platform gaps
  retain their raw statuses and named owners.
- S109-S112 accepted contracts and residuals are checked against the exact
  current artifacts. No S112 Builder recommendation is treated as an owner
  disposition.
- Separate S113 execution authorization and exact file/test/output plan are
  recorded before edits.
- No parser/runtime/serializer/renderer behavior changes, historical spec
  rewrites, completion/navigation API changes, release, or version work occur.

## Editor Support

- Shared editor facts recursively cover nested `for`/`if`/`else`, primitive
  declaration names, nested properties, and expressions at original source
  locations.
- Narrative and non-AMX fences remain inert; existing direct static diagram
  facts remain unchanged.
- Actual VS Code TextMate tokenization proves control and primitive scopes
  in nested diagram blocks. Grammar edits are made only when a real host
  test identifies a tokenization gap.
- Desktop CodeMirror UI shows the parser-proven nested keyword and primitive
  declaration spans without diagnostics for valid source. Formatter output
  stays stable.
- No public generated-instance symbol, unique name, completion, navigation,
  or rename behavior is claimed.

## Specification and Example

- `docs/language-spec-v0.18.md` is additive and linked from the root README.
  It exactly matches the accepted syntax, nesting, evaluation timing, order,
  `t`, cap/accounting, diagnostics, identity, animation, and static/interactive
  export contract.
- The spec does not claim that the 64-output cap bounds iteration work,
  memory, or CPU; D111-02 remains explicit.
- S112 serialization/version/browser/static-export claims are included only
  after its product-owner disposition. The 1 MiB versus 100 MiB discrepancy
  is not presented as resolved.
- Example 08 adds a valid, deterministic loop/conditional generation case
  below the cap; `t` appears only in primitive properties; the same model
  keeps generated membership/order stable across frames.
- Example 08 passes the focused parse/check/format/evaluation path and
  demonstrates standalone HTML plus lower-bound PDF/DOCX generated content
  where included in the approved checks.
- Existing crank-slider behavior, lesson navigation, and prior V0.13
  specification remain intact.

## Evidence and Disposition

- All cases in `editor-spec-example-test-matrix.md` map to focused evidence
  or a named residual/unavailable check.
- VS Code host, desktop Vite harness, native host, example runtime, browser
  playback, and static exports are reported as distinct checks.
- Builder evidence contains exact commands, host/tool versions, artifacts,
  failures/retries, changed paths, and residual owners. Builder
  recommendation is separate from product-owner disposition.
- S114 integrated acceptance, release/publication/version work, and platform
  certification remain separately gated.