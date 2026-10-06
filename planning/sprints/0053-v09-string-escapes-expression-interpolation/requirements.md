# Sprint 053 Requirements: String Escapes and Expression Interpolation

## Goal

Implement V0.9 string escape decoding and expression interpolation. Double-quoted strings interpolate full AMX expressions using `${...}`; single-quoted strings remain non-interpolating. Both quote styles decode the approved escapes, reject unknown/incomplete escapes, and preserve single-line raw source strings. Handle nested delimiters/quotes and report accurate diagnostics/source locations across parser, evaluator, formatter, and existing editor analysis surfaces.

Sprint 053 owns string behavior only. Measurement interpolation display is coordinated with Sprint 056, and broad editor parity/documentation remains Sprint 058.

## Dependencies and Entry Gate

- Sprint 053 depends on Sprint 052, which is **ACCEPTED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-06.
- Sprint 052 implementation evidence records unconditional checking, multiline records, fixture migrations, and passing focused/root/desktop verification. The Windows VS Code Extension Development Host suite has five retained failures (four temporary-directory `EBUSY` cleanup failures and one drive-letter case assertion); it must not be described as passing. This accepted residual does not block Sprint 053.
- Read the approved V0.9 contract in `docs/language-spec-v0.9.md` and the approved Sprint 051 Builder Contract Proposal in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`.
- `planning/plan-openamxV09MasterSprintPlan.md` and the approved V0.9 contract are authoritative. If implementation exposes an ambiguity or requires a scope change, record the concrete case in `planning/questions.md` and obtain Lead Developer direction before changing behavior.
- Preserve unrelated or user-owned work. Inspect current repository state before editing.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Sprint 053 scope and dependency sequence
- `docs/language-spec-v0.9.md`, especially the string contract and compatibility section
- Approved Sprint 051 contract appendix, precedence/conformance matrix, diagnostics, and cross-surface audit
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- `src/ast/types.ts`, expression parser/tokenizer, statement/document parser, evaluator, type checker, formatter, diagnostics, shared editor analysis/source ranges/highlighting
- VS Code grammar and providers, desktop editor/worker/RPC surfaces where directly affected
- Existing string/parser/evaluator/formatter/editor tests, examples, and string-bearing fixture inventory

## In Scope

- Parse and evaluate full AMX expressions inside `${...}` in double-quoted strings. Use the AMX expression parser/checker/evaluator; never use host-language evaluation.
- Keep single-quoted strings non-interpolating. An unescaped `${...}` in a single-quoted string remains literal string content, subject to the approved escape rules.
- Decode exactly the approved escapes in both quote styles: `\"`, `\'`, `\\`, `\n`, `\r`, `\t`, and `\${` (literal interpolation opener). Reject unknown escapes and incomplete escape sequences.
- Keep raw string spelling single-line. Escaped `\n`/`\r` yield newline/carriage-return characters in the decoded value but do not permit literal source line breaks in a quoted string.
- Correctly balance nested braces and delimiters in interpolation expressions, including nested AMX expressions and quoted strings inside expressions. Escaped quotes and literal interpolation-open escapes must not prematurely terminate scanning.
- Enforce existing pure-expression restrictions inside interpolation. Interpolations are checked statically and evaluated with the normal AMX semantics, not as statements or side-effecting host code.
- Convert only approved scalar values implicitly: String content, deterministic locale-independent Number text, lowercase `true`/`false`, `null`, and—when the measurement value type is delivered in Sprint 056—measurement display text `value unit`. Lists and records must be rejected rather than implicitly serialized.
- Use approved diagnostic `AMX3006` for invalid/incomplete string syntax, unknown escapes, and malformed interpolation; use approved `AMX3007` for invalid interpolation value types where applicable. Preserve original source positions, including multiline document offsets and LF/CRLF handling.
- Preserve existing narrative interpolation as a separate feature with its final-environment contract. String interpolation must not replace or alter narrative interpolation timing/semantics.
- Wire the parser/evaluator and focused formatter/editor behavior needed for this syntax. Keep syntax coloring and diagnostics bounded to executable AMX content; do not apply AMX behavior to narrative or inert fences.
- Add focused positive/negative tests and migrate only affected positive string fixtures if the approved escape change requires it. Retain negative rejection coverage.
- Coordinate future measurement-to-string verification with Sprint 056; avoid duplicate or premature measurement implementation.
- Record exact changed files, escape/interpolation fixtures, diagnostics/locations, executed commands/results, and residuals in Sprint 053 Builder evidence and planning records.

## Out of Scope

- Measurement runtime/type support and measurement-to-text conversion before Sprint 056.
- 1-based list indexing, list mutation, or changed loop behavior; Sprint 054 owns those.
- Dimension/unit declarations, SI library, conversion, or measurement arithmetic; Sprints 055-056 own those.
- Data/reporting measurement integration and broad editor parity, migration documentation, bundled help, and integrated V0.9 acceptance; Sprints 057-058 own those.
- New general serialization/stringification functions. Lists and records are not to gain implicit text conversion.
- Multiline raw strings, new quote forms, template syntax beyond `${...}`, nested interpolation in single-quoted strings, or unrelated expression/operator changes.
- Changing final-environment narrative interpolation, executable-fence boundaries, pure-function rules, export atomicity, or report snapshots.
- Reworking the accepted Sprint 052 residual as if its host tests passed; unrelated cleanup of those failures is not Sprint 053 scope unless a concrete regression blocks string acceptance.

## Constraints

- Preserve the exact escape set and behavior in the approved language contract. Do not pass unknown escapes through silently or decode arbitrary host-language escape syntax.
- `${...}` is recognized only in double-quoted AMX strings. `\${` decodes to literal `${` and does not begin interpolation. Single-quoted strings do not interpolate.
- Interpolation expression parsing must correctly handle nested braces, quoted strings, escaped quote characters, and nested delimiters, while keeping all reported spans mapped to original source text.
- Require static type checking of interpolation expressions before evaluation. Invalid interpolation must fail explicitly and must not produce a success-shaped partial string.
- Strings/Numbers/Booleans/null have deterministic locale-independent formatting. Do not stringify collections.
- Preserve valid legacy behavior except the approved backslash escape change. Migrate source spellings only where required to preserve intended literal backslashes.
- Keep parser, formatter, evaluator, CLI, shared editor analysis, VS Code, and desktop behavior consistent where the same path exists. Do not mark unsupported/unrun host checks as passed.
- No dependency or broad UI changes without a demonstrated need; keep changes surgical and follow existing parser/diagnostic/formatting patterns.
