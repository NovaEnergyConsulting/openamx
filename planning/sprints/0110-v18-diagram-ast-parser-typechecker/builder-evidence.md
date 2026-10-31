# Sprint 110 Builder Evidence: V0.18 Diagram AST, Parser, and Typechecker

## Status

Sprint 110 implementation and scoped verification are complete under the
separately approved file plan and consumer-path amendment.

**Builder recommendation:** ACCEPT.
**Separate product-owner disposition:** PENDING.

## Entry Decisions and Authorization

- Sprint 109 disposition rechecked: ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
	2026-10-30. Its accepted generated cap remains 64 control-block-originating
	primitives per evaluated diagram, with control-only accounting. S110 does
	not implement this runtime cap.
- D109-04 diagnostic allocation: `AMXD6001` is the shared control-time
	diagnostic, with message `Variable [<time-name>] is already used to control
	the diagrams timeline. Use a different variable name.` and primary anchor
	at the time identifier. For the standard `t` timeline this matches the
	allocated message exactly.
- Nested-loop syntax allocation: retain `AMX3006`, message `No nested loops
	are allowed inside a diagram`, anchored at the inner `for` token.
- Malformed/unsupported diagram content: retain `AMX3006`, message `Malformed
	for or if declaration`, anchored at the first offending token. The user
	clarified that the initially suggested `AMXD6002`/`AMXD6003` identities are
	not to be used.
- Cap-overflow diagnostic for S111: NOT ALLOCATED. It remains a prerequisite
	before S111; `AMXD013` is not reused.
- D110-01: recursive `content` is the sole authoritative AST representation.
	All direct AST consumers were migrated; no second mutable flat array is
	retained. The existing frame evaluator throws an explicit internal error
	for control-bearing declarations before producing a frame. The boundary
	test passes; this is not expansion behavior.
- Execution authorization and plan approval: explicit user authorization on
	2026-10-31 at base commit
	`c0fbb9f3d0f8d25de12037c6b5fa9dcd77b5f1e1`, branch `feat/create-v0.18`,
	with a later explicit amendment for shared highlighting, shared symbols,
	VS Code navigation, and the extension no-emit typecheck.
- Host/tool versions: Windows; PowerShell 5.1.26100.9711; Bun 1.4.4; Node
	24.13.1; Git 2.56.0.windows.4.
- Preservation: the worktree was clean before implementation. Existing
	`vscode-extension/dist/`, `vscode-extension/out/`, and
	`vscode-extension/.vscode-test/` artifacts were inspected and left
	untouched. No generated browser runtime was rebuilt or edited.

## Implementation and Verification

- Approved implementation paths: `src/ast/types.ts`,
	`src/diagnostics/errors.ts`, `src/parser/parseIf.ts`,
	`src/parser/parseStatements.ts`, `src/typechecker/checkDocument.ts`,
	`src/formatter/formatAmx.ts`, `src/runtime/moduleLoader.ts`,
	`src/runtime/diagramModel.ts`, `src/editor/completion.ts`,
	`src/editor/highlighting.ts`, `src/editor/symbols.ts`, and
	`vscode-extension/src/providers/navigation.ts`.
- Modified focused tests: `tests/parser.test.ts`, `tests/diagram.test.ts`,
	and `tests/formatter.test.ts`. `tests/modules.test.ts` and
	`tests/editor.test.ts` were run as compatibility suites and not modified.
- Recursive AST: primitive, `for`, and braced `if`/`else` nodes preserve
	source order, expressions, iterator identifiers, control delimiters,
	primitive names, and property source locations.
- Parser: accepted mixed nesting parses; nested `for` fails at the inner
	token through conditional branches; malformed controls and unsupported
	body statements use the approved typed `AMX3006` diagnostics.
- Checker: existing `AMX3001`, `AMX3002`, `AMX3003`, and `AMX3007` semantics
	are preserved; iterator bindings are scoped/restored; `AMXD6001` rejects
	the declared timeline variable in both control kinds; primitive/property
	rules recurse. Authored primitive declarations count once toward the
	existing report/module 512 limit and `AMXD013`; the separate 16-diagram
	limit remains unchanged.
