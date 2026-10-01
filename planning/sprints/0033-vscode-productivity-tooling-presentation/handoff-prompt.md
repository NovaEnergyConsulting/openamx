# Sprint 033 Handoff Prompt

You are the Builder for OpenAMX Sprint 033.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`, especially section 6
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/acceptance.md`
- `planning/sprints/0033-vscode-productivity-tooling-presentation/requirements.md`
- `planning/sprints/0033-vscode-productivity-tooling-presentation/blueprint.md`
- `planning/sprints/0033-vscode-productivity-tooling-presentation/acceptance.md`
- `vscode-extension/src/extension.ts`, `vscode-extension/src/providers/`, `vscode-extension/src/test/providers.host.ts`, `vscode-extension/package.json`

## Task Contract

**entry gate**: Sprint 028's product/extension contract is approved. Sprint 033 does not depend on Sprint 029/030 desktop acceptance or Sprint 032 manual export review; keep their exceptions visible for Sprint 034 rather than silently closing them.

**objective**: Add trustworthy direct Node-host hover, definition, outline, references and diagnostic-grounded safe code actions to the existing formatter/completion/diagnostic extension.

**owns**: Pure source-located read-only analysis of current unsaved buffers and contained modules, provider registration and host tests, verified extension presentation, local VSIX verification where supported and planning outcome records.

**must_not**: Introduce an LSP, evaluate AMX, read CLI CSV/JSON inputs, fabricate a symbol/target/edit, scan unrelated files, write dependencies without explicit confirmation, infer desktop editor fixes from extension tests, publish to Marketplace or claim unverified native/Hutch/Office gates.

**acceptance**: Meet each item in `planning/sprints/0033-vscode-productivity-tooling-presentation/acceptance.md`. When a static symbol cannot be proven, return no navigation/hover/action and retain any valid localized diagnostic rather than guessing.

**verification**:

1. Establish a focused symbol/range/unsaved-import host case, extend the pure analysis boundary, then validate exact UTF-16 locations, contained exports and ambiguous-target withholding before adding all provider registrations.
2. Exercise each new provider and formatting/completion/diagnostics regressions in the Extension Development Host, including changed dependencies, cycles, shadowing, non-executable fences and safe action revision checks.
3. Run extension `bun run compile`, `bun run test`, local VSIX package/install/installed-host checks where supported, root build/tests if core is touched, and `git diff --check`. Record exact counts, tool/host versions, VSIX artifact, warnings and unavailable checks; local installation is not Marketplace publication.
4. Update planning logs with verified results and Sprint 034 handoff while preserving Sprint 029/030 and native/Office/license residuals as separate open tracks.
