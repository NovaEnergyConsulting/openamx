# Sprint 095 Blueprint: V0.16 Function Body Contract and Technical Gate

## Approach

1. Obtain separate Sprint 095 execution authorization and approval of the
   concrete file-by-file review, probe, and evidence plan. Preserve the
   starting worktree and limit edits to this sprint's planning folder.
2. Read the V0.16 master plan, this sprint package, language specifications
   through V0.15, focused tests, and only the code paths needed to establish
   current syntax, scope, evaluation, list mutation, and diagnostic behavior.
3. Complete `function-body-contract.md`. Keep confirmed requirements distinct
   from candidate syntax and semantics. State each contract rule in a way
   that can be implemented and tested without assumptions.
4. Resolve the control-flow model using `control-flow-fixtures.md`:
   - Define whether each sequence/if/loop shape falls through or returns.
   - Make a return in a nested function statement exit the call.
   - Preserve expression-form loop return collection.
   - Decide how unreachable statements and explicit returns are checked.
   - Confirm loop nesting and branch/loop lexical-scope boundaries.
5. Resolve list value semantics with executable cases:
   - Copy every list-typed argument independently at the call boundary.
   - Recursively isolate nested lists and repeated arguments.
   - Specify what is copied when lists contain records or other aggregate
     values, without granting mutation capabilities not in scope.
   - Confirm local mutation and returned-list identity/result behavior.
6. Complete `diagnostic-matrix.md`. Inspect existing diagnostic definitions and
   source-location conventions. Reuse only a semantically matching diagnostic;
   request a stable allocation for every new diagnostic rather than inventing
   one.
7. Complete `requirement-test-matrix.md` and cross-check every fixture ID,
   expected outcome, diagnostic, and owner sprint against the source examples.
8. Record exact checks, reviewed files, outcomes, decisions, residuals, and a
   recommendation in `builder-evidence.md`. Submit the package for a separate
   Lead Developer/product-owner contract disposition.

## Contract Artifact Set

- `function-body-contract.md` — normative candidate grammar/semantics and
  decision register.
- `control-flow-fixtures.md` — complete AMX fixture envelopes and expected
  static/runtime outcomes for return flow, scope, and list value behavior.
- `diagnostic-matrix.md` — negative cases, failure phase, diagnostic identity
  and message, and primary/secondary source locations.
- `requirement-test-matrix.md` — traceability from master-plan requirement to
  fixture, owner sprint/surface, and later implementation evidence.
- `builder-evidence.md` — exact evidence log and pending disposition.

## Files to Update

- Files in `planning/sprints/0095-v16-function-body-contract-technical-gate/`
  only, unless a separate file plan is explicitly approved.

## Verification

- Cross-check the fixture IDs and requirement references mechanically or with
  a focused text audit; report exact counts and any exceptions.
- Check all diagnostic source locations against complete fixture envelopes,
  including fence/front-matter lines where used, LF/CRLF, and UTF-16 columns.
- Run `git diff --check` for the approved planning artifacts.
- Do not run broad implementation tests as a proxy for contract acceptance.
  Current parser rejection of the proposed syntax is expected and is not
  evidence that the contract is invalid.

## Notes

Sprint 095 gates Sprints 096-101. Builder evidence and a Builder
recommendation do not themselves approve the contract or authorize product
implementation.