# Plan: OpenAMX V0.5 Master Sprint Plan

Evolve OpenAMX from a locally proven V0.4 prototype into a polished, professional authoring and reporting product. V0.5 centers on a modern technical-IDE desktop workflow, branded report presentation, practical accessibility, focused VS Code productivity tooling, and clearer CLI/documentation onboarding. Preserve V0.2-V0.4 language, type, visualization, data, and export semantics by default. V0.5 may add only narrowly scoped, additive report identity metadata and project configuration. Plan seven sequential sprints without a fixed sprint budget; Sprint 029 and Sprint 033 may proceed in parallel after the Sprint 028 contract is accepted.

V0.4's native macOS, Windows, and native Ubuntu release-owner checks, Hutch package/native-launch reliability, broad Office compatibility, project license selection, and Marketplace publication remain explicit, separate release-engineering residuals. They are not silently closed, weakened, or absorbed into V0.5 feature acceptance.

## Recommended Approach

- Seven proposed sprints: product/UX/branding contract; desktop workbench workflow; desktop code-editor and analysis ergonomics; shared report identity and HTML presentation; PDF/DOCX presentation; VS Code productivity; CLI/docs/examples/acceptance.
- Every sprint customizes the four files from `planning/sprints/0000-sprint-template/` (requirements, blueprint, acceptance, and handoff prompt).
- Builders execute only documented scope and update `planning/state.md`, `planning/decisions.md`, and `planning/questions.md` with actual results, decisions, visual-review outcomes, and residuals.
- Keep the TypeScript/Bun core general-purpose. Reuse the current Electrobun + Vue + shadcn-vue desktop package, shared report adapters, CLI analysis path, and direct Node-host VS Code providers rather than duplicating language or runtime behavior.
- Establish a V0.5 visual-system and additive configuration contract before implementation. It must define behavior precisely enough that desktop, HTML, PDF, DOCX, CLI, and editor work share the same identity without inventing presentation rules independently.
- Make the desktop current-buffer and main-process-only capability boundary non-negotiable. Native dialogs, session state, and UI commands must cross the existing typed RPC boundary; the webview must not receive direct filesystem, module-loader, evaluator, or export authority.
- Treat HTML, PDF, and DOCX as format-native presentations of one evaluated report identity and content order. Do not promise exact pixel parity or broad Office compatibility.
- Require automated regression and behavior checks plus a documented Lead Developer manual visual review of the desktop experience and representative HTML/PDF/DOCX outputs. Manual visual review is the V0.5 design-approval gate; it does not replace automated test coverage.

## Steps

### Phase 1 - Product, UX, and Compatibility Contract

#### Sprint 028: V0.5 Product, UX, Branding, and Compatibility Contract (depends on nothing)

- Define the authoritative V0.5 contract in `docs/language-spec-v0.5.md`, or an explicitly linked V0.5 product/report contract if a new language-spec file is not warranted. Preserve V0.2, V0.3, and V0.4 as historical contracts.
- Define a shared visual system for the modern technical-IDE direction: tokens, typography, spacing, color/contrast rules, icon and command conventions, focus/keyboard treatment, loading/empty/error/success states, responsive panel behavior, report hierarchy, and practical accessibility baseline.
- Specify additive project-level report identity defaults and controlled report-level overrides. Cover organization/publisher name, local logo asset, accent color, report author, status/classification, footer/legal notice, precedence, validation, fallback behavior, source locations, and diagnostics.
- Define a safe local logo policy for CLI and desktop execution: allowed formats, size and path limits, canonical containment, symlink handling, embedding/serialization behavior, behavior when the asset is unavailable, and no network-backed asset loading.
- Define an additive report metadata option controlling formatted AMX source visibility. Preserve the V0.4 visible-source behavior by default unless an explicit compatibility decision and migration note approve a changed default. Specify equivalent intent for HTML, PDF, and DOCX while respecting each format's capabilities.
- Define the target desktop information architecture: native project/file/export dialogs, searchable hierarchical explorer, multi-file tabs, dirty/conflict/reload state, recent projects/session restoration, resizable/collapsible panels, focused modes, command palette, keyboard shortcuts, and current-buffer state rules.
- Define the desktop editor and diagnostics experience: minimum full-editor behaviors, use of a proven editor component, formatting/completion/diagnostic integration, source navigation, selection preservation, result/preview/export state, and accessibility expectations.
- Define the focused direct-provider VS Code scope: hover, go-to-definition, document symbols/outline, references, and safe contextual code actions. Retain pure parse/check/link analysis, source locations, unsaved-buffer fidelity, and Node-host compatibility; do not introduce an LSP.
- Define CLI and documentation usability goals: discoverable help, actionable errors, examples, onboarding paths, and accurate distinction between product capability and unresolved release-engineering status.
- Create the Lead Developer manual visual-review checklist and representative fixtures for desktop, HTML, PDF, and DOCX. No production UI, rendering, VS Code, CLI, or language changes occur in this sprint.

