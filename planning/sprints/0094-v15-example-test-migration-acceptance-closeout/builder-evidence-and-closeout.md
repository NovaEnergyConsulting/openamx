# Sprint 094 Builder Evidence and Closeout

## Status

**Builder recommendation: `BLOCKED/OPEN`. V0.15 remains `BLOCKED/OPEN`; no release or publication is authorized.**

A separate Lead Developer/product-owner V0.15 disposition was received on
2026-10-18: `BLOCKED/OPEN`. No exceptions were accepted.
The desktop RPC sandbox-count result remains a raw failure, and direct
interactive/native workflow evidence is incomplete.

## Entry gate and authorization

- Sprints 090, 091, and 092 have separate `ACCEPTED/CLOSED` dispositions.
  Sprint 090's dated Lead Developer/product-owner disposition resolves the
  earlier conflicting Builder record.
- Sprint 093 has a separate `ACCEPTED/CLOSED` disposition with the documented
  pre-authorization build process exception and named residuals. Its raw
  desktop RPC sandbox-count result remains `BLOCKED`; it is not reclassified
  as a pass.
- The user separately authorized Sprint 094 and approved the exact
  file-by-file migration, fixture, removal, package, and native-verification
  plan on 2026-10-18. The approved local-state disposition preserves
  `examples/.openamx/local.json` and its three referenced positive input
  files unchanged.
- Initial branch: `feat/create-V015`.
- Initial commit: `e05052e71c71177f101b8886ad96907cc2951109`.
- Initial worktree: clean; `git status --porcelain=v2 --branch` reported only
  the branch headers and no tracked or untracked changes.
- Initial protected-output hashes and the unique S094 output roots are
  recorded in [`artifacts/initial-protected-outputs.json`](artifacts/initial-protected-outputs.json).
- Builds and verification are confined to the new isolated
  `%TEMP%\openamx-sprint094-validation` workspace. S094 evidence is written
  under this sprint's new `artifacts/` directory. The original
  `desktop-app/build/dev-win-x64`, S093 package attempts, stable installers,
  and protected example outputs are not build destinations.

## Approved migration scope

The approved changes are limited to:

- Migrating `tests/examples.test.ts`, `tests/formatter.test.ts`,
  `tests/reportPdf.test.ts`, `desktop-app/tests/ui/html-chart-security.pw.ts`,
  `package.json`, `scripts/release/cli.ts`, and `docs/releasing.md`.
- Moving the 14 legacy AMX test inputs and their complete local library/data
  closure into `tests/fixtures/examples/`; updating consumers to those
  test-owned paths. These fixtures are excluded from desktop packaging.
- The moved AMX fixtures are `asset-fleet-risk-analysis.amx`,
  `hello-world.amx`, `kitchen-sink.amx`, `transformer-strategy.amx`,
  `typed-asset-analysis.amx`, `v0.12-braced-if.amx`,
  `v0.12-records-and-enums.amx`, `v0.13-battery-resistor.amx`,
  `v0.13-crank-slider.amx`, `v0.14-math-and-measurements.amx`,
  `v0.14-runtime-type-checks.amx`, `v0.14-text-and-formatting.amx`,
  `v05-asset-screening.amx`, and `v09-measurement-report.amx`.
  Their copied/moved closure is three libraries, four data files, two
  invalid-only fixtures, and `v05-project.json`.
- Retaining `examples/typed-asset.json`, `examples/typed-screenings.csv`,
  and `examples/typed-reviewed-at.json` unchanged because the preserved,
  host-local `examples/.openamx/local.json` references those paths.
- Deleting only the four approved HTML snapshots, and only after replacement
  temporary-render assertions pass:
  `examples/hello-world.html`,
  `examples/transformer-strategy.html`,
  `examples/asset-fleet-risk-analysis.html`, and
  `examples/typed-asset-analysis.html`.
