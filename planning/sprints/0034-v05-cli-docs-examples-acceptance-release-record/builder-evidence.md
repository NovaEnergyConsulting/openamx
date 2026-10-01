# Sprint 034 Builder Evidence (2026-10-01)

## Disposition

**V0.5 feature milestone: COMPLETE/ACCEPTED WITH RECORDED EXCEPTIONS (2026-10-01), NOT RELEASED.** By explicit Lead Developer direction, pending product and visual items are deferred to V0.6. This does not mean every criterion passed. Browser review found mobile horizontal overflow when source is visible (F1 document width 1023 px at a 345 px content viewport; F3 is 14160 px). Named DOCX/native desktop observations remain unverified. Owner: Lead Developer / V0.6 backlog; recheck at V0.6 acceptance (calendar date TBD).

**Release engineering: OPEN.** Native macOS 14+, Windows 11+, native Ubuntu 24.04+, Hutch package/native launch, broad Office compatibility, project license and Marketplace publication remain separate release gates. The local VSIX is not publication; WSL2 is not native Ubuntu evidence.

## Environment And Commands

- Host: Ubuntu 24.04.4 under WSL2, x86_64; Bun 1.4.2; Node 24.20.0; Google Chrome 152.0.7977.82. Extension tests used VS Code 1.85.0.
- Root `bun run build`: passed (`tsc`). Root `bun test`: **200 passed, 0 failed, 857 assertions, 16 files**.
- Focused `bun test tests/examples.test.ts`: **5 passed, 67 assertions**; verifies `run`, HTML, PDF and DOCX for the typed example. `bun test tests/reportPreparation.test.ts`: **5 passed, 19 assertions**. `bun test tests/reportIdentityCli.test.ts`: **3 passed, 26 assertions**. `bun test tests/outputCli.test.ts`: **8 passed, 50 assertions**.
- Desktop `cd desktop-app && bun run test`: passed. Direct contract output included typed RPC/webview boundary (4 assertions), desktop session (11 assertions), workflow precedence/validation/current-buffer/HTML/PDF safety, and Sprint 029 picker/tab/session/conflict/quit checks. `cd desktop-app && bunx vue-tsc --noEmit`: passed. `cd desktop-app && bunx vite build`: passed, 650 modules; 745.66 kB JS / 256.73 kB gzip with the existing >500 kB chunk warning. No Hutch command or native launch was run; prior Lead Developer direction not to run Builder Hutch checks remains in force.
- `cd vscode-extension && bun run compile`: passed. `cd vscode-extension && bun run test`: **18 Development Host tests passed** on VS Code 1.85.0. The host logged a portal Settings interface warning and an unrelated `ms-python` proposal warning; neither failed tests.
- Local package command: `cd vscode-extension && bunx vsce package --no-dependencies --skip-license --out /tmp/openamx-vscode-0.4.0.vsix`; 6 files, 77.92 KB (79,786 bytes), bundled JS 376.36 KB. Artifact SHA-256: `bd84742bb04c324e7f4504e581e0cc61d9422e9a18a709d174362d8a4f946be1`. The previously approved missing-license bypass was used only for this local package. `code --install-extension /tmp/openamx-vscode-0.4.0.vsix --force`: succeeded; installed ID/version is `engineerstools.openamx-vscode@0.4.0`. The installed artifact was loaded via `OPENAMX_EXTENSION_PATH=/home/cgamez/.vscode-server/extensions/engineerstools.openamx-vscode-0.4.0 node ./out/vscode-extension/src/test/runTest.js`; **18 tests passed**. No VSIX was published.
- CLI alignment: `bun run src/cli.ts --version` reports `openamx/0.4.0`, matching root and extension package metadata. `bun run src/cli.ts export --help` lists `--out`, repeated `--input`, `--validation`, and `--project-root`.
- README's temporary-project `run`, `render`, `export pdf`, and `export docx` command block was executed verbatim and succeeded. It produced outputs in `/tmp/openamx-readme-v05.IW6vXb`.
- `git diff --check`: passed after final planning-record edits.

## Fixture Construction And Commands

