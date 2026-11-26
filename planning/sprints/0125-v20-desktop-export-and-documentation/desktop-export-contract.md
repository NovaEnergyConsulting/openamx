# Sprint 125 Desktop TypeScript Graph Export Contract

## Status and Authority

Architect-prepared desktop contract. Reuse the current job lifecycle, active
document identity, source overlay/revision checks, native directory picker,
and the S124 transpile writer. Exact RPC names/fields and graph payload bound
require D125 disposition before implementation.

Preserve S121-S124 residuals, especially S123 incomplete G123 rows, S123 and
S124 accepted process FAILs, S124 non-run cancellation/crash rows, and D121-18
best-effort rollback.

## Desktop Operation and Protocol

- Add one operation, candidate `transpile`, to the shared
  `DesktopJobOperation` and `WorkerJobRequest` unions. It is not a report
  format and does not reuse HTML/PDF/DOCX/data-export worker result kinds.
- Add a typed graph result carrying the successful S123 `TranspileResult`
  modules (`moduleId`, `sourcePath`, output-relative path, generated code),
  entry identity, UTF-8 byte total, and deterministic module count; or
  source/output diagnostics. Never send success-shaped partial graph output.
- Validate worker request operation-specific fields, identity shape, entry
  path/text size, source-overlay item count/total bytes, output directory
  selection ID and bounded metadata before graph resolution.
- Resolve the active source graph with the current unsaved entry text and
  captured source overlay. Extend `resolveTranspileGraph` with optional
  canonical-path `sourceOverlay` and `entryText` inputs, or an equivalent
  parse-only graph builder. Disk reads are fallback only for modules not
  present in the overlay. Preserve canonical identity/root containment and
  do not write overlays to disk.
- Worker invokes the S123 graph API once and returns the complete graph result
  in memory. Worker does not write final output files; DesktopService retains
  job freshness, destination confirmation and commit authority.
- D125-05 must set an explicit UTF-8 graph payload budget based on current
  desktop limits (source overlays are bounded at 20 MB; existing report output
  at 32 MB) and measured expansion. Reject over-budget graphs before commit;
  never truncate module contents. The exact byte cap is an S125 decision, not
  silently inherited from one report-export constant.

## Directory Destination Selection

- Add a dedicated graph-root selection RPC and private service record rather
  than faking a `.ts` single-file export selection. The selection binds
  canonical output directory, active-document identity, project generation,
  destination snapshot/decision, and selection token.
- Native selection uses the existing `DesktopPicker.choose({ directory: true })`
  route. Provide a clear default location/starting folder but honor S124's
  output-root safety: output may not alias or sit inside the AMX import root.
- The UI displays the selected graph root and module-relative path/count
  before commit. User-facing paths are normalized and must not expose worker
  temp/stage roots.
- If destination selection is cancelled, no job starts and no files change.
  If the output root is created during the flow, cleanup only a directory
  created by this request and only when empty.

## Overwrite Preflight and Confirmation

- Worker graph success is followed by active-source/job-identity revalidation
  and complete graph-target preflight using the existing S124 output safety
  rules.
- Reuse or minimally extend `src/transpiler/outputWriter.ts` with a read-only
  graph write-plan step that identifies existing graph-owned targets and
  captures their hashes/path states. Do not duplicate path/collision logic in
  `desktopService`.
- If no generated target exists, continue without an overwrite prompt. If
  conflicts exist, show one native graph-level confirmation that states how
  many exact module targets would be replaced and identifies the selected
  output root. Cancel leaves all targets unchanged.
- After confirmation, immediately revalidate the destination root, every
  captured target snapshot, active document identity, source revisions/disk
  conflicts and job freshness. Any change fails closed without writing.
- Invoke the S124 writer with the approved overwrite plan; it may replace only
  graph-owned targets. Preserve unrelated files.
- Existing `confirmOverwrite(fileName)` is single-file oriented. Add a
  distinct graph confirmation API/type or an explicitly generalized
  confirmation contract; do not pass an ambiguous fake filename.

## Job Lifecycle, Staleness, and Commit

- Capture `ActiveDocumentRequestIdentity` and source revisions for the entry
  and every imported module at job start. Use the `requireActive()` source
  overlay and active unsaved buffers.
- Before worker start, after graph result, after any overwrite dialog, and
  immediately before writer publish, verify job is latest/current, active
  path/revision/project generation/input settings are unchanged, source
  overlay revisions/disk hashes are current, no source disk conflict exists,
  and output snapshots still match confirmation.
- A changed entry/dependency, project switch, stale job, or destination change
  marks the job superseded/failed as defined by existing job protocol and
  never publishes stale graph output.
- Worker preparation and destination confirmation can be cancelled by closing
  the workflow or cancelling the job. Cancellation before writer begins leaves
  destinations untouched.
- Once `writeTranspiledGraph` starts synchronous publication, use the existing
  `committing` state. Cancellation is too late to interrupt an in-progress
  rename sequence; preserve accurate D121-18 rollback diagnostics.
- Bound in-memory result lifetime and clear graph strings after success,
  failure, cancellation, supersession, or worker teardown. Do not retain source
  code in recents/output history.

## Commit and Result

- Service invokes the S124 graph writer with the complete typed result and
  approved output plan. Worker does not publish; UI cannot mark success until
  writer returns success for every graph module.
- On write failure, expose `AMX6001`/`AMX6002` or accepted output diagnostics
  and the per-path staged/published/restored/unrecovered states. Do not claim
  rollback complete unless writer verified every original target.
- Successful result includes `format: "typescript"` or an equally explicit
  TypeScript-graph result kind, graph output root, entry output path, module
  count, total bytes and output identity for open/reveal. This result is
  distinct from the existing single-file `DesktopJobResult.kind: "export"`
  unless its schema is explicitly extended and tested.
- Open/reveal action targets the generated entry or output folder under an
  output identity bound to the project. Validate identity and path before the
  native action; do not accept arbitrary paths from the webview.

## UI Entry and State

- Expose a distinct `Export TypeScript…` command/menu action for active AMX
  documents. Keep existing report/data export dialog and options unchanged.
- Show job stages for resolving graph, preparing output, overwrite decision,
  committing, and final result. Progress text communicates that commit may no
  longer be cancellable after it starts.
- Success shows entry filename, module count and byte total; provides open and
  reveal actions. Failure shows the source/output diagnostic and rollback
  detail. No marketing or explanatory feature prose is required.
- UI stays responsive and preserves existing stale job, tab-switch, Escape,
  close-dialog and cancellation behavior.