- Leaving the numbered guide, canonical guide support files, current
  documentation links, desktop resource allowlist/implementation, runtime,
  editor, renderer, sandbox/CSP, and security behavior unchanged.
- Preserving the user-supplied Kitchen Sink PDF and `.openamx/local.json`
  byte-for-byte; leaving V0.1 specification snippets classified as
  historical; making no release, publication, version, `planning/STATUS.json`,
  or historical sprint-record changes.

Any discovered requirement outside this approved list is a stop-and-request
decision, not implied authorization.

## Implemented migration

- The V0.12-V0.14, V0.9, Hello, Transformer, fleet, typed-report, Kitchen
  Sink, and V0.5 test material now resides under `tests/fixtures/examples/`.
  The three positive typed inputs remain at their old `examples/` paths for
  the preserved local project mapping and have byte-identical fixture copies.
- Test imports and CLI mappings use the test-owned fixture paths. The V0.5
  temporary project copies only its two required libraries and two required
  input files.
- Snapshot comparisons now render to temporary destinations and assert
  report structure/content. The four authorized HTML outputs were verified
  against their initial hashes, removed only after the focused migration
  tests passed, and are absent at final preservation verification.
- `package.json` render scripts target lessons 01, 02, 03, and 12 and write
  only under ignored `dist/`. Release smoke uses lesson 01 in its existing
  temporary project. `docs/releasing.md` documents that current input.
- No runtime, editor, renderer, desktop app implementation, guide allowlist,
  CSP, sandbox, safe local-link confirmation, version, or release files were
  changed.

## Verification matrix

Statuses below preserve raw outcomes; `NOT RUN` is not acceptance evidence.

| Requirement | Status | Evidence / residual |
|---|---|---|
| `V15-CLOSE-GATE-01` | PASS | Separate S090-093 dispositions, explicit S094 authorization, exact plan approval, and baseline are recorded above. |
| `V15-CLOSE-INV-01` | PASS | 00-14 guide retained; 14 legacy AMX files and exact test closure moved; four snapshots removed after tests; local state and its three referenced data files retained and excluded from package. |
| `V15-CLOSE-INDEX-01` | PASS | Full root suite includes the numbered-guide index/navigation/role checks. |
| `V15-CLOSE-LINK-01` | PASS | Numbered-guide containment checks and current README/spec/Help/VS Code/authoring links pass. Only `docs/language-spec-v0.1.md` retains historical legacy paths. |
| `V15-CLOSE-ASSET-01` | PASS | Numbered-guide valid/invalid mappings and module closure pass; packaged resource test creates/runs a project from packaged data/modules. |
| `V15-CLOSE-RUN-01` | PASS | Full root suite executes the documented guide and references, with representative bindings and Measurement values/units. |
| `V15-CLOSE-NEG-01` | PASS | Invalid JSON/CSV diagnostics, aggregate/fail-fast behavior, and no partial output assertions pass. |
| `V15-CLOSE-FEAT-01` | PASS | Full root suite passes existing language, formatting, renderer, report, and V0.14 feature assertions; numbered-guide matrix passes. |
| `V15-CLOSE-OUTPUT-01` | PASS | Four temporary-render structural/content tests pass; before hashes are recorded and only the four authorized snapshots were removed. |
| `V15-CLOSE-OUTPUT-02` | PASS | Protected files and all hashed S093 package/build/release output trees match their initial hashes. |
| `V15-CLOSE-REF-01` | PASS | Active code/docs/tests/scripts use numbered guide or test-owned fixtures. V0.1 historical mentions and preserved local-state mappings are classified. |
| `V15-CLOSE-TEST-ROOT-01` | PASS | `bun run build` PASS; full `bun test` PASS: 545 tests, 4,092 expectations, 0 failures. |
| `V15-CLOSE-TEST-DESKTOP-01` | FAIL | `bun run test` exits 1 after 9 focused tests pass (99 expectations); RPC contract check fails at the unchanged sandbox-count assertion (actual 1, expected 2). `typecheck`, `build:web`, and 5 focused UI tests pass. |
| `V15-CLOSE-PACKAGE-01` | PASS | Exact 24-file, 56,096-byte package has per-file SHA-256 parity with the staged canonical allowlist; package resource test passes. |
| `V15-CLOSE-OFFLINE-01` | PASS | Packaged-resource project smoke materializes the index/data/modules and runs lessons 06, 07, 12, and 13; Help/chart-security browser checks report no external requests. |
| `V15-CLOSE-NATIVE-01` | BLOCKED/UNAVAILABLE | Windows dev package launched and WebView2 loaded packaged files. Manual installer and interactive native guide workflow were not completed; macOS/Linux are unavailable. |
| `V15-CLOSE-DESKTOP-01` | PASS | Packaged service tests cover ordinary project creation, guide creation, rejection/cancel cases; Help/Starter UI tests pass. |
| `V15-CLOSE-SECURITY-01` | BLOCKED/UNAVAILABLE | Migrated chart-security and navigation UI tests pass and no security code changed, but the RPC script stops at the unresolved sandbox-count assertion before later boundary assertions. |
| `V15-CLOSE-INCIDENT-01` | PASS | S093 build incident and exception remain accurately represented; original post-incident directory and accepted package attempts match baseline hashes. |
| `V15-CLOSE-SCOPE-01` | FAIL / owner disposition required | No product/runtime/release/version scope changed, but a junctioned desktop dependency directory allowed Vite to write/update an ignored `.vite` cache in the original checkout; its pre-run contents were not hashed. |
| `V15-CLOSE-DISPOSITION-01` | BLOCKED/OPEN | Separate Lead Developer/product-owner disposition received on 2026-10-18; no exceptions accepted. Raw failures and residual owners remain as recorded. |

