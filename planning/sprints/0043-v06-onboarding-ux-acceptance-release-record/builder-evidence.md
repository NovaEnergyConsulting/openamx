# Sprint 043 Builder Evidence

## Disposition

**Builder implementation: PARTIAL; Lead Developer closeout pending.** Delivered searchable bundled Help, guided first-project starters, preferences, V0.5 entry-state migration, privacy-limited diagnostic summary download, product naming/documentation alignment, and focused evidence. Do not mark Sprint 043 complete yet: an integrated cross-feature fixture, repeatable 100k edit/history/cancel/fallback evidence, full visual-state matrix, and explicit Lead Developer usability/visual disposition remain open. The timing-policy change recorded on 2026-10-03 is applied as descriptive measurement only; no 3-second or 100-ms 100k gate is asserted.

V0.6 feature acceptance is **PENDING** separately from release status. Native macOS/Windows/Ubuntu, Hutch packaging/launch, broad Office, licensing/Marketplace, report-mobile overflow, VS Code apply-time action safety, and formal accessibility remain **OPEN**. No release-ready or native-certified claim is made.

## Delivered

- Welcome opens an offline searchable Help Center with first-project guidance, bundled Hello OpenAMX and Operations Note starters, AMX language essentials, project/import/data/preview/recovery help, keyboard shortcuts from the live command registry, release notes, and diagnostic-export privacy details.
- Starter source is installed through the active report buffer and existing autosave/update path. Core-backed tests parse/evaluate both examples without external inputs. Live preview follows the new active buffer; no explicit Run command is issued.
- Preferences control system/light/dark, bottom/right drawer docking, autosave enablement, and its 100-10,000 ms delay. Theme/layout remain machine-local; autosave uses the existing trusted RPC.
- Diagnostic download contains only product label, validated timestamp, bounded open/dirty tab counts, capped diagnostic-code counts, and at most 20 timestamp/code-only recent events. It excludes paths, messages, source, input values, recovery contents, and credentials. It is a diagnostic summary, not a raw process log.
- V0.5 session loading preserves only a safe `active` path and panel sizes, discards legacy `entry`, and rewrites normalized session state on restore. Tests prove an entry-only session opens no tab, restore starts no worker, and existing report bytes are unchanged.
- Desktop package/app display names no longer say “spike”; the frozen lock matches `openamx-desktop`. The unpublished development version remains `0.1.0`; V0.6 version alignment is deferred until full behavior and Lead Developer acceptance.
- Desktop README now documents active-document behavior, onboarding, migration, preferences, privacy, commands, and limits. Root CLI and VS Code semantics were not changed; historical V0.2-V0.5 contracts remain unchanged.

## Automated Verification

Host: Omarchy Linux x86_64, kernel `7.2.5-3-omarchy`; Intel Core Ultra 9 285H, 16 logical CPUs, 66,977,034,240 bytes RAM. Bun `1.4.2`; Node CLI `v24.14.1`; desktop package uses Vite `6.4.3` and Vue `3.5.41`.

- `bun run build`: passed (`tsc`).
- `bun test`: **245 passed, 0 failed, 1,104 expectations across 25 files**.
- From `desktop-app/`, `bun test src/bun/desktopDataEditor.test.ts src/bun/desktopSettings.test.ts src/bun/configuration.test.ts src/bun/jobWorker.test.ts src/mainview/diagnosticSummary.test.ts src/mainview/starterExamples.test.ts`: **23 passed, 0 failed, 126 expectations across 6 files**.
- From `desktop-app/`, `bun run test`: direct typed RPC/service contract passed, including migration and no-auto-run/no-overwrite checks; final active resources `[]`.
- `./node_modules/.bin/vue-tsc --noEmit`: passed.
- `./node_modules/.bin/vite build`: passed, 3,271 modules; JS `2,688.15 kB` / `835.84 kB gzip`; CSS `639.21 kB` / `108.91 kB gzip`; worker `29.07 kB`; shared parser `34.64 kB`. Existing Vite `>500 kB` chunk warning remains.
- `bun install --frozen-lockfile`: passed, 628 installs across 686 packages, no changes.
- Browser harness build: Vite `6.4.3`, 3,269 modules; JS `2,682.75 kB` / `834.56 kB gzip`; CSS `627.83 kB` / `106.75 kB gzip`. Existing chunk-size warning and expected outDir-outside-root warning were reported.
- `git diff --check`: passed before this evidence update; rerun after final planning edits.
- A workspace-wide VS Code test discovery traversed generated Hutch proof SDK internals: 651 passed, 23 failed due absent generated native SDK source files and one SDK test expectation. These are not OpenAMX-owned tests. Canonical root and desktop-owned suites above passed.
- A first desktop glob attempt was rejected by Bun before test discovery; it is not counted as a test result.

## Integrated Browser Review

Actual viewer: VS Code integrated Chromium, VS Code `1.139.1`, Chrome `150.0.7871.250`, Electron `43.6.0`, on the Linux host above. It is not the Electrobun app host and does not certify target-native behavior.

