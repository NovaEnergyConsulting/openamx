# Sprint 035 Requirements: V0.6 Product/UX Contract and Feasibility

## Goal

Ratify the V0.6 product/UX contract and produce the bounded design, architecture, performance, and host-feasibility evidence required before production work begins. This sprint establishes decisions and reviewable prototypes; it does not implement V0.6 product behavior.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 035
- `planning/openamxV06ProductUXContract.md`
- V0.2-V0.5 language, data, report, export, CLI, desktop, and VS Code contracts
- Current desktop RPC/main-process boundaries, `src/runtime/moduleLoader.ts`, input/output services, VS Code analysis providers, and existing tests
- `planning/v06-design-inputs/` when present; each reference must receive an adopt/reject/adapt disposition
- Current host/toolchain constraints and prior V0.5 residuals in `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

## In Scope

- Ratify the V0.6 contract as authoritative for desktop UX while preserving V0.2-V0.5 compatibility and recording any approved amendments.
- Add a compatibility matrix, screen/state inventory, user-flow diagrams, state diagrams, native File/Edit/View/Help menu map, command/shortcut map, and visual tokens.
- Define explicit empty, loading, running, paused, stale, error, success, conflict, recovery, and cancellation behavior for the contract screens.
- Produce reviewable low-fidelity frames for welcome, AMX workbench, data editor, Inputs, report settings, Export, runtime drawer, conflict/recovery, and trash at 1024x720 and a larger desktop viewport in light and dark themes.
- Review and disposition all available design references under `planning/v06-design-inputs/`.
- Prove a bounded contained source-overlay API for `loadEntryModule` with unsaved imported modules, saved-file fallback, import containment, and unchanged CLI behavior.
- Compare cooperative abort hooks with safely terminable Bun workers for preview/run, input validation, and report preparation; measure termination, cleanup, bounded messaging, path redaction, stale-job handling, and final-write authority.
- Prove available Electrobun/native APIs for menus, Open, Reveal, save selection, focus restoration, and window lifecycle without webview filesystem authority.
- Extract and compare a VS Code-independent editor-analysis proof for symbols, ranges, completion, and diagnostics; compare maintained CodeMirror AMX-highlighting approaches without a second parser.
- Compare maintained Vue-compatible virtual-grid and JSON tree/editor candidates against the documented data scale, keyboard behavior, raw/structured synchronization, bundle/memory impact, licensing, and Bun/Vite compatibility.
- Establish the Vue component/browser test and screenshot harness, including theme, viewport, keyboard/focus, and populated workbench coverage.
- Measure the available host and propose final performance budgets against the contract's initial targets.
- Record exact commands, tool versions, artifacts, limitations, decisions, and residuals.

## Out of Scope

- Production V0.6 workbench, project lifecycle, editor intelligence, data editor, settings, preview, export, onboarding, or recovery implementation.
- New AMX syntax or semantic behavior, CLI behavior changes, report semantics, or VS Code feature changes.
- Dependency installation or framework adoption without a bounded proof and explicit decision.
- Native packaging/release certification, Hutch reliability, Marketplace/license work, broad Office certification, formal accessibility certification, telemetry, cloud, or remote assets.
- Treating browser shims, static mockups, WSL2, or source inspection as proof of unavailable native behavior.

## Constraints

- The product/UX contract and existing V0.2-V0.5 contracts remain the source of truth; prototypes cannot silently redefine behavior.
- Keep Bun/main-process and trusted-worker authority boundaries intact. Webview payloads are typed, bounded, redacted, and sandboxed.
- All feasibility probes must be isolated, reproducible, and removable or clearly marked as spikes. Do not alter production behavior while proving an approach.
- No private paths, source text, input contents, credentials, or generated review artifacts may enter committed documentation or shared project configuration.
- A failed proof blocks the dependent sprint and must include evidence, impact, and viable options for the Lead Developer.
- Performance budgets are host-relative evidence, not native platform or release-readiness claims.
