# Sprint 051 Blueprint: V0.9 Language Contract and Cross-Surface Design

## Approach

1. Read the approved V0.9 contract, master plan, ideas, current planning records, repository instructions, and relevant implementation/test surfaces. Treat the contract as authoritative; list discrepancies without changing behavior.
2. Build an audit matrix across parsing/AST, checking entry points, runtime and modules, formatting, data and schemas, tables/charts/renderers, shared editor analysis, VS Code grammar/providers, desktop editor/worker/RPC, examples, tests, docs, and bundled help. For each surface record current owner/path, required V0.9 behavior, downstream sprint, and a concrete verification seam.
3. Resolve the expression contract. Publish a precedence/associativity table and parse/result examples for attachment, `in` conversion, indexing, unary operators, and powers, including parentheses, chained access, malformed forms, and existing loop `in`. Explicitly distinguish syntax grouping from runtime result.
4. Resolve dimension and unit contracts without prescribing unnecessary implementation internals. Specify qualified base identity through import/re-export, structural vector equivalence, scale and canonicalization rules, declaration visibility/order, and external compound-unit spelling/round trips.
5. Publish the finite SI library inventory as an explicit table of exported names, kinds, definitions/scales, aliases, and exclusions. Include examples proving relative imports and no implicit abbreviations. Flag any inventory choice requiring Lead Developer approval rather than treating a proposal as accepted.
6. Specify numeric aggregates/functions and empty/null presentation. Include typed empty measurement sum, existing empty aggregate errors, display-unit behavior, entirely null/empty chart/table cases, and cases that must not fabricate a unit.
7. Define static-versus-runtime validation boundaries and a diagnostic catalog. Map each invalid case to its stable diagnostic code, phase, location source (AMX span or external data path/record/field), and expected client-neutral result.
8. Create a conformance matrix of exact positive and negative examples with expected syntax/precedence, type, value/display unit, external shape, diagnostic, and source-location expectations. Include strict-checking migration cases that distinguish valid inferred programs from invalid legacy constructs and the three approved compatibility changes.
9. Review dependencies and sequencing against Sprints 052-058. Sprint 052 owns strict-checking/record migration; 053 strings; 054 lists; 055 dimension/unit declarations and module identity; 056 measurements; 057 data/reporting; 058 editor parity and integrated acceptance. Mark parallelizable work only where the master plan permits it.
10. Update the Sprint 051 requirements, blueprint, acceptance, and handoff prompt, plus `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`. Clearly label proposals, accepted decisions, and unresolved blockers; do not report implementation or tests as complete.

## Files to Update

- `planning/sprints/0051-v09-language-contract-cross-surface-design/requirements.md`
- `planning/sprints/0051-v09-language-contract-cross-surface-design/blueprint.md`
- `planning/sprints/0051-v09-language-contract-cross-surface-design/acceptance.md`
- `planning/sprints/0051-v09-language-contract-cross-surface-design/handoff-prompt.md`
- `planning/state.md`
- `planning/decisions.md`
- `planning/questions.md`

Do not edit feature implementation, existing conformance behavior, examples, or unrelated planning records in this sprint.

## Notes

- Store the finished contract and examples in the Sprint 051 artifacts or in an explicitly linked, reviewable contract artifact if the Lead Developer approves an additional file. Do not leave required semantics only in conversation notes.
- Use examples small enough to become tests in later implementation sprints. Expected results must be exact, not descriptions such as “works correctly.”
- A source audit is not an invitation to refactor. Record downstream owners and interfaces; leave code changes for the sprint assigned by the master plan.
- The Lead Developer reviewed and approved the exact contract, inventory, edge-case policies, diagnostics, migration matrix, and cross-surface handoff recorded below on 2026-10-06. This closes the Sprint 051 technical contract gate; implementation remains governed by the master-plan dependency order.

## Builder Contract Proposal (2026-10-06) — Approved by Lead Developer

This appendix is the reviewable technical contract proposal and source audit for Sprint 051. It turns the approved requirements and master plan into exact implementation rules. The Lead Developer approved this Builder Contract Proposal on 2026-10-06. Accordingly, the implementation details first specified here are approved Sprint 051 design decisions subordinate to `docs/language-spec-v0.9.md` and `planning/plan-openamxV09MasterSprintPlan.md`; they do not amend or supersede either authoritative scope document. No code, fixtures, examples, or user-facing language documentation were changed.

### 1. Expression Grammar and Precedence Proposal

Precedence is listed highest to lowest. The existing rows preserve the levels and associativity documented in `src/parser/parseExpression.ts`; postfix indexing and measurement operations are additions, not permission to reorder existing operators.

