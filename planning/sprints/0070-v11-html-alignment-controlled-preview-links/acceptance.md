# Sprint 070 Acceptance Criteria

Sprint 070 is complete only after standalone HTML and desktop preview behavior, host-side navigation security, and hostile-content tests pass and a separate Lead Developer disposition accepts the evidence. It does not imply V0.11 completion, release, or publication.

## HTML Narrative Alignment

- Standalone HTML export and desktop preview render from the shared narrative model with consistent supported headings, paragraphs, emphasis, inline/fenced code, lists, blockquotes, tables, rules, explicit breaks, and page breaks.
- LF and CRLF inputs render equivalently. Authored prose breaks remain visible; blank lines remain paragraph boundaries; code tabs/spaces/line breaks remain preserved.
- Raw HTML stays literal/inert. Interpolated values and captured source/view data are text and never become Markdown, HTML, script, or attributes.
- Shared heading IDs are emitted as stable document anchors. Valid internal links navigate within the current document without invoking host navigation; invalid fragments are not active links.
- Sanitized PNG/JPEG narrative images render offline, preserve alt text, scale proportionally without upscaling, and do not trigger remote requests. CSP still permits only data images and required existing nonce scripts/styles.
- Existing report identity/order, emitted tables, chart graphics/data/interactions, preview freshness, pause/resume behavior, diagnostics, and output limits remain unchanged.

## Standalone HTML Links

- Valid HTTP/HTTPS and internal links are usable through an explicit user click; rejected schemes and invalid targets are inert.
- Local links are relative to the validated final `.html` output directory, use the accepted Sprint 066 local-file allowlist, preserve URI encoding, and contain no machine-specific absolute path or atomic temporary path.
- Tests use distinct source and final output directories and verify companion links after relocation without copying companions or fetching local/remote content during rendering.

## Controlled Desktop Preview Navigation

- Preview external/local links expose opaque per-preview identifiers only; no raw URL or filesystem path appears in the iframe DOM, postMessage payload, or public preview RPC response.
- The dedicated host navigation action accepts only an opaque target ID and current preview/document identity. The trusted host resolves the current private map and revalidates current revision, scheme/path, canonical containment, symlink status, file existence/type, and extension before showing confirmation.
- Only genuine user activation of an approved generated link can request navigation. Internal fragments remain in-frame and do not invoke the host.
- A valid external HTTP/HTTPS or allowed local target opens only after trusted host confirmation. Cancel results in no native open call.
- Unknown IDs, malformed payloads, raw target injection, forged/replayed messages, wrong-frame requests, stale document/project/revision, and synthetic click requests are rejected without opening or fetching anything.
- Local paths reject traversal (including percent-encoded traversal), symlink components, missing/non-regular files, and disallowed extensions. External schemes other than HTTP/HTTPS are rejected.
- The iframe remains `sandbox="allow-scripts"` without `allow-same-origin`; authored content cannot access parent, bridge, filesystem, or arbitrary host actions. No automatic navigation, raw HTML execution, or external image/network request succeeds.

## Verification, Scope, and Residuals

- Focused root HTML/renderer/report-presentation tests pass; root build passes. Desktop host navigation tests, Playwright hostile-preview/security tests, desktop typecheck, and desktop web/worker build pass.
- Root full-suite and desktop contract-suite results are recorded against inherited Sprint 068/069 residuals: `tests/editor.test.ts:73`, `tests/examples.test.ts:43`, and `desktop-app/tests/rpc-contract-check.ts:74`. These are not represented as passes or repaired unless Sprint 070 changes cause a regression; no new unexplained failure remains.
- Evidence records exact commands, pass/fail counts, browser/desktop environment, relevant screenshots or logs, target-mapping/cancel results, and any unavailable checks. UI-only or renderer-only tests are not presented as proof of host security.
- Sprint 069's Word Web null-gap visual and formal screen-reader residuals and Sprint 067's PDF visual/viewer residual remain open for integrated closeout; Sprint 070 does not close them.
- No chart semantics/rendering changes, PDF/DOCX changes, shared model changes, new permissions, iframe relaxation, dependency/lockfile/cap change, unrelated historical repair, release, or publication occurs.
