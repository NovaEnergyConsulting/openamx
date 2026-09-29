# Sprint 016 Blueprint: CSV/JSON Input and Runtime Validation

## Approach

- Extend AST/parser/type checker with an `input` declaration node and enforce entry-only placement at module-link/load time, leaving `parseDocumentText` free of file I/O.
- Add a focused input-mapping parser to the CLI and a data-loader/validator module that receives declared types plus mapping strings. Keep all data-file reads, JSON parsing, and CSV parsing in that boundary.
- Reuse nominal record declarations and checked type references from Sprint 014/015. Materialize records in declaration order, apply defaults/null omission rules, and create fresh nested/default values.
- Use a standards-compliant CSV library for UTF-8/RFC 4180 records, quoted newlines, CRLF/LF, and quoting. Use JSON parsing that can surface duplicate object keys, retaining data paths/locations required for diagnostics.
- Collect structured validation diagnostics before throwing a single aggregate failure. Fail-fast uses the same traversal but immediately raises the first diagnostic.
- Supply validated values to `loadEntryModule`/entry evaluation before blocks run. Imported modules remain incapable of declaring inputs and never receive arbitrary data paths.

## Files to Update

- `package.json` and lockfile only if a focused CSV parser dependency is required
- `src/ast/types.ts`
- `src/parser/parseStatements.ts` and narrowly required parser helpers
- `src/typechecker/checkDocument.ts`
- `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and focused data-loading/validation support
- `src/cli.ts`
- `src/diagnostics/errors.ts`
- `tests/parser.test.ts`, focused data/CLI/module tests, and narrowly required evaluator/renderer tests
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

## Notes

- JSON accepts one value matching the declared input type exactly; there is no singleton-to-list conversion or scalar coercion.
- CSV accepts only a record list with scalar/nullable-scalar fields. Nested records/lists and JSON-in-cell are rejected.
- Blank unquoted CSV cells mean nullable null; quoted empty cells mean `String` empty value. Header names are exact/case-sensitive and may be in any declared-field order.
- This sprint validates imports before evaluation but does not serialize or select exports; do not add `--output` as a convenience.
