# Sprint 045 Acceptance Criteria

Sprint 045 is complete when:

- At 1024x720 and a larger desktop viewport, long workbench content does not increase the app document beyond the available viewport. The native window remains user-resizable and no window dimensions/configuration are changed to mask page overflow.
- Explorer, editor, and preview scroll independently in the desktop layout. Their content remains reachable without relying on page-level scrolling or clipping.
- The adaptive/narrow layout remains bounded to the viewport; explorer, editor, and preview retain usable independent vertical scrolling as panes stack or adapt. Long preview/report content scrolls within its preview pane/iframe.
- CodeMirror line wrapping is enabled by default. The Preferences UI exposes a discoverable global wrap setting, persists it across restart/reload on the local device, applies it to all AMX documents, and does not modify project/source files.
- Tab indents and Shift+Tab unindents according to the configured editor indentation while CodeMirror has focus. Focus remains in the editor and the source text changes as expected. When CodeMirror is not focused, Tab continues ordinary focus navigation without inserting editor indentation.
- Runtime drawer foregrounds are theme-aware and legible in light and dark themes for operation status, stage, diagnostics, diagnostic links, muted text, and code text, including idle/success/running/stale/failure/cancelled states that are available to render. Hard-coded foreground colors that fail on one theme are removed from these owned states.
- Focused automated browser tests exercise layout containment and independent scroll behavior at minimum and larger viewports, wrapping default/persistence/toggle, editor keyboard behavior both in and out of focus, and runtime drawer theme/state rendering.
- Visual evidence is captured at 1024x720 and a larger desktop viewport, including adaptive layout and light/dark drawer states. Evidence identifies browser/runtime/host; it is not claimed as native-platform or formal accessibility certification.
- Focused UI tests, desktop tests, typecheck, production web build, and `git diff --check` pass. Exact commands/results, relevant browser versions, screenshots/artifacts, warnings, and any unavailable native checks are recorded.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 045 Builder evidence accurately report disposition and residuals. No Sprint 046 or unrelated backlog work is claimed.