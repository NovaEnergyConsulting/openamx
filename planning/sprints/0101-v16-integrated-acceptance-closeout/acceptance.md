# Sprint 101 Acceptance Criteria

Sprint 101 is complete when every applicable V0.16 requirement has direct,
traceable evidence across implementation and authoring surfaces; all raw
failures/unavailable checks have explicit owners and disposition; and a
separate Lead Developer/product-owner records V0.16 closeout. Sprint 101
adds no product scope and does not authorize release/publication.

## Requirement-to-Evidence Matrix

- Every row in `integrated-evidence-matrix.md` has `PASS`, `FAIL`,
  `BLOCKED/UNAVAILABLE`, or `NOT RUN`, exact command/action, input, expected
  and actual result, evidence location, residual owner, and disposition.
- Sprint 095 contract fixture groups and all applicable V0.16 master-plan
  requirements are traced to current tests; no fixture is considered covered
  solely because its source appears in documentation.
- Where behavior spans surfaces, parser/runtime/checker/shared editor/VS
  Code/desktop/docs/examples are recorded separately. No result is inferred
  from another host, earlier sprint, build alone, or user report.

## Core and Module Behavior

- Both expression- and statement-bodied functions parse, evaluate, and
  type-check. Existing expression-body syntax, results, visibility, and
  formatting remain compatible.
- Parser tests cover approved statements, malformed/unclosed bodies,
  prohibited statements, nested braces/strings, return context, and exact
  source positions.
- Runtime tests prove direct and nested returns exit the function; loop
  returns stop later iterations; scopes/iterators restore; parameter changes
  remain call-local; list copies are nested and independently copied per
  parameter; local list mutations/results match contract; AMXF4002 remains a
  defensive guard.
- Type-check tests cover every explicit return including unreachable ones,
  complete/incomplete if branches, later return, loop zero-iteration,
  lexical scopes/shadowing, incompatible return, and exact AMXF4001 at the
  closing brace. AMX3021 remains specific to braced-if expressions.
- Module tests directly verify export/import of a braced function and an
  expression function, plus declaration order, no forward reference,
  recursion, or capture.

## Formatter, Editors, and Authoring

- Formatter is idempotent for both forms, preserves expression spelling and
  surrounding document text, handles nested braces/strings/CRLF, and preserves
  evaluated values.
- Shared editor facts correctly cover parameter/local highlights,
  source-order/lexical completion, symbol identity/navigation/references/
  rename, diagnostics and source mapping.
- VS Code actual TextMate grammar and Extension Development Host tests cover
  syntax scopes, expression/statement completion, formatting, navigation,
  diagnostics, and Markdown boundaries.
- Desktop typecheck/build/RPC/UI gates are recorded separately. Focused
  CodeMirror/Help tests cover statement functions, completion, formatter,
  navigation, and source-accurate diagnostics.
- V0.16 spec, reference 15, invalid-only fixture, index/navigation, root and
  extension README, desktop Help, desktop guide allowlist/parity/materialization
  are verified. Existing 00-14 guide roles remain unchanged.
- Valid examples run through the fresh CLI build. The invalid fixture is
  tested separately and fails with AMXF4001; it is never included in a
  positive run batch.

## Repository and Host Gates

- Run focused root tests, a fresh isolated root build, and the full root test
  suite. Record complete test counts and all failures.
- Run VS Code compile/tests. Report the default runner's VS Code 1.85.0
  engine mismatch and any explicit 1.143.1 host result separately.
- Run desktop `typecheck`, `build:web`, `test`/RPC, and focused Playwright UI
  tests using isolated build outputs and a new result directory.
- Keep the historical desktop RPC sandbox-count mismatch visible; do not
  modify assertion/security markup without separate authorization.
- Keep Linux Playwright fallback, native/package launch, and other
  OS/architecture evidence distinct. Unavailable routes are
  `BLOCKED/UNAVAILABLE`, never inferred PASS.
- Sprint 100's stale repository `dist/cli.js` remains preserved; fresh CLI
  verification uses an isolated output tree/copy. Root build-generated
  `src/renderer/diagramBrowserRuntime.ts` is isolated as well.

## Evidence, Residuals, and Disposition

- `builder-evidence.md` includes exact commands, tool/OS versions, test
  counts, artifacts/logs/screenshots, first attempts/retries, expected vs
  actual values, failures/unavailable checks, residual owners, and output
  preservation evidence.
- All Sprints 095-100 accepted evidence remains unchanged. Earlier raw
  outcomes are not rewritten; separate owner dispositions remain separate.
- Builder recommendation lists each residual and owner. A separate Lead
  Developer/product-owner records `ACCEPTED/CLOSED` with named residuals or
  `BLOCKED/OPEN` with follow-up.
- Closeout itself does not authorize package/version change, release,
  publication, installer distribution, certification, or platform
  qualification.