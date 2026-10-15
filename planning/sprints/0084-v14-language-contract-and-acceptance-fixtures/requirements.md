# Sprint 084 Requirements: V0.14 Language Contract and Acceptance Fixtures

## Document Status

Architect-prepared Sprint 084 documentation. The contract examples and
recommendations in this folder are drafts until reviewed and locked during
Sprint 084. Preparing these documents does not authorize Sprint 084 execution,
production changes, V0.14 implementation, release, or publication.

## Goal

Translate the confirmed V0.14 scope into a precise, internally consistent
language contract and acceptance-fixture set before implementation begins.
Lock the `is` expression grammar and type-reference behavior, standard-library
signatures and Measurement semantics, text behavior, the supported numeric
format-pattern subset, diagnostics, and requirement-to-test traceability.

Sprint 084 is a contract gate. It implements no V0.14 features. The approved
artifacts become the behavior authority for Sprints 085-089.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md).
- Existing syntax and compatibility references:
  [`language-spec-v0.13.md`](../../../docs/language-spec-v0.13.md),
  [`language-spec-v0.12.md`](../../../docs/language-spec-v0.12.md), and the
  applicable V0.9 Measurement contract.
- Existing implementation references, consulted only to preserve established
  syntax and behavior: parser, type checker, declaration registry, runtime
  Measurement support, and standard library.
- The V0.14 master plan confirms product scope. Drafts in this folder do not
  supersede it or silently decide details that it assigns to this contract
  sprint.

## In Scope

- Define `value is TargetType` grammar, precedence, associativity, target
  reference syntax and resolution, result typing, and source locations.
- Specify the exact runtime matching rules for primitive, record, enum, list,
  optional/null, and dimension/Measurement types, including nested values,
  empty lists, and non-matches.
- Specify all new mathematical functions and constants, argument and return
  types, radians, domain boundaries, finite-input/result errors, and
  dimensionless Measurement behavior.
- Inventory existing Number/list-of-Number standard-library functions and
  lock their approved Measurement behavior without regressing established
  unit conversion or result-unit semantics.
- Define `len`, `trim`, `left`, and `right`, including Unicode code-point,
  whitespace, count-default, and invalid-count behavior.
- Bound `format` to a precisely specified numeric pattern grammar and locale
  set; define grouping, precision, percent, currency, negative-value,
  Measurement suffix, rounding, and unsupported-pattern behavior.
- Produce mutually consistent valid and invalid AMX examples, a diagnostic
  matrix, and a requirement-to-test matrix. Assign stable fixture IDs and
  record exact source ranges against complete fixture documents.
- Record unresolved product choices explicitly and obtain the required
  decisions before downstream implementation.

## Out of Scope

- Changes to the parser, AST, type checker, runtime, standard library,
  formatter, editors, documentation for users, or examples outside this
  sprint's planning artifacts.
- Implementation of `is`, any V0.14 function or constant, or any editor or
  runtime integration.
- Flow-sensitive type narrowing, nominal runtime enum identity, angle
  dimensions/units, degree-based trigonometry, non-numeric formatting
  patterns, or unrelated language/reporting/desktop work.
- Weakening existing type, Measurement, diagnostic, editor, or runtime
  behavior to simplify the proposed contract.
- Release engineering, version changes, release, publication, or platform
  certification.

## Constraints and Gates

- Keep confirmed master-plan requirements distinct from candidate details
  and product decisions. A candidate becomes a locked requirement only after
  review and explicit disposition.
- A well-formed target type that does not match a runtime value returns
  `false`; an unknown or invalid target type is an error. Do not conflate
  those outcomes.
- Follow existing declaration visibility and type notation unless an
  explicitly approved V0.14 decision says otherwise.
- Do not invent diagnostic codes, claim candidate diagnostics are allocated,
  or leave a new invalid case without a final code, message, and primary
  source range at Sprint 084 completion.
- Preserve original-document source locations: 1-based line and column,
  UTF-16 code-unit columns, exclusive diagnostic ends, and correct LF/CRLF
  mapping.
- No feature is considered implemented or runtime-verified because its
  contract example appears in a planning document. Current-parser rejection
  of a not-yet-implemented V0.14 construct is not evidence of a contract
  failure.
- Obtain explicit Sprint 084 execution authorization and approval of the
  concrete file-by-file execution/evidence plan before making changes beyond
  the preparation artifacts.
- Do not begin Sprint 085 until Sprint 084's contract artifacts and required
  product decisions are approved.
