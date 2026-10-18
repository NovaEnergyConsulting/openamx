# Sprint 092 Builder Evidence and Closeout

## Builder status and recommendation

**Current status: `BLOCKED/OPEN` pending a separate Lead Developer/product-owner
disposition.**

The Builder recommends `ACCEPTED/CLOSED` for the approved Sprint 092 scope,
subject to the residual owners below. This record is implementation evidence
and a closeout request; it is not the required product-owner disposition.
Sprint 093 has not been started.

## Entry gate and authorization

- Sprint 090: `ACCEPTED/CLOSED`, no exceptions, by dated Lead
  Developer/product-owner disposition on 2026-10-18.
- Sprint 091: `ACCEPTED/CLOSED` within its authorized scope, as recorded in
  its Builder evidence.
- Sprint 092: the user separately authorized execution and approved the
  exact file/test/output plan on 2026-10-18 before implementation.
- Starting branch: `feat/create-V015`.
- Starting commit: `181692c25007300653d075199d39273f50f1720d`.
- Starting worktree: clean; `git status --short --branch` showed only
  `## feat/create-V015`.
- No commit was created during this work.

## Approved and changed paths

The implemented paths are within the approved plan:

- Updated `examples/00_Table_of_Contents.amx` to list guided lessons 01-11,
  destination report 12, and independent standalone references 13-14.
- Updated `examples/07_Tables_Charts_and_Named_Outputs.amx` to link to 08.
- Added:
  - `examples/08_Formula_Driven_Diagrams.amx`
  - `examples/09_Runtime_Type_Checks.amx`
  - `examples/10_Mathematics_and_Measurement_Operations.amx`
  - `examples/11_Text_and_Numeric_Formatting.amx`
  - `examples/12_Complete_Asset_Screening_Report.amx`
  - `examples/13_Route_Measurement_Report.amx`
  - `examples/14_Battery_Resistor_Circuit.amx`
  - `examples/data/measurement-trips.json`
- Extended `tests/numbered-guide.test.ts` for 00-14 navigation, contained
  links, support closure, CLI bindings, output shapes, negative input cases,
  and temporary HTML render checks.
- Added this Builder evidence and closeout request.

No legacy example, existing support path, test consumer outside the approved
test, runtime/editor/renderer behavior, package configuration, product
documentation, `planning/STATUS.json`, or desktop resource path was changed.
The route data added under `examples/data/` is byte-identical to
`examples/v09-trips.json` (SHA-256:
`0A9F404DFF4DBD8D10665045F8D60C2F675C01A7EDC5835CCB2A65982351121E`); the old
path remains for its existing consumer.

## Protected paths and output preservation

The following hashes were captured before implementation and rechecked after
the focused tests. Every hash matches byte-for-byte:

| Protected artifact | SHA-256 | Result |
|---|---|---|
| `examples/asset-fleet-risk-analysis.html` | `B40555CD63CBAF3D9BD8DD60EEFC6405924764CECBCB3B778F5527F6CDA5316B` | Unchanged |
| `examples/hello-world.html` | `9139B059D9C3A9435E679936885B65E8FE08E76DF16D047BABA6FFD4B6A33029` | Unchanged |
| `examples/transformer-strategy.html` | `833679AF078364674F95780FC9D77FB956CB4BA9F58A0770C9ECD5218B7874EF` | Unchanged |
| `examples/typed-asset-analysis.html` | `532FD2C4E1482C61FAAA590C383E40A1D37F921014035D1EAEE02D6DF06D9933` | Unchanged |
| `examples/kitchen-sink.pdf` | `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778` | Unchanged |

`examples/.openamx/local.json` remains present and untouched. Focused CLI,
render, and named-output checks wrote only inside a Bun-created temporary
directory; the test removed only that directory. No pre-existing output,
artifact, test result, screenshot, log, or user data was cleaned or
overwritten.

The final branch remains `feat/create-V015` at the starting commit. The final
worktree contains only the approved paths above; the build-generated
`src/renderer/diagramBrowserRuntime.ts` has the same Git blob hash as `HEAD`
and is not a changed path.

## Focused verification

Environment: Bun `1.4.2` (`744846f84`).

| Command | Result |
|---|---|
| `bun run build` | **PASS**, exit 0. |
| `bun test tests\numbered-guide.test.ts tests\diagram.test.ts tests\diagramHtml.test.ts tests\isTypeChecking.test.ts tests\v14MathLibrary.test.ts tests\v14TextFormatting.test.ts` | **PASS**, 43 tests, 1,012 expectations, 0 failures. |
| `git diff --check` | **PASS**, exit 0. A transient build-time line-ending warning concerned the unchanged generated runtime file; its content hash matched `HEAD`, and it is absent from the final changed-path list. |

