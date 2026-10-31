# Sprint 114 Integrated Evidence Matrix

## Status and Evidence Rules

Architect-prepared matrix. All S114 execution rows begin `NOT RUN`; populate
only after separate authorization and approval of `verification-plan.md`.

Allowed raw statuses: `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
Keep raw test status separate from Builder recommendation and product-owner
disposition. Acceptance with residuals never rewrites failed/unavailable raw
evidence. Preserve every first failure, retry, and artifact.

For each executed row record exact command/action, cwd, OS/tool versions,
expected vs actual result, test/assertion counts, artifact path, residual
owner, and separate disposition.

## Entry and Disposition Reconciliation

| Evidence ID | Requirement | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-ENTRY-01 | S109 contract/resource gate | Verify accepted cap=64 control-only, one-host qualification scope, diagnostic decisions, HTML discrepancy, and residuals | NOT RUN | NOT RUN | Product owner; reconcile before execution |
| INT114-ENTRY-02 | S110 parser/checker/formatter | Verify ACCEPTED/CLOSED record and exact accepted AST/diagnostic contracts | NOT RUN | NOT RUN | Product owner; disposition record |
| INT114-ENTRY-03 | S111 runtime | Verify ACCEPTED/CLOSED WITH RECORDED RESIDUALS, AMXD6004, cap/accounting, and D111-02 | NOT RUN | NOT RUN | Product owner; preserve unbounded-work residual |
| INT114-ENTRY-04 | S112 serialization/render | Reconcile conflicting records: S112 builder evidence and STATUS/state/decisions/briefing say PENDING; S113 builder evidence says user ACCEPTED WITH RECORDED RESIDUALS | NOT RUN | NOT RUN | Lead Developer/product owner; blocking disposition reconciliation |
| INT114-ENTRY-05 | S113 editor/spec/example | Verify S113 ACCEPTED WITH RECORDED RESIDUALS from Builder evidence and reconcile lifecycle records | NOT RUN | NOT RUN | Product owner; preserve raw failures and residuals |

## Integrated Product Evidence

| Evidence ID | Requirement family | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-PARSE-01 | Complete language path | Parse direct/nested primitive, loop, and conditional content in full AMX documents; source order and locations retained | NOT RUN | NOT RUN | Parser owner |
| INT114-DIAG-01 | Control diagnostics | `AMX3006` nested-loop and malformed syntax; `AMXD6001` time-in-control; `AMXD6004` first output 65; exact file/line/column | NOT RUN | NOT RUN | Language/runtime owner |
| INT114-CHECK-01 | Static validation and authored accounting | Iterable/condition/scope/property checks; 512 authored / 513 `AMXD013`; controls do not multiply authored count | NOT RUN | NOT RUN | Typechecker owner |
| INT114-FORMAT-01 | Recursive formatting | Format nested control example; parse-format-parse semantic tree equivalence and idempotence | NOT RUN | NOT RUN | Formatter owner |
| INT114-EXPAND-01 | Model-creation expansion | Depth-first source order, iterable order, selected branches, empty content, model recreation | NOT RUN | NOT RUN | Runtime owner |
| INT114-CAP-01 | Generated cap | Exactly 64 control-originating emissions pass; 65th fails before append/evaluation; direct primitives excluded; counter per diagram | NOT RUN | NOT RUN | Runtime owner |
| INT114-BIND-01 | Frame binding | Distinct iterator values retained for each instance at lower/interior/upper and repeated/out-of-order times; same model membership/order stable | NOT RUN | NOT RUN | Runtime owner |
| INT114-RESOURCE-01 | D111-02 and S109 resource rationale | Preserve unbounded-work caveat; report exact host/timing/size; do not infer CPU/memory bound from output cap | NOT RUN | NOT RUN | Product owner; accepted residual unless changed separately |
| INT114-SERIAL-01 | Versioned serialization | V2 order, identity/path, supported bindings and context round-trip; v1 no-control read; malformed/v1-control/unknown fail closed | NOT RUN | NOT RUN | Serialization owner |
| INT114-BROWSER-01 | Standalone interactive browser | Actual embedded runtime reads v2 payload and matches in-process order/geometry at lower/interior/upper; network/page/console/error recovery recorded | NOT RUN | NOT RUN | Renderer/host owner |
| INT114-STATIC-01 | PDF/DOCX | PDF SVG and DOCX PNG equal lower-bound semantic membership/order; report order, title/description, image metadata and proportions | NOT RUN | NOT RUN | Export owner |
| INT114-EDITOR-SHARED-01 | Shared editor facts | Recursive controls, nested primitive/name/property facts; narrative and non-AMX fence boundaries | NOT RUN | NOT RUN | Editor owner |
| INT114-EDITOR-VSCODE-01 | VS Code host | Actual TextMate nested scopes and host/provider suite results; preserve Windows cleanup/path failures distinctly | NOT RUN | NOT RUN | VS Code test owner |
| INT114-EDITOR-DESKTOP-01 | Desktop editor | Typecheck and focused CodeMirror nested decorations/formatting; classify Vite harness vs native evidence | NOT RUN | NOT RUN | Desktop tooling owner |
| INT114-EXAMPLE-01 | Example 08 | Run/check/format, below-cap generated count, fixed membership/order, animated `t` properties | NOT RUN | NOT RUN | Example/diagram owner |
| INT114-EXAMPLE-02 | Example output paths | Standalone playback and PDF/DOCX lower-bound content agree with the accepted example | NOT RUN | NOT RUN | Renderer/export owner |
| INT114-BUILD-01 | Build/generated artifact | Root build/typecheck; browser bundle generated only through approved script; expected diff reviewed | NOT RUN | NOT RUN | Build owner |
| INT114-SIZE-01 | Size/performance composition | Measure production composition against S109 synthetic and S112 production values; preserve 100 MiB/1 MiB discrepancy and no policy change | NOT RUN | NOT RUN | Product owner; residual remains |

## Repository and Host Gates

| Evidence ID | Gate | Required evidence | S114 execution record | Raw status | Residual owner / separate disposition |
| --- | --- | --- | --- | --- | --- |
| INT114-ROOT-FOCUSED | Root focused selection | Parser/diagram/evaluator/formatter/editor/renderer/serialization/PDF/DOCX/example tests | NOT RUN | NOT RUN | Root test owner |
| INT114-ROOT-ALL | Broader root regression | Run only if included in approved S114 plan; record aggregate and unrelated failures | NOT RUN | NOT RUN | Root test owner |
| INT114-VSCODE | Extension suite | Actual Extension Development Host, including S113 nested tokenization tests | NOT RUN | NOT RUN | VS Code test owner |
| INT114-DESKTOP-TYPE | Desktop typecheck | Hutch wrapper and/or explicitly approved direct typecheck, with no-result/stall separated from PASS | NOT RUN | NOT RUN | Desktop build/tooling owner |
| INT114-DESKTOP-UI | Desktop UI | Focused diagram playback/editor tests; harness/native classifications distinct | NOT RUN | NOT RUN | Desktop UI owner |
| INT114-NATIVE | Native/platform | Supported native WebView/package and OS routes if available | NOT RUN | BLOCKED/UNAVAILABLE unless directly run | Platform owner; no certification |
| INT114-PRESERVE | Preservation and changed paths | Artifact roots, generated hashes/diffs, prior S109-S113 outputs untouched, `git diff --check` | NOT RUN | NOT RUN | S114 Builder |

## Residual Register to Reconcile

Carry these raw outcomes forward until new direct evidence resolves them:

- S109 qualification used one Windows host and synthetic control/render
  workloads; peak memory and cross-platform performance were not established.
- The V0.13 specification says a 1 MiB interactive HTML limit; the current
  renderer enforces 100 MiB and desktop worker has an 8,000,000-character
  guard. S112 measured below both but did not reconcile policy.
- D111-02: no iteration/work cap; potentially unbounded traversal remains an
  accepted residual. No bounded CPU/memory claim.
- S112's Vite preview bridge was intermittent; native WebView2 was skipped
  and cross-platform evidence was not run.
- S113 root focused suite had 70 pass/1 fail on the unchanged V0.14 Help-index
  expectation; VS Code host had 21 pass/7 fail on Windows cleanup/drive-case
  failures; desktop Hutch typecheck produced no result; desktop Vite UI passed
  3/3; native was not run.
- S113's `get_errors` analyzer reported `Invalid diagram property` at Example
  08's `for` line despite passing CLI/parser/Extension Host evidence. Owner
  triage remains unresolved.
- S112 product-owner disposition is contradictory across artifacts and must
  be reconciled before S114 execution.

Do not delete a residual because an unrelated later check passes. Record raw
status, owner, and separate disposition for each item.