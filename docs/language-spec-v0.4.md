# OpenAMX Language Specification V0.4

V0.4 is an additive contract for typed visualizations, static report output, and desktop authoring. V0.2 and V0.3 remain historical contracts and are not changed by this specification. V0.4 production syntax, HTML interaction, PDF export, and desktop workflows are assigned to later sprints; this document defines their required behavior before implementation.

## 1. Compatibility and Activation

All V0.2 document, fence, expression, source-location, formatting, rendering, and interpolation rules continue to apply. V0.3 types, modules, inputs, validation, named outputs, diagnostics, and no-option CLI behavior also continue to apply. A V0.2/V0.3 document that contains no V0.4 visualization declaration or `show` statement retains its existing behavior and output.

A `table`, `chart`, or `show` construct activates V0.4 parsing and static checking for the complete entry document and reachable module graph. Parse, link, and static-check phases finish before input loading, evaluation, HTML generation, PDF generation, or output writes. An error in a phase prevents every later phase. V0.4 adds no implicit coercion and does not weaken V0.3 validation.

V0.4 visualization declarations are permitted only in the entry module, at module top level inside executable `amx` blocks. Imported modules retain their V0.3 grammar and may supply exported record types, functions, and values, but may not declare or emit views. View declarations are private, cannot be exported, and do not change module evaluation or evaluate-once behavior.

## 2. Visualization Syntax

The following declarations are executable AMX statements. Newlines separate options, columns, and series. Semicolons are not separators. A quoted string is required for titles, descriptions, and display labels. Identifiers and field names are case-sensitive.

```amx
table riskRegister = table(risks) {
  title: "Risk register"
  column assetId as "Asset"
  column score as "Risk score"
}

chart riskByAsset = bar(risks) {
  title: "Risk score by asset"
  description: "Risk scores grouped by asset in input order"
  category: assetId
  series score as "Risk score"
}

show riskRegister
show riskByAsset
```

The conceptual grammar is:

```text
VisualizationDeclaration ::= TableDeclaration | ChartDeclaration
TableDeclaration         ::= "table" Identifier "=" "table" "(" Identifier ")"
                             "{" NewLine TableOption* "}"
TableOption              ::= "title" ":" StringLiteral NewLine
                           | "column" Identifier "as" StringLiteral NewLine
ChartDeclaration         ::= "chart" Identifier "=" ChartExpression
ChartExpression          ::= ChartKind "(" Identifier ")" "{" NewLine ChartOption* "}"
ChartKind                 ::= "bar" | "column" | "line" | "scatter"
ChartOption               ::= "title" ":" StringLiteral NewLine
                           | "description" ":" StringLiteral NewLine
                           | "category" ":" Identifier NewLine
                           | "x" ":" Identifier NewLine
                           | "y" ":" Identifier NewLine
                           | "group" ":" Identifier NewLine
                           | "labels" ":" Identifier NewLine
                           | "series" Identifier "as" StringLiteral NewLine
                           | "series" StringLiteral NewLine
ShowStatement             ::= "show" Identifier NewLine
```

`table` and `chart` names share the module's declaration namespace with values, types, functions, and imported names. A view name is unique and immutable. Its source data binding must be declared earlier in module source order. A view name becomes visible after its declaration, including in later executable blocks. A `show` must refer to an earlier view declaration. Declarations do not emit output by themselves. Multiple `show` statements emit the same declaration multiple times using the values present at each `show` statement.

Table declarations require exactly one `title` and one or more unique `column` entries. Chart declarations require exactly one `title` and `description`. Chart options may not repeat. The exact option set depends on the source shape and chart kind as defined below; invalid or irrelevant options are static errors.

## 3. Supported Data Shapes and Static Rules

Views bind to a preceding, statically typed entry-module value. Dynamic or inferred `any` values are not supported. Lists containing nullable record elements are not supported.

Tables accept only `RecordType[]` with non-null record elements. Each declared column binds one direct field of that record type. A field path cannot traverse nested records. A table column must be `String`, `Number`, `Boolean`, `DateTime`, or one of those scalar types made nullable. A list or record-valued field is not a table column. A field may appear only once in one table declaration; display labels may repeat.

Bar and column charts accept either `RecordType[]` or `Number[]`:

- For `RecordType[]`, `category` is required and binds a non-null scalar field. One or more `series field as "label"` entries are required; each field is `Number` or `Number?`. Series are kept in declaration order. Categories are kept in record input order; repeated category labels are allowed and remain distinct rows.
- For `Number[]`, exactly one `series "label"` is required. `labels` is optional and, when provided, must bind `String[]` with exactly the same length as the values. Without labels, categories are the one-based list positions rendered as decimal integers.

Line charts accept `RecordType[]` or `Number[]`:

