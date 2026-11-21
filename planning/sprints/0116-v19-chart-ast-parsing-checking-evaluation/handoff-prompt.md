# Sprint 116 Handoff Prompt

You are the Builder for OpenAMX Sprint 116: V0.19 Chart AST, Parsing, Checking,
and Evaluation.

## Read First

- Project instructions, current worktree status, and all user changes. Preserve
  existing artifacts, generated outputs, and prior sprint evidence.
- `planning/plan-openamxV19MasterSprintPlan.md` and every document in this
  Sprint 116 package.
- Accepted Sprint 115 `language-and-rendering-contract.md`,
  `diagnostic-matrix.md`, qualification cases, requirement matrix, and final
  builder evidence. D115-01, D115-02, D115-03, and D115-09 are authoritative.
- Only the AST/parser/checker/runtime emission/shared chart model/formatter and
  their focused tests needed for this approved implementation.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain separate
  explicit Sprint 116 authorization and approval of the exact baseline,
  worktree preservation, production/test file plan, command plan, output plan,
  and evidence roots before the first source/test edit.
- Sprint 115 was ACCEPTED/CLOSED on 2026-11-21, but that disposition does not
  authorize Sprint 116 implementation or Sprint 119 rendering work.
- Keep edits within the approved S116 paths. A required new production/test
  path, renderer/accessibility edit, editor/spec/example change, or generated
  artifact change requires a separate exact scope amendment before editing.

## Task Contract

- Add the `chartShowTableOption` AST node and retain expression, option, and
  exact expression source locations.
- Parse single-line `showTable <expression>` for bar, column, line, and scatter
  charts using the normal AMX expression parser. Reject missing, colon,
  malformed, or table-invalid forms under the accepted diagnostic policy.
- In `checkChart`, preserve ordinary expression diagnostics, reject duplicate
  options with AMX3005, and require exact Boolean type with AMX3002.
- At the existing `snapshotView`/`show` point, resolve omitted to false,
  evaluate a present expression exactly once, require an exact Boolean result,
  and store the resolved value in a frozen chart emission.
- Add required `showTable: boolean` to `ChartViewEmission` and the shared
  `ChartViewModel`; copy the resolved field during model creation without
  evaluating the AST or reading expression text in the renderer/model.
- Preserve formatter behavior and add parse-format-parse/source-location
  regressions. Modify formatter production only for a demonstrated S116
  failure, with no option reordering or expression rewriting.
- Add focused parser, checker, evaluator, formatter, and model tests for every
  applicable CHT case and all S116 matrix IDs.
- Verify dynamic snapshot behavior: two `show` statements over one declaration
  receive distinct values after a legal binding reassignment.

## Mandatory Boundaries

- Do not alter HTML, preview, PDF, DOCX, browser chart JSON, CSS, or
  accessibility output. S116 may carry false in the model while existing
  tables still render; table omission belongs to S119.
- Keep the S116 internal table and existing accessibility table reference
  construction unchanged. Their false-model presence is a staging invariant,
  not an omission failure.
- Do not re-evaluate the expression in the shared model or a renderer, and do
  not add truthiness conversion, a literal-only evaluator, arbitrary constant
  folding, or a chart-local scope.
- Do not implement affine units, PI/E declaration constants, SI temperature
  units, external affine data, editor syntax, V0.19 specification/examples,
  migration, package/version, release, deployment, or certification work.
- Reuse existing diagnostics. Do not invent a stable identity/message; an
  allocation conflict or genuinely new condition stops for Lead Developer
  decision and scope amendment.
- Never report renderer output omission as S116 PASS. It is NOT RUN/OUT OF SCOPE
  until S119.

## Verification

Use only the approved focused selection and record exact commands. Candidates:

```text
bun test tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/chartModel.test.ts
bunx tsc --noEmit
git diff --check
git status --short
```

Assert exact codes/messages and original-document source ranges, including
LF/CRLF and UTF-16 columns where fixtures cover them. Record pass/fail counts,
retries, changed paths, unavailable checks, and raw residuals. Do not use a
broad suite as a substitute for focused S116 behavior.

## Completion

Meet `acceptance.md`, reconcile all applicable Sprint 115 CHT IDs and S116
matrix IDs, and populate `builder-evidence.md` with exact results. Submit a
Builder recommendation for a distinct product-owner ACCEPTED/CLOSED or
BLOCKED/OPEN disposition. Only that separate disposition can close Sprint 116;
Sprint 119 remains independently gated by the accepted propagation contract.
