import { type MeasurementUnitFactor, type MeasurementValue } from './runtime/measurement';
export type AMXPrimitive = string | number | boolean | null;
export type AMXViewData = AMXPrimitive | readonly AMXViewData[] | Readonly<{
    [field: string]: AMXViewData;
}>;
export interface AMXUnitDescriptor {
    readonly identity: string;
    readonly name: string;
    readonly scale: number;
    readonly offset: number;
    readonly vector: Readonly<Record<string, number>>;
    readonly factors?: readonly MeasurementUnitFactor[];
}
export interface AMXMeasurement extends MeasurementValue {
}
export declare class AMXInputError extends TypeError {
    readonly inputPath: string;
    readonly expected: string;
    readonly actual: string;
    readonly code = "AMX4003";
    constructor(inputPath: string, expected: string, actual: string);
}
export declare function requireAMXNumber(value: unknown, inputPath: string): number;
export declare function requireAMXString(value: unknown, inputPath: string): string;
export declare function requireAMXBoolean(value: unknown, inputPath: string): boolean;
export declare function requireAMXEnum(value: unknown, enumName: string, members: readonly (string | number)[], inputPath: string): string | number;
export declare function requireAMXMeasurement(value: unknown, dimensionName: string, dimensionVector: Readonly<Record<string, number>>, units: Readonly<Record<string, AMXUnitDescriptor>>, inputPath: string): AMXMeasurement;
export declare function requireAMXList(value: unknown, inputPath: string): readonly unknown[];
export declare function requireAMXRecord(value: unknown, inputPath: string, allowedFields: readonly string[]): Readonly<Record<string, unknown>>;
export declare function amxAttach(value: number, unit: AMXUnitDescriptor): AMXMeasurement;
export declare function amxConvert(value: AMXMeasurement, target: AMXUnitDescriptor): AMXMeasurement;
export declare function amxPhysicalValue(value: AMXMeasurement): number;
export declare function amxEqual(left: AMXMeasurement, right: AMXMeasurement): boolean;
export interface AMXTableColumn {
    readonly field: string;
    readonly label: string;
}
export interface AMXTableView {
    readonly kind: 'table';
    readonly name: string;
    readonly columns: readonly AMXTableColumn[];
    readonly rows: readonly (readonly AMXViewData[])[];
}
export interface AMXChartView {
    readonly kind: 'chart';
    readonly name: string;
    readonly chartKind: 'bar' | 'column' | 'line' | 'scatter';
    readonly title: string;
    readonly description: string;
    readonly data: readonly AMXViewData[];
    readonly showTable: boolean;
}
export interface AMXDiagramElement {
    readonly type: string;
    readonly name: string;
    readonly properties: Readonly<Record<string, AMXViewData>>;
}
export interface AMXDiagramView {
    readonly kind: 'diagram';
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly canvas: Readonly<{
        width: number;
        height: number;
        coordinates: 'bottom-left-y-up';
    }>;
    readonly timeline: Readonly<{
        variable: string;
        from: number;
        to: number;
        duration: number;
    }>;
    readonly initialFrame: Readonly<{
        time: number;
        elements: readonly AMXDiagramElement[];
    }>;
}
export type AMXShownView = AMXTableView | AMXChartView | AMXDiagramView;
export declare function amxTableView(name: string, columns: readonly AMXTableColumn[], rows: readonly (readonly AMXViewData[])[]): AMXTableView;
export declare function amxChartView(view: Omit<AMXChartView, 'kind'>): AMXChartView;
export declare function amxDiagramView(view: Omit<AMXDiagramView, 'kind'>): AMXDiagramView;
//# sourceMappingURL=transpilerRuntime.d.ts.map