| Level | Form | Associativity / restriction |
|---:|---|---|
| 1 | Grouping `(expr)`, call `f(args)`, field `.name`, index `[expr]` | Calls are primary forms; field and index are left-to-right postfixes; arbitrary chained field/index access is allowed on a valid receiver. |
| 2 | Unit attachment `numeric-atom unitName` | Binds to the immediately preceding numeric literal, numeric identifier, or parenthesized numeric expression. It is not general juxtaposition or multiplication. |
| 3 | Prefix `-`, `not` | Existing highest prefix precedence is preserved; `-` binds tighter than power, as in the current parser. |
| 4 | `^` | Right-associative; a measurement exponent must be a signed integer literal. |
| 5 | `*`, `/`, `%` | Left-associative. |
| 6 | `+`, `-` | Left-associative. |
| 7 | `in unitName` conversion | Left-associative conversion operator, lower than arithmetic and higher than comparisons. Its right operand is one visible declared unit name, not an arbitrary AMX expression. |
| 8 | `==`, `!=`, `>`, `>=`, `<`, `<=` | Existing comparison level and behavior. |
| 9 | `and` | Existing level. |
| 10 | `or` | Existing level. |
| 11 | `if … then … else …` | Existing lowest-precedence conditional. |

`in` in a `for name in iterable { ... }` header remains loop syntax parsed by `parseFor.ts`, not conversion. Parentheses make a conversion inside the iterable explicit. Unit declarations may use compound expressions, but source attachment and conversion use a declared unit name; declare a compound unit before using it as a suffix/target.

| Source | Required parse/grouping | Exact outcome |
|---|---|---|
| `2 meter ^ 2` | `(2 meter) ^ 2` | Measurement with value `4`, dimension Length², display unit `meter ^ 2`. |
| `(2 ^ 2) meter` | `(2 ^ 2) meter` | Measurement `4 meter`. |
| `-2 meter` | `-(2 meter)` | Measurement `-2 meter`. |
| `-2 ^ 2` | `(-2) ^ 2` | Number `4` (existing unary/power rule). |
| `2 ^ 3 ^ 2` | `2 ^ (3 ^ 2)` | Number `512` (existing right associativity). |
| `1 + 2 meter` | `1 + (2 meter)` | Rejected: Number/measurement addition, `AMX3007`. |
| `(1 + 2) meter` | `(1 + 2) meter` | Measurement `3 meter`. |
| `1 kilometer + 500 meter` | `(1 kilometer) + (500 meter)` | Measurement `1.5 kilometer`; left display unit retained. |
| `(1 kilometer + 500 meter) in meter` | Convert the parenthesized sum | Measurement `1500 meter`. |
| `distance in kilometer` | Convert `distance` to the declared unit | Measurement value is physical value divided by kilometer scale; dimension unchanged. |
| `rows[1].distance[1]` | `((rows[1]).distance)[1]` | Valid only when each receiver has the corresponding record/list type; indices are 1-based. |
| `[10][1]` | Index the list literal | Number `10`. |
| `values[0]` where `values` is known literal `[10, 20]` | Index expression | Statically rejected as an out-of-range 1-based index, `AMX3009`. |
| `for value in values { show view }` | Existing loop header | Unchanged; `in` is not conversion here. |
| `for value in (distance in meter) { show view }` | Loop iterable is a converted measurement | Rejected because a measurement is not a list/range iterable, `AMX3007`; parser does not reinterpret the loop delimiter. |
| `2  meter` | Attachment with whitespace | Same as `2 meter`; whitespace does not mean multiplication. |
| `2 (meter)` / `2 length` when `length` is not a unit | No valid attachment target | Syntax/name error, `AMX3006` / `AMX3008`; arbitrary juxtaposition is rejected. |
| `distance in (meter)` | Conversion target is parenthesized | Rejected: conversion takes a declared unit name directly. Use `distance in meter`. |

Parentheses preserve their usual grouping even if the AST later omits a grouping node. Parse errors and incomplete constructs must report original-document locations for LF and CRLF. The grammar additions and examples above are approved design decisions for the implementation sprints.

### 2. Dimension and Unit Identity / Canonicalization Proposal

