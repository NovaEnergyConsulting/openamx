# Sprint 102 Builder Evidence: V0.17 Desktop UX Contract and Technical Gate

## Status

Sprint 102 planning and prototype execution were separately authorized.
Product implementation remained outside this sprint's scope.

**Separate contract disposition: ACCEPTED/CLOSED by the product owner on
2026-10-25.** Sprint 103 is authorized to proceed after the separately
approved closeout of Sprints 100 and 101. This contract disposition does not
select a Sprint 107 resizer implementation path.

**Resizer result: OPEN.** The all-percent prototype preserved bounds,
keyboard adjustment, focus modes, and responsive behavior without Reka layout
normalization. Per-project behavior used an in-memory mock, not the desktop
service, and App.vue/runtime integration was not exercised. Do not select a
product resizer path for Sprint 107 until those checks are completed.

## Baseline Review

## Exact Reviewed Files

- `planning/plan-openamxV17MasterSprintPlan.md`
- `planning/openamxV06ProductUXContract.md`
- `planning/ideas/desktop-app-features-2.md`
- Sprint 102: `acceptance.md`, `blueprint.md`, `builder-evidence.md`,
  `desktop-ux-contract.md`, `requirement-test-matrix.md`, and
  `resizable-technical-gate.md`
- `desktop-app/package.json`, `desktop-app/vite.config.ts`
- `desktop-app/src/mainview/App.vue`, `desktop-app/src/mainview/app.css`,
  `desktop-app/src/mainview/shell.ts`
- `desktop-app/src/shared/rpc.ts`, `desktop-app/src/bun/desktopService.ts`
- `desktop-app/node_modules/shadcn-vue/package.json`
- `desktop-app/node_modules/reka-ui/package.json`
- `desktop-app/node_modules/reka-ui/src/Splitter/index.ts`,
  `SplitterGroup.vue`, `SplitterPanel.vue`, `SplitterResizeHandle.vue`,
  `utils/composables/useWindowSplitterBehavior.ts`, `utils/units.ts`, and
  `utils/calculate.ts`

Focused source review confirmed: current custom separators have pointer
handlers but no key handler; `setPanelSizes` validates the established
160-400 px and 25-65% ranges and stores values on each recent project; file
move is service-owned and transactional for file/import updates; and folder
duplicate/move/trash/restore APIs and folder trash DTOs do not exist. No
renderer filesystem path was proposed.

## Installed API Probe

Command, run from the repository root:

```powershell
Push-Location desktop-app; @'
import { existsSync, readFileSync } from "node:fs";
import * as reka from "reka-ui";
const rekaPackage = JSON.parse(readFileSync("node_modules/reka-ui/package.json", "utf8"));
const shadcnPackage = JSON.parse(readFileSync("node_modules/shadcn-vue/package.json", "utf8"));
console.log(JSON.stringify({
  rekaVersion: rekaPackage.version,
  rekaSplitterExports: Object.keys(reka).filter(name => name.toLowerCase().includes("splitter")),
  shadcnVueVersion: shadcnPackage.version,
  shadcnVueExports: Object.keys(shadcnPackage.exports),
  shadcnVueResizableRuntimeExport: Object.keys(shadcnPackage.exports).some(name => name.toLowerCase().includes("resizable")),
  localResizableWrapperExists: existsSync("src/mainview/components/ui/resizable"),
}, null, 2));
'@ | bun run -; Pop-Location
```

Output:

```json
{
  "rekaVersion": "2.10.5",
  "rekaSplitterExports": [
    "SplitterGroup",
    "SplitterPanel",
    "SplitterResizeHandle",
    "injectSplitterGroupContext"
  ],
  "shadcnVueVersion": "2.8.2",
  "shadcnVueExports": [
    ".",
    "./registry",
    "./schema",
    "./mcp",
    "./utils",
    "./icons",
    "./preset",
    "./tailwind.css"
  ],
  "shadcnVueResizableRuntimeExport": false,
  "localResizableWrapperExists": false
}
```

Installed-source API facts: `SplitterGroup` emits a layout array and accepts
`direction`, `keyboardResizeBy`, `autoSaveId`, and a storage adapter. Panels
support pixel or percent units and min/max bounds. Pixel constraints convert
against the group's full measured width. Handles support Arrow, Home/End,
Tab focus, and F6 cycling. Reka's `autoSaveId` path is local-storage-backed
and was not used.

## Prototype Evidence

The only new non-product artifacts are `prototype/index.html` and
`prototype/main.ts`. The harness imports installed Reka components and uses
an in-memory `setPanelSizes` mock keyed by project name; it never uses local
storage. It does not mount `App.vue` or invoke desktop RPC.

Final server command, run from the repository root:

```powershell
@'
import path from "node:path";
import { createServer } from "./desktop-app/node_modules/vite/dist/node/index.js";
const desktop = path.resolve("desktop-app");
const server = await createServer({
  configFile: false,
  root: path.resolve("planning/sprints/0102-v17-desktop-ux-contract-technical-gate/prototype"),
  cacheDir: path.resolve(process.env.TEMP, "openamx-s102-vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: {
    alias: [
      { find: "vue", replacement: path.resolve(desktop, "node_modules/vue/dist/vue.esm-bundler.js") },
      { find: "reka-ui", replacement: path.resolve(desktop, "node_modules/reka-ui/dist/index.js") },
    ],
    dedupe: ["vue"],
  },
  server: { host: "127.0.0.1", port: 5182, strictPort: true },
});
await server.listen();
server.printUrls();
await new Promise(() => {});
'@ | bun run -
```

Output: `http://127.0.0.1:5182/`. The OS temp directory held Vite cache; the
server was stopped after the probes.

