# Sprint 066 Acceptance Criteria

Sprint 066 is complete only after Builder evidence and a separate Lead Developer disposition. It does not authorize later destination adapters or chart work by itself.

## Shared Narrative

- A shared, immutable, destination-neutral narrative structure covers all in-scope Markdown nodes and preserves report item order and the narrative/source/view distinction.
- Paired LF/CRLF fixtures produce equivalent structures. Prose newlines, blank lines, both hard-break forms, nested formatting/blocks, inline and fenced code whitespace, and the exact page-break directive are covered.
- Raw HTML remains escaped/inert. Interpolation is text-only and cannot create formatting/markup. Emitted view cells remain literal captured data.
- Heading IDs are deterministic across repeated preparation; duplicate headings resolve deterministically; valid internal fragments map to the intended heading; missing fragments are not clickable.
- The shared model does not change AMX syntax/evaluation, report identity/order, snapshots, measurements, emitted values, or atomic exports. No destination renderer is wired in Sprint 066.

## Assets and Links

- The pixel bound is explicitly resolved before any image decode/embedding behavior is implemented. Accepted source/sanitized image bounds are each at most 4 MiB; existing aggregate worker limits are unchanged.
- Canonical root containment, source-relative resolution, percent-encoded traversal, symlinks, missing/non-regular files, extension/content mismatch, invalid/animated inputs, and offline re-encoding are covered.
- Nonempty alt text and proportional no-upscale dimensions are validated by the shared model; assets are PNG/JPEG only, sanitized, and never remotely fetched.
- HTTP/HTTPS, internal fragment, and relative local file are distinct link kinds. Local paths are checked relative to the source document; final output-relative URI generation remains a separate future adapter responsibility. Companion files are not copied and absolute machine paths do not leak.
- Windows Word desktop/web local-link prompts/restrictions are recorded with exact versions and reviewer. No prompt or trust policy is bypassed.

## Scope and Evidence

- Focused tests in the existing renderer/presentation suites pass, along with required root build/typecheck checks for touched shared code.
- Builder evidence lists exact commands, Windows/Word/runtime versions, artifacts, outcomes, skips, and residual owners. Word evidence is not inferred from package/XML inspection.
- No PDF/DOCX renderer integration, HTML behavior change, preview RPC/iframe change, chart adapter, dependency/lockfile change, cap change, or release change occurs.
- The Sprint 065 numeric-line and native-chart residuals are carried forward. Sprint 069 remains blocked until Windows Word evidence confirms faithful meaning or a separate Lead Developer decision explicitly resolves the conflict. No category coercion or static-image fallback is implied.
- A separate Lead Developer disposition records Sprint 066 status and whether Sprints 067/068/070 may proceed according to the master-plan dependencies. No V0.11 completion or release/publication authorization is implied.
