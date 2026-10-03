# Sprint 045 Builder Evidence

## Disposition

**Builder implementation and verification complete; Lead Developer disposition pending.** Workbench content is bounded to the available browser viewport with independently scrolling explorer, editor, preview iframe, and runtime drawer. CodeMirror wrapping defaults on and is controlled by a persistent local preference; Tab/Shift+Tab use the editor's standard indentation binding only while focused. Runtime drawer foregrounds now use resolved theme tokens.

Browser evidence is from the Sprint 044 Vite fixture mounting production `App.vue`; it is not direct Electrobun host evidence, native-platform certification, or formal accessibility certification. Native window resizing and dimensions were not changed. No AMX, CLI, parser, evaluator, VS Code, or RPC authority semantics were changed. Sprint 046 and unrelated backlog work were not performed.

## Findings and Implementation

The baseline adaptive probe at 820x720 grew `document.documentElement.scrollHeight` to 3,053 px when explorer, editor, preview, and runtime content were long. The page used a minimum viewport height while its adaptive panes had large minimum heights, allowing their intrinsic content to enlarge the page.

The app shell now occupies the current dynamic viewport. Desktop and adaptive workbench rows are shrinkable; pane ancestors permit shrinking, while the explorer, CodeMirror scroller, preview iframe document, and runtime drawer own their scrolling. Long diagnostic text wraps rather than widening the page. No OS window-size/resizability setting was changed.

CodeMirror uses `EditorView.lineWrapping` by default, with a `Compartment` to toggle it without recreating the editor. The global `openamx.editor-wrap` localStorage key defaults to enabled unless explicitly `false`; Preferences exposes “Wrap long editor lines.” The value applies to each active AMX editor and remains outside project/source data. The UI test covers two AMX documents, reload persistence, and confirms changing the preference does not alter the editor source buffer. A native app restart was not directly exercised.

CodeMirror's standard `indentWithTab` binding controls Tab/Shift+Tab inside the editor. The test verifies configured two-space indentation, unindent, retained editor focus, and ordinary Tab traversal away from the editor without changing source.

Runtime status, stage, diagnostic links, muted text, code, and idle/running/success/failure/stale/cancelled state foregrounds use shell tokens for both resolved themes. Automated browser checks measure foreground contrast against the runtime drawer surface at 4.5:1 or greater. The state-class matrix is rendered in the harness to cover every listed state; this is a visual/token review, not formal accessibility certification.

## Verification

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Bun `1.4.2`; Node `v24.14.1`; Playwright `1.63.0`; headless Chromium `153.0.8010.12` (Playwright browser build 1243).

- Focused comfort UI: `env -C /home/cgamez/Programming/openamx/desktop-app bun run test:ui -- tests/ui/workbench-comfort.pw.ts` — passed, **3 tests, 0 failures**. Covers 1024x720, 1440x900, and adaptive 820x720; page width/height containment; independent pane scroll positions; default/toggled/reloaded/global wrap; Tab/Shift+Tab and outside focus traversal; source unchanged by preference save; runtime theme/state contrast.
- Combined browser UI: `env -C /home/cgamez/Programming/openamx/desktop-app bun run test:ui` — passed, **4 tests, 0 failures** including Sprint 044 preview freshness and adaptive right-drawer bounds. The final observed automatic preview began `408.5 ms` after edit and autosave completed before publication; the existing 400 ms debounce behavior is unchanged.
- Desktop contracts: `env -C /home/cgamez/Programming/openamx/desktop-app bun run test` — passed; all RPC/workflow assertions completed and `Final active resources: []`.
- Frozen dependencies: `env -C /home/cgamez/Programming/openamx/desktop-app bun install --frozen-lockfile` — passed, 631 installs across 689 packages, no changes.
- Typecheck: `env -C /home/cgamez/Programming/openamx/desktop-app bun run typecheck` — passed (`hutch electrobun prepare && vue-tsc --noEmit`).
- UI spec types: `env -C /home/cgamez/Programming/openamx/desktop-app bunx tsc --noEmit --strict --target ESNext --module ESNext --moduleResolution bundler --skipLibCheck --types bun tests/ui/workbench-comfort.pw.ts` — passed; the normal desktop `tsconfig` excludes UI tests.
- Production web build: `env -C /home/cgamez/Programming/openamx/desktop-app bun run build:web` — passed; Vite 6.4.3 transformed 3,271 modules and bundled the 4.13 MB worker. App JS: 2,688.85 kB / 836.06 kB gzip; CSS: 640.24 kB / 109.07 kB gzip. Existing Vite warning remains for chunks larger than 500 kB.
- `git diff --check` — passed after the final evidence and planning edits.

No root-wide test suite was run; AMX/core and extension behavior are outside this sprint. The Playwright Chromium installation on this Omarchy host previously reported the OS as unsupported and selected its Ubuntu 24.04 fallback build (see Sprint 044 evidence); the final browser runs completed without additional warnings. Native Electrobun launch/window resizing, actual app restart, other operating systems, and formal accessibility review were unavailable/not performed.

## Visual Evidence

All images are Playwright/Vite screenshots of the production workbench fixture. Runtime is headless Playwright Chromium 153.0.8010.12 on Omarchy Linux x86_64; they are not native Electrobun captures.

| View | Artifact |
| --- | --- |
| 1024x720, light, long panes | [sprint045-1024x720-light.png](visual-evidence/sprint045-1024x720-light.png) |
| 1440x900, light, long panes | [sprint045-1440x900-light.png](visual-evidence/sprint045-1440x900-light.png) |
| 820x720 adaptive, light, long panes, right-docked runtime drawer | [sprint045-820x720-adaptive-light.png](visual-evidence/sprint045-820x720-adaptive-light.png) |
| 1440x900, light, runtime states | [sprint045-1440x900-light-runtime.png](visual-evidence/sprint045-1440x900-light-runtime.png) |
| 1440x900, dark, runtime states | [sprint045-1440x900-dark-runtime.png](visual-evidence/sprint045-1440x900-dark-runtime.png) |

SHA-256:

- `sprint045-1024x720-light.png`: `ddff292c29157cfb228f47e039284074380723d551ca706092b9551af13099fb`
- `sprint045-1440x900-light.png`: `6419f0f368a5dc268cd2d0bb8e8616e9c8a5cc813edd1529c8790ee145467b24`
- `sprint045-820x720-adaptive-light.png`: `270dc2866e6752e5b831e0146b4f976f0618d02ede59389fa598c82633ff63b8`
- `sprint045-1440x900-light-runtime.png`: `de931e421e90c9d566fccaf77031c140a24d5069aaaa83ab4cc7be14b9ea54e2`
- `sprint045-1440x900-dark-runtime.png`: `e6cb152a9565c19d9e0734187c975283dd606ebc9f6cca657e6f16c2f9529b6c`

## Residuals

- Lead Developer review/disposition is pending.
- Direct native Electrobun UI, real native window resizing, and preference persistence across an actual app restart were not exercised. Owner: Lead Developer/native acceptance.
- Screenshots and automated contrast calculations are browser evidence only; no cross-platform or formal accessibility certification is claimed.
- Existing production bundle-size warning (>500 kB chunk) remains; no unrelated bundle refactor was undertaken.