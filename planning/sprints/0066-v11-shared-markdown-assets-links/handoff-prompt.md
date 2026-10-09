# Sprint 066 Handoff Prompt

You are the Builder for OpenAMX Sprint 066: V0.11 Shared Markdown, Assets, and Link Model.

## Read First

- Applicable repository instructions and current worktree status; preserve user edits.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 066 artifacts.
- Sprint 065 disposition/evidence, especially the Lead Developer responses in `planning/sprints/0065-v11-rendering-contract-feasibility-gate/builder-evidence.md`.
- The current report preparation, renderer, parser, destination, desktop worker/service, and test surfaces named by the master plan.
- `examples/kitchen-sink.amx` and supplied `examples/kitchen-sink.pdf`; PDF is read-only and must not be overwritten.

## Authority and Scope

The V0.11 master plan defines product scope. Sprint 065 is COMPLETE / APPROVED WITH RECORDED RESIDUALS, and Sprint 066 is authorized only for the shared narrative/assets/link model. Preserve existing AMX evaluation, interpolation values, report identity/order, show-time snapshots, measurement semantics, emitted tables, atomicity, working PDF charts, and established cross-surface chart meaning.

Implement only Sprint 066 requirements: shared Markdown structure, line-break/code/raw-HTML/interpolation/page-break rules, stable heading targets, contained and sanitized PNG/JPEG asset references (after the pixel-bound decision), and typed external/internal/local links with distinct source and final-output bases.

## Mandatory Gates and Stop Rules

- Development moves to the designated Windows host with Word desktop and web access. Record exact Windows/Word versions/channels, reviewer, date, actions, and viewer prompts. Do not substitute another office viewer or bypass restrictions.
- Lead Developer accepted 4 MiB image input and 4 MiB sanitized-output bounds per image. The 4,000,000 decoded-pixel proposal was not explicitly dispositioned. Do not decode/embed images until that pixel limit is confirmed; update `planning/questions.md` or request the decision.
- Reassess local-link restrictions on Windows, but do not assume they disappeared. Do not trust arbitrary folders, suppress prompts, bundle companion files, or leak machine-specific paths.
- The preview opaque-target/frame/revision/host-validation/allowlist/confirmation design is approved for Sprint 070. Sprint 066 must not implement its RPC/event flow or change `sandbox="allow-scripts"`.
- Numeric line axes, multiple unit axes, null/empty chart data, and native Word chart fidelity are not resolved by Sprint 066 approval. Do not coerce, sort, alter units/kind, turn null into zero, or use a static chart image. If a shared-model contradiction appears, stop and request Lead Developer direction. Sprint 069 remains blocked until direct Windows Word evidence or a separate decision resolves it.
- No PDF/DOCX/HTML renderer integration, production dependency/lockfile changes, worker-cap changes, broad preview UX, release/publication, or unrelated cleanup is authorized.

## Execution and Evidence

Use existing renderer/presentation test files where suitable. Run focused tests first, then required builds/typechecks for touched code. Record exact commands, host/app versions, fixture and outcomes, and residual owners in `builder-evidence.md`. Update only Sprint 066 planning artifacts and state/decision/question ledgers. Request a separate Lead Developer disposition; Builder completion does not self-accept Sprint 066 or authorize later sprints.
