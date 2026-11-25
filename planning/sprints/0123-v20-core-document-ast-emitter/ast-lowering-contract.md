# Sprint 123 AST Lowering Contract

## Status and Rules

Architect-prepared node-to-TypeScript contract. Baseline inventory is the
accepted S121 audit: 3 `DocumentNode`, 20 `StatementNode`, 14 `ExpressionNode`,
21 `V02ExpressionNode`, 3 `TypeReferenceNode`, 2 function body, 6 visualization
option, and 3 recursive diagram-content variants. Reconcile against current
`src/ast/types.ts` before implementation. Each AST discriminant has one
lowering rule and at least one golden case; unknown future nodes fail closed.

Use S122 helpers via `openamx/transpiler-runtime` whenever semantics differ
from TypeScript. `ctx(source)` below denotes a generated `AMXSourceContext`
with original source file/line/column. All names pass through the accepted
deterministic collision-checked name mapper.

## Document and Type Nodes

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| `NarrativeNode` | One inert `//` comment per normalized source line; retain raw source body and source order. | `G123-SOURCE-01` |
| `OpenAmxDocument.metadata` / frontmatter | Emit original frontmatter lines as inert comments before body nodes; parsed metadata may supply no original spelling. | `G123-FRONTMATTER-01` |
| `VariableDeclarationNode` | Typed internal `const` or `let` according to checker-confirmed reassignment/mutation; explicit export captured for `run().exports`. | `G123-DECL-01` |
| `ExecutableCodeBlockNode` | Emit its statements at that document position into shared module run scope; no fence delimiters. | `G123-SOURCE-01` |
| `TypeReferenceNode: namedType` | `Number -> number`, `String -> string`, `Boolean -> boolean`, `DateTime -> string`; records/enums -> generated type; dimensions -> `AMXMeasurement<DimensionId>`. | `G123-TYPE-01` |
| `TypeReferenceNode: listType` | Typed AMX-compatible mutable array/list representation. | `G123-LIST-01` |
| `TypeReferenceNode: nullableType` | `T | null`, retaining nested list/nullable shape. | `G123-TYPE-01` |
| `TypeDeclarationNode` / `RecordFieldNode` / `TypeParentNode` | Named interface, extends checked parent interfaces, field optionality/nullability and defaults preserved. Default factories use S122 input descriptors; no enum-default AMX parity claim under D122-15. | `G123-RECORD-01` |
| `EnumDeclarationNode` / `EnumMemberNode` | Readonly enum value object and corresponding primitive union from checker-resolved values. | `G123-ENUM-01` |
| `FunctionDeclarationNode` / `FunctionParameterNode` | Strict typed function; expression body returns one lowered expression; statement body lowers ordered scoped statements/returns. | `G123-FUNCTION-01` |
| `DimensionDeclarationNode` / `UnitDeclarationNode` | Emit deterministic compile-time unit descriptors with stable dimension identity, scale/offset/vector/factors for helpers. | `G123-MEASURE-01` |
| `InputDeclarationNode` | Add required property to `AMXRunInputs` and corresponding recursive `AMXInputDescriptor`; validate before statements. | `G123-INPUT-01` |

## Modules, Statements, and Views

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| `ImportDeclarationNode` / `ImportedNameNode` | Named ESM import with the supplied resolved `.ts` specifier; retain explicit visibility. Do not load or recurse. | `G123-IMPORT-01` |
| `ExportNamesDeclarationNode` | Emit module named exports required by AMX importers; only explicit entry value exports enter `run().exports`. | `G123-EXPORT-01` |
| `AssignmentStatementNode` / `CompoundAssignmentStatementNode` | Mutate only checker-approved bindings; use `amxBinary` for AMX arithmetic/compound semantics and evaluate RHS once. | `G123-MUTATION-01` |
| `AddStatementNode` / `RemoveStatementNode` | `amxAdd1Based` / `amxRemove1Based` with target mutability, name, position/count, and source context. | `G123-LIST-01` |
| `ForStatementNode` | `amxIterate` in source order, scoped iterator binding restored after loop. | `G123-LOOP-01` |
| `BracedIfStatementNode` | Native `if` only with checker-proven Boolean conversion equivalence; otherwise helper predicate. Preserve scoped branch bindings. | `G123-CONTROL-01` |
| `ReturnStatementNode` | Native return only in accepted checked function/expression-loop context. | `G123-FUNCTION-01` |
| `TableDeclarationNode` | Capture typed table source data/columns in generated state; do not append until `show`. | `G123-VIEW-TABLE-01` |
| `ChartDeclarationNode` | Capture chart data/fields/series/options and `showTable`; preserve evaluator measurement normalization. | `G123-VIEW-CHART-01` |
| `DiagramDeclarationNode` | Build structured-v2 declaration-time diagram DTO and append at declaration execution point. | `G123-VIEW-DIAGRAM-01` |
| `DiagramElementNode` / `DiagramPropertyNode` / `DiagramTimeNode` | Emit primitive-specific data, checked property values, timeline/canvas, source order; use structured-v2 schema. | `G123-VIEW-DIAGRAM-01` |
| `DiagramForBlockNode` / `DiagramIfBlockNode` | Expand ordered recursive membership with `amxIterate` and accepted AMX condition semantics; preserve per-instance values in initial frame. | `G123-VIEW-DIAGRAM-01` |
| `ShowStatementNode` | Append a detached/frozen table or chart DTO using S122 constructors at the show point; never make diagrams showable. | `G123-VIEW-SHOW-01` |
| `ViewTitleOptionNode` / `ViewDescriptionOptionNode` / `TableColumnOptionNode` | Preserve accepted title/description defaults and ordered field/label pairs in DTO data. | `G123-VIEW-TABLE-01` |
| `ChartFieldOptionNode` / `ChartSeriesOptionNode` / `ChartShowTableOptionNode` | Preserve kind/field/label/source order, normalized data, labels/headings/descriptors, and evaluated Boolean `showTable`. | `G123-VIEW-CHART-01` |