Temporary fixture root: `/tmp/openamx-sprint034-review-PHuQ7n`. It is outside the repository and contains no private input paths. F0 copies `hello-world.amx`. F1 copies the new typed example, its two local libraries and three existing typed data files, with a version-1 project report config and a locally authored 320x80 SVG mark rasterized to PNG by `sharp@0.35.5` (no third-party image/font content). F2 extends the existing fleet frontmatter with author/status/classification and `sourceVisible: false`, while project config sets true; a fixture-only executable block adds a table/chart from existing values. F3 contains 55 table rows, a chart, and an explicit page break. F4 contains six isolated configs/assets: missing, symlink, traversal, PNG bytes under `.jpg`, oversized and malformed. F5 contains valid field/logo overrides and invalid string `sourceVisible`. F6 contains a two-file project and missing-input fixture; desktop UI states were not simulated as native observations.

The report-generation commands used the production CLI after `bun run build`; representative exact forms were:

```sh
bun run dist/cli.js render "$review/F0/hello-world.amx" --out "$review/F0/report.html"
bun run dist/cli.js run "$review/F1/v05-asset-screening.amx" --input "asset=$review/F1/data/typed-asset.json" --input "screenings=$review/F1/data/typed-screenings.csv"
bun run dist/cli.js render "$review/F1/v05-asset-screening.amx" --out "$review/F1/report.html" --project-root "$review/F1" --input "asset=$review/F1/data/typed-asset.json" --input "screenings=$review/F1/data/typed-screenings.csv"
bun run dist/cli.js export pdf "$review/F1/v05-asset-screening.amx" --out "$review/F1/report.pdf" --project-root "$review/F1" --input "asset=$review/F1/data/typed-asset.json" --input "screenings=$review/F1/data/typed-screenings.csv"
bun run dist/cli.js export docx "$review/F1/v05-asset-screening.amx" --out "$review/F1/report.docx" --project-root "$review/F1" --input "asset=$review/F1/data/typed-asset.json" --input "screenings=$review/F1/data/typed-screenings.csv"
bun run dist/cli.js render "$review/F2/asset-fleet-risk-analysis.amx" --out "$review/F2/report.html" --project-root "$review/F2"
bun run dist/cli.js export pdf "$review/F2/asset-fleet-risk-analysis.amx" --out "$review/F2/report.pdf" --project-root "$review/F2"
bun run dist/cli.js export docx "$review/F2/asset-fleet-risk-analysis.amx" --out "$review/F2/report.docx" --project-root "$review/F2"
bun run dist/cli.js render "$review/F3/multi-page.amx" --out "$review/F3/report.html" --project-root "$review/F3"
bun run dist/cli.js export pdf "$review/F3/multi-page.amx" --out "$review/F3/report.pdf" --project-root "$review/F3"
bun run dist/cli.js export docx "$review/F3/multi-page.amx" --out "$review/F3/report.docx" --project-root "$review/F3"
```

F0 also exported PDF/DOCX. F5 rendered/exported all three formats with project root and absolute input mappings from F1. F4 invalid variants and F5 invalid frontmatter were run through `render` with pre-existing `sentinel-*` outputs: each returned `AMX6001`, retained its sentinel bytes, and did not print the temporary fixture root. The focused identity CLI test separately proves existing HTML/PDF/DOCX outputs survive invalid selected project identity.

## Input And Artifact Hashes

SHA-256 values below identify the copied review inputs and generated outputs in the temporary root. The generated PNG has no independent license; its provenance is recorded above. The equivalent repository example inputs are also covered by `tests/examples.test.ts`.

