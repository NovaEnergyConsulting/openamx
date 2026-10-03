# Sprint 047 Handoff Prompt

You are the Builder for OpenAMX Sprint 047.

Read these files first:

- `.agents/main.md` if present, plus applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV08MasterSprintPlan.md`
- Sprint 047 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Root `package.json`, relevant Bun lockfiles, `desktop-app/package.json`, `desktop-app/electrobun.config.ts`, and `desktop-app/hutch.config.ts`
- `vscode-extension/package.json` and `vscode-extension/esbuild.mjs`
- Existing build/resource configuration, ignore rules, tests, and release-related code if present

## Task Contract

**objective**: Finalize the V0.8 release contract and implement safe explicit version preparation plus non-mutating current-host/prerequisite checks.

**owns**: Sprint 047 command/data contracts; audit of version/identity/lockfile/tool/resource sources; root-authoritative stable-version synchronization; version-neutral extension local install; native target detection and actionable preflight; focused tests and evidence/planning updates.

**must_not**: Build installers or VSIX files; implement release collection, verification, or GitHub/Marketplace publication; invent a license; commit/tag/publish; auto-increment versions; silently modify source during checks/builds; claim native support from config or simulation; upgrade dependencies or change unrelated AMX/desktop/VS Code behavior; expand scope beyond the approved V0.8 Phase 1.

**decision gates**: Preserve `OpenAMX Desktop` and `dev.openamx.desktop`. Use project target names `linux`, `windows`, and `macos`, paired with `x64` or `arm64`. Keep `available`, `unverified`, and `unsupported` distinct from `missing` release assets. If official toolchain evidence or an experiment reveals a required installer/toolchain migration or a contract change beyond the plan, record the evidence and request approval before implementing that scope expansion.

**acceptance**: Meet every criterion in `planning/sprints/0047-v08-release-contract-preflight-version-synchronization/acceptance.md`.

**verification**:

1. Prove `release:prepare <version>` rejects invalid inputs before writes, synchronizes all authoritative version sources, derives desktop metadata, is idempotent, and rolls back a simulated coordinated-write failure.
2. Prove `release:check` is read-only and gives actionable, accurate results for current host, architecture, version/identity consistency, and prerequisites.
3. Test target/native-tool mapping, unavailable versus unsupported outcomes, Windows path semantics, argument quoting, and paths containing spaces. Do not claim remote-host support without evidence.
4. Inspect and report lockfile changes; run frozen-lock validation only for lockfiles actually changed and introduce no dependency churn.
5. Run focused release tests, applicable root tests/build, relevant desktop/extension checks, and `git diff --check`; record exact commands, host/tool versions, outcomes, and any unavailable checks.
6. Update Builder evidence and `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Keep later-sprint packaging/publication and native certification explicitly open.