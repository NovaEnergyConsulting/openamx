# Sprint 052 Blueprint: Strict Static Checking, Multiline Records, and Migration

## Approach

1. Confirm Sprint 051 approval and read the approved contract appendix, V0.9 language spec, this sprint packet, and current worktree status. Establish a migration inventory before editing; distinguish valid examples from intentionally invalid fixtures.
2. Trace every production use and gate of `checkDocument`/`checkingActivated` through CLI/evaluation, module loading, editor analysis/completion, and desktop service/worker paths. Make a call-site matrix with entry point, whether it evaluates or analyzes, expected check timing, and focused test seam. Include non-file-backed and untyped execution paths.
3. Make checking unconditional at supported document/module boundaries. Remove obsolete conditional bypasses without duplicating module evaluation or changing valid inference. Ensure every imported module is checked before its executable statements run and analysis paths report diagnostics rather than silently skipping checks.
4. Add focused strictness regressions before broad migration: valid unannotated expressions remain accepted/inferred; invalid untyped expressions fail statically before side effects/evaluation; imported invalid modules fail; and supported CLI/editor/desktop/direct paths cannot opt out. Keep pure functions, imports, module ordering, and export atomicity unchanged.
5. Trace statement parsing and expression collection for current multiline handling. Implement balanced, syntax-aware collection for record constructors and their nested existing expressions. Delimiters inside string tokens must not affect nesting. Commas separate constructor fields; a trailing comma is accepted; missing separators and unmatched/incomplete braces fail at accurate original-source locations.
6. Implement canonical `field = value` constructor parsing and explicitly reject `field: value` as `AMX3006`. Keep declaration/annotation colons intact. Verify duplicate/unknown/missing/optional/default fields and types using existing checker behavior, and use approved codes for new static failures without changing existing code meanings.
7. Cover nested records, nested existing list literals, parenthesized expressions, fields containing strings with braces/commas, blank lines/indentation, multiple following statements, and LF/CRLF. Confirm parser does not absorb later statements, narrative, or inert fences.
8. Update the formatter only as needed to print valid multiline/canonical record syntax consistently. Test parse-format-parse equivalence and idempotence. Confirm invalid colon constructors are refused without repair or rewritten output.
9. Migrate only repository-owned positive fixtures that are invalid under strict checking or use old constructor delimiters. For each changed fixture, preserve its intent and record why it was invalid and what was corrected. Preserve negative tests and add explicit old-colon rejection and strict-check failures; do not mask failures by removing examples or relaxing checking.
10. Run focused parser/formatter/evaluator/module/editor/desktop tests, then the repository-owned root suite and root build. Run relevant desktop/extension checks where the changed analysis/checking surface requires them. Run `git diff --check`; record exact commands, totals, and any unavailable/failing checks.
11. Update the Sprint 052 Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Record migrations, call-site coverage, behavior compatibility, diagnostics/source locations, results, and residuals. Request a Lead Developer disposition; do not self-accept.

## Files to Update

- Production implementation as required in AST/parser, checker, formatter, and checking call sites identified above
- Focused tests and relevant positive fixture/example migrations only
- `planning/sprints/0052-v09-strict-checking-multiline-records-migration/builder-evidence.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not migrate unrelated fixtures or implement Sprint 053-058 work.

## Acceptance Scenarios

| Scenario | Required outcome |
|---|---|
| Valid unannotated document | Type inference succeeds and valid behavior is preserved. |
| Invalid untyped expression | Static diagnostic is produced before evaluation; no side effect/output occurs. |
| Imported invalid module | Module is checked and rejected before its executable statements run. |
| Alternate supported entry path | CLI, editor analysis/completion, desktop worker/service, and direct/non-file-backed evaluation cannot disable checking. |
| Canonical multiline record | `field = value` parses over lines with required commas and optional trailing comma. |
| Nested record/list/parentheses | Existing nested expression forms parse with correct boundaries and AST meaning. |
| Legacy constructor colon | Rejected as `AMX3006`; formatter does not repair it. |
| Type/annotation colon | Remains accepted in declarations and annotations. |
| Field validation | Existing duplicate, unknown, missing/optional/default, and value-type behavior remains enforced. |
| Source robustness | LF/CRLF, malformed/incomplete literals, strings with structural characters, and following statements have accurate diagnostics and boundaries. |
| Migration | Positive fixtures are made valid without deleting or weakening negative coverage. |
| Formatter | Valid code is meaning-preserving and idempotent; invalid constructor syntax fails explicitly. |

## Verification

- Focused suites: parser, formatter, evaluator, modules, editor analysis, CLI, and affected desktop worker/service/diagnostic tests.
- Root repository-owned tests and `bun run build`.
- Relevant desktop or extension typecheck/build/test tasks where their integration paths changed; do not claim a surface verified if its check was unavailable.
- `git diff --check`, plus a final review of fixture diff and working-tree preservation.

Record exact executed commands, test counts, failures, warnings, and skipped checks in Builder evidence. A green build alone does not establish this sprint's behavioral acceptance.

## Notes

- The approved diagnostic allocation for invalid syntax is `AMX3006`; the approved diagnostic for static type/operator errors is `AMX3007`. Respect existing codes and messages for existing behavior.
- The approved strict constant boundary is syntax-directed and side-effect-free. Sprint 052 does not need to implement V0.9 list bounds, unit scale checking, or measurement constant evaluation; it must not introduce arbitrary code execution during checking.
- Sprint 053 and Sprint 054 both depend on Sprint 052 and may proceed in parallel after its disposition. Sprint 055 depends on Sprint 052 but not on 053/054. Do not implement those downstream feature slices here.
