import { EnumDeclarationNode, FunctionDeclarationNode, OpenAmxDocument, TypeDeclarationNode } from '../ast/types';
import type { DimensionMetadata, UnitMetadata } from './dimensionTypes';
export type CheckedType = {
    kind: 'named';
    name: string;
} | {
    kind: 'measurement';
    vector: ReadonlyMap<string, number>;
} | {
    kind: 'list' | 'nullable';
    element: CheckedType;
} | {
    kind: 'null';
};
/** Symbols made visible to a module because they were explicitly imported (immutable). */
export interface ModuleCheckContext {
    types?: Map<string, TypeDeclarationNode>;
    enums?: Map<string, EnumDeclarationNode>;
    functions?: Map<string, FunctionDeclarationNode>;
    bindings?: Map<string, CheckedType>;
    dimensions?: Map<string, DimensionMetadata>;
    units?: Map<string, UnitMetadata>;
    baseUnits?: Map<string, UnitMetadata>;
    moduleIdentity?: string;
    isEntryModule?: boolean;
}
/** Symbols this module makes available to importers because they were declared with `export`. */
export interface ModuleCheckResult {
    exportedTypes: Map<string, TypeDeclarationNode>;
    exportedEnums: Map<string, EnumDeclarationNode>;
    exportedFunctions: Map<string, FunctionDeclarationNode>;
    exportedBindings: Map<string, CheckedType>;
    bindingTypes: Map<string, CheckedType>;
    exportedDimensions: Map<string, DimensionMetadata>;
    exportedUnits: Map<string, UnitMetadata>;
    dimensions: Map<string, DimensionMetadata>;
    units: Map<string, UnitMetadata>;
    baseUnits: Map<string, UnitMetadata>;
}
export declare function checkingActivated(_doc: OpenAmxDocument): boolean;
export declare function checkDocument(doc: OpenAmxDocument, file?: string, context?: ModuleCheckContext): ModuleCheckResult;
//# sourceMappingURL=checkDocument.d.ts.map