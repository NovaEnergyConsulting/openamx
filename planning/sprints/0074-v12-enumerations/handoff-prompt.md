# Sprint 074 Handoff Prompt

You are the Builder for OpenAMX Sprint 074: V0.12 Enumerations.

## Read First

- `.agents/main.md` and the current worktree status; preserve all existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All Sprint 074 artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Sprint 072 `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`.
- Sprint 073 implementation and `builder-evidence.md`; retain its behavior and compare full-suite results with its recorded baseline.
- Current parser, type checker, runtime, module/export flow, diagnostic catalog, and existing tests listed in the blueprint.

## Authority and Entry Gates

- The V0.12 master plan and Sprint 072 enum fixtures are the semantic authority. The approved empty-enum clarification is recorded in `planning/decisions.md`.
- Before code or test edits, obtain explicit Sprint 074 authorization and approval of the concrete file-by-file plan.
- Before implementing enum-specific diagnostics or exact-code assertions for EN-I01–EN-I06, obtain explicit Lead Developer approval of their diagnostic identities/messages. They remain unallocated in Sprint 072. Do not guess codes/messages or silently reuse unrelated diagnostics.

## Task Contract

- Implement enum declarations and member access; implicit Number assignment beginning at 1; homogeneous explicit Number/String literal validation; name/value uniqueness; module visibility; and primitive runtime values.
- Add fixture-derived tests in existing parser, evaluator, and module suites. Include duplicate-value rejection for both Number and String values.
- Do not add a nominal enum type, aliases, flags, mixed-type enums, partial explicit values, or expression-valued members.
- Preserve the completed Sprint 073 record-inheritance behavior.

## Mandatory Boundaries

- Preserve source-order visibility and imports/exports. A declaration is available only under existing module rules.
- `EnumName.Member` must evaluate and type-check as its underlying primitive, not as a nominal enum value.
- Reject empty enums as explicitly clarified in Sprint 072.
- Keep source locations aligned with the fixture matrix. Until the diagnostic allocation is approved, the affected cases remain blocked.
- Do not implement editor/formatter integration, publish the language specification, update examples/help, or perform release work.
- Run focused parser/evaluator/module tests, the root build, and the full root suite as specified in the blueprint. Record exact results, including the Sprint 073 baseline failures.

## Completion

Meet every criterion in `acceptance.md` and record evidence in `builder-evidence.md`. If any diagnostic gate or required fixture remains unresolved, do not describe Sprint 074 as complete.
