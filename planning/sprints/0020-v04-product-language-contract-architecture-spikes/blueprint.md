# Sprint 020 Blueprint: V0.4 Product/Language Contract and Architecture Spikes

## Approach

- Read the V0.4 master plan, V0.2/V0.3 contracts, relevant core boundaries, and repository instructions before making changes. Treat existing V0.2/V0.3 behavior as the compatibility baseline.
- Resolve every contract question listed in `planning/questions.md` and write the decisions into the authoritative `docs/language-spec-v0.4.md`. Include grammar examples, diagnostics and source-location rules, compatibility rules, accessibility/empty states, export behavior, security boundaries, limitations, and explicit non-goals.
- Define visualization syntax and semantics concretely enough that Sprints 021–022 can implement without inventing rules: declaration/view relationship, data binding, supported typed list shapes, table columns and interactions, chart field roles/series/labels/order, deterministic output, and emission order across executable blocks.
- Specify separate interactive HTML and static PDF/DOCX presentations. Make print fallbacks, accessibility semantics, empty data, escaping, and pagination testable. Do not promise pixel parity or interactive controls in exports.
- Run three bounded evidence spikes:
  - Unsaved-buffer execution: use current entry text with the shared parser/core pipeline, local `.amx` imports, and configured CSV/JSON inputs. Verify diagnostics retain source locations and module containment/data validation remain enforced. Compare direct core reuse with a bounded main-process CLI invocation only if direct reuse cannot satisfy the contract.
  - Desktop runtime: create the smallest runnable `desktop-app/` Electrobun + Vue + shadcn-vue prototype. Prove a typed request/response through the main process and a Bun-backed integration; record exact package/runtime/native prerequisites and an alternate only if the required route fails.
  - PDF/export: compare at least two viable local/offline approaches against representative report content, pagination/readability, static table/chart output, font availability, Linux viability, Bun integration, testability, licensing, and desktop reuse. Exercise the leading approach with a small proof and record its guarantees and limitations before selecting/pinning versions.
- Decide DOCX disposition from evidence and core schedule risk. Keep it explicitly optional and out of core acceptance regardless of the result.
- Specify project configuration precedence and safe path rules for portable defaults, machine-local overrides, and per-run values. Keep private paths local and make writes explicit and validated.
- Keep root and VS Code extension workflows independently buildable/testable. Record isolated desktop commands and a platform verification checklist; mark platforms not available in this environment as unverified.
- Update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with exact outcomes and handoff readiness. If any must-have is blocked, stop for Lead Developer scope review rather than silently narrowing it.

## Files to Update

- `docs/language-spec-v0.4.md`
- `desktop-app/` minimal feasibility prototype and isolated package/configuration files, only as needed to prove the selected runtime path
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/requirements.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/blueprint.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/acceptance.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/handoff-prompt.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

## Notes

Sprint 020 is a contract-and-evidence gate, not the beginning of visualization, PDF, or desktop feature implementation. The language spec and prototype evidence must be reviewed before Sprint 021 and Sprint 024 production work begins. Record the observed environment accurately: this workspace is Linux; cross-platform release-owner build/launch checks remain a later V0.4 acceptance requirement.
