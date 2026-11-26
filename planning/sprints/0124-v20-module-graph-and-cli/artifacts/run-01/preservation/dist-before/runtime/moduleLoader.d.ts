import { OpenAmxDocument } from '../ast/types';
import { Environment } from './environment';
import { type AmxDiagnostic } from '../diagnostics/errors';
import { type InputSchema, type InputTextFormat, ValidationMode } from './inputData';
import { type OutputSchema, PreparedOutput } from './outputData';
import type { DiagramEmission, ViewEmission } from './environment';
import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
export interface LoadedEntryModule {
    doc: OpenAmxDocument;
    env: Environment;
    outputs: PreparedOutput[];
    viewEmissions: readonly ViewEmission[];
    diagramEmissions: readonly DiagramEmission[];
    inputInspection?: EntryInputInspection;
    outputSchemas?: OutputSchema[];
    registry: DimensionUnitRegistry;
}
export interface EntryInputInspection {
    schema: InputSchema;
    valid: boolean;
    diagnostics: AmxDiagnostic[];
    outputs: OutputSchema[];
}
export interface ModuleLoadOptions {
    entryText?: string;
    importRoot?: string;
    sourceOverlay?: ReadonlyMap<string, string>;
    inputMappings?: string[];
    validation?: ValidationMode;
    inputInspection?: {
        name: string;
        format: InputTextFormat;
        text: string;
    };
    outputInspection?: boolean;
    outputMappings?: string[];
    reservedOutputPath?: string;
}
/**
 * Resolve, check, and evaluate the complete module graph reachable from `entryPath`,
 * returning the entry module's document and final evaluated environment.
 */
export declare function loadEntryModule(entryPath: string, options?: ModuleLoadOptions): Promise<LoadedEntryModule>;
//# sourceMappingURL=moduleLoader.d.ts.map