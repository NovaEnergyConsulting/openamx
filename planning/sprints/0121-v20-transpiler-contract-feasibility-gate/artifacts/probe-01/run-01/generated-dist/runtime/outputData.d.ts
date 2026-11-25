import { TypeDeclarationNode } from '../ast/types';
import { Environment } from './environment';
import type { CheckedType } from '../typechecker/checkDocument';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
export interface PreparedOutput {
    name: string;
    path: string;
    format: 'json' | 'csv';
    type: CheckedType;
}
export interface SerializedOutput {
    path: string;
    contents: string;
}
export interface OutputSchema {
    name: string;
    type: string;
    formats: Array<'json' | 'csv'>;
    measurements?: Array<{
        path: string;
        dimension: string;
        visibleUnits: string[];
    }>;
}
export declare function describeOutputSchemas(exportedBindings: Map<string, CheckedType>, recordTypes: Map<string, TypeDeclarationNode>, registry?: DimensionUnitRegistry): OutputSchema[];
export declare function prepareOutputs(mappings: string[] | undefined, exportedBindings: Map<string, CheckedType>, recordTypes: Map<string, TypeDeclarationNode>, reservedDestination?: string, registry?: DimensionUnitRegistry): PreparedOutput[];
export declare function serializeOutputs(outputs: PreparedOutput[], env: Environment): SerializedOutput[];
export declare function writeOutputs(outputs: SerializedOutput[]): Promise<void>;
//# sourceMappingURL=outputData.d.ts.map