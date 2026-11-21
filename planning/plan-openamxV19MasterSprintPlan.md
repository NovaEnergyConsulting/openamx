# OpenAMX V0.19 Master Sprint Plan

## Problem and Proposed Approach

OpenAMX chart declarations currently always emit the chart's data table in
interactive and static reports. Authors have no way to hide the table even
when the chart itself provides the intended presentation. V0.19 will add an
optional `showTable` chart property with a default of `false`, allowing any
Boolean-typed expression in the chart declaration's environment to control
whether the data table is emitted.

The current measurement system represents a unit through one linear scale.
A displayed value becomes a physical value by multiplication with that scale,
which supports units such as kilometers and seconds but cannot represent
offset conversions such as Celsius or Fahrenheit. V0.19 will add affine unit
declarations whose physical value is:

$$p = v \times scale + offset$$

This model preserves existing multiplication-only unit declarations while
allowing addition and subtraction in unit expressions. It also enables the
built-in numeric constants `PI` and `E` to be resolved in unit declarations.
The standard SI library will add Celsius and Fahrenheit units and aliases on
top of the existing Kelvin unit.

V0.19 is limited to these language and product capabilities plus their parser,
typechecker, runtime, renderer, editor, standard-library, documentation,
example, and acceptance work. Both feature streams are release gates. This plan
does not authorize publication, package-version changes, deployment, or
platform certification. Implementation follows the V0.18 Sprint 114 closeout
disposition and begins with the V0.19 contract gate in Sprint 115. Prior
residuals remain outside V0.19 unless separately approved.

## Confirmed Product Decisions

- **Version scope:** Deliver chart data-table visibility, affine/offset unit
declarations and measurement behavior, and framework constants in unit
declarations. Do not carry unrelated ideas or prior residuals into V0.19.
- **Chart syntax:** Add optional `showTable <expression>` to chart blocks. The
option applies to bar, column, line, and scatter charts.
- **Chart value:** The expression must produce a Boolean. Any Boolean-typed
expression may be used; it is not limited to literals. The expression is
evaluated in the chart declaration's normal environment.
- **Chart default and migration:** Omit `showTable` means `false`. This is an
intentional V0.19 breaking change: existing charts no longer display their
data tables unless they explicitly evaluate `showTable` to true.
- **Chart output scope:** The setting applies uniformly to interactive HTML
and preview, PDF, and DOCX. A false or omitted result emits no data table for
that chart in those outputs.
- **Affine formula direction:** Preserve existing physical-value semantics.
For a displayed value $v$, conversion to canonical physical value uses
$p = v \times scale + offset$. A declaration such as
`unit celsius = kelvin + 273.15` therefore identifies an affine unit with
scale $1$ and offset $273.15$ in Kelvin.
- **Conversions:** Conversion, equality, and ordering compare canonical
physical values. The runtime derives inverse conversions and composes affine
units rather than requiring every pairwise conversion to be declared.
- **Affine subtraction:** Compatible affine measurements may be subtracted.
Subtract their canonical physical values, divide the resulting difference by
the left operand's scale, and return a measurement in the left operand's
display unit.
- **Affine addition and scaling:** Reject direct addition of two absolute
affine measurements and reject affine multiplication, division, and powers.
These operations must not silently lose the offset.
- **Affine aggregates:** Preserve the requested exception for `sum` and use
physical-value normalization: convert each compatible value to canonical
physical value, aggregate, then convert the result to the first element's
display unit. Apply the same normalization to `mean`. `min` and `max` select
after physical comparison. `abs` and `round` preserve the selected display
unit under existing behavior.
- **Standard temperature units:** Add tested SI-library exports `celsius`,
`fahrenheit`, `degC`, and `degF`, retaining `kelvin` and `K`. Use $273.15$ as
the Kelvin/Celsius offset. The published declarations must satisfy
$0\,C = 32\,F = 273.15\,K$.
- **Unit declaration constants:** Permit the existing built-in constants `PI`
and `E` in unit declaration expressions. They must resolve statically to the
same values as the runtime standard library. User declarations, imported
constants, and arbitrary identifier values remain excluded.
- **Output compatibility:** Charts with `showTable true` and documents that do
not use affine units retain their existing data and rendering behavior,
except for the intentional default change when `showTable` is omitted.
- **Release authority:** V0.19 scope and closeout do not authorize release,
publication, package-version changes, deployment, or platform certification.

## Recommended Approach

