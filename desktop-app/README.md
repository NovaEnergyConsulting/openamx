# OpenAMX Desktop Architecture Spike

This isolated Electrobun 2.0.1 + Bun + Vue 3 + shadcn-vue package proves a narrow typed `ping` RPC contract. The Vue webview has no filesystem or AMX execution API. Fonts and UI dependencies are bundled locally. This is not a production authoring workflow.

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

All commands are isolated from root and VS Code extension scripts. `test` is a Bun-only payload assertion. Typecheck, webview build, native build, dev, and run require Hutch to prepare the SDK. shadcn components and helpers are source-owned under `src/mainview`; only Electrobun SDK imports use `.hutch/devkit`. In the recorded WSL2 host, direct typecheck/Vite checks passed once a projection existed, and the bundled app completed a typed RPC round trip; Hutch's prepare wrapper continued to time out. See the Sprint 020 spike results for exact commands and outcomes.

## Native Prerequisites

Electrobun's Linux runtime requires GTK 3, WebKitGTK 4.1, Ayatana AppIndicator, and librsvg. Ubuntu/Debian package names are `libgtk-3-0`, `libwebkit2gtk-4.1-0`, `libayatana-appindicator3-1`, and `librsvg2-2`. Native builds must run on their target operating system. Official release targets are macOS 14+, Windows 11+, and Ubuntu 24.04+; none is claimed complete by this WSL2 prototype.
