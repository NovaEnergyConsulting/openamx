# Sprint 121 Module Graph, Diagnostics, and Destination Contract

## Status

Architect-prepared output contract. Reverify current module-loader behavior at
the authorized baseline. Proposed path and overwrite choices require S121
disposition; CLI/desktop implementation remains assigned to later sprints.

## Module Graph and Output Paths

- Load and validate the complete `.amx` graph using the same relative-import,
  root-containment, cycle, source-order, visibility, and module-identity rules
  as the current AMX loader. Do not execute AMX or generated TypeScript as part
  of transpilation.
- Candidate default import root is the entry document's directory tree, in
  line with the current module loader. If an explicit import root is supported,
  apply the same canonical containment rule used by AMX imports.
- Mirror each canonical source path relative to that root under the selected
  output directory. Replace the exact `.amx` extension with `.ts`; never
  flatten names. Preserve each import edge as a relative `.ts` specifier
  calculated from the two generated module paths.
- Resolve symlinks and canonical paths before graph identity/collision checks.
  A source path outside the import root, a cycle, an unresolved import, or an
  ambiguous output mapping is a hard failure.
- Normalize generated path separators to `/` inside import specifiers. Use
  host-native paths only for filesystem operations.
- Emit deterministic content independent of absolute checkout path, wall
  clock, locale, or filesystem enumeration order. Stable output order follows
  source/module traversal order.

## Destination Selection and Overwrite

- Candidate CLI shape: `openamx transpile <entry.amx> --out-dir <directory>`.
  Require an explicit destination. Any optional import-root flag must match
  the loader's containment semantics and be settled during S121.
- CLI overwrite is opt-in through an explicit `--overwrite` flag; without it,
  any existing graph target is a refusal. Desktop selects an output directory
  for the complete graph and confirms the complete set of existing target
  files before publication. Do not treat the current single-file destination
  selection as an already implemented graph-directory workflow.
- Precompute all output paths and detect duplicate/normalized/case-folded
  collisions before writing. Include Windows case-insensitive collisions in
  tests even when the active host is case-sensitive.
- Default behavior refuses any existing destination file and writes nothing.
  Desktop graph confirmation is one decision for the complete set of conflicts;
  cancelling destination selection or confirmation leaves existing destination
  contents unchanged and creates no generated target files.
- Validate the whole graph before output. Parse/type/collision/cancel failures
  must not leave new `.ts` files that look like a successful graph. Stage the
  complete graph before publishing; define and test rollback/preservation if
  final filesystem publication fails.
- Never overwrite unrelated files in the output directory. Only replace files
  whose exact generated destination is part of the confirmed graph.

## Candidate Publication-Failure Contract

- Complete parsing, typechecking, module validation, path mapping, collision
  checks, and overwrite confirmation before creating staged output.
- Stage every generated module on the destination filesystem. Publish the
  graph only after all staged files are complete. Preserve backups for existing
  graph-owned targets until publication succeeds; do not touch unrelated files.
- If a publish operation fails, attempt to restore replaced targets and remove
  newly published targets. Return failure with a per-path record of staged,
  published, restored, and unrecovered files; never return a success-shaped
  entry path.
- This protocol does not claim crash-atomic multi-file replacement. A process
  or host failure during sequential renames can expose an incomplete graph;
  rollback itself can also fail. D121-18 blocks acceptance until the product
  owner accepts this residual or chooses a stronger platform-bounded contract.

## Diagnostics

| Phase | Required diagnostic data | Behavior |
| --- | --- | --- |
| Parse | Existing code/message, source module, source start/range when available. | Reject complete graph; emit nothing. |
| Typecheck | Existing static code/message, source module, source start/range when available. | Reject complete graph; emit nothing. |
| Module resolution | Importing module, import path, source anchor, existing module diagnostic identity. | Preserve containment/cycle/visibility policy; emit nothing. |
| Lowering | Node kind, source module, source anchor, detail, accepted transpile diagnostic identity. | Fail closed; do not skip the node or emit best-effort code. |
| Destination planning | Source-to-destination mapping and collision/overwrite/cancel detail. | Report all actionable collisions where safe; no writes before approval. |
| Filesystem publication | Exact destination path and operation; preserve original error cause. | Report failure and rollback outcome without claiming complete output. |
| Generated runtime input | Input/property path and expected AMX type/unit. | Runtime helper throws a typed input error before execution; no result object. |

- Reuse parser, typechecker, and module-loader diagnostic identities when the
  condition is the same. A new transpile/output code requires explicit
  allocation; candidate codes in this document are intentionally omitted.
- Preserve source file and 1-based source coordinates according to the
  repository diagnostic conventions. Do not invent end positions when the AST
  only has a start location.
- Diagnostic order is deterministic: module traversal order, then source order,
  then destination order. If existing diagnostics are fail-fast, preserve that
  contract rather than inventing aggregation in the transpiler.
- Error text must distinguish parse/type rejection, module graph failure,
  unsupported lowering, output collision, user cancellation, and filesystem
  failure. A nonzero CLI exit and desktop error state are later-sprint
  acceptance requirements.

## No Partial Output

- Invalid parse/type/module graphs produce no generated graph output.
- Collision refusal, missing confirmation, or cancellation leaves existing
  destination contents unchanged and creates no success-shaped partial graph.
- If a filesystem failure occurs during publication, report every destination
  that was staged, published, preserved, or rolled back. The contract gate
  must decide whether transactional rollback is guaranteed on all supported
  filesystems or whether that rare failure mode is an explicit residual.
- A successful result names the entry `.ts` path and every emitted graph file.
  A failed result never reports a valid entry output.

## Required Cases

- Nested relative imports, explicit export visibility, deterministic mirrored
  paths, and helper imports.
- Import root escape, unsupported path syntax, unresolved module, duplicate
  destination, and cycle rejection.
- Existing target file with default refusal, explicit overwrite, cancellation,
  and preservation of unrelated output files.
- Injected failure during multi-file publication, verifying rollback and exact
  per-path failure reporting; document any filesystem limitation instead of
  claiming graph-wide atomicity.
- Windows case-fold collisions, separator normalization, and symlink/canonical
  path behavior where the test host supports them.
- Parse/type failure after a valid earlier module; assert no partial graph.
- Injected publication failure or a documented platform limitation; never
  claim rollback behavior without direct evidence.