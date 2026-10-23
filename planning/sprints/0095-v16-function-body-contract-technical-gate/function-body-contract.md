# Sprint 095 Accepted Contract: V0.16 Function Bodies

## Disposition

The product owner recorded **ACCEPTED/CLOSED** on 2026-10-23. Decisions
D-095-01 through D-095-12 and D-095-14/15 are approved below. D-095-13 is an
accepted Sprint 097 residual: the defensive runtime-fallthrough diagnostic
remains unallocated and blocks Sprint 097. This disposition does not authorize
implementation, release, publication, or Sprint 096 execution.

Labels distinguish **FACT** (source-observed), **CONFIRMED** (V0.16 master
plan), **APPROVED** (product-owner choice), and **RESIDUAL** (accepted follow-up
with a downstream blocker).

## Confirmed Requirements

- Preserve expression-bodied declarations such as
  `fn triple(value: Number): Number = value * 3` and their existing parse,
  evaluation, typing, formatting, visibility, and compatibility behavior.
- Add brace-delimited multi-statement function bodies.
- Every reachable path must return a value compatible with the declared type.
- A return statement nested in an `if` or statement-form loop exits the
  function call. Expression-form loop returns continue to collect one value
  per iteration and never signal function exit.
- Parameters and locals are call-local. Assignment cannot mutate caller
  bindings.
- Each list-typed parameter receives its own recursive list copy, including
  nested and repeated arguments. Local lists may be mutated and returned.
- Preserve function declaration visibility/order and do not add recursion,
  forward references, closures, or general object-copy behavior.

## Forms and Body Statements

Accepted forms:

```amx
fn expressionBody(value: Number): Number = value * 2

fn statementBody(value: Number): Number {
  let local = value * 2
  return local
}
```

Newlines separate statements; semicolons are invalid. The `=` and `{` body
introducers are exclusive. A brace inside a string is not a body delimiter;
the matching closing brace terminates a braced function. A braced expression
must not be reinterpreted as a statement body without an unambiguous function
body boundary.

The legal function-body statements are initialized `let`, assignment, `+=`,
standalone `if` with optional `else`, statement-form `for`, `return`, and
named-list `add`/`remove`. These may appear in branch and loop bodies. Nested
statement loops, `break`, and `continue` remain prohibited.

Imports, exports/re-exports, type/enum/dimension/unit/input declarations,
table/chart/diagram declarations, `show`, and other document-level actions
are prohibited in function bodies. They fail during parsing with
`AMX3006: The '{keyword}' statement is not allowed in a function body.`

Expression-form loops are prohibited inside both function forms, preserving
the V0.3 pure-function placement rule. Where expression-form loops are
otherwise legal, their `return` still contributes one value per iteration.

## Return Analysis and Runtime

A statement sequence returns only if every reachable continuation terminates.
An `if` without `else` has a false-path fallthrough; an `if/else` returns only
when both branches return. A statement-form loop may execute zero times and
cannot prove a return by itself. A later return can close any remaining path.

Every statement is statically checked, including unreachable statements. Every
explicit return is checked against the declared function return type, including
returns after an unconditional return. No unreachable-code warning is added.

At runtime, a function-body return exits the function, including when nested
in a statement-form conditional or loop. Statements after the return do not
execute. The runtime retains a defensive failure if an invalid function body
falls through, but its diagnostic is the residual below.

A braced-if used as an expression retains V0.12 semantics: branch `return`
expressions produce that conditional expression's value and do not themselves
exit an enclosing function. A return statement in a statement-form `if` body
does exit the function. An outer `return expression` exits after evaluating
its expression.

Incomplete functions report:

- Code: `AMXF4001`
- Message: `Missing return value from function`
- Primary location: closing function-body brace

`AMX3021` remains reserved for `Every possible path in an if expression must
return a value`.

## Lexical Scope and Visibility

Parameters are visible throughout the function body. Locals become visible in
source order and are not hoisted. Branch and loop bodies establish lexical
scopes; declarations do not escape their block. A repeated `let` in the same
scope updates that binding. A declaration in a nested lexical scope may shadow
a parameter or enclosing local, and the shadow does not escape.

Assignment updates an already-visible parameter/local; it does not create a
binding or mutate a module binding. The loop iterator shadows and restores an
existing binding. Functions retain established module dependency and
source-order visibility; they do not capture document/caller bindings and may
not recurse or refer forward.

## List Value Semantics

At each call boundary, every list-typed parameter gets an independent
recursive copy of its argument. Repeated arguments are copied separately, so
mutation through one parameter cannot affect another parameter or the caller.
Nested arrays are copied at every depth.

