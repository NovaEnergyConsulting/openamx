# OpenAMX Language Specification V0.3

This is the authoritative V0.3 contract for typed-data workflows. V0.3 is additive to V0.2. A document that uses no V0.3 syntax and no V0.3 CLI options retains V0.2 parsing, execution, rendering, and no-option `run` and `render` behavior. The historical contract remains in [language-spec-v0.2.md](language-spec-v0.2.md); V0.3 does not make V0.1 bare declarations executable.

## 1. Scope and Terms

V0.2 front matter, Markdown narrative, exact `amx` fences, inline interpolation, source coordinates, formatting, rendering, and source-order document execution remain in force except where this specification explicitly adds a rule. A *record* is a closed data-only value of a declared named type. A *module* is one local `.amx` document. The CLI path supplied to `run` or `render` identifies the *entry module*. An *input* is a named typed value supplied by the CLI, never opened by AMX source.

V0.3 adds records, static checking, pure functions, explicit local module imports/exports, logical data inputs, validation, and named output. It does not add arbitrary filesystem APIs, methods, inheritance, enums, user-defined constraints, computed fields, remote packages, charts, units/currency, or broad multi-document workflows.

## 2. Compatibility and Processing

All executable declarations remain inside the exact case-sensitive backtick `amx` fences defined by V0.2. Narrative, ordinary fences, and bare V0.1 declarations remain non-executable. V0.2 blocks continue to execute in document order in one entry-module environment; narrative interpolation uses the final environment and rendering remains unchanged.

Static checking is activated when a document or its module graph contains a V0.3 declaration (`type`, `fn`, `import`, `input`, `export`, a type annotation, a record constructor, or field access), or a V0.3 CLI option is supplied. When activated, parsing, module linking, and checking of every executable block complete before module evaluation or output-file writes. Type errors prevent evaluation. A V0.2-only document with no V0.3 CLI options follows the V0.2 path and is not rejected by the new checker.

The entry module and imported modules retain the V0.2 rule that executable blocks run in source order with one shared environment per module. Imports and declarations are AMX statements inside executable blocks; they do not execute when written in narrative or ordinary fences.

## 3. Types, Values, and Bindings

Primitive types are `Number`, `String`, `Boolean`, and `DateTime`. Every declared `type Name { ... }` introduces a nominal record type. `T[]` is a list, `T?` is `T` or `null`; postfix type suffixes may be combined, for example `Asset?[]` (list of nullable assets) and `Asset[]?` (nullable list). Nested lists are permitted. `null` is assignable only to a nullable type. There is no `any`, general union, implicit nullable conversion, or numeric/string/boolean coercion in a checked V0.3 program.

Assignment requires the same type, except a non-null `T` may be assigned where `T?` is expected and list element types may be widened by that same rule. Record types are nominal: two record declarations with identical fields are still different types. No inheritance or structural record conversion exists. A binding's type is fixed at its first declaration; an unannotated V0.2 `let` infers that type from its initializer. A repeated `let`, `=`, or `+=` cannot change it. Declarations require initializers. Inputs and imported values are immutable; local V0.2 bindings remain mutable.

`DateTime` values are immutable. Their wire representation is a valid RFC 3339 date-time with seconds, zero through nine fractional-second digits, and either `Z` or a numeric UTC offset. Calendar-invalid dates/times, leap-second notation, and timezone-free strings are rejected. A string literal is accepted as `DateTime` only in a context with expected type `DateTime`, and only if it passes this validation; otherwise it remains `String`. Inferred string bindings do not become `DateTime`. V0.3 adds no date arithmetic or ordering. DateTime equality compares the validated wire strings exactly, and rendering/JSON/CSV output preserve that string.

## 4. Records and Field Semantics

Record declarations define closed data-only shapes. Fields are materialized in declaration order, and record fields have no mutation syntax. A field has a name, a type, an optional-presence marker, and optionally a literal default. The marker `field?: T` controls whether construction may omit the field; type suffix `T?` independently controls whether a present value may be null.

