# Sprint 097 Requirements: V0.16 Function Runtime and List Value Semantics

## Document Status and Entry Gate

Architect-prepared Sprint 097 documentation. Sprint 096 is
`ACCEPTED/CLOSED WITH RECORDED RESIDUALS` on 2026-10-24, and its accepted AST
and parser are the implementation baseline for this sprint.

**Sprint 097 is BLOCKED before implementation by accepted residual D-095-13.**
The Lead Developer/product owner must allocate the exact defensive
runtime-fallthrough diagnostic code and message, including its source anchor
and diagnostic category, before authorizing Sprint 097 execution. Do not reuse
`AMX1007`, which has a different meaning. This documentation does not resolve
or override that allocation. Separate explicit Sprint 097 execution
authorization and approval of the concrete source/test/evidence file plan are
also required.

## Goal

Evaluate braced statement-body functions in isolated call frames, propagate
function returns through nested statement control flow, preserve lexical local
lifetimes, and apply the accepted recursive-array-copy semantics to list
parameters. Return local mutated lists directly as function results. Preserve
all expression-body and expression-loop behavior.

Sprint 097 is runtime and value-semantics work only. It does not implement
return-path/type checking, formatter/editor support, author-facing docs or
examples, release, or publication.

## Authority and Inputs

- Scope and dependency:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 097.
- Accepted behavior contract:
  [Sprint 095 function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [runtime fixtures](../0095-v16-function-body-contract-technical-gate/control-flow-fixtures.md),
  [diagnostic matrix](../0095-v16-function-body-contract-technical-gate/diagnostic-matrix.md),
  and [Sprint 096 evidence](../0096-v16-function-ast-parser/builder-evidence.md).
- Current runtime baseline: `src/runtime/evaluateExpression.ts`,
  `src/runtime/environment.ts`, `src/runtime/measurement.ts`, existing
  runtime diagnostics, and `tests/evaluator.test.ts`.

## In Scope

- Evaluate the accepted statement-body AST in the existing isolated function
  call frame, which contains only parameters plus shared type/function
  registries and does not capture caller/document values.
- Implement function-return propagation from direct returns and returns
  nested in statement-form if/else and for loops. The return exits the
  function call, even through nested scopes/loops, and bypasses subsequent
  statements and iterations.
- Preserve expression-body evaluation and its existing result validation.
  Preserve expression-form loop value collection and braced-if expression
  returns as distinct control-flow signals.
- Keep function-local bindings confined to the call frame. Restore an outer
  binding after an inner lexical shadow ends; preserve assignments to
  already-visible outer locals within the function; restore loop iterators
  after each loop.
- At each call boundary, independently copy every list-typed parameter's
  value. Recursively copy arrays at every depth; copy each parameter
  independently even when multiple parameters receive the same argument.
- Preserve non-list elements by reference/identity as required by D-095-11:
  do not clone records, Measurements, or other non-array values, and do not
  introduce mutation-through-record behavior.
- Allow mutation of function-local lists and copied list parameters. Return a
  mutated local list directly without an additional copy.
- Add focused runtime tests for accepted flow, scope, copying, repeated
  arguments, returned lists, expression-body compatibility, and failure
  propagation.
- Implement the defensive fallthrough error only after D-095-13 is formally
  allocated and Sprint 097 execution is separately authorized. Use the
  accepted function-body closing-brace source location; never manufacture a
  success-shaped result.

## Out of Scope

- Parser/AST redesign; these are accepted by Sprint 096.
- Static return compatibility, all-path analysis, registration/emission of
  `AMXF4001`, or any other type-checker behavior. Sprint 098 owns these.
- New copy rules for non-list parameters, record fields, Measurements, or
  arbitrary objects; closures; recursion; forward references; nested loops;
  new mutation operations; or caller-visible aliases.
- Formatter/editor features, user documentation/specification, runnable
  examples, README/help updates, release/version changes, publication, or
  platform-certification claims.
- Changes to accepted Sprint 095/096 artifacts or unrelated output/rendering
  behavior.

## Constraints and Gates

- The accepted Sprint 095 contract is normative. In particular, recursively
  copy arrays only; non-list elements are opaque; repeated list arguments
  become independent; and list results are returned directly.
- D-095-13 must be resolved before runtime implementation begins. A generic
  `Error`, `AMX1007`, or an unreviewed diagnostic identity is not an acceptable
  substitute for the requested allocation.
- Test through `evaluateStatements` and a manually constructed `Environment`
  where necessary. `evaluateDocument` invokes `checkDocument`, whose statement
  body behavior belongs to Sprint 098 and must not be bypassed or weakened in
  production code just to make Sprint 097 tests run.
- The function return control signal must be caught only at the function-call
  boundary. Existing conditional-expression and expression-loop return
  signals must retain their current handlers and meanings.
- Use `finally`-safe cleanup for function signals so loop iterators and
  lexical shadow bindings are restored even when a function returns from
  inside nested control flow.
- Do not implement or claim static validation of incomplete functions in
  Sprint 097. Incomplete-body runtime fallthrough tests require the allocated
  defensive diagnostic and may exercise a harness-created invalid function
  until Sprint 098 rejects such source statically.