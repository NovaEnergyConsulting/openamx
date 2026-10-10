/** Explicit OpenAMX AST types with original-document source locations. */

export interface SourceLocation {
  line: number;
  column: number;
}

// --- Literals ---
export interface NumberLiteralNode {
  type: 'numberLiteral';
  value: number;
  source?: SourceLocation;
}

export interface StringLiteralNode {
  type: 'stringLiteral';
  value: string;
  source?: SourceLocation;
}

export interface StringInterpolationNode {
  type: 'stringInterpolation';
  parts: Array<string | V02ExpressionNode>;
  source?: SourceLocation;
}

export interface BooleanLiteralNode {
  type: 'booleanLiteral';
  value: boolean;
  source?: SourceLocation;
}

export interface NullLiteralNode {
  type: 'nullLiteral';
  source?: SourceLocation;
}

export interface TypeReferenceNode {
  type: 'namedType' | 'listType' | 'nullableType';
  name?: string;
  element?: TypeReferenceNode;
  source?: SourceLocation;
}

export interface RecordFieldNode {
  name: string;
  optional: boolean;
  annotation: TypeReferenceNode;
  override?: boolean;
  overrideSource?: SourceLocation;
  defaultExpression?: V02ExpressionNode;
  source?: SourceLocation;
}

export interface TypeParentNode {
  name: string;
  source?: SourceLocation;
}

export interface TypeDeclarationNode {
  type: 'typeDeclaration';
  name: string;
  nameSource?: SourceLocation;
  fields: RecordFieldNode[];
  parents?: TypeParentNode[];
  declaredFields?: RecordFieldNode[];
  exported?: boolean;
  source?: SourceLocation;
}

export interface FunctionParameterNode {
  name: string;
  annotation: TypeReferenceNode;
  source?: SourceLocation;
}

export interface FunctionDeclarationNode {
  type: 'functionDeclaration';
  name: string;
  parameters: FunctionParameterNode[];
  returnType: TypeReferenceNode;
  body: V02ExpressionNode;
  exported?: boolean;
  source?: SourceLocation;
}

export interface ImportedNameNode {
  name: string;
  source?: SourceLocation;
}

export interface ImportDeclarationNode {
  type: 'importDeclaration';
  names: ImportedNameNode[];
  path: string;
  pathSource?: SourceLocation;
  source?: SourceLocation;
}

export interface ExportNamesDeclarationNode {
  type: 'exportNamesDeclaration';
  names: ImportedNameNode[];
  source?: SourceLocation;
}

export interface DimensionDeclarationNode {
  type: 'dimensionDeclaration';
  name: string;
  nameSource?: SourceLocation;
  expression?: V02ExpressionNode;
  exported?: boolean;
  source?: SourceLocation;
}

export interface UnitDeclarationNode {
  type: 'unitDeclaration';
  name: string;
  nameSource?: SourceLocation;
  dimension?: string;
  dimensionSource?: SourceLocation;
  expression?: V02ExpressionNode;
  exported?: boolean;
  source?: SourceLocation;
}

export interface InputDeclarationNode {
  type: 'inputDeclaration';
  name: string;
  annotation: TypeReferenceNode;
  source?: SourceLocation;
}

export interface ViewTitleOptionNode {
  type: 'viewTitleOption';
  value: string;
  source?: SourceLocation;
}

export interface ViewDescriptionOptionNode {
  type: 'viewDescriptionOption';
  value: string;
  source?: SourceLocation;
}

export interface TableColumnOptionNode {
  type: 'tableColumnOption';
  field: string;
  label: string;
  fieldSource?: SourceLocation;
  source?: SourceLocation;
}

export interface ChartFieldOptionNode {
  type: 'chartFieldOption';
  role: 'category' | 'x' | 'y' | 'group' | 'labels';
  field: string;
  fieldSource?: SourceLocation;
  source?: SourceLocation;
}

export interface ChartSeriesOptionNode {
  type: 'chartSeriesOption';
  field?: string;
  label: string;
  fieldSource?: SourceLocation;
  source?: SourceLocation;
}

export type VisualizationOptionNode = ViewTitleOptionNode | ViewDescriptionOptionNode
  | TableColumnOptionNode | ChartFieldOptionNode | ChartSeriesOptionNode;

export interface TableDeclarationNode {
  type: 'tableDeclaration';
  name: string;
  binding: string;
  bindingSource?: SourceLocation;
  options: VisualizationOptionNode[];
  exported?: boolean;
  source?: SourceLocation;
}

export interface ChartDeclarationNode {
  type: 'chartDeclaration';
  name: string;
  kind: 'bar' | 'column' | 'line' | 'scatter';
  binding: string;
  bindingSource?: SourceLocation;
  options: VisualizationOptionNode[];
  exported?: boolean;
  source?: SourceLocation;
}

export interface ShowStatementNode {
  type: 'showStatement';
  name: string;
  nameSource?: SourceLocation;
  source?: SourceLocation;
}

export interface RecordConstructorNode {
  type: 'recordConstructor';
  name: string;
  fields: { name: string; expression: V02ExpressionNode; source?: SourceLocation }[];
  source?: SourceLocation;
}

export interface FieldAccessNode {
  type: 'fieldAccess';
  receiver: V02ExpressionNode;
  field: string;
  source?: SourceLocation;
}

