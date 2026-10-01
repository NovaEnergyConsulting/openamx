# OpenAMX Desktop Analysis Workbench

This isolated Electrobun + Bun + Vue 3 + shadcn-vue application provides project editing, entry-buffer analysis/run, HTML preview/save, and PDF/DOCX export. Report operations use the selected project root for V0.5 report identity and the shared prepared-report path. The Bun main process owns project paths, configuration, file reads/writes, module loading, parsing, checking, input validation, evaluation, rendering, and report generation. The Vue webview receives bounded typed payloads and has no filesystem, Bun/Node, shell, evaluator, module-loader, input-loader, PDF, or DOCX capability. V0.5 is accepted with native desktop and visual exceptions deferred to V0.6; separate native release gates remain open. See `planning/state.md`.

shadcn-vue components and helpers are application source under `src/mainview/components` and `src/mainview/lib`. `.hutch/devkit` is reserved for Hutch-generated Electrobun SDK files; never place application components there because Hutch may replace that projection.

TypeScript and Vite resolve only Electrobun API imports through explicit aliases into the generated SDK projection; shadcn imports use the source alias `@/`. The app tsconfig does not extend Hutch's generated tsconfig, so application paths and compiler settings remain source-owned. Run a Hutch prepare before standalone typecheck or Vite use; package scripts do this before loading the SDK-aware config.

## Commands

Run from `desktop-app/`:

```sh
bun install --frozen-lockfile
bun run test
bunx vue-tsc --noEmit
bunx vite build
```

The focused contract test exercises typed payloads, canonical project containment, ignored paths, native picker return validation/cancel, independent dirty tabs/entry, conflict/close/reload, saved dependency barriers, private session restore, stale picker replies, current entry-buffer execution with a local import and JSON/CSV data, configuration precedence, bounded diagnostics, HTML/PDF/DOCX output, and no-write behavior. RPC report operations execute in the main process against the exact unsaved designated entry buffer; they reuse the shared module loader, validators, evaluator, renderer, and report adapters.

## Workbench Controls

Open a project with the native folder picker, then open `.amx` files from the searchable project explorer or native file picker. A previously used project reopens its safe saved active/entry tabs when chosen in either the folder picker or Recent projects; a new project lists files without opening one automatically. The explorer excludes hidden and generated paths, symlinks, and files outside the root. Each open file keeps a separate in-memory tab; designate any open contained file as entry. Save, format and static analysis act on the active tab. Run, preview and explicit exports use the entry tab's unsaved text and saved imports. Save a dirty imported tab before reporting; a disk conflict refuses save. Closing a dirty tab offers Save, Discard or Cancel; reload asks before discarding edits. Closing the entry disables report actions until another tab is designated.

The source editor uses CodeMirror with Markdown fence coloring, line numbers, bracket matching, per-tab selection/undo state and a Find button opening its find/replace panel. Format applies a minimal undoable change to executable AMX fences through the shared formatter. AMX-specific token colors and complete import-aware static completion are not yet verified Sprint 030 behavior. The command palette is searchable and shares its operations with the toolbar. Ctrl on Linux/Windows or Cmd on macOS is used below:

| Keys | Action |
| --- | --- |
| Ctrl/Cmd+O | Open project picker |
| Ctrl/Cmd+Shift+O | Open file picker |
| Ctrl/Cmd+S | Save active tab |
| Ctrl/Cmd+Shift+P | Command palette |
| Ctrl/Cmd+Shift+F | Focus project search |
| Ctrl/Cmd+Alt+Left/Right | Previous/next tab |
| Ctrl/Cmd+Enter | Run entry |
| Ctrl/Cmd+Shift+Enter | Preview entry |
| Escape | Dismiss palette or focused layout |

The toolbar exposes bounded keyboard-operable pane sizing, explorer/inputs/export and preview/diagnostics/results panels, and reversible editor/preview focus. Machine-local session metadata lives under the user's `.config/openamx/desktop-session.json`: at most ten canonical project roots, optional safe relative active/entry paths and panel sizes. No unsaved text, input overrides, config contents, results or HTML are persisted; Clear history removes recent/session metadata. Restoring never auto-runs.

On project switch (including recent-project restore), a native prompt offers Save All, Discard All or Cancel after a project is selected. A known disk conflict prevents Save All before any tab is written; failure or Cancel keeps the original project and tab buffers open. Electrobun `before-quit` and `will-close` handlers veto app quit and window close while the same native confirmation runs. Actual window-close and quit behavior must still be verified on native hosts.

Export buttons request an OS-native save panel from the Bun process: `zenity` on Linux, AppleScript's `choose file name` on macOS, and Windows Forms `SaveFileDialog` on Windows. No selected path is trusted: the existing destination checks and atomic report writers remain authoritative. A new file can be selected without creating it until analysis succeeds; cancel is a no-op. `zenity` must be available on Linux; when it is missing or a dialog fails, export reports an error without writing. This adapter and the `will-close` hook have direct command/contract coverage, but actual native picker and close/quit acceptance on the target operating systems is still pending. `tinyfiledialogs-node@1.1.8` remains rejected; no binary addon was adopted.