Omission is accepted when the field is marked optional or has a default. When omitted, a default is copied into that instance; otherwise an optional field must be nullable and is materialized as `null`. An unmarked field without a default is required. A default also permits omission of an unmarked field. Every supplied value, including explicit `null`, must be assignable to the field type. Defaults may contain only number, string, boolean, `null`, list literals, and record constructors recursively made from those literals. Defaults cannot refer to bindings, functions, or inputs and are type-checked at the declaration. List and nested-record defaults are fresh values for each construction.

Constructors reject duplicate, unknown, and missing required fields. Constructor fields are comma-separated expressions; field order in the constructor does not affect the materialized declaration order. Field access uses `record.field`; the receiver must have a non-null record type and the field must be declared. Nullable receivers must be checked against `null` before access. Access to a nullable field retains its nullable type. There is no dynamic property access.

```amx
type Asset {
  id: String
  name: String
  commissionedAt?: DateTime? = null
  failureModes: FailureMode[] = []
}

let asset: Asset = Asset { id: "TX-01", name: "Transformer 01" }
let assetName: String = asset.name
```

## 5. V0.3 Grammar

The following additions occur only in executable `amx` blocks. The existing V0.2 grammar for documents, expressions, statements, loops, and `match` remains in force. `TopLevelItem` means an item outside a V0.2 loop body. Newlines separate fields and top-level items; semicolons do not. Type/function/input/import/export declarations cannot occur in loop bodies. A constructor's comma-separated fields occupy one logical line; braced V0.2 expressions retain their V0.2 multiline rules.

```text
ModuleItems       ::= Import* Input* TopLevelItem*
TopLevelItem      ::= TypeDeclaration | FunctionDeclaration | InitializedLet
                    | Assignment | CompoundAssignment | ForStatement
                    | ExportedDeclaration
ExportedDeclaration ::= "export" (TypeDeclaration | FunctionDeclaration | InitializedLet)
Import            ::= "import" "{" Identifier ("," Identifier)* "}" "from" StringLiteral
Input             ::= "input" Identifier ":" Type
TypeDeclaration   ::= "type" Identifier "{" NewLine FieldDeclaration* "}"
FieldDeclaration  ::= Identifier Optional? ":" Type ("=" DefaultLiteral)? NewLine
Optional          ::= "?"
FunctionDeclaration ::= "fn" Identifier "(" Parameters? ")" ":" Type "=" Expression
Parameters        ::= Parameter ("," Parameter)*
Parameter         ::= Identifier ":" Type
InitializedLet    ::= "let" Identifier (":" Type)? "=" Expression
Type              ::= TypeAtom TypeSuffix*
TypeAtom          ::= "Number" | "String" | "Boolean" | "DateTime" | Identifier
TypeSuffix        ::= "?" | "[]"
RecordConstructor ::= Identifier "{" ConstructorFields? "}"
ConstructorFields ::= ConstructorField ("," ConstructorField)*
ConstructorField  ::= Identifier ":" Expression
FieldAccess       ::= Expression "." Identifier
DefaultLiteral    ::= NumberLiteral | StringLiteral | BooleanLiteral | "null"
                    | DefaultList | DefaultRecordConstructor
DefaultList       ::= "[" (DefaultLiteral ("," DefaultLiteral)*)? "]"
DefaultRecordConstructor ::= Identifier "{" DefaultFields? "}"
DefaultFields      ::= DefaultField ("," DefaultField)*
DefaultField       ::= Identifier ":" DefaultLiteral
```

Type suffixes apply from left to right: `Number?[]` is a list whose items may be null; `Number[]?` is a nullable list of non-null numbers; `Number[][]` is a list of lists. Repeating `?` at the same type level is invalid. A type name must refer to a preceding local type declaration or an explicitly imported type. Record types cannot be recursive, directly or through other records; declarations therefore have an acyclic, source-ordered type dependency.

