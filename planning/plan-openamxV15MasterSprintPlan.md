# OpenAMX V0.15 Master Sprint Plan

## Problem and Proposed Approach

The `examples/` directory has accumulated beginner documents, version-specific
feature samples, complete reports, input data, local modules, and generated
HTML/PDF outputs. Their names and entry points do not currently provide one
clear path for a newcomer. Several tests and documentation surfaces also refer
to the existing paths directly.

V0.15 will reorganize the examples as a desktop-first, linked learning guide
that progresses from opening the application and understanding a first
`.amx` document to producing a complete, feature-rich document. It will use a
light shared scenario where that helps continuity and keep focused examples
for topics that are clearer in isolation. All user-facing V0.14 language and
document feature families are in scope. This is an examples, onboarding, and
acceptance version; it adds no language or runtime features.

The proposed primary entry point is `examples/00_Table_of_Contents.amx`.
Instructional and reference `.amx` documents will receive sequential numeric
prefixes and relevant titles. The index and tutorial steps will link to one
another using relative `.amx` links. Supporting data and libraries will be
grouped clearly without requiring numeric prefixes.

The packaged desktop app will make the numbered guide available from Welcome
or Starter Examples, including its required support files. The existing simple
Hello and Operations Note starters may remain as quick-start choices. The
repository's canonical guide files should be the source of truth for desktop
packaging so the bundled copy cannot silently diverge. Existing references
will be updated; generated outputs will remain only when they serve a
deliberate, tested purpose.

This plan records the confirmed V0.15 scope. It does not authorize feature
implementation, release, or publication.

## Confirmed Product Decisions

- **Audience and first surface:** newcomers starting in the OpenAMX desktop
  app.
- **Learning model:** a curated sequence plus standalone topic examples.
- **Narrative:** a light shared real-world scenario, with independent examples
  where a focused explanation is more effective.
- **Coverage:** all user-facing V0.14 language and document features.
- **Index:** a numbered AMX table of contents, with links to the numbered AMX
  guide.
- **Desktop distribution:** bundle the guide and its required data/libraries
  and expose it from the app's Welcome/Starter Examples path.
- **Numbering:** every instructional/reference `.amx` document; group support
  files clearly without numbering every asset.
- **Compatibility:** filenames may change; update in-repository references.
  Keep generated HTML/PDF only when purposeful and covered by acceptance.
- **Acceptance bar:** verify links and assets, execute runnable examples, and
  check key rendered outputs.

## Recommended Approach

- Inventory every current example, companion fixture, generated output, and
  repository reference before moving files. Assign each to a learning step,
  standalone reference, required support file, intentional output, or removal.
- Define an explicit V0.14 feature-to-example matrix and the novice learning
  order before writing the new guide. Each instructional document should state
  its goal, prerequisites, how to open/run/preview it in the desktop app, and
  where to go next or back to the index.
- Keep the first examples input-free and immediately runnable. Introduce local
  modules and mapped JSON/CSV inputs only after the basic document workflow is
  established. Keep intentionally invalid fixtures separate and clearly
  identified so a newcomer does not mistake them for runnable steps.
- Use the existing supported relative `.amx` linking behavior for the index
  and tutorial navigation. Test links from the source checkout and the
  packaged desktop project, retaining existing safe link handling and user
  confirmation behavior. Do not broaden link or renderer capabilities as
  part of this work.
- Bundle the canonical examples and only their required data/libraries with
  the desktop app. Verify resource discovery, destination layout, and links
  after installation/project creation. Preserve simple built-in starters if
  they remain useful and do not compete with the guide.
- Update tests and documentation at the same time as path changes. Preserve
  existing language, evaluation, renderer, export, and desktop behavior except
  for the approved onboarding and example organization changes.
- If a feature cannot be demonstrated without changing runtime behavior, or
  packaging/link limitations prevent the confirmed offline desktop journey,
  stop for a product decision instead of changing the feature contract.

## Confirmed Scope

### Learning Guide and Example Set

- Provide `00_Table_of_Contents.amx` as the directory's primary learning
  index. Its relative links lead through an ordered newcomer path and to
  standalone feature references.
- Prefix all instructional/reference AMX documents with sequence numbers and
  informative titles. The contract sprint will settle the final titles and
  order; the intended progression is:
  1. Open the desktop app, create/open a project, and find the guide.
  2. Read a minimal computable document: Markdown, executable AMX fences,
     bindings, and inline values.
  3. Build up expressions, control flow, collections, functions, and
     document structure.
  4. Introduce typed records, enums, inheritance, and local modules.
  5. Work with measurements and units.
  6. Map and validate JSON/CSV inputs and use named outputs.
  7. Present results with tables, charts, formula-driven diagrams, and report
     exports.
  8. Demonstrate V0.14 runtime type predicates, mathematical functions,
     Measurement-aware operations, text functions, and formatting.
  9. Finish with a complete report that combines the appropriate features and
     links back to focused references.
- Keep a small, input-free first step, and make later file dependencies
  explicit. The complete report is a destination, not a prerequisite for
  understanding the earlier focused examples.
- Organize supporting inputs, local libraries, and other needed resources so
  their relationship to the numbered documents is obvious. Preserve useful
  sample data and modules; remove obsolete copies and accidental outputs.
- Retain deliberate standalone feature examples, including advanced language
  topics, when they add reference value beyond the guided sequence. Avoid
  duplicating the same large all-features document as both tutorial and
  reference.

### Desktop Onboarding and Documentation

- Make the numbered guide discoverable from the desktop Welcome/Starter
  Examples workflow for a packaged app user. The guide and required companion
  files must be available offline in the project created/opened by that
  workflow.
