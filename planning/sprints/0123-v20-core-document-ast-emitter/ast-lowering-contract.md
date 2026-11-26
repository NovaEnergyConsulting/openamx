# Sprint 123 AST Lowering Contract

## Status and Rules

S123 Builder reconciliation against current `src/ast/types.ts`: the accepted
S121 inventory still holds: 3 `DocumentNode`, 20 `StatementNode`, 14
`ExpressionNode` aliases within 21 `V02ExpressionNode`, 3 `TypeReferenceNode`,
2 function-body kinds, 6 visualization-option discriminants, and 3 recursive
diagram-content discriminants. `variableDeclaration` is shared by the document
and statement unions; `ExpressionNode` is a subset alias, not a second set of
lowering rows. Each unique discriminant has one row below; unknown future nodes
fail closed.

Use S122 helpers via `openamx/transpiler-runtime` whenever semantics differ
from TypeScript. `ctx(source)` below denotes a generated `AMXSourceContext`
with original source file/line/column. All names pass through the accepted
deterministic collision-checked name mapper.

## Document and Type Nodes

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| `NarrativeNode` | One inert `//` comment per normalized source line; retain raw source body and source order. | `G123-SOURCE-01` |
| `OpenAmxDocument.metadata` / frontmatter | Emit original frontmatter lines as inert comments before body nodes; parsed metadata may supply no original spelling. | `G123-FRONTMATTER-01` |
| `variableDeclaration` | Typed internal `const` or `let` according to checker-confirmed reassignment/mutation; explicit export captured for `run().exports`. | `G123-DECL-01` |
| `ExecutableCodeBlockNode` | Emit its statements at that document position into shared module run scope; no fence delimiters. | `G123-SOURCE-01` |
| `namedType` | Map primitives, checked records/enums, and dimension-branded `AMXMeasurement<DimensionId>` types. | `G123-TYPE-01` |
| `listType` | Typed AMX-compatible mutable array/list representation. | `G123-LIST-01` |
| `nullableType` | `T | null`, retaining nested list/nullable shape. | `G123-TYPE-01` |
| `typeDeclaration` | Named interface; extends checked parent interfaces; preserve optionality, nullability, inherited fields and defaults. | `G123-RECORD-01` |
| `enumDeclaration` | Readonly enum value object and corresponding primitive union from checker-resolved values. | `G123-ENUM-01` |
| `functionDeclaration` | Strict typed function; expression body returns one lowered expression; statement body lowers ordered scoped statements/returns. | `G123-FUNCTION-01` |
| `FunctionBodyNode: expression` | Emit a typed direct return expression. | `G123-FUNCTION-01` |
| `FunctionBodyNode: statements` | Emit ordered, scoped statements and checked returns. | `G123-FUNCTION-01` |
| `dimensionDeclaration` | Compile-time dimension metadata consumed by generated unit descriptors and measurement brands. | `G123-MEASURE-01` |
| `unitDeclaration` | Deterministic unit descriptor with checked identity, scale, offset, vector and factors. | `G123-MEASURE-01` |
| `inputDeclaration` | Add a required typed property to `AMXRunInputs` and recursive `AMXInputDescriptor`; validate before statements. | `G123-INPUT-01` |

