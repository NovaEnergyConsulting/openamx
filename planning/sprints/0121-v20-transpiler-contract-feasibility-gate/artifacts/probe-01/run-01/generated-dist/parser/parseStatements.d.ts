import { SourceLocation, StatementNode, TypeReferenceNode } from '../ast/types';
interface ParseContext {
    allowReturn?: boolean;
    allowFunctionReturn?: boolean;
    inFunctionBody?: boolean;
    allowFor?: boolean;
}
/** Parse executable AMX statements while preserving original-document locations. */
export declare function parseStatements(body: string, start?: SourceLocation, context?: ParseContext): StatementNode[];
export declare function parseTypeReference(text: string, source?: SourceLocation): TypeReferenceNode;
export {};
//# sourceMappingURL=parseStatements.d.ts.map