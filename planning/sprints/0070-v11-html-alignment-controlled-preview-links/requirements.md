# Sprint 070 Requirements: HTML Alignment and Controlled Preview Links

## Goal

Align standalone HTML and the desktop live preview with the Sprint 066 shared narrative model for images, visible prose breaks, and approved links. Keep standalone HTML offline and give the desktop preview only a narrow, user-confirmed host navigation path for safe external and local links.

## Entry Gate

- The V0.11 master plan defines Sprint 070's scope and formal dependency on Sprint 066, which is ACCEPTED / CLOSED. Sprints 067-069 are also closed in the current repository; their dispositions do not authorize Sprint 070.
- The opaque-target / active-frame-revision / host-revalidation / confirmation protocol is approved as design direction only. The user selected a dedicated host navigation action that accepts opaque target IDs, resolves and revalidates the mapped target, confirms with the user, and only then opens it. This choice does not authorize source changes.
- Obtain explicit Sprint 070 implementation authorization and approval of the Builder's concrete file-by-file code plan before source or test edits. The plan must specify the typed message schema, target-map ownership/lifetime, trusted click verification, host confirmation presentation, allowed native action, and cancel behavior.
- Preserve the existing preview iframe isolation: `sandbox="allow-scripts"` without `allow-same-origin`. Do not enable raw host paths, direct bridge access, or general RPC/file-opening capabilities in the iframe.
- Keep the accepted local target allowlist `.pdf`, `.png`, `.jpg`, `.jpeg`, `.txt`, `.csv`, and `.json`. Only HTTP/HTTPS external links are allowed; no `mailto:`, executable targets, remote images, or other schemes.
- Sprint 069 is ACCEPTED / CLOSED WITH RECORDED RESIDUALS. Its chart behavior is out of scope; the Word Web numeric-X null-gap visual capture and formal screen-reader review remain residuals for closeout. Sprint 067's PDF visual/viewer evidence gap and the inherited root/desktop test failures remain recorded. Do not repair or claim these unrelated checks in Sprint 070.

## Inputs

- `planning/plan-openamxV11MasterSprintPlan.md` (scope and compatibility authority)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 065 desktop navigation protocol proposal and Lead Developer disposition
- Sprint 066 accepted shared Markdown/assets/link model and target allowlist
- Sprint 067 PDF and Sprint 068 DOCX final-output-relative link behavior as adapter references only
- Sprint 069 chart implementation/evidence and recorded residuals; chart behavior is not Sprint 070 scope
- `src/renderer/narrativeModel.ts`, `src/renderer/reportPreparation.ts`, and `src/renderer/renderHtml.ts`
- `src/cli.ts` standalone HTML destination flow
- `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/bun/index.ts`, `desktop-app/src/shared/rpc.ts`, and `desktop-app/src/mainview/App.vue`
- `tests/renderer.test.ts`, `tests/reportPresentation.test.ts`, and desktop preview/security/contract tests

## In Scope

- Render prepared narrative AST nodes in the standalone HTML and desktop preview paths rather than reparsing narrative text as a second Markdown implementation.
- Align headings 1-6, paragraphs, nested emphasis, inline/fenced code, lists, blockquotes, Markdown tables, rules, explicit line breaks, and the exact page-break directive with the shared model. Preserve raw HTML as inert literal text and interpolation as text only.
- Embed only shared-model-sanitized local PNG/JPEG data in standalone HTML and desktop preview. Preserve alt text and proportional image sizing; never fetch remote images or reread author paths.
- Make valid HTTP/HTTPS, internal-fragment, and relative local-file links active in standalone HTML. Resolve local links relative to the actual final HTML output directory, not an atomic temporary path. Preserve URI encoding and the accepted local extension allowlist; do not copy companion files.
- Implement controlled desktop-preview navigation:
  - Embed only opaque, per-preview target IDs in external/local link elements. Do not put raw URLs or local paths in the preview DOM, iframe messages, or renderer-facing RPC.
  - Keep a private target map in the trusted host/service, bound to the active document, preview/frame identity, and revision. Discard or invalidate it when the preview is replaced, the document/project changes, or its source revision becomes stale.
  - Permit only a genuine user-initiated activation of a generated approved link. Internal fragment links remain inside the preview and do not invoke host navigation.
  - Forward only a narrow typed request containing the opaque ID and required current preview/document identity to the dedicated host navigation action selected for this sprint.
  - Resolve the ID on the host, revalidate external scheme or canonical local path, containment, symlink status, current document/revision, and file extension, then show trusted host-owned confirmation. Only after confirmation may the host open the validated HTTP/HTTPS target or allowed local file. Cancellation performs no open action.
- Reject malformed, unknown, forged, replayed, stale, wrong-frame, synthetic, unbound, or authored raw-URL/path navigation attempts. Do not treat a message from the sandboxed frame as authority to open its supplied destination.
- Preserve report identity/order, emitted table values, chart models/interactions, current preview freshness/pause behavior, diagnostics, output limits, CSP restrictions, and existing host destination validation.
- Extend focused renderer and desktop tests for both safe standalone output and hostile/stale preview navigation. Record exact verification and any residuals.

## Out of Scope

- AMX syntax/evaluation, shared narrative-model semantics, chart rendering or chart-model changes, PDF/DOCX adapters, Word chart behavior, or V0.11 integrated closeout.
- General desktop navigation, arbitrary file opening, new native bridge capabilities, direct filesystem/RPC access from authored HTML, iframe `allow-same-origin`, or any relaxation of CSP/sandbox.
- Remote images, unsupported schemes, `mailto:`, executable local targets, automatic companion copying/bundling, new author styles/settings, new dependencies/lockfiles, worker/output-cap changes, or broad preview UX redesign.
- Fixing Sprint 067/068 inherited root editor/help failures or the desktop RPC sandbox-count residual unless a Sprint 070 change demonstrably causes a regression.
- Resolving Sprint 069's Word Web null-gap screenshot or formal screen-reader residual, Sprint 067's PDF visual review, release/publication, or platform certification.

## Constraints

- Use the validated shared narrative model. Do not grant authored content direct access to URLs, paths, parent context, host bridge, or privileged actions.
- Standalone HTML and desktop preview may share safe rendering helpers but must have distinct navigation modes: ordinary validated links for standalone output; opaque-ID requests and host confirmation for the preview.
- For standalone local links, calculate the emitted URI from source-relative validated target to the actual final `.html` output directory. For preview, the frame carries only an opaque identifier and navigates only after host approval.
- The navigation action selected for this sprint is dedicated and target-ID based; do not reuse a generic raw-path `openPath` RPC as the preview API. Any final action must be host-side, narrowly allowlisted, confirmed, and covered by tests.
- Preserve `sandbox="allow-scripts"` without `allow-same-origin`; retain restrictive CSP, no remote resource fetching, and existing chart scripts/interactions.
- Test real service/RPC target mapping and browser/frame hostile cases separately. A mocked UI test alone is not proof of host-side revalidation; an IPC test alone is not proof of iframe behavior.
- Record the Sprint 067/068 inherited test residuals accurately and distinguish them from Sprint 070 regressions. Do not weaken or rewrite unrelated assertions to claim a green suite.
- Do not overwrite pre-existing outputs or the supplied examples. Keep generated files in disposable test directories and clean only artifacts created by this sprint.
