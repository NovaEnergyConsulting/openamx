# Sprint 026 Acceptance Criteria

Sprint 026 is complete when one of these two outcomes is explicitly approved and recorded:

## Delivered Stretch

- Lead Developer approval and core-readiness entry gate are recorded before implementation; Sprint 026 work does not delay or redefine PDF, desktop, platform, or release acceptance.
- A local/offline DOCX approach is selected after feasibility evidence covering semantic editability, headings/paragraphs/lists/tables, static chart images, Bun/desktop compatibility, licensing, round-trip inspection, and maintenance limitations.
- The generated `.docx` preserves report/source/view order and contains editable semantic headings, narrative paragraphs, lists, captions, and declaration-order tables. Charts are documented as static images and are not claimed interactive or editable.
- CLI and/or desktop entry points are implemented only where supported by the shared adapter, with explicit lowercase `.docx` destination validation, conflict/symlink/path checks, complete pre-write preparation, same-directory temporary output, atomic rename, cleanup, and existing-destination preservation on pre-rename failure.
- Tests inspect DOCX package structure and extracted/round-tripped content for representative headings, paragraphs, lists, table rows/captions, chart image presence, source order, null/empty display, and failure/no-write behavior. Raw ZIP bytes and pixel parity are not required unless specifically guaranteed.
- Exact package/runtime/OS/verification-tool versions, dependency and asset licenses, limitations, supported entry points, and known cross-platform behavior are recorded. No remote content or unverified fonts/assets are shipped.

## Deferred Stretch

- If the entry gate is not approved or feasibility is insufficient, Sprint 026 records a concrete `deferred` decision with evidence, no production DOCX dependency/output, remaining questions, and the impact on Sprint 027. This is a successful non-delivery outcome for the optional stretch and does not block V0.4 core acceptance.

In either outcome, `bun run build`, `bun test`, focused available checks, and `git diff --check` are run for any changes made, and DOCX is not described as HTML/PDF equivalent.
