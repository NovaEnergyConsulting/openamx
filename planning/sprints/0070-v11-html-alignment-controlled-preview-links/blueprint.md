# Sprint 070 Blueprint: HTML Alignment and Controlled Preview Links

## Approach

1. Reconfirm the Sprint 065 protocol direction, Sprint 066 accepted model/allowlist, current preview freshness behavior, Sprint 069/068 residuals, and the user's selection of a dedicated opaque-target host navigation action. Obtain explicit Sprint 070 authorization and approval of the complete file-by-file code plan before source/test edits.
2. Use `PreparedReportItem.markdown` as the narrative source for standalone HTML and desktop preview/export output. Share a typed AST-to-HTML renderer for headings, inline/block formatting, tables, line breaks, code, rules, page breaks, images, and anchors. Do not parse interpolated text or emitted data as Markdown/HTML.
3. Keep two explicit rendering modes:
   - Standalone HTML export emits safe HTTP/HTTPS and internal anchors plus local links relative to the validated final HTML output directory.
   - Desktop preview emits internal anchors normally but renders external/local navigation targets as opaque IDs only; raw target URLs/paths are never embedded in the iframe.
4. Use sanitized PNG/JPEG data from the shared model only. Preserve alt text and fit within the document width without upscaling. Restrict CSP images to `data:`; no remote images, styles, script, or navigation are activated from raw authored HTML.
5. During preparation, enumerate permitted external and local targets into a per-preview map owned by the trusted worker/service. The preview renderer receives only IDs. Return the map over the worker boundary to the trusted service, store it against the exact active document and preview revision/job/frame token, and never return raw map entries to the webview RPC response.
6. Add a dedicated RPC/host action accepting a typed opaque target ID and active identity only. A trusted parent listener verifies the source is the current sandboxed iframe and forwards only a valid activation request. The preview's trusted generated handler accepts only real user activation; internal fragment links do not dispatch RPC. Synthetic clicks, raw `postMessage`, unknown IDs, and stale request identities fail closed.
7. On every host request, resolve the ID from the current private map, compare the active document/project/revision and preview token, then revalidate the target. External targets are HTTP/HTTPS only. Local targets are decoded and canonicalized relative to the document/root, checked for containment, symlink components, regular-file existence and the accepted extension allowlist. Show host-owned confirmation with a safe, understandable target description and explicit cancel; cancellation does not invoke the native opener. Only the dedicated action may call the approved native open function.
8. Define token creation, expiry/invalidation, message fields, and confirmation copy in the implementation plan. Keep identifiers opaque and per preview, bind them to current source revisions and frame identity, and ensure no raw URL/path travels in the iframe request or public preview RPC. Ask the Lead Developer for direction if the implementation needs to relax any of these invariants.
9. Keep static HTML link URI generation separate from preview dispatch. Pass the CLI's final output path and the host-validated desktop HTML destination to the standalone renderer; never use atomic temporary paths. For live preview, do not derive links from a filesystem output location.
10. Preserve chart markup/runtime, chart interactions and source/view order. Maintain `sandbox="allow-scripts"` without same-origin access and existing restrictive CSP. Raw HTML remains inert and rejected schemes remain noninteractive.
11. Add root tests for shared-node rendering, images, LF/CRLF, breaks, raw HTML, interpolation and final-output-relative links. Add a desktop service test for valid/cancelled/stale/invalid/forged target IDs and host revalidation. Add Playwright hostile-preview tests for trusted clicks, synthetic clicks, forged messages, navigation/network attempts, stale frames/revisions, internal links, and iframe isolation.
12. Run focused tests first, then root build/full tests, desktop typecheck/build and RPC/UI tests. Compare the known editor/help and sandbox-count failures with Sprint 068/069 evidence; report unchanged failures as residuals and do not repair them. Update planning ledgers and Sprint 070 builder evidence with exact outcomes and owners.

## Files to Update

- `src/renderer/renderHtml.ts`
- `src/cli.ts` only as needed to pass the validated final standalone HTML output path
- `desktop-app/src/bun/jobProtocol.ts`, `desktop-app/src/bun/jobWorker.ts`, `desktop-app/src/bun/desktopService.ts`, and `desktop-app/src/bun/index.ts`
- `desktop-app/src/shared/rpc.ts` and `desktop-app/src/mainview/App.vue`
- `tests/renderer.test.ts`, `tests/reportPresentation.test.ts`, and other narrowly relevant existing HTML tests
- `desktop-app/src/bun/desktopPreviewNavigation.test.ts` or the closest host-side test surface
- `desktop-app/tests/ui/preview-navigation.pw.ts` plus narrowly scoped updates to existing preview/security tests
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`
- Sprint 070 `builder-evidence.md` after implementation and verification

No shared narrative-model semantics, chart model/rendering, PDF/DOCX adapter, language syntax, dependency/lockfile, worker cap, or unrelated file changes are in scope.

## Risks and Stop Conditions

- If raw target URLs or paths must be exposed to the iframe, preview RPC, or untrusted messages to make navigation work, stop and redesign within the approved opaque-ID boundary.
- If the host cannot bind a request to the active preview frame/document revision and private target map, reject navigation; do not fall back to trusting a renderer-supplied destination.
- If a local path is stale, outside its allowed canonical root, traverses a symlink, has an unsupported type/extension, or changed after preparation, reject it and surface a clear host diagnostic.
- If a genuine user gesture cannot be distinguished from a synthetic event, keep that target noninteractive and request a design decision rather than weakening the gate.
- If the dedicated confirmation/action cannot be implemented without broadening native RPC capability, stop and request Lead Developer direction.
- Any CSP relaxation, `allow-same-origin`, automatic navigation, remote asset fetch, direct bridge exposure, stale-frame authorization, or change to chart behavior is a security/scope regression.
- If raw HTML, interpolation, emitted data, or hostile chart/narrative strings become active markup/script, stop and repair before acceptance.

## Evidence Boundaries

- Renderer/unit tests prove safe output construction, not actual desktop host authorization.
- Service/RPC tests prove host mapping/revalidation against the test service, not actual iframe gesture provenance.
- Playwright tests prove only the tested browser frame and harness. Record browser and harness environment.
- Desktop application/manual confirmation evidence proves only the tested host/application flow. Do not claim broad OS certification.
