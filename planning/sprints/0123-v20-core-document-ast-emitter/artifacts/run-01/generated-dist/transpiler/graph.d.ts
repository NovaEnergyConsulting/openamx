import type { ImportDeclarationNode, OpenAmxDocument, StatementNode } from '../ast/types';
import { type ModuleCheckResult } from '../typechecker/checkDocument';
import type { TranspileSourceModule } from './types';
export interface PreparedModule {
    readonly input: TranspileSourceModule;
    readonly document: OpenAmxDocument;
    readonly statements: readonly StatementNode[];
    readonly imports: ReadonlyMap<string, PreparedModule>;
    readonly check: ModuleCheckResult;
    readonly importSpecifiers: ReadonlyMap<string, string>;
}
export interface PreparedGraph {
    readonly entry: PreparedModule;
    readonly dependencyOrder: readonly PreparedModule[];
}
export declare function prepareGraph(entryModuleId: string, modules: readonly TranspileSourceModule[]): PreparedGraph;
export declare function sourceDiagnostic(error: unknown, fallbackFile?: string): {
    column?: number | undefined;
    line?: number | undefined;
    code: string;
    message: string;
    file: string | undefined;
} | {
    file?: string | undefined;
    message: string;
};
export declare function importsOf(module: PreparedModule): readonly ImportDeclarationNode[];
//# sourceMappingURL=graph.d.ts.map