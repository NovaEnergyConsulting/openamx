# 007 Blueprint: V0.2 Language Contract, AST & Fenced Parsing

## Approach

The authoritative language contract for this sprint is [docs/language-spec-v0.2.md](../../../docs/language-spec-v0.2.md).

Treat this as the compatibility boundary between the V0.1 prototype and V0.2, not as an implementation of the whole V0.2 language. First record the complete syntax/semantic commitments and migration rules in the V0.2 language contract. Then extend the document AST with an executable code-block node and explicit statement-node types, and update document parsing so only the exact `amx` fence form is classified as executable.

The existing parser currently recognizes `let` anywhere in the document body. Replace that document-level interpretation with fence-aware parsing: declarations are parsed as statements only inside executable blocks; identical lines outside those blocks are retained verbatim as narrative. Ordinary fenced Markdown is opaque narrative and must not accidentally expose nested `amx` text to the executable-fence detector. Preserve front matter and source order.

Use original-document source coordinates throughout. The parse layer must retain enough opener/content offset information to report block and statement locations against the full source, not a body-relative or fence-content-relative line number. A malformed executable fence should fail clearly at its opener. Keep inline `{{ }}` in narrative as text for the existing renderer to consume in Sprint 010.

Lock newline as the only statement and match-arm separator in the language contract. Match arms use `case <literal> => <expression>` and one `default => <expression>` arm. Arms are line-oriented; semicolons do not separate arms or statements. The default arm is the fallback when no case matches; case selection is source ordered and uses the first matching literal. Record this as an architectural language decision rather than leaving syntax to the Builder.

## Files to Update

- `src/ast/types.ts` — define code-block and statement AST variants and document-node membership.
- `src/parser/parseStatements.ts` and `src/parser/parseDocument.ts` — classify fences, parse supported declaration statements within blocks, preserve surrounding narrative, and map locations to document coordinates.
- `tests/parser.test.ts` — focused regression and boundary tests.
- `planning/state.md` — mark Sprint 007 prepared/active and V0.2 as in progress.
- `planning/decisions.md` — record the finalized fence, separator, `match`, and source-location conventions.
- `planning/questions.md` — close the separator question and record any genuinely unresolved follow-up as non-blocking.
- `planning/sprints/0007-v02-language-contract-ast-fenced-parsing/` — this sprint pack.

The V0.2 language contract should be placed in the repository’s established `docs/` location if present; otherwise add `docs/language-spec-v0.2.md`. Keep it authoritative and cross-link it from the sprint artifacts. Do not modify the V0.1 spec except to add a migration pointer if needed.

## Notes

- Keep this sprint parse-only. A code block is represented in the AST as executable source/statements but is not run by the parser.
- AST types for assignments, loops, returns, and match expressions are contract scaffolding only where appropriate; do not implement their parsing or runtime behavior ahead of Sprints 008–009. Make the handoff explicit about which statement forms are accepted in this sprint (declarations only).
- Preserve ordinary Markdown fence text exactly, including its delimiters. Only a recognized `amx` opener starts an executable block.
- V0.2’s breaking migration is intentional: update tests that assumed bare declarations execute; do not add compatibility fallback.
- Do not touch renderer, evaluator, CLI, examples, extension packaging, or domain behavior in this sprint.
