import type { FunctionDeclarationNode, RecordFieldNode, TypeDeclarationNode } from '../ast/types';
import type { DimensionUnitRegistry } from './dimensionTypes';
type Declaration = TypeDeclarationNode | FunctionDeclarationNode | RecordFieldNode;
export declare function setDeclaringRegistry(declaration: Declaration, registry: DimensionUnitRegistry): void;
export declare function fieldRegistry(declaration: Declaration, fallback?: DimensionUnitRegistry): DimensionUnitRegistry | undefined;
export {};
//# sourceMappingURL=declarationRegistry.d.ts.map