- For `RecordType[]`, `x` is required and binds a non-null `Number` or `DateTime` field. One or more `series field as "label"` entries are required; each field is `Number` or `Number?`. Points remain in input order; V0.4 does not sort or interpolate them.
- For `Number[]`, exactly one `series "label"` is required. Optional `labels` follows the same length and type rule as for bar and column charts. The horizontal coordinate is the one-based list position.

Scatter charts accept only `RecordType[]`. `x` and `y` are required and each binds a `Number` or `Number?` field. An optional `group` binds a non-null `String` field. When present, points are grouped into series by the first-seen group values; each group retains input order. Without `group`, all points form one series. Scatter charts do not accept `category`, `labels`, or `series` options.

Unknown bindings, unknown or repeated fields, duplicate columns, invalid source shapes, missing required options, incompatible field types, repeated options, and options that do not apply to a chart kind fail static checking before inputs are read. Diagnostics use the stable V0.3 `AMX3001` through `AMX3005` families; implementations should use `AMX3001` for unknown names/fields, `AMX3002` for incompatible types, `AMX3003` for invalid visualization forms, and `AMX3005` for duplicate or invalid declarations. Each diagnostic points to the original-document location of the declaration or offending option.

## 4. Evaluation, Placement, and Rendering

Visualization declarations are checked in module source order across executable blocks, as are their data bindings. A declaration creates an immutable view definition; it does not copy or serialize data. `show name` resolves the definition and captures the current value of its source binding at that exact evaluation point. Each emission is an immutable snapshot. Later mutation of the source list does not change an earlier emission.

Executable blocks continue to evaluate once, in source order, in the entry module's existing shared environment. Inputs are loaded and validated before any module evaluates. Imported modules still evaluate before their importer. A `show` is legal only at module top level; it is not legal inside loops or function bodies. No new filesystem, network, or arbitrary execution capability is introduced into AMX.

Rendering remains a separate document-order pass after successful analysis and evaluation. Narrative interpolation continues to use the final environment as in V0.2/V0.3. At an executable fence containing one or more `show` statements, the renderer emits the existing canonical, escaped, visible AMX source listing, followed by each corresponding view in `show` statement order. The complete fence and its emitted views remain at that fence's document position relative to narrative and other fences. A view emitted in a later fence therefore appears after intervening narrative even when its declaration was in an earlier fence. Ordinary Markdown fences and bare declarations remain inert.

HTML output is standalone and deterministic for the same source and inputs. All user-controlled labels, cell values, titles, descriptions, and chart data are rendered as text and escaped for their HTML/SVG context. No remote script, font, stylesheet, image, chart package, telemetry, or network request is required for a report. Chart colors use a fixed ordered palette and are never the sole means of distinguishing series.

### Tables

HTML tables use semantic `<table>`, `<caption>`, header cells with `scope="col"`, and row cells. Each column header exposes a keyboard-operable sort control and correct `aria-sort`; the initial order is input order. Sorting is stable, with original row order breaking ties. Numbers sort numerically, Booleans sort `false` before `true`, and strings and DateTime wire values sort by ordinal Unicode code-point order. Nulls sort last in both directions. No locale-sensitive collation is used.

A table offers a case-insensitive substring filter over the displayed cell text and pagination controls with page sizes 10, 25, and 50; the initial page size is 25. Filtering and sorting reset to page one. Page controls expose accessible names and current range/count as a live status. An empty source, or a filter with no matches, displays a distinct accessible `No rows` state. Null displays as `(null)` and an empty string displays as empty text. HTML sorting, filtering, and pagination do not mutate AMX values.

Print and PDF representations include all rows, in the original input order, without interactive controls or transient browser filter/sort/page state. They retain the caption, column labels, repeated table headers across page breaks, and readable wrapping. Very long cell content may wrap; rows must not be split when the selected export engine can keep them together.

### Charts

HTML charts are interactive using locally bundled code only. Bar/column charts show grouped values for each input category and declared series; line charts connect points in input order; scatter charts use numeric x/y coordinates. A null numeric series value creates a gap for that series at that record. A scatter point with either coordinate null is omitted. No other malformed or missing value is silently dropped because static checking and typed runtime validation reject it before rendering.

Empty data renders the chart title, description, axes/legend where applicable, and an accessible `No data` state without fabricated points. Chart output includes an accessible figure name/description and a text/table representation of the plotted source values. Static print/PDF/DOCX presentations omit interaction and retain the same data, series order, category/point order, labels, title, and description. They use a vector or embedded raster representation generated locally; charts do not require remote assets. Visual layout may differ between HTML and export.

## 5. Source Locations and Diagnostics