## Accepted feature-to-test trace

Each accepted Sprint 090 feature row is mapped below. `PASS` refers to the
listed current S094 regression result, not to release or cross-platform
acceptance.

| Feature ID | Numbered destination | Executed evidence and observable contract | Status |
|---|---|---|---|
| `V15-IA-FEAT-01` | 01 | [`tests/numbered-guide.test.ts`](../../../tests/numbered-guide.test.ts) checks index/lesson navigation and first lesson bindings; [`tests/examples.test.ts`](../../../tests/examples.test.ts) retains the legacy ordinary-fence/render contract in its test-owned fixture. | PASS |
| `V15-IA-FEAT-02` | 02 | Numbered guide test asserts product, precedence, mutation, conditional result, and priority bindings. | PASS |
| `V15-IA-FEAT-03` | 02-03 | Numbered guide test asserts decisions, loops and result bindings; V0.12 fixture tests retain braced expression/statement and scope behavior. | PASS |
| `V15-IA-FEAT-04` | 03 | Numbered guide test asserts list/range results, loop totals, pure function, and `match` result. | PASS |
| `V15-IA-FEAT-05` | 04 | Numbered guide test checks typed record/import results; V0.12 records/enums fixture tests retain inheritance and primitive enum outcomes. | PASS |
| `V15-IA-FEAT-06` | 04, 12-13 | Numbered guide support-closure test checks local module paths/containment; full root suite runs Kitchen Sink, typed-report, and route fixtures with their copied modules. | PASS |
| `V15-IA-FEAT-07` | 05, 09-10, 13 | Numbered guide test checks Measurement values/units/conversions; route report test checks imported JSON results and rendered units. | PASS |
| `V15-IA-FEAT-08` | 06 | Numbered guide test checks canonical input mappings, exact invalid fixtures, `AMX4003`, and no success-shaped outputs. | PASS |
| `V15-IA-FEAT-09` | 07, 12 | Numbered guide and legacy typed fixture tests check JSON/CSV shapes, written outputs, aggregate/fail-fast validation, and absent outputs on failure. | PASS |
| `V15-IA-FEAT-10` | 07, 12 | Numbered guide and PDF tests check tables/charts and report content; temporary HTML tests retain structural/content assertions without snapshot equality. | PASS |
| `V15-IA-FEAT-11` | 08, 14 | Numbered guide, V0.13 fixture, diagram, and diagram-HTML tests check formula-driven geometry, titles, playback controls, and circuit values/caveats. | PASS |
| `V15-IA-FEAT-12` | 09 | Numbered guide and V0.14 fixture tests check valid true/false `is` results and formatting idempotence. | PASS |
| `V15-IA-FEAT-13` | 09 | Numbered guide tests check recursive records/lists, extra/optional fields, nullable values, and empty-list predicate behavior. | PASS |
| `V15-IA-FEAT-14` | 09 | Numbered guide tests check enum membership, Measurement dimensions, and Number versus dimensionless Measurement mismatches. | PASS |
| `V15-IA-FEAT-15` | 10 | Numbered guide and V0.14 math tests check constants, math functions/domains, and exact result values. | PASS |
| `V15-IA-FEAT-16` | 10 | Numbered guide and V0.14 math tests check Measurement-aware aggregates and operations, output dimensions, units, and empty-list behavior. | PASS |
| `V15-IA-FEAT-17` | 11 | Numbered guide and V0.14 text tests check Unicode code points, Unicode 15.1 whitespace, list length, and slice boundaries. | PASS |
| `V15-IA-FEAT-18` | 11 | Numbered guide and V0.14 text tests check bounded patterns/locales, rounding, negative zero, Measurement display, and `AMXSL004`-`AMXSL006` diagnostics. | PASS |
| `V15-IA-FEAT-19` | 12 | Numbered guide test executes the complete report with canonical mapped inputs and checks summary/row output shapes and rendered report results. | PASS |
| `V15-IA-FEAT-20` | 01, 06-07, package | Help/Starter UI, package-resource tests, and offline project smoke check first lesson discovery, local inputs/modules, package-root project creation, and preserved compact starters. Direct installed interactive workflow remains separately blocked. | PASS for tested contracts; native residual remains |

