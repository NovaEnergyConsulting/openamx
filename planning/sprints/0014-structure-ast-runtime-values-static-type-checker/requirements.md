# Sprint 014 Requirements: Structure AST, Runtime Values, and Static Type Checker

## Goal

Implement the V0.3 record/type foundation and static checker defined by `docs/language-spec-v0.3.md`. Extend the hand-written parser, AST, runtime values, and document evaluation so typed records work while V0.2-only documents retain their current behavior.

## Inputs

- Approved V0.3 contract: `docs/language-spec-v0.3.md`
- Sprint 013 completion record: `planning/sprints/0013-v03-language-data-contract/` and planning logs
- Current V0.2 parser, evaluator, renderer, diagnostics, and tests under `src/` and `tests/`

## In Scope

- Parse source-located V0.3 `type` declarations, fields, `T?`/`T[]` type references, typed `let` bindings, `null`, record constructors, and field access in executable `amx` blocks.
- Extend AST types for named types, fields/defaults, typed declarations, null/record/member expressions, and preserve original document coordinates.
- Implement runtime record values: declared-field materialization order, literal-default copying, nullable omission, construction, and field access. Keep records closed/data-only.
- Implement a pure document type-checking API and invoke it before V0.3 document evaluation/rendering. It must activate only under the V0.3 activation rule, leaving V0.2-only documents on their current behavior.
- Type-check all existing V0.2 expressions/statements when activated: bindings/redeclarations/assignments, arithmetic/logical/comparison/conditional expressions, lists/ranges, standard-library calls, statement/expression loops, match, record construction, and field access.
- Emit deterministic source-located `AMX3001`-`AMX3005` diagnostics for static declaration/expression errors; preserve existing V0.2 runtime diagnostic behavior where checking is not activated.
- Add focused parser, checker, evaluator, and V0.2-regression tests. Update planning logs with verified results and actual deviations.

## Out of Scope

- `fn`, `import`, `export`, user-defined function calls, module loading, and the Asset Management library (Sprint 015).
- `input`, CSV/JSON parsing, CLI options, aggregate/fail-fast data validation, and runtime file validation (Sprint 016).
- `--output`, serializers, CLI output mappings (Sprint 017), and V0.3 editor support (Sprint 018).
- Examples, README release documentation, formatter redesign, license selection, or Marketplace publication.

## Constraints

- Follow the later complete draft in `docs/language-spec-v0.3.md` as the V0.3 contract; correct only factual/document-structure defects in that specification and record any contract clarification.
- Keep TypeScript/Bun, the current hand-written parser, exact executable-fence boundary, source locations, and V0.2 rendering/CLI behavior.
- Do not add dependencies, domain-specific core names, implicit coercions, structural record conversion, or an `any` type.
- Static errors must prevent evaluation when checking activates. V0.2-only documents without V0.3 syntax/options must not be newly rejected for V0.2 truthiness or mixed-list behavior.
