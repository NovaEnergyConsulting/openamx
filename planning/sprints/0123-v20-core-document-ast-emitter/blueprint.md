# Sprint 123 Blueprint: V0.20 Core Document and AST Emitter

## Approach

1. Verify the S122 accepted disposition, its D122-15 enum-default residual,
   and the exact built helper signatures. Verify S121 final feasibility
   closeout is accepted; until then S123 execution remains BLOCKED.
2. Record the approved baseline, worktree, output roots, and exact changed
   files. Preserve existing `dist`, generated renderer assets, S121/S122
   artifacts, and user changes.
3. Resolve D123-01 input boundary, D123-02 graph boundary, and D123-03 meaning
   of public `src/index.ts` exposure before implementation. Keep the emitter
   side-effect-free and separate from S124 filesystem/CLI work.
4. Audit the S121 AST inventory against current `src/ast/types.ts`; reconcile
   every discriminant and accepted helper API. Fail closed for any node added
   since S121 until a new mapped case is dispositioned.
5. Implement a source-envelope-preserving module emitter. Carry original
   module source text and parsed AST together; emit frontmatter and narrative
   comments safely; lower AMX fences in document order.
6. Lower all expressions/statements/types and views to typed TypeScript.
   Use `openamx/transpiler-runtime` only for semantic differences and runtime
   input/data/view behavior. Record per-node helper mapping in
   `ast-lowering-contract.md`.
7. Generate the typed entry wrapper and result views. Emit table/chart
   snapshots for `show`, declaration-time `structured-v2` diagram DTOs, and
   explicit exports only.
8. Add exact golden fixtures and reference-runtime parity tests. Strictly
   compile and execute generated TS; compare values, errors, exports and view
   order with the AMX oracle. Keep D122-15 out of AMX parity assertions.
9. Verify parse/type errors reject emission, source diagnostics retain module
   and location, and deterministic output hashes do not depend on checkout
   path/time/locale.
10. Complete verification and Builder evidence with raw outcomes, first
    failures/retries, generated artifacts, preservation audit, residuals and
    recommendation. Submit for separate product-owner disposition.

## Decision Register

Candidate decisions for review before S123 execution; confirmed V0.20 and
accepted S121/S122 decisions remain authoritative.

| ID | Topic | Candidate disposition | Blocking owner |
| --- | --- | --- | --- |
| D123-01 | Emitter API input | Candidate pure API consumes an entry and complete pre-resolved in-memory source graph `{ entryModuleId, modules }`, where each module carries original source, canonical identity, output-relative path, and resolved import mapping. It returns the complete generated module graph or diagnostics. No AST/checker internal type leaks through the public signature. | S123 contract gate |
| D123-02 | Module boundary | S123 parses/checks and emits the supplied graph in dependency-first order. It may validate graph IDs/import mapping/cycles in memory, but performs no filesystem discovery, containment checks, output writes or rollback. S124 owns filesystem graph resolution and CLI. | S123/S124 |
| D123-03 | Public API exposure | `src/index.ts` exports the agreed typed transpile function/types. Decide whether this is an in-repository core API or requires a `.` package export; do not change `package.json` without separate owner approval. | Product owner / S123 |
| D123-04 | Source representation | The public/internal boundary carries original source per module with parsed document. Use accepted S121 normalized comment encoder for frontmatter and narrative; never reconstruct source from `metadata` or node text. | S123 contract gate |
| D123-05 | Checked type context | Emitter receives a minimal immutable semantic context derived from `checkDocument`/S121 module graph. No direct import of checker runtime APIs in generated output; internal adapter may use checker result. | S123 contract gate |
| D123-06 | Operator lowering | Use `amxBinary`/`amxUnary` for all operations where behavior differs; native syntax only when exact equivalence is proven. Preserve eager, left-to-right logical operands. | S123 contract gate |
| D123-07 | Views | Use S122 DTO constructors; table/chart snapshots occur only on `show`; diagrams use `structured-v2` constructor at declaration time, never AMX `show`. | S123 contract gate |
| D123-08 | Identifier mangling | Stable reversible name mapping; collision-check locals, imports, generated API names and helper aliases. Keep source AMX names in `exports` object keys. | S123 contract gate |
| D123-09 | Invalid enum defaults | Lower only checker-accepted defaults and validate their runtime descriptors; preserve D122-15 no-parity residual for enum-valued defaults unavailable in AMX source. | S123 contract gate |
| D123-10 | Diagnostic shape | Preserve parser/typechecker errors; return or throw the accepted source-oriented diagnostic contract without invented codes. Any emitter-specific stable ID needs allocation. | Lead Developer allocator |
| D123-11 | No partial module code | API returns no code on parse/type/lowering failure; do not claim graph-wide atomic output, which belongs to S124 and retains D121-18 residual. | S123 contract gate |
| D123-12 | Generated code reproducibility | LF output, deterministic imports/names/property order; no absolute source roots, time, locale or random IDs. | S123 contract gate |
| D123-13 | Per-run module lifecycle | Each generated module exposes a typed initializer called once per `run(inputs)` in dependency order, returning module exports and appending its view events to shared per-run state. No mutable module binding lives at ESM top level. | S123 contract gate |

## Source-Grounded Constraints

- `src/index.ts` is currently a placeholder; root package export map does not
  contain an explicit `.` entry. S123 must distinguish the source-level API
  from a published package-root import.
- `checkDocument` returns `ModuleCheckResult` for a single document and accepts
   a `ModuleCheckContext`. The filesystem module loader resolves graph symbols
   and returns evaluated `LoadedEntryModule`; its graph records are private.
   Define a narrow in-memory graph/checker adapter instead of coupling the
   emitter to private `moduleLoader.ts` records.
- `OpenAmxDocument` contains parsed metadata and nodes; raw frontmatter is
  absent. Accepted D121-13 requires original source text to reach the emitter.
- `AMXShownView` now includes table/chart, source-compatible legacy diagram,
  and structured-v2 diagram types. S123 generated diagrams use structured-v2;
  existing legacy helper overload remains intact.
- S122 exposes `AMXRunResult<TExports>`, `AMXInputDescriptor<T>`,
  `validateAMXValue`, `amxBinary`, `amxUnary`, `amxBuiltin`, `amxFormatValue`,
  `amxIsType`, `amxGet1Based`, `amxRange`, `amxAdd1Based`, `amxRemove1Based`,
  `amxIterate`, `amxCopyListArgument`, measurement operations, and view
  constructors. Generated imports must use this subpath only.
- S121 final feasibility is not yet closed in `state.md`, `STATUS.json`, or
  current S121 Builder evidence. This package may be prepared, but S123
  implementation must not begin until that disposition is recorded.

## Required Sprint Artifacts

- `requirements.md`, `blueprint.md`, `acceptance.md`.
- `ast-lowering-contract.md` and `core-api-contract.md`.
- `golden-fixtures.md` and `parity-matrix.md`.
- `verification-plan.md`, `builder-evidence.md`, `handoff-prompt.md`.

## Boundaries

- S123 owns parsing/checking and code emission for a complete pre-resolved
   in-memory module graph; S124 owns recursive filesystem graph discovery,
   containment/path mirroring, publication, CLI and destination safety.
- S123 emits no HTML/PDF/DOCX and does not execute generated code during
  transpilation.
- D121-18 rollback residual and S122 accepted process/no-parity residuals stay
  unchanged. No release, package-version, deployment, platform, or registry
  claims follow.