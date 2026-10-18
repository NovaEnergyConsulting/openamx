# Sprint 090 Proposed Information Architecture and Feature Matrix

## Decision status

This is the Builder's complete contract recommendation, reconciled to the
confirmed scope in
[`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md),
the V0.14 behavior authority
[`language-spec-v0.14.md`](../../../docs/language-spec-v0.14.md), and the
file/reference inventory in
[`corpus-inventory-and-reference-trace.md`](./corpus-inventory-and-reference-trace.md).
It is not yet the approved V0.15 architecture. The Lead Developer/product
owner must separately accept or reject the proposals and resolve the
blockers in `builder-evidence-and-closeout.md`. No examples are changed by
this document.

## Curriculum proposal

The shared narrative is a light, illustrative asset-screening scenario, based
on the existing North Pump/asset-screening data and schemas. It is not a
calibrated failure probability, financial forecast, engineering standard, or
certified risk model. Keep early calculations input-free and use explanatory
values before introducing any domain formula. Do not imply that the current
Transformer, fleet, V0.5, and typed-asset scores are comparable.

The recommendation is one continuous desktop-first route followed by two
clearly marked standalone references. `00` is reserved for the index;
remaining instructional/reference documents use contiguous two-digit
prefixes. The two standalone references are indexed but are not prerequisites
for completing the guided route.

| Order / proposed filename | Role | Learning outcome; prerequisites and dependencies | Navigation destination |
| --- | --- | --- | --- |
| `00_Table_of_Contents.amx` | Index | Explains the route and distinguishes guided lessons from references. No imports or inputs. | Links to every retained lesson/reference in order; identifies the first lesson and final-report destination. |
| `01_First_Computable_Document.amx` | Guided lesson | Open, read, run and preview a minimal Markdown/AMX document. Front matter is optional; use one exact `amx` fence, bindings and inline values. Input-free and import-free. | Index and lesson 02. |
| `02_Expressions_and_Decisions.amx` | Guided lesson | Explain values, operators, expressions, precedence, mutation and conditional expressions/statements with visible outputs. Reuses only concepts introduced in 01. | Index, previous 01, next 03. |
| `03_Collections_and_Functions.amx` | Guided lesson | Explain lists/ranges, collection transformations, loops, pure functions, matching and document sections/tables without external files. | Index, previous 02, next 04. |
| `04_Typed_Records_Enums_and_Modules.amx` | Guided lesson | Explain typed records, optional/default fields, inheritance/override, enum primitive values, imports/exports and local-module scope. Introduces the local library only after imports are explained. | Index, previous 03, next 05. |
| `05_Measurements_and_Units.amx` | Guided lesson | Define dimensions/units; construct and convert Measurements; explain displayed units and dimensional compatibility. Input-free; external mappings are not required. | Index, previous 04, next 06. |
| `06_Mapped_Data_and_Validation.amx` | Guided lesson | Declare typed JSON/CSV inputs, map them explicitly, show valid values and deliberately invalid input diagnostics. Required files are named and labeled. | Index, previous 05, next 07; links to the invalid-only fixtures are labeled as negative cases. |
| `07_Tables_Charts_and_Named_Outputs.amx` | Guided lesson | Present calculated results with tables/charts and explain named JSON/CSV outputs plus the supported report/export workflow. Introduces only dependencies already explained in 06. | Index, previous 06, next 08. |
| `08_Formula_Driven_Diagrams.amx` | Guided lesson | Read a formula-driven diagram and its time-dependent geometry using existing AMX expressions; make no stateful-solver, trigonometry, accessibility, or physical-axis claim. Based on the crank-slider example. | Index, previous 07, next 09; related references are discoverable from the index. |
| `09_Runtime_Type_Checks.amx` | Guided lesson | Use V0.14 `is` predicates with visible types and explain true/false matches, structural records, optional/null values, lists, enums and Measurement dimensions. | Index, previous 08, next 10. |
| `10_Mathematics_and_Measurement_Operations.amx` | Guided lesson | Use V0.14 constants/math and existing Measurement-aware standard-library operations; state domain and unit behavior from the V0.14 specification. | Index, previous 09, next 11. |
| `11_Text_and_Numeric_Formatting.amx` | Guided lesson | Use V0.14 text functions and bounded numeric formatting; show observable Unicode, locale, rounding and Measurement display behavior. | Index, previous 10, next 12. |
| `12_Complete_Asset_Screening_Report.amx` | Guided destination | Reach a complete, illustrative report combining only already explained concepts, with a back-link to focused lessons. This is the destination, never a prerequisite for 01-11. Its explicit data/module closure is declared in the support table below. | Index, previous 11, no next guided lesson; links back to relevant focused lessons. |
| `13_Route_Measurement_Report.amx` | Standalone reference | Retain the distinct route/Measurement input workflow if approved: mapped trips, local unit library, report table/chart and named output. Not on the prerequisite path. | Index and related lessons 05-07; no sequence previous/next semantics. |
| `14_Battery_Resistor_Circuit.amx` | Standalone reference | Retain the distinct V0.13 circuit illustration if approved, preserving the stated constant-current meaning and non-physical arrow-motion caveat. | Index and lesson 08; no sequence previous/next semantics. |

Every retained instructional or reference `.amx` must have one unique
two-digit numeric prefix, a descriptive title, a role, an objective,
prerequisites, declared support dependencies and an index destination.
`00` is the only index prefix; `01`-`14` have no gaps. Support data and
libraries are not numbered. Test-only or archived AMX fixtures are not
instructional/reference files and must live outside the distributed guide
boundary with their test purpose explicit.

### Proposed support layout and dependency closure

Keep `examples/` as the one canonical repository source. The names below are
the recommended post-migration paths; old files remain unchanged until their
own later sprint is authorized.

```text
examples/
  00_Table_of_Contents.amx
  01_... through 14_... .amx
  data/
    asset.json
    screenings.csv
    reviewed-at.json
    measurement-trips.json
  fixtures/
    invalid/
      asset.json
      screenings.csv
  libraries/
    asset-management.amx
    screening.amx
    travel-measurements.amx
```

The proposed offline package contains the 00-14 AMX set, the transitive
dependency closure listed above, and the invalid-only files only because
lesson 06 is proposed to teach their offline use. Remove any support file
from this allowlist if its final lesson no longer depends on it. Do not
bundle `examples/.openamx/local.json`, project-local state, tests, the
test-only Kitchen Sink/V0.5 fixtures, unrelated root `libraries/`, generated
HTML/PDF/DOCX, or the user-supplied Kitchen Sink PDF.

For the generated user's project, materialize the allowlisted guide contents
at the selected empty project root, preserve relative paths, initialize only
the normal project configuration, and open
`00_Table_of_Contents.amx`. Do not leave a competing default `report.amx`
for this guided choice. Normal project creation and the existing two quick
starters keep their current behavior. This is a future behavior contract,
not a claim that current desktop project creation copies directories.
The Electrobun resource staging path and atomic copy mechanism are an
implementation decision for Sprint 093; the repository guide remains the
canonical source and the bundle must be verified against it.

### Index, lesson navigation and desktop entry behavior

- The index and all cross-document guide navigation use supported relative
  `.amx` links. Every link resolves to an existing visible AMX document
  inside the guide tree; no absolute paths, remote content, package imports,
  or links escaping the guide are required.
- The index exposes the guided order, each objective, required support-file
  assumptions, and the distinct standalone-reference section.
- Lessons 01-11 link to the index, previous lesson and next lesson. Lesson 01
  has no previous lesson; lesson 12 is the guided-route end and links to the
  index and focused lessons. References 13/14 link to the index and related
  lessons but are not inserted into the guided prerequisite chain.
- Desktop preview already opens a contained relative `.amx` target as a
  visible in-project document tab without attachment confirmation. Preserve
  that behavior. Contained local non-AMX targets continue through the
  existing confirmation path; unsafe, missing, hidden, symlinked or
  out-of-project targets remain rejected. No new renderer or link capability
  is part of this proposal.
- Expose the guide as a clearly named guided-journey choice through the
  existing Welcome-to-Help/Starter Examples affordance. Keep “Hello OpenAMX”
  and “Operations Note” labeled as compact, input-free quick starts. Do not
  replace them, merge them into the guide, or redesign the desktop UI.
- Keep all lesson instructions usable offline. External services, remote
  imports, remote data, remote media and remote navigation are not
  dependencies.

## Generated-output policy

The four HTML files in the corpus are deterministic generated snapshots:
`hello-world.html`, `transformer-strategy.html`,
`asset-fleet-risk-analysis.html`, and `typed-asset-analysis.html`. The root
package scripts specify reproducible source/input mappings. Existing
`tests/examples.test.ts` checks visible report content and compares a fresh
render with each checked-in file after line-ending/CSP normalization. The
outputs are not linked by the current README as user-facing lessons and can
be rendered on demand, so the recommendation is **REMOVE from `examples/`**
only after Sprint 094 moves assertions to temporary destinations and keeps
focused structural/content checks. Do not run those render scripts against
the current files during Sprint 090. No HTML output is part of the desktop
guide package.

`examples/kitchen-sink.pdf` is not a generated output candidate: it is
user-supplied, its recorded baseline hash is above, and it is **immutable**.
No replacement or deletion is proposed. Any later request to move/remove it
requires separate authorization. No other generated file was found in the
current `examples/` tree.

## Feature-to-example matrix

The destination names refer to the proposed curriculum above. A combined
lesson is intentional only where the row says why; each row has a future
acceptance ID. This matrix is contract evidence, not execution evidence.

| Required feature/workflow | Destination and proposed observable coverage | Combination rationale / support dependency | Future fixture |
| --- | --- | --- | --- |
| Markdown document structure, optional front matter, exact case-sensitive `amx` fences, inert ordinary fences, bindings and inline interpolation | 01; show a small narrative, one binding and its rendered inline value; explicitly distinguish prose and other fences. | These are the minimum concepts required for the first runnable document; no input or module. | `V15-IA-FEAT-01` |
| Values, literals, operators, precedence, expression results, mutable bindings and assignments | 02; show a short progression with printed/interpolated expected values. | Keep the first runnable lesson small; decisions naturally follow values and expressions. | `V15-IA-FEAT-02` |
| Conditional expressions/statements, `match`, loops and block/iterator scope | 02-03; show selected results and assignment behavior, including V0.12 braced-`if` rules. | The two conditional forms belong with decisions; collection loops and `match` belong with iteration/collection work. Do not imply flow narrowing or function-return behavior not in the specs. | `V15-IA-FEAT-03` |
| Lists, ranges, collection transformations, functions and pure computations | 03; show a list transformation and named function before any input mapping. | Group reusable calculation patterns as one step after simple expressions and before typed records/modules. | `V15-IA-FEAT-04` |
| Typed records, required/optional/default fields, nullability, DateTime, inheritance and `override`, enums and primitive member values | 04; show a typed domain record and a small enum; preserve non-subtyping and effective-field behavior. | Related data-shape concepts are taught together; local imports/exports are introduced only after the lesson explains the dependency. | `V15-IA-FEAT-05` |
| Local modules, explicit exports/imports, source order, containment and reusable library declarations | 04, then reused in 12/13; use only a relative local `.amx` import and explain its support file. | Modules are a dependency concept, so place them after the input-free foundations; no network/package import is added. | `V15-IA-FEAT-06` |
| Measurements, dimensions, units, conversions, compatible dimensions and displayed units | 05; show expected values together with units, including conversion without changing the declared dimensional meaning. | Establish Measurements before the V0.14 `is` and math lessons that rely on dimension behavior. | `V15-IA-FEAT-07` |
| JSON/CSV mapping, typed inputs, explicit logical-name mapping, validation modes and invalid inputs | 06; document exact file mappings and expected valid bindings; label invalid fixture paths as deliberate failures. | JSON and CSV are combined because the confirmed workflow maps both named formats; keep valid and invalid files physically and textually distinct. | `V15-IA-FEAT-08` |
| Named JSON/CSV outputs and output-write failure behavior | 07, with the typed report in 12; identify exported names, exact shapes and destinations. | Teach output only after readers have encountered typed values and mapped inputs; keep future test destinations temporary. | `V15-IA-FEAT-09` |
| Tables, charts, document/report structure and report/export workflow | 07 and destination 12; use a small table/chart in 07, then an integrated report; state HTML/PDF/DOCX differences only as documented. | Views belong together as presentation choices; the complete report shows integration without making the report a prerequisite. | `V15-IA-FEAT-10` |
| V0.13 formula-driven diagrams, time variable, lines/rectangles/circles/text, static styling, scrub/play behavior and static PDF/DOCX frame | 08 and standalone 14; lesson 08 uses the current crank-slider contract; reference 14 retains the caveated battery circuit if approved. | Geometry, playback and export distinctions form one visual workflow. The battery reference remains separate because its electrical illustration is a distinct scenario and meaning. | `V15-IA-FEAT-11` |
| V0.14 `is` with visible simple type targets, true/false results and no static narrowing | 09; include valid mismatches as `false`, not diagnostics; unknown/invisible/non-type targets remain errors. | Focused predicates deserve their own lesson so structural and nominal-looking cases are not conflated. | `V15-IA-FEAT-12` |
| V0.14 structural/recursive record matching, extra and optional fields, nullable/null values, recursively checked and empty lists | 09; include representative match/nonmatch bindings. | These are distinct observable branches of the same runtime predicate contract and belong in its focused example. | `V15-IA-FEAT-13` |
| V0.14 enum underlying primitive membership and Measurement dimension-vector matching; Number versus dimensionless Measurement | 09; show enum membership and dimension match/mismatch explicitly. | Both are target-type cases for `is`; do not imply nominal enum identity or Number/Measurement equivalence. | `V15-IA-FEAT-14` |
| V0.14 `PI`, `E`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`, `ln`, `log`, `exp`; radians, log bases, normalized dimensionless Measurement inputs, finite inputs/results and domains | 10; map each function/constant and valid-domain rule to an expected binding or explicit future negative fixture. Invalid input/domain is `AMXSL001`; non-finite result is `AMXSL002`. | Group math as one family; include domains/diagnostics in acceptance even if the guided example demonstrates representative functions only. | `V15-IA-FEAT-15` |
| Existing Measurement-aware `sum`, `mean`, `min`, `max`, `abs`, `round`, `sqrt`, `pow`, including unit and empty-list behavior | 10; preserve conversions, output units, displayed-value rounding and dimension transformations. | Teach alongside V0.14 math because dimensional correctness is the common explanatory frame; do not claim these operations were newly introduced in V0.14. | `V15-IA-FEAT-16` |
| V0.14 `len` for text/lists, Unicode code-point count, Unicode 15.1 `trim`, and `left`/`right` count boundaries/diagnostics | 11; show supplementary-plane and combining examples, list length, whitespace and slice boundaries; invalid counts report `AMXSL003`. | These text operations share string/list inputs but have distinct normative count/whitespace rules; include each rule in the test matrix. | `V15-IA-FEAT-17` |
| V0.14 bounded `format` grammar, en-US/de-DE/fr-FR separators, grouping, currency/percent, rounding, negative zero, finite-only behavior and Measurement display | 11; show exact formatted strings and unit preservation; malformed patterns/locales/non-finite values report `AMXSL004`/`AMXSL005`/`AMXSL006`. | Keep text formatting and numeric display in one presentation-focused lesson; unsupported patterns/locales remain explicit exclusions. | `V15-IA-FEAT-18` |
| Full report destination, shared asset scenario, back-links to focused lessons and no new domain/runtime claims | 12; compute a complete illustrative report using only previously explained dependencies and clearly declared support files. | The accepted master plan explicitly treats the complete report as the route's destination, not the earlier lessons' prerequisite. | `V15-IA-FEAT-19` |
| Desktop-first opening, preview, Run, Inputs and Export workflow; offline package and discoverability | 01/06/07 and package entry contract; first lesson opens without mappings, then explicit inputs/outputs are introduced later. | The same desktop journey connects learning actions; package behavior is a later implementation requirement, not Sprint 090 runtime evidence. | `V15-IA-FEAT-20` |

## Stable acceptance fixtures

These IDs define future evidence obligations. Except where marked as current
contract/inventory evidence in the Builder record, they are **NOT RUN** in
Sprint 090. Each expected outcome is normative only after the separate
Lead Developer/product-owner decision.

| ID | Exact future fixture/action | Expected outcome | Evidence method | Owning later sprint/surface |
| --- | --- | --- | --- | --- |
| `V15-IA-INV-01` | Enumerate every path under the canonical `examples/` tree with hidden entries enabled. | Every current file has exactly one role, dependency/consumer record, disposition rationale and package decision; no hidden file is skipped. | Compare forced filesystem census and Git path listing to the completed inventory; fail on missing/duplicate paths. | Sprint 092 inventory/migration test. |
| `V15-IA-INV-02` | Search direct file/directory references and inspect path-sensitive scripts, resource staging and project creation. | Every active consumer in the trace has an owner and migration action; historical evidence is not silently rewritten. | Repository path search plus reviewed reference ledger and focused test assertions. | Sprint 094 reference audit; Sprint 093 docs/package. |
| `V15-IA-INV-03` | Compare protected corpus/output state before and after Sprint 090. | No corpus/product path changed; Kitchen Sink PDF remains byte-identical with the recorded SHA-256. | Git path status plus SHA-256 before/after; preserve all other output paths. | Sprint 090 Builder evidence. |
| `V15-IA-CUR-01` | Parse the proposed index and all retained instructional/reference filenames after migration. | Exactly one `00_` index; unique contiguous prefixes `01`-`14`; every retained lesson/reference is named and discoverable. | Filename/path test over the canonical guide tree and index entries. | Sprint 091/092 `tests/examples.test.ts`. |
| `V15-IA-CUR-02` | Run lesson 01 with no input mappings and no imported module. | It opens/runs/renders with the documented expected binding and contains no file dependency. | CLI/document test plus desktop-open/preview fixture using a temp project. | Sprint 091/094. |
| `V15-IA-CUR-03` | Review each guide item for role, goal, prerequisite, support dependencies and destination. | Every indexed item has complete metadata; standalone references are not prerequisites; report 12 is a destination. | Table-driven contract/content assertions and reviewer checklist. | Sprint 091/092. |
| `V15-IA-FEAT-01` | Compare every master-plan workflow and each V0.14/spec feature family to the matrix. | No feature is omitted; each row has a concrete file and fixture, or an explicit combined-lesson rationale. | Requirement-to-file-to-fixture referential-integrity test/review. | Sprint 092/094. |
| `V15-IA-NAV-01` | Resolve every index/lesson/reference navigation link. | Every cross-document link is relative `.amx`, exists inside the guide boundary and obeys the prescribed index/previous/next/boundary rules. | Link parser over all AMX narrative links; reject missing, absolute, remote or escaping destinations. | Sprint 091/094. |
| `V15-IA-NAV-02` | Open a relative AMX link and a local non-AMX attachment through desktop preview. | AMX opens a visible contained project tab without attachment confirmation; local attachment still receives existing confirmation; unsafe targets are rejected. | Extend existing desktop preview-navigation assertions without changing confirmation/security behavior. | Sprint 094 desktop test. |
| `V15-IA-PKG-01` | Stage the guide package from the canonical `examples/` tree and compare required transitive dependencies. | The package contains index, every approved lesson/reference and exact data/library closure; it contains no local metadata, unrelated files or generated outputs. | Build-time allowlist/dependency-closure test plus canonical/package manifest parity. | Sprint 093 package test. |
| `V15-IA-PKG-02` | Select the guided journey in the packaged offline app and create a new project with network disabled. | The project contains the approved guide tree and project config, opens `00_Table_of_Contents.amx`, and all required links/data/modules work offline. | Native packaged-app installation/project-creation acceptance with a recorded file manifest and offline run-through. | Sprint 093 desktop; Sprint 094 closeout. |
| `V15-IA-PKG-03` | Create both existing compact starters after adding the guide option. | Hello and Operations Note remain separately labeled, input-free quick starts and their existing expected bindings remain unchanged. | Starter unit test and Help/Welcome UI assertion. | Sprint 093/094 desktop. |
| `V15-IA-RUN-01` | Execute each retained runnable AMX. From the repository root, lesson 06/07/12 map `asset=examples/data/asset.json`, `screenings=examples/data/screenings.csv`, `reviewedAt=examples/data/reviewed-at.json`; reference 13 maps `trips=examples/data/measurement-trips.json`. In the packaged project the same logical mappings use `data/...`. | Pass only when every binding, Measurement unit, named output and rendered value matches the exact per-document expectations in [RUN-01 expected binding contract](#run-01-expected-binding-contract); no additional input or library may be implicit. | Table-driven CLI tests assert the listed bindings/units and exact output shapes; render/export destinations are temporary. Values below are derived from current sources and existing assertions, not new runtime verification. | Sprint 094 root/renderer. |
| `V15-IA-RUN-02` | Map the invalid-only asset JSON and screenings CSV from lesson 06. | Invalid asset reports `AMX4003` at `/id`. Aggregate CSV validation reports `AMX4003` for `record[1].severity` before `record[2].occurrence`; fail-fast reports exactly the first diagnostic. Failed runs create no named output. | Negative CLI fixtures assert exact diagnostic code/path/order/count and that output files are absent. | Sprint 094 root. |
| `V15-IA-RENDER-01` | Render representative guide/report documents to temporary HTML and inspect report structure/content. | Required title, narrative result, table/chart content and source/output distinction are present; no stale checked-in HTML is needed. | Structural assertions against temporary HTML with only established volatile-field normalization. | Sprint 094 root. |
| `V15-IA-RENDER-02` | Render the diagram lesson/reference in HTML/desktop preview and static PDF/DOCX. | Diagram title/model/control structure is present; static formats use the lower-bound frame as documented; no unverified accessibility/platform claim. | Renderer assertions plus later desktop preview/export tests, separately reported by surface. | Sprint 094 renderer/desktop. |
| `V15-IA-OUT-01` | Apply the approved disposition to each current output. | Each output is retained only with stated purpose, canonical source, exact reproducible workflow and content test; otherwise removed from the example corpus only after dependent tests migrate. Protected PDF remains immutable. | Per-file disposition ledger, temporary-output generation/content test, before/after hash for protected PDF. | Sprint 092/094; product-owner approval. |
| `V15-IA-TRACE-01` | Follow every master-plan requirement to a lesson/reference, support file and fixture. | No master-plan row or accepted V0.14 feature is untraced; deviations/unknowns have a named decision owner. | Joinable matrix IDs and reviewer audit. | Sprint 090 review, Sprint 094 closeout. |
| `V15-IA-GATE-01` | Record a separate Lead Developer/product-owner decision after reviewing the inventory and contract. | `ACCEPTED/CLOSED` names the approved architecture/exceptions, or `BLOCKED/OPEN` names remaining decisions/owners; Sprint 091 stays unstarted while pending/blocked. | Explicit dated disposition in an authorized Sprint 090 record. | Lead Developer/product owner; before Sprint 091. |

### RUN-01 expected binding contract

These are the proposed future test values for the named guide destinations.
They reuse values already present in the current source/test contract wherever
available. Rewritten lesson contents must retain these values or bring a
specific change back for product-owner review. Measurement values include
their displayed units.

| Order / source basis | Inputs | Exact expected outcome |
| --- | --- | --- |
| 01 / current `hello-world.amx` | None | `assetName = "Transformer TX-001"`; `riskScore = 15`. |
| 02 / current V0.12 braced-if fixture | None | `description = "high"`; `adjustedPriority = 8`. |
| 03 / current Transformer and Kitchen Sink test values | None | `doubled = [4, 8, 12]`; `returnCount = 3`; `modeScores = [24, 18, 27]`; `totalScore = 60`. |
| 04 / current V0.12 records/enums fixture | None | `asset = {id:"A-1",name:"Pump",status:2}`; `currentStatus = 2`. |
| 05 / current V0.14 Measurement example | None | `totalDistance = 2 meter`; `shortestDistance = 1 meter`; `absoluteDistance = 2 meter`; `roundedDistance = 1.24 meter`; `squareRootDistance = 3 meter`; `squaredDistance = 4 meter ^ 2`. |
| 06 / current typed-asset example | `asset`, `screenings`, `reviewedAt` using the mappings above | `scores = [16,18,4]`; `totalScore = 38`; `summary = {assetName:"North Pump 01",reviewedAt:"2026-09-29T12:00:00Z",totalScore:38}`. |
| 07 / current typed-asset output contract | Same three mappings | Named JSON `summary` is `{"assetName":"North Pump 01","reviewedAt":"2026-09-29T12:00:00Z","totalScore":38}`. Named CSV `resultRows` is exactly `assetId,score,note\nA-001,16,Bearing inspection\nA-001,18,Seal inspection\nA-001,4,\n`. The report contains “Screening register” and “Score by screening”. |
| 08 / current crank-slider example | None | `crankRadius = 34`; `rodLength = 105`; diagram title “Crank-slider mechanism”. |
| 09 / current V0.14 runtime type-check test | None | `structuralMatch:true`; `primitiveMatch:true`; `primitiveMismatch:false`; `absentOptionalField:true`; `nullableNull:true`; `nonNullableNull:false`; `allNumbers:true`; `emptyMatchesOtherElementType:true`; `enumMember:true`; `sharedMemberMatchesBoth:true`; `lengthMatch:true`; `dimensionMismatch:false`; `dimensionlessMatch:true`; `numberIsNotMeasurement:false`. |
| 10 / current V0.14 math/Measurement test | None | `sine:1`; `cosine:1`; `tangent:0`; `arcSine:PI/2`; `arcCosine:0`; `arcTangent:PI/4`; `hyperbolicSine:0`; `hyperbolicCosine:1`; `hyperbolicTangent:0`; `inverseHyperbolicSine:0`; `inverseHyperbolicCosine:0`; `inverseHyperbolicTangent:0`; `naturalLog:1`; `commonLog:2`; `exponential:E`; `dimensionlessSine:Math.sin(2)`; `totalDistance:2 meter`; `shortestDistance:1 meter`; `absoluteDistance:2 meter`; `roundedDistance:1.24 meter`; `squareRootDistance:3 meter`; `squaredDistance:4 meter ^ 2`. |
| 11 / current V0.14 text/formatting test | None | `codePointLength:3`; `listLength:3`; `combiningSequenceLength:2`; `trimmed:"AMX"`; `firstTwo:"A🙂"`; `lastTwo:"🙂B"`; `defaultLeft:"A"`; `emptyRight:""`; `groupedUS:"1,234.50"`; `groupedGerman:"1.234,50"`; `groupedFrench:"1 234,50"`; `percentage:"12.5%"`; `currency:"-$1,234.50"`; `displayedDistance:"1.25 meter"`; `displayedCentimeters:"125.00 centimeter"`. |
| 12 / integrated use of current typed-asset data | Same three mappings | Report identifies “North Pump 01” and shows an illustrative total of `38`; named summary matches 06 and output/presentation matches 07. |
| 13 / current V0.9 route report | `trips` using the mapping above | Exported summaries are North loop `{distance:1.5 kilometer,averageSpeed:3 kilometer_per_hour}` and South loop `{distance:0.5 kilometer,averageSpeed:1.5 kilometer_per_hour}`; HTML contains “Distance by route”. |
| 14 / current battery-resistor example | None | `current = 0.6`; diagram title “Battery-resistor DC circuit”; arrow motion is described as direction only, not changing current magnitude. |

## Decisions requested

The Builder recommends the architecture above, but requests explicit
Lead Developer/product-owner disposition on:

1. The exact filenames/order, including whether route measurements and the
   battery-resistor example remain standalone references 13/14.
2. Whether the Kitchen Sink source and V0.5 report become test-only fixtures,
   and the precise fixture paths/import closures.
3. Removing the four checked-in HTML snapshots from `examples/` after tests
   are migrated to temporary outputs and structural/content checks.
4. Excluding/removing the tracked machine-local `.openamx/local.json` from
   the distributable source set; it must not enter the offline package.
5. The explicit `data/`, `fixtures/invalid/` and `libraries/` layout and
   whether lesson 06 includes invalid fixtures in the desktop package.
6. The guide-specific project creation contract: materialize at the empty
   project root, open the index, omit the generic `report.amx` for that
   choice, and leave standard project creation/quick starts unchanged.
7. The offline package's concrete Electrobun resource staging path and
   copy/parity mechanism. The required user-project file closure is stated
   above; the current app has no such resource.
8. Whether historical V0.1 language-spec snippets remain historical or are
   updated when live example paths move.

All eight are **PENDING**; none is represented as approved by this Builder
proposal. Product owner/Lead Developer owns the decisions. Sprint 090 remains
`BLOCKED/OPEN` until a separate disposition is recorded.
