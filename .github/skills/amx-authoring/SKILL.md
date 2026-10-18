---
name: amx-authoring
description: "Create, edit, or review functional OpenAMX .amx computable documents. Use when writing AMX syntax, building narrative reports with calculations, adding typed inputs or local modules, or diagnosing why an .amx file does not run or render."
argument-hint: "[document request or .amx path]"
---

# OpenAMX Document Authoring

Create clear, valid OpenAMX documents that preserve the user's intended analysis
and can be executed by the OpenAMX runtime.

## Sources of truth

Before using a language feature, consult the current links in the
[README](../../../README.md), especially **Examples and Specifications** and
**CLI usage**. The current language contract is V0.14, additive to the V0.9
contract:

- [V0.14 language specification](../../../docs/language-spec-v0.14.md)
- [V0.13 diagram specification](../../../docs/language-spec-v0.13.md)
- [V0.12 language specification](../../../docs/language-spec-v0.12.md)
- [V0.9 language specification](../../../docs/language-spec-v0.9.md)
- [V0.9 migration guide](../../../docs/migrating-to-v0.9.md)

Use the specifications for the language contract and the current `.amx`
examples as runnable patterns. Earlier versioned specifications and sprint
planning documents may describe historical or planned behavior; do not treat
them as proof that a feature is currently supported. If the request depends on
a feature whose status is unclear, verify it against the current source,
examples, or CLI before using it.

Useful examples:

- [Numbered learning guide](../../../examples/00_Table_of_Contents.amx) for
  the complete offline learning path
- [First computable document](../../../examples/01_First_Computable_Document.amx)
  for the minimal document structure
- [Typed records and modules](../../../examples/04_Typed_Records_Enums_and_Modules.amx)
- [Mapped data and validation](../../../examples/06_Mapped_Data_and_Validation.amx)
  with its [local libraries](../../../examples/libraries/)
- [Formula-driven diagrams](../../../examples/08_Formula_Driven_Diagrams.amx)
- [V0.14 type checks](../../../examples/09_Runtime_Type_Checks.amx),
  [math](../../../examples/10_Mathematics_and_Measurement_Operations.amx), and
  [text/formatting](../../../examples/11_Text_and_Numeric_Formatting.amx)
- [Complete asset screening report](../../../examples/12_Complete_Asset_Screening_Report.amx)
- [Standalone route measurement report](../../../examples/13_Route_Measurement_Report.amx)
- [Standalone battery-resistor circuit](../../../examples/14_Battery_Resistor_Circuit.amx)

## Authoring procedure

1. **Understand the requested artifact.** Identify its audience, purpose,
   required results, data sources, and desired presentation. Preserve supplied
   domain formulas and units. Do not invent engineering or business rules;
   make assumptions visible and label illustrative calculations as such.
2. **Inspect the project context.** If editing an existing project, read the
   target document, related local modules, input files, and nearby examples.
   Reuse established names and schemas where appropriate. Do not overwrite
   unrelated files or generated outputs.
3. **Compose the document.** Use Markdown for explanation and fenced blocks
   labeled exactly `amx` (lowercase) for executable statements. Only code in
   those fences runs; ordinary Markdown and other fenced languages are inert.
   Use `{{ expression }}` for narrative values. Keep prose understandable
   without execution, and distinguish computed results from assumptions.
4. **Use the implemented language contract.** Follow the current specification
   for syntax, typing, scope, evaluation, and compatibility. In particular:
   declarations and imports are source-ordered; modules expose only exported
   declarations; record constructor fields use `=` (not `:`); and a child
   record is not assignable to its parent. Do not assume syntax or behavior
   from another programming language.
5. **Handle data and modules explicitly.** Declare external data with typed
   `input` declarations and use the CLI's named `--input name=path` mappings
   when running the document. Use local `.amx` imports and exported symbols
   when reuse is warranted. Make field names, nullability, units, and output
   shapes agree with the actual source data and schema. Do not embed or assume
   private data that was not supplied.
6. **Keep the result maintainable.** Prefer small, named intermediate
   calculations and pure functions for reused logic. Keep generated narrative
   values connected to the values actually calculated. Avoid unnecessary
   language features, duplicate formulas, unsupported HTML, or claims that
   exceed the evidence.

## Validate before delivery

When working in this repository, use its documented Bun workflow. Build the
CLI if needed, then execute the document from the repository root:

```sh
bun run build
bun run dist/cli.js run path/to/document.amx
```

For documents with external inputs, add one `--input logicalName=path` for each
declared input, using paths relative to the command's working directory. Use
the exact files and values intended for the document. The CLI's `run` command
parses, checks, evaluates, and prints the final bindings as JSON; treat any
diagnostic or non-zero exit as a failure to resolve, not as a successful
artifact.

If presentation matters, render to a deliberate output path (not over an
existing source or user file), passing the same input mappings:

```sh
bun run dist/cli.js render path/to/document.amx --out path/to/preview.html
```

Inspect the resulting bindings and rendered narrative for the expected values,
missing substitutions, and unintended content. Exercise meaningful edge cases
in the calculation when feasible. If you make a correction, run the validation
again. Do not claim a file is functional based only on syntax highlighting,
visual inspection of source, or a successful build.

If Bun or the repository CLI is unavailable, report that runtime validation
could not be performed; do not imply that an unexecuted document has passed.

## Delivery

Return the requested `.amx` file or focused edits, plus a short note describing
what it contains, assumptions that affect interpretation, and the validation
performed (including any limitation or failure). Keep the document
self-contained unless the project explicitly calls for companion modules or
data files.
