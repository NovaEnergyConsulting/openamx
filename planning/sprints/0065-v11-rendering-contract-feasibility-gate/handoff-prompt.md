# Sprint 065 Handoff Prompt

You are the Builder for OpenAMX Sprint 065: V0.11 Rendering Contract and Feasibility Gate.

## Read First

- Applicable repository instructions and any `AGENTS.md` / Copilot instructions
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- `planning/plan-openamxV11MasterSprintPlan.md`
- Sprint 065 `requirements.md`, `blueprint.md`, and `acceptance.md`
- `planning/sprints/0000-sprint-template/` for the project artifact conventions
- Current worktree status before any action; preserve user changes and existing artifacts
- The relevant renderer, report-preparation, chart-model, parser, desktop preview/RPC/host code and tests named in the V0.11 master plan
- `examples/kitchen-sink.amx` and the supplied `examples/kitchen-sink.pdf` (read-only; never overwrite the PDF)
- Current package metadata for `docx`, `docx/charts`, `marked`, Bun, and desktop-worker bundling

## Authority and Gate

The V0.11 master plan defines approved product scope. Sprint 065 defines the pre-implementation contract/feasibility work only. Existing AMX language/evaluation, report identity/order, show-time snapshots, measurement semantics, emitted data tables, working PDF output, and atomic export behavior remain compatibility requirements.

No production implementation, dependency/lockfile change, limit change, renderer edit, iframe permission change, or user-facing behavior change is authorized. Keep experiments disposable and isolated. Sprint 066 is blocked until a separate Lead Developer disposition explicitly approves the contract and feasibility gate.

Native chart API presence or valid OOXML does not prove Microsoft Word behavior. Actual Word desktop chart edit/save/close/reopen and Word web save/download preservation checks are mandatory. If either application/reviewer is unavailable, record the exact block; do not substitute XML inspection, another viewer, or an assumed result.

## Task Contract

**owns**: Cross-destination Markdown contract and behavior matrix; prose newline/code whitespace/raw HTML/page-break/heading-anchor rules; image and link path/security/size proposals; native DOCX chart compatibility probes for four existing chart kinds; actual Word desktop/web pilot evidence; portable relative-link evidence; desktop preview navigation protocol proposal; Builder evidence and explicit gate decision request.

**must_not**: Implement product behavior; change AMX syntax/evaluation, report data/order/snapshots, PDF/DOCX/HTML renderers, desktop RPC/preview, production dependencies or lockfiles, output limits, iframe permissions, or security policy; coerce chart semantics; add static-image fallback; overwrite `examples/kitchen-sink.pdf`; bypass viewer prompts/restrictions; claim unavailable checks passed; authorize Sprint 066 yourself.

## Execution Rules

1. Confirm the worktree and select disposable locations before creating probes or reports. Never remove or overwrite files that predate this sprint.
2. Complete the matrix from the master plan, not from the capabilities of one renderer. Keep PDF, DOCX, HTML, and desktop preview outcomes separate and distinguish expected contract from current behavior.
3. Resolve LF/CRLF, prose newlines, blank lines, hard breaks, code tabs/spaces, raw HTML, interpolation, data-cell treatment, page-break directive, stable anchors, duplicate headings, and missing fragments with concrete fixtures and expected outputs.
4. Test local assets under canonical roots and actual path containment, symlink/traversal, file-content, format, size, pixel-count, alt-text and no-upscale rules. Recommend bounds from evidence; do not modify worker caps.
5. Verify local links relative to the source document during preparation but relative to the final export directory in PDF/DOCX. Relocate atomic outputs with companions and test URI encoding. Record prompts/restrictions from actual viewers; never suppress them.
6. Probe native Word charts for `bar`, `column`, `line`, and `scatter`. Inspect OOXML relationships and embedded workbooks, then use actual Word desktop and web as stated in acceptance. Test numeric/time axes, uneven spacing, source order/duplicates, multiple units, null/empty values, negative/zero, and grouping.
7. Stop and seek a Lead Developer decision if a required case cannot remain an editable native chart with faithful meaning. Never silently sort/coerce, use categories for continuous axes, replace null with zero, change kind, or substitute a static image.
8. Specify the preview navigation protocol within current host/RPC ownership: user click, opaque target ID, current frame/revision binding, host target mapping/revalidation, allowlist, confirmation, and hostile/stale/forged rejection. Do not implement it or change iframe permission.
9. Capture the supplied PDF baseline read-only and distinguish capture from inspection. Record reviewer, tools and findings only when actually observed.
10. Update only Sprint 065 planning artifacts and the state/decision/question ledgers. Submit `builder-evidence.md` with exact commands, actions, versions, artifacts, outcomes, limitations and residual owners. Do not change implementation files or generate a success-looking evidence file for unrun checks.
11. Request a separate Lead Developer disposition. Until approval, Sprint 066 remains blocked; no release, publication, V0.11 completion, or platform certification is implied.

## Completion Message

Summarize the contract proposal, each feasibility outcome, Word app/version evidence or access blocker, unresolved chart/security/path decisions, changes to planning records, and residual owners. State clearly that the Builder is requesting gate disposition and has not authorized implementation.