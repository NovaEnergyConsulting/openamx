# Sprint 034 Blueprint: V0.5 CLI, Documentation, Examples, Acceptance, and Release Record

## Approach

1. Establish an evidence ledger before changing public wording. Read every Sprint 029-033 outcome and map each acceptance item to `verified`, `exception accepted`, `blocked`, or `unavailable`, with exact existing evidence. Include the Sprint 033 resolve-time-only code-action guard. Do not collapse a Builder outcome into Lead Developer visual/release approval.
2. Create temporary, root-contained F0-F6 fixture projects from the approved manifest. Record source/data/config/logo SHA-256, local PNG provenance/byte/dimension/license and commands. Keep generated reports/screenshots/temp configs ignored or remove them after capturing reproducible evidence. Add durable focused automated tests around existing examples instead of committing machine-local output paths or credentials.
3. Start with narrow CLI/report acceptance: exercise no-metadata compatibility, project/frontmatter precedence, source visible/hidden, safe logo/contrast, invalid config/assets and destination preservation across HTML/PDF/DOCX. Assert actual final values, `PreparedReport` order, table/chart data and no-write behavior. Confirm CLI `--project-root` changes identity only and that `run` path/input semantics remain unchanged.
4. Perform documentation and version alignment after behavior is proven. Update root/package/desktop/extension metadata only if the resulting claim is accurate. Describe V0.5 capabilities, direct-provider limitations, local VSIX proof, report source-visibility/security limits and export/desktop requirements. Preserve historical specs and release warnings; avoid promising native targets, broad Office, license or Marketplace status.
5. Run the approved visual review with the Lead Developer using F0-F6: desktop (only actual native behavior available), HTML browser/mobile/print/offline, PDF named viewer/searchability, and DOCX named viewer plus OOXML inspection. Attach one evidence record per fixture/format/state with hashes, viewer/version, result and remediation. Do not mark unavailable viewer/host observations as pass.
6. Run the full automated matrix in evidence-oriented order: root build/tests; focused CLI/examples/config/render/export/no-write; desktop direct RPC/typecheck/Vite; extension compile/host/package/install/installed artifact. Run only supported package/native checks, record exact failure/unavailability, and execute `git diff --check` last. Re-run narrow affected checks immediately after any repair.
7. Obtain Lead Developer decisions on the code-action precondition and each open product/release track. Write final state/decision/question records that separate V0.5 feature disposition, approved exceptions/remediation, and inherited V0.4 release-engineering status. A rejected or blocked visual/release check remains a finding, not an invitation to silently reduce scope.

## Files to Update

- `README.md`, `package.json`, `desktop-app/README.md`, `desktop-app/package.json`, `vscode-extension/README.md`, `vscode-extension/package.json`, `docs/language-spec-v0.5.md` only for verified facts and version-alignment decisions
- Existing examples/tests and focused new V0.5 fixture/acceptance tests; use ignored temporary directories for visual-review copies and generated reports
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md` only to append completed evidence links/status if approved, plus `planning/state.md`, `planning/decisions.md`, `planning/questions.md` for final evidence and dispositions
- Release instructions or a compact V0.5 evidence record if the existing planning artifacts cannot carry command/artifact/results cleanly

## Notes

- Keep the last accepted core pipeline and direct extension architecture. Any implementation gap discovered during acceptance needs a separate approved remediation slice; Sprint 034 documents the finding and reruns proof after it is fixed.
- Sprint 029 native project/save/quit and Sprint 030 editor gaps are not automatically fixed by visual review. The Lead Developer may record `approved with exceptions` only with clear owners/next steps; Marketplace and license selection remain separate decisions.