1. A base dimension identity is `(canonical resolved module identity, base-dimension declaration name)`. The module identity is the path identity already established by the module loader, including real-path canonicalization. Importing or re-exporting the declaration preserves that identity. Matching unqualified names from different modules do not unify.
2. A derived dimension is the normalized sparse vector of integer exponents keyed by base-dimension identity. Remove zero entries and compare keys by identity, not display name. `Speed = Length / Time` and `Velocity = Length / Time` are equivalent only when both declarations resolve to the same Length and Time identities.
3. A unit is a positive finite scale relative to its normalized dimension vector plus a declared/display identity. An independent base unit has scale `1`; only one independent base unit may exist for a given base-dimension identity. A scaled or derived unit must refer to earlier declarations or explicit imports and compute a finite scale greater than zero. Declaration visibility is source-ordered and module-scoped; no local/function/loop declaration, forward reference, collision, or implicit name is introduced.
4. Physical value is `displayValue × unitScale`. Conversion to a compatible target unit is `physicalValue ÷ targetScale`; it changes the displayed number/unit but not physical value or dimension. Addition/subtraction converts the right operand to the left display unit. Comparisons use physical values. Multiplication/division compose scales and dimension vectors; if the vector cancels to zero, return an ordinary Number using the composed scale ratio.
5. Compound dimension vectors are canonicalized by sorting base-dimension identities by canonical module identity then declaration name, merging equal exponents, and deleting zeros. Canonical dimension display uses each identity’s independent base unit, with positive powers in the numerator and negative powers in the denominator; omit power `1`, write `^ n` for other integer powers, and use `1` when there is no numerator. Thus a typed empty Length sum is `0 meter`; a typed empty Speed sum is `0 meter / second` when those are the selected independent base units.
6. A direct attachment or `in` conversion retains the selected declared unit spelling as its display unit. Compound display units retain declared unit-factor identities and scales; sort numerator and denominator factors by canonical unit identity, combine repeated powers, cancel identical factors, omit power `1`, and serialize as `factor * factor / factor ^ n` (without implicit numeric factors). A dimensionless cancellation is a Number and has no unit string. A composed unit with no lossless declared-factor spelling must use canonical base-unit factors and the corresponding canonical numeric value.
7. External unit text is a restricted unit-expression grammar: visible unit identifiers, `*`, `/`, parentheses, and signed integer powers only. It is never evaluated as AMX. Serialized measurement value remains in its serialized display unit; unit text must resolve against the same explicit project/module unit registry and round-trip to the same physical value, scale, and dimension.

The approved serializer does not qualify unit names in external JSON: names are interpreted in the schema’s explicit visible-unit context. Canonical base-unit display and cross-module output must use the schema’s explicitly visible unit context; this does not authorize implicit imports.

### 3. Finite Optional SI Inventory Proposal

Proposal: one explicitly imported module, `./libraries/si.amx`, exports only the names in this inventory. Every listed short symbol is a separate declared alias with exactly the same scale/dimension as the long name; no alias is inferred from spelling. Definitions use the unit grammar in the V0.9 contract. Exact spellings are case-sensitive.

| Kind | Exported name(s) | Definition |
|---|---|---|
| Base dimension | `Length` | Independent dimension |
| Base dimension | `Mass` | Independent dimension |
| Base dimension | `Time` | Independent dimension |
| Base dimension | `ElectricCurrent` | Independent dimension |
| Base dimension | `ThermodynamicTemperature` | Independent dimension |
| Base dimension | `AmountOfSubstance` | Independent dimension |
| Base dimension | `LuminousIntensity` | Independent dimension |
| Base unit | `meter` | `Length`, scale 1 |
| Base unit | `kilogram` | `Mass`, scale 1 |
| Base unit | `second` | `Time`, scale 1 |
| Base unit | `ampere` | `ElectricCurrent`, scale 1 |
| Base unit | `kelvin` | `ThermodynamicTemperature`, scale 1 |
| Base unit | `mole` | `AmountOfSubstance`, scale 1 |
| Base unit | `candela` | `LuminousIntensity`, scale 1 |
| Scaled unit | `millimeter` | `0.001 * meter` |
| Scaled unit | `centimeter` | `0.01 * meter` |
| Scaled unit | `kilometer` | `1000 * meter` |
| Scaled unit | `gram` | `0.001 * kilogram` |
| Scaled unit | `tonne` | `1000 * kilogram` |
| Scaled unit | `millisecond` | `0.001 * second` |
| Scaled unit | `minute` | `60 * second` |
| Scaled unit | `hour` | `3600 * second` |
| Scaled unit | `milliampere` | `0.001 * ampere` |
| Alias | `m` | `meter` |
| Alias | `mm` | `millimeter` |
| Alias | `cm` | `centimeter` |
| Alias | `km` | `kilometer` |
| Alias | `kg` | `kilogram` |
| Alias | `g` | `gram` |
| Alias | `t` | `tonne` |
| Alias | `s` | `second` |
| Alias | `ms` | `millisecond` |
| Alias | `min` | `minute` |
| Alias | `h` | `hour` |
| Alias | `A` | `ampere` |
| Alias | `mA` | `milliampere` |
| Alias | `K` | `kelvin` |
| Alias | `mol` | `mole` |
| Alias | `cd` | `candela` |
| Derived dimension | `Area` | `Length ^ 2` |
| Derived dimension | `Volume` | `Length ^ 3` |
| Derived dimension | `Speed` | `Length / Time` |
| Derived dimension | `Acceleration` | `Length / Time ^ 2` |
| Derived dimension | `Frequency` | `Time ^ -1` |
| Derived dimension | `Force` | `Mass * Length / Time ^ 2` |
| Derived dimension | `Pressure` | `Force / Length ^ 2` |
| Derived dimension | `Energy` | `Force * Length` |
| Derived dimension | `Power` | `Energy / Time` |
| Derived unit | `square_meter` | `meter ^ 2` |
| Derived unit | `cubic_meter` | `meter ^ 3` |
| Derived unit | `meter_per_second` | `meter / second` |
| Derived unit | `kilometer_per_hour` | `kilometer / hour` |
| Derived unit | `hertz` | `second ^ -1` |
| Derived unit | `newton` | `kilogram * meter / second ^ 2` |
| Derived unit | `pascal` | `newton / meter ^ 2` |
| Derived unit | `joule` | `newton * meter` |
| Derived unit | `watt` | `joule / second` |
| Alias | `Hz` | `hertz` |
| Alias | `N` | `newton` |
| Alias | `Pa` | `pascal` |
| Alias | `J` | `joule` |
| Alias | `W` | `watt` |

