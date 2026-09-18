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

export type DocumentNode = NarrativeNode | VariableDeclarationNode;

export interface OpenAmxDocument {
  metadata: Record<string, unknown>;
  nodes: DocumentNode[];
}

