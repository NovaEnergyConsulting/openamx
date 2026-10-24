# Sprint 099 Acceptance Criteria

Sprint 099 is complete when formatter and editor support for accepted
statement-bodied functions works through shared services, VS Code, and
desktop without changing language semantics or established expression-body
behavior.

## Formatter

- Braced function bodies format with consistent two-space indentation,
  including nested statement if/else and for blocks.
- Formatting is deterministic and idempotent for expression- and
  statement-bodied functions, nested braces, string/interpolation braces,
  CRLF documents, and multiple executable blocks.
- Function/expression spelling, token order, quoted text, and non-executable
  Markdown/fences are preserved. Existing expression-function formatting is
  byte-for-byte stable except for already-established whitespace
  normalization.
- Format-before/after parse and evaluation results agree for valid fixtures
  available to the test harness.

## Shared Editor Facts

- `editorHighlightFacts` covers function keywords, function/parameter/local
  declarations, type annotations, return/list/assignment statements, and
  nested expressions using parser-proven source ranges.
- Parameter-name and annotation facts use exact token ranges. They do not
  reuse the current function-start location stored in the parameter source
  fields; any parser anchor correction is covered by focused source-location
  tests.
- `editorCompletionFacts` provides parameters and preceding locals only in
  their valid function lexical scope, includes the active loop iterator,
  respects nested shadowing and branch boundaries, and excludes caller,
  module-document bindings, later declarations, and locals after block exit.
- Symbol facts support definition/reference/rename for parameters and locals.
  Uses resolve to the nearest visible binding; nested shadows remain distinct;
  same-scope repeated `let` follows the accepted binding identity.
- Existing expression-body symbols, module exports/imports, and ordinary
  document completions remain unchanged.
- Static/parser diagnostics for function bodies remain source-accurate and
  retain their accepted code/message/phase, including `AMXF4001` and parser
  `AMX3006` cases. Do not invent token-width ranges beyond the available
  diagnostic model.

## VS Code

- Actual TextMate grammar tokenization covers braced function declarations,
  parameter/type tokens, statement keywords, nested blocks, and strings
  without leaking AMX scopes into narrative or inert fences.
- Extension Development Host tests prove formatting idempotence, scoped
  parameter/local completion, definition/reference/rename, and a
  source-accurate function-body diagnostic.
- Existing expression-body grammar, providers, and module navigation tests
  remain passing.

## Desktop

- Desktop CodeMirror shows shared function/parameter/local highlights and
  diagnostic decoration; shared RPC completion/navigation facts remain in
  sync with the editor.
- Focused Playwright acceptance proves function-scope completion, format
  idempotence, navigation/outline behavior for function-local symbols where
  exposed, and an `AMXF4001` diagnostic at the closing-brace source.
- Existing V0.14 editor UX and shared markdown/source selection behavior
  remain unchanged. No broad UI redesign is added.

## Evidence and Boundaries

- Focused root formatter/editor tests, VS Code host tests, desktop UI test(s),
  and relevant typechecks pass, or exact residuals/unavailable checks are
  recorded with raw output and owner.
- `builder-evidence.md` records authorization, approved paths, commands,
  outcomes, residuals, and final disposition request. Accepted Sprint 095-098
  records remain unchanged.
- No language semantics, release/version changes, publication, unsupported
  platform certification, or integrated V0.16 closeout claim is made.