#### Sprint 029: Desktop Workbench Shell and Project Workflow (depends on 028)

- Replace typed project, document, and export path entry with validated native dialogs owned by the main process. Retain project-root containment, exact extension checks, destination conflict checks, and existing safe-write guarantees.
- Add local-only recent-project and session-restoration state. Persist no input secrets or machine-local configuration in project files, shared configuration, diagnostics, or version control.
- Replace the flat module list with a searchable hierarchical project explorer. Add active-file presentation, file-type/status affordances, contained regular-file rules, ignored/generated-file treatment, and safe module navigation.
- Add multi-file editing tabs with explicit open/switch/close behavior, dirty/conflict state, unsaved-change confirmation, reload handling, and current entry-document designation. Do not weaken conflict-safe save behavior.
- Establish the approved workbench layout: resizable/collapsible explorer, editor, preview, diagnostics, inputs/results, and export regions; focused modes; stable dimensions; keyboard-accessible controls; visible focus; and responsive behavior at supported desktop window sizes.
- Add a command palette and documented keyboard shortcuts for opening projects/files, switching files, saving, formatting, running, previewing, exporting, and focused layout modes. Commands must invoke typed main-process operations rather than browser-local privilege.
- Add focused desktop tests for dialog request validation, project/session persistence boundaries, explorer containment, tab/dirty/conflict behavior, commands/shortcuts, layout state, and webview/main-process authority.

#### Sprint 030: Desktop Code Editor, Diagnostics, and Analysis Ergonomics (depends on 029)

- Integrate a proven editor component in place of the raw textarea. Deliver syntax highlighting, line numbers, selection-safe canonical formatting, bracket behavior, find/replace, keyboard editing, scroll/resize resilience, and accessible editor controls without reimplementing AMX grammar.
- Reuse the core parser/checker and existing editor-analysis contracts for source-aware completion, static diagnostics, local-module diagnostics, and formatting. Do not evaluate AMX or load CSV/JSON merely to support editor assistance.
- Improve diagnostic presentation with source locations, severity/state grouping, selection-safe navigation to source, current-buffer refresh behavior, and clear distinction between static diagnostics and run-time/data diagnostics.
- Improve current-buffer run, preview, input-configuration, result-summary, and export feedback with explicit running/success/failure states. Prevent late responses, stale preview content, or failed runs from appearing as current success.
- Preserve the existing main-process-only filesystem/module/input/evaluator/PDF/DOCX boundary. Keep result summaries bounded and private input paths redacted.
- Add focused desktop editor/UI/RPC tests for unsaved multi-tab behavior, formatting, navigation, diagnostics, run/preview/export state transitions, local imports, input configuration, and accessibility baseline behaviors.

### Phase 2 - Report Identity and Presentation

#### Sprint 031: Shared Report Identity, HTML Presentation, and Branding (depends on 028; may proceed in parallel with Sprints 029-030)

