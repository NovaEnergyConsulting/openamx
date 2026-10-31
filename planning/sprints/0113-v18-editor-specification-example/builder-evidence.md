# Sprint 113 Builder Evidence: V0.18 Editor Support, Specification, and Example

## Status

Sprint 113 Builder execution was explicitly authorized by the user on
2026-10-31 after the separate S112 disposition recorded below. The approved
scope and output roots are enumerated under Entry and Authorization.
Implementation and scoped evidence are recorded below. Desktop CodeMirror
presentation passes in the approved Vite harness after the approved mock
amendment. The Hutch typecheck did not complete.

**Builder recommendation:** ACCEPT WITH RECORDED RESIDUALS.
**Separate product-owner disposition:** ACCEPTED WITH RECORDED RESIDUALS by
the user on 2026-10-31. This disposition does not close V0.18 or authorize
Sprint 114, release, publication, version changes, or platform certification.

## Entry and Authorization

- S109/S110/S111 dispositions rechecked: S109 ACCEPTED/CLOSED WITH RECORDED
	RESIDUALS (2026-10-30); S110 ACCEPTED/CLOSED (2026-10-31); S111
	ACCEPTED/CLOSED WITH RECORDED RESIDUALS (2026-10-31). D111-02 remains a
	potentially unbounded-work residual; no bounded time or memory claim is made.
- S112 product-owner disposition/date and raw residuals: ACCEPT WITH RECORDED
	RESIDUALS by the user on 2026-10-31. Preserve the intermittent Vite preview
	bridge failure/retry, skipped native WebView2, and unrun cross-platform
	checks as separate statuses; none is upgraded to PASS.
- Approved commit/worktree and preservation inventory: `54ec8c2ba6cac0a360337c6dfe2c797b4c98013d`
	on `feat/create-v0.18`; worktree was clean before this evidence entry. S109-S112
	artifacts, VS Code output roots, and existing desktop test results are to be
	preserved.
- Exact approved files, commands, output roots, and artifact paths: production
	`src/editor/highlighting.ts`; tests `tests/editor.test.ts`,
	`tests/formatter.test.ts`, `vscode-extension/src/test/providers.host.ts`,
	and `desktop-app/tests/ui/v16-language-editor.pw.ts`; conditional grammar
	file `vscode-extension/amx.tmGrammar.json` only if actual tokenization
	assertions fail; documentation `docs/language-spec-v0.18.md` and `README.md`;
	example `examples/08_Formula_Driven_Diagrams.amx`; evidence
	`planning/sprints/0113-v18-editor-specification-example/builder-evidence.md`
	and `editor-spec-example-test-matrix.md`. The user approved an amendment
	adding `desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` to fix
	active-buffer analysis lookup; regression coverage remains in the approved
	UI test. Approved commands:
	`bun test tests/editor.test.ts tests/formatter.test.ts tests/examples.test.ts`;
	from `vscode-extension/`, `bun run test`; from `desktop-app/`,
	`bun run typecheck` and
	`bun run test:ui -- tests/ui/v16-language-editor.pw.ts`. Preserve existing
	`vscode-extension/dist/`, `vscode-extension/out/`,
	`vscode-extension/.vscode-test/`, and `desktop-app/test-results/`. New
	Playwright output is confined to
	`planning/sprints/0113-v18-editor-specification-example/artifacts/playwright-output/`;
	generated example/export evidence is confined to
	`planning/sprints/0113-v18-editor-specification-example/artifacts/outputs/`.
	Example formatting/runtime/playback and PDF/DOCX checks are authorized only
	where they use these approved paths and preserve existing outputs.
- Host/tool versions and VS Code/desktop output preservation: Windows x64;
	Bun 1.4.4; VS Code Extension Development Host 1.143.1; desktop Playwright
	Chromium via the configured test package. The approved VS Code test compiled
	`dist/` and `out/` and reused the pre-existing 1.143.1 host installation;
	no output root was cleaned. Desktop Playwright output was directed only to
	S113 `artifacts/playwright-output/`; the pre-existing
	`desktop-app/test-results/` directory was not used or cleaned. Desktop
	typecheck prompted to update Hutch; the user selected update. Hutch 0.28.2
	began preparing Cottontail 0.7.3 but produced no typecheck result after a
	prolonged wait. The identified process tree was stopped; no typecheck pass is
	claimed.

