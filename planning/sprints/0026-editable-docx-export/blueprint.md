# Sprint 026 Blueprint: Editable DOCX Export (Stretch)

## Approach

- Begin with the entry gate: inspect Sprint 025 native/platform residuals and obtain explicit Lead Developer approval. If approval or core readiness is absent, record the stretch as deferred and do not modify dependencies or production code.
- Run a bounded feasibility comparison of at least two local approaches, such as a DOCX-generation library and a lower-level OOXML/package approach. Evaluate semantic headings/paragraphs/lists/tables, static image insertion, page breaks, local fonts/assets, Bun compatibility, round-trip inspection, licensing, determinism, and maintenance burden.
- Use one shared report document model derived from the evaluated entry document and immutable view emissions. Keep narrative/source/view placement and table/chart data order. Add an adapter that maps report blocks to semantic DOCX paragraphs/headings/lists/tables; embed chart SVG/PNG images only where the selected approach supports it reliably.
- Add the smallest additive CLI/desktop boundary supported by the selected adapter. Keep filesystem/path validation in the owning main/CLI process, validate explicit lowercase `.docx` destinations and conflicts, prepare/serialize completely, then write via same-directory temporary file and atomic rename.
- Build an auditable fixture containing headings, narrative, lists, a multi-row table, a chart, null/empty values, and visible AMX source. Inspect the generated package for styles, paragraph/table structure, captions/order, embedded image relationships, and searchable/editable text using an available parser or office-compatible round trip.
- Assert semantic content and stable ordering, not raw ZIP byte identity or pixel parity. Record whether document metadata causes non-deterministic bytes and which output properties are guaranteed.
- If the selected library cannot meet editability, offline/licensing, or Bun integration requirements without threatening core delivery, stop, remove any spike-only dependency/artifact, record the evidence, and defer to a future release.

## Files to Update

- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- A focused shared report/DOCX adapter and CLI/desktop integration only after approval
- `tests/` focused DOCX structure/content/path/no-write tests only after approval
- `package.json`/lockfile and desktop manifests only for an approved, supported dependency
- `README.md` or desktop/CLI docs only to describe verified DOCX behavior and limitations
- No generated DOCX files, native outputs, private paths, or unverified assets

## Notes

Sprint 020's PDF spike did not prove editable DOCX. Sprint 023 proves reusable structured report content but not DOCX round-trip quality. This sprint may legitimately end with a documented deferral. Sprint 027 must record the disposition whether delivered or deferred; DOCX never blocks the V0.4 core gate.
