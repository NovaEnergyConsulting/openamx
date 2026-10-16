# Sprint 085 Builder Evidence: Runtime `is` Type Checking

## Status

**IMPLEMENTED; FOCUSED EVIDENCE PASS; SEPARATE DISPOSITION PENDING.**

- Sprint 084 contract disposition: ACCEPTED by user on 2026-10-15.
- Sprint 084 implementation/runtime evidence: NOT RUN.
- Sprint 085 execution authorization: APPROVED by user on 2026-10-16.
- Exact file-by-file implementation/evidence plan: APPROVED by user on
  2026-10-16 and recorded below before source/test implementation.
- Narrow source-inspection amendment for `src/runtime/environment.ts`:
  APPROVED by user on 2026-10-16 and recorded before that file was edited.
- Generated runtime artifact amendment for
  `src/renderer/diagramBrowserRuntime.ts`: APPROVED by user on 2026-10-16
  after the approved build regenerated it.
- Sprint 085 implementation/test result: COMPLETE; focused tests and core
  build passed.
- Sprint 085 disposition: ACCEPTED by user on 2026-10-16.
- Sprint 086 readiness: PENDING its own separate authorization.

## Approved File-by-File Plan

Starting worktree was clean on branch `feat/create-v0.14`
(`git status --short --branch`).

| File | Approved change |
| --- | --- |
| `src/ast/types.ts` | Add a dedicated `is` expression node whose target is a `TypeReferenceNode`; preserve operator and target source locations and the distinction between a type reference and a runtime expression. |
| `src/parser/parseExpression.ts` | Parse `is` at comparison precedence with left associativity; consume the approved simple type name and ordered `[]`/`?` suffixes; emit the exact approved syntax diagnostics and locations. Keep `is` usable as an identifier outside infix use. |
| `src/typechecker/checkDocument.ts` | Resolve valid targets through current source-order/import visibility, produce Boolean without rejecting runtime mismatches or narrowing, and retain ordinary checking for chains. Update checker AST visitors to traverse only the tested value. Use an `is`-target-specific enum-resolution path so existing general annotation behavior is not broadened. |
| `src/runtime/evaluateExpression.ts` | Implement recursive primitive, structural record, enum membership, list, nullable/null, and Measurement dimension-vector checks. Return `false` for every valid runtime non-match. |
| `src/runtime/environment.ts` | Copy the caller's enum declarations and materialized enum values into function call frames so enum-target predicates work inside functions. This narrow amendment was approved by the user on 2026-10-16 after source inspection. |
| `src/renderer/diagramBrowserRuntime.ts` | Retain the one-line generated browser runtime bundle produced by the approved core build; it incorporates the evaluator changes. This generated-artifact amendment was approved by the user on 2026-10-16 after the build. |
| `tests/isTypeChecking.test.ts` | Add one focused fixture-driven test for each of the 11 applicable `IS-*` fixtures, plus supplemental cases within those tests where needed for primitive and enum type coverage, including enum predicates inside functions. Assert all 19 `IS-VALID-01` bindings, exact diagnostics/messages/locations, and parse grouping. |
| `planning/sprints/0085-v14-runtime-is-type-checking/builder-evidence.md` | Record this approved plan before implementation, then exact commands/results, counts, retries, source ranges, failures, residuals, and Builder disposition request. |
| `planning/state.md` | Record the approved Sprint 085 execution and later completion status. |
| `planning/decisions.md` | Record execution authorization, approved files, source-inspection amendments, and any later decision/disposition request. |
| `planning/questions.md` | Record the resolved entry gate and any implementation blocker/residuals and disposition request. |
| `planning/STATUS.json` | Set phase/sprint to `building`/`085` after authorization and `sprint-closed`/`085` only at close. |
| `planning/ARCHITECT_BRIEFING.md` | Refresh the briefing at close with evidence, readiness, and next action. |

`planning/ROADMAP.md` does not exist and will not be created. No other
production, test, editor, documentation, example, package, release, or
version files are approved.

### Source-inspection amendments recorded before implementation

- The existing annotation resolver recognizes primitives, records, and
  dimensions but not enums. The approved implementation therefore resolves
  enums only in the `is` target path instead of changing existing annotation
  semantics.
- The runtime environment already carries local/imported record and enum
  declarations and dimension metadata; no declaration-registry or environment
  change was initially planned.
- Record constructors materialize omitted optional nullable fields as `null`.
  The structural matcher will respect field presence and the declared target
  annotation without changing existing runtime record object shape.
