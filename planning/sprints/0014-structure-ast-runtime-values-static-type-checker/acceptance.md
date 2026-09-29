# Sprint 014 Acceptance Criteria

Sprint 014 is complete when:

- The authoritative V0.3 specification has one coherent copy and the Sprint 014 implementation follows its later complete contract text.
- Parser and AST support source-located record declarations/fields/defaults, named/list/nullable types, typed `let`, `null`, record constructors, and field access exclusively inside executable `amx` blocks.
- Record declarations are source ordered, nominal, non-recursive, closed, and data-only. Constructors reject duplicate/unknown/missing fields, materialize fields in declaration order, copy literal defaults, and apply nullable optional omission rules.
- Runtime record construction/access works for nested records and lists without adding dynamic properties, field mutation, methods, inheritance, or computed fields.
- A document checker activates exactly for V0.3 syntax and checks every V0.2 expression/statement in the activated document before evaluation.
- The checker enforces binding type stability; primitive/list/nullable/nominal-record compatibility; valid operators; strict Boolean logicals/conditions; typed lists/ranges/loops/match; standard-library signatures; typed record construction/access; and contextually valid DateTime strings.
- Static errors use deterministic `AMX3001`-`AMX3005` diagnostics with original source locations and prevent evaluation/rendering. Dynamic V0.2 runtime failures remain unchanged where no V0.3 feature activates checking.
- Focused tests cover valid/invalid declarations, defaults and fresh copies, nesting, nullable behavior, field access, unknown/incompatible types/names/fields, annotations and assignments, operators/branches/lists/loops/match/stdlib, DateTime validity, and static-error evaluation prevention.
- Existing V0.2 parser/evaluator/renderer behavior and no-option CLI behavior remain passing; V0.2-only documents retain truthiness/mixed-list behavior without static rejection.
- No functions, modules, imports/exports, data inputs, file I/O, CSV/JSON, output serialization, Asset Management library, extension, or unrelated feature is implemented.
- `bun run build` and full `bun test` pass, and planning logs record exact results and deviations before Sprint 014 is marked complete.
