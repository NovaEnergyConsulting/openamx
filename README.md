# OpenAMX V0.2

OpenAMX combines Markdown narrative, executable `amx` fences, and inline
`{{ expression }}` calculations in plain-text `.amx` documents. The TypeScript
core remains domain-neutral; asset-management examples use ordinary values.
See the [V0.2 language specification](docs/language-spec-v0.2.md) for the full
syntax and semantics.

## Install and verify

Install [Bun](https://bun.sh/), then from the repository root run:

```sh
bun install
bun run build
bun test
```

## Write a document

An optional YAML front matter and a Markdown heading can precede executable
blocks. A narrative sentence such as `The final score is {{ score }}.` resolves
against the final environment, even when the following block appears later:

```amx
let score = 10
score += 5
```

The paragraph displays 15. Executable source is visible as escaped, canonically
formatted code in the standalone HTML. V0.2 supports mutable `let` bindings
(including repeated declarations), `=` and `+=`, arithmetic, comparisons,
logicals, single-line `if ... then ... else ...`, lists, inclusive integer
`[start to end]` ranges, statement loops, expression loops with one per-iteration
`return`, literal-case `match` with exactly one `default`, and the `sum`, `min`,
`max`, `mean`, `round`, `abs`, `sqrt`, and `pow` functions. Loops iterate over
lists or ranges; their iterator does not persist in the final environment.

**Migration from V0.1:** bare `let score = 10` lines outside exact, case-sensitive
`amx` backtick fences are narrative and do not execute. Move old declarations
into ` ```amx ` fences. Ordinary Markdown code fences also do not execute;
there is no V0.1 compatibility mode.

## VS Code Extension

The optional [VS Code extension](vscode-extension/README.md) requires VS Code
1.85.0 or newer, runs in the Node extension host, and supplies block-only
formatting, keyword/function/in-scope completion, and parser diagnostics.

From the repository root, develop, test, package, and install a local VSIX:

```bash
cd vscode-extension
bun install
bun run compile
bun run test
CI=1 bun run package
bun run install-local
code --list-extensions --show-versions
```

`bun run test` launches the VS Code 1.85.0 Extension Development Host; a display
or headless display server is required. For manual launch, open the extension
directory and select **Run OpenAMX Extension**. The locally installed package is
`engineerstools.openamx-vscode@0.2.0`. This repository has no license file;
Marketplace publication is deferred until the project chooses a license and adds
the corresponding file. Packaging may prompt about the missing license.

---

## CLI usage

Build first. Render a document to standalone HTML (by default next to its source):

```bash
bun run dist/cli.js render examples/hello-world.amx --out examples/hello-world.html
```

Or use the bundled script:

```bash
bun run render:hello
bun run render:transformer
bun run render:fleet
```

Run a document and print the evaluated context as JSON:

```bash
bun run dist/cli.js run examples/transformer-strategy.amx
```

The `run` command prints final variable bindings as JSON.

---

## Example files

The canonical examples are:

- [Hello OpenAMX](examples/hello-world.amx), with generated
  [HTML](examples/hello-world.html), introduces executable fences and score 15.
- [Power Transformer Failure Mode Analysis](examples/transformer-strategy.amx)
  computes mode scores `[24, 18, 27]`, initial aggregate 69, then adjusted
  aggregate 60. Its [HTML](examples/transformer-strategy.html) shows the final
  value even in an earlier paragraph.
- [Asset Fleet Risk Analysis](examples/asset-fleet-risk-analysis.amx) computes
  `[5, 10, 15]`, total 30, then 35 after an access adjustment. Its
  [HTML](examples/asset-fleet-risk-analysis.html) displays the default decision
  "Schedule review" and the final score 35; ordinary fences and bare
  declarations are visible but never executed.

```sh
bun run dist/cli.js run examples/transformer-strategy.amx
bun run dist/cli.js run examples/asset-fleet-risk-analysis.amx
```

---

## Current limits

No nested loops, range steps, `break`/`continue`, match guards/destructuring,
or chained `else if`. Editor diagnostics are parser-only, not runtime validation.
There are no imports, units/currency, tables/charts, domain libraries, data
imports, Word/PDF export, or multi-file workflows.
