# Sprint 058 Requirements: Editor Parity, Documentation, and V0.9 Acceptance

## Goal

Complete the approved V0.9 language cycle by verifying and correcting existing editor integrations across all delivered features, publishing accurate user-facing language and migration guidance, bringing examples and bundled help up to date, and recording integrated acceptance evidence. This sprint closes cross-surface gaps; it does not add language semantics or unrelated editor capabilities.

## Dependencies and Entry Gate

- Sprint 053 (strings), Sprint 054 (lists), and Sprint 057 (measurement data/reporting) are required dependencies. Each is **COMPLETE / APPROVED** by separate Lead Developer disposition.
- Sprint 052 is **ACCEPTED WITH RECORDED RESIDUALS**; Sprint 055 and Sprint 056 are **COMPLETE / APPROVED**. Their approved contracts and implementation evidence remain authoritative.
- Sprint 057's desktop RPC Windows path-separator assertion and Windows Extension Development Host result (15 passed / 5 failed: four `EBUSY` cleanup failures and one drive-letter casing assertion) remain unpassed residuals. Sprint 053/054 have their own separately recorded Windows host/RPC residuals. Preserve each result as recorded; do not report it as passing or conflate runs.
- These residuals do not block unrelated parity or integration work. If a residual is reproduced on the available host or blocks a required test, record the exact command, failure, and affected behavior rather than silently waiving it.
- The approved V0.9 language contract, Sprint 051 design appendix, and master sprint plan are authoritative. No new language/business-rule decision is open for preparation.
- Inspect the current worktree and preserve unrelated or user-owned changes.

## Inputs

- `planning/plan-openamxV09MasterSprintPlan.md`, Phase 4 and Sprint 058 scope
- `docs/language-spec-v0.9.md`, compatibility rules, language behavior, external data and presentation contracts
- Approved Sprint 051 cross-surface audit and conformance/migration matrix
- Sprint 052-057 requirements, acceptance files, Builder evidence, planning decisions/questions, and Lead Developer dispositions
- Shared editor analysis and formatter, VS Code providers and TextMate grammar, desktop CodeMirror/worker/RPC surfaces, related tests
- `README.md`, `docs/`, `examples/`, `libraries/`, and `desktop-app/src/mainview/components/help-content.json`

## In Scope

- Audit and close only demonstrated V0.9 editor-parity gaps for string escapes/interpolation, multiline `=` records, 1-based indexed reads and list mutation, dimensions/units/measurements, and input/output/report diagnostics.
- Verify existing formatting, coloring, diagnostics, completion, hover/type information, definition/navigation, references, rename, outline/symbols, and source ranges in the shared editor, VS Code extension, and desktop editor wherever that capability exists. Do not invent a new capability solely to make clients look alike.
- Ensure VS Code TextMate coloring and shared AST-derived facts agree on new syntax and incomplete drafts. Preserve executable-fence boundaries, narrative isolation, imported-module identity, original-document offsets, and equivalent LF/CRLF locations.
- Update `docs/language-spec-v0.9.md` only to correct implementation/documentation mismatches without changing the approved contract. Update user-facing entry points, including `README.md`, to link to the V0.9 specification accurately.
- Add a focused `docs/migrating-to-v0.9.md` covering only the approved compatibility changes: constructor `:` to `=`, string escape decoding, and strict checking of previously unchecked invalid programs. Clearly distinguish record constructor delimiters from type/annotation colons; do not promise automatic migration or formatter repair.
- Update or add representative examples that demonstrate V0.9 behavior, relative module/library imports, and supported data/reporting paths. Keep positive examples executable and retain negative tests as rejection cases.
- Update bundled Help Center JSON with searchable V0.9 language/migration guidance. Preserve the existing offline help, navigation, and command-registry behavior.
- Run targeted regression tests, then integrated root, VS Code, and desktop verification on available hosts. Record exact commands, totals, environment, failures, and residuals.
- Update Sprint 058 Builder evidence and the planning state/decision/question records; request a separate Lead Developer disposition.

## Out of Scope

- Changing approved grammar, precedence, runtime, data, schema, diagnostics, chart/report, or compatibility semantics; adding syntax, unit inventories, migrations, or new data formats.
- Redesigning editor/UI workflows or inventing unrelated completion, navigation, refactoring, hover, or accessibility features.
- Migrating historical specifications/examples/tests unrelated to current supported examples, deleting negative coverage, or weakening static checking to obtain passing tests.
- Release/version changes, publication, installer/platform certification, broad Office compatibility, or claiming native behavior not tested.
- Repairing unrelated historical Windows host/RPC failures unless a focused reproduction demonstrates a Sprint 058 functional defect; do not modify unrelated user files to clear repository-wide checks.

## Constraints

- Preserve the exact approved behavior in `docs/language-spec-v0.9.md` and Sprint 051's approved technical appendix. Raise any genuine contradiction in `planning/questions.md` and obtain Lead Developer direction before semantic changes.
- Editor handling must be tolerant of incomplete drafts without changing runtime/parser acceptance rules. Invalid completed syntax remains diagnosed; formatting must not repair it silently.
- Keep language tooling inside executable AMX fences. Narrative interpolation remains distinct from double-quoted AMX interpolation; inert fences remain inert.
- Preserve source locations in the original document, including front matter, fence delimiters, imports, LF and CRLF. Do not confuse declaration identity with the importing file's local names.
- Examples/help/docs must describe implemented and accepted behavior, not imply all platforms or V0.9 are accepted before the Lead Developer disposition.
- Report each host/platform result separately and truthfully. An accepted residual is not a test pass.