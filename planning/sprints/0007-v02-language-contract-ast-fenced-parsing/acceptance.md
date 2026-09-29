# 007 Acceptance Criteria

007 is complete when:

- The V0.2 language contract exists and unambiguously describes the breaking V0.1 migration, executable-fence syntax, document/source locations, statement and match-arm separators, planned V0.2 grammar, semantics, and non-goals.
- `planning/decisions.md` records the exact `amx` fence recognition rule, newline-only statement/arm separation, `case <literal> => <expression>` / `default => <expression>` syntax, and 1-based document-relative UTF-16 source coordinates.
- The AST has an explicit executable code-block representation and explicit statement types needed by the V0.2 contract, with source locations and no domain-specific concepts.
- `parseDocument` recognizes only case-sensitive, trimmed info string `amx` as executable. The opening fence is a backtick run of at least three, indented by zero to three spaces; the closing backtick run is at least as long and has no trailing non-whitespace text.
- An `amx` code block and its supported declaration statement(s) are represented in the AST in source order. Parsing does not evaluate the block.
- A V0.1 `let` line outside an `amx` block remains narrative, including its original text; it is not converted to an executable declaration.
- An `amx` fence inside an ordinary backtick or tilde Markdown fence is not recognized as executable. Ordinary fences and their contents remain narrative and preserve their text.
- Front matter is retained, narrative before/between/after blocks remains in order, and `{{ expression }}` remains narrative interpolation text rather than executable block syntax.
- AST/diagnostic locations inside an executable block refer to 1-based original-document line/column positions, including front matter and fence lines; columns count UTF-16 code units.
- An unclosed `amx` fence fails with a clear parse error identifying its opening location. Ordinary unclosed Markdown fences are not treated as executable-fence errors.
- `tests/parser.test.ts` explicitly covers recognized and rejected labels, fence boundaries, nested-looking text inside ordinary fences, bare-let migration, source order, front matter/narrative retention, and source locations.
- `bun run build` and `bun test` pass. No unrelated existing tests are weakened or deleted.
- No assignment, compound assignment, range, loop, return, match parser/evaluator, formatter, renderer integration, extension, or V0.3 feature is implemented as part of this sprint.
- The sprint pack contains requirements, blueprint, acceptance, and a complete Builder handoff prompt. `planning/state.md` identifies Sprint 007 as the active V0.2 sprint and Sprint 008 as the next dependent sprint.
- `planning/questions.md` no longer leaves newline/semicolon or match-arm separator rules unresolved; any remaining questions are explicitly non-blocking and assigned to a later sprint if relevant.
