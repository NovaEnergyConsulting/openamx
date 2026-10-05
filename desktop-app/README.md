# OpenAMX Desktop

The desktop workbench is an offline-first authoring environment for local OpenAMX projects. The active AMX tab owns static analysis, live preview, explicit Run, and Export. Open tabs, project files, recovery, settings, data editing, and output destinations remain under the trusted Bun service; the webview receives bounded RPC state.

## Development

Run from `desktop-app/`:

```sh
bun install --frozen-lockfile
bun run test
bunx vue-tsc --noEmit
bunx vite build
```

The root `package.json` is the release version authority. Native desktop release builds run only from a clean committed clone on the native target host; they never repair versions or build from an existing development output.

### Windows Sharp Runtime Bugfix (Out of Sprint)

The 2026-10-04 bugfix corrects native Sharp staging and release inspection on Windows. Sharp 0.35.5 ships its native binding and libvips DLLs together in `@img/sharp-win32-<architecture>`; it does not declare a separate Windows libvips runtime in its optional dependencies. Linux (including musl) and macOS still require their separate `@img/sharp-libvips-<target>` packages. Install dependencies on the native host rather than reusing Linux `node_modules` on Windows.

From the repository root, `bun run run:app` builds and launches the development application. `bun run --cwd desktop-app build` builds a local stable installer for testing the working tree. For a retained Windows release bundle, review and commit the fix first, then follow `release:check` and `release:desktop` below. Automated package checks do not establish manual installation or launch acceptance.

## Native Release Build

Install a current Bun release, Node.js, Git, and Hutch on the build host. Compressed application resources and update sidecars use Bun's `node:zlib` Zstandard support for in-memory inspection on all native hosts (tested with Bun 1.4.2); no external zstd executable or GNU `tar --zstd` is needed. Linux Setup installer inspection still uses `tar`. The installed application does not require Bun, Node.js, Git, or Hutch, but it does use the host's native webview and system libraries.

From a clean clone at the reviewed commit, run at the repository root:

```sh
bun install --frozen-lockfile
cd desktop-app
bun install --frozen-lockfile
cd ..
cd vscode-extension
bun install --frozen-lockfile
cd ..
bun run release:check
bun run release:desktop
```

`release:desktop` builds only the current native OS/architecture using Hutch's stable Electrobun installer. It creates a detached clean worktree and unique staging attempt under `releases/.staging/<version>/<os>-<architecture>/`; successful bundles are placed under `releases/<version>/<os>-<architecture>/`. Existing accepted target bundles are never overwritten. The Linux format is Electrobun's `.tar.gz` Setup installer; Windows and macOS builds must be run on their own native hosts and emit Hutch's documented Setup `.zip` and `.dmg` formats respectively. This workflow does not cross-compile.

Linux's packaged application includes Bun and the host-specific `sharp` native binding/libvips resources. It still requires the tested host's WebKitGTK 4.1, GTK/GLib, and related graphics/media libraries. The current Linux observation was Omarchy x86_64, kernel `7.2.5-3-omarchy`; it does not establish a minimum distribution version or broad Linux compatibility. Installer builds are unsigned. A successful package check is separate from manual installation, launch, and preview acceptance; inspect the target bundle's `manifest.json` and `evidence.json` for those statuses.

To install the Linux Setup archive, extract it and run `./installer`. The installed uninstaller is under the app's Electrobun data directory; `uninstall --quiet` removes the app while preserving app data, and `uninstall --quiet --delete-data` additionally removes the app-managed data/cache/log roots. Keep project documents outside app-managed roots. macOS and Windows prerequisites and warning behavior must be recorded from those native hosts before claiming them verified.

## First Project

From Welcome, choose **Guided first project** to open searchable local help, or select **Starter examples** for an input-free Hello OpenAMX or Operations Note report. The app creates a project through the trusted project service, installs the selected starter into the active report buffer, and lets the normal conflict-aware autosave path persist it. Live preview follows the active buffer; no explicit Run command is issued.

Open an existing folder with **Open project**. Recent projects preserve only validated project roots, a safe relative active file, and panel sizes. Existing sessions with a V0.5 `entry` field migrate by retaining a safe `active` file when present and discarding the obsolete entry field; entry-only sessions restore the project without opening a document. Migration does not run AMX or overwrite project source. Recovery is a separate inspect/restore/discard flow; restoring buffers does not write them to disk.

## Workbench

