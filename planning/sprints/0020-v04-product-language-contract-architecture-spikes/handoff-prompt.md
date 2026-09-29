# Sprint 020 Handoff Prompt

You are the Builder for OpenAMX Sprint 020.

Read these files first:

- `.agents/main.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`
- `planning/plan-openamxV04MasterSprintPlan.md`
- `docs/language-spec-v0.2.md`
- `docs/language-spec-v0.3.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/requirements.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/blueprint.md`
- `planning/sprints/0020-v04-product-language-contract-architecture-spikes/acceptance.md`
- Relevant parser, checker, runtime, renderer, CLI, and VS Code extension files identified by the blueprint

Execute only Sprint 020 scope. This is the V0.4 contract and architecture-evidence sprint, not a production feature sprint. Preserve V0.2/V0.3 contracts and behavior. Do not begin visualization implementation, production PDF export, or desktop workflows assigned to later sprints.

## Task Contract

**objective**: Deliver the authoritative V0.4 language/export/desktop contract and evidence-backed feasibility choices for unsaved-buffer analysis, Electrobun integration, and offline PDF generation.

**owns**:

- `docs/language-spec-v0.4.md`
- A minimal isolated `desktop-app/` prototype and package configuration strictly needed to prove the desktop architecture
- The three feasibility spike results, tested dependency versions, commands, and platform/prerequisite notes
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Corrections to Sprint 020 artifacts only when required to record approved clarifications or evidence

**must_not**:

- Implement production visualization syntax/runtime/HTML behavior, production PDF export, or desktop user workflows.
- Change historical V0.2/V0.3 specifications or silently alter their behavior.
- Duplicate parser, checker, evaluator, or renderer logic in the desktop prototype.
- Give the webview unrestricted filesystem or execution capability; keep file access, module/input resolution, evaluation, and export in the main process behind typed RPC.
- Add remote dependencies/assets to the offline report path, commit generated native outputs, or store user-local paths/secrets in shared project configuration.
- Claim platform testing that was not performed.
- Reduce a selected must-have based only on a spike result. If a concrete blocker appears, present the evidence and options to the Lead Developer and wait for approval before changing scope.

**acceptance**:

- Meet every item in `planning/sprints/0020-v04-product-language-contract-architecture-spikes/acceptance.md`.
- Resolve all Sprint 020 contract questions in `planning/questions.md` and record the adopted rules in `docs/language-spec-v0.4.md` and `planning/decisions.md`.
- Leave explicit, implementable boundaries for Sprints 021–025, with DOCX still a non-blocking stretch goal.
- Do not hand off Sprint 021 or Sprint 024 production work until the contract and spike evidence are ready for Lead Developer review.

**verification**:

1. For each spike, write down its hypothesis, smallest reproducible setup, exact command/tool versions, observed result, and whether the result proves the requirement. Test current-buffer execution with a local import and configured CSV/JSON data; verify source locations, containment, and validation behavior.
2. Build and launch the minimal desktop prototype in the available environment. Verify the typed webview/main-process round trip and Bun integration; record native prerequisites and all untested operating systems.
3. Compare at least two PDF approaches, then exercise the leading candidate on representative report content including headings, a table, a static chart, and page breaks. Record offline behavior, pagination/readability, limitations, licensing, and version evidence before selecting it.
4. Verify isolated desktop install/typecheck/build/test/run commands without changing root or extension command behavior. Run `bun run build`, `bun test`, and `git diff --check` from the repository root.
5. Update planning records with exact results, failures, choices, and open blockers. Stop for Lead Developer review if evidence threatens any selected must-have.
