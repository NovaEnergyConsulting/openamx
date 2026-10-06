# Plan: OpenAMX V0.9 Core Language Features

Approved planning scope on 2026-10-06. Deliver all four feature groups in [the language ideas](ideas/amx-language-features.md): string interpolation, multiline record literals, 1-based list access/mutation, and first-class dimensions, units, and measurements. Extend the existing AST, parsing, checking, runtime, data/reporting, and both editor integrations consistently. Do not add unrelated desktop, extension, or release-engineering features.

The authoritative companion is [the V0.9 language and compatibility contract](../docs/language-spec-v0.9.md). These documents describe required behavior, not implemented or verified functionality. Detailed requirements, blueprint, acceptance, and handoff sprint packs are prepared later, before their respective sprints, using the [existing template](sprints/0000-sprint-template/). Publication of this plan does not authorize language implementation.

Continue sprint numbering at 051 and organize the work into eight sprints, with no fixed sprint/date budget.

## Recommended Approach

- Define executable positive/negative examples and cross-surface contracts before implementation. Reuse existing parsing, diagnostics, module, input/output, reporting, and editor infrastructure.
- Run static checking for every document/module, including untyped documents and non-file-backed execution paths. Remove the historical conditional-checking exemption consistently.
- Reject record-literal `:` rather than deprecating it. Constructor fields use `=`; type declaration fields and other type annotations retain colons.
- Migrate repository-owned positive samples/tests to current valid syntax and types. Preserve negative tests as rejection tests; do not delete failing behavior or weaken checking merely to obtain a green suite.
- Document string escapes as an intentional compatibility change from the current largely literal treatment of backslashes.
- Provide migration documentation, not an editor migration action. Normal formatting requires valid syntax and does not silently repair rejected records.
- Retain valid prior behavior except the explicitly agreed strict-checking, string-escape, and record-delimiter changes. Preserve pure functions, immutable imports, executable-fence boundaries, final-environment narrative interpolation, show-time snapshots, and atomic export behavior.
- Represent dimensional metadata consistently. Separate canonical arithmetic values from chosen display units without prematurely prescribing the exact runtime structure.
- Require each feature slice to include its AST/parser/checker/runtime/editor handling rather than leaving editor support to an unbounded cleanup stage.

## Confirmed Feature Scope

### Strings

- Support full AMX expressions inside `${...}` in double-quoted strings. Single-quoted strings do not interpolate.
- Implicit text conversion accepts String, Number, Boolean, null, and measurements; lists and records are not implicitly stringified.
- Both quote styles decode quote, backslash, newline, carriage return, tab, and literal interpolation-opening escapes. Include escaped single quotes; unknown escapes are errors.
- Raw strings remain single-line. Scalar text is deterministic and locale-independent: `true`/`false`, `null`, ordinary Number text, and `value unit` measurement text.
- Preserve the independent existing narrative-interpolation contract.

### Records

- Constructor fields use `field = value`. Existing `field: value` literals are syntax errors; no deprecation warning or migration action is included.
- Multiline literals require commas between fields and allow a trailing comma.
- Allow nested multiline records, lists, and parenthesized expressions. Type declaration fields retain `field: Type`.
- Preserve field validation, optional/default fields, duplicate/unknown-field errors, and field access.

### Lists

- Reads use 1-based indexes, including expression-computed indexes, and preserve element types and valid index/field chaining.
- `add value to list` appends. `add value to list at index` inserts before that position, permitting `length + 1` as append.
- `remove count from list at index` removes consecutive elements from the specified starting position.
- Without `at`, removal removes exactly the last element regardless of the supplied count. Evaluate and validate the count as a positive integer; only its magnitude is ignored. This intentional rule must be documented and directly tested.
- Indexes/counts must be positive integers. Invalid positions, types, fractions, non-finite values, overrun, empty-list removal, and invalid insertion produce errors.
- Check invalid operations statically where provable, otherwise at runtime. Validate before mutation; failure must not partially change a list.
- Mutation changes the shared list object; local aliases observe its changed contents.
- `add`/`remove` are statements targeting named list variables, not arbitrary field/index expressions or expression-returning calls.
- Preserve immutable imported values, including through aliases and nested lists, and existing pure-function contracts.
- Permit local-list mutation in statement-form loops. Iterate over a snapshot of original elements when the live list changes.
- Indexed replacement, slicing, and new loop forms are excluded.

