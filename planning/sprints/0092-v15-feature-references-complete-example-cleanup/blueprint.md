# Sprint 092 Blueprint: Feature References, Complete Example, and Corpus Cleanup

## Preconditions

1. Confirm Sprint 090 is `ACCEPTED/CLOSED` with the accepted architecture
   recorded in
   [`lead-developer-disposition-2026-10-18.md`](../0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md).
2. Confirm Sprint 091 is `ACCEPTED/CLOSED` and lessons 00-07 remain in their
   accepted state, as recorded in
   [`builder-evidence-and-closeout.md`](../0091-v15-numbered-guide-core-learning-path/builder-evidence-and-closeout.md).
3. Obtain separate explicit Sprint 092 execution authorization and approval
   of the exact changed paths, tests, generated-output preservation plan and
   evidence destinations. This preparation document does not grant that
   authorization.
4. Record branch/worktree state and preserve all pre-existing changes,
   outputs, test artifacts, logs, and user data. Do not overwrite
   `examples/kitchen-sink.pdf` or the four checked-in HTML files.
5. Resolve any file-specific question that affects deletion or migration
   before the operation. In particular, do not remove
   `examples/.openamx/local.json` without explicit path authorization.

## Implementation Sequence

1. Reconcile the accepted Sprint 090 feature matrix and inventory with the
   actual current 00-07 guide, support copies and remaining legacy consumers.
   Record hashes/ownership before moving or replacing any duplicate input.
2. Write lesson 08 using the existing crank-slider diagram contract. Preserve
   the current diagram semantics and caveats; identify where the focused
   battery-resistor case belongs (reference 14).
3. Write lesson 09 around the approved V0.14 runtime `is` contract. Cover
   true/false predicates and invalid target diagnostics distinctly, with
   representative primitive, record, optional/null, list, enum and
   Measurement cases. Keep detailed edge cases traceable to the specification
   and acceptance IDs.
4. Write lesson 10 around math/constants and Measurement-aware operations.
   Cover valid values/units in the instructional example and use focused
   tests or negative fixtures for domains, finite behavior, empty behavior,
   and exact diagnostics. Do not imply every invalid case belongs in the
   user-facing lesson.
5. Write lesson 11 around text and numeric formatting. Preserve exact
   Unicode, locale, rounding, Measurement display and diagnostic contracts.
   Avoid unsupported/ambiguous format examples.
6. Write lesson 12 as the destination report. Reuse the accepted
   asset-screening scenario; declare each mapped input and local module;
   integrate only concepts already explained; retain illustrative-score
   disclaimers; and add links back to the relevant 02-11 lessons/references.
7. Write standalone references 13 and 14 as approved. State that neither is
   a prerequisite to the guided sequence and provide only relevant links
   back to the index and related lessons.
8. Extend the index and link chain:
   - Add 08-12 to the guided path and link 07 to 08.
   - Link 08-11 to index, previous/next, with 11 leading to destination 12.
   - Link 12 back to the index and focused lessons; it has no next guided
     lesson.
   - Index references 13/14 in a distinct standalone section. Each reference
     links to the index and applicable lessons without implying
     prerequisites.
   - Check every link is relative, resolves inside the visible guide tree,
     and preserves existing safe local-link behavior.
9. Reconcile data, local libraries, invalid fixtures, legacy examples and
   generated outputs against the accepted per-file inventory:
   - Keep one canonical support path for each guide input/module.
   - Merge useful content into 00-14 where approved; separate
     test-only/compatibility artifacts from instructional material.
   - Before retiring any old path, migrate its directly coupled tests and
     active consumers in the approved change scope or preserve a clearly
     classified compatibility fixture with an owner and removal condition.
   - Retain the four checked-in HTML snapshots through Sprint 094's
     temporary-output test migration. Preserve the user-supplied PDF.
   - Do not silently rewrite historical V0.1 specification snippets or
     unrelated docs; route affected live references to their Sprint 093/094
     owners.
10. Add/update focused tests for the new examples, links, inputs, outputs and
    any path changes. Assert expected values and units, exact negative
    diagnostics, named output shapes, and selected rendered structures with
    temporary paths. Preserve security/report coverage for any moved
    test-only fixture.
11. Run the focused approved test/build/CLI/render checks. Record all
    commands, runtimes, counts, output locations, first failures/retries,
    preserved files and limitations. Do not run checks that regenerate
    tracked snapshots at their canonical paths.
12. Reconcile every feature matrix row, file disposition and cross-sprint
    residual. Submit Builder evidence and a recommendation for separate
    Lead Developer/product-owner closeout.

## Expected Sprint 092 Outputs

- The numbered files 08-14 listed by
  [`requirements.md`](./requirements.md), with all necessary updates to
  files 00-07 for final navigation and report cross-links.
- Only the approved support file moves/consolidations and directly coupled
  test updates required to keep changed paths valid.
- Sprint 092 Builder evidence and any specifically authorized logs/artifacts
  within this sprint folder.

Do not produce desktop packaging, broad path migration, README/Help updates,
full corpus closeout, or release evidence as Sprint 092 outputs.

## Verification

Run the commands in the approved execution plan. At minimum, verify:

1. Every `00`-`14` instructional/reference AMX filename follows the accepted
   numeric convention and is represented in the index with the correct role.
2. Every narrative link resolves to an existing, contained guide AMX target;
   index/previous/next/boundary and standalone-reference behavior matches
   the approved architecture.
3. New runnable lessons and the destination report execute with their exact
   documented mappings; important values and Measurement units match.
4. Invalid inputs fail with the documented diagnostics; no success-shaped
   output is written on validation failure.
5. Focused tests preserve diagram, V0.14 language, report, output, and
   security behavior affected by this sprint.
6. Any kept/removed/moved source or support file has an inventory disposition
   and no unresolved in-scope consumer. Deferred active consumers have a
   path, named owner and destination sprint.
7. The checked-in HTML snapshots remain unmodified pending Sprint 094;
   temporary outputs are cleaned only when the approved plan permits.
   `examples/kitchen-sink.pdf` remains byte-identical.
8. `git diff --check` and targeted unit/example checks pass or their failures
   are reported explicitly. A focused result is not full-corpus acceptance.

No desktop packaging/native workflow or release/platform certification is
part of this verification.