- Begin with an executable language contract and affine-model feasibility gate.
Record the accepted declaration grammar, conversion direction, affine
metadata, operation matrix, diagnostics, and fixtures before changing the
current linear unit model.
- Represent every unit by its existing dimension identity plus scale and
optional offset over the canonical base unit. Existing linear units continue
to use an offset of zero. Derive inverse and composed conversions from one
canonical formula so declaration checking, measurement conversion, charts,
and reports cannot diverge.
- Add `+` and `-` to unit declaration resolution conservatively. Preserve the
precedence and behavior of existing multiplication, division, and
exponentiation. Reject expressions that cannot produce one finite positive
scale and one finite compatible offset.
- Keep `PI` and `E` as a narrow compile-time allowlist for unit declarations.
Do not introduce arbitrary user constant evaluation, forward lookup, or a
second standard-library constant system.
- Treat affine absolute values differently from ordinary linear measurements.
Centralize operation eligibility and conversion behavior in the measurement
layer, including the approved `sum`/`mean` exception, rather than distributing
special cases across renderers or standard-library functions.
- Evaluate `showTable` once while evaluating the chart declaration, retain its
Boolean result in the shared chart emission, and let all renderers consume the
same value. Do not parse or evaluate the expression independently in HTML,
PDF, and DOCX paths.
- Update the existing VS Code TextMate grammar and desktop parser-proven
highlighting, formatter behavior, language specification, README navigation,
and both relevant examples. Test omitted, false, true, expression-based,
and invalid chart options across all output surfaces.
- Preserve the existing external measurement shape `{ value, unit }` and
existing display-unit selection rules. V0.19 changes how physical values are
computed; it does not introduce a new serialization format for ordinary
report consumers.

## Confirmed Scope

### Chart Table Visibility

- Add `showTable` as an optional chart-block property for every currently
supported chart kind.
- Parse and retain the option expression with its source location.
- Require the option to evaluate to a Boolean and preserve normal expression
and diagnostic behavior for referenced values, operators, nullability, and
invalid types.
- Default an omitted option to `false` and evaluate a present expression when
the chart declaration is evaluated.
- Propagate the resolved Boolean through the shared chart emission and chart
view model.
- Omit the chart data table entirely in interactive HTML, preview, PDF, and
DOCX when the resolved value is false. Do not implement CSS-only hiding as a
replacement for output omission.
- Preserve chart title, description, axes, series, source data, and table
contents when the resolved value is true.

### Affine Unit Declaration and Metadata

- Extend unit declaration resolution to accept compatible affine `+` and `-`
terms while preserving existing `*`, `/`, and signed integer exponentiation.
- Represent affine units with the existing unit identity and dimension vector,
a positive finite scale, and a finite offset relative to the canonical unit
for that dimension.
- Validate composed and imported units from one canonical scale/offset model.
Reject incompatible dimensions, zero or negative scales, non-finite values,
cycles, unresolved names, ambiguous expressions, and unsupported affine
composition.
- Resolve only built-in `PI` and `E` as numeric values in unit declaration
expressions. Keep normal runtime references to these constants unchanged.
- Preserve existing multiplication-only declarations, aliases, module
identity, explicit imports/exports, compound dimensions, and external unit
validation.

### Measurement Conversion and Operations

- Convert attached affine measurements and `measurement in unit` values with
both scale and offset while preserving the requested display unit.
- Compare affine-compatible measurements using canonical physical values.
- Support affine subtraction by subtracting physical values and returning a
measurement in the left operand's display unit after dividing by its scale.
- Reject direct affine addition and unsupported affine multiplication,
division, and powers with dimensional-operation diagnostics.
- Implement `sum` and `mean` through physical-value aggregation and conversion
to the first display unit. `sum` remains an explicit exception to direct
addition rejection.
- Support `min` and `max` through physical comparison, and preserve established
`abs` and `round` display-unit selection.
- Keep explicitly unsupported affine uses of `sqrt` and `pow` rejected.
- Apply the same canonical conversion rules to chart normalization, table
data, scalar display, and existing compatible external-data paths.

### Standard Library, Editors, and Documentation

- Add `celsius`, `fahrenheit`, `degC`, and `degF` to `libraries/si.amx`, using
declarations that produce the approved conventional conversions.
- Update VS Code TextMate/highlighting tests and desktop parser-proven editor
analysis and UI tests for `showTable` and affine unit expressions.
- Add formatting coverage so chart options and affine declarations remain
stable and source locations remain usable for diagnostics.
- Add `docs/language-spec-v0.19.md` as an additive contract and link it from
README navigation. Do not revise historical specifications.
- Update `examples/05_Measurements_and_Units.amx` with affine declarations,
constants, and conversion scenarios.
- Update `examples/07_Tables_Charts_and_Named_Outputs.amx` to demonstrate
explicit table visibility and the new default.
- Add a migration note explaining that charts now require `showTable true` to
retain their V0.18 table behavior.

