# Sprint 020 Architecture Spike Results

## Environment and Dependency Pins

- Host: Ubuntu 24.04.4 LTS under WSL2; kernel `6.18.33.2-microsoft-standard-WSL2`, x86_64; `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-0`.
- Bun 1.4.2; Node.js v24.20.0; global Hutch 0.27.1. `bunx electrobun@2.0.1 --help` bootstrapped Hutch 0.24.3. The project config pins Electrobun 2.0.1; preparation attempted Cottontail 0.7.1.
- Desktop UI: Vue 3.5.41, Vite 6.4.3, `@vitejs/plugin-vue` 5.2.4, TypeScript 5.9.3, shadcn-vue 2.8.2, Tailwind 4.3.3, Reka UI 2.10.5, `@lucide/vue` 1.48.0, local Fontsource DM Sans/DM Mono/Newsreader 5.3.0. Versions are exact in `desktop-app/package.json` and `bun.lock`.
- PDF proof: pdfmake 0.3.11 (MIT), pdfjs-dist 6.3.289 (Apache-2.0). Comparison browser: Google Chrome 152.0.7977.82.

## Unsaved Entry Buffer

**Hypothesis:** An open, file-backed entry path can provide the canonical project root while an optional text override supplies the current editor buffer; existing module resolution, type checking, input validation, evaluation, and diagnostics can remain shared.

**Smallest setup:** `tests/modules.test.ts` creates an entry file containing deliberately non-executable saved text, a local `asset.amx` module exporting a record type, a JSON record input, and a CSV record-list input. It passes the modified entry text and explicit input mappings to `loadEntryModule`.

**Command:** `cd /home/cgamez/Programming/experiments/openamx && bun test tests/modules.test.ts -t 'current entry text|current-buffer'`.

**Observed result:** 3 tests passed. The current buffer imports the local type, maps and validates the JSON and CSV data, evaluates the expected value, and leaves the saved entry bytes unchanged. An invalid JSON record returns `AMX4003` with the entry file and the input declaration's original-document line 5. An existing sibling module outside the canonical entry root is rejected with `AMX5001` and the containment message.

**Implementation boundary:** `ModuleLoadOptions.entryText` is parsed with `parseDocumentText` only for the canonical entry path. Dependencies continue to be read from disk by the existing module loader. Existing path containment and data validation remain the only implementation. This proves execution compatibility for file-backed current buffers; untitled buffers and a full desktop RPC-to-core invocation were not exercised.

**Disposition:** Direct core reuse is sufficient for the planned current-buffer path; no CLI subprocess fallback is indicated by this spike.

## Electrobun + Vue + shadcn-vue

**Hypothesis:** The selected stack can build an isolated Vue webview and run a Bun main process with a typed webview-to-main request/response while keeping privileged operations out of the webview.

**Smallest setup:** `desktop-app/` was scaffolded from `bunx electrobun@2.0.1 init desktop-app --template=vue --skip-install`, switched to `build.mainProcess: "bun"`, and given a single typed `ping({ nonce })` RPC returning `{ nonce, runtime: "bun", version }`. The webview calls it on mount and by button; the main process logs the nonce. shadcn-vue components/helpers are owned under `src/mainview/components` and `src/mainview/lib`; `.hutch/devkit` is reserved for the generated Electrobun SDK.

**Passing isolated commands:** from `desktop-app/`, `bun install --frozen-lockfile` completed; `bun run test` passed (2 payload assertions); direct `bunx vue-tsc --noEmit` passed with the generated SDK projection; direct `bunx vite build` passed (625 modules transformed, local fonts bundled). After correcting shadcn aliases, the generated Button and `cn` helper stayed under `src/mainview`; no UI alias points into `.hutch`. The webview CSS was checked to remove the shadcn CLI's regenerated Google Fonts request. The payload test alone is not a substitute for the native transport round trip.

The final app tsconfig no longer extends `.hutch/devkit/tsconfig.json` and does not set deprecated `baseUrl`; it declares only the two Electrobun SDK entry paths plus the relative `@/*` app-source alias. Direct `bunx vue-tsc --noEmit` passed with this config. Hutch prepare still times out after this change, proving that the generated-tsconfig inheritance and shadcn alias were not the cause of its internal wait.

