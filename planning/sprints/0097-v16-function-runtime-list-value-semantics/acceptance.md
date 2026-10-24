# Sprint 097 Acceptance Criteria

Sprint 097 is complete only after D-095-13 is explicitly allocated, Sprint
097 execution is separately authorized, and runtime behavior conforms to the
accepted Sprint 095 contract. Without that allocation, Sprint 097 remains
`BLOCKED/OPEN`; documentation and a Builder recommendation do not waive the
gate.

## Function Runtime

- Statement-body functions execute in an isolated call frame containing
  parameters but no caller/document variable values.
- Existing expression-body functions retain their behavior, result values,
  and runtime validation.
- Direct returns produce the function call result. Returns nested in
  statement-form if/else and statement-form loops exit the function, including
  through arbitrarily nested allowed blocks.
- A function return from a loop prevents later iterations and later body
  statements from executing. Loop iterator and lexical binding cleanup occurs
  even when the function return signal unwinds through the loop.
- Return expressions are evaluated once. Function result values do not get
  swallowed by the expression-loop collector or braced-if expression return
  handler.
- Braced-if expression returns retain their expression-local meaning and
  execution may continue to a later statement-function return.
- Unexpected statement-body fallthrough raises the exact D-095-13 allocated
  diagnostic at the accepted closing-brace anchor. No undefined or
  success-shaped result is returned. This criterion cannot pass while
  D-095-13 is unallocated.

## Scope and List Value Semantics

- Function parameter/local assignments do not change caller bindings.
- Function-local bindings disappear when the call ends.
- Nested branch/loop locals do not escape their lexical block. A local that
  shadows an existing parameter/local restores the prior value when its block
  exits; assignments to an already-visible outer local remain visible within
  the call.
- A loop iterator shadows/restores any prior same-name parameter/local on
  normal completion and on function-return unwinding.
- Each list parameter gets a fresh array copy. Nested arrays are copied
  recursively. Repeated arguments are copied independently; mutation through
  one parameter cannot affect the other parameter or caller-owned arrays.
- Non-array values inside copied arrays are not cloned. Non-list parameter
  semantics remain unchanged.
- Local/copied lists can be mutated with existing add/remove operations.
  Returning a local list returns that value directly, with no extra copy.
- Nullable-list behavior is explicitly covered according to product-owner
  disposition before the corresponding test is considered required.

## Regression and Evidence

- Existing expression-body function, expression-form loop collection,
  braced-if expression, measurement, and list-mutation tests pass.
- Focused tests cover every runtime-owned row in `runtime-test-matrix.md`.
- The runtime test harness path that bypasses the not-yet-updated checker is
  test-only; production `evaluateDocument` remains unchanged until Sprint 098
  supports statement-body type checking.
- Focused evaluator tests and `bunx tsc --noEmit` pass. Any broader command
  required by the approved plan has exact raw results recorded.
- `builder-evidence.md` lists authorization, approved paths, exact commands,
  results, residuals, and unavailable/not-run checks. Sprint 095/096 accepted
  evidence remains unchanged.

## Boundaries and Disposition

- No all-path return analysis, static return-type checking, formatter/editor
  feature support, user documentation/examples, release/version change,
  publication, or certification claim is included.
- Do not mark Sprint 097 complete or its implementation started if D-095-13
  allocation was not obtained before edits. Record the raw status as
  `BLOCKED/OPEN` and request the exact decision.
- A separate Lead Developer/product-owner Sprint 097 disposition is required
  after evidence; it does not authorize Sprint 098 or release.