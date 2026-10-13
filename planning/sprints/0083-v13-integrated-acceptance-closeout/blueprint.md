# Sprint 083 Blueprint: Integrated Acceptance and V0.13 Closeout

## Approach

1. Confirm explicit Sprint 083 authorization and approval of the concrete
   verification/evidence file plan. Record worktree status, preserve all
   Sprint 082 changes/artifacts, and do not start product implementation.
2. Read Sprint 078 contract fixtures and diagnostic matrix, Sprints 079-082
   artifacts/evidence, current language specification/examples, and scripts
   for root, VS Code, desktop UI, RPC, export, and package validation. Build
   the integrated matrix before running checks.
3. Map each master-plan requirement and relevant fixture family to the owning
   implementation, surfaces, exact test/action, expected result, evidence
   destination, status, residual owner, and follow-up. Use separate rows for
   core, VS Code, desktop editor/preview, standalone HTML, PDF, and DOCX when
   the requirement appears on multiple surfaces.
4. Core language and model acceptance:
   - Run positive fixtures D-CRANK-01 and D-BATTERY-01 and all invalid
     fixtures D-NEG-01 through D-NEG-24 from Sprint 078.
   - Verify approved D-NEG-18 location `10:15`; exact AMXD001-AMXD015 and
     AMX3001/AMX3002 reuse; local time scope; finite bounds/geometry;
     evaluation at start/interior/end; model immutability/order; imports and
     nested execution; and formatter idempotence/meaning preservation.
   - Add representative cases for documented AMX AST/value residuals only
     within existing approved semantics. Do not make Sprint 083 a corrective
     feature sprint; isolate any genuine defect and request separate
     authorization.
5. Interactive HTML and desktop preview:
   - Test standalone local-file rendering, start-paused controls, arbitrary
     scrubbing, declared playback duration, reset, loop defaults/endpoints,
     diagram independence, responsive aspect ratio, accessibility semantics,
     hostile report text, and zero remote requests.
   - Trigger AMXD009, AMXD010, and AMXD011 in browser frames. Verify stop,
     clear, source-located messaging and recovery; test preview replacement
     and stale message rejection.
   - Re-measure the approved HTML, p95 frame work, heap, and DOM bounds with
     the recorded methodology; include the 17/544 repeated-emission scenario.
     Run actual packaged desktop preview when a supported test path exists.
     Keep unavailable native example checks distinct from the Sprint 080
     packaged test.
6. Static reports and examples:
   - Run both examples using the existing analysis/run/render/export commands.
     Inspect visible HTML behavior, PDF lower-bound geometry/order/text, and
     DOCX lower-bound PNG, visible title/description, OOXML image alt
     metadata, aspect ratio, and page flow.
   - Test invalid lower-bound PDF/DOCX failures preserve existing output
     destinations byte-for-byte and leave no temporary artifacts.
   - Retain PDF structure/accessibility findings accurately; do not infer PDF
     tags or screen-reader acceptance from visible/searchable text.
7. Editor, documentation, and examples:
   - Test shared editor facts, then separately exercise VS Code Development
     Host and desktop CodeMirror user-visible highlighting, formatting,
     diagnostics/ranges, completion, outline/symbols, navigation, and Help.
   - Check the V0.13 specification, README references, both examples, desktop
     searchable Help, and existing feature exclusions against the approved
     contract. Confirm the examples typecheck/analyze and render on applicable
     surfaces.
8. Execute focused root tests and build followed by the full root suite; run
   VS Code and desktop workflows from their owning directories. Capture
   command, tool versions, complete test counts, initial results/retries,
   logs, screenshots and artifact locations. Compare the VS Code 17/24
   baseline (7 Windows path/cleanup failures) and desktop RPC sandbox-count
   mismatch. Do not relax path or sandbox behavior to green an inherited
   assertion.
9. Verify package/built paths where the current host allows. If the
   `OPENAMX_NATIVE_CDP_URL`/native desktop path is unavailable, mark those
   rows `BLOCKED/UNAVAILABLE` and state the specific missing prerequisite;
   do not substitute mock RPC, Vite harness, or prior-sprint evidence as a
   Sprint 083 pass.
10. Complete the matrix and submit the Builder closeout recommendation with
    all failures, residuals, owners, unavailable checks and not-run items.
    Ask for a separate Lead Developer disposition of V0.13 as ACCEPTED/CLOSED
    with named residuals or BLOCKED/OPEN with required follow-up. Do not
    perform release/publication or declare milestone acceptance on Builder
    authority.

## Files to Update

- Sprint 083 `builder-evidence.md` with matrix, commands, outcomes, artifact
  references, residual owners and closeout request
- Sprint 083-owned logs/screenshots/artifacts only when included in the
  approved concrete file plan
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
  to record evidence and request/record a separate disposition
- Existing test files only if a verification assertion is proven invalid or a
  regression is caused directly by Sprint 083 verification changes, and only
  within a separately approved narrow amendment

No production implementation, language spec, examples, editor, renderer,
security policy, dependency, package/version, or release file is in scope for
the default closeout plan.

## Verification

From the repository root:

1. Run focused suites for `tests\parser.test.ts`,
   `tests\evaluator.test.ts`, `tests\formatter.test.ts`,
   `tests\editor.test.ts`, `tests\modules.test.ts`,
   `tests\diagram.test.ts`, `tests\diagramHtml.test.ts`,
   `tests\reportPreparation.test.ts`, `tests\reportSequence.test.ts`,
   `tests\renderer.test.ts`, `tests\reportPdf.test.ts`,
   `tests\reportDocx.test.ts`, `tests\examples.test.ts`, and relevant CLI
   tests, combined using the existing Bun runner.
2. Run `bun run build`.
3. Run `bun test` and record the complete aggregate result, initial failures,
   and any isolated retries.

From `vscode-extension`:

4. Run `bun run test` and capture Development Host results and per-test
   Windows cleanup/path failures.

From `desktop-app`:

5. Run `bun run typecheck`, `bun run build:web`, `bun run test`, and focused
   `bun run test:ui -- ...` for the V0.13 editor, Help, diagram playback,
   security, and preview-freshness cases.
6. Run actual package/desktop UAT if the supported host endpoint is available.
   Record native package and Vite workflow-harness evidence separately.

For all paths, record exact shell directory, command text, status/counts,
runtime versions, artifact/screenshot paths, HTTP readiness workaround where
used, and residual owner. No build, focused suite, or previous sprint result
substitutes for the integrated evidence matrix.

## Notes

Sprint 083 closes V0.13 acceptance only. A Lead Developer may accept the
milestone with explicitly named residuals or keep it blocked/open; the
Builder must not treat past sprint completion, a plausible green aggregate,
or a recommendation as the disposition. Release/publication remain separate.
