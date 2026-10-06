# Sprint 055 Acceptance Criteria

Sprint 055 is complete when:

- The parser and AST represent module-level base/derived dimension and base/scaled/derived unit declarations plus explicit declaration exports, with syntax covered by positive and negative tests.
- Declarations are legal only at module scope and resolve in source order from earlier declarations or explicit imports. Unknown/forward references, collisions, duplicate exports, and function/loop-local declarations fail explicitly.
- A base dimension identity is `(canonical resolved module identity, declaration name)`. Explicit imports/re-exports preserve identity across alternate relative paths; independently declared same-name dimensions from separate modules remain distinct.
- Derived dimensions are normalized sparse integer-exponent vectors keyed by base identity. Zero exponents are removed; structurally equal vectors over identical base identities are interchangeable independent of derived name; vectors over different base identities are not interchangeable.
- Unit metadata preserves declared/display identity, dimension vector, and positive finite scale. Exactly one independent scale-1 base unit is allowed per base identity; alternative units have explicit valid scale relationships. Invalid/non-finite/zero/negative/overflowed scales and invalid relationships reject before they can be used.
- Explicit imports/exports work through existing module containment and source-order semantics. No implicit global names, automatic aliases, implicit imports, or package resolution are added.
- The optional project-local `libraries/si.amx` contains exactly the approved Sprint 051 inventory: 7 base dimensions, 7 base units, 9 scaled units, 21 aliases, 9 derived dimensions, and 9 derived units. Every exported name is case-exact with the approved definition/scale, and every stated exclusion remains absent.
- Static declaration/name/scale errors use approved `AMX3008` as specified; malformed declaration syntax uses `AMX3006`. Diagnostics include meaningful original source locations and related declaration locations where applicable.
- A dimension/unit registry is available before external input/output schema inspection. Registry construction is metadata-only: it does not execute arbitrary AMX statements, load input data, evaluate a module twice, change evaluation order, or bypass unconditional checking.
- Module containment, real-path identity, import immutability, pure-function rules, source ordering, export atomicity, and single module evaluation remain intact.
- Focused tests cover grammar, source order/scope, imports/re-exports, identity, vector equality, units/scales, collisions, SI exactness and explicit visibility, registry timing, and no duplicate execution.
- Sprint 052 strict checking and Sprint 054 list behavior remain valid. Sprint 053 behavior is not claimed as dependent or reverified; its host-suite residual remains accurately documented.
- Focused and applicable root/desktop/extension verification is recorded with exact commands/results and any unavailable/failed host checks. `git diff --check` passes.
- Builder evidence and planning state/decision/question records capture the implementation and residuals, and a separate Lead Developer disposition is requested.

## Required Regression Set

1. Base dimensions in one module; import and re-export the same identity through an intermediary.
2. Two separately declared same-spelling dimensions across modules remain incompatible.
3. Derived dimensions with equal normalized vectors over common bases compare equal; different base identities do not.
4. Unknown, forward, colliding, duplicate, and out-of-scope declarations reject with approved codes/locations.
5. Exactly one independent base unit is allowed; explicit scale definitions succeed, invalid scales/operators/exponents fail.
6. Exact SI library inventory and each exported alias/definition are checked; unimported names remain invisible.
7. Registry availability before input/schema inspection without running statement side effects or evaluating module bodies twice.
8. Existing module containment/source order and Sprint 052-054 regressions remain intact.

Sprint acceptance does not establish measurement arithmetic, external data/report behavior, broad editor parity, or completion of V0.9.