The approved inventory has 7 base dimensions, 7 base units, 9 scaled units, 21 aliases, 9 derived dimensions, and 9 derived units. It explicitly excludes every unlisted prefix/scale, imperial/customary units, offset units, temperature conversions, angle units, unit packages/resolution, globally reserved names, and implicit abbreviations.

Export declaration syntax (each exported name is still imported explicitly):

```amx
export dimension Length
export unit meter: Length
export unit kilometer = 1000 * meter
export unit m = meter
```

This approved design syntax is not present behavior until implemented by the assigned sprint.

Conformance import examples (with `si.amx` copied into the importing project’s `libraries/` directory):

```amx
import { Length, Time, Speed, meter, kilometer, hour, kilometer_per_hour } from "./libraries/si.amx"
let distance: Length = 1 kilometer
let duration: Time = 1 hour
let velocity: Speed = distance / duration
let displayVelocity = velocity in kilometer_per_hour
```

Expected: `distance` is a Length measurement with display value `1 kilometer`; `duration` is `1 hour`; `velocity` and `displayVelocity` have the same physical value and Speed dimension; `displayVelocity` uses `kilometer_per_hour`. Replacing the import with only `{ Length, kilometer }` and then using `meter` is rejected as an undefined name; declaring `meter` does not make `m` visible. A second independently declared `Length` from another module is incompatible even if named `Length`.

### 4. Measurement Functions and Empty / Null Views

| Expression | Expected result |
|---|---|
| `[1 kilometer, 500 meter]` then `sum(values)` | Measurement `1.5 kilometer`; the first element selects display unit. |
| Same `values`, `mean(values)` | Measurement `0.75 kilometer`. |
| Same `values`, `min(values)` | First selected minimum `500 meter`; preserve selected element’s unit. |
| Same `values`, `max(values)` | `1 kilometer`; preserve selected element’s unit. |
| `abs(-2 kilometer)` | `2 kilometer`. |
| `round(1.236 kilometer, 2)` | `1.24 kilometer`; round displayed numeric value, preserve unit. |
| `sqrt(9 square_meter)` | `3 meter` (dimension exponents halve and remain integers). |
| `sqrt(9 meter)` | Rejected: resulting Length exponent is fractional, `AMX3007`. |
| `pow(2 meter, 2)` | Measurement `4 meter ^ 2`; exponent is an integer literal. |
| `pow(2 meter, exponent)` where `exponent` is a binding | Rejected for dimensional base unless the exponent expression is syntactically an allowed signed integer literal; do not infer its value by executing or constant-propagating an identifier. |
| `10 meter / 2 meter` | Number `5`. |
| `1 kilometer / 500 meter` | Number `2`; scale ratio participates before dimension cancellation. |
| `let empty: Length[] = []; sum(empty)` | Measurement `0 meter`, where `meter` is the canonical independent base unit for that identity. |
| `let ns: Number[] = []; min(ns)` / `max(ns)` | Existing `AMX2004` empty-aggregate error. |
| `let ds: Length[] = []; mean(ds)` | Existing `AMX2004` empty-aggregate error; no fabricated measurement unit. |
| Empty `table` data | HTML retains caption/headers and an empty body; PDF and DOCX retain caption/header-only tables; no unit label is synthesized. |
| All-null measurement column in a table | Keep each row and authored column label; HTML/PDF null cells render as empty text, DOCX cells render `(null)` under current `valueToString`; add no unit. |
| Empty chart data | HTML displays the existing `No data` marker and headings; PDF has no chart SVG and a header-only data table; DOCX displays `No data` and a header-only data table. |
| Non-empty all-null chart values | Keep rows; HTML/PDF null cells are blank and DOCX cells are `(null)`. HTML/PDF/DOCX emit the existing axes-only SVG when rows exist. Do not add a measurement unit to the label. |
| Non-empty compatible measurement chart values | Normalize to the first non-null unit for each relevant axis/series; label includes that unit; values retain row/order; mismatch is rejected. |

