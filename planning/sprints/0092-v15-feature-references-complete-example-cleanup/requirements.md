# Sprint 092 Requirements: Feature References, Complete Example, and Corpus Cleanup

## Document Status and Entry Gate

Architect-prepared Sprint 092 documentation. Sprint 090's architecture was
separately accepted without exceptions on 2026-10-18, and Sprint 091 was
separately accepted/closed within its authorized scope. These dispositions
are prerequisites, not Sprint 092 execution authorization.

Obtain separate explicit Sprint 092 execution authorization and approval of
the concrete file-by-file change, test, output, and preservation plan before
implementing any example or test changes. The request to prepare this
documentation authorizes planning only.

## Goal

Complete the approved numbered example corpus after lessons 00-07 by adding
focused references 08-11, the integrated destination report 12, and the
standalone references 13-14; consolidate and reorganize remaining support
files and obsolete examples under the approved architecture; and ensure the
index and all retained instructional/reference AMX documents are complete,
numbered, and linked.

This sprint adds no language/runtime capability. It demonstrates the
approved V0.14 contract and existing document workflows using the
authoritative specifications.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md).
- Approved curriculum, filenames, feature mapping, support layout, link
  rules, and output policy:
  [`final-information-architecture-and-feature-matrix.md`](../0090-v15-example-information-architecture/final-information-architecture-and-feature-matrix.md).
- Corpus path/dependency/consumer trace:
  [`corpus-inventory-and-reference-trace.md`](../0090-v15-example-information-architecture/corpus-inventory-and-reference-trace.md).
- Sprint 090 architecture disposition:
  [`lead-developer-disposition-2026-10-18.md`](../0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md).
- Sprint 091 implementation and remaining ownership:
  [`builder-evidence-and-closeout.md`](../0091-v15-numbered-guide-core-learning-path/builder-evidence-and-closeout.md).
- Language behavior authority:
  [`language-spec-v0.14.md`](../../../docs/language-spec-v0.14.md), together
  with referenced earlier specifications where the feature predates V0.14.

If source inspection or a proposed cleanup conflicts with an approved
decision, preserve the existing file and request a decision or approved
file-plan amendment. Do not silently alter the contract or remove evidence
needed by an existing consumer.

## In Scope

- Create the remaining approved numbered AMX documents:
  - `examples/08_Formula_Driven_Diagrams.amx`
  - `examples/09_Runtime_Type_Checks.amx`
  - `examples/10_Mathematics_and_Measurement_Operations.amx`
  - `examples/11_Text_and_Numeric_Formatting.amx`
  - `examples/12_Complete_Asset_Screening_Report.amx`
  - `examples/13_Route_Measurement_Report.amx`
  - `examples/14_Battery_Resistor_Circuit.amx`
- Extend `examples/00_Table_of_Contents.amx` and connect the new sequence to
  the Sprint 091 lessons. Complete the final previous/index/next and
  standalone-reference navigation rules in the accepted architecture.
- Provide accurate objectives, prerequisites, desktop-first
  open/run/preview instructions, input/module dependencies, expected
  behavior, and navigation for every new document.
- Demonstrate every feature family assigned to these files by the accepted
  Sprint 090 feature matrix, especially all V0.14 user-facing families.
- Create the approved illustrative asset-screening destination report using
  only explained and supported features. Preserve the accepted scenario
  caveats; do not present illustrative scores as calibrated probabilities,
  investment advice, engineering standards, or comparable measures.
- Reorganize or classify required data, local libraries, valid/invalid
  fixtures, test-only examples, and legacy copies according to the accepted
  `data/`, `fixtures/invalid/`, and `libraries/` layout.
- Merge redundant content into the approved lessons/references and retire
  obsolete material only when its active test, script, and documentation
  consumers have been safely migrated or are explicitly recorded as a
  deferred compatibility residual.
- Add or update focused example tests for new feature/reference/report
  content and update tests directly coupled to any path actually changed in
  this sprint. Keep broader test migration assigned to Sprint 094.

## Out of Scope

- Desktop Welcome/Starter Examples integration, Electrobun resource staging,
  multi-file project creation, or packaged/offline desktop validation; these
  are Sprint 093.
- Broad README, desktop Help, VS Code, authoring-skill, language-spec-link,
  release-smoke, and repository-wide path migration; owners are Sprint 093
  and Sprint 094 as mapped by the accepted inventory.