### Dimensions, Units, and Measurements

- Deliver a complete linear/scaled measurement system with explicit conversion. Defer offset/affine units such as Celsius/Fahrenheit.
- Base/derived declarations follow the ideas file's `dimension` and `unit` forms. Derived dimension identity is structural: matching vectors over the same base identities are interchangeable.
- Dimensions/units support explicit module exports/imports. Declarations are module-level, source-ordered, and cannot reference later definitions. Reject collisions and loop/function-local declarations.
- Permit exactly one independent base unit per base dimension; alternatives require explicit scale relationships.
- Provide an optional project-local SI AMX library with SI base dimensions/units and common scales, aliases, and derived units. Use existing relative imports; do not add a package resolver, global standard names, or imperial inventory.
- No automatic aliases: `m` must be explicitly declared/imported; declaring `meter` does not introduce `m`.
- Attach named units to numeric literals, identifiers, or parenthesized expressions: `10 meter`, `value meter`, `(a + b) meter`. Arbitrary juxtaposition is not multiplication.
- Conversion syntax is `measurement in unit`, returning a measurement, not a Number.
- Addition/subtraction retain the left operand's unit; multiplication/division compose units; `in` selects a display unit. Compatible comparisons use normalized physical values.
- Allow integer literal dimensional powers, including negative and zero powers, and `sqrt` when resulting dimension exponents remain integers.
- `sum`/`mean` use the first element's unit; `min`/`max` return the selected element with its unit; `abs` preserves units; `round` uses the current display unit.
- A statically typed empty measurement list sums to zero in its dimension's canonical base-unit expression. Preserve empty `min`/`max`/`mean` errors.
- Dimension cancellation returns ordinary Number with scale conversion applied correctly.
- Number/measurement mixing supports multiplication/division, not addition/subtraction/comparison. Reject unsupported dimensional operations rather than dropping units.
- Use existing floating-point Number precision, positive finite unit scales, and explicit errors for division by zero/non-finite measurement results. No decimal/exact arithmetic system is added.
- Support measurements in typed functions, record fields/defaults, lists, nullables, assignments, narrative/report text, external data, tables, and charts.
- JSON measurement shape is `{ "value": 10, "unit": "meter" }`; CSV measurement cells use text such as `10 meter`. Bare external numbers do not silently acquire units.
- External unit strings allow visible unit names, multiplication/division, parentheses, and integer powers, not arbitrary AMX code. Compound measurements must round-trip without a declared name for every composed unit.
- Tables retain each cell's chosen unit. Charts normalize compatible values to the first non-null unit for the relevant axis/series and label it. Incompatible dimensions are errors; authors prepare values with `in` to select another display unit.

### Editor and Documentation Scope

- Extend VS Code and desktop formatting, coloring, and diagnostics.
- Update existing relevant completion, hover/type information, definitions, references, rename, outline/symbols, module analysis, and source ranges. Do not invent unrelated capabilities.
- Update related specifications, examples, optional libraries, and bundled help.
- Preserve executable-fence boundaries: narrative and inert fences must not acquire executable-language behavior.
- Cover invalid/incomplete editing states and LF/CRLF source locations.

## Current-Codebase Evidence