- The expression parser and statement parser are mutually connected through
  interpolation; the approved parser change will consume target references
  locally rather than introducing a parser import cycle.
- Editor services are not included. Sprint 088 remains responsible for user-
  facing editor support.
- **Approved plan amendment (2026-10-16):** further call-frame inspection
  showed that `Environment.createCallFrame()` does not copy enum metadata.
  The user approved adding `src/runtime/environment.ts` and a function-body
  enum predicate regression within the existing approved test file. The
  amendment is recorded before editing that additional production file.
- **Approved generated-artifact amendment (2026-10-16):** the approved
  `bun run build` regenerates `src/renderer/diagramBrowserRuntime.ts`, and
  inspection confirmed its changed bundle includes the new type-test
  evaluator. The user approved retaining this build-generated output.

### Approved verification target

The selected existing suites contain 230 declared tests: parser 49, evaluator
86, modules 41, measurements 9, dimensions 11, editor 22, and list semantics
12. The new file targets 11 canonical fixture tests, for at least 241 focused
tests total. Run:

```powershell
bun test tests\isTypeChecking.test.ts tests\parser.test.ts tests\evaluator.test.ts tests\modules.test.ts tests\measurements.test.ts tests\dimensions.test.ts tests\editor.test.ts tests\listSemantics.test.ts
bun run build
```

Actual results, including any initial failure and retry, will be recorded
separately below. Bun's reported totals are authoritative.

## Evidence Log

| ID | Area | Exact action / command | Result (`PASS` / `FAIL` / `BLOCKED/UNAVAILABLE` / `NOT RUN`) | Evidence | Residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | Entry authorization and approved file plan | User explicitly authorized Sprint 085 and approved the file-by-file plan on 2026-10-16; recorded above before implementation. | PASS | User approval; current branch/worktree checked; plan and inspection amendments recorded above. | Builder |
| E-02 | AST and parser grammar/precedence | Focused test command below; direct Bun summary: 241 passed, 0 failed across 8 files. | PASS | `tests/isTypeChecking.test.ts` asserts `IS-PREC-01` grouping, arithmetic/conversion/comparison/logic/conditional precedence, and `IS-CHAIN-01` left associativity. | Builder |
| E-03 | Target type resolution and diagnostics | Focused test command below; exact diagnostics asserted for all negative `IS-*` fixtures. | PASS | `AMX3006` syntax cases; `AMX3001` unknown/non-type/forward targets; visible imported `Point`; `IS-NARROW-01` remains `AMX3002`. | Builder |
| E-04 | Runtime structural/primitive/list/optional/enum semantics | Focused test command below; complete `IS-VALID-01` executed. | PASS | All 19 approved Boolean bindings match; supplementary Boolean/DateTime/string-enum, optional absence/null, nested nullable list, and function enum checks pass. | Builder |
| E-05 | Measurement dimension matching and Number distinction | Focused test command below; complete `IS-VALID-01` executed. | PASS | Equivalent `meter`/`centimeter` dimensions match; incompatible dimensions return false; dimensionless Measurement matches while Number does not. | Builder |
| E-06 | Source locations, LF/CRLF, UTF-16 | Focused test command below; source range assertions use `sourceTokenRange`. | PASS | Missing-target point `L5:C18`; invalid suffix `L5:C27-28`; unknown `L5:C19-26`; non-type `L6:C19-28`; forward `L5:C19-24`; Unicode target `L5:C22-29`; CRLF unknown target `L5:C19-26`; no-narrowing operand `L7:C23-28`. | Builder |
| E-07 | Focused regressions and build | Run the approved focused Bun test command and `bun run build` below. | PASS | Bun: 241 passed, 0 failed across 8 files. Build script and `tsc` exited 0. `git diff --check` passed. | Builder |
| E-08 | Scope review and separate disposition request | Reviewed worktree status and recorded the generated bundle amendment; user separately selected ACCEPT on 2026-10-16. | PASS | No editor, library, specification, example, package, release, or version changes. Full root suite remains for Sprint 089. Sprint 085 is accepted; Sprint 086 remains unauthorized pending its own gate. | Builder / Lead Developer |

## Sprint 085 Implementation and Verification

### Implemented behavior

- AST and parser represent the RHS as a type reference, not an expression.
  `is` uses comparison precedence and left associativity; suffix order is
  preserved and malformed targets use the approved syntax diagnostic.
- Static checking resolves primitive, record, enum, dimension, list, and
  nullable targets under existing source order and import visibility. Every
  valid predicate has Boolean type; the tested operand is neither rejected
  for a mismatch nor narrowed.
