# Plan: OpenAMX V0.2 Master Sprint Plan

Evolve the V0.1 prototype into a breaking V0.2 language release centered on executable `amx` fences, mutable bindings, `for` loops, `match` expressions, formatting, and a locally testable, Marketplace-ready VS Code extension. Keep the TypeScript/Bun core and hand-written parser. Keep the language general-purpose while using asset-management examples to prove the product direction. Estimate about six sequential sprints; broader capabilities remain future work.

## Recommended Approach

- Six sequential sprints: language contract and fenced parsing; mutation, ranges, and loops; match expressions; formatter and renderer integration; VS Code extension; examples, documentation, and acceptance.
- Every sprint customizes the four files from `planning/sprints/0000-sprint-template/` (requirements, blueprint, acceptance, handoff prompt).
- Builders execute only the documented sprint scope; update `planning/state.md` and `planning/decisions.md` as work progresses.
- Extend the current TypeScript implementation and hand-written parser. Keep the root project structure and add a focused VS Code extension package rather than undertaking a broad monorepo migration.
- Preserve the V0.1 parse/evaluate/render pipeline where compatible, while explicitly documenting the breaking source migration.
- Core language/runtime remain domain-neutral. Acceptance examples use a Power Transformer Failure Mode Analysis and an asset-fleet Risk Analysis.

## Steps

### Phase 1 – Language Foundation

#### Sprint 007: V0.2 Language Contract, AST & Fenced Parsing (depends on nothing)

- Define the V0.2 language specification, including grammar, migration behavior, source-location rules, and explicit non-goals.
- Extend the AST with executable code-block and statement forms needed by the V0.2 language.
- Parse labeled ` ```amx ` fenced blocks as executable; preserve ordinary fenced code blocks and all other text as non-executable Markdown.
- Bare V0.1 `let` lines become ordinary narrative and no longer execute.
- Keep `{{ expression }}` as a distinct inline interpolation feature. Its expressions use the final document environment after all executable blocks run.
- Preserve front matter and narrative structure. Add parser tests for fence boundaries, labels, migration behavior, and source locations.

#### Sprint 008: Mutable Bindings, Assignments, Ranges & Loops (depends on 007)

- Make `let` bindings mutable. Support assignment with `=` and compound addition with `+=`.
- A repeated `let` updates an existing binding. References or assignments to undeclared identifiers produce clear errors.
- Add inclusive integer ranges `[start to end]`, ascending or descending with an implicit step of one; continue to support explicit list literals.
- Add `for item in values { ... }` over lists and ranges. Blocks share the document environment; the iteration variable is scoped to the loop.
- Simple statement-form loops may omit `return`. Expression-form loops require `return expression` for each iteration, collect one returned value per iteration into a list, and evaluate to `[]` for empty input. `return` is per-iteration, not an early exit.
- Defer nested loops, `break`, and `continue`. Test mutation, scoping, range boundaries, loop forms, return collection, and failures.

#### Sprint 009: Match Expressions (depends on 007; integrate with Sprint 008 expression/runtime surfaces)

- Add braced `match expression { ... }` as a value expression, usable in `let` bindings and inline `{{ }}` interpolation.
- Support number, string, and boolean literal cases. Require exactly one `default` branch; evaluate cases in source order and choose the first match.
- Support compound boolean/logical expressions as the scrutinee.
- Defer guards, destructuring, and richer patterns. Add parser, evaluator, error, and integration tests.

### Phase 2 – Authoring & Delivery

#### Sprint 010: Canonical Formatter & Renderer Integration (depends on 007–009)

- Implement an idempotent formatter for executable `amx` blocks without changing surrounding Markdown.
- Execute code blocks in source order with one shared document environment.
- Render executable blocks as escaped, formatted source code in the generated HTML rather than hiding them.
- Preserve `{{ }}` interpolation and resolve it against the final environment after all blocks execute, including later mutations.
- Preserve standalone HTML output and existing CLI behavior where compatible. Add formatter and renderer coverage.

#### Sprint 011: VS Code Extension (depends on stable grammar and formatter from Sprint 010)

- Add a focused VS Code extension package using direct VS Code providers rather than a separate Language Server Protocol server.
- Provide formatting inside `amx` fences, basic completion for keywords/functions and in-scope document variables, and parser diagnostics with source locations.
- Support local extension development and installation; package a Marketplace-ready VSIX.
- Use `EngineersTools` as the Marketplace publisher identifier. Actual Marketplace publication is outside V0.2 scope.
- The extension runs in the supported Node-based VS Code extension host; the main project remains TypeScript/Bun.

#### Sprint 012: Asset-Management Examples, Documentation & V0.2 Acceptance (depends on 007–011)

- Add end-to-end examples for a Power Transformer Failure Mode Analysis and an asset-fleet Risk Analysis.
- Verify parsing, evaluation, formatted HTML output, interpolation, mutation, loops, and match behavior against explicit expected results.
- Update README and language documentation with V0.2 syntax, limitations, migration steps, editor setup, and CLI usage.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`; record the ordered V0.3 roadmap candidates.
- Run the complete project and extension verification sequence and summarize deviations, limitations, and next steps.

## Relevant Files

