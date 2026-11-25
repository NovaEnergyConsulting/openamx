# Sprint 121 AST-to-TypeScript Mapping

## Status and Rules

Architect-prepared mapping proposal. Rows are contract candidates until S121
disposition. The inventory is based on the current unions in
`src/ast/types.ts`; re-audit them at the authorized S121 baseline. Every new
AST discriminant requires a mapping and fixture before the emitter may accept
it. Unknown nodes fail closed with source-oriented diagnostics.

Notation: **TS** means native TypeScript is behaviorally equivalent;
**helper** means generated code calls the accepted public runtime helper;
**gate** means the owning S121 decision must resolve the contract before
implementation. All expression lowering uses checked types, bindings, module
identity, and source order from the validated module graph.

## Union Inventory at This Source Baseline

| Union | Current leaf members | Mapping coverage |
| --- | ---: | --- |
| `DocumentNode` | 3 | `NarrativeNode`, `VariableDeclarationNode`, `ExecutableCodeBlockNode` |
| `StatementNode` | 20 | All 20 statement forms below |
| `ExpressionNode` | 14 | Shared expression forms below; this alias excludes null, match, range, and for expressions |
| `V02ExpressionNode` | 21 | The 14 `ExpressionNode` forms plus `MatchExpressionNode`, `RangeExpressionNode`, `ForExpressionNode`, `NullLiteralNode`, `RecordConstructorNode`, `FieldAccessNode`, and `ListAccessNode` |
| `TypeReferenceNode` | 3 | `namedType`, `listType`, and `nullableType` |
| `FunctionBodyNode` | 2 | `expression` and `statements` |
| `VisualizationOptionNode` | 6 | All six option node forms below |
| `DiagramContentNode` | 3 | `DiagramElementNode`, `DiagramForBlockNode`, and `DiagramIfBlockNode` |

`ExpressionNode` is an alias subset of `V02ExpressionNode`, not a second set
of lowering rules. `MatchCaseNode.value` uses the already-mapped number,
string, and Boolean literal forms. The counts are to be rechecked against
`src/ast/types.ts` at the authorized execution baseline; a changed count is a
mapping discrepancy, not an accepted extension.

## Document and Type Nodes

| AST form | Candidate lowering | Required contract / fixture |
| --- | --- | --- |
| `NarrativeNode` | One inert TypeScript line comment per source line; never executable output. | Newline normalization, blank-line and comment-prefix encoding; `GOLD-COMMENT-01` |
| `OpenAmxDocument.metadata` / raw frontmatter | Candidate: carry original source text in a per-module source envelope and emit the raw frontmatter prefix as inert comments before body nodes. Parsed metadata is not a source-fidelity substitute. | D121-13 owner disposition and fixture `GOLD-FRONTMATTER-01`; no source-fidelity claim from metadata alone. |
| `VariableDeclarationNode` | Typed `const` for immutable `let`; only use `let` where AMX mutation/reassignment semantics require it. Preserve `exported`. | Initialization order and binding mutability; `GOLD-AST-BINDING-01` |
| `ExecutableCodeBlockNode` | Lower all contained statements in document order; retain block/source identity only for diagnostics, not runtime behavior. | Cross-fence shared environment and order; `GOLD-AST-DOC-01` |
| `TypeReferenceNode: namedType` | `Number -> number`, `String -> string`, `Boolean -> boolean`, `DateTime -> string`; records/enums resolve to generated declarations; dimensions resolve to branded `AMXMeasurement<DimensionId>`. | DateTime keeps the runtime's RFC 3339 string representation; dimension identity and type-name collisions; `GOLD-AST-TYPE-01` |
| `TypeReferenceNode: listType` | Mutable AMX list type with element type; generated public signatures may be readonly only where no mutation can escape. | Runtime helper/list representation; `GOLD-AST-LIST-01` |
| `TypeReferenceNode: nullableType` | `T | null`; preserve nested nullable/list structure. | Null assignability and generated input checks; `GOLD-AST-TYPE-01` |
| `TypeDeclarationNode` | Generated record interface; preserve parent interfaces and optional fields. Use resolved declared fields without duplicating inherited members. | Inheritance, override/default, structural compatibility; `GOLD-AST-TYPE-01` |
| `RecordFieldNode` | Typed property; `optional` maps to optional property, nullable annotation remains explicit `| null`; default is an initialization rule, not a type erasure. | Field default evaluation order and optional-vs-null distinction; `GOLD-AST-TYPE-01` |
| `TypeParentNode` | Parent type in the interface `extends` list, after checker validation. | Multiple-parent conflicts and emitted inherited member shape; `GOLD-AST-TYPE-01` |
| `EnumDeclarationNode` | `const` value object plus a value-union type; preserve resolved string/number member values and explicit export. | Runtime enum representation and duplicate values; `GOLD-AST-TYPE-01` |
| `EnumMemberNode` | Readonly property with checked resolved value; never reevaluate a source expression at import time if checker resolved it. | Source order and value parity; `GOLD-AST-TYPE-01` |
| `FunctionDeclarationNode` | Typed function preserving parameter/return types, visibility, and expression/statement body. | Scope, return-path behavior, recursion, and AMX evaluation order; `GOLD-AST-FUNCTION-01` |
| `FunctionParameterNode` | Typed parameter; source name escaped only by deterministic identifier mapping. | Reserved-word/name collision mapping; `GOLD-AST-NAME-01` |
| `FunctionBodyNode: expression` | Return the lowered expression directly. | Exact result and helper propagation; `GOLD-AST-FUNCTION-01` |
| `FunctionBodyNode: statements` | Lower ordered statements in a scoped body and preserve checked return paths. | Fallthrough and mutation scope; `GOLD-AST-FUNCTION-01` |
| `DimensionDeclarationNode` | Compile-time metadata consumed by measurement helper/type generation; no independently mutable runtime global. | Stable dimension identity across modules; `GOLD-AST-UNIT-01` |
| `UnitDeclarationNode` | Compile-time scale/offset/vector metadata registered through a generated helper constant when referenced. | Affine values, aliases/imports, and registration identity; `GOLD-AST-UNIT-01` |
| `InputDeclarationNode` | Required property in entry `AMXRunInputs`; emit runtime validation even when caller compiles against the type. | Entry-only rule and supported value validation; `GOLD-INPUT-01` |