Only arrays are copied. Non-list elements, including records and measurements,
are opaque and are not cloned. This does not authorize mutation through shared
non-list elements or define broader object-copy behavior. Non-list parameters
retain existing value semantics.

`add`/`remove` on a copied/local list affects only that function-local list. A
mutated local list may be returned directly as the function result; no extra
copy-on-return rule applies.

## Diagnostic Contract

Locations below use raw fixture source, 1-based lines and columns, and exclude
Markdown fence offsets. The diagnostics are approved planning identities and
messages; feature-path behavior and source mapping remain unimplemented and
must be verified by the owner sprint.

| Condition | Phase | Approved diagnostic | Anchor |
| --- | --- | --- | --- |
| Malformed function-body statement | Parse | `AMX3006: Invalid syntax in function body` | Offending token |
| Unclosed function body | Parse | `AMX3006: Unclosed function body` | Opening function brace |
| Prohibited function-body statement | Parse | `AMX3006: The '{keyword}' statement is not allowed in a function body.` | Prohibited keyword |
| Missing return path | Static check | `AMXF4001: Missing return value from function` | Closing function brace |
| Incompatible explicit return | Static check | Existing `AMX3002: Expected {expected}, got {actual}` | Return expression |
| Unknown/out-of-scope binding | Static check | Existing `AMX3001: Unknown identifier '{name}'` | Identifier |
| Unknown function (forward reference/recursion) | Static check | Existing `AMX3004: Unknown function '{name}'` | Call expression |
| Return outside a function or expression-form loop | Parse | `AMX3006: Return is only valid inside a function or expression-form loop` | `return` keyword |
| Defensive runtime fallthrough | Runtime | **RESIDUAL: identity/message unallocated**; do not reuse `AMX1007` | Harness-created invalid function; location TBD |

`AMX1007` means return outside an expression-form loop and is not a valid
function-fallthrough diagnostic. Editor token ranges use exclusive ends when
available; runtime diagnostics currently expose point locations only. Existing
editor conventions use 1-based locations, tolerate CRLF, and count UTF-16 code
units. Exact function-feature locations remain **NOT RUN** pending implementation.

The product owner allocated `AMXF4001`; repository search on 2026-10-23 found
no prior use. The code registration and implementation belong to Sprint 098.
The defensive runtime-fallthrough identity/message remains unallocated by
explicit product-owner choice and blocks Sprint 097.

## Decision Register

| ID | Decision | Approved disposition / owner |
| --- | --- | --- |
| D-095-01 | Statement separators | Newlines separate statements; semicolons invalid. Product owner, 2026-10-23. |
| D-095-02 | Nested statement loops | Remain prohibited. Product owner, 2026-10-23. |
| D-095-03 | Shadowing and repeated `let` | Same-scope `let` updates; nested lexical scopes may shadow. Product owner, 2026-10-23. |
| D-095-04 | Unreachable statements | Check all statements; no warning. Product owner, 2026-10-23. |
| D-095-05 | Missing-return anchor | Closing function brace. Product owner, 2026-10-23. |
| D-095-06 | Aggregate deep-copy treatment | Recursively copy arrays only; non-list elements opaque. Product owner, 2026-10-23. |
| D-095-07 | Returned-list behavior | Return local list directly without another copy. Product owner, 2026-10-23. |
| D-095-08 | Prohibited statement diagnostics | Parse rejection with the approved AMX3006 template. Product owner, 2026-10-23. |
| D-095-09 | Nested loop preservation | Preserve V0.2 nested-loop restriction. Product owner, 2026-10-23. |
| D-095-10 | Unreachable non-return checking | Type-check all statements; no warning. Product owner, 2026-10-23. |
| D-095-11 | Records/aggregates in copied lists | Copy arrays recursively; do not clone non-list values. Product owner, 2026-10-23. |
| D-095-12 | Missing-return identity | `AMXF4001: Missing return value from function`, closing-brace anchor. Product owner, 2026-10-23. |
| D-095-13 | Runtime-fallthrough identity | **RESIDUAL:** unallocated; do not reuse AMX1007. Diagnostic owner (Lead Developer/product owner); blocks Sprint 097. |
| D-095-14 | Lexical `let` behavior | Same-scope update; nested shadowing permitted. Product owner, 2026-10-23. |
| D-095-15 | Expression-loop placement | Prohibited inside functions; preserve collection semantics elsewhere. Product owner, 2026-10-23. |