The package scripts `bun run typecheck`, `bun run build:web`, `bun run build`, and `bun run run` invoke Hutch preparation. Hutch may stall after Electrobun config serialization; direct `bunx vue-tsc --noEmit` and `bunx vite build` are available diagnostics but do not count as native packaging or launch acceptance. Sprint 025 reproduced the Hutch timeout; see `planning/state.md` for exact commands and outcomes.

## Input Configuration

Portable defaults live in `.openamx/project.json` and use paths relative to the project root:

```json
{
	"version": 1,
	"inputs": {
		"assets": "data/assets.json",
		"screenings": "data/screenings.csv"
	},
	"report": {
		"organization": "Example Utilities",
		"accent": "#146C94",
		"footer": "Illustrative report"
	}
}
```

Machine-local overrides use the same schema in ignored `.openamx/local.json`. Create it explicitly; the application never creates or overwrites configuration files. On POSIX systems, it must be owned by the current user with group/other access disabled (for example, `chmod 600 .openamx/local.json`). Local paths may be absolute or project-relative. Per-run overrides are entered one `name=path` mapping per line. Precedence is per-run, local, then project. Relative paths resolve from the project root; project-default paths must remain inside it. Local and per-run data files may be outside the root. URL/network paths are unsupported, and private paths are redacted from diagnostics.

Both configuration files accept only `version: 1` and an `inputs` object of logical names to paths; unknown keys, invalid names, unsupported extensions, insecure or incorrectly owned POSIX local files, and invalid project paths are reported without rewriting the file. Missing configuration files mean no defaults. Core aggregate and fail-fast validation behavior is preserved.
The portable `.openamx/project.json` accepts `version: 1`, `inputs`, and the optional V0.5 `report` identity object. The ignored `.openamx/local.json` accepts only `version: 1` and `inputs`; report identity cannot be overridden locally. Unknown keys, invalid names, unsupported extensions, insecure or incorrectly owned POSIX local files, and invalid project paths are reported without rewriting the file. Missing configuration files mean no defaults. Core aggregate and fail-fast validation behavior is preserved.

Report `report` values may also be overridden field by field in the entry document's YAML frontmatter. `sourceVisible` defaults to true; setting it false hides only the formatted source listing, not values, views or other report content. A logo must be a contained local PNG/JPEG asset with descriptive alt text, and is validated and re-encoded by the main process before output.

## Outputs and Limits

HTML preview, HTML save, PDF export, and DOCX export analyze the designated entry buffer with the selected inputs. Output paths are explicit, resolve from the project root, must stay inside that root, use exact lowercase `.html`, `.pdf`, or `.docx`, and require an existing parent directory. Symlinks and entry/input conflicts are rejected. All report outputs use same-directory temporary files and atomic rename. Existing outputs are preserved when analysis or preparation fails. DOCX output contains editable semantic text/tables and static chart images; interactive charts and broad Office compatibility are not claimed. The webview receives only a bounded scalar/list-count/record-kind result summary, never input contents or arbitrary evaluated objects.

## Verification Status

The Sprint 026 builder environment was Ubuntu 24.04.4 LTS under WSL2 (Linux x86_64), Bun 1.4.2, and Node 24.20.0. This is not native Ubuntu release-owner evidence. macOS 14+, Windows 11+, and native Ubuntu 24.04+ build/launch checks remain required. The PDF adapter uses pdfmake 0.3.11 and bundled Roboto fonts; retain the recorded Apache 2.0 font notice with redistributed font assets. DOCX uses `docx` 9.8.1 (MIT), embeds local SVG chart media with a local PNG fallback, and has package-structure evidence on this host; native Office round trips remain unverified. Marketplace publication remains deferred pending an explicit project license decision.
Recorded direct desktop verification is on Ubuntu 24.04 under WSL2, not native Ubuntu release-owner evidence. macOS 14+, Windows 11+, and native Ubuntu 24.04+ build/launch checks remain required. The PDF adapter uses pdfmake 0.3.11 and bundled Roboto fonts; retain the recorded Apache 2.0 font notice with redistributed font assets. DOCX uses `docx` 9.8.1 (MIT), embeds local SVG chart media with a local PNG fallback, and has package-structure evidence; native Office round trips remain unverified. Sprint 029 native project/save/close and populated accessibility checks, Sprint 030 editor exceptions, and Sprint 034 visual sign-off remain open. Marketplace publication remains deferred pending an explicit project license decision.

## Native Prerequisites

Electrobun's Linux runtime requires GTK 3, WebKitGTK 4.1, Ayatana AppIndicator, and librsvg. Ubuntu/Debian package names are `libgtk-3-0`, `libwebkit2gtk-4.1-0`, `libayatana-appindicator3-1`, and `librsvg2-2`; the export save panel additionally requires `zenity`. Native builds must run on their target operating system. Official release targets are macOS 14+, Windows 11+, and Ubuntu 24.04+; none is claimed complete by this WSL2 prototype.