## Modules, Statements, and Views

| AST form | Candidate lowering | Required contract / fixture |
| --- | --- | --- |
| `ImportDeclarationNode` | Named TS import from the corresponding relative `.ts` output module; retain only explicitly imported names. | Graph path, export visibility, and ESM compatibility; `GOLD-MODULE-01` |
| `ImportedNameNode` | Preserve the imported/exported name and source identity; apply deterministic local name mapping only when required. | Explicit visibility and collision handling; `GOLD-MODULE-01` |
| `ExportNamesDeclarationNode` | Explicit TS named exports of previously declared AMX names. | Exported value/type/function distinction; `GOLD-MODULE-01` |
| `AssignmentStatementNode` | Assignment to the lowered mutable binding with RHS evaluated once. | Typechecker-established mutability and evaluation order; `GOLD-AST-BINDING-01` |
| `CompoundAssignmentStatementNode` | Helper-backed mutation or equivalent assignment; do not emit `+=` when AMX list/measurement semantics differ. | Numeric/list/measurement distinctions; `GOLD-AST-BINDING-01` |
| `AddStatementNode` | Helper for insertion/append and AMX index convention; preserve expression evaluation order. | 1-based insertion and invalid-index diagnostics; `GOLD-AST-LIST-01` |
| `RemoveStatementNode` | Helper for removal/count/index under AMX list rules. | 1-based range/count behavior; `GOLD-AST-LIST-01` |
| `ForStatementNode` | Scoped loop over `amxIter(iterable)`; retain iteration order and binding isolation. | Ranges, lists, and control semantics; `GOLD-AST-LIST-01` |
| `BracedIfStatementNode` | Native `if` with checked Boolean test and scoped branches. | Evaluation once, branch scope, optional alternate; `GOLD-AST-EXPR-01` |
| `ReturnStatementNode` | Native return of the lowered expression. | Checker-approved reachability/result; `GOLD-AST-FUNCTION-01` |
| `TableDeclarationNode` | Build renderer-independent table declaration/data through helper; do not render markup. | Field/column order, labels, nulls; `GOLD-AST-TABLE-01` |
| `ChartDeclarationNode` | Build structured chart view data through helper; evaluate `showTable` at AMX snapshot timing and preserve the resolved value without renderer-generated table payload. | Chart kind, data, units, and showTable; `GOLD-AST-CHART-01` |
| `DiagramDeclarationNode` | Build structured scene/timeline data through helper and append a distinct declaration-time diagram DTO to `run().views`, retaining recursive content, bindings, and deterministic order. This does not add `show` semantics. | D121-15; diagram controls and serialization-safe DTO; `GOLD-AST-DIAGRAM-01` |
| `DiagramElementNode` | Typed primitive descriptor passed to the diagram builder. | Supported primitive/property validation; `GOLD-AST-DIAGRAM-01` |
| `DiagramForBlockNode` | Helper-backed ordered expansion with scoped iterator binding. | Same expansion/frame semantics as AMX runtime; `GOLD-AST-DIAGRAM-01` |
| `DiagramIfBlockNode` | Evaluate condition once and preserve selected branch/order. | Alternate/empty branch semantics; `GOLD-AST-DIAGRAM-01` |
| `DiagramPropertyNode` | Typed property value in stable declaration order. | Value type and source diagnostics; `GOLD-AST-DIAGRAM-01` |
| `DiagramTimeNode` | Typed timeline descriptor with unit-aware bounds/duration. | Measurement values and exact frame semantics; `GOLD-AST-DIAGRAM-01` |
| `ShowStatementNode` | Capture a referenced table/chart as a structured snapshot appended to `views` in source/evaluation order. Checker showability continues to exclude diagrams. | Repeated show and intervening mutation behavior; `GOLD-VIEW-01`; D121-15 |
| `VisualizationOptionNode` | Type-specific field/series/title/description helper data; reject invalid option-kind combinations before emission. | Stable option order and checked fields; `GOLD-AST-TABLE-01` and `GOLD-AST-CHART-01` |
| `ViewTitleOptionNode` | Store the literal title in the corresponding structured view declaration. | Default title and source order; `GOLD-AST-TABLE-01` and `GOLD-AST-CHART-01` |
| `ViewDescriptionOptionNode` | Store the literal description in the corresponding structured view declaration. | Default description and source order; `GOLD-AST-TABLE-01` and `GOLD-AST-CHART-01` |
| `TableColumnOptionNode` | Retain ordered field/label pairs in the table DTO. | Unknown field and row/null behavior; `GOLD-AST-TABLE-01` |
| `ChartFieldOptionNode` | Retain checked role/field mapping in chart DTO. | Role validation, selected field and source order; `GOLD-AST-CHART-01` |
| `ChartSeriesOptionNode` | Retain ordered field/label series mapping in chart DTO. | Default and explicit series behavior; `GOLD-AST-CHART-01` |
| `ChartShowTableOptionNode` | Lower expression once in normal environment; store Boolean on chart data, not a renderer-only branch. | False/true structured output and snapshot timing; `GOLD-AST-CHART-01` |

