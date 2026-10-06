# OpenAMX V0.9 Language and Compatibility Contract

Approved planning contract on 2026-10-06. This describes required behavior, not implemented or verified functionality. V0.9 is a core-language cycle with the associated existing data, reporting, and editor integrations. The [master sprint plan](../planning/plan-openamxV09MasterSprintPlan.md) defines delivery sequencing; detailed sprint packs are prepared separately.

## 1. Scope and Compatibility

V0.9 must implement string expression interpolation, multiline record literals, 1-based list reads and mutation, and linear/scaled dimensions, units, measurements, and conversion.

Every document/module must be statically checked before evaluation, including untyped documents and direct/non-file-backed execution paths. Existing conditional-checking exemptions must not survive in CLI, module loading, desktop workers, or editor analysis.

Preserve valid existing language constructs and product behavior except these intentional changes:

- Record constructor fields use `=` exclusively. Old constructor colons are rejected.
- Backslashes in strings decode the agreed escapes. Old literal-backslash text may need escaping.
- Previously unchecked invalid syntax/types must be rejected. Positive repository fixtures must be modernized, while negative tests remain rejection tests.

Record type declarations, variable annotations, parameter annotations, and return annotations retain their existing colons. No deprecated-colon warning, automatic formatter repair, or editor migration action is required. Migration guidance must distinguish constructor delimiters from type annotations.

Preserve executable-fence rules, import containment, pure functions, immutable imports, show-time snapshots, final-environment narrative interpolation, export atomicity, and report identity/source-order rules. Do not introduce unrelated UI features or release engineering.

## 2. Strings

Double-quoted strings support `${expression}` using the full existing/new AMX expression grammar. Single-quoted strings do not interpolate. Expressions must be parsed and checked, not evaluated as host-language code.

Both quote styles decode escaped quote, backslash, newline, carriage return, tab, and literal interpolation opening. In source spelling these include `\"`, `\'`, `\\`, `\n`, `\r`, `\t`, and `\${`. Unknown escapes and incomplete strings/interpolations are errors.

Raw strings remain single-line; escaped newline characters may exist in their decoded value. String interpolation must correctly handle nested braces, nested expressions, and quoted strings inside the expression. Existing pure-expression restrictions continue to apply.

Implicit string interpolation accepts:

| Value | Text |
| --- | --- |
| String | Its decoded content |
| Number | Deterministic, locale-independent Number text |
| Boolean | `true` or `false` |
| null | `null` |
| Measurement | Numeric display value followed by its unit text |

Lists and records must not be implicitly stringified. No new general-purpose serialization function is implied by this feature.

```amx
let hello = "Hello"
let world = "World"
let greeting = "${hello} ${world}!"
let calculated = "Answer: ${1 + 2}"
let literal = "\${hello}"
```

Required results are `Hello World!`, `Answer: 3`, and the literal text `${hello}`. Existing narrative interpolation is not replaced by this new string syntax.

## 3. Records and Multiline Expressions

```amx
type SomeRecordType {
  stringProp: String
  numberProp: Number
  booleanProp: Boolean
}

let item = SomeRecordType {
  stringProp = "My String Value",
  numberProp = 42,
  booleanProp = true,
}
```

Require commas between constructor fields and allow a trailing comma. Permit line breaks between tokens and nested multiline records, lists, and parenthesized expressions. Preserve existing field validation, optional/default fields, duplicate/unknown-field errors, and field access.

The literal form `SomeRecordType { numberProp: 42 }` is invalid V0.9 syntax. Normal formatting must refuse invalid syntax, preserve meaning for valid syntax, and be idempotent. Indentation/braces inside strings must not be mistaken for record structure.

## 4. Lists

### Indexed Reads

Indexes are 1-based positive integers, not zero-based host array offsets. Reads return the statically known element type, including nullable/measurement element types.

```amx
let values: String[] = ["a", "b", "c", "d"]
let first = values[1]
let picker = 2
let picked = values[picker]
let computed = values[1 + 2]
```

Required results are `"a"`, `"b"`, and `"c"`. Support index/field chaining over valid receivers. Indexed replacement and slicing are not included.

### Mutation Statements

```amx
add "f" to values
add "e" to values at 5
remove 1 from values
remove 2 from values at 1
```

The successive list values are:

1. `["a", "b", "c", "d", "f"]`
2. `["a", "b", "c", "d", "e", "f"]`
3. `["a", "b", "c", "d", "e"]`
4. `["c", "d", "e"]`