- Introduce a shared resolved report-identity and presentation boundary for the evaluated document, final narrative environment, and immutable view emissions. It must be consumed by HTML, PDF, and DOCX adapters without re-evaluating AMX or rereading modules/inputs.
- Implement project identity defaults plus report-level metadata overrides, including validated local logo handling, organization/publisher, accent color with contrast guardrails, author, status/classification, footer/legal notice, and safe fallbacks.
- Redesign standalone HTML reports around the approved hierarchy: title and metadata presentation, readable narrative, source display, table and chart framing, print rules, mobile/browser resilience, and self-contained offline assets. Preserve escaped content, deterministic output for a fixed source/identity/input set, and no remote requests.
- Refine presentation of the existing table, bar/column, line, and scatter capabilities only. Preserve V0.4 binding, show-time snapshot, interaction, ordering, static print-data, and accessibility semantics. Do not add chart kinds, bindings, data coercions, or new visualization syntax.
- Implement the source-visibility metadata option with accessible reader-facing behavior. Maintain V0.4-compatible visible-source output in the absence of the additive setting unless Sprint 028 records an approved compatibility exception.
- Add renderer tests for identity precedence, safe/contained logo assets, color validation, source visibility, HTML escaping, deterministic report structure, existing report interaction/print behavior, accessibility labels, and compatibility with V0.2-V0.4 documents that use no V0.5 metadata.

#### Sprint 032: Branded PDF and DOCX Export Presentation (depends on 031)

- Apply the resolved report identity and hierarchy to the existing pdfmake and DOCX adapters using format-native styles and layout facilities. Retain one analysis/evaluation path and existing destination-validation/atomic-write behavior.
- Add professional title/metadata treatment, headers/footers, typography, spacing, table/caption styling, code/source treatment, existing static-chart presentation, accessible textual chart data, and branded local logo support where each format can safely support it.
- Preserve searchable PDF content, semantic/editable DOCX headings/paragraphs/lists/tables, source/view order, declaration-order tables, static charts, and safe local/offline generation. Do not promise HTML/PDF/DOCX pixel parity, interactive exports, broad Office compatibility, PDF/A, or tagged-PDF certification.
- Add focused PDF/DOCX structure/content/path/no-write tests for identity precedence, asset failure behavior, report/source/view order, table/chart data, metadata/footer content, and existing-destination preservation.
- Record actual engine-specific limitations and manual-review findings. Do not introduce a browser-print fallback, remote assets, unverified fonts, or a second report-evaluation path.

### Phase 3 - Complementary Authoring and Delivery

#### Sprint 033: VS Code Productivity Tooling and Presentation (depends on 028; may proceed in parallel with Sprints 029-032)

- Extend the direct Node-host providers with source-located hover information, go-to-definition, document symbols/outline, references, and safe contextual code actions where existing parser/checker/module-analysis facts can support them.
- Reuse source order, explicit exports, local containment, unsaved entry-buffer analysis, and original UTF-16 locations. Never fabricate symbols, execute AMX, load CLI input data, write files, or introduce an LSP server/process.
- Retain and refine existing executable-fence formatting, source-order completion, parser/static/link diagnostics, diagnostic refresh/clear behavior, and V0.2-V0.4 compatibility.
- Improve extension presentation and onboarding only where it reflects verified functionality. Preserve Node runtime compatibility, direct-provider architecture, local VSIX packaging/install behavior, and the unresolved license/publication status.
- Add Extension Development Host coverage for navigation, hovers, symbols, references, code actions, unsaved edits, imports/cycles/containment, diagnostics lifecycle, and existing provider regressions.

#### Sprint 034: CLI, Documentation, Examples, V0.5 Acceptance, and Release Record (depends on 029-033)

- Improve CLI help, command errors, examples, and onboarding for V0.5 report identity, source visibility, desktop workflows, export behavior, and VS Code productivity features. Do not add an interactive CLI workflow.
- Add an auditable branded end-to-end example using existing typed data, views, and export paths. Assert report identity precedence, local asset safety, source visibility, output structure, existing data/visualization behavior, and no-write guarantees on invalid analysis or invalid destinations.
- Update README, V0.5 contract, desktop documentation, VS Code extension documentation, CLI guidance, examples, limitations, version metadata, and release instructions to match only verified behavior. Preserve V0.2-V0.4 specifications as historical contracts.
- Run root build/tests, CLI/example acceptance, desktop direct/RPC/typecheck/web checks, VS Code compile/host/package/install checks where supported, and `git diff --check`. Record exact commands, counts, artifacts, warnings, and unavailable checks.
- Run the Lead Developer manual visual review using the Sprint 028 checklist against the desktop workflow and representative HTML, PDF, and DOCX outputs. Record approval, exceptions, and remediation decisions; do not replace behavioral tests with manual review.
- Record final V0.5 feature disposition separately from inherited V0.4 native platform/Hutch, license/Marketplace, and broad Office-compatibility residuals. A V0.5 feature-complete status must not imply those separate release-engineering gates are closed.

