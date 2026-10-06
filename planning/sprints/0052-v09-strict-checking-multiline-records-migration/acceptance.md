# Sprint 052 Acceptance Criteria

Sprint 052 is complete when:

- Static checking is unconditional before evaluation/analysis at every supported document and module entry point, including CLI, imports, desktop worker/service, editor analysis/completion, and direct/non-file-backed paths. The Builder records an audited call-site list and the associated tests.
- No supported caller or mode can bypass checking through `checkingActivated` or an equivalent opt-in flag. Any non-product feasibility-only caller is identified and cannot serve as a supported bypass.
- Valid unannotated programs continue to infer types and run with preserved behavior. An invalid untyped expression is rejected before execution; regression coverage verifies that invalid code does not produce side effects or output.
- Imported modules are checked before execution and preserve existing module containment, source order, single evaluation, export atomicity, and diagnostics.
- Multiline record constructors accept canonical `field = value` syntax, required comma separators, optional trailing commas, line breaks, and nested records, existing list literals, and parenthesized expressions.
- Old constructor `field: value` syntax is rejected as syntax error `AMX3006`; no deprecation warning, formatter repair, or migration action is added.
- Type declaration fields and variable/parameter/return annotations retain their colon syntax.
- Existing record field checking remains intact, including field access, value type validation, duplicate/unknown fields, required fields, optional fields, and defaults.
- Balanced collection handles strings containing braces, commas, colons, or `=` without treating their contents as structural tokens; it does not consume following statements, narrative, or inert executable fences.
- LF and CRLF produce equivalent parser/checker results and original-source locations for valid, malformed, and incomplete inputs.
- Formatter output for valid multiline records reparses to equivalent meaning and is idempotent. Invalid constructor-colon syntax fails explicitly and remains unrepaired.
- Repository-owned positive fixtures that fail only because checking became strict or record syntax changed are migrated without changing intent. Negative tests remain and continue to reject the invalid cases; no check is weakened or failure hidden by deleting coverage.
- Changes stay within Sprint 052's scope. String escapes/interpolation, list indexing/mutation, units/measurements, and broad Sprint 058 documentation/editor parity are not implemented.
- Focused tests, applicable root repository-owned tests, root build, and relevant desktop/extension checks pass, or exact failures/unavailable checks and residuals are reported. `git diff --check` passes.
- Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` record changed files, exact migration rationale, call-site audit, commands/results, test counts, diagnostics, and residuals.
- A Lead Developer disposition is requested and recorded separately from Builder implementation status. Builder completion is not self-acceptance.

## Required Regression Set

At minimum, tests must cover:

1. An accepted inferred declaration such as `let count = 3`.
2. A rejected previously unchecked type error such as `let count = "three" + 1`, proven not to execute.
3. Strict checking of an imported module and each supported non-file-backed/UI/CLI path.
4. Multiline `type` and record constructor parsing with nested syntax and exact AST/value.
5. Missing comma, unmatched brace, duplicate/unknown/missing fields, and wrong field type.
6. Old constructor-colon rejection (`AMX3006`) alongside still-valid annotation/type-declaration colons.
7. LF/CRLF source positions, formatter idempotence, and refusal to format invalid record syntax.

Sprint acceptance concerns only Sprint 052 behavior. It does not establish completion of V0.9 or downstream sprints.
