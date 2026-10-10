# Sprint 076 Acceptance Criteria

Sprint 076 is complete when the current V0.12 specification, examples, desktop help, formatter integration, and both editor clients consistently represent all approved V0.12 features. This is not the final V0.12 closeout; Sprint 077 owns integrated acceptance.

## Language Documentation and Examples

- `docs/language-spec-v0.12.md` is a complete, internally consistent additive specification for the approved record inheritance, enum, and braced `if` contracts.
- The specification documents inheritance as property reuse without subtyping; multiple/transitive parents; collision/override requirements; approved effective-field ordering; complete override field-contract replacement; complete child construction; module/source-order rules; and relevant diagnostics.
- The specification documents implicit enum numbering from 1; explicit homogeneous Number/String literals; uniqueness; empty-enum rejection; primitive member access; source-order/module rules; and exclusions.
- The specification documents the retained legacy conditional, braced expression/statement distinction, expression `else` and all-path value-return requirements, AMX3021, local return behavior, branch scope, outer assignments, Boolean conditions, type compatibility, and selected-branch evaluation.
- `README.md` links the V0.12 specification and both V0.12 runnable examples, while preserving previous specifications as historical references and without making release/version metadata claims.
- `examples/v0.12-records-and-enums.amx` and `examples/v0.12-braced-if.amx` parse and execute through existing paths with expected results. Examples contain no unsupported or misleading syntax and are covered by `tests/examples.test.ts`.
- Desktop Help provides a unique, searchable V0.12 language topic and accurately explains the additive syntax. The help UI test validates the topic ID, search terms, and key displayed contract statements.

## Formatter and Shared Editor Behavior

- Formatting is deterministic and idempotent for inherited type declarations, `override` fields, enum declarations, braced expression/statement forms, nested blocks, and the legacy single-line conditional.
- Parse-format-parse accepts the formatted output and retains evaluated meaning. Existing formatting behavior outside the new grammar remains unchanged.
- Shared editor facts recognize and map the correct source ranges for new declarations, keywords, enum members/references, inherited fields, and nested expression/block content.
- Completion offers only visible, parser-proven V0.12 declarations/members/keywords at applicable contexts and respects source order and module visibility.
- Symbols/outline, definitions/references, rename, and related existing analysis include new declarations/references only where those services support corresponding existing language entities; invalid or ambiguous syntax never produces fabricated targets.
- Diagnostics in both clients preserve approved identities and meaningful source ranges, including AMX3011-AMX3021 and established existing IDs for fixture cases.
- Original source offsets/ranges remain correct for LF and CRLF input, and executable-code highlighting/analysis does not leak into narrative or inert fences.

## VS Code and Desktop Editor Parity

- VS Code TextMate highlighting covers the new declaration/control-flow syntax and preserves existing Markdown, inert fence, and interpolation scopes.
- VS Code formatting, diagnostics, completion, outline/symbols, definitions/navigation, and supported related analysis recognize the V0.12 fixtures through existing providers.
- Desktop CodeMirror/shared editor highlights, diagnostics, completion, and symbol/navigation integration recognizes the same valid and invalid fixture cases through existing shared services.
- Existing host/UI tests are extended for representative editor behavior, including direct grammar-token checks in VS Code and rendered V0.12 Help checks in desktop.
- No new parallel editor service or unrelated UI feature is introduced.

## Verification, Evidence, and Boundaries

- Focused root parser/evaluator/formatter/editor/module/example suites pass and root build passes.
- VS Code Development Host suite runs and exact result is recorded.
- Desktop typecheck, web build, RPC contract checks, and focused help/editor UI tests run; exact statuses and inherited residuals are recorded.
- Full root suite runs and is compared with Sprint 075's result (454 passed, 2 inherited failures across 456 tests / 35 files). Any changed/new failure is investigated; no failure is omitted or represented as a pass.
- `builder-evidence.md` maps master-plan/editor/documentation requirements to files and direct tests/actions, and records exact commands, results, environment limitations, and residual owners.
- Changes remain within language documentation/examples, formatter and existing editor integration/tests, and necessary planning evidence. No feature contract, package version, release behavior, or certification claim changes.
- Sprint 076 completion does not replace Sprint 077 cross-surface integrated acceptance or authorize software release/publication.
