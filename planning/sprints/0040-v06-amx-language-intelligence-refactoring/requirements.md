# Sprint 040 Requirements: AMX Language Intelligence and Refactoring

## Goal

Deliver IDE-grade AMX assistance in the desktop editor through shared parser/checker/module facts: exact executable-fence highlighting, source-order/import-aware completion, diagnostics, navigation, hover, references, safe rename, and deterministic code actions. Preserve existing VS Code behavior and use the same contained unsaved-module overlay model as preview without evaluating AMX or loading input values for static assistance.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 040
- `planning/openamxV06ProductUXContract.md`
- Sprint 035 editor-analysis evidence, Sprint 036 active-document/overlay/job evidence, Sprint 037 shell/editor boundary, Sprint 039 settings/job-revision evidence
- `vscode-extension/src/providers/moduleAnalysis.ts`, `completion.ts`, `diagnostics.ts`, `navigation.ts`, `codeActions.ts`, `symbolRanges.ts`, existing extension tests and host configuration
- `src/parser/`, `src/ast/`, `src/typechecker/`, `src/runtime/moduleLoader.ts`, formatter and source-location utilities
- `desktop-app/src/mainview/CodeEditor.vue`, editor RPC contracts, current shell components, and focused desktop tests
- Existing V0.2-V0.5 formatting, source-location, CRLF/non-BMP, CLI, and VS Code compatibility tests

## In Scope

- Extract VS Code-independent editor/module analysis, symbol identity, occurrences, source ranges, completion facts, diagnostics, navigation, and deterministic action facts into a shared pure `src/editor/` boundary or nearest established equivalent.
- Adapt existing VS Code providers to the shared facts without changing their external behavior, host lifecycle, location encoding, or safety limitations. Keep Extension Development Host regressions green.
- Add exact AMX token highlighting to CodeMirror only inside executable `amx` fences. Markdown narrative and ordinary fences remain inert; no second parser or independent semantic grammar.
- Add source-order/import-aware completion for keywords, types, functions, bindings, fields, inputs, and views using current document/module facts and unsaved reachable buffers.
- Add inline parser, checker, and module-link diagnostics with source-linked locations, bounded/redacted messages, and stale revision/job protection.
- Add hover, go-to-definition, exact symbol references, document symbols where facts are proven, safe rename across the contained reachable graph, and deterministic diagnostic-grounded code actions.
- Analyze all relevant open unsaved AMX buffers through Sprint 036's contained overlay. Static assistance never evaluates AMX or reads CSV/JSON input values.
- Preserve canonical fence-only formatting with undo, selection/nearest safe mapped position, scroll, tab state, original UTF-16 locations, CRLF, and non-BMP characters.
- Preflight rename and multi-file actions against symbol identity, containment, every affected document/disk revision, and conflicts; apply all edits atomically or none. Withhold ambiguous, cyclic, unresolved, stale, or unlocated actions.
- Add focused CodeMirror/component/service tests, shared editor tests, provider host regressions, and evidence for performance/bundle impacts and unsupported facts.

## Out of Scope

- New AMX syntax, type rules, evaluator behavior, CLI language behavior, or report/data semantics.
- Structured CSV/JSON editing, schema/data inspector UI, or the selected virtual grid/tree; Sprint 041 owns it.
- Final live preview/runtime drawer/export workflow, native save behavior, or project lifecycle/autosave/recovery.
- LSP server/process, network services, telemetry, arbitrary filesystem indexing, evaluator/input loading for completion or diagnostics, or a second parser/grammar.
- Formal WCAG, native platform release, Hutch, Office, licensing/Marketplace certification.

## Constraints

- Existing parser/checker/source locations remain authoritative. Shared editor facts must derive from them and preserve original UTF-16 coordinates; do not reconstruct semantics from ad hoc text matching.
- Static analysis uses a bounded contained reachable graph and open-buffer overlay. Reject or withhold results for outside-root, symlink, cyclic, ambiguous, unresolved, or unlocated facts.
- Desktop and VS Code adapters consume shared facts but retain host-specific lifecycle/range types. No desktop copy of VS Code provider logic and no VS Code regression may be accepted as collateral.
- CodeMirror highlighting must activate only for exact executable fences and must leave narrative/ordinary fenced code inert. Incomplete-source behavior must be explicit and tested.
- Rename/code actions must be deterministic, revision-checked, conflict-aware, non-automatic where host APIs cannot guarantee apply-time safety, and all-or-nothing across affected files.
- Never expose source text, private paths, input contents, evaluator results, or unrestricted filesystem access in webview/RPC payloads. Redact diagnostics and bound analysis work.
- If parser spans cannot prove identity/location, return no result rather than guessing. Record unsupported scope facts as limitations, not passes.
