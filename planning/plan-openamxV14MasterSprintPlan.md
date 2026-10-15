# Plan: OpenAMX V0.14 Core Language and Standard Library

Confirmed planning scope. This plan defines required behavior, not implemented
or verified functionality. V0.14 focuses on runtime type checking with `is`
and expansion of the AMX standard library, as described in the
[language feature ideas](./ideas/amx-language-features-3.md). Unrelated
features and version carryovers are excluded.

Continue sprint numbering after V0.13 Sprint 083, beginning with Sprint 084.
The V0.13 master plan and closeout establish Sprint 083 as the latest sprint;
`planning/STATUS.json` still lists Sprint 067 and is not changed by this plan.
Publishing this plan does not authorize feature implementation, release, or
publication.

## Recommended Approach

- Begin with a language contract and acceptance-fixture sprint. Lock `is`
  grammar and precedence, target-type resolution, runtime behavior, diagnostics,
  the numeric format-pattern subset, and requirement-to-test coverage before
  implementation.
- Implement `is` as a runtime Boolean predicate using the existing type
  declarations, Measurement dimension metadata, and enum values. Structural
  matching permits extra record fields and recursively checks required target
  fields and collection elements. A nonconforming value returns `false`;
  invalid or unknown target types receive diagnostics.
- Extend existing standard-library evaluation and Measurement support rather
  than creating a parallel math or text subsystem. Preserve established
  dimension compatibility, unit conversion, and result-unit behavior.
- Define mathematical domain and finite-result errors explicitly. Do not
  silently return `NaN`, infinity, or success-shaped fallbacks.
- Keep `format` bounded to the approved numeric Excel/LibreOffice-style
  pattern subset and default locale, with stable offline behavior.
- Update the shared language tooling and both editor clients, specifications,
  examples, and tests. Preserve existing syntax, type checking, diagnostics,
  editor behavior, and runtime behavior outside the approved additions.
- If implementation feasibility requires changing a confirmed behavior, stop
  for a product decision rather than silently reducing the contract.

## Confirmed Feature Scope

### Runtime `is` Type Checking

- Support `value is TargetType` as an expression returning a Boolean. The
  target is an AMX type reference, not a runtime value.
- Check primitive, record, enum, list, optional, and dimension/Measurement
  types. Unknown or invalid target types produce a useful diagnostic.
- A valid target that does not match the runtime value returns `false`; it
  does not raise a runtime type error.
- Record matching is structural. Every non-optional target field must be
  present and recursively conform to its target type. Additional value fields
  are allowed, and optional target fields may be absent.
- Recursively check nested records and every list element. An empty list
  matches any target list element type.
- A `null` value matches an optional target type, such as `String?`, and does
  not match its non-optional underlying type.
- Enums remain represented by their V0.12 underlying primitive values.
  `value is Status` checks whether the value equals one of `Status`'s declared
  member values. If two enums share a primitive value, that value may match
  either enum's membership check; `is` does not introduce nominal enum
  identity.
- Measurement checks compare physical dimension vectors. Equivalent
  dimensions match regardless of unit scale.
- `is` is a runtime predicate only. Do not add flow-sensitive type narrowing
  to conditional branches in V0.14.

### Mathematical Functions and Constants

- Add `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`,
  `asinh`, `acosh`, `atanh`, `ln`, `log`, and `exp`.
- Trigonometric inputs and inverse-trigonometric outputs use radians.
  `ln` is the natural logarithm; `log` is base 10.
- These functions accept Numbers and dimensionless Measurements and return
  unitless Numbers. Dimensioned Measurements are rejected. V0.14 adds no angle
  dimension, degree/radian units, or angle-unit conversion.
- Add the numeric constants `PI` and `E`.
- Invalid mathematical domains and non-finite results produce explicit AMX
  diagnostics. Preserve existing `sqrt` domain behavior.
- Extend functions that currently accept a Number or list of Numbers to
  support Measurement values or lists of Measurements where meaningful.
  Measurements combined in one operation must have compatible dimensions;
  incompatible dimensions are rejected.
- Preserve existing Measurement behavior: compatible units may be converted;
  aggregate results use the first Measurement's unit, while `min` and `max`
  return the selected Measurement in its original unit. Existing dimension-
  preserving and dimension-transforming functions retain their established
  semantics.

### Text and Numeric Formatting Functions

- Add `len`, `trim`, `left`, `right`, and `format`.
- `len` accepts strings and lists. It counts Unicode code points in a string
  and elements in a list.
- `trim(text)` removes surrounding whitespace.
- `left(text, count?)` and `right(text, count?)` return up to the requested
  number of Unicode code points from the beginning or end of the string.
  `count` defaults to `1`; negative and non-integer counts are errors.
- `format(value, pattern, locale?)` formats a Number or Measurement using
  Excel/LibreOffice-style numeric patterns. V0.14 guarantees decimal
  precision, grouping, percent, currency, and negative-value formatting.
  Defer date/time and text patterns, colors, and conditional sections.
- `locale` is optional and defaults to fixed `en-US`. Formatting a
  Measurement formats its numeric value and appends its displayed unit.
- Invalid or unsupported patterns and locale values must be surfaced
  explicitly; the contract sprint locks precise syntax, diagnostics, and
  acceptance cases for the supported subset.

### Supporting Work and Explicit Exclusions

- Update the parser, AST, type checker, runtime, formatter, and related
  standard-library/type metadata as required by the confirmed language
  behavior.
- Update both the VS Code extension and desktop app authoring support,
  including syntax highlighting and other existing language services affected
  by the new operator, constants, or functions.
- Update the language specification and relevant editor help; add runnable
  examples and focused tests for both feature families.
