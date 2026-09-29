# 012 Blueprint: V0.2 Examples, Documentation & Acceptance

## Approach

Treat Sprint 012 as an integration/acceptance sprint, not another feature sprint. Start by designing the two `.amx` documents against the V0.2 language contract and current public APIs. Give each example a small, auditable calculation with explicitly expected values. Use one example to foreground transformer FMEA and one to foreground portfolio/fleet risk comparison; use the combined set to exercise declarations, mutation, lists/ranges, both loop forms, match, later-block mutations, and final-context interpolation. Keep domain terminology in prose and values, never in core syntax.

Parse and evaluate the actual files through the existing public pipeline. Add end-to-end tests that assert final contexts and rendered HTML results for both examples. Regenerate checked-in `.html` outputs using existing CLI scripts (add a narrowly scoped root script only if needed for a canonical example). Inspect the HTML for visible escaped canonical code blocks, source/narrative order, correct interpolation after the final mutation, and absence of accidental execution of non-`amx` material.

Rewrite README for the V0.2 experience rather than layering a few V0.2 bullets onto the V0.1 document. Use the language spec as the syntax authority and the extension README/package scripts as the source for exact editor commands. State migration prominently: bare declarations are narrative and must be moved into `amx` fences. Document current non-goals and extension engine floor. Make clear local VSIX packaging/install is supported but Marketplace publication is deferred.

Run every layer in the master-plan verification sequence. Record exact commands and counts actually observed; do not copy old Sprint 011 test counts if suites changed. Run the extension host tests and local VSIX install, and where supported rerun provider tests against the installed VSIX. Keep the known no-license-file warning visible as a publication prerequisite; do not resolve it by guessing a license.

At close, update planning status to V0.2 acceptance complete only if all required gates pass. Record the ordered V0.3 candidates exactly in the specified sequence, summarize real residual issues (especially the license decision), and leave V0.3 unimplemented.

## Files to Update

- `examples/hello-world.amx` and `examples/hello-world.html` — replace V0.1 content with a concise V0.2 executable-fence example if retained as the canonical basic example; ensure it reflects the breaking migration and renders.
- `examples/transformer-strategy.amx` and `examples/transformer-strategy.html` — evolve into the Power Transformer FMEA end-to-end example.
- Add one asset-fleet Risk Analysis `.amx` example and its generated `.html` output; use a clear, consistent filename such as `examples/asset-fleet-risk-analysis.amx`.
- `tests/evaluator.test.ts` and/or a focused integration test file; `tests/renderer.test.ts` — actual-file expected contexts, formatter/HTML/interpolation results, and execution boundaries.
- `package.json` — minimal example scripts for the new canonical file(s), only when needed.
- `README.md` — rewrite as V0.2 install, language, migration, CLI, examples, limitations, extension, and troubleshooting/getting-started guide.
- `docs/language-spec-v0.2.md` — correct only contract/documentation gaps demonstrated by integration.
- `vscode-extension/README.md` and/or extension scripts — align documented commands with verified package behavior if mismatched.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md` — final sprint status, acceptance evidence, V0.3 order, license caveat, limitations and next actions.
- Sprint 012's four artifacts only for factual corrections or approved clarifications.

## Notes

- Choose calculations whose results are easy to audit by inspection. Tests should assert named final bindings and visible rendered values, not couple only to full HTML snapshots.
- Ensure at least one inline placeholder appears before a later block that changes the referenced binding; expected output must prove final-environment rather than source-position interpolation.
- Demonstrate `match` and both loop forms across the pair. Include a meaningful default branch and an empty collection/range only if it clarifies behavior without bloating the examples.
- Keep checked-in generated HTML deterministic and regenerate it from the canonical source rather than manually editing output.
- Avoid testing only hand-constructed ASTs in this sprint; these are end-to-end examples, so parse the real `.amx` text and pass it through the production evaluator/renderer.
- Use the current extension manifest (`EngineersTools`, VS Code `^1.85.0`) and scripts as the baseline. Extension test host currently targets VS Code 1.85.0.
- No license is present. Local packaging passed after confirmation; record this as a publication caveat and do not manufacture a license choice.
