# 012 Handoff Prompt

You are the Builder for `openamx` Sprint 012.

Read these files first:

- `.agents/main.md` (if present; otherwise follow the repo’s documented Builder process)
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV02MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `README.md`
- `vscode-extension/README.md`
- `planning/sprints/0010-canonical-formatter-renderer-integration/acceptance.md`
- `planning/sprints/0011-vscode-extension/acceptance.md`
- `planning/sprints/0012-v02-examples-documentation-acceptance/requirements.md`
- `planning/sprints/0012-v02-examples-documentation-acceptance/blueprint.md`
- `planning/sprints/0012-v02-examples-documentation-acceptance/acceptance.md`

Execute only Sprint 012 scope. This is the final V0.2 example, documentation, and acceptance sprint, not a feature sprint. Do not implement any V0.3 candidate. If acceptance reveals a real implementation defect, make only the smallest directly necessary fix, record it and its tests, and do not use it to broaden scope.

## Task Contract

**objective**: Deliver end-to-end Power Transformer FMEA and asset-fleet Risk Analysis examples, generated HTML, an accurate V0.2 README/spec, tests with explicit expected values, and the complete root/extension verification required to close V0.2. Record final status, limitations, ordered V0.3 candidates, and the unresolved license prerequisite for Marketplace publication.

**owns**:
- `examples/hello-world.amx` and `examples/hello-world.html`
- `examples/transformer-strategy.amx` and `examples/transformer-strategy.html`
- One asset-fleet Risk Analysis `.amx` example and generated `.html` output under `examples/`
- `tests/evaluator.test.ts`, `tests/renderer.test.ts`, or one narrowly scoped integration test file
- `package.json` (minimal example scripts only, if required)
- `README.md`
- `docs/language-spec-v0.2.md` (only evidence-based corrections)
- `vscode-extension/README.md` or scripts only if acceptance finds documented-command mismatch
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- Sprint 012 artifacts only for factual corrections or an approved clarification

**must_not**:
- Add V0.3 features or new language/runtime/extension behavior as part of examples or docs.
- Add Asset Management-specific syntax/functions/types to core modules. Keep all domain concepts in example prose and ordinary values.
- Change stable Sprint 007–011 behavior without demonstrating a concrete defect and recording the minimal fix/deviation.
- Publish/upload the VSIX, authenticate to Marketplace, or choose/add a license. The repository has no license file; local packaging was confirmed with a prompt. Record this as a publication prerequisite, do not invent a choice.
- Migrate the root package layout, add unrelated dependencies, or perform unrelated cleanup.
- Claim verification commands passed unless they were actually executed; do not mark V0.2 complete if any required gate is blocked or unverified.

**acceptance**:
- Meet every criterion in `planning/sprints/0012-v02-examples-documentation-acceptance/acceptance.md`.
- Both named examples are real parsed documents and collectively exercise mutation, list/range loops, expression-loop collection, match, and final-environment interpolation. Tests assert expected final bindings and visible computed output.
- Refresh checked-in HTML through the production CLI and verify correct rendered values, Markdown structure, formatted visible source, escaping, and the non-execution of bare declarations/ordinary fences.
- Replace stale V0.1-only README guidance with complete V0.2 usage/migration/editor documentation; keep spec and extension instructions accurate.
- Run root install/build/full tests, both example CLI render/run checks, extension install/build/host tests/package/local install, and the installed-VSIX check where supported.
- Record exact results, limitations, V0.3 roadmap order, and the license caveat. Close V0.2 only if all required gates pass.

**verification**:

```sh
bun install
bun run build
bun test
bun run render:hello
bun run render:transformer
# Run the asset-fleet example using its documented package script or CLI command.
bun run dist/cli.js run examples/transformer-strategy.amx
bun run dist/cli.js run examples/asset-fleet-risk-analysis.amx
cd vscode-extension
bun install
bun run compile
bun run test
CI=1 bun run package
bun run install-local
code --list-extensions --show-versions
```

Also inspect generated HTML for expected output, visible formatted code, escaping, Markdown structure, and final-environment interpolation. If supported, rerun the extension host tests against the installed VSIX. Capture exact observed commands, test counts, VS Code engine version, package artifact, any host/package warnings, and actual deviations in planning files.
