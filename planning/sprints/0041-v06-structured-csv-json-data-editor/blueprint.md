# Sprint 041 Blueprint: Structured CSV/JSON Data Editor

## Approach

1. Close the candidate gate first. Reproduce a minimal Vue/Bun/Vite proof for the reviewed candidates, beginning with the strongest documented option, and compare grid/tree, editing, undo, keyboard/IME, raw synchronization, invalid text, 100k viewport, bundle, memory, and cancellation. Record license and exact pins. Do not install a production dependency until selection is accepted.
2. Define the data-editor adapter. Add a typed source/structured model, document revision, schema mapping, validation state, view state, undo boundary, and external/private metadata over Sprint 036/038/039 contracts. Keep raw text and trusted service APIs authoritative.
3. Implement CSV. Add virtualized rows/cells/columns, format-safe insertion/deletion/reordering, search, non-mutating sort/filter views, raw mode, undo/redo, deterministic serialization, RFC 4180 diagnostics, and mapped AMX type information. Preserve exact raw text while structured representation is unavailable.
4. Implement JSON. Add nested tree editing, array-of-records grid, raw mode, add/remove/reorder, supported lossless transitions, duplicate-key/syntax/pointer/shape diagnostics, and bounded fallback for irregular/large/unrepresentable values.
5. Integrate mapping/schema/diagnostics. Connect the active AMX input declaration and Sprint 039 mapping snapshot to cells/nodes, required/default/null/DateTime display, source/data diagnostics, and navigation into AMX/editor facts. Keep private external identity redacted.
6. Integrate persistence and conflicts. Route contained and explicitly opened external saves through Sprint 038 atomic/autosave/conflict services. Preserve invalid text, stop autosave on unresolved conflict, invalidate jobs on revisions, and ensure sort/filter views never mutate source.
7. Measure real scale. Use deterministic 100,000-row CSV and representative nested JSON fixtures to measure first usable viewport, scroll/edit latency, cancellation acknowledgement, memory, bundle impact, and webview task duration. Test larger/unsupported fallback and resource cleanup.
8. Test the boundary. Add focused service/component/browser tests for valid/invalid data, raw/structured transitions, undo, schema, external labels, autosave/conflicts, stale jobs, privacy, and no-write preservation. Exercise the selected candidate in the actual app build where host tooling permits.
9. Verify and hand off. Run root input/output tests, desktop direct RPC/typecheck/Vite tests, selected component/browser checks, and `git diff --check`. Record candidate selection, exact dependency/license evidence, measurements, limitations, and Sprint 042 entry conditions.

## Files to Update

- Proposed `desktop-app/src/mainview/` data editor, grid/tree adapters, inspector, raw mode, diagnostics, and external/private labels
- Trusted Bun data/document services and `desktop-app/src/shared/rpc.ts`
- `src/runtime/inputData.ts`/`outputData.ts` only for narrow backward-compatible in-memory/schema/serialization APIs
- Candidate proof/spike, focused service/component/browser tests, 100k fixtures, and evidence record
- `desktop-app/README.md` only for verified data-editor behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 041 builder-evidence record

## Notes

The key acceptance risk is confusing fast core parsing with fast interactive editing. A 100,000-row parser benchmark is not a grid viewport result. Treat candidate proof, raw-invalid preservation, external privacy, cancellation, and measured memory as separate gates.
