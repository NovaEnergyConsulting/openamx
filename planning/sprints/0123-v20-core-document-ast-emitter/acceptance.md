# Sprint 123 Acceptance Criteria

Sprint 123 is complete only when the core emitter covers every supported
checked AST family, emits safe source-ordered TypeScript, uses the accepted
S122 helper API, and passes focused compile/execute parity checks. Recursive
module graph publication, CLI, desktop, docs/example, and release remain
separate scope.

## Entry Gate

- Sprint 121 final feasibility closeout was separately ACCEPTED/CLOSED WITH
  RECORDED RESIDUALS by the Product Owner on 2026-11-25. Preserve its raw
  statuses and D121-18 residual. S123 execution remains BLOCKED until the
  exact execution plan and applicable D123 decisions are approved.
- Sprint 122 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-25. Keep
  D122-15 enum-default no-parity and retry/stop-protocol residual visible.
- Exact S123 baseline, worktree, source/test/evidence paths, commands,
  generated output/preservation, fixture roots and retries are separately
  authorized before implementation.
- V0.20 master plan and accepted S121/S122 decisions are behavior authority.
  Any unresolved D123 item is dispositioned before the corresponding code/API
  is made caller-visible.

## Core API and Input Boundary

- `src/index.ts` exports the approved typed core transpile API and result/
  diagnostic types. Public package-root import semantics are not assumed;
  D123-03 is resolved, and no package export-map/version change occurs without
  separate approval.
- The core API accepts a complete pre-resolved in-memory graph with an entry
  identity, module original source, output-relative path, and resolved import
  mapping. It returns all generated modules or diagnostics; it never discovers
  modules from disk.
- Every graph module is parsed and typechecked before emission. Raw
  frontmatter is available; parsed metadata alone is never used as source
  preservation.
- Any parse/type/lowering failure returns source-module diagnostics and no
  generated module graph. Existing parser/typechecker identities/messages are
  preserved; no unallocated emitter code is claimed.
- Input declarations produce typed `AMXRunInputs` plus recursive S122 input
  descriptors. Runtime validation occurs before AMX execution. Enum-default
  handling follows D122-15 with no unsupported AMX parity claim.

## AST Coverage and Generated Semantics

- Every current discriminant from the S121 inventory appears exactly once in
  `ast-lowering-contract.md` with emitted shape, helper/native rationale,
  checked context, source mapping, and at least one golden case.
- Narrative and frontmatter comments are safe one-line TypeScript comments for
  CRLF, CR, LF, U+2028 and U+2029; blank lines, `*/`, `//#`, Unicode, fences,
  and literal `{{ expression }}` remain inert and source ordered.
- Every AMX fence is lowered at its document position. Fences are not emitted
  as executable code; no narrative interpolation is evaluated.
- Types, records/inheritance, enums, functions, module declarations, inputs,
  dimensions/units, statements, expressions, lists, measurement behavior,
  tables, charts, diagrams, imports and `show` are handled exhaustively.
- `amxBinary`, `amxUnary`, `amxBuiltin`, `amxFormatValue`, list/range,
  validation, measurement and view helpers are imported from
  `openamx/transpiler-runtime`; generated code imports no private engine or
  renderer path.
- Identifiers are deterministically mangled and collision-checked. Original
  AMX names are retained as export keys. Generated wrappers and helper aliases
  cannot collide with user declarations.
- `run(inputs)` is synchronous, creates fresh state, validates first, returns
  only explicit entry exports and ordered structured views. `show` captures
  tables/charts only; diagrams are distinct structured-v2 declaration events.
- Imported module initializers run once per `run(inputs)` in dependency-first
  order using shared per-run context. No mutable module state is stored at ESM
  top level; repeated calls are independent.
- Generated output is deterministic across repeated runs and independent of
  absolute checkout path, locale, time, or filesystem enumeration.

## Compile and Runtime Parity

- Every valid golden output compiles under the accepted TypeScript 5.9.3,
  ES2022, ESNext, strict/bundler baseline with helper subpath and `.ts`
  relative import behavior explicitly configured.
- Generated fixture execution matches AMX runtime exports and structured
  views for exact fields/order and approved numeric tolerances. Compare
  diagnostics for invalid input/operations with the accepted helper codes and
  source positions.
- Fixtures prove list 1-based operations/copy, eager logical evaluation,
  measurement/affine calculations, builtins, recursive inputs, enum members,
  typed records/functions, table/chart DTOs, structured-v2 diagrams, and fresh
  run state.
- S122 enum-default no-parity cases remain explicitly excluded from AMX parity;
  no checker/runtime change is made to force them to pass.
- Invalid parse/type/lowering input produces no success-shaped code result.
  This acceptance is per module/API call, not atomic multi-file graph
  publication.

## Scope and Evidence

- S123 accepts and emits a complete resolved in-memory graph, but does not
  discover imports from disk, enforce filesystem containment, write output
  files, handle destination collisions/overwrites, add CLI/desktop work, or
  run release workflows. S124 owns filesystem graph/CLI; S125 owns desktop,
  docs and example.
- `builder-evidence.md` records exact commands, CWDs, tool versions,
  counts/assertions, generated source hashes, failures/retries, preservation,
  changed paths, residuals, and separate Builder recommendation/owner
  disposition.
- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  An enum no-parity residual or unrun graph/CLI/desktop gate is not reported as
  PASS.
- No release, package/version, publication, deployment, distribution,
  installer, native/platform, or certification authority follows S123.