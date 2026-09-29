# 019 Acceptance Criteria

Sprint 019 and V0.3 are complete when:

- A real checked-in typed-data `.amx` example imports an opt-in Asset Management type, declares a custom record, consumes both CSV and JSON fixtures (JSON nesting/lists), invokes a typed pure function, renders computed values, and selects named JSON and CSV exports.
- Tests assert specific expected input/derived values and final bindings from the actual example, not just command exit status; checked-in HTML is regenerated through production `render` and matches an independently invoked render byte-for-byte.
- CLI tests assert exact named exported JSON and CSV bytes (including ordering, dates/null/empty handling as present), repeatability, and supported-shape import/export round trips with declared types.
- Invalid fixtures demonstrate aggregate versus fail-fast on the same errors with precise diagnostic codes, file/input/row or index/field path and expected/actual context; failure leaves HTML/exports unwritten. CLI path overrides are exercised.
- V0.2 example documents and no-option `run`/`render` behavior remain unchanged, including narrative/fence execution boundaries, final-environment interpolation, and HTML escaping.
- Known Sprint 018 record-constructor-in-`match`-arm composition is checked against the spec; any blocking conformance defect has a minimal tested correction, or a clearly documented residual limitation with explicit release disposition. Do not claim it is supported without a passing test.
- The README, authoritative V0.3 spec (if corrections are needed), extension README, migration/compatibility notes, CLI usage, example commands, limitations, and root/extension version metadata reflect observed behavior and each other. Historical V0.2 spec is preserved.
- Root `bun install`, `bun run build`, and `bun test` pass; all checked-in examples render through the CLI, and run/export/validation CLI checks assert actual output and failure behavior.
- Extension dependency install, compile, Extension Development Host tests, local VSIX packaging/install, installed extension listing, and installed-VSIX host checks pass where supported. Record exact artifact/version and any host/package warnings.
- Planning logs record exact commands, test counts, deviations, unresolved limitations, provisional Asset Management domain status, and the absence of a project license decision. Marketplace publication is not required or attempted.
- V0.3 is marked complete only if every required gate passes; if a gate is unavailable, document the blocker and leave release status open.