export interface ListAccessNode {
  type: 'listAccess';
  receiver: V02ExpressionNode;
  index: V02ExpressionNode;
  source?: SourceLocation;
}

// --- Identifier ---
export interface IdentifierNode {
  type: 'identifier';
  name: string;
  source?: SourceLocation;
}

// --- Expressions ---
export interface BinaryExpressionNode {
  type: 'binaryExpression';
  operator: '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '>' | '>=' | '<' | '<=' | 'and' | 'or';
  left: V02ExpressionNode;
  right: V02ExpressionNode;
  operatorSource?: SourceLocation;
  source?: SourceLocation;
}

export interface MeasurementAttachmentNode {
  type: 'measurementAttachment';
  value: V02ExpressionNode;
  unit: string;
  unitSource?: SourceLocation;
  source?: SourceLocation;
}

export interface MeasurementConversionNode {
  type: 'measurementConversion';
  value: V02ExpressionNode;
  unit: string;
  unitSource?: SourceLocation;
  source?: SourceLocation;
}

export interface UnaryExpressionNode {
  type: 'unaryExpression';
  operator: '-' | 'not';
  argument: V02ExpressionNode;
  source?: SourceLocation;
}

export interface ConditionalExpressionNode {
  type: 'conditionalExpression';
  test: V02ExpressionNode;
  consequent: V02ExpressionNode;
  alternate: V02ExpressionNode;
  source?: SourceLocation;
}

export interface MatchCaseNode {
  value: NumberLiteralNode | StringLiteralNode | BooleanLiteralNode;
  expression: V02ExpressionNode;
  source?: SourceLocation;
}

export interface MatchExpressionNode {
  type: 'matchExpression';
  expression: V02ExpressionNode;
  cases: MatchCaseNode[];
  defaultExpression: V02ExpressionNode;
  defaultSource?: SourceLocation;
  source?: SourceLocation;
}

export interface RangeExpressionNode {
  type: 'rangeExpression';
  start: V02ExpressionNode;
  end: V02ExpressionNode;
  source?: SourceLocation;
}

export interface FunctionCallNode {
  type: 'functionCall';
  callee: string;
  arguments: V02ExpressionNode[];
  source?: SourceLocation;
}

export interface ListLiteralNode {
  type: 'listLiteral';
  elements: V02ExpressionNode[];
  source?: SourceLocation;
}

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | StringInterpolationNode
  | BooleanLiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | MeasurementAttachmentNode
  | MeasurementConversionNode
  | UnaryExpressionNode
  | ConditionalExpressionNode
  | FunctionCallNode
  | ListLiteralNode;

export interface ForExpressionNode {
  type: 'forExpression';
  variable: string;
  iterable: V02ExpressionNode;
  body: StatementNode[];
  source?: SourceLocation;
}

export type V02ExpressionNode = ExpressionNode | MatchExpressionNode | RangeExpressionNode | ForExpressionNode
  | NullLiteralNode | RecordConstructorNode | FieldAccessNode | ListAccessNode;

// --- Document structure ---
export interface NarrativeNode {
  type: 'narrative';
  content: string;
  source?: SourceLocation;
}

export interface VariableDeclarationNode {
  type: 'variableDeclaration';
  name: string;
  expression: V02ExpressionNode;
  annotation?: TypeReferenceNode;
  exported?: boolean;
  source?: SourceLocation;
}

export interface AssignmentStatementNode {
  type: 'assignmentStatement';
  name: string;
  expression: V02ExpressionNode;
  source?: SourceLocation;
}

export interface CompoundAssignmentStatementNode {
  type: 'compoundAssignmentStatement';
  name: string;
  operator: '+=';
  expression: V02ExpressionNode;
  source?: SourceLocation;
}

export interface AddStatementNode {
  type: 'addStatement';
  name: string;
  targetSource?: SourceLocation;
  value: V02ExpressionNode;
  index?: V02ExpressionNode;
  source?: SourceLocation;
}

export interface RemoveStatementNode {
  type: 'removeStatement';
  name: string;
  targetSource?: SourceLocation;
  count: V02ExpressionNode;
  index?: V02ExpressionNode;
  source?: SourceLocation;
}

export interface ForStatementNode {
  type: 'forStatement';
  variable: string;
  iterable: V02ExpressionNode;
  body: StatementNode[];
  source?: SourceLocation;
}

export interface ReturnStatementNode {
  type: 'returnStatement';
  expression: V02ExpressionNode;
  source?: SourceLocation;
}

export type StatementNode =
  | TypeDeclarationNode
  | FunctionDeclarationNode
  | ImportDeclarationNode
  | ExportNamesDeclarationNode
  | DimensionDeclarationNode
  | UnitDeclarationNode
  | InputDeclarationNode
  | TableDeclarationNode
  | ChartDeclarationNode
  | ShowStatementNode
  | VariableDeclarationNode
  | AssignmentStatementNode
  | CompoundAssignmentStatementNode
  | AddStatementNode
  | RemoveStatementNode
  | ForStatementNode
  | ReturnStatementNode;

export interface ExecutableCodeBlockNode {
  type: 'executableCodeBlock';
  content: string;
  statements: StatementNode[];
  source?: SourceLocation;
}

export type DocumentNode = NarrativeNode | VariableDeclarationNode | ExecutableCodeBlockNode;

export interface OpenAmxDocument {
  metadata: Record<string, unknown>;
  nodes: DocumentNode[];
}