## Prior residuals retained

- **Desktop maintainer / Lead Developer-product owner:** S093's desktop RPC
  contract expected two `sandbox="allow-scripts"` attributes but the current
  markup has one. S093's raw script stopped at that assertion after its
  focused unit tests passed. Sprint 094 will rerun the command and record the
  raw result. The assertion, markup, CSP, and sandbox flags are not changed by
  this plan.
- **Lead Developer/product owner:** S093's pre-authorization build incident
  remains an accepted, documented process exception. The prior contents of
  `desktop-app/build/dev-win-x64` are unknowable and will not be restored.
- **Desktop maintainer / Lead Developer-product owner:** decide the intent of
  the RPC sandbox count (current `App.vue`: one; old assertion: two) or accept
  it explicitly as a residual. The failed command remains a raw `FAIL`; no
  security expectation was weakened.
- **Desktop/native owner:** complete an interactive Windows installed-package
  learning-guide workflow if required; current evidence covers a dev-package
  launch plus packaged-resource service smoke, not a native installer journey.
- **Desktop maintainer / Lead Developer-product owner:** disposition the
  unbaselined ignored `desktop-app/node_modules/.vite` cache side effect.
  Preserve it until an owner explicitly approves any cleanup.
- **Native-platform owners:** this workspace is Windows. macOS/Linux native
  routes remain unavailable here and cannot be represented as acceptance.
- **Local-project owner:** `examples/.openamx/local.json` remains unchanged.
  Its referenced positive data files remain at their current paths; the guide
  package excludes all local state and legacy support copies.

## Raw results and outputs

