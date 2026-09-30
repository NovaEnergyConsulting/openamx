# Sprint 028 Requirements: V0.5 Product, UX, Branding, and Compatibility Contract

## Goal

Establish the authoritative, reviewable V0.5 product/report contract before any V0.5 implementation. Specify shared identity, presentation, accessibility, authoring, and compatibility rules precisely enough for Sprints 029-034 to implement without independently inventing behavior. Deliver a Lead Developer visual-review checklist and representative fixture definitions; obtain explicit contract approval before dependent implementation.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 028 scope and decisions
- `docs/language-spec-v0.2.md`, `docs/language-spec-v0.3.md`, `docs/language-spec-v0.4.md` (historical compatibility contracts)
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 024-027 acceptance/results
- Existing `.openamx/project.json` version-1 input configuration, CLI/renderer/export paths, desktop typed RPC and editor workflow, VS Code direct providers, and representative examples

## In Scope

- Write `docs/language-spec-v0.5.md` as the authoritative additive product/report contract, or a clearly linked V0.5 product/report contract if a language-spec file is not warranted. Do not rewrite historical specifications.
- Specify the shared visual system: tokens (including typography, spacing, surfaces, accent and contrast), icon/command conventions, report hierarchy, focus/keyboard rules, loading/empty/error/success states, responsive desktop panels, and a practical accessibility baseline with testable examples.
- Define an additive versioned project report-identity configuration that preserves version-1 input behavior, plus controlled report-level metadata overrides. Cover exact field names/types and source locations for organization/publisher, local logo, accent, author, status/classification, footer/legal notice, and source visibility; precedence, defaults, validation, diagnostics, unavailable-asset behavior, and migration examples must be explicit. Do not put private local paths or secrets in shared project configuration.
- Specify logo safety for CLI and desktop: permitted local formats, byte/dimension/path bounds, canonical project containment, symlink and missing-file policy, embedding for HTML/PDF/DOCX, offline behavior, and export failure or fallback diagnostics. Specify accessible logo alternatives and contrast guardrails for accent use.
- Specify formatted AMX source visibility as additive report metadata, with visible source as the V0.4-compatible default unless a separately approved exception with migration guidance is recorded. Define equivalent reader-facing intent in HTML, PDF, and DOCX without promising pixel parity.
- Define the desktop information architecture and state/authority contract: native main-process dialogs, project explorer/search/ignore rules, multi-file tabs and entry designation, dirty/conflict/reload/unsaved safeguards, recent/session privacy, panel resize/collapse/focus modes, palette/shortcuts, current-buffer operations, and safe typed RPC ownership.
- Define editor and diagnostics minimums, a proven editor selection/compatibility proof to perform in Sprint 030, formatting/selection, completion/static analysis, source navigation, run/preview/export state and stale-response rules, plus keyboard/screen-reader expectations.
- Define the direct Node-host VS Code scope for hover, definitions, symbols, references, and safe code actions using pure parse/check/link facts and original UTF-16 positions; define unsupported cases and unsaved-buffer/import handling. No LSP, evaluation, or CLI data loads.
- Define CLI help/errors/examples/onboarding goals and honest release-status wording. Produce a Lead Developer desktop/HTML/PDF/DOCX manual visual-review checklist with representative source/data/identity/override/asset fixtures, review steps, pass/exception recording, and clear ownership of the Sprint 034 sign-off.
- Update planning state, decisions, and questions with contract choices, unresolved approvals, and later-sprint handoff boundaries.

## Out of Scope

- Production UI, language/parser/runtime, configuration loader, report renderer, export, VS Code provider, or CLI changes; this sprint authors contract and review artifacts only.
- Changing V0.2-V0.4 language/data/visualization/export semantics, adding chart kinds or bindings, network assets, interactive CLI flows, browser-print export fallbacks, or claiming identical HTML/PDF/DOCX layout.
- Closing V0.4 native macOS/Windows/native Ubuntu and Hutch package/launch residuals, broad Office compatibility, project license selection, or Marketplace publication.

## Constraints

- Use exact testable rules and examples, not aspirational descriptions. Mark any unresolved policy as a question blocking the dependent implementation slice; do not let Builders decide it ad hoc.
- Keep all filesystem, module/input loading, evaluation, dialogs, and export privileges in the desktop main process behind bounded typed RPC. Preserve current-buffer analysis and existing containment, conflict-safe save, and no-write export guarantees.
- Use one evaluated report identity/content ordering boundary for HTML/PDF/DOCX; no adapter rereads modules/inputs or reevaluates AMX. Preserve V0.4 visible-source output by default and the existing table/chart interaction, snapshot, order, print, and accessible data contracts.
- Manual review supplements automated regression checks; distinguish V0.5 feature acceptance from separate release-engineering gates. Sprint 029 and Sprint 033 may proceed in parallel only after this contract is accepted.
