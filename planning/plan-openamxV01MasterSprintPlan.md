## Plan: OpenAMX v0.1 Master Sprint Plan

Decompose language-spec-v0.1.md into 6 focused sprints proving the minimal `.amx -> parse -> evaluate -> render HTML` pipeline. Follow main.md 120x Architect/Builder process and sprint template. Use plain TypeScript + hand-written parser (recursive descent + Pratt). Adopt bun as package manager (hybrid clarification). Include list literals + aggregates in v0.1. Capture post-v0.1 roadmap. Only the master plan is produced in this session; no sprint folders or code are created.

**Recommended Approach**
- 6 sequential v0.1 sprints (setup → AST/split → basic eval → full expr+stdlib → renderer → CLI+acceptance).
- Every sprint customizes the 4 files from planning/sprints/0000-sprint-template/.
- Builders execute only the documented sprint scope; always update planning/state.md and planning/decisions.md.
- Architecture: simple, modular, general-purpose core (no AM-domain concepts in parser).
- Verification is cumulative; Sprint 006 proves all acceptance criteria in spec section 16 + test cases in section 12.
- Future phases documented for visibility but explicitly excluded from v0.1 sprints.

**Steps**

**Phase 1 – Foundation**
1. Sprint 001: Project Scaffolding, Tooling & Planning Artifacts (depends on nothing)
   - package.json (openamx, bin entry), tsconfig (strict), bun setup, .gitignore.
   - Core deps: typescript, vitest/bun-test, yaml, marked (MD), tsx/bun equiv, small CLI lib (cac recommended).
   - Scripts adapted for bun (install/build/test/dev/render:*).
   - Create src/ skeleton per spec section 5 (parser/, ast/, runtime/, renderer/, diagnostics/, cli.ts, index.ts).
   - Initial README updates + two example .amx stubs + test skeletons.
   - Populate planning/state.md (initial status) and planning/decisions.md (tech choices).
   - Adapt template handoff-prompt.md references if needed.
   - Verify: bun install, bun run build, bun test succeed (empty).

