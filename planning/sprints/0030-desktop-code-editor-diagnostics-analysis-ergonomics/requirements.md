# Sprint 030 Requirements: Desktop Code Editor, Diagnostics, and Analysis Ergonomics

## Goal

Replace the desktop textarea with a proven accessible code editor and deliver source-aware, current-buffer analysis and reliable run/preview/export feedback on the Sprint 029 tab/workbench boundary. Preserve V0.2-V0.4 language semantics and main-process authority.

## Entry Gate

- Sprint 028's V0.5 contract is approved, but Sprint 029 is recorded as **OPEN** despite approval of its delivered changes. Its native create-new save picker and native close/quit verification remain unresolved in `planning/state.md` and `planning/questions.md`. These artifacts may be reviewed now; they do not mark Sprint 029 accepted or authorize full Sprint 030 implementation until the Lead Developer records Sprint 029 acceptance or an explicit dependency disposition. A bounded editor-component feasibility proof may be planned, but do not silently inherit a broken project/export/quit workflow.

## Inputs

- `planning/plan-openamxV05MasterSprintPlan.md`, Sprint 030, and approved `docs/language-spec-v0.5.md`, especially sections 4-5
- `planning/sprints/0028-v05-product-ux-branding-compatibility-contract/visual-review.md`, Sprint 029 requirements/acceptance and recorded Builder outcome/residuals
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`, `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/desktopWorkflow.ts`, `desktop-app/tests/rpc-contract-check.ts`
- Shared `src/parser/`, `src/typechecker/`, `src/formatter/`, and local-module analysis/loader APIs; existing desktop/direct tests and existing VS Code provider analysis patterns where reusable

## In Scope

- Prove and select one maintained editor component for the isolated Electrobun/Bun/Vue app before integrating it. Record package/license, bundle size, keyboard/focus, IME composition, multi-line selection/undo, screen-reader labeling/navigation, reduced motion, 200% zoom, large-file behavior and direct/native-host compatibility. A failed proof blocks selection for Lead Developer review; no hand-rolled AMX grammar/editor engine.
- Replace the textarea with syntax highlighting for exact executable `amx` fences, line numbers, bracket pairing, find/replace, undo/redo, accessible editor controls, scroll/resize resilience and keyboard editing without treating narrative or ordinary fences as executable. Preserve per-tab text/selection/scroll and existing bounded typed update flow.
- Integrate canonical formatting of executable fences only, with selection/cursor mapping or nearest safe boundary restoration, stable scroll and undo. Reuse pure parser/checker/local link facts for source-order completions and static diagnostics, including imports; never evaluate AMX or read CSV/JSON just to provide editor assistance.
- Present static diagnostics by severity/code/file/original one-based UTF-16 line/column and state. Navigating opens/selects the correct contained tab and source range without replacing unsaved text. Distinguish parser/checker/link errors from runtime/input validation errors; clear or refresh diagnostics for changed tabs/revisions and unsupported/unresolved facts without fabricated completions.
- Improve current entry-buffer run, preview, input-configuration, bounded result summary and HTML/PDF/DOCX export feedback with explicit idle/running/success/failure, revision/entry identification, no stale success or preview after edit/input/project change or failed/superseded request, and accessible announcements. Keep private input paths redacted and existing destination/no-write guarantees.
- Add focused desktop editor/UI/RPC tests for unsaved multi-tab source analysis, selection-safe formatting, navigation, local imports, diagnostic lifecycle, keyboard/IME/accessibility baseline, run/preview/export transition ordering, invalid inputs and preserved no-write behavior. Record actual direct/native verification and outstanding limitations.

## Out of Scope

- Resolving Sprint 029's native save picker/close-quit blocker as an unrecorded side effect; Sprint 029 must receive its own acceptance evidence/disposition. No weakening the native-dialog or unsaved-confirmation contract to make editor work pass.
- Report identity/branding and HTML/PDF/DOCX redesign (Sprints 031-032), VS Code provider additions (Sprint 033), final CLI/docs/examples/manual visual sign-off (Sprint 034), new AMX grammar/chart/input semantics, LSP or data-dependent editor analysis.
- Granting webview filesystem/module/input/evaluator/export/dialog authority, new remote dependencies/assets or unverified native release/Office/license/Marketplace claims.

## Constraints

- Active tab controls editing/formatting/diagnostics; designated entry tab's unsaved buffer controls run/preview/export. Dirty dependency modules must be saved first; analysis must remain static and source-located. Preserve per-tab revision and project generation safeguards from Sprint 029.
- Editor content, UI diagnostic payloads, results and preview remain bounded; only the Bun main process touches files, loader, inputs, evaluation, report adapters or destinations. A failed/superseded export must never appear as current success even if a main-process operation cannot be cancelled.
- Follow the approved visual/accessibility rules at 1280x720 and 800x600, 200% zoom and reduced motion, with keyboard focus and readable labels. Record test/host evidence honestly: direct WSL2 checks do not prove native macOS/Windows/Ubuntu or Hutch package acceptance.
