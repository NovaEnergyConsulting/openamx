# Sprint 080 Blueprint: Interactive HTML and Desktop Preview

## Approach

1. Confirm the Sprint 079 language/model increment and open residuals from its
   evidence. Obtain explicit Sprint 080 execution authorization and approval
   of a concrete file-by-file plan. Preserve the starting worktree.
2. Define the preview adapter around the immutable `DiagramModel` and frame
   evaluator from `src/runtime/diagramModel.ts`. Reuse the approved SVG
   interactive representation and the static application-owned interpreter
   proven in Sprint 078; do not build a second AMX evaluator or compile
   authored expressions to code.
3. Implement the HTML report adapter so each model renders inline at its
   source position with stable data and independent controls. Use escaped,
   inert serialization for model/context data and static trusted runtime
   code. Preserve narrative/chart/report output and deterministic report
   behavior outside diagrams.
4. Implement playback for the declared interval and per-pass wall duration.
   Start paused at the lower bound with loop off. Add play/pause, reset,
   continuous scrubber, and loop toggle; verify exact upper-bound behavior,
   wrapping, independent diagram timelines, resize, and aspect-ratio
   preservation. Do not autoplay.
5. Add semantic figure/title/description markup and accessible control labels,
   keyboard interaction and focus behavior. Test visible contrast and browser
   accessibility semantics; record where a formal screen-reader review is
   not available.
6. Integrate with the actual desktop live-preview path, including trusted
   worker/RPC and `App.vue` iframe lifecycle as needed. Preserve
   `sandbox="allow-scripts"` without `allow-same-origin`, CSP, preview token
   freshness and stale-result behavior. If frame errors require a
   runtime-to-host message, define a narrow typed payload, associate it with
   the active frame/token, validate message source and payload, reject stale
   messages, and never trust message HTML.
7. When a selected frame fails, stop only that diagram, clear its previous
   graphic, and surface the allocated AMX diagnostic and source location.
   Test AMXD009/AMXD010/AMXD011 distinctly. Ensure a failure in one diagram
   does not leave that diagram stale or unintentionally stop unrelated
   diagrams.
8. Enforce and measure approved output/resource bounds. Test 1 MiB HTML,
   16.7 ms p95 frame work, 8 MiB incremental heap, and 2,000 whole-page DOM
   nodes with repeatable workloads and documented measurement conditions.
   Preserve the desktop 8,000,000-character fail-safe. Separately test valid
   repeated emissions from loops: authored declaration caps from Sprint 079
   do not bound emitted instance count. Do not truncate output; obtain a
   product decision if correct error behavior cannot meet resource ceilings.
9. Validate generated HTML opened as a local file with no requests and test
   the feature in the actual desktop application/package, not only the
   Sprint 042 Vite harness. Use existing Playwright UI coverage and build
   workflows; verify server readiness before UI tests when a development
   server is required. Record native UAT limitations explicitly.
10. Run focused root and desktop checks. Create `builder-evidence.md` with
    exact commands, outcomes, test counts, artifacts/screenshots, resource
    methodology, environment, first failures/retries, residuals, and any
    blocked/unavailable native or accessibility checks. Update planning
    ledgers without claiming end-to-end V0.13 acceptance.

## Candidate Files to Update

The approved file-by-file plan must be concrete before implementation. Likely
surfaces include:

- `src/renderer/renderHtml.ts` and, if required,
  `src/renderer/reportPreparation.ts`
- `src/runtime/diagramModel.ts` for safe serialization of the captured typed
  evaluation context, plus `src/renderer/diagramHtml.ts`,
  `src/renderer/diagramBrowserEntry.ts`, and generated
  `src/renderer/diagramBrowserRuntime.ts`
- `scripts/build-diagram-runtime.ts` and the root `package.json` build script
  for the Bun-built browser bundle; no dependency or lockfile change
- `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/bun/desktopService.ts`,
  `desktop-app/src/shared/rpc.ts`, and `desktop-app/src/mainview/App.vue` only
  where required for safe frame-error delivery and preview lifecycle
- Existing root renderer tests plus focused diagram HTML/playback tests
- `tests/diagram.test.ts`, new `tests/diagramHtml.test.ts`, and
  `desktop-app/src/bun/jobWorker.test.ts` for context transport and output
  bounds
- Existing desktop security, preview-freshness, and navigation UI tests;
  add focused `desktop-app/tests/ui/diagram-playback.pw.ts` if existing
  coverage does not directly exercise user-visible diagram controls/errors
- Relevant existing desktop RPC/UI test harness configuration, only if
  required to test the actual app safely
- Sprint 080 `builder-evidence.md` (create during execution)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

Do not modify the parser/type checker/formatter contract, PDF/DOCX renderers,
editor clients, example/specification files, dependency manifests, or release
files unless a separately approved plan amendment explicitly authorizes it.

## Verification

From the repository root, run focused renderer/model tests and `bun run build`.
From `desktop-app`, run `bun run typecheck`, `bun run build:web`,
`bun run test`, and focused UI tests using `bun run test:ui -- <test-file>`.
Run or build the actual desktop package for direct preview acceptance where
the host permits. Record exact command results; a component/Vite harness or
RPC assertion alone is not native desktop acceptance.

Verify the generated standalone HTML through `file://`, capture outbound
requests, inspect the rendered SVG/DOM and report controls, and inspect desktop
preview behavior with the actual sandbox attribute and active token.

## Notes

The 078 probe approved SVG-in-DOM for interactive output and demonstrated an
application-owned runtime with inert typed data, but did not implement the
production report or desktop-preview pipelines. The 079 implementation added
the shared runtime model and preserved authored-source caps across imports
and nested execution. Sprint 080 must integrate those results without
replacing their semantics or overstating earlier probe evidence.

The Lead Developer approved a narrow build-plan amendment on 2026-10-13:
generate the static browser bundle with Bun and embed it as an application-owned
TypeScript string module so standalone HTML and the packaged desktop worker use
it without runtime file lookup. The Lead Developer also approved fail-fast
rejection of diagram-enabled HTML above 1 MiB through the existing desktop job
error path; this does not authorize an emitted-instance cap or truncation.
