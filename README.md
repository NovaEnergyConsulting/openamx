# OpenAMX

Status: The V0.5 feature milestone is COMPLETE and accepted with documented
exceptions deferred to V0.6.
The CLI, shared report identity, HTML/PDF/DOCX exports, desktop workbench and VS
Code productivity providers are present. Known visual, native desktop and
editor/provider limitations remain V0.6 work. This feature acceptance is not a
release claim. Native macOS 14+, Windows 11+,
native Ubuntu 24.04+, Hutch packaging/launch, broad Office compatibility, the
project license and Marketplace publication remain separate OPEN release gates.
V0.6 desktop feature acceptance is pending Sprint 043 Builder evidence and Lead
Developer disposition. Root package metadata is 0.5.0 and desktop development
metadata is 0.1.0; neither is a public release version or publication claim.

OpenAMX combines Markdown narrative, executable `amx` fences, and inline
`{{ expression }}` calculations in plain-text `.amx` documents. The TypeScript
core remains domain-neutral; asset-management examples use ordinary values.
See the [V0.2 language specification](docs/language-spec-v0.2.md) for the
historical contract, the [V0.3 language specification](docs/language-spec-v0.3.md)
for typed-data workflows, and the [V0.4 language specification](docs/language-spec-v0.4.md)
for typed visualizations and their historical export behavior. The
[V0.5 product and report contract](docs/language-spec-v0.5.md) defines additive
report identity, source visibility and product boundaries; it does not mean every
acceptance or release gate has passed.

## Install and verify

Install [Bun](https://bun.sh/), then from the repository root run:

```sh
bun install
bun run build
bun test
```

## Desktop Workbench

The repository includes an offline-first desktop authoring workbench with active-document preview, project recovery, AMX editor intelligence, structured CSV/JSON editing, logical inputs, report settings, and a unified export workflow. Sprint 043 is completing onboarding, migration, and integrated acceptance; native target certification and release readiness are not implied. See the [desktop development guide](desktop-app/README.md) for current workflows, privacy limits, and verification status.

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

V0.3 adds records, typed pure functions, local imports/exports, JSON and CSV
inputs, aggregate or fail-fast validation, and named JSON/CSV exports. The six
initial Asset Management schemas are an opt-in structural library, not
domain-certified standards.

**Migration from V0.1:** bare `let score = 10` lines outside exact, case-sensitive
`amx` backtick fences are narrative and do not execute. Move old declarations
into ` ```amx ` fences. Ordinary Markdown code fences also do not execute;
there is no V0.1 compatibility mode.

## VS Code Extension

The [VS Code extension](vscode-extension/README.md) requires VS Code 1.85.0 or
newer and runs in the Node extension host. The workspace implementation includes
formatting, completion, static diagnostics, hover, definition, outline,
references and a diagnostic-backed quick fix. Runtime CSV/JSON validation remains
a CLI concern. The quick fix is guarded when resolved; VS Code 1.85 cannot attach
an apply-time document-version precondition, and that limitation still requires a
Lead Developer disposition.

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
`engineerstools.openamx-vscode@0.4.0`. This repository has no license file;
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
bun run render:typed
```

Run a document and print the evaluated context as JSON:

```bash
bun run dist/cli.js run examples/transformer-strategy.amx
```

The `run` command prints final variable bindings as JSON.

Typed documents accept repeated logical input mappings and named export mappings:

```bash
bun run dist/cli.js run examples/typed-asset-analysis.amx \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv \
  --input reviewedAt=examples/typed-reviewed-at.json \
  --output summary=out/summary.json \
  --output resultRows=out/result-rows.csv
```

Use `--validation fail-fast` to stop at the first ordered input diagnostic;
aggregate validation is the default. `render` accepts the same mappings and
adds `--out` for the HTML destination.

`render` and `export pdf|docx` accept `--project-root <dir>` to load report
identity defaults from that project's `.openamx/project.json`. This option does
not supply input mappings or change their process-working-directory path base;
`run` does not read project report configuration. Without the option, project
configuration is not discovered. Frontmatter identity without a logo remains
available.

Export an offline PDF or editable DOCX report. The commands analyze once, prepare
the complete report before writing, and require an existing parent:

```bash
bun run dist/cli.js export docx examples/typed-asset-analysis.amx --out out/analysis.docx \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv \
  --input reviewedAt=examples/typed-reviewed-at.json
```

DOCX contains editable semantic headings, paragraphs, lists, tables, and
static chart images. Interactive charts, editable chart data, pixel parity,
and broad native Office compatibility are not promised.

Run the V0.5 typed example with its local imports, JSON/CSV inputs, table and
chart. Copy the sample project config into a temporary project because the CLI
intentionally does not discover parent projects:

```bash
review=$(mktemp -d)
mkdir -p "$review/.openamx"
cp examples/v05-asset-screening.amx "$review/"
cp -R examples/libraries "$review/"
cp examples/v05-project.json "$review/.openamx/project.json"
bun run dist/cli.js run "$review/v05-asset-screening.amx" \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv
bun run dist/cli.js render "$review/v05-asset-screening.amx" \
  --out "$review/report.html" --project-root "$review" \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv
bun run dist/cli.js export pdf "$review/v05-asset-screening.amx" \
  --out "$review/report.pdf" --project-root "$review" \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv
bun run dist/cli.js export docx "$review/v05-asset-screening.amx" \
  --out "$review/report.docx" --project-root "$review" \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv
```

The example calculation is illustrative, not a domain-standard risk formula.
`sourceVisible` defaults to true; hiding source is a presentation choice, not a
confidentiality boundary. Logo assets must be contained local PNG/JPEG files and
are validated and re-encoded before report output is written.

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
- [Typed Asset Screening Analysis](examples/typed-asset-analysis.amx) imports
  opt-in Asset Management and screening schemas, consumes nested JSON and CSV,
  computes scores with a typed pure function, and exports summary JSON plus
  result CSV. Its [HTML](examples/typed-asset-analysis.html) is generated by
  the production CLI.
- [Branded Asset Screening Snapshot](examples/v05-asset-screening.amx) reuses
  typed inputs, local libraries and V0.4 table/chart constructs;
  [project identity defaults](examples/v05-project.json) apply only when the
  CLI receives an explicit `--project-root`.

```sh
bun run dist/cli.js run examples/transformer-strategy.amx
bun run dist/cli.js run examples/asset-fleet-risk-analysis.amx
```

---

## Current limits

No nested loops, range steps, `break`/`continue`, match guards/destructuring,
or chained `else if`. A record constructor directly in a `match` arm remains a
known core parser limitation and is not claimed as supported. Editor
diagnostics cover parsing, static checks, and local module links, not CSV/JSON
runtime validation. Modules and data files are local and entry-root-contained;
there are no remote packages, units/currency, or broad multi-file workflows.
DOCX/PDF exports are local and offline; DOCX charts are static images and
office compatibility beyond package inspection remains open. The Asset
Management library remains provisional pending domain review.
