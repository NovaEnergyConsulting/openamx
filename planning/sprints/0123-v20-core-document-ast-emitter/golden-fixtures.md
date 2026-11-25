# Sprint 123 Golden Emitter Fixtures

## Status and Use

Architect-prepared fixture inventory. No fixture is implementation evidence
until emitted by the authorized S123 code and compiled/executed. Preserve
stable `G123-*` IDs in test names or evidence. Use the existing parser/runtime
test conventions and complete source envelopes.

## Source Preservation and Diagnostics

| ID | Source shape | Expected generated result |
| --- | --- | --- |
| G123-SOURCE-01 | Narrative lines before/between/after AMX fences; blank lines; non-AMX `text` fence; literal `{{ 1 + 1 }}`. | One normalized safe `//` line per narrative line, in source order; interpolation stays literal; AMX fence delimiters are absent. |
| G123-FRONTMATTER-01 | Raw YAML with comments, quoted values, noncanonical key order, and CRLF/CR/LF mix. | Every original frontmatter line is inert comment before body nodes; parsed metadata is not used to reconstruct text. |
| G123-COMMENT-ESCAPE-01 | Narrative contains `*/`, `//#`, U+2028, U+2029, non-ASCII text, and empty lines. | No source text can escape a comment; normalized LF output is deterministic and content remains recognizable. |
| G123-REJECT-01 | Malformed AMX, static type error, unknown helper/node kind, or missing checked context. | Source-local diagnostic and no `code` field/result; no silent omitted node or partial-success-shaped module. |

## Declarations, Names, and Functions

| ID | AMX coverage | Expected generated behavior |
| --- | --- | --- |
| G123-DECL-01 | Initialized and uninitialized bindings, explicit annotations, exports, declarations across multiple fences. | Initialization and source order match AMX; the shared run scope spans fences; only explicit exports are returned. |
| G123-TYPE-01 | Number/String/Boolean/DateTime/list/nullable types, records, optional/default fields, inheritance, overrides, enums. | Strict declarations compile; DateTime remains RFC 3339 string; enum values and record defaults match checker-accepted source. |
| G123-NAME-01 | Declarations named `run`, `AMXRunInputs`, helper-like names, JS reserved words; collision-prone import aliases. | Deterministic internal names compile; API names remain stable; export keys retain original AMX names. |
| G123-ENUM-01 | String/numeric enum values, imported enum names, enum type tests, enum input members. | Runtime values and input descriptor members match; no enum-default parity assertion for source forms rejected by AMX (D122-15). |
| G123-FUNCTION-01 | Expression and statement bodies, nested returns, loops, local mutations, defaults, exported/imported function signature supplied by context. | Exact result and AMX evaluation order; no captured outer state or unexpected aliasing. |
| G123-EXPORT-01 | `export let`, `export fn`, exported type/enum, export list declaration. | Only explicit entry value exports appear in `run().exports`; module exports retain AMX visibility. |

## Expressions and Runtime Helpers

