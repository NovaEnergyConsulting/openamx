# Sprint 041 Requirements: Structured CSV/JSON Data Editor

## Goal

Deliver safe, lossless, scalable CSV/JSON authoring for mapped inputs and explicitly opened external data. Integrate the Lead Developer-selected maintained Vue grid/tree components in production, keep raw source authoritative during invalid edits, reuse strict existing parsing/validation semantics, and connect data diagnostics/schema to the active AMX document without exposing private paths.

## Inputs

- `planning/plan-openamxV06MasterSprintPlan.md`, Sprint 041
- `planning/openamxV06ProductUXContract.md`
- Sprint 035 data-editor candidate/100k-row proof gap and frame evidence
- Sprint 036 in-memory strict JSON/CSV inspection/schema/export APIs and job/RPC identity
- Sprint 037 file-kind data shells and Sprint 038 project/external/autosave/conflict boundaries
- Sprint 039 Inputs/settings mapping snapshot and private external-data route
- Sprint 040 shared editor facts/diagnostics and current desktop data-shell components
- `src/runtime/inputData.ts`, `src/runtime/outputData.ts`, parser/typechecker rules, atomic writers, current root/desktop tests

## In Scope

- Integrate the Lead Developer-selected `vxe-table@4.22.3` virtual CSV grid and `json-editor-vue@0.19.2`/`vanilla-jsoneditor@3.13.0` JSON tree/editor into the production desktop app. Preserve the isolated proof and record production dependency/build/license evidence, bundle/memory impact, raw/structured synchronization, cancellation, and supported 100,000-row behavior as acceptance evidence.
- Implement the selected virtualized CSV grid with editable cells/rows/columns, insertion/deletion/reordering where format-safe, search, non-destructive sort/filter views, undo/redo, validation, and raw-text mode.
- Implement JSON nested tree editing, an array-of-records grid, raw-text mode, add/remove/reorder, supported lossless structured/raw transitions, undo/redo, validation, and bounded fallback for unsupported/malformed shapes.
- Keep raw source authoritative and preserve exact user text during invalid edits. Structured mode must show an actionable unavailable/error state when malformed source cannot be represented without loss.
- Reuse strict shared JSON duplicate-key parsing, RFC 4180 CSV behavior, deterministic serialization, and existing AMX type/default/null/DateTime validation. Do not duplicate data semantics in the UI.
- Use active AMX mapping/schema to provide type-aware cells/nodes, required/default/null information, source/data diagnostics, and navigation between inspector, data location, input declarations, and Sprint 040 editor facts.
- Apply atomic autosave and external disk-conflict rules to contained and explicitly opened external data. Clearly label external/private files and preserve their privacy boundary.
- Support mapped external input opening through the explicit bounded route from Sprint 039 without general filesystem browsing or private path/content leakage.
- Prove first usable viewport, scrolling, editing, validation, cancellation, memory, and responsiveness for supported 100,000-row fixtures. Larger/irregular/unsupported values receive actionable bounded raw/read-only fallback rather than freezing or truncating.
- Add focused valid/invalid nested JSON, duplicate keys, CSV quoting/newlines/headers, large data, raw/structured round-trip, undo, sort/filter non-mutation, schema, external-file, autosave, and conflict tests.

## Out of Scope

- New AMX syntax/type/runtime semantics, CLI input/output semantic changes, or a second parser/validator.
- Project lifecycle, trash/recovery, config precedence, or report-settings policy changes; consume Sprint 038/039 boundaries.
- AMX language intelligence implementation; consume Sprint 040 facts only.
- Final live preview/runtime drawer, complete export workflow, native save destination, and end-to-end V0.6 acceptance; Sprint 042/043 own them.
- Hand-rolled virtualization, unbounded workspace indexing, general external filesystem browsing, remote/network data, telemetry, cloud, native packaging/release, broad Office, licensing/Marketplace, or formal accessibility certification.

## Constraints

- The selected dependencies are authorized for production integration by Lead Developer direction. Keep them pinned; validate actual production behavior and bundle impact. If an integration cannot meet fidelity or scale requirements, retain an explicit raw/read-only fallback and record the blocker; do not hand-roll virtualization or silently replace the selected libraries.
- Existing strict JSON duplicate-key and CSV/RFC 4180 diagnostics, source locations, declaration order, null/default/DateTime rules, and deterministic serialization remain authoritative.
- Raw source text is preserved exactly on invalid edits and remains the recovery/autosave authority. Structured operations must be atomic, undoable, revision-aware, and conflict-aware.
- Data jobs carry Sprint 036 active URI/project generation/document and input/settings revisions/job ID. Stale/cancelled validation or serialization cannot update a new tab/project or write a file.
- Trusted Bun services own external path resolution, file reads/writes, schema/validation, autosave/conflict checks, and bounded payloads. Webview state contains only approved labels, schemas, diagnostics, values required for editing, and redacted external metadata.
- External/private files are visibly labeled and require explicit open/mapping authority. Never return raw private paths or input contents in general project state, logs, diagnostics, or screenshots.
- Unsupported data shapes must fail boundedly and visibly; never silently truncate, normalize away invalid text, or freeze the UI.