## Expressions

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| Number/String/Boolean/Null literals | Canonical escaped literal; no source-token text injection. | `G123-EXPR-01` |
| `IdentifierNode` | Internal mangled binding/helper/import reference. Preserve original names in diagnostics and public keys. | `G123-NAME-01` |
| `BinaryExpressionNode` | `amxBinary(operator, left, right, ctx)` unless a proven exact native primitive form; preserve left then right evaluation exactly once. | `G123-OPERATOR-01` |
| `UnaryExpressionNode` | `amxUnary(operator, value, ctx)` unless proven exact. | `G123-OPERATOR-01` |
| `TypeTestExpressionNode` | `amxIsType(value, descriptor)` with checked descriptor. | `G123-TYPE-01` |
| `MeasurementAttachmentNode` / `MeasurementConversionNode` | `amxAttach(value, unit)` / `amxConvert(value, unit)` using emitted descriptors and context. | `G123-MEASURE-01` |
| `StringInterpolationNode` | Concatenate literal pieces and `amxFormatValue(expr, ctx)` for each expression piece. | `G123-STRING-01` |
| `ConditionalExpressionNode` | Lazy TypeScript conditional expression if Boolean condition semantics are exact; otherwise a helper predicate and lazy branch thunk. | `G123-CONTROL-01` |
| `BracedIfExpressionNode` | Scoped expression function/IIFE or equivalent typed structure; evaluate test once and only selected branch. | `G123-CONTROL-01` |
| `MatchExpressionNode` / `MatchCaseNode` | Capture scrutinee once; ordered exact case tests and lazy expression branches, then default. | `G123-MATCH-01` |
| `RangeExpressionNode` | `amxRange(start, end, ctx)`. | `G123-LIST-01` |
| `FunctionCallNode` | User function call by mapped symbol or `amxBuiltin(name, args, runtimeContext)`; caller arguments evaluated once in order. | `G123-CALL-01` |
| `ListLiteralNode` / `ForExpressionNode` | Typed arrays and helper-backed iteration; preserve list alias/copy semantics. | `G123-LIST-01` |
| `RecordConstructorNode` / `FieldAccessNode` | Typed object literal with checked defaults/field order and native safe access where semantics match. | `G123-RECORD-01` |
| `ListAccessNode` | `amxGet1Based(list, index, ctx)`; no native zero-based indexing. | `G123-LIST-01` |

## Source Safety and Diagnostics

- Narrative/comment text is never interpolated or copied into executable
  string literals. Each source line becomes one `//` comment using S121
  normalized ECMAScript line separators (CRLF, CR, LF, U+2028, U+2029).
- Emit original raw frontmatter comment lines before remaining body nodes;
  preserve blank lines and literal Markdown/fences. Avoid block comments and
  generated code injection from prose.
- Map AMX source locations through normalized generated lines. At minimum,
  diagnostics retain original module path plus AMX 1-based line/column. If
  source maps are out of scope, do not claim generated-TypeScript line remap.
- On any unsupported AST discriminant, missing semantic context, or invalid
  helper mapping, fail closed with a source-oriented diagnostic. Never emit
  an omitted statement or silent `any` fallback.
- Every lowering row must be reconciled to `golden-fixtures.md` and
  `parity-matrix.md`; these tables are not substitutes for the S121 AST
  baseline re-audit.