**Phase 2 – Parsing & Model**
2. Sprint 002: AST, Front Matter, Narrative Splitting (depends on 1)
   - Define complete AST in src/ast/types.ts (OpenAmxDocument, DocumentNode, NarrativeNode, VariableDeclarationNode, all ExpressionNode variants, SourceLocation).
   - parseDocument.ts: UTF-8 read, frontmatter detection.
   - parseFrontMatter.ts: yaml parse → metadata.
   - Statement splitter: separate lets from narrative, preserve source order, strip lets from narrative content.
   - Limited MD support in narrative (# ## ###, paragraphs, bullets).
   - Parser tests for frontmatter, narrative, order, let detection.
   - *Parallel possible: none critical.*

3. Sprint 003: Variable Declarations + Basic Expressions + Evaluator (depends on 2)
   - Parse full "let Identifier = Expression" (case-sensitive ids per spec rules).
   - Expression parser (parseExpression.ts): recursive descent top-level + Pratt for expressions.
   - Precedence: parens > calls > unary (- not) > ^ > */% > +- > comparisons > and > or > if/then/else.
   - Literals (num/str/bool), identifiers, binary + - * / % ^, unary -, parentheses.
   - Runtime: environment.ts, evaluateDocument.ts (order), evaluateExpression.ts.
   - Clear errors (AMX1004 style with file/line/col for undefined).
   - Tests: lets, arithmetic, precedence (10+5*2), parens, forward refs, undefined error.
   - No comparisons/logicals/conditionals yet.

**Phase 3 – Expression Completeness**
4. Sprint 004: Comparisons, Logical, Conditionals, Stdlib, Lists (depends on 3)
   - Add == != > >= < <=, and/or/not, if E then E else E (single-line; document chained limitation).
   - ^ right-associative.
   - List literals [1,2,3] (num/str/bool).
   - Stdlib (standardLibrary.ts): sum/min/max/mean + round/abs/sqrt/pow.
   - FunctionCallNode + evaluation.
   - Full tests for comparisons, logicals, conditionals, lists, all 8 functions, type errors.
   - *Parallel possible: early renderer work if interfaces stable.*

**Phase 4 – Rendering & Delivery**
5. Sprint 005: Renderer + Inline {{ }} + HTML (depends on 4)
   - renderHtml.ts: walk narrative, render MD (marked), evaluate & replace {{ expr }} (full expressions supported).
   - Omit VariableDeclarationNodes; preserve source order.
   - Frontmatter title → <title> and heading.
   - Standalone HTML document output.
   - Renderer tests: headings/paragraphs/bullets, lets hidden, {{var}} and {{expr}} substituted, stable output.
   - In-memory parse+eval+render smoke test.

6. Sprint 006: CLI, Examples, Full Tests, Docs, Acceptance (depends on 5)
   - cli.ts + bin: `openamx render input.amx --out out.html` (required) + `openamx run` (JSON context) + basic validate.
   - Populate examples/hello-world.amx and examples/transformer-strategy.amx exactly per spec section 13.
   - Add render:* scripts.
   - Expand tests to cover every case in spec section 12.
   - Complete README (install with bun, usage, limitations, how to extend).
   - Full verification: bun install/build/test, both examples render correctly, undefined var error, precedence, lets invisible.
   - Final deliverable summary (what built, deviations, limitations, next steps).
   - Update planning/state.md to "v0.1 complete".

**Relevant files**
- .agents/language-spec-v0.1.md — authoritative v0.1 scope, AST design, test list, acceptance criteria, examples, architecture.
- .agents/main.md — sprint workflow, builder rules, 120x process.
- planning/sprints/0000-sprint-template/ — source for every new sprint folder (requirements.md, blueprint.md, acceptance.md, handoff-prompt.md).
- planning/state.md, planning/decisions.md, planning/questions.md — updated by every sprint.
- To be created (by sprints): package.json, tsconfig.json, src/parser/{parseDocument.ts,parseFrontMatter.ts,parseStatements.ts,parseExpression.ts}, src/ast/types.ts, src/runtime/{evaluateDocument.ts,evaluateExpression.ts,environment.ts,standardLibrary.ts}, src/renderer/renderHtml.ts, src/diagnostics/errors.ts, src/cli.ts, src/index.ts, examples/{hello-world.amx,transformer-strategy.amx}, tests/{parser,evaluator,renderer}.test.ts, README.md updates.

**Verification**
1. Each sprint ends with its own acceptance.md criteria passing (documented in that sprint's artifacts).
2. After Sprint 006: all 11 items from spec section 16 + every test case listed in section 12 + both example files render to the exact expected HTML/context.
3. Automated green at end of every code-adding sprint: `bun install && bun run build && bun test`.
4. Manual: `openamx render` on both examples produces correct HTML; undefined variable produces clear AMXxxxx error with location.
5. Architecture: parser/runtime/renderer separated; explicit AST; source order preserved; core remains general (no AM jargon).
6. Planning hygiene: state.md + decisions.md updated after each sprint; no scope creep; questions.md used for ambiguities.
7. Final artifacts: working prototype + summary of what was built, deviations, limitations, suggested next steps.

**Decisions**
- Tech stack: plain TypeScript per language-spec-v0.1.md. Package manager/scripts use bun (per main.md + clarification). Treat "npm install" wording in spec as illustrative.
- Parser: hand-written recursive descent (statements) + Pratt (expressions). No parser combinator or Langium in v0.1. Langium deferred to Phase 10.
- Lists + aggregates: included in v0.1 (sum/min/max/mean work with list literals).
- Conditionals: single-line `if ... then ... else` only. Chained else-if documented as v0.1 limitation.
- ^ : right-associative.
- HTML: full standalone document for CLI render; title from frontmatter.
- Markdown: marked (or equivalent) only for narrative blocks; lets never appear in rendered output.
- Diagnostics: basic but clear (AMX codes + file/line/col for undefined vars). Source locations on AST nodes from the start.
- Layout: single package at root for v0.1 (matches spec). Full mono-repo planned for Phase 10+.
- Template fixes: outdated references in 0000-sprint-template/handoff-prompt.md (".continue/rules", "e-lang") will be corrected in Sprint 001 or a small docs task.
- Scope: strictly language-spec-v0.1.md sections 1-18 for v0.1. Section 4 items remain out of scope.
- Style: simple, readable, maintainable code. No premature optimization.

**Further Considerations**
1. CLI lib choice (cac vs minimal argv) — recommend cac for ergonomics; confirm before Sprint 006.
2. Language spec location: spec wants docs/language-spec-v0.1.md; authoritative copy currently in .agents/. Decide copy/move/symlink and record.
3. Renderer testing: snapshots vs explicit expected strings — decide in Sprint 005/006.
4. Cross-package-manager support: document that bun is primary; npm untested for v0.1.
5. Source locations: implement on all AST nodes early (diagnostics + future IDE).

**Next Actions (Architect / Lead Developer)**
- Review and approve this master plan.
- (When ready) Create first sprint: copy 0000-sprint-template → planning/sprints/0001-project-scaffolding and customize the four files using the Sprint 001 details above.
- Update planning/state.md: "Master plan approved; Sprint 001 active".
- Hand off the sprint folder to a Builder.
- All future sprints follow the identical pattern: work exclusively from the active sprint's requirements + blueprint.

This plan is derived directly from language-spec-v0.1.md (all numbered sections) and .agents/main.md. No implementation occurs in this planning session.