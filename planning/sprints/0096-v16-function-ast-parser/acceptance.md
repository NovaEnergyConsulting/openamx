# Sprint 096 Acceptance Criteria

Sprint 096 is complete when both function body forms have a stable,
source-located AST/parser contract conforming to the accepted Sprint 095
decisions. Runtime execution and function return analysis remain downstream.

## AST and Compatibility

- The function AST explicitly discriminates expression and statement bodies.
- Expression-bodied declarations retain the same expression AST payload and
  the existing parser behavior. Existing expression-function parser tests
  remain passing or are narrowly updated only to assert the equivalent
  discriminated representation.
- Statement bodies retain the parsed statement AST in source order and record
  the opening and closing brace locations needed by later diagnostics.
- Function declaration, parameter, body, nested statement, and expression
  source positions are preserved in the original AMX document.
- Every AST consumer touched for compilation narrows the body form explicitly.
  No runtime, static checking, formatting, or editor behavior is claimed as
  implemented by a type-only adapter.

## Parsing

- `=` expression bodies and `{ ... }` statement bodies both parse; the body
  introducers are exclusive and no existing expression spelling is changed.
- The approved statement forms parse in braced bodies: initialized `let`,
  assignment, `+=`, standalone if/else, statement-form for, return, and
  named-list add/remove.
- Function return statements parse at the function body level and within
  statement-form if/else and for blocks. They are represented as return AST
  nodes without claiming runtime propagation in this sprint.
- Function-return context is independent from expression-form loop returns.
  Expression-loop returns still collect values; braced-if expression returns
  remain expression-local; a function return does not accidentally make
  those constructs signal an early function exit.
- Expression-form loops remain prohibited inside both function forms by the
  accepted contract. The parser preserves the existing expression AST and
  return context; the existing checker-owned placement rejection is not
  moved into parsing or claimed as a new type-check result in this sprint.
- Nested statement loops, `break`, `continue`, and function-local function
  declarations remain rejected.
- The full prohibited-statement set in accepted fixtures
  `V16-FN-PARSE-03a` through `03l`, plus nested function declarations, is
  rejected with `AMX3006` and the exact approved keyword message at the
  prohibited keyword.
- Malformed body syntax reports
  `AMX3006: Invalid syntax in function body` at the offending token.
- An unclosed body reports `AMX3006: Unclosed function body` at its opening
  brace. A valid matching brace does not consume following declarations;
  unexpected tokens after the closing brace are diagnosed rather than
  dropped.
- A top-level or otherwise invalid-context return reports
  `AMX3006: Return is only valid inside a function or expression-form loop`
  at the return keyword, without changing expression-loop collection.
- Newlines separate statements and semicolons are invalid.

## Source Locations and Tests

- Tests cover nested if/else braces, loop braces, braces in single- and
  double-quoted strings, and strings adjacent to the closing function brace.
- Parser tests cover original-document offsets and matching locations under
  LF and CRLF. Test source includes executable-fence offsets where relevant.
- Exact parser diagnostics and source anchors match the accepted Sprint 095
  diagnostic matrix. Do not register or implement `AMXF4001` in this sprint.
- `bun test tests/parser.test.ts` passes.
- `bunx tsc --noEmit` (or approved local equivalent) passes without
  generating artifacts.
- `builder-evidence.md` lists exact commands, results, changed paths,
  residuals, and any checks not run. The Sprint 095 accepted folder remains
  unchanged.

## Boundaries

- No function-body runtime execution, return-type checking, all-path analysis,
  or runtime fallthrough diagnostic is implemented.
- No release/version change, publication, docs/examples, formatter/editor
  feature work, broad refactor, or platform-certification claim occurs.
- Sprint 097/098 readiness is not inferred from parser acceptance; their
  master-plan dependencies and separate authorizations remain in force.