| Fixture | Input/config/data/logo SHA-256 |
| --- | --- |
| F0 source | `hello-world.amx` `3bd400b732f818d496af38114f76c27cb1770b53844a96d1d5f6b11caab2fa7f` |
| F1 source and libraries | entry `8427ca9811c43be70283145aad48863b57ed23503e344ceebcae1a7f6f43549b`; asset library `2d6600403e028cb101955cecee56019e6e28408a2744a831538e65e884a50dd1`; screening library `963ac66453ff098ef46a715eb8a2c1900ecd87f79632b859eb36c3e062ae5733` |
| F1 data | asset JSON `11aba99268f89b282e2fdeadc660be88cdcc7466f7ca1373426ef5e8b3d7b3da`; screenings CSV `36199c5455c224c205f1e43d64d0b0ee4b4e3a983cc3f7e75d184208b6cdab8a`; reviewed-at JSON `49335a83af04927575f6f5273629011c06c96c1dd13d42e22ac42b3b080f1178` |
| F1 project config/logo | config `c8d9012661d281e78bfd34bf699e8686c164de4610ddb484e55d633ea6665bca`; PNG `0540ba2a877ab2f1a3da5592aebe8a9f6ab5658dd1e9094575bb010d400f9d5c` |
| F2 source/config | source `836e7fe8d080a7aac14a8f1298cfc4aa19e27e21d466ba52741880fddd020b9f`; config `0790d85893536b7707d7aaae4be10174f65a906f56456e185e8379dc82689f0b` |
| F3 source/config/logo | source `bfd1c560145e11908533cc82e58697063ea4daa52bb2d7cbf5b6d30919e11629`; config `c8d9012661d281e78bfd34bf699e8686c164de4610ddb484e55d633ea6665bca`; PNG `0540ba2a877ab2f1a3da5592aebe8a9f6ab5658dd1e9094575bb010d400f9d5c` |
| F4 config hashes | missing `7f703b3ea014b7ff3c9d83fd9a2e4aa62108a0e1b9dfc9395b0d046b31244815`; symlink `6beb22b986e548a257c54eacbd8698bce1147d1f17386afa187ab33d066bc850`; traversal `4ec22ba01641d99db2548aadb7d7a904084fd4d640b9ca0ed10d0e0fc2f5adc1`; suffix mismatch `7729ff9995c28d4ac68c2865f1a20aee0f142a53709ccf6cf5b089aca36317b2`; oversized `117a09fbcf1d9cfd3626f0af11afcbe831b539bf98396452fb2acd77c5bdfb42`; malformed `a2a4f1b60a4c83e911a8a56cdb847e11a50eae101cf7859a8db65cc565f0ae7e` |
| F4 invalid asset hashes | mismatched `.jpg` `0540ba2a877ab2f1a3da5592aebe8a9f6ab5658dd1e9094575bb010d400f9d5c`; oversized bytes `b27a032984ea8a6bec700c3d6f63f8fcfbf8ff8ef87e972891feda4eea4aad0c`; malformed bytes `5464533c9647b67eb320c40ccc5959537c09102ae75388f6a7675b433e745c9d` |
| F5 source/config/logo | valid override source `a706bd2ce6b32e4a62c7c930125de8d16ba4e6a3f868b4fe988225a806b5c8cf`; invalid source `af031492782c10842b9f8a6e72a9a6cd159d3b9b5c217669d56946cb85142639`; config `c8d9012661d281e78bfd34bf699e8686c164de4610ddb484e55d633ea6665bca`; both logos `0540ba2a877ab2f1a3da5592aebe8a9f6ab5658dd1e9094575bb010d400f9d5c` |
| F6 source/config/input | entry `a34f3cb3eec68b5240700e9b2abb4942d060cac4c2ef061a541007dc059c565d`; dependency `d40d90d784bc959ebc43482971ed0a7cd520957cd976b9ab8e1e7ae3270b7f8c`; config `508cd8fa01dd7ddfa85681c257d69071651f8c51442d9dca6a6161ee834224d6`; missing input `bc3d6b1deb39795d8ded41261f5bc5c07a7490266be31faeed5a2aab69cbcc7f` |
| Repository example/config | `examples/v05-asset-screening.amx` `8427ca9811c43be70283145aad48863b57ed23503e344ceebcae1a7f6f43549b`; `examples/v05-project.json` `b72415d60243ea32421859d491d3012320d70303b27e6c1577d9b87cc091f935` |

