# Sprint 083 Handoff Prompt

You are the Builder for OpenAMX Sprint 083: V0.13 Integrated Acceptance and
Closeout.

## Read First

- `.agents/main.md` and the current worktree status. Preserve user/builder
  changes and every existing artifact; do not revert unrelated work.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 083 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- Sprint 078 contract fixtures, diagnostic matrix, and requirement-to-test
  matrix.
- Sprint 079-082 requirements, acceptances and `builder-evidence.md`,
  including exact failures, retries, host outcomes and residual owners.
- Current V0.13 specification/examples; root language/editor/renderers;
  VS Code host tests; desktop CodeMirror/workbench, preview, RPC, export and
  package workflows.

## Authority and Entry Gate

- Sprints 080, 081 and 082 depend on the implemented Sprint 079 model and are
  reported implemented in their scoped areas. Their Builder results are
  evidence inputs, not V0.13 acceptance dispositions.
- Sprint 078 fixtures and approved decisions define expected behavior. Do not
  change semantics or weaken tests during closeout.
- Before editing any file, obtain explicit Sprint 083 execution authorization
  and approval of the concrete file-by-file verification/evidence plan.
- Sprint 083 is verification and closeout only. If a product defect is
  discovered, isolate it and request separate corrective authorization rather
  than expanding this sprint into implementation.

## Task Contract

- Deliver the integrated master-plan-to-evidence matrix specified in
  `acceptance.md`, with separate evidence for core, VS Code, desktop, HTML,
  PDF, and DOCX surfaces.
- Re-run core contract/fixture, formatter, renderer, example, editor, build
  and full-suite checks; run the VS Code Development Host and desktop
  typecheck/build/RPC/UI/package workflows.
- Directly inspect both examples through analysis, HTML, PDF and DOCX. Test
  actual packaged desktop preview when the supported native path is
  available; otherwise record BLOCKED/UNAVAILABLE and why.
- Compare failures to Sprint 079-082 baselines. In particular preserve the
  VS Code Windows EBUSY/path-case failures, desktop RPC sandbox-occurrence
  mismatch, PDF tagging/accessibility limitation, native preview
  unavailability, and full-suite gaps as distinct statuses.
- Record exact commands, counts, versions, screenshots/artifacts, retries,
  evidence locations, residual owners and required follow-up.
- Submit a Builder recommendation and request a separate Lead Developer
  V0.13 disposition. Do not accept/close V0.13 yourself.

## Mandatory Boundaries

- No new feature scope or product implementation. Any required fix belongs
  to a separately authorized corrective task.
- Do not use one subsystem's result to infer another's. RPC, shared-service,
  mock harness, build, serialization, and earlier sprint results are not
  substitutes for direct host/artifact acceptance.
- Preserve all first-run outcomes; retries add evidence but do not erase
  failures. Use only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`
  statuses, with explicit evidence and ownership.
- Do not weaken the desktop sandbox, CSP, path containment, output limits, or
  assertions to make the suite green.
- Do not claim PDF/UA or screen-reader support; do not claim minimum-host,
  cross-platform, native desktop, or full-suite success without direct
  evidence.
- No release, publication, version change, package release, or platform
  certification is authorized by Sprint 083.

## Completion

Meet every criterion in `acceptance.md`. Complete `builder-evidence.md` and
update planning ledgers with exact results, residuals, owners, recommendation,
and separate Lead Developer disposition request. If disposition is pending,
leave V0.13 closeout explicitly pending.