### Tests and Acceptance

- Add parser, checker, formatter, editor, runtime, standard-library, chart,
HTML, PDF, and DOCX coverage for the new behavior.
- Verify `0 celsius`, `32 fahrenheit`, and `273.15 kelvin` convert to the same
physical value and round-trip without changing display intent.
- Verify `20 celsius - 10 celsius` produces `10 celsius` under the left-unit
rule while direct affine addition is rejected.
- Verify `sum([10 celsius, 20 celsius])` produces `303.15 celsius` through
physical-value aggregation, and verify corresponding `mean`, `min`, `max`,
`abs`, and `round` cases.
- Verify mixed Celsius, Fahrenheit, and Kelvin chart values normalize using
physical values and retain the selected display unit and label.
- Verify PI and E are accepted in unit declarations, but user/imported
constants are not implicitly folded.
- Verify omitted and false `showTable` behavior produces no table; true values
and Boolean expressions evaluating to true produce the existing table.
- Record exact evidence, unavailable checks, residuals, and closeout status.
Do not report an unexecuted or unavailable check as passing.

## Explicit Exclusions

- New chart kinds, chart layout/style semantics, or unrelated chart behavior.
- CSS-hidden fallback tables, screen-reader-only tables, or alternate data
markup when `showTable` resolves to false.
- User-declared or imported constants in unit declarations. V0.19 permits only
`PI` and `E` through the built-in declaration constant allowlist.
- Arbitrary affine multiplication, division, powers, or roots; first-class
interval/delta unit types; or a separate temperature-difference type.
- Unapproved imperial/customary units beyond the specifically approved
`fahrenheit` and `degF` exports.
- Package resolution, implicit unit aliases, bare-number unit inference,
exact/decimal arithmetic, or changes to the external measurement JSON/CSV
shape.
- A general expression evaluator or constant folder for declarations.
- Changes to historical language specifications or to the existing meaning of
multiplication-only unit declarations.
- Unrelated editor, desktop, CLI, rendering, and data-pipeline work.
- Prior-release residuals, release publication, package version changes,
deployment, and platform certification.

## Sprint Sequence

Continue after V0.18 Sprint 114, beginning with Sprint 115. Planning may proceed
independently of V0.18 closeout, but implementation beyond the V0.19 contract
gate depends on the V0.18 closeout disposition being recorded and Sprint 115
acceptance.

### Sprint 115: Language Contract and Affine Model Qualification

Architect-prepared Sprint 115 documentation package.

- Convert the approved product decisions into executable syntax, typing,
evaluation, rendering, and diagnostic contracts for both feature streams.
- Define affine declaration precedence and the accepted unit-expression
forms. Record how `+` and `-` produce scale and offset while preserving all
existing multiplication, division, and exponentiation behavior.
- Formalize canonical physical conversion $p = v \times scale + offset$,
inverse conversion, affine composition, aliasing, imports, finite-number
rules, and effective-scale validation.
- Define the affine operation matrix for conversion, comparison, subtraction,
addition, multiplication, division, powers, aggregates, unary operations,
charts, scalar display, and external data.
- Define `showTable` parsing, Boolean typing, environment scope, evaluation
timing, omitted/default behavior, duplicate-option behavior, and exact output
omission semantics.
- Derive the canonical Celsius and Fahrenheit library declarations from the
approved `0 C = 32 F = 273.15 K` invariant. This is an engineering derivation,
not a new product decision.
- Establish golden fixtures for conversion, composition, round trips,
subtraction, rejected operations, sum/mean exceptions, PI/E declarations,
and omitted/false/true/dynamic chart options.
- Verify that the existing external measurement shape and report contracts
remain sufficient for affine values and record any required compatibility
change as a blocking contract decision.

### Sprint 116: Chart AST, Parsing, Checking, and Evaluation (depends on Sprint 115)

Architect-prepared Sprint 116 documentation package.

