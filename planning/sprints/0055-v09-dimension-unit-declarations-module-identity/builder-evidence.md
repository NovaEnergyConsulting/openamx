# Sprint 055 Builder Evidence

Date: 2026-10-06

## Outcome

Implemented module-level dimension/unit declarations, normalized identity metadata, explicit declaration exports/imports/re-exports, the exact optional SI library, and a metadata-only registry returned by module loading. The Lead Developer verified the evidence and approved Sprint 055 as COMPLETE / APPROVED on 2026-10-06. This does not implement measurement values, attachment, arithmetic/conversion, external data, or reporting.

The Lead Developer selected `export { Name, ... }` as the explicit re-export form because the contract required identity-preserving re-exports without specifying their syntax. Re-exported metadata retains the original base-dimension identity and unit identity.

## Implementation

- Added AST and parser support for base/derived `dimension`, base/scaled/derived `unit`, `export dimension`, `export unit`, and `export { Name, ... }`. Declaration expressions preserve original source locations.
- Added ordered, metadata-only checking. Base identity is the canonical module path plus declaration name; derived dimensions use sorted sparse integer-exponent vectors keyed by base identity. Unit metadata records declared identity, normalized vector, and validated positive finite scale.
- Enforced visible prior declarations/imports, declaration collisions, module scope, one independent base unit per base identity across the traversed graph, and explicit re-exporting. Semantic declaration failures use `AMX3008`; malformed declaration syntax uses `AMX3006`.
- Extended runtime/editor module graph metadata for explicit imports and re-exports. Re-exporting copies the original metadata rather than declaring a new dimension identity. Existing path containment and dependency caching remain in place.
- Added `LoadedEntryModule.registry`, populated during the existing graph check. Input/output inspection returns this registry without evaluating module statements or reloading modules.
- Added `libraries/si.amx` with the approved 7 base dimensions, 7 base units, 9 scaled units, 21 aliases, 9 derived dimensions, and 9 derived units. The exact declaration test reads the approved inventory table from the Sprint 051 blueprint and compares the library's exported declaration lines against it, then checks resolved dimensions/scales and aliases.
- Shared editor module analysis resolves imported dimension/unit metadata, canonicalizes real paths consistently with the module loader, and reports declaration names/source facts. No measurement expression/runtime integration was added.

## Changed Files

- `docs/language-spec-v0.9.md`
- `libraries/si.amx`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/state.md`
- `planning/sprints/0055-v09-dimension-unit-declarations-module-identity/blueprint.md`
- `planning/sprints/0055-v09-dimension-unit-declarations-module-identity/builder-evidence.md`
- `src/ast/types.ts`
- `src/diagnostics/errors.ts`
- `src/editor/completion.ts`
- `src/editor/highlighting.ts`
- `src/editor/moduleAnalysis.ts`
- `src/editor/sourceRanges.ts`
- `src/editor/symbols.ts`
- `src/parser/parseStatements.ts`
- `src/runtime/evaluateExpression.ts`
- `src/runtime/moduleLoader.ts`
- `src/typechecker/checkDocument.ts`
- `src/typechecker/dimensionTypes.ts`
- `tests/dimensions.test.ts`

## Verification

| Command | Result |
| --- | --- |
| `bun run build` | Pass; root TypeScript compilation. |
| `bun test tests/dimensions.test.ts tests/parser.test.ts tests/modules.test.ts tests/editor.test.ts` | Pass: 105 tests, 0 failures, 504 expectations across 4 files. |
| `bun test` | Pass: 355 tests, 0 failures, 1,650 expectations across 29 files. |
| `Set-Location desktop-app; bun test` | Pass: 27 tests, 0 failures, 143 expectations across 8 files. |
| `Set-Location desktop-app; bun run typecheck` | Pass. |
| `Set-Location vscode-extension; bun run test` (isolated final run) | Extension compilation and test compilation pass. Windows Extension Development Host: 15 pass, 5 fail (four `EBUSY` temporary-directory cleanup failures and one drive-letter casing assertion: actual `c:\...` versus expected `C:\...`). This remains an unpassed host result, not a pass. |
| `git diff --check` | Pass after final closeout edits. |

The isolated extension host residuals match the known Windows profile. A concurrent host run alongside root/desktop tests reported 14 pass / 6 fail (five `EBUSY` cleanup failures and the same drive-letter assertion); the isolated rerun returned the established 15/5 profile. No Sprint 055-specific failing assertion remained after aligning editor path canonicalization with the module loader's existing `realpathSync` behavior.

## Regression Coverage

Focused tests cover syntax/source positions, unknown and forward references, collisions, local scope, vector normalization, valid and invalid scales, independent-unit uniqueness across modules, exact SI declarations/aliases/omissions, explicit visibility, canonical paths, independent same-name dimensions, identity-preserving re-exports, editor module analysis, and schema-inspection registry availability without statement execution.

Existing module tests continue to cover containment, source ordering, export behavior, and single evaluation. Existing strict-checking and list tests are included in the green root/desktop suites.

## Disposition

**Lead Developer disposition (2026-10-06): COMPLETE / APPROVED.** The Lead Developer verified the evidence and approved Sprint 055. The Windows Extension Development Host failures remain documented as unpassed residuals, not passing checks. This approval does not claim downstream measurement/data/report functionality.