V0.2/V0.3 location rules remain: one-based line and column in the original document, including front matter and fence delimiters, with UTF-16 columns. Parser and static diagnostics identify the declaration, option, binding, or `show` source location that caused the error. Imported type/field diagnostics identify the imported declaration's file and source location when available. Data diagnostics retain V0.3 input declaration and data-path context. Export destination/render failures use `AMX6001` for invalid selection/path/conflict and `AMX6002` for serialization, PDF-engine, or filesystem failure.

The static-check barrier precedes input loading, evaluation, rendering, and every write. Input mapping/read/validation failures prevent evaluation and rendering. Evaluation failures prevent all output writes. HTML/PDF render or serialization must complete successfully before an export destination is modified.

## 6. PDF Export Contract

The CLI entry point is additive: `openamx export pdf <input> --out <path>`. `--out` is required and must have the exact lowercase `.pdf` extension. Repeated `--input name=path` and `--validation aggregate|fail-fast` retain V0.3 syntax and meaning. Existing `run` and `render` commands and their defaults do not change. The desktop application exposes a corresponding export action through its main-process RPC; it calls the same core analysis and shared PDF adapter as the CLI.

PDF output is generated entirely on the local machine, without remote resources. It includes report headings, narrative, tables, static charts, and visible executable source according to the rendered-document order. It uses embedded or bundled fonts with clear redistribution rights and has legible body/headings, adequate contrast, page numbers, repeated table headings, and configurable-but-deterministic page margins and paper size. The initial defaults are A4 portrait, 18 mm margins, and page numbers in the footer. Heading-with-following-content, table headers, and chart titles should stay with their content where practical. Explicit page breaks are honored. No exact HTML/PDF pixel-parity guarantee is made.

The selected engine must finish layout and close its output stream before success is reported. Validate the complete analysis, input data, evaluated values, and PDF document before writing. Destination paths are interpreted by the CLI relative to the process working directory and by the desktop relative to the open project root unless an absolute path is explicitly selected. Parent directories must already exist. Resolve the destination parent canonically, reject a destination that is the entry/module/input file or a duplicate/conflicting output, and reject a destination symlink. Write to a unique temporary file in the same directory, flush/close it, and atomically rename it over the selected destination. On analysis, layout, or pre-rename failure, preserve any existing destination and remove the temporary file. Report `AMX6001` for an invalid destination and `AMX6002` for layout, serialization, or write failure. Do not promise a multi-file transaction for other V0.3 outputs.

PDFs contain searchable text for headings, narrative, table contents, and page numbers. Charts may be vector/raster graphics and are accompanied in the report by a textual data representation so their values remain inspectable. The V0.4 acceptance example must exercise headings, a multi-page table, a static chart, explicit page breaks, and invalid-analysis no-write behavior.

## 7. Desktop and Typed RPC Boundary

The desktop application is an isolated Electrobun + Vue + shadcn-vue package. Root and `vscode-extension/` dependencies, scripts, builds, and runtime behavior remain independent. The Electrobun main process uses Bun when the core API depends on Bun APIs. The webview has no Node/Bun globals, direct filesystem, process, shell, module-loader, input-loader, evaluator, or PDF API.

All privileged operations cross a typed request/response RPC. The later production RPC schema is limited to requests such as `analyzeBuffer`, `previewBuffer`, `runBuffer`, `saveDocument`, `openDocument`, `listProjectFiles`, and `exportPdf`, each with explicit request and response types and structured diagnostics. Requests carry the current editor text and a file-backed entry URI; they do not carry executable code to the webview. Main-process handlers validate URI/path containment, size limits, input mapping names, and destinations before calling the shared core. RPC payloads contain document text, typed input mapping metadata, HTML/diagnostics, export status, and bounded display data; they do not expose arbitrary file handles, filesystem APIs, or evaluation hooks.

Run and preview always analyze the supplied current buffer, including unsaved edits; they must never silently substitute stale saved text. Relative module paths resolve from the canonical entry file and remain within the entry directory tree using the V0.3 symlink-aware containment rule. Untitled buffers may be parsed and diagnosed, but cannot run if imports or relative input mappings require a file-backed project location; the UI must request a project/file location instead of guessing. Editor diagnostics use pure parsing and checking and do not read data inputs or evaluate AMX.

## 8. Portable Input Configuration and Safe Paths

The project-default configuration is `.openamx/project.json`, versioned with the project. It may declare a project name and logical input defaults as paths relative to the project root. It must not contain machine-specific absolute paths, credentials, tokens, environment secrets, or local override values. Portable input defaults must canonicalize inside the project root.

Machine-local overrides live in `.openamx/local.json`, which is ignored by version control and created only on explicit user action. This file may contain local absolute paths and is never copied to shared project configuration or included in diagnostics beyond the path needed to identify a failing input. Its permissions should be restricted to the current user where supported. Missing/invalid local configuration is reported without overwriting it.