- Keep the existing compact, input-free starters if useful; clarify which
  choice starts the guide versus a standalone starter.
- Maintain one canonical source for the guide rather than hand-maintained
  copies. Verify packaged files and relative links against the repository
  source.
- Update the root README and relevant desktop/VS Code guidance, help content,
  and authoring skill references so they lead to the new index or numbered
  documents. Update every direct in-repository reference affected by a
  filename or location change.

### Tests and Acceptance

- Update `tests/examples.test.ts` and any focused example/starter tests for
  renamed paths, moved fixtures, examples, and intentional output files.
- Verify every internal tutorial link and every required companion
  data/library path resolves inside the example/package boundary. Assert the
  intended numeric progression and ensure navigation is not broken by output
  or packaging paths.
- Execute each runnable example with its documented input mapping and verify
  representative values. Keep invalid-input/syntax demonstrations in
  intentionally negative tests with explicit expected diagnostics.
- Check selected HTML/PDF/DOCX or desktop-preview results structurally for
  key learning outcomes. Do not retain generated files solely as stale
  snapshots; any retained output must have a reproducible purpose and test.
- Verify the desktop packaged guide can be installed/opened and followed
  offline, including access to required support files and links. Exercise the
  normal safe local-link confirmation behavior.
- Run focused example and desktop starter tests, followed by the repository's
  applicable full verification gate. Record failures and any platform limits
  explicitly; do not imply broad platform certification.

## Explicit Exclusions

- New AMX syntax, standard-library functions, runtime semantics, editor
  language features, or report-format capabilities.
- Redesign of the desktop UI beyond making the guide and its first step
  discoverable through existing Welcome/Starter Examples affordances.
- New remote content, remote dependencies, or changes to established
  offline/security boundaries.
- Rewriting language specifications or broad product documentation unrelated
  to discovering, navigating, or validating the examples.
- Release engineering, version publication, certification claims, or changes
  to historical sprint records/status.

## Sprint Sequence

Continue after V0.14 Sprint 089, beginning with Sprint 090.

### Sprint 090: V0.15 Example Information Architecture and Acceptance Contract

- Inventory current examples, fixtures, outputs, in-repository links, desktop
  starter assets, and tests that rely on the existing paths.
- Define the ordered curriculum, numbered naming convention, supporting-file
  layout, scenario thread, and feature-to-example matrix.
- Lock the index/navigation behavior, desktop availability/package boundary,
  retained-output criteria, and acceptance fixtures before moving the corpus.

### Sprint 091: Numbered Guide, Index, and Core Learning Path (depends on Sprint 090)

- Create the linked numbered AMX index and ordered beginner documents.
- Rewrite/rehome foundational and intermediate examples with consistent
  learning objectives, desktop-first instructions, input requirements, and
  next/back navigation.
- Keep the early path runnable without external inputs; group companion files
  with the lessons that require them.

### Sprint 092: Feature References, Complete Example, and Corpus Cleanup (depends on Sprint 091)

- Integrate all approved V0.14 feature families and user-facing document
  workflows in focused examples and a coherent complete report.
- Reorganize useful data, libraries, invalid fixtures, and intentional output
  artifacts; remove redundant or obsolete files.
- Ensure every retained instructional `.amx` document is numbered and linked
  or explicitly identified as a standalone reference.

### Sprint 093: Desktop Guide Packaging and Entry-Point Integration (depends on Sprints 090, 091, and 092)

- Make the canonical guide and required supporting files available from the
  packaged desktop Welcome/Starter Examples path.
- Preserve useful compact starters and distinguish their role from the
  numbered learning journey.
- Update README, desktop/VS Code guidance, relevant help/authoring references,
  and any other direct repository links affected by the refactor.

### Sprint 094: Example Test Migration and V0.15 Acceptance Closeout (depends on Sprint 093)

- Update runnable, negative, renderer, starter, and path/reference tests to
  the new corpus.
- Verify link/asset containment, package completeness, learning order,
  example results, representative renderings, and offline desktop navigation.
- Remove stale generated artifacts; record evidence, residual limitations,
  and any accepted exceptions. Closeout adds no product feature scope.

## Relevant Files and Surfaces

- `examples/` — canonical numbered guide, standalone references, companion
  data/libraries, and any intentionally retained outputs.
- `tests/examples.test.ts` — root documentation/example/runnable-output
  contracts.
- `desktop-app/src/mainview/starterExamples.ts` and
  `desktop-app/src/mainview/starterExamples.test.ts` — bundled desktop starter
  behavior and tests.
- Desktop resource/package configuration, Welcome/Starter Examples flow,
  `desktop-app/README.md`, and
  `desktop-app/src/mainview/components/help-content.json`.
- `README.md`, `vscode-extension/README.md`, and
  `.github/skills/amx-authoring/SKILL.md` — discoverability and direct example
  references.
- Any other source/test files found by tracing direct references during the
  Sprint 090 inventory. `docs/language-spec-v0.14.md` remains authoritative
  and changes only if its example links need path updates.
- Do not update `planning/STATUS.json` or historical sprint records as part
  of this example refactor.

## Verification

- All numbered AMX guide/reference links resolve; all required support files
  are present and contained in the canonical or packaged guide.
- All runnable examples execute under their stated input assumptions, and
  intentionally invalid examples fail with the documented diagnostics.
- Tests confirm important narrative/rendered values, relevant report outputs,
  desktop packaging, and the safe local-link workflow.
- README, desktop, VS Code, and authoring guidance point to current paths.
- The old example paths and generated outputs have no unexplained live
  references; retained outputs are reproducible and purposeful.
- Existing behavior outside the approved organization/onboarding scope
  remains unchanged.