Environment: Windows 11 Home `10.0.26300` x64; Bun `1.4.2`;
Node `v24.13.1`; Git `2.56.0.windows.2`; package-bundled Bun `1.4.0`.
Build/test/package outputs were generated under
`%TEMP%\openamx-sprint094-validation`; the original root `dist`, desktop
`dist`, stable build, post-incident build, release outputs, and S093 attempts
were not build targets.

| Command/action | Raw result | Evidence |
|---|---|---|
| `bun test tests\examples.test.ts tests\formatter.test.ts tests\reportPdf.test.ts` (first attempt in checkout) | **FAIL**, 37 pass, 3 fail, 356 expectations. The CLI's standalone HTML wraps heading/list markup differently from the previous preview render; typed legacy report has no table/chart. No assertions were dropped; the structure expectations were adapted to the standalone output and the HTML snapshot equality was replaced as approved. | [`root-example-migration-focused.log`](artifacts/root-example-migration-focused.log). |
| Same focused root command (retry) | **PASS**, 40 pass, 0 fail, 388 expectations. Four report renders use temporary files. | [`root-example-migration-focused-retry-1.log`](artifacts/root-example-migration-focused-retry-1.log). |
| `bun run build` (isolated validation copy) | **PASS**, exit 0. | [`root-build.log`](artifacts/root-build.log). |
| `bun test` (isolated validation copy) | **PASS**, 545 pass, 0 fail, 4,092 expectations across 45 files. | [`root-full-tests.log`](artifacts/root-full-tests.log). |
| Desktop `bun run test` (isolated validation copy) | **FAIL**, exit 1. Its guide/starter tests pass: 9 pass, 0 fail, 99 expectations. `tests/rpc-contract-check.ts` then fails at unchanged `App.vue` sandbox count: actual 1, expected 2. Later assertions in that script do not run. | [`desktop-bun-tests.log`](artifacts/desktop-bun-tests.log). |
| Desktop `bun run typecheck` | **PASS**, exit 0. | [`desktop-typecheck.log`](artifacts/desktop-typecheck.log). |
| Desktop `bun run build:web` | **PASS**, exit 0; Vite reports its existing large-chunk warning. Stages exactly 24 guide resources in the isolated workspace. | [`desktop-build-web.log`](artifacts/desktop-build-web.log). |
| `hutch electrobun build --env=dev` (isolated validation copy) | **PASS**, exit 0; output is only under `%TEMP%\openamx-sprint094-validation\desktop-app\build\dev-win-x64`. | [`desktop-package-build.log`](artifacts/desktop-package-build.log). |
| `OPENAMX_PACKAGED_GUIDE_RESOURCE_ROOT=<built guide>; bun test src/bun/guideResources.test.ts` | **PASS**, 9 pass, 0 fail, 96 expectations, including canonical/package parity and project-root offline smoke. | [`desktop-packaged-guide-resource-tests.log`](artifacts/desktop-packaged-guide-resource-tests.log), [`desktop-package-parity.json`](artifacts/desktop-package-parity.json). |
| Playwright Help/Starter, HTML chart-security, and preview-navigation tests | **PASS** on retry: 5 passed, no external requests. The first harness attempt used port 4194, but test assertions correctly rejected that non-allowlisted origin; it is preserved as a raw failed attempt. Retry reused the already-running S093 Vite service on its fixed port 4183; it was not stopped or modified, and S093 artifacts remain clean. | [`desktop-ui-s094.log`](artifacts/desktop-ui-s094.log), [`desktop-ui-s094-retry-1.log`](artifacts/desktop-ui-s094-retry-1.log), [`ui-attempt-1/`](artifacts/ui-attempt-1), [`ui-retry-1/`](artifacts/ui-retry-1). |
| Root `render:hello`, `render:transformer`, `render:fleet`, `render:typed` | **PASS**, all four wrote to the isolated copy's ignored `dist/` and rendered numbered lessons 01, 02, 03, and 12. | [`package-render-hello.log`](artifacts/package-render-hello.log), [`package-render-transformer.log`](artifacts/package-render-transformer.log), [`package-render-fleet.log`](artifacts/package-render-fleet.log), [`package-render-typed.log`](artifacts/package-render-typed.log). |
| Root `dev` watcher | **PASS for startup/render**: created/updated `dist/01_First_Computable_Document.html`. The watcher was intentionally stopped by its exact PID; its shutdown reports exit 255 and is not a clean-exit result. | [`package-dev-stdout.log`](artifacts/package-dev-stdout.log), [`package-dev-stderr.log`](artifacts/package-dev-stderr.log). |
| Native Windows package launch | **Partial PASS**: isolated dev package launcher responded; WebView2 navigated and loaded its packaged index, assets, and fonts. No external remote address was observed in the brief process check. The app had no reported main-window title; no installer or interactive in-app guide workflow was completed. App data/temp variables were isolated under the S094 workspace, and launched PIDs were stopped explicitly. | [`desktop-native-launch.stdout.log`](artifacts/desktop-native-launch.stdout.log), [`desktop-native-launch.stderr.log`](artifacts/desktop-native-launch.stderr.log). |
| Protected-output comparison | **PASS**: every baseline directory digest and preserved file SHA-256 matches; all four authorized snapshots are absent. | [`initial-protected-outputs.json`](artifacts/initial-protected-outputs.json), [`final-protected-outputs.json`](artifacts/final-protected-outputs.json). |
| `git diff --check` | **PASS**, exit 0. | Recorded in Builder evidence; final check repeated at closeout. |

