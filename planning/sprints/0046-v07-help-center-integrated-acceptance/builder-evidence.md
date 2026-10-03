# Sprint 046 Builder Evidence

## Gate and Disposition

- Lead Developer direction (2026-10-03): Sprint 044 is COMPLETE WITH RESIDUALS; unavailable native Electrobun evidence remains a residual.
- Lead Developer explicitly authorized Sprint 046 sequencing with Sprint 045's documented residuals. This is not Sprint 045 acceptance. Native window resizing, actual app restart, and formal accessibility remain unverified.
- Builder implementation and the available integrated browser acceptance are complete. Native/manual integrated host verification was not available and is not claimed.

## Implementation

- Moved all nine Help topic records (IDs, title, summary, exact search terms, and steps) plus component-owned headings, labels, search placeholders, empty states, action labels, footer, and release-note copy into `desktop-app/src/mainview/components/help-content.json`.
- `HelpCenterDialog.vue` statically imports this JSON through Vite. No runtime fetch, filesystem read, network requirement, shortcut metadata, action definition, or callback authority is in the resource.
- Vue still owns filtering, selection, valid/default/unknown section routing, rendering, and events. Starter sources remain imported from `starterExamples`; project creation and diagnostic download remain existing `App.vue` callbacks. Shortcut rows still receive the current `commands` registry from `App.vue`.
- The modal is `80vw` by `80vh`, bounded by viewport padding; its header, search, and footer are outside `.help-layout`, the independently scrolling body. Narrow-screen layout stacks the body columns without allowing the frame to exceed the viewport.
- The Sprint 042 Vite fixture gained a `?help-section=` component route that opens the production Help Center component using its normal false-to-true lifecycle. The fixture's app route remains unchanged.

## Help Acceptance

- Nine original topic IDs and their exact pre-extraction search-term strings are pinned in the browser regression. Tests exercise every term phrase, representative cross-topic matching, default `getting-started`, valid `language`, command-registry `release-notes`, and unknown-section fallback.
- The browser mounts production `App.vue`; `Ctrl/Cmd+S` shortcut label/value is observed from the actual command registry. Command palette routing opens Release notes. Creating a starter closes Help and reaches the existing application project-creation callback. Diagnostic export downloads `openamx-diagnostic-summary.json` through the existing callback.
- The test records requests and observes no external-origin request while using Help. The production Vite output contains the Help topic/search/footer text in `dist/assets/index-CZVYj3b-.js`, confirming static bundling; no runtime resource read is used.
- Viewports: 1024x720 and 1440x900. At 1024x720, frame measured 819x576 with 340px body viewport and 667px content. At 1440x900, frame measured 1152x720. At both viewports, different search result counts preserve frame bounds and header/search/footer positions; the content body scrolls independently.

## Integrated Verification

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; Playwright `1.63.0`; Chromium `153.0.8010.12`.

- `bun run test:ui -- tests/ui/help-center.pw.ts` — passed, 2 tests, 0 failures. Covers stable IDs/terms, routing, local/offline content, registry shortcuts, starter/diagnostic actions, frame/chrome/body behavior, and screenshots.
- `bun run test:ui` — passed, 6 tests, 0 failures across Sprints 044-046. Sprint 044 measured automatic preview start at 426.2 ms after edit with autosave before publication. Sprint 045 covers 1024x720, 1440x900, adaptive 820x720, pane scrolling, wrap persistence and focus-scoped indentation, and runtime text states/themes. Sprint 046 covers Help behavior above.
- `bun run test` — passed; desktop RPC/workflow contracts all passed, final active resources `[]`.
- `bun run typecheck` — passed (`hutch electrobun prepare && vue-tsc --noEmit`).
- `bun run build:web` — passed; Vite 6.4.3 transformed 3,272 modules. Existing warning remains: main JS chunk exceeds 500 kB; final JS is 2,689.67 kB / 836.34 kB gzip, CSS 640.53 kB / 109.15 kB gzip. Worker bundle is 4.13 MB.
- `bunx tsc --noEmit --strict --target ESNext --module ESNext --moduleResolution bundler --skipLibCheck --types bun tests/ui/help-center.pw.ts` — passed.
- `rg -l 'welcome first project starter create open|AMX language essentials|Search is local\\. No telemetry is sent\\.' dist/assets/index-*.js` — passed; matched `dist/assets/index-CZVYj3b-.js`.
- `git diff --check` — passed after final evidence and planning updates.

## Visual Evidence

Playwright/Vite browser screenshots of production `App.vue`; not native Electrobun captures.

| View | Artifact | SHA-256 |
| --- | --- | --- |
| 1024x720 | [sprint046-help-1024x720.png](visual-evidence/sprint046-help-1024x720.png) | `009caca8cce59ddd139d8ba76346519ad6bbc003eff8753833e795147919c41f` |
| 1440x900 | [sprint046-help-1440x900.png](visual-evidence/sprint046-help-1440x900.png) | `3a3366d91418ee6b0ce885b4dfc3429964e8545e072e6e82028db82f2e6958e3` |

## Residuals and Limits

- No native Electrobun app interaction or actual OS window-resize/restart was performed. No cross-platform or formal accessibility certification is claimed.
- Sprint 045 sequencing authorization does not accept Sprint 045 or upgrade its residuals. Sprint 044 remains complete with its native-host residual recorded.
- No root-wide test suite was requested/run for this desktop-only scope. No native, Hutch/package, release, or unrelated V0.7 backlog work is claimed.
