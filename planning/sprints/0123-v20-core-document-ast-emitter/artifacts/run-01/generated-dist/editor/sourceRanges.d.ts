import type { SourceLocation, StatementNode } from "../ast/types";
export interface EditorRange {
    from: number;
    to: number;
}
export declare function sourceOffset(text: string, source: SourceLocation | undefined): number | undefined;
export declare function sourceTokenRange(text: string, source: SourceLocation | undefined, token: string): EditorRange | undefined;
export declare function declarationNameRange(text: string, statement: StatementNode): EditorRange | undefined;
//# sourceMappingURL=sourceRanges.d.ts.map