- At `1024x720`, Help search opened the AMX language topic, Help/Preferences dialogs rendered, preferences changed theme and drawer dock through fake RPC, and the guided starter created an editable active `report.amx` with the expected Hello OpenAMX source.
- At `1440x900`, Help showed the searchable topic list, command shortcuts, starter action, and release-note caveats without visible overlap. At `1024x720`, the longer Help list scrolls within the dialog and does not clip topics; the active topic and shortcut area remain usable.
- Light-theme primary foreground was corrected to white on the green accent. System mode followed the host dark preference; dark mode uses a dark foreground on lime accent.
- Diagnostic export action completed in the harness and announced the privacy scope. Utility tests verify serialization cannot include path/message/content fields and caps counts/events.
- Persisted PNGs are `help-system/light/dark-{1024x720,1440x900}.png`, `preferences-1024x720.png`, and `workbench-light-{1024x720,1440x900}.png` in this folder. System-mode captures hash-identically to dark because the named host reports a dark system preference. The desktop screenshot harness used fake RPC; it does not cover native dialogs, focus restoration, populated data/error drawers, all conflict/recovery states, keyboard-only end-to-end operation, or native acceptance.
- No native Electrobun viewer, OS/session matrix, screen reader, formal accessibility audit, or cross-platform review was performed. Owner: Lead Developer. Next action: complete the manual acceptance matrix on the available/native host and record viewer, OS/session, per-state keyboard/focus/contrast outcomes, and disposition.

## Performance

### 100 Relevant Project Files

Command: `bun run spikes/sprint035-feasibility/performance.ts` from `desktop-app/`. The fixture created 100 contained AMX files across 10 folders; listing returned all 100 in **0.53 ms**. Fixture script also measured 100,000-row CSV parse/validation at `80.019 ms`, CSV `1,388,899` bytes, 100,000 materialized rows, and process heap delta `23,859,204` bytes. The heap delta is process-wide, not an isolated parser allocation. Runtime in the script: Bun `1.4.2`, `process.versions.node` `26.3.0`; the separately installed Node CLI reports `v24.14.1`.

### 100,000-Row Editor

Harness: `desktop-app/spikes/sprint041-data-editor-proof/production.html`, mounted production `DataEditorPane`; Chromium viewport at the load samples was `792x829` (the same session was later set to `1024x720` for tail scroll). `performance.memory.usedJSHeapSize` was a non-standard browser-wide estimate, without forced GC or component isolation.

| Fixture | Bytes | First viewport | Complete | Long tasks observed | Rendered rows |
| --- | ---: | ---: | ---: | --- | ---: |
| CSV, 100,000 rows x 3 columns | 2,469,859 | 476.4 ms (parse 280.9, materialize 62.5, grid 133.0) | 479.0 ms | 290.0 ms | 11 |
| JSON array, 100,000 records x 3 fields | 5,569,842 | 365.7 ms (parse 176.7, materialize 37.7, grid 151.3) | 369.7 ms | 80.0, 328.0 ms | 11 |

After the initial JSON load, browser-wide heap estimate was `96,176,674` bytes of `4,395,630,592` reported limit. VXE inner scroll extent was `4,800,012 px`; scrolling the virtual handle reached rows `99,990` through `100,000` with 11 rendered rows. A selected JSON cell edit changed the final record value to `777` and raw serialization retained all 100,000 records (`7,969,842` pretty-printed bytes).

A second clean 100k JSON history run measured viewport/complete at `546.2/551.3 ms` (parse `332.5 ms`, materialize `29.6 ms`, grid `184.1 ms`), with 11 rendered rows. Editing the last row changed `29.9` to `777`; Undo restored `29.9` and Redo restored `777`. The longest-task entries observed through that edit/history sequence were `71`, `418`, `72`, `223`, `798`, `849`, and `897 ms`. Browser-wide heap after the interaction was `300,836,871` bytes; this includes Chromium/application allocations and is not an isolated grid heap measurement.

The fresh 100,001-row CSV fallback measured `2,469,882` source bytes and `100,001` data rows. Raw text length and UTF-8 byte length were both `2,469,882`; the first record was `ASSET-000001,Review,0` and the last was exactly `ASSET-100001,Active,30`. The UI displayed `DESKTOP_DATA_LIMIT` and stated that no records were truncated. This demonstrates exact bounded fallback for this fixture.

A separate repeated raw/structured conversion stress session recorded multi-second tasks (`644`, `5,703`, `759`, `983`, `5,810`, `1,095`, and `1,659 ms`) and one complete load of `606.1 ms` without a first-viewport event. These results are retained as stress-session observations, not treated as representative first-load timings.

The generic trusted worker cancellation regression acknowledged cancellation in `0.02 ms` for a `3,250,001`-character, 250,000-row JSON validation fixture, observed worker close, and left no active resources. A PDF serialization cancellation acknowledged in `0.20 ms`, observed worker close, and preserved the destination. These are background job/service checks, not direct cancellation acknowledgement for a mounted 100k grid. RSS samples are process-wide/noisy and not isolated worker memory.

### Separate Budgets