| Fixture | Generated artifact SHA-256 |
| --- | --- |
| F0 | HTML `0d033a746b944522c630bc112b1497ae265721d22b801aa89fc053887d71abe0`; PDF `fa661e8eebec704723a57e268174dd437fed8a2ae5a6f307f284a57300df5287`; DOCX `62c5228d33b8cb2d3f0c9d3354bc45acc2c714a037bfc0ff8a8178b95dcec6a9` |
| F1 | HTML `8bdacebdec113875dfe0311b147872ef9a50c3dee7644cfd76dde748742265b6`; PDF `1ca8c41cca2dd1e1b30982c841554d2ad10cd320d0295d0355d099064a972781`; DOCX `cfa9054861f477068456b30d3ecfa9e8776e4b1d62ed2a799b08d0f0596bf7ef` |
| F2 | HTML `b7b588f9d5c99b263a285ad43776687c69bcccafc69a3aeaccbbb7adf2da99d6`; PDF `8a56582d1e93fcf42ae1dbfbcafb01d2760eccb58783be69265522f5b609dbbf`; DOCX `eb03201f6dde65d565c448c7865550edff4d25e1da9d9756e5ea209c49d33ca4` |
| F3 | HTML `bbec6df8d6e9ee14546667e3613014e07404cf9b585bc91f21632c19a8a18b1c`; PDF `9952afd518db31f450e425fce59f06933f3777c7281aef6983207ce019700ffc`; DOCX `829482588f6b95a847b6ed9d90cf5cb033d08007793c88ff2cd2d5ba4e18d027` |
| F5 | HTML `06a0caf654b52b3db482be532bd44e62d31689f6c0a22b5f1cb8f8498931266d`; PDF `35ad17903833d02bd1d0f14027b4821eb4edb889272935a447c09221156d0428`; DOCX `51825265d4e819295ed2a1bb27057653574da07ea9223ce9fd63df9e26a50ab1` |

## Visual Observations And Blockers

- F1 HTML opened in Chrome 152.0.7977.82. At 1280x720, document width was 1265 px against a 1265 px content viewport. At 360x800, content viewport was 345 px but document width was 1023 px because the visible AMX listing contains an unwrapped long source line. The actual browser screenshot was captured in the VS Code browser session but was not persisted as a repository artifact.
- F2 HTML opened at 360x800: content/document width 345 px, no source `<pre>` nodes, two view emissions remained visible, and the table/chart data remained ordered. This is a Builder browser observation, not Lead Developer sign-off.
- F3 HTML at 360x800 had a 14160 px document width from its long generated source line. This confirms source-visible mobile overflow also affects the multi-page fixture.
- Chrome's built-in PDF viewer was opened for the generated F3 PDF. No independent named PDF/Office application is installed (`evince`, `okular`, `libreoffice` unavailable); no PDF/DOCX round-trip visual acceptance is claimed. DOCX structural tests and OOXML inspection do not replace a named viewer review.
- The desktop host is Ubuntu under WSL2; native desktop/window/dialog, screen-reader, high-contrast and 200% zoom review was not performed. Direct RPC tests are not visual/native evidence. F6 stays Blocked for manual desktop review.
- No persisted capture path or named viewer observation is available for DOCX/native desktop. These are accepted exceptions deferred to V0.6, not visual passes.

## V0.6 Deferred Work

- Sprint 033 apply-time `WorkspaceEdit` limitation: accepted bounded exception; Lead Developer / V0.6 backlog to assess and implement any safer apply-time workflow, recheck at V0.6 acceptance (calendar date TBD).
- Sprint 029 native project/save/close/quit and populated accessibility: Lead Developer / V0.6 backlog to schedule native-host verification and any remediation; recheck at V0.6 acceptance (calendar date TBD).
- Sprint 030 AMX highlighting, import-aware analysis, UI-state coverage and native accessibility: Lead Developer / V0.6 backlog to schedule implementation/verification; recheck at V0.6 acceptance (calendar date TBD).
- Visual follow-up: Lead Developer / V0.6 backlog to address F1/F3 360 px source-visible overflow and complete named DOCX/native desktop review; recheck at V0.6 acceptance (calendar date TBD).
- Release engineering remains separate: native macOS/Windows/native Ubuntu, Hutch package/native launch, broad Office, license and Marketplace.
