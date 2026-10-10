# Sprint 073 Handoff Prompt

You are the Builder for OpenAMX Sprint 073: V0.12 Record Inheritance.

## Read First

- `.agents/main.md` and the current worktree status; preserve all existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All Sprint 073 artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Sprint 072 `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`.
- Current AST/parser/type-checker/runtime/module/input/output paths and the focused tests listed in the blueprint.

## Authority and Entry Gates

- The V0.12 master plan and Sprint 072 fixtures are the semantic authority. The approved effective-field order is recorded in `planning/decisions.md` and repeated in the requirements/acceptance.
- Before any code or test edits, obtain explicit Sprint 073 authorization and approval of the concrete file-by-file plan.
- Before implementing new diagnostic identities/messages or exact-code assertions for RI-I01, RI-I02, RI-I03, and RI-I07, obtain explicit Lead Developer approval of the diagnostic allocation. These categories remain unallocated in Sprint 072. Do not guess or silently reuse an unrelated code.

## Task Contract

- Implement only V0.12 record inheritance: parent parsing/resolution, effective-field composition, strict override validation, effective child construction/validation, and directly affected record-consumer behavior.
- Add executable fixture-derived tests in existing suites. Include focused coverage for field ordering and preserve declaration-origin dimension/unit context when fields/defaults come from imported parents.
- Keep child and parent record types distinct. Inheritance is property reuse, not subtyping.
- Do not implement enums, braced `if`, editor integration, formatter/documentation integration, release tasks, or unrelated refactors.

## Mandatory Boundaries

- Preserve the existing syntax, source-order visibility, imports/exports, default/optional rules, and source-location convention.
- Effective fields are composed by parent-list order using each parent's effective order; first occurrence fixes the position; a child override replaces in place; child-only fields append in child declaration order.
- RI-I01–RI-I03 and RI-I07 cannot be claimed as passing without the approved diagnostic allocation and exact fixture-derived assertions. If approval is pending, record the cases as blocked and request direction.
- A change to diagnostic locations, type assignability, field contract replacement, or module visibility requires a separate Lead Developer decision.
- Run the focused suites, root build, and full root suite specified in the blueprint. Record exact outcomes and inherited failures without masking them.

## Completion

Meet every criterion in `acceptance.md` and record evidence in `builder-evidence.md`. If a required category is blocked, incomplete, or deviates from the fixture contract, do not describe Sprint 073 as complete.
