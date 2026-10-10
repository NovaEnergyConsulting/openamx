# Sprint 076 Blueprint: V0.12 Editor and Language Documentation Integration

## Approach

1. Confirm the Sprint 072 contract and the completed Sprint 073-075 Builder evidence. Record the current worktree and validation baseline, including the two root suite failures retained in Sprint 075 and any current desktop/extension residuals.
2. Prepare the language documentation before implementing editor changes:
   - Add `docs/language-spec-v0.12.md`, following the established language-spec organization and linking the README/master plan.
   - Cover inheritance and approved effective-field ordering, complete `override` replacement, non-subtyping, constructors, enums including the empty-enum decision/primitive access, both braced `if` forms, local expression returns, branch scope, module visibility, all allocated diagnostics, and explicit exclusions.
   - Include two runnable feature examples, `examples/v0.12-records-and-enums.amx` and `examples/v0.12-braced-if.amx`, whose syntax/results agree with the feature fixtures.
   - Update the README language/specification section to identify V0.12 as the current additive language spec, link these examples, and keep previous specifications as historical references.
   - Extend desktop Help with a searchable V0.12 language topic while preserving the existing V0.9 migration/help material.
3. Audit the shared editor services against every new AST/declaration/expression kind:
   - `src/editor/highlighting.ts` for declaration, keyword, field/member, reference, and nested expression ranges.
   - `src/editor/completion.ts` for visible types/enums/members/keywords and expression/statement/block context.
   - `src/editor/symbols.ts`, `src/editor/refactoring.ts`, module analysis, and source-range helpers for declarations/references, navigation, rename, and outline behavior.
   - Shared diagnostics/checking so both clients retain approved codes and original source locations.
   Add only the cases required to make the existing feature services understand V0.12 syntax.
4. Integrate VS Code:
   - Update `vscode-extension/amx.tmGrammar.json` for `extends`, `override`, `enum`, member assignments, and braced conditional syntax without changing Markdown, inert-fence, or interpolation tokenization.
   - Update provider code only if shared services or formatter integration requires it.
   - Extend `vscode-extension/src/test/providers.host.ts` to exercise actual TextMate scopes, document formatting, diagnostics/ranges, completion, symbols/outline, and navigation for representative V0.12 cases.
5. Integrate the desktop editor using the shared facts and current CodeMirror path. Extend desktop RPC/editor integration coverage and the existing help UI test; do not add a separate editor implementation. Verify V0.12 language help topic IDs, search terms, and rendered guidance.
6. Extend `src/formatter/formatAmx.ts` only where required to format the new declarations and braced forms. Use the fixture contract's two-space block indentation, newline, token-order, and punctuation expectations. Do not rewrite expression text or change the legacy formatter contract.
7. Add or update tests in existing suites:
   - `tests/formatter.test.ts` and `tests/editor.test.ts` for core formatter and shared editor facts.
   - `tests/examples.test.ts` for README/spec links and runnable feature examples.
   - `vscode-extension/src/test/providers.host.ts` for VS Code behavior.
   - `desktop-app/tests/rpc-contract-check.ts` and `desktop-app/tests/ui/help-center.pw.ts` for shared editor and help behavior, as applicable.
   Keep fixture IDs from Sprint 072 as traceability anchors; use representative integrated cases without duplicating the entire semantic suites from 073-075.
8. Verify formatting idempotence and meaning preservation for every feature family; verify each approved diagnostic family is mapped to an editor range and no malformed new syntax is silently accepted or highlighted as a valid declaration.
9. Run focused root tests then build/full root test; run VS Code Development Host tests; run desktop typecheck, web build, RPC contract checks, and focused help/editor UI tests. Compare results against the Sprint 075/root and existing desktop baselines; record exact statuses and retries.

## Files to Update

- Documentation: `docs/language-spec-v0.12.md` (create), `README.md`, desktop `help-content.json`
- Runnable examples: `examples/v0.12-records-and-enums.amx` (create), `examples/v0.12-braced-if.amx` (create)
- Formatter/shared editor services as required: `src/formatter/formatAmx.ts`, `src/editor/highlighting.ts`, `src/editor/completion.ts`, `src/editor/symbols.ts`, and directly affected analysis/refactoring/range files
- VS Code: `vscode-extension/amx.tmGrammar.json`, existing providers if required, `vscode-extension/src/test/providers.host.ts`
- Desktop editor only where needed: `desktop-app/src/mainview/CodeEditor.vue`; existing tests `desktop-app/tests/rpc-contract-check.ts`, `desktop-app/tests/ui/help-center.pw.ts`
- Existing root tests: `tests/formatter.test.ts`, `tests/editor.test.ts`, `tests/examples.test.ts`
- Planning status/evidence: `planning/state.md`, `planning/decisions.md`, `planning/questions.md` only if a new decision/question or completion status requires it; Sprint 076 `builder-evidence.md`

Do not change approved parser/type-checker/runtime semantics, manifests/versions/dependencies, release workflows, or unrelated help/editor/reporting surfaces.

## Risks and Stop Conditions

- If any existing editor client cannot represent the approved syntax using its established services, do not silently omit the capability or invent a parallel service. Record the gap and request a product/technical decision.
- If formatter support would change semantic content, expression text, existing syntax, or legacy conditional formatting, stop and request a decision rather than weakening correctness.
- If a feature diagnostic is missing, mislocated, or differs from AMX3011-AMX3021, fix the integration to match the approved behavior; do not edit the diagnostic contract.
- If a language-spec statement or example cannot be demonstrated by parser/runtime/editor evidence, mark the claim unverified and resolve it before documenting it as supported.
- A desktop RPC or full root failure matching a recorded baseline must be recorded as an inherited residual. Any new unexplained failure blocks acceptance until resolved.
- Sprint 076 does not authorize V0.12 closeout, release, publication of software, or platform certification; Sprint 077 remains the integrated acceptance gate.

## Verification

From repository root:

1. `bun test tests\\parser.test.ts tests\\evaluator.test.ts tests\\formatter.test.ts tests\\editor.test.ts tests\\modules.test.ts tests\\examples.test.ts`
2. `bun run build`
3. `bun test`

From `vscode-extension`:

4. `bun run test`

From `desktop-app`:

5. `bun run typecheck`
6. `bun run build:web`
7. `bun run test`
8. `bun run test:ui -- tests/ui/help-center.pw.ts`

Record exact commands, summaries, full-suite residuals, environment limitations, and any retries. A successful build alone is not acceptance evidence.
