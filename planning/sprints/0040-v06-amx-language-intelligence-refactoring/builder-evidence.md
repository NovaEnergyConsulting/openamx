# Sprint 040 Builder Evidence

## Disposition

**Sprint 040: COMPLETE WITH RECORDED EXCEPTIONS by explicit Lead Developer direction (2026-10-02).** The Lead Developer verified the CodeEditor cursor-reset issue is resolved and directed the sprint to close. Shared parser/checker-derived editor facts, VS Code adapters, desktop RPC/editor integration, and focused regressions are implemented. This disposition does not claim native Electrobun acceptance, formal accessibility certification, or VS Code apply-time stale-proof edits.

No AMX syntax/semantic rule, CLI behavior, evaluator/input-loading path, LSP/network service, unrestricted index, structured data editor, or final preview/export workflow was added. Static work consumes only AMX text and parser/checker/import facts.

## Environment

- OS: Omarchy Linux x86_64. Bun 1.4.2; Node CLI 24.14.1; Vite 6.4.3; Vue 3.5.41; VS Code Extension Development Host 1.85.0.
- The generated Electrobun SDK/native window was not used for manual UI verification. A local isolated Vite harness mounted the production `CodeEditor.vue` component with deterministic facts and callbacks.

## Shared Facts

- Added shared UTF-16 source offsets and exact source-verified token/declaration ranges. Tests cover CRLF, non-BMP prefixes, mismatched tokens, and unlocated spans.
- Added host-neutral module analysis driven by a supplied resolver. It parses/checks reachable modules only, shares import/export/cycle/diagnostic authority with the existing parser/checker, and is capped at 101 modules (active entry plus 100 dependencies). The host owns canonical paths, containment, symlink checks, disk reads, and open-buffer overlay selection.
- Added source-order/import-aware completion facts, exact executable-fence completion preparation for incomplete statements, parser-proven decorations, identity-bearing occurrences, deterministic diagnostic action facts, and rename edit plans. Ambiguous/duplicate/cyclic/unresolved/unlocated results are withheld.
- Root `tests/editor.test.ts`: **9 tests passed** in the final focused run. Root typecheck passed after shared API changes.

## Desktop Evidence

- Bun's analysis RPC accepts active path/revision/cursor identity, rejects stale requests, consumes the reachable unsaved overlay, and returns bounded diagnostics/completions/highlights/symbol/action facts. It reads no CSV/JSON values and performs no evaluation.
- The trusted rename RPC validates the expected active revision, identifier, symbol identity, reachable containment, collisions, every affected disk hash/conflict, and the rewritten static graph before staging. It commits with same-directory staged files/backups or rolls back. Direct RPC assertions prove declaration/import/use renaming, collision/reserved-name refusal, stale refusal, and unchanged files on refusal.
- CodeMirror provides exact AST-token decorations, inline static diagnostic underlines, async completion, hover, Ctrl/Meta-click and F12 definition navigation, Shift+F12 reference cycling, F2 inline rename, and explicit deterministic action buttons. It checks buffer snapshot/revision before an action; rename application stays in trusted Bun. Formatting/action edits are undoable CodeMirror transactions.
- CRLF mapping is isolated to the editor boundary: parser offsets remain original-buffer UTF-16 offsets; CodeMirror's normalized positions are translated both ways; emitted edits restore CRLF when the source uses CRLF.
- Direct desktop RPC contract passed and ended `Final active resources: []`. `vue-tsc --noEmit` passed. Production Vite build passed with 1,918 modules and **743.62 kB JS / 255.80 kB gzip**. Sprint 039 recorded **736.95 kB / 253.62 kB gzip**, so the observed delta is **+6.67 kB JS / +2.18 kB gzip**. Vite retains the existing >500 kB chunk warning.

### Browser/Component Harness

