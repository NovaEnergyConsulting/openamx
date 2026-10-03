# Sprint 046 Acceptance Criteria

Sprint 046 is complete when:

- The Sprint 044 and 045 dependency dispositions are recorded, or explicit authorization to proceed with their residuals is recorded. Their Builder results are not silently upgraded to Lead Developer acceptance.
- Static Help Center topic text, summaries, search terms, steps/body copy, and component-owned static release/help copy load from a bundled JSON resource included in the desktop build and available offline without network or runtime filesystem access.
- Extraction preserves stable topic IDs, topic ordering/meaning, existing search terms and useful search matches, default `getting-started` behavior, and initial-section routing for valid IDs with fallback for unknown IDs.
- Vue retains all rendering, filtering, navigation, starter project actions, diagnostic-export action, and other Help Center interaction behavior. JSON content is declarative and does not hold executable actions.
- Shortcut labels and shortcut values continue to come from the existing command registry. No duplicate shortcut metadata is introduced in JSON.
- At the minimum supported viewport and a larger desktop viewport, the Help Center is approximately 80% of available app width/height subject to viewport bounds and remains usable without exceeding the viewport.
- Header, search field, and footer remain fixed in the dialog while Help Center body content scrolls. Filtering to different result counts does not resize or reposition the dialog frame/chrome; long topic and shortcut content remains reachable by scrolling.
- Focused automated browser tests verify bundled/offline content loading, stable topic/search/routing behavior, command-registry shortcut sourcing, dialog bounds, filtering without resize, fixed chrome, and content scrolling at minimum and larger viewports.
- Integrated acceptance exercises the Sprint 044 preview freshness and controls, Sprint 045 viewport/editor/runtime behavior, and Sprint 046 Help Center flows. Evidence lists exact commands, outcomes, visual artifacts, host/browser/runtime, and any unavailable manual/native checks.
- Focused Playwright tests, desktop contract/tests, typecheck, production web build, and `git diff --check` pass, with exact commands/results, warnings, artifacts, and any failed/unavailable check recorded.
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and Sprint 046 Builder evidence accurately distinguish verified behavior from Lead Developer disposition and residuals. Browser evidence is not presented as native-platform or formal accessibility certification.
- No unrelated V0.7 backlog, AMX/CLI/VS Code behavior, native certification, formal accessibility certification, or release-engineering work is claimed as part of this sprint.