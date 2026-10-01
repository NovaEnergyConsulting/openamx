# Sprint 035 Acceptance Criteria

Sprint 035 is complete when:

- The V0.6 product/UX contract is explicitly ratified, with any amendments recorded, and a compatibility matrix proves that V0.2-V0.5 language, data, report, export, CLI, and VS Code semantics remain unchanged.
- A screen inventory and user-flow/state package covers welcome, workbench, data editor, Inputs, report settings, Export, runtime drawer, conflict/recovery, trash, and the required empty/loading/running/paused/stale/error/success/conflict/recovery/cancellation states.
- The native menu, command, shortcut, focus, visual-token, theme, contrast, reduced-motion, and 1024x720/larger-viewport decisions are documented, including what becomes a drawer or tab when space is constrained.
- Reviewable low-fidelity frames exist for every required screen in light and dark themes at both required viewport classes, and every available `planning/v06-design-inputs/` reference is marked adopted, rejected, or adapted with rationale.
- The source-overlay proof demonstrates unsaved reachable imports take precedence, unopened dependencies use canonical disk paths, containment/cycle/source-location rules remain intact, CLI behavior is unchanged, and no probe writes through the overlay. Focused regression tests pass.
- The cancellation/worker proof records the selected boundary for preview/run, input validation, and report preparation, including termination or cooperative limits, cleanup, bounded payloads, private-path redaction, stale-job rejection, and main-process-only final writes. Unsupported guarantees are explicitly marked.
- The Electrobun/native proof records actual results for menus, Open, Reveal, save selection, focus restoration, and window lifecycle. Browser or shim results are labeled as non-native and cannot close a native gate.
- The editor-analysis proof demonstrates reusable symbol identity, ranges, completion, and diagnostics without a second parser, and the CodeMirror comparison records license, compatibility, highlighting fidelity, and known gaps.
- The virtual-grid/JSON-tree comparison records license, Vue/Bun/Vite compatibility, keyboard behavior, raw/structured synchronization, 100,000-row behavior, bundle/memory impact, and the selected option or a blocking reason.
- A deterministic Vue component/browser harness proves representative populated and stateful interactions, screenshots, theme switching, viewport coverage, keyboard navigation, focus restoration, and no obvious main-thread blocking in the tested slice.
- Performance evidence records hardware, OS, runtime, fixture sizes, timings, memory, commands, and proposed final budgets for project listing, first usable data viewport, preview debounce, cancellation acknowledgement, and webview task duration.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` contain exact commands/results, selected approaches, blocked proofs, owners, residual risks, and explicit conditions for Sprint 036. No Sprint 036 production implementation is claimed.
- The final gate status is one of `ACCEPTED`, `ACCEPTED WITH RECORDED EXCEPTIONS`, or `BLOCKED`; unavailable host, viewer, packaging, formal-accessibility, Office, Marketplace, and native-release evidence is never represented as passed.

## Builder Disposition (2026-10-01)

**Final status: ACCEPTED WITH RECORDED EXCEPTIONS by explicit Lead Developer direction (2026-10-01).** The Lead Developer ratified the contract, accepted the active-document request identity, contained source-overlay boundary, and cancellable-job approach, and authorized Sprint 036. Evidence is recorded in [builder-evidence.md](builder-evidence.md) and [contract-evidence.md](contract-evidence.md).

| Acceptance area | Status |
| --- | --- |
| Contract ratification and V0.2-V0.5 compatibility | Ratified without amendment by Lead Developer; compatibility matrix recorded. |
| Screen/state/flow/menu/focus/token package | Documented; 36 low-fidelity frames generated and indexed. Contract/design approval pending. |
| Active-document identity | Accepted by Lead Developer: canonical URI, project generation, document revision, input/settings revision, and job ID. |
| Source overlay | Focused root proof passed (33 module tests, 108 assertions); approach accepted by Lead Developer. |
| Cancellation/worker architecture | Synthetic Bun Worker termination proof passed; worker approach accepted. Real pipeline cleanup and latency remain Sprint 036/042 proof. |
| Native Electrobun behavior | UNAVAILABLE on this host; exception owner: Lead Developer. Native-dependent acceptance in Sprints 037-039/042 remains gated on direct host evidence. |
| Editor-analysis/CodeMirror | Local parser/checker proof passed; full module/provider and AMX-decoration proof incomplete. |
| Virtual grid/JSON editor | Candidate comparison recorded; no selected candidate or 100k viewport proof. Exception owner: Lead Developer / Sprint 041 Builder; Sprint 041 remains gated on proof/selection. |
| Browser/component harness | Isolated Vue/Vite frame harness builds and interaction/screenshot checks pass; no production RPC, background-task, or native proof. |
| Performance budgets | Listing/core CSV/worker primitive measured; first viewport, debounce, end-to-end cancellation and webview task duration unmeasured. |
| Planning records | State, decisions, questions, and evidence updated with owners/gates/residuals. |

Sprint 036 is authorized. The native/API, grid-candidate, and final performance exceptions remain assigned to their dependent sprints as listed above; no unavailable proof is represented as passed.