The guide test runs every document 00-14 with its documented mappings,
checks relative-link containment and the distinction between the guided
sequence and standalone references, and renders the new reports/diagrams and
V0.14 narrative references to temporary paths. It asserts:

- Lesson 09 predicate bindings across primitives, recursive records and
  lists, optional/null values, enums, and Measurement dimensions.
- Lesson 10 constants/functions and Measurement values together with units;
  lesson 11 Unicode counts, locale strings, rounding, Measurement display,
  and output boundaries.
- Report 12's exact named summary shape, complete CSV rows, illustrative
  score values, Measurement display value, and expected table/chart text.
- Reference 13's exact JSON output rows and units, table/chart render, and
  route values.
- Reference 14's voltage, resistance, constant `0.6` current, diagram title,
  and rendered time-control structure.
- Invalid report mappings fail with `AMX4003` at the asserted screening
  field/asset path, and no named output is written.

The focused existing V0.14 suites assert the invalid-target `is` diagnostics,
math `AMXSL001`/`AMXSL002` domain and finite diagnostics, and text/formatting
`AMXSL003`-`AMXSL006` diagnostics, including their expected messages and
source locations. Existing diagram suites retain their fixture and
interactive-render assertions.

No PDF or DOCX export was executed in this approved focused command set. The
diagram lessons state the V0.13 contract that PDF/DOCX contain a static frame
at the lower time bound without playback controls; DOCX uses an image, not
editable native Word shapes. No export, accessibility, desktop-packaging, or
platform claim is made.

### Initial failures and retries

- The first expanded guide run exposed incomplete navigation expectations
  and Bun's default five-second test timeout. The expected link sets were
  corrected to the actual prerequisite/reference links, and only the
  end-to-end guide test timeout was raised to 60 seconds.
- The Measurement example initially tested `max` with equal physical values
  in different units. It was adjusted to keep the accepted `2 meter` total
  and use a separate unequal list for the original-unit `max` result.
- The complete report initially omitted the transitively used
  `FailureMode` type import. It was added before the report's final run.
- Report rendering initially failed with
  `AMX3002: format expects a Number or Measurement, got undefined`
  at line 118, column 15. The narrative referenced a field removed to
  preserve the accepted summary output shape; it now formats the local
  `meanScreeningScore` binding. The final render test passes.
- Initial link and rendered-diagram assertions were corrected to recognize
  the standalone reference's intended backlink and the renderer's
  `data-openamx-diagram`/scrubber structure.

## Acceptance matrix

| Acceptance ID | Status | Evidence |
|---|---|---|
| `V15-REF-GATE-01` | **PASS** | Separate prior-sprint dispositions and separate Sprint 092 execution/plan approval are recorded above. |
| `V15-REF-INDEX-01` | **PASS** | Index test confirms the numbered 01-12 guided route and separately labeled 13-14 references, with every link resolving. |
| `V15-REF-NAV-01` | **PASS** | Focused test verifies index/previous/next and destination/reference backlinks, relative links, and containment. |
| `V15-REF-08` | **PASS** | Lesson runs and renders; radius, rod length, title, and controls are asserted. The text preserves the accepted geometry/time caveats. |
| `V15-REF-09` | **PASS** | Runtime predicates execute with asserted true/false values; existing V0.14 tests assert invalid target diagnostics. |
| `V15-REF-10` | **PASS** | Constants, functions, representative operations, values, and units are asserted; focused V0.14 math tests assert domains, finite behavior, and exact diagnostics. |
| `V15-REF-11` | **PASS** | Unicode/text/format bindings and rendered narrative are asserted; focused V0.14 formatting tests assert boundaries and exact diagnostics. |
| `V15-REF-12` | **PASS** | Report runs/renders with all declared inputs, exact summary/CSV outputs, table/chart content, Measurement example, and illustrative caveats. |
| `V15-REF-13` | **PASS** | Route reference runs/renders with its declared JSON/module closure and exact exported values/units. |
| `V15-REF-14` | **PASS** | Standalone circuit runs/renders with expected values, title, and the constant-current/arrow-motion caveat. |
| `V15-REF-FEAT-01` | **PASS** | Accepted feature rows 11-19 map to lessons/references 08-14 and the focused feature tests. Static PDF/DOCX behavior is documented from the V0.13 contract but was not re-exported here. |
| `V15-REF-SUPPORT-01` | **PASS** | Inputs and local modules resolve; valid and invalid data remain separate; the guide route input is canonical under `data/`. |
| `V15-REF-CLEANUP-01` | **PASS** | No legacy source was retired. Remaining non-guide compatibility/test AMX paths are explicitly classified with owners and removal conditions below; the index has one canonical numbered guide. |
| `V15-REF-CONSUMER-01` | **PASS** | No existing consumer path was moved or removed. The new route data path is additive; the old route path remains for existing tests. |
| `V15-REF-OUTPUT-01` | **PASS** | All four HTML snapshots and the user PDF match their starting SHA-256 hashes; local project state remains present. |
| `V15-REF-TEST-01` | **PASS** | Approved build, focused test command, output checks, invalid-input checks, and `git diff --check` pass. |
| `V15-REF-SCOPE-01` | **PASS** | No runtime, editor, renderer, packaging, desktop, broad documentation/reference migration, release, or publication change is included. |
| `V15-REF-CLOSEOUT-01` | **BLOCKED** | Builder evidence and separate closeout request are ready; Lead Developer/product-owner disposition is pending. |