## Relevant Files

- `docs/language-spec-v0.2.md`, `docs/language-spec-v0.3.md`, and `docs/language-spec-v0.4.md` - historical compatibility contracts; add the authoritative V0.5 product/report contract without rewriting prior semantics.
- `desktop-app/src/mainview/App.vue` and `desktop-app/src/mainview/app.css` - current single-screen Vue workbench and style surface to evolve into the approved desktop experience.
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, and `desktop-app/src/bun/desktopWorkflow.ts` - typed trusted-boundary, path, session, input, and output ownership points.
- `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, and `src/renderer/reportDocx.ts` - current separate report adapters to converge on a shared resolved identity/presentation boundary.
- `src/formatter/formatAmx.ts`, `src/parser/`, `src/typechecker/`, and `src/runtime/` - reuse-only language services for desktop/editor behavior; V0.5 does not redesign their semantics.
- `src/cli.ts`, `README.md`, and `examples/` - CLI messaging, onboarding, examples, and end-to-end acceptance.
- `vscode-extension/src/extension.ts`, `vscode-extension/src/providers/`, and `vscode-extension/src/test/` - direct providers and Extension Development Host coverage to extend without an LSP.
- `tests/`, `desktop-app/tests/`, `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and `planning/sprints/0000-sprint-template/` - acceptance evidence, planning record, and sprint-artifact source.

## Verification

1. Each sprint ends with its owned acceptance criteria passing. Run root `bun run build`, `bun test`, relevant desktop direct/RPC/typecheck/Vite checks, extension compile/host/package/install checks where supported, and `git diff --check`; record unavailable package/native checks accurately.
2. Sprint 028 produces a reviewable contract and Lead Developer visual-review checklist before implementation. No Builder invents report identity, compatibility, or UI behavior outside that contract.
3. Desktop verification covers typed main-process authority, native-dialog request validation, project-root containment, session privacy, explorer/file rules, multi-tab dirty/conflict safety, current-buffer execution, commands/keyboard accessibility, panel/focus modes, editor behavior, diagnostics navigation, and stale-response prevention.
4. HTML verification covers identity precedence, safe local assets, contrast/visible focus, semantic metadata/source/table/chart markup, escaping, source visibility, existing V0.4 interactivity/print behavior, offline output, and V0.2-V0.4 compatibility without V0.5 metadata.
5. PDF/DOCX verification covers format-native identity, local logo behavior, searchable/semantic report content, title/metadata/footer, source/view order, table/chart data, no-write preservation, engine-specific structural properties, and stated limitations without pixel-parity claims.
6. Extension Host verification covers V0.2-V0.4 regression, formatting, completion, diagnostics, hover, definitions, symbols, references, code actions, imports, source locations, and unsaved-buffer behavior. Package/install a local VSIX where the environment supports it; do not publish it.
7. Sprint 034 performs a documented Lead Developer manual visual review of the desktop and representative HTML/PDF/DOCX outputs against the approved checklist. Approval or any exception must be recorded in planning artifacts.
8. Final planning records explicitly distinguish V0.5 feature acceptance from open native macOS 14+, Windows 11+, and native Ubuntu 24.04+ verification, Hutch package/native-launch reliability, project licensing/Marketplace publication, and broad Office compatibility. Do not claim these residuals pass unless directly verified.

## Decisions