`Import` items must precede all input and other executable items in that module. Entry-module `Input` items follow imports and precede all other executable items. Imports and inputs may not appear in an imported module. `export` may prefix only a type declaration, function declaration, or initialized top-level `let`; it cannot prefix imports, inputs, assignments, or loop statements. Exported names are the exact declared names.

Function declarations and imports use the syntax in this grammar. A function body is one expression, including a braced `match`; it is not a statement block. Record constructors require a declared record name. `FieldAccess` and constructors are expression forms and follow function-call/member-access precedence above unary and binary operators. V0.2 parsing and operator precedence are otherwise unchanged.

## 6. Static Checking

When checking is activated as described in section 2, every executable expression and statement in the entry module and its dependencies is checked before evaluation. The checker follows module dependency order, then source order within each module and across its V0.2 executable blocks. A name is visible only after its declaration in that order, except imported declarations, which are visible after the import. A function may call only a standard-library function, an imported function, or a function declared earlier in the same module. Types likewise must be declared or imported before use.

The checker enforces these rules:

- `+`, `-`, `*`, `/`, `%`, `^`, unary `-`, range bounds, and `>`, `>=`, `<`, `<=` require `Number`; ranges produce `Number[]`. `+=` requires a `Number` binding and `Number` right operand.
- `and`, `or`, `not`, and an `if` test require `Boolean`. Both conditional branches must have one common assignable type.
- `==` and `!=` require compatible scalar operands of the same primitive type. `null` may be compared with a nullable operand. They produce `Boolean`. Lists and records are not equality operands.
- `match` accepts a non-null `Number`, `String`, or `Boolean` scrutinee; each literal case has exactly that type and every arm/default has a common assignable result type. V0.2 case order, strict matching, and lazy selection are unchanged. Nullable scrutinees and null case arms are not part of V0.3.
- A list literal has one element type. Elements must be assignable to that type. An empty list is valid only when an expected list type supplies its element type. Nested lists follow the same rule.
- Record construction, field access, field defaults, and field assignments are checked against the declared nominal field types. Assignments to immutable inputs/imports and any attempt to access an unknown field fail.
- An iterable must be a list or V0.2 range. The loop variable has the list element type (including nullability); a range iterator is `Number`. An expression loop returns a list of its `return` expression type. Its existing V0.2 exactly-one-return and side-effect behavior remains unchanged.
- A binding inferred by its first unannotated `let` keeps that type. Repeated declarations and assignments must be assignable; `+=` follows the numeric rule above. A loop iterator shadows and restores an existing binding. Declarations introduced only inside a loop are not definitely available after it; mutations of pre-existing bindings remain visible.
- Standard-library functions are pure and have fixed signatures: `sum`, `min`, `max`, `mean`: `Number[] -> Number`; `round`: `(Number[, Number]) -> Number`; `abs`, `sqrt`: `Number -> Number`; `pow`: `(Number, Number) -> Number`. Calls with unknown names, wrong arity, or incompatible arguments are errors. Existing runtime errors for empty `min`/`max`/`mean` and negative `sqrt` remain runtime errors.

The checker reports rather than coerces a type mismatch. It does not infer constraints such as positive costs, score ranges, or non-empty lists. Static errors prevent all module evaluation, input validation, HTML generation, and output writes for that invocation.

## 7. Pure Functions

Functions have typed parameters, a required return type, and one expression body:

```amx
fn riskScore(severity: Number, occurrence: Number): Number = severity * occurrence
```

Parameter names are unique within a function. The body may read only its parameters and call standard-library functions, explicitly imported functions, and earlier functions in the same module. It cannot read or capture a module binding, input, or loop iterator. It cannot call itself, call a later same-module function, or contain a `for` expression. Function calls check arity and argument types; the body type must be assignable to the declared return type. Functions cannot contain declarations, assignments, `+=`, `return` statements, imports, exports, or file operations. These restrictions define purity and make calls independent of document state.

## 8. Modules, Imports, and Exports

An import names one or more explicit exports from a relative path:

