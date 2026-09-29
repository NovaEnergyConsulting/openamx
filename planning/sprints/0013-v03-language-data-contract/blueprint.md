# Sprint 013 Blueprint: V0.3 Language and Data Contract

## Approach

- Make `docs/language-spec-v0.3.md` the sole V0.3 implementation contract and preserve the V0.2-only execution/rendering path.
- Gate static checking on V0.3 syntax or CLI options; when active, check the complete entry/module graph before evaluation.
- Specify nominal closed records, nested lists/nullable types, required/optional/default materialization, contextual DateTime literals, and typed constructors/field access.
- Keep functions expression-bodied and non-recursive, with no document captures, later-function references, or expression loops.
- Require explicit named exports and relative `.amx` imports within the canonical entry directory tree; resolve dependencies by source-order DFS and reject cycles before evaluation.
- Keep logical input declarations in the entry module and physical paths at the CLI boundary. JSON maps recursively; CSV maps only scalar-field record lists with explicit null/empty-cell rules.
- Define aggregate/fail-fast validation order, stable diagnostic families and source/data context, named output selection, deterministic serialization, and unsupported-shape errors.
- Specify the six Asset Management records as initial structural shapes only; require later domain review before treating them as stable.

## Files to Update

- `docs/language-spec-v0.3.md`
- `planning/sprints/0013-v03-language-data-contract/requirements.md`
- `planning/sprints/0013-v03-language-data-contract/blueprint.md`
- `planning/sprints/0013-v03-language-data-contract/acceptance.md`
- `planning/sprints/0013-v03-language-data-contract/handoff-prompt.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

## Notes

- Sprint 014 must implement checking across the complete V0.2 surface whenever the V0.3 checker is activated, without changing V0.2-only behavior.
- CSV nested values and JSON-in-cell conventions are rejected; null and empty strings have distinct CSV encodings.
- The domain-review ambiguity is recorded in `planning/questions.md`; it does not block the general type/data contract but remains a gate before standardizing the opt-in library.
- Sprint 013 changes documentation/planning files only. Implementation begins in Sprint 014 after this contract is reviewed and accepted.