## Residual files and owners

All paths below remain unchanged and outside the numbered guide's 00-14
allowlist. They are retained as compatibility or test-only material rather
than additional canonical lessons:

| Retained paths / group | Current reason to retain | Owner and removal condition |
|---|---|---|
| `examples/hello-world.amx`, `examples/transformer-strategy.amx`, `examples/asset-fleet-risk-analysis.amx`, `examples/typed-asset-analysis.amx` | Existing tests, package render scripts, release/docs consumers, and historical/live links still refer to these paths. | Sprint 093 documentation/release owners and Sprint 094 test/script owners; retire only after every direct consumer is migrated and focused behavior coverage remains. |
| `examples/kitchen-sink.amx` and its existing module closure | Report/PDF tests and the desktop HTML chart security test still use this source; other docs reference it. | Sprint 094 test/security owner for test-only relocation and consumer migration; migrate README/authoring links under their separately approved documentation owner. Preserve report and security coverage before retirement. |
| `examples/v0.12-*.amx`, `examples/v0.13-*.amx`, `examples/v0.14-*.amx` | Existing specifications, README/VS Code help, and tests retain versioned source links. | Sprint 093 live documentation-link owners and Sprint 094 test owners; retire or reclassify only after those consumers move. |
| `examples/v05-asset-screening.amx`, `examples/v05-project.json` | Existing V0.5 project workflow tests still use the compatibility source/data. | Sprint 094 test/migration owner; retain until the V0.5 test fixture has a deliberate non-guide destination and all consumers move. |
| `examples/v09-measurement-report.amx`, `examples/v09-trips.json` | Existing route-report test still consumes the old pair. Reference 13 and `data/measurement-trips.json` are the new canonical guide paths. | Sprint 094 test owner; retire the old pair only after its direct test consumer migrates and the new reference is covered. |
| `examples/asset-fleet-risk-analysis.html`, `examples/hello-world.html`, `examples/transformer-strategy.html`, `examples/typed-asset-analysis.html` | Checked-in snapshots still back current tests and are protected until their planned migration. | Sprint 094; migrate assertions to temporary render destinations before removal. |
| `examples/.openamx/local.json` | Host-specific project-local state; excluded from the guide. | Product owner/desktop maintainer; do not remove without explicit authorization for this exact path. |
| `examples/kitchen-sink.pdf` | User-supplied artifact, unchanged and not a generated golden. | Immutable; any move/removal/generation over it requires separate explicit authorization. |
| Static diagram PDF/DOCX regression execution | Not included in the approved focused test command; this sprint did not change the renderer/export implementation. | Sprint 094 renderer/export acceptance owner; run only in its approved focused output plan with temporary destinations. |

No compatibility path is being represented as the canonical guide source.
The new `examples/data/measurement-trips.json` is the guide's route input;
the old `examples/v09-trips.json` remains only for its deferred consumer.

## Separate Lead Developer/product-owner closeout request

Please record a separate dated disposition for the authorized Sprint 092
scope:

- `ACCEPTED/CLOSED`, with any exceptions or residual-owner changes; or
- `BLOCKED/OPEN`, with the blocking evidence and follow-up owner.

The Builder recommendation is `ACCEPTED/CLOSED` within the approved plan and
focused evidence above. Until that separate disposition is recorded, Sprint
092 remains `BLOCKED/OPEN`; do not begin Sprint 093.