```amx
import { Asset, riskScore } from "./libraries/asset-management.amx"
```

Import paths use `/`, must begin with `./` or `../`, must end in the exact lowercase `.amx` suffix, and resolve relative to the importing module. Absolute paths, backslashes, URLs, bare package names, extensionless paths, and paths outside the entry module's directory tree are errors. Containment is checked after filesystem canonicalization, including symlinks. The CLI/module loader performs this I/O; AMX expressions and functions never receive paths or file handles.

Only `export type`, `export fn`, and `export let name: Type = expression` declarations at module top level are public. An exported `let` exposes its final value after that module has executed all its blocks. Imported values are immutable in the importer. Imports do not re-export a name implicitly. Names are case-sensitive. Duplicate declarations, duplicate import names, local/import collisions, duplicate exports, and imported names absent from the target module are errors. User-defined function names cannot shadow standard-library function names.

The loader resolves each dependency depth-first in import source order, parses and checks the complete reachable graph before evaluating it, then evaluates each module once before its importer. Each module has a separate environment containing its own declarations and explicitly imported exports; only explicit exports cross the boundary. A module cannot declare inputs. The entry module alone supplies CLI inputs.

Any dependency cycle is an error. Cycle detection reports the first back-edge found by depth-first traversal, the ordered module cycle, and the source locations of its import edges. No module is evaluated when a cycle or other parse/link/type error exists.

## 9. Logical Inputs and CLI Mapping

Only the entry module may declare inputs, after imports and before all other executable items:

```amx
input assets: Asset[]
input reviewedAt: DateTime?
```

An input is immutable and visible from its declaration onward in the entry module. It cannot collide with any local declaration or imported name. Each declared input requires exactly one CLI mapping; missing, unknown, or repeated mappings are errors. Mapping the same filesystem path to distinct logical input names is permitted. A nullable input still requires a mapping; the mapped JSON document may contain `null`.

The commands accept repeated options:

```sh
openamx run analysis.amx --input assets=data/assets.csv --input reviewedAt=data/reviewed-at.json
openamx render analysis.amx --input assets=data/assets.csv
```

`--input name=path` is split at the first `=`; both parts must be non-empty. The path is interpreted by the CLI, relative to the process working directory, not the `.amx` file. The exact lowercase `.json` or `.csv` extension selects the format; no content sniffing occurs. Other extensions fail. The CLI reads and validates all inputs before evaluating modules. File paths never become AMX values.

V0.3 accepts `--validation aggregate` (the default) and `--validation fail-fast` for `run` and `render`. With no V0.3 option, existing `run <input>` still prints the final context as JSON and existing `render <input> [--out path]` still writes the same standalone HTML at the same default path. With `--output`, `run` continues printing its V0.2 context JSON and `render` continues writing HTML; each also writes the selected export files.

## 10. JSON and CSV Input Conversion

Input JSON is UTF-8 JSON. The root JSON value must match the declared type exactly: a record input requires one object, a list input requires an array, and a scalar input requires one scalar. There is no singleton-to-list conversion. Arrays and nested records map recursively. Object keys are exact field names; unknown and duplicate keys are errors. Duplicate JSON object keys are rejected rather than silently taking the first or last value. JSON numbers must be finite. JSON `null` is accepted only for a nullable target.

JSON object fields may arrive in any order; validation and materialized records use type declaration order. Missing-field behavior follows section 4. A present default is not applied over an explicitly supplied value. DateTime inputs are strings validated by the DateTime rule in section 3. JSON booleans and strings are not converted to numbers or other primitive types.

CSV is supported only when the declared input type is `RecordType[]`, where each field of `RecordType` is a scalar `String`, `Number`, `Boolean`, `DateTime`, or nullable scalar. Nested records and list-valued fields are rejected. JSON-in-cell conventions are not supported. CSV uses UTF-8, RFC 4180 quoting, CRLF or LF record separators, a single header record, and exact case-sensitive field names. A leading UTF-8 BOM is ignored. Header names must be non-empty, unique, and declared fields. Column order is arbitrary; each data record must have the same number of fields as the header. Quoted fields may contain separators and line breaks; bare CR record separators are invalid.

