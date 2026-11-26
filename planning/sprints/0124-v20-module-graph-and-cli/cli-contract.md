# Sprint 124 CLI Contract

## Status

Architect-prepared CLI proposal based on the V0.20 master plan and current
`cac` conventions. Final flags, confirmation behavior, exit status, and
diagnostic presentation require S124 disposition. This does not authorize CLI
implementation.

## Command Shape

Candidate:

```text
openamx transpile <entry.amx> --out-dir <directory> [--import-root <directory>] [--overwrite]
```

- `entry.amx` is required. `--out-dir` is required and explicit; no default to
  the input directory, current working directory, or `dist`.
- `--import-root` is optional and defaults to the entry file's containing
  directory. When supplied, it follows existing module-loader containment
  rules and must contain the entry.
- `--overwrite` is the explicit affirmative authorization to replace existing
  graph-owned `.ts` targets. Without it, existing target files cause refusal.
  No interactive prompt is proposed for scripted CLI use.
- Do not add `--input`, `--output`, `--validation`, render/export, execute,
  watch, source-map, package, or version flags to this command.

## Command Behavior

1. Validate CLI arguments and resolve entry/root paths.
2. Read and parse the complete import graph only; retain original source text.
3. Enforce canonical path/root/import/cycle/visibility/type rules without AMX
   evaluation.
4. Build a complete S123 `TranspileGraphInput` with deterministic module IDs,
   mirrored `.ts` output paths and resolved import IDs.
5. Call `transpileDocument` once. If it returns diagnostics, print them and
   exit nonzero without writing final outputs.
6. Preflight every target/collision/overwrite. Stage and publish the complete
   output graph using the approved best-effort rollback protocol.
7. On success, report the entry output and graph file count/paths in stable
   order. Do not execute generated modules.

Any failure before publication writes no final graph files. Publication
failure uses D121-18 reporting and may leave unrecovered paths despite
best-effort rollback; command reports nonzero and lists exact state.

## Output and Diagnostics

- Success output is concise and identifies the entry `.ts` path plus all
  emitted paths or a deterministic manifest summary; no absolute temp paths.
- Parse/type/module diagnostics use existing AMX codes, messages, file, line,
  and column where available. Print the source path in a normalized
  project-relative form when possible, following current CLI behavior.
- Output diagnostics distinguish missing/invalid destination, path escape,
  collision/no-overwrite, cancellation, staging failure, publish failure,
  rollback-complete, and rollback-incomplete states.
- Use an existing diagnostic identity only when semantically exact. New
  stable output code/message requires allocator approval.
- Command exits zero only after every graph file is published and verified.
  All other outcomes exit nonzero. No failed result prints “Transpiled to” as
  success.

## Help and Compatibility

- `openamx --help` and `openamx transpile --help` show command syntax, required
  `--out-dir`, import-root default, and overwrite behavior.
- Existing `run`, `render`, and `export` commands/options/output remain
  unchanged. `package.json` bin, export map, and package version remain
  unchanged.
- Add focused CLI tests using the actual built CLI entry or existing CLI test
  harness. Verify invocation from a path with spaces and Windows path rules if
  the approved S124 host is Windows; preserve exact argument boundaries.
- S124 CLI does not offer a TypeScript compiler dependency and does not compile
  generated output during transpilation.