- Extend the chart option AST in `src/ast/types.ts` to retain a `showTable`
expression and source location.
- Extend `parseVisualization` in `src/parser/parseStatements.ts` to parse the
option in all chart blocks and diagnose malformed or duplicate options.
- Extend `checkChart` in `src/typechecker/checkDocument.ts` to require a
Boolean result, preserve normal expression diagnostics, and apply the
omitted `false` default.
- Evaluate the approved expression in the chart declaration's normal
environment and propagate the result through the chart emission used by all
renderers.
- Add an explicit visibility field to the shared chart view model and pass it
through `src/renderer/chartModel.ts` without duplicating expression logic in
renderers.
- Add parser, checker, evaluator, formatter, and model tests for omitted,
literal true, literal false, identifiers, computed Boolean expressions,
invalid values, and duplicate options.
- Leave table rendering changes for Sprint 119 after the shared contract and
chart model propagation are accepted.

### Sprint 117: Affine Declarations and Unit Metadata (depends on Sprint 115)

Architect-prepared Sprint 117 documentation package.

- Extend unit metadata in `src/typechecker/dimensionTypes.ts` to retain finite
positive scale and finite offset without changing dimension identity rules.
- Extend `resolveUnitExpression` in `src/typechecker/checkDocument.ts` to
resolve compatible affine addition/subtraction and compose unit metadata.
- Resolve built-in `PI` and `E` statically only in unit declarations, using the
same values as the runtime standard library. Do not constant-fold arbitrary
identifiers or execute functions.
- Preserve all existing linear declaration behavior, aliases, imports,
exports, module identity, dimension vectors, and source diagnostics.
- Validate affine composition, cycles, incompatible operands, zero or negative
scales, non-finite offsets/scales, and unsupported terms.
- Carry affine metadata through the unit registry and imported declarations.
- Add focused parser, checker, registry, import/export, and diagnostic tests.
This sprint establishes affine declaration semantics but does not broaden
measurement operations yet.

### Sprint 118: Affine Measurement Runtime, Charts, and SI Library (depends on Sprint 117)

Architect-prepared Sprint 118 documentation package.

- Update measurement conversion and arithmetic so attachment, `in`, equality,
ordering, subtraction, scalar display, and supported aggregate operations use
one scale/offset conversion model.
- Reject direct affine addition and unsupported multiplication, division, and
powers. Preserve all existing linear measurement behavior.
- Implement affine subtraction with the left display-unit rule and source
accurate diagnostics for unsupported operations.
- Implement `sum` and `mean` through physical aggregation, with conversion of
the result to the first element's display unit. Implement `min`, `max`,
`abs`, and `round` under the approved affine rules.
- Update `normalizeChartMeasurements` and `normalizeChartValue` so mixed
compatible affine values compare and normalize physically while retaining the
selected display unit and existing axis/series labeling.
- Add `celsius`, `fahrenheit`, `degC`, and `degF` to `libraries/si.amx`, using
the declarations derived in Sprint 115.
- Verify conventional conversions, round trips, mixed-unit subtraction,
rejected affine operations, aggregates, table values, chart values, imports,
and the unchanged external measurement shape.

### Sprint 119: Rendering, Editors, Specification, and Migration (depends on Sprints 116 and 118)

Architect-prepared Sprint 119 documentation package.

