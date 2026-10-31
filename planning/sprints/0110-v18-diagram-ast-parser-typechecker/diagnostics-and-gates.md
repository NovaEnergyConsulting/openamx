# Sprint 110 Diagnostic and Entry Gates

## Sprint 109 Carry-Forward Status

Sprint 109 was accepted on 2026-10-30 with named residuals. The following
diagnostic decisions are authoritative:

| Condition | Decision | S110 requirement |
| --- | --- | --- |
| Unsupported iterable | Reuse `AMX3003` for list/range requirement; `AMX3007` for the established measurement mismatch | Verify exact branch/message/location; no new identity |
| Non-Boolean condition | Reuse existing `AMX3002` expected/actual mismatch | Verify exact source anchor |
| Iterator outside scope | Reuse existing `AMX3001` unknown identifier behavior | Verify shadow restoration and location |
| Nested `for` | Reject at parse time, anchored at inner `for`, using existing `AMX3006` family | Lead Developer must confirm exact message and source policy before implementation; current generic `parseFor.ts` path throws plain `Error` |
| `t` in iterable or condition | One shared new stable diagnostic, anchored at the `t` identifier | BLOCKED until Lead Developer allocates code and exact message |
| Expansion over 64 generated elements | New stable diagnostic, not `AMXD013`; source points to the control/primitive causing the first excess emission | S111 behavior; allocate code/message/anchor before S111 implementation |
| Malformed diagram content | Existing `AMX3006` syntax family | Confirm feature-specific message and offending-token anchor before parser assertions are frozen |
| Authored diagram declaration count >512/report | Existing `AMXD013` | Preserve exact message/accounting; do not use for generated expansion |

No new code, message, or source span is approved by this planning package.

## Required Pre-Execution Decisions

- **G110-01 Diagnostic allocation:** record the new shared `t` control
  diagnostic code/message before checker implementation begins. If the
  allocator is not ready, defer P110-TIME-01 and do not claim the feature
  checker complete.
- **G110-02 Nested-loop syntax message:** confirm exact `AMX3006` message and
  anchor at the inner loop token; replace the current plain `Error` behavior
  with the approved typed parse diagnostic.
- **G110-03 Cap diagnostic allocation:** record a separate code/message and
  source-anchor policy before S111; this can be resolved during S110 closeout
  but must not be inferred from `AMXD013`.
- **G110-04 AST/runtime staging:** select a compatibility strategy that
  prevents control-bearing AST from being misinterpreted by the old flat
  evaluator. Record exact source/test paths and assert the behavior. No broad
  casts or silent flattening.
- **G110-05 Source locations:** confirm diagnostic columns use existing
  1-based UTF-16 conventions across complete documents and CRLF.

## Diagnostic Verification Rules

- Audit current code registration and tests at the authorized commit. A
  diagnostic is reusable only when its condition and meaning match exactly.
- For nested loops, verify the parser reports an `AmxError` in the accepted
  syntax family rather than the current plain `Error`.
- For `t`, use one diagnostic identity for both loop iterable and if
  condition, with primary location at the identifier. Do not point only to
  the enclosing diagram or control block.
- For the future expansion overflow, preserve the selected cap rule:
  control-block-originating emissions only; the 65th such primitive is the
  first overflow. Keep `AMXD013` for authored declarations only.
- Record full source snippets, exact 1-based line/column, code/message, phase,
  and whether the assertion was actually run. Candidate spans are not PASS.