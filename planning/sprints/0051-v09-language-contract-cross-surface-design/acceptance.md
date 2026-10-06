# Sprint 051 Acceptance Criteria

Sprint 051 is complete when:

- The four Sprint 051 artifacts are Builder-ready, internally consistent, and aligned with `docs/language-spec-v0.9.md` and `planning/plan-openamxV09MasterSprintPlan.md`.
- A cross-surface audit covers AST/parser, formatter, all static-check call sites, runtime/module loading, import immutability, snapshots, external data and schemas, table/chart/report pipelines, both editor clients, tests/examples, language documentation, and bundled help. Each row identifies a downstream sprint and a verification seam.
- A grammar/precedence table unambiguously covers unit attachment, conversion, indexing, unary operators, powers, parentheses, postfix/field chaining, and existing loop `in`. Positive and negative examples state exact parse grouping and expected result/type or rejection. Existing precedence/associativity is unchanged unless the approved V0.9 contract explicitly says otherwise.
- Dimension/unit decisions specify stable qualified base identity across imports/re-exports, structural derived-dimension equivalence, declaration visibility/order, positive finite scales, conversion and cancellation, and deterministic canonical compound-unit serialization/round trips.
- The optional SI inventory lists every exported base dimension, base unit, scaled unit, alias, and derived unit with exact spelling and definition. It lists exclusions, uses explicit relative imports, and has no implicit/global aliases. Inventory is marked accepted or clearly blocked on named Lead Developer review.
- Measurement aggregate and math-function examples encode all approved rules, including typed empty sum, empty `min`/`max`/`mean` errors, first-element display unit, and `round` in the current display unit.
- Empty/all-null table and chart cases specify the existing-policy presentation and never fabricate a unit; non-empty chart normalization/labels and dimension mismatch remain covered.
- Static checks are limited to documented safely provable values. Dynamic lengths/values are assigned runtime checks; no contract requires arbitrary execution during analysis.
- A diagnostic catalog maps each scoped invalid case to a stable code/category and meaningful AMX source or external-data location, with consistent expected results across clients.
- A positive/negative conformance and migration matrix gives exact examples and expected values/types/shapes/diagnostics for approved behaviors and compatibility changes. It retains rejection cases and does not weaken strict checking to preserve invalid legacy samples.
- The matrix preserves pure functions, immutable imports and nested aliases, loop snapshots, narrative interpolation, report snapshots, export atomicity, executable-fence boundaries, and all other compatibility constraints in the approved contract.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` accurately distinguish approved requirements, Sprint 051 design decisions, proposals, and unresolved owner decisions. No proposed decision is presented as approved without review.
- No feature code, production fixture migration, implementation test, or product behavior is changed or claimed as part of Sprint 051. No build/test success or V0.9 implementation status is inferred from planning completion.
- The Lead Developer has explicitly reviewed the technical contract gate, or the remaining review items are recorded as blockers and implementation sprints are not represented as authorized to start.

## Builder Contract Artifact

The reviewable Builder contract and audit are in the **Builder Contract Proposal** appendix of `blueprint.md`. The Lead Developer approved that proposal on 2026-10-06, including exact grammar and grouping, qualified identity and canonicalization, SI exports/exclusions, aggregates and empty/null outputs, static/runtime boundaries, diagnostic codes/locations, migration cases, cross-surface owners, and Sprint 052–058 dependencies. It is an approved implementation design subordinate to (and not an amendment of) the authoritative V0.9 contract and master plan. The Sprint 051 technical gate is closed; implementation remains subject to the documented sprint dependencies.

## Review Gate

The Lead Developer review disposition covers:

1. Expression precedence and positive/negative examples.
2. Dimension identity, canonicalization, and finite SI inventory.
3. Aggregate, rounding, empty-sum, and empty/all-null view behavior.
4. Static/runtime validation boundary and diagnostic/source-location catalog.
5. Cross-surface ownership, compatibility examples, and Sprint 052-058 dependency handoff.

Approval closes the design gate only; it is not implementation, build, test, or runtime verification.