- Runtime checks primitive values (including Number versus Measurement),
  recursively checks structural records/lists, accepts additional record
  fields and absent optional fields, tests enum underlying-value membership,
  matches nullable/null and Measurement vectors, and returns `false` for
  valid mismatches.
- Function call frames retain enum declaration/value metadata. The approved
  generated browser runtime bundle was refreshed by the core build.

### Exact verification commands and results

```powershell
bun test tests\isTypeChecking.test.ts tests\parser.test.ts tests\evaluator.test.ts tests\modules.test.ts tests\measurements.test.ts tests\dimensions.test.ts tests\editor.test.ts tests\listSemantics.test.ts
```

**PASS:** 241 tests across 8 files; 241 passed, 0 failed. Arithmetic:
230 pre-existing selected tests plus 11 new `IS-*` fixture tests.

```powershell
bun run build
```

**PASS:** `scripts/build-diagram-runtime.ts` and TypeScript compilation
(`tsc`) exited 0. The command regenerated
`src/renderer/diagramBrowserRuntime.ts`; the user approved retaining that
generated output after confirming it contains the new evaluator.

```powershell
git diff --check
```

**PASS:** no whitespace errors. Git printed its normal LF-to-CRLF working
copy warning for the generated runtime bundle.

### Initial failure and retry record

- The first focused `functions.runTests` run reported 171 passed and 11
  failed. The failures all exposed one parser integration bug: expression
  parsing treated infix `is` as a Measurement unit attachment. The missing
  target case consequently diagnosed an invisible unit `is`; other fixtures
  failed with trailing identifier syntax errors.
- The parser's attachment path was corrected to leave `is` for the infix
  parser. The focused `functions.runTests` retry reported 182 passed, 0
  failed.
- The final direct Bun command above reported 241 passed, 0 failed. The
  `functions.runTests` wrapper's 182-test summary did not include 59 tests
  counted by direct Bun for the same selected files; direct Bun's explicit
  241-test summary is the acceptance result recorded here.

### Residuals

- The full root test suite was not run; the approved Sprint 085 verification
  target was the focused affected-surface suites plus the core build. Broader
  integrated acceptance remains Sprint 089.
- Editor feature integration, examples, specifications, and standard-library
  work remain owned by Sprints 086-088 as specified. Their absence here is
  not evidence of editor or downstream acceptance.
- The Builder recommends Sprint 085 acceptance based on the evidence above.
  The user separately accepted Sprint 085 on 2026-10-16. The full root suite
  remains assigned to Sprint 089, and the runner count discrepancy remains
  documented; neither is relabeled as a completed check.
- Sprint 086 remains unauthorized pending its own separate authorization.

## Approved Contract Reference

Sprint 084 records 44 fixture IDs mapped to complete source envelopes and 38
diagnostic spans checked, including UTF-16/non-BMP and LF/CRLF cases. Two
focused existing location tests passed, and the user accepted the contract.
These are contract-preparation results only; none is Sprint 085 runtime
implementation evidence.

Primary Sprint 085 fixtures:

- Positive/runtime matrix: `IS-VALID-01`
- Grammar and associativity: `IS-PREC-01`, `IS-CHAIN-01`
- Syntax and target errors: `IS-SYNTAX-01`, `IS-SYNTAX-SUFFIX-01`,
  `IS-TARGET-UNKNOWN-01`, `IS-TARGET-NONTYPE-01`,
  `IS-TARGET-FORWARD-01`, `IS-TARGET-IMPORT-01`,
  `IS-TARGET-UNICODE-UTF16-01`
- No narrowing: `IS-NARROW-01`

Exact expected outcomes and source ranges are authoritative in Sprint 084
`grammar-examples.md` and `diagnostic-matrix.md`.

## Decisions, Failures, and Residuals

No Sprint 085 implementation decisions or results are recorded. On execution,
preserve first-run failures and retries as separate evidence. Record any
implementation blocker, contract ambiguity, or required scope amendment and
owner; do not silently change the accepted contract.

## Builder Recommendation and Disposition

**Builder recommendation: ACCEPT. Lead Developer/product-owner disposition:
ACCEPTED by user on 2026-10-16.**

The disposition accepts Sprint 085 implementation based on the direct 241/0
focused Bun run, successful core build, source-range/fixture assertions, and
recorded scope review. The full root suite remains for Sprint 089; the
`functions.runTests` versus direct Bun count discrepancy is recorded above
and not converted into a pass. Sprint 086 is not authorized by this
disposition and still requires its own gate.
