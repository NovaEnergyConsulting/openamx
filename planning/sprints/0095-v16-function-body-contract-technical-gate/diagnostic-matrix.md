# Sprint 095 Diagnostic Matrix

## Status

Product owner accepted the diagnostic contract on 2026-10-23. Function-body
feature paths remain unimplemented; exact implementation locations must be
verified by their owning sprints. This matrix records approved planning
identities/messages, not runtime or parser evidence.

Builder review (2026-10-23): existing catalog meanings were inspected in
`src/diagnostics/errors.ts`, `src/typechecker/checkDocument.ts`, and focused
parser/type-checker tests. `AMXF4001` was searched repository-wide and had no
existing use before the product owner allocated it. Fixture locations refer
to raw AMX snippets with 1-based lines and columns; no Markdown fence offset
is included. Exact feature-path behavior and locations remain **NOT RUN**.

| ID | Invalid condition | Phase | Required diagnostic disposition | Primary source anchor | Owner |
| --- | --- | --- | --- | --- | --- |
| `V16-FN-PARSE-01` | Malformed braced function body or invalid statement boundary | Parse | **APPROVED:** `AMX3006: Invalid syntax in function body`. | Fixture line 2, column 7 (`=` in `let = value`). | 096 |
| `V16-FN-PARSE-02` | Unclosed function body | Parse | **APPROVED:** `AMX3006: Unclosed function body`. | Fixture line 1, column 34 (opening `{`). | 096 |
| `V16-FN-PARSE-03` | Unsupported declaration/action inside function body | Parse | **APPROVED:** `AMX3006: The '{keyword}' statement is not allowed in a function body.` | Per-subcase keyword anchors are listed below. | 096 |
| `V16-FN-TYPE-01` | One or more reachable paths fall through | Static type check | **APPROVED:** `AMXF4001: Missing return value from function`; do not reuse `AMX3021`. | Function closing brace, fixture line 5, column 1. | 098 |
| `V16-FN-TYPE-02` | Explicit return type is incompatible with declared function return type | Static type check | **APPROVED:** `AMX3002: Expected Number, got String`. | Fixture line 3, column 12 (the string expression). | 098 |
| `V16-FN-TYPE-03` | Identifier is outside function/block scope | Static type check | **APPROVED:** `AMX3001: Unknown identifier 'local'`. | Fixture line 5, column 10 (`local`). | 098 |
| `V16-FN-TYPE-04` | Assignment target is not an existing local/parameter | Static type check | **APPROVED:** `AMX3001: Unknown identifier 'missing'`. | Fixture line 2, column 3 (`missing`). | 098 |
| `V16-FN-TYPE-05` | A return is outside a braced function or otherwise has no valid context | Parse | **APPROVED:** `AMX3006: Return is only valid inside a function or expression-form loop`. | Fixture line 1, column 1 (`return`). | 096 |
| `V16-FN-FLOW-12` | Invalid unreachable non-return statement | Static type check | **APPROVED:** `AMX3001: Unknown identifier 'missing'`; all statements are checked even when unreachable. | Fixture line 3, column 3 (`missing`). | 098 |
| `V16-FN-COMPAT-02` | Forward function reference | Static type check | `AMX3004`, exact existing message `Unknown function 'later'`, is expected; verify the expression source in the new body path. | Fixture line 1, column 22 (`later`). | 098 |
| `V16-FN-COMPAT-03` | Recursive function reference | Static type check | `AMX3004`, exact existing message `Unknown function 'repeat'`, is expected; verify the expression source in the new body path. | Fixture line 2, column 10 (`repeat`). | 098 |
| `V16-FN-COMPAT-04` | Function captures document binding | Static type check | `AMX3001`, exact existing message `Unknown identifier 'outside'`, is expected; verify the identifier source in the new body path. | Fixture line 3, column 10 (`outside`). | 098 |
| `V16-FN-RUNTIME-01` | Defensive evaluator fallthrough after static gate should have rejected it | Runtime | **RESIDUAL / UNALLOCATED.** `AMX1007` is not semantically matching. Keep this as a test-harness case, not valid AMX source. | Constructed invalid function body; source location availability is unresolved. | 097 |

`V16-FN-TYPE-01` and `V16-FN-TYPE-02` refer to the canonical fixture bodies
`V16-FN-FLOW-02` and `V16-FN-FLOW-08`; they are matrix aliases, not extra
sources or diagnostic occurrences. `V16-FN-PARSE-03a` through `03l` are
independent complete source fixtures.

