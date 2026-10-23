# Sprint 095 Draft: V0.16 Function Body Contract

## Status and Authority

This is a draft contract scaffold prepared by the Architect. The V0.16 master
plan confirms the product decisions below. Candidate syntax details and
resolution rules remain unapproved until Sprint 095 review and separate
Lead Developer/product-owner disposition. This document is not an
implementation specification until that disposition is recorded.

## Confirmed Requirements

- Keep expression-bodied declarations such as
  `fn triple(value: Number): Number = value * 3` fully supported.
- Add a brace-delimited body containing multiple statements.
- A compatible value must be returned on every reachable path.
- A return nested in an if or statement loop exits the function call.
- Parameters and locals are local to the call. Assignment cannot change
  caller bindings.
- Every list parameter receives a deep, independent local copy, including
  nested lists and repeated arguments.
- A local list may be mutated and returned as the function result.
- Limit body statements to local declarations, assignment, if/else,
  statement-form loops, return, and list mutation. Exclude module/document
  declarations and output actions.
- Preserve visibility and declaration-order behavior. Do not add recursion,
  forward references, or closures.

## Candidate Grammar and Body Rules

The following is a candidate surface form for contract review, not a parser
grammar approval:

```amx
fn name(parameter: Type): ReturnType {
  let local = expression
  if condition {
    return expression
  } else {
    return expression
  }
}
```

The contract must decide and record:

- Whether statement separation follows existing newline-based statement
  parsing, and whether semicolons are always invalid.
- Whether nested statement loops remain prohibited as in the existing
  statement parser, or whether V0.16 explicitly adds them. Do not assume
  nested-loop support from the general phrase "statement-form loops."
- The exact set of declarations/actions rejected in function bodies, including
  imports/exports, type/enum/dimension/unit/input declarations, view
  declarations, `show`, and document output actions.
- How malformed or unclosed function braces are located in the original
  document, including strings and nested control-flow braces.
- Whether function-body assignments may target parameters, locals from an
  enclosing block, and mutable local list parameters. Confirm rebinding and
  list mutation are separate operations with the same caller-isolation rule.

The `=` expression-body branch keeps its current expression parser and
behavior. The `{` statement-body branch must not reinterpret a braced
expression as a statement body without an unambiguous declaration boundary.

## Candidate Return and Flow Rules

Use the following as the proposed flow model to test and either approve or
amend:

| Form | Candidate flow result |
| --- | --- |
| `return expression` | Terminates the current function path. |
| Sequential statement after a terminating statement | Runtime unreachable; static treatment of its non-return statements is a decision for Sprint 095. Every explicit return remains subject to declared-type checking. |
| `if` with no `else` | May fall through, even if its consequent returns. |
| `if/else` | Terminates only when both branches terminate. |
| `if/else` with one returning branch | May fall through through the other branch; later statements remain relevant. |
| Statement-form loop | May execute zero times and therefore never proves function return by itself. A return executed in an iteration exits the function. |
| Loop followed by a return | The later return can close the zero-iteration path. |
| Nested conditional/loop return | Propagates to the function call, not merely to the innermost block or loop. |
| Expression-form loop return | Preserves established per-iteration collection behavior; it is not a function return. |

The checker must model reachable paths, not just search the body for a return
node. It must distinguish a partial return from a complete function and must
report an incomplete function at a stable, source-grounded location. Sprint
095 must decide whether unreachable non-return statements are accepted and
type-checked, warned, or rejected. Do not silently stop static checking after
the first return if that would violate the confirmed requirement to type-check
every explicit return.

## Candidate Scope Rules

Confirmed behavior is lexical and call-local. Sprint 095 must turn that into
precise rules for these cases:

- Parameters form the function's outer local scope and may be assigned
  without affecting caller bindings.
- Nested if/else and loop blocks have lexical lifetimes. Names declared only
  inside a block do not escape it.
- Assignment resolves to an existing visible local/parameter and mutates that
  local binding; it does not create a binding or mutate a module binding.
- Decide whether and how a local declaration may shadow a parameter or an
  enclosing local, and whether repeated `let` follows existing update
  behavior or creates a lexical binding.
- Loop iterator shadowing/restoration must remain consistent with the
  established loop contract unless an approved decision says otherwise.
- Functions continue to see only the names allowed by established
  source-order/module rules. They do not capture document or caller locals.

## Candidate List Value Rules

- At call entry, each argument corresponding to a list-typed parameter is
  copied recursively before the body can mutate it.
- If the same caller list is supplied to two list parameters, each parameter
  receives an independent copy from the original argument value. A mutation
  through one parameter cannot be observed through the other or by the caller.
- Nested lists are copied at every depth. Sprint 095 must determine whether
  records or other aggregate values inside a list are traversed for nested
  list fields and whether any identity-bearing value is intentionally shared.
- `add`/`remove` mutation of a copied list changes only the local copy.
- A function may return a local list after mutation. The returned list is the
  call result. Confirm whether return transfers that local value directly or
  requires any additional copy; do not imply caller-visible aliases that the
  language cannot create.
- Non-list parameters retain the current value semantics. Do not add
  copy-on-write, general object cloning, or new mutation forms.

## Diagnostic Contract To Finalize

For each invalid fixture, record parse/type/runtime phase, exact diagnostic
identity and message, primary source range, and any useful secondary range.
Verify reuse against the existing catalog. Required categories include
malformed/unclosed bodies, forbidden statements, incompatible return values,
incomplete return paths, out-of-scope/unknown bindings, and defensive runtime
fallthrough. New stable diagnostic codes/messages require explicit
allocation/disposition; this draft allocates none.

## Decision Register

| ID | Decision required | Initial candidate / evidence | Disposition |
| --- | --- | --- | --- |
| D-095-01 | Newline/semicolon and block statement separation | Follow existing statement parsing; confirm against parser and fixtures. | OPEN |
| D-095-02 | Nested statement loops in function bodies | Preserve existing nested-loop restriction unless the confirmed scope requires otherwise. | OPEN |
| D-095-03 | Lexical shadowing and repeated `let` | Preserve parameter isolation and block lifetime; resolve declaration/update behavior with executable fixtures. | OPEN |
| D-095-04 | Static checking of unreachable statements | Check every explicit return; choose whether other unreachable statements are checked, warned, or rejected. | OPEN |
| D-095-05 | Exact source for incomplete-return diagnostic | Prefer closing function-body brace; verify original-document mapping and stable diagnostic category. | OPEN |
| D-095-06 | Deep copy of aggregate elements | Nested arrays are required; decide recursive treatment of record-contained lists and document the boundary. | OPEN |
| D-095-07 | Return-list copy/transfer behavior | Returned local list is the function result; decide whether transfer or extra copying is observable/required. | OPEN |
| D-095-08 | Function-body prohibited statements and diagnostic mapping | Enumerate all non-approved statement kinds and allocate/reuse only verified diagnostics. | OPEN |

Close each row with the decision, evidence, approver/date, and affected
fixtures. If a row is outside Sprint 095 authority, mark it BLOCKED and name
the owner and Sprint 096 impact.