## Modules, Statements, and Views

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| `importDeclaration` | Named ESM import from the supplied resolved `.ts` specifier; retain explicit visibility and never discover modules. | `G123-IMPORT-01` |
| `exportNamesDeclaration` | Preserve checker-approved dimension/unit re-exports; only explicit entry value exports enter `run().exports`. | `G123-EXPORT-01` |
| `assignmentStatement` | Mutate only checker-approved bindings; evaluate the right-hand expression once. | `G123-MUTATION-01` |
| `compoundAssignmentStatement` | Use `amxBinary` for AMX compound semantics and evaluate the right-hand expression once. | `G123-MUTATION-01` |
| `addStatement` | Use `amxAdd1Based` with target mutability, name, position and source context. | `G123-LIST-01` |
| `removeStatement` | Use `amxRemove1Based` with target mutability, name, count, position and source context. | `G123-LIST-01` |
| `forStatement` | Use `amxIterate` in source order with scoped iterator binding. | `G123-LOOP-01` |
| `bracedIfStatement` | Native `if` for checker-proven Boolean tests; preserve scoped branch bindings. | `G123-CONTROL-01` |
| `returnStatement` | Native return in accepted checked function or expression-loop context. | `G123-FUNCTION-01` |
| `tableDeclaration` | Capture the checked binding and ordered columns; append a detached snapshot only at `show`. | `G123-VIEW-TABLE-01` |
| `chartDeclaration` | Capture checked fields/series/options; normalize measurements at `show` and evaluate `showTable` in source order. | `G123-VIEW-CHART-01` |
| `diagramDeclaration` | Build and append a structured-v2 DTO at declaration execution time. | `G123-VIEW-DIAGRAM-01` |
| `diagramElement` | Emit a checked primitive-specific initial-frame builder in declaration order. | `G123-VIEW-DIAGRAM-01` |
| `diagramForBlock` | Expand ordered recursive membership using `amxIterate`; retain per-instance loop bindings. | `G123-VIEW-DIAGRAM-01` |
| `diagramIfBlock` | Evaluate the checked condition and expand only the selected branch in source order. | `G123-VIEW-DIAGRAM-01` |
| `showStatement` | Append a detached table/chart snapshot using S122 constructors; diagrams remain declaration-time only. | `G123-VIEW-SHOW-01` |
| `viewTitleOption` | Preserve the checked view title in the structured DTO. | `G123-VIEW-TABLE-01` |
| `viewDescriptionOption` | Preserve the checked description in the structured chart DTO. | `G123-VIEW-CHART-01` |
| `tableColumnOption` | Preserve ordered field/label pairs in the table DTO. | `G123-VIEW-TABLE-01` |
| `chartFieldOption` | Preserve checked chart field role, source order, labels and headings. | `G123-VIEW-CHART-01` |
| `chartSeriesOption` | Preserve ordered chart field/series labels and measurement normalization. | `G123-VIEW-CHART-01` |
| `chartShowTableOption` | Evaluate the checked Boolean at each `show` point. | `G123-VIEW-CHART-01` |

## Expressions

| AST form | Candidate TypeScript lowering | Fixture coverage |
| --- | --- | --- |
| `numberLiteral` | Canonical finite numeric literal. | `G123-LITERAL-01` |
| `stringLiteral` | Escaped TypeScript string literal from the checked value, not source-token spelling. | `G123-LITERAL-01` |
| `booleanLiteral` | Native `true`/`false` literal. | `G123-LITERAL-01` |
| `nullLiteral` | Native `null` literal with checked nullable typing. | `G123-LITERAL-01` |
| `identifier` | Internal mangled binding/helper/import reference; retain original names in diagnostics and public keys. | `G123-NAME-01` |
| `binaryExpression` | `amxBinary(operator, left, right, ctx)`; preserve left-to-right, exactly-once evaluation, including eager AMX logical operands. | `G123-OPERATOR-01` |
| `unaryExpression` | `amxUnary(operator, value, ctx)` with the checked result type. | `G123-OPERATOR-01` |
| `typeTestExpression` | `amxIsType(value, descriptor)` using the checked recursive descriptor. | `G123-TYPE-01` |
| `measurementAttachment` | `amxAttach(value, unitDescriptor)` with source context. | `G123-MEASURE-01` |
| `measurementConversion` | `amxConvert(value, unitDescriptor)` with source context and display-unit preservation. | `G123-MEASURE-01` |
| `stringInterpolation` | Concatenate literal pieces and `amxFormatValue(expr, ctx)` for each expression part. | `G123-STRING-01` |
| `conditionalExpression` | Lazy TypeScript conditional with checked Boolean condition and selected branch only. | `G123-CONTROL-01` |
| `bracedIfExpression` | Scoped typed expression function; evaluate the test once and only the selected branch. | `G123-CONTROL-01` |
| `matchExpression` | Capture the scrutinee once; ordered strict case comparisons and lazy arms, then default. | `G123-MATCH-01` |
| `rangeExpression` | `amxRange(start, end, ctx)`. | `G123-LIST-01` |
| `functionCall` | Mapped user-function call or `amxBuiltin(name, args, runtimeContext)`; evaluate arguments once in source order. | `G123-CALL-01` |
| `listLiteral` | Typed native array preserving AMX list value semantics. | `G123-LIST-01` |
| `forExpression` | Typed array accumulation using `amxIterate`, with scoped iterator/return binding. | `G123-LIST-01` |
| `recordConstructor` | Typed object construction with checker-resolved field order and defaults; preserve D122-15 no-parity. | `G123-RECORD-01` |
| `fieldAccess` | Checked property access or enum-member access through the mangled symbol. | `G123-RECORD-01` |
| `listAccess` | `amxGet1Based(list, index, ctx)`; never native zero-based access. | `G123-LIST-01` |

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