## Editor Evidence

- Shared parser-proven recursive highlight facts/case IDs: PASS for
	`SH113-FACTS-01/02`, `SH113-BOUNDARY-01`, and `SH113-COMPAT-01`. The single
	recursive `DiagramContentNode` walk covers control keywords, iterator
	declarations and `in`, conditional tests and `else`, nested primitive
	keywords/names, properties, and expressions. Repeated `tracePoint` has one
	authored source fact; no generated-instance facts are created.
- Narrative and non-AMX fence boundary results: PASS. Matching-looking
	narrative and JavaScript-fence tokens receive no nested diagram facts.
- Actual TextMate tokenization scopes and host environment: PASS for the
	S113 nested `for`/`in`/`if`/`else` and primitive keyword/name assertions
	using the actual grammar in VS Code 1.143.1. The host test also retains
	Markdown and inert-fence assertions.
- Grammar changed? No. Existing keyword and primitive patterns tokenize the
	nested source correctly; no actual tokenization failure justified a grammar
	edit.
- Desktop CodeMirror UI result and harness/native classification: PASS in the
	approved Vite harness after the approved mock fix made active-buffer analysis
	use `currentText`. V0.16 compatibility, V0.18 nested keyword/declaration
	decorations, and format stability pass. Standalone generated-file playback
	passes separately. No native Electrobun/WebView behavior is claimed; native
	host was not run.
	`get_errors` independently reported `Invalid diagram property` at the
	Example 08 `for` line even though the approved CLI/root tests and Extension
	Development Host diagnostics accepted the same source. This discrepancy
	was reproduced read-only and left unchanged; its analyzer owner is unresolved.
- Formatter stability and diagnostics: PASS in the shared formatter suite,
	Extension Development Host nested-syntax test, and desktop CodeMirror
	format-twice assertion. Host/UI nested syntax has no diagnostics.
- Completion/navigation/symbol behavior: unchanged; no completion,
	navigation, outline, rename, or generated-instance identity behavior was
	added.

## Specification and Example Evidence

- V0.18 spec contract review and S109-S112 traceability: PASS. The additive
	spec matches accepted syntax, order, model-creation expansion, frame-time
	properties, mixed nesting, `AMXD6001`, `AMX3006`, `AMXD6004`, control-only
	cap 64, authored cap 512/`AMXD013`, internal-only identities, and static /
	interactive output. D111-02 explicitly says the output cap does not bound
	iteration work, CPU, or memory.
- S112 claims included only after disposition: S112 ACCEPT WITH RECORDED
	RESIDUALS was recorded above before implementation. The spec preserves the
	intermittent Vite bridge result, skipped native WebView2, unrun
	cross-platform checks, and unreconciled 1 MiB / 100 MiB policy discrepancy.
- README links and link audit: PASS. README adds the V0.18 contract and keeps
	the Formula-Driven Diagrams lesson in its existing navigation.
- Example 08 generated block and output count: PASS. The loop emits three
	repeated `tracePoint` circles after the four existing direct primitives;
	`t` occurs in supported primitive properties, not controls.
- Example parse/check/format/runtime results: PASS. Focused test analyzes and
	executes the example through the CLI; canonical formatting is idempotent.
- Standalone HTML lower/interior/upper playback result: PASS in the browser
	test against the generated HTML file. Initial/lower membership is three
	circles at `cx=40,44,48`; at `t=0.5` they remain three and move to
	`cx=74,78,82`, `cy=134`. Play advanced time, Pause returned to the stopped
	state, and no page/console errors occurred.
- PDF/DOCX lower-bound element/order/result: PASS. PDF adapter SVG contains
	lower-bound circles at `cx=40,44,48`, in order, and searchable title text.
	DOCX contains its diagram PNG and pixels for all three expected lower-bound
	point centers. CLI outputs were generated under the approved output root.
- Generated identity semantics not overstated: PASS. The spec and example
	say `tracePoint` is one repeated authored label and generated instances have
	internal identities only.

## Verification and Scope

