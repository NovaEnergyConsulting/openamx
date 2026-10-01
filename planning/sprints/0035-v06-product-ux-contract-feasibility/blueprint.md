# Sprint 035 Blueprint: V0.6 Product/UX Contract and Feasibility

## Approach

1. Establish the baseline. Read the V0.6 master plan, product/UX contract, V0.2-V0.5 compatibility contracts, current desktop/RPC/runtime/provider owners, prior planning outcomes, and any `planning/v06-design-inputs/` references. Build a traceability ledger from each Sprint 035 requirement to evidence and decision.
2. Ratify the contract. Resolve contradictions against the older contracts, then add the compatibility matrix, screen/state inventory, user flows, state transitions, menu/command/shortcut map, visual tokens, and explicit state behavior. Record amendments as decisions rather than silently editing around them.
3. Build low-fidelity review evidence. Produce inspectable frames or diagrams for all required screens at 1024x720 and a larger viewport, in light and dark themes. Include populated and failure-oriented states, focus/keyboard behavior, docking, density, and responsive fallbacks. Record each design reference as adopted, rejected, or adapted.
4. Prove the runtime boundary. Create an isolated source-overlay probe around the existing loader contract and tests for unsaved reachable imports, saved fallback, containment, cycles, source locations, CLI compatibility, and no disk mutation. Separately compare cooperative cancellation and terminable worker designs with bounded messages, cleanup, stale response rejection, redaction, and main-process-only writes.
5. Prove host and authoring candidates. Exercise the available Electrobun/native APIs and record actual host limitations. Extract a small pure editor-analysis proof from existing facts. Compare maintained CodeMirror highlighting bridges and virtual grid/JSON tree candidates against the contract's licensing, compatibility, scale, and keyboard requirements.
6. Establish the UI evidence harness. Demonstrate deterministic component/browser rendering and screenshots for representative empty, populated, loading, stale, error, conflict, recovery, and cancellation states at both required viewport sizes and themes. Include keyboard/focus assertions and note any unavailable native checks.
7. Measure and decide. Run the documented performance fixtures, record hardware/OS/runtime, timings and memory, set or retain budgets, and produce an approach decision for each dependent sprint. A failed or ambiguous proof remains a blocking residual rather than an implicit selection.
8. Close the gate. Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with exact evidence, accepted approaches, blocked items, owners, and the conditions for Sprint 036. Do not begin production implementation in this sprint.

## Files to Update

- `planning/openamxV06ProductUXContract.md` and supporting contract diagrams/frames or manifests
- `planning/v06-design-inputs/` disposition record when references exist
- Isolated proof/spike files under an explicitly marked planning or desktop spike location
- Focused proof tests and evidence records, without changing production behavior
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## Notes

The output is an auditable gate package, not a design suggestion. Each selected dependency must have a bounded rationale, license/compatibility evidence, and a rollback or fallback option. Native behavior, cancellation guarantees, and performance claims must be stated at the level actually observed. Sprint 036 may start only after the active-document/job identity and source-overlay decisions are accepted; later sprints remain blocked by their listed dependencies.
