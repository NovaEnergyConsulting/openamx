# Sprint 093 Blueprint: Desktop Guide Packaging and Entry-Point Integration

## Preconditions

1. Confirm Sprint 090, 091, and 092 are separately `ACCEPTED/CLOSED` within
   their authorized scopes. Their evidence identifies deferred consumers
   and output-protection constraints.
2. Obtain separate explicit Sprint 093 execution authorization and approval
   of the exact source, docs, tests, build/package outputs and preservation
   plan.
3. Record branch, starting commit/worktree status, relevant build outputs,
   and exact package artifact/resource paths. Do not overwrite accepted
   installer bundles or prior evidence.
4. Reconfirm the guide allowlist against the current canonical examples and
   lesson dependency closure. An incomplete, stale, or unapproved allowlist
   blocks packaging.

## Implementation Sequence

1. Inspect desktop project creation, RPC types, Help/Welcome events, trusted
   filesystem service, package resource layout, existing unit/UI tests, and
   local/package build scripts. Preserve the existing standard project and
   inline quick-start behavior before designing the guide-specific branch.
2. Define one exact build-time guide resource location accessible to the
   trusted Bun service in supported development and packaged builds. Record
   how Electrobun copies the staged resource and how the resource's source
   paths map to destination paths. The repository `examples/` tree remains
   canonical; no hand-edited mirror is allowed.
3. Implement a narrow, explicit build-time allowlist containing all approved
   AMX 00-14 documents and only their approved data, invalid teaching
   fixtures, and local-library closure. Make staging deterministic and
   fail the build/resource check when a required file is missing, an
   unapproved source appears in the guide payload, or a path escapes the
   canonical tree. Exclude local state, legacy compatibility files, outputs,
   tests, and unrelated files.
4. Add the guide as a distinct action through the existing Help Starter
   Examples affordance reachable from Welcome. Preserve searchable local
   Help, Getting Started's existing action, and the two input-free starter
   choices and labels. Keep the UI change within existing layout/patterns.
5. Represent the choice with an explicit typed intent at the UI/RPC boundary.
   Do not overload a free-form AMX source string with filesystem paths and
   do not accept an arbitrary resource path from the webview.
6. Implement guide project materialization in the trusted Bun process using
   the selected empty project directory and the bundled resource. Preserve
   real-directory/empty-directory/symlink validation, transition/cancel
   semantics, normal `.openamx/project.json`, and safe project-root
   containment.
7. For a guide selection only, copy the allowlisted file tree, omit the
   generic `report.amx`, open `00_Table_of_Contents.amx`, and set the
   workbench/preview to that document. Do not change standard project
   creation or existing starter projects.
8. Treat file creation as a recoverable single operation. Use exclusive temp
   files or a staging-and-commit strategy consistent with repository
   filesystem patterns. On failure, return an explicit RPC/status error and
   ensure no partial guide tree or project configuration remains; never
   remove user files. Test failure paths with controlled temporary assets.
9. Add focused Bun service/RPC tests for exact project contents, active
   document, project configuration, error/rollback, nonempty/symlink
   rejection, and preserved old behaviors. Add Help/Welcome UI coverage for
   guide discovery and unchanged starter choices.
10. Build the desktop web/resource payload and actual local package using the
    approved output plan. Verify the packaged resource path and file parity
    against canonical source, then verify the guide action can consume that
    payload without a repository checkout or network. Keep this as focused
    Sprint 093 package integration evidence; defer full cross-platform
    installation/acceptance to Sprint 094.
11. Migrate active user-facing references assigned to Sprint 093:
    root/desktop/VS Code README, searchable Help, authoring skill, and direct
    example links in applicable V0.12-V0.14 specifications. Preserve
    historical V0.1 examples as historical unless a documentation owner
    separately authorizes a narrow edit. Do not change release smoke/test
    references owned by Sprint 094 without a separate plan amendment.
12. Update directly coupled help/document link tests. Run desktop RPC tests,
    UI tests, typecheck, web/resource build and approved package inspection.
    Record exact commands, working directories, versions, counts, artifacts,
    initial failures/retries, output cleanup and platform limitations.
13. Reconcile each acceptance ID and residual, submit a Builder
    recommendation, and request a separate Lead Developer/product-owner
    closeout disposition.

## Package Parity Contract

The build/test evidence must compare the exact packaged resource entries
against the accepted canonical allowlist:

- `examples/00_Table_of_Contents.amx` through
  `examples/14_Battery_Resistor_Circuit.amx`.
- `examples/data/asset.json`,
  `examples/data/screenings.csv`,
  `examples/data/reviewed-at.json`, and
  `examples/data/measurement-trips.json`.
- `examples/fixtures/invalid/asset.json` and
  `examples/fixtures/invalid/screenings.csv`.
- `examples/libraries/asset-management.amx`,
  `examples/libraries/screening.amx`, and
  `examples/libraries/travel-measurements.amx`.

Use a deterministic, explicit allowlist rather than copying all of
`examples/`. Compare paths and bytes (for example, SHA-256 manifests) between
canonical files, staged resource and built package. Confirm required support
closure and exclusion of `.openamx/local.json`, all legacy/test-only
examples, HTML outputs, `kitchen-sink.pdf`, tests, and unrelated libraries.
Record the final resource root and destination layout; do not assume the
current working directory is the package root.

## Verification Matrix

- Desktop service/RPC unit verification: guide succeeds into an empty temp
  project; existing-file protection and failures are asserted.
- Existing project creation: still creates `.openamx/project.json` and
  `report.amx`, opening the default report.
- Inline Hello and Operations Note starters: still create a standard project,
  replace/autosave the active report with the original content, and remain
  input-free.
- Guide entry/UI: discoverable through the existing Help Starter Examples
  flow, distinct labels/actions, no remote requests, no UI redesign.
- Resource staging/package: complete allowlist and transitive files present,
  contents match canonical source, no forbidden files included.
- Guide project: project root has expected relative folders/files,
  ordinary project config, no default report, and active document
  `00_Table_of_Contents.amx`; index links and relative support files work
  offline.
- Documentation: live links point to numbered guide/reference paths;
  directly coupled assertions are updated; historical snippets are not
  silently rewritten.
- Preservation: no tracked generated output or user data is overwritten;
  accepted build artifacts are preserved/cleaned only as approved.

## Files and Boundaries

Expected changes are limited to the exact approved desktop RPC/service/UI,
resource staging/build configuration, focused desktop tests, current
user-facing docs and narrowly coupled link assertions, plus Sprint 093
evidence. Do not modify language/runtime features, generate new example
outputs in tracked paths, remove the protected Kitchen Sink PDF, edit
`planning/STATUS.json`, or alter historical sprint records.

Do not perform Sprint 094's full path/test migration or claim a packaged
installer is manually accepted on unsupported hosts. Any needed expansion
requires an explicit file-plan amendment before editing.