Desktop input precedence is: per-run override, then local override, then project default. A per-run mapping replaces a value for the same logical input and never merges file contents. Relative desktop paths resolve from the project root; CLI `--input` and `--out` retain the V0.3 process-working-directory base. Imported `.amx` modules always use the V0.3 entry-root containment rule. Machine-local data paths may be outside the project tree only when explicitly selected in local configuration or a per-run override; they are opened only by the main process. No network path or URL input is supported.

Project navigation lists only canonical files under the selected project root, excludes ignored/local configuration and generated output by default, and opens dependencies through the same containment check as the module loader. Save operations write only to an explicitly selected project path. PDF export follows the destination validation and same-directory temporary-file/atomic-rename contract in section 6; no directory is created implicitly.

## 9. Offline PDF Engine Evidence and Selection

Sprint 020 exercised two offline approaches on representative content. The leading candidate is **pdfmake 0.3.11 (MIT)**, using its server-side API with locally packaged Roboto fonts. It supports text flow, repeated table headers, explicit page breaks, SVG vectors, embedded fonts, and local output without launching a browser. The proof denied all URL access and restricted local file access to the package's bundled font directory. pdfjs-dist 6.3.289 (Apache-2.0) parsed the result and verified searchable headings/table text, two pages, and the forced appendix break on page two. On Bun 1.4.2 / Linux x64, the proof generated a 22,702-byte PDF. The proof does not certify visual polish, all table edge cases, cross-platform font metrics, PDF/A, or accessibility tagging; those are later acceptance items.

The comparison candidate was system Google Chrome 152.0.7977.82 headless printing of the same local HTML with an inline static SVG, print CSS, a 24-row table, and an explicit page break. It generated a 62,485-byte searchable three-page PDF; pdfjs-dist confirmed the headings and later-page appendix. This path is attractive when print fidelity to HTML dominates, but the tested command depended on an installed system Chrome binary and emitted a non-fatal WSL DBus/UPower warning. It adds browser version, security patch, native-library, and packaging management; the Electrobun system webview is not a guaranteed identical print engine. The observed page count differed from pdfmake, so pagination is not interchangeable.

Select pdfmake for Sprint 023 because it runs in the Bun main process, avoids a second browser deployment, provides report-oriented flow layout and deterministic explicit page breaks, and passed a local representative-content proof. Pin the tested version in the isolated proof; re-evaluate exact pinning and API against the production app's Bun/Electrobun build in Sprint 023. Keep Chromium printing as a measured alternative, not a hidden runtime dependency. Both engines are local/offline when supplied local fonts and content; the proof did not attempt to block operating-system background network traffic. pdfmake's package metadata declares MIT, but the installed package does not include a separate license file alongside its bundled Roboto font files. Sprint 023 must verify font redistribution terms or replace those files with project-approved redistributable fonts before shipping embedded fonts.

## 10. DOCX Stretch Disposition

DOCX remains a non-blocking stretch and is not part of V0.4 core acceptance. The PDF proof demonstrates reusable structured report content but does not demonstrate an editable DOCX pipeline or acceptable round-trip quality. Do not start Sprint 026 until Sprints 021–025 are on track and the Lead Developer explicitly approves the stretch. If approved, DOCX acceptance prioritizes editable semantic headings, paragraphs, lists, and tables; charts may be embedded images. Do not claim PDF or HTML visual parity.

## 11. Sprint Boundaries and Non-Goals

- **Sprint 020** establishes this contract and architecture evidence only. Its desktop code is a minimal RPC/runtime prototype, not a user workflow.
- **Sprint 021** implements V0.4 AST/parser/checker/runtime view declarations and `show`, including the existing record-constructor-in-`match` parser conformance fix. No production rendering or PDF export.
- **Sprint 022** implements interactive HTML tables, charts, accessibility/static print representations, and VS Code authoring support. No production PDF command.
- **Sprint 023** implements the shared offline PDF adapter, CLI command, destination safety, and report layout tests.
- **Sprint 024** implements desktop foundation, editing, project navigation, split preview, and editor support using the agreed RPC boundary.
- **Sprint 025** implements current-buffer analysis/run, input configuration precedence, diagnostics, output selection, preview, PDF export, and owner platform acceptance.
- **Sprint 026** remains optional DOCX stretch and is not a core release gate.
- **Sprint 027** owns end-to-end examples, full compatibility/release acceptance, and final documentation/version alignment.

V0.4 does not add units/currency, domain-specific validation, new record semantics, remote package/module loading, network-backed report assets, general-purpose filesystem functions, arbitrary webview execution, installer/updater workflows, or a DOCX core requirement.
