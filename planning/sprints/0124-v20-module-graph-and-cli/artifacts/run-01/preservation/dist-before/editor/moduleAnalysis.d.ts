import type { EnumDeclarationNode, FunctionDeclarationNode, ImportDeclarationNode, OpenAmxDocument, TypeDeclarationNode } from "../ast/types";
import { type CheckedType, type ModuleCheckResult } from "../typechecker/checkDocument";
import type { DimensionMetadata, UnitMetadata } from "../typechecker/dimensionTypes";
export interface EditorIssue {
    file?: string;
    line?: number;
    column?: number;
    code?: string;
    message: string;
}
export interface EditorModuleRecord {
    file: string;
    document: OpenAmxDocument;
    checkResult: ModuleCheckResult;
    importedTypes: Map<string, TypeDeclarationNode>;
    importedEnums: Map<string, EnumDeclarationNode>;
    importedFunctions: Map<string, FunctionDeclarationNode>;
    importedBindings: Map<string, CheckedType>;
    importedDimensions: Map<string, DimensionMetadata>;
    importedUnits: Map<string, UnitMetadata>;
    importTargets: Map<string, string>;
}
export interface EditorModuleAnalysis {
    document: OpenAmxDocument;
    importedTypes: Map<string, TypeDeclarationNode>;
    importedEnums: Map<string, EnumDeclarationNode>;
    importedFunctions: Map<string, FunctionDeclarationNode>;
    importedBindings: Map<string, CheckedType>;
    importedDimensions: Map<string, DimensionMetadata>;
    importedUnits: Map<string, UnitMetadata>;
    bindingTypes?: Map<string, CheckedType>;
    modules?: Map<string, EditorModuleRecord>;
}
export interface ResolvedEditorModule {
    file: string;
    text: string;
}
export type EditorModuleResolver = (fromFile: string, targetPath: string, importNode: ImportDeclarationNode) => ResolvedEditorModule;
/** Parse and statically check a bounded reachable module graph without evaluating AMX or loading data. */
export declare function analyzeEditorModules(text: string, entryFile?: string, resolveModule?: EditorModuleResolver, importRoot?: string): EditorModuleAnalysis;
//# sourceMappingURL=moduleAnalysis.d.ts.map