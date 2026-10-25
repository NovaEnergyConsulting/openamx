# Sprint 104 Handoff Prompt

You are executing Sprint 104, V0.17 First-Load Initialization. Do not edit
until separate Sprint 104 authorization and an exact source/test/output plan
are approved. Preserve the worktree and unrelated user changes.

Use the accepted Sprint 102 active-document contract and the current Sprint
103 shell/component boundary. Unify initialization for project open,
recent-project restore, recovery restore, file/tab selection, and any existing
operation that makes an AMX document active while preserving its mutation
semantics. Keep project/RPC orchestration in `App.vue`.

For each active AMX identity, initialize static analysis/highlighting once and
schedule one initial preview attempt when preview is not paused. When paused,
still initialize analysis but do not enqueue preview; explicit resume
schedules one current preview. Never request AMX analysis/preview for
non-AMX documents, and never invoke runtime Run implicitly. Preserve project
generation, canonical document URI, document/settings revisions, job
identity, cancellation, supersession, stale-result rejection, last-good
preview, and existing errors.

Extend only the test-only workflow harness as needed to log initial analysis,
preview/run requests, identities, recovery text, and delayed results. Add
focused UI/RPC-harness cases using `activation-test-matrix.md` and retain the
existing preview-freshness behavior. Do not add new public RPC methods or fix
unrelated S103 residuals without separate approval.

Record exact approved paths, commands, counts, outputs, failures, and
residuals in `builder-evidence.md`. This sprint does not authorize explorer,
command-palette, resize, runtime docking, release, publication, version
change, certification, or subsequent sprint execution.