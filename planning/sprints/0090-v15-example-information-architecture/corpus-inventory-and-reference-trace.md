# Sprint 090 Corpus Inventory and Reference Trace

## Status and boundaries

This is Builder inventory evidence and a proposal, not authorization to
migrate the corpus or a product-owner disposition. The user separately
authorized Sprint 090 execution and approved this evidence-file plan before
the corpus inventory began. Only the three new evidence files in this sprint
folder were in the approved write scope.

| Record | Evidence |
| --- | --- |
| Starting branch | `feat/create-V015` |
| Starting revision | `596e4081d75a9e1e0f8cc9871a592b33766d2551` |
| Starting worktree | Clean; no pre-existing tracked or untracked changes reported. |
| Corpus boundary | Read-only. No examples, tests, source, scripts, product docs, package files, outputs, or historical sprint records were changed. |
| Output boundary | Existing generated files, test outputs, screenshots, logs, and other artifacts were not cleaned, regenerated, or overwritten. |
| Protected artifact | `examples/kitchen-sink.pdf` SHA-256 at inventory: `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`. |

The inventory used a forced recursive filesystem listing (including hidden
entries), `git ls-files --stage -- examples`, and a scoped example worktree
status check. Content/reference tracing used targeted `rg` searches for
`examples/` and `examples\` paths, followed by inspection of the direct
consumers, scripts, tests, desktop project-creation/resource behavior,
documentation and language contracts listed below. All 30 files found under
`examples/` are tracked. The two directories are `examples/.openamx/` and
`examples/libraries/`; `.openamx/local.json` is the only hidden file.

No AMX document was run, rendered, exported, packaged, or modified. This
inventory does not establish execution, rendering, desktop packaging, native
app, release, or platform acceptance. Sprint 089's accepted/closed
disposition is prior-sprint context only; it is not Sprint 090 evidence.

## File-by-file corpus census

Disposition terms below are proposals for later review. Nothing in this
table was moved, renamed, removed, rewritten, generated, or packaged during
Sprint 090. “Guide package” means the proposed, self-contained desktop
learning guide package, not the repository's complete `examples/` tree.

| Current path | Current role, dependencies, and known consumers | Proposed later disposition and guide-package need |
| --- | --- | --- |
| `examples/.openamx/local.json` | Hidden project-local input mappings for the typed asset example. Its values are absolute, host-specific paths; it is not a portable lesson fixture. `kitchen-sink.amx` documents the precedence of local and project input configuration. | **Remove from the guide source/package** after owner review; never bundle these machine-local mappings. The desktop guide project must receive the normal empty project configuration instead. Owner: product owner / desktop maintainer. |
| `examples/asset-fleet-risk-analysis.amx` | Input-free illustrative fleet-score report using ranges, collection mapping, loops, mutation and `match`. `tests/examples.test.ts` evaluates and renders it; `package.json` has `render:fleet`. | **Merge** useful decision/collection material into lessons 02/03 or the destination report 12; retire the duplicate source after tests migrate. The replacement lessons, not this legacy path, belong in the package. |
| `examples/asset-fleet-risk-analysis.html` | Generated HTML snapshot from the AMX source. `tests/examples.test.ts` checks report content and normalized equality with a fresh render; `render:fleet` writes this exact path. | **Remove from `examples/`** after the focused content assertions run against a temporary render. The present path is not linked as a user-facing lesson; no package need. |
| `examples/hello-world.amx` | Small input-free document with front matter, Markdown, an exact executable fence, bindings, interpolation and a literal non-executable fence. Referenced by `README.md`, `package.json`, `docs/language-spec-v0.1.md`, `tests/examples.test.ts`, `tests/formatter.test.ts`, and release smoke code/docs. | **Move/merge** into `01_First_Computable_Document.amx`. Package the replacement as the first runnable lesson; do not confuse it with the separate inline desktop quick starter. |
| `examples/hello-world.html` | Generated HTML snapshot. `tests/examples.test.ts` asserts report content and normalized equality; `package.json` `render:hello` writes it. | **Remove from `examples/`** after retaining structural/content assertions on a temporary render. No guide-package need. |
| `examples/kitchen-sink.amx` | Large, input-free cross-feature tour; imports `./libraries/asset-management.amx`, contains literal data/config recipes, report features, invalid syntax as inert examples, CLI instructions and a relative link to a language specification. Consumers include `README.md`, `.github/skills/amx-authoring/SKILL.md`, `tests/examples.test.ts`, `tests/reportPdf.test.ts`, `desktop-app/tests/ui/html-chart-security.pw.ts`, and historical planning/evidence. | **Move to a clearly test-only fixture location** with its required module closure and test references migrated; do not present it as the guided lesson or duplicate it as a second complete report. Preserve required security/report regression coverage. Exclude from the guide package. The exact fixture destination and any necessary relative-path edits require Sprint 092/094 approval. |
| `examples/kitchen-sink.pdf` | User-supplied PDF artifact, not a generated golden. Historical V0.11 plan/evidence documents identify it as supplied and immutable. No current example test directly reads this PDF. | **USER-SUPPLIED / IMMUTABLE**. Keep unchanged at its current path absent separate authorization; do not generate over it, move it, remove it, or bundle it. |
| `examples/libraries/asset-management.amx` | Local exported record schemas used by `typed-asset-analysis.amx`, `v05-asset-screening.amx`, and `kitchen-sink.amx`; root tests also copy `examples/libraries/` for the V0.5 project fixture. | **Keep/reorganize** as `libraries/asset-management.amx` if lessons 04/12 retain these types. Include only if in the approved lesson dependency closure. |
| `examples/libraries/screening.amx` | Local exported `Screening` schema imported by the typed and V0.5 asset reports and described in the kitchen-sink data recipe. | **Keep/reorganize** as `libraries/screening.amx` if lessons 06/12 retain typed screening inputs. Include only if required by the approved lesson closure. |
| `examples/libraries/travel-measurements.amx` | Local exported dimensions, units, `Trip` record and `averageSpeed` function imported by `v09-measurement-report.amx`. | **Keep/reorganize** as `libraries/travel-measurements.amx` if the standalone route-measurement reference 13 is approved; otherwise merge its useful unit/input demonstration and remove it after test migration. Package only with reference 13. |
| `examples/transformer-strategy.amx` | Input-free report showing lists, loops, accumulation, `match`, narrative and mutation, with illustrative—not calibrated—scores. `tests/examples.test.ts`, `package.json` (`render:transformer`), `README.md`, `docs/language-spec-v0.1.md`, and the authoring skill reference it. | **Merge** focused material into lessons 02/03 and/or the destination report 12; retire the old source after its consumers migrate. Package only its approved replacement. |
| `examples/transformer-strategy.html` | Generated HTML snapshot checked by `tests/examples.test.ts`; `package.json` `render:transformer` writes this path. | **Remove from `examples/`** after temporary-render content assertions replace snapshot equality. No guide-package need. |
| `examples/typed-asset-analysis.amx` | Typed report imports the asset and screening modules, maps JSON/CSV/DateTime inputs, computes illustrative scores, and exports named JSON/CSV bindings. `tests/examples.test.ts` exercises valid and invalid input paths plus HTML rendering; `package.json` has `render:typed`; README, V0.14-era documentation and the kitchen-sink recipes link to it. | **Split/rework** the input/validation teaching into lesson 06 and use the approved integration of its report workflow in destination 12. Preserve explicit input mappings and do not imply a domain-standard formula. Package the final lessons and exact support closure. |
| `examples/typed-asset-analysis.html` | Generated HTML output with test comparison against a temporary CLI render and content assertions in `tests/examples.test.ts`; generated by `render:typed`. Historical `planning/state.md` records it as production-generated. | **Remove from `examples/`** after focused content assertions no longer depend on a checked-in output. Do not package or overwrite it during Sprint 090. |
| `examples/typed-asset.json` | Valid nested Asset input used by typed and V0.5 examples and their tests. | **Move** to `data/asset.json`; include if lessons 06/12 use this input. |
| `examples/typed-invalid-asset.json` | Intentionally invalid Asset input; the typed-example test expects `AMX4003` and a missing `/id` path. | **Move** to `fixtures/invalid/asset.json`; include in an offline guide only if lesson 06 explicitly teaches this negative case. Clearly label as invalid-only. |
| `examples/typed-invalid-screenings.csv` | Intentionally invalid CSV values. `tests/examples.test.ts` checks aggregate and fail-fast validation, including `AMX4003` field paths and no output write on failure. | **Move** to `fixtures/invalid/screenings.csv`; include only as a clearly labeled offline negative fixture for lesson 06. |
| `examples/typed-reviewed-at.json` | Valid DateTime input mapped by the typed asset example and the corresponding test. | **Move** to `data/reviewed-at.json`; include if lesson 06/12 retains the reviewed-at binding. |
| `examples/typed-screenings.csv` | Valid screening rows mapped by typed and V0.5 reports; root tests expect row-preserving scores and outputs. | **Move** to `data/screenings.csv`; include if lessons 06/12 retain the input workflow. |
| `examples/v0.12-braced-if.amx` | Focused braced conditional expression and statement example; `tests/examples.test.ts`, README, `docs/language-spec-v0.12.md` and desktop/VS Code help contracts cover it. | **Merge** into lesson 02, retaining both expression and statement distinctions and the separate block-scope/outer-assignment rules. |
| `examples/v0.12-records-and-enums.amx` | Focused record inheritance and enum example; `tests/examples.test.ts`, README, `docs/language-spec-v0.12.md` and desktop/VS Code help contracts cover it. | **Merge** into lesson 04, preserving `override`, primitive enum values and the non-subtyping boundary. |
| `examples/v0.13-battery-resistor.amx` | Focused animated diagram with a calculated 0.6 A value and explicit warning that arrow motion is not changing current magnitude. `tests/examples.test.ts`, README, `docs/language-spec-v0.13.md`, VS Code README and desktop Help reference its contract. | **Retain/re-number** as standalone reference 14 if the owner confirms its distinct diagram value. Package it if retained in the index. |
| `examples/v0.13-crank-slider.amx` | Formula-driven animated mechanism with explicit geometry and no trigonometric functions. Root diagram tests assert values, title, model controls and rendered structure; README, V0.13 specification and VS Code README link to it. | **Retain/re-number** as guided lesson 08. It is the current-corpus basis for the formula-driven diagram step; package it with the guide. |
| `examples/v0.14-math-and-measurements.amx` | Focused V0.14 constants/functions, dimensionless Measurement input, and Measurement-aware `sum`, `min`, `abs`, `round`, `sqrt`, and `pow`. `tests/examples.test.ts`, README, V0.14 specification and VS Code README cover it. | **Split/rework** into lesson 05's measurement/unit foundations and lesson 10's V0.14 math and Measurement-aware operations. Package the final focused files. |
| `examples/v0.14-runtime-type-checks.amx` | Focused V0.14 `is` example covering structural records, primitives, optional/null, lists, enums and dimensions. Its example test asserts representative true/false bindings, formatting idempotence and CLI output; README, V0.14 specification and VS Code README link it. | **Retain/re-number** as lesson 09; preserve the distinction between a valid false predicate and a diagnostic. Package it. |
| `examples/v0.14-text-and-formatting.amx` | Focused V0.14 Unicode code-point/string operations and bounded numeric formatting. `tests/examples.test.ts`, README, V0.14 specification and VS Code README cover its values. | **Retain/re-number** as lesson 11; keep the exact spec-defined Unicode, locale, rounding and Measurement-display expectations. Package it. |
| `examples/v05-asset-screening.amx` | Branded typed JSON/CSV screening report with local imports, a table and chart. `tests/examples.test.ts` constructs a temporary project and verifies values, report settings, ordering and PDF/DOCX output. | **Merge** useful input/table/chart workflow into lessons 06/07/12. Preserve the V0.5 project-settings compatibility test as a test fixture if still needed; do not package the legacy example. |
| `examples/v05-project.json` | Project report-settings fixture copied by the V0.5 example test into a temporary `.openamx/project.json`. | **Move** beside the V0.5 compatibility fixture under test ownership if that compatibility test remains; not guide content and not package material. |
| `examples/v09-measurement-report.amx` | Input-driven route report imports the travel module and shows typed Measurement conversions, named output, table and chart. Its root test verifies output values/units and rendered content. | **Retain/re-number** as standalone reference 13 if approved; it demonstrates a distinct mapped-input Measurement/report workflow after lessons 05-07. Package it and its exact closure if retained. |
| `examples/v09-trips.json` | Valid route Measurement input consumed by the route report and its test. | **Move** to `data/measurement-trips.json`; package only with standalone reference 13. |

## Direct-reference and path-sensitive consumer trace

The repository-wide `rg` path search surfaced 145 text files containing
example-path references, including many historical planning, sprint-closeout,
and evidence records. The active migration list below records the current
code, test, packaging, and user guidance surfaces that must be checked when
later sprints change paths. Historical sprint records, status/decision
ledgers, and prior evidence are deliberately not migration targets under the
Sprint 090 boundary. A separate V0.13 probe under
`planning/sprints/0078-v13-diagram-contract-feasibility-gate/probe/` is also
historical evidence and remains untouched.

| Consumer surface and location | Referenced path(s) or behavior | Migration impact / proposed owner |
| --- | --- | --- |
| `README.md:119-144` | CLI examples use `examples/hello-world.amx`; “Examples and documentation” links Hello, Kitchen Sink, Typed Asset, Crank-slider and all three V0.14 examples. | Replace live learning links with the guide index and any approved standalone references; keep CLI snippets valid. Sprint 093. |
| `package.json:21,24-27` | `dev`, `render:hello`, `render:transformer`, `render:fleet`, and `render:typed` refer to sources and in-corpus HTML destinations; typed command maps three input files. | Repoint or retire these scripts and ensure no routine render command overwrites tracked user/output artifacts. Sprint 093/094. |
| `tests/examples.test.ts:50-219,275-440,442-600` | README/spec path assertions; V0.12-V0.14 examples; four checked-in HTML comparisons; typed valid/invalid mappings and named outputs; kitchen-sink run/render/DOCX; V0.9 measurement report; V0.5 temporary-project workflow. | This is the primary migration list. Preserve the expected values, exact negative outcomes and report content while moving paths; do not treat path-string edits as sufficient test migration. Sprint 094. |
| `tests/formatter.test.ts:10` | Reads `examples/hello-world.amx` as the canonical document-format fixture. | Point the formatter test at the approved lesson fixture or a dedicated test fixture. Sprint 094. |
| `tests/reportPdf.test.ts:307-308` | Loads `examples/kitchen-sink.amx` as source for broad PDF chart/report coverage. | Follow the approved test-only fixture relocation and preserve all chart/table assertions. Sprint 094. |
| `desktop-app/tests/ui/html-chart-security.pw.ts:14` | Uses `examples/kitchen-sink.amx` to build a rendered security fixture. | Preserve security coverage and its local library closure after the fixture move. Sprint 094. |
| `scripts/release/cli.ts` (CLI smoke test) and `docs/releasing.md:133` | Copy/run/render/export `examples/hello-world.amx` as the packaged CLI smoke input. | Update the source path or use a release-owned, input-free smoke fixture; keep the release workflow's contents and outputs in its temporary directory. Release owner / Sprint 094. |
| `docs/language-spec-v0.1.md:367,575,624,639,703-720,793-794` | Historical tree and CLI snippets mention Hello and Transformer paths/HTML outputs. | Decide whether historical examples remain intentionally historical or need current links; do not rewrite the historical contract implicitly. Product owner / documentation owner. |
| `docs/language-spec-v0.12.md:189-190` | Links to the records/enums and braced-if examples. | Update only affected links while preserving the V0.12 behavior text. Sprint 093. |
| `docs/language-spec-v0.13.md:209-210` | Links to Crank-slider and Battery-resistor. | Update to the approved numbered lesson/reference destinations. Sprint 093. |
| `docs/language-spec-v0.14.md:175-177` | Links to the three current V0.14 runnable examples. | Update only paths if renamed; retain the V0.14 specification as behavior authority. Sprint 093. |
| `.github/skills/amx-authoring/SKILL.md:32-37` | Links Kitchen Sink, V0.12 examples, Typed Asset, `examples/libraries/`, and Transformer; its language-version “current contract” wording is also older than V0.14. | Migrate direct links in scope; separately decide whether narrowly correcting current-spec wording is required. Do not use the skill as behavior authority over the language specification. Sprint 093 / product owner. |
| `vscode-extension/README.md:14-21` | Links V0.13 diagram examples and V0.14 examples. | Update links to the approved numbered destinations without changing extension behavior. Sprint 093. |
| `desktop-app/README.md` (First Project) and `desktop-app/src/mainview/components/help-content.json` | README describes Welcome/Starter Examples behavior; bundled Help contains a searchable “Starter examples” topic but no direct corpus file links. | Clarify the new guided choice through the existing affordance and distinguish it from Hello/Operations Note; do not redesign the Welcome UI. Sprint 093. |
| `desktop-app/src/mainview/starterExamples.ts` and `starterExamples.test.ts` | Two hard-coded single-document starters; the test expects exactly two and evaluates each without external inputs. | Preserve both quick starters and their tests. Add the guide as a distinct multi-file journey, not as a replacement or third string-only report. Sprint 093/094. |
| `desktop-app/src/mainview/App.vue:850-873`, `HelpCenterDialog.vue`, `desktop-app/src/bun/desktopService.ts:1230-1275` | The current Help starter emits an optional source string. Project creation requires an empty folder and creates `.openamx/project.json` plus `report.amx`; App updates that one report buffer. | Current behavior does not copy a multi-file corpus or select/open a guide index. Sprint 093 must define and test the guide-specific materialization path while preserving normal project creation and starters. |
| `desktop-app/electrobun.config.ts` and desktop build scripts | Electrobun copies the built web view, worker, native Sharp resources and PDF fonts; no example corpus resource is configured. | Add only the approved allowlisted guide dependency closure from canonical `examples/`; prove packaged parity/offline availability. Sprint 093. |
| `desktop-app/src/bun/desktopPreviewNavigation.test.ts:7-230` and `src/renderer/narrativeModel.ts` | Current tests cover contained local attachment confirmation and relative `.amx` links that open visible in-project tabs without attachment confirmation. | Use supported relative `.amx` links; preserve containment, tab behavior, and confirmation for local non-AMX attachments. No new renderer/link capability is proposed. Sprint 094. |
| `examples/.openamx/local.json` and typed-example mapping documentation in `examples/kitchen-sink.amx` | Machine-local absolute paths coexist with portable explicit CLI mappings and project defaults. | Exclude local mapping state from packaging and document explicit portable mappings. Any removal of the tracked local file requires later authorization. Sprint 092/093. |

### Search scope notes

- The census was performed with hidden entries included; a default
  non-hidden-only source search would not have found `.openamx/local.json`.
- `desktop-app/src/mainview/components/help-content.json` and the inline
  starter source contain no direct current corpus path; their behavior is
  still an onboarding/entry-point consumer.
- Current `electrobun.config.ts` has no example asset mapping. That is a
  package gap, not evidence that a packaged guide already exists.
- Historical matches are preserved as historical evidence and are not
  silently “fixed” by this contract. The active owner list above is the
  proposed migration ledger for later implementation.
