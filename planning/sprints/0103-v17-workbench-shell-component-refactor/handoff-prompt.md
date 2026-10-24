# Sprint 103 Handoff Prompt

You are executing Sprint 103, V0.17 Workbench Shell and Component Refactor.
Do not edit until separate Sprint 103 authorization and an exact file/test/
output plan are approved. Confirm V0.16 Sprints 100 and 101 are closed and
Sprint 102 has a separate contract disposition. Preserve the current worktree
and all unrelated user changes.

Keep `App.vue` as the application shell and owner of project/RPC orchestration,
active-document identity, preview bridge, navigation, commands, and
cross-panel state. Extract the runtime panel markup and its local Details
expanded state into `RuntimePanel.vue`, using typed props/events and no RPC or
filesystem authority in the child. Preserve runtime run/cancel, output,
diagnostic, details, and current docking behavior exactly.

Extract a contextual-pane presentation wrapper only if a controlled
`contextView` contract and slots preserve the shell-owned iframe ref/load
bridge, activation-driven view reset, and current CSS/DOM behavior. Otherwise
keep that markup in the shell and record the reason. Keep editor/data editor
refs and shell workflows intact. Existing explorer, tabs, command palette,
inputs, data editor, editor, and dialogs remain in their current roles.

Do not implement Sprint 104 first-load changes, Sprint 105 explorer workflows,
Sprint 106 palette navigation, or Sprint 107 resizing/runtime docking changes.
Use the existing Playwright/Vite workflow harness and focused desktop checks;
do not add a new component-test framework. Follow
`behavior-preservation-matrix.md` and record exact results in
`builder-evidence.md`. Stop and seek separate approval if the implementation
requires a broader behavior or file scope.

This sprint authorizes no release, publication, package/version change,
platform certification, or downstream sprint execution.