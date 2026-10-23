# Sprint 095 Draft: Diagnostic Matrix

## Status

This is a required diagnostic inventory, not a diagnostic allocation. All
codes/messages below are **TO VERIFY OR ALLOCATE**. Check `src/diagnostics/`
and existing parser/type-checker tests before reuse. Record exact identity,
message, source range, and approver in this matrix before contract disposition.

| ID | Invalid condition | Phase | Required diagnostic disposition | Primary source anchor | Owner |
| --- | --- | --- | --- | --- | --- |
| `V16-FN-PARSE-01` | Malformed braced function body or invalid statement boundary | Parse | Verify existing syntax diagnostic or request allocation; exact message pending. | First malformed token or statement boundary. | 096 |
| `V16-FN-PARSE-02` | Unclosed function body | Parse | Verify existing unclosed-block diagnostic or request allocation; exact message pending. | Opening function brace or EOF, choose and justify. | 096 |
| `V16-FN-PARSE-03` | Unsupported declaration/action inside function body | Parse or static check, decide consistently | Verify existing category or allocate; do not emit a misleading top-level-only error. | Prohibited statement keyword. | 096/098 |
| `V16-FN-TYPE-01` | One or more reachable paths fall through | Static type check | New or verified stable missing-return diagnostic; exact code/message pending. | Closing function brace preferred; verify mapper behavior. | 098 |
| `V16-FN-TYPE-02` | Explicit return type is incompatible with declared function return type | Static type check | Reuse only if existing mismatch diagnostic accurately names function return; otherwise allocate. | Return expression. | 098 |
| `V16-FN-TYPE-03` | Identifier is outside function/block scope | Static type check | Reuse established undefined-identifier diagnostic only if phase and wording fit. | Identifier use. | 098 |
| `V16-FN-TYPE-04` | Assignment target is not an existing local/parameter | Static type check | Verify existing assignment/undefined-binding category and exact range. | Assignment target. | 098 |
| `V16-FN-TYPE-05` | A return is outside a braced function or otherwise has no valid context | Parse/static type check | Preserve existing expression-loop return rules; exact function-context behavior pending. | Return keyword. | 096/098 |
| `V16-FN-RUNTIME-01` | Defensive evaluator fallthrough after static gate should have rejected it | Runtime | Runtime guard required; exact error/code pending. | Function declaration/body closing location. | 097 |

## Source-Range Requirements

- Store each fixture as a complete original AMX source envelope, including
  Markdown/front matter/fence lines if the test uses a document file.
- Record 1-based line and column conventions and exclusive diagnostic ends
  according to current repository helpers; verify UTF-16 behavior and both
  LF and CRLF mapping when applicable.
- Prefer the return expression for incompatible-return diagnostics and the
  function closing brace for missing-return diagnostics, but treat the latter
  as a candidate until verified with established source-range conventions.
- Include a secondary range only when the implementation can report it
  meaningfully, such as the declared return type paired with an incompatible
  explicit return.
- A diagnostic's expected location must identify the intended invalid
  construct, not merely the beginning of the document or a nearby declaration.

## Compatibility Checks

- Existing expression-bodied functions continue to use their established
  diagnostic path.
- Expression-form loop return collection is not reported as a function return
  or a missing-return error.
- Do not reuse an existing code with a different user-facing meaning.
- Runtime fallthrough is a defensive guard, not a substitute for static
  missing-path diagnostics.