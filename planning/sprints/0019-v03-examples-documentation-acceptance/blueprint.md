# 019 Blueprint: V0.3 Examples, Documentation, and Acceptance

## Approach

- Create a small, auditable typed-data analysis rather than adding multiple disconnected examples. Import the opt-in library from the example's local module root (use an in-root copy or entry layout as needed by the established containment rule), define a custom record, load CSV record rows and nested JSON data, calculate a named score via a typed pure function, and export a typed list to CSV plus a record/list to JSON.
- Select concrete fixture rows and write their expected calculated values into tests. Use a deliberate example-specific formula, documented as illustrative rather than a domain standard; do not change the six library schemas.
- Build one focused integration suite around actual checked-in `.amx` and fixture files. Run the production CLI to isolated output paths, compare generated JSON/CSV byte-for-byte to explicit expected bytes, assert rendered HTML values and escaping, and compare checked-in HTML to the production render output.
- Exercise aggregate and fail-fast validation against the same bad input and compare deterministic ordered diagnostics, nonzero exits, and absence of output files. Include CLI mapping overrides and representative JSON/CSV supported-shape round trips.
- Review the known Sprint 018 constructor-as-`match`-arm parser limitation against the authoritative grammar. If acceptance exposes a contract defect, fix only that composition with a regression; otherwise document it as a verified limitation and do not silently claim full conformance.
- Align README/spec/editor instructions, migration guidance, limitations, package versions and commands with verified behavior. Regenerate example HTML and repackage/reinstall the extension after any metadata changes.
- Close only after the root and extension gates, all old and new example renders, CLI run/export/validation assertions, and installed VSIX host verification succeed; document exact results and genuine residuals.

## Files to Update

- `examples/` (one typed-data `.amx` example, JSON/CSV input and invalid fixtures, generated HTML, and any in-root opt-in library copy required by the import boundary)
- `tests/examples.test.ts` or one focused V0.3 integration test file
- `README.md`, `docs/language-spec-v0.3.md` (factual corrections only), `vscode-extension/README.md`, and focused migration/compatibility documentation if needed
- Root/extension `package.json`, lockfiles where present, `src/cli.ts` version string, and VSIX install script only for aligned release metadata/scripts
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Product implementation/tests outside the above only to repair a demonstrated blocking acceptance defect

## Notes

- The loader constrains imports to the entry directory tree. Keep the example runnable with ordinary documented commands rather than weakening module path security for a convenient import.
- Runtime/data diagnostics are CLI validation; the extension reports parser/static/link diagnostics, not CSV/JSON runtime results.
- A local VSIX is required, but Marketplace publication remains deferred pending the project license decision.
- The V0.2 language spec remains the historical contract; migration notes should explain the additive V0.3 path, not rewrite V0.2 behavior.
