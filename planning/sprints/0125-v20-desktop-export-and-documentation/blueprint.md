# Sprint 125 Blueprint: V0.20 Desktop Export and Documentation

## Approach

1. Reconcile S121-S124 owner dispositions and residuals. Preserve S123
   incomplete G123 rows, S123/S124 retry process FAILs, S124 cancellation and
   crash-boundary NOT RUN rows, D122-15, and D121-18.
2. Record S125 baseline, worktree, exact desktop/source/docs/example/test
   paths, fixture/output roots, destination behavior, command set, retries,
   and preservation before implementation.
3. Audit the actual S123 graph API, S124 resolver/writer, and desktop job,
   picker, overlay, identity, stale-job and atomic-commit patterns. Do not
   duplicate graph resolution or output writing in the desktop layer.
4. Finalize `desktop-export-contract.md` for RPC operation/selection, graph
   destination, worker result, active source overlays, job lifecycle, overwrite
   confirmation, stale identity, multi-file writer commit, cancellation, and
   open/reveal behavior.
5. Decide how the worker returns the complete generated graph to the service
   safely. Bound transferred module count/bytes based on existing desktop
   limits or use an explicitly approved staged handoff; avoid unbounded IPC.
6. Finalize `documentation-contract.md` for the additive language spec,
   README link, desktop help/guide touchpoint, and example contents/runtime
   dependencies. Reuse an existing library module if it gives a concise,
   runnable example; add no unnecessary support files.
7. Add the new desktop operation and result type through shared RPC and
   `jobProtocol`; implement worker graph generation, service destination and
   commit validation, and workbench export entry with the established job
   lifecycle.
8. Use a directory picker for graph root. After worker graph preparation,
   inspect the full target set, show one explicit graph-level overwrite
   confirmation when conflicts exist, and revalidate source/destination state
   immediately before the S124 writer call.
9. Add RPC contract and Playwright/Vite UI coverage for success, cancellation,
   stale document/dependency identity, disk conflict, overwrite/refusal,
   malformed graph, writer failure/rollback report, and multi-file output.
10. Add the additive V0.20 spec, README navigation, and focused runnable
    example. Verify CLI run/transpile/compile for the example and its support
    module without changing historical specifications.
11. Complete `verification-plan.md` and `builder-evidence.md` with raw statuses,
    exact command/CWD/tool versions, artifacts/hashes, retry history,
    preservation, changed paths, and separate Product Owner disposition.

## Decision Register

Candidates for S125 review. Confirmed V0.20 and S121-S124 decisions are fixed.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D125-01 | Desktop job operation | Add a dedicated `transpile` desktop operation and a typed TypeScript-graph worker result; do not overload HTML/PDF/DOCX or data export result semantics. | S125 contract gate |
| D125-02 | Destination | Select an output directory, not an entry file. Preserve S123 output-relative graph paths beneath that root. Reject unsafe/source-root destinations per S124 writer. | S125 contract gate |
| D125-03 | Worker/service boundary | Worker resolves the active source overlay and prepares the S123 graph result; DesktopService rechecks identity, performs graph-target confirmation, then calls S124 writer. Worker does not publish final files. | S125 contract gate |
| D125-04 | Graph overwrite confirmation | One confirmation covers all existing graph-owned targets after graph resolution. Default refusal/cancel writes nothing; unrelated files are never replaced. Revalidate target snapshots immediately before write. | Product Owner / S125 |
| D125-05 | Graph payload bound | Bound serialized generated graph bytes/modules to a documented desktop limit aligned with existing worker request/output limits; overflow fails before destination writes. Exact limit must be measured and dispositioned. | S125 contract gate |
| D125-06 | Stale job/source | Capture active identity and all dependency revisions/disk hashes. Superseded, changed buffer, project switch, dependency conflict, or changed destination prevents commit. | S125 contract gate |
| D125-07 | Cancellation/commit | Picker/confirmation/worker preparation can cancel; once graph publication enters `committing`, follow current noninterruptible atomic-commit UI pattern, while S124 writer reports best-effort per-path rollback on errors. | S125 contract gate |
| D125-08 | Success/open/reveal result | Return entry `.ts`, output directory, module count and bytes; register an output identity that opens or reveals the entry/graph location without exposing private paths to untrusted callers. | S125 contract gate |
| D125-09 | API/package docs | Document `src/index.ts` core API and helper subpath without implying package-root `.` export or changing package/version. | Product Owner / S125 |
| D125-10 | Runnable example | Add a standalone example (candidate `examples/16_TypeScript_Transpilation.amx`) with an existing exported schema import, typed inputs, exports, shown table/chart and diagram; add only the necessary README/example index links. | S125 contract gate |
| D125-11 | Residual carry | Preserve all S123 G123 BLOCKED/UNAVAILABLE/NOT RUN and S123/S124 retry process FAILs, S124 cancellation/crash NOT RUN, D122-15 and D121-18. | S125 evidence owner |

## Source-Grounded Constraints

- Current desktop supports one-file export selections keyed by `selectionId`,
  with file destination snapshot, identity validation and commit checks. A
  graph destination requires a dedicated selection shape or explicit extension
  of these types; do not reuse `.ts` single-file behavior ambiguously.
- `requireActive()` provides `sourceOverlay` and `sourceRevisions` for the
  active graph. `jobIsCurrent()` protects active identity and source versions.
- Worker protocol currently transfers HTML/JSON text or PDF/DOCX buffers; a
  generated graph needs a bounded multi-module result variant.
- `writeTranspiledGraph` performs graph-wide preflight/staging, overwrite,
  per-path rollback reporting and crash-atomicity disclaimer. Use it as the
  only S125 graph writer; do not add a competing implementation.
- Desktop `DesktopPicker.choose({ directory: true })` returns a directory;
  current `pickDestination` returns a file path based on selected folder plus
  filename. S125 should add a dedicated graph-root selection and confirmation
  contract rather than inventing a fake single `.ts` file destination.
- Existing `ExportDialog` handles HTML/PDF/DOCX/JSON/CSV. A dedicated
  “Export TypeScript…” action or a clearly separate mode avoids presenting a
  graph as a report format without a destination concept.
- README currently links versions through V0.19; `docs/language-spec-v0.20.md`
  is additive and historical specs stay unchanged.
- Example 15 is a standalone reference; example 16 can remain a standalone
  transpilation example rather than modifying the 00-14 guided sequence.

## Required Sprint Artifacts

- `requirements.md`, `blueprint.md`, `acceptance.md`.
- `desktop-export-contract.md`, `documentation-contract.md`.
- `fixture-matrix.md`, `verification-plan.md`, `builder-evidence.md`,
  `handoff-prompt.md`.

## Boundaries

- Desktop job reuses accepted S123/S124 APIs. It does not evaluate generated
  TypeScript or render reports.
- Multi-file writer semantics remain D121-18 best-effort/non-crash-atomic;
  UI does not claim stronger safety.
- S125 does not remediate unrelated S123 G123 gaps, change helper/emitter
  behavior, add package-root export/version, or perform S126 integrated
  acceptance/release.