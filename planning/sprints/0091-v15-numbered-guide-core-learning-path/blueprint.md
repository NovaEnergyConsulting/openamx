# Sprint 091 Blueprint: Numbered Guide, Index, and Core Learning Path

## Preconditions

1. Resolve the Sprint 090 closeout discrepancy with an unambiguous dated
   Lead Developer/product-owner disposition. The approved architecture must
   explicitly settle the lesson 00-07 filenames and scope, the navigation
   rules, and the support-file decisions needed by those lessons.
2. Obtain separate Sprint 091 implementation authorization and approval of a
   concrete file-by-file change/test/output plan. The request to prepare this
   handoff is not implementation authorization.
3. Record the current branch, worktree state, and preservation plan. Never
   overwrite pre-existing changes, test results, screenshots, generated
   files, or artifacts.
4. If a required decision remains blocked, do no example/test edits; report
   the exact blocker and leave Sprint 091 unstarted.

## Implementation Sequence

1. Read the approved Sprint 090 contract, inventory, feature matrix and all
   applicable source/specification examples before selecting content to
   reuse. Compare actual files and dependencies to the approved file plan.
2. Confirm the target path list and all old-path consumers for the 00-07
   lesson set. Preserve older example files and generated artifacts not
   explicitly included in the authorized change plan. Do not use Sprint 091
   as a repository-wide cleanup.
3. Draft lessons 01-03 as an input-free progression. Start at the simplest
   Markdown/AMX document, then introduce expressions/decisions, then
   collections/functions. Keep prose, syntax examples and evaluated values
   consistent with the current language specification.
4. Draft lessons 04-05 for typed data/local modules and Measurements. State
   prerequisites before use, identify local imports, and display expected
   Measurement units alongside values.
5. Draft lesson 06 and only its approved support closure. State input logical
   names, file paths, types and run assumptions. Put invalid-only fixtures in
   the approved isolated location and explain that they are expected to
   fail.
6. Draft lesson 07 using only features already introduced. Provide a clear
   data-to-table/chart/output progression, name output bindings and
   destinations, and avoid unsupported claims about output formats.
7. Create the 00 index. Link only to the implemented 01-07 files; describe
   the guided route, objectives, prerequisites and support assumptions.
   Include a visible prose boundary for later feature references/full report
   without broken or speculative links.
8. Add consistent objective, prerequisites, desktop-first open/run/preview
   guidance, expected outcome, input requirements, index/previous/next
   navigation and troubleshooting cues to each lesson. Apply the approved
   Sprint 090 exception only where a lesson's boundary (01 or 07) makes a
   previous/next lesson inapplicable.
9. Add/update focused tests for the actual guide and any directly affected
   changed path. Use the approved acceptance IDs, parse links and validate
   containment, execute runnable examples under their stated inputs, and
   test invalid inputs as explicit negative cases.
10. Run the focused root verification selected in the approved file plan;
    use temporary output paths. Record complete command output, counts,
    versions, retries and unrelated baseline failures. Do not run broad
    rendering/package commands that could overwrite tracked outputs unless
    separately authorized with a preservation plan.
11. Reconcile every acceptance row, document any path migration deferred to
    Sprint 092-094, and provide Builder recommendation/evidence. Do not claim
    the guide is fully packaged, the corpus fully migrated, or later
    references complete.
12. Request a separate Lead Developer/product-owner disposition. Do not
    start Sprint 092 while Sprint 091 is pending or blocked.

## File-Change Boundaries

Expected in-scope edits, after approval:

- New/reworked `examples/00_Table_of_Contents.amx` and the lesson 01-07 paths
  named by the approved information architecture.
- Only the data, local module, and invalid-fixture paths required by those
  lessons and explicitly included in the approved plan.
- Focused tests directly necessary to validate those lessons and to keep any
  paths changed by Sprint 091 from becoming stale/broken.
- Sprint 091-owned evidence files within this sprint folder.

Not authorized by this blueprint without a separate file-plan amendment:

- Later guide/reference files 08-14; desktop app code/resources; Welcome,
  Help or Starter Examples changes; README/VS Code/authoring documentation;
  release scripts; unrelated `examples/` files; generated-output cleanup;
  language specs; package manifests; global test-path sweeps; planning status
  or historical sprint records.

Avoid duplicate canonical lesson copies. If an existing test or current
consumer still requires a legacy path, keep that legacy file until its
replacement/test migration is explicitly authorized rather than leaving a
broken consumer. Record this temporary compatibility choice and owner.

## Verification

Run only commands in the separately approved execution plan. The minimum
focused checks should verify:

1. The index and all current Sprint 091 links resolve to numbered AMX files
   inside `examples/`.
2. Lessons appear in the approved order and contain the expected objectives,
   prerequisite/input notes, desktop workflow and navigation.
3. Lessons 01-03 run without external files/modules; lessons 04-07 resolve
   each explicitly named companion; Measurement expectations include units.
4. Invalid input fixtures fail as documented and are not used by valid
   lesson execution.
5. Directly affected tests pass, changed paths have no dangling references
   in the approved migration scope, and the targeted verification gate is
   recorded without claiming unrun coverage.
6. No generated or user-supplied output outside the approved file plan was
   changed. `examples/kitchen-sink.pdf` remains unchanged.

No desktop packaging/native workflow, broad repository-wide example
migration, full release check, or platform certification is implied by these
focused checks.
