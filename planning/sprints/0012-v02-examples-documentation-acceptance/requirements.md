# 012 Requirements: V0.2 Examples, Documentation & Acceptance

## Goal

Close the V0.2 delivery by providing two end-to-end asset-management examples, accurate V0.2 user/editor/CLI documentation, and a fully verified integrated core-plus-extension release candidate. Prove the executable-fence migration, mutation, ranges/loops, match, formatter, HTML rendering, and final-environment interpolation using explicit expected results.

## Inputs

- Approved master plan: `planning/plan-openamxV02MasterSprintPlan.md`, Sprint 012.
- Authoritative language contract: `docs/language-spec-v0.2.md`.
- Completed Sprint 007–010 core parser/runtime/formatter/renderer and Sprint 011 VS Code extension.
- Current `README.md`, `examples/`, generated example HTML, root `package.json`, and `vscode-extension/` package scripts/docs.
- Current test suites and acceptance/completion records in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.

## In Scope

- Replace/populate canonical end-to-end examples for:
  - A Power Transformer Failure Mode Analysis (FMEA), using general-purpose OpenAMX syntax only.
  - An asset-fleet Risk Analysis, using general-purpose OpenAMX syntax only.
- Across the two examples collectively demonstrate front matter, narrative, executable `amx` blocks, mutation/repeated `let`, assignment or `+=`, a list/range loop, an expression loop with per-iteration `return`, match selection/default behavior, inline `{{ }}` interpolation, and final-environment resolution after a later block mutates a binding.
- Include meaningful calculations and narrative suitable for the stated examples without adding domain-specific parser/runtime/library concepts. State the input values and expected outputs explicitly in tests/docs.
- Regenerate and check in each example's standalone HTML output using the existing CLI. Confirm visible canonical formatted source, correct HTML escaping, rendered Markdown structure, expected interpolated results, and no execution of ordinary fences/bare declarations.
- Add/update end-to-end tests against the actual example files and pipeline. Assert explicit final values and rendered values rather than merely asserting that commands exit successfully. Keep tests focused and reuse existing test helpers/utilities.
- Update `README.md` as the V0.2 getting-started guide: Bun install/build/test, V0.2 syntax and breaking migration, `render`/`run` usage, canonical examples, current limitations, extension setup/commands, local VSIX installation, and no Marketplace publication claim.
- Update `docs/language-spec-v0.2.md` for any verified corrections discovered by end-to-end acceptance; keep it authoritative and consistent with implementation. Do not redefine settled Sprint 007–011 behavior without recording/approving a real discrepancy.
- Ensure extension README and package scripts referenced from the root README are accurate. Fix only documentation/script mismatches required for acceptance; do not add extension features.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`: record V0.2 acceptance status and exact verification results, retain limitations/deviations, and record ordered V0.3 roadmap candidates exactly as follows: (1) tables/charts; (2) units/currency; (3) reusable/imported `.amx`; (4) Asset Management domain libraries; (5) data imports; (6) Word/PDF export; (7) multi-file workflows; (8) richer validation; (9) AI-assisted authoring.
- Record that the repository currently has no license file and VSIX packaging required confirmation; do not choose or invent a license. Marketplace publication remains out of scope and requires an explicit project license decision/file.
- Run complete verification: root install/build/tests, render both examples, run both examples and assert expected values, extension install/compile/host tests/package/local installation, and test the installed VSIX where supported. Summarize exact commands/results, residual limitations, and next steps.

## Out of Scope

- New core syntax/runtime behavior, parser/AST redesign, renderer/formatter changes except a directly required bug fix exposed by acceptance, or extension provider features.
- Marketplace publication/upload, signing in, publisher verification, release automation, or deciding/adding a project license.
- Any V0.3 candidate implementation.
- New Asset Management-specific core functions, types, schemas, or syntax.
- Broad repository/package restructuring, dependency upgrades unrelated to a verified blocker, or unrelated cleanup.

## Constraints

- Keep core language/parser/runtime/formatter domain-neutral. Asset-management content belongs in example text and values only.
- Preserve the V0.2 breaking migration: only exact executable `amx` fences execute; bare V0.1 declarations and ordinary fenced code remain narrative/non-executable.
- Keep V0.2 semantics and existing APIs stable. Any defect fix must be narrow, tested, and documented; do not use acceptance as a reason to silently alter the contract.
- Use Bun for the root project and extension package scripts as documented. VS Code tests must run in the supported Node-based Extension Development Host.
- Preserve deterministic standalone HTML output and HTML-escape executable code. Do not interpolate executable source.
- Don't claim Marketplace readiness/publication is fully cleared while the license decision remains unresolved; local VSIX generation and installation are the required artifact checks.
- Keep root `bun run build && bun test` green; run the full Sprint 011 verification and local package-install checks.