These are statements targeting named list bindings, not list-returning expressions. No new general reassignment or field/index mutation syntax is included.

- Addition without `at` appends. With `at`, insert before that 1-based index; `length + 1` is valid append.
- Removal with `at` removes the count of consecutive elements starting at that index.
- Removal without `at` removes exactly one final element. Evaluate and validate the count as a positive integer, but ignore its magnitude. For example, `remove 3 from values` removes one element.
- Indexes and counts must be positive integers. Reject wrong types, zero, negatives, fractions, non-finite values, overrun, invalid insertion, and empty-list removal.
- Validate the entire operation before mutation. An error must not leave a partially changed list.
- Prove errors statically when safely possible; otherwise perform runtime validation.
- Mutation changes the shared list object. Local aliases observe its changed contents.
- Imported values remain immutable, including nested shared lists accessed through aliases. An alias must not bypass import protection.
- Local lists may be mutated in statement-form loops. Iteration visits a snapshot of the original elements, even if the live list is changed.
- Preserve pure-function constraints and report/view snapshots. Changing a live list must not change already emitted views.

## 5. Dimensions and Units

### Declarations

```amx
dimension Length
dimension Time
dimension Speed = Length / Time
dimension Acceleration = Length / Time ^ 2
dimension Area = Length ^ 2
dimension Volume = Length ^ 3

unit meter: Length
unit kilometer = 1000 * meter
unit minute: Time
unit hour = 60 * minute
unit meter_per_minute = meter / minute
unit kilometer_per_hour = kilometer / hour
unit square_meter = meter ^ 2
```

Declarations are module-level and source-ordered. References must resolve to earlier declarations or explicit imports; reject forward references, unknown names, collisions, and loop/function-local declarations.

Base dimensions have stable identity tied to their definition, preserved across re-exports/imports. Independently declared base dimensions do not merge merely because their names match. Derived dimensions are structurally equivalent when their normalized vectors match; for example Speed and Velocity derived from the same Length/Time bases are interchangeable.

Permit one independent base unit per base dimension. Other units of that dimension require an explicit relationship. Unit scales must be positive finite Numbers. Derived definitions support valid scaling, multiplication, division, parentheses, and integer literal powers.

Dimensions/units can be explicitly exported/imported through the existing module system. No implicit aliases or global standard names are created. The [ideas file](../planning/ideas/amx-language-features.md)'s `m` reference must be replaced by `meter` or backed by an explicit alias.

### Optional SI Library

Ship a finite documented SI library as project-local AMX files using existing relative imports. Include SI base dimensions/units and common scaled units, aliases, and derived units. Do not add a package resolver, global injection, imperial inventory, or offset/affine units.

Sprint 051 must publish the exact inventory before implementation; "SI support" is not a promise to supply every possible prefix or derived-unit name. Shared imported base identity and collision-free use are acceptance requirements.

## 6. Measurements and Conversion

Attach a named unit to a numeric literal, numeric identifier, or parenthesized numeric expression:

```amx
let distance: Length = 10 meter
let amount = 5
let other: Length = amount meter
let combined = (amount + 2) meter
let travel: Time = 2 minute
let speed: Speed = distance / travel
let converted = distance in kilometer
```

Do not treat arbitrary juxtaposition as multiplication. Compound suffixes are not part of source attachment grammar; use a declared compound unit or measurement arithmetic.

`measurement in unit` returns a measurement in the specified compatible unit, not a Number. The normalized physical value and dimension must not change.

| Operation | Required behavior |
| --- | --- |
| Addition/subtraction | Compatible vectors only; preserve left operand's display unit |
| Comparison/equality | Compatible measurements; compare normalized physical values |
| Multiplication/division | Compose dimension vectors and units; Number operands are allowed |
| Unary minus | Preserve dimension/unit |
| Integer literal powers | Allow positive, zero, and negative exponents |
| Dimension cancellation | Return ordinary Number with correct scale conversion |
| Incompatible additive/comparison mixing with Number | Error; no implicit unit attachment |
| Unsupported dimensional operations | Explicit error; never drop units silently |

Use existing floating-point Number precision, not a new exact/decimal system. Reject division by zero and non-finite measurement results.

Required examples include:

- `1 kilometer + 500 meter` is `1.5 kilometer`.
- `(1 kilometer + 500 meter) in meter` is `1500 meter`.
- `10 meter / 2 meter` is Number `5`.
- `1 kilometer / 500 meter` is Number `2`, not `0.002`.
- Measurements of Length and Time are incompatible for addition.