Approved chart-label rule: for bar/column/line series, append the first non-null display unit in parentheses to the authored series label (for example, `Distance (kilometer)`). For scatter charts, append the selected axis unit to that axis heading (`x (meter)`, `y (second)`); category/group labels are unchanged. Normalize each measurement to that chosen unit before rendering and in tabular chart data. For an axis/series with no non-null measurement, preserve its authored label without a unit suffix. Thus values `[1 kilometer, 500 meter]` yield label `Distance (kilometer)` and plotted/data values `[1, 0.5]`.

The external measurement shape remains exactly the approved JSON object; for example, a record containing a Speed measurement in the selected display unit serializes as `{"velocity":{"value":1,"unit":"kilometer_per_hour"}}`. A nested/list measurement retains the same `{ "value": finiteNumber, "unit": visibleUnitNameOrExpression }` shape. CSV cells use the equivalent text `1 kilometer_per_hour`. These input/output shapes are approved; no bare external number receives a unit.

The empty/null descriptions above are the approved preservation policy, derived from current `src/renderer/renderHtml.ts`, `src/renderer/reportPdf.ts`, and `src/renderer/reportDocx.ts`: HTML, PDF, and DOCX currently differ for empty charts and null cell text, and current chart renderers emit axes when rows exist even if every value is null. Preserve this existing surface-specific policy rather than inventing unified output. This approval does not claim a runtime measurement chart has been implemented.

### 5. Static / Runtime Boundaries

The checker may use only syntax-directed, side-effect-free facts. Proposed constant evaluator: finite Number/Boolean/null/string literals; parentheses; unary `-`/`not`; and arithmetic/comparison/logical expressions whose operands are themselves constants and whose operation is defined, finite, and non-zero-dividing. No identifiers (even `let` bindings), function calls, input values, imported values, loops, mutable lists, or execution of module code are constant-folded.

Static list-bound checks are allowed only when the receiver is a literal list/range with statically safe size and the index/count is a safely constant positive integer. Examples: `[10, 20][0]` is statically out of range; `values[index]` and `values[1]` when `values` is an identifier remain runtime-checked unless separately type-invalid. Mutations are validated completely before any write. Every dynamic index/count/value/length, external-data unit/value, and runtime arithmetic domain condition is checked at runtime. Runtime validation must fail explicitly and cannot return a success-shaped value. This boundary does not weaken strict static checking of types and operators.

### 6. Diagnostic Allocation Proposal

Codes below are approved allocations in unused ranges around the existing families in `src/diagnostics/errors.ts`. Keep existing meanings: parser/editor fallback `AMX3001`, other static errors `AMX3001`–`AMX3005`, runtime `AMX1004`–`AMX1007` / `AMX2000`–`AMX2005`, input `AMX4001`–`AMX4003`, module `AMX5001`–`AMX5003`, output `AMX6001`–`AMX6002`. A code identifies the underlying fault, not the client; VS Code and desktop must expose the same code and primary location.

