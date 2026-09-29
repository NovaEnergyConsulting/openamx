# OpenAMX for VS Code

OpenAMX 0.3.0 adds formatting for executable `amx` fences, V0.3 keyword/type,
function, imported-symbol, and in-scope variable completion, plus parser,
static-check, and supported local-module diagnostics for `.amx` documents. It
requires VS Code 1.85.0 or newer. Editor analysis does not load CSV/JSON inputs
or run the document, so runtime validation remains a CLI concern.

## Local Development

From this directory:

```sh
bun install
bun run compile
bun run test
```

`bun run test` launches the VS Code 1.85.0 Extension Development Host. To launch it manually, open this directory in VS Code and select **Run OpenAMX Extension** from Run and Debug.

## Package and Install

```sh
CI=1 bun run package
bun run install-local
code --list-extensions --show-versions
```

Packaging creates a local VSIX only; it does not publish or upload the extension.
No project license file exists yet; the license warning during packaging must be
resolved by a project license decision before Marketplace publication.