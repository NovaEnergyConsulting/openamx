# OpenAMX for VS Code

OpenAMX adds formatting for executable `amx` fences, basic keyword/function and in-scope variable completion, and parser diagnostics for `.amx` documents. It requires VS Code 1.85.0 or newer.

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
bun run package
code --install-extension openamx-vscode-0.2.0.vsix --force
```

Packaging creates a local VSIX only; it does not publish or upload the extension.