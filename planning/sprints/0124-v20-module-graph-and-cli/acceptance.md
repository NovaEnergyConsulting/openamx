# Sprint 124 Acceptance Criteria

Sprint 124 is complete only when the parse-only filesystem resolver constructs
the exact S123 input graph, module/CLI behavior preserves the accepted AMX
module contract, and output is safely preflighted and published with the
accepted best-effort rollback reporting. S124 does not add desktop export,
docs, rendering, or release scope.

## Entry and Authority

- S121 final feasibility closeout is ACCEPTED/CLOSED WITH RECORDED RESIDUALS;
  D121-18 rollback remains best-effort and not crash-atomic.
- S122 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS; D122-15 no-parity for
  unexpressible enum-valued defaults and the accepted retry/stop residual are
  preserved.
- S123 is ACCEPTED/CLOSED WITH RECORDED RESIDUALS on 2026-11-26. Preserve
  incomplete G123 `BLOCKED/UNAVAILABLE`/`NOT RUN` rows and S123 retry-cap
  process `FAIL`. Do not reinterpret those rows as PASS because graph/CLI
  tests pass.
- Exact S124 baseline, changed paths, output/temp roots, test commands, failure
  injection, overwrite choice, retries and preservation are separately
  authorized.

## Parse-Only Graph Resolution

- Starting from the entry `.amx`, resolve only relative `./` or `../` imports
  using `/` separators and the exact lowercase `.amx` suffix.
- Canonicalize source identity with `realpath`; default root is the entry
  directory; optional `--import-root` is canonical, must contain the entry and
  every resolved module, and rejects symlink/path escape.
- Read and retain original source text for every module, including frontmatter.
  Parse each source only to discover imports and validate AMX syntax; do not
  evaluate AMX or run generated code.
- Preserve import-before-code ordering, explicit exports/visibility,
  duplicate-name behavior, entry-only inputs, module identity, dependency-first
  ordering, and existing `AMX5001`, `AMX5002`, `AMX5003` conditions/messages
  where applicable.
- Detect missing/unreadable modules, malformed imports, duplicate import
  mappings, unresolved/missing export names, cycles and graph-identity issues
  before publication. Source diagnostics identify the importing or offending
  module and import source location.
- Build `TranspileGraphInput` with stable module IDs, canonical `sourcePath`,
  mirrored output-relative `.ts` path, original source, and one exact
  `{ importPath, moduleId }` mapping per import. Invoke S123 core once with
  the complete graph; never use its in-memory API as a filesystem resolver.

## Output Paths and Preflight

- Output root is an explicitly selected `--out-dir`; no implicit current
  directory or source-tree write. It may be created if absent after validation.
- Output-relative path mirrors source path relative to import root and replaces
  only `.amx` with `.ts`. Generated imports are correct relative `.ts`
  specifiers. Paths are normalized with `/` in generated source.
- Reject absolute/traversal/empty output segments, duplicate graph outputs,
  path-normalization collisions, Windows case-fold collisions, target aliases
  to source `.amx`, output-root escapes, and symlink escapes before writing.
- Existing targets are refused unless explicit `--overwrite`; refusal/cancel
  and all preflight/parse/type/module failures leave existing destination files
  unchanged and do not produce a success-shaped output graph.
- Do not overwrite any target outside the exact generated graph. Existing
  unrelated files in the chosen output root are preserved.

## Publication and Rollback

- Stage all generated files before final publication. Publish only after
  complete graph resolution and S123 emission succeed.
- On write/publish failure, attempt rollback according to accepted D121-18 and
  report exact per-path states: staged, published, restored, and unrecovered.
- Injected failure tests prove rollback behavior for covered failure points;
  they do not prove crash/power-loss atomicity. State that limitation clearly.
- On success, report the entry `.ts` output and every graph file deterministically.
- A failed command returns nonzero and does not print a successful entry path.

## CLI and Generated Graph

- `openamx transpile <entry.amx> --out-dir <directory>` is registered in
  `src/cli.ts`; optional `--import-root` and `--overwrite` follow dispositioned
  D124 decisions. Do not add `--input`, rendering, or execution options.
- `--help` describes command/options; errors use established AMX diagnostics
  and clear output/preflight failures. Failure exit code is nonzero.
- Successful CLI graph output compiles with TypeScript 5.9.3/ES2022/ESNext/
  bundler using the approved `.ts` import setup and resolves
  `openamx/transpiler-runtime` from built package.
- Transpilation never executes generated TypeScript. Generated compile is a
  test-only check outside the command's runtime behavior.

## Tests, Scope and Evidence

- Focused tests cover nested import graph construction, helper module path,
  malformed/type-invalid input, containment/symlink, cycles, export visibility,
  unreachable/missing modules, deterministic output, destination conflicts,
  overwrite/refusal/cancel, injected publish failures and rollback report.
- CLI tests prove success, failure status, diagnostics, no writes before
  successful preflight, and no generated-code execution.
- Every incomplete S123 G123 row remains separately marked. S124 covers only
  the graph/CLI behavior and any direct prerequisite that blocks its cases;
  it does not close the whole emitter matrix implicitly.
- Evidence includes exact commands/CWDs, versions, raw results, artifact
  hashes, first failures/retries, preservation, changed paths and separate
  owner disposition.
- No package/version, desktop, docs/example, rendering, release, publication,
  deployment, installer, registry, or platform-certification work occurs.