| Proposed code | Phase/category | Required message meaning | Required primary location |
|---|---|---|---|
| `AMX3006` | Parse/syntax | Invalid or incomplete V0.9 expression/declaration/record/string/list syntax, including old record-constructor `:` and unknown escape | Original `.amx` token start; clients highlight the offending token or insertion point |
| `AMX3007` | Static type/operator | Incompatible dimensions, Number/measurement misuse, invalid dimensional power/root, invalid measurement/list element type | Original `.amx` operator/call/type-use location; include expected and actual type/dimension when known |
| `AMX3008` | Static declaration/name | Unknown/forward/colliding dimension or unit, invalid base-unit declaration, invisible unit, or non-positive/non-finite statically known scale | Declaration/reference token; include related declaration location when there is one |
| `AMX3009` | Static list bounds | Statically provable invalid 1-based index, insertion, or removal interval | Index/count expression start; include known length and expected valid interval |
| `AMX3010` | Static numeric/unit domain | Statically provable zero denominator or non-finite/invalid scale/domain in a measurement constant | Offending operator or unit scale expression |
| `AMX1008` | Runtime list operation | Dynamic invalid 1-based index/count/position or attempt to mutate an immutable imported list | Expression/statement start; include actual index/count and current length when safe |
| `AMX1009` | Runtime measurement arithmetic | Dynamic divide-by-zero, non-finite result, or invalid runtime dimensional numeric domain | Measurement operator/function call start |
| `AMX4004` | External unit text | Malformed or unknown/not-visible unit expression | External `dataFile`, JSON `dataPath` or CSV record/field plus `dataLine`/`dataColumn` where available; retain source declaration/field |
| `AMX4005` | External measurement value/shape | Bare number where measurement required, invalid `{value, unit}` shape, non-finite value, or incompatible dimension | External `dataFile`, precise JSON path or CSV record/field and row/column; retain input name and AMX declaration/field location |

The stable diagnostic payload keeps repository-standard `code`, `message`, `file`, `line`, `column`, `inputName`, `dataFile`, `dataPath`, `dataLine`, `dataColumn`, `recordNumber`, `declarationSource`, `fieldSource`, `expected`, and `actual` fields as relevant. AMX line/column are one-based original-document positions; editor clients derive end ranges from the source token/node without rewriting offsets. JSON uses the failing pointer such as `/0/length/unit`; CSV uses record number and field/header name plus physical line/column if known. Aggregate mode returns every safely collectable invalid-data diagnostic; fail-fast returns the first, preserving current input validation behavior. Message text may be client-formatted, but codes, category, underlying message meaning, and location are identical in CLI and both editors.

### 7. Conformance and Migration Matrix

| Case | Input / operation | Expected result | Compatibility/status |
|---|---|---|---|
| Inferred valid legacy binding | `let count = 3` | Strict checking infers Number and accepts it | Preserve valid unannotated inference. |
| Invalid program formerly not checked | `let count = "three" + 1` | Reject before evaluation, `AMX3007` | Intentional strict-checking migration; never execute first. |
| Canonical multiline record | `type R { amount: Number }` and `R { amount = 2, }` | Accepted, field type Number, value `{ "amount": 2 }` | Approved constructor `=` compatibility change. |
| Legacy record constructor | `R { amount: 2 }` | Syntax rejection, `AMX3006` | Approved breaking change; no warning, formatter repair, or auto-migration. |
| Annotation colon | `let amount: Number = 2` | Accepted | Annotation `:` remains valid. |
| Escaped backslash | `"C:\\logs"` | Decoded value `C:\logs` | Approved escape change; old literal-backslash source may need extra escaping. |
| Unknown escape | `"\q"` | Syntax/string diagnostic, `AMX3006` | Reject; no silent literal pass-through. |
| Escaped newline | `"A\nB"` | Decoded string contains LF between `A` and `B`; raw source remains single-line | Approved string escape semantics. |
| 1-based read | `let xs: Number[] = [10, 20]; xs[1]` | Number `10` | Approved list rule. |
| Static bad index | `[10, 20][0]` | Static bounds diagnostic, `AMX3009` | Only statically known literal receiver/index. |
| Dynamic bad index | `xs[index]`, where `index` evaluates to `0` | Runtime diagnostic `AMX1008`; no value returned | Runtime validation, no arbitrary checker execution. |
| Shared alias mutation | `let alias = xs; add 30 to xs` | Both names see `[10, 20, 30]`; earlier emitted view stays unchanged | Preserve approved shared local mutation and snapshot rules. |
| Remove without `at` | `remove 3 from xs` for non-empty `xs` | Validate `3` as positive integer, remove exactly final element | Approved unusual rule; count magnitude ignored only after validation. |
| Imported mutation | Mutate an imported list directly or via nested alias | Reject without partial mutation | Preserve immutable imports including nested aliases. |
| Explicit measurement | `let d: Length = 10 meter` | Measurement, Length, display `10 meter` | No implicit unit for bare external/input number. |
| Conversion | `(1 kilometer + 500 meter) in meter` | Measurement `1500 meter` | Dimension and physical value unchanged. |
| Scale cancellation | `1 kilometer / 500 meter` | Number `2` | Preserve numeric unit scale during cancellation. |
| Incompatible addition | `1 meter + 1 second` | Static rejection, `AMX3007` | No unit erasure or implicit conversion. |
| JSON measurement | `{"value":10,"unit":"meter"}` for `Length` | Accepted iff `meter` is visible; value is 10 display meters | Approved shape, unit visibility checked. |
| Bare JSON number | `10` for a `Length` field | Input rejection, `AMX4005` | Do not silently attach a unit. |
| CSV measurement | `10 meter` for `Length` field | Accepted if visible and finite | Preserve current CSV row/field error locations. |
| Pure function/import/snapshot/fence compatibility | Existing valid pure function, imported aliases, loops, show snapshots, narrative interpolation, output export, and inert-fence samples | Semantics unchanged apart from the three approved compatibility shifts | Retain as regression acceptance; no fixture is migrated in Sprint 051. |

