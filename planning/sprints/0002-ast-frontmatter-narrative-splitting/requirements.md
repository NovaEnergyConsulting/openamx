# 002 Requirements: AST, Front Matter, Narrative Splitting

## Goal

Implement the foundational parsing layer for OpenAMX documents. Define the complete AST types, implement front matter extraction (YAML), document parsing orchestration, and a statement splitter that separates `let` variable declarations from Markdown-like narrative while strictly preserving source order. Narrative blocks must have `let` lines stripped. Provide parser tests for these behaviours. This sprint establishes the document model that all later evaluation and rendering will operate on.

## Inputs

- Project brief / authoritative spec: .agents/language-spec-v0.1.md (sections 3.2 Front Matter, 3.3 Narrative Content, 3.4 Variable Declarations, 5 Architecture, 6 AST Design, 7 Parser Requirements, 8 Expression Parser (types only), 12 Tests (parser subset), 13 Examples (structure))
- Master plan: .agents/planning/plan-openamxV01MasterSprintPlan.md (Sprint 002 details under Phase 2 – Parsing & Model)
- Operating model: .agents/main.md (120x Architect/Builder, sprint workflow, builder rules)
- Template: planning/sprints/0000-sprint-template/
- Current project state after Sprint 001: package.json, tsconfig.json, src/ skeleton (placeholders), tests/parser.test.ts (skeleton), examples/ (stubs), planning/decisions.md, planning/state.md, planning/questions.md
- Existing placeholder modules: src/parser/parseDocument.ts, src/parser/parseFrontMatter.ts, src/parser/parseStatements.ts, src/ast/types.ts, src/diagnostics/errors.ts

## In Scope

- Define the complete AST in src/ast/types.ts:
  - SourceLocation interface (line, column)
  - OpenAmxDocument
  - DocumentNode union: NarrativeNode | VariableDeclarationNode
  - NarrativeNode { type: "narrative"; content: string; source?: SourceLocation }
  - VariableDeclarationNode { type: "variableDeclaration"; name: string; expression: ExpressionNode; source?: SourceLocation }
  - All ExpressionNode variants per spec section 6 (even if only constructed as stubs or simple cases in this sprint):
    - NumberLiteralNode, StringLiteralNode, BooleanLiteralNode
    - IdentifierNode
    - BinaryExpressionNode, UnaryExpressionNode
    - ConditionalExpressionNode, FunctionCallNode, ListLiteralNode
  - Any supporting literal / operator types needed for a complete, usable AST definition.
- parseFrontMatter.ts: Detect optional `---` ... `---` YAML block at start of file; use the `yaml` package to parse it into a plain metadata Record<string, unknown>. Handle missing front matter gracefully (empty metadata).
- parseDocument.ts: 
  - Read UTF-8 .amx file from disk.
  - Detect and extract front matter (delegate to parseFrontMatter).
  - Pass remaining body to statement splitter.
  - Return a fully populated OpenAmxDocument with metadata + ordered nodes array.
- parseStatements.ts (statement splitter):
  - Split the post-frontmatter body into an ordered sequence of DocumentNode.
  - Recognise lines that start with `let ` (case-sensitive identifier rules per spec 3.4).
  - For each let: capture identifier name and the raw expression text (or a minimal ExpressionNode placeholder). Full expression parsing belongs to Sprint 003.
  - Narrative content: collect contiguous non-let lines/blocks as NarrativeNode.
  - Strip all `let ...` lines from any NarrativeNode content.
  - Preserve exact source order in the final nodes array.
  - Track basic source locations (line numbers at minimum) on nodes where practical.
- Limited Markdown narrative recognition for splitting purposes (do not fully parse MD yet):
  - Headings: lines starting with #, ##, ###
  - Paragraphs: blocks of text
  - Bullet lists: lines starting with - 
  - These are preserved as raw text inside NarrativeNode.content for later rendering.
- Parser tests (tests/parser.test.ts):
  - Parses and extracts front matter (various keys, empty, absent).
  - Parses narrative content (headings, paragraphs, bullets).
  - Detects and extracts simple `let` declarations (name only for now).
  - Preserves source order when lets and narrative are interleaved.
  - Lets are removed from narrative content.
  - Basic error handling for malformed front matter (clear diagnostics preferred).
- Update planning/state.md to mark Sprint 002 active / in progress and record completion when done.
- Record any new decisions or clarifications in planning/decisions.md.
- Keep `bun run build && bun test` green throughout (skeletons evolve into real but scoped implementations).
- All modules remain general-purpose (no Asset Management domain concepts in parser or AST).

## Out of Scope

- Full expression parsing (parseExpression.ts remains a placeholder or provides only trivial literal/identifier support if needed for let detection; complex expressions, operators, calls, lists, conditionals are Sprint 003).
- Evaluation / runtime (evaluateDocument.ts, evaluateExpression.ts, environment.ts, standardLibrary.ts).
- Renderer or inline {{ }} substitution (renderHtml.ts).
- CLI command implementation beyond the existing stub (cli.ts).
- Populating the example .amx files with full content (full examples arrive in Sprint 006).
- Complete diagnostics implementation (basic error shapes may be introduced if needed for parser errors).
- Support for imports, units, lists in evaluation, stdlib functions, comparisons, logicals, conditionals.
- Any items listed in language-spec-v0.1.md section 4.
- Changes to package.json, tsconfig, or project layout.
- Snapshot or full HTML renderer tests.
- Chained conditionals or advanced expression features.

## Constraints

- Strictly follow the 120x process and builder rules in .agents/main.md. Execute only the documented sprint scope.
- Use bun for all commands and verification.
- Architecture must stay simple, modular, and general-purpose.
- Source order must be strictly preserved in the nodes array.
- `let` declarations must never leak into NarrativeNode content.
- Identifiers are case-sensitive.
- Front matter is optional; when absent, metadata must be an empty object.
- AST types must be complete enough for future sprints to extend without breaking changes to the type shapes defined here.
- Do not implement or test full expression evaluation or complex expressions.
- If any information is missing or ambiguous, record it in planning/questions.md with clear assumptions before proceeding.
- At the end of the sprint the project must support `bun install && bun run build && bun test` cleanly, with new parser tests passing.
- No scope creep into Sprint 003 (basic arithmetic expressions, precedence, evaluator, etc.).