- Exact root/VS Code/desktop/browser/export commands and results:
	- `bun test tests/editor.test.ts tests/formatter.test.ts tests/examples.test.ts`:
		final run 70 passed, 1 failed, 700 expectations. The failure is the
		unchanged V0.14 Help-index expectation for `Integrated acceptance, release,
		and publication remain separate`; the feature-specific editor, formatter,
		Example 08, PDF, and DOCX checks passed.
	- An initial `bun run test` was inadvertently run from the repository root
		before the package-directory correction: 626 passed, 1 failed. It reported
		the same V0.14 Help-index mismatch and is not an S113 acceptance gate.
	- From `vscode-extension/`, `bun run test`: final run 21 passed, 7 failed.
		The nested TextMate assertions and nested Extension Host diagnostics /
		formatting test passed. Existing failures were Windows temp-folder `EBUSY`
		cleanup and drive-letter casing assertions. An earlier host attempt had
		22 passed and 5 failed with the same failure families.
	- From `desktop-app/`, `bun run typecheck`: no result. Hutch 0.28.2 remained
		in Cottontail 0.7.3 Electrobun prepare with no output after a prolonged
		wait; that identified process tree was stopped. No `vue-tsc --noEmit`
		completion is claimed.
	- Desktop test command:
		`bun run test:ui -- tests/ui/v16-language-editor.pw.ts --output=../planning/sprints/0113-v18-editor-specification-example/artifacts/playwright-output/s113-v18-editor-06`.
		The configured Vite `./node_modules/.bin/vite` command first failed under
		PowerShell; starting the same harness with
		`bun run vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort` allowed the tests to run.
		Final run: 3 passed, 0 failed. V0.16 compatibility, V0.18 nested
		CodeMirror decoration/formatting, and standalone Example 08 browser
		playback passed. This remains Vite-harness evidence, not native-host
		evidence.
	- CLI commands generated
		`artifacts/outputs/example-08.html` (70,504 bytes), `.pdf` (35,847 bytes),
		and `.docx` (20,040 bytes). The browser test used the standalone HTML;
		adapter assertions inspected PDF SVG and DOCX PNG content.
- Failures, retries, unavailable checks, artifacts, and residual owners:
	initial shared-fact test span selection and helper defects were corrected;
	the lower-bound static export assertion was corrected from an incorrect
	positive crank offset to the actual `t=0` positions. VS Code retains the
	listed existing Windows host failures. The `get_errors` analyzer disagreement
	needs owner triage. Native WebView2 and cross-platform checks were not run.
	S112 raw residuals remain separately recorded and are not upgraded.
- Editor/spec/example case-ID audit: PASS for all rows with PASS evidence.
	`get_errors` still reports `Invalid diagram property` at the Example 08 `for`
	line despite passing parser/CLI/Extension Host evidence; this is separately
	recorded for owner triage.
- Changed-path inventory and `git diff --check`: changed source/test/docs:
	`src/editor/highlighting.ts`, `tests/editor.test.ts`,
	`tests/examples.test.ts`, `vscode-extension/src/test/providers.host.ts`,
	`desktop-app/tests/ui/v16-language-editor.pw.ts`,
	`desktop-app/spikes/sprint042-workflow-harness/src/mockRpc.ts` (approved
	S113 amendment),
	`docs/language-spec-v0.18.md`, `README.md`,
	`examples/08_Formula_Driven_Diagrams.amx`, this evidence, and the case
	matrix. No grammar, parser, runtime, serializer, renderer, or generated
	browser bundle was changed. Outputs are confined to S113 `artifacts/`.
	`git diff --check` was not run; it was not in the approved command list.
- Release, publication, package/version, certification: NOT AUTHORIZED.
- Builder recommendation and rationale: ACCEPT WITH RECORDED RESIDUALS. The
	approved shared/VS Code/desktop Vite editor checks, spec, Example 08
	execution/playback, and lower-bound PDF/DOCX evidence pass. Hutch typecheck
	produced no result; the unrelated root/VS Code failures and `get_errors`
	disagreement remain explicit. No native-host or cross-platform claim is made.
- Separate product-owner disposition/date: ACCEPTED WITH RECORDED RESIDUALS by
	the user on 2026-10-31.
- Sprint 114 gate state: REMAINS SEPARATELY GATED.