- Exclude flow-sensitive type narrowing, nominal runtime enum tagging, angle
  units or degree-based trig, non-numeric `format` patterns, unrelated
  language/reporting/desktop features, and release engineering.
- V0.14 closeout records evidence and residuals; it does not itself authorize
  release or publication.

## Sprint Sequence

### Sprint 084: V0.14 Language Contract and Acceptance Fixtures

- Translate the confirmed scope into valid/invalid AMX examples, a grammar
  outline, a diagnostic matrix, and requirement-to-test fixtures.
- Lock `is` precedence and syntax, type-reference resolution, structural
  record rules, enum membership semantics, optional/null behavior, empty-list
  behavior, Measurement dimension matching, and source locations.
- Lock mathematical signatures, radians, `ln`/`log` bases, dimensional
  Measurement restrictions, domain errors, finite-result errors, and constant
  values.
- Lock text signatures, Unicode code-point behavior, whitespace behavior,
  `left`/`right` count validation, supported numeric pattern syntax, locale
  handling, Measurement display, and unsupported-pattern diagnostics.
- Any proposed change that weakens or alters the confirmed contract requires
  a product decision.

### Sprint 085: Runtime `is` Type Checking (depends on Sprint 084)

- Extend the AST, parser, type checker, and runtime for `value is TargetType`.
- Resolve supported target types using existing declarations and runtime
  metadata; issue source-located diagnostics for invalid target types.
- Implement Boolean results for primitive, structural record, enum,
  collection, optional, and Measurement checks as approved.
- Cover extra/missing record fields, nested values, optional fields and null,
  overlapping enum values, empty and non-empty lists, dimension-compatible
  Measurements with different scales, incompatible values, and runtime
  predicate behavior without static narrowing.

### Sprint 086: Mathematical Standard Library (depends on Sprint 085)

- Add the approved constants and trigonometric, hyperbolic, logarithmic, and
  exponential functions to the existing standard library and type checking.
- Extend Number-accepting and list-of-Number functions to Measurements where
  meaningful, preserving existing compatible-unit conversion and
  result-unit semantics.
- Validate dimensions, domains, non-finite results, argument counts, and
  diagnostics. Cover unitless versus dimensioned Measurements and radians.
- Regression-test existing standard-library and Measurement behavior.

### Sprint 087: Text and Numeric Formatting Functions (depends on Sprint 086)

- Add `len`, `trim`, `left`, and `right` with the approved string/list,
  whitespace, Unicode, count, and error behavior.
- Add numeric `format` with the approved Excel/LibreOffice-style numeric
  subset, deterministic default locale, optional locale argument, and
  Measurement unit suffix.
- Test valid formats, invalid/unsupported patterns and locales, boundary
  counts, empty strings/lists, and representative Unicode text.

### Sprint 088: Editor, Examples, and Documentation Integration (depends on Sprints 085, 086, and 087)

- Update shared editor services and both editor clients for the `is` operator,
  new constants, and new functions. Preserve existing formatting, diagnostics,
  completion, symbols/navigation, and supported language analysis.
- Ensure syntax highlighting is updated in both the VS Code extension and
  desktop app.
- Publish the V0.14 language specification and relevant editor help.
- Add runnable examples that demonstrate runtime type checks, mathematical
  functions and Measurement behavior, and text/numeric formatting.
- Verify examples through analysis and execution; verify formatter
  idempotence and useful diagnostics/source ranges.

### Sprint 089: Integrated Acceptance and V0.14 Closeout (depends on Sprint 088)

- Complete cross-surface language and regression acceptance across the core
  runtime, VS Code extension, and desktop app.
- Verify the approved type-checking matrix, library behavior, Measurement
  conversions, output formatting, diagnostics, and offline behavior.
- Run focused checks followed by the existing root, extension, and desktop
  validation workflows. Record exact commands, results, unavailable checks,
  and residuals without weakening existing assertions or changing unrelated
  behavior.
- Closeout adds no product scope and does not itself authorize release or
  publication.

Sprint 084 is the shared contract gate. Sprints 085–087 are deliberately
sequenced because they touch shared language analysis, runtime, and
standard-library surfaces. Sprint 088 depends on all three feature increments;
Sprint 089 depends on the integrated editor, examples, and documentation work.

## Relevant Files

- Language implementation: [AST types](../src/ast/types.ts), [expression parser](../src/parser/parseExpression.ts), [type checker](../src/typechecker/checkDocument.ts), [declaration registry](../src/typechecker/declarationRegistry.ts), [expression evaluator](../src/runtime/evaluateExpression.ts), [standard library](../src/runtime/standardLibrary.ts), and [Measurement runtime](../src/runtime/measurement.ts).
- Shared editor services under `src/editor/`.
- VS Code syntax grammar, providers, and tests under `vscode-extension/`.
- Desktop editor authoring support and tests under `desktop-app/src/` and `desktop-app/tests/`.
- Existing parser, evaluator, Measurement, and editor tests under `tests/`, plus focused V0.14 acceptance tests.
- New [V0.14 language specification](../docs/language-spec-v0.14.md), runnable examples under `examples/`, and relevant editor help.

## Verification

- Verify each confirmed behavior against the Sprint 084 fixtures, including
  valid and invalid inputs and source-located diagnostics.
- Verify existing core-language and Measurement regressions remain unchanged;
  explicitly test numeric and Measurement result units and math domain failures.
- Verify editor syntax highlighting and authoring behavior in both VS Code and
  desktop app workflows.
- Verify examples parse and execute, formatting remains idempotent, and
  unsupported numeric patterns fail explicitly.
- Run focused tests first, then the existing root, extension, and desktop
  checks during Sprint 089. Report failures and unavailable platform checks
  separately; do not infer a pass from an unavailable check.
