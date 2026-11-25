import { V02ExpressionNode, StatementNode } from '../ast/types';
import { Environment } from './environment';
/** Evaluate V0.2 expressions, including ranges and expression-form loops. */
export declare function evaluateExpression(node: V02ExpressionNode, env: Environment, file?: string): unknown;
export declare function toBoolean(v: unknown): boolean;
export declare function evaluateStatements(statements: StatementNode[], env: Environment, file?: string): void;
export declare function evaluateLoopIterable(node: V02ExpressionNode, env: Environment, file?: string): unknown[];
export declare function withLoopBinding(name: string, values: unknown[], env: Environment, runIteration: () => void): void;
//# sourceMappingURL=evaluateExpression.d.ts.map