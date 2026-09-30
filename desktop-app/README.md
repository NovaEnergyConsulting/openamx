# OpenAMX Desktop Authoring Foundation

This isolated Electrobun 2.0.1 + Bun + Vue 3 + shadcn-vue package provides the Sprint 024 desktop authoring foundation. The Bun main process owns project paths, file reads/writes, module loading, parsing, checking, formatting, and HTML preparation. The Vue webview receives only typed payloads and has no filesystem, Bun/Node, shell, evaluator, module-loader, input-loader, or PDF capability.

shadcn-vue components and helpers are application source under `src/mainview/components` and `src/mainview/lib`. `.hutch/devkit` is reserved for Hutch-generated Electrobun SDK files; never place application components there because Hutch may replace that projection.

TypeScript and Vite resolve only Electrobun API imports through explicit aliases into the generated SDK projection; shadcn imports use the source alias `@/`. The app tsconfig does not extend Hutch's generated tsconfig, so application paths and compiler settings remain source-owned. Run a Hutch prepare before standalone typecheck or Vite use; package scripts do this before loading the SDK-aware config.

## Commands

Run from `desktop-app/`:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run build:web
bun run build
bun run dev
bun run run
```

All commands are isolated from root and VS Code extension scripts. The focused contract test exercises typed payloads, canonical project containment, local listing, dirty/current-buffer preview, conflict-safe save, and parser diagnostics. `openProject`, `openDocument`, `listProjectFiles`, `readDocument`, `updateBuffer`, `saveDocument`, `formatBuffer`, `analyzeBuffer`, and `previewBuffer` are main-process operations. Preview uses the exact current buffer through the shared loader and renderer; it does not substitute saved text.

Direct `bunx tsc --noEmit --skipLibCheck` and `bunx vite build` are useful checks when Hutch preparation is unavailable. The package scripts that invoke Hutch (`typecheck`, `build:web`, `build`, `dev`, and `run`) retain the known Sprint 020 post-config timeout residual. Record that result rather than treating a direct Linux check as native platform acceptance.

Sprint 025 owns input mappings/default precedence, current-buffer run/result state, HTML/PDF actions, and desktop export. This package intentionally stops at authoring, diagnostics, and live HTML preview.

## Native Prerequisites

Electrobun's Linux runtime requires GTK 3, WebKitGTK 4.1, Ayatana AppIndicator, and librsvg. Ubuntu/Debian package names are `libgtk-3-0`, `libwebkit2gtk-4.1-0`, `libayatana-appindicator3-1`, and `librsvg2-2`. Native builds must run on their target operating system. Official release targets are macOS 14+, Windows 11+, and Ubuntu 24.04+; none is claimed complete by this WSL2 prototype.
