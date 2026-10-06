import type { SourceLocation } from '../ast/types';

export interface DimensionMetadata {
  name: string;
  moduleIdentity: string;
  declarationName: string;
  baseIdentity?: string;
  vector: ReadonlyMap<string, number>;
  source?: SourceLocation;
}

export interface UnitMetadata {
  name: string;
  moduleIdentity: string;
  declarationName: string;
  identity: string;
  vector: ReadonlyMap<string, number>;
  scale: number;
  source?: SourceLocation;
}

export interface DimensionUnitRegistry {
  dimensions: ReadonlyMap<string, DimensionMetadata>;
  units: ReadonlyMap<string, UnitMetadata>;
}
