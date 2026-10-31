# Sprint 113 Blueprint: V0.18 Editor Support, Specification, and Example

## Approach

1. Recheck S110/S111 dispositions and obtain the separate product-owner
   disposition for S112 before implementation. Preserve S112's Vite preview
   residual and native/cross-platform unavailable statuses accurately.
2. Obtain separate S113 execution authorization and approve the exact
   production, documentation, test, example, and output paths. Record the
   implementation base and preservation inventory.
3. Audit parser-proven editor facts and their current tests. Implement one
   recursive `DiagramContentNode` walk in the existing shared highlighting
   surface for nested loops, conditional branches, primitive declarations,
   names, properties, and expressions. Preserve original source locations
   and avoid facts in inert Markdown or non-AMX fences.
4. Add shared editor-fact tests with direct/nested controls, repeated
   primitive source names, `t`-dependent property references, and a negative
   narrative/non-AMX control example. Do not change generated-instance
   navigation, completion, outline, or rename semantics.
5. Extend the VS Code Extension Development Host tokenization test to use the
   actual TextMate grammar with the accepted V0.18 fixture. Assert existing
   `for`/`if`/`else` keyword scopes and nested primitive keyword/name scopes.
   Modify the grammar only if those real assertions fail; preserve all other
   tokenization and Markdown boundary checks.
6. Extend desktop CodeMirror UI coverage using parser-proven editor facts.
   Assert nested control keywords and primitive declaration tokens render in
   the expected spans without diagnostics or layout/formatter regression.
   Keep Vite harness status separate from native desktop evidence.
7. Draft `docs/language-spec-v0.18.md` as an additive, normative user
   contract. Cross-check syntax, evaluation timing, ordering, nesting,
   `t` visibility, generated cap accounting, authored limit, diagnostics,
   source identity, HTML/PDF/DOCX behavior, and exclusions against accepted
   S109-S112 evidence. Do not include unaccepted S112 claims until its owner
   disposition is recorded.
8. Extend `examples/08_Formula_Driven_Diagrams.amx` with a small deterministic
   loop and conditional branch inside the existing diagram. Use a typed
   iterable, emit fewer than 64 generated primitives, keep `t` out of
   controls, and show `t` in a supported property. Preserve the existing
   diagram's purpose and existing direct primitives.
9. Link the additive spec and example from the root README navigation. Do not
   alter older specifications or broad documentation architecture.
10. Run focused root editor/formatter/example checks, the actual VS Code host
    tests, desktop typecheck/UI test as approved, and a direct example render
    plus static export check if included in the approved plan. Record exact
    outputs and availability without overclaiming host parity.
11. Complete `editor-spec-example-test-matrix.md` and Builder evidence, audit
    changed paths, and request a separate S113 product-owner disposition.

## Candidate Files and Surfaces

Expected files, subject to the separate execution plan:

- `src/editor/highlighting.ts` and `tests/editor.test.ts` for recursive
  parser-proven shared highlighting facts.
- `desktop-app/tests/ui/v16-language-editor.pw.ts` or a separately approved
  focused V18 UI file for CodeMirror presentation.
- `vscode-extension/src/test/providers.host.ts` for actual TextMate scope
  assertions; `vscode-extension/amx.tmGrammar.json` only if tests show a
  tokenization gap.
- `docs/language-spec-v0.18.md`, `README.md`, and
  `examples/08_Formula_Driven_Diagrams.amx` for additive contract/navigation/
  runnable lesson updates.
- `tests/formatter.test.ts` or existing example checks if needed to prove
  canonical nested-block formatting.
- S113 evidence/lifecycle files only when explicitly included in the
  approved plan. No global ledger edits are authorized by this preparation.

The current completion/symbol surfaces in `src/editor/completion.ts` and
`src/editor/symbols.ts` inspect direct diagram content. They are audit-only
for this sprint unless a confirmed S113 requirement cannot be met without
them; no source-level identity or generated-instance navigation is added.

## Verification

Candidate focused checks, subject to explicit approval:

```powershell
bun test tests/editor.test.ts tests/formatter.test.ts tests/examples.test.ts
```

```powershell
# From vscode-extension/
bun run test
```

```powershell
# From desktop-app/
bun run typecheck
bun run test:ui -- tests/ui/v16-language-editor.pw.ts
```

Run the accepted example through the built CLI and verify generated HTML plus
the static lower-bound PDF/DOCX path as specified by the approved plan. The
VS Code command may rewrite `dist/`, `out/`, and `.vscode-test/`; inspect and
preserve existing outputs before approval. Desktop Playwright Vite-harness
evidence is not native host evidence.

## Stop Conditions

- Pending S112 owner disposition blocks implementation until separately
  resolved. Do not infer acceptance from the Builder's recommendation.
- Any inconsistency between accepted S110-S112 behavior and a proposed spec
  or example requires a product/architecture decision before edits.
- Grammar changes are not justified unless the real tokenization test shows
  missing or incorrect scopes.
- No changes to parser/runtime/serializer/renderers or generated runtime are
  allowed under S113.
- Any unapproved file, example behavior, package, output root, or workflow
  requires a separate scope amendment.
- S114, release, publication, version changes, and certification remain
  separately gated.