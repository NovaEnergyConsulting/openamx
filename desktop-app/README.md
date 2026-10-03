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

The V0.6 package version is `0.6.0`. Direct typecheck, Vite, and browser-harness checks are not native packaging or launch certification. V0.6 is approved for release with accepted exceptions; no native packaging, target-platform, Hutch, Office, licensing/Marketplace, or formal accessibility certification is claimed.

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

Sprint 043 Builder evidence and final disposition are in [the sprint record](../planning/sprints/0043-v06-onboarding-ux-acceptance-release-record/builder-evidence.md). The Lead Developer accepted the remaining unverified items as V0.6 release exceptions and approved release. Available-browser and direct-service checks do not certify native macOS, Windows, or Ubuntu behavior; follow-up requirements are recorded for V0.7 planning.
