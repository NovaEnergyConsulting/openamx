import { InputDeclarationNode, TypeDeclarationNode } from '../ast/types';
import { AmxDiagnostic } from '../diagnostics/errors';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
export { parseStrictCsvText, parseStrictJsonText } from './dataText';
export { serializeCsvText } from './csvTextSerialization';
export type { CsvTextCell, DataTextParseIssue, DataTextParseResult } from './dataText';
export type ValidationMode = 'aggregate' | 'fail-fast';
export type InputTextFormat = 'json' | 'csv';
export interface InputTextValidationResult {
    value?: unknown;
    diagnostics: AmxDiagnostic[];
}
export interface InputSchemaField {
    name: string;
    type: string;
    optional: boolean;
    hasDefault: boolean;
    measurement?: {
        dimension: string;
        visibleUnits: string[];
    };
}
export interface InputSchema {
    name: string;
    type: string;
    acceptedFormats: InputTextFormat[];
    fields?: InputSchemaField[];
    measurement?: {
        dimension: string;
        visibleUnits: string[];
    };
}
export declare function describeInputSchema(declaration: InputDeclarationNode, types: Map<string, TypeDeclarationNode>, registry?: DimensionUnitRegistry): InputSchema;
export declare function validateInputText(text: string, format: InputTextFormat, declaration: InputDeclarationNode, types: Map<string, TypeDeclarationNode>, mode?: ValidationMode, context?: Pick<AmxDiagnostic, 'file' | 'dataFile'>, registry?: DimensionUnitRegistry): InputTextValidationResult;
export declare function loadInputValues(declarations: InputDeclarationNode[], types: Map<string, TypeDeclarationNode>, rawMappings?: string[], mode?: ValidationMode, entryFile?: string, registry?: DimensionUnitRegistry): Promise<Map<string, unknown>>;
//# sourceMappingURL=inputData.d.ts.map