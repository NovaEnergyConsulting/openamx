# Sprint 072 Handoff Prompt

You are the Builder for OpenAMX Sprint 072: V0.12 Language Contract and Acceptance Fixtures.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user changes.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV12MasterSprintPlan.md`.
- All four Sprint 072 planning artifacts: `requirements.md`, `blueprint.md`, `acceptance.md`, and this handoff.
- Existing parser, diagnostic, formatter, module, and test conventions referenced by the V0.12 master plan, only as needed to make the fixtures accurate.

## Authority and Scope

- The V0.12 master plan is the scope authority. Sprint 072 turns its confirmed semantics into an implementation-ready contract; it does not redesign the language.
- Produce the three artifacts listed in the blueprint: `grammar-examples.md`, `diagnostic-matrix.md`, and `requirement-test-matrix.md`.
- Do not edit production code, the language specification, examples, editor clients, or normal feature test suites in this sprint. Sprints 073-075 own feature implementation and executable feature tests; Sprint 076 owns editor/documentation integration.
- This handoff is not authorization to execute Sprint 072. Obtain explicit Sprint 072 authorization and approval of the concrete file-by-file plan before editing.

## Mandatory Boundaries

- Represent every relevant master-plan behavior with stable fixture IDs and trace it to expected outcomes and test ownership.
- Cover valid and invalid inheritance, enum, and braced `if` cases, including modules, source locations, formatter expectations, and legacy conditional-expression preservation.
- Use 1-based locations in the original document and UTF-16 code-unit columns. Include front matter/fence text when calculating coordinates.
- Reuse established diagnostic conventions. Do not invent codes, messages, semantics, or coercions to make an example convenient. Record unresolved behavior in `planning/questions.md` and identify which later sprint is blocked.
- Keep fixture text and expectations consistent across all three artifacts. Separate confirmed requirements from implementation suggestions.
- No V0.12 behavior is described as implemented or verified. No release or publication claim is authorized.

## Completion

Meet every criterion in `acceptance.md`. Update `planning/state.md` with exact artifact/status information and `planning/decisions.md` only for approved clarifications. If a genuine semantic ambiguity remains, request the required Lead Developer decision and leave the affected contract row blocked; do not present Sprint 072 as implementation-ready for that dependency.