- The baseline product version is 0.8.0 and previous master plans continue through Sprint 050.
- Expression parsing uses a hand-written tokenizer/parser; string scanning lacks conventional escape decoding.
- Statement parsing is line-oriented with specialized multiline collection. General nested-expression collection needs investigation rather than record-specific string hacks.
- AST expressions/statements are explicit unions; checker, runtime, formatter, and editor walks need coordinated extension.
- Static checking currently activates conditionally. V0.9 deliberately replaces this policy and needs dedicated migration coverage.
- Checked types currently distinguish named, list, nullable, and null types; dimension vectors and module metadata need deliberate extension.
- Runtime pure-function frames and immutable-import semantics are constraints, not permissions to weaken.
- Desktop highlighting consumes shared AST-derived facts; VS Code also has a separate TextMate grammar. Validate both paths.
- Formatting currently parses executable content and otherwise largely preserves expression text. Preserve this contract for valid syntax.
- V0.5 reporting preserves final-environment narrative interpolation and immutable show-time snapshots. Shared list mutation and measurements must not corrupt these contracts.
- The [e-lang README](https://github.com/EngineersTools/e-lang/blob/HEAD/README.md) was reviewed for inspiration on structural vectors, declarations, unit composition, and conversions. Retain AMX's agreed syntax and runtime/display needs rather than copying e-lang's type erasure or operators.

## Steps

### Phase 1 - Language Contract and Compatibility

#### Sprint 051: V0.9 Language Contract and Cross-Surface Design (depends on nothing)

- Prepare the sprint requirements, blueprint, acceptance criteria, and handoff prompt using the existing template.
- Turn the approved business rules into executable grammar/precedence, compatibility, serialization, library, and diagnostic contracts.
- Audit AST consumers, checking call sites, module identity, immutable imports, snapshots, serialization, and both editor pipelines.
- Establish exact positive/negative examples, output fixtures, and migration acceptance cases.
- Complete the technical contract gate below before implementation.

### Phase 2 - Strict Checking, Records, Strings, and Lists

#### Sprint 052: Strict Static Checking, Multiline Records, and Migration (depends on Sprint 051)

- Remove conditional checking from document/module execution and analysis paths.
- Preserve inference for valid unannotated programs; migrate positive fixtures relying on invalid syntax/type use and retain rejection coverage.
- Implement multiline record/nested-expression collection and canonical `=` literals while preserving annotation colons.
- Update existing record examples/tests without touching unrelated pending user changes.
- Validate formatter idempotence, invalid-syntax diagnostics, source locations, and feature-specific editor handling.

#### Sprint 053: String Escapes and Expression Interpolation (depends on Sprint 052)

- Implement expression-aware interpolation, agreed escapes, nested delimiter handling, and accurate source locations.
- Preserve raw single-line strings while allowing escaped content and nested quotes/braces inside expressions.
- Wire feature-specific tooling and focused regressions.

#### Sprint 054: 1-Based List Access and Safe Shared Mutation (depends on Sprint 052)

- Implement postfix reads with preserved element types and chaining.
- Implement add/remove parsing, checking, and atomic runtime validation.
- Preserve aliases, import immutability, pure functions, and original-element loop snapshots.
- Verify view snapshot isolation and editor handling.
- This sprint does not require Sprint 053.

### Phase 3 - Dimensions and Measurements

#### Sprint 055: Dimension/Unit Declarations and Module Identity (depends on Sprint 052)

- Implement vectors, scales, declaration checking, and explicit imports/exports.
- Define canonical-unit consistency and reject undefined, conflicting, or invalid declarations/dependencies.
- Add the agreed optional SI library.
- Build registries before input inspection/loading without evaluating executable statements or introducing duplicate evaluation.
- This sprint does not require Sprints 053-054.

#### Sprint 056: Measurement Expressions, Arithmetic, and Conversion (depends on Sprint 055)

- Implement attachment, typing, arithmetic/comparison, powers/roots, cancellation, conversion, and compatible math functions.
- Preserve metadata through functions, records, lists, nullables, and assignments.
- Implement text display and feature-specific editor analysis.
- Coordinate measurement interpolation tests with Sprint 053 rather than duplicating formatting rules.

#### Sprint 057: Measurement Data and Reporting Integration (depends on Sprint 056)

- Implement JSON/CSV contracts, compound-unit round trips, and unit validation.
- Extend tables/charts and HTML/PDF/DOCX without dropping units or changing snapshot ordering.
- Verify output shapes, normalization, labels, and invalid-data diagnostics.
- Extend input/output inspection and desktop data-editor schemas, not only file-backed runtime loading.

### Phase 4 - Editor Parity and Integrated Acceptance

#### Sprint 058: Editor Parity, Documentation, and V0.9 Acceptance (depends on Sprints 053, 054, and 057)

- Complete cross-feature client behavior: formatting, colors, diagnostics, navigation, references, rename, outline, and completion.
- Update language documentation, help, examples, and compatibility/migration guidance.
- Run targeted feature tests followed by integrated root/extension/desktop validation.
- Record exact evidence and residuals using established planning conventions.

## Sprint 051 Technical Contract Gate

Business scope and compatibility choices are resolved. Before building, make these implementation contracts executable and reviewable:

- Specify unambiguous precedence and positive/negative cases for attachment, conversion, indexing, unary operators, and powers. Attachment forms a value; parentheses select arithmetic before conversion.
- Define stable qualified base-dimension identity across imports, positive finite scales, derived-unit normalization, and canonical compound-unit spelling.
- Finalize a finite SI inventory with exact exported names/aliases, rather than promising every prefix/derived unit.
- Encode aggregate/round/empty-sum rules; specify entirely null/empty chart presentation using existing view policies without fabricating units.
- Bound static constant checks to expressions provable without arbitrary execution; dynamic lengths require runtime validation.
- Allocate diagnostic codes using repository conventions and require meaningful source/data locations consistently across clients.
- Verify strict checking and fixture migration do not silently change valid behavior outside approved shifts.

These are design gates, not deferred feature scope or permission to weaken confirmed behavior.

## Relevant Files

- [Language ideas](ideas/amx-language-features.md) and [V0.9 contract](../docs/language-spec-v0.9.md).
- [AST types](../src/ast/types.ts), [expression parser](../src/parser/parseExpression.ts), [statement parser](../src/parser/parseStatements.ts), [loop parser](../src/parser/parseFor.ts), and [document parser](../src/parser/parseDocument.ts).
- [Type checker](../src/typechecker/checkDocument.ts), [diagnostics](../src/diagnostics/errors.ts), and all checking call sites.
- [Environment](../src/runtime/environment.ts), [expression/statement evaluator](../src/runtime/evaluateExpression.ts), [document evaluator](../src/runtime/evaluateDocument.ts), [module loader](../src/runtime/moduleLoader.ts), and [standard library](../src/runtime/standardLibrary.ts).
- [Input data](../src/runtime/inputData.ts), [output data](../src/runtime/outputData.ts), schema consumers, and desktop inspection.
- [Report preparation](../src/renderer/reportPreparation.ts), [HTML renderer](../src/renderer/renderHtml.ts), PDF/DOCX destinations and adapters.
- [Formatter](../src/formatter/formatAmx.ts), [shared editor analysis](../src/editor/), [VS Code providers](../vscode-extension/src/providers/), [TextMate grammar](../vscode-extension/amx.tmGrammar.json), and [desktop editor](../desktop-app/src/mainview/CodeEditor.vue), worker, and RPC integration.
- [Tests](../tests/), [examples](../examples/), [libraries](../libraries/), language documentation, and desktop bundled help.

## Verification

1. Assert exact decoded/interpolated values, types, dimensional vectors, scale conversions, display units, external shapes, and diagnostic locations/codes.
2. Cover positive/negative grammar with nested expressions, malformed delimiters, escapes, multiline records, and LF/CRLF.
3. Verify list boundaries, no partial mutation, alias visibility, validated-but-ignored no-at removal count, import protection, loop snapshots, and immutable emitted views.
4. Verify structural dimensions, module identity, unit scales, incompatible operations, negative/zero powers, roots, cancellation, and unit-aware functions.
5. Verify JSON/CSV round trips, nested JSON measurements, visible units, malformed data, and dimension mismatch.
6. Verify table/chart values and labels and snapshot isolation across HTML/PDF/DOCX.
7. Verify formatter idempotence/meaning preservation for valid code and rejection of invalid syntax.
8. Verify both clients on valid/incomplete code without coloring executable syntax in inert fences or narrative.
9. Preserve representative valid V0.1-V0.8 behavior except approved migration changes; no unchanged-legacy-document promise supersedes strict checking.
10. Use focused Bun tests, then the repository-owned suite and root `bun run build`; existing extension compile/test-compile/Development Host checks; desktop RPC, `typecheck`, `build:web`, and focused Playwright checks.
11. Record native desktop smoke evidence on available hosts and skipped/unavailable checks honestly. Successful process exits alone are insufficient.

Planning publication does not establish implementation, build, or test completion. Public release, installer certification, package publication, and unrelated V0.8 residuals are outside this language cycle.
