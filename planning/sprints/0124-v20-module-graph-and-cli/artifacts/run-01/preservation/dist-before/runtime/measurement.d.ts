import type { UnitMetadata, DimensionUnitRegistry } from '../typechecker/dimensionTypes';
export interface MeasurementUnitFactor {
    identity: string;
    name: string;
    exponent: number;
}
export interface MeasurementUnit {
    readonly scale: number;
    readonly offset: number;
    readonly vector: Readonly<Record<string, number>>;
    readonly factors: readonly MeasurementUnitFactor[];
    readonly text: string;
}
export interface MeasurementValue {
    readonly __amxMeasurement: true;
    readonly value: number;
    readonly unit: MeasurementUnit;
}
export declare function isMeasurement(value: unknown): value is MeasurementValue;
export declare function unitFromMetadata(unit: UnitMetadata): MeasurementUnit;
export declare function physicalValue(value: number, unit: Readonly<{
    scale: number;
    offset: number;
}>): number;
export declare function displayValue(physical: number, unit: Readonly<{
    scale: number;
    offset: number;
}>): number;
export declare function measurementPhysicalValue(value: MeasurementValue): number;
export declare function measurementDisplayValue(physical: number, unit: MeasurementUnit): number;
export declare function isAffineUnit(unit: MeasurementUnit): boolean;
export declare function composeUnits(left: MeasurementUnit, right: MeasurementUnit, divide?: boolean): MeasurementUnit;
export declare function powerUnit(unit: MeasurementUnit, exponent: number): MeasurementUnit;
export declare function measurement(value: number, unit: MeasurementUnit): MeasurementValue;
export declare function canonicalUnit(vector: ReadonlyMap<string, number>, registry: DimensionUnitRegistry): MeasurementUnit;
export declare function sqrtMeasurement(value: MeasurementValue, registry: DimensionUnitRegistry): MeasurementValue;
//# sourceMappingURL=measurement.d.ts.map