import { BracedIfExpressionNode, BracedIfStatementNode, SourceLocation } from '../ast/types';
export interface IfBlocks {
    condition: string;
    consequent: string;
    alternate?: string;
    consequentSource: SourceLocation;
    alternateSource?: SourceLocation;
    consequentOpenSource: SourceLocation;
    consequentClosingSource: SourceLocation;
    alternateOpenSource?: SourceLocation;
    alternateClosingSource?: SourceLocation;
    elseSource?: SourceLocation;
    endOffset: number;
}
export declare function parseBracedIfExpression(text: string, source?: SourceLocation): BracedIfExpressionNode;
export declare function parseBracedIfStatement(text: string, source?: SourceLocation, context?: {
    allowReturn?: boolean;
    allowFunctionReturn?: boolean;
    inFunctionBody?: boolean;
    allowFor?: boolean;
}): {
    statement: BracedIfStatementNode;
    lineCount: number;
};
export declare function findBracedIfExpressionEnd(text: string, start: number): number | undefined;
export declare function readIfBlocks(text: string, source?: SourceLocation): IfBlocks;
//# sourceMappingURL=parseIf.d.ts.map