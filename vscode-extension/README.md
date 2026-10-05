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

The root package is the release version authority; the current extension
package version is `0.8.0` and its publisher is `EngineersTools`. The quick fix rechecks document version,
token and live diagnostic when the action is resolved, but VS Code 1.85
`WorkspaceEdit` has no apply-time version precondition; a stale already-resolved
edit cannot be guaranteed safe. This package's contents are platform-neutral
(Node-hosted JavaScript and JSON resources), but that does not certify native
desktop targets or Marketplace acceptance.

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

Run `bun run package` from this directory to create a local VSIX for installation.
The package helper stages the root `LICENSE.md` unchanged because vsce expects the
referenced license file beside the extension package metadata.
It runs the installed vsce JavaScript entry point directly with Node, without a
shell or package-manager-specific executable shims (such as `vsce.cmd` on Windows).
From the repository root, `bun run release:extension` instead requires a clean
committed source tree and writes the versioned bundle under
`releases/<version>/extension/`. Neither workflow publishes the extension.
Marketplace submission remains a manual operator action under the
`EngineersTools` publisher.

The root `LICENSE.md` now contains full AGPLv3 terms. The extension package
declares `SEE LICENSE IN LICENSE.md`, and the packaging helper stages that file
unchanged beside the manifest; `vsce` includes it as the VSIX license asset
without a missing-license warning. The package's AGPL reference has not been
confirmed as the correct Marketplace metadata for the project's separate
commercial option, and required third-party notices (or confirmation that none
are required) remain unresolved. Release verification and GitHub publication
stay blocked until the license owner confirms those requirements. Marketplace
submission remains manual.