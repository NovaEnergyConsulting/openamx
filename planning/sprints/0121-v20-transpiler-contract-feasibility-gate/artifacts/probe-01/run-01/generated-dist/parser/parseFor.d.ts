import { ForExpressionNode, ForStatementNode, SourceLocation } from '../ast/types';
export declare function parseForStatement(text: string, source?: SourceLocation, context?: {
    allowFunctionReturn?: boolean;
    inFunctionBody?: boolean;
}): ForStatementNode;
export declare function parseForExpression(text: string, source?: SourceLocation): ForExpressionNode;
//# sourceMappingURL=parseFor.d.ts.map