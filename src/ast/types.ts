/**
 * Explicit AST types for OpenAMX v0.1 per language-spec-v0.1.md section 6.
 * SourceLocation is present on all nodes from the start (per planning decisions).
 *
 * This sprint (002) defines the complete shape. Construction of complex
 * expression trees is deferred; only atomic literals and identifiers (or
 * minimal placeholders) are produced by the statement splitter.
 */

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

export interface BooleanLiteralNode {
  type: 'booleanLiteral';
  value: boolean;
  source?: SourceLocation;
}

// --- Identifier (also used as placeholder for unparsed RHS in Sprint 002) ---
export interface IdentifierNode {
  type: 'identifier';
  name: string;
  source?: SourceLocation;
}

// --- Expressions (full variants defined for type completeness; only atoms constructed in Sprint 002) ---
export interface BinaryExpressionNode {
  type: 'binaryExpression';
  operator: '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '>' | '>=' | '<' | '<=' | 'and' | 'or';
  left: ExpressionNode;
  right: ExpressionNode;
  source?: SourceLocation;
}

export interface UnaryExpressionNode {
  type: 'unaryExpression';
  operator: '-' | 'not';
  argument: ExpressionNode;
  source?: SourceLocation;
}

export interface ConditionalExpressionNode {
  type: 'conditionalExpression';
  test: ExpressionNode;
  consequent: ExpressionNode;
  alternate: ExpressionNode;
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
  arguments: ExpressionNode[];
  source?: SourceLocation;
}

export interface ListLiteralNode {
  type: 'listLiteral';
  elements: ExpressionNode[];
  source?: SourceLocation;
}

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | ConditionalExpressionNode
  | FunctionCallNode
  | ListLiteralNode;

export type V02ExpressionNode = ExpressionNode | MatchExpressionNode | RangeExpressionNode;

// --- Document structure ---
export interface NarrativeNode {
  type: 'narrative';
  content: string;
  source?: SourceLocation;
}

export interface VariableDeclarationNode {
  type: 'variableDeclaration';
  name: string;
  expression: ExpressionNode;
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

export interface ForStatementNode {
  type: 'forStatement';
  variable: string;
  iterable: V02ExpressionNode;
  body: StatementNode[];
  source?: SourceLocation;
}

export interface ReturnStatementNode {
  type: 'returnStatement';
  expression?: V02ExpressionNode;
  source?: SourceLocation;
}

export type StatementNode =
  | VariableDeclarationNode
  | AssignmentStatementNode
  | CompoundAssignmentStatementNode
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