- Primary audience: a mixed audience of OpenAMX authors, analysts, report recipients, and integrators. V0.5 optimizes the authoring-to-polished-deliverable workflow without adding new analytical semantics.
- V0.5's flagship outcome is a sleek, professional-grade product experience with a modern technical-IDE desktop character and a shared visual system across authoring and reports.
- Product surfaces in scope are the desktop app, generated HTML/PDF/DOCX reports, VS Code extension, CLI output, documentation, and examples.
- Desktop must-haves are native file dialogs, searchable project explorer, multi-file tabs, resizable/collapsible/focused panels, command palette and shortcuts, recent-project/session restoration, and a full editor component rather than a raw textarea.
- Report must-haves are professional typography/page hierarchy, refined presentation of existing charts, project-configurable branding, and report-level override. Supported identity fields are organization/publisher, local logo, validated accent color, author, status/classification, and footer/legal notice.
- Branding defaults live in project configuration, with controlled report-level metadata overrides. Identity asset loading stays local, offline, bounded, and containment-checked; no remote fonts, logos, stylesheets, or report assets are introduced.
- HTML, PDF, and DOCX share one identity but use format-native layouts. Pixel parity is not promised. Existing PDF/DOCX searchable/semantic guarantees remain in force only where they are already proven.
- V0.5 adds an additive metadata option to hide formatted AMX source for reader-facing reports. Existing behavior remains visible source by default unless the Sprint 028 compatibility contract records an approved alternative with migration guidance.
- The V0.4 table, bar/column, line, and scatter language/data contract is retained. V0.5 refines visual presentation and accessibility only; it adds no new chart types, bindings, or data interactions.
- Practical accessibility is a release requirement: keyboard operation, visible focus, sensible contrast, semantic output, accessible labels, and clear states. Formal WCAG conformance certification is not claimed without evidence.
- The VS Code extension remains direct-provider and Node-hosted. V0.5 adds hover, definitions, symbols, references, and code actions but does not introduce an LSP, runtime execution, data loading, or arbitrary filesystem access.
- CLI work is limited to clearer help, errors, examples, and onboarding. Interactive CLI workflows are out of scope.
- The Lead Developer signs off on manual visual review. Automated behavior and regression verification remains mandatory.
- V0.5 feature completion may be recorded while the inherited V0.4 native platform/Hutch residuals remain open as a separate release-engineering track. This does not make V0.4 or any cross-platform release claim complete.

## Further Considerations

1. Sprint 028 must choose the smallest safe project-configuration extension that does not expose private local paths, secrets, or arbitrary assets and that leaves existing `.openamx/project.json` input behavior compatible.
2. The desktop package's Hutch preparation/build/run reliability and the official native platform matrix are deliberately deferred from V0.5 feature scope. Builders may not claim a package/native platform check passed based on direct Vite/typecheck or WSL2 evidence.
3. A proven editor component may add meaningful bundle, accessibility, and integration constraints. Sprint 030 must select it through a bounded compatibility and keyboard/accessibility proof, retaining the existing typed RPC boundary.
4. Logo embedding and accent-color processing must be validated independently for HTML, PDF, and DOCX. Unsupported assets require actionable fallback behavior, not silent omission or new network access.
5. Report-source visibility is a compatibility-sensitive presentation change. The contract must preserve transparent provenance and make the reader-facing option explicit in examples and documentation.
6. Product license selection and Marketplace publication remain separate decisions. Local VSIX packaging/install may be verified when supported, but no publication is implied.

## Next Actions (Architect / Lead Developer)

- Review and approve this V0.5 master plan.
- When ready, prepare Sprint 028 by customizing the four artifacts in `planning/sprints/0000-sprint-template/` and record the active status in `planning/state.md`.
- Hand off only Sprint 028 contract work. Do not begin desktop-shell, editor, report, VS Code, or documentation implementation until identity, compatibility, accessibility, and visual-review rules are documented and accepted.
- Record scope clarifications and design decisions in `planning/decisions.md` and `planning/questions.md`. Keep platform/Hutch, licensing/Marketplace, and Office residuals visible as separate tracks.

This plan defines the proposed V0.5 product-polish roadmap based on the product discovery completed on 2026-09-30. It is a planning artifact only; no implementation work is included.
