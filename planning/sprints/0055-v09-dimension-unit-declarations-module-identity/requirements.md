# Sprint 055 Requirements: Dimension/Unit Declarations and Module Identity

## Goal

Implement first-class module-level dimension and unit declarations, normalized dimensional vectors, finite positive scales, explicit exports/imports, and stable declaration identity across the existing module system. Deliver the exact approved project-local SI library. Build dimension/unit registries early enough for later input/output schema inspection without executing AMX statements or evaluating modules more than once.

Sprint 055 delivers declarations, identity, and registries. Measurement attachment/arithmetic/conversion remains Sprint 056; external data/reporting integration remains Sprint 057.

## Dependencies and Entry Gate

- Sprint 055 depends on Sprint 052, which is **ACCEPTED WITH RECORDED RESIDUALS** by Lead Developer disposition. Sprint 052 supplies unconditional static checking and multiline record/nested-expression parsing.
- Sprint 053 is **ACCEPTED**; Sprint 054 is **COMPLETE / APPROVED**. Neither is a Sprint 055 dependency. Their recorded Windows residuals remain unpassed: Sprint 053's VS Code host run was 13 pass/6 fail (five `EBUSY` cleanup failures and one drive-letter case assertion); Sprint 054's desktop RPC test failed on slash direction in a path, and its VS Code host run was 15 pass/5 fail (four `EBUSY` cleanup failures and one drive-letter case assertion). Do not present these as passes or turn them into Sprint 055 gates absent a demonstrated blocker.
- The approved V0.9 contract in `docs/language-spec-v0.9.md` and the Sprint 051 approved contract appendix in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md` are authoritative, including the complete finite SI inventory and exact identity/canonicalization/diagnostic rules.
- The master plan assigns Sprint 055 declaration checking, module identity, explicit exports/imports, SI library, and registry preparation. It does not require Sprints 053 or 054.
- Preserve unrelated/user-owned changes. If implementation evidence exposes a semantic ambiguity or requires an approved-scope change, record it in `planning/questions.md` and obtain Lead Developer direction before changing the contract.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 055 scope and dependency sequence
- `docs/language-spec-v0.9.md`, dimension/unit declarations, module visibility, identity, and SI library rules
- Approved Sprint 051 Builder Contract Proposal, especially:
  - qualified base-dimension identity and vector normalization
  - unit scales and canonical units
  - exact SI inventory and export spellings/exclusions
  - approved diagnostic allocations and source-location contract
  - cross-surface/module-loader audit
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Existing module loader, AST/parser/type checker, evaluator, environment, exports/imports, input/output schema inspection, formatter, diagnostics, editor analysis, desktop data inspection, tests, and relative-import libraries

## In Scope

- Add module-level declarations:
  - base dimensions and derived dimensions using dimension expressions
  - one independent base unit per base dimension
  - scaled and derived units using finite scale factors, multiplication/division, parentheses, and signed integer powers as specified by the approved grammar
- Resolve declarations in source order and module scope. Earlier declarations and explicit imports are visible; forward references, unknown names, collisions, loop/function-local declarations, and a second independent base unit for the same base identity are rejected.
- Implement stable base identity as `(canonical resolved module identity, declaration name)`, preserving identity through imports/re-exports and the module loader’s real-path canonicalization. Equally named independent declarations from separate modules remain distinct.
- Represent derived dimensions as normalized sparse integer-exponent vectors keyed by base identity. Merge equal identities, remove zero exponents, compare structurally, and make equivalently derived dimensions from the same bases interchangeable.
- Represent unit metadata with declared identity/display name, normalized dimension vector, and positive finite scale relative to the approved canonical basis. Reject non-finite, zero, or negative scales, conflicting declarations, undefined references, and invalid dimension/unit expressions with approved diagnostics.
- Add explicit export support and existing-style explicit imports for dimensions and units. Re-exported declarations preserve original identity. No implicit imports, global names, package resolver, or automatically generated aliases.
- Implement the exact finite optional SI library inventory approved in the Sprint 051 blueprint appendix, with case-sensitive exported names, exact definitions/scales/aliases, and stated exclusions. Place it in the approved project-local `libraries/si.amx` location and use existing relative import behavior.
- Build dimension/unit registries before input inspection/loading and output schema inspection so later sprints can interpret measurement types. Registry construction must not evaluate executable document statements, load user data, run a module twice, or otherwise change single-evaluation behavior.
- Integrate declarations and imported unit/dimension symbols into static checking and shared editor/module analysis to the extent needed to resolve names, declaration sources, identities, and diagnostics. Full Sprint 058 client parity remains out of scope.
- Allocate/use approved diagnostic codes: `AMX3006` for invalid declaration syntax; `AMX3008` for unknown/forward/colliding/invisible declarations, invalid base-unit relationships, and invalid statically known scales. Preserve original source locations and related declaration locations where relevant.
- Add focused tests for declaration grammar, source ordering, scope, exports/imports/re-exports, identity, structural equivalence, scale validation, SI definitions/aliases, no implicit visibility, and registry lifecycle/no duplicate execution.
- Provide declaration and library examples/tests suitable for Sprint 056/057 consumption. Record exact implementation and verification in Builder evidence and planning records.

## Out of Scope

- Measurement value attachment (`10 meter`), `in` conversion, measurement arithmetic/comparison/powers/roots/math functions, and measurement interpolation; Sprint 056 owns these.
- Measurement JSON/CSV parsing/serialization, external compound-unit text validation, table/chart normalization/labels, HTML/PDF/DOCX measurement display, and desktop measurement data-editor integration; Sprint 057 owns these.
- 1-based list syntax/mutation (Sprint 054 is complete); do not alter list behavior except preserving generic type/module compatibility.
- Full cross-feature editor parity, rename/navigation/outline/completion refinements, migration guide, user docs, examples overhaul, bundled help, or integrated V0.9 acceptance; Sprint 058 owns these.
- Offset/affine units, Celsius/Fahrenheit, imperial/customary units, unlisted prefixes or scales, angle units, all-prefix SI coverage, package resolution, or global standard names.
- Automatic abbreviations/aliases. Only declarations explicitly included/exported/imported are visible.
- Arbitrary execution of source modules to build registries, executing document statements during schema inspection, duplicate module evaluation, or a general registry cache that changes source-order/identity behavior.
- Unrelated UI, runtime, report, release, or dependency changes.

## Constraints

- Follow the exact approved SI inventory (7 base dimensions, 7 base units, 9 scaled units, 21 aliases, 9 derived dimensions, 9 derived units); do not add or omit names without explicit Lead Developer authorization.
- Declaration names are module-scoped and source-ordered. Each referenced name must be already declared or explicitly imported. Declarations are not legal inside functions or loops.
- Base identity is canonical module identity plus the original declaration name—not an unqualified display name. Re-exports retain identity. Independent same-name dimensions do not unify.
- Derived dimension equality is vector equality over the same base identities, not matching derived type names.
- Unit scales are finite and strictly positive. Exactly one independent base unit exists per base identity; alternative units require explicit scale relationships.
- Registry discovery must be metadata-only and compatible with Sprint 052 unconditional static checking. Keep static checking prior to execution and preserve module containment, source order, export atomicity, and single evaluation.
- Use approved diagnostics and source locations; do not silently ignore invalid declarations or substitute success-shaped registry entries.
- Keep all related operations safe for later schema inspection without implementing Sprint 057 data/report behavior in this sprint.
