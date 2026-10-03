# Sprint 047 Acceptance Criteria

Sprint 047 is complete when:

- Release command responsibilities, arguments, mutation rules, target identifiers/statuses, artifact naming, output/staging layout, manifest fields, checksum/provenance expectations, overwrite policy, and operator sequence are documented consistently with the V0.8 master plan.
- Root `package.json` is the sole version authority, and explicit stable-version preparation synchronizes root, desktop, and extension package metadata. Electrobun application version derives from authoritative desktop metadata rather than a duplicate literal.
- The extension's local-install command no longer embeds a specific version in the VSIX filename.
- Version preparation validates all inputs and source state before mutation, is idempotent for the same version, and safely rolls back coordinated file changes on an injected write failure. It creates reviewable changes only; it does not increment versions, commit, tag, authenticate, or publish.
- Lockfile metadata has been inspected; only necessary version metadata is updated, with no unrelated dependency changes. Frozen installs remain valid for every changed lockfile.
- `release:check` does not modify source or outputs and reports version consistency, preserved application name/identifier, current host target, and actionable prerequisites.
- Project target mapping covers Linux, Windows, and macOS on x64/arm64 with explicit native-tool mappings. Available current-host facts, missing prerequisites, unverified remote targets, and evidence-confirmed unsupported targets are distinguished without fabricating support.
- Tests cover invalid/stable-version inputs, inconsistent manifests, idempotence, failed coordinated writes/rollback, target detection, unsupported cases, argument/path handling, spaces, and Windows path semantics. Tests use disposable fixtures and do not leave production version changes.
- The actual desktop worker/web resource packaging and build-tool prerequisites have been audited and recorded as observed facts or unresolved questions, without claiming installer builds or runtime installation acceptance.
- Focused release tests pass; applicable root build/tests pass; relevant frozen-lock install/checks pass; `git diff --check` passes. Exact commands/results and host/tool versions are recorded.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 047 Builder evidence accurately record outcomes, unknowns, residuals, and target verification boundaries.
- No native installer, VSIX, bundle collection, GitHub publication, Marketplace submission, signing/notarization, native certification, or unrelated product behavior is claimed as completed by Sprint 047.