LF and CRLF variants of multiline records, nested expression/string syntax, and invalid/incomplete drafts must yield identical AST outcomes/diagnostic codes and source locations measured in their original source. Formatter acceptance is idempotence for valid syntax and rejection (not repair) for invalid constructor-colon syntax. The actual future test additions/migrations belong to the implementation sprints.

### 8. Cross-Surface Audit and Handoff

| Surface / current owner | Audit evidence and contract impact | Downstream owner | Concrete verification seam |
|---|---|---|---|
| AST and parser: `src/ast/types.ts`, `src/parser/parseExpression.ts`, `parseStatements.ts`, `parseFor.ts`, `parseDocument.ts` | Expression unions have no index/measurement/dimension/unit/interpolation nodes; constructors currently use `:`; loop headers parse separately; executable-fence boundaries are document-parser-owned. | 052 records/strict checks; 053 strings; 054 list syntax; 055 declarations; 056 measurement operators; 058 parity | `tests/parser.test.ts`: AST grouping/type/locations, nested/malformed forms, loop-vs-conversion, LF/CRLF, inert fences. |
| Checker and every observed check gate: `src/typechecker/checkDocument.ts`, `src/runtime/evaluateDocument.ts`, `src/runtime/moduleLoader.ts` (reached through `src/cli.ts`), `src/editor/moduleAnalysis.ts`, `src/editor/completion.ts`, `desktop-app/src/bun/desktopService.ts`; feasibility-only spike also calls it | `checkingActivated` conditionally gates execution and editor analysis. Strict checking must be unconditional in document, module, editor, and desktop paths; migrate positive fixtures without weakening invalid-case tests. | 052 removes conditional exemption; 055/056 extend types; 058 verifies parity | `tests/evaluator.test.ts`, `tests/modules.test.ts`, `tests/editor.test.ts`, desktop worker/service checks; grep all production check entry points during 052. |
| Diagnostics: `src/diagnostics/errors.ts`, parser wrappers in shared analysis/CLI, desktop diagnostic summary | Existing families reserve 100x/200x runtime, 300x static, 400x input, 500x module, 600x output; input payload already supports JSON/CSV path and row context. | 052-057 allocate only reviewed codes; 058 client parity | Assert same code/source in CLI, shared analysis, VS Code, desktop; `tests/inputData.test.ts` for data paths/records. |
| Runtime, stdlib, module identity/import safety: `src/runtime/environment.ts`, `evaluateExpression.ts`, `evaluateDocument.ts`, `standardLibrary.ts`, `moduleLoader.ts` | Current values/aggregates are numeric; standard-library empty min/max/mean use `AMX2004`; module loader resolves a bounded relative graph, checks imports, evaluates each module once, and controls export immutability. | 052 strictness; 054 list mutation/snapshots; 055 identity/registries; 056 measurement values/math; 057 metadata before input; 058 integrated | `tests/evaluator.test.ts`, `tests/modules.test.ts`; verify cross-module base identity, nested immutable aliases, snapshot isolation, exact aggregates, and no duplicate module execution. |
| Formatter: `src/formatter/formatAmx.ts` | Parses before formatting; currently indentation is brace-oriented and expressions are retained as text. It must reject invalid colon constructors and preserve new multiline syntax without misreading strings. | 052 records; 053/054/055/056 syntax; 058 cross-feature idempotence | `tests/formatter.test.ts`: valid parse-format-parse meaning and idempotence; invalid syntax rejects unchanged. |
| Input, output, schema and data editor: `src/runtime/inputData.ts`, `outputData.ts`, `desktop-app/src/bun/desktopService.ts`, `desktop-app/src/mainview/components/DataEditorPane.vue`, `dataText.worker.ts`, `desktop-app/src/shared/rpc.ts` | JSON and flat CSV validation/schema inspection currently use checked record types; measurement metadata must be present before inspection/loading and output schema generation without running AMX twice. | 055 unit registry metadata; 057 serialization/schema/editor; 058 desktop parity | `tests/inputData.test.ts`, `tests/outputData.test.ts`, `desktop-app/src/bun/desktopDataEditor.test.ts`; JSON nested round-trip, CSV scalar fields, invalid unit paths, schema before load. |
| View snapshots and report preparation: `src/runtime/environment.ts`, `src/renderer/reportPreparation.ts` | View emissions capture data; report preparation retains document/source order and snapshot identity. Measurement metadata must survive immutable snapshots and text substitutions. | 056 value display; 057 tables/charts/reports; 058 integrated | `tests/reportPreparation.test.ts`, `tests/reportIdentityCli.test.ts`; mutate source after show and verify prior emission unchanged and units retained. |
| HTML/PDF/DOCX renderers: `src/renderer/renderHtml.ts`, `reportPdf.ts`, `reportDocx.ts`, `src/runtime/pdfDestination.ts`, `docxDestination.ts` | Existing renderers stringify values at distinct seams. Empty table and chart policies are surface-specific as stated above; measurement cells/labels must be meaningful and chart normalization must preserve order/identity. | 057 | `tests/reportPresentation.test.ts`, `reportPdf.test.ts`, `reportDocx.test.ts`, `renderer.test.ts`; exact cell strings, empty/all-null output, unit labels, mismatch errors. |
| Shared editor facts: `src/editor/moduleAnalysis.ts`, `sourceRanges.ts`, `highlighting.ts`, `symbols.ts`, `completion.ts`, `refactoring.ts` | Shared AST/module graph feeds analysis, locations, symbols, completion, rename/navigation. Units/dimensions must be module symbols with imported identity and original-document offsets. | Feature-specific handling in 052-056; final parity 058 | `tests/editor.test.ts`; token ranges in LF/CRLF, definitions/references/rename, incomplete drafts, imports and checker diagnostics. |
| VS Code: `vscode-extension/src/providers/{diagnostics,formatting,completion,navigation,symbolRanges}.ts`, `vscode-extension/amx.tmGrammar.json` | Grammar coloring is separate from shared AST analysis; provider behavior and TextMate tokenization must agree for record `=`, strings, dimensions/units, indices, and incomplete expressions. | Feature slices 052-056; final parity 058 | `vscode-extension/src/test/suite/` provider host tests plus grammar tokenization on LF/CRLF, inert fences, and unfinished syntax. |
| Desktop editor, worker/RPC and help: `desktop-app/src/mainview/CodeEditor.vue`, `desktop-app/src/bun/{desktopService,jobWorker,workerEntrypoint}.ts`, `desktop-app/src/shared/rpc.ts`, `desktop-app/src/mainview/components/{dataText.worker,help-content.json}` | Desktop sends analysis/runtime jobs through its service/worker/RPC seam; help is bundled JSON, distinct from user docs. New locations/diagnostics and data schemas must cross RPC without silent fallback. | 052 strict check/data contracts; 057 measurement schema; 058 parity and bundled help | `desktop-app/src/bun/jobWorker.test.ts`, `desktop-app/src/bun/desktopDataEditor.test.ts`, `desktop-app/src/mainview/diagnosticSummary.test.ts`, UI help/editor tests. |
| Tests/examples/libraries/docs: `tests/`, `examples/`, `examples/libraries/`, `libraries/`, `docs/language-spec-v0.1.md`–`v0.5.md`, `desktop-app/src/mainview/components/help-content.json` | Current examples and tests are pre-V0.9; use them as migration/conformance inventory, not as files to edit in this sprint. Existing example imports are relative and contained under each example tree. | 052 migrates strict-invalid positives/records; 053 strings; 054 lists; 055 SI library; 056 measures; 057 data/report; 058 user docs/help/examples and integrated acceptance | `tests/examples.test.ts`, focused parser/evaluator/module/input/output/report/editor tests; audit before/after fixture migration and retain negative cases. |

Dependency handoff follows the master plan exactly: 052 depends on 051; 053 and 054 each depend on 052 and are parallel after it; 055 depends on 052 and does not require 053/054; 056 depends on 055; 057 depends on 056; 058 depends on 053, 054, and 057. Sprint 051 supplies the approved contract and audit seams; implementation may proceed in dependency order. Approval of the design does not mean any implementation has started or authorize work outside the master plan.

### 9. Review State

**Lead Developer disposition (2026-10-06): APPROVED.** The Builder Contract Proposal in this appendix, including precedence, identity/canonicalization, SI inventory/export names, aggregate and empty/null policy, static-check boundary, diagnostic allocation, conformance/migration matrix, cross-surface ownership, and Sprint 052–058 handoff, is approved as the Sprint 051 design gate. Approval does not claim implementation, build, test, or V0.9 runtime behavior. Any future conflict with the authoritative V0.9 contract or master plan must be brought back to the Lead Developer rather than silently changing scope.
