# Sprint 121 Golden Fixtures

## Status and Use

Architect-prepared fixture inventory. The snippets and expected results are
contract candidates, not evidence that the current product transpiles them.
At execution, put each case in the repository's normal complete-document test
envelope, preserve the stable ID, and record exact source/output hashes.

## Required Boundary Fixtures

### GOLD-MODULE-01: Imported Module and Explicit Visibility

`helpers.amx`:

````amx
```amx
export fn twice(value: Number): Number = value * 2
```
````

`main.amx`:

````amx
# Entry module

```amx
import { twice } from "./helpers.amx"
input amount: Number
export let doubled: Number = twice(amount)
```
````

Run with `{ amount: 6 }`. Expected `exports.doubled` is `12`; only the entry
module exposes `doubled` in `AMXRunExports`. The emitted graph contains mirrored
`main.ts` and `helpers.ts`, and `main.ts` imports the helper through the
accepted relative `.ts` specifier. A non-exported helper binding is not
importable.

### GOLD-MEASURE-01: Measurement Semantics

````amx
```amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
let distance: Length = 1 kilometer
export let inMeters: Length = distance in meter
export let sameDistance: Boolean = distance == 1000 meter
```
````

Expected exported display value is `1000 meter`; equality is `true`. Compare
unit identity/display value exactly and physical numeric values using the
accepted floating comparison policy. The fixture proves helper use and parity,
not rendered report behavior.

### GOLD-INPUT-01: Caller-Supplied Input and Rejection

Use the `main.amx` source from `GOLD-MODULE-01`. A valid call with
`{ amount: 6 }` returns `12`. A runtime call with a missing `amount`, a string,
or a non-finite number (where current input validation rejects it) throws the
accepted typed input error before execution and returns no exports/views.
The TypeScript negative case casts through `unknown` so runtime validation is
actually exercised rather than prevented by the test compiler.

### GOLD-INPUT-RECORD-01: Nested Record Defaults and Strict Keys

````amx
```amx
type Part {
  id: String
  alias?: String? = null
  count: Number = 2
}
input parts: Part[]
export let firstAlias: String? = parts[1].alias
export let firstCount: Number = parts[1].count
```
````

For `{ parts: [{ id: "A-1" }] }`, omitted `alias` materializes as `null` and
omitted `count` uses its default `2`; both exports match exactly. A missing
required `id` or an undeclared record key rejects before evaluation. This case
must follow the current input validator's field/default order.

### GOLD-INPUT-ENUM-BLOCKER-01: Enum Input Compatibility

Use an enum-typed `input` declaration accepted by the checker, then compare
checker behavior with the current input converter. The checker resolves enum
names, but the current loader supplies only record declarations to that
converter. This is a source-audit blocker for D121-16, not a passing golden
result or authority to add enum input semantics.

### GOLD-VIEW-01: Shown Chart Snapshot

````amx
```amx
let values: Number[] = [2, 4]
chart sample = column(values) {
  title: "Sample"
  showTable true
  series "Value"
}
show sample
```
````

Expected `views` contains exactly one chart DTO with kind `chart`, name
`sample`, title `Sample`, data `[2, 4]` in source order, and resolved
`showTable: true`. The DTO contains no renderer-generated table payload,
ECharts options, or rendered output. Add a false case with the same chart data
and `showTable: false`.

### GOLD-DIAGRAM-VIEW-BLOCKER-01: Diagram Result Semantics

Use the valid diagram declaration in `GOLD-AST-DIAGRAM-01` and check how its
declaration-time runtime emission can satisfy the master-plan `{ exports,
views }` result while `show` currently accepts only tables/charts. The
disposition is blocked by D121-15; do not make `show diagram` a valid fixture
or claim diagram view parity before the product owner decides the contract.

## Comment-Encoding Fixture

### GOLD-COMMENT-01

Source contains narrative prose with literal `{{ 1 + 1 }}`, a blank line, a
non-AMX `text` fence containing `*/` and a line beginning `//#`, plus U+2028
and U+2029 separators, followed by an AMX fence. Expected output contains one
inert TypeScript line comment per normalized source line under the accepted
encoding; interpolation remains literal; non-AMX content is not parsed or
executed; executable AMX follows in document order. Compare generated content
and order, not the added `// ` prefix or normalized line endings. Neither
Unicode separator may cause source text to escape its generated comment.

### GOLD-FRONTMATTER-01

Use frontmatter with a YAML comment, quoted scalar, and non-default key order,
followed by narrative and an AMX fence. Candidate D121-13 passes the original
source text per module and emits every frontmatter line as an inert comment
before body nodes under the accepted normalized line encoding. Compare source
content and line order, including the YAML comment and following narrative.
Parsed `metadata` alone is not a valid source-fidelity oracle; owner
disposition is pending.

## AST-Family Fixture Inventory

Every row is a stable test group. Split groups into focused source files as
needed while retaining each ID in the test name or evidence record.