| Fixture | Approved primary source location |
| --- | --- |
| `V16-FN-PARSE-03a` | Line 2, column 3 (`import`). |
| `V16-FN-PARSE-03b` | Line 2, column 3 (`export`). |
| `V16-FN-PARSE-03c` | Line 2, column 3 (`type`). |
| `V16-FN-PARSE-03d` | Line 2, column 3 (`enum`). |
| `V16-FN-PARSE-03e` | Line 2, column 3 (`dimension`). |
| `V16-FN-PARSE-03f` | Line 2, column 3 (`unit`). |
| `V16-FN-PARSE-03g` | Line 2, column 3 (`input`). |
| `V16-FN-PARSE-03h` | Line 6, column 3 (`table`). |
| `V16-FN-PARSE-03i` | Line 3, column 3 (`chart`). |
| `V16-FN-PARSE-03j` | Line 2, column 3 (`diagram`). |
| `V16-FN-PARSE-03k` | Line 10, column 3 (`show`). |
| `V16-FN-PARSE-03l` | Line 2, column 3 (`export`). |

## Source-Range Contract

- Store each fixture as a complete original AMX source envelope, including
  Markdown/front matter/fence lines if the test uses a document file.
- Record 1-based line and column conventions for diagnostics. When an editor
  maps a diagnostic to a token range, record that range's exclusive end
  separately; verify UTF-16 behavior and both LF and CRLF mapping when
  applicable.
- Incompatible-return diagnostics point to the return expression;
  `AMXF4001` points to the closing function brace. These feature-path locations
  are approved but remain **NOT RUN** until downstream implementation.
- Include a secondary range only when the implementation can report it
  meaningfully, such as the declared return type paired with an incompatible
  explicit return.
- A diagnostic's expected location must identify the intended invalid
  construct, not merely the beginning of the document or a nearby declaration.

The editor's `sourceOffset` and `sourceTokenRange` helpers use 1-based source
line/column values, tolerate CRLF, and count JavaScript UTF-16 code units;
existing editor tests verify a non-BMP prefix. They do not provide a
diagnostic end range in `AmxDiagnostic`, which currently stores only line and
column. Record a token-width range in downstream fixture assertions only when
the editor maps that source to a verified token; do not imply the runtime
diagnostic itself carries an end position.

## Compatibility Checks

- Existing expression-bodied functions continue to use their established
  diagnostic path.
- Expression-form loop return collection is not reported as a function return
  or a missing-return error.
- Do not reuse an existing code with a different user-facing meaning.
- Runtime fallthrough is a defensive guard, not a substitute for static
  missing-path diagnostics.

## Verified Catalog Facts and Residual

| Identity | Verified existing meaning | Sprint 095 disposition |
| --- | --- | --- |
| `AMX3001` | Static unknown name/type/field; `Unknown identifier '{name}'` is used for unknown identifier references/assignment targets. | Approved for out-of-scope/unknown function-body names; verify feature path in Sprint 098. |
| `AMX3002` | Static incompatible type; `Expected {expected}, got {actual}`. | Approved for incompatible explicit returns; verify feature path in Sprint 098. |
| `AMX3004` | Static invalid function call; `Unknown function '{name}'` for an undeclared callable. | Approved for preserved forward-reference and recursion rejection; verify feature path. |
| `AMX3006` | Syntax-error family, with message supplied by parse site. | Approved exact messages are listed in the matrix and contract; verify parser paths in Sprint 096. |
| `AMXF4001` | New function missing-return diagnostic; `Missing return value from function`. | Allocated by product owner 2026-10-23; code was unused in repository at allocation; register/implement in Sprint 098. |
| `AMX1007` | Runtime return outside expression-form loop. | Do not reuse for function fallthrough or function return context. |
| `AMX3021` | `Every possible path in an if expression must return a value`. | Do not reuse for function all-path return analysis. |
| Defensive function-fallthrough identity | No identity allocated by explicit product-owner choice. | Residual; allocation blocks Sprint 097. |

LF/CRLF and UTF-16 requirements are verified by existing focused tests, but
no function-body location can be behaviorally certified until the parser/checker
exists. That check is **NOT RUN** for V0.16 fixtures, by design.