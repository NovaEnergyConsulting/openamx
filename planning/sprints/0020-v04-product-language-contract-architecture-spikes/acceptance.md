# Sprint 020 Acceptance Criteria

Sprint 020 is complete when:

- `docs/language-spec-v0.4.md` is the authoritative, self-contained V0.4 contract; V0.2 and V0.3 specifications remain unchanged as historical contracts.
- The specification defines exact visualization syntax and static semantics, including supported typed data shapes, view names and bindings, field/series roles, labels, ordering, declaration and emission behavior, source locations, diagnostics, and unsupported-shape failures.
- The specification defines source-order behavior across executable blocks, view placement with the formatted/escaped source listing retained, and compatibility with V0.3 modules, inputs, validation, outputs, interpolation, and HTML rendering.
- HTML table behavior is testable for sorting, filtering, pagination, empty data, escaping, and accessible semantics. Bar/column, line, and scatter chart contracts define bindings, ordering, deterministic data/output, empty states, accessibility, and static print fallbacks without remote assets.
- PDF requirements cover local/offline operation, representative report layout, readable typography, headings, tables, static charts, pagination, completion before capture, CLI/desktop entry points, validated destinations, actionable failures, and no writes after analysis or rendering failure. No pixel-parity claim is made.
- The unsaved-buffer spike records commands, code path, input document/data/module setup, actual result, source-located diagnostics, and proof that existing containment and validation boundaries remain enforced. Any failed requirement and alternative are explicit.
- The desktop prototype demonstrates a runnable Electrobun + Vue + shadcn-vue setup, a typed webview-to-main-process round trip, and Bun-backed integration (or a tested, evidence-based alternative); exact versions, prerequisites, isolated commands, and known limitations are recorded.
- PDF approaches are compared against the blueprint criteria; a choice and tested version are justified by a representative proof, or a concrete blocker is escalated without reducing the PDF must-have. DOCX has an evidence-based stretch disposition and does not become a core gate.
- The contract specifies portable project defaults, machine-local input-path overrides, per-run precedence, path handling, privacy boundaries, and safe output selection/writes.
- The platform matrix records exact tested OS/runtime versions and outcomes. Checks not possible in the current environment are explicitly marked unverified; Linux evidence is not presented as macOS or Windows acceptance.
- No production visualization, PDF, or desktop workflow implementation has begun; no existing root or VS Code extension workflow is destabilized.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` record the resolved contract, evidence-backed choices, unresolved or escalated items, verification results, and the Sprint 021 handoff gate.
- Root `bun run build`, `bun test`, relevant isolated desktop checks, and `git diff --check` pass for the changes made, or any unavailable/failed check is recorded with its cause and Sprint 020 remains open if it blocks acceptance.
- Any concrete blocker to a V0.4 must-have has been presented to the Lead Developer with evidence and options; no must-have is downgraded without explicit approval.