| Probe | Observed output | Result |
| --- | --- | --- |
| 1024x720 all-percent initial layout | Host 1000px; explorer 219.97px, editor 323.08px, context 438.95px; two 8px handles; no horizontal overflow. Seed was 220px/44%. No Reka layout-normalization warning. | Candidate geometry passed within subpixel measurement tolerance. |
| Pixel-unit comparison | Earlier px-unit mapping seeded at 220px/44% rendered 218px and warned `Invalid layout total size: 22.399637985648717%, 33.444695843299506%, 45.15767017906781%. Layout normalization will be applied.` | Rejected; the final prototype uses the all-percent mapping instead. |
| 1024x720 keyboard/accessibility | Tab/Shift+Tab reached the separator with visible outline; role `separator`, `aria-controls=explorer-panel`, Reka percentage values min=16/max=41/now=23 after ArrowRight. With `keyboardResizeBy=1`, explorer moved 219.97px -> 229.78px; End=399.67px; Home=160.06px. Mock recorded each adjustment. | Keyboard path and ARIA behavior passed in prototype; Home/End were within 0.4px of bounds. |
| 1024x720 pointer drag | After Home, a 25px pointer drag moved explorer from 160.06px to 184.61px; mock state became 185px/32.3%; no horizontal overflow. | Pointer completion and mock callback worked in prototype only. |
| Project B at 1024x720 | Stored 300px/55% clamped to explorer 299.50px, editor 260.23px, context 422.27px; no overflow. | Context clamp preserved the editor minimum and project state was not overwritten on load. |
| Project B at 1440x900 | Restored about 300.58/320.14/777.28px from its independent 300px/55% mock state. Switching B/A/B retained each project state. | Independent mock round-trip passed; actual recent-project RPC not exercised. |
| Project A at 1440x900 | After Project A adjustments, restored about 184.53/757.72/455.75px from mock state 185px/32.3%; no overflow. | Mock project restoration passed. |
| Focus modes | Editor and context focus each removed splitter handles while retaining the runtime row; exit restored two handles and did not add mock persistence writes. | Prototype only; not integrated with App.vue. |
| 900x720 responsive stack | Three stacked panes, no splitter handles, host 874px wide and scrollWidth 874px; runtime row remained. | No horizontal overflow in prototype. |

Vite emitted a non-blocking Vue feature-flag warning because the prototype
uses the esm-bundler build without production compile-time flags.

## Commands, Failures, and Unavailable Checks

- `git status --short -- planning/sprints/0102-v17-desktop-ux-contract-technical-gate` before revisions returned only `?? planning/sprints/0102-v17-desktop-ux-contract-technical-gate/prototype/`.
- `Push-Location desktop-app; bunx vite --config vite.config.ts --root ..\planning\sprints\0102-v17-desktop-ux-contract-technical-gate\prototype --cacheDir "$env:TEMP\openamx-s102-vite-cache" --host 127.0.0.1 --port 5181 --strictPort; Pop-Location` failed with `CACError: Unknown option --root`.
- `Push-Location desktop-app; bunx vite ..\planning\sprints\0102-v17-desktop-ux-contract-technical-gate\prototype --config vite.config.ts --cacheDir "$env:TEMP\openamx-s102-vite-cache" --host 127.0.0.1 --port 5181 --strictPort; Pop-Location` failed with `CACError: Unknown option --cacheDir`.
- First Vite programmatic server using the desktop Vite config returned HTTP 500 because `vue` could not be resolved from the planning-only root.
- The first browser mount after adding aliases failed with `ReferenceError: createApp is not defined`; the missing Vue import was added.
- An isolated server attempt on port 5181 failed with `Port 5181 is already in use`; final prototype served on 5182.
- Final programmatic server started successfully; all listed browser probes completed. The initial layout-normalization warning remains recorded and was not treated as a pass.
- Final programmatic server started successfully; all listed browser probes completed. The all-percent mapping emitted no Reka normalization warning; the earlier pixel-unit warning remains recorded as a rejected comparison.
- Not run: actual `setPanelSizes` RPC round-trip, App.vue integration, native Electrobun host, product tests for Sprints 104-107, desktop typecheck/build, release checks, or platform certification. These are not Sprint 102 product behavior passes.

## Artifact Validation

Command:

```powershell
git diff --check -- planning/sprints/0102-v17-desktop-ux-contract-technical-gate
```

Output: no output; exit code 0.

The artifact batch also ran an inline Bun ID/link audit against
`desktop-ux-contract.md`, `requirement-test-matrix.md`,
`resizable-technical-gate.md`, and `builder-evidence.md`. Output:

```json
{
  "contractCaseCount": 37,
  "contractCasesMissingFromMatrix": [],
  "gateCaseCount": 6,
  "gateCasesMissingFromMatrix": [],
  "brokenLocalLinks": []
}
```

VS Code `get_errors` returned `No errors found` for all four reviewed Markdown
deliverables.

## Scope and Disposition

- Folder operation facts are confirmed file-only today. The complete-tree
  contract for collisions, tree scope, inbound/descendant imports, tabs,
  external changes, and rollback is proposed in `desktop-ux-contract.md`;
  folder variants in Sprint 105 remain blocked pending separate disposition.
- Resizer decision is **OPEN**; Sprint 107 may not select a product path
  until actual service RPC and App.vue integration are exercised. The tested
  all-percent prototype used only mock persistence.
- New behavior tests remain assigned to their owning sprints and are not
  reported as passing here.
- No product source, tests, dependencies, package/version files, generated
  build outputs, status ledgers, or historical sprint records were changed.
- Separate contract disposition: **ACCEPTED/CLOSED by the product owner on
  2026-10-25.** The resizer technical result remains **OPEN**; Sprint 107 must
  not select a product path until actual service RPC and App.vue integration
  are exercised. No release, publication, version change, or certification
  is authorized.