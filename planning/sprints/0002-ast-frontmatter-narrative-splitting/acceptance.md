# 002 Acceptance Criteria

002 is complete when:

- The sprint directory planning/sprints/0002-ast-frontmatter-narrative-splitting/ exists with four customized files: requirements.md, blueprint.md, acceptance.md, and handoff-prompt.md.
- planning/state.md has been updated to reflect that Sprint 002 (AST, Front Matter, Narrative Splitting) is active or complete.
- planning/decisions.md has been reviewed/updated if any new decisions or clarifications arose during implementation.
- src/ast/types.ts contains the complete, explicit AST definitions:
  - SourceLocation
  - OpenAmxDocument
  - DocumentNode (NarrativeNode | VariableDeclarationNode)
  - All required ExpressionNode variants per language-spec-v0.1.md section 6 (NumberLiteral, StringLiteral, BooleanLiteral, Identifier, Binary, Unary, Conditional, FunctionCall, ListLiteral, etc.)
- src/parser/parseFrontMatter.ts correctly detects optional `---` YAML front matter and parses it into metadata using the `yaml` package. Absent front matter yields empty metadata.
- src/parser/parseDocument.ts:
  - Reads UTF-8 .amx files.
  - Extracts front matter.
  - Orchestrates splitting and returns a populated OpenAmxDocument with metadata and ordered nodes.
- src/parser/parseStatements.ts implements a statement splitter that:
  - Separates `let Identifier = ...` declarations from narrative.
  - Produces an ordered array of DocumentNode preserving source order.
  - Strips all `let ...` lines from NarrativeNode content.
  - Supports basic recognition of headings (# ## ###), paragraphs, and bullet lists inside narrative (as raw content for later rendering).
- Parser tests in tests/parser.test.ts cover at minimum:
  - Front matter extraction (present, absent, multiple keys).
  - Narrative parsing (headings, paragraphs, bullets).
  - Simple let declaration detection (name captured).
  - Interleaved lets and narrative preserve correct source order.
  - Let declarations are removed from narrative content.
  - Basic error cases for malformed front matter produce clear diagnostics.
- All new and existing tests pass: `bun test`.
- The project builds cleanly: `bun run build`.
- No implementation work has started on expression parsing (beyond minimal scaffolding if needed for types), evaluation, rendering, or CLI execution.
- All modules remain general-purpose with no Asset Management domain concepts.
- Any assumptions or open questions encountered were recorded in planning/questions.md.
- The handoff-prompt.md in this sprint folder correctly references .agents/main.md, the current sprint directory, and "openamx".
