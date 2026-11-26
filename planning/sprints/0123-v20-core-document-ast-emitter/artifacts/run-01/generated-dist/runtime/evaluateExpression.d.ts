import { BinaryExpressionNode, UnaryExpressionNode, V02ExpressionNode, StatementNode, SourceLocation } from '../ast/types';
import { Environment } from './environment';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
/** Evaluate V0.2 expressions, including ranges and expression-form loops. */
export declare function evaluateExpression(node: V02ExpressionNode, env: Environment, file?: string): unknown;
export declare function evaluateBinaryValues(operator: BinaryExpressionNode['operator'], leftValue: unknown, rightValue: unknown, source?: SourceLocation, file?: string): unknown;
export declare function evaluateUnaryValue(operator: UnaryExpressionNode['operator'], value: unknown, source?: SourceLocation, file?: string): unknown;
export declare function evaluateBuiltinValues(callee: string, values: readonly unknown[], source?: SourceLocation, file?: string, dimensionRegistry?: DimensionUnitRegistry): unknown;
export declare function evaluateListItem(listValue: unknown, indexValue: unknown, source?: SourceLocation, file?: string): unknown;
export declare function evaluateRangeValues(startValue: unknown, endValue: unknown, source?: SourceLocation, file?: string): number[];
export declare function evaluateListAddition(list: unknown, value: unknown, position: unknown, mutable: boolean, targetName: string, source?: SourceLocation, file?: string): void;
export declare function evaluateListRemoval(list: unknown, count: unknown, position: unknown, mutable: boolean, targetName: string, source?: SourceLocation, file?: string): void;
export declare function evaluateIterableValue(value: unknown, source?: SourceLocation, file?: string): unknown[];
export declare function toBoolean(v: unknown): boolean;
export declare function evaluateStatements(statements: StatementNode[], env: Environment, file?: string): void;
export declare function evaluateLoopIterable(node: V02ExpressionNode, env: Environment, file?: string): unknown[];
export declare function withLoopBinding(name: string, values: unknown[], env: Environment, runIteration: () => void): void;
//# sourceMappingURL=evaluateExpression.d.ts.map