Support measurements consistently in function parameters/results, type inference, records/defaults, lists, nullable types, assignments, interpolation, and module exports.

### Existing Math Functions

- `sum`/`mean` normalize compatible elements to the first element's unit.
- `min`/`max` return the selected element with its unit after comparing physical values.
- `abs` preserves dimension/unit.
- `round` rounds the numeric display value in its current unit.
- `sqrt` accepts measurements only when all resulting dimension exponents remain integers and the numeric domain is valid.
- `pow` follows the dimensional integer-literal exponent rule. Existing ordinary Number operations retain their valid rules.
- A statically typed empty measurement list sums to zero in its dimension's canonical base-unit expression. Existing empty `min`/`max`/`mean` errors remain.
- Reject mixed incompatible dimensions and unsupported operations.

Sprint 051 must lock exact precedence without changing existing operator precedence/associativity incidentally. Attachment must form a measurement value; parentheses must unambiguously select arithmetic before conversion. Tests must cover attachment, powers, unary operators, indexing, conversion, and existing loop `in` syntax together.

## 7. External Data and Reports

JSON measurements use exactly a value/unit object:

```json
{"value":10,"unit":"meter"}
```

CSV measurement fields contain text such as `10 meter`. A bare external numeric value must not implicitly receive a unit.

Allow restricted external unit expressions, for example `meter / minute` or `meter ^ 2`, referencing only explicitly visible units with multiplication/division, parentheses, and integer powers. Never evaluate arbitrary AMX expressions from data. Canonical serialization must retain enough scale/unit information for compound measurements to round-trip.

Validate finite numeric values, unit visibility, dimension compatibility, malformed/unknown fields, and normal existing JSON/CSV schema constraints. Preserve existing aggregate/fail-fast diagnostic modes and data/source locations.

JSON support covers measurements nested within supported records/lists/nullables. CSV retains its existing flat-record-list structure, extending scalar fields to measurements rather than inventing nested CSV records.

Unit/dimension registries must be available before input inspection/loading and output schema inspection. Build this metadata without running arbitrary executable statements, evaluating a module twice, or duplicating input loading.

Tables display each measurement in its chosen unit. Charts normalize compatible measurement data to the first non-null unit for the relevant axis/series and identify the unit in the label. Incompatible dimensions are errors. Authors select another unit by preparing source values with `in`.

Preserve existing empty/null view rules; do not fabricate a unit for an entirely null/empty axis. Sprint 051 must record the exact presentation for those cases.

CLI output, narrative text, desktop runtime display, and HTML/PDF/DOCX reports must show meaningful measurement values rather than internal objects. Shared snapshots must retain measurement meaning without remaining mutable.

Desktop input/output schemas and existing data-editor inspection/validation must understand measurements. No unrelated data-editor redesign is authorized.

## 8. Editor Parity and Diagnostics

Both editor clients must support new syntax and symbols through their existing capabilities: formatting, colors, diagnostics, completion, type/hover information where already available, definitions, references, rename, outline/symbols, and module analysis.

VS Code TextMate grammar and desktop/shared AST-derived facts must agree about new keywords, unit/dimension names, measurement values, indexed expressions, record delimiters, interpolation text, and nested expression tokens.

Preserve original-document locations with LF and CRLF. Incomplete strings/records/interpolation must not color unrelated narrative/inert fences or falsely produce successful analysis.

Use structured repository-standard diagnostics with stable codes and meaningful source/data locations. Static checks must not execute arbitrary expressions to guess runtime lengths/values. Client errors must be explicit; invalid data cannot yield success-shaped results.

## 9. Acceptance and Exclusions

Acceptance requires verified exact results, type outcomes, source ranges, list mutations/snapshots, conversions, serialization shapes, chart labels, and formatter idempotence across the agreed surfaces. A successful build alone is not sufficient.

Use existing root Bun tests/build, extension Development Host coverage, and desktop RPC/typecheck/web-build/Playwright coverage. Record native smoke evidence on available hosts without claiming untested platforms.

Exclude offset units, decimal/exact arithmetic, imperial library coverage, new package resolution, indexed replacement/slicing, unrelated language features, unrelated editor/UI features, release publication, and an unrelated native installer matrix.

Detailed diagnostic allocation, runtime representation, finite library inventory, canonical unit spelling, precedence fixtures, and null-chart presentation are Sprint 051 technical design gates. They must not reopen confirmed scope or silently weaken this contract.
