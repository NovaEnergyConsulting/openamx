# Sprint 049 Handoff Prompt

You are the Builder for OpenAMX Sprint 049.

Read these files first:

- `.agents/main.md` if present, plus applicable repository instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV08MasterSprintPlan.md`
- Sprint 047 requirements, blueprint, acceptance, Builder evidence, and Lead Developer disposition
- Sprint 048 requirements, blueprint, acceptance, Builder evidence, bundle manifest/evidence, and Lead Developer disposition
- Sprint 049 `requirements.md`, `blueprint.md`, and `acceptance.md`
- Root `package.json`, `scripts/release.ts`, `scripts/release/desktop.ts`, release tests, `.gitignore`, and release outputs
- `vscode-extension/package.json`, `.vscodeignore`, `esbuild.mjs`, README, grammar/configuration assets, and existing package/test commands
- `LICENSE.md`, `COMMERCIAL-LICENSE.md`, any actual full license text/third-party notices, and current vsce package behavior

## Task Contract

**objective**: Build and inspect a release-ready VSIX under `EngineersTools`, implement safe manual-bundle collection and release verification, and add deliberate, retry-safe explicit GitHub Release publication.

**owns**: Extension package adapter/inspection; accurate package metadata and contents; license/notices readiness reporting; `release:collect`, `release:verify`, and explicit `release:publish`; safe manifests/checksums/provenance; mocked remote tests; extension package usage docs; evidence/planning updates.

**must_not**: Change the publisher identity; automate Marketplace upload; invent or edit legal terms; claim production readiness while required authoritative license/notices are missing; accept unsafe/mixed/corrupt bundles; overwrite accepted local/remote artifacts; move tags; expose credentials; publish test releases; infer native status from package/mocks; take on Sprint 050's integrated repeat-release/runbook scope or unrelated product changes.

**decision gates**: Preserve root-authoritative stable version, full source commit provenance, existing desktop manifest/bundle contract, target statuses and update sidecars. Confirm platform neutrality from actual package evidence before claiming one VSIX serves all targets. The current `LICENSE.md` is a dual-license overview referring to a separate full `LICENSE` file not present in the workspace; identify authoritative supplied full terms/notices with the Lead Developer/user. Continue fixture-based script tests, but keep verify/publish readiness blocked until actual package/legal requirements are satisfied. Never suppress a vsce warning to manufacture readiness.

**acceptance**: Meet every criterion in `planning/sprints/0049-v08-extension-packaging-release-assembly/acceptance.md`.

**verification**:

1. Build and inspect the VSIX; assert version, `EngineersTools`, entrypoint, grammar/configuration, declared license/notices, inclusion/exclusion, archive paths and SHA-256. Record whether vsce/Marketplace reports readiness and all remaining legal/package blockers.
2. Validate a real Sprint 048 bundle only when full source commit/version match; otherwise use disposable fixtures. Prove collection rejects path traversal/symlink, malformed/mixed/corrupt/incomplete/conflicting inputs and preserves existing release output on failure.
3. Prove `release:verify` is read-only and distinguishes build/package from manual install/launch evidence and available/missing/unverified/unsupported requested targets.
4. Mock GitHub APIs/CLI. Test draft creation, explicit partial acknowledgement, authentication failure/redaction, immutable matching tags/assets, mismatched tag, identical retries, later same-revision additions, conflicts and interrupted upload. Do not contact a public endpoint or publish a test release.
5. Run focused release/extension tests, root build/tests, extension compile/package and Extension Development Host tests where runnable, relevant desktop/release checks, and `git diff --check`. Capture exact commands/results, versions, artifact hashes/sizes and mock outcomes.
6. Update Builder evidence, `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Keep actual license readiness, manual Marketplace submission, unverified native targets, and Sprint 050 work explicit.