## Expression Nodes

| AST form | Candidate lowering | Required contract / fixture |
| --- | --- | --- |
| `NumberLiteralNode` | Numeric literal. | JavaScript Number semantics; `GOLD-AST-LITERAL-01` |
| `StringLiteralNode` | Escaped TypeScript string literal. | Preserve source value, not token spelling; `GOLD-AST-LITERAL-01` |
| `StringInterpolationNode` | Concatenate literal parts with helper-based AMX value formatting for expression parts. | Measurement/DateTime/list/record formatting; `GOLD-AST-LITERAL-01` |
| `BooleanLiteralNode` | `true` or `false`. | Exact value; `GOLD-AST-LITERAL-01` |
| `NullLiteralNode` | `null`. | Nullable checking; `GOLD-AST-LITERAL-01` |
| `IdentifierNode` | Resolved local/imported/generated builtin reference after deterministic, collision-checked internal name mangling. | Shadowing, reserved names, module visibility; `GOLD-AST-NAME-01` |
| `BinaryExpressionNode` | Native operator only when AMX semantics match; otherwise typed helper operation. `^` is not emitted as JavaScript XOR. | Short circuit, measurements, equality, numeric errors; `GOLD-AST-EXPR-01` and `GOLD-AST-UNIT-01` |
| `TypeTestExpressionNode` | Helper-backed AMX type test. | Records, enums, nullable/list and measurement kinds; `GOLD-AST-EXPR-01` |
| `MeasurementAttachmentNode` | `amxAttach(value, generatedUnit)` after checked numeric/unit validation. | Affine metadata and finite behavior; `GOLD-AST-UNIT-01` |
| `MeasurementConversionNode` | `amxConvert(value, generatedUnit)` preserving requested display unit. | Canonical conversion and diagnostics; `GOLD-AST-UNIT-01` |
| `UnaryExpressionNode` | Native `!` for Boolean `not`; helper for measurement negation or other domain behavior. | Display unit and evaluation order; `GOLD-AST-EXPR-01` and `GOLD-AST-UNIT-01` |
| `ConditionalExpressionNode` | Lazy native conditional expression. | Only selected branch evaluates; `GOLD-AST-EXPR-01` |
| `BracedIfExpressionNode` | Typed scoped expression lowering (for example a generated local function) that returns the selected branch result. | Branch returns, nested statements, and laziness; `GOLD-AST-EXPR-01` |
| `MatchExpressionNode` | Ordered dispatch over the checked scrutinee; evaluate only the first matching expression or default. | Equality semantics and source order; `GOLD-AST-EXPR-01` |
| `MatchCaseNode` | Case predicate and result; constants use their checked literal value. | Duplicate/typed matching; `GOLD-AST-EXPR-01` |
| `RangeExpressionNode` | `amxRange(start, end)`; do not rely on a nonexistent native range. | Inclusive/exclusive bound and iteration order; `GOLD-AST-LIST-01` |
| `FunctionCallNode` | User function call or an explicit builtin helper dispatch selected by checked symbol. | Builtin coverage, argument order, and return types; `GOLD-AST-FUNCTION-01` |
| `ListLiteralNode` | AMX list construction helper or array representation preserving AMX mutation/index semantics. | Nested lists, identity/copy behavior; `GOLD-AST-LIST-01` |
| `ForExpressionNode` | Scoped helper-backed iteration/accumulation with AMX ordering. | Result type, scope, and nested evaluation; `GOLD-AST-LIST-01` |
| `RecordConstructorNode` | Typed object construction with checked defaults and inherited field behavior. | Field order/defaults/optional fields; `GOLD-AST-RECORD-01` |
| `FieldAccessNode` | Typed property access, with helper only if runtime type/nullable semantics require it. | Unknown/missing/nullable field behavior; `GOLD-AST-RECORD-01` |
| `ListAccessNode` | `amxGet1Based(list, index)`; never native zero-based bracket access. | Bounds/index evaluation and exact error; `GOLD-AST-LIST-01` |