**Hutch preparation behavior:** `hutch --version` returned 0.27.1. `hutch electrobun prepare` and package-script preparation still time out after 60 seconds. A bounded `strace` showed Hutch parsing `hutch.config.ts`, running the generated config loader, reading the Electronbun config and both TypeScript configs, and receiving the serialized merged app config; it then remained blocked in internal IPC/poll/futex waits. Running the generated loader directly under Bun and Cottontail both printed the valid merged config and exited. The trace contained no shadcn component lookup: those components now resolve from `src/mainview`. Removing stale empty project lock files did not change the prepare timeout. No root cause for the Hutch post-config wait is confirmed.

**Native build and launch:** `hutch electrobun build --env=stable` timed out after 60 seconds. A development bundle exists at `build/dev-linux-x64/OpenAMXDesktopSpike-dev/` and includes the Bun runtime, native wrapper, generated HTML/assets, and main-process bundle. Direct launch:

```sh
cd build/dev-linux-x64/OpenAMXDesktopSpike-dev/bin
LIBGL_ALWAYS_SOFTWARE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1 ./launcher
```

On Bun 1.4.0, the launcher logged native wrapper startup, X11 shortcut-loop readiness, `OpenAMX desktop proof running`, and six typed `ping` request nonces from the webview. `xwininfo` observed an `OpenAMX Desktop Spike` window at 720x520. The app later logged a clean event-loop exit; a persistent interactive session was not established. Without the software-rendering variables, WSL emitted `GLXBadWindow`; with them that error did not recur. ImageMagick root capture failed with `Resource temporarily unavailable`, so no screenshot is claimed. The typed native request/response and Bun runtime integration are proven; persistent WSL window behavior is not.

**Native prerequisites observed:** Electrobun's official Linux docs list GTK 3, WebKitGTK 4.1, Ayatana AppIndicator, and librsvg. The owner installed these runtime packages; `dpkg-query` reports WebKitGTK and JavaScriptCoreGTK 2.52.6, Ayatana AppIndicator 0.5.93, and librsvg 2.58.0 on Ubuntu 24.04.4 WSL2. `LD_LIBRARY_PATH` set to the Electrobun release directory resolves the native wrapper/core dependencies. `pkg-config` lacks WebKitGTK development metadata because `libwebkit2gtk-4.1-dev` is not installed; this did not prevent the generated native bundle from launching directly.

**Platform matrix:** Ubuntu 24.04.4 WSL2: direct Vue checks and bundled app launch/typed RPC passed; an X11 window was observed at 720x520; persistence and screenshot were not verified. Hutch package prepare/build/dev commands remain blocked. Native Ubuntu 24.04+: unverified. macOS 14+: unverified. Windows 11+: unverified. No platform is inferred from a different target.

**Blocker and review gate:** The native RPC proof now passes through direct bundle launch, and the source-owned Vue/shadcn webview build passes. However, package `typecheck`, `build:web`, `build`, `dev`, and `run` scripts depend on Hutch preparation; prepare still hangs after config serialization, the package build command times out, and a stable normal-window session is not confirmed. Preserve the selected must-have. Lead Developer options are (1) diagnose Hutch's post-config IPC wait and repeat the package command gates; or (2) explicitly approve accepting the direct native-bundle/RPC proof while deferring scripted dev/build/watcher reliability and persistent-window verification, keeping any residual platform acceptance open. No framework alternative or scope reduction was adopted.

**Post-package-update recheck (2026-09-29):** The owner installed the Ubuntu runtime packages. `dpkg-query` now reports `libwebkit2gtk-4.1-0` and `libjavascriptcoregtk-4.1-0` 2.52.6-0ubuntu0.24.04.1, `libayatana-appindicator3-1` 0.5.93-1build3, and `librsvg2-2` 2.58.0+dfsg-1build1 installed. GTK's shared library resolves; `pkg-config` still has no WebKitGTK development metadata because `libwebkit2gtk-4.1-dev` is absent. `LD_LIBRARY_PATH` set to Electrobun's release directory resolves its bundled `libasar.so` and all native wrapper/core dependencies. This clears the previously recorded missing-runtime-library blocker.

