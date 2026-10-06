# Sprint 053 Handoff Prompt

You are the Builder for OpenAMX Sprint 053.

## Read First

- `.agents/main.md` and applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV09MasterSprintPlan.md` and `docs/language-spec-v0.9.md`
- The approved Sprint 051 contract and cross-surface audit in `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- Sprint 052 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 053 `requirements.md`, `blueprint.md`, and `acceptance.md`
- String scanning/tokenization, expression parser, AST, checker, evaluator, formatter, diagnostics/source mapping, shared editor analysis, VS Code grammar/providers, desktop editor/worker, and affected tests/fixtures

## Entry Gate

Sprint 052 is **ACCEPTED WITH RECORDED RESIDUALS** by Lead Developer disposition dated 2026-10-06. Its implementation is the dependency baseline for Sprint 053. The five Windows VS Code Development Host failures (four `EBUSY` temp cleanup failures and one drive-letter case assertion) remain explicitly unpassed; do not describe the suite as green. They do not block Sprint 053 unless a demonstrated regression prevents this sprint's acceptance.

## Objective

Implement approved string escapes and expression interpolation with AMX parsing, static checking, evaluation, diagnostics, source mapping, formatting, and focused editor support.

## Task Contract

**owns**: String tokenizer/parser representation; exact escape decoding; double-quoted `${...}` parsing/evaluation; type checking and approved scalar text conversion; malformed/incomplete diagnostics/source ranges; directly affected formatter/editor behavior; focused string fixture migrations and tests.

**must_not**: Evaluate host code; interpolate single-quoted strings; pass unknown escapes silently; stringify lists/records; add raw multiline strings; change narrative interpolation timing; implement list mutation/indexing, units/measurements, or broad V0.9 docs/help/editor parity; claim the Sprint 052 host suite passed.

**decision gates**: Preserve the exact approved rules and diagnostic allocations (`AMX3006` syntax, `AMX3007` invalid type/operator). Keep strings single-line in raw source and map embedded expression diagnostics to original source. If a needed choice is absent from the contract, record it in `planning/questions.md` and seek Lead Developer direction before changing semantics.

**acceptance**: Meet every criterion in `planning/sprints/0053-v09-string-escapes-expression-interpolation/acceptance.md`.

## Verification

1. Test full-expression interpolation in double quotes and literal `${...}` in single quotes.
2. Test every approved escape in both quote styles, unknown/trailing escapes, malformed/incomplete strings, and nested interpolation delimiters/quotes.
3. Prove static checking and AMX evaluation are used; test pure-expression restrictions and rejection of list/record implicit stringification.
4. Assert exact scalar text for strings, Numbers, Booleans, and null. Coordinate measurement display testing with Sprint 056 rather than inventing it here.
5. Verify original-source diagnostic ranges for LF/CRLF and incomplete editor states; verify narrative/inert-fence isolation and formatter stability.
6. Run focused and applicable root/desktop/extension checks, record exact results including failures/unavailable host checks, and run `git diff --check`.
7. Record migrations, changed files, results, and residuals in Builder evidence and planning records; request a separate Lead Developer disposition. Do not self-accept or claim other V0.9 feature groups.
