# Sprint 079 Builder Evidence: Diagram Language and Shared Scene Model

## Status

**Implemented as the Sprint 079 language/model increment, with recorded
residuals. This is not end-to-end diagram feature acceptance.**

Sprint 079 execution was explicitly authorized and the file-by-file plan
approved by the Lead Developer before production/test edits. The Lead
Developer's approved plan amendments and follow-up decisions are recorded in
the planning ledgers and the Sprint 078 diagnostic matrix.

The starting worktree was clean on branch `feat/create-v0.13`. No pre-existing
user changes or test artifacts were overwritten.

## Implementation delivered

- Added diagram declaration, time, element, property, and source-attributed
  expression AST nodes; parsed the approved syntax inside existing executable
  AMX fences with original-document source positions.
- Added type/scope/required-field/style/primitive checks and report-wide
  authored-declaration limits.
- Added the immutable destination-neutral scene model. It preserves title,
  accessible description, logical bottom-left/Y-up canvas, interval/duration,
  static style, ordered elements, source locations, and validated AMX
  expressions.
- Captured a cloned typed AMX environment including bindings, records, enums,
  function ASTs, measurement values, and dimension/unit registries. Each frame
  evaluates at the requested in-range time from a fresh context; invalid
  frames throw source-located failures instead of returning stale/success-shaped
  output.
- Added the canonical diagram formatter while retaining existing formatting
  behavior for non-diagram AMX documents.
- Aggregated diagram emissions from each distinct resolved imported module
  into the entry module in dependency/source order; report-wide authored caps
  include that resolved module graph.
- Preserved existing AMX1004 behavior for an imported function directly
  referencing an enum identifier.

## Approved decisions and diagnostics

- AMXD012: `A single report can have up to 16 diagrams maximum.`
- AMXD013: `A single report can have up to 512 elements maximum.`
- AMXD014: `Canvas height is invalid`
- AMXD015: `Invalid diagram style specified`
- The 512 semantic-element limit counts authored `line`, `rectangle`, `circle`,
  and `text` declarations across the report. AMXD012/AMXD013 identify the
  first authored declaration beyond the cap.
- The Lead Developer resolved the approved EBNF/acceptance discrepancy in
  favor of `Element*`; diagrams with zero elements are valid.
- Nested declarations in existing `if`/`for` bodies emit once per execution
  using that execution's captured context. Structural caps count authored
  declarations, not repeated executions. A focused test observes 18 emitted
  model instances from 2 authored nested declarations without a cap error.
- D-NEG-18's primary source location was corrected from `10:16` to `10:15`,
  the actual start of `1 / 0` in the fixture.

## Verification results

| Command | Result |
|---|---|
| `bun test tests\diagram.test.ts` | 11 passed, 0 failed, 194 expectations across 1 file. |
| `bun test tests\parser.test.ts tests\evaluator.test.ts tests\formatter.test.ts tests\modules.test.ts tests\diagram.test.ts` | 206 passed, 0 failed, 922 expectations across 5 files. |
| `bun run build` | Passed (`tsc`). |

The focused tests cover both positive fixtures, every invalid fixture
D-NEG-01–24 with exact diagnostic identity/message and source position,
AMXD012/AMXD013 boundaries and overflows, AMXD014/AMXD015 validation,
arbitrary-time initial/interior/upper frames, out-of-range time, model
immutability/context capture, imported measurement/record/enum/function
semantics, existing AMX1004 behavior, nested execution, UTF-16 token ranges,
formatter canonical order/idempotence, full-document parse-format-parse
meaning, imported-module diagram aggregation and cross-module caps, and
existing parser/evaluator/formatter/module regression suites.

An initial `functions.runTests` request timed out without returning a result.
The environment had no remaining Bun/TypeScript test process; the focused
commands were then executed directly through Bun and their results are
reported above. The timeout is not counted as a test result.

## Changed files

- `planning/decisions.md`
- `planning/questions.md`
- `planning/state.md`
- `planning/sprints/0078-v13-diagram-contract-feasibility-gate/diagnostic-matrix.md`
- `planning/sprints/0079-v13-diagram-language-shared-scene-model/acceptance.md`
- `src/ast/types.ts`
- `src/diagnostics/errors.ts`
- `src/formatter/formatAmx.ts`
- `src/parser/parseStatements.ts`
- `src/runtime/diagramModel.ts`
- `src/runtime/environment.ts`
- `src/runtime/evaluateExpression.ts`
- `src/runtime/moduleLoader.ts`
- `src/typechecker/checkDocument.ts`
- `tests/diagram.test.ts`

No production HTML/desktop preview, renderer, PDF/DOCX, editor client,
examples/specification, dependency, or release/version file changed. The full
root test suite was not run; the agreed verification was the focused suites
and root build.

## Residuals and blocked coverage

- The tests exercise a broad typed context (imported pure function,
  measurement/unit registry, typed record with enum-valued field, list access,
  nullable field interpolation), but do not exhaust every existing AMX
  AST/value/function combination or larger import graphs. Full semantic parity
  beyond tested forms remains **BLOCKED/untested**, not claimed.
- High-rate repeated evaluation, memory/performance budgets, and minimum-host
  constraints were not measured. A report may have more than 16 emitted model
  instances or 512 emitted element instances when authored declarations run
  repeatedly in a loop; the Lead Developer explicitly chose authored-source
  counting for these caps. Later renderer integrations must account for this
  approved behavior without silently changing the language contract.
- No HTML/SVG renderer, desktop/HTML frame-error lifecycle, PDF/DOCX output,
  editor integration, native desktop UAT, publication, release, or platform
  certification was performed or accepted. Those remain later-sprint work.
