# Sprint 048 Blueprint: Desktop Packaging and Target Evidence

## Approach

1. Resolve the dependency gate. Review Sprint 047's Builder evidence and obtain a Lead Developer disposition or explicit authorization to proceed with its residuals. Preserve exact evidence and do not infer acceptance from implementation completion.
2. Re-read the finalized command, target-status, manifest, staging, bundle, and provenance contracts in Sprint 047. Confirm clean-committed-source rules, artifact naming, `releases/<version>/`, incomplete staging path, checksum format, and no-overwrite behavior before implementing the desktop adapter.
3. Establish the actual source/build baseline. Inspect Hutch/Electrobun package controls, app identity/version, Vite HTML/assets, separately built Bun worker, generated resources, stable versus development outputs, ignore rules, and legacy spike artifacts. Do not use existing ignored outputs as evidence of current packaging.
4. Perform bounded installer/toolchain feasibility on Linux x64 and consult official toolchain documentation. Identify the least additional maintained tooling needed for an actual native installer and its tested distribution/runtime prerequisites. Report remote OS/architectures as unverified unless actual native evidence or authoritative evidence proves support/unsupported status. If the existing chain cannot meet the approved installer contract and a format/toolchain change is necessary, request approval rather than substituting an archive or AppImage.
5. Implement `release:desktop` as a validation-first orchestration of the existing native build chain. Require consistent stable versions, fixed identity, clean committed source, supported current target, and available prerequisites. Fail with actionable errors before packaging when gates fail; do not update source or version metadata.
6. Build into fresh unique staging under `releases/.staging/<version>/<target>-<architecture>/<unique-id>/`. Capture command outcomes and exact tool/host versions. Never inspect or reuse pre-existing spike, development, or stale output directories as current build results.
7. Inspect the produced installer/package itself, not only its filename or build exit code. Verify embedded application name, identifier, version and target architecture; confirm the Bun worker, UI HTML/assets, native runtime and other required resources are present. Reject missing/stale/conflicting artifacts and record any packaging omissions or tool-generated update metadata without rewriting tool-owned schemas.
8. Create a complete transferable target bundle only after package checks pass. Write its structured manifest/evidence and SHA-256 data according to Sprint 047's finalized schema, with automated build/package checks distinct from manual install/launch status. Ensure incomplete staging cannot appear collectable and accepted release destinations cannot be silently overwritten.
9. On the available native host, install with Bun/Node/developer tooling unavailable to the installed app; launch, open a representative AMX sample, verify preview and resources/identity/version, close and uninstall while preserving user documents. Record host OS/kernel/architecture, system webview/library requirements, exact steps and results. Do not represent browser or mock runs as this native evidence.
10. Add focused automated tests for preflight, staging isolation, artifact inspection, resource presence, metadata/version/target correctness, checksums, incomplete bundles, stale/spike/conflicting output rejection, and failure cleanup. Use disposable fixtures and mocked tool output only to test orchestration, not to assert native support.
11. Document how the same commands are used on other native hosts after cloning the prepared revision. Record unavailable/unsupported targets honestly, including precise reasons/evidence where unsupported. Update Builder evidence, `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with commands, artifacts/hashes, visual/terminal evidence, environment, and residuals.

## Files to Update

- `scripts/release/` desktop packaging adapter/orchestrator established in Sprint 047
- Root `package.json` release command wiring, only as required to expose the finalized `release:desktop` command
- `desktop-app/electrobun.config.ts`, `desktop-app/hutch.config.ts`, and desktop build/resource configuration only if evidence requires a narrowly scoped packaging adjustment
- `.gitignore` for local release outputs/staging, preserving committed lockfiles and excluding release results from source control
- Focused release tests in the existing release test surface
- User-facing desktop/release documentation covering native-host prerequisites and cloned-repository commands
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- Sprint 048 Builder evidence and any relevant screenshots/artifact-inspection records

## Notes

Current Sprint 047 evidence establishes only that Linux x64 preflight tools are available; it explicitly leaves installer format, runtime self-containment, and native installation unverified. `bundleCEF: false` is configuration evidence, not proof of runtime behavior. Native packaging, host support, and self-containment must be evaluated from actual artifacts and direct installation/launch observations. Sprint 049's license/notices readiness and VSIX/release assembly remain separate.