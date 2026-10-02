# Sprint 041 Candidate Host Check

This is a disposable Electrobun proof app with a separate app identifier. It does not modify the OpenAMX desktop package or its production dependencies.

## Launch

From the repository root:

```sh
cd desktop-app/spikes/sprint041-data-editor-proof
bun install
bun run host:run
```

The first run prepares the Electrobun 2.0.1 SDK, builds the isolated Vite view, creates the dev app, and launches a window titled **OpenAMX Sprint 041 Data Editor Proof**. If `host:run` reports a configuration or SDK error, retain the full output; do not add these candidates to `desktop-app/package.json` as a workaround.

## CSV Grid

1. Confirm empty/loading and other default grid labels appear in English. Click **Load rows** and wait for the viewport measurement. Confirm rows render and the window remains responsive.
2. Click the first Asset cell, type `IME-日本語-東京` using the host operating system's real input method, and press Enter. Confirm the completed composition is present once in the cell.
3. With the grid focused, test Arrow, Enter, Tab, Ctrl+Z and Ctrl+Y. Confirm navigation, edit commit, undo and redo affect the expected cell and do not move the whole page unexpectedly.
4. Scroll to the end of the grid and confirm row 100000 is reachable. Record any long pause, blank region, lost edit, or unexpected row count.

## JSON Tree

1. Toggle the `active` boolean in the tree and confirm the raw source changes to the matching value.
2. With the tree focused, test Ctrl+Z and Ctrl+Y and confirm source/tree values stay synchronized.
3. Replace the raw source with `{"items":[,broken`. Confirm the exact text remains visible and the tree switches to its unavailable state. Restore valid JSON and reopen structured mode.

## Record

Send back the OS/session type, keyboard and IME results, any focus or composition issue, the viewport timing displayed by the proof, and whether Ctrl+Z/Ctrl+Y worked in both editors. Native IME results apply only to this proof host and OS; they do not certify other platforms or formal accessibility.