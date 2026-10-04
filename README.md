# OpenAMX

OpenAMX is a text-based format and toolset for **computable documents**. It
combines Markdown narrative with executable `amx` code blocks and inline
`{{ expressions }}` so a document can explain an analysis and calculate its
results in one readable, versionable file.

The core is domain-neutral: authors define calculations and data structures for
their own work. Optional libraries and examples demonstrate asset-management
workflows, but OpenAMX does not prescribe a risk model or certify domain rules.

## What You Can Do

- Write narrative reports with executable calculations, reusable local modules,
  typed records and pure functions.
- Read local JSON and CSV data through declared logical inputs, validate it
  against document types, and export named results as JSON or CSV.
- Add data tables and charts to a document, then render the narrative,
  calculations and views together.
- Create standalone HTML reports, or export offline PDF and editable DOCX
  reports.
- Author in the desktop workbench or use OpenAMX language features in VS Code.
- Run the TypeScript-based engine and command-line tools in local workflows.

## A Small Example

Save this as `analysis.amx`:

````markdown
# Review

The adjusted score is {{ score }}.

```amx
let score = 10
score += 5
```
````

Only exact, case-sensitive `amx` fenced blocks execute. Markdown remains
narrative, and inline expressions resolve using the document's evaluated
results.

## Get Started

Install [Bun](https://bun.sh/), then install dependencies and build from the
repository root:

```sh
bun install
bun run build
```

Run a document, render it to standalone HTML, or export a report:

```sh
bun run dist/cli.js run examples/hello-world.amx
bun run dist/cli.js render examples/hello-world.amx --out hello-world.html
bun run dist/cli.js export pdf examples/typed-asset-analysis.amx --out analysis.pdf \
  --input asset=examples/typed-asset.json \
  --input screenings=examples/typed-screenings.csv \
  --input reviewedAt=examples/typed-reviewed-at.json
```

The `run` command prints evaluated bindings as JSON. `render` produces a
standalone HTML document; `export` supports `pdf` and `docx`. Data inputs are
explicitly mapped with `--input name=path`. See `bun run dist/cli.js --help` for
the available commands and options.

Run the test suite with:

```sh
bun test
```

## Tooling

- **Desktop workbench:** local project browsing, AMX editing and analysis, live
  preview, structured JSON/CSV editing, input mapping, and HTML/PDF/DOCX export.
  See the [desktop guide](desktop-app/README.md).
- **VS Code extension:** formatting, completion, diagnostics, hover, navigation,
  symbols, references, and code actions. See the
  [extension guide](vscode-extension/README.md).
- **CLI:** evaluate documents, render HTML, and export PDF or DOCX reports.

## Examples and Specifications

Start with [Hello OpenAMX](examples/hello-world.amx) for the document basics.
Other [examples](examples/) show calculations, tables and charts, typed JSON/CSV
inputs, local modules, and JSON/CSV outputs. The Asset Management schemas are
opt-in examples, not domain-certified standards.

The [language specification](docs/language-spec-v0.5.md) documents typed data,
modules, inputs, and report behavior. Earlier specifications describe the
language's evolution: [V0.2](docs/language-spec-v0.2.md),
[V0.3](docs/language-spec-v0.3.md), and [V0.4](docs/language-spec-v0.4.md).

## Design Boundaries

OpenAMX is intended for local documents, local modules, and explicitly mapped
data files. It does not load remote packages or data. Hiding source in a report
is a presentation choice, not a confidentiality boundary; source files and
inputs should be protected independently. Report output is designed to work
offline, but exact visual parity across HTML, PDF, DOCX, and office applications
is not guaranteed.# OpenAMX

Status: V0.6 is COMPLETE and approved for release with Lead Developer-accepted
exceptions. The CLI, shared report identity, HTML/PDF/DOCX exports, desktop
workbench and VS Code productivity providers are present. Native macOS 14+,
Windows 11+, native Ubuntu 24.04+, Hutch packaging/launch, broad Office
compatibility, project licensing/Marketplace publication, formal accessibility,
V0.5 report-mobile overflow, and VS Code apply-time action safety were not
verified as passes; they are accepted release exceptions and follow-up
requirements for V0.7 planning. Release approval is not a claim that artifacts
have been published or that these certifications were completed. Root, desktop,
and extension package metadata are aligned to 0.6.0.

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
- [Kitchen Sink](examples/kitchen-sink.amx), contains a comprehensive explanation of every construct in the AMX framework.
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

---

## OpenAMX Licensing

This project is dual licensed.

You may use this software under either:

1. The GNU Affero General Public License v3.0 (AGPLv3)
2. A Commercial License from Nova Energy Consulting Pty Ltd

By using this software, you agree to comply with the terms of one of these licences.

### Open Source Licence (AGPLv3)

The Community Edition of this software is licensed under the GNU Affero General Public License Version 3 (AGPLv3).

The AGPLv3 permits you to:

- Use the software for any purpose
- Study and modify the software
- Distribute original or modified versions
- Use the software within an organisation
- Deploy the software as a network service

Subject to the conditions of the AGPLv3, including making source code available where required by the licence.

See the LICENSE file for the full licence text.

### Commercial Licence

A commercial licence is available for organisations that wish to:

- Keep modifications proprietary
- Distribute the software as part of a closed-source product
- Embed the software within commercial solutions
- Avoid AGPLv3 source disclosure obligations
- Obtain commercial support arrangements

See COMMERCIAL-LICENSE.md for details.

### Which Licence Should I Choose?

#### Use AGPLv3 if:

- You are an individual user
- You are happy to comply with AGPL obligations
- You wish to participate in the open-source community
- Your project is also open source

#### Use a Commercial Licence if:

- You require proprietary use rights
- Your organisation cannot comply with AGPL obligations
- You wish to distribute closed-source derivative works
- You require contractual warranties, support or indemnities

### Commercial Enquiries

For commercial licensing and support enquiries:

**Nova Energy Consulting Pty Ltd**

Email: licensing@novaenergy.digital

---

## Contributing

By submitting a contribution to this project, you agree that your contribution may be distributed under both:

- AGPLv3
- The commercial licensing program for this project

See CONTRIBUTING.md and the contributor agreement (if applicable) for details.

---

## Disclaimer

This software is provided "as is" without warranty of any kind.

See the applicable licence for full terms and conditions.