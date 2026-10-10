# Sprint 076 Requirements: V0.12 Editor and Language Documentation Integration

## Goal

Integrate the completed V0.12 record inheritance, enum, and braced `if` features into both existing editor clients and the project's language-facing documentation. Publish the additive V0.12 language specification, add runnable examples, and verify formatter/editor behavior across supported existing capabilities.

## Dependencies and Entry Gates

- Sprints 073, 074, and 075 are recorded implemented, with feature fixtures and approved diagnostic allocations. Their `builder-evidence.md` files and Sprint 072 contract fixtures are the inputs and regression baseline.
- Sprint 075's missing-return diagnostic is approved as AMX3021 with exact message and fallthrough closing-brace location; retain this contract.
- Obtain explicit Sprint 076 execution authorization and approval of the concrete file-by-file plan before changing implementation, tests, examples, README, help, or language specification.

## Inputs

- `planning/plan-openamxV12MasterSprintPlan.md`
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 072 grammar examples, diagnostic matrix, and requirement-to-test matrix
- Sprint 073, 074, and 075 requirements, acceptance criteria, and Builder evidence
- Shared editor services in `src/editor/`, formatter in `src/formatter/`, and language/editor test conventions
- VS Code grammar, providers, and Development Host tests
- Desktop CodeMirror workbench, shared analysis services, help content, and existing RPC/UI tests
- Current `README.md`, language specification, examples, and documentation tests

## In Scope

- Create `docs/language-spec-v0.12.md` as the current additive V0.12 core-language specification. Document the exact approved syntax and semantics for record inheritance, enums, and braced `if` expressions/statements; include valid and invalid examples, module/source-order visibility, diagnostics/source locations, and exclusions. Explicitly preserve the V0.9 and legacy conditional behavior not changed by V0.12.
- Add runnable V0.12 examples covering the feature set, including focused examples for records/enums and braced `if` usage. Verify them through existing example/parser/runtime tests; avoid unexecuted or illustrative syntax that contradicts the implementation.
- Update `README.md` to link to the current V0.12 specification and the relevant V0.12 examples while retaining earlier specifications as historical references. Update only directly related language-version/example claims.
- Update desktop language Help so users can find and understand the V0.12 declarations and control-flow forms. Keep the help searchable and consistent with the existing help UI/test contract.
- Update both editor clients using existing architecture:
  - VS Code TextMate grammar, providers, and relevant host tests.
  - Shared AST-derived highlighting, completion, symbols/navigation, diagnostics/source ranges, and supported analysis used by VS Code and desktop.
  - Desktop CodeMirror integration and existing RPC/UI tests where needed.
- Add context-appropriate recognition/completion and symbol behavior for new declarations/references wherever the corresponding editor capability already supports equivalent language constructs.
- Extend the existing formatter for new valid declarations and braced blocks as needed. Verify formatting preserves meaning, parses after formatting, and is idempotent for records/inheritance, enums, braced `if`, and the legacy single-line conditional expression.
- Verify useful diagnostics and original source ranges for the approved V0.12 diagnostics across both editor clients where applicable, including AMX3011-AMX3021.

## Out of Scope

- Changes to the approved feature semantics, parser/runtime/type-checker contracts, diagnostic identities/messages/locations, field ordering, or enum/return behavior.
- New language features, migration guide, general editor redesign, unrelated completion/navigation behavior, new test frameworks, or parallel language services.
- Version/package/extension metadata bumps, release engineering, release publication, or platform certification.
- Claims of editor capabilities not already supported or that cannot be verified in the existing infrastructure.

## Constraints

- The V0.12 master plan and Sprint 072 fixtures, as implemented and clarified by approved Sprint 073-075 decisions, are authoritative. Do not introduce an undocumented contract variation.
- Both editor clients must agree on parser-proven feature syntax, diagnostics, completion/analysis, and formatting; use shared core services wherever they already power both surfaces.
- Keep formatting deterministic and idempotent, preserve semantic meaning and source locations, and preserve existing V0.9-era formatting/conditional behavior.
- Documentation and examples must match implemented behavior exactly. The language spec is an additive documentation artifact, not a claim of release/publication of software or certification.
- Run focused root, VS Code Development Host, and desktop checks using existing project scripts. Record exact results, unavailable checks, and pre-existing residuals without relabeling them as passes.