| ID | AMX coverage | Expected generated behavior |
| --- | --- | --- |
| G123-LITERAL-01 | Numeric/string/Boolean/null literals, identifiers, string interpolation. | Escaped values; interpolation calls `amxFormatValue` per expression and matches AMX formatting/error behavior. |
| G123-EXPR-01 | Literal and compound expression nesting with checked precedence/parentheses. | Generated grouping and computed result match the checked AST and AMX runtime. |
| G123-STRING-01 | Interpolation of String, Number, Boolean, Measurement, null, and an unsupported record. | `amxFormatValue` output/error and source position match AMX exactly. |
| G123-OPERATOR-01 | Arithmetic, equality/order, logical operators, unary operators, type tests. | `amxBinary`/`amxUnary`/`amxIsType` used where required; left/right evaluate once in AMX order; power emits exponentiation, not XOR. |
| G123-CONTROL-01 | Conditional/braced-if expressions/statements, match and default branches. | Test/scrutinee evaluates once; only selected expression branch runs; scoped values do not leak. |
| G123-MATCH-01 | Match cases with first, later, and default branch; case expressions with observable calls. | Scrutinee evaluates once, first matching arm wins, and unselected branches are not evaluated. |
| G123-CALL-01 | User function, imported function from pre-resolved graph, and builtin calls with side-effect-observable argument expressions. | Argument expressions evaluate once in source order; results and errors match AMX. |
| G123-MUTATION-01 | Assignment, compound assignment, list append/insert/remove, immutable imported binding. | Mutability and AMX list helpers preserve result, order, and AMX1008 diagnostics. |
| G123-LOOP-01 | Ascending/descending range loops, empty list loop, nested scoped iterator names. | Iteration order and binding restoration match AMX. |
| G123-LIST-01 | List literal/access, range, for expression/statement, add/remove, nested list function arguments. | 1-based operations and recursive copy helper preserve AMX result/order/errors. |
| G123-BUILTIN-01 | Numeric, measurement, aggregate, text, formatting, and math builtins. | `amxBuiltin` calls match S122 signatures and AMX outputs/errors. |
| G123-MEASURE-01 | Linear and affine declarations, attach/convert, arithmetic, comparison, aggregate and rejected operations. | Values, dimensions, unit/display selection, affine diagnostics match AMX; explicit tolerance per floating field. |
| G123-RECORD-01 | Record constructors, inherited fields, defaults, field access, nullable and optional fields. | Field order/value/default behavior matches AMX; invalid values are rejected by checker/input helpers. |

## Module and Views

| ID | Shape | Expected generated behavior |
| --- | --- | --- |
| G123-IMPORT-01 | One checked module with an explicit imported symbol and context-provided output specifier. | Emits named import using supplied relative `.ts` specifier; does not read or recurse into filesystem modules. |
| G123-INPUT-01 | One Number, DateTime, enum, record/list, and measurement input; valid and invalid `run(inputs)` calls. | Generated descriptor validates before AMX statements; errors match S122 `AMXInputError` code/path; no result on error. |
| G123-VIEW-TABLE-01 | Table with selected/reordered columns, nulls and nested source record; two `show`s around mutation. | `amxTableView` snapshots at each show; values/order/headings remain detached. |
| G123-VIEW-CHART-01 | Bar/column/line/scatter with field/series labels, mixed units, `showTable` false/true/expression. | `amxChartView` receives evaluator-normalized values, labels/headings/descriptors and Boolean; no renderer payload. |
| G123-VIEW-SHOW-01 | Two table/chart `show` statements around value reassignment, with a diagram declaration between them. | View events capture the correct snapshots and retain module/source order; diagram is declaration-time only. |
| G123-VIEW-DIAGRAM-01 | Line/rectangle/circle/text, timeline, nested loop/conditional membership and imported declaration. | Declaration-time `structured-v2` DTO with primitive-specific elements and initial frame, no `show` statement. |
| G123-VIEW-ORDER-01 | Entry table/chart shows interleaved with declaration-time diagrams across prevalidated module contexts. | `result.views` order matches D121-15 by module, source, and evaluation order. |
| G123-RUN-FRESH-01 | Call generated `run` twice with same and differing inputs; mutate result after first call where typing allows. | Fresh internal state/results per run; no cross-call mutable leakage. |
| G123-DETERMINISM-01 | Emit same input/context twice from different absolute roots. | Byte-identical code and imports; no absolute root, clock, random or locale content. |

## Reference and Assertion Policy

- For accepted AMX source forms, run identical source/inputs through the AMX
  runtime oracle and generated TypeScript. Compare explicit exports and
  structured view data only.
- Compare original AMX names/keys, value types, list/record order, unit
  identity/display, view kinds/order, null positions and diagnostic codes
  exactly. Numeric tolerance is stated per field in `parity-matrix.md`.
- Exclude D122-15 enum-valued record-default forms that the AMX checker rejects
  from parity; still compile and test generated default factories where the
  source context can validly provide them.
- TypeScript compile success and golden string equality are separate evidence
  from runtime parity. Hashes prove artifact identity, not semantics alone.