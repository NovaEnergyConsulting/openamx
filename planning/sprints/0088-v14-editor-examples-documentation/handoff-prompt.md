# Sprint 088 Handoff Prompt

You are the Builder for OpenAMX Sprint 088: V0.14 Editor, Examples, and
Documentation Integration.

## Read First

- Project agent instructions and current worktree status. Preserve all
  existing changes, generated artifacts, and evidence.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV14MasterSprintPlan.md`.
- Sprint 088 `requirements.md`, `blueprint.md`, `acceptance.md`,
  `builder-evidence.md`, and this handoff.
- Accepted Sprint 084 contract artifacts and Sprint 085-087
  `builder-evidence.md` files.
- Current V0.13 language specification/examples; shared editor services;
  VS Code grammar/providers/host tests; desktop CodeMirror/Help/UI tests;
  root README and example/documentation tests.

## Entry Gate

- Sprints 084, 085, 086, and 087 are accepted. Sprint 087's focused direct
  Bun run passed 141 tests with 0 failures across six files; core build and
  generated runtime inspection passed. Full root/extension/desktop
  integrated acceptance remains Sprint 089.
- Obtain separate explicit Sprint 088 execution authorization and approval
  of the exact file-by-file implementation/evidence plan before editing
  shared editor services, either client, tests, examples, documentation, or
  ledgers.
- Record any file-plan amendment before editing additional files. Do not
  change parser, type-checker, evaluator, standard-library, or diagnostic
  behavior without separate authorization.

## Task Contract

- Update affected shared authoring services and both editor clients for the
  accepted `is`, constants, functions, and diagnostics while preserving
  existing service behavior.
- Directly verify the VS Code Extension Development Host and the desktop
  CodeMirror/workbench UI separately.
- Publish the additive V0.14 language specification; link it and the
  examples from README/VS Code guidance; add searchable desktop Help.
- Add and test runnable examples demonstrating runtime type checks, math and
  Measurement behavior, and text/numeric formatting.
- Verify analysis/execution, formatting idempotence, exact useful
  diagnostics/source ranges, and downstream compatibility without inferring
  integrated acceptance.
- Record exact surface-specific evidence and request a separate Sprint 088
  disposition.

## Mandatory Boundaries

- Sprint 084's accepted contract and Sprints 085-087 implementation are the
  behavior authority. Do not make semantics, diagnostic, math, Measurement,
  Unicode, or formatter changes in Sprint 088.
- Keep shared-service, VS Code, and desktop evidence distinct. Directly test
  actual hosts where required.
- Preserve original source ranges, incomplete-document behavior, existing
  completion/formatting/navigation, offline behavior, and current editor
  architecture.
- Documentation must not claim V0.14 integrated acceptance, release,
  publication, or unverified platform support.
- Sprint 089 owns integrated root/extension/desktop acceptance and closeout.
  No release, publication, version change, or platform certification follows
  from Sprint 088.

## Completion

Meet every criterion in `acceptance.md`, complete the surface evidence
matrix, and request a separate Lead Developer/product-owner disposition.
Sprint 089 requires its own authorization and cannot be started solely from
a Builder recommendation.
