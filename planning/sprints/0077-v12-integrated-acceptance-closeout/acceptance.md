# Sprint 077 Acceptance Criteria

Sprint 077 is complete when an integrated, requirement-traceable V0.12 acceptance matrix records direct evidence for the core language, documentation/formatter, VS Code, and desktop editor; all failures/residuals are dispositioned honestly; and a separate Lead Developer disposition records the V0.12 milestone status. Sprint 077 adds no feature scope and does not authorize release or publication.

## Integrated Requirement Matrix

- Every relevant V0.12 master-plan requirement and Sprint 072 fixture family is represented in an integrated matrix.
- Each row identifies fixture/case IDs, expected behavior, surface(s), exact test command or action, evidence/artifact location, status (`PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`), residual owner, and required follow-up/disposition.
- Core, VS Code, and desktop results are separate where the behavior is exposed on more than one surface. No adjacent surface's evidence is used to infer a pass.

## Core Language, Diagnostics, and Formatter

- Re-run acceptance for record inheritance (single/multiple/transitive parents, collisions and override rules, complete field contract replacement, deterministic field order, constructors, modules, and non-subtyping).
- Re-run enum acceptance (implicit values from 1, homogeneous literal values, name/value uniqueness including duplicate String values, empty-enum rejection, primitive access, and module/source-order rules).
- Re-run braced-if acceptance (expression/statement distinction, required/optional else, explicit returns on every expression path, local return behavior, scope, outer assignment, nesting, Boolean/type checks, selected-branch evaluation, and legacy conditional preservation).
- Verify expected diagnostic identities/messages and source ranges for approved AMX3011-AMX3021 cases and applicable established syntax/type/module diagnostics. Verify original-document locations for LF and CRLF where required.
- Formatter checks prove idempotence, parse acceptance, and unchanged evaluated meaning for inherited declarations/overrides, enums, braced expressions/statements, nested blocks, and the legacy single-line conditional.

## Documentation, Examples, and Help

- The V0.12 specification, README references, both runnable examples, and desktop Help pass their relevant existing documentation/example/UI assertions and match the approved contracts.
- No unsupported feature, altered semantic rule, migration guide, software release, publication authorization, platform certification, or broad compatibility claim is introduced.

## VS Code and Desktop Editor

- VS Code Development Host checks directly exercise V0.12 TextMate scopes, formatting, diagnostics/ranges, completion, symbols/outline, and navigation on representative valid and invalid examples.
- The full VS Code run reports its real aggregate outcome. Windows EBUSY/path-case failures or other residuals are recorded individually with exact tests and evidence; a passing focused feature test does not convert the full suite to PASS.
- Desktop typecheck/web build and RPC suite are run and their full statuses recorded. V0.12 shared-analysis RPC assertions are identified separately from any later inherited runner failure.
- The desktop CodeMirror/workbench UI directly verifies representative V0.12 highlighting/diagnostic display and completion/navigation behavior using the existing Playwright infrastructure. If unavailable, the corresponding rows are BLOCKED/UNAVAILABLE, not inferred from RPC facts.
- Desktop Help UI verifies the searchable V0.12 topic. Existing sandbox/CSP behavior remains unchanged.

## Integrated Verification, Residuals, and Disposition

- Focused root suites and root build run. The full root suite is run and compared with Sprint 076's retry result: 460 passed, 1 failed across 461 tests / 35 files, with the imported dimension/unit symbol identity failure as the named residual.
- Extension and desktop script outcomes are recorded exactly against Sprint 076 evidence: VS Code latest 16 passed / 7 failed on Windows (five EBUSY cleanup errors and two path-case comparisons); desktop typecheck/web build/help UI passed, while RPC contract validation stopped at the inherited sandbox-count assertion (expected 2, found 1).
- Any changed, new, transient, unavailable, or not-run result is listed with exact evidence; retries clarify but do not erase earlier failures. No failure is omitted or represented as a pass.
- `builder-evidence.md` includes exact commands, versions where available, test counts, screenshots/logs/artifacts, source fixture IDs, statuses, residual owners, and a closeout recommendation.
- The Lead Developer explicitly records V0.12 as ACCEPTED/CLOSED with named residuals or BLOCKED/OPEN with required follow-up. Builder evidence alone does not declare acceptance.
- No feature work, release, publication, package/version change, or platform certification occurs.
