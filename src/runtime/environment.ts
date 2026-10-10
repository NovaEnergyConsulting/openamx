import { throwUndefinedIdentifier } from '../diagnostics/errors';
import { ChartDeclarationNode, EnumDeclarationNode, FunctionDeclarationNode, SourceLocation, TableDeclarationNode, TypeDeclarationNode } from '../ast/types';
import type { CheckedType } from '../typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';

export type ViewDataValue = string | number | boolean | null | readonly ViewDataValue[]
  | { readonly [field: string]: ViewDataValue };

interface ViewEmissionLocation {
  name: string;
  data: readonly ViewDataValue[];
  documentNodeIndex: number;
  statementIndex: number;
  source?: SourceLocation;
}

export interface TableViewEmission extends ViewEmissionLocation {
  kind: 'table';
  declaration: TableDeclarationNode;
}

export interface ChartViewEmission extends ViewEmissionLocation {
  kind: 'chart';
  declaration: ChartDeclarationNode;
  labels?: readonly string[];
  headings?: readonly string[];
  measurementDescriptors?: readonly ChartMeasurementDescriptor[];
}

export interface ChartMeasurementDescriptor {
  readonly role: 'series' | 'x' | 'y';
  readonly field?: string;
  readonly label: string;
  readonly unit: ChartMeasurementUnitDescriptor;
}

export interface ChartMeasurementUnitDescriptor {
  readonly text: string;
  readonly scale: number;
  readonly vector: Readonly<Record<string, number>>;
  readonly factors: readonly Readonly<{ identity: string; name: string; exponent: number }>[];
}

export type ViewEmission = TableViewEmission | ChartViewEmission;

/**
 * Runtime environment for variable storage during evaluation.
 * Variables are stored in declaration order (source order).
 * get() throws AMX1004 for undefined identifiers.
 */
export class Environment {
  private store: Map<string, unknown> = new Map();
  readonly recordTypes: Map<string, TypeDeclarationNode>;
  readonly enumDeclarations = new Map<string, EnumDeclarationNode>();
  readonly enumValues = new Map<string, Record<string, string | number>>();
  readonly functions: Map<string, FunctionDeclarationNode>;
  readonly bindingTypes = new Map<string, CheckedType>();
  dimensionRegistry?: DimensionUnitRegistry;
  readonly viewDefinitions = new Map<string, TableDeclarationNode | ChartDeclarationNode>();
  readonly viewEmissions: ViewEmission[] = [];
  private immutableValues = new WeakSet<object>();
  currentDocumentNodeIndex = -1;
  currentStatementIndex = -1;
  validationMode: 'aggregate' | 'fail-fast' = 'aggregate';

  constructor(recordTypes: Map<string, TypeDeclarationNode> = new Map(), functions: Map<string, FunctionDeclarationNode> = new Map(), dimensionRegistry?: DimensionUnitRegistry) {
    this.recordTypes = recordTypes;
    this.functions = functions;
    this.dimensionRegistry = dimensionRegistry;
  }

  /**
   * Create an isolated call frame sharing this module's record types and functions
   * but containing only the supplied parameter bindings. Used to evaluate pure
   * function bodies without exposing document/module state.
   */
  createCallFrame(parameters: Record<string, unknown>): Environment {
    const frame = new Environment(this.recordTypes, this.functions, this.dimensionRegistry);
    frame.validationMode = this.validationMode;
    for (const [name, type] of this.bindingTypes) frame.bindingTypes.set(name, type);
    for (const [name, value] of Object.entries(parameters)) {
      frame.set(name, value);
      if (this.isImmutable(value)) frame.markImmutable(value);
    }
    return frame;
  }

  /**
   * Set or overwrite a variable value.
   */
  set(name: string, value: unknown): void {
    this.store.set(name, value);
  }

  markImmutable(value: unknown): void {
    const visit = (item: unknown): void => {
      if (!item || typeof item !== 'object' || this.immutableValues.has(item)) return;
      this.immutableValues.add(item);
      if (Array.isArray(item)) item.forEach(visit);
      else Object.values(item).forEach(visit);
    };
    visit(value);
  }

  isImmutable(value: unknown): boolean {
    return !!value && typeof value === 'object' && this.immutableValues.has(value);
  }

  update(name: string, value: unknown, source?: SourceLocation, file?: string): void {
    if (!this.store.has(name)) {
      throwUndefinedIdentifier(name, source, file);
    }
    this.store.set(name, value);
  }

  delete(name: string): void {
    this.store.delete(name);
  }

  /**
   * Get a variable value. Throws AMX1004 if not defined.
   */
  get(name: string, source?: SourceLocation, file?: string): unknown {
    if (!this.store.has(name)) {
      throwUndefinedIdentifier(name, source, file);
    }
    return this.store.get(name);
  }

  /**
   * Check existence (used internally by evaluator for forward-ref detection).
   */
  has(name: string): boolean {
    return this.store.has(name);
  }

  /**
   * Return a plain object snapshot of current bindings (for evaluateDocument result).
   */
  toObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.store.entries()) {
      obj[k] = v;
    }
    return obj;
  }

  /**
   * Clear all bindings (useful for tests).
   */
  clear(): void {
    this.store.clear();
    this.immutableValues = new WeakSet<object>();
    this.viewDefinitions.clear();
    this.viewEmissions.length = 0;
  }
}