- Isolated Vite harness build: 121 modules, 812.96 kB JS / 277.82 kB gzip; this standalone proof bundle is not the production desktop bundle.
- Actual `CodeEditor.vue` browser run at 800x380 showed parser-decorated `let`, declarations, types, literals, references and `show` only in the executable AMX fence; the ordinary `js` fence had no AMX token decorations. Static underline and deterministic quick-fix button rendered.
- Ctrl+Space opened CodeMirror's completion list; the earlier in-scope `earlier` binding and type/keyword candidates appeared. Incomplete-source shared tests preserve earlier declarations and withhold the unfinished declaration.
- F2 opened the inline rename form and the harness callback renamed the exact declaration. This callback is a browser component proof; trusted multi-file rename is separately covered by Bun RPC tests.
- A format edit in CRLF text preserved scroll position (**90 px before/after**), mapped the selection from source offset **567 to 568** after a preceding insertion, and Ctrl+Z restored the exact original line. A diagnostic action changed only its exact expected token and incremented revision.
- Lead Developer verification follow-up: the root cause was uncoordinated external-text reconciliation. `replaceText` ran whenever a differing text prop arrived, even while CodeMirror had newer local edits; a replacement intersecting the active selection could collapse the caret. The component now treats local edits as authoritative until the prop acknowledges the exact current document, ignores differing text snapshots in the interim, and explicitly maps selection through legitimate external diffs while retaining scroll.
- Delayed-echo browser regression: type `import` on a fresh executable AMX line, inject an older text snapshot, then allow the latest acknowledgement to arrive. The text remains `import`; source selection remains **629 -> 629** across stale injection and eventual acknowledgement. Desktop Vue typecheck, direct RPC contracts, production Vite build, and `git diff --check` passed after the fix. Final production bundle is **743.85 kB JS / 255.94 kB gzip**; existing >500 kB warning remains.
- This browser harness is not the production Electroview bridge, native Electrobun window, target-platform, IME/screen-reader, or formal accessibility proof.

## VS Code Evidence

- `bun run test` in `vscode-extension`: compile and Extension Development Host passed **19 tests**. Existing formatting, diagnostics, completion, unsaved imports, UTF-16 navigation, hover, references, outlines, ambiguity withholding, and quick-fix regressions pass.
- VS Code range conversion uses shared source facts. Completion preparation/candidates, module parser/checker graph, navigation occurrences, deterministic quick-fix facts, and rename identity use shared modules.
- The rename provider rechecks current facts/tokens and refuses reserved/colliding names before returning a multi-file `WorkspaceEdit`. VS Code 1.85 has no apply-time document-version precondition; a previously resolved edit may be applied after a later change. This remains an explicit acceptance residual for the Lead Developer.

## Performance Sample

- A synthetic contained chain of **101 reachable modules** (entry plus 100 dependencies) produced 301 symbol facts and 0 diagnostics in **32.332 ms** for one `analyzeBuffer` request.
- Process heap delta was **+2,216,960 bytes** for that single run. It includes Bun/runtime, source fixture, RPC, parser/checker, and result objects; it is not an isolated editor-service memory profile or cross-platform guarantee.
- No native-host latency, repeated percentile, concurrent typing, 100-file project UI, background worker cancellation, or accessibility measurement is claimed.

## Verification Matrix

- Root `bun run build`: pass.
- Root `bun test`: **230 passed, 0 failed across 22 files** in the final run; `bun run build` passed immediately before it.
- Focused root editor tests: **9 passed, 0 failed** after the graph bound.
- Desktop `bun run test`: pass; includes active overlay facts, stale response rejection, inline action safety, atomic multi-file rename, collision/reserved/stale no-write behavior, and `Final active resources: []`.
- Desktop `bunx vue-tsc --noEmit`: pass.
- Desktop `bunx vite build`: pass; final bundle metrics above; existing chunk warning retained.
- VS Code `bun run test`: **19 passing** in Extension Development Host.
- `git diff --check`: passed after all implementation, planning, and evidence additions.
- Direct Hutch/package/native Electrobun checks: **not performed**. No browser or service result is substituted for them.

## Residuals and Handoff

- VS Code apply-time `WorkspaceEdit` revision enforcement needs an explicit Lead Developer disposition or a guarded-command/preview follow-up; do not claim stale-proof application.
- Function-body and loop-iterator occurrences without parser-proven independent source spans remain withheld. Field/access and expression-scope coverage is limited to spans proven by the current AST.
- Production CodeEditor/RPC was not mounted inside an Electrobun `Electroview`; browser interaction evidence is component-only. Native focus/IME/accessibility/platform behavior remains unverified.
- Sprint 041 may consume the bounded static graph, overlay facts, source ranges, and rename RPC after reviewing these limits; its data-grid candidate and 100k-row gate remain unchanged. Sprint 042 must separately verify live-job cancellation, preview invalidation, and export behavior.
- Native platforms, Hutch packaging, Office, project license/Marketplace, and formal accessibility remain separate residuals.