- Project listing: `0.53 ms` for 100 AMX files, under the 1-second budget.
- Preview debounce: configured `400 ms`; inherited Sprint 042 browser sample measured stale-to-success `401 ms`. Current worker preview sample was approximately `132 ms` including worker startup.
- Cancellation: worker acknowledgement samples above are below 250 ms; no 100k mounted-grid cancellation timer was captured.
- Background analysis/validation/export main-thread long-task budget: not independently measured with a representative integrated load. The 100k grid timing exception is not applied to this budget.
- 100k 3-second viewport and 100-ms task values remain descriptive only under the 2026-10-03 decision. Explicit measured-interaction usability disposition remains pending because history, mounted-grid cancellation, and fresh fallback were not all verified in this run.

## Integrated Acceptance Gap and Residuals

The direct RPC contract covers project creation, recovery, trash, imports, settings/input precedence, editor/RPC authority, external data privacy, conflicts, cancellation, and all five output formats across focused scenarios. It does not run a single clean project identity through every requested cross-feature transition. Owner: Sprint 043 Builder / Lead Developer. Next action: run an isolated integrated fixture across unsaved multi-module imports, mappings/settings, refactoring, CSV/JSON, preview/cancel, five formats, conflict/trash/recovery, and injected no-write failures; record fixture hash and every output sentinel.

| Residual | Status | Owner | Next action / review point |
| --- | --- | --- | --- |
| Single integrated cross-feature fixture | OPEN | Sprint 043 Builder / Lead Developer | Run the full accepted workflow on one isolated project and record stale/failure/no-write assertions before feature closeout. |
| 100k edit/history and >100k fallback | VERIFIED in available browser | Sprint 043 Builder | Clean component probe passed edit/Undo/Redo and exact 100,001-row CSV fallback. Keep timings descriptive; retain full raw measurements above. |
| Mounted-grid cancellation | OPEN | Sprint 043 Builder / Lead Developer | Directly supersede/cancel a mounted 100k parse/edit and prove no stale publish plus bounded acknowledgement; current 0.02 ms cancellation evidence is a background worker validation, not the grid. |
| Qualitative 100k usability acceptance | PENDING | Lead Developer | Review the measurements and complete interaction evidence; explicitly accept or assign a bounded remediation. |
| Full visual/keyboard/focus state matrix | PARTIAL | Lead Developer | Review saved screenshots and test keyboard/focus, dialogs, drawers, dense/error/conflict/recovery states on available host; do not infer native or formal accessibility. |
| Native macOS/Windows/native Ubuntu and Hutch package/launch | OPEN | Release owner / Lead Developer | Run directly on named target hosts; browser/WSL/service checks are not substitutes. |
| Office compatibility, project license/Marketplace | OPEN | Release owner / project maintainers | Record explicit license decision, publication status, and named Office viewer round trips. |
| V0.5 report mobile overflow and VS Code apply-time action safety | OPEN | Lead Developer / report and extension maintainers | Separate approved follow-up or explicit exception disposition; no changes made in this sprint. |
| V0.6 version bump and public release metadata | DEFERRED | Lead Developer / release owner | Align version only after integrated feature acceptance and explicit closeout; current package remains development `0.1.0`. |
| V0.6 feature/release dispositions | PENDING | Lead Developer | Record feature status independently from the open release ledger above. |

## Artifact Hashes

- Desktop production JS `desktop-app/dist/assets/index-0drtozDV.js`: `a28c907ac99522620dc62f7f1b11808add923a391bf3e2dbc0dc6e08974a5e9e`.
- Desktop production CSS `desktop-app/dist/assets/index-B0HFU6go.css`: `a13cf0ce5370c9c86d638ba56e0a78c726b002f182c440efef5771bfd15e8c8a`.
- `help-dark-1024x720.png`: `bc71b57d8da81705f8d76e7a7f6e94b3ed466a42e73225d3278f1b39356ce98d`.
- `help-dark-1440x900.png`: `ba406b8554fc26526f45d38adbfa20b235e6f3ee61a84e3119568e5df80a0caa`.
- `help-light-1024x720.png`: `8320207f0dd80868d6e904ae2f204f624341dfb1f59974707480fe052b0f9e43`.
- `help-light-1440x900.png`: `a975990d9d41ae3cbd79c12e309f8ee4eedbb7dd279b5f531901d8835e2f503a`.
- `help-system-1024x720.png`: `bc71b57d8da81705f8d76e7a7f6e94b3ed466a42e73225d3278f1b39356ce98d`.
- `help-system-1440x900.png`: `ba406b8554fc26526f45d38adbfa20b235e6f3ee61a84e3119568e5df80a0caa`.
- `preferences-1024x720.png`: `3f992ca735b19ba634096957c09648e9c1184192e424d77288fbd702f597217c`.
- `workbench-light-1024x720.png`: `b4f63695d5e8c2210e578de6896e36f8bf1cb3efe47a92a873925ea0cde8ea85`.
- `workbench-light-1440x900.png`: `58475a0af342ac8b391d4ce67112907aef19557bcec5776f3b54a66034d5ef27`.
- No native installer/package artifact was generated in this sprint.
