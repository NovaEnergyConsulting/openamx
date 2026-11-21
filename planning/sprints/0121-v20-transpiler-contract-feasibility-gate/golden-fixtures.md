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
`sample`, title `Sample`, values `[2, 4]` in source order, and resolved
`showTable: true`. It includes the accepted table DTO but no ECharts/rendered
output. Add a false case that has the same plot data but no table DTO.

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
followed by narrative and an AMX fence. Compare the raw source envelope to
generated comments. The fixture blocks acceptance until D121-13 decides how
the original text reaches the emitter; parsed `metadata` alone is not a valid
source-fidelity oracle.

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
| GOLD-AST-DIAGRAM-01 | Properties, timeline, primitives, recursive for/if diagram content, show | Structured scene/frame DTO parity, element order, and bindings match AMX. |
| GOLD-AST-ERROR-01 | Invalid syntax, type mismatch, unknown name, invalid measurement and unsupported lowering | Source-local diagnostic; no partial generated module graph. |

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