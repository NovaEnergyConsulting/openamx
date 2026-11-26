# Sprint 125 Desktop, Documentation, and Example Fixture Matrix

## Status and Evidence Rules

Architect-prepared S125 fixture matrix. Retain `D125-*` and `DX125-*` IDs in
tests/evidence. These cases are proposals until separately authorized and
executed. Label desktop Vite/UI harness evidence distinctly from native
desktop evidence.

## Desktop RPC and Worker Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| DX125-RPC-01 | TypeScript graph operation request with active identity and destination selection. | Shared RPC schema and worker protocol accept exact shape; malformed/extra/operation-incompatible fields reject. |
| DX125-WORKER-01 | Valid saved entry/dependency graph. | Worker returns all generated modules and metadata, not success before service commit. |
| DX125-OVERLAY-01 | Unsaved active entry and unsaved open imported dependency. | Worker uses captured source overlay; generated graph reflects those buffers and no files are temporarily written. |
| DX125-PAYLOAD-01 | Graph within and above the D125-05 UTF-8 transfer budget. | Within-limit result transfers completely; over-limit graph fails before destination writes, with no truncation. |
| DX125-DEST-01 | Pick an output directory, including a path with spaces. | Selection token is bound to active identity/project generation and canonical output directory; no raw path trust from webview. |
| DX125-DEST-CANCEL-01 | User cancels directory picker. | No worker job starts and no files/directories are written. |
| DX125-JOB-STALE-01 | Active document changes or tab switches while worker runs. | Job is superseded; no output writer invocation or stale graph publication. |
| DX125-JOB-DEPENDENCY-01 | Imported module buffer revision/disk hash changes during generation. | Job becomes stale/failed before publish; no old graph is committed. |
| DX125-JOB-CONFLICT-01 | Active/dependency tab has disk conflict or destination changes after selection. | Export blocks with actionable diagnostic; no target changes. |

## Overwrite, Commit, and Result Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| DX125-OVERWRITE-NONE-01 | No target conflicts in selected directory. | Skip overwrite prompt and commit graph through S124 writer. |
| DX125-OVERWRITE-COLLISION-01 | One or more graph-owned targets already exist. | One graph-level confirmation identifies target count/paths; refusal leaves originals hash-identical. |
| DX125-OVERWRITE-UNRELATED-01 | Output directory contains unrelated files. | Confirmed export replaces only graph-owned targets; unrelated files remain byte-identical. |
| DX125-OVERWRITE-RACE-01 | A target changes after confirmation but before commit. | Snapshot revalidation fails closed; changed target is not silently overwritten. |
| DX125-COMMIT-OK-01 | Multi-file graph succeeds. | Job succeeds only after every target is published; result includes entry path, output root, module count, bytes and output identity. |
| DX125-COMMIT-STAGE-FAIL-01 | S124 writer injected stage failure. | No success result; staged state/error shown; no unexpected target writes. |
| DX125-COMMIT-ROLLBACK-01 | S124 writer injected post-publish failure with verified rollback. | Failed job carries per-path restored state; UI never reports saved. |
| DX125-COMMIT-ROLLBACK-INCOMPLETE-01 | S124 writer injected rollback failure. | Failed job names unrecovered paths and preserves D121-18 no-crash-atomicity limitation. |
| DX125-CANCEL-WORKER-01 | Cancel while graph generation is still running. | Worker receives cancellation/termination; no final graph files published. |
| DX125-CANCEL-COMMIT-01 | Cancel after job enters `committing`. | UI reports commit is in progress/too late to interrupt, consistent with current export jobs. |
| DX125-OUTPUT-ACTIONS-01 | Successful output open/reveal action and stale output ID. | Native action targets only registered generated entry/root; stale/unknown IDs reject. |

