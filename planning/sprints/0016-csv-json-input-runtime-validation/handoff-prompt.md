# 016 Handoff Prompt

You are the Builder for `openamx` Sprint 016.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0015-pure-functions-modules-asset-management-library/acceptance.md`
- `planning/sprints/0016-csv-json-input-runtime-validation/requirements.md`
- `planning/sprints/0016-csv-json-input-runtime-validation/blueprint.md`
- `planning/sprints/0016-csv-json-input-runtime-validation/acceptance.md`

Execute only Sprint 016 scope. The V0.3 contract is authoritative. Do not invent mapping, validation, or CSV conventions; record a genuinely blocking ambiguity in `planning/questions.md` before implementation.

Sprint 015 delivered functions/modules/exports. This sprint adds entry-module logical inputs, CLI mapping, JSON/CSV conversion, and validation. Sprint 017 alone owns `--output`, serialization, and output files.

## Task Contract

**objective**: Implement typed logical inputs supplied by CLI paths and deterministic input/computed-value validation, with aggregate/fail-fast diagnostics and no AMX filesystem access.

**owns**:

- `package.json` and lockfile only for a minimal proven CSV parser dependency
- `src/ast/types.ts`
- `src/parser/parseStatements.ts` and focused parser support
- `src/typechecker/checkDocument.ts`
- `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and focused data-loading/validation modules
- `src/cli.ts`
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`, focused input/data/CLI/module tests, and narrowly necessary evaluator/renderer tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 016 artifacts only for factual clarifications/deviations

**must_not**:

- Implement `--output`, output selection, JSON/CSV serialization, output writes, or export round trips.
- Add file I/O to AMX expressions/functions, permit inputs in imported modules, or loosen module containment.
- Add JSON-in-cell CSV, nested CSV values, singleton-to-list conversion, primitive coercion, domain constraints, or Asset Management calculations.
- Change existing V0.2 no-option behavior, module/function purity/visibility, record/type semantics, renderer output, or extension behavior.
- Add unrelated dependencies, refactor unrelated paths, or weaken passing tests.

**acceptance**:

- Meet every item in `planning/sprints/0016-csv-json-input-runtime-validation/acceptance.md`.
- Prove JSON/CSV mappings are fully validated and materialized before entry evaluation, with correct aggregate/fail-fast ordering and contextual AMX4 diagnostics.
- Prove input values are entry-only/immutable and data paths never cross into AMX execution.
- Preserve Sprint 015 module behavior and V0.2 compatibility while leaving all output work deferred.

**verification**:

1. After parser/type-checker changes, run focused parser tests for input syntax, source locations, ordering, entry-only restrictions, and collision errors.
2. Run focused JSON validation tests for scalar/record/list/nested mapping, duplicate keys, null/default/DateTime behavior, and aggregate/fail-fast ordering.
3. Run focused CSV tests for headers, quoted commas/newlines, BOM/line endings, row widths, conversions, blank/null versus quoted empty, and nested-shape rejection.
4. Run CLI/module tests proving path mapping, unknown/missing/duplicate mappings, failure-before-evaluation, input immutability, and no regression for no-option commands.
5. Run `bun run build` and `bun test`; record exact results/dependency changes/deviations before marking the sprint complete.
