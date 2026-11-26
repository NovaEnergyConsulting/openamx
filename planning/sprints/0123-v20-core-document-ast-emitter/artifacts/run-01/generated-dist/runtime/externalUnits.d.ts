import type { DimensionUnitRegistry } from '../typechecker/dimensionTypes';
import { type MeasurementUnit } from './measurement';
export declare class ExternalUnitTextError extends Error {
    readonly unknownUnit: boolean;
    constructor(message: string, unknownUnit: boolean);
}
export declare function parseExternalUnitText(text: string, registry: DimensionUnitRegistry): MeasurementUnit;
//# sourceMappingURL=externalUnits.d.ts.map