- Full corpus, negative, renderer, starter, path/reference, package, native
  desktop, or integrated acceptance closeout; these are Sprint 094.
- Removing the four checked-in HTML outputs before Sprint 094 has migrated
  their assertions to temporary destinations and retained focused
  structural/content coverage.
- Moving, replacing, or deleting `examples/kitchen-sink.pdf`. It is
  user-supplied and immutable absent separate authorization.
- Removing `examples/.openamx/local.json` without explicit authorization
  covering that path. It must not be included in the distributable guide.
- Changes to language semantics, editor/renderer capabilities, safe-link
  behavior, security boundaries, dependencies, or release/publication.
- Updates to `planning/STATUS.json` or historical sprint records.

## Required Content Contract

| File | Required outcome |
|---|---|
| `08_Formula_Driven_Diagrams.amx` | Explain the existing formula-driven diagram/time workflow and its visible structure and controls, using the accepted crank-slider contract. Preserve caveats: no stateful solver, trigonometric claim, physical-axis claim, or unestablished accessibility claim. |
| `09_Runtime_Type_Checks.amx` | Demonstrate V0.14 `is` predicates across simple/visible types, recursive structural records, optional/null values, lists including empty lists, enum primitive membership, and Measurement dimension vectors. Distinguish valid `false` results from invalid/unknown-target diagnostics; do not imply static narrowing or nominal enum identity. |
| `10_Mathematics_and_Measurement_Operations.amx` | Cover V0.14 constants and mathematical functions, radians/domains/finite behavior, and existing Measurement-aware operations with correct units and empty-list behavior. Do not claim existing library operations are newly introduced in V0.14. |
| `11_Text_and_Numeric_Formatting.amx` | Demonstrate `len`, Unicode code-point behavior, trimming, left/right count rules, and bounded numeric formatting, including specified locales, rounding, Measurement display, and exact diagnostics. Keep unsupported patterns/locales explicit. |
| `12_Complete_Asset_Screening_Report.amx` | Combine the approved shared scenario, typed/mapped data, Measurements, analysis, presentation, and appropriate outputs. Declare its full support closure and link back to lessons/references. It is the destination, not a prerequisite. |
| `13_Route_Measurement_Report.amx` | Retain the approved standalone mapped route/Measurement workflow with local unit library, stated inputs, table/chart, and named outputs. It is not in the guided prerequisite chain. |
| `14_Battery_Resistor_Circuit.amx` | Retain the approved standalone circuit illustration with its established constant-current meaning and caveat that arrow motion does not represent changing current magnitude. It is not in the guided prerequisite chain. |

## Path, Support, and Output Rules

- Preserve `examples/` as canonical source. Use the accepted support groups:
  `examples/data/`, `examples/libraries/`, and
  `examples/fixtures/invalid/`. Keep valid and invalid input data distinct;
  declare every lesson's transitive support dependencies.
- The invalid JSON/CSV fixtures are deliberately negative examples. Their
  expected `AMX4003` field paths, aggregate/fail-fast behavior, and absence
  of output on validation failure must remain explicit where applicable.
- Keep tests and legacy compatibility fixtures out of the eventual desktop
  guide allowlist. Since packaging is Sprint 093, Sprint 092 must not claim
  package completeness or change desktop resource configuration.
- `examples/` must not retain an unnumbered AMX file presented as an
  instructional/reference document. A file retained temporarily for tests
  or compatibility must be explicitly classified as non-guide material,
  have an owner and removal/migration condition, and not appear as an
  unnumbered lesson in the index.
- A changed path must not leave known broken focused tests or active
  consumers. Migrate directly coupled tests within the approved Sprint 092
  file plan or preserve the old path as a clearly noncanonical compatibility
  fixture until its assigned Sprint 093/094 consumers move.
- Do not remove the four checked-in HTML snapshots in this sprint. Do not
  write generated results to their current paths; any verification output
  uses temporary destinations.
- Preserve `examples/kitchen-sink.pdf` unchanged and record its baseline
  hash when an approved operation could affect it.

## Exit Gate

Sprint 092 is complete when the full 00-14 architecture is represented by
the approved documents, all retained instructional/reference files are
numbered and linked, new content executes with documented assumptions,
focused path changes remain sound, and residuals have explicit owners.
Builder evidence is not a substitute for a separate Lead
Developer/product-owner closeout disposition. Sprint 092 does not authorize
desktop packaging, broad migration/closeout, release, or publication.
