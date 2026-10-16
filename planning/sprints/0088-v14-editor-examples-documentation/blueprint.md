# Sprint 088 Blueprint: V0.14 Editor, Examples, and Documentation Integration

## Approach

1. Obtain explicit Sprint 088 execution authorization and approval of the
   concrete file-by-file implementation/evidence plan. Record the starting
   worktree and preserve all existing changes, generated artifacts, and
   prior-sprint evidence.
2. Read the V0.14 master plan, accepted Sprint 084 contract, Sprint 085-087
   implementation/evidence, current language specifications and examples,
   shared editor services, VS Code providers/grammar/tests, desktop CodeMirror
   and Help, and existing root/host/UI test conventions.
3. Build an approved change map that identifies each V0.14 concept and each
   authoring/documentation surface:
   - `is`, target type references, `PI`, `E`, all 15 math functions,
     `len`, `trim`, `left`, `right`, and `format`.
   - Shared editor facts, VS Code Development Host, desktop CodeMirror UI,
     user documentation, README links, extension guide, searchable desktop
     Help, and each runnable example.
   - Exact changed files, tests, commands, expected evidence, and residual
     owners.
4. Update shared editor services only where V0.14 features require it:
   - Ensure tokenization/highlighting identifies the operator, type target,
     built-in constants, and built-in function calls according to existing
     conventions.
   - Ensure completion, diagnostics, hover/type facts, symbols/navigation,
     and formatting continue to work for affected syntax where those
     services already exist.
   - Preserve incomplete-source behavior and original source coordinates.
5. Verify actual VS Code Extension Development Host behavior separately from
   service facts. Cover representative valid and invalid V0.14 source,
   highlighting, completions, diagnostics/ranges, formatting, and applicable
   navigation/type help. Record initial failures and compare host-suite
   failures with the documented Windows baseline; do not weaken assertions
   or path behavior.
6. Verify actual desktop CodeMirror/workbench UI behavior separately from
   service facts. Cover highlighting, completion, visible diagnostics and
   ranges, formatting, and searchable/help topic behavior. Keep the inherited
   desktop RPC sandbox-occurrence baseline distinct from V0.14 UI evidence;
   do not change sandbox policy.
7. Write `docs/language-spec-v0.14.md` as an additive and accurate user
   contract. Cross-check every statement against the approved Sprint 084
   artifacts and implemented behavior, including diagnostic identities,
   normalized dimensionless math input, Unicode 15.1 whitespace, exact
   format pattern/locales, Measurement display formatting, and exclusions.
   Link the spec and examples from README and the extension guide. Add a
   unique searchable desktop Help topic.
8. Add the approved runnable examples. Analyze and execute them through the
   core, verify representative output bindings, then validate canonical
   formatting idempotence and source-located diagnostics. Keep examples
   dependency-free and avoid use of an unsupported runtime feature.
9. Add focused regression tests for shared editor facts, actual host
   behavior, docs/help discoverability, and example execution. Run focused
   root tests and build, the VS Code Development Host test, desktop
   typecheck/build and focused Playwright UI tests. Keep every surface's
   status separate.
10. Complete the Sprint 088 evidence matrix with exact commands, versions,
    counts, screenshots/artifacts, initial failures/retries, residual owners,
    and unavailable/not-run checks. Request a separate Sprint 088
    disposition; do not infer Sprint 089 authorization.

## Files to Include in the Approved Plan

The exact file list must be reviewed and approved before execution. Expected
areas:

- Shared editor services/tests under `src/editor/` and `tests/editor.test.ts`
- VS Code TextMate grammar, providers, Development Host tests, and
  `vscode-extension/README.md`
- Desktop CodeMirror/workbench authoring support, Help content, and focused
  UI/Help tests under `desktop-app/src/` and `desktop-app/tests/ui/`
- New `docs/language-spec-v0.14.md`
- Root `README.md`
- New runnable examples under `examples/`
- Root documentation/example tests such as `tests/examples.test.ts`
- Sprint 088 `builder-evidence.md`
- `planning/decisions.md`, `planning/questions.md`, and lifecycle
  status/briefing files only where the approved Builder process requires
  them

No parser/type-checker/runtime/standard-library changes are in the default
scope; those implementation increments are complete. If a defect or required
contract mismatch is found, stop, document the evidence, and obtain separate
authorization before changing runtime code. Generated files are not
automatically approved by a build and must be explicitly listed in the
approved plan.

## Verification

From the repository root:

1. Run focused shared editor, example, and documentation tests, including
   `tests\editor.test.ts`, `tests\examples.test.ts`, and any approved
   Sprint 088 test file. Include the V0.14 implementation tests when the
   shared semantic/editor analysis path is affected.
2. Run `bun run build`.
3. Run the approved example analysis/execution assertions and formatter
   idempotence/source-range checks.

From `vscode-extension`:

4. Run `bun run test` to compile the extension and tests and exercise the
   actual Extension Development Host. Record per-test outcomes and compare
   inherited Windows EBUSY/path-case failures against their documented
   baseline.

From `desktop-app`:

5. Run `bun run typecheck` and `bun run build:web`.
6. Run focused visible UI checks, expected to include:
   `bun run test:ui -- tests/ui/v14-language-editor.pw.ts tests/ui/help-center.pw.ts`
   or the exact approved test names/files. Record whether the real
   workbench UI or a harness is under test.
7. Run the desktop RPC contract only if required by the approved plan; if
   run, compare its sandbox-occurrence result against the recorded baseline
   without changing security policy.

Run `git diff --check` and record generated output inspection where
applicable. Full root, extension, and desktop integrated acceptance is
Sprint 089 work; focused direct host checks required by Sprint 088 are not
substitutes for that final integration gate.

## Notes

Sprint 088 makes implemented V0.14 features discoverable and authorable. It
does not change their meaning, accept the complete V0.14 release, or
authorize publication.
