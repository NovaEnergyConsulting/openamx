# Sprint 032 Handoff Prompt

You are the Builder for OpenAMX Sprint 032.

Read these files first:

- `.agents/main.md`
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `planning/plan-openamxV05MasterSprintPlan.md`
- `docs/language-spec-v0.5.md`, especially sections 1-4
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`
- `planning/sprints/0031-shared-report-identity-html-presentation/requirements.md`
- `planning/sprints/0031-shared-report-identity-html-presentation/acceptance.md`
- `planning/sprints/0032-branded-pdf-docx-export-presentation/requirements.md`
- `planning/sprints/0032-branded-pdf-docx-export-presentation/blueprint.md`
- `planning/sprints/0032-branded-pdf-docx-export-presentation/acceptance.md`
- `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, `src/renderer/reportDocx.ts`, `src/cli.ts`, `desktop-app/src/bun/desktopService.ts`

## Task Contract

**entry gate**: The current planning record has no Sprint 031 Builder outcome or acceptance, and code still resolves raw HTML identity while PDF/DOCX inspect metadata separately. Before Sprint 032 implementation, obtain Sprint 031 acceptance after fixing/validating the shared model and asset policy, or an explicit Lead Developer dependency disposition with named remediation; never reuse the unsafe raw-logo behavior in PDF/DOCX.

**objective**: Once the gate is met, use the validated immutable report identity/content boundary for professional offline, searchable PDF and editable DOCX exports without changing analysis or output safety.

**owns**: Format-native PDF/DOCX presentation, ordered static view/data representation, local sanitized logo/metadata layout, focused export structure/no-write tests, engine limitations and planning evidence.

**must_not**: Reevaluate documents or reread data/assets in adapters, duplicate unvalidated HTML identity logic, allow network assets, weaken destination atomicity, claim broad Office/tagged-PDF/pixel parity, silently close Sprint 029/030 exceptions or native platform/Hutch/license gates.

**acceptance**: Satisfy every item in `planning/sprints/0032-branded-pdf-docx-export-presentation/acceptance.md`. If Sprint 031 prerequisite evidence is absent, stop at documentation/contract review and seek a recorded Lead Developer decision; do not present Sprint 032 as implemented or accepted.

**verification**:

1. Verify Sprint 031's shared preparation, strict diagnostics and safe PNG bytes with focused existing tests, then prove one minimal PDF/DOCX adapter integration against the same resolved identity without adapter filesystem access.
2. Run focused PDF/DOCX OOXML/searchable-text and CLI/desktop tests for order, source visibility, logo/metadata, destination/no-write and V0.2-V0.4 compatibility; record engine limits and inspect representative outputs for Sprint 034 review.
3. Run root `bun run build`, `bun test`, relevant desktop direct/RPC/typecheck/Vite checks and `git diff --check`; record exact environment/results and unavailable native viewers/platforms accurately. Do not rerun Hutch as a Builder gate contrary to Lead Developer direction unless separately authorized.
4. Update planning logs with actual Sprint 031 gate disposition, Sprint 032 results, release residuals and the Sprint 034 visual-review handoff. No acceptance item is satisfied solely by an earlier sprint label.
