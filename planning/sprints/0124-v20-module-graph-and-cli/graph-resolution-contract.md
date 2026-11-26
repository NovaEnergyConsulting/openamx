# Sprint 124 Filesystem Graph Resolution Contract

## Status and Authority

Architect-prepared resolver contract. Preserve existing `moduleLoader.ts`
import behavior and S123 `TranspileGraphInput`/`transpileDocument` contracts.
Candidate resolver/API structure requires S124 disposition. Graph resolution
must be parse-only; no AMX evaluation or generated execution.

## Entry and Import Root

- Resolve the entry path to an absolute canonical `realpath`; it must exist,
  be a regular readable file, and have exact lowercase `.amx` extension.
- Default import root is the entry file's canonical containing directory. If
  `--import-root` is accepted, resolve it to a canonical directory, require the
  entry beneath it, and enforce containment for every dependency.
- Containment is evaluated after realpath resolution so a symlink cannot escape
  the authorized import root. Preserve the current module-loader behavior for
  entry/root equality and path diagnostics.
- Preserve original UTF-8 module source text exactly for S123 comment and
  frontmatter handling. Parse normalized line separators only for syntax and
  import discovery; do not reconstruct original source from parsed AST or YAML.

## Import Discovery and Parsing

- Parse each module with `parseDocumentText` (or the approved equivalent) to
  inspect imports. Do not call `loadEntryModule`, `evaluateDocument`,
  `evaluateStatements`, report preparation, or generated TypeScript execution.
- Flatten executable code blocks in source order using the established module
  loader rule. Legacy top-level `VariableDeclarationNode` behavior follows the
  existing parser/runtime contract; do not silently broaden accepted syntax.
- Every import path must start with `./` or `../`, use forward slashes only,
  and end in exact lowercase `.amx`. Reject absolute, bare, URL/package,
  backslash, wrong-extension, missing and unreadable targets.
- Resolve an import relative to its importing module's directory, canonicalize
  with `realpath`, and ensure containment by the canonical import root.
- Imports must precede all other executable items. Input declarations are
  permitted only in the entry module.
- Traverse dependencies depth-first in source import order. Detect a cycle
  using canonical module identities and report the ordered cycle at the import
  source location with existing `AMX5003` semantics.
- Each canonical file is loaded once even if multiple imports point to it.
  Duplicate import paths/names and collisions with local declarations preserve
  `AMX5002` or existing dimension/unit `AMX3008` behavior.
- After each dependency is parsed/checked, only explicitly exported types,
  enums, functions, bindings, dimensions and units become visible to importer
  checking. Missing/private exports fail with `AMX5002` semantics.
- Any parse/check/module error prevents calling the writer and returns no
  success-shaped graph result.

## In-Memory S123 Graph Adaptation

For each reachable canonical source module, create one
`TranspileSourceModule`:

| Field | S124 value |
| --- | --- |
| `moduleId` | Deterministic canonical graph key; source identity is maintained separately for resolution. Avoid random/time-based IDs. |
| `sourcePath` | Canonical path or approved project-relative diagnostic path; choose one stable policy and test path redaction in emitted source. |
| `outputPath` | POSIX-style path relative to import root, exact `.amx` replaced with `.ts`; must pass S123 relative-path validation. |
| `sourceText` | Original module source, including raw frontmatter and original line separators. |
| `resolvedImports` | One `{ importPath, moduleId }` entry for every parsed import, preserving source import order. |

`TranspileGraphInput.entryModuleId` identifies the entry. Pass all reachable
modules and no unreachable extras. S123 validates module graph identity,
imports, reachability, and cycles in memory, then returns all modules in
dependency-first order or diagnostics. S124 may rely on these checks but must
ensure its filesystem-to-graph mappings are complete and correct.

## Output Path Mapping

- Let `relativeSource = path.relative(canonicalImportRoot, canonicalModule)`;
  reject empty/absolute/parent traversal; convert separators to `/`; replace
  only the terminal `.amx` with `.ts`.
- The output tree mirrors the source path under the chosen `--out-dir`; the
  input root itself is not copied into the output path. `main.amx` maps to
  `main.ts`, `lib/units.amx` maps to `lib/units.ts`.
- S123 computes each generated import specifier from the mapped output paths.
  S124 verifies nested relative imports resolve within the staged output graph
  after writing/compile; it does not rewrite generated code after emission.
- Output path generation is deterministic across checkout roots and hosts;
  only `/` separators appear in module specifiers.
- Do not add a maximum module count/graph size not present in the accepted
  contract without a separate product decision. Guard accidental duplicate
  canonical modules and output paths.

## Diagnostics and Graph Errors

- Preserve existing codes/messages for invalid import syntax, root escape,
  missing/unreadable module, cycle, duplicate/unexported name, malformed
  source, and static type errors when semantically identical.
- Add file/output diagnostics only with an allocated code or an existing
  identity that is semantically exact. Do not fabricate codes in S124.
- Diagnostics identify the source module and import statement location when
  known. Filesystem errors include normalized display path, not secret host
  details or absolute temp-root leakage.
- Diagnostic ordering is deterministic: module dependency traversal order,
  then source order; path/collision rows use normalized output-path order.
- Raw helper/emitter G123 statuses remain as recorded. Graph success does not
  imply unresolved S123 emitter coverage is PASS.