- Formatter: recursive blocks retain source order and canonical two-space
	indentation; parse-format-parse content equivalence and idempotence pass.
- AST consumer audit: checker, formatter, module-loader authored counting,
	runtime model evaluation, completion, highlighting, shared symbols, and
	VS Code navigation were audited. Runtime rejects control content before
	flat evaluation. Editor consumers preserve existing top-level static
	diagram behavior only; nested-control editor support remains out of scope.
- Final focused test selection through the VS Code test runner:
	`tests/parser.test.ts`, `tests/diagram.test.ts`, `tests/formatter.test.ts`,
	`tests/modules.test.ts`, and `tests/editor.test.ts` — **141 passed, 0
	failed**.
- `bunx tsc --noEmit` — PASS.
- `bunx tsc --noEmit -p vscode-extension/tsconfig.test.json` — PASS; this
	compiled the provider and host-test sources without writing outputs.
- `git diff --check` — PASS. Changed-file diagnostics reported no issues.
- Source locations: parser assertions cover loop/if delimiters, expressions,
	primitive names, and properties. `AMXD6001` was checked in complete AMX
	documents under LF and CRLF, including a non-BMP character before the
	identifier; UTF-16 columns and fenced-document offsets passed.
- Failures and retries:
	- The first parser location run was 62/1: the source-location assertion
		expected iterable column 19, but the literal source placed it at column
		15. After correcting that expectation, the parser rerun was 48/0; the
		later parser run including malformed blocks and delimiter locations was
		63/0.
	- The first range run was 17/1 because the fixture used bare `1 to 3`;
		existing syntax requires `[1 to 3]`. The corrected run was 18/0; the
		later diagram run including nested primitive validation was 19/0.
	- The first combined parser/diagram/editor compatibility run failed 109/1
		because shared highlighting still read `diagram.elements`. The
		consumer-path amendment was approved, all three discovered consumers were
		adapted, and the same selection passed 110/0.
	- The primitive parser retained its pre-existing `Unclosed diagram
		element` message after final diff review; parser and formatter suites
		passed 84/0 after that correction.
- Not run: the VS Code Extension Development Host suite, root full suite,
	`bun run build`, runtime expansion, browser playback, PDF/DOCX rendering,
	generated-cap overflow, release, publication, package/version changes, and
	platform certification. The host test command was intentionally not run
	because it would overwrite existing ignored `dist/`, `out/`, and
	`.vscode-test/` outputs; extension source/tests were checked with no-emit
	TypeScript instead.

## Traceability and Scope

- All 19 IDs in `parser-checker-test-matrix.md` map to focused parser,
	checker, formatter, source-location, compatibility, or staging-boundary
	assertions; no P110 IDs are missing or duplicated.
- Gate reconciliation: G110-01 PASS (`AMXD6001` allocation and tests);
	G110-02 PASS (nested `AMX3006` message/anchor); G110-03 remains pending for
	S111 only; G110-04 PASS (canonical AST and tested fail-closed boundary);
	G110-05 PASS (LF/CRLF and UTF-16 locations). No S111 overflow behavior is
	claimed.
- Changed paths: the 12 approved implementation paths and 3 modified test
	paths listed above, plus `planning/sprints/0110-v18-diagram-ast-parser-typechecker/builder-evidence.md`,
	`planning/decisions.md`, `planning/state.md`, `planning/STATUS.json`, and
	`planning/ARCHITECT_BRIEFING.md`.
- Runtime expansion, the accepted 64 cap, per-instance frame bindings,
	serialization changes, browser playback, and static exports: NOT IN SCOPE /
	NOT RUN.
- Release, publication, package/version changes, and platform certification:
	NOT AUTHORIZED.
- Builder recommendation: ACCEPT for S110 scope because all approved
	acceptance gates passed; listed downstream work remains unproven.
- Separate product-owner disposition/date: PENDING.
- Sprint 111 remains gated on separate S110 ACCEPTED/CLOSED disposition and
	allocation of its distinct overflow diagnostic.