## Cross-Cutting Lowering Invariants

- `and`/`or`, conditional expressions, match cases, and braced-if expressions
  retain AMX evaluation order and do not eagerly evaluate unused branches.
- Measurement comparison/arithmetic, list indexing/mutation, builtins, and
  AMX value formatting share public helper implementations; emitted code must
  not duplicate semantics in separate operator templates.
- Identifier mangling is deterministic, collision-checked, and reversible in
  diagnostics. Generated public API names remain stable and readable; AMX
  declarations named `run` or `AMXRunInputs` do not collide with the wrapper
  or generated types.
- Only checker-accepted syntax is emitted. A checker-approved construct with
  no mapping is a contract blocker, not a runtime fallback.
- `result.views` merges table/chart `show` snapshots with declaration-time
  diagram emissions as distinct DTO kinds, ordered by module and
  source/evaluation order. Rendered ECharts options, HTML, PDF, DOCX, and
  renderer accessibility markup are not part of the generated runtime
  contract.

## Source-Observed Constraints and Owner Decisions

  validator checks RFC 3339 text. Do not invent a runtime `AMXDateTime` object.
  declaration creates a separate runtime emission immediately. Accepted
  D121-15 places that emission in `result.views` under a distinct discriminant
  without adding `show` behavior.
  not pass enum declarations to the value converter. D121-16 requires a
  separately authorized runtime prerequisite before AMX/generated parity is
  claimed; no product behavior changes in S121.
- At baseline, ordinary type resolution rejected enum names, and input loading
  did not pass enum declarations to the value converter. Amended D121-16 adds
  enum names to named type resolution and validates resolved member values in
  JSON/CSV inputs; implementation and focused tests are recorded in S121
  Builder evidence.

## Reconciliation Checklist

At S121 execution, mechanically compare all discriminants in the current AST
unions against these tables. Record inventory count, missing/duplicate rows,
new baseline nodes, fixture IDs, and disposition. The expected count is
determined by the audited baseline, not frozen by this draft.