The matching Hutch 0.24.3 binary paired with Electrobun 2.0.1 was then run directly: `hutch --version` returned `0.24.3`, but `hutch electrobun prepare` again produced no output and timed out after 60 seconds; it was terminated. Global Hutch 0.27.1 also previously stalled. The attempt left `desktop-app/.hutch/devkit/tsconfig.json` absent, so the latest `bun run typecheck` failed at configuration loading (`TS5083`) and the following desktop checks in that chained command did not run. Earlier isolated typecheck, RPC payload check, and Vite build passes were obtained before the devkit projection disappeared. No updated native build, window launch, or actual RPC round trip has been verified.

**Updated disposition:** System runtime dependencies are no longer the blocker. Source-owned shadcn aliases resolve and the direct native bundle completes typed Bun RPC, but Hutch's scripted prepare/build/dev path and persistent WSL window are not fully verified. Sprint 020 remains open for Lead Developer review; do not claim full acceptance until the package command gates and stable app workflow are resolved or explicitly dispositioned.

**Post-alias-fix command recheck:** `bun install --frozen-lockfile`, `bun run test`, direct `bunx vue-tsc --noEmit`, and direct `bunx vite build` passed. Package `bun run typecheck` still waits on `hutch electrobun prepare`; package `bun run build:web` now correctly invokes prepare first and is blocked by the same wait. The shadcn source alias/build itself is verified and no longer depends on a component tree inside `.hutch`.

## Offline PDF Comparison

**Hypothesis:** A pure-JavaScript report generator can create a local, searchable PDF with deterministic tables, static chart graphics, and explicit page breaks without starting a second browser runtime.

**Representative content:** `desktop-app/spikes/pdf/representative-report.html` contains report headings, a 24-row risk register, an inline SVG static chart, and an appendix with an explicit page break. `pdfmake-proof.ts` produces equivalent structured content using local SVG and tables. The pdfmake proof denies URL access and permits local access only to its package-bundled Roboto font files. `pdfjs-dist` extracts text, page count, and every table row.

**pdfmake command/result:** `cd desktop-app && bun run spikes/pdf/pdfmake-proof.ts` passed on Bun 1.4.2/Linux x64. Output: 22,702 bytes, 2 A4 pages, all 24 searchable table rows on page one, appendix on page two, headings and table text extractable. Body text is 9 pt and table text 8 pt using local Roboto. Explicit page break and inline SVG static chart rendered. This is structural pagination/readability evidence, not a human visual review or cross-platform font-metric guarantee.

**Chromium comparison command/result:**

```sh
google-chrome --headless --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --no-pdf-header-footer --print-to-pdf=artifacts/chrome-proof.pdf \
  file://$PWD/spikes/pdf/representative-report.html
bun run spikes/pdf/inspect-pdf.ts artifacts/chrome-proof.pdf
```

Chrome 152.0.7977.82 produced a searchable 62,485-byte, 3-page PDF. pdfjs verified all 24 rows, a repeated table header on page two, and the explicit appendix page break on page three. Chrome emitted a non-fatal WSL DBus/UPower warning. Its output pagination differs from pdfmake and depends on a separately installed/patched browser. The run used a local HTML fixture and inline SVG; no remote assets were requested. System-level background networking was not blocked or measured.

**Selection:** Select pdfmake 0.3.11 for Sprint 023: it passed the representative Bun/Linux proof, supplies flow layout, repeated table-header support, SVG vectors, page breaks, and local fonts without a browser process. Chrome remains a comparison, not a runtime dependency. The proof does not establish accessibility tagging, PDF/A, every long-row behavior, visual parity, or production API compatibility; Sprint 023 must cover these limits. pdfmake's package metadata declares MIT; the installed package did not include a separate license file with its bundled Roboto font files. Verify font redistribution terms or replace them with approved redistributable fonts before production embedding. DOCX is not proven editable by either spike and remains an optional, non-blocking stretch only.

## Cleanup and Compatibility

- Desktop dependencies, scripts, lockfile, Vite output, tests, and Electrobun configuration are isolated under `desktop-app/`; root and `vscode-extension/` package scripts were not changed.
- Generated PDFs are ignored in `desktop-app/artifacts/`. No native application build artifact or machine-local path/configuration is part of the prototype.
- `bun run build:web` is only the webview build. It is not reported as an Electrobun package build.
