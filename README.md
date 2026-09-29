# OpenAMX

OpenAMX is a plain-text, computable document format for engineering and asset-management knowledge. A document combines Markdown-like narrative with executable `let` statements and inline expressions such as `{{ 2 + 2 }}`.

The v0.1 prototype proves the pipeline:

.amx source -> parse -> evaluate -> render HTML

---

## What this prototype supports

- UTF-8 `.amx` file parsing
- Optional YAML front matter
- Narrative Markdown content
- `let name = expression` declarations
- Numbers, strings, booleans, variables, arithmetic, comparisons, logical operators, parentheses, and single-line conditionals
- Inline substitution with `{{ expression }}`
- Standalone HTML rendering
- CLI commands for `render` and `run`

---

## Installation

This project requires [bun](https://bun.sh/).

```bash
bun install
```

---

## Build and test

```bash
bun run build
bun test
```

The repository is configured to use Bun for the v0.1 workflow.

## VS Code Extension

The optional OpenAMX extension supports `.amx` documents with formatting inside executable `amx` fences, basic language/function and in-scope variable completion, and parser diagnostics. The extension engine floor is VS Code 1.85.0.

Develop, test in the Extension Development Host, and package a local VSIX:

```bash
cd vscode-extension
bun install
bun run compile
bun run test
bun run package
code --install-extension openamx-vscode-0.2.0.vsix --force
```

The package is not published by these commands. For manual Extension Development Host launch instructions, see [vscode-extension/README.md](vscode-extension/README.md).

---

## CLI usage

Render a document to HTML:

```bash
openamx render examples/hello-world.amx --out examples/hello-world.html
```

Or use the bundled script:

```bash
bun run render:hello
bun run render:transformer
```

Run a document and print the evaluated context as JSON:

```bash
bun run dist/cli.js run examples/transformer-strategy.amx
```

The `run` command outputs the final variable bindings in order and matches the in-memory evaluator behavior.

---

## Example files

The canonical examples are in the repository root under `examples/`:

- `examples/hello-world.amx`
- `examples/transformer-strategy.amx`

These are the exact v0.1 example documents from the language specification and are intended to be reference inputs for the CLI and tests.

---

## v0.1 limitations

This prototype intentionally does not implement the later-phase features that are explicitly out of scope for v0.1:

- No imports (`.amx`, CSV, JSON)
- No units, charts, tables, PDF/Word export
- No chained `else if` logic
- No Langium or full language-server integration
- No mono-repo package expansion
- No future asset-management domain libraries or schema work

These constraints are deliberate and remain in place for the v0.1 prototype.

---

## Extending the prototype

The project is intentionally modular and easy to extend:

- Add parser coverage in `src/parser/`
- Add runtime behavior in `src/runtime/`
- Keep rendering logic in `src/renderer/`
- Add CLI-oriented validation or additional commands in `src/cli.ts`
- Keep the core language general-purpose rather than asset-management-specific

The current implementation is meant to be a small, testable foundation for later phases, not a full production language runtime.
