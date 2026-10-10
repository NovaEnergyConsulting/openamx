# Sprint 070 Handoff Prompt

You are the Builder for OpenAMX Sprint 070: V0.11 HTML Alignment and Controlled Preview Links.

## Read First

- Applicable repository instructions and current worktree status; preserve existing user changes and untracked artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV11MasterSprintPlan.md` and all four Sprint 070 artifacts.
- Sprint 065 navigation protocol/disposition; Sprint 066 accepted shared model and local allowlist; Sprint 067/068 HTML/link-related behavior and known residuals; Sprint 069 accepted implementation/disposition and chart-only residuals.
- `src/renderer/narrativeModel.ts`, `src/renderer/reportPreparation.ts`, `src/renderer/renderHtml.ts`, CLI HTML output, the desktop worker/service/RPC flow, and existing preview/security tests.
- Preserve `sandbox="allow-scripts"` without `allow-same-origin`.

## Authority and Scope

The V0.11 master plan defines product scope. Sprint 070 depends on Sprint 066 and owns HTML alignment plus controlled desktop-preview navigation. Standalone HTML links are validated output links; desktop preview uses opaque IDs and a dedicated trusted host action. Preserve chart behavior, report order/emissions, and the existing preview lifecycle.

The user selected a dedicated host navigation action: it accepts an opaque target ID, resolves and revalidates the host-held target, confirms with the user, and only then opens it. This is design direction, not implementation authorization. Before source/test edits, obtain explicit Sprint 070 authorization and approval of the concrete file-by-file plan, including the message schema, identity/token lifecycle, confirmation UI, and native action details. If either gate is absent, stop before those edits.

## Mandatory Boundaries

- Consume the prepared shared narrative AST. Do not duplicate Markdown parsing or change shared model behavior.
- Standalone HTML local links are relative to the validated final output path; preview links use opaque target IDs and never carry raw URLs/paths into the iframe.
- Use only HTTP/HTTPS external targets and accepted local types `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, and `.json`. Revalidate local paths on the host at activation, including decoded traversal, canonical containment, symlink components, regular-file status, and allowed type.
- Internal fragments remain in the document. External/local preview actions require a genuine user activation, current iframe/document revision, host mapping/revalidation, and trusted confirmation. Cancel must perform no native action.
- Do not reuse a generic raw-path `openPath` RPC as the preview API. The selected dedicated action receives only an opaque ID and current identity; raw target data remains in the trusted host map.
- Preserve CSP, `sandbox="allow-scripts"` without `allow-same-origin`, existing chart interactions/freshness, and all output caps. Never add remote images, automatic navigation, `mailto:`, arbitrary bridge access, or raw HTML activation.
- Do not change charts or repair inherited root/desktop failures except when a Sprint 070 change demonstrably causes them. Do not resolve Sprint 067/069 evidence residuals in this sprint.

## Task Contract

- **objective:** Align standalone HTML and desktop preview with the shared narrative model, and implement a narrow confirmed host navigation path for safe preview links.
- **owns:** HTML rendering and final standalone output context; narrowly required desktop preview renderer/worker/service/RPC/UI/host action; focused renderer, host, and Playwright tests; planning ledgers; and this sprint's `builder-evidence.md`, as listed in `blueprint.md`.
- **must_not:** Expose raw targets to the iframe, relax CSP/sandbox, bypass confirmation, broaden schemes/file types, change charts or shared semantics, use generic raw-path RPC, repair unrelated inherited failures, or implement before both approval gates pass.
- **acceptance:** Meet `acceptance.md`, including final-output-relative standalone links, opaque ID-only preview messages, current frame/revision checks, host revalidation and confirmation, fail-closed hostile tests, offline images, and unchanged chart/preview behavior.
- **verification:** Run `bun test tests\renderer.test.ts tests\reportPresentation.test.ts`, `bun run build`, and `bun test`. From `desktop-app`, run `bun test src\bun\desktopPreviewNavigation.test.ts`, `bun run typecheck`, `bun run build:web`, `bun run test`, and `bun run test:ui -- tests/ui/preview-navigation.pw.ts tests/ui/html-chart-security.pw.ts tests/ui/preview-freshness.pw.ts`. Record inherited root/desktop failures separately and do not report them as passes.

## Execution and Evidence

Test standalone export and desktop preview as distinct modes. Test renderer output, host RPC validation, and actual iframe/browser behavior separately. Cover permitted user clicks, confirmation cancellation, forged/stale/synthetic requests, unsafe schemes/paths, internal anchors, remote-resource attempts, and offline image rendering. Record exact test counts, browser/desktop environment, dialog outcomes, and residual owners. Preserve untracked files and pre-existing artifacts. Update the planning ledgers and Sprint 070 `builder-evidence.md`; request a separate Lead Developer disposition. Sprint 070 completion does not authorize Sprint 071, V0.11 completion, release, or publication.
