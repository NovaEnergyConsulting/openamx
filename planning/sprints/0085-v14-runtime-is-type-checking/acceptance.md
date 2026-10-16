# Sprint 085 Acceptance Criteria

Sprint 085 is complete when `value is TargetType` is implemented according
to the accepted Sprint 084 contract, all applicable fixtures have direct
focused evidence, and existing behavior on affected core surfaces remains
covered. Sprint 085 does not implement the rest of V0.14 or authorize release
or publication.

## Grammar, Parsing, and Target Resolution

- The AST and parser represent `is` as a predicate with a type-reference
  target, not as a comparison against a runtime value expression.
- The target grammar is the accepted existing simple type name followed by
  ordered `[]`/`?` suffixes; qualified type names are not introduced.
- `is` occupies the existing comparison tier: arithmetic and Measurement
  conversion bind more tightly; `and`, `or`, and conditional expressions
  bind less tightly.
- Same-tier operators, including `is`, are left-associative. The fixtures
  `IS-PREC-01` and `IS-CHAIN-01` establish the parse grouping and ordinary
  type-checking outcome; there is no special comparison-chain construct or
  diagnostic.
- Type targets obey existing source order and import visibility.
  `IS-TARGET-IMPORT-01` succeeds; unknown, non-type, and forward references
  produce their approved diagnostics.
- Malformed target and suffix cases use the exact approved diagnostics:
  - `IS-SYNTAX-01`: `AMX3006`, `Expected target type after 'is'`.
  - `IS-SYNTAX-SUFFIX-01`: `AMX3006`,
    `Invalid type suffix in 'is' target`.
  - Unknown/invisible/non-type/forward references: `AMX3001`,
    `Unknown type '<name>'`, with the fixture's exact name.
- Source locations match the accepted Sprint 084 fixture ranges against the
  complete original document, including UTF-16 columns and LF/CRLF mapping.

## Static and Runtime Semantics

- Every valid `is` expression has Boolean type. A valid but nonmatching
  runtime value returns `false`, without throwing a runtime type error or
  producing a diagnostic.
- `IS-VALID-01` produces every approved binding:
  `primitiveMatch=true`, `primitiveMismatch=false`, `recordMatch=true`,
  `missingRequiredField=false`, `nullableNull=true`,
  `nonNullableNull=false`, `absentFieldMatch=true`,
  `presentNullMatches=true`, `allNumbers=true`, `emptyAnyList=true`,
  `nestedListMismatch=false`, `enumMember=true`, `enumNonMember=false`,
  `enumOverlap=true`, `nestedRecordMismatch=false`,
  `measurementMatch=true`, `measurementMismatch=false`,
  `dimensionlessMatches=true`, and
  `numberDoesNotMatchDimensionless=false`.
- Structural record matching recursively checks all required target fields,
  accepts extra value fields, permits absent optional target fields, and
  checks the declared type of present fields (including null only where the
  target field type is nullable).
- List matching recursively checks every element and nested list. An empty
  list matches any well-formed target list element type.
- Enum matching uses the underlying primitive and target enum member
  membership. A shared value can match either enum; no nominal runtime enum
  identity is added.
- Measurement matching compares physical dimension vectors independent of
  unit scale/name. A well-formed incompatible dimension returns `false`.
  A Number does not match an empty-vector Measurement target.
- The `IS-NARROW-01` fixture retains the approved `AMX3002`,
  `Expected String, got String?` failure inside the true branch. No
  flow-sensitive narrowing is introduced.

## Regression, Scope, and Evidence

- Existing parser, type-checker, evaluator, module visibility, record/enum,
  optional/list, Measurement, and diagnostic-location behavior remains
  unchanged except for the approved `is` addition.
- Focused tests cover all applicable Sprint 084 `IS-*` fixtures, including
  exact parse grouping, exact diagnostic IDs/messages, runtime values, and
  source locations. Test results distinguish a valid false result from a
  failure.
- The core build succeeds. Exact commands, environment, counts/results,
  initial failures/retries, changed files, and residuals are recorded in
  `builder-evidence.md`.
- No math/text/format implementation, editor/client integration, V0.14
  specification/example publication, unrelated cleanup, package/version
  change, release, or publication occurs.
- A separate Lead Developer/product-owner records the Sprint 085
  implementation disposition. Builder recommendation alone does not
  establish sprint acceptance or authorize Sprint 086.