## Desktop UI Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| DX125-UI-ENTRY-01 | Active AMX and non-AMX tabs. | “Export TypeScript…” is available only for an active AMX document. |
| DX125-UI-SUCCESS-01 | Export from an active document with nested imports. | Progress/status shows graph preparation and commit, then module count/path; open/reveal actions are available. |
| DX125-UI-CANCEL-01 | Cancel directory picker, overwrite dialog, or worker preparation. | Dialog/job closes/cancels with existing responsive UI behavior and no output. |
| DX125-UI-OVERWRITE-01 | Confirm and refuse graph-level overwrite. | Single explicit confirmation; both paths produce correct outcome without overwriting unrelated files. |
| DX125-UI-ERROR-01 | Parse/type/import/output/rollback failure. | Source/output diagnostics display; no false success toast/path; rollback states visible. |
| DX125-UI-STALE-01 | Switch tabs/edit source during export. | Stale job is cancelled/superseded and cannot publish. |
| DX125-UI-DIALOG-01 | Keyboard focus/escape/close while export dialog or destination selection is active. | Focus is restored and pending operation is cancelled or marked committing accurately. |

## Specification, README, and Runnable Example Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| DX125-DOC-01 | V0.20 spec links accepted predecessor specs and documents helpers, `run(inputs)`, views, graph paths and exclusions. | Contract agrees with S121-S124; no historical spec edit; no package-root import claim. |
| DX125-README-01 | README language-spec/example navigation updated. | V0.20 links resolve and all historical links remain unchanged. |
| DX125-EXAMPLE-SOURCE-01 | Example 16 prose, frontmatter, AMX fences, `Asset` import, typed `asset` input, export and show views. | Source parses, checks and formats; prose interpolation remains literal in generated comments. |
| DX125-EXAMPLE-GRAPH-01 | Transpile example with existing `examples/libraries/asset-management.amx`. | Expected `.ts` graph mirrors both modules; import specifier resolves. |
| DX125-EXAMPLE-COMPILE-01 | Compile generated graph with TS 5.9.3/ES2022/ESNext/bundler and approved `.ts` import flag. | Strict compile passes against `openamx/transpiler-runtime`. |
| DX125-EXAMPLE-RUN-01 | Execute generated `run({ asset })` with a typed `Asset`. | Expected explicit export, ordered table/chart `show` DTOs and declaration-time structured-v2 diagram DTO; compare with AMX where representable. |
| DX125-EXAMPLE-ENUM-DEFAULT-01 | Example or helper support includes enum-valued record default. | Must not claim AMX parity under D122-15; prefer not to include in example. |

## Residual Carry-Forward

| Residual ID | Entering status | S125 treatment |
| --- | --- | --- |
| S123-RETRY-STOP-01 | FAIL; Product Owner accepted as process residual. | Preserve raw status and disposition; S125 observes its separately approved retry cap. |
| S123 E123-AST-01 / HELPER-01 / SOURCE-01 / PARITY-01 / REJECT-01 | BLOCKED/UNAVAILABLE. | Preserve individually; desktop/example passes do not upgrade emitter-family coverage. |
| G123 `BLOCKED/UNAVAILABLE` / `NOT RUN` rows | Incomplete, accepted with residuals. | Keep unchanged in S125 evidence. |
| S124-RETRY-STOP-01 | FAIL; Product Owner accepted as process residual. | Preserve raw status and disposition. |
| G124-PUBLISH-CANCEL-01 | NOT RUN; CLI is noninteractive. | S125 directly tests desktop picker/overwrite cancellation but does not relabel S124 CLI row. |
| G124-PUBLISH-CRASH-BOUNDARY-01 / D121-18 | NOT RUN / accepted non-crash-atomic residual. | UI reports S124 writer rollback state; no crash-atomicity claim. |
| S122 D122-15 | Accepted no-parity for unsupported enum-valued record defaults. | Preserve; no AMX checker/runtime change or false parity assertion. |

## Traceability

Map every S125 master-plan bullet to a stable `DX125-*` test, contract section,
raw status and owner in `builder-evidence.md`. Duplicate/missing IDs and any
blocked platform/UI evidence are recorded, not silently omitted.