# Sprint 095 Acceptance Criteria

Sprint 095 is complete only when the confirmed V0.16 function-body scope has
a reviewed, source-grounded contract and traceable fixtures that downstream
implementation can follow without guessing. This sprint does not implement
V0.16.

## Contract

- `function-body-contract.md` specifies both function forms and preserves the
  current expression-body behavior and compatibility boundary.
- The legal function-body statement forms are enumerated. Nesting,
  declarations/actions that are forbidden, loop restrictions, and statement
  ordering are explicit.
- Function return propagation is explicit for direct returns, nested
  conditional returns, and returns nested in statement loops. The distinct
  existing behavior of expression-form loop returns is protected.
- Return compatibility and all-path analysis are defined for a straight-line
  sequence, if with and without else, partial branches followed by later
  returns, and loops that may execute zero times.
- The contract explicitly decides how statements after an unconditional
  return are handled statically and at runtime; every explicit return is
  checked against the declared return type as required by the master plan.
- Lexical scope, parameter assignment, local lifetime, shadowing, loop
  iterators, and declaration-order/visibility behavior are specified.
- List arguments are recursively copied, independently for each parameter,
  including nested and repeated arguments. Aggregate element treatment,
  local mutation, and returned-list behavior are explicit.
- Every proposed detail is either approved, still unresolved with a named
  owner/blocker, or explicitly rejected; no candidate is silently treated as
  a confirmed product decision.

## Fixtures and Diagnostics

- `control-flow-fixtures.md` covers expression-body compatibility, complete
  and incomplete branches, direct/nested/loop returns, later statements,
  fallthrough, return type mismatch, local scope, and list isolation/results.
- Every fixture has a stable ID, complete source envelope, expected parse,
  static-check and runtime outcome as applicable, and an owning downstream
  sprint/test surface.
- `diagnostic-matrix.md` covers malformed/unclosed bodies, prohibited
  declarations/actions, incompatible returns, incomplete return paths,
  invalid/out-of-scope bindings, and defensive runtime fallthrough where
  applicable.
- Every negative fixture has a verified or explicitly pending diagnostic
  identity/message, failure phase, and exact primary location. New diagnostic
  identities are allocated only by explicit disposition.
- Fixture sources, expected outcomes, diagnostic entries, and
  `requirement-test-matrix.md` rows agree. Source positions are checked against
  complete fixtures and use the repository's established line/column rules.

## Boundaries and Disposition

- No production implementation, test behavior change, user-facing spec or
  example change, release/version change, publication, or certification claim
  occurs.
- `builder-evidence.md` records exact review/check actions, results, decisions,
  blockers, residual owners, and a Builder recommendation. Unrun checks are
  marked NOT RUN rather than inferred PASS.
- A separate Lead Developer/product-owner disposition accepts/closes the
  contract or leaves it BLOCKED/OPEN. Sprint 096 remains blocked until that
  disposition and all required decisions are recorded.