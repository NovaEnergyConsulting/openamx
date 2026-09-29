# 012 Acceptance Criteria

012 is complete when:

- The examples include a Power Transformer Failure Mode Analysis and an asset-fleet Risk Analysis, with `.amx` sources and generated standalone `.html` output.
- Across the examples, real production parsing/evaluation/rendering demonstrates front matter, narrative, exact executable `amx` fences, mutation/repeated `let`, assignment/`+=`, explicit lists and/or ranges, statement and expression loops with per-iteration returns, match literal cases/default, and `{{ }}` interpolation.
- At least one narrative placeholder occurs before a later code block mutates its binding, and the rendered value proves that all blocks execute before interpolation.
- Each example has an explicit expected final context and key expected rendered values asserted by end-to-end tests against the actual example files. Tests also prove formatted source is visible/escaped, Markdown structure is preserved, and ordinary fences/bare declarations do not execute.
- Both generated HTML files are refreshed from their `.amx` sources using the CLI and contain standalone HTML structure, canonical formatted visible executable source, correct final-context substitutions, and no raw executable markup injection.
- `README.md` is a V0.2 guide and accurately documents Bun setup/build/tests, language overview, migration from bare V0.1 declarations into `amx` fences, `render` and `run`, the canonical examples, known limits, VS Code engine floor/setup, and extension compile/test/package/local install commands. It does not claim Marketplace publication.
- `docs/language-spec-v0.2.md` agrees with the implemented language and formatter/renderer/extension behavior; any discovered contract correction is narrow, evidence-based, and recorded in decisions/questions.
- `vscode-extension/README.md` and package scripts match commands run during acceptance; VS Code remains Node-hosted and the extension uses publisher `EngineersTools`.
- The complete core gate passes: `bun install`, `bun run build`, and `bun test`.
- Both source examples render successfully through their package scripts/CLI; `run` output or test assertions confirm all expected values.
- The extension gate passes: `cd vscode-extension && bun install && bun run compile && bun run test && CI=1 bun run package && bun run install-local` (or documented equivalent), and local extension listing confirms the installed publisher/name/version. Where supported, the installed VSIX also passes the Extension Development Host provider tests against a real `.amx` document.
- Any VSIX no-license warning is accurately recorded. No license was selected or added without project authorization; Marketplace publication remains blocked/deferred until an explicit license decision is made.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` record Sprint 012 completion, actual verification counts/results, remaining limitations, and the following ordered V0.3 candidates without implementing them: tables/charts; units/currency; reusable/imported `.amx`; Asset Management domain libraries; data imports; Word/PDF export; multi-file workflows; richer validation; AI-assisted authoring.
- The final V0.2 state is marked complete only if core, example, extension-host, packaging, and local-install checks pass. Deviations/blockers are explicitly stated and not represented as passed.
- No new core Asset Management syntax/libraries, LSP, extension feature, or V0.3 capability is introduced.
