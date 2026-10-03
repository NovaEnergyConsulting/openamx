# Sprint 048 Handoff Prompt

You are the Builder for OpenAMX Sprint 048.

Read these files first:

- `.agents/main.md` if present, plus applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV08MasterSprintPlan.md`
- Sprint 047 requirements, blueprint, acceptance, Builder evidence, and current Lead Developer disposition
- Sprint 048 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Root release orchestrator/tests and root `package.json`
- `desktop-app/package.json`, `desktop-app/electrobun.config.ts`, `desktop-app/hutch.config.ts`, desktop build scripts/resources, worker source, and app assets
- `.gitignore`, release-output rules, and any relevant release documentation

## Entry Gate

Before implementation, record the Lead Developer disposition for Sprint 047 or explicit authorization to proceed with its documented residuals. Sprint 047 Builder verification alone is not acceptance. If the gate is unresolved, do not start production implementation; record the blocker and keep Sprint 048 planning prepared.

## Task Contract

**objective**: Implement native desktop packaging for the current available host through the prepared release workflow, inspect actual outputs/resources, emit a complete transfer-ready target bundle, and record native platform evidence without inventing support for unavailable targets.

**owns**: Installer/toolchain feasibility and evidence-backed format selection; `release:desktop`; fresh isolated staging; current artifact inspection; identity/version/resource validation; target bundle/manifest/checksum/evidence output; current-host native install/launch/close/uninstall checks; native prerequisite and clone/run documentation.

**must_not**: Begin before resolving the Sprint 047 entry gate; build from dirty/uncommitted source; reuse existing spike or stale build outputs; silently change installer format or migrate toolchains; assume cross-compilation; claim configured or mocked targets are supported; overwrite accepted releases; make the installed app depend on Bun/Node/developer tooling; claim self-containment without evidence; implement VSIX packaging, collection, release-wide verification, publication, license authoring, signing/notarization, updater behavior, or unrelated product changes.

**decision gates**: Preserve `OpenAMX Desktop` / `dev.openamx.desktop`, the root-authoritative version, project target names, finalized manifest/bundle contract, and manual publication workflow. Select only formats that existing or approved tooling can actually produce. If the current chain cannot produce a native installer without a scope-changing format substitution or incompatible migration, stop and request explicit approval. Classify targets as `available`, `unverified`, or `unsupported` only with the defined evidence; distinguish those from missing release assets.

**acceptance**: Meet every criterion in `planning/sprints/0048-v08-desktop-packaging-target-evidence/acceptance.md`.

**verification**:

1. Resolve and record the Sprint 047 dependency disposition before implementation.
2. Run `release:check` and verify the current host, version, identity, and prerequisites; prove release builds reject dirty/uncommitted or inconsistent source and do not mutate source.
3. Use fresh staging and inspect the actual package for embedded version/name/identifier/architecture plus web assets, Bun worker, and required native/runtime resources. Reject stale spike artifacts and conflicts.
4. Verify target bundle completeness, manifest provenance, SHA-256 checksums, and separation of automated package checks from manual installation/launch status. Prove failed/incomplete builds are nonzero and not collectable.
5. On the available native host, test install/launch/sample preview/close/uninstall with developer tooling unavailable, recording exact environment and user-data behavior. Mark unperformed remote host checks unverified.
6. Run focused release tests, applicable root build/tests, desktop contracts/typecheck/build, and `git diff --check`; record exact commands, outcomes, artifact paths/sizes/hashes, host/tool versions, warnings, screenshots/evidence, and residuals.
7. Update `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, Builder evidence, and native-host clone/run instructions. Do not report unperformed checks as passed.