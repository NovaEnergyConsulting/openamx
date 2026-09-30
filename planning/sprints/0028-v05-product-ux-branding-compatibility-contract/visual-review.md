# V0.5 Lead Developer Visual Review (Checklist Approved 2026-09-30)

Approved companion to [the V0.5 contract](../../../docs/language-spec-v0.5.md). Sprint 028 defines fixtures and review; Sprint 034 owns generation, evidence and a separate Lead Developer sign-off after implementation and automated checks. Checklist approval does not certify WCAG, tagged PDF, broad Office support or native-platform release readiness.

## Fixture Manifest

Use fixed copies of the source/data at the cited paths and record SHA-256 of each artifact. Generate missing fixture variants in Sprint 034 as test copies (do not change baseline examples in place). Never commit private input paths. Expected states:

| ID | Source and identity/data variant | Required evidence |
| --- | --- | --- |
| F0 | `examples/hello-world.amx`, no project `report` and no V0.5 frontmatter | V0.2 neutral report, formatted source visible, final narrative values unchanged |
| F1 | `examples/typed-asset-analysis.amx`, `examples/typed-asset.json`, `examples/typed-screenings.csv`, local `examples/libraries/` as already used by that entry; add project `report` with organization/logo/alt/accent/footer in a contained temp project | V0.3 typed input, override precedence, source visible, offline logo and legal/footer |
| F2 | `examples/asset-fleet-risk-analysis.amx` or `examples/transformer-strategy.amx` plus its existing local fixture inputs/imports; add frontmatter author/status/classification, `sourceVisible: false`; project sets `sourceVisible: true` | V0.4 table/chart snapshot/order, static text alternative, hidden listing only, metadata override |
| F3 | Copy F2 with `sourceVisible: true`, table > 50 rows and explicit page break where supported; HTML filtered/sorted/paged before print | original-order complete print/PDF/DOCX rows, repeated headers, chart description/data, source/view/narrative placement, multi-page footer/page number |
| F4 | F1 with valid local PNG <=256 KiB, dimensions <=1024 square, descriptive alt; then missing logo, symlink, `../` traversal, PNG bytes with `.jpg` suffix, >256 KiB, malformed bytes, inaccessible contrast accent `#FFFFFF` | valid embedded offline logo; each invalid asset fails with location and no write; white accent falls back for text/focus without changing chart palette |
| F5 | F1 with report-level `logo` and matching `logoAlt` overriding project logo, author/status/footer overrides; also a malformed `report.sourceVisible: "false"` and unknown report field | independent field precedence; YAML source location and no-write on invalid metadata |
| F6 | Desktop temp project with two contained `.amx` tabs, dirty entry, dirty dependency, external disk change, missing input, invalid destination and delayed run/preview replies | entry vs active labeling, save/reload/close confirmation, conflict refusal, stale-response clearing, private-path redaction |

F1/F2 data references are manifests, not a claim that either example already has a V0.5 config or logo. During Sprint 034 copy the needed files/imports into a root-contained temporary project, document fixture construction and actual data mappings, and record any unavailable fixture as a failed review gate, not a pass. Use a newly authored small local PNG, no remote fetch, and record its bytes/dimensions/license. Keep all temp projects and output files out of shared config/version control.

## Checklist

Mark each item Pass, Exception (with remediation owner/date), or Blocked (with reason); attach desktop capture or output path and observations. Compare F0 against V0.4 baseline by semantic/content assertions rather than identical styling or byte-identical PDF.

- [ ] Desktop at 1280x720 and 800x600: explorer search/no results, tabs and entry badge, dirty/conflict markers, panels resize/collapse/focus without clipping; keyboard-only palette, dialogs, search, save, format, run, preview and export; focus restored after Escape/cancel and visible at 200% zoom/high contrast.
- [ ] Desktop F6: unsaved entry run uses buffer, non-entry dirty import blocks with explanation, conflict does not overwrite, close/reload/quit prompt preserves work on Cancel, restore contains no input text/paths, late success cannot replace newer failure, status announces loading/empty/error/success without private paths. Exercise screen reader and reduced motion where available; record tool/version.
- [ ] HTML F0-F5 at 1280 px and 360 px, 200% zoom, print preview and offline/network denied: title/identity hierarchy, escaped metadata, no external requests, correct source visibility and source/show placement, table filter/sort/page/No rows, chart No data/data table, focus/contrast, inline logo alt and bounded image, footer; print original complete data, not interactive state.
- [ ] PDF F0-F5 in a named/versioned viewer: A4 multi-page layout, legible searchable heading/body/source/table data, repeated table header/page numbers, page break, chart textual data, valid embedded logo and footer; missing/invalid asset preserves prior output. Record limitations for tagging and font metrics, not parity claims.
- [ ] DOCX F0-F5 in a named/versioned viewer and OOXML inspector: editable heading/paragraph/list/table/source, chart image with adjacent data text, logo alt or adjacent description, footer and ordered placement, valid offline embedded media; record round-trip limits, not Office-wide claims.
- [ ] Cross-format F1/F2/F3: compare same resolved identity values, original view data and ordering; source hidden only on explicit override. Check metadata and user strings are escaped/plain text, footer never masks content, contrast fallback preserves meaningful controls and color-independent chart cues.
- [ ] Automated gates remain separate: root build/tests, desktop RPC/typecheck/web, extension compile/host/package where supported, focused config/render/export/no-write regressions and `git diff --check` are recorded by Sprint 034; visual Pass alone is insufficient.

## Evidence Record (one per fixture and format/state)

`Reviewer: ____  Date: ____  Sprint: 034  OS/runtime: ____  Window/zoom: ____  Browser or PDF/DOCX viewer and version: ____  Screen reader: ____  Fixture ID and input/source SHA-256: ____  Command/config: ____  Artifact path and SHA-256: ____  Checklist item: ____  Result (Pass/Exception/Blocked): ____  Observed vs expected: ____  Capture/inspection path: ____  Remediation owner/date: ____  Recheck result/date: ____`

Sprint 034 final Lead Developer decision: `Approved / Approved with recorded exceptions / Rejected`, signed/date with evidence links and separate automated and release-engineering dispositions. An exception does not silently waive no-write, authority, privacy, compatibility or accessibility requirements. Sprint 028 approval of this checklist is a different earlier gate from Sprint 034 review of actual outputs.
