import type { FunctionDeclarationNode, TypeDeclarationNode } from '../ast/types';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
type Declaration = TypeDeclarationNode | FunctionDeclarationNode;
export declare function setDeclaringRegistry(declaration: Declaration, registry: DimensionUnitRegistry): void;
export declare function fieldRegistry(declaration: Declaration, fallback?: DimensionUnitRegistry): DimensionUnitRegistry | undefined;
export {};
//# sourceMappingURL=declarationRegistry.d.ts.map