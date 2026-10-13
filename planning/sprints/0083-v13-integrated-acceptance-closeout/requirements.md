# Sprint 083 Requirements: Integrated Acceptance and V0.13 Closeout

## Goal

Complete requirement-traceable integrated acceptance of V0.13 across the core
language/runtime, standalone HTML, desktop workbench/preview, VS Code
extension, PDF, and DOCX. Re-run the approved Sprint 078 diagram fixtures,
validate Sprint 082 examples/documentation/editor integration, disposition
every failure or unavailable check honestly, and request a separate Lead
Developer V0.13 closeout decision.

This sprint adds no product scope and does not itself authorize release,
publication, or platform certification.

## Dependencies and Authority

- Sprint 079 is reported implemented as the diagram language and shared model
  increment, with focused checks and a passing build. Broader AMX AST/value
  parity and high-rate evaluation remain recorded residuals.
- Sprint 080 is reported implemented for standalone HTML and packaged desktop
  preview. Its packaged WebView2 test passed for the tested fixture and
  17-diagram/544-element repeated-emission workload. The desktop RPC contract
  script retains a sandbox-occurrence assertion mismatch; screen-reader,
  minimum-host/cross-platform, and exhaustive evaluator qualification remain
  open.
- Sprint 081 is reported implemented for static PDF/DOCX output. Focused
  suites/builds and artifact checks passed, including atomic preservation on
  invalid lower-bound exports. The inspected PDFs have no tagged structure
  tree or `/Alt`; formal PDF/UA and screen-reader support are not established.
- Sprint 082 is reported implemented for shared editor services, VS Code,
  desktop CodeMirror, specification/help, and examples. V0.13-specific VS
  Code host tests and desktop UI checks passed; the overall VS Code suite has
  seven Windows path/cleanup failures, desktop RPC retains the inherited
  sandbox-occurrence mismatch, and the native packaged preview of the two
  examples was unavailable. The full root suite was not run.
- These are Builder reports and prior evidence, not an integrated Lead
  Developer acceptance. Record current Sprint 083 outcomes independently.
- Scope authority: `planning/plan-openamxV13MasterSprintPlan.md`.
- Contract authority: Sprint 078 approved
  `grammar-examples.md`, `diagnostic-matrix.md`, and
  `requirement-test-matrix.md`, including later approved diagnostic additions
  AMXD012-AMXD015 and the D-NEG-18 location correction to `10:15`.
- Read `planning/state.md`, `planning/decisions.md`, `planning/questions.md`,
  `.agents/main.md`, all Sprint 078-082 requirements/acceptance/evidence, and
  the current worktree status.
- Obtain explicit Sprint 083 execution authorization and approval of the
  concrete file-by-file verification/evidence plan before modifying source,
  tests, examples, documentation, or planning ledgers.

## In Scope

- Create an integrated master-plan-to-evidence matrix covering every
  applicable V0.13 feature requirement, Sprint 078 fixture family, and
  relevant cross-surface capability.
- Re-run core parser, type checker, evaluator, module, diagram-model,
  formatter, diagnostic/source-range, and example acceptance. Verify exact
  semantics, diagnostic identities/messages and source positions; do not
  infer behavior from build success.
- Verify report preparation ordering, standalone HTML playback and error
  handling, offline/security constraints, preview resource behavior, static
  lower-bound PDF/DOCX output, DOCX alt metadata, and export failure atomicity.
- Verify VS Code directly through its Development Host and desktop
  CodeMirror/workbench directly through the UI. Cover highlighting,
  formatting, diagnostics/ranges, completion, outline/symbols, navigation,
  Help, and representative V0.13 documents. Distinguish shared-service,
  RPC, and actual user-visible host evidence.
- Validate both runnable examples through analysis, run, interactive HTML,
  PDF, and DOCX. Inspect visible outputs and confirm lower-bound static
  frames; exercise interactive selected times. Run the actual packaged
  desktop preview when the approved native test path is available.
- Re-run root focused checks, root build and full root suite; VS Code
  Development Host checks; desktop typecheck, build, RPC contract and focused
  UI checks; and built/package paths where the host permits.
- Record every result as `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`,
  with exact command/action, environment, evidence, owner, and required
  follow-up. Compare with Sprint 079-082 evidence and known residuals.
- Produce a closeout recommendation that names all remaining residuals and
  requests an explicit separate Lead Developer disposition.

## Out of Scope

- New product features, contract/diagnostic changes, code fixes, editor
  redesign, output redesign, test weakening, or cleanup of unrelated
  historical failures.
- Reworking inherited Windows VS Code path/temporary-directory failures or
  desktop RPC assertions unless a regression caused directly by Sprint 083
  verification changes is demonstrated and separately authorized.
- Changing authored-declaration caps, resource limits, output security,
  diagram behavior, or accessibility contracts to make checks pass.
- Release engineering, package/version changes, software release,
  publication, or platform certification.

## Constraints

- Sprint 078 fixtures and approved Sprint 078-079 decisions are the behavior
  authority. Do not reduce coverage or weaken a contract to obtain a green
  result.
- Test every relevant surface directly. A root test, a shared editor service,
  an RPC fact, a Vite harness, or an artifact serializer does not establish
  another surface's user-visible acceptance.
- Preserve initial failures and retries; a retry clarifies but does not erase
  the first result. Compare root/VS Code/desktop outcomes with Sprint 079-082
  baselines and name new or changed failures.
- Keep `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` statuses distinct.
  Accepted-by-disposition residuals remain documented as residuals, not
  relabeled as passes.
- PDF title/description visibility and source SVG metadata do not establish
  tagged PDF, PDF/UA, or screen-reader support. Report actual inspection
  findings and do not overclaim accessibility.
- A Sprint 083 Builder recommendation is not a Lead Developer acceptance.
  Request a separate V0.13 disposition. That disposition is not release or
  publication authorization.