Every non-optional field without a default must have a column. An omitted optional/defaulted column uses its default or nullable-null materialization from section 4. A blank unquoted cell represents `null` and is valid only for a nullable field. A quoted empty cell (`""`) represents the empty string and is valid only for a `String` field. `Number` cells use the JSON decimal number syntax and must be finite; `Boolean` accepts only lowercase `true` or `false`; `DateTime` uses the DateTime wire format; `String` preserves cell text. A malformed quote, row-width mismatch, failed conversion, or invalid/null-incompatible cell is a validation error. Data record numbers are one-based and start at the first record after the header.

## 11. Runtime Validation and Diagnostics

Validation checks input values, typed binding/assignment and function-return boundaries, and every record construction, including nested records and copied defaults. V0.3 defines type, shape, required-field, nullability, and wire-format validation only; it defines no domain-specific ranges, constraints, or cross-record checks. Imported/computed values that cross a declared type boundary must satisfy that type before evaluation continues. For a computed record, aggregate mode reports all independently invalid fields in that value in declaration order; fail-fast reports its first invalid field. Evaluation stops at an invalid computed value in either mode because no invalid value is bound or passed to later expressions. Computed-value checks are reached in V0.2 source/expression/loop iteration order.

Aggregate mode collects independent input failures and exits non-zero without evaluating modules or writing output. Fail-fast mode reports only the first input failure in the same deterministic order. Inputs are visited in input declaration order; JSON arrays in ascending zero-based index; CSV records in ascending one-based data-record number; record fields in declaration order; nested values depth-first. JSON object property order never changes diagnostic order. A malformed document that cannot be traversed produces one parse diagnostic for that input.

Every diagnostic has a stable code and message. Source-based diagnostics use one-based line and column coordinates in the original document, including front matter and fence lines, with UTF-16 columns as in V0.2. A diagnostic also carries the relevant file when known. Data diagnostics include logical input name, CLI data path, JSON Pointer or record/field path, array index or CSV data-record number, expected type/rule, actual type/value or parse failure, input declaration location, and field declaration location when applicable. Values in messages are bounded and escaped; a diagnostic never dumps an entire input file.

Diagnostic families are stable:

- `AMX3xxx`: static checking. `AMX3001` is unknown name/type/field; `AMX3002` is incompatible type; `AMX3003` is an invalid operator or expression; `AMX3004` is an invalid function call; `AMX3005` is a duplicate or invalid declaration.
- `AMX4xxx`: CLI input and data validation. `AMX4001` is a mapping/read failure; `AMX4002` is malformed JSON/CSV; `AMX4003` is a shape, required-field, nullability, or scalar-conversion failure.
- `AMX5xxx`: module resolution and linking. `AMX5001` is an invalid/unavailable module path; `AMX5002` is a missing export, duplicate, or name collision; `AMX5003` is an import cycle.
- `AMX6xxx`: output selection, serialization, or write. `AMX6001` is an invalid mapping/name/format or unsupported shape; `AMX6002` is a serialization or filesystem write failure.

Within a phase, diagnostics are ordered by depth-first module order, then source location (line, column), then code. Module traversal uses import source order. Independent static errors may be aggregated; invalid-name follow-on errors caused by the same unresolved declaration are suppressed. Parsing, module linking, and static checking are phase barriers: errors in a phase prevent later phases. Input mapping/read/validation failures prevent evaluation and output. Output mappings are checked before evaluation; all selected values are serialized before writes begin. Output writes occur in CLI option order. A filesystem failure may leave earlier output files written; V0.3 does not promise a multi-file transaction.

## 12. Named JSON and CSV Output

Repeated `--output name=path` options on `run` or `render` select explicit exported values from the entry module only:

```sh
openamx run analysis.amx --input assets=data/assets.csv --output rankedRisks=out/risks.json
openamx render analysis.amx --output rankedRisks=out/risks.csv
```

Only exported entry-module `let` values can be selected; types, functions, private values, imported values, missing names, duplicate names, and duplicate destination paths are errors. `--output` splits at the first `=` and requires non-empty name and path. The path is interpreted by the CLI relative to the process working directory. Exact lowercase `.json` and `.csv` extensions select the format. Output files are not written unless parsing, linking, checking, input validation, and evaluation succeed.

JSON supports finite scalars, `null`, records, and lists recursively. It is UTF-8, two-space indented, has one final LF, emits record fields in declaration order, and preserves validated DateTime wire strings. Number values use the ECMAScript JSON number representation. Non-finite numbers and values without a declared serializable type are rejected.

CSV supports only a list of one declared record type whose fields are scalar `String`, `Number`, `Boolean`, `DateTime`, or nullable scalar. It writes one header with all fields in declaration order and one row per record; nested records/lists, scalar exports, and indeterminate record types are rejected. Records are separated by LF and the file ends with one LF. Null is an unquoted empty cell; an empty string is quoted as `""`. A field is quoted when required by RFC 4180 or when quoting is needed to preserve leading/trailing spaces; quotes inside fields are doubled. Number cells use the ECMAScript JSON number representation, Boolean cells use lowercase `true` or `false`, and DateTime cells preserve their validated wire strings. Supported serialized values round-trip through the matching declared type.

When `render` uses `--out` together with `--output`, their resolved destination paths must be distinct. The renderer and every export are fully produced/serialized before any destination is written. The HTML destination is written first, followed by export destinations in CLI option order. A filesystem failure may leave earlier destinations written, as stated in section 11.

## 13. Initial Opt-in Asset Management Schemas

The core has no Asset Management types or defaults. The first opt-in library is specified at `./libraries/asset-management.amx` and exports these six initial structural schemas:

```amx
export type FailureMode {
  id: String
  name: String
  description?: String? = null
  severity: Number
  occurrence: Number
  detectability?: Number? = null
}

export type Risk {
  id: String
  failureMode: FailureMode
  likelihood: Number
  consequence: Number
  score?: Number? = null
}

export type Strategy {
  id: String
  name: String
  description?: String? = null
  targetRiskIds: String[] = []
}

export type Asset {
  id: String
  name: String
  assetClass: String
  criticality: Number
  failureModes: FailureMode[] = []
}

export type MaintenanceTask {
  id: String
  assetId: String
  strategyId?: String? = null
  title: String
  intervalDays: Number
  estimatedCost?: Number? = null
}

export type LifecycleCost {
  assetId: String
  acquisitionCost: Number
  operatingCost: Number
  maintenanceCost: Number
  disposalCost?: Number? = null
}
```

These fields are initial shape contracts only. They do not imply severity/likelihood scales, score formulas, identifier policies, required relationships beyond declared types, or other domain rules. The schemas are opt-in module exports, are not built-in types, and must receive domain review before being represented as stable Asset Management standards. Sprint 013 specifies the contract only; it does not create or package the library file.

## 14. Output and Rendering Compatibility

Without V0.3 declarations or options, V0.2 `run` and `render` outputs, default paths, execution order, formatter behavior, code display, interpolation, and HTML escaping remain unchanged. With V0.3 enabled, `render` still executes the document and renders narrative/code blocks by the V0.2 rules after successful validation; selected exports are an additional CLI side effect. Filesystem paths are handled only by the CLI and module loader, never by an expression, function, record, or input value.

## 15. Delivery Boundaries

Sprint 014 implements records and full static checking. Sprint 015 implements pure functions, modules, and the opt-in library. Sprint 016 implements inputs and runtime validation. Sprint 017 implements outputs. Sprint 018 implements editor support. Sprint 019 delivers examples and release acceptance. No later sprint may silently redefine this contract; a change requires a recorded decision, compatibility review, and updated acceptance coverage.
