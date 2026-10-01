# OpenAMX for VS Code

The workspace extension sources implement executable-fence formatting,
source-order completion, parser/static/local-module diagnostics, hover,
go-to-definition, document outline, references and a diagnostic-backed quick fix
for a missing `show` name when one preceding view is visible. Read-only navigation
follows explicit contained exports and open unsaved dependency buffers; uncertain
symbols, non-executable fences and standard-library functions without source
targets do not navigate. It requires VS Code 1.85.0 or newer. Editor analysis does
not run documents or load CSV/JSON inputs; runtime validation remains a CLI
concern.

V0.5 features are accepted with the quick-fix apply-time limitation recorded as
an exception and deferred to V0.6. The extension package version remains 0.4.0;
this is not a V0.5 package or release. The quick fix rechecks document version,
token and live diagnostic when the action is resolved, but VS Code 1.85
`WorkspaceEdit` has no apply-time version precondition; a stale already-resolved
edit cannot be guaranteed safe. Native macOS/Windows/native Ubuntu, project
license and Marketplace publication remain separate OPEN release gates.

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