- `.agents/language-spec-v0.1.md` — reference for the existing language, AST, parser, evaluation, rendering, and CLI contracts; V0.2 defines an updated language specification.
- `src/ast/types.ts` — current expression and document AST types; extend for code blocks and statement forms.
- `src/parser/parseStatements.ts` and `src/parser/parseExpression.ts` — current declaration splitter and Pratt expression parser; primary grammar extension points.
- `src/runtime/evaluateDocument.ts`, `src/runtime/evaluateExpression.ts`, and `src/runtime/environment.ts` — current document-order evaluation and environment; extend for mutation, ranges, loops, and match.
- `src/renderer/renderHtml.ts` — current Markdown rendering and interpolation; adapt for executable fences, visible formatted source, and final-context interpolation.
- `src/cli.ts`, `tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/renderer.test.ts`, and `README.md` — compatible CLI surface, test coverage, and user documentation.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` — status, durable decisions, and remaining questions.
- Proposed new `vscode-extension/` package — extension manifest, formatter/completion/diagnostic providers, packaging, and focused tests.
- `planning/sprints/0000-sprint-template/` — source for the four artifacts required for each sprint.

## Verification

1. Each sprint ends with its acceptance criteria passing. Keep `bun run build && bun test` green and define the extension-specific build/test/package commands in Sprint 011.
2. Parser coverage includes executable `amx` fences, ordinary Markdown fences, bare V0.1 `let` lines as narrative, source locations, and fence boundaries.
3. Evaluator coverage includes mutable/redeclared `let`, `=` and `+=`, undefined references and assignments, shared environment across blocks, loop-variable scope, explicit lists, inclusive ascending/descending ranges, statement and expression loops, per-iteration `return`, empty-loop `[]`, and match cases/default/errors.
4. Renderer coverage proves only `amx` fences execute, executable source is rendered as escaped formatted code, source order is preserved, and inline placeholders use the final environment including values changed by later blocks.
5. Formatter tests prove idempotence, syntactically valid output, and no changes to surrounding Markdown. VS Code Extension Development Host checks cover formatting, completion, diagnostics, and local VSIX installation.
6. End-to-end acceptance runs both examples and verifies expected computed values and visible formatted code. Run `bun install`, `bun run build`, `bun test`, extension checks, and local package-install checks.
7. Document migration explicitly: bare declarations cease executing and must move into ` ```amx ` blocks; ordinary fenced Markdown remains non-executable; inline `{{ }}` remains supported.
8. No V0.3 candidate is implemented as part of V0.2. No Asset Management concepts are added to the core parser/runtime.

## Decisions

- Primary audience: asset managers. Acceptance documents: Power Transformer Failure Mode Analysis and asset-fleet Risk Analysis. The core language and runtime remain domain-neutral.
- V0.2 is a breaking language release. Bare V0.1 declarations become narrative; there is no temporary legacy execution mode.
- Executable blocks use the `amx` info string. Ordinary triple-backtick blocks remain Markdown. Executable source is formatted and displayed in rendered HTML.
- Computation executes in source order across code blocks within one shared document environment. `let` is mutable; `=` and `+=` are supported; undeclared identifiers remain errors; repeated `let` updates its binding.
- Inline `{{ expression }}` remains supported and uses the final environment after all executable blocks. `match` can be used as an inline expression. Expression-form `for` collects explicit per-iteration `return` values; an empty loop expression returns `[]`.
- Ranges are inclusive integer sequences, ascending or descending with an implicit step of one. V0.2 loops are simple: no nesting, `break`, or `continue`.
- `match` requires exactly one `default`; supports literal number/string/boolean cases; first matching case wins. Guards and destructuring are deferred.
- Keep TypeScript/Bun and extend the hand-written parser. Use direct VS Code providers rather than a separate LSP server. The extension host uses Node as required by VS Code.
- Marketplace publisher identifier is `EngineersTools`. V0.2 produces a locally installable, Marketplace-ready package; publication itself is deferred.
- Keep dependencies minimal; introduce a dependency only when it materially enables the required extension packaging or behavior.
- V0.3 candidate order: tables/charts; units/currency; reusable/imported `.amx`; Asset Management domain libraries; data imports; Word/PDF export; multi-file workflows; richer validation; AI-assisted authoring.

## Further Considerations

1. The exact newline/semicolon rules for match clauses and statement separators should be fixed in the V0.2 language specification before Sprint 007 is handed to a Builder; examples should make the selected rule unambiguous.
2. No release date or fixed sprint count was specified. Six sprints is an estimate based on feature dependencies and editor scope.

## Next Actions (Architect / Lead Developer)

- Review and approve this V0.2 master plan.
- When ready, create Sprint 007 by customizing the four files in `planning/sprints/0000-sprint-template/` and record the active status in `planning/state.md`.
- Hand off only the approved Sprint 007 artifacts to a Builder. Do not begin implementation of later sprints until their requirements and acceptance criteria are written.
- Record any changes to scope or decisions in the planning artifacts. Keep V0.3 candidates visible but explicitly out of scope for V0.2.

This plan is based on the V0.1 implementation and the product decisions gathered during discovery. It defines the V0.2 roadmap only; no implementation work is included.