| Fixture ID | AST families and behavior covered | Expected contract |
| --- | --- | --- |
| GOLD-AST-DOC-01 | Narrative and multiple executable blocks | Shared environment and source order across fences; comments stay inert. |
| GOLD-AST-BINDING-01 | Variable declarations, assignment, compound assignment, explicit exports | Reassignment/mutation, initialization, and exported values match AMX. |
| GOLD-AST-NAME-01 | Identifier escaping, reserved names, generated-name collision | Stable generated identifiers; source-facing API and diagnostics remain attributable. |
| GOLD-AST-LITERAL-01 | Number, String, Boolean, null, identifier, string interpolation | Exact scalar values; interpolation uses AMX formatting; null remains null. |
| GOLD-AST-TYPE-01 | Named/list/nullable types, records, optional/default fields, inheritance/override, enum members/resolved values | Generated declarations compile strictly and preserve AMX runtime values. |
| GOLD-AST-FUNCTION-01 | Expression and statement function bodies, parameters, calls, return, nested branch returns | Results and evaluation order match AMX; no implicit `any`. |
| GOLD-AST-MODULE-01 | Imports, named exports, dimensions/units, module visibility and module identity | Full graph compiles; private names remain inaccessible. |
| GOLD-AST-EXPR-01 | Binary/unary operators, type test, conditionals, braced-if, match/cases | Selected values and lazy evaluation match the runtime. |
| GOLD-AST-LIST-01 | List literals, 1-based access, ranges, for expressions/statements, add/remove, compound assignment | Mutation/copy/iterator/index behavior matches AMX, including bounds errors. |
| GOLD-AST-RECORD-01 | Record constructors, field access, defaults and inherited field behavior | Runtime record shape and access match the AMX interpreter. |
| GOLD-AST-UNIT-01 | Measurement attachment/conversion, affine units, measurement comparisons and operations | Value, dimension, display unit, and failure behavior match AMX. |
| GOLD-AST-TABLE-01 | Table declarations, title/description, ordered column options, show | Shown table data matches rows, field order, labels, nulls, and source order. |
| GOLD-AST-CHART-01 | All four chart kinds, fields/series/options, `showTable`, show | Structured chart DTO parity; true/false table selection is explicit. |
| GOLD-AST-DIAGRAM-01 | Properties, timeline, primitives, recursive for/if diagram content, declaration-time emission | Structured scene/frame data, element order, and bindings match AMX; inclusion in generated `views` is blocked by D121-15. |
| GOLD-AST-ERROR-01 | Invalid syntax, type mismatch, unknown name, invalid measurement and unsupported lowering | Source-local diagnostic; no partial generated module graph. |

## Exact Values and Floating Comparison

- `GOLD-MODULE-01`: `exports.doubled === 12` exactly.
- `GOLD-MEASURE-01`: `exports.inMeters.value === 1000`, its display unit is
  `meter`, and `exports.sameDistance === true` exactly.
- `GOLD-INPUT-01`: valid `exports.doubled === 12` exactly; missing, string,
  and non-finite `amount` values reject before evaluation.
- `GOLD-INPUT-RECORD-01`: `firstAlias === null` and `firstCount === 2` exactly.
- `GOLD-VIEW-01`: chart data is exactly `[2, 4]`; kind, source order, title,
  and `showTable` are exact structural comparisons; no rendered table payload
  is compared.
- `GOLD-AST-UNIT-01/affine-C-to-F`: compare the Fahrenheit display value to
  `31.999999999999986` with absolute tolerance `1e-12` and relative tolerance
  `1e-12`. Measurement dimension, display-unit identity, and output shape are
  exact. No other numeric field receives a tolerance unless listed here with
  its own expected value and tolerance.

## Module and Destination Fixtures

| Fixture ID | Shape | Expected contract |
| --- | --- | --- |
| GOLD-GRAPH-NEST-01 | Entry imports a nested helper through two relative `.amx` edges | Mirror each module under the chosen import root and rewrite every edge to the matching relative `.ts` path. |
| GOLD-GRAPH-ESCAPE-01 | A symlink or relative import resolves outside the import root | Reject with the existing module-containment diagnostic; write nothing. |
| GOLD-GRAPH-CYCLE-01 | Two or more modules form an import cycle | Reject with the existing cycle behavior; emit no graph. |
| GOLD-GRAPH-COLLISION-01 | Distinct source paths collide after output normalization or Windows case folding | Detect during preflight and write nothing. |
| GOLD-GRAPH-OVERWRITE-01 | One generated target already exists, with and without explicit overwrite approval | Default refuses without changing any destination; approved replacement touches only graph-owned targets. |
| GOLD-GRAPH-CANCEL-01 | User cancels overwrite confirmation or destination selection | No generated graph is reported and existing files remain unchanged. |
| GOLD-GRAPH-NOPARTIAL-01 | An invalid imported module follows a valid entry/module in traversal | Reject the graph before publication; no success-shaped partial output. |
| GOLD-GRAPH-PUBLISH-FAIL-01 | Inject a failure during sequential multi-file publication | Attempt rollback; report each staged/published/restored/unrecovered path; never report success. D121-18 blocks any stronger atomicity claim. |
| GOLD-GRAPH-DETERMINISM-01 | Transpile identical graph twice with unchanged toolchain | All generated bytes and relative paths are identical. |

## Determinism and Negative Cases

- Repeating transpilation with identical input/module contents yields byte-
  identical `.ts` output. Absolute source checkout path, current time, and
  filesystem enumeration order do not appear in generated files.
- Mutating one source expression changes only the expected dependent generated
  module; imported module contents and ordering remain stable.
- An invalid imported dependency prevents emission of the entry and every
  dependency module; no best-effort or partial graph is accepted.
- An unknown AST discriminant in the emitter test seam fails closed with the
  assigned source-oriented diagnostic, never silently drops a node.
- For every fixture, record source envelope, expected module paths, expected
  typecheck/run command, exact-versus-tolerance fields, expected diagnostics,
  output hash, and downstream owner.