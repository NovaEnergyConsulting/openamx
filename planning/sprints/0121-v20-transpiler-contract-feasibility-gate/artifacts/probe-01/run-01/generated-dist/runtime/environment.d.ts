import { ChartDeclarationNode, EnumDeclarationNode, FunctionDeclarationNode, SourceLocation, TableDeclarationNode, TypeDeclarationNode } from '../ast/types';
import type { CheckedType } from '../typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
import type { DiagramSceneModel } from './diagramModel';
export type ViewDataValue = string | number | boolean | null | readonly ViewDataValue[] | {
    readonly [field: string]: ViewDataValue;
};
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
    readonly showTable: boolean;
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
    readonly factors: readonly Readonly<{
        identity: string;
        name: string;
        exponent: number;
    }>[];
}
export type ViewEmission = TableViewEmission | ChartViewEmission;
export interface DiagramEmission {
    readonly model: DiagramSceneModel;
}
/**
 * Runtime environment for variable storage during evaluation.
 * Variables are stored in declaration order (source order).
 * get() throws AMX1004 for undefined identifiers.
 */
export declare class Environment {
    private store;
    readonly recordTypes: Map<string, TypeDeclarationNode>;
    readonly enumDeclarations: Map<string, EnumDeclarationNode>;
    readonly enumValues: Map<string, Record<string, string | number>>;
    readonly functions: Map<string, FunctionDeclarationNode>;
    readonly bindingTypes: Map<string, CheckedType>;
    dimensionRegistry?: DimensionUnitRegistry;
    readonly viewDefinitions: Map<string, TableDeclarationNode | ChartDeclarationNode>;
    readonly viewEmissions: ViewEmission[];
    readonly diagramEmissions: DiagramEmission[];
    private immutableValues;
    currentDocumentNodeIndex: number;
    currentStatementIndex: number;
    validationMode: 'aggregate' | 'fail-fast';
    constructor(recordTypes?: Map<string, TypeDeclarationNode>, functions?: Map<string, FunctionDeclarationNode>, dimensionRegistry?: DimensionUnitRegistry);
    /**
     * Create an isolated call frame sharing this module's record types and functions
     * but containing only the supplied parameter bindings. Used to evaluate pure
     * function bodies without exposing document/module state.
     */
    createCallFrame(parameters: Record<string, unknown>): Environment;
    /**
     * Set or overwrite a variable value.
     */
    set(name: string, value: unknown): void;
    markImmutable(value: unknown): void;
    isImmutable(value: unknown): boolean;
    update(name: string, value: unknown, source?: SourceLocation, file?: string): void;
    delete(name: string): void;
    /**
     * Get a variable value. Throws AMX1004 if not defined.
     */
    get(name: string, source?: SourceLocation, file?: string): unknown;
    /**
     * Check existence (used internally by evaluator for forward-ref detection).
     */
    has(name: string): boolean;
    /**
     * Return a plain object snapshot of current bindings (for evaluateDocument result).
     */
    toObject(): Record<string, unknown>;
    /**
     * Clear all bindings (useful for tests).
     */
    clear(): void;
}
export {};
//# sourceMappingURL=environment.d.ts.map