- Update `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, and
`src/renderer/reportDocx.ts` to omit chart table output when the shared
resolved `showTable` value is false.
- Preserve the existing table model, contents, headings, null behavior, and
measurement display when `showTable` resolves to true.
- Update VS Code TextMate grammar/highlighting behavior and tests for the new
chart option and affine operators in declaration expressions.
- Update shared desktop editor facts, highlighting, diagnostics, formatting,
and applicable UI tests for the same syntax. Preserve existing parser-proven
source ranges.
- Add `docs/language-spec-v0.19.md` as an additive contract and update relevant
README navigation.
- Update `examples/07_Tables_Charts_and_Named_Outputs.amx` with omitted,
explicit true/false, and expression-controlled examples.
- Update `examples/05_Measurements_and_Units.amx` with the SI temperature
units, PI/E unit declarations, conversions, subtraction, aggregates, and
representative invalid operations.
- Add focused HTML, PDF, DOCX, formatter, editor, and documentation/example
regressions. Include the migration note that omitted `showTable` now hides the
table.

### Sprint 120: Integrated Acceptance and V0.19 Closeout (depends on Sprints 115-119)

Architect-prepared Sprint 120 documentation package.

- Verify the complete chart path from parsing and checking through expression
evaluation, shared chart-model construction, interactive output, PDF, and
DOCX.
- Render the updated chart example and confirm omitted/false tables are absent,
while true and dynamic expressions can produce the existing table.
- Verify conventional affine conversions, round trips, compatible-unit chart
normalization, left-unit subtraction, aggregate rules, and rejected affine
operations.
- Verify PI/E declaration resolution, SI temperature imports and aliases,
formatter stability, and VS Code and desktop authoring behavior.
- Run the focused root suite, broader regression suite, root build, VS Code
extension tests, desktop typecheck, and applicable desktop UI tests.
- Record exact commands, results, unavailable checks, performance/resource
observations where relevant, accepted residuals, and closeout disposition.
Closeout authorizes no release, publication, package/version change,
deployment, or platform certification.

## Relevant Files and Surfaces

- `planning/ideas/features-V19.md` — V0.19 feature intake.
- `planning/plan-openamxV18MasterSprintPlan.md` — preceding master-plan
structure and Sprint 114 entry point.
- `planning/decisions.md` — V0.19 product and language-contract decisions.
- `src/ast/types.ts` — chart declaration and option nodes.
- `src/parser/parseStatements.ts` — `parseVisualization`, chart options, and
unit declaration expressions.
- `src/typechecker/checkDocument.ts` — `resolveUnitExpression`, unit registry
construction, and `checkChart`.
- `src/typechecker/dimensionTypes.ts` — canonical dimension and unit metadata.
- `src/runtime/environment.ts` — chart emissions and runtime metadata.
- `src/runtime/evaluateExpression.ts` — conversion, arithmetic, `sum`/`mean`
paths, and `normalizeChartMeasurements`/`normalizeChartValue`.
- `src/runtime/measurement.ts` — measurement and composed-unit helpers.
- `src/runtime/standardLibrary.ts` — PI/E definitions and aggregate/math
functions.
- `src/renderer/chartModel.ts` — shared chart view and table model.
- `src/renderer/renderHtml.ts` — interactive chart and HTML table output.
- `src/renderer/reportPdf.ts` and `src/renderer/reportDocx.ts` — static chart
and table output.
- `libraries/si.amx` — Kelvin, Celsius, Fahrenheit, and aliases.
- `vscode-extension/amx.tmGrammar.json` and `vscode-extension/src/test/` — VS
Code syntax and provider coverage.
- `src/editor/highlighting.ts`, `desktop-app/src/mainview/CodeEditor.vue`, and
`desktop-app/tests/ui/` — desktop parser-proven highlighting and UI coverage.
- `tests/chartModel.test.ts`, `tests/dimensions.test.ts`,
`tests/parser.test.ts`, `tests/evaluator.test.ts`, `tests/formatter.test.ts`,
`tests/editor.test.ts`, `tests/renderer.test.ts`,
`tests/reportPresentation.test.ts`, `tests/reportPdf.test.ts`, and
`tests/reportDocx.test.ts` — focused V0.19 regressions.
- `examples/05_Measurements_and_Units.amx` and
`examples/07_Tables_Charts_and_Named_Outputs.amx` — runnable V0.19 examples.
- `docs/language-spec-v0.19.md` and `README.md` — additive contract and
navigation.

## Verification

1. Sprint 115 records the complete unit-expression grammar, affine operation
matrix, golden conversions, derived SI declarations, chart-option contract,
diagnostic set, and migration behavior before broad implementation.
2. Focused root suite:
`bun test tests/chartModel.test.ts tests/dimensions.test.ts tests/parser.test.ts tests/evaluator.test.ts tests/formatter.test.ts tests/editor.test.ts tests/renderer.test.ts tests/reportPresentation.test.ts tests/reportPdf.test.ts tests/reportDocx.test.ts`.
3. Root build: `bun run build`; verify generated browser runtime artifacts are
produced by their source generator and are not hand-edited.
4. In `vscode-extension`, run the configured extension test command. In
`desktop-app`, run the configured typecheck and applicable editor UI test.
5. Render the updated examples and inspect interactive HTML, PDF, and DOCX for
omitted/false/true/dynamic `showTable` behavior.
6. Verify $0\,C = 32\,F = 273.15\,K$, conversion round trips,
`20 C - 10 C = 10 C`, direct affine addition rejection, and
`sum([10 C, 20 C]) = 303.15 C` under physical aggregation.
7. Verify PI/E unit declarations, SI imports, affine aliases, chart
normalization, output unit labels, editor highlighting, formatting, and
source-local diagnostics.
8. Run the broader root regression gate at closeout and report skipped,
blocked, unavailable, or failing checks explicitly rather than treating them
as passing.
