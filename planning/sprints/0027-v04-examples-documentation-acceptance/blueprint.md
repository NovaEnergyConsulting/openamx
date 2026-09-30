# Sprint 027 Blueprint: V0.4 Examples, Documentation, and Acceptance

## Approach

- Begin with a release-readiness inventory from Sprints 020–026. Separate core gates from DOCX stretch evidence and environment limitations. Confirm the current native platform matrix before calling any gate passed.
- Build one auditable fixture-local example with a typed record list and scalar list, declared JSON/CSV inputs, a local imported module, view declarations/shows across report content, and concrete expected values. Keep formulas illustrative rather than domain-certified.
- Drive acceptance through production APIs/CLI and actual checked-in files. Render HTML, export PDF, and export DOCX where supported into isolated temporary destinations; assert exact or structurally deterministic properties, view placement, source display, interaction/accessibility, searchable text, page/content structure, and failure cleanup. Do not make byte equality claims where engine identifiers vary.
- Exercise invalid JSON/CSV, static/view binding, runtime label-length, output conflict, destination symlink/parent, PDF/DOCX layout, and filesystem failures. Assert diagnostic code/context and absence or preservation of output files. Cover aggregate/fail-fast ordering and V0.3 no-option behavior.
- Run desktop acceptance against the actual workbench/RPC: edit without save, local module resolution, config precedence, input validation, run/preview states, HTML/PDF export, safe paths, and DOCX where delivered. Capture screenshots/host observations only when actually available and identify WSL2 versus native hosts.
- Align root README, V0.4 spec corrections, CLI help/examples, desktop README, extension README, migration/limitations, package versions, scripts, and generated example outputs. Preserve V0.2/V0.3 historical contracts and document the known parser/editor/PDF/DOCX/platform limitations without overclaiming.
- Run verification in layers: focused example/CLI and renderer tests; root build/full tests; extension compile/host/package/install; desktop frozen/direct/package/native checks; then release-owner matrix on all three official targets. Update planning state only with exact completed results; leave V0.4 open if any core gate remains unverified.

## Files to Update

- `examples/` V0.4 example, fixtures, local modules, generated HTML/PDF/DOCX only if committed by project convention
- `tests/` focused examples/acceptance/CLI/renderer/export/desktop integration tests
- `README.md`, `docs/language-spec-v0.4.md` factual corrections, `vscode-extension/README.md`, `desktop-app/README.md`, migration/limitations/release notes
- Root/extension/desktop manifests, scripts, and version metadata only when aligned with observed release behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

## Notes

Sprint 025's implementation is delivered, but native macOS 14+, Windows 11+, and Ubuntu 24.04+ owner checks remain open in the recorded state. Sprint 026 DOCX was delivered as a stretch, with native Office/LibreOffice round trips and broad compatibility unverified. Sprint 027 must report these facts and cannot mark core V0.4 acceptance complete until its required gates are directly run or explicitly kept open.
