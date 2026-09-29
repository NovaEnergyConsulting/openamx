# Sprint 022 Blueprint: HTML Tables, Charts, and VS Code V0.4 Authoring Support

## Approach

- Start with a small renderer fixture using one typed table/show across two executable fences. Consume `Environment.viewEmissions` (already returned by the module loader), group by `documentNodeIndex`, and append each view after the owning block's formatted, escaped source. Check placement and once-only evaluation before introducing interactive behavior.
- Build view-specific markup from the Sprint 021 `ViewEmission` union without reading mutable final bindings. Use element/attribute-safe escaping, and structured serialization for any bundled client payload; never splice unchecked AMX values into JavaScript or SVG markup. Ensure repeated shows have independent control IDs/state and deterministic document order.
- Implement tables with semantic header/caption markup, keyboard controls, and local sort/filter/page handling. Separate the full source-order data from visible page state; nulls last, stable ties, typed comparisons, default 25/page, filter across displayed cells, resets on sort/filter, and live range/count status. Print the full original-order table independent of client state.
- Render bar/column/line/scatter with locally bundled chart code or a proven chart library, but keep deterministic input/series ordering and static report fallback under project control. Match the contract's null/gap/scatter-group and empty-data semantics. Provide accessible figure name/description and a text/table representation of all plotted values; fixed palette is not the only series discriminator. Choose/version any new dependency after a focused offline/accessibility/print check.
- Expose print-friendly chart graphics and data in a format that Sprint 023 can reuse when assembling PDF report content. Do not treat browser print-to-PDF as the chosen production engine or claim PDF layout verification in this sprint.
- Extend `formatAmx`'s existing layout logic for visualization braces and option lines without rewriting expression text or quoted strings. Prove parser-valid idempotence on multiline declarations with `show`, mixed older braces, CRLF and narrative preservation through both core formatter and extension formatting.
- Extend current direct providers in `vscode-extension/src/providers/` using pure buffer parse/check; ensure suggestions follow source order, current fence/option context and imported type visibility. Report V0.4 parser/static/link errors with original-document UTF-16 positions; keep runtime-only `AMX4003` label-length failures out of editor diagnostics. Cover edits/clearing and local import containment in the Extension Development Host.
- Test actual HTML data and DOM interaction, not merely substring presence: sort direction/ties/nulls, filter/page transitions and print output, all chart types, empty and null cases, escaping, accessibility and deterministic repeat renders. Run regression gates for existing CLI, root and extension paths and record observed results.

## Files to Update

- `src/renderer/renderHtml.ts` and narrowly owned table/chart renderer assets or helpers
- `src/formatter/formatAmx.ts`
- `vscode-extension/src/providers/formatting.ts`, `completion.ts`, `moduleAnalysis.ts`, `diagnostics.ts` only where V0.4 needs changes; existing provider host tests
- `tests/renderer.test.ts`, `tests/formatter.test.ts`, and focused interaction/CLI integration tests as needed
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`
- `docs/language-spec-v0.4.md` only for approved, evidence-based clarifications

## Notes

CLI `render` already passes the loader's evaluated environment into `renderHtml`; direct renderer calls evaluate once internally. Preserve both paths. Sprint 021's `ViewEmission` carries declaration, typed snapshot, optional scalar labels, document node index, statement index, and show source; that is the rendering boundary, not the final context object. PDF engine integration and font redistribution verification are Sprint 023 responsibilities.