The first standalone package-manifest helper run compared all of
`examples/` against the 24-file packaged allowlist and therefore rejected the
expected extra test/local files; it was not a package test failure. A second
helper attempt used the old S093 staging directory name rather than the
configured `sprint-093-guide-attempt-2`; after correcting the path, the
24-file staged/package SHA-256 manifest passed. The specific parity unit test
also verifies the package against canonical `examples/` and the fixed
allowlist. The PowerShell `bun -e` manifest-generation attempt failed due to
argument quoting; the persisted JSON manifest was generated with PowerShell
from the verified staged and packaged files.

The initial recursive hash attempt over the S093 evidence folder could not
read its two open Vite stdout/stderr logs. Those logs were left untouched;
the S093 evidence tree remains Git-clean. Complete protected package, build,
installer, release, PDF, local-state, and HTML snapshot hashes are recorded
and compared in the baseline/final JSON artifacts.

The validation copy used junctions for the already-installed root and desktop
`node_modules` trees to avoid copying/reinstalling dependencies. Vite created
or updated `desktop-app/node_modules/.vite` in the original checkout during
the port-4194 UI attempt. The observed cache has 68 files/26,287,972 bytes;
its latest timestamp was during S094, but no pre-run hash exists. It was not
deleted because the contents may predate S094 and the existing S093 Vite
service on port 4183 may still use it. This is an output-isolation deviation,
not a tracked source change; its current, explicitly non-baseline manifest is
[`desktop-vite-cache-unbaselined.json`](artifacts/desktop-vite-cache-unbaselined.json).
It requires desktop-maintainer/Lead Developer-product-owner disposition.

## Builder recommendation and separate disposition

**Builder recommendation: `BLOCKED/OPEN`.** The root suite, guide/package
parity, packaged-resource project smoke, Help/Starter UI, and chart-security
checks pass. The desktop test script still has the raw sandbox-count failure;
the native interactive install workflow is incomplete; and the original
checkout's ignored Vite cache has an unbaselined S094 write/update due to the
dependency junction. These are named residuals, not passes.

The Lead Developer/product-owner separately selected `BLOCKED/OPEN` on
2026-10-18 and accepted no exceptions. V0.15 remains `BLOCKED/OPEN`. No
release, publication, version change, or historical status update is
authorized.
