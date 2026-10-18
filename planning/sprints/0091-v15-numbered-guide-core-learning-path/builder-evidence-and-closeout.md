# Sprint 091 Builder Evidence and Closeout

## Builder recommendation and status

**Final disposition: `ACCEPTED/CLOSED` for the authorized Sprint 091 scope,
with the deferred owners below and no exceptions.**

The index and lessons 01-07 are implemented and pass the focused verification
recorded here. This is repository-level guide and CLI evidence only. It does
not establish broad corpus migration, desktop packaging, native desktop
acceptance, release, or publication.

## Authorization and starting state

- Sprint 090 architecture disposition: `ACCEPTED/CLOSED`, no exceptions,
  provided by the Lead Developer/product-owner on 2026-10-18 and recorded in
  [`lead-developer-disposition-2026-10-18.md`](../0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md).
- Sprint 091 execution: separately authorized on 2026-10-18 after approval of
  the concrete file/test/output plan below.
- Branch: `feat/create-V015`.
- Starting revision: `d4747856ae289adf96fd9182f2d4ec8be0e4663c`.
- Initial worktree: clean (`git status --short --branch` showed only
  `## feat/create-V015`).
- Planned protected content: all pre-existing source/test/docs/package paths,
  generated outputs, screenshots, test results, logs, and unrelated user
  artifacts. In particular, preserve `examples/kitchen-sink.pdf`; its
  Sprint 090 baseline SHA-256 was
  `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.
- No source, runtime, renderer, editor, package, desktop, README, Help,
  release, `planning/STATUS.json`, or legacy test-reference migration was
  approved for this sprint.

## Changed paths

New guide documents:

- `examples/00_Table_of_Contents.amx`
- `examples/01_First_Computable_Document.amx`
- `examples/02_Expressions_and_Decisions.amx`
- `examples/03_Collections_and_Functions.amx`
- `examples/04_Typed_Records_Enums_and_Modules.amx`
- `examples/05_Measurements_and_Units.amx`
- `examples/06_Mapped_Data_and_Validation.amx`
- `examples/07_Tables_Charts_and_Named_Outputs.amx`

New approved support copies:

- `examples/data/asset.json`
- `examples/data/screenings.csv`
- `examples/data/reviewed-at.json`
- `examples/fixtures/invalid/asset.json`
- `examples/fixtures/invalid/screenings.csv`

Focused verification and gate evidence:

- `tests/numbered-guide.test.ts`
- `planning/sprints/0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md`
- `planning/sprints/0091-v15-numbered-guide-core-learning-path/builder-evidence-and-closeout.md`

The five new support files are byte-identical in content to their existing
legacy counterparts. The old `typed-*` files, the two existing schema modules
under `examples/libraries/`, and all existing consumers/tests remain
unchanged. This avoids breaking unapproved consumers; their path migration is
deferred to Sprints 092/094.

## Focused verification record

Environment: Bun `1.4.2` (`744846f84`).

| Command / check | Inputs and outputs | Result |
| --- | --- | --- |
| `bun run build` | Builds the diagram runtime and TypeScript CLI. | **PASS**, exit 0. |
| `bun test tests/numbered-guide.test.ts` | Runs all 00-07 documents through `dist/cli.js`; mapped inputs are `asset=examples/data/asset.json`, `screenings=examples/data/screenings.csv`, and `reviewedAt=examples/data/reviewed-at.json`. | **PASS**, 2 tests, 182 expectations, 0 failures. |
| `git diff --check` | Scoped repository whitespace check. | **PASS**, exit 0. |
| Five support source/copy SHA-256 comparisons | Each new valid or invalid support copy compared with its original `typed-*` file. | **PASS**, all five matched. |
| Protected PDF SHA-256 | `examples/kitchen-sink.pdf`. | **PASS**, remains `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`. |
| Scoped `git status --short --branch` | Branch and final worktree scope. | **PASS**, only the approved new paths listed above are present; no existing product or generated-output path remains modified. |

The focused test verifies the index order, relative-link resolution and
containment, navigation boundaries, lesson metadata, input/import-free
lessons 01-03, and support-file availability. It runs the index and each
lesson 01-07 with the documented inputs, asserts representative bindings and
Measurement values with units, checks lesson 07's named JSON/CSV output
shapes and rendered table/chart content, and expects invalid input failures:
the asset fixture reports `AMX4003` with `/id`, and the CSV fixture reports
`AMX4003` with `record[1].severity`. Output files and rendered HTML are
created under a system temporary directory and removed in test cleanup.

Test iterations found and corrected three guide issues before the final pass:
a mismatched lesson 07 section heading, a non-literal record default, and a
missing explicit nested `FailureMode` import for mapped `Asset` validation.
The final run is the successful command/result listed above.

`bun run build` briefly caused a worktree status flag on the generated
`src/renderer/diagramBrowserRuntime.ts` due to line-ending conversion. Its
tracked content hash matched `HEAD`; the checkout line endings were restored,
and the final scoped status is clean of that path. No runtime change is part
of this sprint.

No full test suite, full corpus/reference sweep, packaged build, desktop UI
workflow, native platform acceptance, or release command was run.

## Acceptance matrix

| Acceptance ID | Status | Evidence |
| --- | --- | --- |
| `V15-GUIDE-GATE-01` | **PASS** | Dated Sprint 090 `ACCEPTED/CLOSED` disposition with no exceptions plus separate Sprint 091 authorization and approved file/test/output plan are recorded above and in the linked Sprint 090 disposition evidence. |
| `V15-GUIDE-INDEX-01` | **PASS** | `examples/00_Table_of_Contents.amx` lists lessons 01-07 in order, states objectives and support assumptions, and links only to existing lessons; focused link test passes. |
| `V15-GUIDE-ORDER-01` | **PASS** | New lesson filenames and index links use the approved unique two-digit sequence 01-07; no later chapter is linked. |
| `V15-GUIDE-LESSON-01` | **PASS** | `01_First_Computable_Document.amx` is Markdown plus one exact executable fence, binding and interpolation; test executes it without inputs or imports and checks expected values. |
| `V15-GUIDE-LESSON-02` | **PASS** | `02_Expressions_and_Decisions.amx` demonstrates precedence, mutation, conditional expression and statement; production CLI results are asserted. |
| `V15-GUIDE-LESSON-03` | **PASS** | `03_Collections_and_Functions.amx` demonstrates a range, list transform, loop, pure function and `match`; production CLI results are asserted without imports or inputs. |
| `V15-GUIDE-LESSON-04` | **PASS** | `04_Typed_Records_Enums_and_Modules.amx` covers required/optional/default/null fields, DateTime, inheritance/override, enum values, explicit module imports and exports; production CLI validates the imported module. |
| `V15-GUIDE-LESSON-05` | **PASS** | `05_Measurements_and_Units.amx` demonstrates dimensions, units, conversion and compatible addition; CLI tests assert values together with displayed unit names. |
| `V15-GUIDE-LESSON-06` | **PASS** | `06_Mapped_Data_and_Validation.amx` declares exact typed mappings and states valid and intentional-invalid fixture paths/outcomes; valid CLI values are asserted and invalid cases are exercised in the focused test. |
| `V15-GUIDE-LESSON-07` | **PASS** | `07_Tables_Charts_and_Named_Outputs.amx` renders a table/chart and exports `summary` JSON and `resultRows` CSV; CLI bindings, output contents, and temporary rendered HTML are asserted. |
| `V15-GUIDE-NAV-01` | **PASS** | Focused test resolves every guide link within `examples/`; 01 and 07 respect route boundaries and 02-06 link index/previous/next. Existing safe-link behavior was not changed. |
| `V15-GUIDE-DESKTOP-01` | **PASS** | Each lesson provides consistent Open Project, project-explorer, Run, and Preview instructions. Native desktop execution and packaging are not claimed or tested. |
| `V15-GUIDE-SUPPORT-01` | **PASS** | Both existing local modules resolve; all five approved data/invalid paths exist and match their original fixture content. |
| `V15-GUIDE-TEST-01` | **PASS** | `bun test tests/numbered-guide.test.ts`: 2 tests, 182 expectations, 0 failures. No existing consumer path was changed. |
| `V15-GUIDE-OUTPUT-01` | **PASS** | Test outputs use and clean a system temp directory; the protected PDF hash matches the Sprint 090 baseline; no tracked generated output was changed. |
| `V15-GUIDE-SCOPE-01` | **PASS** | No files 08-14, full report, desktop integration, broad docs/reference migration, package changes, or `planning/STATUS.json` edits were included. |
| `V15-GUIDE-CLOSEOUT-01` | **PASS** | Separate Lead Developer/product-owner disposition received on 2026-10-18: `ACCEPTED/CLOSED`, no exceptions. |

## Residuals and owners

- Add and connect lessons/references 08-14 and the complete report: Sprint 092.
- Migrate legacy typed-example data paths and update the wider corpus tests,
  package scripts, release smoke consumers, and references: Sprints 092-094,
  with test migration owned by Sprint 094.
- Integrate the guide into desktop Welcome/Starter Examples and prove package
  parity/offline project creation: Sprint 093.
- Complete cross-surface/package/native acceptance and full path migration:
  Sprint 094.
- Keep `examples/kitchen-sink.pdf` unchanged unless separately authorized.
- No Sprint 091-caused broken references or known failures remain in the
  authorized focused test scope.

## Separate closeout disposition

- Decision date: 2026-10-18.
- Authority: Lead Developer/product owner.
- Disposition: `ACCEPTED/CLOSED`.
- Exceptions: None.
- Sprint 092: Not started or authorized by this closeout.

The Lead Developer/product-owner received the Builder recommendation and
recorded the separate closeout disposition above. Sprint 091 is accepted and
closed within its authorized scope. The residuals remain assigned to Sprints
092-094 as listed; this closeout does not claim their completion or authorize
their work.
