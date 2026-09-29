# 017 Handoff Prompt

You are the Builder for `openamx` Sprint 017.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo's documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV03MasterSprintPlan.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0016-csv-json-input-runtime-validation/acceptance.md`
- `planning/sprints/0017-csv-json-output/requirements.md`
- `planning/sprints/0017-csv-json-output/blueprint.md`
- `planning/sprints/0017-csv-json-output/acceptance.md`

Execute only Sprint 017 scope. The V0.3 contract is authoritative. Do not invent serialization, ordering, or write-transaction rules; record a genuinely blocking ambiguity in `planning/questions.md` before implementation.

Sprint 016 delivered validated inputs. This sprint selects named exported entry values and writes deterministic JSON/CSV files. Sprint 018 owns V0.3 editor support and Sprint 019 owns release examples/documentation.

## Task Contract

**objective**: Implement repeated named CLI outputs for explicit entry exports, deterministic JSON/CSV serialization, and correctly ordered safe output writes.

**owns**:

- `src/cli.ts`
- `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and focused output serialization support
- `src/diagnostics/errors.ts`
- focused output/CLI tests and narrowly necessary existing tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 017 artifacts only for factual clarifications/deviations

**must_not**:

- Change input parsing/validation semantics, functions/modules/library behavior, record/type rules, or no-option V0.2 compatibility.
- Add output support to private/imported values, types, functions, final context implicitly, remote destinations, streaming, archives, or transaction claims.
- Permit scalar/nested/untyped CSV exports, non-finite JSON values, undeclared object-key serialization, or paths inside AMX execution.
- Change renderer output behavior beyond coordinating the existing `--out` write with output destination conflict/order rules.
- Add editor, example/release, Marketplace, or unrelated cleanup work.

**acceptance**:

- Meet every item in `planning/sprints/0017-csv-json-output/acceptance.md`.
- Prove explicit entry-export-only selection, deterministic JSON/CSV bytes, supported-shape input round trips, and actionable AMX6 errors.
- Prove full serialization before writes and correct render HTML/export write ordering without claiming multi-file atomicity.
- Preserve all Sprint 016 validation and no-option CLI behavior.

**verification**:

1. After mapping/selection work, run focused CLI tests for mapping parsing, entry-export visibility, duplicate/path conflicts, and no-option regression.
2. Run focused serializer tests for exact JSON/CSV bytes, declaration-order fields/headers, DateTime/null/empty-string behavior, empty lists, unsupported shapes, and non-finite numbers.
3. Run integration tests for JSON/CSV round trips using declared types, evaluation/serialization failure before writes, render `--out` conflicts, ordered writes, and AMX6002 write failures.
4. Run `bun run build` and `bun test`; record exact results/deviations before marking the sprint complete.
