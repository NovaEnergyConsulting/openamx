# OpenAMX V0.20 TypeScript Transpilation

V0.20 adds an additive AMX-to-TypeScript transpilation path through the core
API, CLI, and desktop workbench. It does not change AMX syntax or runtime
semantics, and generated TypeScript is not a report renderer. This document
extends the [V0.19 specification](language-spec-v0.19.md), the
[V0.18 diagram specification](language-spec-v0.18.md), and earlier accepted
contracts without replacing them. See the [project README](../README.md) and
[standalone transpilation example](../examples/16_TypeScript_Transpilation.amx).

## Source and Calculation Contract

Each Markdown and frontmatter line is emitted as a safe, normalized TypeScript
`//` comment. Exact executable `amx` fences are lowered in source order;
other fences remain inert comments. Literal `{{ expression }}` narrative is
preserved and is not evaluated by transpilation.

The generated entry module exposes typed `AMXRunInputs` and explicit
`AMXRunExports` types, a synchronous `run(inputs)` function, and an
`AMXRunResult` containing `exports` and `views`. Callers supply declared input
values to `run`; only explicitly exported bindings are returned. The helper
runtime subpath is `openamx/transpiler-runtime`. The package-root import `.`
is not implied by this subpath.

Generated modules use TypeScript ESM and target the accepted ES2022, ESNext,
bundler-resolution baseline. Relative generated imports retain `.ts`
extensions; consumers must use a compatible compiler or bundler configuration
that accepts TypeScript import extensions. Transpilation does not compile or
execute the generated program.

## Views and Modules

`show` emits table and chart snapshots into `result.views`. A diagram
declaration contributes its initial structured-v2 diagram DTO at declaration
time, under the diagram discriminant. This does not add diagram support to AMX
`show`.

Reachable relative `.amx` imports form one graph. The output mirrors source
paths relative to the selected import root, replacing `.amx` with `.ts` and
rewriting generated relative imports accordingly. Canonical source identity,
root containment, cycles, and explicit export visibility are checked before
emission.

The CLI command is `openamx transpile <entry> --out-dir <directory>`; an
optional `--import-root <directory>` controls source-relative mapping. The
output directory must be separate from the AMX import tree. Existing graph
targets are refused unless `--overwrite` is supplied, and unrelated files in
the output directory are preserved. The desktop selects a graph output
directory, uses the current active entry and open dependency buffers, and
requests one graph-level confirmation for the exact existing graph targets.
Cancellation before publication leaves destinations unchanged.

## Publication and Boundaries

Parse, type-check, or lowering failures return source diagnostics and no
generated graph. Neither CLI transpilation nor desktop graph export evaluates
generated TypeScript. `exports` and `views` are data; they are not rendered to
HTML, PDF, or DOCX by this feature.

Multi-file publication stages outputs and reports per-path outcomes. Rollback
is best-effort: a process or operating-system crash may leave a mixed graph.
V0.20 does not claim crash-atomic publication, durable filesystem commits, or
recovery after process termination.

V0.20 adds no AMX syntax, source maps, narrative interpolation evaluation, or
rendering path. The accepted transpiler still has recorded AST, helper, and
parity coverage gaps; acceptance of its implementation does not establish
complete construct coverage. D122-15 remains: no parity claim is made for
enum-valued record defaults that current AMX source cannot express.