- The active `.amx` document controls analysis, preview, explicit Run, and all export formats. Open unsaved imported modules are used by the contained module graph.
- Live preview is debounced, can be paused/resumed or refreshed, and marks retained output stale after relevant edits. Run is explicit.
- AMX completion, diagnostics, navigation, references, rename, and safe actions use shared parser/checker facts. Only exact executable `amx` fences run; ordinary Markdown and code fences remain narrative.
- CSV and JSON tabs offer virtualized structured editing, raw mode, schema/validation details, and edit history. Supported table data is capped at 100,000 rows; larger or unsupported values retain a bounded raw fallback without silent truncation.
- The Inputs pane maps declared logical inputs. Local choices remain private by default; contained project defaults require explicit promotion. External mapped data is labeled private.
- Report Settings supports project defaults and current-document overrides. One Export workflow supports HTML, PDF, DOCX, and eligible explicitly exported JSON/CSV bindings.
- File writes, settings updates, autosave, recovery, trash, conflicts, output preparation, and atomic commits are owned by Bun. Cancellation or staleness before atomic replacement preserves the previous file; a rename already in progress is not interruptible.

## Help and Preferences

Help is bundled and searchable offline. It includes first-project guidance, bundled starters, AMX essentials, imports/data, preview/export, recovery, diagnostic privacy, current command shortcuts, and V0.6 release notes. The command palette and header also open Help and Preferences.

Preferences store theme, drawer placement, and autosave settings locally on this device. Diagnostic export downloads a capped JSON summary containing coarse tab counts, timestamps, and validated diagnostic codes only. It excludes paths, messages, source text, input values, recovery content, and credentials; it is not a raw process log.

### Asset-matched appearance hotfix

The desktop chrome uses the indigo/purple, lavender, and cyan palette from `assets/images/logo.svg`, the application icon, and splash artwork. Light mode uses pale lavender surfaces and purple actions; Dark mode uses near-black and charcoal surfaces, lavender actions, and cyan links. Follow system uses the corresponding palette and responds to system appearance changes. Existing defaults and saved preferences are retained. Report preview/export colours and semantic success, warning, and error colours are unchanged.

Run `bun run test:theme` to build the webview and check the production stylesheet in Chromium independently of the workflow harness. The checks cover explicit modes under both system appearances, system appearance changes, code/data-editor tokens, unchanged status colours, normal text contrast of at least 4.5:1, and representative control/focus contrast of at least 3:1. Screenshots are written to Playwright test results. Install the test browser with `bunx playwright install chromium` if it is missing.

These are stylesheet-surface checks, not full application or native installation acceptance. The existing `test:ui` runner requires the `spikes/sprint042-workflow-harness` fixture, which is absent from this checkout, and its web-server command also needs a Windows-compatible invocation. Before release, verify saved preferences, authoring/preview/export behaviour, and the appearance in the native desktop webview using the existing release process.

## Keyboard Shortcuts

Ctrl on Linux/Windows or Cmd on macOS:

| Keys | Action |
| --- | --- |
| Ctrl/Cmd+O | Open project |
| Ctrl/Cmd+Shift+O | Open file |
| Ctrl/Cmd+S | Save active tab |
| Ctrl/Cmd+Shift+P | Command palette |
| Ctrl/Cmd+Shift+F | Search project |
| Ctrl/Cmd+Alt+Left/Right | Previous/next tab |
| Ctrl/Cmd+Enter | Run active document |
| Ctrl/Cmd+Shift+Enter | Refresh preview |
| Escape | Close the topmost dialog/palette or exit focus mode |

The Help Center reflects shortcuts from the same command registry as the command palette.

## Project Inputs

Project defaults live in `.openamx/project.json`; machine-local overrides live in ignored `.openamx/local.json`. Existing V0.5 `version: 1`, input precedence, report identity, and CLI behavior are unchanged. Use the Inputs pane to pick, clear, open, or explicitly promote mappings instead of typing `name=path` in the workbench. Private paths and data contents are not included in RPC diagnostics or diagnostic summaries.

## Evidence and Limits

Sprint 043 Builder evidence and final disposition are in [the sprint record](../planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/builder-evidence.md). Sprint 048 Linux installer and target evidence are in [the Sprint 048 record](../planning/sprints/0048-v08-desktop-packaging-target-evidence/builder-evidence.md). The Lead Developer reports the latest correct Linux x64 installer launches and works; exact test details were not recorded. Linux arm64, Windows, and macOS remain unverified.
