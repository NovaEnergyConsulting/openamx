# Sprint 088 Requirements: V0.14 Editor, Examples, and Documentation Integration

## Status and Authority

Sprint 088 integrates the accepted V0.14 language and library features into
shared editor services, the VS Code extension, the desktop workbench, user
documentation/help, and runnable examples. Sprint 084's contract and the
implementation dispositions for Sprints 085, 086, and 087 are ACCEPTED.
This preparation does not authorize Sprint 088 execution. Obtain separate
execution authorization and approval of the concrete file-by-file
implementation/evidence plan before editing source, tests, examples, or
documentation.

Scope authority:

- [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md)
- Accepted Sprint 084 contract:
  [`grammar-examples.md`](../0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md),
  [`diagnostic-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/diagnostic-matrix.md),
  and [`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
- Accepted implementation evidence:
  Sprint 085 [`builder-evidence.md`](../0085-v14-runtime-is-type-checking/builder-evidence.md),
  Sprint 086 [`builder-evidence.md`](../0086-v14-mathematical-standard-library/builder-evidence.md),
  and Sprint 087 [`builder-evidence.md`](../0087-v14-text-and-numeric-formatting/builder-evidence.md)

Sprint 087's focused direct Bun run passed 141 tests with 0 failures across
six files; its core build, generated-runtime inspection, and
`git diff --check` passed. The full root suite remains assigned to Sprint
089. These are prior-sprint results, not Sprint 088 editor or integrated
acceptance evidence.

## Goal

Make the implemented V0.14 language discoverable and authorable consistently
in both editor clients. Publish an additive V0.14 language specification,
link relevant help, and add runnable examples that demonstrate runtime type
checks, mathematical functions/Measurements, and text/numeric formatting.
Verify shared services, actual editor hosts, documentation/help, and examples
directly while preserving accepted V0.14 semantics and existing editor
behavior.

## In Scope

### Shared Editor Services and Host Integration

- Update shared editor analysis and existing authoring services for:
  - The infix `is` operator and type-reference target.
  - `PI`, `E`, the fifteen mathematical functions, and the new text/format
    functions.
  - Source-located diagnostics and signature/type information affected by
    the V0.14 built-ins.
- Preserve existing service architecture. Update only affected capabilities
  that already exist, such as highlighting/tokenization, completion, hover
  or type information, symbols/navigation/references, formatting, and
  diagnostics.
- Integrate affected shared services into both clients:
  - VS Code TextMate grammar, providers, and actual Extension Development
    Host behavior.
  - Desktop CodeMirror authoring services and actual workbench UI behavior.
- Keep editor analysis static and consistent with existing behavior; do not
  execute documents, load runtime inputs, or provide new runtime behavior
  from editor-only code.
- Verify complete and incomplete expressions, type-reference targets,
  function calls, constants, strings/interpolation, and non-AMX/inert
  content. Preserve the original-document source location convention and
  useful errors.

### User Documentation and Help

- Add `docs/language-spec-v0.14.md` as an additive specification, preserving
  links to prior version contracts and stating that it does not itself imply
  V0.14 integrated acceptance, release, publication, or certification.
- Document the accepted `is` syntax, precedence, target visibility and
  resolution, runtime matching rules, diagnostics, enum/Measurement
  behavior, and explicit absence of flow-sensitive narrowing.
- Document all math functions/constants, radians, logarithm bases, approved
  domains and diagnostics, dimensionless Measurement normalization, and
  Measurement-aware standard-library compatibility.
- Document Unicode code-point semantics, the exact trim whitespace set,
  slice boundaries/errors, numeric pattern grammar, supported locales,
  rounding/negative-zero rules, Measurement formatting, and diagnostics.
- Link the new specification and examples from the root README and the VS
  Code extension guide using current project patterns.
- Add a searchable V0.14 language topic to desktop Help. Keep topic IDs
  unique and use relevant search terms.
- Avoid claims that exceed evidence, including full V0.14 acceptance,
  release/publication, platform qualification, or unsupported editor
  behavior.

### Runnable Examples

- Add standalone, runnable examples under `examples/` that collectively
  demonstrate:
  - Runtime `is` checks across representative primitives, structural
    records, enums, lists/optionals, and/or Measurement dimensions.
  - Math functions/constants and Measurement input/result behavior,
    including dimensionless Measurement normalization where useful.
  - Unicode-aware text functions and numeric formatting across supported
    locales, patterns, and a Measurement display unit.
- Proposed example files (final names are subject to the approved plan):
  `examples/v0.14-runtime-type-checks.amx`,
  `examples/v0.14-math-and-measurements.amx`, and
  `examples/v0.14-text-and-formatting.amx`.
- Keep examples within approved V0.14 syntax and current runtime behavior;
  use no external inputs, unapproved functions, or unsupported patterns.
- Add example/documentation regression tests that analyze and execute each
  example, verify representative result bindings, check documentation links
  and desktop Help searchability, and verify formatter idempotence and
  useful source-located diagnostics.

## Out of Scope

- Changes to parser, type-checker, evaluator, `is` semantics, standard
  library, diagnostic identities/messages, Unicode rules, numeric format
  grammar, Measurement behavior, or other accepted runtime contracts.
- New editor capabilities not already supported by the clients, editor
  redesign, or unrelated completion/navigation/refactoring work.
- Additional math/text/format features, locales, Unicode semantics, or
  formatter patterns.
- Full integrated V0.14 acceptance and closeout; Sprint 089 owns cross-surface
  integrated verification and residual disposition.
- Package/version changes, release engineering, publication, platform
  certification, or changes to unrelated desktop/report functionality.

## Constraints and Gates

- Treat Sprint 084's accepted contract and the accepted implementations in
  Sprints 085-087 as immutable behavior authority. If an editor surface or
  example appears to require changing runtime semantics, stop and request a
  separate product decision and approved scope amendment.
- Verify shared services, VS Code, and desktop workbench independently.
  A passing service test does not establish either host's user-visible
  behavior.
- Preserve LF/CRLF and UTF-16 source offsets, diagnostic identity/message,
  and zero-based half-open editor range mapping.
- Preserve existing formatting, diagnostics, completion, symbols/navigation,
  and language analysis outside the additions.
- Keep documentation additive and accurately bounded. Do not claim V0.14
  integrated acceptance, release, publication, or unsupported platform
  behavior.
- Do not count tests or checks from Sprints 085-087 as Sprint 088 evidence.
  The full root, extension, and desktop integrated validation workflows
  remain in Sprint 089 except the direct focused host checks required here.
- Obtain separate Sprint 088 authorization and concrete file-by-file plan
  approval before editing. Include generated artifacts only if individually
  listed and explicitly approved.
