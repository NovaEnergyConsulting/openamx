import type { FunctionDeclarationNode, TypeDeclarationNode } from '../ast/types';
import type { DimensionUnitRegistry } from './dimensionTypes';

// Record field and function annotations, plus function bodies, resolve dimensions and
// units in the declaring module so imported declarations keep their meaning elsewhere.
type Declaration = TypeDeclarationNode | FunctionDeclarationNode;
const declaringRegistries = new WeakMap<Declaration, DimensionUnitRegistry>();

export function setDeclaringRegistry(declaration: Declaration, registry: DimensionUnitRegistry): void {
  declaringRegistries.set(declaration, registry);
}

export function fieldRegistry(declaration: Declaration, fallback?: DimensionUnitRegistry): DimensionUnitRegistry | undefined {
  return declaringRegistries.get(declaration) ?? fallback;
}
